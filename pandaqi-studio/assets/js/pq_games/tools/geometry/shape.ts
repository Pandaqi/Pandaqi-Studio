import Point from "./point";
import Dims from "./dims";

export default class Shape
{
    toPath() : Point[] { return []; }
    toSVG() : HTMLElement { return null; }
    getDimensions() : Dims { return new Dims(); }
    clone() : Shape { return new Shape(); }
    toPath2D() : Path2D { return new Path2D(); }
    toPathString() : string { return ""; }
    toCSSPath() : string { return "path(" + this.toPathString() + ")"; }
}