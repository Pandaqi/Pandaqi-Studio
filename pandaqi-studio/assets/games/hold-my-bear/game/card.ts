import createContext from "js/pq_games/layout/canvas/createContext";
import fillResourceGroup from "js/pq_games/layout/canvas/fillResourceGroup";
import ColorLike from "js/pq_games/layout/color/colorLike";
import DropShadowEffect from "js/pq_games/layout/effects/dropShadowEffect";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import ResourceImage from "js/pq_games/layout/resources/resourceImage";
import ResourceText from "js/pq_games/layout/resources/resourceText";
import TextConfig, { TextAlign } from "js/pq_games/layout/text/textConfig";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import getPositionsCenteredAround from "js/pq_games/tools/geometry/paths/getPositionsCenteredAround";
import Point from "js/pq_games/tools/geometry/point";
import rangeInteger from "js/pq_games/tools/random/rangeInteger";
import { CONFIG } from "../shared/config";
import { ANIMALS, AnimalData, COLORS } from "../shared/dict";

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
    async draw(vis:MaterialVisualizer)
    {
        const group = vis.prepareDraw();

        const size = CONFIG.cards.sizeResult;
        const ctx = createContext({ size: size });
        this.ctx = ctx;
        this.size = size;
        this.sizeUnit = Math.min(size.x, size.y);
        this.colorMain = COLORS[this.data.color];

        this.drawBackground(vis, group);
        this.drawMainIllustration(vis, group);
        this.drawCornerIcons(vis, group);
        this.drawBearIcons(vis, group);
        this.drawSpecialPower(vis, group);

        return await vis.finishDraw(group);
    }

    drawBackground(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const bgColor = CONFIG.inkFriendly ? "#FFFFFF" : this.colorMain;
        fillResourceGroup(vis.size, group, bgColor);

        if(CONFIG.inkFriendly) { return; }

        const res = vis.getResource("bg");
        const op = new LayoutOperation({
            pos: this.size.clone().scale(0.5),
            size: this.size,
            pivot: new Point(0.5)
        })
        group.add(res, op);
    }

    drawMainIllustration(vis:MaterialVisualizer, group:ResourceGroup)
    {
        let key = "animals";
        if(this.data.expansion) { key += "_expansion"; }

        // draw some random (very light) splats to make it pop
        const numSplats = CONFIG.cards.illustration.splatNum.randomInteger();
        const resSplat = vis.getResource("decoration");
        
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
            group.add(resSplat, op);
        }

        // draw the actual image
        const res : ResourceImage = vis.getResource(key);
        const spriteSize = CONFIG.cards.illustration.sizeFactor * this.sizeUnit;
        const frame = this.data.frame;

        const op = new LayoutOperation({
            frame: frame,
            pos: this.size.clone().scaleFactor(0.5),
            size: new Point(spriteSize),
            pivot: new Point(0.5),
            effects: vis.inkFriendlyEffect
        })
        group.add(res, op);
    }

    drawCornerIcons(vis:MaterialVisualizer, group:ResourceGroup)
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
        })

        const iconSize = CONFIG.cards.icons.scaleFactor * this.sizeUnit;
        const bgSize = CONFIG.cards.icons.bgScaleFactor * iconSize;

        const bgRes = vis.getResource("decoration");
        for(let i = 0; i < positions.length; i++)
        {
            const pos = positions[i];
            const displayNumber = i % 2 == 1;
            const displayIcon = !displayNumber;

            const op = new LayoutOperation({
                pivot: new Point(0.5),
                pos: pos,
                size: new Point(iconSize),
                effects: vis.inkFriendlyEffect,
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
            group.add(bgRes, bgOp);

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
            if(displayIcon) { res = vis.getResource(spriteKey); }
            group.add(res, op);
        }
    }

    drawBearIcons(vis:MaterialVisualizer, group:ResourceGroup)
    {
        if(this.type != "bear") { return; }
        if(!CONFIG.addBearIcons) { return; }

        const yPos = CONFIG.cards.bearIcons.yPos * this.size.y;
        const xPos = 0.5 * this.size.x;
        const pos = new Point(xPos, yPos);
        const size = new Point(CONFIG.cards.bearIcons.size * this.sizeUnit);
        const positions = getPositionsCenteredAround({ pos: pos, num: 4, dir: Point.RIGHT, size: size });
        const res = vis.getResource("bear_icons");
        const sizeWithPadding = size.clone().scale(1.0 - CONFIG.cards.bearIcons.padding);
        for(let i = 0; i < 4; i++)
        {
            const op = new LayoutOperation({
                frame: i,
                pos: positions[i],
                size: sizeWithPadding,
                pivot: Point.CENTER
            })
            group.add(res, op);
        }
    }

    drawSpecialPower(vis:MaterialVisualizer, group:ResourceGroup)
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
        const res = vis.getResource("bg_power");
        const op = new LayoutOperation({
            pos: pos,
            size: size,
            pivot: new Point(0.5)
        })

        res.toCanvas(this.ctx, op);

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
        group.add(text, op);
    }
}