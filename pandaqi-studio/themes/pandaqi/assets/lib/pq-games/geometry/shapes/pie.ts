import { Dims } from "../dims";
import { Path } from "../path";
import { Vector2 } from "../vector2";

export interface PieParams
{
    center?:Vector2
    radius?:number
    startAngle?: number
    endAngle?: number
}

export class Pie extends Path
{
    center:Vector2
    radius:number
    startAngle:number
    endAngle:number

    constructor(c:PieParams = {})
    {
        super();
        this.center = c.center ?? new Vector2();
        this.radius = c.radius ?? 0.5;
        this.startAngle = c.startAngle ?? 0;
        this.endAngle = c.endAngle ?? 0.5*Math.PI;
    }

    clone(deep = false)
    {
        const c = deep ? this.center.clone() : this.center;
        return new Pie({ center: c, radius: this.radius, startAngle: this.startAngle, endAngle: this.endAngle });
    }

    getDimensions()
    {
        return new Dims(
            this.center.clone().sub(new Vector2(this.radius)),
            new Vector2(this.radius*2)
        );
    }

    // Center + arc points, so clipping and dashed strokes can walk this shape like any other path.
    toPathArray(resolution = 32)
    {
        const path:Vector2[] = [this.center.clone()];
        for(let i = 0; i <= resolution; i++)
        {
            const angle = this.startAngle + (this.endAngle - this.startAngle) * (i / resolution);
            path.push(new Vector2(
                this.center.x + Math.cos(angle)*this.radius,
                this.center.y + Math.sin(angle)*this.radius
            ));
        }
        return path;
    }

    createPixiObject(graphicsConstructor)
    {
        return new graphicsConstructor({})
            .moveTo(this.center.x, this.center.y)
            .arc(this.center.x, this.center.y, this.radius, this.startAngle, this.endAngle)
            .lineTo(this.center.x, this.center.y);
    }

    toPath2D() 
    {
        const p = new Path2D();
        p.moveTo(this.center.x, this.center.y);
        p.arc(this.center.x, this.center.y, this.radius, this.startAngle, this.endAngle, false);
        p.lineTo(this.center.x, this.center.y);
        return p;
    }
}