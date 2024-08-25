import createContext from "js/pq_games/layout/canvas/createContext";
import fillCanvas from "js/pq_games/layout/canvas/fillCanvas";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import { BID_CARDS, CardType, Suit } from "../js_shared/dict";

export default class Card
{
    type: CardType;
    key: string;
    num: number;
    suit: Suit;

    constructor(type:CardType, num:number = 0, key:string = "")
    {
        this.num = num;
        this.key = key;
        this.type = type;
    }

    async draw(vis:MaterialVisualizer)
    {
        const ctx = createContext({ size: vis.size });
        fillCanvas(ctx, "#FFFFFF");
        const group = new ResourceGroup();

        if(this.type == CardType.REGULAR) {
            this.drawRegularCard(vis, group);
        } else if(this.type == CardType.BID) {
            this.drawBidCard(vis, group);
        } else if(this.type == CardType.TOKEN) {
            this.drawToken(vis, group);
        }

        group.toCanvas(ctx);
        return ctx.canvas;
    }

    drawRegularCard(vis:MaterialVisualizer, group:ResourceGroup)
    {
        // @TODO: display suit + number + some background template
    }

    drawBidCard(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const data = BID_CARDS[this.key];

        // @TODO: bg template
        // @TODO: unique icon, title, explanatory text
        // @TODO: score for this bid
        // @TODO: if BONUS BID (in data), different background/mark this somehow
    }

    drawToken(vis:MaterialVisualizer, group:ResourceGroup)
    {
        // @TODO: literally just a simple background with a huge number in the center
    }

    
}