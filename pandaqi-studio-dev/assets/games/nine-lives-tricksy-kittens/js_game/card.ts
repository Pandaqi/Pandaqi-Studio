import createContext from "js/pq_games/layout/canvas/createContext";
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
import { SUITS } from "games/nine-lives-math-meows/js_shared/dict";
import OutlineEffect from "js/pq_games/layout/effects/outlineEffect";

export default class Card
{
    suit: string
    num: number
    power: string

    ctx: CanvasRenderingContext2D;

    constructor(suit:string, num:number)
    {
        this.suit = suit;
        this.num = num;
    }

    async drawForRules(cfg)
    {
        // @TODO
    }

    getCanvas() { return this.ctx.canvas; }
    async draw(vis:Visualizer)
    {
        const ctx = createContext({ size: vis.size });
        this.ctx = ctx;

        await this.drawBackground(vis);
        await this.drawCorners(vis);
        await this.drawMainIllustration(vis);
        await this.drawPower(vis);

        this.drawOutline(vis);
        return this.getCanvas();
    }

    async drawBackground(vis:Visualizer)
    {
        // first solid color
        let color = CONFIG.cards.shared.defaultBGColor;
        if(vis.inkFriendly) { color = "#FFFFFF"; }
        fillCanvas(this.ctx, color);

        // then the specific pattern
        let alpha = CONFIG.cards.bgCats.patternAlpha;
        if(vis.inkFriendly) { return; }

        const pattern = vis.patternCat;
        const rot = CONFIG.cards.bgCats.patternRotation;
        const op = new LayoutOperation({
            translate: vis.center,
            alpha: alpha,
            rotation: rot,
            pivot: Point.CENTER
        })
        await pattern.toCanvas(this.ctx, op);
    }

    async drawCorners(vis:Visualizer)
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
        const color = SUITS[this.suit].color;
        const colorLight = new Color(color).lighten(CONFIG.cards.shared.colorLighten);
        const strokeWidth = CONFIG.cards.corners.strokeWidth * fontSize;

        for(let i = 0; i < positions.length; i++)
        {
            const rot = i <= 1 ? 0 : Math.PI;
            const pos = positions[i];
            const op = new LayoutOperation({
                translate: pos,
                dims: new Point(vis.size.x, fontSize),
                fill: color,
                stroke: colorLight,
                strokeWidth: strokeWidth,
                strokeAlign: StrokeAlignValue.OUTSIDE,
                pivot: Point.CENTER,
                rotation: rot,
                effects: vis.effects
            })

            await resText.toCanvas(this.ctx, op);
        }

        // then the suit icon below
        const resIcon = vis.resLoader.getResource("suits");
        const dimsIcon = CONFIG.cards.corners.iconSize * fontSize;
        const offsetIcon = (0.5 * fontSize + 0.5*dimsIcon) * CONFIG.cards.corners.offsetIcon;
        const frame = SUITS[this.suit].frame;

        // the icon draws its outline dynamically; this is an experiment, could've just baked those into the original images
        const effectsIcon = vis.effects.slice();
        effectsIcon.unshift(new OutlineEffect({ color: colorLight, thickness: strokeWidth }));

        for(let i= 0; i < positions.length; i++)
        {
            const rot = i <= 1 ? 0 : Math.PI;
            const offsetDir = i <= 1 ? 1 : -1;
            const pos = positions[i].clone().move(new Point(0, offsetDir * offsetIcon));
            const op = new LayoutOperation({
                frame: frame,
                dims: new Point(dimsIcon),
                translate: pos,
                rotation: rot,
                pivot: Point.CENTER,
                effects: effectsIcon
            })

            await resIcon.toCanvas(this.ctx, op);
        }
    }

    async drawMainIllustration(vis:Visualizer)
    {
        const extentsRect = vis.size.clone().scale(CONFIG.cards.powers.rectSize);
        const offset = CONFIG.cards.illustration.offset * extentsRect.y;
        const dims = new Point(CONFIG.cards.illustration.size * vis.sizeUnit);
        const res = vis.resLoader.getResource("cats");
        const frame = SUITS[this.suit].frame;

        for(let i = 0; i < 2; i++)
        {
            const dir = (i == 0) ? 1 : -1;
            const rot = (i == 0) ? 0 : Math.PI;
            const pos = vis.center.clone().move(new Point(0, dir * offset));
            const op = new LayoutOperation({
                frame: frame,
                translate: pos,
                dims: dims,
                rotation: rot,
                pivot: new Point(0.5, 1)
            })

            await res.toCanvas(this.ctx, op);
        }
    }

    async drawPower(vis:Visualizer)
    {
        // the background rectangle
        const extents = vis.size.clone().scale(CONFIG.cards.powers.rectSize);
        const extentsUnit = Math.min(extents.x, extents.y);;
        const rect = new Rectangle({ center: vis.center, extents: extents });
        const bevelSize = CONFIG.cards.powers.rectBevel * extentsUnit;
        const rectBeveled = bevelCorners(rect.toPath(), bevelSize);
        const pathObj = new Path({points: rectBeveled, close: true });
        const shape = new ResourceShape({ shape: pathObj });
                
        const color = SUITS[this.suit].color;
        const colorLight = new Color(color).lighten(CONFIG.cards.shared.colorLighten);
        const strokeWidth = CONFIG.cards.powers.rectStrokeWidth * vis.sizeUnit;

        const op = new LayoutOperation({
            fill: colorLight,
            stroke: "#000000",
            strokeWidth: strokeWidth,
            strokeAlign: StrokeAlignValue.OUTSIDE,
            effects: vis.effects
        })
        await shape.toCanvas(this.ctx, op);

        // the text inside
        const fontSize = CONFIG.cards.powers.fontSize * vis.sizeUnit;
        const textConfig = new TextConfig({
            font: CONFIG.fonts.body,
            size: fontSize,
            alignHorizontal: TextAlign.MIDDLE,
            alignVertical: TextAlign.MIDDLE
        });

        const text = this.power; // @TODO: does this need further modification??
        const resText = new ResourceText({ text: text, textConfig: textConfig });
        const padding = CONFIG.cards.powers.textPadding.clone().scale(extentsUnit);
        const extentsText = new Point(extents.x - 2*padding.x, extents.y - 2*padding.y);

        const opText = new LayoutOperation({
            dims: extentsText,
            translate: vis.center,
            fill: "#000000",
            pivot: Point.CENTER
        })
        await resText.toCanvas(this.ctx, opText);
    }

    drawOutline(vis:Visualizer)
    {
        const outlineSize = CONFIG.cards.outline.size * vis.sizeUnit;
        strokeCanvas(this.ctx, CONFIG.cards.outline.color, outlineSize);
    }
}