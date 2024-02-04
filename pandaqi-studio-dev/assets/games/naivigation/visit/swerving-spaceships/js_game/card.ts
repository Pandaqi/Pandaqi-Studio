import cardDrawerNaivigation from "games/naivigation/js_shared/cardDrawerNaivigation";
import { MAIN_COLORS, MAP_TILES, MISC, VEHICLE_CARDS } from "../js_shared/dict";
import MaterialNaivigation from "games/naivigation/js_shared/materialNaivigation";
import createContext from "js/pq_games/layout/canvas/createContext";
import Point from "js/pq_games/tools/geometry/point";
import ResourceImage from "js/pq_games/layout/resources/resourceImage";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import ResourceShape from "js/pq_games/layout/resources/resourceShape";
import Circle from "js/pq_games/tools/geometry/circle";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import Line from "js/pq_games/tools/geometry/line";
import Pie from "js/pq_games/tools/geometry/pie";

export default class Card extends MaterialNaivigation
{
    getGameData() { return MAIN_COLORS; }
    getData() { return VEHICLE_CARDS[this.key]; }
    getMisc() { return MISC; }
    async draw(vis)
    {
        return cardDrawerNaivigation(vis, this);
    }

    getCustomIllustration(vis:MaterialVisualizer, card:MaterialNaivigation, op:LayoutOperation) : ResourceImage
    {
        if(this.key != "steer") { return null; }

        const canvSize = new Point(vis.sizeUnit);
        const ctx = createContext({ size: canvSize });
        const group = new ResourceGroup();

        // draw main circle
        const circleCenter = canvSize.clone().scale(0.5);
        const circleRadius = vis.get("cards.steer.circleRadius");
        const circleRes = new ResourceShape(new Circle({ center: circleCenter, radius: circleRadius }))
        const circleOp = new LayoutOperation({
            stroke: vis.get("cards.steer.strokeColorCircle"),
            strokeWidth: vis.get("cards.steer.strokeWidthCircle"),
        })

        group.add(circleRes, circleOp);

  
        // draw spokes
        const lineExtent = 1.1;
        const line = new ResourceShape(new Line(new Point(-circleRadius*lineExtent, 0), new Point(circleRadius*lineExtent, 0))); // this is already pivoted around center

        for(let i = 0; i < 4; i++)
        {
            const op = new LayoutOperation({
                translate: circleCenter,
                rotation: i * 0.25 * Math.PI,
                stroke: vis.get("cards.steer.strokeColorSpoke"),
                strokeWidth: vis.get("cards.steer.strokeWidthSpoke"),
            })
            group.add(line, op);
        }

        // Draw dynamic rotation range
        console.log(this.customData.angles);

        const a1 = this.customData.angles[0] * 0.25 * Math.PI - 0.5*Math.PI; // second part to make 0 = pointing up, as the spaceship does
        const a2 = this.customData.angles[1] * 0.25 * Math.PI - 0.5*Math.PI;
        const range = new Pie({ center: circleCenter, radius: circleRadius, startAngle: a1, endAngle: a2 });
        const rangeRes = new ResourceShape(range);
        const rangeOp = new LayoutOperation({
            fill: vis.get("cards.steer.rangeColor"),
            alpha: vis.get("cards.steer.rangeAlpha")
        })
        group.add(rangeRes, rangeOp);

        // Draw spaceship vehicle on top of center to indicate what is up
        const vehicleRes = vis.getResource("map_tiles");
        const frame = MAP_TILES.vehicle_0.frame;
        const vehicleOp = new LayoutOperation({
            translate: circleCenter,
            dims: vis.get("cards.steer.vehicleDims"),
            frame: frame,
            pivot: Point.CENTER
        })
        group.add(vehicleRes, vehicleOp);

        // Finally, turn that all into a resource image to give back
        group.toCanvas(ctx);
        return new ResourceImage(ctx.canvas);
    }
}