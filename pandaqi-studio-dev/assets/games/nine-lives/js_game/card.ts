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

    async drawForRules(cfg)
    {
        // @TODO
    }

    getCanvas() { return this.ctx.canvas; }
    async draw(visualizer:Visualizer)
    {
        const size = CONFIG.cards.size;
        const ctx = createContext({ size: size });
        this.ctx = ctx;
        this.size = size;
        this.sizeUnit = Math.min(size.x, size.y);

        this.cats.sort((a,b) => {
            return a.localeCompare(b);
        })

        await this.drawBackground(visualizer);

        if(this.type == Type.LIFE) {
            await this.drawLifeCard();
        } else {
            await this.drawCatCard();
        }

        this.drawOutline();

        return this.getCanvas();
    }

    //
    // > LIFE CARDS
    //
    async drawLifeCard()
    {
        await this.drawLifeBackground();
        await this.drawCornerHearts();
        await this.drawCardLimit();
        await this.drawPower();
        await this.drawLifeText();
    }

    async drawLifeBackground()
    {
        const res = CONFIG.resLoader.getResource("misc");
        const frame = MISC.heart_life.frame;
        const pos = new Point(0.5*this.size.x, CONFIG.cards.life.heartPosY * this.size.y);
        const dims = new Point(CONFIG.cards.life.heartSize * this.sizeUnit);
        const op = new LayoutOperation({
            frame: frame,
            translate: pos,
            dims: dims,
            pivot: Point.CENTER
        })

        await res.toCanvas(this.ctx, op);
    }

    async drawCornerHearts()
    {
        const dims = new Point(CONFIG.cards.life.heartCornerSize * this.sizeUnit);
        const offset = dims.clone().scaleFactor(0.5).scaleFactor(CONFIG.cards.life.heartCornerOffset);
        const positions = getRectangleCornersWithOffset(this.size, offset);
        const res = CONFIG.resLoader.getResource("misc");
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
                pivot: Point.CENTER
            })
            await res.toCanvas(this.ctx, op);
        }
    }

    async drawCardLimit()
    {
        // background rect (with beveled corners)
        const center = new Point(0.5*this.size.y, CONFIG.cards.life.cardRectY * this.size.y);
        const extents = CONFIG.cards.life.cardRectSize.clone().scaleFactor(this.sizeUnit);
        const rect = new Rectangle({ center: center, extents: extents });
        const rectBevel = CONFIG.cards.life.cardRectBevel * Math.min(extents.x, extents.y);
        const path = bevelCorners(rect.toPath(), rectBevel);
        
        const pathObj = new Path({ points: path });
        const res = new ResourceShape({ shape: pathObj });
        const strokeWidth = CONFIG.cards.life.cardRectStrokeWidth * this.sizeUnit;
        const op = new LayoutOperation({
            fill: "#00353D",
            stroke: "#FFFFFF",
            strokeWidth: strokeWidth
        })
        await res.toCanvas(this.ctx, op);

        // actual card draw limit
        const numCards = this.data.drawNum;
        const cardSize = CONFIG.cards.life.cardRectIconSize * extents.y;
        const cardWidth = CONFIG.cards.life.cardRectIconXSpacing * cardSize;
        const offsetTotal = new Point(-0.5*(numCards - 1)*cardWidth, 0);
        const resCard = CONFIG.resLoader.getResource("misc");
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

    async drawPower()
    {
        const isCustomPower = this.data.reqs && this.data.reqs.length > 0;
        const center = this.size.clone().scale(0.5);
        const dims = new Point(CONFIG.cards.powers.iconSize * this.sizeUnit);

        if(isCustomPower) {
            await this.drawCustomPower(center, dims);
        } else {
            const res = CONFIG.resLoader.getResource("powers");
            const frame = this.data.frame;
            const op = new LayoutOperation({
                frame: frame,
                translate: center,
                dims: dims,
                pivot: Point.CENTER,
            })
            await res.toCanvas(this.ctx, op);
        }
    }

    async drawCustomPower(center:Point, dims:Point)
    {
        const res = CONFIG.resLoader.getResource("cats");
        const resMisc = CONFIG.resLoader.getResource("misc");
        const posLeft = center.clone().move(new Point(-0.5*dims.x, 0));
        const posRight = center.clone().move(new Point(0.5*dims.x, 0));

        const op = new LayoutOperation({
            translate: new Point(),
            dims: dims, 
            frame: 0,
            pivot: Point.CENTER
        })

        if(this.power == "shapeshift")
        {
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
        else if(this.power == "ignore")
        {
            op.frame = MISC.cross.frame;
            op.translate = posLeft;
            await resMisc.toCanvas(this.ctx, op);

            op.frame = CATS[this.data.reqs[0]].frame;
            op.translate = posRight;
            await res.toCanvas(this.ctx, op);
        }
        else if(this.power == "cat_plus")
        {
            op.frame = CATS[this.data.reqs[0]].frame;
            op.translate = posLeft;
            await res.toCanvas(this.ctx, op);

            op.frame = MISC.plus.frame;
            op.translate = posRight;
            await resMisc.toCanvas(this.ctx, op);
        }
    }

    async drawLifeText()
    {
        const fontSize = CONFIG.cards.life.fontSize * this.sizeUnit;
        const textConfig = new TextConfig({
            font: CONFIG.fonts.heading,
            size: fontSize,
            alignHorizontal: TextAlign.MIDDLE,
            alignVertical: TextAlign.MIDDLE
        })
        const label = this.data.label;
        const res = new ResourceText({ text: label, textConfig: textConfig });
        const offset = CONFIG.cards.life.textOffsetFromCenter * this.size.y;
        const pos = new Point(0.5*this.size.x, 0.5*this.size.y + offset);
        const strokeWidth = CONFIG.cards.life.textStrokeWidth * this.sizeUnit;
        const op = new LayoutOperation({
            translate: pos,
            dims: new Point(this.size.x, fontSize),
            fill: "#FFFFFF",
            stroke: "#000000",
            strokeWidth: strokeWidth,
            strokeAlign: StrokeAlignValue.OUTSIDE,
            pivot: Point.CENTER
        });
        await res.toCanvas(this.ctx, op);

        const resLife = new ResourceText({ text: "Life Card", textConfig });
        op.alpha = CONFIG.cards.life.lifeCardTextAlpha;
        await resLife.toCanvas(this.ctx, op);
    }

    //
    // > CAT cards 
    //
    async drawCatCard()
    {
        await this.drawCats();
        await this.drawCatsSimplified();
    }

    async drawCats()
    {
        const numIcons = this.cats.length;
        const positions = CONFIG.cards.cats.positions[numIcons];
        const res = CONFIG.resLoader.getResource("cats");

        const dims = new Point(CONFIG.cards.cats.iconSize * this.sizeUnit);
        const center = this.size.clone().scale(0.5);
        const posOffset = CONFIG.cards.cats.positionOffset;

        for(let i = 0; i < numIcons; i++)
        {
            const pos = center.clone().move(positions[i].clone().scale(posOffset).scale(this.size));
            const cat = this.cats[i];
            const frame = CATS[cat].frame;
            const op = new LayoutOperation({
                translate: pos,
                dims: dims,
                frame: frame,
                pivot: Point.CENTER
            })

            await res.toCanvas(this.ctx, op);
        }
    }

    async drawCatsSimplified()
    {
        const iconSize = CONFIG.cards.cats.simplifiedIconSize * this.sizeUnit;
        const numIcons = this.cats.length;
        const offset = CONFIG.cards.cats.simplifiedIconOffset.clone().scale(this.sizeUnit);
        const positions = 
        [
            new Point(this.size.x - numIcons*iconSize - offset.x, 0.5*iconSize + offset.y),
            new Point(numIcons * iconSize + offset.x, this.size.y - 0.5*iconSize - offset.y)
        ]
        const vectors =
        [
            Point.RIGHT,
            Point.LEFT
        ]

        const res = CONFIG.resLoader.getResource("cats");
        for(let i = 0; i < 2; i++)
        {
            const basePos = positions[i];
            const vec = vectors[i];
            const rot = (i == 0) ? 0 : Math.PI;
            
            for(let a = 0; a < numIcons; a++)
            {
                const pos = basePos.clone().move(vec.clone().scaleFactor(a));    
                const frame = CATS[this.cats[a]].frame + 1;
                const op = new LayoutOperation({
                    frame: frame,
                    translate: pos,
                    dims: new Point(iconSize),
                    pivot: new Point(0.5),
                    rotation: rot
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
            if(!color) { color = newColor; continue; }

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
        const center = this.size.clone().scaleFactor(0.5);
        const op = new LayoutOperation({
            translate: center,
            alpha: alpha,
            rotation: rot,
            pivot: new Point(0.5)
        })
        await pattern.toCanvas(this.ctx, op);
    }

    drawOutline()
    {
        const outlineSize = CONFIG.cards.outline.size * this.sizeUnit;
        strokeCanvas(this.ctx, CONFIG.cards.outline.color, outlineSize);
    }
}