import { Vector2 } from "../geometry/vector2"
import { CanvasLike, ResourceImage } from "./resources/resourceImage"
import { ColorLike, ColorLikeValue } from "./color/colorLike"
import { LayoutEffect } from "./effects/layoutEffect"
import { Resource } from "./resources/resource"
import { ResourceGroup } from "./resources/resourceGroup"
import { ResourceShape } from "./resources/resourceShape"
import { ResourceText } from "./resources/resourceText"
import { TextBoxMetrics } from "./text/metrics"
import { TransformationMatrix } from "./tools/transformationMatrix"

import { createRenderer } from "../renderers/createRenderer"
import type { Renderer } from "../renderers/renderer"
import { Color } from "./color/color"
import { StrokeAlign, StrokeType } from "./values"
import { Path } from "../geometry/path"
import { reportDefaultPivot } from "../tools/debug/warnings"
import { isLayoutOperationDebugEnabled, reportLayoutOperation } from "./operation/operationDebug"
import { LayoutOperationBuilder } from "./operation/layoutOperationBuilder"
import { applyResourceSizing } from "./operation/sizing"
import { StyleOperation } from "./operation/styleOperation"
import { TransformOperation } from "./operation/transformOperation"
import type { LayoutOperationParams, MaskData, ResourceLike } from "./operation/types"

export type { LayoutOperationParams, MaskData, ResourceLike } from "./operation/types";

// One transparent style object for operations that never touch fill/stroke/tint. Reading `op.fill`
// used to give every operation its own ColorLike even when it was never painted.
const TRANSPARENT_FILL = new ColorLike(null);
const TRANSPARENT_STROKE = new ColorLike(null);
const TRANSPARENT_TINT = Color.TRANSPARENT;

// A default renderer is stateless; every `new LayoutOperation()` used to allocate its own.
// Operations feed the document pipeline, so the shared default is the canvas renderer.
let sharedDefaultRenderer: Renderer = null;
const getSharedDefaultRenderer = () => { return sharedDefaultRenderer ??= createRenderer({ force: "canvas" }); }


/**
 * One drawable operation: where something goes (transform), how it looks (style), and which
 * resource it draws. The heavy lifting lives in `layout/operation/*`:
 *
 * - `TransformOperation`: pos/rot/scale/skew/size/pivot/flip + the result matrix
 * - `StyleOperation`: fill/stroke/alpha/composite/tint + fill-and-stroke drawing
 * - `applyResourceSizing`: shape/image/text-specific size rules
 * - `operationDebug`: `_debug.layoutOperation` logging and visual overlays
 * - `LayoutOperationBuilder`: the fluent `pos().rot().pivot()` alternative constructor
 *
 * The public properties and methods are unchanged; they are accessors that forward to whichever
 * sub-state an operation actually uses, so untouched state is never allocated.
 */
export class LayoutOperation
{
    debug = false

    posResult : Vector2 // set dynamically on every apply
    scaleResult : Vector2 // set dynamically on every apply
    sizeResult : Vector2 // set dynamically on every apply
    pivotOffset : Vector2 // final calculated offset because of pivot
    transformResult: TransformationMatrix // set dynamically on every apply

    clip: Path
    clipRelative : boolean
    mask: MaskData

    resource : ResourceLike

    frame: number // frame of image (spritesheets)
    parentOperation: LayoutOperation
    inline: boolean // if true, all changes to the context/canvas are temporary as this operation places something "inline" (in the midst of) another operation

    textMetrics: TextBoxMetrics

    private _transform: TransformOperation
    private _style: StyleOperation
    private _effects: LayoutEffect[]
    private _renderer: Renderer

