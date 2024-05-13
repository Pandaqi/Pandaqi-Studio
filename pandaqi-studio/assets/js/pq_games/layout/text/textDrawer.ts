import Dims from "js/pq_games/tools/geometry/dims"
import Point from "js/pq_games/tools/geometry/point"
import LayoutOperation from "../layoutOperation"
import { CanvasLike } from "../resources/resourceImage"
import StrokeAlign from "../values/strokeAlign"
import LineData from "./lineData"
import { TextChunk, TextChunkBreak, TextChunkImage, TextChunkStyle, TextChunkText } from "./textChunk"
import { TextAlign, TextConfig, TextStyle, TextVariant, TextWeight } from "./textConfig"

const parseTextString = (text:string, config) =>
{
    // line breaks, bold, italic, images
    // @TODO: case changes (uppercase, lowercase)
    // @TODO: <sup> and <sub> (for supertext and subtext) => just draw it smaller and offset
    const regex = /\n|<b>|<\/b>|<em>|<\/em>|<i>|<\/i>|<sc>|<\/sc>|<img id="(.+?)" frame="(.+?)">|<size num="(.+?)">|<\/size>|<font id="(.+?)">|<\/font>|<col hex="(.+?)">|<\/col>/g; 
    let tempText = text;
    let chunks = [];
    let match;
    do {
        match = regex.exec(tempText);
        regex.lastIndex = 0; // @NOTE: This is the crucial line! The regex is a _state_, so it remembers the last match and will only check from THAT POINT, unless we reset it.
        if(!match) { chunks.push(new TextChunkText(tempText)); break; }

        const key = match[0];
        const idx = match.index;

        // if it's not the first thing, then we've passed some text before it; register that first
        const hasTextBefore = (idx > 0);
        if(hasTextBefore)
        {
            const textBefore = tempText.slice(0, idx);
            chunks.push(new TextChunkText(textBefore));
            tempText = tempText.slice(idx);
            continue;
        }

        let newChunk;
        if(key == "<b>") { newChunk = new TextChunkStyle("weight", TextWeight.BOLD); }
        else if(key == "</b>") { newChunk = new TextChunkStyle("weight"); }
        else if(key == "<em>" || key == "<i>") { newChunk = new TextChunkStyle("style", TextStyle.ITALIC); }
        else if(key == "</em>" || key == "</i>") { newChunk = new TextChunkStyle("style"); }
        else if(key == "<sc>") { newChunk = new TextChunkStyle("variant", TextVariant.SMALLCAPS); }
        else if(key == "</sc>") { newChunk = new TextChunkStyle("variant"); }
        else if(key == "\n") { newChunk = new TextChunkBreak(); }
        else if(key.includes("<img")) {
            const resLoader = config.resLoader;
            const frame = parseInt(match[2]) ?? 0;
            const res = resLoader.getResource(match[1]).getImageFrameAsResource(frame);
            newChunk = new TextChunkImage(res);
        } else if(key.includes("<size")) {
            newChunk = new TextChunkStyle("size", parseFloat(match[3]));
        } else if(key == "</size>") {
            newChunk = new TextChunkStyle("size");
        } else if(key.includes("<col")) {
            newChunk = new TextChunkStyle("color", match[5]); // @NOTE: The matches are for the whole regex! So to get a specific capture group, I need to check its position in the WHOLE thing, not just the actual string matched
        } else if(key == "</col>") {
            newChunk = new TextChunkStyle("color");
        } else if(key.includes("<font")) {
            newChunk = new TextChunkStyle("font", match[4]);
        } else if(key == "</font>") {
            newChunk = new TextChunkStyle("font");
        }

        tempText = tempText.slice(key.length);
        chunks.push(newChunk);
        
    } while (match);

    return chunks;
}

const hasVisibleText = (txt) =>
{
    if(Array.isArray(txt)) { return lineHasVisibleContent(txt); }
    return txt.trim().length > 0;
}

const hasVisibleLines = (lines:LineData[]) =>
{
    if(lines.length <= 0) { return false; }
    if(!lineHasVisibleContent(lines[0].chunks)) { return false; }
    return true;
}

const lineHasVisibleContent = (list:TextChunk[]) =>
{
    for(const elem of list)
    {
        if(elem.isVisible()) { return true; }
    }
    return false;
}

