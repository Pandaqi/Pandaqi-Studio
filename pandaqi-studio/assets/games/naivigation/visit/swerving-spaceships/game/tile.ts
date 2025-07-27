import { TileType } from "games/naivigation/shared/dictShared";
import MaterialNaivigation from "games/naivigation/shared/materialNaivigation";
import { TileData } from "games/naivigation/shared/randomNaivigationSetupGenerator";
import tileDrawerNaivigation from "games/naivigation/shared/tileDrawerNaivigation";
import vehicleDrawerNaivigation from "games/naivigation/shared/vehicleDrawerNaivigation";
import fillResourceGroup from "js/pq_games/layout/canvas/fillResourceGroup";
import DropShadowEffect from "js/pq_games/layout/effects/dropShadowEffect";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import getRectangleCornersWithOffset from "js/pq_games/tools/geometry/paths/getRectangleCornersWithOffset";
import Point from "js/pq_games/tools/geometry/point";
import { GAME_DATA, MATERIAL, MISC, VEHICLE_TILES } from "../shared/dict";

export default class Tile extends MaterialNaivigation
{
    illustrationUsesGlow = true;

    getData() { return MATERIAL[this.type][this.key]; } 
    async draw(vis:MaterialVisualizer)
    {
        const group = vis.renderer.prepareDraw();
        if(this.type == TileType.MAP) { this.drawMapTile(vis, group); }
        else if(this.type == TileType.VEHICLE) { vehicleDrawerNaivigation(vis, group, this); }
        return vis.renderer.finishDraw({ group: group, size: vis.size });
    }

    drawMapTile(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const bgColor = vis.inkFriendly ? "#FFFFFF" : GAME_DATA.mapTileColor;
        fillResourceGroup(vis.size, group, bgColor);

        // create random starry background
        const numStars = vis.get("tiles.map.stars.numBounds").randomInteger();
        const resStar = vis.getResource("misc");
        const starFrame = MISC.star_0.frame + Math.floor(Math.random()*2);
        const baseStarDims = vis.get("tiles.map.stars.baseDims");
        for(let i = 0; i < numStars; i++)
        {
            const op = new LayoutOperation({
                pos: new Point(Math.random(), Math.random()).scale(vis.size),
                frame: starFrame,
                size: baseStarDims.clone().scale(vis.get("tiles.map.stars.sizeRand").random()),
                rot: Math.random() * 2 * Math.PI,
                pivot: Point.CENTER,
                alpha: vis.get("tiles.map.stars.alphaBounds").random()
            })
            group.add(resStar, op);
        }

        // place the actual tile type illustration
        if(this.key == "empty") { return; }

        tileDrawerNaivigation(vis, group, this);

        /*
        const data = MAP_TILES[this.key];
        const res = vis.getResource("map_tiles");
        const randPos = vis.center.clone().add( new Point().random() * range(0, vis.get("tiles.map.maxPosRand")) );
        
        const op = new LayoutOperation({
            pos: randPos,
            frame: data.frame,
            size: vis.get("tiles.map.iconDims"),
            effects: [eff],
            pivot: Point.CENTER
        });
        group.add(res, op);
        */

        // if a planet, also show the orientation of the vehicle (for landing)
        if(this.isCollectible())
        {
            const res = vis.getResource("map_tiles");
            const randVehicleRot = this.getCollectOrientation()*0.5*Math.PI;;
            const vehicleOp = new LayoutOperation({
                pos: vis.center,
                frame: VEHICLE_TILES.vehicle_0.frame,
                size: vis.get("tiles.map.vehicleIcon.dims"),
                rot: randVehicleRot,
                alpha: vis.get("tiles.map.vehicleIcon.alpha"),
                composite: vis.get("tiles.map.vehicleIcon.composite"),
                effects: [new DropShadowEffect({ color: "#000000", blurRadius: vis.get("tiles.map.vehicleIcon.shadowBlur" )})],
                pivot: Point.CENTER
            })
            group.add(res, vehicleOp);

            const vehicleDimsSmall = vis.get("tiles.map.vehicleIcon.dimsSmall");
            const cornerOffset = vehicleDimsSmall.clone().scale(0.66);
            const corners = getRectangleCornersWithOffset(vis.size, cornerOffset);
            for(const corner of corners)
            {
                const op = vehicleOp.clone();
                op.pos = corner;
                op.size = vehicleDimsSmall;
                op.effects = [];
                group.add(res, op);
            }
        }

        // @EXCEPTION: moon tile also shows a resource in its top right quadrant
        if(this.key.includes("moon"))
        {
            const resMisc = vis.getResource("misc");
            const frame = MISC.resource_0.frame + this.customData.resourceType;
            const resOp = new LayoutOperation({
                pos: vis.get("tiles.map.resources.position"),
                size: vis.get("tiles.map.resources.size"),
                frame: frame,
                pivot: Point.CENTER
            })
            group.add(resMisc, resOp);
        }
    }

    canCollect(data:TileData)
    {
        return Math.abs(this.getCollectOrientation() - data.rot) <= 0.1;
    }

    getCollectOrientation()
    {
        return (this.randomSeed % 8)*0.5;
    }
}