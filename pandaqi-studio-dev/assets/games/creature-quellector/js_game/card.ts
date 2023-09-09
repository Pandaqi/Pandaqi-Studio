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

import { ELEMENTS, CREATURES, BACKGROUNDS } from "./dict"

import { TextConfig, TextAlign, TextStyle } from "js/pq_games/layout/text/textConfig"
import ContainerText from "js/pq_games/layout/containers/containerText"
import AlignValue from "js/pq_games/layout/values/alignValue"
import { FlowDir, FlowType } from "js/pq_games/layout/values/flowInput"

export default class Card 
{
    typeList : string[]
    ctx : CanvasRenderingContext2D
    dims : Point
    sizeUnit : number
    center : Point
    container : Container

    cornerIconSize:number
    creatureSpritesheet: string
    backgroundSpritesheet: string
    iconSpritesheet: string

    constructor(t:string[]) 
    {    
        this.typeList = t;
    }

    getCanvas() : HTMLCanvasElement { return this.ctx.canvas; }
    draw()
    {
        this.setup();
        this.drawBackground();
        this.drawHeader();
        this.drawBanner();
        this.drawContent();
        this.drawFooter();

        this.container.calculateDimensions();
        this.container.drawTo(this.getCanvas());
    }

    setup()
    {
        const dims = CONFIG.cards.size;
        this.ctx = createContext({ width: dims.x, height: dims.y, alpha: true, willReadFrequently: false });
        this.dims = new Point(dims);
        this.sizeUnit = Math.min(this.dims.x, this.dims.y);
        this.center = new Point().fromXY(0.5*dims.x, 0.5*dims.y);

        this.cornerIconSize = 0.15*this.sizeUnit;
        this.creatureSpritesheet = this.pickRandomSpritesheet("creatures");
        this.backgroundSpritesheet = this.pickRandomSpritesheet("backgrounds");
        this.iconSpritesheet = "icons";

        const params = { 
            size: new TwoAxisValue().fromPoint(this.dims),
            padding: new FourSideValue(0.05*this.sizeUnit),
            config: new ContainerConfig({ debugDimensions: true })
        };

        this.container = new Container(params);
        console.log(this.container);
    }

    getMainIcon() : string
    {
        return this.typeList[0]
    }

    getMainFrame() : number
    {
        return this.getIconFrame(this.getMainIcon());
    }

    getIconFrame(elem:string)
    {
        return ELEMENTS[elem].frame
    }

    getCardBackgroundFrame()
    {
        return this.getMainFrame();
    }

    pickRandomSpritesheet(base:string) : string
    {
        const randNum = 1 + Math.floor(Math.random()*3);
        return base + "_" + randNum;
    }

    drawBackground()
    {
        const ctx = this.ctx
        ctx.fillStyle = CONFIG.cards.backgroundColor;
        ctx.fillRect(0, 0, this.dims.x, this.dims.y);

        const size = this.sizeUnit * CONFIG.cards.backgroundScale;
        const alpha = CONFIG.cards.backgroundAlpha;

        const res = CONFIG.resLoader.getResource(this.creatureSpritesheet);
        const params = {
            resource: res,
            pos: new TwoAxisValue().fromPoint(this.center),
            size: new TwoAxisValue().fromSingle(size),
            pivot: new Point().setXY(0.5, 0.5),
            alpha: alpha,
            frame: this.getCardBackgroundFrame(),
            background: true
        }
        
        const cont = new ContainerImage(params);
        this.container.addChild(cont);
    }

    getClipPath(imageContainer:Container, iconContainer:Container) : Point[]
    {
        var margin = 0.05*this.sizeUnit
        var imageDims = imageContainer.boxOutput;
        var iconDims = iconContainer.boxOutput;
        var points = [
            new Point().setXY(0, 0),
            new Point().setXY(imageDims.size.x - iconDims.size.x - margin, 0),
            new Point().setXY(imageDims.size.x - iconDims.size.x - margin, iconDims.size.y + margin),
            new Point().setXY(imageDims.size.x, iconDims.size.y + margin),
            new Point().setXY(imageDims.size.x, imageDims.size.y),
            new Point().setXY(0, imageDims.size.y)
        ]
        return points;
    }

