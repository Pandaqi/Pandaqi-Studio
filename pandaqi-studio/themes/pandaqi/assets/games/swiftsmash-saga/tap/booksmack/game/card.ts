
import { MaterialVisualizer, ResourceGroup, LayoutOperation, getRectangleCornersWithOffset, TextConfig, ResourceText, Vector2, DropShadowEffect } from "lib/pq-games";
import { SYMBOLS } from "../shared/dict";

export default class Card
{
    symbol: string;

    constructor(sym:string)
    {
        this.symbol = sym;
    }

    getActionData() { return SYMBOLS[this.symbol] ?? {}; }
    hasSpecialAction() { return Object.keys(this.getActionData()).length > 0; }

    async draw(vis:MaterialVisualizer)
    {
        const group = vis.renderer.prepareDraw();
        this.drawBackground(vis, group);
        this.drawSymbol(vis, group);
        this.drawAction(vis, group);
        return vis.renderer.finishDraw({ group: group, size: vis.size });
    }

    drawBackground(vis:MaterialVisualizer, group:ResourceGroup)
    {
        if(vis.inkFriendly) { return; }

        const res = vis.getResource("card_templates");
        const op = new LayoutOperation({
            size: vis.size,
            frame: 0
        });
        group.add(res, op);
    }

    drawSymbol(vis:MaterialVisualizer, group:ResourceGroup)
    {
        // the four corners
        const positions = getRectangleCornersWithOffset(vis.size, vis.get("cards.corners.offset"));
        const textConfigCorner = new TextConfig({
            font: vis.get("fonts.heading"),
            size: vis.get("cards.corners.fontSize")
        }).alignCenter();
        const resTextCorner = new ResourceText({ text: this.symbol, textConfig: textConfigCorner });

        for(let i = 0; i < positions.length; i++)
        {
            const opCorner = new LayoutOperation({
                pos: positions[i],
                size: new Vector2(2.0 * textConfigCorner.size),
                pivot: Vector2.CENTER,
                fill: vis.inkFriendly ? "#777777" : "#FFFFFF",
                composite: vis.inkFriendly ? "source-over" : "overlay"
            });

            group.add(resTextCorner, opCorner);
        }

        // the big symbol in the center
        const pos = this.hasSpecialAction() ? vis.get("cards.main.posWithAction") : vis.get("cards.main.pos");
        const textConfig = new TextConfig({
            font: vis.get("fonts.heading"),
            size: vis.get("cards.main.fontSize")
        }).alignCenter();
        const resText = new ResourceText({ text: this.symbol, textConfig: textConfig });
        const opText = new LayoutOperation({
            pos: pos,
            size: new Vector2(2.0 * textConfig.size),
            pivot: Vector2.CENTER,
            fill: vis.inkFriendly ? "#000000" : "#FFFFFF",
            effects: vis.inkFriendly ? [] : [new DropShadowEffect({ color: "#000000", blur: vis.get("cards.main.shadowBlur") })]
        });
        group.add(resText, opText);
    }

    drawAction(vis:MaterialVisualizer, group:ResourceGroup)
    {
        if(!this.hasSpecialAction()) { return; }

        const data = this.getActionData();

        // the modal/box to put the text within
        const resModal = vis.getResource("card_templates");
        const opModal = new LayoutOperation({
            size: vis.size,
            frame: 1,
            effects: vis.inkFriendlyEffect,
            alpha: vis.inkFriendly ? 0.66 : 1.0
        });
        group.add(resModal, opModal);

        // title of card
        const textConfigTitle = new TextConfig({
            font: vis.get("fonts.heading"),
            size: vis.get("cards.action.title.fontSize")
        }).alignCenter();
        const resTextTitle = new ResourceText({ text: data.label, textConfig: textConfigTitle });
        const textColor = vis.inkFriendly ? "#111111" : vis.get("cards.action.textColor");
        const opTextTitle = new LayoutOperation({
            pos: vis.get("cards.action.title.pos"),
            size: new Vector2(vis.size.x, 2*textConfigTitle.size),
            pivot: Vector2.CENTER,
            fill: textColor
        })
        group.add(resTextTitle, opTextTitle);

        // textual explanation
        const textConfig = new TextConfig({
            font: vis.get("fonts.body"),
            size: vis.get("cards.action.text.fontSize")
        }).alignCenter();
        const resText = new ResourceText({ text: data.desc, textConfig: textConfig });
        const opText = new LayoutOperation({
            pos: vis.get("cards.action.text.pos"),
            size: vis.get("cards.action.text.boxSize"),
            pivot: Vector2.CENTER,
            fill: textColor
        })
        group.add(resText, opText);
    }
}