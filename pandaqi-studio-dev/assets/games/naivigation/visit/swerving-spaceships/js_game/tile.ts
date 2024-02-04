import createContext from "js/pq_games/layout/canvas/createContext";
import fillCanvas from "js/pq_games/layout/canvas/fillCanvas";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import { TileType } from "games/naivigation/js_shared/dictShared";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import Point from "js/pq_games/tools/geometry/point";
import { MAIN_COLORS, MAP_TILES } from "../js_shared/dict";
import rangeInteger from "js/pq_games/tools/random/rangeInteger";
import range from "js/pq_games/tools/random/range";
import MaterialNaivigation from "games/naivigation/js_shared/materialNaivigation";
import fillResourceGroup from "js/pq_games/layout/canvas/fillResourceGroup";
import DropShadowEffect from "js/pq_games/layout/effects/dropShadowEffect";
import getRectangleCornersWithOffset from "js/pq_games/tools/geometry/paths/getRectangleCornersWithOffset";

export default class Tile extends MaterialNaivigation
{
    isCollectible() { return MAP_TILES[this.key].collectible; }
    async draw(vis)
    {
        const ctx = createContext({ size: vis.size });
        fillCanvas(ctx, "#FFFFFF");

        const group = new ResourceGroup();
        if(this.type == TileType.MAP) { this.drawMapTile(vis, group); }
        else if(this.type == TileType.VEHICLE) { this.drawVehicle(vis, group); }
        group.toCanvas(ctx);
        return ctx.canvas;
    }

    drawVehicle(vis, group)
    {
        const res = vis.getResource("map_tiles");
        const frame = MAP_TILES.vehicle_0.frame + this.customData.num;
        const op = new LayoutOperation({
            translate: vis.center,
            frame: frame,
            dims: vis.get("tiles.vehicle.dims"),
            pivot: Point.CENTER
        });
        group.add(res, op);

        console.log(res);
        console.log(op);
    }

    drawMapTile(vis, group)
    {
        const bgColor = vis.inkFriendly ? "#FFFFFF" : MAIN_COLORS.mapTileColor;
        fillResourceGroup(vis.size, group, bgColor);

        // create random starry background
        const numStars = vis.get("tiles.map.stars.numBounds").randomInteger();
        const resStar = vis.getResource("map_tiles");
        const starFrame = MAP_TILES.star_0.frame + Math.floor(Math.random()*2);
        const baseStarDims = vis.get("tiles.map.stars.baseDims");
        for(let i = 0; i < numStars; i++)
        {
            const op = new LayoutOperation({
                translate: new Point(Math.random(), Math.random()).scale(vis.size),
                frame: starFrame,
                dims: baseStarDims.clone().scale(vis.get("tiles.map.stars.dimsRand").random()),
                rotation: Math.random() * 2 * Math.PI,
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
        const randRot = rangeInteger(0,3)*0.5*Math.PI;
        const eff = new DropShadowEffect({ color: "#FFFFFF", blurRadius: vis.get("tiles.map.glowRadius") })
        const op = new LayoutOperation({
            translate: randPos,
            frame: data.frame,
            dims: vis.get("tiles.map.iconDims"),
            rotation: randRot,
            effects: [eff],
            pivot: Point.CENTER
        });
        group.add(res, op);

        // if a planet, also show the orientation of the vehicle (for landing)
        if(this.key.includes("planet"))
        {
            const randVehicleRot = rangeInteger(0,8)*0.25*Math.PI;
            const vehicleOp = new LayoutOperation({
                translate: randPos,
                frame: MAP_TILES.vehicle_0.frame,
                dims: vis.get("tiles.map.vehicleIconDims"),
                rotation: randVehicleRot,
                alpha: vis.get("tiles.map.vehicleIconAlpha"),
                composite: vis.get("tiles.map.vehicleComposite"),
                effects: [new DropShadowEffect({ color: "#000000", blurRadius: vis.get("tiles.map.vehicleShadowBlur" )})],
                pivot: Point.CENTER
            })
            group.add(res, vehicleOp);

            const vehicleDimsSmall = vis.get("tiles.map.vehicleIconDimsSmall");
            const corners = getRectangleCornersWithOffset(vis.size, vehicleDimsSmall.clone().scale(0.66));
            for(const corner of corners)
            {
                const op = vehicleOp.clone();
                op.translate = corner;
                op.dims = vehicleDimsSmall;
                op.effects = [];
                group.add(res, op);
            }
        }
    }
}