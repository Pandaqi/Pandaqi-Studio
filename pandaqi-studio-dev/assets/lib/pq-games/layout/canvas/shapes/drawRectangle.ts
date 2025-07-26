import Rectangle from "js/pq_games/tools/geometry/rectangle";
import drawShape from "./drawShape";

export default (ctx:CanvasRenderingContext2D, shapeParams, layoutParams) =>
{
    drawShape(ctx, new Rectangle(shapeParams), layoutParams);
}