import Point from "js/pq_games/tools/geometry/point"
import LayoutEffect from "./effects/layoutEffect"
import ResourceImage, { CanvasLike } from "js/pq_games/layout/resources/resourceImage"
import Path from "../tools/geometry/paths/path"
import Resource, { ElementLike } from "./resources/resource"
import ResourceShape from "./resources/resourceShape"
import ResourceGradient from "./resources/resourceGradient"
import ResourcePattern from "./resources/resourcePattern"
import ResourceText from "./resources/resourceText"
import Shape from "../tools/geometry/shape"
import Color from "./color/color"
import Dims from "../tools/geometry/dims"

type ResourceLike = ResourceImage|ResourceShape|ResourceGradient|ResourcePattern|ResourceText

interface EffectData
{
    filters?: string[]
}

interface LayoutOperationParams
{
    fill?:string|Color,
    stroke?:string|Color,
    strokeWidth?:number,

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

    resource?:ResourceLike,
    effects?:LayoutEffect[],

    frame?:number
}

export { LayoutOperation, EffectData }
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

    resource : ResourceLike
    effects : LayoutEffect[]
    
    frame: number // frame of image (spritesheets)

    fill: Color
    stroke: Color
    strokeWidth: number

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

        this.fill = new Color(params.fill);
        this.stroke = new Color(params.stroke);
        this.strokeWidth = params.strokeWidth ?? 0;
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
        // @TODO: how to control this size better?
        if(!canv) { 
            canv = document.createElement("canvas");
            canv.width = this.dims.x;
            canv.height = this.dims.y;
        }

        const ctx = (canv instanceof HTMLCanvasElement) ? canv.getContext("2d") : canv;
        ctx.save();

        ctx.globalCompositeOperation = this.composite;
        ctx.globalAlpha = this.alpha;

        if(this.clip)
        {
            ctx.clip(this.clip.toPath2D());
        }

        ctx.translate(this.translate.x, this.translate.y);
        ctx.rotate(this.rotation);

        const finalScale = this.getFinalScale();
        ctx.scale(finalScale.x, finalScale.y);

        const offset = this.pivot.clone();
        offset.scaleFactor(-1).scale(this.dims);

        // mask should come before anything else happens (right?)
        if(this.mask)
        {
            const maskData = this.mask.getFrameData();
            ctx.drawImage(
                this.mask.getImage(),
                0, 0, maskData.width, maskData.height,
                offset.x, offset.y, this.dims.x, this.dims.y)
            ctx.globalCompositeOperation = "source-in";
        }

        // some effects merely require setting something on the canvas
        const effectData : EffectData = { filters: [] };
        for(const effect of this.effects)
        {
            effect.applyToCanvas(ctx, effectData);
        }

        ctx.filter = effectData.filters.join(" ");

        ctx.fillStyle = this.fill.toString();
        ctx.strokeStyle = this.stroke.toString();
        ctx.lineWidth = this.strokeWidth;
 
        const res = this.resource;
        const drawShape = res instanceof ResourceShape;
        const drawText = res instanceof ResourceText;

        let image : ResourceImage = null;
        if(res instanceof ResourceImage) { image = res; }
        else if(res instanceof ResourceGradient) { image = await new ResourceImage().fromGradient(res); }
        else if(res instanceof ResourcePattern) { image = await new ResourceImage().fromPattern(res); }

        if(drawShape)
        {
            const path = res.shape.toPath2D();
            ctx.fill(path);
            ctx.stroke(path);
        }

        if(drawText)
        {
            const drawer = res.createTextDrawer(this.dims);
            drawer.toCanvas(ctx);
        }

        const drawImage = image instanceof ResourceImage;
        if(drawImage)
        { 
            let frameResource = image.getImageFrameAsResource(this.frame);

            // apply the effects that require an actual image to manipulate
            for(const effect of this.effects)
            {
                frameResource = await effect.applyToImage(frameResource, effectData);
            }

            const box = new Dims(offset.clone(), this.dims.clone());
            const boxPath = box.toPath2D();
            
            ctx.fillStyle = this.fill.toString();
            ctx.fill(boxPath);

            ctx.drawImage(
                frameResource.getImage(), 
                box.position.x, box.position.y, box.size.x, box.size.y
            );

            ctx.stroke(boxPath);
        }

        ctx.restore();
        return ctx.canvas;
    }

    async applyToHTML(node:ElementLike)
    {
        // misc basic properties
        node.style.opacity = this.alpha.toString();
        node.style.backgroundColor = this.fill.toString();

        if(this.strokeWidth > 0) { node.style.borderStyle = "solid"; }
        node.style.borderWidth = this.strokeWidth + "px";
        node.style.borderColor = this.stroke.toString();

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
            transforms.push("rotate(" + this.rotation + "deg)"); 
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

    // @TODO: write the same thing, but now using SVG's built-in filters and clipping and stuff
    async applyToSVG(elem:ElementLike)
    {
        elem.setAttribute("fill", this.fill.toString());
        elem.setAttribute("stroke", this.stroke.toString());
        elem.setAttribute("stroke-width", this.strokeWidth.toString());
        return elem;
    }
}