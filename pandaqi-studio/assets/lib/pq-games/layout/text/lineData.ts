import { Vector2 } from "../../geometry/vector2";
import { TextChunk, TextChunkImage, TextChunkText } from "./textChunk";
import { TextTransform } from "./textConfig";

// One rendered line of text: its chunks (in drawing order) plus everything the layout/drawing code
// needs precomputed. Widths are measured once and kept per chunk (`chunkWidths`, same indices as
// `chunks`) so drawing never has to measure anything again.
export class LineData
{
    chunks: TextChunk[]
    chunkWidths: number[]
    size: Vector2
    pos: Vector2
    topLeft: Vector2
    bottomRight: Vector2
    width: number
    height: number
    ascent: number
    descent: number
    numSpaces: number
    endsParagraph: boolean
    extraSpaceJustifyX: number

    constructor(pos = new Vector2())
    {
        this.pos = pos;
        this.size = new Vector2();
        this.chunks = [];
        this.chunkWidths = [];
        this.width = 0;
        this.height = 0;
        this.ascent = 0;
        this.descent = 0;
        this.numSpaces = 0;
        this.endsParagraph = true;
        this.topLeft = new Vector2();
        this.bottomRight = new Vector2();
        this.extraSpaceJustifyX = 0;
    }

    hasContent() { return this.chunks.length > 0; }
    getChunks() { return this.chunks; }
    getWidth() { return this.width; }

    // fast path: the chunk was already measured during wrapping
    registerMeasuredChunk(chunk:TextChunk, width:number, ascent:number, descent:number)
    {
        if(chunk.isEmptySpace()) { this.numSpaces++; }

        if(ascent > this.ascent) { this.ascent = ascent; }
        if(descent > this.descent) { this.descent = descent; }
        this.width += width;

        this.chunks.push(chunk);
        this.chunkWidths.push(width);
    }

    // `anchor` is the canvas text baseline the chunk is drawn with; it changes which part of the glyph
    // box sits above the line's baseline
    registerChunk(ctx:CanvasRenderingContext2D, chunk:TextChunk, transform:TextTransform = TextTransform.NONE, anchor:string = "alphabetic")
    {
        let width = 0;
        let ascent = 0;
        let descent = 0;

        if(chunk instanceof TextChunkText)
        {
            const metrics = chunk.getMetrics(ctx, transform);
            ascent = Math.abs(metrics.actualBoundingBoxAscent);
            descent = Math.abs(metrics.actualBoundingBoxDescent);
            width = metrics.width;

            if(anchor == "bottom") { ascent += descent; descent = 0; } // superscript: the whole glyph is above the baseline
            else if(anchor == "top") { descent += ascent; ascent = 0; } // subscript: the whole glyph is below it
            else if(anchor == "middle") { const half = 0.5 * (ascent + descent); ascent = half; descent = half; }
        }
        else if(chunk instanceof TextChunkImage)
        {
            const dims = chunk.getSize();
            if(dims) { width = dims.x; ascent = 0.75*dims.y; descent = 0.25*dims.y; }
        }

        if(chunk.isEmptySpace()) { this.numSpaces++; }

        this.ascent = Math.max(this.ascent, ascent);
        this.descent = Math.max(this.descent, descent);
        this.width += width;

        this.chunks.push(chunk);
        this.chunkWidths.push(width);
    }

    getSize() : Vector2 { return new Vector2(this.width, this.ascent + this.descent); }
    getPosition() : Vector2 { return this.pos.clone(); }
    getAscent() { return this.ascent; }
    getDescent() { return this.descent; }

    getCenter() : Vector2
    {
        return new Vector2(
            this.pos.x + 0.5 * this.width,
            this.pos.y - 0.5 * (this.ascent - this.descent)
        );
    }

    // absolute placement (used by the layout once it knows the alignment)
    setPosition(x:number, y:number)
    {
        this.pos.setXY(x, y);
        this.refresh();
        return this;
    }

    // relative placement, kept for backwards compatibility
    updatePosition(pos:Vector2)
    {
        this.pos.move(pos);
        this.refresh();
        return this;
    }

    refresh()
    {
        this.topLeft.setXY(this.pos.x, this.pos.y - this.ascent);
        this.bottomRight.setXY(this.pos.x + this.width, this.pos.y + this.descent);
        this.size.setXY(this.width, this.ascent + this.descent);
        this.height = this.ascent + this.descent;
        return this;
    }

    // the extra space to add after EVERY space chunk so the line spans `totalWidth`
    calculateJustifyX(totalWidth:number)
    {
        if(this.numSpaces <= 0) { this.extraSpaceJustifyX = 0; return; }
        const extra = (totalWidth - this.width) / this.numSpaces;
        this.extraSpaceJustifyX = extra > 0 ? extra : 0;
    }
}
