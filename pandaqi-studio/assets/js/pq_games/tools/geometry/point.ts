import isZero from "../numbers/isZero";
import lerp from "../numbers/lerp";

interface PointDict 
{
    x: number,
    y: number
}
type PointLike = Point|PointDict;
type PointParamValid = PointLike|number;

export { Point, PointLike, PointParamValid }
export default class Point 
{
    x:number
    y:number

    static LEFT = new Point(-1,0);
    static RIGHT = new Point(1,0);
    static UP = new Point(0,-1);
    static DOWN = new Point(0,1);

    static ZERO = new Point(0,0);
    static CENTER = new Point(0.5, 0.5);
    static ONE = new Point(1,1);

    static TOP_LEFT = new Point(-1,-1);
    static TOP_RIGHT = new Point(1,-1);
    static BOTTOM_RIGHT = new Point(1,1);
    static BOTTOM_LEFT = new Point(-1,1);

    constructor(a:PointParamValid = 0, b:number = null)
    {
        let x = a;
        let y = b;

        if(a instanceof Point) {
            x = a.x;
            y = a.y;
        } else if(typeof a == "object" && ("x" in a && "y" in a)) {
            x = a.x;
            y = a.y;
        }

        this.x = x as number ?? 0;
        this.y = y ?? this.x;
    }

    clone() : Point { return new Point(this); }
    isValid() { return this.isNumber(this.x) && this.isNumber(this.y); }
    hasValue() { return this.isValid() && (this.x != 0 || this.y != 0); }
    isZero() { return isZero(this.length()); }
    isNumber(val:any) { return !isNaN(val); }
    matches(p:Point) { return Math.abs(this.x - p.x) < 0.003 && Math.abs(this.y - p.y) < 0.003; }
    unit() { return this.smallestSide(); } // @NOTE: can be confusing with unitVector meaning a normalized vector?
    largestSide() { return Math.max(this.x, this.y); }
    smallestSide() { return Math.min(this.x, this.y); }

    toSVGString() { return this.x + " " + this.y }

    fromAngle(ang:number)
    {
        this.x = Math.cos(ang);
        this.y = Math.sin(ang);
        return this;
    }

    // setting/overriding
    setX(v = 0) { this.x = v; return this; }
    setY(v = 0) { this.y = v; return this; }
    fromXY(x = 0, y = 0) { return this.setXY(x,y); }
    setXY(x = 0, y = 0) { return this.set({ x: x, y: y }); }
    setFactor(f = 0) { return this.setXY(f,f); }
    set(p:PointParamValid = new Point())
    {
        if(this.isNumber(p)) { return this.setFactor(p as number); }
        p = p as PointLike;
        this.setX(p.x);
        this.setY(p.y);
        return this;
    }

    // changing/moving
    moveX(v = 0) { return this.setX(this.x + v); }
    moveY(v = 0) { return this.setY(this.y + v); }
    moveXY(x = 0, y = 0) { return this.move({ x: x, y: y }); }
    moveFactor(f = 0) { return this.moveXY(f,f); }
    add(p:PointParamValid = new Point()) : Point { return this.move(p); }
    sub(p = new Point()) : Point { return this.add(p.clone().scaleFactor(-1)); }
    move(p:PointParamValid = new Point()) : Point
    {
        if(this.isNumber(p)) { return this.moveFactor(p as number); }
        p = p as PointLike;
        this.moveX(p.x);
        this.moveY(p.y);
        return this;
    }

    // scaling
    scaleX(v = 0) { return this.setX(v * this.x); }
    scaleY(v = 0) { return this.setY(v * this.y); }
    scaleXY(x = 1, y = 1) { return this.scale({ x: x, y: y }); }
    scaleFactor(f = 1) { return this.scaleXY(f,f); }
    mult(f = 1) { return this.scaleFactor(f); }
    div(p:PointParamValid = new Point()) 
    {
        if(typeof p == "object") { return this.scale(new Point(1.0 / p.x, 1.0 / p.y)); }
        return this.scaleFactor(1.0 / p);
    }
    scale(p:PointParamValid = new Point())
    {
        if(this.isNumber(p)) { return this.scaleFactor(p as number); }
        p = p as PointLike;
        this.scaleX(p.x);
        this.scaleY(p.y);
        return this;
    }

    // dimensions
    angle() { return Math.atan2(this.y, this.x); }
    angleTo(p:Point)
    {
        const length = this.length() * p.length();
        const dot = this.dot(p);
        if(isZero(length)) { return 0; }
        return Math.acos(dot / length);
    }

    angleSignedTo(p:Point)
    {
        const sign = Math.sign(this.cross(p));
        return sign * this.angleTo(p);
    }

    negate() { return this.scaleFactor(-1); }
    normalize() : Point
    { 
        const l = this.length();
        if(Math.abs(l) <= 0.0001) { return this; }
        return this.scaleFactor(1.0 / l); 
    }
    ortho()
    {
        const temp = this.x;
        this.x = -this.y;
        this.y = temp;
        return this;
    }

    rotate(rot:number)
    {
        let norm = this.length();
        let ang = this.angle();
        ang += rot;
        this.x = Math.cos(ang) * norm;
        this.y = Math.sin(ang) * norm;
        return this;
    }

    abs()
    {
        this.x = Math.abs(this.x);
        this.y = Math.abs(this.y);
        return this;
    }

    round()
    {
        this.x = Math.round(this.x);
        this.y = Math.round(this.y);
        return this;
    }

    floor()
    {
        this.x = Math.floor(this.x);
        this.y = Math.floor(this.y);
        return this;
    }

    ceil()
    {
        this.x = Math.ceil(this.x);
        this.y = Math.ceil(this.y);
        return this;
    }

    random()
    {
        const angle = Math.random() * 2 * Math.PI;
        return new Point().setXY(Math.cos(angle), Math.sin(angle));
    }

    clamp(pMin = new Point(), pMax = new Point())
    {
        this.setX(Math.min(Math.max(this.x, pMin.x), pMax.x));
        this.setY(Math.min(Math.max(this.y, pMin.y), pMax.y));
        return this;
    }

    length() { return Math.sqrt(this.lengthSquared()); }
    lengthSquared() 
    { 
        return Math.pow(this.x, 2) + Math.pow(this.y, 2);
    }

    distTo(p = new Point()) { return Math.sqrt(this.distSquaredTo(p)); }
    distSquaredTo(p = new Point())
    {
        return Math.pow(this.x - p.x, 2) + Math.pow(this.y - p.y, 2);
    }

    vecTo(p = new Point())
    {
        return new Point().setXY(p.x - this.x, p.y - this.y);
    }
    
    halfwayTo(p:Point)
    {
        return this.clone().add(p).scaleFactor(0.5);
    }

    lerp(p:Point, factor:number)
    {
        return new Point(
            lerp(this.x, p.x, factor),
            lerp(this.y, p.y, factor)
        )
    }
    
    dot(p:Point)
    {
        return this.x * p.x + this.y * p.y;
    }

    cross(p:Point)
    {
        return -this.x * p.y + this.y * p.x;
    }


}