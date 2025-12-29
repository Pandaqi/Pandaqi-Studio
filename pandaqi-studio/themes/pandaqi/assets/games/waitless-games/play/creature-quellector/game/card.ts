
import { CATEGORIES, ELEMENTS } from "../shared/dict"
import { CONFIG } from "../shared/config"
import ElementIcon from "./elementIcon"
import { cacheVisualizerData } from "./caching"
import { Vector2, MaterialVisualizer, createContext, rangeInteger, DropShadowEffect, fromArray, ResourceImage, fillCanvas, LayoutOperation, GrayScaleEffect, getPositionsCenteredAround, ResourceShape, Rectangle, TextConfig, ResourceText, Path, LayoutEffect } from "lib/pq-games"

export default class Card 
{
    typeList : ElementIcon[]
    mainType: ElementIcon

    ctx : CanvasRenderingContext2D
    size : Vector2
    sizeUnit : number
    center : Vector2

    cornerIconSize:number
    creatureSpritesheet: string
    backgroundSpritesheet: string
    iconSpritesheet: string

    strokeWidth: number
    strokeColor: string
    iconEffectsMain: LayoutEffect[]
    creatureSpritesheetNum: number
    backgroundSpritesheetNum: number
    creatureName: string
    rootPadding: number
    creatureFlipX: boolean
    dropShadowOffset: Vector2

    constructor(mainType: ElementIcon, t:ElementIcon[]) 
    {    
        this.mainType = mainType;
        this.typeList = t;
        this.sort();
    }

    async draw(vis:MaterialVisualizer) : Promise<HTMLCanvasElement>
    {
        cacheVisualizerData(vis);

        const ctx = this.setup(vis);
        this.drawBackground(vis, ctx);
        this.drawHeader(vis, ctx);
        this.drawBanner(vis, ctx);
        this.drawContent(vis, ctx);
        this.drawFooter(vis, ctx);
        return ctx.canvas;
    }

    sort()
    {
        this.typeList.sort((a,b) => {
            // first sort per type (and alphabetically, but that's not important)
            const name = a.type.localeCompare(b.type);
            if(name != 0) { return name; }

            // then non-actions before actions (the "+" converts boolean to 0 or 1), so 0->1 ascending
            const ac = (+a.action) - (+b.action);
            if(ac != 0) { return ac; }

            // then regular before multitype
            // (an empty string if not multi, otherwise the string of the other type)
            return a.multi.length - b.multi.length;
        })
    }

    setup(vis:MaterialVisualizer)
    {
        const size = vis.size;
        const ctx = createContext({ size: size });

        this.size = size.clone();
        this.sizeUnit = Math.min(this.size.x, this.size.y);
        this.center = new Vector2().fromXY(0.5*size.x, 0.5*size.y);

        this.cornerIconSize = 0.12*this.sizeUnit;
        this.creatureSpritesheetNum = rangeInteger(0,2);
        this.creatureSpritesheet = "creatures_" + (this.creatureSpritesheetNum + 1);

        this.backgroundSpritesheetNum = rangeInteger(0,2);
        this.backgroundSpritesheet = "backgrounds_" + (this.backgroundSpritesheetNum + 1);
        this.iconSpritesheet = "icons";
        this.creatureName = this.getCreatureName(vis);

        this.rootPadding = 0.0425*this.sizeUnit;
        this.creatureFlipX = Math.random() <= 0.5;
        this.strokeWidth = vis.get("cards.stroke.width") * this.sizeUnit;
        this.strokeColor = vis.inkFriendly ? vis.get("cards.stroke.colorInkFriendly") : this.getIconColorDark(this.getMainIcon());
        this.dropShadowOffset = new Vector2(0, vis.get("cards.dropShadowOffset") * this.cornerIconSize);

        this.iconEffectsMain = [
            new DropShadowEffect({ 
                offset: this.dropShadowOffset,
                color: this.getIconColorDark(this.getMainIcon()),
            })
        ];

        return ctx;
    }

