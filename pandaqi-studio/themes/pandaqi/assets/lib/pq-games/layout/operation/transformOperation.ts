import { Vector2 } from "../../geometry/vector2";
import { isZero } from "../../tools/numbers/checks";
import { TransformationMatrix } from "../tools/transformationMatrix";
import type { LayoutOperationParams } from "./types";

// Everything that decides *where* an operation ends up: position, rotation, scale, skew, size,
// pivot and flips. Kept apart from LayoutOperation so the drawing/style state and the transform
// state can evolve (and be created) independently. The public operation properties are accessors
// that forward to this object, so the API stays exactly the same.
export class TransformOperation
{
    pos: Vector2
    rot: number
    scale: Vector2
    skew: Vector2
    depth: number

    size: Vector2
    sizeAuto: boolean // fits the resource within the `size` given, maintaining original aspect ratio
    pivot: Vector2
    pivotExplicit: boolean // false if the default (centre) pivot was used, which is what the V1->V2 migration flipped
    flipX: boolean
    flipY: boolean

    // Results of the last calculation. They are reused on every apply: an operation is calculated for
    // every item of every page, and allocating three vectors plus a matrix each time was pure garbage.
    posResult: Vector2
    scaleResult: Vector2
    sizeResult: Vector2
    pivotOffset: Vector2
    transformResult: TransformationMatrix

    constructor(params:LayoutOperationParams = {})
    {
        this.pos = (params.pos ?? params.position) ?? new Vector2();
        if(!(this.pos instanceof Vector2)) { console.error(`Invalid position ${this.pos} set in LayoutOperation`, params); this.pos = new Vector2(); }

        this.rot = (params.rot ?? params.rotation) ?? 0;
        if(typeof this.rot != "number") { console.error(`Invalid rotation ${this.rot} set in LayoutOperation`, params); this.rot = 0; }

        this.sizeAuto = params.sizeAuto ?? false;
        this.size = params.size ?? new Vector2();
        if(!(this.size instanceof Vector2)) { console.error(`Invalid size ${this.size} set in LayoutOperation`, params); this.size = new Vector2(); }

        this.scale = params.scale ?? new Vector2(1,1);
        if(!(this.scale instanceof Vector2)) { console.error(`Invalid scale ${this.scale} set in LayoutOperation`, params); this.scale = new Vector2(1,1); }

        this.pivotExplicit = params.pivot != null;
        this.pivot = params.pivot ?? Vector2.CENTER;
        if(!(this.pivot instanceof Vector2)) { console.error(`Invalid pivot ${this.pivot} set in LayoutOperation`, params); this.pivot = Vector2.CENTER; }

        this.skew = params.skew ?? new Vector2();
        if(!(this.skew instanceof Vector2)) { console.error(`Invalid skew/shear ${this.skew} set in LayoutOperation`, params); this.skew = new Vector2(); }

        this.depth = params.depth ?? 0.0;
        this.flipX = params.flipX ?? false;
        this.flipY = params.flipY ?? false;

        // invalid values are reported above and replaced immediately, so these are always vectors
        this.posResult = this.pos.clone();
        this.scaleResult = this.scale.clone();
        this.sizeResult = this.size.clone();
        this.pivotOffset = new Vector2();
        this.transformResult = new TransformationMatrix();
    }

    hasDepth() { return !isZero(this.depth); }

    // Resets the working copies to the current settings. Resource-specific sizing (shape ratio, text
    // metrics, ...) is applied on top of these by LayoutOperation.calculateResultProperties().
    resetResults()
    {
        // direct field writes: `Vector2.set()` goes through the number/object dispatch and measured
        // several times slower in this hot path than copying six numbers
        const pos = this.pos;
        const size = this.size;
        const scale = this.scale;

        this.posResult.x = pos.x;
        this.posResult.y = pos.y;
        this.sizeResult.x = size.x;
        this.sizeResult.y = size.y;
        this.scaleResult.x = this.flipX ? -scale.x : scale.x;
        this.scaleResult.y = this.flipY ? -scale.y : scale.y;
    }

    // The offset that moves the resource so that `pivot` lands on `pos`.
    // Shapes are the exception: their path is already positioned in its own space, so the default
    // (centre) pivot must not move them.
    calculatePivotOffset(isShape:boolean)
    {
        let pivotX = this.pivot.x;
        let pivotY = this.pivot.y;
        if(isShape) { pivotX -= 0.5; pivotY -= 0.5; }
        if(this.flipX) { pivotX = 1.0 - pivotX; }
        if(this.flipY) { pivotY = 1.0 - pivotY; }

        this.pivotOffset.x = -pivotX * this.sizeResult.x;
        this.pivotOffset.y = -pivotY * this.sizeResult.y;
        return this.pivotOffset;
    }

    // Where this operation's own local (0,0) lands inside its parent, without walking the parent
    // chain. Renderers that already place an object inside a transformed container (Pixi) need the
    // local point, not the absolute one.
    getLocalOrigin(target:Vector2 = new Vector2())
    {
        const ox = this.pivotOffset.x * this.scaleResult.x;
        const oy = this.pivotOffset.y * this.scaleResult.y;
        const cos = Math.cos(this.rot);
        const sin = Math.sin(this.rot);
        target.x = this.posResult.x + ox * cos - oy * sin;
        target.y = this.posResult.y + ox * sin + oy * cos;
        return target;
    }

    calculateMatrix(parentTransform:TransformationMatrix = null, target:TransformationMatrix = null)
    {
        const trans = target ?? this.transformResult;
        if(parentTransform) { trans.copyFrom(parentTransform); }
        else { trans.setIdentity(); }

        trans.translate(this.posResult);
        trans.rotate(this.rot);
        trans.scale(this.scaleResult);
        if(this.pivotOffset.x !== 0 || this.pivotOffset.y !== 0) { trans.translate(this.pivotOffset); }
        trans.skew(this.skew);
        return trans;
    }

    clone(deep = false) : TransformOperation
    {
        const trans = new TransformOperation();

        // A shallow clone keeps sharing the setting vectors (the historical behaviour); a deep one
        // gets its own copies. The calculated results are always separate objects, because they are
        // rewritten in place on every apply.
        trans.pos = deep ? this.pos.clone() : this.pos;
        trans.rot = this.rot;
        trans.scale = deep ? this.scale.clone() : this.scale;
        trans.skew = deep ? this.skew.clone() : this.skew;
        trans.depth = this.depth;

        trans.size = deep ? this.size.clone() : this.size;
        trans.sizeAuto = this.sizeAuto;
        trans.pivot = deep ? this.pivot.clone() : this.pivot;
        trans.pivotExplicit = this.pivotExplicit;
        trans.flipX = this.flipX;
        trans.flipY = this.flipY;

        trans.copyResultsFrom(this);
        return trans;
    }

    copyResultsFrom(other:TransformOperation)
    {
        // copy into the results this instance already has; replacing them would allocate a second
        // set of vectors/matrix on every clone for no reason
        this.posResult.x = other.posResult.x;
        this.posResult.y = other.posResult.y;
        this.scaleResult.x = other.scaleResult.x;
        this.scaleResult.y = other.scaleResult.y;
        this.sizeResult.x = other.sizeResult.x;
        this.sizeResult.y = other.sizeResult.y;
        this.pivotOffset.x = other.pivotOffset.x;
        this.pivotOffset.y = other.pivotOffset.y;
        this.transformResult.copyFrom(other.transformResult);
        return this;
    }
}