const getPathToVisibleContent = (list:TextChunk[], dir = "prev", fromElem = null) =>
{
    const arr = [];
    let startIndex = list.length - 1;
    if(fromElem) { startIndex = list.indexOf(fromElem); }

    let foundSomething = false;
    if(dir == "prev") {
        for(let i = startIndex; i >= 0; i--)
        {
            arr.push(list[i]);
            if(list[i].isVisible()) { foundSomething = true; break; }
        }
        if(foundSomething) { return arr.reverse(); }
    } else if(dir == "next") {
        for(let i = startIndex + 1; i < list.length; i++)
        {
            arr.push(list[i]);
            if(list[i].isVisible()) { foundSomething = true; break; }
        }
        if(foundSomething) { return arr; }
    }

    return [];
}

const moveLineBreak = (list:TextChunk[], br:TextChunkBreak, beforeElem:TextChunk) =>
{
    const breakIndex = list.indexOf(br);
    list.splice(breakIndex, 1); // remove from original position

    const idx = list.indexOf(beforeElem);
    list.splice(idx, 0, br); // insert before elem
}

// @TODO: unused, perhaps not correct
const getRawTextFromChunks = (list:TextChunk[]) =>
{
    let str = "";
    for(const elem of list)
    {
        if(elem instanceof TextChunkText) 
        { 
            if(!elem.isEmptySpace()) { str += elem.text; }
        }
        if(elem instanceof TextChunkImage) { str += "IMG"; }
    }
    return str;
}

const HAIR_SPACE = '\u200a'

export default class TextDrawer
{
    text:string|TextChunk[]
    textParsed:TextChunk[]
    lines:LineData[]
    dims:Dims
    cfg:TextConfig
    textDims:Dims // raw text size
    textBlockDims:Dims // outer bounds of the text block + position of it
    debug: boolean

    constructor(text:string|TextChunk[], dims:Dims, cfg:TextConfig)
    {
        this.text = text ?? "";
        this.dims = dims ?? new Dims();
        this.cfg = cfg;
    }

    invalidate()
    {
        this.textParsed = null;
        this.lines = null;
        this.textDims = null;
        this.textBlockDims = null;
    }

    measureText() : Dims
    {
        if(this.textBlockDims) { return this.textBlockDims.clone(); }

        const canv = document.createElement("canvas");
        canv.width = 2048;
        canv.height = 2048;
        this.toCanvas(canv);
        return this.textBlockDims.clone();
    }

    snapDimsToActualSize()
    {
        const actualSize = this.textBlockDims.getSize();
        this.dims = new Dims(0, 0, actualSize.x, actualSize.y);
    }

    // Parsing has two stages
    // - If our input is a string, parse it into TextChunk types
    // - When we have our chunks, add line breaks wherever needed for wrapping
    parseText(ctx:CanvasRenderingContext2D, text:string|TextChunk[])
    {
        if(this.textParsed) { return this.textParsed; }

        const boxWidth = this.dims.size.x;

        let input : TextChunk[];
        if(Array.isArray(text)) {
            input = text;
        } else {
            input = parseTextString(text, this.cfg);
        }

        // break all text chunks into individual words and spaces
        for(let i = 0; i < input.length; i++)
        {
            if(!(input[i] instanceof TextChunkText)) { continue; }
            const chunks = input[i].break();
            input.splice(i, 1, ...chunks);
        }

        const output = []; 

        const style = this.cfg.clone();
        style.applyToCanvas(ctx);

        let curLine = [];
        let curLineWidth = 0;

        const MIN_SIZE_LAST_LINE = 4;

        for(const elem of input)
        {
            let elemSize = elem.getSize(ctx);
            if(elem instanceof TextChunkImage && !elemSize) 
            { 
                elem.setDims(this.getDefaultImageSize(elem, style)); 
                elemSize = elem.getSize();
            }

            // empty spaces at the start of a line are pointless, remove them
            if(elem.isEmptySpace() && !lineHasVisibleContent(curLine)) { continue; }

            // gather data about what happened before us (mostly line break)
            const pathPrev = getPathToVisibleContent(output, "prev");
            let lineBreakBefore = null;
            for(const elem of pathPrev)
            {
                if(elem instanceof TextChunkBreak) { lineBreakBefore = elem; }
            }
            const hasLineBreakBefore = (lineBreakBefore != null);

            // keep punctuation together with what came before, instead of splitting with line break
            const pathNext = getPathToVisibleContent(input, "next", elem);
            if(elem.isPunctuation() && hasLineBreakBefore)
            {
                moveLineBreak(output, lineBreakBefore, pathPrev[0]);
            }
                        
            const elemWidth = elemSize.x;
            const newLineWidth = curLineWidth + elemWidth;
            curLineWidth = newLineWidth;

            // if this element is the last visible one, but the line is too short, move line break to earlier spot
            const minSizeLastLine = MIN_SIZE_LAST_LINE * style.size;
            const tooSmallForOwnLine = elem.isVisible() && newLineWidth <= minSizeLastLine && !pathNext;
            if(tooSmallForOwnLine)
            {
                moveLineBreak(output, lineBreakBefore, pathPrev[0]);
            }

            const fitsOnLine = (newLineWidth <= boxWidth);
            if(elem instanceof TextChunkStyle) { elem.updateTextConfig(style); style.applyToCanvas(ctx); }
            if(elem instanceof TextChunkBreak || !fitsOnLine) 
            { 
                if(!fitsOnLine) { output.push(new TextChunkBreak()); }
                curLine = []; 
                curLineWidth = elemWidth;
            }

            curLine.push(elem);
            output.push(elem);
        }

        this.textParsed = output;
        return output;
    }

