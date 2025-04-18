import fillResourceGroup from "js/pq_games/layout/canvas/fillResourceGroup";
import BlurEffect from "js/pq_games/layout/effects/blurEffect";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import ResourceShape from "js/pq_games/layout/resources/resourceShape";
import ResourceText from "js/pq_games/layout/resources/resourceText";
import TextConfig from "js/pq_games/layout/text/textConfig";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import getRectangleCornersWithOffset from "js/pq_games/tools/geometry/paths/getRectangleCornersWithOffset";
import Path from "js/pq_games/tools/geometry/paths/path";
import Point from "js/pq_games/tools/geometry/point";
import Rectangle from "js/pq_games/tools/geometry/rectangle";
import { MISC_SHARED, NETWORKS, TERRAINS, TerrainType, TileType } from "./dictShared";
import MaterialNaivigation from "./materialNaivigation";
import vehicleDrawerNaivigation from "./vehicleDrawerNaivigation";
import DropShadowEffect from "js/pq_games/layout/effects/dropShadowEffect";

const drawBackground = (vis:MaterialVisualizer, group:ResourceGroup, tile:MaterialNaivigation) =>
{
    const resCustom = tile.getCustomBackground(vis, group);
    if(resCustom) { return; }
    drawTerrain(vis, group, tile);
    drawNetwork(vis, group, tile);
}

const drawTerrain = (vis:MaterialVisualizer, group:ResourceGroup, tile:MaterialNaivigation) =>
{
    const needsTerrain = tile.hasTerrain() && !tile.customData.suppressTerrain;
    if(!needsTerrain) { return; }

    // main background color
    const tempData = tile.getTemplateData();
    const gameData = tile.getGameData();
    let bgColor = gameData ? gameData.bgColor : tempData.bgColor;
    bgColor = vis.inkFriendly ? "#FFFFFF" : bgColor;
    fillResourceGroup(vis.size, group, bgColor);

    // @EXCEPTION: my terrible laptop sometimes can't load more than one or two images, so allow drawing to continue anyway
    const res = vis.getResource("terrains");
    if(!res) 
    { 
        fillResourceGroup(vis.size, group, "#CCCCCC");
        console.error("Needs to draw terrain, but resource isn't loaded"); 
        return; 
    }

    // terrain image
    const frame = TERRAINS[tile.getTerrain()].frame;
    const effects = tile.terrainUsesGrayscale ? vis.inkFriendlyEffect : [];
    const resOp = new LayoutOperation({
        frame: frame,
        pos: new Point(),
        size: vis.size,
        effects: effects
    });
    group.add(res, resOp);
}

const drawNetwork = (vis:MaterialVisualizer, group:ResourceGroup, tile:MaterialNaivigation) =>
{
    const needsNetwork = tile.hasNetwork() && !tile.customData.suppressNetwork;
    if(!needsNetwork) { return; }

    const data = tile.getNetworkData();
    const textureKey = data.textureKey ?? "networks";

    // @EXCEPTION: my terrible laptop sometimes can't load more than one or two images, so allow drawing to continue anyway
    const res = vis.getResource(textureKey);
    if(!res)
    {
        console.error("Needs to draw network, but resource isn't loaded");
        return;
    }

    // simply grab the right frame out of the networks spritesheet and display that full size
    const frameOffset = NETWORKS[tile.networkType].frameOffset;
    const baseFrame = data.frame * 5; // there are 5 different versions for each terrain
    const frameFinal = baseFrame + frameOffset;
    const op = new LayoutOperation({
        size: vis.size,
        frame: frameFinal
    });
    group.add(res, op);
}

