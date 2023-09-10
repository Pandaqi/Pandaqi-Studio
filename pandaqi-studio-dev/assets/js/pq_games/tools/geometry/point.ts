interface PointDict 
{
    x: number,
    y: number
}
type PointLike = Point|PointDict

export { Point, PointLike }
export default class Point 
{
    x:number
    y:number

    constructor(a:number|PointLike = 0, b:number = 0)
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

    clone() { return new Point(this); }
    isValid() { return !isNaN(this.x) && !isNaN(this.y); }
    hasValue() { return this.isValid() && (this.x != 0 || this.y != 0); }

    // setting/overriding
    setX(v = 0) { this.x = v; return this; }
    setY(v = 0) { this.y = v; return this; }
    fromXY(x = 0, y = 0) { return this.setXY(x,y); }
    setXY(x = 0, y = 0) { return this.set({ x: x, y: y }); }
    setFactor(f = 0) { return this.setXY(f,f); }
    set(p:PointLike = new Point())
    {
        this.setX(p.x);
        this.setY(p.y);
        return this;
    }

    // changing/moving
    moveX(v = 0) { return this.setX(this.x + v); }
    moveY(v = 0) { return this.setY(this.y + v); }
    moveXY(x = 0, y = 0) { return this.move({ x: x, y: y }); }
    moveFactor(f = 0) { return this.moveXY(f,f); }
    add(p:PointLike = new Point()) { return this.move(p); }
    sub(p = new Point()) { return this.add(p.clone().scaleFactor(-1)); }
    move(p:PointLike = new Point())
    {
        this.moveX(p.x);
        this.moveY(p.y);
        return this;
    }

    // scaling
    scaleX(v = 0) { return this.setX(v * this.x); }
    scaleY(v = 0) { return this.setY(v * this.y); }
    scaleXY(x = 1, y = 1) { return this.scale({ x: x, y: y }); }
    scaleFactor(f = 1) { return this.scaleXY(f,f); }
    scale(p:PointLike = new Point())
    {
        this.scaleX(p.x);
        this.scaleY(p.y);
        return this;
    }

    // dimensions
    angle() { return Math.atan2(this.y, this.x); }
    negate() { return this.scaleFactor(-1); }
    normalize() 
    { 
        const l = this.length();
        if(Math.abs(l) <= 0.0001) { return this; }
        return this.scaleFactor(1.0 / l); 
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
    
    dot(p = new Point())
    {
        return this.x * p.x + this.y * p.y;
    }


}