import createContext from "js/pq_games/layout/canvas/createContext";
import { ANIMALS, AnimalData, COLORS } from "../shared/dict";
import { CONFIG } from "../shared/config";
import strokeCanvas from "js/pq_games/layout/canvas/strokeCanvas";
import Point from "js/pq_games/tools/geometry/point";
import fillCanvas from "js/pq_games/layout/canvas/fillCanvas";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import ResourceImage from "js/pq_games/layout/resources/resourceImage";
import ResourceText from "js/pq_games/layout/resources/resourceText";
import TextConfig, { TextAlign } from "js/pq_games/layout/text/textConfig";
import GrayScaleEffect from "js/pq_games/layout/effects/grayScaleEffect";
import ColorLike from "js/pq_games/layout/color/colorLike";
import DropShadowEffect from "js/pq_games/layout/effects/dropShadowEffect";
import rangeInteger from "js/pq_games/tools/random/rangeInteger";
import getPositionsCenteredAround from "js/pq_games/tools/geometry/paths/getPositionsCenteredAround";

export default class Card
{
    type: string;
    num: number;
    data: AnimalData;
    ctx: CanvasRenderingContext2D;
    size: Point;
    sizeUnit: number;
    colorMain: string;

    constructor(tp:string, num:number)
    {
        this.type = tp;
        this.num = num;
        this.data = ANIMALS[this.type];
    }

    getCanvas() { return this.ctx.canvas; }
    async draw()
    {
        const size = CONFIG.cards.sizeResult;
        const ctx = createContext({ size: size });
        this.ctx = ctx;
        this.size = size;
        this.sizeUnit = Math.min(size.x, size.y);
        this.colorMain = COLORS[this.data.color];

        await this.drawBackground();
        await this.drawMainIllustration();
        await this.drawCornerIcons();
        await this.drawBearIcons();
        await this.drawSpecialPower();
        
        const outlineSize = CONFIG.cards.outline.size * this.sizeUnit;
        strokeCanvas(ctx, CONFIG.cards.outline.color, outlineSize);

        return this.getCanvas();
    }

    async drawBackground()
    {
        const bgColor = CONFIG.inkFriendly ? "#FFFFFF" : this.colorMain;
        fillCanvas(this.ctx, bgColor);

        const res = CONFIG.resLoader.getResource("bg");
        const op = new LayoutOperation({
            pos: this.size.clone().scale(0.5),
            size: this.size,
            pivot: new Point(0.5)
        })

        if(!CONFIG.inkFriendly)
        {
            await res.toCanvas(this.ctx, op);
        }
    }

    async drawMainIllustration()
    {
        let key = "animals";
        if(this.data.expansion) { key += "_expansion"; }

        // draw some random (very light) splats to make it pop
        const numSplats = CONFIG.cards.illustration.splatNum.randomInteger();
        const resSplat = CONFIG.resLoader.getResource("decoration");
        
        let angleJumps = 2 * Math.PI / numSplats;
        let startAngle = Math.random() * 2 * Math.PI;

        for(let i = 0; i < numSplats; i++)
        {
            const frame = rangeInteger(1,3);
            const randAlpha = CONFIG.cards.illustration.splatAlphaBounds.random();
            const randRotation = Math.random() * 2 * Math.PI;

            const ang = startAngle + i*angleJumps;
            const randRadius = CONFIG.cards.illustration.splatRadiusBounds.random() * this.sizeUnit;
            const randOffset = new Point().fromAngle(ang).scaleFactor(randRadius);
            const randPos = this.size.clone().scaleFactor(0.5).add(randOffset);

            const randDims = new Point(CONFIG.cards.illustration.splatDimsBounds.random() * this.sizeUnit);

            const op = new LayoutOperation({
                pos: randPos,
                size: randDims,
                alpha: randAlpha,
                pivot: new Point(0.5),
                rot: randRotation,
                frame: frame
            })
            await resSplat.toCanvas(this.ctx, op);
        }

        // draw the actual image
        const res : ResourceImage = CONFIG.resLoader.getResource(key);
        const spriteSize = CONFIG.cards.illustration.sizeFactor * this.sizeUnit;
        const frame = this.data.frame;
        const effects = [];
        if(CONFIG.inkFriendly)
        {
            effects.push(new GrayScaleEffect());
        }

        const op = new LayoutOperation({
            frame: frame,
            pos: this.size.clone().scaleFactor(0.5),
            size: new Point(spriteSize),
            pivot: new Point(0.5),
            effects: effects
        })
        await res.toCanvas(this.ctx, op);
    }

