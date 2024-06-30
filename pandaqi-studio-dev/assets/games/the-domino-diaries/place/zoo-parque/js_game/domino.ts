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
import DropShadowEffect from "js/pq_games/layout/effects/dropShadowEffect";

export default class Domino
{
    type:DominoType;
    pawnIndex:number = -1; // just a quick hack to also reuse this class for drawing the pawns/claim cubes
    sides:{ top:DominoSide, bottom:DominoSide }
    set:string;
    entrance:boolean = false;

    constructor(type:DominoType)
    {
        this.type = type;
        this.sides = { top: null, bottom: null };
    }

    setPawnIndex(i:number)
    {
        this.pawnIndex = i;
    }
    
    getSidesAsArray()
    {
        return [this.sides.top, this.sides.bottom];
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
        const bgColor = vis.inkFriendly ? "#FFFFFF" : vis.get("dominoes.bg.color");
        fillCanvas(ctx, bgColor);

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

        // fences go on top of everything!
        group.add(this.sides.top.drawFences(vis), opTop);
        group.add(this.sides.bottom.drawFences(vis), opBottom);
    }

    drawSetIndicator(vis:MaterialVisualizer, group:ResourceGroup)
    {
        if(this.set == "base" || !this.set) { return; }

        let setID = "B";
        if(this.set == "strong") { setID = "S"; }
        else if(this.set == "wildlife") { setID = "W"; }
        else if(this.set == "utilities") { setID = "U"; }

        const text = setID;
        const textConfig = new TextConfig({
            font: vis.get("fonts.heading"),
            size: vis.get("dominoes.setText.fontSize")
        })
        const resText = new ResourceText({ text, textConfig });
        const textColor = vis.inkFriendly ? "#000000" : "#442200";
        const opText = new LayoutOperation({
            translate: new Point(1.33*textConfig.size), 
            pivot: Point.CENTER,
            fill: textColor,
            alpha: 0.75,
            dims: new Point(2*textConfig.size)
        });
        group.add(resText, opText);
    }

    drawEntrance(vis:MaterialVisualizer, group:ResourceGroup)
    {
        if(!this.entrance) { return; }

        const res = vis.getResource("misc");
        const glowEffect = new DropShadowEffect({ color: "#FFFFFF", blurRadius: 0.05 * vis.sizeUnit });
        const op = new LayoutOperation({
            frame: MISC.entrance.frame,
            translate: new Point(vis.center.x, 0.25*vis.size.y),
            dims: vis.get("dominoes.entrance.dims"),
            effects: [glowEffect, vis.inkFriendlyEffect].flat(),
            pivot: Point.CENTER
        });
        group.add(res, op);
    }

}