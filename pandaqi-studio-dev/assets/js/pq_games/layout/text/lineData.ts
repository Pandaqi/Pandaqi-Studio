import Point from "js/pq_games/tools/geometry/point";
import { TextChunk, TextChunkImage, TextChunkText } from "./textChunk";

export default class LineData
{
    chunks: TextChunk[]
    size: Point
    pos: Point
    topLeft: Point
    bottomRight: Point
    ascent: number
    descent: number
    extraSpaceJustifyX: number

    constructor(pos = new Point())
    {
        this.pos = pos;
        this.size = new Point();
        this.chunks = [];
        this.ascent = 0;
        this.descent = 0;
        this.topLeft = new Point();
        this.bottomRight = new Point();
        this.extraSpaceJustifyX = 0;
    }

    hasContent() { return this.chunks.length > 0; }
    getChunks() { return this.chunks.slice(); }
    registerChunk(ctx:CanvasRenderingContext2D, chunk:TextChunk)
    {
        let size = chunk.getSize(ctx);
        let ascent = 0;
        let descent = 0;

        if(chunk instanceof TextChunkText) {
            const metrics = chunk.getMetrics(ctx);
            ascent = Math.abs(metrics.actualBoundingBoxAscent);
            descent = Math.abs(metrics.actualBoundingBoxDescent);
            
        // @TODO: figure out how to ALIGN those images with the text baseline
        } else if(chunk instanceof TextChunkImage) {
            ascent = 0.75*size.y;
            descent = 0.25*size.y;
        }

        this.ascent = Math.max(this.ascent, ascent);
        this.descent = Math.max(this.descent, descent);
        this.size.x += size.x;

        this.chunks.push(chunk);
        this.refresh();
    }

    getSize() : Point { return this.size.clone(); }
    getPosition() : Point { return this.pos.clone(); }

    getCenter() : Point
    {
        return this.topLeft.clone().move(this.bottomRight.clone().sub(this.topLeft).scale(0.5));
    }

    updatePosition(pos:Point)
    {
        this.pos.move(pos);
        this.refresh();
    }

    refresh()
    {
        this.topLeft = new Point(this.pos.x, this.pos.y - this.ascent);
        this.bottomRight = new Point(this.pos.x + this.size.x, this.pos.y + this.descent);
        this.size.y = this.ascent + this.descent;
    }

    calculateJustifyX(totalWidth:number)
    {
        let numEmptySpaces = 0;
        for(const chunk of this.chunks)
        {
            if(!chunk.isEmptySpace()) { continue; }
            numEmptySpaces++;
        }

        const sizePerSpace = totalWidth / numEmptySpaces;
        this.extraSpaceJustifyX = sizePerSpace;
    }
}