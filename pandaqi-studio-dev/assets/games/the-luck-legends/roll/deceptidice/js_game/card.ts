import createContext from "js/pq_games/layout/canvas/createContext";
import fillCanvas from "js/pq_games/layout/canvas/fillCanvas";
import DropShadowEffect from "js/pq_games/layout/effects/dropShadowEffect";
import TintEffect from "js/pq_games/layout/effects/tintEffect";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import ResourceText from "js/pq_games/layout/resources/resourceText";
import TextConfig from "js/pq_games/layout/text/textConfig";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import getPositionsCenteredAround from "js/pq_games/tools/geometry/paths/getPositionsCenteredAround";
import getRectangleCornersWithOffset from "js/pq_games/tools/geometry/paths/getRectangleCornersWithOffset";
import Point from "js/pq_games/tools/geometry/point";
import { MISC, SPECIAL_BIDS, Suit } from "../js_shared/dict";

export default class Card
{
    num:number;
    suit:Suit;
    key:string; // only used for special cards/actions

    constructor(num:number = -1, suit:Suit = Suit.RED, key = "")
    {
        this.num = num;
        this.suit = suit;
        this.key = key;
    }

    isWildCard()
    {
        return this.num <= 0;
    }

    getSpecialData()
    {
        if(!this.key) { return {}; }
        return SPECIAL_BIDS[this.key] ?? {};
    }

    async draw(vis:MaterialVisualizer)
    {
        const ctx = createContext({ size: vis.size });
        fillCanvas(ctx, "#FFFFFF");

        const group = new ResourceGroup();
        this.drawBackground(vis, group);
        this.drawNumberAndSuit(vis, group);
        this.drawSpecial(vis, group);

        group.toCanvas(ctx);
        return ctx.canvas;
    }

    drawBackground(vis:MaterialVisualizer, group:ResourceGroup)
    {
        
    }

    drawNumberAndSuit(vis:MaterialVisualizer, group:ResourceGroup)
    {
        // @TODO: the basic display of number + color/shape of card
        // @TODO: check .isWildCard() to see if we draw the default wildcard thing instead (all suits in a rainbow, question mark for number)
    }

    drawSpecial(vis:MaterialVisualizer, group:ResourceGroup)
    {
        // @TODO: the special bid if it has one
        // -> the bids have unique numbers in `value` property, also display those prominently
    }
}