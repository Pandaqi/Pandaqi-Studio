import { Vector2 } from "../../geometry/vector2";
import { ColorLike } from "../color/colorLike";
import { createContext } from "../canvas/creators";
import { LayoutOperation } from "../layoutOperation";
import type { CanvasLike } from "../resources/resourceImage";
import type { ResourceText } from "../resources/resourceText";
import { StrokeAlign } from "../values";
import { LineData } from "./lineData";
import { calculateTextMetrics, type TextBoxMetrics } from "./metrics";
import { TextChunkImage, TextChunkStyle, TextChunkText } from "./textChunk";
import type { TextConfig } from "./textConfig";
import { TextAnchor } from "./textConfig";

export const drawTextFromResource = (resource:ResourceText) =>
{
    const metrics = calculateTextMetrics(resource);
    const size = metrics ? metrics.dimsUsed.getSize() : new Vector2(1, 1);
    const ctx = createContext({ size: size });
    const op = new LayoutOperation({ size: size });
    op.resource = resource;
    drawTextToCanvas(ctx, op);
    return ctx.canvas;
}

export const drawTextToCanvas = (canv:CanvasLike, op:LayoutOperation = new LayoutOperation(), debug = false) =>
{
    // text drawn through a nested resource may reach this point without having been through
    // LayoutOperation.applyToCanvas, which is what normally measures it
    if(op.textMetrics === undefined) { op.calculateResultProperties(); }

    // measuring returns nothing for text that has nothing visible in it (empty string, only breaks),
    // which is a valid thing to draw: it simply draws nothing
    const textMetrics = op.textMetrics;
    if(!textMetrics || !textMetrics.lines || textMetrics.lines.length <= 0) { return; }
    const config = (op.resource as ResourceText).textConfig;

    const ctx = (canv instanceof HTMLCanvasElement) ? canv.getContext("2d") : canv as CanvasRenderingContext2D;
    const oldTextAlign = ctx.textAlign;
    const oldBaseline = ctx.textBaseline;

    // setting then unsetting at the end is cheaper than a save/restore canvas stack thing
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";

    drawTextLines(ctx, op, textMetrics.lines, config);
    if(debug) { drawTextDebug(ctx, textMetrics); }

    ctx.textAlign = oldTextAlign;
    ctx.textBaseline = oldBaseline;
}

const drawTextLines = (ctx:CanvasRenderingContext2D, op:LayoutOperation, lines:LineData[], cfg:TextConfig) =>
{
    const fillVisible = op.hasFill();
    const hasStroke = op.hasStroke();

    // text with neither a fill nor a stroke is drawn black, so it stays visible (this fallback used to be
    // written back onto the operation itself, which polluted every later use of that same operation)
    const hasFill = fillVisible || !hasStroke;
    const color = fillVisible ? op.fill : new ColorLike("#000000");

    const style = cfg.clone(false);
    style.color = color;
    style.applyToCanvas(ctx);
    ctx.textBaseline = style.anchor ?? TextAnchor.ALPHABETIC;

    const strokeBeforeFill = op.strokeAlign == StrokeAlign.OUTSIDE;

    const pos = new Vector2();

    for(const line of lines)
    {
        if(line.chunks.length <= 0) { continue; }

        pos.x = line.pos.x;
        pos.y = line.pos.y;

        const chunks = line.chunks;
        const widths = line.chunkWidths;

        for(let i = 0; i < chunks.length; i++)
        {
            const elem = chunks[i];

            if(elem instanceof TextChunkText) {
                const text = style.applyTextTransform(elem.text);
                if(text.length > 0) { fillAndStrokeText(ctx, text, pos, hasFill, hasStroke, strokeBeforeFill); }
                pos.x += widths[i];
                if(line.extraSpaceJustifyX > 0 && elem.isEmptySpace()) { pos.x += line.extraSpaceJustifyX; }
            } else if(elem instanceof TextChunkImage) {
                drawImageChunk(ctx, elem, pos, line, op, cfg);
                pos.x += widths[i];
            } else if(elem instanceof TextChunkStyle) { 
                elem.updateTextConfig(style); 
                style.applyToCanvas(ctx);
                ctx.textBaseline = style.anchor ?? TextAnchor.ALPHABETIC;
            }
        }
    }
}

