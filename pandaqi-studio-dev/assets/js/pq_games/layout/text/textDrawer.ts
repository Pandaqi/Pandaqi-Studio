import { TextConfig, TextAlign } from "./textConfig"
import Dims from "js/pq_games/tools/geometry/dims"
import Point from "js/pq_games/tools/geometry/point"
import ResourceImage, { CanvasLike } from "../resources/resourceImage"
import LayoutOperation from "../layoutOperation"
import StrokeAlignValue from "../values/strokeAlignValue"
import { TextChunk, TextChunkBreak, TextChunkImage, TextChunkStyle, TextChunkText } from "./textChunk"
import ResourceLoader from "../resources/resourceLoader"
import LineData from "./lineData"

export default class TextDrawer
{
    HAIR_SPACE = '\u200a'

    text:string|TextChunk[]
    dims:Dims
    cfg:TextConfig
    textBlockDims:Dims
    debug: boolean

    constructor(text:string, dims:Dims, cfg:TextConfig)
    {
        this.text = text ?? "";
        this.dims = dims ?? new Dims();
        this.cfg = cfg;
    }

    measureText() : Dims
    {
        const canv = document.createElement("canvas");
        canv.width = 2048;
        canv.height = 2048;
        this.toCanvas(canv);
        return this.textBlockDims;
    }

    // Parsing has two stages
    // - If our input is a string, parse it into TextChunk types
    // - When we have our chunks, add line breaks wherever needed for wrapping
    parseText(ctx:CanvasRenderingContext2D)
    {
        const boxWidth = this.dims.size.x;

        let input : TextChunk[];
        if(Array.isArray(this.text)) {
            input = this.text;
        } else {
            // line breaks, bold, italic, images
            // @TODO: font, font size, variants (uppercase,lowercase,small-caps)
            const regex = /\n|<b>|<\/b>|<em>|<\/em>|<img id="(.+?)" frame="(.+?)">/g; 
            let text = this.text;
            let chunks = [];
            let match;
            do {
                match = regex.exec(text);
                if(!match) { break; }

                const key = match[0];
                const idx = text.indexOf(key);
                text = text.slice(idx);
                
                let newChunk;
                if(key == "<b>") { newChunk = new TextChunkStyle("weight", "bold"); }
                else if(key == "</b>") { newChunk = new TextChunkStyle("weight", "regular"); }
                else if(key == "<em>") { newChunk = new TextChunkStyle("style", "italic"); }
                else if(key == "</em>") { newChunk = new TextChunkStyle("style", "normal"); }
                else if(key == "\n") { newChunk = new TextChunkBreak(); }
                else if(key.includes("img")) {
                    const resLoader = this.cfg.resLoader;
                    const res = resLoader.getResource(match[1]).getImageFrameAsResource(parseInt(match[2]));
                    newChunk = new TextChunkImage(res);
                }
                chunks.push(newChunk);
                
            } while (match);

            input = chunks;
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
        ctx.font = style.getCanvasFontString();

        let curLine = [];
        let curLineWidth = 0;

        for(const elem of input)
        {
            const elemWidth = elem.getSize(ctx).x;
            const newLineWidth = curLineWidth + elemWidth;
            const fitsOnLine = (newLineWidth <= boxWidth);
            if(elem instanceof TextChunkStyle) { elem.updateTextConfig(style); ctx.font = style.getCanvasFontString(); }
            if(elem instanceof TextChunkBreak) { curLine = []; curLineWidth = 0; }
            if(fitsOnLine) { output.push(elem); continue; }

            output.push(new TextChunkBreak());
            curLine = [];
            curLineWidth = 0;
            output.push(elem);
        }

        return output;
    }

    getTextMetrics(ctx:CanvasRenderingContext2D, textParsed:TextChunk[])
    {
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
        ctx.font = style.getCanvasFontString();

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

            if(elem instanceof TextChunkStyle) { 
                elem.updateTextConfig(style); 
                ctx.font = style.getCanvasFontString(); 
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

        const realHeight = textDims.size.y;

        //
        // third, use all that information for proper aligning
        //

        const alignH = this.cfg.alignHorizontal;
        const alignV = this.cfg.alignVertical;

        // @TODO: vertical justify not yet implemented
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

        return { textDims,lines };
    }

    drawText(ctx:CanvasRenderingContext2D, op:LayoutOperation, lines:LineData[])
    {
        const style = this.cfg.clone();
        ctx.font = style.getCanvasFontString();

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
                    const res = elem.resource;
                    this.drawImageChunk(ctx, res, pos, line);
                    pos.x += elemWidth;
                } else if(elem instanceof TextChunkStyle) { 
                    elem.updateTextConfig(style); 
                    ctx.font = style.getCanvasFontString(); 
                }
            }
        }
    }

    toCanvas(canv:CanvasLike, op:LayoutOperation = new LayoutOperation())
    {
        const ctx = (canv instanceof HTMLCanvasElement) ? canv.getContext("2d") : canv;
        ctx.save();

        const textParsed = this.parseText(ctx);
        const { textDims, lines } = this.getTextMetrics(ctx, textParsed);
        this.drawText(ctx, op, lines);

        // save the resulting dimensions
        // we should already be absolutely certain about them here, so this is also a correctness test
        // @TODO: isn't there a better location/time to calculate this?
        this.textBlockDims = textDims.clone().move(lines[0].topLeft.clone());

        this.debugDraw(ctx);
        ctx.restore();
    }

    fillAndStrokeText(ctx:CanvasRenderingContext2D, txt:string, pos:Point, op:LayoutOperation)
    {
        const strokeBeforeFill = op.strokeAlign == StrokeAlignValue.OUTSIDE;
        const clipStroke = op.strokeAlign == StrokeAlignValue.INSIDE;

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

    // @TODO: this is very barebones right now, expand later
    // => Allow setting a LayoutOperation on TextChunkImage (if we supply text as array)
    // => Allow setting a _global_ LayoutOperation to be applied to _all_ inline images (in text config?)
    drawImageChunk(ctx:CanvasRenderingContext2D, res:ResourceImage, pos:Point, line:LineData)
    {
        const dims = new Point(line.size.y);
        pos.y = line.topLeft.y;

        ctx.drawImage(res.getImage(),
            pos.x, pos.y,
            dims.x, dims.y);
    }

    /*
    applyFillAndStroke(ctx:CanvasRenderingContext2D, path:Path2D, callback:Function = null)
    {
        const strokeBeforeFill = this.strokeAlign == StrokeAlignValue.OUTSIDE;
        const clipStroke = this.strokeAlign == StrokeAlignValue.INSIDE;

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
        ctx.strokeStyle = '#00AA00'
        ctx.strokeRect(
            this.dims.position.x, this.dims.position.y, 
            this.dims.size.x, this.dims.size.y
        )

        ctx.lineWidth = 2
        ctx.strokeStyle = '#000000'
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

        const spaceChar = this.HAIR_SPACE;
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