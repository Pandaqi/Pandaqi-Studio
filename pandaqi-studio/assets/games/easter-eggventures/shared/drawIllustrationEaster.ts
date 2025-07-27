import DropShadowEffect from "js/pq_games/layout/effects/dropShadowEffect";
import GrayScaleEffect from "js/pq_games/layout/effects/grayScaleEffect";
import LayoutEffect from "js/pq_games/layout/effects/layoutEffect";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import Point from "js/pq_games/tools/geometry/point";
import MaterialEaster from "./materialEaster";

export default (tile:MaterialEaster, vis:MaterialVisualizer, group:ResourceGroup) =>
{
    const typeData = tile.getTypeData();
    const data = tile.getData();
    const res = vis.getResource(typeData.textureKey);
    const frame =  data.frame;

    const glowColor = tile.swapGlowForShadow() ? vis.get("tiles.illu.shadowColor") : vis.get("tiles.illu.glowColor")

    const effects:LayoutEffect[] = [new DropShadowEffect({ 
        blurRadius: vis.get("tiles.illu.glowRadius"), 
        color: vis.get("tiles.illu.glowColor") 
    })]
    if(vis.inkFriendly) { effects.push(new GrayScaleEffect()); }

    let trans = vis.center.clone();
    let size = vis.get("tiles.illu.size");
    if(tile.needsText(vis))
    {
        trans.y -= vis.get("tiles.illu.offsetWhenTextPresent");
        size = vis.get("tiles.illu.sizeWithText");
    }

    let rot = 0;
    if(typeData.rotRandom)
    {
        rot = typeData.rotRandom.random();
    }

    const op = new LayoutOperation({
        pos: trans,
        size: size,
        frame: frame,
        rot: rot,
        pivot: Point.CENTER,
        effects: effects,
    })
    group.add(res, op);
}