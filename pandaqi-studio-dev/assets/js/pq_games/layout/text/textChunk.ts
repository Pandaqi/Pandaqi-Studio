import Point from "js/pq_games/tools/geometry/point";
import TextConfig from "./textConfig";
import ResourceImage from "../resources/resourceImage";

class TextChunk
{
    getSize(ctx:CanvasRenderingContext2D = null) : Point { return new Point(); }
    break() : TextChunk[] { return [this]; }
    isEmptySpace() { return false; }
}

class TextChunkText extends TextChunk
{
    text:string

    constructor(txt:string)
    {
        super();
        this.text = txt;
    }

    getMetrics(ctx) : TextMetrics
    {
        return ctx.measureText(this.text);
    }

    getSize(ctx)
    {
        const metrics = this.getMetrics(ctx);
        return new Point(
            metrics.width,
            Math.abs(metrics.actualBoundingBoxAscent) + Math.abs(metrics.actualBoundingBoxDescent)
        );
    }

    isEmptySpace()
    {
        return this.text.trim().length <= 0;
    }

    break()
    {
        const regex = /\s|-/g; // cuts on spaces and hyphens
        let text = this.text;
        let chunks = [];
        let match;
        do {
            match = regex.exec(text);
            if(!match) { break; }

            const key = match[0];
            const idx = text.indexOf(key);
            const newChunk1 = new TextChunkText(text.slice(0, idx));
            const newChunk2 = new TextChunkText(key);
            chunks.push(newChunk1);
            chunks.push(newChunk2);
            
            text = text.slice(idx + key.length)
        } while (match);

        // whatever text remains becomes the final chunk
        if(text.length > 0)
        {
            chunks.push(new TextChunkText(text));
        }
        return chunks;
    }
}

class TextChunkImage extends TextChunk
{
    resource: ResourceImage;

    constructor(res:ResourceImage)
    {
        super();
        this.resource = res;
    }
}

class TextChunkBreak extends TextChunk
{

}

class TextChunkStyle extends TextChunk
{
    prop: string
    value: any

    constructor(prop:string, value:any)
    {
        super();
        this.prop = prop;
        this.value = value;
    }

    updateTextConfig(tc:TextConfig)
    {
        tc[this.prop] = this.value;
    }
}

export { TextChunk, TextChunkText, TextChunkImage, TextChunkBreak, TextChunkStyle }