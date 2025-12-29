
import { MISC, PowerData, SETS } from "../shared/dict";
import { CONFIG } from "../shared/config";
import { MaterialVisualizer, DropShadowEffect, createContext, fillCanvas, Vector2, LayoutOperation, TextConfig, TextAlign, ColorLike, StrokeAlign, ResourceText, getRectangleCornersWithOffset, rangeInteger, strokeCanvas } from "lib/pq-games";

const getMaterialVisualizerEffects = (vis:MaterialVisualizer) =>
{
    const shadowRadius = vis.get("cards.shared.shadowRadius") * vis.sizeUnit;
    const shadowColor = vis.get("cards.shared.shadowColor");
    const shadowEffect = new DropShadowEffect({ blurRadius: shadowRadius, color: shadowColor });
    return [shadowEffect, vis.inkFriendlyEffect].flat();
}

export default class Card
{
    type: string;
    data: PowerData;

    constructor(type:string, data:PowerData)
    {
        this.type = type;
        this.data = data;
    }

    async drawForRules(vis:MaterialVisualizer)
    {
        const ctx = createContext({ size: vis.size });
        fillCanvas(ctx, "#FFFFFF");

        await this.drawCorners(vis, ctx);
        await this.drawMainIllustration(vis, ctx);

        return ctx.canvas;
    }


    async draw(vis:MaterialVisualizer)
    {
        const ctx = createContext({ size: vis.size });

        await this.drawBackground(vis, ctx);
        await this.drawCorners(vis, ctx);
        await this.drawMainIllustration(vis, ctx);
        await this.drawPower(vis, ctx);

        return ctx.canvas;
    }

    async drawCorners(vis:MaterialVisualizer, ctx)
    {
        await this.drawHeadingText(vis, ctx);
        await this.drawCornerCoins(vis, ctx);
    }

    async drawHeadingText(vis:MaterialVisualizer, ctx)
    {
        // rope behind all of it
        const resRope = vis.resLoader.getResource("misc");
        const frameRope = MISC.rope.frame;
        const yPos = vis.get("cards.heading.yPos") * vis.size.y;
        const pos = new Vector2(vis.center.x, yPos);
        const size = new Vector2(vis.sizeUnit);
        const op = new LayoutOperation({
            frame: frameRope,
            pos: pos,
            size: size,
            pivot: Vector2.CENTER,
            effects: getMaterialVisualizerEffects(vis)
        })
        await resRope.toCanvas(ctx, op);

        // text showing name of the card
        const text = this.data.label;
        const fontSize = vis.get("cards.heading.fontSize") * vis.sizeUnit;
        const textConfig = new TextConfig({
            font: vis.get("fonts.heading"),
            size: fontSize,
            alignHorizontal: TextAlign.MIDDLE,
            alignVertical: TextAlign.MIDDLE,
        })

        const fillColor = vis.inkFriendly ? "#FFFFFF" : vis.get("cards.heading.fillColor");
        const strokeColor = vis.inkFriendly ? "#111111" : vis.get("cards.heading.strokeColor");
        const strokeWidth = vis.get("cards.heading.strokeWidth") * fontSize;
        const textShadowOffset = vis.get("cards.heading.shadowOffset") * fontSize;

        op.fill = new ColorLike(fillColor);
        op.stroke = new ColorLike(strokeColor);
        op.strokeWidth = strokeWidth;
        op.strokeAlign = StrokeAlign.OUTSIDE,
        op.size = new Vector2(vis.size.x, 2*fontSize);
        op.effects = [new DropShadowEffect({ offset: new Vector2(textShadowOffset), color: vis.get("cards.shared.shadowColor") })];

        const resText = new ResourceText({ text: text, textConfig: textConfig });
        await resText.toCanvas(ctx, op);
    }

