import Point from "js/pq_games/tools/geometry/point";
import isZero from "js/pq_games/tools/numbers/isZero";

// @SOURCE (basically just shows what HTML5 canvas does behind the scenes): https://github.com/simonsarris/Canvas-tutorials/blob/master/transform.js

// @NOTE: I don't use the DOMMatrix natively, just a simple number array
// because I don't want to rely on that API always staying the same (or not doing funny business)
export default class TransformationMatrix
{
    m: number[];

    constructor()
    {
        this.setIdentity();
    }

    clone()
    {
        return new TransformationMatrix().fromArray(this.m);
    }

    fromArray(a:number[])
    {
        this.m = a.slice();
        return this;
    }

    fromContext(ctx:CanvasRenderingContext2D)
    {
        const t = ctx.getTransform();
        this.m = [t.a, t.b, t.c, t.d, t.e, t.f];
        return this;
    }

    applyToContext(ctx:CanvasRenderingContext2D)
    {
        ctx.setTransform(this.m[0], this.m[1], this.m[2], this.m[3], this.m[4], this.m[5]);
    }

    setIdentity()
    {
        this.m = [1, 0, 0, 1, 0, 0];
        return this;
    }

    setAll(translate:Point, rotate:number, scale:Point)
    {
        this.m = [
            Math.cos(rotate) * scale.x,
            Math.sin(rotate) * scale.x,
            -Math.sin(rotate) * scale.y,
            Math.cos(rotate) * scale.y,
            translate.x,
            translate.y,
        ]
    }

    applyAll(translate:Point, rotate:number, scale:Point)
    {
        this.scale(scale); 
        this.rotate(rotate);
        this.translate(translate);
    }

    // @SOURCE (for all transforms below): https://stackoverflow.com/questions/18437039/canvashow-to-complete-translate-skew-rotate-in-just-one-transform-statement
    translate(p:Point)
    {
        if(p.isZero()) { return this; }
        this.m[4] += this.m[0] * p.x + this.m[2] * p.y;
        this.m[5] += this.m[1] * p.x + this.m[3] * p.y;
        return this;
    }

    rotate(rad:number)
    {
        if(isZero(rad)) { return this; }

        const cos = Math.cos(rad);
        const sin = Math.sin(rad);
        
        const m11 = this.m[0] * cos + this.m[2] * sin;
        const m12 = this.m[1] * cos + this.m[3] * sin;
        const m21 = -this.m[0] * sin + this.m[2] * cos;
        const m22 = -this.m[1] * sin + this.m[3] * cos;
        this.m[0] = m11;
        this.m[1] = m12;
        this.m[2] = m21;
        this.m[3] = m22; 
        return this;
    }

    scale(p:Point)
    {
        if(p.isZero()) { return this; }
        this.m[0] *= p.x;
        this.m[1] *= p.x;
        this.m[2] *= p.y;
        this.m[3] *= p.y;
        return this;
    }

    skew(rads:Point)
    {
        if(rads.isZero()) { return this; }

        const tanX = Math.tan(rads.x);
        const tanY = Math.tan(rads.y);
        
        const m0 = this.m[0]; 
        const m1 = this.m[1];
        
        this.m[0] += tanY * this.m[2]; 
        this.m[1] += tanY * this.m[3]; 
        this.m[2] += tanX * m0; 
        this.m[3] += tanX * m1;

        return this;
    }
}