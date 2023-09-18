import Point from "./point";
import Dims from "./dims";
import { ElementLike } from "js/pq_games/layout/resources/resource";

export default class Shape
{
    toPath() : Point[] { return []; }
    toSVG() : ElementLike { return null; }
    getDimensions() : Dims { return new Dims(); }
    clone() : Shape { return new Shape(); }
    toPath2D() : Path2D { return new Path2D(); }
    toPathString() : string { return ""; }
    toCSSPath() : string { return 'path("' + this.toPathString() + '")'; }
}