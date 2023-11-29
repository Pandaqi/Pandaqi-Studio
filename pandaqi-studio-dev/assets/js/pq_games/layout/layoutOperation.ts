import Point from "js/pq_games/tools/geometry/point"
import LayoutEffect from "./effects/layoutEffect"
import ResourceImage, { CanvasLike } from "js/pq_games/layout/resources/resourceImage"
import Resource, { ElementLike } from "./resources/resource"
import ResourceShape from "./resources/resourceShape"
import ResourceText from "./resources/resourceText"
import Shape from "../tools/geometry/shape"
import Dims from "../tools/geometry/dims"
import isZero from "../tools/numbers/isZero"
import ResourceBox from "./resources/resourceBox"
import ColorLike, { ColorLikeValue } from "./color/colorLike"
import createContext from "./canvas/createContext"
import StrokeAlignValue from "./values/strokeAlignValue"
import calculateBoundingBox from "../tools/geometry/paths/calculateBoundingBox"
import { LayoutCombo } from "./layoutGroup"

type ResourceLike = ResourceImage|ResourceShape|ResourceText|ResourceBox

interface EffectData
{
    filters?: string[]
}

interface LayoutOperationParams
{
    fill?:string|ColorLikeValue,
    stroke?:string|ColorLikeValue,
    strokeWidth?:number,
    strokeType?:string,
    strokeAlign?:StrokeAlignValue,

    translate?: Point,
    rotation?:number,
    scale?:Point,

    alpha?:number,
    composite?:GlobalCompositeOperation,

    dims?:Point,
    size?:Point,

    pivot?:Point,
    flipX?:boolean,
    flipY?:boolean,

    clip?:Shape,
    mask?:ResourceImage,

    resource?:ResourceLike|LayoutCombo[],
    effects?:LayoutEffect[],

    frame?:number
}

export { LayoutOperation, EffectData, ResourceLike }
export default class LayoutOperation
{
    translate : Point
    rotation : number
    scale : Point

    alpha : number
    composite : GlobalCompositeOperation

    dims : Point
    pivot : Point
    flipX : boolean
    flipY : boolean

    clip: Shape
    mask: ResourceImage

    resource : ResourceLike|LayoutCombo[]
    effects : LayoutEffect[]
    
    frame: number // frame of image (spritesheets)

    fill: ColorLike
    stroke: ColorLike
    strokeWidth: number
    strokeAlign: StrokeAlignValue
    strokeType: string

    constructor(params:LayoutOperationParams = {})
    {
        this.translate = params.translate ?? new Point();
        this.rotation = params.rotation ?? 0;
        this.dims = (params.dims ?? params.size) ?? new Point();
        this.scale = params.scale ?? new Point().setXY(1,1);
        this.alpha = params.alpha ?? 1.0;

        this.pivot = params.pivot ?? new Point();
        this.flipX = params.flipX ?? false;
        this.flipY = params.flipY ?? false;
        this.frame = params.frame ?? 0;
        this.composite = params.composite ?? "source-over";

        this.clip = params.clip ?? null;
        this.resource = params.resource ?? null;
        this.mask = params.mask ?? null;
        this.effects = params.effects ?? [];

        this.fill = new ColorLike(params.fill);
        this.stroke = new ColorLike(params.stroke);
        this.strokeWidth = params.strokeWidth ?? 0;
        this.strokeType = params.strokeType ?? "solid";
        this.strokeAlign = params.strokeAlign ?? StrokeAlignValue.MIDDLE;
    }

    clone(deep = false)
    {
        const op = new LayoutOperation();
        for(const prop in this)
        {
            let val = this[prop];
            const clonable = (val instanceof Point) || (val instanceof Resource)
            // @ts-ignore
            if(deep && clonable) { val = val.clone(); }
            // @ts-ignore
            op[prop] = val;
        }

        let eff = this.effects;
        if(deep)
        {
            eff = [];
            for(const effect of this.effects)
            {
                eff.push(effect.clone());
            }
        }

        return op;
    }

