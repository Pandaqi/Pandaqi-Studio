import createContext from "js/pq_games/layout/canvas/createContext";
import CONFIG from "../js_shared/config";
import strokeCanvas from "js/pq_games/layout/canvas/strokeCanvas";
import Visualizer from "./visualizer";
import { ACTIONS, CardType } from "../js_shared/dict";

export default class Card
{
    type: CardType;
    num: number;
    action: string;

    constructor(type:CardType, num:number, action: string)
    {
        this.type = type;
        this.num = num;
        this.action = action;
    }

    async drawForRules(cfg)
    {
        // @TODO
    }

    hasAction() { return this.action != null; }
    getPurchaseCost()
    {
        const numCost = CONFIG.generation.coinsPerNumber[this.num] ?? 0;
        const actionCost = this.hasAction() ? ACTIONS[this.action] : CONFIG.generation.defCoinsPerAction; 
        return numCost + actionCost;
    }

    toString()
    {
        return this.type + " " + this.num;
    }

    async draw(vis:Visualizer)
    {
        const ctx = createContext({ size: vis.size });
        this.drawOutline(vis, ctx);
        return ctx.canvas;
    }


    drawOutline(vis:Visualizer, ctx)
    {
        const outlineSize = CONFIG.cards.outline.size * vis.sizeUnit;
        strokeCanvas(ctx, CONFIG.cards.outline.color, outlineSize);
    }
}