    async drawCornerIcons()
    {
        const baseOffset = CONFIG.cards.icons.offset.clone();
        const offset = baseOffset.scaleFactor(this.sizeUnit);
        const positions = [
            offset.clone(), // first one is top left corner
            new Point(this.size.x-offset.x, offset.y),
            new Point(this.size.x-offset.x, this.size.y-offset.y),
            new Point(offset.x, this.size.y-offset.y)
        ]

        const bgOffset = CONFIG.cards.icons.bgOffset.clone().scaleFactor(this.sizeUnit);
        const bgPositions = [
            bgOffset.clone(), // first one is top left corner
            new Point(this.size.x-bgOffset.x, bgOffset.y),
            new Point(this.size.x-bgOffset.x, this.size.y-bgOffset.y),
            new Point(bgOffset.x, this.size.y-bgOffset.y)
        ]

        let spriteKey = "icons";
        if(this.data.expansion) { spriteKey += "_expansion"; }

        const textColor = "#FFFFFF";
        const fontSize = CONFIG.cards.icons.fontSize * this.sizeUnit;
        const textConfig = new TextConfig({
            font: CONFIG.fonts.heading,
            size: fontSize,
            alignHorizontal: TextAlign.MIDDLE,
            alignVertical: TextAlign.MIDDLE,
            lineHeight: 1.0,
        })

        const iconSize = CONFIG.cards.icons.scaleFactor * this.sizeUnit;
        const bgSize = CONFIG.cards.icons.bgScaleFactor * iconSize;

        const effects = [];
        if(CONFIG.inkFriendly)
        {
            effects.push(new GrayScaleEffect());
        }

        for(let i = 0; i < positions.length; i++)
        {
            const pos = positions[i];
            const displayNumber = i % 2 == 1;
            const displayIcon = !displayNumber;

            const op = new LayoutOperation({
                pivot: new Point(0.5),
                pos: pos,
                size: new Point(iconSize),
                effects: effects,
                frame: this.data.frame,
                flipX: i >= 2,
                flipY: i >= 2
            })

            // no matter what it is, there needs to be some watercolor decoration behind it
            const bgOp = new LayoutOperation({
                pivot: new Point(0.5),
                pos: bgPositions[i],
                size: new Point(bgSize),
                frame: 0,
                flipX: (i == 1 || i == 2),
                flipY: i >= 2
            })
            const bgRes = CONFIG.resLoader.getResource("decoration");
            await bgRes.toCanvas(this.ctx, bgOp);

            let res
            if(displayNumber)
            {
                res = new ResourceText({ text: this.num.toString(), textConfig: textConfig });
                op.fill = new ColorLike(textColor);
                op.size = op.size.clone().scaleFactor(1.5); // text might exceed boundaries, so give ourselves a little extra space

                const effects = [];
                if(CONFIG.cards.icons.textShadow)
                {
                    effects.push(new DropShadowEffect({ blurRadius: 0, offset: new Point(0.04*fontSize) }));
                }
                op.effects = effects;
            }

            if(displayIcon)
            {
                res = CONFIG.resLoader.getResource(spriteKey);
            }

            await res.toCanvas(this.ctx, op);
        }
    }

    async drawBearIcons()
    {
        if(this.type != "bear") { return; }
        if(!CONFIG.addBearIcons) { return; }

        const yPos = CONFIG.cards.bearIcons.yPos * this.size.y;
        const xPos = 0.5 * this.size.x;
        const pos = new Point(xPos, yPos);
        const size = new Point(CONFIG.cards.bearIcons.size * this.sizeUnit);
        const positions = getPositionsCenteredAround({ pos: pos, num: 4, dir: Point.RIGHT, size: size });
        const res = CONFIG.resLoader.getResource("bear_icons");
        const sizeWithPadding = size.clone().scale(1.0 - CONFIG.cards.bearIcons.padding);
        for(let i = 0; i < 4; i++)
        {
            const op = new LayoutOperation({
                frame: i,
                pos: positions[i],
                size: sizeWithPadding,
                pivot: Point.CENTER
            })
            await res.toCanvas(this.ctx, op);
        }
    }

    async drawSpecialPower()
    {
        const desc = this.data.desc;
        if(!desc) { return; }

        const prefix = this.data.type.toString();

        const xPos = 0.5 * this.size.x;
        const yPos = CONFIG.cards.power.yPos * this.size.y;
        const pos = new Point(xPos, yPos);

        const ratio = 1 / 4;
        const width = CONFIG.cards.power.width * this.size.x;
        const size = new Point(width, width * ratio);

        // the background for legibility
        const res = CONFIG.resLoader.getResource("bg_power");
        const op = new LayoutOperation({
            pos: pos,
            size: size,
            pivot: new Point(0.5)
        })

        await res.toCanvas(this.ctx, op);

        // the actual text
        const fontSize = CONFIG.cards.power.fontSize * this.sizeUnit;
        const textConfig = new TextConfig({
            size: fontSize,
            font: CONFIG.fonts.body,
            alignHorizontal: TextAlign.MIDDLE,
            alignVertical: TextAlign.MIDDLE
        });

        const effects = [];
        if(CONFIG.cards.icons.textShadow)
        {
            effects.push(new DropShadowEffect({ offset: new Point(fontSize).scaleFactor(0.1) }));
        }
        op.effects = effects;

        const textToDisplay = prefix + ": " + desc;
        const text = new ResourceText({ text: textToDisplay, textConfig: textConfig });
        op.fill = new ColorLike("#FFFFFF");
        op.size.x *= CONFIG.cards.power.textBoxSidePadding; // a little padding around the text
        await text.toCanvas(this.ctx, op);
    }
}