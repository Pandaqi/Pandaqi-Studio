import Rectangle from "js/pq_games/tools/geometry/rectangle";
import drawShape from "./drawShape";

export default async (ctx:CanvasRenderingContext2D, shapeParams, layoutParams) =>
{
    await drawShape(ctx, new Rectangle(shapeParams), layoutParams);
}