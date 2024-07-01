import createContext from "js/pq_games/layout/canvas/createContext";
import fillCanvas from "js/pq_games/layout/canvas/fillCanvas";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import { DominoType } from "../js_shared/dict";
import DominoSide from "./dominoSide";
import TextConfig from "js/pq_games/layout/text/textConfig";
import ResourceText from "js/pq_games/layout/resources/resourceText";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import Point from "js/pq_games/tools/geometry/point";

export default class Domino
{
    type:DominoType;
    sides:{ top:DominoSide, bottom:DominoSide }
    set:string;

    constructor(type:DominoType)
    {
        this.type = type;
        this.sides = { top: null, bottom: null };
    }

    setSides(a:DominoSide, b:DominoSide)
    {
        this.sides.top = a;
        this.sides.bottom = b;
    }

    setSet(s:string)
    {
        this.set = s;
    }

    async draw(vis:MaterialVisualizer)
    {
        const ctx = createContext({ size: vis.size });
        fillCanvas(ctx, "#FFFFFF");
        const group = new ResourceGroup();

        if(this.type == DominoType.REGULAR || this.type == DominoType.TENANT) {
            this.drawBothParts(vis, group);
        } else if(this.type == DominoType.MISSION) {
            this.drawMission(vis, group);
        }

        this.drawSetIndicator(vis, group);

        group.toCanvas(ctx);
        return ctx.canvas;
    }

    drawBothParts(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const topRotation = (this.type == DominoType.TENANT) ? Math.PI : 0;
        const opTop = new LayoutOperation({
            translate: new Point(vis.center.x, 0.25*vis.size.y),
            rotation: topRotation,
            pivot: Point.CENTER
        });
        group.add(this.sides.top.draw(vis), opTop);

        const opBottom = new LayoutOperation({
            translate: new Point(vis.center.x, 0.75*vis.size.y),
            pivot: Point.CENTER
        })
        group.add(this.sides.bottom.draw(vis), opBottom);

        const opTopNonRotated = opTop.clone(true);
        opTopNonRotated.rotation = 0;

        group.add(this.sides.top.drawWalls(vis), opTopNonRotated);
        group.add(this.sides.bottom.drawWalls(vis), opBottom);
    }

    drawMission(vis:MaterialVisualizer, group:ResourceGroup)
    {
        // @TODO
    }

    drawSetIndicator(vis:MaterialVisualizer, group:ResourceGroup)
    {
        if(this.set == "base" || !this.set) { return; }

        const text = this.set.slice(0,1).toUpperCase();
        const textConfig = new TextConfig({
            font: vis.get("fonts.heading"),
            size: vis.get("dominoes.setText.size")
        })
        const resText = new ResourceText({ text, textConfig });
        const opText = new LayoutOperation({
            translate: new Point(1.33*textConfig.size), 
            pivot: Point.CENTER,
            fill: vis.get("dominoes.setText.color"),
            alpha: vis.get("dominoes.setText.alpha"),
            dims: new Point(2*textConfig.size)
        });
        group.add(resText, opText);
    }

}