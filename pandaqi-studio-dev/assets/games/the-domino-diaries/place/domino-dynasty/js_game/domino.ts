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
    pawnIndex:number = -1; // just a quick hack to also reuse this class for drawing the pawns/claim cubes
    sides:{ top:DominoSide, bottom:DominoSide }
    set:string;

    constructor(type:DominoType)
    {
        this.type = type;
        this.sides = { top: null, bottom: null };
    }

    setPawnIndex(i:number)
    {
        this.pawnIndex = i;
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

        if(this.type == DominoType.PAWN) {
            this.drawPawn(vis, group);
        } else if(this.type == DominoType.REGULAR) {
            this.drawBothParts(vis, group);
            this.drawSetIndicator(vis, group);
        }

        group.toCanvas(ctx);
        return ctx.canvas;
    }

    drawPawn(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const res = vis.getResource("pawns");
        const dims = new Point(vis.sizeUnit);
        
        const opTop = new LayoutOperation({
            translate: new Point(vis.size.x, vis.center.y),
            frame: this.pawnIndex,
            dims: dims,
            rotation: Math.PI
        });
        group.add(res, opTop);

        const opBottom = new LayoutOperation({
            translate: new Point(0, vis.center.y),
            frame: this.pawnIndex,
            dims: dims
        });
        group.add(res, opBottom);
    }

    drawBothParts(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const opTop = new LayoutOperation({
            translate: new Point(vis.center.x, 0.25*vis.size.y),
            pivot: Point.CENTER
        });
        group.add(this.sides.top.draw(vis), opTop);

        const opBottom = new LayoutOperation({
            translate: new Point(vis.center.x, 0.75*vis.size.y),
            pivot: Point.CENTER
        })
        group.add(this.sides.bottom.draw(vis), opBottom);
    }

    drawSetIndicator(vis:MaterialVisualizer, group:ResourceGroup)
    {
        if(this.set == "base") { return; }

        const text = this.set; // @TODO: convert set into a short unique identifier
        const textConfig = new TextConfig({
            font: vis.get("fonts.heading"),
            size: vis.get("dominoes.setText.size")
        })
        const resText = new ResourceText({ text, textConfig });
        const opText = new LayoutOperation({
            translate: new Point(1.33*textConfig.size), 
            pivot: Point.CENTER,
            fill: "#442200",
            alpha: 0.5,
            dims: new Point(2*textConfig.size)
        });
        group.add(resText, opText);
    }

}