import Point from "js/pq_games/tools/geometry/point"
import CONFIG from "./config"
import createContext from "js/pq_games/canvas/createContext"

import { Container } from "js/pq_games/layout/containers/container"
import ContainerImage from "js/pq_games/layout/containers/containerImage"
import AnchorValue from "js/pq_games/layout/values/anchorValue"
import ContainerConfig from "js/pq_games/layout/containers/containerConfig"

import TwoAxisValue from "js/pq_games/layout/values/twoAxisValue"
import { SizeValue, SizeType } from "js/pq_games/layout/values/sizeValue"
import StrokeValue from "js/pq_games/layout/values/strokeValue"
import FourSideValue from "js/pq_games/layout/values/fourSideValue"

import { ELEMENTS, CATEGORIES } from "./dict"

import { TextConfig, TextAlign, TextStyle } from "js/pq_games/layout/text/textConfig"
import ContainerText from "js/pq_games/layout/containers/containerText"
import AlignValue from "js/pq_games/layout/values/alignValue"
import { FlowDir, FlowType } from "js/pq_games/layout/values/flowInput"
import ElementIcon from "./elementIcon"
import takeBitesOutOfPath from "js/pq_games/tools/geometry/takeBitesOutOfPath"
import DropShadowEffect from "js/pq_games/canvas/effects/dropShadowResource"
import CanvasEffect from "js/pq_games/canvas/effects/canvasEffect"
import CanvasOperation from "js/pq_games/canvas/canvasOperation"
import ResourceImage from "js/pq_games/layout/resources/resourceImage"
import rangeInteger from "js/pq_games/tools/random/rangeInteger"
import fromArray from "js/pq_games/tools/random/fromArray"
import PlacementValue from "js/pq_games/layout/values/placementValue"

export default class Card 
{
    typeList : ElementIcon[]
    ctx : CanvasRenderingContext2D
    dims : Point
    sizeUnit : number
    center : Point
    container : Container

    cornerIconSize:number
    creatureSpritesheet: string
    backgroundSpritesheet: string
    iconSpritesheet: string

    clipPath: Point[]
    imageContainer: Container
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

    constructor(t:ElementIcon[]) 
    {    
        this.typeList = t;
    }

    getCanvas() : HTMLCanvasElement { return this.ctx.canvas; }
    async draw()
    {
        this.setup();
        this.drawBackground();
        await this.drawHeader();
        this.drawBanner();
        this.drawContent();
        this.drawFooter();

        await this.container.toCanvas(this.getCanvas());
        this.drawCustomPost();
    }

    setup()
    {
        const dims = CONFIG.cards.size;
        this.ctx = createContext({ width: dims.x, height: dims.y, alpha: true, willReadFrequently: false });
        this.dims = new Point(dims);
        this.sizeUnit = Math.min(this.dims.x, this.dims.y);
        this.center = new Point().fromXY(0.5*dims.x, 0.5*dims.y);

        this.cornerIconSize = 0.12*this.sizeUnit;
        this.creatureSpritesheetNum = rangeInteger(0,2);
        this.creatureSpritesheet = "creatures_" + (this.creatureSpritesheetNum + 1);

        this.backgroundSpritesheetNum = rangeInteger(0,2);
        this.backgroundSpritesheet = "backgrounds_" + (this.backgroundSpritesheetNum + 1);
        this.iconSpritesheet = "icons";
        this.creatureName = this.getCreatureName();

        this.rootPadding = 0.0425*this.sizeUnit;

        const params = { 
            size: new TwoAxisValue().fromPoint(this.dims),
            padding: new FourSideValue(this.rootPadding),
            config: new ContainerConfig({ debugDimensions: true })
        };

        this.creatureFlipX = Math.random() <= 0.5;
        this.iconBorderRadius = new FourSideValue(0.025*this.sizeUnit);
        this.strokeWidth = CONFIG.cards.stroke.width * this.sizeUnit;
        this.strokeColor = CONFIG.cards.stroke.color;
        this.dropShadowOffset = new Point(0, 5);

        this.iconEffectsMain = [
            new DropShadowEffect({ 
                offset: this.dropShadowOffset,
                color: this.getIconColorDark(this.getMainIcon()), // @TODO: color based on icon type??
            })
        ];

        this.container = new Container(params);
        console.log(this.container);
    }

