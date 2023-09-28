import LayoutOperation from "../layout/layoutOperation";
import Circle from "../tools/geometry/circle";
import Line from "../tools/geometry/line";
import Rectangle from "../tools/geometry/rectangle";
import Shape from "../tools/geometry/shape";
import { layoutOperationToObject } from "./layoutOperationToPhaser";

const DEF_FILL_COLOR = 0x000000;

const lineToPhaserObject = (line:Line, op:LayoutOperation, game) =>
{
    const linePhaser = game.add.line(line.start.x, line.start.y, line.end.x, line.end.y, DEF_FILL_COLOR);
    layoutOperationToObject(linePhaser, op);
    return linePhaser;
}

const circleToPhaserObject = (circ:Circle, op:LayoutOperation, game) =>
{
    const circPhaser = game.add.circle(circ.center.x, circ.center.y, circ.radius, DEF_FILL_COLOR);
    layoutOperationToObject(circPhaser, op);
    return circPhaser;
}

const rectToPhaserObject = (rect:Rectangle, op:LayoutOperation, game) =>
{
    const pos = rect.getTopLeft();
    const rectPhaser = game.add.rectangle(pos.x, pos.y, rect.extents.x, rect.extents.y, DEF_FILL_COLOR);
    layoutOperationToObject(rectPhaser, op);
    return rectPhaser;
}

const pathToPhaserObject = (shape:Shape, op:LayoutOperation, game) =>
{
    const poly = game.add.polygon(0, 0, shape.toPath(), DEF_FILL_COLOR);
    layoutOperationToObject(poly, op);
    return poly;
}

const shapeToPhaserObject = (shape:Shape, op:LayoutOperation, game = null) =>
{   
    if(shape instanceof Rectangle) { return rectToPhaserObject(shape, op, game); }
    else if(shape instanceof Circle) { return circleToPhaserObject(shape, op, game); }
    else if(shape instanceof Line) { return lineToPhaserObject(shape, op, game); }
    return pathToPhaserObject(shape, op, game);
}

export { lineToPhaserObject, circleToPhaserObject, rectToPhaserObject, pathToPhaserObject, shapeToPhaserObject };
export default shapeToPhaserObject