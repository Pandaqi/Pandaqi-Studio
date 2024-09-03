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
import { MISC, POWER_CARDS } from "../js_shared/dict";

export default class Card
{
    num:number;
    key:string; // only used for special powers
    wildCard:boolean;

    constructor(num:number, key:string = "", wc:boolean = false)
    {
        this.num = num;
        this.key = key;
        this.wildCard = wc;
    }

    getPowerData()
    {
        if(!this.key) { return {}; }
        return POWER_CARDS[this.key] ?? {};
    }

    async draw(vis:MaterialVisualizer)
    {
        const ctx = createContext({ size: vis.size });
        fillCanvas(ctx, "#FFFFFF");

        const group = new ResourceGroup();
        this.drawBackground(vis, group);
        this.drawNumbers(vis, group);
        this.drawPower(vis, group);

        group.toCanvas(ctx);
        return ctx.canvas;
    }

    drawBackground(vis:MaterialVisualizer, group:ResourceGroup)
    {
        // @TODO
    }

    drawNumbers(vis:MaterialVisualizer, group:ResourceGroup)
    {
        // @TODO
    }

    drawPower(vis:MaterialVisualizer, group:ResourceGroup)
    {
        // @TODO
    }
}