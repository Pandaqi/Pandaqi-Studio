import createContext from "js/pq_games/layout/canvas/createContext";
import fillCanvas from "js/pq_games/layout/canvas/fillCanvas";
import { CardType } from "../js_shared/dictShared";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import Point from "js/pq_games/tools/geometry/point";
import { MATERIAL, MISC, TEMPLATES } from "../js_shared/dict";
import TextConfig from "js/pq_games/layout/text/textConfig";
import ResourceText from "js/pq_games/layout/resources/resourceText";
import StrokeAlign from "js/pq_games/layout/values/strokeAlign";
import cardDrawerNaivigation from "../js_shared/cardDrawerNaivigation";
import MaterialNaivigation from "../js_shared/materialNaivigation";

export default class Card extends MaterialNaivigation
{
    getData() { return MATERIAL[this.type][this.key]; }
    getMisc() { return MISC; }
    async draw(vis)
    {
        const isDefaultType = (this.type != CardType.INSTRUCTION && this.type != CardType.COMPASS);
        if(isDefaultType)
        {
            return cardDrawerNaivigation(vis, this);
        }

        const ctx = createContext({ size: vis.size });
        fillCanvas(ctx, "#FFFFFF");
        const group = new ResourceGroup();
        if(this.type == CardType.INSTRUCTION) {
            this.drawInstruction(vis, group);
        } else if(this.type == CardType.COMPASS) {
            this.drawCompass(vis, group);
        }

        group.toCanvas(ctx);
        return ctx.canvas;
    }

    drawInstruction(vis, group)
    {
        // create the subgroup for instructions
        const subGroup = new ResourceGroup();

        const tempData = this.getTemplateData();
        const resSprite = vis.getResource("icons");
        const spriteOp = new LayoutOperation({
            frame: tempData.frameIcon,
            dims: new Point(vis.sizeUnit)
        })
        subGroup.add(resSprite, spriteOp);

        const textConfig = new TextConfig({
            font: vis.get("fonts.heading"),
            size: vis.get("cards.instruction.fontSize")
        }).alignCenter();

        const pos = vis.get("cards.instruction.textPos");
        const textPositions = [
            pos,
            pos.clone().setX(vis.size.x - pos.x)
        ]

        const text = this.customData.num.toString();
        const resText = new ResourceText({ text: text, textConfig: textConfig });

        for(const textPos of textPositions)
        {
            const textOp = new LayoutOperation({
                translate: textPos,
                dims: new Point(0.5*vis.sizeUnit), 
                fill: "#000000",
                stroke: "#FFFFFF",
                strokeWidth: vis.get("cards.instruction.strokeWidth"),
                strokeAlign: StrokeAlign.OUTSIDE,
                pivot: Point.CENTER
            });
            subGroup.add(resText, textOp);
        }

        // place it twice (one top, one bottom)
        group.add(subGroup);
        const op = new LayoutOperation({ translate: new Point(0, vis.center.y) })
        group.add(subGroup, op);

        console.log("WAT?");
    }

    drawCompass(vis, group)
    {
        console.log("QUE1");
        console.log(vis.get("cards.compass.dims"));

        const resSprite = vis.getResource("icons");
        const spriteOp = new LayoutOperation({
            translate: vis.center,
            frame: this.getTemplateData().frameIcon,
            dims: vis.get("cards.compass.dims"),
            pivot: Point.CENTER
        })
        group.add(resSprite, spriteOp);

        console.log("QUE2");
    }
}