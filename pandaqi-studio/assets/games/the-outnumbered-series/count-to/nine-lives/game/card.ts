import createContext from "js/pq_games/layout/canvas/createContext";
import { CATS, MISC, Type } from "../shared/dict";
import { CONFIG } from "../shared/config";
import strokeCanvas from "js/pq_games/layout/canvas/strokeCanvas";
import Point from "js/pq_games/tools/geometry/point";
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
import StrokeAlign from "js/pq_games/layout/values/strokeAlign";
import DropShadowEffect from "js/pq_games/layout/effects/dropShadowEffect";
import LayoutEffect from "js/pq_games/layout/effects/layoutEffect";
import ColorLike from "js/pq_games/layout/color/colorLike";
import GrayScaleEffect from "js/pq_games/layout/effects/grayScaleEffect";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import patternizeGrid from "js/pq_games/layout/patterns/patternizeGrid";

const cacheVisualizerData = async (vis:MaterialVisualizer) =>
{  
    const alreadyCached = vis.custom && Object.keys(vis.custom).length > 0;
    if(alreadyCached) { return; }

    const shadowOffset = CONFIG.cards.shared.shadowOffset.clone().scale(vis.sizeUnit);
    const shadowColor = CONFIG.cards.shared.shadowColor;

    const params = 
    {
        size: (1.0 + CONFIG.cards.bgCats.patternExtraMargin) * vis.size.y,
        sizeIcon: CONFIG.cards.bgCats.patternIconSize,
        num: CONFIG.cards.bgCats.patternNumIcons,
        resource: vis.getResource("misc"),
        frame: MISC.bg_cat.frame
    }

    const patternCat = await patternizeGrid(params);

    params.frame = MISC.heart_simple.frame;
    const patternHeart = await patternizeGrid(params);

    params.frame = MISC.heart_outline.frame;
    const patternHeartOutline = await patternizeGrid(params); // @TODO: this seems unused?

    vis.custom =
    {
        effects: [new DropShadowEffect({ offset: shadowOffset, color: shadowColor }), vis.inkFriendlyEffect].flat(),
        patternCat: patternCat,
        patternHeart: patternHeart,
        patternHeartOutline: patternHeartOutline
    }
}

export default class Card
{
    type: Type; // LIFE or NUMBER
    cats: string[];
    power: string;
    data: any;

    constructor(type:Type)
    {
        this.type = type;
    }

    async drawForRules(vis:MaterialVisualizer) : Promise<HTMLCanvasElement>
    {
        await cacheVisualizerData(vis);

        const ctx = createContext({ size: vis.size });
        this.sort();

        let color = this.getBackgroundColor(vis);
        fillCanvas(ctx, color);

        await this.drawCats(vis, ctx);
        this.drawOutline(vis, ctx);
        return ctx.canvas;
    }

    sort()
    {
        if(!this.cats) { return; }
        this.cats.sort((a,b) => {
            return a.localeCompare(b);
        })
    }

    async draw(vis:MaterialVisualizer) : Promise<HTMLCanvasElement>
    {
        await cacheVisualizerData(vis);

        const ctx = createContext({ size: vis.size });
        this.sort();

        await this.drawBackground(vis,ctx);

        if(this.type == Type.LIFE) {
            await this.drawLifeCard(vis,ctx);
        } else {
            await this.drawCatCard(vis,ctx);
        }

        this.drawOutline(vis,ctx);
        return ctx.canvas;
    }

    //
    // > LIFE CARDS
    //
    async drawLifeCard(vis:MaterialVisualizer, ctx)
    {
        await this.drawLifeBackground(vis, ctx);
        await this.drawCornerHearts(vis, ctx);
        await this.drawCardLimit(vis, ctx);
        await this.drawPower(vis, ctx);
        await this.drawLifeText(vis, ctx);
    }

    async drawLifeBackground(vis:MaterialVisualizer, ctx)
    {
        const res = vis.resLoader.getResource("misc");
        const frame = MISC.heart_life.frame;
        const pos = new Point(0.5*vis.size.x, CONFIG.cards.life.heartPosY * vis.size.y);
        const size = new Point(CONFIG.cards.life.heartSize * vis.sizeUnit);
        const effects = vis.inkFriendly ? [new GrayScaleEffect()] : [];
        const op = new LayoutOperation({
            frame: frame,
            pos: pos,
            size: size,
            pivot: Point.CENTER,
            effects: effects
        })

        await res.toCanvas(ctx, op);
    }

