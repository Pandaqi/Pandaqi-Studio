import ResourceImage, { CanvasLike } from "js/pq_games/layout/resources/resourceImage"
import Point from "js/pq_games/tools/geometry/point"
import calculateBoundingBox from "../tools/geometry/paths/calculateBoundingBox"
import Shape from "../tools/geometry/shape"
import isZero from "../tools/numbers/isZero"
import ColorLike, { ColorLikeValue } from "./color/colorLike"
import LayoutEffect from "./effects/layoutEffect"
import Resource, { ElementLike } from "./resources/resource"
import ResourceBox from "./resources/resourceBox"
import ResourceGroup from "./resources/resourceGroup"
import ResourceShape from "./resources/resourceShape"
import ResourceText from "./resources/resourceText"
import TextDrawer from "./text/textDrawer"
import TransformationMatrix from "./tools/transformationMatrix"
import StrokeAlign from "./values/strokeAlign"

import Renderer from "./renderers/renderer"
import RendererPandaqi from "./renderers/rendererPandaqi"

type ResourceLike = ResourceImage|ResourceShape|ResourceText|ResourceBox|ResourceGroup

interface LayoutOperationParams
{
    fill?:string|ColorLikeValue,
    stroke?:string|ColorLikeValue,
    strokeWidth?:number,
    strokeType?:string,
    strokeAlign?:StrokeAlign,

    pos?: Point,
    position?: Point,
    rot?:number,
    rotation?:number,
    scale?:Point,
    skew?:Point,
    depth?:number

    alpha?:number,
    composite?:GlobalCompositeOperation,

    size?:Point,
    dims?:Point,
    sizeAuto?: boolean, // automatically extracts dimensions from what it's given; most useful for text (as those dims are varying and unknown)
    ratio?:Point,
    keepRatio?: boolean,

    pivot?:Point,
    flipX?:boolean,
    flipY?:boolean,

    clip?:Shape,
    clipRelative?: boolean,
    mask?:ResourceImage,

    resource?:ResourceLike,
    effects?:LayoutEffect[],

    frame?:number,
    parentOperation?: LayoutOperation,
    renderer?: Renderer,
    keepTransform?: boolean
}

export { LayoutOperation, ResourceLike }
export default class LayoutOperation
{
    pos : Point
    posResult : Point // set dynamically on every apply
    rot : number
    scale : Point
    scaleResult : Point // set dynamically on every apply
    skew : Point
    depth : number

    alpha : number
    composite : GlobalCompositeOperation

    size : Point
    sizeAuto : boolean
    sizeResult : Point // set dynamically on every apply
    ratio : Point
    keepRatio : boolean
    pivot : Point
    pivotOffset : Point // final calculated offset because of pivot
    flipX : boolean
    flipY : boolean

    clip: Shape
    clipRelative : boolean
    mask: ResourceImage

    resource : ResourceLike
    effects : LayoutEffect[]
    
    frame: number // frame of image (spritesheets)
    transformResult: TransformationMatrix // set dynamically on every apply
    parentOperation: LayoutOperation
    renderer: Renderer
    keepTransform: boolean

    fill: ColorLike
    stroke: ColorLike
    strokeWidth: number
    strokeAlign: StrokeAlign
    strokeType: string

    tempTextDrawer:TextDrawer