    getTextMetrics(ctx:CanvasRenderingContext2D, textParsed:TextChunk[])
    {
        // @DEBUGGING
        /*const alreadyCalculated = this.lines && this.textDims;
        if(alreadyCalculated) 
        { 
            const textDims = this.textDims;
            const lines = this.lines;
            console.log(textDims, lines);
            return { textDims, lines } 
        }*/

        const xStart = this.dims.position.x;
        const yStart = this.dims.position.y;
        const boxWidth = this.dims.size.x;
        const boxHeight = this.dims.size.y;
        const xEnd = xStart + boxWidth;
        const yEnd = yStart + boxHeight;

        //
        // first, collect the dimensions of each individual LINE
        //
        let lineData = new LineData();
        const lines : LineData[] = [];

        const fixedLineHeight = (this.cfg.lineHeight * this.cfg.size)

        const style = this.cfg.clone();
        style.applyToCanvas(ctx);

        let tempY = 0;
        for(const elem of textParsed)
        {
            if(elem instanceof TextChunkBreak)
            {
                lines.push(lineData);
                const dynamicLineHeight = lineData.getSize().y;
                tempY += this.cfg.useDynamicLineHeight ? dynamicLineHeight : fixedLineHeight;

                lineData = new LineData(new Point(0, tempY));
                continue;
            }

            if(elem instanceof TextChunkStyle) 
            { 
                elem.updateTextConfig(style); 
                style.applyToCanvas(ctx);
            }

            lineData.registerChunk(ctx, elem); // refresh a correct topLeft and bottomRight
        }

        if(lineData.hasContent()) { lines.push(lineData); }

        //
        // second, combine all those dimensions into total size of the text block
        //
        const topLeftTotal = new Point(Infinity, Infinity);
        const bottomRightTotal = new Point(-Infinity, -Infinity);

        for(const line of lines)
        {
            topLeftTotal.x = Math.min(topLeftTotal.x, line.topLeft.x);
            topLeftTotal.y = Math.min(topLeftTotal.y, line.topLeft.y);
            bottomRightTotal.x = Math.max(bottomRightTotal.x, line.bottomRight.x);
            bottomRightTotal.y = Math.max(bottomRightTotal.y, line.bottomRight.y);
        }

        const textDims = new Dims(
            topLeftTotal.x,
            topLeftTotal.y,
            (bottomRightTotal.x - topLeftTotal.x),
            (bottomRightTotal.y - topLeftTotal.y)
        );

        if(this.cfg.useSimpleDims)
        {
            const numLines = lines.length;
            const simpleHeight = fixedLineHeight * numLines;
            textDims.setSize(new Point(textDims.size.x, simpleHeight));
        }

        const realWidth = textDims.size.x;
        const realHeight = textDims.size.y;

        const tooHigh = (realHeight > boxHeight);
        if(tooHigh)
        {
            console.error("Textbox overflows on Y-axis!", boxHeight, realHeight, this.text);
        }

        const tooWide = (realWidth > boxWidth);
        if(tooWide)
        {
            console.error("Textbox overflows on X-axis!", boxWidth, realWidth, this.text);
        }

        //
        // third, use all that information for proper aligning
        //

        const alignH = this.cfg.alignHorizontal;
        const alignV = this.cfg.alignVertical;

        let yOffset;
        if (alignV === TextAlign.START || alignV == TextAlign.JUSTIFY) { yOffset = yStart + lines[0].ascent; }
        else if (alignV === TextAlign.END) { yOffset = yEnd - realHeight + lines[0].ascent; }
        else if(alignV == TextAlign.MIDDLE) { yOffset = yStart + 0.5 * (boxHeight - realHeight) + lines[0].ascent; }

        const justifyY = (this.cfg.alignVertical == TextAlign.JUSTIFY);
        let extraJustifyOffsetY = 0;
        if(justifyY && lines.length > 0)
        {
            const spaceLeftY = boxHeight - realHeight;
            const numSubdivisions = lines.length - 1;
            extraJustifyOffsetY = spaceLeftY / numSubdivisions;
        }

        const justifyX = (this.cfg.alignHorizontal == TextAlign.JUSTIFY);
        for(const line of lines)
        {
            let xOffset;
            if(alignH == TextAlign.START || alignH == TextAlign.JUSTIFY) { xOffset = xStart; }
            else if(alignH == TextAlign.END) { xOffset = xEnd - line.getSize().x; }
            else if(alignH == TextAlign.MIDDLE) { xOffset = xStart + 0.5*(xEnd - line.getSize().x); }

            if(justifyX) { line.calculateJustifyX(boxWidth); }

            line.updatePosition(new Point(xOffset, yOffset));
            yOffset += extraJustifyOffsetY;
        }

        // save the resulting dimensions
        // we should already be absolutely certain about them here, so this is also a correctness test
        this.textDims = textDims.clone();
        this.textBlockDims = textDims.clone().move(new Point(0, lines[0].getPosition().y));
        this.lines = lines;

        return { textDims, lines };
    }