    constructor(params:LayoutOperationParams = {})
    {
        this.debug = params.debug ?? false;

        // Only create the sub-state the caller actually uses. `new LayoutOperation()` (which happens
        // for every group child and every default parameter) stays tiny. Direct checks, not an
        // array-of-keys helper: this runs for every operation of every page.
        if(params.pos !== undefined || params.position !== undefined || params.rot !== undefined || params.rotation !== undefined || params.size !== undefined || params.sizeAuto !== undefined || params.scale !== undefined || params.skew !== undefined || params.depth !== undefined || params.pivot !== undefined || params.flipX !== undefined || params.flipY !== undefined)
        {
            this._transform = new TransformOperation(params);
        }

        if(params.fill !== undefined || params.stroke !== undefined || params.strokeWidth !== undefined || params.strokeType !== undefined || params.strokeAlign !== undefined || params.alpha !== undefined || params.composite !== undefined || params.tint !== undefined)
        {
            this._style = new StyleOperation(params);
        }

        this.clip = params.clip ?? null;
        this.clipRelative = params.clipRelative ?? false;
        this.mask = params.mask ?? null;

        this.frame = params.frame ?? 0;
        if(typeof this.frame != "number") { console.error(`Invalid frame ${this.frame} set in LayoutOperation`, this); this.frame = 0; }

        this.inline = params.inline ?? false;

        this.parentOperation = params.parentOperation ?? null;
        this.resource = params.resource ?? null;
        this._renderer = params.renderer ?? null;

        if(params.effects != null)
        {
            this.effects = params.effects;
            const badEffectsInput = this.effects.filter((x) => !(x instanceof LayoutEffect));
            if(badEffectsInput.length > 0) { console.error(`Invalid effect(s) set in LayoutOperation`, badEffectsInput, this); }
        }
    }

    /* ---------------------------------------------------------------- */
    /* Transform state (pos/rot/scale/skew/size/pivot/flip/depth)       */
    /* ---------------------------------------------------------------- */

    private get transformState() { return this._transform ??= new TransformOperation(); }

    get pos() : Vector2 { return this.transformState.pos; }
    set pos(v:Vector2) { this.transformState.pos = v; }

    get rot() : number { return this._transform ? this._transform.rot : 0; }
    set rot(v:number) { this.transformState.rot = v; }

    get scale() : Vector2 { return this.transformState.scale; }
    set scale(v:Vector2) { this.transformState.scale = v; }

    get skew() : Vector2 { return this.transformState.skew; }
    set skew(v:Vector2) { this.transformState.skew = v; }

    get depth() : number { return this._transform ? this._transform.depth : 0; }
    set depth(v:number) { this.transformState.depth = v; }

    get size() : Vector2 { return this.transformState.size; }
    set size(v:Vector2) { this.transformState.size = v; }

    get sizeAuto() : boolean { return this._transform ? this._transform.sizeAuto : false; }
    set sizeAuto(v:boolean) { this.transformState.sizeAuto = v; }

    get pivot() : Vector2 { return this.transformState.pivot; }
    set pivot(v:Vector2) { this.transformState.pivot = v; }

    get pivotExplicit() : boolean { return this._transform ? this._transform.pivotExplicit : false; }
    set pivotExplicit(v:boolean) { this.transformState.pivotExplicit = v; }

    get flipX() : boolean { return this._transform ? this._transform.flipX : false; }
    set flipX(v:boolean) { this.transformState.flipX = v; }

    get flipY() : boolean { return this._transform ? this._transform.flipY : false; }
    set flipY(v:boolean) { this.transformState.flipY = v; }

    /* ---------------------------------------------------------------- */
    /* Style state (fill/stroke/alpha/composite/tint)                   */
    /* ---------------------------------------------------------------- */

    private get styleState() { return this._style ??= new StyleOperation(); }

    get fill() : ColorLike { return this._style ? this._style.fill : TRANSPARENT_FILL; }
    set fill(v:ColorLike) { this.styleState.fill = v; }

    get stroke() : ColorLike { return this._style ? this._style.stroke : TRANSPARENT_STROKE; }
    set stroke(v:ColorLike) { this.styleState.stroke = v; }

    get strokeWidth() : number { return this._style ? this._style.strokeWidth : 0; }
    set strokeWidth(v:number) { this.styleState.strokeWidth = v; }

    get strokeAlign() : StrokeAlign { return this._style ? this._style.strokeAlign : StrokeAlign.MIDDLE; }
    set strokeAlign(v:StrokeAlign) { this.styleState.strokeAlign = v; }

    get strokeType() : string { return this._style ? this._style.strokeType : StrokeType.REGULAR; }
    set strokeType(v:string) { this.styleState.strokeType = v; }

