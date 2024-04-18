import createContext from "js/pq_games/layout/canvas/createContext";
import DropShadowEffect from "js/pq_games/layout/effects/dropShadowEffect";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import ResourceText from "js/pq_games/layout/resources/resourceText";
import TextConfig from "js/pq_games/layout/text/textConfig";
import StrokeAlign from "js/pq_games/layout/values/strokeAlign";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import Point from "js/pq_games/tools/geometry/point";
import { CARD_TEMPLATES, CardSubType, CardType, SideDetails } from "../js_shared/dict";

export default class Card
{
    type: CardType;
    subType: CardSubType;
    num: number = -1;
    voteStorage:number = -1;
    sides: SideDetails;
    law: string = "";

    constructor(t:CardType, s:CardSubType)
    {
        this.type = t;
        this.subType = s;
    }

    setLaw(s:string) { this.law = s; }
    hasLaw() { return this.law != ""; }

    setVoteStorage(n:number) { this.voteStorage = n; }
    setSides(s: SideDetails) { this.sides = s; }
    hasSideDetails() { return this.sides != undefined; }

    setNumber(n:number) { this.num = n; }
    hasNumber() { this.num != -1; }
    isVote() { return this.type == CardType.VOTE; }
    isDecree() { return this.type == CardType.DECREE; }

    async draw(vis:MaterialVisualizer)
    {
        const ctx = createContext({ size: vis.size });
        const group = new ResourceGroup();

        this.drawBackground(vis, group);
        this.drawVoteDetails(vis, group);
        this.drawGoodBadSides(vis, group);
        this.drawLawText(vis, group);

        group.toCanvas(ctx);
        return ctx.canvas;
    }

    drawBackground(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const res = vis.getResource("card_templates");
        const key = this.type + "_" + this.subType;
        const frame = CARD_TEMPLATES[key].frame;
        const op = new LayoutOperation({
            translate: new Point(),
            dims: vis.size,
            frame: frame,
            effects: vis.inkFriendlyEffect
        });
        group.add(res, op);
    }

    drawVoteDetails(vis:MaterialVisualizer, group:ResourceGroup)
    {
        if(!this.isVote()) { return; }

        const textConfig = new TextConfig({
            font: vis.get("fonts.heading"),
            size: vis.get("votes.number.fontSize"),
        }).alignCenter();

        const textColor = vis.inkFriendly ? "#000000" : vis.get("votes.number.color");
        const strokeColor = vis.inkFriendly ? "#FFFFFF" : vis.get("votes.number.colorStroke");
        const pos = vis.get("votes.number.pos");
        const dropShadowEffect = new DropShadowEffect({ blurRadius: vis.get("cards.shared.dropShadowRadius")});

        const str = this.num.toString();
        const resText = new ResourceText({ text: str, textConfig: textConfig });
        const opText = new LayoutOperation({
            translate: pos,
            dims: vis.size,
            fill: textColor,
            stroke: strokeColor,
            strokeWidth: vis.get("votes.number.strokeWidth"),
            strokeAlign: StrokeAlign.OUTSIDE,
            pivot: Point.CENTER,
            effects: [dropShadowEffect]
        });
        group.add(resText, opText);

    }

    drawGoodBadSides(vis:MaterialVisualizer, group:ResourceGroup)
    {
        if(!this.isDecree()) { return; }
        if(!this.hasSideDetails()) { return; }

        // @TODO

    }

    drawLawText(vis:MaterialVisualizer, group:ResourceGroup)
    {
        if(!this.isDecree()) { return; }
        if(!this.hasLaw()) { return; }

        // @TODO
    }
}