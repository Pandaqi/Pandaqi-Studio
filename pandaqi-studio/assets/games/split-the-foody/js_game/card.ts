import createContext from "js/pq_games/layout/canvas/createContext";
import { MISC, PowerData } from "../js_shared/dict";
import CONFIG from "../js_shared/config";
import strokeCanvas from "js/pq_games/layout/canvas/strokeCanvas";
import Visualizer from "./visualizer";
import fillCanvas from "js/pq_games/layout/canvas/fillCanvas";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import rangeInteger from "js/pq_games/tools/random/rangeInteger";
import Point from "js/pq_games/tools/geometry/point";
import TextConfig, { TextAlign } from "js/pq_games/layout/text/textConfig";
import ResourceText from "js/pq_games/layout/resources/resourceText";
import getRectangleCornersWithOffset from "js/pq_games/tools/geometry/paths/getRectangleCornersWithOffset";
import StrokeAlign from "js/pq_games/layout/values/strokeAlign";
import ColorLike from "js/pq_games/layout/color/colorLike";
import DropShadowEffect from "js/pq_games/layout/effects/dropShadowEffect";

export default class Card
{
    type: string;
    data: PowerData;

    constructor(type:string, data:PowerData)
    {
        this.type = type;
        this.data = data;
    }

    async drawForRules(vis:Visualizer)
    {
        const ctx = createContext({ size: vis.size });
        fillCanvas(ctx, "#FFFFFF");

        await this.drawCorners(vis, ctx);
        await this.drawMainIllustration(vis, ctx);

        // @TODO: also draw power? depends on how interactive the example will be ...
        this.drawOutline(vis, ctx);
        return ctx.canvas;
    }


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

    async drawCorners(vis:Visualizer, ctx)
    {
        await this.drawHeadingText(vis, ctx);
        await this.drawCornerCoins(vis, ctx);
    }

    async drawHeadingText(vis:Visualizer, ctx)
    {
        // rope behind all of it
        const resRope = vis.resLoader.getResource("misc");
        const frameRope = MISC.rope.frame;
        const yPos = CONFIG.cards.heading.yPos * vis.size.y;
        const pos = new Point(vis.center.x, yPos);
        const dims = new Point(vis.sizeUnit);
        const op = new LayoutOperation({
            frame: frameRope,
            translate: pos,
            dims: dims,
            pivot: Point.CENTER,
            effects: vis.effects
        })
        await resRope.toCanvas(ctx, op);

        // text showing name of the card
        const text = this.data.label;
        const fontSize = CONFIG.cards.heading.fontSize * vis.sizeUnit;
        const textConfig = new TextConfig({
            font: CONFIG.fonts.heading,
            size: fontSize,
            alignHorizontal: TextAlign.MIDDLE,
            alignVertical: TextAlign.MIDDLE,
        })

        const fillColor = vis.inkFriendly ? "#FFFFFF" : CONFIG.cards.heading.fillColor;
        const strokeColor = vis.inkFriendly ? "#111111" : CONFIG.cards.heading.strokeColor;
        const strokeWidth = CONFIG.cards.heading.strokeWidth * fontSize;
        const textShadowOffset = CONFIG.cards.heading.shadowOffset * fontSize;

        op.fill = new ColorLike(fillColor);
        op.stroke = new ColorLike(strokeColor);
        op.strokeWidth = strokeWidth;
        op.strokeAlign = StrokeAlign.OUTSIDE,
        op.dims = new Point(vis.size.x, 2*fontSize);
        op.effects = [new DropShadowEffect({ offset: new Point(textShadowOffset), color: CONFIG.cards.shared.shadowColor })];

        const resText = new ResourceText({ text: text, textConfig: textConfig });
        await resText.toCanvas(ctx, op);
    }