    get alpha() : number { return this._style ? this._style.alpha : 1.0; }
    set alpha(v:number) { this.styleState.alpha = v; }

    get composite() : GlobalCompositeOperation { return this._style ? this._style.composite : "source-over"; }
    set composite(v:GlobalCompositeOperation) { this.styleState.composite = v; }

    get tint() : Color { return this._style ? this._style.tint : TRANSPARENT_TINT; }
    set tint(v:Color) { this.styleState.tint = v; }

    /* ---------------------------------------------------------------- */
    /* Effects                                                          */
    /* ---------------------------------------------------------------- */

    get effects() : LayoutEffect[] { return this._effects ??= []; }
    set effects(v:LayoutEffect[]) { this._effects = v; }
    hasEffects() { return this._effects != null && this._effects.length > 0; }

    /* ---------------------------------------------------------------- */
    /* Renderer                                                         */
    /* ---------------------------------------------------------------- */

    get renderer() : Renderer { return this._renderer ?? this.parentOperation?.renderer ?? getSharedDefaultRenderer(); }
    set renderer(v:Renderer) { this._renderer = v; }

    /* ---------------------------------------------------------------- */
    /* Calculation                                                      */
    /* ---------------------------------------------------------------- */

    clone(deep = false)
    {
        const op = new LayoutOperation();
        op.debug = this.debug;

        if(this._transform)
        {
            op._transform = this._transform.clone(deep);
            // results are rewritten in place on every apply, so a clone must never share them
            op.posResult = op._transform.posResult;
            op.scaleResult = op._transform.scaleResult;
            op.sizeResult = op._transform.sizeResult;
            op.pivotOffset = op._transform.pivotOffset;
            op.transformResult = op._transform.transformResult;
        }
        if(this._style) { op._style = this._style.clone(); }
        if(this._effects) { op._effects = deep ? this._effects.map((e) => e.clone()) : this._effects; }

        op.clip = this.clip;
        op.clipRelative = this.clipRelative;
        op.mask = this.mask;
        op.resource = (deep && this.resource instanceof Resource) ? this.resource.clone() : this.resource;
        op.frame = this.frame;
        op.textMetrics = this.textMetrics;
        op.parentOperation = this.parentOperation;
        op.inline = this.inline;
        op._renderer = this._renderer;

        // preserve any ad-hoc property a game attached to an operation (the old clone did this by
        // copying every enumerable property)
        for(const prop in this)
        {
            if(prop in op) { continue; }
            // @ts-ignore
            let val = this[prop];
            const clonable = (val instanceof Vector2) || (val instanceof Resource);
            // @ts-ignore
            if(deep && clonable) { val = val.clone(); }
            // @ts-ignore
            op[prop] = val;
        }
        return op;
    }

    addEffect(fx:LayoutEffect) { this.effects.push(fx); return this; }
    removeEffect(fx:LayoutEffect)
    {
        const idx = this.effects.indexOf(fx);
        if(idx < 0) { return this; }
        this.effects.splice(idx, 1);
        return this;
    }

    calculateResultProperties()
    {
        const t = this.transformState;
        t.resetResults();

        const isText = this.isText();
        const textMetrics = applyResourceSizing(
            this.resource,
            t.sizeResult,
            t.scaleResult,
            t.sizeAuto,
            this.isShape(),
            this.isImage(),
            isText
        );
        if(isText) { this.textMetrics = textMetrics; }

        t.posResult.round();
        t.sizeResult.round();

        this.posResult = t.posResult;
        this.sizeResult = t.sizeResult;
        this.scaleResult = t.scaleResult;
        this.calculateTransformationMatrix();

        if(isLayoutOperationDebugEnabled(this)) { reportLayoutOperation(this); }
    }

    calculateTransformationMatrix()
    {
        // shapes are exempt: they are centred regardless of the pivot (see below)
        if(!this.pivotExplicit && !this.isShape()) { reportDefaultPivot(this); }

        const t = this.transformState;
        t.calculatePivotOffset(this.isShape());
        this.transformResult = t.calculateMatrix(this.parentOperation?.transformResult ?? null);
        this.pivotOffset = t.pivotOffset;
        return this.transformResult;
    }