    async drawCornerHearts(vis:MaterialVisualizer, ctx)
    {
        const size = new Point(CONFIG.cards.life.heartCornerSize * vis.sizeUnit);
        const offset = size.clone().scaleFactor(0.5).scaleFactor(CONFIG.cards.life.heartCornerOffset);
        const positions = getRectangleCornersWithOffset(vis.size, offset);
        const res = vis.resLoader.getResource("misc");
        const frame = MISC.heart.frame;
        for(let i = 0; i < positions.length; i++)
        {
            const pos = positions[i];
            const rot = (i <= 1) ? 0 : Math.PI;
            const op = new LayoutOperation({
                frame: frame,
                pos: pos,
                size: size,
                rot: rot,
                pivot: Point.CENTER,
                effects: vis.custom.effects,
            })
            await res.toCanvas(ctx, op);
        }
    }

    async drawCardLimit(vis:MaterialVisualizer, ctx)
    {
        // background rect (with beveled corners)
        const center = new Point(0.5*vis.size.x, CONFIG.cards.life.cardRectY * vis.size.y);
        const extents = CONFIG.cards.life.cardRectSize.clone().scaleFactor(vis.sizeUnit);
        const rect = new Rectangle({ center: center, extents: extents });
        const rectBevel = CONFIG.cards.life.cardRectBevel * Math.min(extents.x, extents.y);
        const path = bevelCorners(rect.toPath(), rectBevel);
        
        const pathObj = new Path({ points: path, close: true });
        const res = new ResourceShape({ shape: pathObj });
        const strokeWidth = CONFIG.cards.life.cardRectStrokeWidth * vis.sizeUnit;
        const op = new LayoutOperation({
            fill: "#00353D",
            stroke: "#FFFFFF",
            strokeWidth: strokeWidth,
            effects: vis.custom.effects,
        })
        await res.toCanvas(ctx, op);

        // actual card draw limit
        const numCards = this.data.drawNum;
        const itemSize = CONFIG.cards.life.cardRectIconSize * extents.y;
        const cardWidth = CONFIG.cards.life.cardRectIconXSpacing * itemSize;
        const offsetTotal = new Point(-0.5*(numCards - 1)*cardWidth, 0);
        const resCard = vis.resLoader.getResource("misc");
        const frame = MISC.card.frame;
        for(let i = 0; i < numCards; i++)
        {
            const pos = center.clone().move(offsetTotal).move(new Point(cardWidth, 0).scaleFactor(i));
            const op = new LayoutOperation({
                frame: frame,
                pos: pos,
                size: new Point(itemSize),
                pivot: Point.CENTER,
            })
            await resCard.toCanvas(ctx, op);
        }
    }

    async drawPower(vis:MaterialVisualizer, ctx)
    {
        const isCustomPower = this.data.reqs && this.data.reqs.length > 0;
        const center = vis.size.clone().scale(0.5);
        const size = new Point(CONFIG.cards.powers.iconSize * vis.sizeUnit);
        const powerEffects = vis.custom.effects.slice();

        const glowBlur = CONFIG.cards.powers.glowAroundIcons.blur * size.x;
        const glowColor = CONFIG.cards.powers.glowAroundIcons.color;
        if(glowBlur > 0.001)
        {
            const glowEffect = new DropShadowEffect({ blurRadius: glowBlur, color: glowColor });
            powerEffects.unshift(glowEffect);
        }

        if(isCustomPower) {
            await this.drawCustomPower(vis, ctx, center, size, powerEffects);
        } else {
            const res = vis.resLoader.getResource("powers");
            const frame = this.data.frame;
            const op = new LayoutOperation({
                frame: frame,
                pos: center,
                size: size,
                pivot: Point.CENTER,
                effects: powerEffects,
            })
            await res.toCanvas(ctx, op);
        }
    }

