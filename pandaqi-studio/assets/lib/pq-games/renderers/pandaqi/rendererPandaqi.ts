import { TintEffect } from "../../layout/effects/tintEffect";
import { Dims } from "../../geometry/dims";
import { Path } from "../../geometry/path";
import { Vector2 } from "../../geometry/vector2";
import { createCanvas, createContext } from "../../layout/canvas/creators";
import { EffectsOperation } from "../../layout/effects/effectsOperation";
import { LayoutOperation } from "../../layout/layoutOperation";
import { drawLayoutOperationDebug } from "../../layout/operation/operationDebug";
import type { Resource} from "../../layout/resources/resource";
import { LayoutCombo, ResourceGroup } from "../../layout/resources/resourceGroup";
import { orderCombosForDrawing } from "../../layout/resources/drawOrder";
import { ResourceImage, CanvasLike } from "../../layout/resources/resourceImage";
import type { ResourceLoadParams } from "../../layout/resources/resourceLoader";
import type { LayoutEffect } from "../../layout/effects/layoutEffect";
import type { ResourceShape } from "../../layout/resources/resourceShape";
import { ResourceText } from "../../layout/resources/resourceText";
import { Renderer, RendererDrawFinishParams } from "../renderer";
import { drawTextToCanvas } from "../../layout/text/drawing";
import { getCanvasContextState, resetCanvasContextState } from "../../layout/canvas/operations";
import { StrokeAlign } from "../../layout/values";

const NO_EFFECTS:LayoutEffect[] = [];

// How many temporary surfaces of one exact size are kept for reuse. The stack depth of a draw (nested
// groups, masked text) is normally 2 or 3, so this is comfortable without pinning much memory.
const MAX_POOLED_SURFACES = 3;

export class RendererPandaqi extends Renderer
{
    // Temporary canvases are pooled instead of allocated per draw. A 3507x2480 page is ~35 MB of raster
    // surface, and a group plus a few stroked texts used to allocate one of those each, which is where
    // most of the render time (and the garbage) went.
    private tempPool = new Map<string, CanvasRenderingContext2D[]>();

    async cacheLoadedImage(img:HTMLImageElement, params:ResourceLoadParams) : Promise<ResourceImage>
    {
        // decode() is only a "the bitmap is ready" hint, and Safari can reject it for an image that has
        // already finished loading (also for SVG or very large bitmaps). It used to abort the generation.
        try { await img.decode(); } catch(e) { /* the resource loader already waited for onload */ }
        const res = new ResourceImage(img, params);
        if(params.enableCaching) { await res.cacheFrames(); }
        return res;
    }

    prepareDraw(cfg:Record<string,any> = {})
    {
        return new ResourceGroup();
    }
    
    async finishDraw(params:RendererDrawFinishParams)
    {
        const canv = createCanvas({ size: params.size });
        const op = new LayoutOperation({ renderer: this });
        params.group.toCanvas(canv, op);
        return canv;
    }

    // Children of a group are handed to the renderer in this order. Depth sorting is the default (it is
    // free when unused); a group can add its own hook or opt into style batching (see drawOrder.ts).
    getDrawOrder(group:ResourceGroup) : LayoutCombo[]
    {
        return orderCombosForDrawing(group.combos, { order: group.order, batching: group.batch });
    }

    // A group only needs its own surface when it composites as a unit: alpha, blend mode, effects, tint,
    // a mask or a clip. Everything else can draw its children straight onto the parent context, which
    // skips a full-size temporary canvas AND the full-canvas stamp at the end. This used to happen for
    // every single group on the page.
    canDrawGroupDirectly(op:LayoutOperation) : boolean
    {
        return !op.hasEffects()
            && !op.hasMask()
            && !op.hasClip()
            && !op.hasTint()
            && op.alpha >= 1
            && op.composite === "source-over"
            && !op.isDebugEnabled();
    }