    // ElementIcon holds the subtype (e.g. fire for red) and a boolean for action or not
    getMainIcon() : ElementIcon
    {
        return this.typeList[0]
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
        if(this.typeList.length <= 1) { return this.getMainFrame(); }
        const rand = fromArray(this.typeList.slice(1));
        return this.getIconFrame(rand);
    }

    getIconResource(elem:ElementIcon) : ResourceImage
    {
        let textureKey = this.iconSpritesheet + "";
        if(elem.action) { textureKey += "_actions"; }
        return CONFIG.resLoader.getResource(textureKey);
    }

    getIconColorDark(elem:ElementIcon) : string
    {
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
        return ELEMENTS[elem.type].frame
    }

    getCardBackgroundFrame()
    {
        return this.getMainFrame();
    }

    // @NOTE: drawn manually, as that's easier here
    drawBackground()
    {
        const ctx = this.ctx
        ctx.fillStyle = CONFIG.cards.backgroundColors[this.getMainIconElementType()];
        ctx.fillRect(0, 0, this.dims.x, this.dims.y);

        const size = this.sizeUnit * CONFIG.cards.backgroundScale;
        const sizePoint = new Point(size, size);
        const alpha = CONFIG.cards.backgroundAlpha;

        const res = CONFIG.resLoader.getResource(this.creatureSpritesheet);
        const canvOp = new CanvasOperation({
            dims: sizePoint,
            pivot: new Point().setXY(0.5, 0.5),
            translate: new Point(0.5 * this.dims.x, 0.5*this.dims.y),
            alpha: alpha,
            flipX: this.creatureFlipX,
            frame: this.getCardBackgroundFrame()
        })
        res.drawTo(this.getCanvas(), canvOp);
    }