    // ElementIcon holds the subtype (e.g. fire for red) and a boolean for action or not
    getMainIcon() : ElementIcon
    {
        return this.mainType;
    }

    // This is the overarching type (red, blue, green, purple)
    getMainIconElementType() : string
    {
        return this.getIconElementType(this.getMainIcon());
    }

    getIconElementType(elem:ElementIcon) : string
    {
        return CONFIG.elementsReverse[elem.type];
    }

    getMainFrame() : number
    {
        return this.getIconFrame(this.getMainIcon());
    }

    getBackgroundFrame()
    {
        const rand = fromArray(this.typeList);
        return this.getIconFrame(rand);
    }

    getIconResource(vis:MaterialVisualizer, elem:ElementIcon) : ResourceImage
    {
        if(elem.multi) { return CONFIG.multiTypeImageResource; }

        let textureKey = this.iconSpritesheet + "";
        if(elem.action) { textureKey += "_actions"; }
        return vis.getResource(textureKey);
    }

    getIconColorDark(elem:ElementIcon) : string
    {
        // @ts-ignore
        if(CONFIG._settings.defaults.inkFriendly.value) { return CONFIG._drawing.cards.icon.backgroundDarkInkFriendly; }
        const cat = this.getIconElementType(elem);
        return CATEGORIES[cat].colorDark;
    }

    getIconColor(elem:ElementIcon) : string
    {
        const cat = this.getIconElementType(elem);
        return CATEGORIES[cat].color;
    }

    getIconFrame(elem:ElementIcon) : number
    {
        if(elem.multi)
        {
            console.log(elem);

            let frame1 = Math.floor(ELEMENTS[elem.type].frame / 4);
            let frame2 = Math.floor(ELEMENTS[elem.multi].frame / 4);
            console.log(frame1*4 + frame2);

            return frame1*4 + frame2;
        }

        return ELEMENTS[elem.type].frame
    }

    getCardBackgroundFrame()
    {
        return this.getMainFrame();
    }

    // @NOTE: drawn manually, as that's easier here
    drawBackground(vis: MaterialVisualizer, ctx)
    {
        const bgColors = vis.get("cards.backgroundColors");
        const color = vis.inkFriendly ? "#FFFFFF" : bgColors[this.getMainIconElementType()];
        fillCanvas(ctx, color);

        if(vis.inkFriendly) { return; }

        const size = this.sizeUnit * vis.get("cards.backgroundScale");
        const res = vis.getResource(this.creatureSpritesheet);
        const canvOp = new LayoutOperation({
            pos: this.size.clone().scale(0.5),
            size: new Vector2(size),
            frame: this.getCardBackgroundFrame(),
            pivot: Vector2.CENTER,
            alpha: vis.get("cards.backgroundAlpha"),
            flipX: this.creatureFlipX,
        })

        res.toCanvas(ctx, canvOp);
    }

