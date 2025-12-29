
import { Vector2, MaterialVisualizer, createContext, ResourceGroup, fillResourceGroup, LayoutOperation, rangeInteger, ResourceImage, TextConfig, ResourceText, ColorLike, DropShadowEffect, getPositionsCenteredAround, TextAlign } from "lib/pq-games";
import { CONFIG } from "../shared/config";
import { ANIMALS, AnimalData, COLORS } from "../shared/dict";

export default class Card
{
    type: string;
    num: number;
    data: AnimalData;
    ctx: CanvasRenderingContext2D;
    size: Vector2;
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

        const size = vis.size;
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
        const inkFriendly = vis.inkFriendly;
        const bgColor = inkFriendly ? "#FFFFFF" : this.colorMain;
        fillResourceGroup(vis.size, group, bgColor);

        if(inkFriendly) { return; }

        const res = vis.getResource("bg");
        const op = new LayoutOperation({
            pos: this.size.clone().scale(0.5),
            size: this.size,
            pivot: new Vector2(0.5)
        })
        group.add(res, op);
    }

    drawMainIllustration(vis:MaterialVisualizer, group:ResourceGroup)
    {
        let key = "animals";
        if(this.data.expansion) { key += "_expansion"; }

        // draw some random (very light) splats to make it pop
        const numSplats = vis.get("cards.illustration.splatNum").randomInteger();
        const resSplat = vis.getResource("decoration");
        
        let angleJumps = 2 * Math.PI / numSplats;
        let startAngle = Math.random() * 2 * Math.PI;

        for(let i = 0; i < numSplats; i++)
        {
            const frame = rangeInteger(1,3);
            const randAlpha = vis.get("cards.illustration.splatAlphaBounds").random();
            const randRotation = Math.random() * 2 * Math.PI;

            const ang = startAngle + i*angleJumps;
            const randRadius = vis.get("cards.illustration.splatRadiusBounds").random() * this.sizeUnit;
            const randOffset = new Vector2().fromAngle(ang).scaleFactor(randRadius);
            const randPos = this.size.clone().scaleFactor(0.5).add(randOffset);

            const randDims = new Vector2(vis.get("cards.illustration.splatDimsBounds").random() * this.sizeUnit);

            const op = new LayoutOperation({
                pos: randPos,
                size: randDims,
                alpha: randAlpha,
                pivot: new Vector2(0.5),
                rot: randRotation,
                frame: frame
            })
            group.add(resSplat, op);
        }

        // draw the actual image
        const res : ResourceImage = vis.getResource(key);
        const spriteSize = vis.get("cards.illustration.sizeFactor") * this.sizeUnit;
        const frame = this.data.frame;

        const op = new LayoutOperation({
            frame: frame,
            pos: this.size.clone().scaleFactor(0.5),
            size: new Vector2(spriteSize),
            pivot: new Vector2(0.5),
            effects: vis.inkFriendlyEffect
        })
        group.add(res, op);
    }

    drawCornerIcons(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const baseOffset = vis.get("cards.icons.offset").clone();
        const offset = baseOffset.scaleFactor(this.sizeUnit);
        const positions = [
            offset.clone(), // first one is top left corner
            new Vector2(this.size.x-offset.x, offset.y),
            new Vector2(this.size.x-offset.x, this.size.y-offset.y),
            new Vector2(offset.x, this.size.y-offset.y)
        ]

        const bgOffset = vis.get("cards.icons.bgOffset").clone().scaleFactor(this.sizeUnit);
        const bgPositions = [
            bgOffset.clone(), // first one is top left corner
            new Vector2(this.size.x-bgOffset.x, bgOffset.y),
            new Vector2(this.size.x-bgOffset.x, this.size.y-bgOffset.y),
            new Vector2(bgOffset.x, this.size.y-bgOffset.y)
        ]

        let spriteKey = "icons";
        if(this.data.expansion) { spriteKey += "_expansion"; }

        const textColor = "#FFFFFF";
        const fontSize = vis.get("cards.icons.fontSize") * this.sizeUnit;
        const textConfig = new TextConfig({
            font: vis.get("fonts.heading"),
            size: fontSize,
        })

        const iconSize = vis.get("cards.icons.scaleFactor") * this.sizeUnit;
        const bgSize = vis.get("cards.icons.bgScaleFactor") * iconSize;

        const bgRes = vis.getResource("decoration");
        for(let i = 0; i < positions.length; i++)
        {
            const pos = positions[i];
            const displayNumber = i % 2 == 1;
            const displayIcon = !displayNumber;

            const op = new LayoutOperation({
                pivot: new Vector2(0.5),
                pos: pos,
                size: new Vector2(iconSize),
                effects: vis.inkFriendlyEffect,
                frame: this.data.frame,
                flipX: i >= 2,
                flipY: i >= 2
            })

            // no matter what it is, there needs to be some watercolor decoration behind it
            const bgOp = new LayoutOperation({
                pivot: new Vector2(0.5),
                pos: bgPositions[i],
                size: new Vector2(bgSize),
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
                if(vis.get("cards.icons.textShadow"))
                {
                    effects.push(new DropShadowEffect({ blurRadius: 0, offset: new Vector2(0.04*fontSize) }));
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
        if(!CONFIG._settings.addBearIcons.value) { return; }

        const yPos = vis.get("cards.bearIcons.yPos") * this.size.y;
        const xPos = 0.5 * this.size.x;
        const pos = new Vector2(xPos, yPos);
        const size = new Vector2(vis.get("cards.bearIcons.size") * this.sizeUnit);
        const positions = getPositionsCenteredAround({ pos: pos, num: 4, dir: Vector2.RIGHT, size: size });
        const res = vis.getResource("bear_icons");
        const sizeWithPadding = size.clone().scale(1.0 - vis.get("cards.bearIcons.padding"));
        for(let i = 0; i < 4; i++)
        {
            const op = new LayoutOperation({
                frame: i,
                pos: positions[i],
                size: sizeWithPadding,
                pivot: Vector2.CENTER
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
        const yPos = vis.get("cards.power.yPos") * this.size.y;
        const pos = new Vector2(xPos, yPos);

        const ratio = 1 / 4;
        const width = vis.get("cards.power.width") * this.size.x;
        const size = new Vector2(width, width * ratio);

        // the background for legibility
        const res = vis.getResource("bg_power");
        const op = new LayoutOperation({
            pos: pos,
            size: size,
            pivot: new Vector2(0.5)
        })

        res.toCanvas(this.ctx, op);

        // the actual text
        const fontSize = vis.get("cards.power.fontSize") * this.sizeUnit;
        const textConfig = new TextConfig({
            size: fontSize,
            font: vis.get("fonts.body"),
            alignHorizontal: TextAlign.MIDDLE,
            alignVertical: TextAlign.MIDDLE
        });

        const effects = [];
        if(vis.get("cards.icons.textShadow"))
        {
            effects.push(new DropShadowEffect({ offset: new Vector2(fontSize).scaleFactor(0.1) }));
        }
        op.effects = effects;

        const textToDisplay = prefix + ": " + desc;
        const text = new ResourceText({ text: textToDisplay, textConfig: textConfig });
        op.fill = new ColorLike("#FFFFFF");
        op.size.x *= vis.get("cards.power.textBoxSidePadding"); // a little padding around the text
        group.add(text, op);
    }
}