    async drawCustomPower(vis:MaterialVisualizer, ctx:CanvasRenderingContext2D, center:Point, size:Point, powerEffects:LayoutEffect[])
    {
        const res = vis.resLoader.getResource("cats");
        const resMisc = vis.resLoader.getResource("misc");
        const posLeft = center.clone().move(new Point(-0.5*size.x, 0));
        const posRight = center.clone().move(new Point(0.5*size.x, 0));
        const strokeWidth = CONFIG.cards.powers.textStrokeWidth * vis.sizeUnit;

        const op = new LayoutOperation({
            pos: new Point(),
            size: size, 
            frame: 0,
            pivot: Point.CENTER,
            effects: powerEffects,
        })

        const powerSubtype = this.power.split("_")[0];

        if(powerSubtype == "shapeshift")
        {
            size = size.scale(CONFIG.cards.powers.shapeshift.iconSize);

            const frame0 = CATS[this.data.reqs[0]].frame;
            const frame1 = MISC.arrow.frame;
            const frame2 = CATS[this.data.reqs[1]].frame;
            const pos = center.clone().move(new Point(-size.x, 0));

            op.frame = frame0;
            op.pos = pos;
            await res.toCanvas(ctx, op);

            op.frame = frame1;
            op.pos = center.clone();
            await resMisc.toCanvas(ctx, op);

            op.frame = frame2;
            op.pos = center.clone().move(new Point(size.x, 0));
            await res.toCanvas(ctx, op);
        }
        else if(powerSubtype == "numbershift")
        {
            size = size.scale(CONFIG.cards.powers.numbershift.iconSize);

            const fontSize = size.x;
            const textConfig = new TextConfig({
                font: CONFIG.fonts.heading,
                size: fontSize,
                alignHorizontal: TextAlign.MIDDLE,
                alignVertical: TextAlign.MIDDLE
            })

            const frame0 = CATS[this.data.reqs[0]].frame;
            const frame1 = MISC.arrow.frame;
            const numberText = this.data.reqs[1].toString();
            const pos = center.clone().move(new Point(-size.x, 0));

            op.frame = frame0;
            op.pos = pos;
            await res.toCanvas(ctx, op);

            op.frame = frame1;
            op.pos = center.clone();
            await resMisc.toCanvas(ctx, op);

            const resText = new ResourceText({ text: numberText, textConfig: textConfig });

            op.fill = new ColorLike("#FFFFFF");
            op.stroke = new ColorLike("#000000");
            op.strokeWidth = strokeWidth;
            op.strokeAlign = StrokeAlign.OUTSIDE;
            op.pos = center.clone().move(new Point(size.x, 0));
            await resText.toCanvas(ctx, op);
        }
        else if(powerSubtype == "ignore")
        {
            op.frame = MISC.ignore.frame;
            op.pos = posLeft;
            await resMisc.toCanvas(ctx, op);

            op.frame = CATS[this.data.reqs[0]].frame;
            op.pos = posRight;
            await res.toCanvas(ctx, op);
        }
        else if(powerSubtype == "forbid")
        {
            op.frame = MISC.cross.frame;
            op.pos = posLeft;
            await resMisc.toCanvas(ctx, op);

            op.frame = CATS[this.data.reqs[0]].frame;
            op.pos = posRight;
            await res.toCanvas(ctx, op);
        }
        else if(powerSubtype == "plus")
        {
            op.frame = CATS[this.data.reqs[0]].frame;
            op.pos = posLeft;
            await res.toCanvas(ctx, op);

            op.frame = MISC.plus.frame;
            op.pos = posRight;
            await resMisc.toCanvas(ctx, op);
        }
    }

    async drawLifeText(vis:MaterialVisualizer, ctx)
    {
        const fontSize = CONFIG.cards.life.fontSize * vis.sizeUnit;
        const textConfig = new TextConfig({
            font: CONFIG.fonts.heading,
            size: fontSize,
            alignHorizontal: TextAlign.MIDDLE,
            alignVertical: TextAlign.MIDDLE
        })
        const label = this.data.label;
        const res = new ResourceText({ text: label, textConfig: textConfig });
        const offset = CONFIG.cards.life.textOffsetFromCenter * vis.size.y;
        const pos = new Point(0.5*vis.size.x, 0.5*vis.size.y + offset);
        const strokeWidth = CONFIG.cards.life.textStrokeWidth * vis.sizeUnit;
        const op = new LayoutOperation({
            pos: pos,
            size: new Point(vis.size.x, fontSize),
            fill: "#FFFFFF",
            stroke: "#000000",
            strokeWidth: strokeWidth,
            strokeAlign: StrokeAlign.OUTSIDE,
            pivot: Point.CENTER
        });
        await res.toCanvas(ctx, op);

        textConfig.size *= CONFIG.cards.life.lifeCardFontSizeFactor;
        const resLife = new ResourceText({ text: "Life Card", textConfig });
        op.alpha = CONFIG.cards.life.lifeCardTextAlpha;
        op.pos = pos.clone().move(new Point(0, fontSize*1.2));
        await resLife.toCanvas(ctx, op);
    }

