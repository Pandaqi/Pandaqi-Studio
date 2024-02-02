import createContext from "js/pq_games/layout/canvas/createContext";
import fillCanvas from "js/pq_games/layout/canvas/fillCanvas";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import { TileType } from "games/naivigation/js_shared/dictShared";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import Point from "js/pq_games/tools/geometry/point";
import { MAP_TILES } from "../js_shared/dict";
import rangeInteger from "js/pq_games/tools/random/rangeInteger";
import range from "js/pq_games/tools/random/range";
import MaterialNaivigation from "games/naivigation/js_shared/materialNaivigation";

export default class Tile extends MaterialNaivigation
{
    isCollectible() { return this.key == "planet"; }
    async draw(vis)
    {
        const ctx = createContext({ size: vis.size });
        fillCanvas(ctx, "#FFFFFF");

        const group = new ResourceGroup();
        if(this.type == TileType.MAP) { this.drawMapTile(vis, group, ctx); }
        else if(this.type == TileType.VEHICLE) { this.drawVehicle(vis, group); }
        group.toCanvas(ctx);
        return ctx.canvas;
    }

    drawVehicle(vis, group)
    {
        const res = vis.getResource(""); // @TODO
        const op = new LayoutOperation({
            translate: vis.center,
            dims: vis.get("tiles.vehicle.dims"),
            pivot: Point.CENTER
        });
        group.add(res, op);
    }

    drawMapTile(vis, group, ctx)
    {
        const bgColor = "#FFAAAA"; // @TODO
        fillCanvas(ctx, bgColor);

        // create random starry background
        const numStars = vis.get("tiles.map.stars.numBounds").randomInteger();
        const resStar = vis.getResource("misc"); // @TODO: are the stars actually on that one?
        const starFrame = 0; // @TODO: where to store/read the frame?
        const baseStarDims = vis.get("tiles.map.stars.baseDims");
        for(let i = 0; i < numStars; i++)
        {
            const op = new LayoutOperation({
                translate: new Point(Math.random(), Math.random()).scale(vis.size),
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
        const op = new LayoutOperation({
            translate: randPos,
            frame: data.frame,
            dims: vis.get("tiles.map.iconDims"),
            rotation: randRot,
            pivot: Point.CENTER
        });

        group.add(res, op);
    }
}