import Circle from "js/pq_games/tools/geometry/circle";
import drawShape from "./drawShape";

export default (ctx:CanvasRenderingContext2D, shapeParams, layoutParams) =>
{
    drawShape(ctx, new Circle(shapeParams), layoutParams);
}