import createContext from "js/pq_games/layout/canvas/createContext";
import { CATS, MISC, Type } from "../js_shared/dict";
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
        this.sort();

        let color = this.getBackgroundColor();
        fillCanvas(this.ctx, color);

        await this.drawCats(vis);
        this.drawOutline(vis);
        
        return this.getCanvas();
    }

    sort()
    {
        if(!this.cats) { return; }
        this.cats.sort((a,b) => {
            return a.localeCompare(b);
        })
    }

    getCanvas() { return this.ctx.canvas; }
    async draw(vis:Visualizer)
    {
        const ctx = createContext({ size: vis.size });
        this.ctx = ctx;
        this.sort();

        await this.drawBackground(vis);

        if(this.type == Type.LIFE) {
            await this.drawLifeCard(vis);
        } else {
            await this.drawCatCard(vis);
        }

        this.drawOutline(vis);

        return this.getCanvas();
    }

    //
    // > LIFE CARDS
    //
    async drawLifeCard(vis:Visualizer)
    {
        await this.drawLifeBackground(vis);
        await this.drawCornerHearts(vis);
        await this.drawCardLimit(vis);
        await this.drawPower(vis);
        await this.drawLifeText(vis);
    }

    async drawLifeBackground(vis:Visualizer)
    {
        const res = vis.resLoader.getResource("misc");
        const frame = MISC.heart_life.frame;
        const pos = new Point(0.5*vis.size.x, CONFIG.cards.life.heartPosY * vis.size.y);
        const dims = new Point(CONFIG.cards.life.heartSize * vis.sizeUnit);
        const op = new LayoutOperation({
            frame: frame,
            translate: pos,
            dims: dims,
            pivot: Point.CENTER
        })

        await res.toCanvas(this.ctx, op);
    }

    async drawCornerHearts(vis:Visualizer)
    {
        const dims = new Point(CONFIG.cards.life.heartCornerSize * vis.sizeUnit);
        const offset = dims.clone().scaleFactor(0.5).scaleFactor(CONFIG.cards.life.heartCornerOffset);
        const positions = getRectangleCornersWithOffset(vis.size, offset);
        const res = vis.resLoader.getResource("misc");
        const frame = MISC.heart.frame;
        for(let i = 0; i < positions.length; i++)
        {
            const pos = positions[i];
            const rot = (i <= 1) ? 0 : Math.PI;
            const op = new LayoutOperation({
                frame: frame,
                translate: pos,
                dims: dims,
                rotation: rot,
                pivot: Point.CENTER,
                effects: vis.effects,
            })
            await res.toCanvas(this.ctx, op);
        }
    }

    async drawCardLimit(vis:Visualizer)
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
            effects: vis.effects,
        })
        await res.toCanvas(this.ctx, op);

        // actual card draw limit
        const numCards = this.data.drawNum;
        const cardSize = CONFIG.cards.life.cardRectIconSize * extents.y;
        const cardWidth = CONFIG.cards.life.cardRectIconXSpacing * cardSize;
        const offsetTotal = new Point(-0.5*(numCards - 1)*cardWidth, 0);
        const resCard = vis.resLoader.getResource("misc");
        const frame = MISC.card.frame;
        for(let i = 0; i < numCards; i++)
        {
            const pos = center.clone().move(offsetTotal).move(new Point(cardWidth, 0).scaleFactor(i));
            const op = new LayoutOperation({
                frame: frame,
                translate: pos,
                dims: new Point(cardSize),
                pivot: Point.CENTER,
            })
            await resCard.toCanvas(this.ctx, op);
        }
    }

    async drawPower(vis:Visualizer)
    {
        const isCustomPower = this.data.reqs && this.data.reqs.length > 0;
        const center = vis.size.clone().scale(0.5);
        const dims = new Point(CONFIG.cards.powers.iconSize * vis.sizeUnit);
        const powerEffects = vis.effects.slice();

        const glowBlur = CONFIG.cards.powers.glowAroundIcons.blur * dims.x;
        const glowColor = CONFIG.cards.powers.glowAroundIcons.color;
        if(glowBlur > 0.001)
        {
            const glowEffect = new DropShadowEffect({ blurRadius: glowBlur, color: glowColor });
            powerEffects.unshift(glowEffect);
        }

        if(isCustomPower) {
            await this.drawCustomPower(vis, center, dims, powerEffects);
        } else {
            const res = vis.resLoader.getResource("powers");
            const frame = this.data.frame;
            const op = new LayoutOperation({
                frame: frame,
                translate: center,
                dims: dims,
                pivot: Point.CENTER,
                effects: powerEffects,
            })
            await res.toCanvas(this.ctx, op);
        }
    }

    async drawCustomPower(vis:Visualizer, center:Point, dims:Point, powerEffects:LayoutEffect[])
    {
        const res = vis.resLoader.getResource("cats");
        const resMisc = vis.resLoader.getResource("misc");
        const posLeft = center.clone().move(new Point(-0.5*dims.x, 0));
        const posRight = center.clone().move(new Point(0.5*dims.x, 0));
        const strokeWidth = CONFIG.cards.powers.textStrokeWidth * vis.sizeUnit;

        const op = new LayoutOperation({
            translate: new Point(),
            dims: dims, 
            frame: 0,
            pivot: Point.CENTER,
            effects: powerEffects,
        })

        const powerSubtype = this.power.split("_")[0];

        if(powerSubtype == "shapeshift")
        {
            dims = dims.scale(CONFIG.cards.powers.shapeshift.iconSize);

            const frame0 = CATS[this.data.reqs[0]].frame;
            const frame1 = MISC.arrow.frame;
            const frame2 = CATS[this.data.reqs[1]].frame;
            const pos = center.clone().move(new Point(-dims.x, 0));

            op.frame = frame0;
            op.translate = pos;
            await res.toCanvas(this.ctx, op);

            op.frame = frame1;
            op.translate = center.clone();
            await resMisc.toCanvas(this.ctx, op);

            op.frame = frame2;
            op.translate = center.clone().move(new Point(dims.x, 0));
            await res.toCanvas(this.ctx, op);
        }
        else if(powerSubtype == "numbershift")
        {
            dims = dims.scale(CONFIG.cards.powers.numbershift.iconSize);

            const fontSize = dims.x;
            const textConfig = new TextConfig({
                font: CONFIG.fonts.heading,
                size: fontSize,
                alignHorizontal: TextAlign.MIDDLE,
                alignVertical: TextAlign.MIDDLE
            })

            const frame0 = CATS[this.data.reqs[0]].frame;
            const frame1 = MISC.arrow.frame;
            const numberText = this.data.reqs[1].toString();
            const pos = center.clone().move(new Point(-dims.x, 0));

            op.frame = frame0;
            op.translate = pos;
            await res.toCanvas(this.ctx, op);

            op.frame = frame1;
            op.translate = center.clone();
            await resMisc.toCanvas(this.ctx, op);

            const resText = new ResourceText({ text: numberText, textConfig: textConfig });

            op.fill = new ColorLike("#FFFFFF");
            op.stroke = new ColorLike("#000000");
            op.strokeWidth = strokeWidth;
            op.strokeAlign = StrokeAlignValue.OUTSIDE;
            op.translate = center.clone().move(new Point(dims.x, 0));
            await resText.toCanvas(this.ctx, op);
        }
        else if(powerSubtype == "ignore")
        {
            op.frame = MISC.ignore.frame;
            op.translate = posLeft;
            await resMisc.toCanvas(this.ctx, op);

            op.frame = CATS[this.data.reqs[0]].frame;
            op.translate = posRight;
            await res.toCanvas(this.ctx, op);
        }
        else if(powerSubtype == "forbid")
        {
            op.frame = MISC.cross.frame;
            op.translate = posLeft;
            await resMisc.toCanvas(this.ctx, op);

            op.frame = CATS[this.data.reqs[0]].frame;
            op.translate = posRight;
            await res.toCanvas(this.ctx, op);
        }
        else if(powerSubtype == "plus")
        {
            op.frame = CATS[this.data.reqs[0]].frame;
            op.translate = posLeft;
            await res.toCanvas(this.ctx, op);

            op.frame = MISC.plus.frame;
            op.translate = posRight;
            await resMisc.toCanvas(this.ctx, op);
        }
    }

    async drawLifeText(vis:Visualizer)
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
            translate: pos,
            dims: new Point(vis.size.x, fontSize),
            fill: "#FFFFFF",
            stroke: "#000000",
            strokeWidth: strokeWidth,
            strokeAlign: StrokeAlignValue.OUTSIDE,
            pivot: Point.CENTER
        });
        await res.toCanvas(this.ctx, op);

        textConfig.size *= CONFIG.cards.life.lifeCardFontSizeFactor;
        const resLife = new ResourceText({ text: "Life Card", textConfig });
        op.alpha = CONFIG.cards.life.lifeCardTextAlpha;
        op.translate = pos.clone().move(new Point(0, fontSize*1.2));
        await resLife.toCanvas(this.ctx, op);
    }

    //
    // > CAT cards 
    //
    async drawCatCard(vis:Visualizer)
    {
        await this.drawCats(vis);
        await this.drawCatsSimplified(vis);
    }

    async drawCats(vis:Visualizer)
    {
        const numIcons = this.cats.length;
        const positions = CONFIG.cards.cats.positions[numIcons];
        const res = vis.resLoader.getResource("cats");

        const dims = new Point(CONFIG.cards.cats.iconSize * vis.sizeUnit);
        const center = vis.size.clone().scale(0.5);
        const posOffset = CONFIG.cards.cats.positionOffset;
        const posOffsetAbsolute = vis.size.clone().scaleFactor(0.5 * posOffset);

        for(let i = 0; i < numIcons; i++)
        {
            const pos = center.clone().move(positions[i].clone().scale(posOffsetAbsolute));
            const cat = this.cats[i];
            const frame = CATS[cat].frame;
            const op = new LayoutOperation({
                translate: pos,
                dims: dims,
                frame: frame,
                pivot: Point.CENTER,
                effects: vis.effects,
            })

            await res.toCanvas(this.ctx, op);
        }
    }

    async drawCatsSimplified(vis:Visualizer)
    {
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
                    translate: pos,
                    dims: new Point(iconSize),
                    pivot: new Point(0.5),
                    rotation: rot,
                    effects: vis.effects,
                })
                await res.toCanvas(this.ctx, op);
            }
            
        }
    }

    //
    // > SHARED
    //
    getBackgroundColor()
    {
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

    async drawBackground(vis:Visualizer)
    {
        // first solid color
        let color = this.getBackgroundColor();
        fillCanvas(this.ctx, color);

        // then the specific pattern
        let alpha = CONFIG.cards.bgCats.patternAlpha;
        if(CONFIG.inkFriendly) { alpha = CONFIG.cards.bgCats.patternAlphaInkFriendly; }

        const pattern = (this.type == Type.CAT) ? vis.patternCat : vis.patternHeart;
        const rot = (this.type == Type.CAT) ? CONFIG.cards.bgCats.patternRotation : CONFIG.cards.bgHearts.patternRotation;
        const center = vis.size.clone().scaleFactor(0.5);
        const op = new LayoutOperation({
            translate: center,
            alpha: alpha,
            rotation: rot,
            pivot: new Point(0.5)
        })
        await pattern.toCanvas(this.ctx, op);
    }

    drawOutline(vis:Visualizer)
    {
        const outlineSize = CONFIG.cards.outline.size * vis.sizeUnit;
        strokeCanvas(this.ctx, CONFIG.cards.outline.color, outlineSize);
    }
}