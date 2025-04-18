import fillResourceGroup from "js/pq_games/layout/canvas/fillResourceGroup";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import Point from "js/pq_games/tools/geometry/point";
import { MISC } from "./dict";
import MaterialNaivigation from "./materialNaivigation";
import pawnDrawerNaivigation from "./pawnDrawerNaivigation";
import ResourceShape from "js/pq_games/layout/resources/resourceShape";
import Rectangle from "js/pq_games/tools/geometry/rectangle";

const drawHelpers = (vis:MaterialVisualizer, group:ResourceGroup, tile:MaterialNaivigation) =>
{
    // main background color (scaled down because the actual pawn is about half the size of full tile)
    const rect = new ResourceShape(new Rectangle({ center: vis.center, extents: vis.size.clone().scale(0.6) }));
    const rectOp = new LayoutOperation({ fill: "#FFFFFF" });
    group.add(rect, rectOp);

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

const drawVehicle = (vis:MaterialVisualizer, group:ResourceGroup, tile:MaterialNaivigation) =>
{
    // the main vehicle illustration
    const typeData = tile.getData();
    const res = vis.getResource("map_tiles");
    const op = new LayoutOperation({
        pos: vis.center,
        frame: typeData.frame,
        size: vis.get("tiles.general.vehicle.size"),
        pivot: Point.CENTER
    });
    group.add(res, op);
}

const drawPawn = (vis:MaterialVisualizer, group:ResourceGroup, tile:MaterialNaivigation) =>
{
    pawnDrawerNaivigation(vis, group, tile, { addGuides: true });
}

const drawToken = (vis:MaterialVisualizer, group:ResourceGroup, tile:MaterialNaivigation) =>
{
    drawHelpers(vis, group, tile);
    drawVehicle(vis, group, tile);
}

// The default Tile Drawer that can just be plugged into most games
export default (vis:MaterialVisualizer, group:ResourceGroup, tile:MaterialNaivigation) =>
{
    if(vis.get("vehiclesAsPawns")) {
        drawPawn(vis, group, tile);
    } else {
        drawToken(vis, group, tile);
    }
}