import fillResourceGroup from "js/pq_games/layout/canvas/fillResourceGroup";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import Point from "js/pq_games/tools/geometry/point";
import { MISC } from "./dict";
import MaterialNaivigation from "./materialNaivigation";

const drawHelpers = (vis, group, tile) =>
{
    // main background color
    fillResourceGroup(vis.size, group, "#FFFFFF");

    // a guiding sprite behind it to clearly show what's the front and stuff
    const resGuides = vis.getResource("misc_shared");
    const opGuides = new LayoutOperation({
        pos: vis.center,
        frame: MISC.vehicle_guides.frame,
        size: vis.get("tiles.general.vehicle.sizeGuides"),
        pivot: Point.CENTER
    })
    group.add(resGuides, opGuides)

}

const drawVehicle = (vis, group, tile) =>
{
    
    // the main vehicle illustration
    const typeData = tile.getData();
    const res = vis.getResource("map_tiles");
    const frame = typeData.frame + tile.customData.num;
    const op = new LayoutOperation({
        pos: vis.center,
        frame: frame,
        size: vis.get("tiles.general.vehicle.size"),
        pivot: Point.CENTER
    });
    group.add(res, op);
}

// The default Tile Drawer that can just be plugged into most games
export default (vis:MaterialVisualizer, card:MaterialNaivigation) =>
{
    const group = vis.renderer.prepareDraw();
    drawHelpers(vis, group, card);
    drawVehicle(vis, group, card);
    return vis.renderer.finishDraw({ group: group, size: vis.size });
}