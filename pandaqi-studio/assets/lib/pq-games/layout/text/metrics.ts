import { Dims } from "../../geometry/dims"
import { Vector2 } from "../../geometry/vector2"
import { createContext } from "../canvas/creators"
import { ResourceText } from "../resources/resourceText"
import { LineData } from "./lineData"
import { parseTextMeasured } from "./parser"
import { TextChunk, TextChunkBreak } from "./textChunk"
import { TextAlign, TextConfig } from "./textConfig"
import { hasVisibleText } from "./tools"

export interface TextBoxMetrics
{
    dimsFull: Dims, // the full dimensions of the text box (including empty space if centered within, for example)
    dimsUsed: Dims, // a box around the actual visible text and nothing else
    textParsed: TextChunk[],
    lines: LineData[],
}

// When a single axis of the box is unknown, the text decides it: no wrapping on X, no vertical
// alignment on Y. Without this, an auto-sized box had to be measured as 2048x2048 and the text was
// then aligned/centred inside that fake box, i.e. drawn far outside its own canvas.
export interface TextAutoSize
{
    width?: boolean,
    height?: boolean,
}

// Shrinks the font size of `cfg` until `text` fits inside `boxDims` on the Y-axis.
// For text whose length is not known up front (e.g. generated sidebar explanations), so it does not clip.
export const fitTextSizeToBox = (text:string, cfg:TextConfig, boxDims:Vector2, minSize = 4) =>
{
    const fitCfg = cfg.clone();
    const resource = new ResourceText({ text: text, textConfig: fitCfg });
    for(let i = 0; i < 10; i++)
    {
        const metrics = calculateTextMetrics(resource, boxDims, Vector2.ZERO, false);
        if(!metrics) { break; }
        const linesHeight = fitCfg.lineHeight * fitCfg.size * metrics.lines.length;
        if(linesHeight <= boxDims.y) { break; }
        const newSize = fitCfg.size * (boxDims.y / linesHeight);
        fitCfg.size = Math.max(Math.min(newSize, fitCfg.size * 0.95), minSize);
        if(fitCfg.size <= minSize) { break; }
    }
    return fitCfg.size;
}

// if no size set, we need a really huge canvas to make sure whatever we draw will likely fit so it can be measured
const DEFAULT_SIZE = new Vector2(2048, 2048); 

// Measuring only needs a context to ask `measureText` (and a font), never its pixels. Allocating a fresh
// 2048×2048 surface per text box meant a 16 MB canvas per card face — hundreds of them per deck — for no
// benefit at all. One context is enough, and the function is synchronous, so nothing can interleave.
let measureContext:CanvasRenderingContext2D|null = null;
const getMeasureContext = () =>
{
    if(!measureContext) { measureContext = createContext({ size: DEFAULT_SIZE }); }
    return measureContext;
}

// Overflows used to be logged on every single draw of every single card, which floods the console and
// slows generation down. Report each distinct overflow once.
const REPORTED_OVERFLOWS = new Set<string>();
const OVERFLOW_REPORT_LIMIT = 200;

// Sub-2% overflows are font-metric noise: line breaking and subpixel placement make a box that is
// fractionally too small render identically, so reporting those only floods the console. Anything
// bigger is a real layout problem and still gets reported.
const OVERFLOW_TOLERANCE = 0.02;

const reportOverflow = (axis:string, available:number, needed:number, text:string) =>
{
    if(available > 0 && needed <= available * (1 + OVERFLOW_TOLERANCE)) { return; }
    const excerpt = (text ?? "").slice(0, 80);
    const key = axis + "|" + Math.round(available) + "|" + Math.round(needed) + "|" + excerpt;
    if(REPORTED_OVERFLOWS.has(key)) { return; }
    if(REPORTED_OVERFLOWS.size > OVERFLOW_REPORT_LIMIT) { REPORTED_OVERFLOWS.clear(); }
    REPORTED_OVERFLOWS.add(key);
    console.error(`Textbox overflows on ${axis}-axis!`, available, needed, JSON.stringify(excerpt));
}

// Layout is a pure function of (text, config, box, offset). The same text is typically laid out several
// times (once per output format, once more when the page is printed), and decks repeat short strings
// ("+1", "Attack") hundreds of times, so the finished layout is cached by its own inputs.
const METRICS_CACHE = new Map<string, TextBoxMetrics>();
const METRICS_CACHE_LIMIT = 800;

