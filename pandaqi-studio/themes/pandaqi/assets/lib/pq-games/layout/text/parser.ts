import { TextChunk, TextChunkBreak, TextChunkImage, TextChunkStyle, TextChunkText } from "./textChunk";
import { TextWeight, TextStyle, TextVariant, TextConfig, TextTransform, TextAnchor } from "./textConfig";
import { getDefaultInlineImageSize } from "./tools";

export const parseTextString = (text:string, config:TextConfig) : TextChunk[] =>
{
    // line breaks, bold, italic, images, other rich text formatting
    // (a regex literal is a fresh object on every call, so its lastIndex can never leak between calls)
    const regexFormatting = /\n|<b>|<\/b>|<em>|<\/em>|<i>|<\/i>|<sc>|<\/sc>|<img id="(.+?)" frame="(.+?)">|<size num="(.+?)">|<\/size>|<font id="(.+?)">|<\/font>|<col hex="(.+?)">|<\/col>|<upper>|<\/upper>|<lower>|<\/lower>|<sup>|<\/sup>|<sub>|<\/sub>/g; 
    const regexFlat = /\n/g;
    const regex = config.format ? regexFormatting : regexFlat;

    const chunks : TextChunk[] = [];
    let tempText = text;
    let match;

    while(true)
    {
        // the regex is a _state_: it remembers the last match and would only continue from there,
        // but we are matching against a freshly sliced string every iteration
        regex.lastIndex = 0;
        match = regex.exec(tempText);
        if(!match) { chunks.push(new TextChunkText(tempText)); break; }

        const key = match[0];
        const idx = match.index;

        // if it's not the first thing, then we've passed some text before it; register that first
        if(idx > 0)
        {
            chunks.push(new TextChunkText(tempText.slice(0, idx)));
            tempText = tempText.slice(idx);
            continue;
        }

        let newChunks : TextChunk[];
        if(key == "<b>") { newChunks = [new TextChunkStyle("weight", TextWeight.BOLD)]; }
        else if(key == "</b>") { newChunks = [new TextChunkStyle("weight")]; }
        else if(key == "<em>" || key == "<i>") { newChunks = [new TextChunkStyle("style", TextStyle.ITALIC)]; }
        else if(key == "</em>" || key == "</i>") { newChunks = [new TextChunkStyle("style")]; }
        else if(key == "<upper>") { newChunks = [new TextChunkStyle("transform", TextTransform.UPPERCASE)]; } 
        else if(key == "</upper>") { newChunks = [new TextChunkStyle("transform")]; } 
        else if(key == "<lower>") { newChunks = [new TextChunkStyle("transform", TextTransform.LOWERCASE)]; } 
        else if(key == "</lower>") { newChunks = [new TextChunkStyle("transform")]; } 
        else if(key == "<sup>") { newChunks = [new TextChunkStyle("anchor", TextAnchor.BOTTOM), new TextChunkStyle("size", config.size*0.66)]; } 
        else if(key == "</sup>") { newChunks = [new TextChunkStyle("size"), new TextChunkStyle("anchor")]; } 
        else if(key == "<sub>") { newChunks = [new TextChunkStyle("anchor", TextAnchor.TOP), new TextChunkStyle("size", config.size*0.66)]; } 
        else if(key == "</sub>") { newChunks = [new TextChunkStyle("size"), new TextChunkStyle("anchor")]; } 
        else if(key == "<sc>") { newChunks = [new TextChunkStyle("variant", TextVariant.SMALLCAPS)]; }
        else if(key == "</sc>") { newChunks = [new TextChunkStyle("variant")]; }
        else if(key == "\n") { newChunks = [new TextChunkBreak()]; }
        else if(key.includes("<img")) {
            const resLoader = config.resLoader;
            // without a loader there is nothing to draw; keeping the tag as literal text is worse than skipping it
            if(!resLoader) { console.error("Can't render inline image without a ResourceLoader on the TextConfig", key); newChunks = []; }
            else {
                const frame = parseInt(match[2]) || 0;
                const res = resLoader.getResource(match[1]).getImageFrameAsResource(frame);
                newChunks = [new TextChunkImage(res)];
            }
        } else if(key.includes("<size")) {
            newChunks = [new TextChunkStyle("size", parseFloat(match[3]))];
        } else if(key == "</size>") {
            newChunks = [new TextChunkStyle("size")];
        } else if(key.includes("<col")) {
            // The matches are indexed for the WHOLE regex! 
            // So to get a specific capture group, I need to check its position in the WHOLE thing, not just the actual string matched
            newChunks = [new TextChunkStyle("color", match[5])];
        } else if(key == "</col>") {
            newChunks = [new TextChunkStyle("color")];
        } else if(key.includes("<font")) {
            newChunks = [new TextChunkStyle("font", match[4])];
        } else if(key == "</font>") {
            newChunks = [new TextChunkStyle("font")];
        } else {
            newChunks = []; // unknown tag: drop it instead of looping forever
        }

        tempText = tempText.slice(key.length);
        for(const c of newChunks) { chunks.push(c); }
    }

    return chunks;
}

