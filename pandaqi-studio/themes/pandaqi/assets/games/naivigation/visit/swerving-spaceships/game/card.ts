import cardDrawerNaivigation from "games/naivigation/shared/cardDrawerNaivigation";
import { CardType, TileType } from "games/naivigation/shared/dictShared";
import MaterialNaivigation from "games/naivigation/shared/materialNaivigation";
import { GAME_DATA, MATERIAL, MISC, PlanetProperty } from "../shared/dict";
import { MaterialVisualizer, ResourceGroup, Vector2, LayoutOperation, Rectangle, ResourceShape, TextConfig, ResourceText, Circle, Line, Pie } from "lib/pq-games";

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
        const offset = new Vector2(0, vis.size.y / 3);
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
        const rect = new Rectangle().fromTopLeft(new Vector2(), new Vector2(vis.size.x, height));
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
                pos: new Vector2(vis.center.x, 0.5*height),
                frame: frame,
                size: new Vector2(vis.get("cards.planetProperties.iconDims")),
                pivot: Vector2.CENTER
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
                pos: new Vector2(vis.center.x, 0.5*height),
                fill: "#111111",
                size: new Vector2(0.9*vis.size.x, 0.9*height),
                pivot: Vector2.CENTER
            })
            
            group.add(textRes, op);
        }

        return group;
    }

    getCustomIllustration(vis:MaterialVisualizer, op:LayoutOperation) : ResourceGroup
    {
        if(this.key != "steer") { return null; }

        const group = new ResourceGroup();
        const sizeUnit = Math.min(op.size.x, op.size.y);

        // draw main circle
        const circleRadius = vis.get("cards.steer.circleRadius") * sizeUnit;
        const circleRes = new ResourceShape(new Circle({ radius: circleRadius }))
        const circleOp = new LayoutOperation({
            stroke: vis.get("cards.steer.strokeColorCircle"),
            strokeWidth: vis.get("cards.steer.strokeWidthCircle") * sizeUnit,
        })

        group.add(circleRes, circleOp);

        // draw spokes
        const lineExtent = 1.1;
        const line = new ResourceShape(new Line(new Vector2(-circleRadius*lineExtent, 0), new Vector2(circleRadius*lineExtent, 0))); // this is already pivoted around center

        for(let i = 0; i < 4; i++)
        {
            const op = new LayoutOperation({
                rot: i * 0.25 * Math.PI,
                stroke: vis.get("cards.steer.strokeColorSpoke"),
                strokeWidth: vis.get("cards.steer.strokeWidthSpoke") * sizeUnit,
            })
            group.add(line, op);
        }

        // draw dynamic rotation range
        const a1 = this.customData.angles[0] * 0.25 * Math.PI - 0.5*Math.PI; // second part to make 0 = pointing up, as the spaceship does
        const a2 = this.customData.angles[1] * 0.25 * Math.PI - 0.5*Math.PI;
        const range = new Pie({ radius: circleRadius, startAngle: a1, endAngle: a2 });
        const rangeRes = new ResourceShape(range);
        const rangeOp = new LayoutOperation({
            fill: vis.get("cards.steer.rangeColor"),
            alpha: vis.get("cards.steer.rangeAlpha")
        })
        group.add(rangeRes, rangeOp);

        // draw spaceship vehicle on top of center to indicate what is up
        const vehicleRes = vis.getResource("map_tiles");
        const frame = MATERIAL[TileType.VEHICLE].vehicle_0.frame;
        const vehicleOp = new LayoutOperation({
            size: new Vector2(vis.get("cards.steer.vehicleDims") * sizeUnit),
            rot: -0.5*Math.PI, // because now it defaults to pointing to the side, so put it back up 
            frame: frame,
            pivot: Vector2.CENTER
        })
        group.add(vehicleRes, vehicleOp);
        return group;
    }
}