    // the coins + numbers inside
    async drawCornerCoins(vis:Visualizer, ctx)
    {
        const offsetBig = CONFIG.cards.corners.edgeOffsetBig.clone().scale(vis.sizeUnit);
        const offsetSmall = CONFIG.cards.corners.edgeOffsetSmall.clone().scale(vis.sizeUnit);
        const positionsBig = getRectangleCornersWithOffset(vis.size, offsetBig);
        const positionsSmall = getRectangleCornersWithOffset(vis.size, offsetSmall)

        const dimsBig = new Point(CONFIG.cards.corners.coinScaleBig * vis.sizeUnit);
        const dimsSmall = new Point(CONFIG.cards.corners.coinScaleSmall * vis.sizeUnit);

        const resCoin = vis.resLoader.getResource("misc");
        const frameCoin = MISC.coin.frame;

        const fontSizeBig = CONFIG.cards.corners.fontSizeBig * vis.sizeUnit;
        const fontSizeSmall = CONFIG.cards.corners.fontSizeSmall * vis.sizeUnit;

        const text = this.data.num.toString();
        const textConfig = new TextConfig({
            font: CONFIG.fonts.heading,
            alignHorizontal: TextAlign.MIDDLE,
            alignVertical: TextAlign.MIDDLE,
        })

        const fillColor = vis.inkFriendly ? "#FFFFFF" : CONFIG.cards.corners.fillColor;
        const strokeColor = vis.inkFriendly ? "#111111" : CONFIG.cards.corners.strokeColor;

        const isScoreAction = this.data.score == true;

        for(let i = 0; i < positionsBig.length; i++)
        {
            const isBig = i <= 1;

            const rot = isBig ? 0 : Math.PI;
            const pos = isBig ? positionsBig[i] : positionsSmall[i];
            const dims = isBig ? dimsBig : dimsSmall;
            const fontSize = isBig ? fontSizeBig : fontSizeSmall;

            const op = new LayoutOperation({
                frame: frameCoin,
                translate: pos,
                dims: dims,
                pivot: Point.CENTER,
                rotation: rot,
                effects: vis.effects
            })
            await resCoin.toCanvas(ctx, op);

            // places a scoring coin underneath the big numbers on cards
            // with actions that only trigger while scoring
            if(isBig && isScoreAction)
            {
                const scoreCoinDims = dims.clone().scale(CONFIG.cards.corners.coinScoreScale);
                const opCoin = new LayoutOperation({
                    frame: MISC.coin_score.frame,
                    dims: scoreCoinDims,
                    translate: pos.clone().move(new Point(0, 0.5*dims.y + 0.5*scoreCoinDims.y)),
                    pivot: Point.CENTER,
                    effects: vis.effects
                })
                await resCoin.toCanvas(ctx, opCoin);
            }
            
            const strokeWidth = CONFIG.cards.corners.strokeWidth * fontSize;
            const tempTextConfig = textConfig.clone();
            tempTextConfig.size = fontSize;
            const resText = new ResourceText({ text: text, textConfig: tempTextConfig });

            op.fill = new ColorLike(fillColor);
            op.stroke = new ColorLike(strokeColor);
            op.strokeWidth = strokeWidth;
            op.strokeAlign = StrokeAlign.OUTSIDE
            op.effects = vis.effects; // @TODO: not sure if it should copy the regular effects for this text
            await resText.toCanvas(ctx, op);

        }
    }

    async drawMainIllustration(vis:Visualizer, ctx)
    {
        const res = vis.resLoader.getResource(CONFIG.cardSet);
        const frame = this.data.frame;
        const yPos = CONFIG.cards.illustration.yPos * vis.size.y;
        const pos = new Point(vis.center.x, yPos);
        const dims = new Point(CONFIG.cards.illustration.scale * vis.sizeUnit);
        const op = new LayoutOperation({
            frame: frame,
            translate: pos,
            dims: dims,
            pivot: Point.CENTER,
            effects: vis.effects
        })
        await res.toCanvas(ctx, op);
    }

    async drawPower(vis:Visualizer, ctx)
    {
        // first the background scroll
        const resMisc = vis.resLoader.getResource("misc");
        const frame = MISC.scroll.frame;
        const pos = new Point(vis.center.x, CONFIG.cards.power.yPos * vis.size.y);
        const dims = new Point(CONFIG.cards.power.scrollScale.x * vis.sizeUnit);
        const opMisc = new LayoutOperation({
            frame: frame,
            translate: pos,
            dims: dims,
            pivot: Point.CENTER,
            effects: vis.effects
        })
        await resMisc.toCanvas(ctx, opMisc);

        // then the text
        const text = this.data.desc;
        const fontSize = CONFIG.cards.power.fontSize * vis.sizeUnit;
        const textConfig = new TextConfig({
            font: CONFIG.fonts.body,
            size: fontSize,
            alignHorizontal: TextAlign.MIDDLE,
            alignVertical: TextAlign.MIDDLE,
        })
        const resText = new ResourceText({ text: text, textConfig: textConfig });

        const textShadowOffset = CONFIG.cards.power.shadowOffset * fontSize;
        opMisc.effects = [new DropShadowEffect({ offset: new Point(textShadowOffset), color: CONFIG.cards.shared.shadowColor })];
        opMisc.fill = new ColorLike("#000000");
        opMisc.dims.x *= CONFIG.cards.power.textBoxWidth;
        await resText.toCanvas(ctx, opMisc);
    }

    async drawBackground(vis:Visualizer, ctx)
    {
        if(vis.inkFriendly)
        {
            fillCanvas(ctx, "#FFFFFF");
            return;
        }

        const bg = vis.resLoader.getResource("bgs");
        const frame = rangeInteger(0,3);
        const op = new LayoutOperation({
            frame: frame,
            dims: vis.size.clone(),
        })
        await bg.toCanvas(ctx, op);
    }

    drawOutline(vis:Visualizer, ctx)
    {
        const outlineSize = CONFIG.cards.outline.size * vis.sizeUnit;
        strokeCanvas(ctx, CONFIG.cards.outline.color, outlineSize);
    }
}