// Parsing is deterministic for a given string + format + font size, and a deck draws the same few
// hundred strings over and over. The chunk list is never mutated by the layout code, so it can be
// shared. (Text with inline images is not cached, because those chunks do carry per-resource state.)
const PREPARED_CACHE = new Map<string, TextChunk[]>()
const PREPARED_CACHE_LIMIT = 4000

const KIND_OTHER = 0;
const KIND_WORD = 1;
const KIND_SPACE = 2;
const KIND_BREAK = 3;
const KIND_STYLE = 4;

const MIN_SIZE_LAST_LINE = 4; // if possible, tries to prevent typography widows/orphans

const getPreparedChunks = (text:string, config:TextConfig) : TextChunk[] =>
{
    const canCache = !config.resLoader;
    const key = text + "\u0000" + (config.format ? "1" : "0") + "\u0000" + config.size;
    if(canCache)
    {
        const cached = PREPARED_CACHE.get(key);
        if(cached) { return cached; }
    }

    const chunks : TextChunk[] = [];
    for(const elem of parseTextString(text, config))
    {
        if(!(elem instanceof TextChunkText)) { chunks.push(elem); continue; }
        for(const part of elem.break()) { chunks.push(part); }
    }

    const merged = mergePunctuation(chunks);
    if(canCache)
    {
        if(PREPARED_CACHE.size > PREPARED_CACHE_LIMIT) { PREPARED_CACHE.clear(); }
        PREPARED_CACHE.set(key, merged);
    }
    return merged;
}

// "word" + "." is really one word for line breaking: keep them in a single chunk so a line can never
// start with punctuation (this happens whenever markup splits them, e.g. "word<b>.</b>").
const mergePunctuation = (chunks:TextChunk[]) : TextChunk[] =>
{
    let needsMerge = false;
    for(let i = 1; i < chunks.length; i++)
    {
        const cur = chunks[i];
        const prev = chunks[i-1];
        if(!(cur instanceof TextChunkText) || !(prev instanceof TextChunkText)) { continue; }
        if(prev.isEmptySpace() || cur.isEmptySpace()) { continue; }
        if(cur.isPunctuation()) { needsMerge = true; break; }
    }
    if(!needsMerge) { return chunks; }

    const output : TextChunk[] = [];
    for(const elem of chunks)
    {
        const prev = output[output.length - 1];
        if(elem instanceof TextChunkText && prev instanceof TextChunkText && !prev.isEmptySpace() && elem.isPunctuation())
        {
            output[output.length - 1] = new TextChunkText(prev.text + elem.text);
            continue;
        }
        output.push(elem);
    }
    return output;
}

// Everything the line layout needs about one chunk. Measured once here, so the metrics pass never has
// to call `measureText` (or even touch a canvas context) again for the same text.
export interface ParsedText
{
    chunks: TextChunk[],
    widths: number[],
    ascents: number[],
    descents: number[],
}

