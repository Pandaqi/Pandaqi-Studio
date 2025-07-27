import createContext from "js/pq_games/layout/canvas/createContext";
import fillCanvas from "js/pq_games/layout/canvas/fillCanvas";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import { Suit, TEMPLATES } from "../shared/dict";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import Point from "js/pq_games/tools/geometry/point";
import getRectangleCornersWithOffset from "js/pq_games/tools/geometry/paths/getRectangleCornersWithOffset";
import TextConfig from "js/pq_games/layout/text/textConfig";
import ResourceText from "js/pq_games/layout/resources/resourceText";

export default class Card
{
    suit: Suit;
    num: number;

    constructor(suit:Suit, num:number = 1)
    {
        this.suit = suit;
        this.num = num;
    }

    getSuitData()
    {
        return TEMPLATES[this.suit]
    }

    getTintColor(vis:MaterialVisualizer)
    {
        if(vis.inkFriendly) { return "#111111"; }
        return this.getSuitData().tint;
    }

    toString()
    {
        return "<b>" + this.num  + " / " + this.suit + "</b>";
    }

    async draw(vis:MaterialVisualizer)
    {
        const ctx = createContext({ size: vis.size });
        fillCanvas(ctx, "#FFFFFF");
        const group = new ResourceGroup();

        this.drawBackground(vis, group);
        this.drawMain(vis, group);
        this.drawNumbers(vis, group);

        group.toCanvas(ctx);
        return ctx.canvas;
    }

    drawBackground(vis:MaterialVisualizer, group:ResourceGroup)
    {
        if(vis.inkFriendly) { return; }

        const resTemp = vis.getResource("card_templates");
        const opBG = new LayoutOperation({
            size: vis.size,
            frame: this.getSuitData().frame
        });
        group.add(resTemp, opBG);
    }

    drawMain(vis:MaterialVisualizer, group:ResourceGroup)
    {
        // the main illustration (of suit)
        const resMisc = vis.getResource("misc");
        const opIllustration = new LayoutOperation({
            pos: vis.get("cards.main.pos"),
            size: vis.get("cards.main.size"),
            frame: this.getSuitData().frame,
            pivot: Point.CENTER,
            effects: vis.inkFriendlyEffect
        });
        group.add(resMisc, opIllustration);

        // the "fits on top of" graphic
        const opFits = new LayoutOperation({
            pos: vis.get("cards.fitsOnTop.pos"),
            size: vis.get("cards.fitsOnTop.size"),
            frame: this.getSuitData().frame + 2 * 4,
            pivot: Point.CENTER,
            effects: vis.inkFriendlyEffect
        })
        group.add(resMisc, opFits);
    }

    drawNumbers(vis:MaterialVisualizer, group:ResourceGroup)
    {
        // draw the numbers themselves first
        const positions = getRectangleCornersWithOffset(vis.size, vis.get("cards.numbers.offset"));
        const scaleDown = this.num >= 10 ? vis.get("cards.numbers.doubleDigitsScaleDown") : 1.0;

        const textConfig = new TextConfig({
            font: vis.get("fonts.heading"),
            size: vis.get("cards.numbers.fontSize") * scaleDown
        }).alignCenter();
        const resText = new ResourceText({ text: this.num.toString(), textConfig: textConfig });

        for(const pos of positions)
        {
            const opNumber = new LayoutOperation({
                pos: pos,
                size: new Point(2.0 * textConfig.size),
                pivot: Point.CENTER,
                fill: this.getTintColor(vis)
            });
            group.add(resText, opNumber);
        }

        // then draw the suit icons next to them
        const positionsSuits = getRectangleCornersWithOffset(vis.size, vis.get("cards.suitIcons.offset"));
        const resMisc = vis.getResource("misc");
        for(let i = 0; i < 4; i++)
        {
            const pos = positionsSuits[i];
            const opNumber = new LayoutOperation({
                pos: pos,
                flipX: (i == 1 || i == 2),
                flipY: i >= 2,
                size: vis.get("cards.suitIcons.size"),
                frame: this.getSuitData().frame + 4,
                pivot: Point.CENTER,
                effects: vis.inkFriendlyEffect
            });
            group.add(resMisc, opNumber);
        }
    }
}