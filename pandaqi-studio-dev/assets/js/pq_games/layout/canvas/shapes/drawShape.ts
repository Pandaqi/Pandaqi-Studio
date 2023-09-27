import LayoutOperation from "../../layoutOperation";
import ResourceShape from "../../resources/resourceShape";
import Shape from "js/pq_games/tools/geometry/shape";

// @NOTE: all these are just convenience functions to remove some boilerplate/customization when I don't need it
export default (ctx:CanvasRenderingContext2D, shape:Shape, layoutParams) =>
{
    const res = new ResourceShape({ shape: shape });
    const canvOp = new LayoutOperation(layoutParams);
    res.toCanvas(ctx, canvOp);
}