    // Where the operation's local (0,0) sits inside its parent. Used by renderers that place objects
    // inside transformed containers (Pixi) and therefore need parent-local coordinates.
    getLocalOrigin(target:Vector2 = new Vector2()) { return this.transformState.getLocalOrigin(target); }

    // The operation's own transform, without its parent's. Used by renderers that already sit in the
    // parent's coordinate space (Pixi) when they need to draw debug overlays.
    calculateLocalTransformationMatrix()
    {
        const t = this.transformState;
        t.calculatePivotOffset(this.isShape());
        return t.calculateMatrix(null, new TransformationMatrix());
    }

    isDebugEnabled() { return isLayoutOperationDebugEnabled(this); }

    /* ---------------------------------------------------------------- */
    /* Resource type helpers                                            */
    /* ---------------------------------------------------------------- */

    isGroup() { return this.resource instanceof ResourceGroup; }
    isImage() { return this.resource instanceof ResourceImage; }
    isText() { return this.resource instanceof ResourceText; }
    isShape() { return this.resource instanceof ResourceShape; }

    /* ---------------------------------------------------------------- */
    /* Applying                                                         */
    /* ---------------------------------------------------------------- */

    applyToCanvas(canv:CanvasLike = null) : HTMLCanvasElement
    {
        this.calculateResultProperties();
        return this.renderer.applyOperationToCanvas(this, canv);
    }

    async applyToHTML(node:HTMLElement, res:Resource = null)
    {
        this.calculateResultProperties();
        return this.renderer.applyOperationToHTML(this, node, res);
    }

    async applyToPixi(app, parent)
    {
        this.calculateResultProperties();
        return this.renderer.applyOperationToPixi(this, app, parent);
    }

    /* ---------------------------------------------------------------- */
    /* Style helpers                                                    */
    /* ---------------------------------------------------------------- */

    hasFill() { return this._style ? this._style.hasFill() : false; }
    hasStroke() { return this._style ? this._style.hasStroke() : false; }

    /* Handy functions to quickly get operations I usually want */
    setFill(c:string|ColorLikeValue) { this.styleState.setFill(c); return this; }
    setStroke(s:string|ColorLikeValue) { this.styleState.setStroke(s); return this; }
    setFillAndStroke(c:string|ColorLikeValue, s:string|ColorLikeValue) { this.styleState.setFillAndStroke(c, s); return this; }
    setOuterStroke(s:string|ColorLikeValue, w:number) { this.styleState.setOuterStroke(s, w); return this; }

    setFillAndStrokeOnContext(ctx:CanvasRenderingContext2D)
    {
        if(!this._style)
        {
            ctx.fillStyle = TRANSPARENT_FILL.toCanvasStyle(ctx);
            ctx.strokeStyle = TRANSPARENT_STROKE.toCanvasStyle(ctx);
            ctx.lineWidth = 0;
            if(typeof (ctx as any).setLineDash == "function") { ctx.setLineDash([]); }
            return;
        }
        this._style.setOnContext(ctx);
    }

    applyFillAndStrokeToPath(ctx:CanvasRenderingContext2D, path:Path2D, callback:Function = null)
    {
        if(!this._style)
        {
            if(callback) { callback(); }
            return;
        }
        this._style.applyToPath(ctx, path, callback);
    }

    setPivotCenter() { this.pivot = Vector2.CENTER; return this; }
    setPivotTopLeft() { this.pivot = Vector2.ZERO; return this; }
    setPivotBottomRight() { this.pivot = Vector2.ONE; return this; }

    setFrame(f:number) { this.frame = f; return this; }
    hasDepth() { return this._transform ? this._transform.hasDepth() : false; }
    hasMask() { return this.mask && this.mask.resource; }
    hasClip() { return this.clip != null; }

    hasTint() { return this._style ? this._style.hasTint() : false; }
    getTint() { return this._style ? this._style.getTint() : 0xFFFFFF; }

    /* ---------------------------------------------------------------- */
    /* Alternative constructor                                          */
    /* ---------------------------------------------------------------- */

    static builder(params:LayoutOperationParams = {}) { return new LayoutOperationBuilder(params); }
}