    //
    // > CAT cards 
    //
    async drawCatCard(vis:MaterialVisualizer, ctx)
    {
        await this.drawCats(vis, ctx);
        await this.drawCatsSimplified(vis, ctx);
    }

    async drawCats(vis:MaterialVisualizer, ctx)
    {
        const numIcons = this.cats.length;
        const positions = CONFIG.cards.cats.positions[numIcons];
        const res = vis.resLoader.getResource("cats");

        const size = new Point(CONFIG.cards.cats.iconSize * vis.sizeUnit);
        const center = vis.size.clone().scale(0.5);
        const posOffset = CONFIG.cards.cats.positionOffset;
        const posOffsetAbsolute = vis.size.clone().scaleFactor(0.5 * posOffset);

        for(let i = 0; i < numIcons; i++)
        {
            const pos = center.clone().move(positions[i].clone().scale(posOffsetAbsolute));
            const cat = this.cats[i];
            const frame = CATS[cat].frame;
            const op = new LayoutOperation({
                pos: pos,
                size: size,
                frame: frame,
                pivot: Point.CENTER,
                effects: vis.custom.effects,
            })

            await res.toCanvas(ctx, op);
        }
    }

    async drawCatsSimplified(vis:MaterialVisualizer, ctx)
    {
        if(vis.inkFriendly) { return; }

        const iconSize = CONFIG.cards.cats.simplifiedIconSize * vis.sizeUnit;
        const numIcons = this.cats.length;
        const offset = CONFIG.cards.cats.simplifiedIconOffset.clone().scale(vis.sizeUnit);
        const positions = 
        [
            new Point(vis.size.x - (numIcons-0.5)*iconSize - offset.x, 0.5*iconSize + offset.y),
            new Point((numIcons-0.5) * iconSize + offset.x, vis.size.y - 0.5*iconSize - offset.y)
        ]
        const vectors =
        [
            Point.RIGHT,
            Point.LEFT
        ]

        const res = vis.resLoader.getResource("cats");
        for(let i = 0; i < 2; i++)
        {
            const basePos = positions[i];
            const vec = vectors[i];
            const rot = (i == 0) ? 0 : Math.PI;
            
            for(let a = 0; a < numIcons; a++)
            {
                const myOffset = vec.clone().scaleFactor(a).scaleFactor(iconSize);
                const pos = basePos.clone().move(myOffset);    
                const frame = CATS[this.cats[a]].frame + 1;
                const op = new LayoutOperation({
                    frame: frame,
                    pos: pos,
                    size: new Point(iconSize),
                    pivot: new Point(0.5),
                    rot: rot,
                    effects: vis.custom.effects,
                })
                await res.toCanvas(ctx, op);
            }
            
        }
    }

    //
    // > SHARED
    //
    getBackgroundColor(vis)
    {
        if(vis.inkFriendly) { return "#FFFFFF"; }
        if(this.type == Type.LIFE) { return CONFIG.cards.life.bgColor; }

        let color = null;
        for(const cat of this.cats)
        {
            const newColor = new Color(CATS[cat].color);
            if(!color) { color = newColor.clone(); continue; }

            color = color.mix(newColor);
        }

        return color;
    }

    async drawBackground(vis:MaterialVisualizer, ctx)
    {
        // first solid color
        let color = this.getBackgroundColor(vis);
        fillCanvas(ctx, color);

        // then the specific pattern
        let alpha = CONFIG.cards.bgCats.patternAlpha;
        if(vis.inkFriendly) { alpha = CONFIG.cards.bgCats.patternAlphaInkFriendly; }

        const pattern = (this.type == Type.CAT) ? vis.custom.patternCat : vis.custom.patternHeart;
        const rot = (this.type == Type.CAT) ? CONFIG.cards.bgCats.patternRotation : CONFIG.cards.bgHearts.patternRotation;
        const center = vis.size.clone().scaleFactor(0.5);
        const op = new LayoutOperation({
            pos: center,
            alpha: alpha,
            rot: rot,
            pivot: new Point(0.5)
        })
        await pattern.toCanvas(ctx, op);
    }

    drawOutline(vis:MaterialVisualizer, ctx)
    {
        const outlineSize = CONFIG.cards.outline.size * vis.sizeUnit;
        strokeCanvas(ctx, CONFIG.cards.outline.color, outlineSize);
    }
}