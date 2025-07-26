import isApprox from "../numbers/isApprox";
import Dims from "./dims";
import Line from "./line";
import Path from "./paths/path";
import Point from "./point"
import Shape from "./shape";

interface TriangleParams
{
    points?:Point[],
    pointyDir?:number,
    center?:Point,
    radius?:number|Point,
    angles?:number[],
    base?:number,

}

// @TODO: Actually make helper functionality work (such as setting from angles, anything else?)
// @TODO: and whenever we update through one method, also set the right values for the other methods / center it
export { Triangle, TriangleParams }
export default class Triangle extends Shape
{
    points: Point[]
    pointyDir: number
    center: Point
    radius: Point
    angles: number[]

    constructor(t:TriangleParams = {}) 
    {
        super()
        
        this.points = t.points ?? [];

        this.pointyDir = t.pointyDir ?? 0;
        this.center = t.center ?? new Point();
        this.radius = new Point(t.radius ?? 0.5);
        this.angles = t.angles ?? new Array(3).fill((2/3)*Math.PI);

        if(t.center && t.radius) { this.fromCenterAndRadius(this.center, this.radius); }
        if(t.angles && t.radius) { this.fromAnglesAndRadius(this.angles, this.radius); }
    }

    fromCenterAndRadius(c:Point, r:Point)
    {
        const arr = [];
        let angle = this.pointyDir;
        const angleOffset = (2 * Math.PI) / 3;
        for(let i = 0; i < 3; i++)
        {
            const ang = angle + i*angleOffset;
            const point = new Point().fromAngle(ang).scale(r).add(c);
            arr.push(point);
        }

        this.points = arr;
    }

    fromAnglesAndRadius(a:number[], r:Point)
    {
        let sum = 0;
        for(const angle of a)
        {
            sum += angle;
        }
        const aTriangle = isApprox(sum, Math.PI);
        if(!aTriangle) { return; }

        const p1 = new Point();
        const p2 = new Point().fromAngle(a[0]).scale(r.x);
        const p3 = p2.clone().add(new Point().fromAngle(a[1])).scale(r.x);

        this.points = [p1, p2, p3];
    }

    clone(deep = false)
    {
        let p = this.points;
        if(deep)
        {
            p = [];
            for(const point of this.points)
            {
                p.push(point.clone());
            }
        }

        return new Triangle({ points: p });
    }

    getDimensions()
    {
        return new Dims().fromPoints(this.toPath());
    }

    createPixiObject(graphicsConstructor)
    {
        return new graphicsConstructor({}).poly(this.points, false);
    }

    toPath()
    {
        return this.points.slice();
    }

    toPath2D() 
    {
        const p = new Path2D();
        p.moveTo(this.points[0].x, this.points[0].y);
        p.lineTo(this.points[1].x, this.points[1].y);
        p.lineTo(this.points[2].x, this.points[2].y);
        return p;
    }

    toPathString()
    {
        return new Path({ points: this.toPath() }).toPathString();
    }

    toSVG()
    {
        return new Path({ points: this.toPath() }).toSVG();
    }
}