export const fillAndStrokeText = (ctx:CanvasRenderingContext2D, txt:string, pos:Vector2, opOrFill:LayoutOperation|boolean = null, hasStrokeIn = null, strokeFirstIn = null) =>
{
    // Accepts either a LayoutOperation (old signature) or precomputed flags (hot path)
    let hasFill = true;
    let hasStroke = false;
    let strokeFirst = false;

    if(typeof opOrFill === "boolean") {
        hasFill = opOrFill;
        hasStroke = hasStrokeIn === true;
        strokeFirst = strokeFirstIn === true;
    } else if(opOrFill) {
        hasFill = opOrFill.hasFill();
        hasStroke = opOrFill.hasStroke();
        strokeFirst = opOrFill.strokeAlign == StrokeAlign.OUTSIDE;
    }

    // @TODO: Clipping (for the inside stroke) NOT IMPLEMENTED YET
    // Clipping only works for paths, and text is not a path
    // Use secondary image and masking for this!
    // @SOURCE: https://stackoverflow.com/questions/7307430/html-canvas-clipping-and-text

    if(strokeFirst) { ctx.strokeText(txt, pos.x, pos.y); }
    if(hasFill) { ctx.fillText(txt, pos.x, pos.y); }
    if(hasStroke && !strokeFirst) { ctx.strokeText(txt, pos.x, pos.y); }
}

const drawImageChunk = (ctx:CanvasRenderingContext2D, elem:TextChunkImage, pos:Vector2, line:LineData, opParent:LayoutOperation, cfg:TextConfig) =>
{
    const res = elem.resource;

    // by attaching a LayoutOperation to the image you can customize its placement/size/everything
    const customOperation = (elem.operation ?? cfg.defaultImageOperation);
    const op = customOperation ? customOperation.clone() : new LayoutOperation();

    // place image at current relative location in text, centered vertically
    const posImage = pos.clone();
    posImage.y = line.getCenter().y;
    posImage.move(op.pos); // take any custom positioning into account
    op.pos = posImage;
    op.pivot = new Vector2(0, 0.5);
    const dims = elem.getSize();
    if(op.size.isZero() && dims) { op.size = dims.clone(); }

    // by giving it the parent operation, 
    // that relative location can now be transformed to the absolute location within the entire canvas
    op.parentOperation = opParent;

    // NOW COMES SOMETHING IMPORTANT
    // we basically apply this operation ... in the middle of applying ANOTHER layout operation; it's an "inline image", this can't be helped
    // layout operations only "reset/save" the state of the canvas when they start to apply themselves
    // as such, after placing this image, the reset mechanism won't reset the state before we continue drawing other text,
    // which is why we need the `inline` property to tell the LayoutOperation that these changes are temporary and should be forgotten
    op.inline = true;

    // now draw the image at the right size+location
    // (and, as explained, forget about our changes afterwards so the rest of the text continues at the proper settings/location)
    //
    // `inline` only resets the transform/alpha/filter/composite. Everything else the image operation sets on
    // this shared context — fillStyle, strokeStyle, lineWidth, font, shadow, clip — would otherwise stay behind
    // for the rest of the text. Text after an inline image was literally drawn with the image's (transparent)
    // fill, so it disappeared. A save/restore around the image is the complete version of that reset.
    ctx.save();
    res.toCanvas(ctx, op);
    ctx.restore();
}

const drawTextDebug = (ctx:CanvasRenderingContext2D, metrics:TextBoxMetrics) =>
{
    // Full TextBox Size
    ctx.lineWidth = 6
    ctx.strokeStyle = "#00FF00"
    ctx.strokeRect(
        metrics.dimsFull.position.x, metrics.dimsFull.position.y, 
        metrics.dimsFull.size.x, metrics.dimsFull.size.y
    )

    // Used Textbox Size (only visible text, no empty space)
    ctx.lineWidth = 6
    ctx.strokeStyle = "#FF0000"
    ctx.strokeRect(
        metrics.dimsUsed.position.x, metrics.dimsUsed.position.y, 
        metrics.dimsUsed.size.x, metrics.dimsUsed.size.y
    )
}