    async drawHeader()
    {
        // actual image of creature
        const contSize = new TwoAxisValue().setBlock();
        const contHeight = 0.6*this.sizeUnit;
        contSize.y = new SizeValue(contHeight);

        const imageContainer = new Container({
            size: contSize
        });
        this.imageContainer = imageContainer;
        this.container.addChild(imageContainer);

        const backgroundImageSize = new Point(contHeight, contHeight).scaleFactor(1.7);
        const bgResource = CONFIG.resLoader.getResource(this.backgroundSpritesheet);
        const bgContainer = new ContainerImage({ 
            resource: bgResource,
            frame: this.getBackgroundFrame(),
            size: backgroundImageSize,
            anchor: AnchorValue.BOTTOM_CENTER,
            ghost: true,
            flipX: Math.random() <= 0.5
        });
        imageContainer.addChild(bgContainer);

        const creatureImageSize = new Point(contHeight, contHeight).scaleFactor(0.8);
        const creatureResource = CONFIG.resLoader.getResource(this.creatureSpritesheet);
        const creatureContainer = new ContainerImage({ 
            resource: creatureResource,
            frame: this.getMainFrame(),
            size: creatureImageSize,
            anchor: AnchorValue.CENTER_CENTER,
            ghost: true,
            flipX: this.creatureFlipX
        });
        imageContainer.addChild(creatureContainer);

        // Icon top-right
        const iconEffects = this.iconEffectsMain;

        const iconResource = CONFIG.resLoader.getResource(this.iconSpritesheet);
        const iconContainer = new ContainerImage({
            resource: iconResource,
            frame: this.getIconFrame(this.getMainIcon()),
            size: new TwoAxisValue().fromSingle(this.cornerIconSize),
            clipPath: this.getFunkyClipPath(new Point().setFactor(this.cornerIconSize)),
            fill: this.getIconColor(this.getMainIcon()),
            borderRadius: this.iconBorderRadius,
            effects: this.iconEffectsMain,
            anchor: AnchorValue.TOP_RIGHT
        })
        this.container.addChild(iconContainer);

        

        // Icon reminder list (of what's on the card, overlays image)
        const iconReminderSize = 0.725*this.cornerIconSize;
        const iconReminderPadding = 0.25*iconReminderSize;
        const iconReminderGap = 0.5*iconReminderPadding;
        const iconReminderRadius = new FourSideValue(0.5*this.iconBorderRadius.top.get());
        const listSize = new TwoAxisValue().setFreeGrow();
        const iconReminders = new Container({
            anchor: AnchorValue.BOTTOM_RIGHT,
            padding: iconReminderPadding,
            size: listSize,
            dir: FlowDir.VERTICAL,
            gap: iconReminderGap,
            flow: FlowType.GRID
        })
        imageContainer.addChild(iconReminders);

        for(const type of this.typeList)
        {
            const cont = new ContainerImage({
                resource: this.getIconResource(type),
                frame: this.getIconFrame(type),
                size: new TwoAxisValue().fromSingle(iconReminderSize),
                stroke: new StrokeValue(0.5*this.strokeWidth, this.getIconColorDark(type)),
                borderRadius: iconReminderRadius,
                fill: this.getIconColor(type)
            })
            iconReminders.addChild(cont);
        }
  
        // Clip the creature image (first update dimensions so we can grab the right ones from containers)
        this.clipPath = this.getClipPath(new Point(this.dims.x, contHeight));
        imageContainer.clipPath = this.clipPath;

        // we draw our clip path as an IMAGE, so it fits right into this pipeline at the right moment
        const clipPathResource = await this.getClipPathImageResource();
        const clipPath = new ContainerImage({
            resource: clipPathResource,
            size: clipPathResource.size.clone(),
            placement: PlacementValue.ABSOLUTE,
            pos: new TwoAxisValue(this.rootPadding, this.rootPadding)
        })
        this.container.addChild(clipPath);
    }

    getElementOnCycle(change:number = 1) : ElementIcon
    {
        const list = CONFIG.gameplay.elementCycleSubtype
        let idx = list.indexOf(this.getMainIcon().type);
        idx = (idx + change + list.length) % list.length
        console.log(list);
        console.log(idx, change, this.getMainIcon());
        return new ElementIcon(list[idx], false);
    }

