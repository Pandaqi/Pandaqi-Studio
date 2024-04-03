import Point from "js/pq_games/tools/geometry/point"
import LayoutEffect from "./effects/layoutEffect"
import ResourceImage, { CanvasDrawableLike, CanvasLike } from "js/pq_games/layout/resources/resourceImage"
import Resource, { ElementLike } from "./resources/resource"
import ResourceShape from "./resources/resourceShape"
import ResourceText from "./resources/resourceText"
import Shape from "../tools/geometry/shape"
import Dims from "../tools/geometry/dims"
import isZero from "../tools/numbers/isZero"
import ResourceBox from "./resources/resourceBox"
import ColorLike, { ColorLikeValue } from "./color/colorLike"
import createContext from "./canvas/createContext"
import StrokeAlign from "./values/strokeAlign"
import calculateBoundingBox from "../tools/geometry/paths/calculateBoundingBox"
import ResourceGroup from "./resources/resourceGroup"
import Rectangle from "../tools/geometry/rectangle"
import rotatePath from "../tools/geometry/transform/rotatePath"
import movePath from "../tools/geometry/transform/movePath"
import TransformationMatrix from "./tools/transformationMatrix"
import EffectsOperation from "./effects/effectsOperation"

type ResourceLike = ResourceImage|ResourceShape|ResourceText|ResourceBox|ResourceGroup

interface LayoutOperationParams
{
    fill?:string|ColorLikeValue,
    stroke?:string|ColorLikeValue,
    strokeWidth?:number,
    strokeType?:string,
    strokeAlign?:StrokeAlign,

    translate?: Point,
    rotation?:number,
    scale?:Point,
    skew?:Point,
    depth?:number

    alpha?:number,
    composite?:GlobalCompositeOperation,

    dims?:Point,
    ratio?:Point,
    keepRatio?: boolean,
    size?:Point,

    pivot?:Point,
    flipX?:boolean,
    flipY?:boolean,

    clip?:Shape,
    mask?:ResourceImage,

    resource?:ResourceLike,
    effects?:LayoutEffect[],

    frame?:number,
    transformParent?: TransformationMatrix,
    keepTransform?: boolean
}

export { LayoutOperation, ResourceLike }
export default class LayoutOperation
{
    translate : Point
    rotation : number
    scale : Point
    skew : Point
    depth : number

    alpha : number
    composite : GlobalCompositeOperation

    dims : Point
    ratio : Point
    keepRatio : boolean
    pivot : Point
    flipX : boolean
    flipY : boolean

    clip: Shape
    mask: ResourceImage

    resource : ResourceLike
    effects : LayoutEffect[]
    
    frame: number // frame of image (spritesheets)
    transformParent: TransformationMatrix
    keepTransform: boolean

    fill: ColorLike
    stroke: ColorLike
    strokeWidth: number
    strokeAlign: StrokeAlign
    strokeType: string