    drawHeader(vis:MaterialVisualizer, ctx)
    {
        const contHeight = 0.6*this.sizeUnit;
        const clipPath = this.getClipPath(new Vector2(this.size.x, contHeight), new Vector2(this.rootPadding));
        const effects = vis.inkFriendly ? [new GrayScaleEffect()] : [];

        // background environment image
        const backgroundImageSize = new Vector2(contHeight*1.7);
        const resBG = vis.getResource(this.backgroundSpritesheet);
        const posBG = new Vector2(0.5*this.size.x, 0.4275*this.size.y);
        const opBG = new LayoutOperation({
            pos: posBG,
            size: backgroundImageSize,
            frame: this.getBackgroundFrame(),
            effects: effects,
            flipX: Math.random() <= 0.5,
            clip: clipPath,
            pivot: new Vector2(0.5, 1)
        });
        resBG.toCanvas(ctx, opBG);

        // actual creature (smaller)
        const creatureImageSize = new Vector2(contHeight, contHeight).scaleFactor(0.8);
        const resCreature = vis.getResource(this.creatureSpritesheet);
        const posCreature = new Vector2(0.5*this.size.x, 0.25*this.size.y);
        const opCreature = new LayoutOperation({
            pos: posCreature,
            size: creatureImageSize,
            frame: this.getMainFrame(),
            pivot: Vector2.CENTER,
            effects: effects
        })
        resCreature.toCanvas(ctx, opCreature);

        // Icon top-right
        const cornerPos = new Vector2(this.size.x - 0.8*this.cornerIconSize, 0.8*this.cornerIconSize);
        this.drawCornerIcon(vis, ctx, cornerPos);

        // Icon reminder list (of what's on the card, overlays image)
        const remAnchor = new Vector2(0.85*this.size.x, 0.24*this.size.y);
        const iconReminderSize = new Vector2(0.725*this.cornerIconSize);
        const remPositions = getPositionsCenteredAround({ pos: remAnchor, size: iconReminderSize.clone().scale(1.2), num: this.typeList.length, dir: Vector2.DOWN });
        for(let i = 0; i < remPositions.length; i++)
        {
            const type = this.typeList[i];
            const resIcon = this.getIconResource(vis, type);
            const opIcon = new LayoutOperation({
                pos: remPositions[i],
                size: iconReminderSize,
                frame: this.getIconFrame(type),
                stroke: this.getIconColorDark(type),
                strokeWidth: 0.5*this.strokeWidth
            })
            resIcon.toCanvas(ctx, opIcon);
        }

        // draw our clip path on top of everything
        const clipPathForStroke = this.getClipPath(new Vector2(this.size.x, contHeight), new Vector2(this.rootPadding));
        const resPath = new ResourceShape(clipPathForStroke);
        const opPath = new LayoutOperation({
            stroke: this.strokeColor,
            strokeWidth: this.strokeWidth
        });
        resPath.toCanvas(ctx, opPath);
    }

    getElementOnCycle(change:number = 1) : ElementIcon
    {
        const list = CONFIG.gameplay.elementCycleSubtype
        let idx = list.indexOf(this.getMainIcon().type);
        idx = (idx + change + list.length) % list.length
        return new ElementIcon(list[idx], false);
    }

    drawBanner(vis:MaterialVisualizer, ctx)
    {
        const iconResource = vis.getResource(this.iconSpritesheet);
        const counterSize = this.cornerIconSize;
        const mainIconSize = 2.5*counterSize;

        const op = new LayoutOperation({
            pos: new Vector2(0.5*this.size.x, 0.425*this.size.y),
            size: new Vector2(mainIconSize),
            frame: this.getIconFrame(this.getMainIcon()),
            pivot: Vector2.CENTER,
            effects: [
                new DropShadowEffect({ 
                    offset: this.dropShadowOffset.clone().scaleFactor(2.5),
                    color: this.getIconColorDark(this.getMainIcon()),
                })
            ]
        })
        iconResource.toCanvas(ctx, op);
    }

    // The main body of the card: the icons of this creature
    drawContent(vis:MaterialVisualizer, ctx)
    {
        const anchor = new Vector2(0.5*this.size.x, 0.7*this.size.y);
        const iconSize = new Vector2(0.1725*this.sizeUnit);
        const positions = getPositionsCenteredAround({ pos: anchor, size: iconSize.clone().scale(1.15), num: this.typeList.length });
        for(let i = 0; i < positions.length; i++)
        {
            const type = this.typeList[i];
            const resIcon = this.getIconResource(vis, type);
            const opIcon = new LayoutOperation({
                pos: positions[i],
                size: iconSize,
                frame: this.getIconFrame(type),
                pivot: Vector2.CENTER,
                effects: [
                    new DropShadowEffect({ 
                        offset: this.dropShadowOffset,
                        color: this.getIconColorDark(type),
                    })
                ]
            })
            resIcon.toCanvas(ctx, opIcon);
        }
    }

