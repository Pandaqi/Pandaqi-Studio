import cardDrawerNaivigation from "games/naivigation/js_shared/cardDrawerNaivigation";
import { CardType, TileType } from "games/naivigation/js_shared/dictShared";
import MaterialNaivigation from "games/naivigation/js_shared/materialNaivigation";
import createContext from "js/pq_games/layout/canvas/createContext";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import ResourceImage from "js/pq_games/layout/resources/resourceImage";
import ResourceShape from "js/pq_games/layout/resources/resourceShape";
import ResourceText from "js/pq_games/layout/resources/resourceText";
import TextConfig from "js/pq_games/layout/text/textConfig";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import Circle from "js/pq_games/tools/geometry/circle";
import Line from "js/pq_games/tools/geometry/line";
import Pie from "js/pq_games/tools/geometry/pie";
import Point from "js/pq_games/tools/geometry/point";
import Rectangle from "js/pq_games/tools/geometry/rectangle";
import { GAME_DATA, MATERIAL, MISC, PlanetProperty } from "../js_shared/dict";

export default class Card extends MaterialNaivigation
{
    getGameData() { return GAME_DATA; }
    getData() { return MATERIAL[this.type][this.key]; } 
    getMisc() { return MISC; }
    async draw(vis:MaterialVisualizer)
    {
        const group = vis.renderer.prepareDraw();
        if(this.type == CardType.CUSTOM) { 
            this.drawPlanetProperties(vis, group); 
        } else {
            cardDrawerNaivigation(vis, group, this);
        }
        return vis.renderer.finishDraw({ group: group, size: vis.size });
    }

    drawPlanetProperties(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const op = new LayoutOperation();
        const offset = new Point(0, vis.size.y / 3);
        let counter = 0;
        for(const prop of this.customData.planetProperties)
        {
            const op = new LayoutOperation({
                pos: offset.clone().scale(counter)
            })
            group.add(this.drawPlanetProperty(vis, prop), op);
            counter++;
        }
    }

    drawPlanetProperty(vis:MaterialVisualizer, prop:PlanetProperty) : ResourceGroup
    {
        const group = new ResourceGroup();
        const height = vis.size.y / 3.0;

        // (cutting) boundary around it
        const rect = new Rectangle().fromTopLeft(new Point(), new Point(vis.size.x, height));
        const resShape = new ResourceShape(rect);
        const shapeOp = new LayoutOperation({
            stroke: vis.get("cards.planetProperties.stroke"),
            strokeWidth: vis.get("cards.planetProperties.strokeWidth")
        })
        group.add(resShape, shapeOp);

        // it's either a planet, which just means showing its icon + dark bg color
        const isPlanet = prop.key == "planet";
        if(isPlanet) {
            const bgColor = vis.inkFriendly ? "#FFFFFF" : GAME_DATA.mapTileColor;
            const bgOp = new LayoutOperation({ fill: bgColor });
            group.add(resShape, bgOp);

            const resPlanet = vis.getResource("map_tiles");
            const frame = MATERIAL[TileType.MAP].planet_0.frame + prop.num;
            const op = new LayoutOperation({
                pos: new Point(vis.center.x, 0.5*height),
                frame: frame,
                size: new Point(vis.get("cards.planetProperties.iconDims")),
                pivot: Point.CENTER
            })
            group.add(resPlanet, op);
        
        // or its a textual effect (with perhaps an icon, hence resLoader is inserted as dependency)
        // (in this case, prop.key is the specific effect key in original dictionary)
        } else {
            const textConfig = new TextConfig({
                font: vis.get("fonts.body"),
                size: vis.get("cards.planetProperties.fontSize"),
                resLoader: vis.resLoader
            }).alignCenter();

            const textRes = new ResourceText({ text: prop.desc, textConfig: textConfig });
            const op = new LayoutOperation({
                pos: new Point(vis.center.x, 0.5*height),
                fill: "#111111",
                size: new Point(0.9*vis.size.x, 0.9*height),
                pivot: Point.CENTER
            })
            
            group.add(textRes, op);
        }

        return group;
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
                pos: circleCenter,
                rot: i * 0.25 * Math.PI,
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
        const frame = MATERIAL[TileType.MAP].vehicle_0.frame;
        const vehicleOp = new LayoutOperation({
            pos: circleCenter,
            size: vis.get("cards.steer.vehicleDims"),
            frame: frame,
            pivot: Point.CENTER
        })
        group.add(vehicleRes, vehicleOp);

        // Finally, turn that all into a resource image to give back
        group.toCanvas(ctx);
        return new ResourceImage(ctx.canvas);
    }
}