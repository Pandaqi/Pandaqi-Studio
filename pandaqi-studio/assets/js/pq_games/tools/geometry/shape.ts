import Point from "./point";
import Dims from "./dims";
import Path from "./paths/path";

export default class Shape
{
    toPath() : Point[] { return []; }
    toSVG() : HTMLElement { return null; }
    getDimensions() : Dims { return new Dims(); }
    clone() : Shape { return new Shape(); }
    //toPath2D() : Path2D { return new Path({ points: this.toPath() }).toPath2D(); }
    //toPathString() : string { return new Path({ points: this.toPath() }).toPathString(); }
    //toCSSPath() : string { return "path(" + this.toPathString() + ")"; }
}