// Parsing has two stages
// - If our input is a string, parse it into TextChunk types
// - When we have our chunks, add line breaks wherever needed for wrapping
//
// Everything below is a single pass with O(1) bookkeeping per chunk. The previous version walked the
// entire output list for every chunk (twice), which made layout quadratic in the length of the text.
export const parseText = (text:string|TextChunk[], textConfig:TextConfig, boxWidth:number, ctx:CanvasRenderingContext2D) : TextChunk[] =>
{
    return parseTextMeasured(text, textConfig, boxWidth, ctx).chunks;
}

export const parseTextMeasured = (text:string|TextChunk[], textConfig:TextConfig, boxWidth:number, ctx:CanvasRenderingContext2D) : ParsedText =>
{
    // The font MUST be on the context before anything is measured. This used to sit below the simple
    // parse, so `wrap:false, format:false` text (which returns before reaching it) was measured with
    // whatever font the shared measuring context happened to hold from the previous text.
    const style = textConfig.clone(false);
    style.applyToCanvas(ctx);

    // a much quicker shortcut if your text requirements are simple
    const executeSimpleParse = (typeof text === "string") && !textConfig.wrap && !textConfig.format;
    if(executeSimpleParse) { 
        const chunk = new TextChunkText(text as string);
        const metrics = chunk.getMetrics(ctx, style.transform);
        return { 
            chunks: [chunk], 
            widths: [metrics.width], 
            ascents: [Math.abs(metrics.actualBoundingBoxAscent)], 
            descents: [Math.abs(metrics.actualBoundingBoxDescent)] 
        };
    }

    const input = Array.isArray(text) ? text : getPreparedChunks(text as string, textConfig);
    if(input.length <= 0) { return { chunks: [], widths: [], ascents: [], descents: [] }; }

    const items:{ chunk:TextChunk, width:number, ascent:number, descent:number, kind:number }[] = [];
    for(const chunk of input)
    {
        let kind = KIND_OTHER;
        let width = 0;
        let ascent = 0;
        let descent = 0;

        if(chunk instanceof TextChunkBreak) { kind = KIND_BREAK; }
        else if(chunk instanceof TextChunkStyle) 
        { 
            kind = KIND_STYLE;
            chunk.updateTextConfig(style); 
            style.applyToCanvas(ctx);
        }
        else if(chunk instanceof TextChunkImage)
        {
            kind = KIND_WORD;
            let dims = chunk.getSize();
            if(!dims) { chunk.setDims(getDefaultInlineImageSize(chunk, style, textConfig)); dims = chunk.getSize(); }
            width = dims.x;
            ascent = 0.75*dims.y;
            descent = 0.25*dims.y;
        }
        else if(chunk instanceof TextChunkText)
        {
            kind = chunk.isEmptySpace() ? KIND_SPACE : KIND_WORD;
            const metrics = chunk.getMetrics(ctx, style.transform);
            width = metrics.width;
            ascent = Math.abs(metrics.actualBoundingBoxAscent);
            descent = Math.abs(metrics.actualBoundingBoxDescent);

            // a superscript is drawn above the baseline, a subscript below it
            const anchor = style.anchor;
            if(anchor == "bottom") { ascent += descent; descent = 0; }
            else if(anchor == "top") { descent += ascent; ascent = 0; }
            else if(anchor == "middle") { const half = 0.5*(ascent + descent); ascent = half; descent = half; }
        }

        items.push({ chunk: chunk, width: width, ascent: ascent, descent: descent, kind: kind });
    }

    //
    // Fill lines greedily. Each line is a list of indices into `items`, so a line break can be moved
    // afterwards (widow control) without touching the chunks themselves.
    //
    const wrap = textConfig.wrap;
    const lines:number[][] = [[]];
    const explicitEnd:boolean[] = [];
    let lineWidth = 0;
    let hasVisible = false;

    for(let i = 0; i < items.length; i++)
    {
        const item = items[i];

        if(item.kind == KIND_BREAK)
        {
            explicitEnd[lines.length - 1] = true;
            lines.push([]);
            lineWidth = 0;
            hasVisible = false;
            continue;
        }

        if(item.kind == KIND_STYLE || item.kind == KIND_OTHER) { lines[lines.length - 1].push(i); continue; }

        if(item.kind == KIND_SPACE)
        {
            if(!hasVisible) { continue; } // a line never starts with a space
            lines[lines.length - 1].push(i);
            lineWidth += item.width;
            continue;
        }

        // punctuation hangs on its word instead of wrapping to the next line on its own
        const hangsOnWord = items[i-1] != null && items[i-1].kind == KIND_WORD && (item.chunk as TextChunkText).isPunctuation();
        if(wrap && hasVisible && !hangsOnWord && (lineWidth + item.width) > boxWidth)
        {
            // trailing spaces are simply trimmed when the line is flattened; keeping them here means a
            // line break can still be moved (widow control) without losing the space between two words
            lines.push([]);
            lineWidth = 0;
            hasVisible = false;
        }

        lines[lines.length - 1].push(i);
        lineWidth += item.width;
        hasVisible = true;
    }

    if(wrap && lines.length > 1) { fixWidow(lines, items, boxWidth, textConfig.size); }

    //
    // Flatten back into a chunk list: implicit breaks between wrapped lines, explicit ones preserved
    //
    const chunks : TextChunk[] = [];
    const widths : number[] = [];
    const ascents : number[] = [];
    const descents : number[] = [];

    for(let l = 0; l < lines.length; l++)
    {
        if(l > 0) 
        { 
            chunks.push(new TextChunkBreak(!explicitEnd[l-1])); 
            widths.push(0); ascents.push(0); descents.push(0);
        }

        const line = lines[l];
        let start = 0;
        let end = line.length;
        while(start < end && items[line[start]].kind == KIND_SPACE) { start++; }
        while(end > start && items[line[end-1]].kind == KIND_SPACE) { end--; }
        for(let i = start; i < end; i++) 
        { 
            const item = items[line[i]];
            chunks.push(item.chunk); 
            widths.push(item.width);
            ascents.push(item.ascent);
            descents.push(item.descent);
        }
    }
    return { chunks: chunks, widths: widths, ascents: ascents, descents: descents };
}

