
import { EGGS_SHARED } from "games/easter-eggventures/shared/dictShared";
import { MaterialVisualizer, createContext, ResourceGroup, LayoutOperation, Vector2, TextConfig, TextWeight, TextAlign, ResourceText } from "lib/pq-games";
import { CardType, TYPE_DATA } from "../shared/dict";

export default class Card
{
    type: CardType;
    customData: Record<string,any>;

    constructor(t:CardType, d:Record<string,any> = {})
    {
        this.type = t;
        this.customData = d;
    }

    getTypeData() { return TYPE_DATA[this.type]; }

    async draw(vis:MaterialVisualizer)
    {
        const ctx = createContext({ size: vis.size });
        const group = new ResourceGroup();

        if(this.type == CardType.CLUE) {
            this.drawClueCard(vis, group);
        } else if(this.type == CardType.SCORE) {
            this.drawScoreCard(vis, group);
        }

        group.toCanvas(ctx);
        return ctx.canvas;
    }

    drawClueCard(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const typeData = this.getTypeData();
        const res = vis.getResource(typeData.textureKey);
        const op = new LayoutOperation({
            pos: new Vector2(),
            frame: this.customData.num,
            size: vis.size,
            effects: vis.inkFriendlyEffect
        })
        group.add(res, op);
    }

    drawScoreCard(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const values = this.customData.scoringValues;
        const num = Object.keys(values).length;
        const heightPerEgg = vis.size.y / num;
        const halfHeight = 0.5*heightPerEgg;

        const fontSize = vis.get("cards.score.fontSize");
        const textConfig = new TextConfig({
            font: vis.get("fonts.heading"),
            size: fontSize,
            weight: TextWeight.BOLD,
            alignVertical: TextAlign.MIDDLE,
        });
        const textDims = new Vector2(0.5 * vis.size.x, 2*fontSize);
        const resEggs = vis.getResource("eggs");
        const eggDims = new Vector2(1.5*fontSize);

        let counter = 0;
        for(const [key,freq] of Object.entries(values))
        {
            const pos = new Vector2(vis.center.x, counter * heightPerEgg + halfHeight);

            // the egg illustration
            const opEggs = new LayoutOperation({
                pos: new Vector2(pos.x - eggDims.x, pos.y),
                size: eggDims,
                frame: EGGS_SHARED[key].frame,
                pivot: Vector2.CENTER,
                effects: vis.inkFriendlyEffect
            })
            group.add(resEggs, opEggs);

            // the value text
            const text = "= " + freq;
            const resText = new ResourceText({ text: text, textConfig: textConfig });
            const opText = new LayoutOperation({
                pos: pos,
                size: textDims,
                pivot: new Vector2(0, 0.5),
                fill: "#000000"
            });

            group.add(resText, opText);
            counter++;
        }
    }
}