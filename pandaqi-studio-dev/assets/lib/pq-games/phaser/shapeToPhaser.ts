import LayoutOperation from "../layout/layoutOperation";
import Circle from "../tools/geometry/circle";
import Line from "../tools/geometry/line";
import Rectangle from "../tools/geometry/rectangle";
import Shape from "../tools/geometry/shape";
// @ts-ignore
import { Geom } from "js/pq_games/phaser/phaser.esm";
import { layoutOperationToGraphics } from "./layoutOperationToPhaser";
import RectangleRounded from "../tools/geometry/rectangleRounded";

const lineToPhaser = (line:Line, op:LayoutOperation, graphics = null) =>
{
    const linePhaser = new Geom.Line(line.start.x, line.start.y, line.end.x, line.end.y);
    layoutOperationToGraphics(graphics, op);
    graphics.strokeLineShape(linePhaser);
    return linePhaser;
}

const circleToPhaser = (circ:Circle, op:LayoutOperation, graphics = null) =>
{
    const circPhaser = new Geom.Circle(circ.center.x, circ.center.y, circ.radius);
    layoutOperationToGraphics(graphics, op);
    if(op.hasFill()) { graphics.fillCircleShape(circPhaser); }
    if(op.hasStroke()) { graphics.strokeCircleShape(circPhaser); }
    return circPhaser;
}

const rectToPhaser = (rect:Rectangle, op:LayoutOperation, graphics = null) =>
{
    const pos = rect.getTopLeft();
    const rectPhaser = new Geom.Rectangle(pos.x, pos.y, rect.extents.x, rect.extents.y);
    layoutOperationToGraphics(graphics, op);
    if(op.hasFill()) { graphics.fillRectShape(rectPhaser); }
    if(op.hasStroke()) { graphics.strokeRectShape(rectPhaser); }
    return rectPhaser;
}

const pathToPhaser = (shape:Shape, op:LayoutOperation, graphics = null) =>
{
    const poly = new Geom.Polygon(shape.toPath());
    layoutOperationToGraphics(graphics, op);
    if(op.hasFill()) { graphics.fillPoints(poly.points); }
    if(op.hasStroke()) { graphics.strokePoints(poly.points); }
    return poly;
}

const shapeToPhaser = (shape:Shape, op:LayoutOperation, graphics = null) =>
{   
    if(shape instanceof Rectangle && !(shape instanceof RectangleRounded)) { return rectToPhaser(shape, op, graphics); }
    else if(shape instanceof Circle) { return circleToPhaser(shape, op, graphics); }
    else if(shape instanceof Line) { return lineToPhaser(shape, op, graphics); }
    return pathToPhaser(shape, op, graphics);
}

export { lineToPhaser, circleToPhaser, rectToPhaser, pathToPhaser, shapeToPhaser };
export default shapeToPhaser;