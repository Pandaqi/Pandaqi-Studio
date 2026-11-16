import { roundPath } from "../paths/corners"
import { Vector2 } from "../vector2"
import { Rectangle } from "./rectangle"

export interface RectangleRoundedParams
{
    center?:Vector2
    extents?:Vector2
    radius?:number,
}

export class RectangleRounded extends Rectangle
{
    radius:number

    constructor(r:RectangleRoundedParams = {})
    {
        super(r);
        this.radius = r.radius ?? 1.0;
    }

    clone(deep = false)
    {
        const c = deep ? this.center.clone() : this.center;
        const e = deep ? this.extents.clone() : this.extents;
        return new RectangleRounded({ center: c, extents: e, radius: this.radius });
    }

    createPixiObject(graphicsConstructor)
    {
        const tl = this.getTopLeft();
        const size = this.getSize();
        return new graphicsConstructor({}).roundRect(tl.x, tl.y, size.x, size.y, this.radius);
    }

    toPathArray()
    {
        return roundPath(super.toPathArray(), this.radius, true);
    }

    // Path2D.roundRect() only exists in Safari/iOS 16.4+. On older Apple devices the call throws
    // "p.roundRect is not a function" and takes the whole generation down. Build the same rounded
    // rectangle from primitives that every canvas implementation has supported for years.
    toPath2D() 
    {
        const p = new Path2D();
        const dims = this.getDimensions();
        const x = dims.position.x;
        const y = dims.position.y;
        const w = dims.size.x;
        const h = dims.size.y;
        const r = Math.max(0, Math.min(this.radius, Math.min(w, h) * 0.5));

        if(r <= 0) { p.rect(x, y, w, h); return p; }

        p.moveTo(x + r, y);
        p.lineTo(x + w - r, y);
        p.arcTo(x + w, y, x + w, y + r, r);
        p.lineTo(x + w, y + h - r);
        p.arcTo(x + w, y + h, x + w - r, y + h, r);
        p.lineTo(x + r, y + h);
        p.arcTo(x, y + h, x, y + h - r, r);
        p.lineTo(x, y + r);
        p.arcTo(x, y, x + r, y, r);
        p.closePath();
        return p;
    }
}