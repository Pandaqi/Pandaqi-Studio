import createContext from "js/pq_games/layout/canvas/createContext";
import fillResourceGroup from "js/pq_games/layout/canvas/fillResourceGroup";
import TintEffect from "js/pq_games/layout/effects/tintEffect";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import ResourceText from "js/pq_games/layout/resources/resourceText";
import TextConfig from "js/pq_games/layout/text/textConfig";
import StrokeAlign from "js/pq_games/layout/values/strokeAlign";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import getRectangleCornersWithOffset from "js/pq_games/tools/geometry/paths/getRectangleCornersWithOffset";
import Point from "js/pq_games/tools/geometry/point";
import rangeInteger from "js/pq_games/tools/random/rangeInteger";
import { CardType, TERRAINS, TileType } from "./dictShared";
import MaterialNaivigation from "./materialNaivigation";
import Color from "js/pq_games/layout/color/color";
import DropShadowEffect from "js/pq_games/layout/effects/dropShadowEffect";
import ResourceShape from "js/pq_games/layout/resources/resourceShape";
import Path from "js/pq_games/tools/geometry/paths/path";
import vehicleDrawerNaivigation from "./vehicleDrawerNaivigation";

const drawTerrain = (vis, group, tile) =>
{
    // main background color
    const tempData = tile.getTemplateData();
    const gameData = tile.getGameData();
    let bgColor = gameData ? gameData.bgColor : tempData.bgColor;
    bgColor = vis.inkFriendly ? "#FFFFFF" : bgColor;
    fillResourceGroup(vis.size, group, bgColor);

    // terrain image
    const res = vis.getResource("terrains");
    const frame = TERRAINS[tile.customData.terrain].frame;
    const resOp = new LayoutOperation({
        frame: frame,
        translate: new Point(),
        dims: vis.size
    });
    group.add(res, resOp);
}

const drawTile = (vis, group, tile) =>
{
    // the main illustration of the tile
    const typeData = tile.getData();
    const tempData = tile.getTemplateData();
    let resSprite = vis.getResource("icons");
    if(typeData && typeData.shared) { resSprite = vis.getResource("icons_shared"); }

    const spriteFrame = tempData.frameIcon ?? typeData.frame;
    const spriteOp = new LayoutOperation({
        translate: vis.center,
        dims: vis.get("tiles.general.illustration.mainDims"),
        frame: spriteFrame,
        pivot: Point.CENTER
    });

    // allow custom draws (in fact, we'll need that a lot)
    let resIllu = resSprite;
    if(tile.getCustomIllustration) {
        const resTemp = tile.getCustomIllustration(vis, tile, spriteOp);
        if(resTemp) { resIllu = resTemp; spriteOp.frame = 0; }
    }

    group.add(resIllu, spriteOp);
}

const drawElevation = (vis, group, tile) =>
{
    const elevation = tile.customData.elevation ?? TERRAINS[tile.customData.terrain].elevation;
    if(elevation <= 0) { return; }

    const size = vis.get("tiles.general.elevation.triangleSideLength");
    const points = 
    [
        new Point(),
        new Point(size, 0),
        new Point(0, size)
    ];

    const triangle = new ResourceShape(new Path(points));
    const triangleOp = new LayoutOperation({
        fill: vis.get("tiles.general.elevation.fill"),
        stroke: vis.get("tiles.general.elevation.stroke"),
        strokeWidth: vis.get("tiles.general.elevation.strokeWidth"),
    });

    const offset = vis.get("tiles.general.elevation.triangleEdgeOffset");
    const positions = getRectangleCornersWithOffset(vis.size, offset);

    // @NOTE: this abuses the fact that the triangle's right corner is at (0,0)
    // so we can rotate it to get all the possible corners if we want
    for(let i = 0; i < elevation; i++)
    {
        const tempOp = triangleOp.clone();
        tempOp.translate = positions[i];
        tempOp.rotation = i * 0.5 * Math.PI;
        group.add(triangle, tempOp);
    }
}

// The default Tile Drawer that can just be plugged into most games
export default (vis:MaterialVisualizer, tile:MaterialNaivigation) =>
{
    if(tile.type == TileType.VEHICLE) { return vehicleDrawerNaivigation(vis, tile); }

    const ctx = createContext({ size: vis.size });
    const group = new ResourceGroup();

    drawTerrain(vis, group, tile);
    drawTile(vis, group, tile);
    drawElevation(vis, group, tile);

    // @TODO: add the original game icon of a tile on it? This feels unnecessary, as tiles can be freely swapped out. But their frequency is still important per game ... (e.g. the Singing Sails should not have waaay too much/little water)

    group.toCanvas(ctx);
    return ctx.canvas;
}