    acquireTempContext(width:number, height:number) : CanvasRenderingContext2D
    {
        const key = width + "x" + height;
        const pool = this.tempPool.get(key);
        const reused = pool && pool.length > 0 ? pool.pop() : null;
        if(!reused) { return createContext({ size: new Vector2(width, height) }); }

        // a reused surface must look like a new one: no transform, alpha, clip, dash or shadow left over
        reused.setTransform(1, 0, 0, 1, 0, 0);
        reused.globalAlpha = 1;
        reused.globalCompositeOperation = "source-over";
        reused.filter = "none";
        reused.shadowBlur = 0;
        reused.shadowColor = "#000000";
        reused.shadowOffsetX = 0;
        reused.shadowOffsetY = 0;
        if(typeof reused.setLineDash == "function") { reused.setLineDash([]); }
        reused.clearRect(0, 0, width, height);
        return reused;
    }

    releaseTempContext(ctx:CanvasRenderingContext2D)
    {
        if(!ctx) { return; }
        const key = ctx.canvas.width + "x" + ctx.canvas.height;
        let pool = this.tempPool.get(key);
        if(!pool) { pool = []; this.tempPool.set(key, pool); }
        if(pool.length < MAX_POOLED_SURFACES) { pool.push(ctx); }
    }

    // Frees every pooled surface. Long-running pages call this between generations; games that draw one
    // document and stop never need to.
    clearPool() { this.tempPool.clear(); }

    applyOperationToCanvas(op:LayoutOperation, canv:CanvasLike)
    {
        let ctx = (canv instanceof HTMLCanvasElement) ? canv.getContext("2d") : canv;
        if(!ctx) { ctx = createContext({ size: op.size }); }
        this.drawOperation(op, ctx as CanvasRenderingContext2D);
        return (ctx as CanvasRenderingContext2D).canvas;
    }

