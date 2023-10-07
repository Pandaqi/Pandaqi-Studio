import Point from "js/pq_games/tools/geometry/point"
import CONFIG from "./config"
import createContext from "js/pq_games/layout/canvas/createContext"

import LayoutNode from "js/pq_games/layout/layoutNode"
import AnchorValue from "js/pq_games/layout/values/anchorValue"

import TwoAxisValue from "js/pq_games/layout/values/twoAxisValue"
import { SizeValue, SizeType } from "js/pq_games/layout/values/sizeValue"
import StrokeValue from "js/pq_games/layout/values/strokeValue"
import FourSideValue from "js/pq_games/layout/values/fourSideValue"

import { ELEMENTS, CATEGORIES } from "../js_shared/dict"

import { TextConfig, TextAlign, TextStyle } from "js/pq_games/layout/text/textConfig"
import AlignValue from "js/pq_games/layout/values/alignValue"
import { FlowDir, FlowType } from "js/pq_games/layout/values/aggregators/flowInput"
import ElementIcon from "./elementIcon"
import takeBitesOutOfPath from "js/pq_games/tools/geometry/paths/takeBitesOutOfPath"
import DropShadowEffect from "js/pq_games/layout/effects/dropShadowEffect"
import CanvasEffect from "js/pq_games/layout/effects/layoutEffect"
import CanvasOperation from "js/pq_games/layout/layoutOperation"
import ResourceImage from "js/pq_games/layout/resources/resourceImage"
import rangeInteger from "js/pq_games/tools/random/rangeInteger"
import fromArray from "js/pq_games/tools/random/fromArray"
import PlacementValue from "js/pq_games/layout/values/placementValue"
import ResourceText from "js/pq_games/layout/resources/resourceText"
import ResourceShape from "js/pq_games/layout/resources/resourceShape"
import Path from "js/pq_games/tools/geometry/paths/path"
import GrayScaleEffect from "js/pq_games/layout/effects/grayScaleEffect"
import ResourceGradient, { GradientType } from "js/pq_games/layout/resources/resourceGradient"
import ColorStop from "js/pq_games/layout/color/colorStop"
import Color from "js/pq_games/layout/color/color"

export default class Card 
{
    typeList : ElementIcon[]
    mainType: ElementIcon

    ctx : CanvasRenderingContext2D
    dims : Point
    sizeUnit : number
    center : Point
    mainNode : LayoutNode

    cornerIconSize:number
    creatureSpritesheet: string
    backgroundSpritesheet: string
    iconSpritesheet: string

