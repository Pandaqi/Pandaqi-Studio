import LayoutOperation from "../layout/layoutOperation";
import Circle from "../tools/geometry/circle";
import Line from "../tools/geometry/line";
import Rectangle from "../tools/geometry/rectangle";
import Shape from "../tools/geometry/shape";
import { layoutOperationToObject } from "./layoutOperationToPhaser";
// @ts-ignore
import { Curves } from "./phaser.esm";

const DEF_FILL_COLOR = 0x000000;
const DEF_FILL_ALPHA = 0;

const lineToPhaserObject = (line:Line, op:LayoutOperation, game) =>
{
    const linePhaser = game.add.line(0, 0, line.start.x, line.start.y, line.end.x, line.end.y, DEF_FILL_COLOR, DEF_FILL_ALPHA);
    layoutOperationToObject(linePhaser, op);
    return linePhaser;
}

const circleToPhaserObject = (circ:Circle, op:LayoutOperation, game) =>
{
    const circPhaser = game.add.circle(circ.center.x, circ.center.y, circ.radius, DEF_FILL_COLOR, DEF_FILL_ALPHA);
    layoutOperationToObject(circPhaser, op);
    return circPhaser;
}

const rectToPhaserObject = (rect:Rectangle, op:LayoutOperation, game) =>
{
    const pos = rect.center;
    const rectPhaser = game.add.rectangle(pos.x, pos.y, rect.extents.x, rect.extents.y, DEF_FILL_COLOR, DEF_FILL_ALPHA);
    layoutOperationToObject(rectPhaser, op);
    return rectPhaser;
}

const pathToPhaserObject = (shape:Shape, op:LayoutOperation, game) =>
{
    const path = shape.toPath();
    const isClosed = path[0].matches(path[path.length - 1]);
    let obj;
    if(isClosed) {
        obj = game.add.polygon(0, 0, path, DEF_FILL_COLOR, DEF_FILL_ALPHA);
    } else {
        // @TODO: this is WRONG at the moment 
        // Phaser does this fucking annoying centering of the curve with no explanation whatsoever
        // I can offset by my calculated center, but that's SLIGHTLY different from Phaser's calculated center! And I don't know how the fuck they calculate that!
        const phaserPath = new Curves.Spline(path);
        obj = game.add.curve(0, 0, phaserPath, DEF_FILL_COLOR, DEF_FILL_ALPHA);
    }

    layoutOperationToObject(obj, op);
    console.log(obj);
    return obj;
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