import createContext from "js/pq_games/layout/canvas/createContext";
import fillCanvas from "js/pq_games/layout/canvas/fillCanvas";
import strokeCanvas from "js/pq_games/layout/canvas/strokeCanvas";
import Color from "js/pq_games/layout/color/color";
import GrayScaleEffect from "js/pq_games/layout/effects/grayScaleEffect";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import ResourceShape from "js/pq_games/layout/resources/resourceShape";
import ResourceText from "js/pq_games/layout/resources/resourceText";
import TextConfig, { TextAlign } from "js/pq_games/layout/text/textConfig";
import StrokeAlign from "js/pq_games/layout/values/strokeAlign";
import bevelCorners from "js/pq_games/tools/geometry/paths/bevelCorners";
import getRectangleCornersWithOffset from "js/pq_games/tools/geometry/paths/getRectangleCornersWithOffset";
import Path from "js/pq_games/tools/geometry/paths/path";
import Point from "js/pq_games/tools/geometry/point";
import Rectangle from "js/pq_games/tools/geometry/rectangle";
import CONFIG from "../shared/config";
import { CATS, POWERS } from "../shared/dict";
import Visualizer from "./visualizer";

export default class Card
{
    suit: string
    num: number
    power: string

    constructor(suit:string, num:number)
    {
        this.suit = suit;
        this.num = num;
    }

    async drawForRules(vis:Visualizer)
    {
        const ctx = createContext({ size: vis.size });
        fillCanvas(ctx, "#FFFFFF");

        await this.drawCorners(vis, ctx);
        await this.drawMainIllustration(vis, ctx);

        this.drawOutline(vis, ctx);
        return ctx.canvas;
    }

    getData() { return CATS[this.suit]; }
    async draw(vis:Visualizer)
    {
        const ctx = createContext({ size: vis.size });

        await this.drawBackground(vis, ctx);
        await this.drawCorners(vis, ctx);
        await this.drawMainIllustration(vis, ctx);
        await this.drawPower(vis, ctx);

        this.drawOutline(vis, ctx);
        return ctx.canvas;
    }

    async drawBackground(vis:Visualizer, ctx)
    {
        // first solid color
        let color = CONFIG.cards.shared.defaultBGColor;
        if(vis.inkFriendly) { color = "#FFFFFF"; }
        fillCanvas(ctx, color);

        // then the specific pattern
        let alpha = CONFIG.cards.bgCats.patternAlpha;
        if(vis.inkFriendly) { return; }

        const pattern = vis.patternCat;
        const rot = CONFIG.cards.bgCats.patternRotation;
        const op = new LayoutOperation({
            pos: vis.center,
            alpha: alpha,
            rot: rot,
            pivot: Point.CENTER
        })
        await pattern.toCanvas(ctx, op);
    }

    async drawCorners(vis:Visualizer, ctx)
    {
        await this.drawCornerNumbers(vis, ctx);
        await this.drawCornerSuits(vis, ctx);
    }

    async drawCornerNumbers(vis:Visualizer, ctx)
    {
        // first the text (number of the card)
        const fontSize = CONFIG.cards.corners.fontSize * vis.sizeUnit;
        const textConfig = new TextConfig({
            font: CONFIG.fonts.heading,
            size: fontSize,
            alignHorizontal: TextAlign.MIDDLE,
            alignVertical: TextAlign.MIDDLE
        });

        const text = this.num.toString();
        const resText = new ResourceText({ text: text, textConfig: textConfig });

        const offset = new Point(fontSize * 0.5 * CONFIG.cards.corners.offsetText);
        const positions = getRectangleCornersWithOffset(vis.size, offset);
        const color = this.getData().color;
        const lighten = this.getData().colorLighten ?? CONFIG.cards.shared.colorLighten;
        const darken = this.getData().colorDarken ?? CONFIG.cards.shared.colorDarken;
        const colorDark = vis.inkFriendly ? "#111111" : new Color(color).darken(darken);
        const colorLight = new Color(color).lighten(lighten);
        const strokeWidth = CONFIG.cards.corners.strokeWidth * fontSize;

        for(let i = 0; i < positions.length; i++)
        {
            const rot = i <= 1 ? 0 : Math.PI;
            const pos = positions[i];
            const op = new LayoutOperation({
                pos: pos,
                size: new Point(vis.size.x, fontSize),
                fill: colorDark,
                stroke: colorLight,
                strokeWidth: strokeWidth,
                strokeAlign: StrokeAlign.OUTSIDE,
                pivot: Point.CENTER,
                rot: rot,
                effects: vis.effects
            })

            await resText.toCanvas(ctx, op);
        }
    }