    imageLayoutNode: LayoutNode
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
    }

    getCanvas() : HTMLCanvasElement { return this.ctx.canvas; }
    async draw()
    {
        this.setup();
        await this.drawBackground();
        await this.drawHeader();
        this.drawBanner();
        this.drawContent();
        this.drawFooter();

        await this.mainNode.toCanvas(this.getCanvas());
        this.drawCustomPost();
        
        return this.getCanvas();
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
        };

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

        this.mainNode = new LayoutNode(params);
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
    async drawBackground()
    {

        const ctx = this.ctx
        let color = CONFIG.cards.backgroundColors[this.getMainIconElementType()];
        if(CONFIG.inkFriendly) { color = "#FFFFFF"; }

        ctx.fillStyle = color;
        ctx.fillRect(0, 0, this.dims.x, this.dims.y);

        if(CONFIG.inkFriendly) { return; }

        const size = this.sizeUnit * CONFIG.cards.backgroundScale;
        const sizePoint = new Point(size, size);
        const alpha = CONFIG.cards.backgroundAlpha;

        const res = CONFIG.resLoader.getResource(this.creatureSpritesheet) as ResourceImage;
        const canvOp = new CanvasOperation({
            dims: sizePoint,
            pivot: new Point().setXY(0.5, 0.5),
            translate: new Point(0.5 * this.dims.x, 0.5*this.dims.y),
            alpha: alpha,
            flipX: this.creatureFlipX,
            frame: this.getCardBackgroundFrame()
        })
        await res.toCanvas(this.getCanvas(), canvOp);
    }

    async drawHeader()
    {
        // actual image of creature
        const contSize = new TwoAxisValue().setBlock();
        const contHeight = 0.6*this.sizeUnit;
        contSize.y = new SizeValue(contHeight);

        const clipPath = this.getClipPath(new Point(this.dims.x, contHeight));
        const imageLayoutNode = new LayoutNode({
            size: contSize,
            clip: clipPath
        });
        this.imageLayoutNode = imageLayoutNode;
        this.mainNode.addChild(imageLayoutNode);

        const effects = [];
        if(CONFIG.inkFriendly)
        {
            effects.push(new GrayScaleEffect())
        }

        // background environment image
        const backgroundImageSize = new Point(contHeight, contHeight).scaleFactor(1.7);
        const bgResource = CONFIG.resLoader.getResource(this.backgroundSpritesheet);
        const bgLayoutNode = new LayoutNode({ 
            resource: bgResource,
            frame: this.getBackgroundFrame(),
            size: backgroundImageSize,
            anchor: AnchorValue.BOTTOM_CENTER,
            ghost: true,
            effects: effects,
            flipX: Math.random() <= 0.5
        });
        imageLayoutNode.addChild(bgLayoutNode);

        // a little gradient to help focus the image and make the creature fit better
        const gradientResource = new ResourceGradient({ type: GradientType.RADIAL, start: backgroundImageSize.clone().scaleFactor(0.5) });
        const gradientAlpha = 0.3;
        gradientResource.addStop(new ColorStop({ pos: 0, color: new Color(0,0,0,0) }));
        gradientResource.addStop(new ColorStop({ pos: 1, color: new Color(0,0,0,gradientAlpha)}));

        const gradientLayoutNode = new LayoutNode({
            resource: gradientResource,
            size: backgroundImageSize,
            anchor: AnchorValue.CENTER_CENTER,
            ghost: true
        })
        imageLayoutNode.addChild(gradientLayoutNode);

        // actual creature (smaller)
        const creatureImageSize = new Point(contHeight, contHeight).scaleFactor(0.8);
        const creatureResource = CONFIG.resLoader.getResource(this.creatureSpritesheet);
        const creatureLayoutNode = new LayoutNode({ 
            resource: creatureResource,
            frame: this.getMainFrame(),
            size: creatureImageSize,
            anchor: AnchorValue.CENTER_CENTER,
            ghost: true,
            effects: effects,
            flipX: this.creatureFlipX
        });
        imageLayoutNode.addChild(creatureLayoutNode);

        // Icon top-right
        const iconEffects = this.iconEffectsMain;

        const iconResource = CONFIG.resLoader.getResource(this.iconSpritesheet);
        const iconLayoutNode = new LayoutNode({
            resource: iconResource,
            frame: this.getIconFrame(this.getMainIcon()),
            size: new TwoAxisValue().fromSingle(this.cornerIconSize),
            borderRadius: this.iconBorderRadius,
            effects: iconEffects,
            anchor: AnchorValue.TOP_RIGHT
        })
        this.mainNode.addChild(iconLayoutNode);

        // Icon reminder list (of what's on the card, overlays image)
        const iconReminderSize = 0.725*this.cornerIconSize;
        const iconReminderPadding = 0.25*iconReminderSize;
        const iconReminderGap = 0.5*iconReminderPadding;
        const iconReminderRadius = new FourSideValue(0.5*this.iconBorderRadius.top.get());
        const listSize = new TwoAxisValue().setFreeGrow();
        const iconReminders = new LayoutNode({
            anchor: AnchorValue.BOTTOM_RIGHT,
            padding: iconReminderPadding,
            size: listSize,
            dir: FlowDir.VERTICAL,
            gap: iconReminderGap,
            flow: FlowType.GRID
        })
        imageLayoutNode.addChild(iconReminders);

        for(const type of this.typeList)
        {
            const cont = new LayoutNode({
                resource: this.getIconResource(type),
                frame: this.getIconFrame(type),
                size: new TwoAxisValue().fromSingle(iconReminderSize),
                stroke: new StrokeValue(0.5*this.strokeWidth, this.getIconColorDark(type)),
                borderRadius: iconReminderRadius,
            })
            iconReminders.addChild(cont);
        }

        // @TODO: add rootPadding to clipPath coordinates
  
        // we draw our clip path as an IMAGE, so it fits right into this pipeline at the right moment
        const clipPathForStroke = this.getClipPath(new Point(this.dims.x, contHeight), new Point(this.rootPadding));
        const clipPathResource = new ResourceShape({ shape: clipPathForStroke });
        const clipPathVisible = new LayoutNode({
            resource: clipPathResource,
            dims: new Point(this.dims.x, contHeight+3*this.rootPadding),
            size: new TwoAxisValue().setAuto(),
            placement: PlacementValue.ABSOLUTE,
            pos: new Point(0.5),
            stroke: new StrokeValue(this.strokeWidth, this.strokeColor),
        })
        this.mainNode.addChild(clipPathVisible);
    }

    getElementOnCycle(change:number = 1) : ElementIcon
    {
        const list = CONFIG.gameplay.elementCycleSubtype
        let idx = list.indexOf(this.getMainIcon().type);
        idx = (idx + change + list.length) % list.length
        return new ElementIcon(list[idx], false);
    }

    drawBanner()
    {
        const bannerHeight = 0.2*this.sizeUnit;
        const bannerLayoutNode = new LayoutNode({
            size: new TwoAxisValue(new SizeValue(1.0, SizeType.PARENT), bannerHeight),
            flow: FlowType.GRID,
            dir: FlowDir.HORIZONTAL,
            alignFlow: AlignValue.MIDDLE,
            alignStack: AlignValue.MIDDLE
        })
        this.mainNode.addChild(bannerLayoutNode);

        const iconResource = CONFIG.resLoader.getResource(this.iconSpritesheet);
        const counterSize = this.cornerIconSize;
        const mainIconSize = 3.0*counterSize;

        const useCounterRules = CONFIG.enableOldCounterRules;

        const mainIconEffects = [
            new DropShadowEffect({ 
                offset: this.dropShadowOffset.clone().scaleFactor(2.5),
                color: this.getIconColorDark(this.getMainIcon()),
            })
        ]

        const mainIcon = new LayoutNode({
            resource: iconResource,
            frame: this.getIconFrame(this.getMainIcon()),
            borderRadius: this.iconBorderRadius,
            size: new TwoAxisValue().fromSingle(mainIconSize),
            effects: mainIconEffects,
            shrink: 0
        })

        let counteredBy, counterIcon, weCounter;
        if(useCounterRules)
        {
            const iconEffects1 = [
                new DropShadowEffect({ 
                    offset: this.dropShadowOffset,
                    color: this.getIconColorDark(this.getElementOnCycle(-1)),
                })
            ];
    
            counteredBy = new LayoutNode({
                resource: iconResource,
                frame: this.getIconFrame(this.getElementOnCycle(-1)),
                size: new TwoAxisValue().fromSingle(counterSize),
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
            counterIcon = new LayoutNode(counterParams);
    
    
            const iconEffects2 = [
                new DropShadowEffect({ 
                    offset: this.dropShadowOffset,
                    color: this.getIconColorDark(this.getElementOnCycle(+1)),
                })
            ];
            weCounter = new LayoutNode({
                resource: iconResource,
                frame: this.getIconFrame(this.getElementOnCycle(+1)),
                borderRadius: this.iconBorderRadius,
                size: new TwoAxisValue().fromSingle(counterSize),
                effects: iconEffects2,
                shrink: 0
            })
        }

        if(useCounterRules)
        {
            bannerLayoutNode.addChild(counteredBy);
            bannerLayoutNode.addChild(counterIcon);
        }

        bannerLayoutNode.addChild(mainIcon);

        if(useCounterRules)
        {
            bannerLayoutNode.addChild(counterIcon.clone());
            bannerLayoutNode.addChild(weCounter);
        }

    }

    drawContent()
    {
        // The main body of the card: the icons of this creature
        const padding = 0.05*this.sizeUnit
        const gap = padding;
        const offsetTop = 0.165*this.sizeUnit;
        const icons = new LayoutNode({
            padding: padding,
            size: new TwoAxisValue().setBlock(),
            margin: new FourSideValue(offsetTop,0,0,0),
            dir: FlowDir.HORIZONTAL,
            alignFlow: AlignValue.MIDDLE,
            gap: gap,
            flow: FlowType.GRID
        })
        this.mainNode.addChild(icons);

        const iconSize = 0.1725*this.sizeUnit;
        for(const type of this.typeList)
        {
            const iconEffects = [
                new DropShadowEffect({ 
                    offset: this.dropShadowOffset,
                    color: this.getIconColorDark(type),
                })
            ];

            const cont = new LayoutNode({
                resource: this.getIconResource(type),
                frame: this.getIconFrame(type),
                borderRadius: this.iconBorderRadius,
                size: new TwoAxisValue().fromSingle(iconSize),
                effects: iconEffects,
                shrink: 0,
            })
            icons.addChild(cont);
        }
    }

    drawFooter()
    {
        const footerGap = 0.175*this.cornerIconSize;
        const footer = new LayoutNode({
            anchor: AnchorValue.BOTTOM_LEFT,
            flow: FlowType.GRID,
            dir: FlowDir.HORIZONTAL,
            alignFlow: AlignValue.START,
            alignStack: AlignValue.STRETCH,
            size: new TwoAxisValue().setBlock(),
            gap: footerGap,
        })
        this.mainNode.addChild(footer);

        // icon again in bottom left
        const iconResource = CONFIG.resLoader.getResource(this.iconSpritesheet);
        const iconLayoutNode = new LayoutNode({
            resource: iconResource,
            frame: this.getIconFrame(this.getMainIcon()),
            borderRadius: this.iconBorderRadius,
            size: new TwoAxisValue().fromSingle(this.cornerIconSize),
            effects: this.iconEffectsMain,
            shrink: 0 // to prevent changing its size because of full width text box
        })
        footer.addChild(iconLayoutNode);

        const textContainer = new LayoutNode({
            size: new TwoAxisValue().setFullSize(),
            fill: "#FFFFFF",
            borderRadius: this.iconBorderRadius,
            stroke: new StrokeValue(this.strokeWidth, this.strokeColor),
            padding: new FourSideValue(0,0,0,10)
        })

        footer.addChild(textContainer);

        // the text with the name of the creature
        const txtCfg = new TextConfig({
            font: "Comica Boom",
            size: 40,
            alignVertical: TextAlign.MIDDLE,
        })
        const textRes = new ResourceText({ text: this.creatureName, textConfig: txtCfg })
        const textBox = new LayoutNode({
            resource: textRes,
            size: new TwoAxisValue().setFullSize(),
            fill: Color.BLACK
        })
        textContainer.addChild(textBox);
        
        // fineprint in the margin
        const fontSize = 11
        const txtCfgSmall = new TextConfig({
            font: "Cabin",
            style: TextStyle.ITALIC,
            alignHorizontal: TextAlign.END,
            size: fontSize,
        })
        const textResSmall = new ResourceText({ text: this.getFinePrintText(), textConfig: txtCfgSmall });
        const fineprintText = new LayoutNode({
            resource: textResSmall,
            size: new TwoAxisValue().setBlock(),
            margin: new FourSideValue(0,0,-(fontSize+3),0),
            anchor: AnchorValue.BOTTOM_LEFT,
            text: this.getFinePrintText(),
            alpha: 0.66,
            fill: Color.BLACK
        })
        this.mainNode.addChild(fineprintText)

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
        const col = CONFIG.inkFriendly ? CONFIG.cards.outline.colorInkFriendly : CONFIG.cards.outline.color;
        ctx.strokeStyle = col;
        ctx.lineWidth = CONFIG.cards.outline.width * this.sizeUnit;
        ctx.strokeRect(0, 0, canv.width, canv.height);
    }

    
    getClipPath(size:Point, offset:Point = new Point()) : Path
    {
        var margin = this.cornerIconSize*1.25;
        var p = this.rootPadding;
        var points = [
            new Point().setXY(0, 0),
            new Point().setXY(size.x - 2*p - margin, 0),
            new Point().setXY(size.x - 2*p - margin, margin),
            new Point().setXY(size.x - 2*p, margin),
            new Point().setXY(size.x - 2*p, size.y),
            new Point().setXY(0, size.y)
        ]

        for(const point of points)
        {
            point.add(offset);
        }

        return new Path({ points: points, close: true });
    }
}