    drawText(ctx:CanvasRenderingContext2D, op:LayoutOperation, lines:LineData[])
    {
        const style = this.cfg.clone();
        style.color = op.fill;
        style.applyToCanvas(ctx);

        for(const line of lines)
        {
            let pos = line.getPosition();

            for(const elem of line.getChunks())
            {
                const elemWidth = elem.getSize(ctx).x;
    
                if(elem instanceof TextChunkText) {
                    this.fillAndStrokeText(ctx, elem.text, pos, op);
                    pos.x += elemWidth;
                    if(elem.isEmptySpace()) { pos.x += line.extraSpaceJustifyX; }
                } else if(elem instanceof TextChunkImage) {
                    this.drawImageChunk(ctx, elem, pos, line);
                    pos.x += elemWidth;
                } else if(elem instanceof TextChunkStyle) { 
                    elem.updateTextConfig(style); 
                    style.applyToCanvas(ctx);
                }
            }
        }
    }

    toCanvas(canv:CanvasLike, op:LayoutOperation = new LayoutOperation())
    {
        if(!hasVisibleText(this.text)) { return; }

        const ctx = (canv instanceof HTMLCanvasElement) ? canv.getContext("2d") : canv;
        const oldTextAlign = ctx.textAlign;
        const oldBaseline = ctx.textBaseline;

        // setting then unsetting at the end is cheaper than a save/restore canvas stack thing
        ctx.textAlign = "left";
        ctx.textBaseline = "alphabetic";

        const textParsed = this.parseText(ctx, this.text);
        const { textDims, lines } = this.getTextMetrics(ctx, textParsed);
        if(!hasVisibleLines(lines)) { return; }
        this.drawText(ctx, op, lines);

        this.debugDraw(ctx);

        ctx.textAlign = oldTextAlign;
        ctx.textBaseline = oldBaseline;
    }

    fillAndStrokeText(ctx:CanvasRenderingContext2D, txt:string, pos:Point, op:LayoutOperation)
    {
        const strokeBeforeFill = op.strokeAlign == StrokeAlign.OUTSIDE;
        const clipStroke = op.strokeAlign == StrokeAlign.INSIDE;

        // @TODO: Clipping (for the inside stroke) NOT IMPLEMENTED YET
        // Clipping only works for paths, and text is not a path
        // Use secondary image and masking for this!
        // @SOURCE: https://stackoverflow.com/questions/7307430/html-canvas-clipping-and-text

        if(strokeBeforeFill) {
            ctx.strokeText(txt, pos.x, pos.y);
            ctx.fillText(txt, pos.x, pos.y);
        } else {
            ctx.fillText(txt, pos.x, pos.y);
            ctx.strokeText(txt, pos.x, pos.y);
        }
    }