const drawTile = (vis:MaterialVisualizer, group:ResourceGroup, tile:MaterialNaivigation) =>
{
    // the main illustration of the tile
    const typeData = tile.getData();
    const tempData = tile.getTemplateData();
    const spriteTextureKey = typeData.textureKey ?? typeData.textureKey ?? "map_tiles";
    const resSprite = vis.getResource(spriteTextureKey);

    const spriteFrame = tempData.frameIcon ?? typeData.frame;
    const mainIconSize = vis.get("tiles.general.illustration.mainDims");
    const eff = new DropShadowEffect({ color: "#000000", blurRadius: 0.05*mainIconSize.x });
    if(tile.illustrationUsesGlow) { eff.setColor("#FFFFFF"); }

    const spriteOp = new LayoutOperation({
        pos: vis.center,
        size: mainIconSize,
        frame: spriteFrame,
        pivot: Point.CENTER,
        effects: [eff, vis.inkFriendlyEffect].flat()
    });

    // allow custom draws (in fact, we'll need that a lot)
    let resIllu = resSprite;
    const resTemp = tile.getCustomIllustration(vis, spriteOp);
    if(resTemp) { resIllu = resTemp; spriteOp.frame = 0; spriteOp.size = new Point(); }
    group.add(resIllu, spriteOp);

    // draw collectible icon + starting tile icon top center
    const extraIconDims = new Point(vis.get("tiles.general.collectibleIcon.size"));
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

    // (added late) an option to add text on the tiles to explain themselves
    // not recommended on more complex games (where you really need to be able to see the entire tile below), but still possible for those who like it
    const needsText = typeData.desc && vis.get("addTextOnTiles");
    if(needsText)
    {
        const textConfig = new TextConfig({
            font: vis.get("fonts.body"),
            size: vis.get("tiles.general.text.fontSize")
        }).alignCenter();
        const resText = new ResourceText(typeData.desc, textConfig);
        const textBoxDims = vis.get("tiles.general.text.boxDims");
        const textPos = vis.get("tiles.general.text.pos");
        const rect = new ResourceShape(new Rectangle({ center: textPos, extents: textBoxDims }));
        const opRect = new LayoutOperation({
            fill: vis.get("tiles.general.text.bgColor"),
            effects: [new BlurEffect(vis.get("tiles.general.text.boxBlur"))],
            alpha: vis.get("tiles.general.text.boxAlpha")
        })
        group.add(rect, opRect);

        const opText = new LayoutOperation({
            pos: textPos,
            size: textBoxDims,
            fill: vis.get("tiles.general.text.textColor"),
            pivot: Point.CENTER
        });
        group.add(resText, opText);
    }
}

const drawForeground = (vis:MaterialVisualizer, group:ResourceGroup, tile:MaterialNaivigation) =>
{
    const resCustom = tile.getCustomForeground(vis, group);
    if(resCustom) { return; }
    drawElevation(vis, group, tile);
}

const drawElevation = (vis:MaterialVisualizer, group:ResourceGroup, tile:MaterialNaivigation) =>
{
    const elevation = tile.getElevation();
    const needsElevation = elevation > 0 && !tile.customData.suppressElevation;
    if(!needsElevation) { return; }

    const size = vis.get("tiles.general.elevation.triangleSideLength");
    const points = 
    [
        new Point(),
        new Point(size, 0),
        new Point(0, size)
    ];

    const triangle = new ResourceShape(new Path({ points: points, close: true }));

    const offset = vis.get("tiles.general.elevation.triangleEdgeOffset");
    const positions = getRectangleCornersWithOffset(vis.size, offset);

    // @NOTE: this abuses the fact that the triangle's right corner is at (0,0)
    // so we can rotate it to get all the possible corners if we want
    for(let i = 0; i < elevation; i++)
    {
        const triangleOp = new LayoutOperation({
            pos: positions[i],
            rot: i * 0.5 * Math.PI,
            fill: vis.get("tiles.general.elevation.fill"),
            stroke: vis.get("tiles.general.elevation.stroke"),
            strokeWidth: vis.get("tiles.general.elevation.strokeWidth"),
            composite: vis.get("tiles.general.elevation.composite")
        });
        group.add(triangle, triangleOp);
    }
}

// The default Tile Drawer that can just be plugged into most games
export default (vis:MaterialVisualizer, group: ResourceGroup, tile:MaterialNaivigation) =>
{
    if(tile.type == TileType.VEHICLE) { vehicleDrawerNaivigation(vis, group, tile); return }

    drawBackground(vis, group, tile);
    drawTile(vis, group, tile);
    drawForeground(vis, group, tile);
}