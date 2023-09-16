import Point from "../point";

interface ArcParams
{
    radius?:Point,
    rotation?:number,
    takeLongerRoute?:boolean, // large-arc-flag
    goClockwise?:boolean // sweep-flag
}

export { ArcData, ArcParams }
export default class ArcData
{
    radius: Point;
    rotation: number;
    takeLongerRoute: boolean;
    goClockwise: boolean;

    constructor(params:ArcParams = {})
    {
        this.radius = params.radius ?? new Point(10);
        this.rotation = params.rotation ?? 0;
        this.takeLongerRoute = params.takeLongerRoute ?? false;
        this.goClockwise = params.goClockwise ?? false;
    }

    getBooleanString(val:boolean)
    {
        return val ? "1" : "0";
    }

    toPathString()
    {
        const arr = [
            this.radius.toSVGString(),
            this.rotation.toString(),
            this.getBooleanString(this.takeLongerRoute),
            this.getBooleanString(this.goClockwise)
        ]
        return arr.join(" "); 
    }
}