    private drawOperation(op:LayoutOperation, ctx:CanvasRenderingContext2D)
    {
        const group = op.isGroup() ? (op.resource as ResourceGroup) : null;

        // direct group: no surface of its own, no stamp, children paint in place
        if(group && this.canDrawGroupDirectly(op))
        {
            for(const combo of this.getDrawOrder(group))
            {
                combo.toCanvas(ctx, op);
            }
            return;
        }

        // don't call `op.effects` when there are none: its getter allocates the (empty) list
        let effects = op.hasEffects() ? op.effects.slice() : NO_EFFECTS;
        if(op.hasTint())
        {
            if(effects === NO_EFFECTS) { effects = [new TintEffect(op.tint)]; }
            else { effects.push(new TintEffect(op.tint)); }
        }
        const effOp = new EffectsOperation(effects);
        
        // HUGE OPTIMIZATION => don't create the temporary canvas if we don't need it
        // (Though that is rare; would only apply to stuff with only a transform + fill/stroke and nothing else)
        const isMultiStepText = op.isText() && op.hasStroke();
        const needsTemporaryCanvas = effOp.needsTemporaryCanvas() || !!group || op.hasMask() || isMultiStepText;

        // SAVE/RESTORE is extremely expensive and error prone (if you forget one even once); so limit it to only when really needed
        const needsStateManagement = op.hasClip();
        if(needsStateManagement) { ctx.save(); }

        // Only inline operations need the (allocating) state snapshot: they draw in the middle of
        // another operation and must leave the context as they found it. Everyone else is the last
        // user of the context and is reset by the next operation anyway.
        const oldState = op.inline ? getCanvasContextState(ctx) : null;

        // we create a temporary canvas to do everything we want
        // once done, at the end, we stamp that onto the real one (with the right effects, alpha, etcetera set)
        const ctxTemp = needsTemporaryCanvas ? this.acquireTempContext(ctx.canvas.width, ctx.canvas.height) : ctx;
        const size = op.sizeResult;

        // this must come before any changes to ctxTemp (such as applying transform below), 
        // otherwise the mask is positioned wrong!
        // @NOTE: we might make this optional though, like op.clip, by adding a `maskRelative` property to choose between relative/absolute positioning => NO it's not just copy-paste the clipping one, because this one happens on ctxTemp instead of ctx
        if(op.hasMask())
        {
            const maskOp = op.mask.operation ?? new LayoutOperation();
            op.mask.resource.toCanvas(ctxTemp, maskOp);
            ctxTemp.globalCompositeOperation = "source-in";
        }

        if(op.hasClip())
        {
            // this necessitates converting any shape to a slightly more expensive path, but it can't be helped
            const points = op.clip.toPathArray();
            const path = new Path(points).toPath2D();

            // relative clipping is a legacy support thing; just do ugly SET->DO->UNSET
            // @NOTE: should this be on ctxTemp instead??
            if(op.clipRelative) {
                op.transformResult.applyToContext(ctx);
                ctx.clip(path);
                ctx.resetTransform();
            } else {
                ctx.clip(path); 
            }
        }

        // we make sure we're drawing at the right position right away
        const trans = op.transformResult;
        trans.applyToContext(ctxTemp);

        // some effects merely require setting something on the canvas
        effOp.applyToCanvasPre(ctx);

        // the bulk of canvas properties to set. These stay unconditional: a reused surface (or a parent
        // context an inline operation drew on) can still carry another operation's filter, alpha or
        // shadow, so "it is the default, skip it" silently painted with the previous element's state.
        op.setFillAndStrokeOnContext(ctxTemp);

        ctx.filter = effOp.getFilterString();
        ctx.globalCompositeOperation = op.composite;
        ctx.globalAlpha = op.alpha;
        effOp.setShadowProperties(ctx);

        // now prepare/draw the actual resource onto it
        if(group)
        {
            for(const combo of this.getDrawOrder(group))
            {
                combo.toCanvas(ctxTemp, op);
            }
        }

        else if(op.isShape())
        {
            const path = (op.resource as ResourceShape).shape.toPath2D();
            op.applyFillAndStrokeToPath(ctxTemp, path);
        }

        else if(op.isText())
        {
            drawTextToCanvas(ctxTemp, op, this.debugText);
        }

        else if(op.isImage())
        { 
            // apply the effects that require an actual image to manipulate
            let frameResource:ResourceImage = (op.resource as ResourceImage).getImageFrameAsResource(op.frame, size.clone());
            frameResource = effOp.applyToDrawable(frameResource);

            const drawImageCallback = () =>
            {
                ctxTemp.drawImage(
                    frameResource.getImage(), 
                    0, 0, size.x, size.y
                );
            }

            // The box is always a rectangle, so the common case does not need a Path2D at all: fill/stroke
            // it with the rect primitives. Only an INSIDE stroke actually needs a path (to clip).
            if(op.strokeAlign !== StrokeAlign.INSIDE)
            {
                const hasFill = op.hasFill();
                const hasStroke = op.hasStroke();
                const strokeFirst = op.strokeAlign === StrokeAlign.OUTSIDE && hasStroke;

                if(strokeFirst) { ctxTemp.strokeRect(0, 0, size.x, size.y); }
                if(hasFill) { ctxTemp.fillRect(0, 0, size.x, size.y); }
                drawImageCallback();
                if(hasStroke && !strokeFirst) { ctxTemp.strokeRect(0, 0, size.x, size.y); }
            }
            else
            {
                const boxPath = new Dims(new Vector2(), size.clone()).toPath2D();
                op.applyFillAndStrokeToPath(ctxTemp, boxPath, drawImageCallback);
            }
        }

        const ctxFinal = effOp.applyToCanvasPost(ctxTemp);

        // only draw something extra if we actually have a temporary canvas to draw
        // The temporary canvas already contains the FULL, absolute transform of this operation. `ctx` can still
        // carry the transform of a parent operation (a nested group, or the text an inline image sits in), so
        // stamping it with that transform active applied the transform twice: text/images jumped by the parent's
        // position (and a scale/rotation compounded). Stamp at identity and put the destination back afterwards.
        if(needsTemporaryCanvas) 
        { 
            const destTransform = ctx.getTransform();
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.drawImage(ctxFinal.canvas, 0, 0);
            ctx.setTransform(destTransform);

            // the surface is back in the pool only now: it held the pixels until the stamp above
            this.releaseTempContext(ctxTemp);
        }

        if(op.inline && oldState) { resetCanvasContextState(ctx, oldState); }
        if(needsStateManagement) { ctx.restore(); }

        // debug feedback is drawn last (after any clip is restored), at identity, so it is never
        // affected by this operation's own transform/effects/clip. Inline operations are skipped
        // (their context belongs to another operation).
        if(op.isDebugEnabled()) { drawLayoutOperationDebug(ctx, op); }
    }

