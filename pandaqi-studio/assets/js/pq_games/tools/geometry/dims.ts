import Point from "./point"

export default class Dims
{
    position:Point
    size:Point

    constructor(x:number|Point = 0, y:number|Point = 0, width:number = 0, height:number = 0)
    {
        if(x instanceof Point) {
            this.position = x.clone();
        } else {
            this.position = new Point(x, y as number);
        }

        if(y instanceof Point) {
            this.size = y.clone();
        } else {
            this.size = new Point(width, height);
        }
    }
}