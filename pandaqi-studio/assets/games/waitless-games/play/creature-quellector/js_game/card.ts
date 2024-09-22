import createContext from "js/pq_games/layout/canvas/createContext"
import fillCanvas from "js/pq_games/layout/canvas/fillCanvas"
import DropShadowEffect from "js/pq_games/layout/effects/dropShadowEffect"
import GrayScaleEffect from "js/pq_games/layout/effects/grayScaleEffect"
import CanvasEffect from "js/pq_games/layout/effects/layoutEffect"
import LayoutOperation from "js/pq_games/layout/layoutOperation"
import ResourceImage from "js/pq_games/layout/resources/resourceImage"
import ResourceShape from "js/pq_games/layout/resources/resourceShape"
import ResourceText from "js/pq_games/layout/resources/resourceText"
import { TextAlign, TextConfig } from "js/pq_games/layout/text/textConfig"
import FourSideValue from "js/pq_games/layout/values/fourSideValue"
import getPositionsCenteredAround from "js/pq_games/tools/geometry/paths/getPositionsCenteredAround"
import Path from "js/pq_games/tools/geometry/paths/path"
import Point from "js/pq_games/tools/geometry/point"
import Rectangle from "js/pq_games/tools/geometry/rectangle"
import fromArray from "js/pq_games/tools/random/fromArray"
import rangeInteger from "js/pq_games/tools/random/rangeInteger"
import { CATEGORIES, ELEMENTS } from "../js_shared/dict"
import CONFIG from "./config"
import ElementIcon from "./elementIcon"

export default class Card 
{
    typeList : ElementIcon[]
    mainType: ElementIcon

    ctx : CanvasRenderingContext2D
    size : Point
    sizeUnit : number
    center : Point

    cornerIconSize:number
    creatureSpritesheet: string
    backgroundSpritesheet: string
    iconSpritesheet: string

    strokeWidth: number
    strokeColor: string
    iconEffectsMain: CanvasEffect[]
    creatureSpritesheetNum: number
    backgroundSpritesheetNum: number
    creatureName: string
    rootPadding: number
    iconBorderRadius: FourSideValue
    creatureFlipX: boolean
    dropShadowOffset: Point

    constructor(mainType: ElementIcon, t:ElementIcon[]) 
    {    
        this.mainType = mainType;
        this.typeList = t;
        this.sort();
    }

