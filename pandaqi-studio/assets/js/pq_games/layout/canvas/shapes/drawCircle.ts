import Circle from "js/pq_games/tools/geometry/circle";
import drawShape from "./drawShape";

export default async (ctx:CanvasRenderingContext2D, shapeParams, layoutParams) =>
{
    await drawShape(ctx, new Circle(shapeParams), layoutParams);
}