    drawCornerIcon(vis:MaterialVisualizer, ctx, pos)
    {
        const resIcon = vis.getResource(this.iconSpritesheet);
        const opIcon = new LayoutOperation({
            pos: pos,
            size: new Vector2(this.cornerIconSize),
            frame: this.getIconFrame(this.getMainIcon()),
            effects: this.iconEffectsMain,
            pivot: Vector2.CENTER
        });
        resIcon.toCanvas(ctx, opIcon);
    }

    drawFooter(vis:MaterialVisualizer, ctx)
    {
        const footerY = 0.875*this.size.y;
        const textBoxDims = new Vector2(0.775*this.size.x, 0.1*this.size.y);
        const footerGap = 0.66*this.cornerIconSize;
        const iconPos = new Vector2(0.8*this.cornerIconSize, footerY + 0.6 * this.cornerIconSize); 
        const textBoxAnchor = new Vector2(iconPos.x + footerGap, footerY);
        
        // icon again in bottom left
        this.drawCornerIcon(vis, ctx, iconPos)

        // the box behind the text
        const rect = new Rectangle().fromTopLeft(textBoxAnchor, textBoxDims);
        const rectRes = new ResourceShape(rect);
        const opRect = new LayoutOperation({
            fill: "#FFFFFF",
            stroke: this.strokeColor,
            strokeWidth: this.strokeWidth
        });
        rectRes.toCanvas(ctx, opRect);

        // the text with the name of the creature
        const textConfig = new TextConfig({
            font: vis.get("fonts.heading"),
            size: vis.get("cards.textSize")*this.sizeUnit,
        }).alignCenter();

        const resText = new ResourceText({ text: this.creatureName, textConfig: textConfig })
        const opText = new LayoutOperation({
            pos: rect.getCenter(),
            size: textBoxDims,
            fill: "#000000",
            pivot: Vector2.CENTER
        });
        resText.toCanvas(ctx, opText);
    }

    getCreatureName(vis:MaterialVisualizer) : string
    {
        const genericNames = vis.get("cards.genericNames");
        const typeNames = CATEGORIES[this.getMainIconElementType()].names;
        let specificNamesData = ELEMENTS[this.getMainIcon().type].names;
        let specificNames = specificNamesData[0];
        if(this.creatureSpritesheetNum < specificNamesData.length) 
        {
            specificNames = specificNamesData[this.creatureSpritesheetNum];
        }

        const maxLength = 14;
        let parts:string[], badName:boolean;
        do 
        {
            parts = [];
            for(let i = 0; i < 2; i++)
            {
                let part = fromArray(specificNames);
                if(Math.random() <= 0.33) { part = fromArray(typeNames); }
                if(Math.random() <= 0.1) { part = fromArray(genericNames); }
                parts.push(part);
            }

            badName = (parts[0] == parts[1]) || (parts[0] + parts[1]).length >= maxLength;
        } while(badName);
        

        let joiner = "";
        if(Math.random() <= 0.3) { joiner = " "; }
        if(Math.random() <= 0.075) { joiner = "-"; }

        return parts.join(joiner);
    }

    getClipPath(size:Vector2, offset:Vector2 = new Vector2()) : Path
    {
        const margin = this.cornerIconSize*1.25;
        const p = this.rootPadding;
        const points = [
            new Vector2(0, 0),
            new Vector2(size.x - 2*p - margin, 0),
            new Vector2(size.x - 2*p - margin, margin),
            new Vector2(size.x - 2*p, margin),
            new Vector2(size.x - 2*p, size.y),
            new Vector2(0, size.y)
        ]

        for(const point of points)
        {
            point.add(offset);
        }

        return new Path(points, true);
    }
}