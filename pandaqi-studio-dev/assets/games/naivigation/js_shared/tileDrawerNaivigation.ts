import fillResourceGroup from "js/pq_games/layout/canvas/fillResourceGroup";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import ResourceShape from "js/pq_games/layout/resources/resourceShape";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import getRectangleCornersWithOffset from "js/pq_games/tools/geometry/paths/getRectangleCornersWithOffset";
import Path from "js/pq_games/tools/geometry/paths/path";
import Point from "js/pq_games/tools/geometry/point";
import { MISC_SHARED, TERRAINS, TileType } from "./dictShared";
import MaterialNaivigation from "./materialNaivigation";
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
        pos: new Point(),
        size: vis.size
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
        pos: vis.center,
        size: vis.get("tiles.general.illustration.mainDims"),
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

    // draw collectible icon top center
    const extraIconDims = new Point(vis.get("tiles.general.elevation.triangleSideLength"));
    const topCenterPos = new Point(vis.center.x, 0.66*extraIconDims.y);
    let extraIconFrame = -1;
    if(tile.isCollectible()) { extraIconFrame = MISC_SHARED.collectible_icon.frame; }
    else if(tile.isStartingTile()) { extraIconFrame = MISC_SHARED.starting_icon.frame; }

    const needsExtraIcon = extraIconFrame != -1;
    if(needsExtraIcon)
    {
        const resIcon = vis.getResource("misc_shared");
        const iconOp = new LayoutOperation({
            pos: topCenterPos,
            frame: extraIconFrame,
            size: extraIconDims,
            pivot: Point.CENTER
        })
        group.add(resIcon, iconOp);
    }
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
        tempOp.pos = positions[i];
        tempOp.rot = i * 0.5 * Math.PI;
        group.add(triangle, tempOp);
    }
}

// The default Tile Drawer that can just be plugged into most games
export default (vis:MaterialVisualizer, tile:MaterialNaivigation) =>
{
    if(tile.type == TileType.VEHICLE) { return vehicleDrawerNaivigation(vis, tile); }

    const group = vis.renderer.prepareDraw();

    drawTerrain(vis, group, tile);
    drawTile(vis, group, tile);
    drawElevation(vis, group, tile);

    // @TODO: add the original game icon of a tile on it? This feels unnecessary, as tiles can be freely swapped out. But their frequency is still important per game ... (e.g. the Singing Sails should not have waaay too much/little water)

    return vis.renderer.finishDraw({ group: group, size: vis.size });
}