    constructor(params:LayoutOperationParams = {})
    {
        this.pos = (params.pos ?? params.position) ?? new Point();
        this.rot = (params.rot ?? params.rotation) ?? 0;
        this.size = (params.size ?? params.dims) ?? new Point();
        this.sizeAuto = params.sizeAuto ?? false;
        this.ratio = params.ratio ?? new Point(1,1);
        this.keepRatio = params.keepRatio ?? false;
        this.scale = params.scale ?? new Point(1,1);
        this.skew = params.skew ?? new Point();
        this.depth = params.depth ?? 0.0; // @TODO: not supported by RendererPandaqi
        this.alpha = params.alpha ?? 1.0;

        this.pivot = params.pivot ?? new Point();
        this.flipX = params.flipX ?? false;
        this.flipY = params.flipY ?? false;
        this.frame = params.frame ?? 0;
        this.composite = params.composite ?? "source-over";

        this.clip = params.clip ?? null;
        this.clipRelative = params.clipRelative ?? false;
        this.resource = params.resource ?? null;
        this.mask = params.mask ?? null;
        this.effects = params.effects ?? [];

        this.fill = new ColorLike(params.fill);
        this.stroke = new ColorLike(params.stroke);
        this.strokeWidth = params.strokeWidth ?? 0;
        this.strokeType = params.strokeType ?? "solid";
        this.strokeAlign = params.strokeAlign ?? StrokeAlign.MIDDLE;

        this.parentOperation = params.parentOperation ?? null;
        this.renderer = params.renderer ?? (this.parentOperation ? this.parentOperation.renderer : new RendererPandaqi());
        this.keepTransform = params.keepTransform ?? false;
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

    calculateResultProperties()
    {
        let size = this.size.clone();
        let pos = this.pos.clone();
        let scale = this.scale.clone();

        if(this.flipX) { scale.x *= -1; }
        if(this.flipY) { scale.y *= -1; }
        
        if(this.isShape())
        {
            const dimsObject = calculateBoundingBox((this.resource as ResourceShape).shape.toPath())
            size = dimsObject.size;
            //if(moveToOrigin) { translate.move(dimsObject.topLeft); }
        }

        if(this.keepRatio && this.isImage())
        {
            // @TODO: does ratio make sense for any other resource type than image?
            const ratio = this.resource instanceof ResourceImage ? this.resource.getRatio() : (this.ratio.x / this.ratio.y);

            const givenAxis = size.y <= 0 ? "y" : "x";
            const calcAxis = givenAxis == "x" ? "y" : "x";
            size[calcAxis] = (givenAxis == "x") ? size[givenAxis] / ratio : size[givenAxis] * ratio;
        }

        if(this.isText())
        {
            if(!this.tempTextDrawer)
            {
                this.tempTextDrawer = (this.resource as ResourceText).createTextDrawer(size);
                //this.tempTextDrawer.debug = true; // @DEBUGGING
            }

            if(this.sizeAuto)
            {
                size = this.tempTextDrawer.measureText().getSize().clone();
                size.add(new Point(1,1)); // to prevent silly rounding errors making text boxes JUUUST too small
                this.tempTextDrawer.snapDimsToActualSize();
            }
        }

        pos.round();
        size.round();

        this.posResult = pos;
        this.sizeResult = size;
        this.scaleResult = scale;
        this.transformResult = this.calculateTransformationMatrix();
    }

    calculateTransformationMatrix()
    {
        const trans = this.parentOperation ? this.parentOperation.transformResult.clone() : new TransformationMatrix();
        trans.translate(this.posResult); 
        trans.rotate(this.rot);
        trans.scale(this.scaleResult);

        const pivot = this.pivot.clone();
        if(this.flipX) { pivot.x = 1.0 - pivot.x; }
        if(this.flipY) { pivot.y = 1.0 - pivot.y; }

        const offset = pivot.negate().scale(this.sizeResult);
        this.pivotOffset = offset;
        trans.translate(offset);
        // @TODO: enable once I've checked it works correctly => trans.skew(this.skew);
        return trans;
    }

    isGroup() { return this.resource instanceof ResourceGroup; }
    isImage() { return this.resource instanceof ResourceImage; }
    isText() { return this.resource instanceof ResourceText; }
    isShape() { return this.resource instanceof ResourceShape; }

    applyToCanvas(canv:CanvasLike = null) : HTMLCanvasElement
    {   
        this.calculateResultProperties();
        return this.renderer.applyOperationToCanvas(this, canv);
    }

    async applyToHTML(node:ElementLike, res:Resource = null)
    {
        this.calculateResultProperties();
        return this.renderer.applyOperationToHTML(this, node, res);
    }

    // @TODO: write the same thing as Canvas/HTML, but now using SVG's built-in filters and clipping and stuff
    // => I will probably remove all traces of SVG support in the future, don't bother with this
    async applyToSVG(elem:ElementLike)
    {
        elem.setAttribute("fill", this.fill.toCSS());
        elem.setAttribute("stroke", this.stroke.toCSS());
        elem.setAttribute("stroke-width", this.strokeWidth.toString());
        return elem;
    }

    async applyToPixi(app, parent)
    {
        this.calculateResultProperties();
        return this.renderer.applyOperationToPixi(this, app, parent);
    }

    hasFill() { return !this.fill.isTransparent(); }
    hasStroke() { return !this.stroke.isTransparent() && !isZero(this.strokeWidth); }

    /* Handy functions to quickly get operations I usually want */
    setFill(c:string|ColorLikeValue) { this.fill = new ColorLike(c); return this; }
    setStroke(s:string|ColorLikeValue) { this.stroke = new ColorLike(s); return this; }
    setFillAndStroke(c:string|ColorLikeValue, s:string|ColorLikeValue) { this.setFill(c); this.setStroke(s); return this; }
    setOuterStroke(s:string|ColorLikeValue, w:number)
    {
        this.setStroke(s);
        this.strokeWidth = w;
        this.strokeAlign = StrokeAlign.OUTSIDE;
        return this;
    }

    setFillAndStrokeOnContext(ctx:CanvasRenderingContext2D)
    {
        ctx.fillStyle = this.fill.toCanvasStyle(ctx);
        ctx.strokeStyle = this.stroke.toCanvasStyle(ctx);

        let lineWidth = Math.round(this.strokeWidth);
        if(this.strokeAlign != StrokeAlign.MIDDLE) { lineWidth *= 2; }
        ctx.lineWidth = lineWidth;
    }

    applyFillAndStrokeToPath(ctx:CanvasRenderingContext2D, path:Path2D, callback:Function = null)
    {
        const strokeBeforeFill = this.strokeAlign == StrokeAlign.OUTSIDE;
        const clipStroke = this.strokeAlign == StrokeAlign.INSIDE;

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

    setPivotCenter() { this.pivot = Point.CENTER; return this; }
    setPivotTopLeft() { this.pivot = Point.ZERO; return this; }
    setPivotBottomRight() { this.pivot = Point.ONE; return this; }

    setFrame(f:number) { this.frame = f; return this; }
    hasDepth() { return !isZero(this.depth); }
}