    drawBanner()
    {
        const bannerHeight = 0.2*this.sizeUnit;
        const bannerContainer = new Container({
            size: new TwoAxisValue(new SizeValue(1.0, SizeType.PARENT), bannerHeight),
            flow: FlowType.GRID,
            dir: FlowDir.HORIZONTAL,
            alignFlow: AlignValue.SPACE_BETWEEN,
            alignStack: AlignValue.MIDDLE
        })
        this.container.addChild(bannerContainer);

        const iconResource = CONFIG.resLoader.getResource(this.iconSpritesheet);
        const counterSize = this.cornerIconSize;
        const mainIconSize = 3.0*counterSize;
        const iconEffects1 = [
            new DropShadowEffect({ 
                offset: this.dropShadowOffset,
                color: this.getIconColorDark(this.getElementOnCycle(-1)),
            })
        ];

        const counteredBy = new ContainerImage({
            resource: iconResource,
            frame: this.getIconFrame(this.getElementOnCycle(-1)),
            size: new TwoAxisValue().fromSingle(counterSize),
            clipPath: this.getFunkyClipPath(new Point().setFactor(counterSize)),
            fill: this.getIconColor(this.getElementOnCycle(-1)),
            borderRadius: this.iconBorderRadius,
            effects: iconEffects1,
            shrink: 0
        })

        const counterIconResource = CONFIG.resLoader.getResource("counter_icon");
        const counterParams = {   
            resource: counterIconResource,
            frame: 0,
            size: new TwoAxisValue().setAuto()
        }
        const counterIcon1 = new ContainerImage(counterParams);
        const counterIcon2 = new ContainerImage(counterParams);

        const mainIcon = new ContainerImage({
            resource: iconResource,
            frame: this.getIconFrame(this.getMainIcon()),
            fill: this.getIconColor(this.getMainIcon()),
            borderRadius: this.iconBorderRadius,
            size: new TwoAxisValue().fromSingle(mainIconSize),
            clipPath: this.getFunkyClipPath(new Point().setFactor(mainIconSize), { min: 14.0, max: 22.0 }),
            effects: this.iconEffectsMain,
            shrink: 0
        })

        const iconEffects2 = [
            new DropShadowEffect({ 
                offset: this.dropShadowOffset,
                color: this.getIconColorDark(this.getElementOnCycle(+1)),
            })
        ];
        const weCounter = new ContainerImage({
            resource: iconResource,
            frame: this.getIconFrame(this.getElementOnCycle(+1)),
            fill: this.getIconColor(this.getElementOnCycle(+1)),
            borderRadius: this.iconBorderRadius,
            size: new TwoAxisValue().fromSingle(counterSize),
            clipPath: this.getFunkyClipPath(new Point().setFactor(counterSize)),
            effects: iconEffects2,
            shrink: 0
        })

        bannerContainer.addChild(counteredBy);
        bannerContainer.addChild(counterIcon1);
        bannerContainer.addChild(mainIcon);
        bannerContainer.addChild(counterIcon2);
        bannerContainer.addChild(weCounter);

    }

    getFunkyClipPath(size:Point, bounds = { min: 3, max: 6 }) : Point[]
    {
        const offsetForShadow = 10;
        const path = [
            new Point(),
            new Point(size.x, 0),
            new Point(size.x, size.y + offsetForShadow),
            new Point(0, size.y + offsetForShadow)
        ]

        const funkyPath = takeBitesOutOfPath({ path: path, biteBounds: bounds });
        return funkyPath;
    }

    drawContent()
    {
        // The main body of the card: the icons of this creature
        const padding = 0.05*this.sizeUnit
        const gap = padding;
        const offsetTop = 0.155*this.sizeUnit;
        const icons = new Container({
            padding: padding,
            size: new TwoAxisValue().setBlock(),
            margin: new FourSideValue(offsetTop,0,0,0),
            dir: FlowDir.HORIZONTAL,
            alignFlow: AlignValue.MIDDLE,
            gap: gap,
            flow: FlowType.GRID
        })
        this.container.addChild(icons);

        const iconSize = 0.1725*this.sizeUnit;
        for(const type of this.typeList)
        {
            const iconEffects = [
                new DropShadowEffect({ 
                    offset: this.dropShadowOffset,
                    color: this.getIconColorDark(type),
                })
            ];

            const cont = new ContainerImage({
                resource: this.getIconResource(type),
                frame: this.getIconFrame(type),
                fill: this.getIconColor(type),
                borderRadius: this.iconBorderRadius,
                size: new TwoAxisValue().fromSingle(iconSize),
                clipPath: this.getFunkyClipPath(new Point().setFactor(iconSize)),
                effects: iconEffects,
                shrink: 0,
            })
            icons.addChild(cont);
        }
    }