    async applyOperationToHTML(op:LayoutOperation, node:HTMLElement, res:Resource = null)
    {
        const textMode = res instanceof ResourceText;

        // misc basic properties
        node.style.opacity = op.alpha.toString();
        if(textMode) { node.style.color = op.fill.toCSS(); }
        else { node.style.backgroundColor = op.fill.toCSS(); }

        if(textMode) {
            const strokeColor = op.stroke.toCSS();
            // `stroke` only works for SVG; HTML text outlines need the (widely supported) webkit property
            node.style.stroke = strokeColor;
            node.style.strokeWidth = op.strokeWidth + "px";
            (node.style as any).webkitTextStroke = op.strokeWidth + "px " + strokeColor;
        } else {
            if(op.strokeWidth > 0) { node.style.borderStyle = op.strokeType; }
            node.style.borderWidth = op.strokeWidth + "px";
            node.style.borderColor = op.stroke.toCSS();
        }

        // clip and mask
        if(op.clip)
        {
            node.style.clipPath = op.clip.toCSSPath();
        }

        // A CSS mask is positioned in the element's own box, unlike the canvas mask (which is in canvas
        // coordinates), so only the size/repeat can be mapped reliably. The operation is still used for
        // the mask's size, which is the part that otherwise cut off or stretched every masked element.
        if(op.hasMask())
        {
            const maskUrl = op.mask.resource.getCSSUrl();
            const maskOp = op.mask.operation;
            let maskSize = maskOp?.sizeResult;
            if(!maskSize || maskSize.isZero()) { maskSize = maskOp?.size; }
            if(!maskSize || maskSize.isZero()) { maskSize = op.mask.resource.getSize(); }

            node.style.maskImage = maskUrl;
            (node.style as any).webkitMaskImage = maskUrl;
            node.style.maskRepeat = "no-repeat";
            (node.style as any).webkitMaskRepeat = "no-repeat";

            if(maskSize)
            {
                const sizeCSS = maskSize.x + "px " + maskSize.y + "px";
                node.style.maskSize = sizeCSS;
                (node.style as any).webkitMaskSize = sizeCSS;
            }
        }

        // all the transform stuff
        node.style.transformOrigin = (op.pivot.x * 100) + "% " + (op.pivot.y * 100) + "%";

        const transforms = []
        if(op.rot != 0) 
        { 
            transforms.push("rotate(" + op.rot + "rad)"); 
        }

        if(op.posResult.length() > 0) 
        { 
            transforms.push("translate(" + op.posResult.x + ", " + op.posResult.y + ")");
        }

        const scale = op.scaleResult;
        if(scale.x != 1 || scale.y != 1)
        {
            transforms.push("scale(" + scale.x + ", " + scale.y + ")");
        }

        if(op.skew.x != 0 || op.skew.y != 0)
        {
            transforms.push("skew(" + op.skew.x + "rad, " + op.skew.y + "rad)");
        }

        if(transforms.length > 0)
        {
            node.style.transform = (node.style.transform ?? "") + " " + transforms.join(" ");
        }

        // all the filter stuff to make special things happen
        const effOp = new EffectsOperation(op.effects);
        effOp.applyToHTML(node);

        node.style.filter = effOp.getFilterString();

        return node;
    }
}