    constructor(params:LayoutOperationParams = {})
    {
        this.translate = params.translate ?? new Point();
        this.rotation = params.rotation ?? 0;
        this.dims = (params.dims ?? params.size) ?? new Point();
        this.ratio = params.ratio ?? new Point(1,1);
        this.keepRatio = params.keepRatio ?? false;
        this.scale = params.scale ?? new Point(1,1);
        this.skew = params.skew ?? new Point();
        this.depth = params.depth ?? 0.0; // @TODO: currently only used by generated boards in Phaser; might allow re-ordering stuff within my system later, then this will actually be used
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
        this.strokeAlign = params.strokeAlign ?? StrokeAlign.MIDDLE;

        this.transformParent = params.transformParent ?? null;
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

    // @TODO: this (probably) all works, but PERFORMANCE is becoming a real issue here.
    getBoundingBox() : Dims
    {
        if(!this.resource) { return new Dims(); }
        
        const isGroup = this.resource instanceof ResourceGroup;
        if(!isGroup) { return this.getBoundingBoxRaw(); }

        const dims = new Dims();
        const layoutCombos = (this.resource as ResourceGroup).combos;
        for(const elem of layoutCombos)
        {
            dims.takeIntoAccount(elem.getBoundingBox());
        }
        return dims;
    }

    getBoundingBoxRaw()
    {
        const [translate, dims] = this.getFinalDimensions(true);
        const dimsScaled = dims.scale(this.scale);
        const rect = new Rectangle().fromTopLeft(new Point(), dimsScaled);
        const pivotOffset = this.pivot.clone().scale(dimsScaled).negate();
        rect.move(pivotOffset);
        rect.grow(this.scale.clone().scale(this.strokeWidth));

        let extraSize = new Point();
        for(const effect of this.effects)
        {
            const effectExtra = effect.getExtraSizeAdded();
            extraSize.x = Math.max(extraSize.x, effectExtra.x);
            extraSize.y = Math.max(extraSize.y, effectExtra.y);
        }
        rect.grow(extraSize);

        const path = movePath( rotatePath(rect, this.rotation, new Point()), translate);
        const dimsObject = new Dims();
        for(const point of path)
        {
            dimsObject.takePointIntoAccount(point);
        }
        return dimsObject;
    }

    getFinalScale() : Point
    {
        const scale = this.scale.clone();
        if(this.flipX) { scale.x *= -1; }
        if(this.flipY) { scale.y *= -1; }
        return scale;
    }

    getFinalDimensions(moveToOrigin = false)
    {
        let dims = this.dims.clone();
        let translate = this.translate.clone();
        if(this.isShape())
        {
            const dimsObject = calculateBoundingBox((this.resource as ResourceShape).shape.toPath())
            dims = dimsObject.size;
            if(moveToOrigin) { translate.move(dimsObject.topLeft); }
        }

        if(this.keepRatio && this.isImage())
        {
            // @TODO: does ratio make sense for any other resource type than image?
            const ratio = this.resource instanceof ResourceImage ? this.resource.getRatio() : (this.ratio.x / this.ratio.y);

            const givenAxis = dims.y <= 0 ? "y" : "x";
            const calcAxis = givenAxis == "x" ? "y" : "x";
            dims[calcAxis] = (givenAxis == "x") ? dims[givenAxis] / ratio : dims[givenAxis] * ratio;
        }

        translate.round();
        dims.round();

        return [translate, dims];
    }

    getTransformationMatrix()
    {
        const [translate, dims] = this.getFinalDimensions();
        const finalScale = this.getFinalScale();

        const trans = this.transformParent ? this.transformParent : new TransformationMatrix();
        trans.translate(translate); 
        trans.rotate(this.rotation);
        trans.scale(finalScale);

        const offset = this.pivot.clone().negate().scale(dims);
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
        let ctx = (canv instanceof HTMLCanvasElement) ? canv.getContext("2d") : canv;
        if(!ctx) { ctx = createContext({ size: this.dims }); } // @TODO: how to control this size better?
        
        // @TODO: OPTIMIZATION => don't create the temporary canvas if we don't need it
        // (Though that is rare; would only apply to stuff with only a transform + fill/stroke and nothing else)

        // we create a temporary canvas to do everything we want
        // once done, at the end, we stamp that onto the real one (with the right effects, alpha, etcetera set)
        const ctxTemp = createContext({ size: new Point(ctx.canvas.width, ctx.canvas.height) });
        const [translate, dims] = this.getFinalDimensions();

        // we make sure we're drawing at the right position right away
        // (which includes bubbling up the tree to take our parent's transform into account)
        const trans = this.getTransformationMatrix();
        trans.applyToContext(ctxTemp);

        // some effects merely require setting something on the canvas
        const effOp = new EffectsOperation(this.effects);
        effOp.applyToCanvasPre(ctx);

        ctxTemp.fillStyle = this.fill.toCanvasStyle(ctxTemp);
        ctxTemp.strokeStyle = this.stroke.toCanvasStyle(ctxTemp);

        let lineWidth = Math.round(this.strokeWidth);
        if(this.strokeAlign != StrokeAlign.MIDDLE) { lineWidth *= 2; }
        ctxTemp.lineWidth = lineWidth;

        if(this.isGroup())
        {
            const combos = (this.resource as ResourceGroup).combos;
            for(const combo of combos)
            {
                combo.toCanvas(ctxTemp, trans.clone());
            }
        }

        else if(this.isShape())
        {
            // @TODO: if I find an easy/clean way to move this path to the ORIGIN,
            // I can remove the exception "moveToOrigin" for getFinalDimensions
            // (It's ugly now that positional data is locked inside the shape to be drawn)
            let path = (this.resource as ResourceShape).shape.toPath2D();
            this.applyFillAndStrokeToPath(ctxTemp, path);
        }

        // @TODO: not sure if text is positioned correctly/not cut-off now with the ctxTemp switch?
        else if(this.isText())
        {
            const drawer = (this.resource as ResourceText).createTextDrawer(dims);
            drawer.toCanvas(ctxTemp, this);
        }

        else if(this.isImage())
        { 
            // apply the effects that require an actual image to manipulate
            let frameResource:CanvasDrawableLike = (this.resource as ResourceImage).getImageFrameAsDrawable(this.frame, dims.clone());
            frameResource = effOp.applyToDrawable(frameResource);

            const box = new Dims(new Point(), dims.clone());
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

        const ctxFinal = effOp.applyToCanvasPost(ctxTemp);

        // SAVE/RESTORE is extremely expensive and error prone (if you forget one even once),
        // so limit it to only when really needed
        const needsStateManagement = this.clip;
        if(needsStateManagement) { ctx.save(); }

        // @NOTE: this is necessary if we're subgroups in a tree, as then the context given to us will have some transform from the parent
        // The keepTransform flag is for special exceptions such as TextDrawer that blend images + text
        // (Maybe I need to find something cleaner for that one day)
        if(!this.keepTransform) 
        {
            ctx.resetTransform();
        }

        ctx.filter = effOp.getFilterString();
        ctx.globalCompositeOperation = this.composite;
        ctx.globalAlpha = this.alpha;
        if(this.clip) { ctx.clip(this.clip.toPath2D()); }

        // @TODO: this is entirely untested and needs to be worked on
        // (also preferably put into its own function + executed BEFORE making changes to ctx?)
        if(this.mask)
        {
            const maskData = this.mask.getFrameData();
            ctx.drawImage(
                this.mask.getImage(),
                0, 0, maskData.width, maskData.height,
                0, 0, dims.x, dims.y)
            ctx.globalCompositeOperation = "source-in";
        }

        ctx.drawImage(ctxFinal.canvas, 0, 0);

        if(needsStateManagement) { ctx.restore(); }
        return ctx.canvas;
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
        const effOp = new EffectsOperation(this.effects);
        effOp.applyToHTML(node);

        node.style.filter = effOp.getFilterString();

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

    setPivotCenter() { this.pivot = Point.CENTER; return this; }
    setPivotTopLeft() { this.pivot = Point.ZERO; return this; }
    setPivotBottomRight() { this.pivot = Point.ONE; return this; }

    setFrame(f:number) { this.frame = f; return this; }
    hasDepth() { return !isZero(this.depth); }
}