    drawFooter()
    {
        const footerGap = 0.175*this.cornerIconSize;
        const footer = new Container({
            anchor: AnchorValue.BOTTOM_LEFT,
            flow: FlowType.GRID,
            dir: FlowDir.HORIZONTAL,
            alignFlow: AlignValue.START,
            alignStack: AlignValue.STRETCH,
            size: new TwoAxisValue().setBlock(),
            gap: footerGap
        })
        this.container.addChild(footer);

        // icon again in bottom left
        const iconResource = CONFIG.resLoader.getResource(this.iconSpritesheet);
        const iconContainer = new ContainerImage({
            resource: iconResource,
            frame: this.getIconFrame(this.getMainIcon()),
            fill: this.getIconColor(this.getMainIcon()),
            borderRadius: this.iconBorderRadius,
            size: new TwoAxisValue().fromSingle(this.cornerIconSize),
            clipPath: this.getFunkyClipPath(new Point().setFactor(this.cornerIconSize)),
            effects: this.iconEffectsMain,
            shrink: 0 // to prevent changing its size because of full width text box
        })
        footer.addChild(iconContainer);

        // the text with the name of the creature
        const textBox = new ContainerText({
            size: new TwoAxisValue(new SizeValue(1.0, SizeType.PARENT), new SizeValue(1.0, SizeType.CONTENT)),
            fill: "#FFFFFF",
            borderRadius: this.iconBorderRadius,
            stroke: new StrokeValue(this.strokeWidth, this.strokeColor),
            textConfig: new TextConfig({
                font: "Comica Boom",
                size: 40,
                color: "#000000",
                alignVertical: TextAlign.MIDDLE,
            }),
            text: this.creatureName
        })
        footer.addChild(textBox);


        // @TODO: BUG => it only picks 3 types at most per card, though I said 4?
        // fineprint in the margin
        const fontSize = 11
        const fineprintText = new ContainerText({
            size: new TwoAxisValue().setBlock(),
            margin: new FourSideValue(0,0,-(fontSize+3),0),
            anchor: AnchorValue.BOTTOM_LEFT,
            textConfig: new TextConfig({
                font: "Cabin",
                style: TextStyle.ITALIC,
                alignHorizontal: TextAlign.END,
                size: fontSize,
                color: "rgba(0,0,0,0.85)" // @TODO: proper support for ColorValues in this whole system
            }),
            text: this.getFinePrintText()
        })
        this.container.addChild(fineprintText)

    }

    getFinePrintText() : string
    {
        const div = " · "
        const arr = [
            "🦄 Creature Quellector ©", 
            this.getMainIconElementType(), 
            this.getMainIcon().type, 
            this.creatureName
        ]
        return arr.join(div);
    }

    getCreatureName() : string
    {
        const genericNames = CONFIG.cards.genericNames;
        const typeNames = CATEGORIES[this.getMainIconElementType()].names;
        let specificNamesData = ELEMENTS[this.getMainIcon().type].names;
        let specificNames = specificNamesData[0];
        if(this.creatureSpritesheetNum < specificNamesData.length) {
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

    drawCustomPost()
    {
        // thick card outline
        const canv = this.getCanvas();
        const ctx = canv.getContext("2d");
        ctx.strokeStyle = CONFIG.cards.outline.color;
        ctx.lineWidth = CONFIG.cards.outline.width * this.sizeUnit;
        ctx.strokeRect(0, 0, canv.width, canv.height);
    }

    
    getClipPath(size:Point) : Point[]
    {
        var margin = this.cornerIconSize*1.1;
        var p = this.rootPadding;
        var points = [
            new Point().setXY(0, 0),
            new Point().setXY(size.x - 2*p - margin, 0),
            new Point().setXY(size.x - 2*p - margin, margin),
            new Point().setXY(size.x - 2*p, margin),
            new Point().setXY(size.x - 2*p, size.y),
            new Point().setXY(0, size.y)
        ]

        return points;
    }

    async getClipPathImageResource()
    {
        const canv : HTMLCanvasElement = document.createElement("canvas");
        canv.width = this.dims.x;
        canv.height = this.dims.y;

        const ctx = canv.getContext("2d");

        const path = this.clipPath.slice();
        path.push(this.clipPath[0]);

        ctx.beginPath();
        for(const point of path)
        {
            ctx.lineTo(point.x, point.y);
        }

        ctx.strokeStyle = this.strokeColor;
        ctx.lineWidth = this.strokeWidth;
        ctx.stroke();

        const res = new ResourceImage()
        await res.fromCanvas(canv);
        return res;
    }
}