    drawHeader()
    {
        // actual image of creature
        const contSize = new TwoAxisValue().setBlock();
        contSize.y = new SizeValue(0.6*this.sizeUnit);

        const imageContainer = new Container({
            size: contSize
        });
        this.container.addChild(imageContainer);

        const bgResource = CONFIG.resLoader.getResource(this.backgroundSpritesheet);
        const bgContainer = new ContainerImage({ 
            resource: bgResource,
            frame: this.getMainFrame(),
            width: new SizeValue(1.0, SizeType.PARENT),
            anchor: AnchorValue.CENTER_CENTER,
            background: true
        });
        imageContainer.addChild(bgContainer);

        const creatureResource = CONFIG.resLoader.getResource(this.creatureSpritesheet);
        const creatureContainer = new ContainerImage({ 
            resource: creatureResource,
            frame: this.getMainFrame(),
            height: new SizeValue(0.75, SizeType.PARENT),
            anchor: AnchorValue.CENTER_CENTER,
            background: true
        });
        imageContainer.addChild(creatureContainer);

        // Icon top-right
        const iconResource = CONFIG.resLoader.getResource(this.iconSpritesheet);
        const iconContainer = new ContainerImage({
            resource: iconResource,
            frame: this.getIconFrame(this.getMainIcon()),
            size: new TwoAxisValue().fromSingle(this.cornerIconSize),
            anchor: AnchorValue.TOP_RIGHT
        })
        this.container.addChild(iconContainer);

        // Clip the creature image (first update dimensions so we can grab the right ones from containers)
        this.container.calculateDimensions();
        imageContainer.clipPath = this.getClipPath(imageContainer, iconContainer);
        imageContainer.boxInput.stroke = new StrokeValue(6, "#00FF00");

        console.log(imageContainer.clipPath);

        // Icon reminder list (of what's on the card, overlays image)
        const iconReminderSize = 0.5*this.cornerIconSize;
        const iconReminderPadding = 0.3*iconReminderSize;
        const iconReminderGap = 0.5*iconReminderPadding;
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
                resource: iconResource,
                frame: this.getIconFrame(type),
                size: new TwoAxisValue().fromSingle(iconReminderSize)
            })
            iconReminders.addChild(cont);
        }
    }

    getElementOnCycle(change:number = 1)
    {
        const list = CONFIG.gameplay.elementCycleSubtype
        let idx = list.indexOf(this.getMainIcon())
        idx = (idx + change + list.length) % list.length
        return list[idx]
    }

    drawBanner()
    {
        const bannerY = 0.5*this.sizeUnit;
        const bannerHeight = 0.2*this.sizeUnit;
        const bannerContainer = new Container({
            pos: new TwoAxisValue(0, bannerY),
            size: new TwoAxisValue(new SizeValue(1.0, SizeType.PARENT), bannerHeight),
            flow: FlowType.GRID,
            dir: FlowDir.HORIZONTAL,
            alignFlow: AlignValue.SPACE_BETWEEN,
            alignStack: AlignValue.MIDDLE
        })
        this.container.addChild(bannerContainer);

        /*
        const bannerResource = CONFIG.resLoader.getResource("cardBanner"); // @TODO: add
        const bannerBG = new ContainerImage({
            resource: bannerResource,
            size: new TwoAxisValue(new SizeValue(1.0, SizeType.PARENT), bannerHeight),
            background: true
        })
        bannerContainer.addChild(bannerBG);
        */

        const iconResource = CONFIG.resLoader.getResource(this.iconSpritesheet);
        const counterSize = this.cornerIconSize;
        const mainIconSize = 3.0*counterSize;
        const counteredBy = new ContainerImage({
            resource: iconResource,
            frame: this.getIconFrame(this.getElementOnCycle(-1)),
            size: new TwoAxisValue().fromSingle(counterSize)
        })

        const mainIcon = new ContainerImage({
            resource: iconResource,
            frame: this.getIconFrame(this.getMainIcon()),
            size: new TwoAxisValue().fromSingle(mainIconSize)
        })

        const weCounter = new ContainerImage({
            resource: iconResource,
            frame: this.getIconFrame(this.getElementOnCycle(1)),
            size: new TwoAxisValue().fromSingle(counterSize)
        })

        bannerContainer.addChild(counteredBy);
        bannerContainer.addChild(mainIcon);
        bannerContainer.addChild(weCounter);

    }

    drawContent()
    {
        // The main body of the card: the icons of this creature
        const padding = 0.05*this.sizeUnit
        const yPos = 0.9*this.sizeUnit;
        const gap = padding;
        const pos = new TwoAxisValue(0, yPos);
        console.log(pos);
        const icons = new Container({
            padding: padding,
            size: new TwoAxisValue().setBlock(),
            pos: pos,
            dir: FlowDir.HORIZONTAL,
            alignFlow: AlignValue.MIDDLE,
            gap: gap,
            flow: FlowType.GRID
        })
        this.container.addChild(icons);

        const iconResource = CONFIG.resLoader.getResource(this.iconSpritesheet);
        const iconSize = 0.2*this.sizeUnit;
        for(const type of this.typeList)
        {
            const cont = new ContainerImage({
                resource: iconResource,
                frame: this.getIconFrame(type),
                size: new TwoAxisValue().fromSingle(iconSize)
            })
            icons.addChild(cont);
        }
    }

    drawFooter()
    {
        const footerGap = 0.4*this.cornerIconSize;
        const footer = new Container({
            anchor: AnchorValue.BOTTOM_LEFT,
            flow: FlowType.GRID, // @TODO: without this, it displays wrong, but it shouldn't?
            dir: FlowDir.HORIZONTAL,
            size: new TwoAxisValue().setBlock(),
            gap: footerGap
        })
        this.container.addChild(footer);

        // icon again in bottom left
        const iconResource = CONFIG.resLoader.getResource(this.iconSpritesheet);
        const iconContainer = new ContainerImage({
            resource: iconResource,
            frame: this.getIconFrame(this.getMainIcon()),
            size: new TwoAxisValue().fromSingle(this.cornerIconSize),
        })
        footer.addChild(iconContainer);

        // the text with the name of the creature
        const textBox = new ContainerText({
            size: new TwoAxisValue().setFullSize(),
            fill: "#FFFFFF",
            stroke: new StrokeValue(5, "#FF0000"),
            textConfig: new TextConfig({
                font: "Comica Boom",
                size: 40,
                color: "#000000",
                alignVertical: TextAlign.MIDDLE,
            }),
            text: this.getCreatureName()
        })
        footer.addChild(textBox);


        // @TODO: BUG => it only picks 3 types at most per card, though I said 4?
        // fineprint in the margin
        const fineprintText = new ContainerText({
            size: new TwoAxisValue().setBlock(),
            margin: new FourSideValue(0,0,-10,0),
            anchor: AnchorValue.BOTTOM_LEFT,
            textConfig: new TextConfig({
                font: "Cabin",
                style: TextStyle.ITALIC,
                alignHorizontal: TextAlign.START,
                size: 14,
                color: "rgba(0,0,0,0.85)" // @TODO: proper support for ColorValues in this whole system
            }),
            text: this.getFinePrintText()
        })
        this.container.addChild(fineprintText)

    }

    getFinePrintText() : string
    {
        const div = " · "
        const arr = ["Creature Quellector", this.getMainIcon(), this.getTagLine()]
        return arr.join(div);
    }

    getTagLine() : string
    {
        return "@TODO"
    }

    getCreatureName() : string
    {
        return "@TODO"
    }
}