const countWords = (line:number[], items:{ kind:number }[]) =>
{
    let n = 0;
    for(const idx of line) { if(items[idx].kind == KIND_WORD) { n++; } }
    return n;
}

// A single short word on the last line of a paragraph is a "widow". Pull one word down from the
// previous line so the last line has company, as long as the result still fits.
const fixWidow = (lines:number[][], items:{ chunk:TextChunk, width:number, kind:number }[], boxWidth:number, fontSize:number) =>
{
    const lastLine = lines[lines.length - 1];
    if(countWords(lastLine, items) != 1) { return; }

    let widowWidth = 0;
    for(const idx of lastLine) { if(items[idx].kind == KIND_WORD) { widowWidth = items[idx].width; break; } }
    if(widowWidth > MIN_SIZE_LAST_LINE * fontSize) { return; }

    // only worth it if the previous line keeps at least two words of its own afterwards;
    // otherwise this just moves the "one word alone" problem one line up
    const prevLine = lines[lines.length - 2];
    if(countWords(prevLine, items) < 3) { return; }

    let wordAt = -1;
    for(let i = prevLine.length - 1; i >= 0; i--)
    {
        if(items[prevLine[i]].kind == KIND_WORD) { wordAt = i; break; }
    }
    if(wordAt < 0) { return; }

    const moved = prevLine.slice(wordAt);
    let movedWidth = 0;
    for(const idx of moved) { movedWidth += items[idx].width; }

    let lastWidth = 0;
    let started = false;
    for(const idx of lastLine) 
    { 
        if(items[idx].kind == KIND_SPACE && !started) { continue; }
        started = true;
        lastWidth += items[idx].width; 
    }

    if(movedWidth + lastWidth > boxWidth) { return; }

    prevLine.length = wordAt;
    lastLine.splice(0, 0, ...moved);
}
