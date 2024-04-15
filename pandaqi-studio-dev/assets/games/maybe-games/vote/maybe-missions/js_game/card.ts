import createContext from "js/pq_games/layout/canvas/createContext";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import { CardPowerData, CardResourceData, CardSubType, CardType } from "../js_shared/dict";

export default class Card
{
    type: CardType;
    subType: CardSubType;
    num: number;
    rule: string;
    resources: CardResourceData;
    powers: CardPowerData;

    constructor(t:CardType, s:CardSubType)
    {
        this.type = t;
        this.subType = s;
    }

    setRule(r:string) { this.rule = r; }
    setResources(d:CardResourceData) { this.resources = d; }
    setPowers(p:CardPowerData) { this.powers = p; }

    async draw(vis:MaterialVisualizer)
    {
        const ctx = createContext({ size: vis.size });
        const group = new ResourceGroup();

        this.drawBackground(vis, group);
        this.drawResources(vis, group);
        this.drawSpecial(vis, group);

        group.toCanvas(ctx);
        return ctx.canvas;
    }

    drawBackground(vis:MaterialVisualizer, group:ResourceGroup)
    {
        // @TODO: draw any colors/texture/rects needed for background
    }

    drawResources(vis:MaterialVisualizer, group:ResourceGroup)
    {
        // @TODO: draw icons at top and bottom side
    }

    drawSpecial(vis:MaterialVisualizer, group:ResourceGroup)
    {
        // @TODO: draw whatever is in the middle
        // Probably IMAGE + RULE for Master cards
        // And some random "break into vault" and "shoot the guard" texts for any other cards? Or just empty?
    }
}