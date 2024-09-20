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
import StrokeAlign from "./values/strokeAlign"
import calculateBoundingBox from "../tools/geometry/paths/calculateBoundingBox"
import ResourceGroup from "./resources/resourceGroup"
import Rectangle from "../tools/geometry/rectangle"
import rotatePath from "../tools/geometry/transform/rotatePath"
import movePath from "../tools/geometry/transform/movePath"
import TransformationMatrix from "./tools/transformationMatrix"
import EffectsOperation from "./effects/effectsOperation"
import TextDrawer from "./text/textDrawer"
import Path from "../tools/geometry/paths/path"

import { Container, Graphics } from "../pixi/pixi.mjs";
import convertCompositeToPixiBlendMode from "../pixi/convertCompositeToPixiBlendMode"

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
    dimsAuto?: boolean, // automatically extracts dimensions from what it's given; most useful for text (as those dims are varying and unknown)
    ratio?:Point,
    keepRatio?: boolean,
    size?:Point,

    pivot?:Point,
    flipX?:boolean,
    flipY?:boolean,

    clip?:Shape,
    clipRelative?: boolean,
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
    dimsAuto : boolean
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
    transformParent: TransformationMatrix
    keepTransform: boolean

    fill: ColorLike
    stroke: ColorLike
    strokeWidth: number
    strokeAlign: StrokeAlign
    strokeType: string

    tempTextDrawer:TextDrawer

    constructor(params:LayoutOperationParams = {})
    {
        this.translate = params.translate ?? new Point();
        this.rotation = params.rotation ?? 0;
        this.dims = (params.dims ?? params.size) ?? new Point();
        this.dimsAuto = params.dimsAuto ?? false;
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
        this.clipRelative = params.clipRelative ?? false;
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

        if(this.isText())
        {
            if(!this.tempTextDrawer)
            {
                this.tempTextDrawer = (this.resource as ResourceText).createTextDrawer(dims);
                //this.tempTextDrawer.debug = true; // @DEBUGGING
            }

            if(this.dimsAuto)
            {
                dims = this.tempTextDrawer.measureText().getSize().clone();
                dims.add(new Point(1,1)); // to prevent silly rounding errors making text boxes JUUUST too small
                this.tempTextDrawer.snapDimsToActualSize();
            }
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

        const pivot = this.pivot.clone();
        if(this.flipX) { pivot.x = 1.0 - pivot.x; }
        if(this.flipY) { pivot.y = 1.0 - pivot.y; }

        const offset = pivot.negate().scale(dims);
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

        else if(this.isText())
        {
            this.tempTextDrawer.toCanvas(ctxTemp, this);
        }

        else if(this.isImage())
        { 
            // apply the effects that require an actual image to manipulate
            let frameResource:ResourceImage = (this.resource as ResourceImage).getImageFrameAsResource(this.frame, dims.clone());
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
        effOp.setShadowProperties(ctx);

        // `clipRelative` means it just retains the original offset/scale/rotation of the thing when calculating clip path (my original, flawed, accidental approach)
        // otherwise, it's `clipAbsolute` which offsets the clip to consider its coordinates as absolute positions
        if(this.clip) 
        { 
            let points = this.clip.toPath();
            
            // get our current transform => then undo pivot to get true top-left => then invert to UNDO that and make our clip path absolute
            if(!this.clipRelative) 
            { 
                const transInv = new TransformationMatrix().fromContext(ctx);
                transInv.translate(this.pivotOffset.clone().negate());
                transInv.invert();
                points = transInv.applyToArray(points); 
            }

            // this necessitates converting any shape to a slightly more expensive path, but it can't be helped
            const path = new Path(points).toPath2D();
            ctx.clip(path); 
        }

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

    async applyToPixi(app, parent)
    {
        // @NOTE: keep this around because it's needed to set the tempTextDrawer initially => I should find a WAY CLEANER system to initialize that if needed + autoDims it
        const [translate, dims] = this.getFinalDimensions();

        // if it's a group, just call all children to do what they want, 
        // then add them back to us in the end
        let obj:any;
        let shouldAddObject = true;
        if(this.resource instanceof ResourceGroup)
        {
            obj = new Container();
            parent.addChild(obj);
            shouldAddObject = false;

            const combos = (this.resource as ResourceGroup).combos;
            for(const combo of combos)
            {
                combo.toPixi(app, obj);
            }
        }

        // create the base object depending on resource
        // (if a group, it creates no extra object and just modifies the container)
        // IMAGES
        if(this.resource instanceof ResourceImage)
        {
            obj = this.resource.getPixiObject(this.frame);
        }

        // SHAPES / GEOMETRY
        if(this.resource instanceof ResourceShape)
        {
            obj = this.resource.getPixiObject(Graphics);

            if(this.hasFill()) 
            { 
                obj.setFillStyle({ color: this.fill.toNumber() });
                obj.fill(); 
            }

            if(this.hasStroke())
            {
                const alignNum = this.strokeAlign == StrokeAlign.INSIDE ? 1.0 : (this.strokeAlign == StrokeAlign.OUTSIDE ? 0.0 : 0.5);
                obj.setStrokeStyle({ color: this.stroke.toNumber(), width: this.strokeWidth, alignment: alignNum });
                obj.stroke();
            }
        }

        // TEXT (draws on-the-fly to an offscreen canvas, then just returns that as a Sprite)
        if(this.resource instanceof ResourceText)
        {
            obj = this.resource.getPixiObject(this);
        }

        if(shouldAddObject)
        {
            parent.addChild(obj);
        }

        this.applyToPixiObjectProperties(obj);
    }

    applyToPixiObjectProperties(obj)
    {
        const [translate, dims] = this.getFinalDimensions();

        //
        // set all the GENERAL PROPERTIES (which should exist on all/most DisplayObjects)
        //
        obj.position.set(translate.x, translate.y);
        obj.rotation = this.rotation;
        obj.zIndex = this.depth; // ??
        
        obj.roundPixels = true;
        obj.tint = 0xFFFFFF; // @TODO: add tint as default option of layoutOperation?
        obj.blendMode = convertCompositeToPixiBlendMode(this.composite);
        obj.alpha = this.alpha;

        if(this.resource instanceof ResourceImage)
        {
            const scale = this.dims.clone().div(this.resource.frameSize);
            obj.scale.set(scale.x, scale.y);
        }

        obj.scale.x *= this.flipX ? -1 : 1;
        obj.scale.y *= this.flipY ? -1 : 1;
        
        // @NOTE: obj.pivot is automatically correct now, as it's in local space, and (0,0) = anchor point
        // in the future, I might want to support rotating around a different point; I'll need to rename stuff and add an extra property then
        if(obj.anchor)
        {
            obj.anchor.set(this.pivot.x, this.pivot.y);
        }

        // obj.skew => wants the skew factor in radians, while I have a POINT?

        //
        // MASKING (either through graphics object or sprite)
        //
        let mask;
        if(this.clip) {
            mask = new Graphics({}).poly(this.clip.toPath(), false);
        } else if(this.mask) {
            mask = this.mask.getPixiObject();
        }

        if(mask)
        {
            obj.mask = mask;
        }

        //
        // apply all EFFECTS
        //
        const effOp = new EffectsOperation();
        for(const effect of this.effects)
        {
            effect.applyToPixi(effOp, obj); // some effects do something directly on object
        }
        obj.filters = effOp.filtersPixi;
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