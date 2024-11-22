import { MISC_SHARED, TileType } from "games/naivigation/js_shared/dictShared";
import MaterialNaivigation from "games/naivigation/js_shared/materialNaivigation";
import fillResourceGroup from "js/pq_games/layout/canvas/fillResourceGroup";
import DropShadowEffect from "js/pq_games/layout/effects/dropShadowEffect";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import getRectangleCornersWithOffset from "js/pq_games/tools/geometry/paths/getRectangleCornersWithOffset";
import Point from "js/pq_games/tools/geometry/point";
import range from "js/pq_games/tools/random/range";
import rangeInteger from "js/pq_games/tools/random/rangeInteger";
import { MAIN_COLORS, MAP_TILES, MISC } from "../js_shared/dict";
import { TileData } from "games/naivigation/js_shared/randomNaivigationSetupGenerator";

export default class Tile extends MaterialNaivigation
{
    isCollectible() { return (MAP_TILES[this.key] ?? {}).collectible ?? false; }
    isStartingTile() { return (MAP_TILES[this.key] ?? {}).starting ?? false; }
    async draw(vis:MaterialVisualizer)
    {
        const group = vis.renderer.prepareDraw();
        if(this.type == TileType.MAP) { this.drawMapTile(vis, group); }
        else if(this.type == TileType.VEHICLE) { this.drawVehicle(vis, group); }
        return vis.renderer.finishDraw({ group: group, size: vis.size });
    }

    drawVehicle(vis:MaterialVisualizer, group:ResourceGroup)
    {
        // a guiding sprite behind it to clearly show what's the front and stuff
        const resGuides = vis.getResource("misc_shared");
        const opGuides = new LayoutOperation({
            pos: vis.center,
            frame: MISC_SHARED.vehicle_guides.frame,
            size: vis.get("tiles.general.vehicle.sizeGuides"),
            pivot: Point.CENTER
        })
        group.add(resGuides, opGuides)

        // the actual vehicle
        const res = vis.getResource("map_tiles");
        const frame = MAP_TILES.vehicle_0.frame + this.customData.num;
        const op = new LayoutOperation({
            pos: vis.center,
            frame: frame,
            size: vis.get("tiles.general.vehicle.size"),
            pivot: Point.CENTER
        });
        group.add(res, op);
    }

    drawMapTile(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const bgColor = vis.inkFriendly ? "#FFFFFF" : MAIN_COLORS.mapTileColor;
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
        
        const data = MAP_TILES[this.key];
        const res = vis.getResource("map_tiles");
        const randPos = vis.center.clone().add( new Point().random() * range(0, vis.get("tiles.map.maxPosRand")) );
        const eff = new DropShadowEffect({ color: "#FFFFFF", blurRadius: vis.get("tiles.map.glowRadius") })
        const op = new LayoutOperation({
            pos: randPos,
            frame: data.frame,
            size: vis.get("tiles.map.iconDims"),
            effects: [eff],
            pivot: Point.CENTER
        });
        group.add(res, op);

        // if a planet, 
        // - also show the orientation of the vehicle (for landing)
        // - and the general "this is a collectible" icon
        const extraIconSize = vis.get("tiles.map.vehicleIconDimsSmall");
        const topCenterPos = new Point(vis.center.x, 0.66*extraIconSize.y);
        if(this.isCollectible())
        {
            const randVehicleRot = this.getCollectOrientation()*0.5*Math.PI;;
            const vehicleOp = new LayoutOperation({
                pos: randPos,
                frame: MAP_TILES.vehicle_0.frame,
                size: vis.get("tiles.map.vehicleIconDims"),
                rot: randVehicleRot,
                alpha: vis.get("tiles.map.vehicleIconAlpha"),
                composite: vis.get("tiles.map.vehicleComposite"),
                effects: [new DropShadowEffect({ color: "#000000", blurRadius: vis.get("tiles.map.vehicleShadowBlur" )})],
                pivot: Point.CENTER
            })
            group.add(res, vehicleOp);

            const vehicleDimsSmall = vis.get("tiles.map.vehicleIconDimsSmall");
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

            const resIcon = vis.getResource("misc_shared");
            const iconOp = new LayoutOperation({
                pos: topCenterPos,
                frame: MISC_SHARED.collectible_icon.frame,
                size: extraIconSize,
                pivot: Point.CENTER
            })
            group.add(resIcon, iconOp);
        }

        // starting tiles get the special starting icon at top center instead
        if(this.isStartingTile())
        {
            const resIcon = vis.getResource("misc_shared");
            const iconOp = new LayoutOperation({
                pos: topCenterPos,
                frame: MISC_SHARED.starting_icon.frame,
                size: extraIconSize,
                pivot: Point.CENTER
            })
            group.add(resIcon, iconOp);
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