const buildCacheKey = (resource:ResourceText, size:Vector2, offset:Vector2, auto:TextAutoSize) : string =>
{
    const cfg = resource.textConfig;
    // inline images pull resources out of a loader; their size can change per loader, so do not cache
    if(cfg.resLoader) { return null; }
    if(cfg.format && resource.text.indexOf("<img") >= 0) { return null; }

    return resource.text 
        + "\u0000" + cfg.size + "|" + cfg.font + "|" + cfg.weight + "|" + cfg.style + "|" + cfg.variant + "|" + cfg.transform + "|" + cfg.anchor
        + "\u0000" + cfg.lineHeight + "|" + cfg.heightToSizeRatio + "|" + cfg.maxLines 
        + "|" + (cfg.wrap ? 1 : 0) + (cfg.format ? 1 : 0) + (cfg.useDynamicLineHeight ? 1 : 0) + (cfg.useSimpleDims ? 1 : 0)
        + "\u0000" + cfg.alignHorizontal + "|" + cfg.alignVertical
        + "\u0000" + size.x + "," + size.y + "|" + offset.x + "," + offset.y
        + "|" + (auto ? ((auto.width ? 1 : 0) + "" + (auto.height ? 1 : 0)) : "-");
}

export const calculateTextMetrics = (resource:ResourceText, size:Vector2 = DEFAULT_SIZE, offset:Vector2 = Vector2.ZERO, reportOverflows = true, auto:TextAutoSize = null) =>
{
    const cacheKey = buildCacheKey(resource, size, offset, auto);
    if(cacheKey) 
    {
        const cached = METRICS_CACHE.get(cacheKey);
        if(cached) { return cached; }
    }

    const metrics = computeTextMetrics(resource, size, offset, reportOverflows, auto);

    if(cacheKey && metrics)
    {
        if(METRICS_CACHE.size > METRICS_CACHE_LIMIT) { METRICS_CACHE.clear(); }
        METRICS_CACHE.set(cacheKey, metrics);
    }
    return metrics;
}