    addEffect(fx:LayoutEffect)
    {
        this.effects.push(fx);
    }

    removeEffect(fx:LayoutEffect)
    {
        this.effects.splice(this.effects.indexOf(fx), 1);
    }

    getFinalScale() : Point
    {
        const scale = this.scale.clone();
        if(this.flipX) { scale.x *= -1; }
        if(this.flipY) { scale.y *= -1; }
        return scale;
    }

    async applyToCanvas(canv:CanvasLike = null) : Promise<HTMLCanvasElement>
    {        
        let ctx = (canv instanceof HTMLCanvasElement) ? canv.getContext("2d") : canv;
        if(!ctx) { ctx = createContext({ size: this.dims }); } // @TODO: how to control this size better?

        ctx.imageSmoothingEnabled = false;
        ctx.imageSmoothingQuality = "low";

        // now we create a temporary canvas, so we can collect fill + stroke + anything we need
        // and THEN apply the right effects/position/postFX to the whole thing as we stamp it onto the real canvas
        const totalSize = new Point(ctx.canvas.width, ctx.canvas.height);
        const ctxTemp = createContext({ size: totalSize });

        ctx.save();

        ctx.globalCompositeOperation = this.composite;
        ctx.globalAlpha = this.alpha;

        if(this.clip)
        {
            ctx.clip(this.clip.toPath2D());
        }

        ctxTemp.translate(this.translate.x, this.translate.y);
        ctxTemp.rotate(this.rotation);

        const finalScale = this.getFinalScale();
        ctxTemp.scale(finalScale.x, finalScale.y);

        // @TODO: perhaps want to move this to AFTER we create the temporary canvas and draw it
        // so we can just calculate the dims used then
        const offset = this.pivot.clone();
        offset.scaleFactor(-1).scale(this.dims);
        ctxTemp.translate(offset.x, offset.y);

        // mask should come before anything else happens (right?)
        if(this.mask)
        {
            const maskData = this.mask.getFrameData();
            ctx.drawImage(
                this.mask.getImage(),
                0, 0, maskData.width, maskData.height,
                0, 0, this.dims.x, this.dims.y)
            ctx.globalCompositeOperation = "source-in";
        }

        // some effects merely require setting something on the canvas
        const effectData : EffectData = { filters: [] };
        for(const effect of this.effects)
        {
            effect.applyToCanvas(ctx, effectData);
        }

        ctx.filter = effectData.filters.join(" ");

        ctxTemp.fillStyle = this.fill.toCanvasStyle(ctxTemp);
        ctxTemp.strokeStyle = this.stroke.toCanvasStyle(ctxTemp);

        let lineWidth = this.strokeWidth;
        if(this.strokeAlign != StrokeAlignValue.MIDDLE) { lineWidth *= 2; }
        ctxTemp.lineWidth = lineWidth;
 
        const res = this.resource;
        const drawGroup = Array.isArray(res);
        const drawShape = res instanceof ResourceShape;
        const drawText = res instanceof ResourceText;

        let image : ResourceImage = null;
        if(res instanceof ResourceImage) { image = res; }
        //else if(res instanceof ResourceGradient) { image = await new ResourceImage().fromGradient(res); }
        //else if(res instanceof ResourcePattern) { image = await new ResourceImage().fromPattern(res); }
        const drawImage = image instanceof ResourceImage;

        if(drawShape)
        {
            const path = res.shape.toPath2D();
            this.applyFillAndStrokeToPath(ctxTemp, path);
        }

        // @TODO: not sure if text is positioned correctly/not cut-off now with the ctxTemp switch?
        if(drawText)
        {
            const drawer = res.createTextDrawer(this.dims);
            drawer.toCanvas(ctxTemp, this);
        }

        if(drawImage)
        { 
            let frameResource = image.getImageFrameAsResource(this.frame);

            // apply the effects that require an actual image to manipulate
            for(const effect of this.effects)
            {
                frameResource = await effect.applyToImage(frameResource, effectData);
            }

            const box = new Dims(new Point(), this.dims.clone());
            const boxPath = box.toPath2D();

            const drawImageCallback = () =>
            {
                ctxTemp.drawImage(
                    frameResource.getImage(), 
                    box.position.x, box.position.y, box.size.x, box.size.y
                );
            }

            this.applyFillAndStrokeToPath(ctxTemp, boxPath, drawImageCallback);
        }

        // @TODO: If it's a group, calculate the bounding box inside
        // Use that to know if we need to _translate_ further (to keep everything on the canvas)
        // Then _undo_ that extra offset when stamping the final canvas onto the real one?

        // @TODO: We need those boundingBox calculations anyway! To automatically set the correct "dims" on groups for pivot
        if(drawGroup)
        {
            const combos = this.resource as LayoutCombo[];
            for(const combo of combos)
            {
                await combo.toCanvas(ctxTemp);
            }
        }

        let ctxFinal = ctxTemp;
        for(const effect of this.effects)
        {
            const result = await effect.applyToCanvasPost(ctxFinal);
            if(!result) { continue; }
            ctxFinal = result;
        }

        // finally, stamp the final canvas onto the real one
        ctx.drawImage(ctxFinal.canvas, 0, 0);

        ctx.restore();
        return ctx.canvas;
    }

