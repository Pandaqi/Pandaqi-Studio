import { Vector2 } from "../../geometry/vector2";
import type { TextConfig } from "./textConfig";
import type { ResourceImage } from "../resources/resourceImage";
import { LayoutOperation } from "../layoutOperation";

class TextChunk
{
    getSize(ctx:CanvasRenderingContext2D = null) : Vector2 { return new Vector2(); }
    break() : TextChunk[] { return [this]; }
    isEmptySpace() { return false; }
    isVisible() { return false; }
    isPunctuation() { return false; }
}

const PUNCTUATION = [".", "?", "!", "-", "+"]

// `measureText` is called for every word of every line of every card, and the same words ("Attack", "+2",
// "Move") repeat hundreds of times across a deck. The answer only depends on the font and the string.
const METRICS_CACHE = new Map<string, TextMetrics>()
const METRICS_CACHE_LIMIT = 20000

class TextChunkText extends TextChunk
{
    text:string

    constructor(txt:string)
    {
        super();
        this.text = txt;
    }

    isVisible() { return !this.isEmptySpace(); }
    isPunctuation() { return PUNCTUATION.includes(this.text); }
    getMetrics(ctx) : TextMetrics
    {
        const key = ctx.font + "\u0000" + this.text;
        let metrics = METRICS_CACHE.get(key);
        if(!metrics)
        {
            metrics = ctx.measureText(this.text);
            if(METRICS_CACHE.size > METRICS_CACHE_LIMIT) { METRICS_CACHE.clear(); }
            METRICS_CACHE.set(key, metrics);
        }
        return metrics;
    }

    getSize(ctx)
    {
        const metrics = this.getMetrics(ctx);
        return new Vector2(
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
        const regex = /\s/g; // cuts on spaces (@TODO: might add hyphens in the future, don't know how to distinguish from minus signs)
        let text = this.text;
        let chunks = [];
        let match;
        do {
            match = regex.exec(text);
            if(!match) { chunks.push(new TextChunkText(text)); break; }

            const key = match[0];
            const idx = match.index;
            let chunkString = (idx == 0) ? key : text.slice(0, idx);
            const newChunk = new TextChunkText(chunkString);
            chunks.push(newChunk);

            text = (idx == 0) ? text.slice(key.length) : text.slice(idx);
        } while (match);
        return chunks;
    }
}

class TextChunkImage extends TextChunk
{
    resource: ResourceImage;
    operation: LayoutOperation;

    constructor(res:ResourceImage)
    {
        super();
        this.resource = res;
    }

    isVisible() { return true; }
    setDims(size:Vector2)
    {
        if(!this.operation) { this.operation = new LayoutOperation(); }
        this.operation.size = size;
    }

    getSize()
    {
        if(!this.operation) { return null; }
        return this.operation.size.clone();
    }
}

class TextChunkBreak extends TextChunk
{

}

class TextChunkStyle extends TextChunk
{
    prop: string
    value: any

    constructor(prop:string, value:any = null)
    {
        super();
        this.prop = prop;
        this.value = value;
    }

    isReset() { return this.value == null; }
    updateTextConfig(tc:TextConfig)
    {
        if(this.isReset()) { tc.rollbackProperty(this.prop); return; }
        tc.updateProperty(this.prop, this.value);
    }
}

export { TextChunk, TextChunkText, TextChunkImage, TextChunkBreak, TextChunkStyle }