const computeTextMetrics = (resource:ResourceText, size:Vector2, offset:Vector2, reportOverflows:boolean, auto:TextAutoSize) =>
{
    // a measuring context never draws, so the box size only matters for wrapping (which takes it as a number)
    const ctx = getMeasureContext();
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";

    const cfg = resource.textConfig;
    const autoWidth = auto ? auto.width === true : false;
    const autoHeight = auto ? auto.height === true : false;

    const boxWidth = autoWidth ? Infinity : size.x;
    const boxHeight = size.y;

    // wraps the text AND measures every chunk in the same pass
    const parsed = parseTextMeasured(resource.text, cfg, boxWidth, ctx);
    if(!hasVisibleText(parsed.chunks)) { return; }

    const parsedChunks = parsed.chunks;
    const widths = parsed.widths;
    const ascents = parsed.ascents;
    const descents = parsed.descents;

    //
    // first, collect the dimensions of each individual LINE
    //
    const fixedLineHeight = (cfg.lineHeight * cfg.size);

    const lines : LineData[] = [];
    let lineData = new LineData();
    let tempY = 0;

    for(let i = 0; i < parsedChunks.length; i++)
    {
        const elem = parsedChunks[i];

        if(elem instanceof TextChunkBreak)
        {
            lineData.endsParagraph = !elem.implicit;
            lines.push(lineData);
            tempY += cfg.useDynamicLineHeight ? lineData.refresh().height : fixedLineHeight;
            lineData = new LineData(new Vector2(0, tempY));
            continue;
        }

        // style chunks are kept (zero width) so drawing can replay them in order
        lineData.registerMeasuredChunk(elem, widths[i], ascents[i], descents[i]);
    }

    if(lineData.hasContent()) 
    { 
        lineData.endsParagraph = true;
        lines.push(lineData); 
    }
    if(lines.length <= 0) { return; }

    // an explicit line limit clips instead of overflowing the box
    if(cfg.maxLines > 0 && lines.length > cfg.maxLines) 
    { 
        lines.length = cfg.maxLines; 
        lines[lines.length - 1].endsParagraph = true;
    }

    //
    // second, combine all those dimensions into total size of the text block
    //
    let realWidth = 0;
    let minTop = Infinity;
    let maxBottom = -Infinity;

    for(const line of lines)
    {
        line.refresh();
        const top = line.pos.y - line.ascent;
        const bottom = line.pos.y + line.descent;
        if(line.width > realWidth) { realWidth = line.width; }
        if(top < minTop) { minTop = top; }
        if(bottom > maxBottom) { maxBottom = bottom; }
    }

    let realHeight = maxBottom - minTop;
    if(cfg.useSimpleDims) { realHeight = fixedLineHeight * lines.length; }

    if(!autoHeight && realHeight > boxHeight)
    {
        if(reportOverflows) { reportOverflow("Y", boxHeight, realHeight, resource.text); }
    }

    if(!autoWidth && realWidth > boxWidth)
    {
        if(reportOverflows) { reportOverflow("X", boxWidth, realWidth, resource.text); }
    }

    //
    // third, use all that information for proper aligning
    //
    const alignH = cfg.alignHorizontal;
    const alignV = cfg.alignVertical;

    const xStart = offset.x;
    const yStart = offset.y;
    const effectiveWidth = autoWidth ? realWidth : boxWidth;
    const effectiveHeight = autoHeight ? realHeight : boxHeight;

    let contentTop = yStart;
    if(alignV === TextAlign.MIDDLE) { contentTop = yStart + 0.5 * (effectiveHeight - realHeight); }
    else if(alignV === TextAlign.END) { contentTop = yStart + effectiveHeight - realHeight; }

    const shiftY = contentTop - minTop;

    // vertical justification distributes the leftover space over the gaps BETWEEN lines
    let extraY = 0;
    const justifyY = (alignV === TextAlign.JUSTIFY);
    if(justifyY && lines.length > 1) 
    { 
        const spaceLeft = effectiveHeight - realHeight;
        extraY = spaceLeft > 0 ? spaceLeft / (lines.length - 1) : 0;
    }

    const justifyX = (alignH === TextAlign.JUSTIFY);

    for(let i = 0; i < lines.length; i++)
    {
        const line = lines[i];

        let xOffset = xStart;
        if(alignH === TextAlign.MIDDLE) { xOffset = xStart + 0.5 * (effectiveWidth - line.width); }
        else if(alignH === TextAlign.END) { xOffset = xStart + effectiveWidth - line.width; }

        // the last line of a paragraph keeps its natural width, like every other text engine
        if(justifyX && !line.endsParagraph) { line.calculateJustifyX(effectiveWidth); }

        line.setPosition(xOffset, line.pos.y + shiftY + extraY * i);
    }

    //
    // fourth, the used box is the actual ink of the text after alignment
    //
    let usedMinX = Infinity;
    let usedMinY = Infinity;
    let usedMaxX = -Infinity;
    let usedMaxY = -Infinity;

    for(const line of lines)
    {
        if(!line.hasContent()) { continue; }
        if(line.topLeft.x < usedMinX) { usedMinX = line.topLeft.x; }
        if(line.topLeft.y < usedMinY) { usedMinY = line.topLeft.y; }
        if(line.bottomRight.x > usedMaxX) { usedMaxX = line.bottomRight.x; }
        if(line.bottomRight.y > usedMaxY) { usedMaxY = line.bottomRight.y; }
    }

    if(!isFinite(usedMinX)) { usedMinX = xStart; usedMinY = contentTop; usedMaxX = xStart + realWidth; usedMaxY = contentTop + realHeight; }

    // return all the final metrics we found
    // An explicit box stays exactly that box: only an axis the caller left empty (auto) is sized by the
    // text itself. This used to shrink the full box to the measured ink, so a text with a fixed box
    // reported (and debug-drew) the wrong dimensions and lost its box for anything reading dimsFull.
    const fullSize = new Vector2(autoWidth ? realWidth : boxWidth, autoHeight ? realHeight : boxHeight);
    const fullPos = new Vector2(autoWidth ? usedMinX : xStart, autoHeight ? contentTop : yStart);

    return {
        dimsFull: new Dims(fullPos, fullSize),
        dimsUsed: new Dims(new Vector2(usedMinX, usedMinY), new Vector2(usedMaxX - usedMinX, usedMaxY - usedMinY)),
        textParsed: parsedChunks,
        lines: lines
    }
}

// Kept for callers that have their own canvas; the shared measuring context is otherwise enough.
export const resetTextMetricsCache = () => { METRICS_CACHE.clear(); }