    getDefaultImageSize(elem:TextChunkImage, style:TextConfig)
    {
        const sizeY = style.size * this.cfg.heightToSizeRatio;
        const sizeX = elem.resource.getSizeKeepRatio(sizeY, "y");
        return new Point(sizeX, sizeY);
    }

    drawImageChunk(ctx:CanvasRenderingContext2D, elem:TextChunkImage, pos:Point, line:LineData)
    {
        const res = elem.resource;
        pos = pos.clone();
        pos.y = line.getCenter().y;

        let op = (elem.operation ?? this.cfg.defaultImageOperation) ?? new LayoutOperation();
        op = op.clone(true);
        op.translate.move(pos);
        op.pivot = new Point(0, 0.5);
        op.keepTransform = true;
        if(op.dims.isZero()) { op.dims = elem.getSize(); }

        // @DEBUGGING / @TODO
        // Now I need to manually redo/unset the effects merging, which is ugly and will get out of hand when I also need to reset other stuff.
        // Find a cleaner approach? Find out why this is even needed?
        const oldEffects = ctx.filter;
        if(this.cfg.defaultImageOperation) 
        { 
            op.effects = [op.effects, this.cfg.defaultImageOperation.effects].flat(); 
        }

        res.toCanvas(ctx, op);

        ctx.filter = oldEffects;
    }

    /*
    applyFillAndStroke(ctx:CanvasRenderingContext2D, path:Path2D, callback:Function = null)
    {
        const strokeBeforeFill = this.strokeAlign == StrokeAlign.OUTSIDE;
        const clipStroke = this.strokeAlign == StrokeAlign.INSIDE;

        if(clipStroke) { ctx.save(); ctx.clip(path); }

        if(strokeBeforeFill) {
            ctx.stroke(path);
            ctx.fill(path);
            if(callback) { callback(); }
        } else {
            ctx.fill(path);
            if(callback) { callback(); }
            ctx.stroke(path);
        }

        if(clipStroke) { ctx.restore(); }
    }

    */

    debugDraw(ctx:CanvasRenderingContext2D)
    {
        if(!this.debug) { return; }

        // Text box
        ctx.lineWidth = 3
        ctx.strokeStyle = '#00FF00'
        ctx.strokeRect(
            this.dims.position.x, this.dims.position.y, 
            this.dims.size.x, this.dims.size.y
        )

        ctx.lineWidth = 2
        ctx.strokeStyle = '#FF0000'
        ctx.strokeRect(
            this.textBlockDims.position.x, this.textBlockDims.position.y, 
            this.textBlockDims.size.x, this.textBlockDims.size.y
        )
    }

    getDimensions()
    {
        return this.textBlockDims;
    }

    // Calculate Height of the font
    getTextHeight(ctx:CanvasRenderingContext2D, text:string, style:string) 
    {
        ctx.save();
        ctx.textBaseline = 'bottom'
        ctx.font = style
        const height = ctx.measureText(text).actualBoundingBoxAscent
        ctx.restore();

        return height
    }

    justifyLine(ctx:CanvasRenderingContext2D, line:string, spaceWidth:number, width:number) 
    {
        const text = line.trim()
        const lineWidth = ctx.measureText(text).width

        const nbSpaces = text.split(/\s+/).length - 1
        const nbSpacesToInsert = Math.floor((width - lineWidth) / spaceWidth)

        if (nbSpaces <= 0 || nbSpacesToInsert <= 0) return text

        // We insert at least nbSpacesMinimum and we add extraSpaces to the first words
        const nbSpacesMinimum = Math.floor(nbSpacesToInsert / nbSpaces)
        let extraSpaces = nbSpacesToInsert - nbSpaces * nbSpacesMinimum

        const spaceChar = HAIR_SPACE;
        let spaces = [].fill(spaceChar, 0, nbSpacesMinimum);
        let spacesString = spaces.join('')

        const justifiedText = text.replace(/\s+/g, (match:string) => {
            const allSpaces = extraSpaces > 0 ? spacesString + spaceChar : spacesString
            extraSpaces--
            return match + allSpaces
        })

        return justifiedText
    }
}