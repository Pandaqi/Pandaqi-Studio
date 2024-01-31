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

export default class Card
{
    type: CardType
    key: string
    customData:Record<string,any>;

    constructor(t:CardType, k:string = "")
    {
        this.type = t;
        this.key = k;
    }

    getData() { return MATERIAL[this.key][this.type]; }
    getTemplateData() { return TEMPLATES[this.type]; }
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

        const text = this.customData.num.toString();
        const resText = new ResourceText({ text: text, textConfig: textConfig });
        const textOp = new LayoutOperation({
            translate: vis.get("cards.instruction.textPos"),
            dims: new Point(0.5*vis.sizeUnit), 
            fill: "#000000",
            stroke: "#FFFFFF",
            strokeWidth: vis.get("cards.instruction.strokeWidth"),
            strokeAlign: StrokeAlign.OUTSIDE,
            pivot: Point.CENTER
        });

        subGroup.add(resText, textOp.clone());

        textOp.translate.x = vis.size.x - textOp.translate.x;
        subGroup.add(resText, textOp)

        // place it twice (one top, one bottom)
        group.add(subGroup);
        const op = new LayoutOperation({ translate: new Point(0, vis.center.y) })
        group.add(subGroup, op);
    }

    drawCompass(vis, group)
    {
        const resSprite = vis.getResource("icons");
        const spriteOp = new LayoutOperation({
            translate: vis.center,
            frame: this.getTemplateData().frameIcon,
            dims: vis.get("cards.compass.dims"),
            pivot: Point.CENTER
        })
        group.add(resSprite, spriteOp);
    }
}