    applyFillAndStrokeToPath(ctx:CanvasRenderingContext2D, path:Path2D, callback:Function = null)
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

    async applyToHTML(node:ElementLike, res:Resource = null)
    {
        const textMode = res instanceof ResourceText;
        const svgMode = node instanceof SVGSVGElement;
        if(svgMode) { return node; } // svg is just a wrapper for the specific shape inside; operation is already applied to THAT

        // misc basic properties
        node.style.opacity = this.alpha.toString();
        if(textMode) { node.style.color = this.fill.toCSS(); }
        else { node.style.backgroundColor = this.fill.toCSS(); }

        if(textMode) {
            node.style.stroke = this.stroke.toString();
            node.style.strokeWidth = this.strokeWidth + "px";
        } else {
            if(this.strokeWidth > 0) { node.style.borderStyle = this.strokeType; }
            node.style.borderWidth = this.strokeWidth + "px";
            node.style.borderColor = this.stroke.toCSS();
        }

        // clip and mask
        if(this.clip)
        {
            node.style.clipPath = this.clip.toCSSPath();
        }

        // @TODO: how to handle the other mask properties? A Mask sub-class?
        if(this.mask)
        {
            node.style.maskImage = this.mask.getCSSUrl();
        }

        // all the transform stuff
        const transforms = []
        if(this.rotation != 0) 
        { 
            transforms.push("rotate(" + this.rotation + "rad)"); 
        }

        if(this.translate.length() > 0) 
        { 
            transforms.push("translate(" + this.translate.x + ", " + this.translate.y + ")");
        }

        const scale = this.getFinalScale();
        if(scale.x != 1 || scale.y != 1)
        {
            transforms.push("scale(" + scale.x + ", " + scale.y + ")");
        }

        if(transforms.length > 0)
        {
            node.style.transform += " " + transforms.join(" ");
        }

        // all the filter stuff to make special things happen
        const effectData : EffectData = { filters: [] };
        for(const effect of this.effects)
        {
            effect.applyToHTML(node, effectData);
        }

        node.style.filter = effectData.filters.join(" ");

        return node;
    }

    // @TODO: write the same thing as Canvas/HTML, but now using SVG's built-in filters and clipping and stuff
    async applyToSVG(elem:ElementLike)
    {
        elem.setAttribute("fill", this.fill.toCSS());
        elem.setAttribute("stroke", this.stroke.toCSS());
        elem.setAttribute("stroke-width", this.strokeWidth.toString());
        return elem;
    }

    hasFill() { return !this.fill.isTransparent(); }
    hasStroke() { return !this.stroke.isTransparent() && !isZero(this.strokeWidth); }
}