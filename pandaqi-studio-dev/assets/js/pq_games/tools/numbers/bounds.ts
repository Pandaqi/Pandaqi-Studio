import Point from "../geometry/point";
import range from "../random/range";
import rangeInteger from "../random/rangeInteger";

type BoundsLike = Bounds|{ min: number, max: number }|Point

export { Bounds, BoundsLike }
export default class Bounds
{
    min: number;
    max: number;
    constructor(min:number|BoundsLike, max:number = 0)
    {
        if(min instanceof Point) { max = min.y; min = min.x; }
        else if(typeof min == "object") { max = min.max; min = min.min; }

        this.min = min ?? 0;
        this.max = max ?? 0;
    }

    average() { return 0.5 * (this.min + this.max); }
    interval() { return this.max - this.min; }
    scale(f:number)
    {
        this.scaleMin(f);
        this.scaleMax(f);
    }

    scaleMin(f:number) { this.min *= f; }
    scaleMax(f:number) { this.max *= f; }

    random() { return range(this); }
    randomInteger() {  return rangeInteger(this); }

    swap()
    {
        const temp = this.min;
        this.min = this.max;
        this.max = temp;
    }

    sortAsc()
    {
        if(this.min <= this.max) { return; }
        this.swap();
    }

    sortDesc()
    {
        if(this.min >= this.max) { return; }
        this.swap();
    }
}