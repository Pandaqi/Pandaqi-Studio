import createContext from "js/pq_games/layout/canvas/createContext";
import fillCanvas from "js/pq_games/layout/canvas/fillCanvas";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import { DominoType, MISC } from "../js_shared/dict";
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
    entrance: boolean = false;
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
            this.drawEntrance(vis, group);
        }

        group.toCanvas(ctx);
        return ctx.canvas;
    }

    drawPawn(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const res = vis.getResource("pawns");
        const size = new Point(vis.sizeUnit);
        
        const opTop = new LayoutOperation({
            pos: new Point(vis.size.x, vis.center.y),
            frame: this.pawnIndex,
            size: size,
            rot: Math.PI
        });
        group.add(res, opTop);

        const opBottom = new LayoutOperation({
            pos: new Point(0, vis.center.y),
            frame: this.pawnIndex,
            size: size
        });
        group.add(res, opBottom);
    }

    drawBothParts(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const opTop = new LayoutOperation({
            pos: new Point(vis.center.x, 0.25*vis.size.y),
            pivot: Point.CENTER
        });
        group.add(this.sides.top.draw(vis), opTop);

        const opBottom = new LayoutOperation({
            pos: new Point(vis.center.x, 0.75*vis.size.y),
            pivot: Point.CENTER
        })
        group.add(this.sides.bottom.draw(vis), opBottom);
    }

    drawSetIndicator(vis:MaterialVisualizer, group:ResourceGroup)
    {
        if(this.set == "base") { return; }

        let setID = "B";
        if(this.set == "wishneyland") { setID = "W"; }
        else if(this.set == "unibearsal") { setID = "U"; }
        else if(this.set == "rollercoasters") { setID = "R"; }

        const text = setID;
        const textConfig = new TextConfig({
            font: vis.get("fonts.heading"),
            size: vis.get("dominoes.setText.size")
        })
        const resText = new ResourceText({ text, textConfig });
        const opText = new LayoutOperation({
            pos: new Point(1.33*textConfig.size), 
            pivot: Point.CENTER,
            fill: "#FFFFFF",
            alpha: 0.75,
            size: new Point(2*textConfig.size)
        });
        group.add(resText, opText);
    }

    drawEntrance(vis:MaterialVisualizer, group:ResourceGroup)
    {
        if(!this.entrance) { return; }

        const res = vis.getResource("misc");
        const op = new LayoutOperation({
            frame: MISC.entrance.frame,
            pos: new Point(vis.center.x, 0.25*vis.size.y),
            size: vis.get("dominoes.entrance.size"),
            pivot: Point.CENTER
        });
        group.add(res, op);
    }

}