    // the coins + numbers inside
    async drawCornerCoins(vis:MaterialVisualizer, ctx)
    {
        const offsetBig = vis.get("cards.corners.edgeOffsetBig").clone().scale(vis.sizeUnit);
        const offsetSmall = vis.get("cards.corners.edgeOffsetSmall").clone().scale(vis.sizeUnit);
        const positionsBig = getRectangleCornersWithOffset(vis.size, offsetBig);
        const positionsSmall = getRectangleCornersWithOffset(vis.size, offsetSmall)

        const sizeBig = new Vector2(vis.get("cards.corners.coinScaleBig") * vis.sizeUnit);
        const sizeSmall = new Vector2(vis.get("cards.corners.coinScaleSmall") * vis.sizeUnit);

        const resCoin = vis.resLoader.getResource("misc");
        const frameCoin = MISC.coin.frame;

        const fontSizeBig = vis.get("cards.corners.fontSizeBig") * vis.sizeUnit;
        const fontSizeSmall = vis.get("cards.corners.fontSizeSmall") * vis.sizeUnit;

        const text = this.data.num.toString();
        const textConfig = new TextConfig({
            font: vis.get("fonts.heading"),
            alignHorizontal: TextAlign.MIDDLE,
            alignVertical: TextAlign.MIDDLE,
        })

        const fillColor = vis.inkFriendly ? "#FFFFFF" : vis.get("cards.corners.fillColor");
        const strokeColor = vis.inkFriendly ? "#111111" : vis.get("cards.corners.strokeColor");

        const isScoreAction = this.data.score == true;

        for(let i = 0; i < positionsBig.length; i++)
        {
            const isBig = i <= 1;

            const rot = isBig ? 0 : Math.PI;
            const pos = isBig ? positionsBig[i] : positionsSmall[i];
            const size = isBig ? sizeBig : sizeSmall;
            const fontSize = isBig ? fontSizeBig : fontSizeSmall;

            const op = new LayoutOperation({
                frame: frameCoin,
                pos: pos,
                size: size,
                pivot: Vector2.CENTER,
                rot: rot,
                effects: getMaterialVisualizerEffects(vis)
            })
            await resCoin.toCanvas(ctx, op);

            // places a scoring coin underneath the big numbers on cards
            // with actions that only trigger while scoring
            if(isBig && isScoreAction)
            {
                const scoreCoinDims = size.clone().scale(vis.get("cards.corners.coinScoreScale"));
                const opCoin = new LayoutOperation({
                    frame: MISC.coin_score.frame,
                    size: scoreCoinDims,
                    pos: pos.clone().move(new Vector2(0, 0.5*size.y + 0.5*scoreCoinDims.y)),
                    pivot: Vector2.CENTER,
                    effects: getMaterialVisualizerEffects(vis)
                })
                await resCoin.toCanvas(ctx, opCoin);
            }
            
            const strokeWidth = vis.get("cards.corners.strokeWidth") * fontSize;
            const tempTextConfig = textConfig.clone();
            tempTextConfig.size = fontSize;
            const resText = new ResourceText({ text: text, textConfig: tempTextConfig });

            op.fill = new ColorLike(fillColor);
            op.stroke = new ColorLike(strokeColor);
            op.strokeWidth = strokeWidth;
            op.strokeAlign = StrokeAlign.OUTSIDE
            op.effects = getMaterialVisualizerEffects(vis); 
            await resText.toCanvas(ctx, op);

        }
    }

    getConnectedSet()
    {
        for(const [key,data] of Object.entries(SETS))
        {
            if(Object.keys(data).includes(this.type)) { return key; }
        }
        return "base";
    }

    async drawMainIllustration(vis:MaterialVisualizer, ctx)
    {
        const res = vis.resLoader.getResource(this.getConnectedSet());
        const frame = this.data.frame;
        const yPos = vis.get("cards.illustration.yPos") * vis.size.y;
        const pos = new Vector2(vis.center.x, yPos);
        const size = new Vector2(vis.get("cards.illustration.scale") * vis.sizeUnit);
        const op = new LayoutOperation({
            frame: frame,
            pos: pos,
            size: size,
            pivot: Vector2.CENTER,
            effects: getMaterialVisualizerEffects(vis)
        })
        await res.toCanvas(ctx, op);
    }

    async drawPower(vis:MaterialVisualizer, ctx)
    {
        // first the background scroll
        const resMisc = vis.resLoader.getResource("misc");
        const frame = MISC.scroll.frame;
        const pos = new Vector2(vis.center.x, vis.get("cards.power.yPos") * vis.size.y);
        const size = new Vector2(vis.get("cards.power.scrollScale").x * vis.sizeUnit);
        const opMisc = new LayoutOperation({
            frame: frame,
            pos: pos,
            size: size,
            pivot: Vector2.CENTER,
            effects: getMaterialVisualizerEffects(vis)
        })
        await resMisc.toCanvas(ctx, opMisc);

        // then the text
        const text = this.data.desc;
        const fontSize = vis.get("cards.power.fontSize") * vis.sizeUnit;
        const textConfig = new TextConfig({
            font: vis.get("fonts.body"),
            size: fontSize,
            alignHorizontal: TextAlign.MIDDLE,
            alignVertical: TextAlign.MIDDLE,
        })
        const resText = new ResourceText({ text: text, textConfig: textConfig });

        const textShadowOffset = vis.get("cards.power.shadowOffset") * fontSize;
        opMisc.effects = [new DropShadowEffect({ offset: new Vector2(textShadowOffset), color: vis.get("cards.shared.shadowColor") })];
        opMisc.fill = new ColorLike("#000000");
        opMisc.size.x *= vis.get("cards.power.textBoxWidth");
        await resText.toCanvas(ctx, opMisc);
    }

    async drawBackground(vis:MaterialVisualizer, ctx)
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
            size: vis.size.clone(),
        })
        await bg.toCanvas(ctx, op);
    }
}