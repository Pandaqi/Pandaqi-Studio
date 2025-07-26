import createContext from "lib/pq-games/layout/canvas/createContext";
import fillCanvas from "lib/pq-games/layout/canvas/fillCanvas";
import { CardType } from "../js_shared/dictShared";
import ResourceGroup from "lib/pq-games/layout/resources/resourceGroup";
import LayoutOperation from "lib/pq-games/layout/layoutOperation";
import Point from "lib/pq-games/tools/geometry/point";
import { MATERIAL, MISC, TEMPLATES } from "../js_shared/dict";
import TextConfig from "lib/pq-games/layout/text/textConfig";
import ResourceText from "lib/pq-games/layout/resources/resourceText";
import StrokeAlign from "lib/pq-games/layout/values/strokeAlign";
import cardDrawerNaivigation from "../js_shared/cardDrawerNaivigation";
import MaterialNaivigation from "../js_shared/materialNaivigation";
import DropShadowEffect from "lib/pq-games/layout/effects/dropShadowEffect";
import MaterialVisualizer from "lib/pq-games/tools/generation/materialVisualizer";

export default class Card extends MaterialNaivigation
{
    getData() { return MATERIAL[this.type][this.key] ?? {}; }
    getMisc() { return MISC; }
    async draw(vis:MaterialVisualizer)
    {
        const group = vis.renderer.prepareDraw();
        if(this.type == CardType.INSTRUCTION) {
            this.drawInstruction(vis, group);
        } else if(this.type == CardType.COMPASS) {
            this.drawCompass(vis, group);
        } else {
            cardDrawerNaivigation(vis, group, this);
        }
        return vis.renderer.finishDraw({ group: group, size: vis.size });
    }

    drawInstruction(vis:MaterialVisualizer, group:ResourceGroup)
    {
        // create the subgroup for instructions
        const subGroup = new ResourceGroup();

        const tempData = this.getTemplateData();
        const resSprite = vis.getResource("icons_shared");
        const spriteOp = new LayoutOperation({
            frame: tempData.frameIcon,
            size: new Point(vis.sizeUnit),
            effects: vis.inkFriendlyEffect
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
        const eff = new DropShadowEffect({ color: "#000000AA", offset: new Point(0, 0.125*textConfig.size) });

        for(const textPos of textPositions)
        {
            const textOp = new LayoutOperation({
                pos: textPos,
                size: new Point(0.5*vis.sizeUnit), 
                fill: "#000000",
                stroke: "#FFFFFF",
                strokeWidth: vis.get("cards.instruction.strokeWidth"),
                strokeAlign: StrokeAlign.OUTSIDE,
                pivot: Point.CENTER,
                effects: [eff]
            });
            subGroup.add(resText, textOp);
        }

        // place it twice (one top, one bottom)
        group.add(subGroup);
        const op = new LayoutOperation({ pos: new Point(0, vis.center.y) })
        group.add(subGroup, op);
    }

    drawCompass(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const resSprite = vis.getResource("icons_shared");
        const spriteOp = new LayoutOperation({
            pos: vis.center,
            frame: this.getTemplateData().frameIcon,
            size: vis.get("cards.compass.size"),
            effects: vis.inkFriendlyEffect,
            pivot: Point.CENTER
        })
        group.add(resSprite, spriteOp);
    }
}