    async draw() : Promise<HTMLCanvasElement>
    {
        const ctx = this.setup();
        this.drawBackground(ctx);
        this.drawHeader(ctx);
        this.drawBanner(ctx);
        this.drawContent(ctx);
        this.drawFooter(ctx);
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

    setup()
    {
        const size = CONFIG.cards.sizeResult;
        const ctx = createContext({ size: size });

        this.size = size.clone();
        this.sizeUnit = Math.min(this.size.x, this.size.y);
        this.center = new Point().fromXY(0.5*size.x, 0.5*size.y);

        this.cornerIconSize = 0.12*this.sizeUnit;
        this.creatureSpritesheetNum = rangeInteger(0,2);
        this.creatureSpritesheet = "creatures_" + (this.creatureSpritesheetNum + 1);

        this.backgroundSpritesheetNum = rangeInteger(0,2);
        this.backgroundSpritesheet = "backgrounds_" + (this.backgroundSpritesheetNum + 1);
        this.iconSpritesheet = "icons";
        this.creatureName = this.getCreatureName();

        this.rootPadding = 0.0425*this.sizeUnit;

        this.creatureFlipX = Math.random() <= 0.5;
        this.iconBorderRadius = new FourSideValue(0.025*this.sizeUnit);
        this.strokeWidth = CONFIG.cards.stroke.width * this.sizeUnit;
        this.strokeColor = CONFIG.inkFriendly ? CONFIG.cards.stroke.colorInkFriendly : this.getIconColorDark(this.getMainIcon());
        this.dropShadowOffset = new Point(0, CONFIG.cards.dropShadowOffset * this.cornerIconSize);

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

    getIconResource(elem:ElementIcon) : ResourceImage
    {
        if(elem.multi) { return CONFIG.multiTypeImageResource; }

        let textureKey = this.iconSpritesheet + "";
        if(elem.action) { textureKey += "_actions"; }
        return CONFIG.resLoader.getResource(textureKey);
    }

    getIconColorDark(elem:ElementIcon) : string
    {
        if(CONFIG.inkFriendly) { return CONFIG.cards.icon.backgroundDarkInkFriendly; }
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
    drawBackground(ctx)
    {
        const color = CONFIG.inkFriendly ? "#FFFFFF" : CONFIG.cards.backgroundColors[this.getMainIconElementType()];
        fillCanvas(ctx, color);

        if(CONFIG.inkFriendly) { return; }

        const size = this.sizeUnit * CONFIG.cards.backgroundScale;
        const res = CONFIG.resLoader.getResource(this.creatureSpritesheet);
        const canvOp = new LayoutOperation({
            pos: this.size.clone().scale(0.5),
            size: new Point(size),
            frame: this.getCardBackgroundFrame(),
            pivot: Point.CENTER,
            alpha: CONFIG.cards.backgroundAlpha,
            flipX: this.creatureFlipX,
        })

        res.toCanvas(ctx, canvOp);
    }

    drawHeader(ctx)
    {
        const contHeight = 0.6*this.sizeUnit;
        const clipPath = this.getClipPath(new Point(this.size.x, contHeight), new Point(this.rootPadding));
        const effects = CONFIG.inkFriendly ? [new GrayScaleEffect()] : [];

        // background environment image
        const backgroundImageSize = new Point(contHeight*1.7);
        const resBG = CONFIG.resLoader.getResource(this.backgroundSpritesheet);
        const posBG = new Point(0.5*this.size.x, 0.4275*this.size.y); // @TODO: should reposition so the bottom aligns with bottom clip path
        const opBG = new LayoutOperation({
            pos: posBG,
            size: backgroundImageSize,
            frame: this.getBackgroundFrame(),
            effects: effects,
            flipX: Math.random() <= 0.5,
            clip: clipPath,
            pivot: new Point(0.5, 1)
        });
        resBG.toCanvas(ctx, opBG);

        // actual creature (smaller)
        const creatureImageSize = new Point(contHeight, contHeight).scaleFactor(0.8);
        const resCreature = CONFIG.resLoader.getResource(this.creatureSpritesheet);
        const posCreature = new Point(0.5*this.size.x, 0.25*this.size.y);
        const opCreature = new LayoutOperation({
            pos: posCreature,
            size: creatureImageSize,
            frame: this.getMainFrame(),
            pivot: Point.CENTER,
            effects: effects
        })
        resCreature.toCanvas(ctx, opCreature);

        // Icon top-right
        const cornerPos = new Point(this.size.x - 0.8*this.cornerIconSize, 0.8*this.cornerIconSize);
        this.drawCornerIcon(ctx, cornerPos);

        // Icon reminder list (of what's on the card, overlays image)
        const remAnchor = new Point(0.85*this.size.x, 0.24*this.size.y);
        const iconReminderSize = new Point(0.725*this.cornerIconSize);
        const remPositions = getPositionsCenteredAround({ pos: remAnchor, size: iconReminderSize.clone().scale(1.2), num: this.typeList.length, dir: Point.DOWN });
        for(let i = 0; i < remPositions.length; i++)
        {
            const type = this.typeList[i];
            const resIcon = this.getIconResource(type);
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
        const clipPathForStroke = this.getClipPath(new Point(this.size.x, contHeight), new Point(this.rootPadding));
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

    drawBanner(ctx)
    {
        const iconResource = CONFIG.resLoader.getResource(this.iconSpritesheet);
        const counterSize = this.cornerIconSize;
        const mainIconSize = 2.5*counterSize;

        // @TODO: IGNORED NOW => this.iconBorderRadius
        const op = new LayoutOperation({
            pos: new Point(0.5*this.size.x, 0.425*this.size.y),
            size: new Point(mainIconSize),
            frame: this.getIconFrame(this.getMainIcon()),
            pivot: Point.CENTER,
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
    drawContent(ctx)
    {
        const anchor = new Point(0.5*this.size.x, 0.7*this.size.y);
        const iconSize = new Point(0.1725*this.sizeUnit);
        const positions = getPositionsCenteredAround({ pos: anchor, size: iconSize.clone().scale(1.15), num: this.typeList.length });
        for(let i = 0; i < positions.length; i++)
        {
            const type = this.typeList[i];
            const resIcon = this.getIconResource(type);
            const opIcon = new LayoutOperation({
                pos: positions[i],
                size: iconSize,
                frame: this.getIconFrame(type),
                pivot: Point.CENTER,
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

    drawCornerIcon(ctx, pos)
    {
        const resIcon = CONFIG.resLoader.getResource(this.iconSpritesheet);
        const opIcon = new LayoutOperation({
            pos: pos,
            size: new Point(this.cornerIconSize),
            frame: this.getIconFrame(this.getMainIcon()),
            effects: this.iconEffectsMain,
            pivot: Point.CENTER
        });
        resIcon.toCanvas(ctx, opIcon);
    }

    drawFooter(ctx)
    {
        const footerY = 0.875*this.size.y;
        const textBoxDims = new Point(0.775*this.size.x, 0.1*this.size.y);
        const footerGap = 0.66*this.cornerIconSize;
        const iconPos = new Point(0.8*this.cornerIconSize, footerY + 0.6 * this.cornerIconSize); 
        const textBoxAnchor = new Point(iconPos.x + footerGap, footerY);
        
        // icon again in bottom left
        this.drawCornerIcon(ctx, iconPos)

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
            font: CONFIG.fonts.heading,
            size: CONFIG.cards.textSize*this.sizeUnit,
        }).alignCenter();

        const resText = new ResourceText({ text: this.creatureName, textConfig: textConfig })
        const opText = new LayoutOperation({
            pos: rect.getCenter(),
            size: textBoxDims,
            fill: "#000000",
            pivot: Point.CENTER
        });
        resText.toCanvas(ctx, opText);
    }

    getCreatureName() : string
    {
        const genericNames = CONFIG.cards.genericNames;
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

    getClipPath(size:Point, offset:Point = new Point()) : Path
    {
        const margin = this.cornerIconSize*1.25;
        const p = this.rootPadding;
        const points = [
            new Point(0, 0),
            new Point(size.x - 2*p - margin, 0),
            new Point(size.x - 2*p - margin, margin),
            new Point(size.x - 2*p, margin),
            new Point(size.x - 2*p, size.y),
            new Point(0, size.y)
        ]

        for(const point of points)
        {
            point.add(offset);
        }

        return new Path({ points: points, close: true });
    }
}