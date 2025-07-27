import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import MaterialEaster from "./materialEaster";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import fillResourceGroup from "js/pq_games/layout/canvas/fillResourceGroup";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import { MISC_SHARED } from "./dictShared";
import Point from "js/pq_games/tools/geometry/point";

export default (tile:MaterialEaster, vis:MaterialVisualizer, group:ResourceGroup) =>
{
    const typeData = tile.getTypeData();
    const data = tile.getData();

    // flat color
    let bgColor = data.color ?? typeData.color;
    bgColor = vis.inkFriendly ? "#FFFFFF" : bgColor;
    fillResourceGroup(vis.size, group, bgColor); 

    // pattern / texture
    const res = vis.getResource(typeData.backgroundKey);
    let frame = data.frame ?? 0;
    let alpha = vis.inkFriendly ? 0.15 : 1.0;
    if(typeData.backgroundRandom) 
    { 
        frame = typeData.backgroundRandom.randomInteger(); 
        alpha = vis.inkFriendly ? 0.15 : vis.get("tiles.bg.randomPatternAlpha"); 
    }

    const op = new LayoutOperation({
        size: vis.size,
        frame: frame,
        alpha: alpha,
        effects: vis.inkFriendlyEffect,
    })
    group.add(res, op);

    if(vis.inkFriendly) { return; }

    // gradient
    const resMisc = vis.getResource("misc");
    const opGrad = new LayoutOperation({
        size: vis.size,
        frame: MISC_SHARED.gradient.frame,
        alpha: vis.get("tiles.bg.gradientAlpha")
    });
    group.add(resMisc, opGrad);

    // light rays
    const opRays = new LayoutOperation({
        pos: vis.center,
        size: vis.size,
        frame: MISC_SHARED.lightrays.frame,
        pivot: Point.CENTER,
        alpha: vis.get("tiles.bg.lightraysAlpha"),
        composite: vis.get("tiles.bg.lightraysComposite")
    })
    group.add(resMisc, opRays);
}