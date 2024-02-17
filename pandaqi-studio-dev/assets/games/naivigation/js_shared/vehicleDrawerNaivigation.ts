import createContext from "js/pq_games/layout/canvas/createContext";
import fillResourceGroup from "js/pq_games/layout/canvas/fillResourceGroup";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import Point from "js/pq_games/tools/geometry/point";
import MaterialNaivigation from "./materialNaivigation";

const drawHelpers = (vis, group, tile) =>
{
    // main background color
    fillResourceGroup(vis.size, group, "#FFFFFF");

    // @TODO: I want some simple arrow or compass or whatever to help know what side of the vehicle is up
}

const drawVehicle = (vis, group, tile) =>
{
    // the main illustration of the tile
    const typeData = tile.getData();
    //const tempData = tile.getTemplateData();
    const res = vis.getResource("map_tiles");
    const frame = typeData.frame + tile.customData.num;
    const op = new LayoutOperation({
        translate: vis.center,
        frame: frame,
        dims: vis.get("tiles.general.vehicle.dims"),
        pivot: Point.CENTER
    });
    group.add(res, op);
}

// The default Tile Drawer that can just be plugged into most games
export default (vis:MaterialVisualizer, card:MaterialNaivigation) =>
{
    const ctx = createContext({ size: vis.size });
    const group = new ResourceGroup();

    drawHelpers(vis, group, card);
    drawVehicle(vis, group, card);

    group.toCanvas(ctx);
    return ctx.canvas;
}