    async drawCornerSuits(vis:Visualizer, ctx)
    {
        const fontSize = CONFIG.cards.corners.fontSize * vis.sizeUnit;
        const offset = new Point(fontSize * 0.5 * CONFIG.cards.corners.offsetText);
        const positions = getRectangleCornersWithOffset(vis.size, offset);

        // then the suit icon below
        const resIcon = vis.resLoader.getResource("suits");
        const sizeIcon = CONFIG.cards.corners.iconSize * fontSize;
        const offsetIcon = (0.5 * fontSize + 0.5*sizeIcon) * CONFIG.cards.corners.offsetIcon;
        const frame = this.getData().frame;
        const effects = vis.inkFriendly ? [new GrayScaleEffect()] : [];

        // the icon draws its outline dynamically; this is an experiment, could've just baked those into the original images
        //const effectsIcon = vis.effects.slice();
        //effectsIcon.unshift(new OutlineEffect({ color: colorLight, thickness: strokeWidth }));

        for(let i= 0; i < positions.length; i++)
        {
            const rot = i <= 1 ? 0 : Math.PI;
            const offsetDir = i <= 1 ? 1 : -1;
            const pos = positions[i].clone().move(new Point(0, offsetDir * offsetIcon));
            const op = new LayoutOperation({
                frame: frame,
                size: new Point(sizeIcon),
                pos: pos,
                rot: rot,
                pivot: Point.CENTER,
                effects: effects,
            })

            await resIcon.toCanvas(ctx, op);
        }
    }

    async drawMainIllustration(vis:Visualizer, ctx)
    {
        const extentsRect = vis.size.clone().scale(CONFIG.cards.powers.rectSize);
        const offsetFactor = CONFIG.includePowers ? CONFIG.cards.illustration.offset : 0.0;
        const offset = 0.5 * offsetFactor * extentsRect.y;
        const size = new Point(CONFIG.cards.illustration.size * vis.sizeUnit);
        const res = vis.resLoader.getResource("cats");
        const frame = this.getData().frame;
        const effects = vis.inkFriendly ? [new GrayScaleEffect()] : [];

        for(let i = 0; i < 2; i++)
        {
            const dir = (i == 0) ? -1 : 1;
            const rot = (i == 0) ? 0 : Math.PI;
            const pos = vis.center.clone().move(new Point(0, dir * offset));
            const op = new LayoutOperation({
                frame: frame,
                pos: pos,
                size: size,
                rot: rot,
                pivot: new Point(0.5, 1),
                effects: effects
            })

            await res.toCanvas(ctx, op);
        }
    }

    async drawPower(vis:Visualizer, ctx)
    {
        if(!CONFIG.includePowers) { return; }

        // the background rectangle
        const extents = vis.size.clone().scale(CONFIG.cards.powers.rectSize);
        const extentsUnit = Math.min(extents.x, extents.y);;
        const rect = new Rectangle({ center: vis.center, extents: extents });
        const bevelSize = CONFIG.cards.powers.rectBevel * extentsUnit;
        const rectBeveled = bevelCorners(rect.toPath(), bevelSize);
        const pathObj = new Path({points: rectBeveled, close: true });
        const shape = new ResourceShape({ shape: pathObj });
                
        const color = this.getData().color;
        const lighten = this.getData().colorLighten ?? CONFIG.cards.shared.colorLighten;
        const colorLight = vis.inkFriendly ? "#FFFFFF" : new Color(color).lighten(lighten);
        const strokeWidth = CONFIG.cards.powers.rectStrokeWidth * vis.sizeUnit;

        const op = new LayoutOperation({
            fill: colorLight,
            stroke: "#000000",
            strokeWidth: strokeWidth,
            strokeAlign: StrokeAlign.OUTSIDE,
            effects: vis.effects
        })
        await shape.toCanvas(ctx, op);

        // the text inside
        const fontSize = CONFIG.cards.powers.fontSize * vis.sizeUnit;
        const textConfig = new TextConfig({
            font: CONFIG.fonts.body,
            size: fontSize,
            alignHorizontal: TextAlign.MIDDLE,
            alignVertical: TextAlign.MIDDLE
        });

        const text = this.power ? POWERS[this.power].desc : "-";
        const resText = new ResourceText({ text: text, textConfig: textConfig });
        const padding = CONFIG.cards.powers.textPadding.clone().scale(extentsUnit);
        const extentsText = new Point(extents.x - 2*padding.x, extents.y - 2*padding.y);

        const opText = new LayoutOperation({
            size: extentsText,
            pos: vis.center,
            fill: "#000000",
            pivot: Point.CENTER
        })
        await resText.toCanvas(ctx, opText);
    }

    drawOutline(vis:Visualizer, ctx)
    {
        const outlineSize = CONFIG.cards.outline.size * vis.sizeUnit;
        strokeCanvas(ctx, CONFIG.cards.outline.color, outlineSize);
    }
}