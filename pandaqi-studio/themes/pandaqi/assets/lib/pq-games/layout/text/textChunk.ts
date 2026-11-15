import { Vector2 } from "../../geometry/vector2";
import type { TextConfig } from "./textConfig";
import { TextTransform } from "./textConfig";
import type { ResourceImage } from "../resources/resourceImage";
import { LayoutOperation } from "../layoutOperation";

class TextChunk
{
    getSize(ctx:CanvasRenderingContext2D = null, transform:TextTransform = TextTransform.NONE) : Vector2 { return new Vector2(); }
    break() : TextChunk[] { return [this]; }
    isEmptySpace() { return false; }
    isVisible() { return false; }
    isPunctuation() { return false; }
}

const PUNCTUATION = [".", ",", "?", "!", "-", "+", ":", ";", ")", "]", "}", "%"]

// `measureText` is called for every word of every line of every card, and the same words ("Attack", "+2",
// "Move") repeat hundreds of times across a deck. The answer only depends on the font and the string.
const METRICS_CACHE = new Map<string, TextMetrics>()
const METRICS_CACHE_LIMIT = 20000

class TextChunkText extends TextChunk
{
    text:string
    upperCached:string = null
    lowerCached:string = null

    constructor(txt:string)
    {
        super();
        this.text = txt;
    }

    isVisible() { return !this.isEmptySpace(); }
    isPunctuation() { return PUNCTUATION.includes(this.text); }
    isEmptySpace() { return this.text.trim().length <= 0; }

    getTransformedText(transform:TextTransform = TextTransform.NONE)
    {
        if(transform == TextTransform.UPPERCASE) { return this.upperCached ??= this.text.toUpperCase(); }
        if(transform == TextTransform.LOWERCASE) { return this.lowerCached ??= this.text.toLowerCase(); }
        return this.text;
    }

    getMetrics(ctx:CanvasRenderingContext2D, transform:TextTransform = TextTransform.NONE) : TextMetrics
    {
        const txt = this.getTransformedText(transform);
        const key = ctx.font + "\u0000" + txt;
        let metrics = METRICS_CACHE.get(key);
        if(!metrics)
        {
            metrics = ctx.measureText(txt);
            if(METRICS_CACHE.size > METRICS_CACHE_LIMIT) { METRICS_CACHE.clear(); }
            METRICS_CACHE.set(key, metrics);
        }
        return metrics;
    }

    getSize(ctx:CanvasRenderingContext2D, transform:TextTransform = TextTransform.NONE) : Vector2
    {
        const metrics = this.getMetrics(ctx, transform);
        return new Vector2(
            metrics.width,
            Math.abs(metrics.actualBoundingBoxAscent) + Math.abs(metrics.actualBoundingBoxDescent)
        );
    }

    break() : TextChunk[]
    {
        const text = this.text;
        if(text.length <= 0) { return [this]; }

        // split into alternating word / whitespace runs (the capture group keeps the separators)
        const parts = text.split(/(\s+)/);
        if(parts.length <= 1) { return [this]; }

        const chunks : TextChunk[] = [];
        for(const part of parts)
        {
            if(part.length <= 0) { continue; }
            chunks.push(new TextChunkText(part));
        }
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
    // an implicit break is inserted by wrapping; an explicit one came from a `\n` in the source text.
    // Justification needs the difference: the last line of a paragraph must not be stretched.
    implicit: boolean

    constructor(implicit = false)
    {
        super();
        this.implicit = implicit;
    }
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
