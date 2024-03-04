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

    const effects:LayoutEffect[] = [new DropShadowEffect({ 
        blurRadius: vis.get("tiles.illu.glowRadius"), 
        color: vis.get("tiles.illu.glowColor") 
    })]
    if(vis.inkFriendly) { effects.push(new GrayScaleEffect()); }

    let trans = vis.center.clone();
    let dims = vis.get("tiles.illu.dims");
    if(tile.needsText())
    {
        trans.y -= vis.get("tiles.illu.offsetWhenTextPresent");
        dims = vis.get("tiles.illu.dimsWithText");
    }

    let rotation = 0;
    if(typeData.rotationRandom)
    {
        rotation = typeData.rotationRandom.random();
    }

    const op = new LayoutOperation({
        translate: trans,
        dims: dims,
        frame: frame,
        rotation: rotation,
        pivot: Point.CENTER,
        effects: effects,
    })
    group.add(res, op);
}