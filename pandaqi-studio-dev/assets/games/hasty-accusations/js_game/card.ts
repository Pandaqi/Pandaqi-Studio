import createContext from "js/pq_games/layout/canvas/createContext";
import { MISC, Type } from "../js_shared/dict";
import CONFIG from "../js_shared/config";
import strokeCanvas from "js/pq_games/layout/canvas/strokeCanvas";
import Point from "js/pq_games/tools/geometry/point";
import Visualizer from "./visualizer";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import fillCanvas from "js/pq_games/layout/canvas/fillCanvas";
import Color from "js/pq_games/layout/color/color";
import getRectangleCornersWithOffset from "js/pq_games/tools/geometry/paths/getRectangleCornersWithOffset";
import Rectangle from "js/pq_games/tools/geometry/rectangle";
import Path from "js/pq_games/tools/geometry/paths/path";
import ResourceShape from "js/pq_games/layout/resources/resourceShape";
import bevelCorners from "js/pq_games/tools/geometry/paths/bevelCorners";
import ResourceText from "js/pq_games/layout/resources/resourceText";
import TextConfig, { TextAlign } from "js/pq_games/layout/text/textConfig";
import StrokeAlignValue from "js/pq_games/layout/values/strokeAlignValue";
import DropShadowEffect from "js/pq_games/layout/effects/dropShadowEffect";
import LayoutEffect from "js/pq_games/layout/effects/layoutEffect";
import ColorLike from "js/pq_games/layout/color/colorLike";

export default class Card
{
    type: Type; // LIFE or NUMBER
    cats: string[];
    power: string;
    data: any;

    ctx: CanvasRenderingContext2D;
    size: Point;
    sizeUnit: number;

    constructor(type:Type)
    {
        this.type = type;
    }

    async drawForRules(vis:Visualizer)
    {
        const ctx = createContext({ size: vis.size });
        this.ctx = ctx;

        let color = "#FFFFFF";
        fillCanvas(this.ctx, color);

        // @TODO
        this.drawOutline(vis);
        
        return this.getCanvas();
    }


    getCanvas() { return this.ctx.canvas; }
    async draw(vis:Visualizer)
    {
        const ctx = createContext({ size: vis.size });
        this.ctx = ctx;

        await this.drawBackground(vis);

        // @TODO

        this.drawOutline(vis);

        return this.getCanvas();
    }


    async drawBackground(vis:Visualizer)
    {
        // first solid color
        let color = "#FFFFFF"; // @TODO
        fillCanvas(this.ctx, color);
    }

    drawOutline(vis:Visualizer)
    {
        const outlineSize = CONFIG.cards.outline.size * vis.sizeUnit;
        strokeCanvas(this.ctx, CONFIG.cards.outline.color, outlineSize);
    }
}