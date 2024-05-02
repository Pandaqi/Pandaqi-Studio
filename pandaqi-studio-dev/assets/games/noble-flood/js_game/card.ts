import createContext from "js/pq_games/layout/canvas/createContext";
import fillCanvas from "js/pq_games/layout/canvas/fillCanvas";
import fillResourceGroup from "js/pq_games/layout/canvas/fillResourceGroup";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import { CONTRACTS, CardType, NUMBERS_AS_STRINGS } from "../js_shared/dict";
import Point from "js/pq_games/tools/geometry/point";
import TextConfig from "js/pq_games/layout/text/textConfig";
import ResourceText from "js/pq_games/layout/resources/resourceText";
import LayoutOperation from "js/pq_games/layout/layoutOperation";

export default class Card
{
    type:CardType
    suit: string
    number: number
    contractKey: string;
    specialKey: string;
    dynamicDetails: any[];

    constructor(type:CardType)
    {
        this.type = type;
    }

    toRulesString()
    {
        return "NUM = " + this.getNumberAsString() + " / SUIT = " + this.suit;
    }

    setSpecial(s:string) { this.specialKey = s; }
    setContract(c:string, dynDetails:any[]) { this.contractKey = c; this.dynamicDetails = dynDetails; }
    setSuitAndNumber(s:string, n:number)
    {
        this.suit = s;
        this.number = n;
    }

    getDynamicDetails() { return this.dynamicDetails; }
    getNumberAsString()
    {
        return NUMBERS_AS_STRINGS[(this.number - 1)];
    }

    getScore(success = false)
    {
        const score = CONTRACTS[this.contractKey].score ?? 1;
        if(success) { return score; }
        return -Math.floor(0.5 * (10 - score));
    }

    async drawForRules(vis:MaterialVisualizer)
    {
        return this.draw(vis);
    }

    async draw(vis:MaterialVisualizer)
    {
        const ctx = createContext({ size: vis.size });
        fillCanvas(ctx, "#FFFFFF");
        const group = new ResourceGroup();

        this.drawBackground(vis, group);

        group.toCanvas(ctx);
        return ctx.canvas;
    }

    drawBackground(vis:MaterialVisualizer, group:ResourceGroup)
    {
        // solid background color
        const col = "#DEDEDE";
        fillResourceGroup(vis.size, group, col);

        // @DEBUGGING: suit name
        const fontSize = 144;
        const textConfig = new TextConfig({
            font: vis.get("fonts.heading"),
            size: fontSize
        }).alignCenter();
        const resTextSuit = new ResourceText({ text: this.suit, textConfig });
        const opTextSuit = new LayoutOperation({
            translate: new Point(vis.center.x, 0.25*vis.size.y),
            dims: vis.size,
            fill: "#000000",
            pivot: Point.CENTER
        });
        group.add(resTextSuit, opTextSuit);

        // @DEBUGGING: card number
        const resTextNum = new ResourceText({ text: this.getNumberAsString(), textConfig });
        const opTextNum = new LayoutOperation({
            translate: new Point(vis.center.x, 0.75*vis.size.y),
            dims: vis.size,
            fill: "#000000",
            pivot: Point.CENTER
        });
        group.add(resTextNum, opTextNum)
    }
}