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

import { TextConfig, TextAlign } from "js/pq_games/layout/text/textConfig"
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

    constructor(t:string[]) 
    {    
        this.typeList = t;
    }

    getCanvas() : HTMLCanvasElement { return this.ctx.canvas; }
    draw()
    {
        this.setup();

        this.testLayoutSystem();

        /*
        this.drawBackground();
        this.drawHeader();
        this.drawBanner();
        this.drawContent();
        this.drawFooter();
        */

        this.container.calculateDimensions();
        this.container.drawTo(this.getCanvas());
    }

    testLayoutSystem()
    {
        const subContainer = new Container({
            size: new TwoAxisValue(new SizeValue(1.0, SizeType.PARENT), 300.0)
        })
        this.container.addChild(subContainer);

        const iconResource = CONFIG.resLoader.getResource("icons");
        const size = 0.15*this.sizeUnit;
        const iconContainer = new ContainerImage({
            resource: iconResource,
            frame: this.getIconFrame(this.getMainIcon()),
            size: new TwoAxisValue().fromSingle(size),
            padding: 10,
            anchor: AnchorValue.CENTER_RIGHT
        })
        subContainer.addChild(iconContainer);

        const txt = new ContainerText({
            resource: iconResource,
            text: "Test, test, test",
            padding: 10,
            textConfig: new TextConfig({
                font: "Comica Boom",
                size: 36,
                alignVertical: TextAlign.MIDDLE
            }),
            size: new TwoAxisValue(200, new SizeValue(0.5, SizeType.PARENT)),
            anchor: AnchorValue.CENTER_CENTER
        })
        subContainer.addChild(txt);


        // FLEX/FLOW CONTAINERS!
        const padding = 0.05*this.sizeUnit
        const icons = new Container({
            padding: padding,
            size: new TwoAxisValue().setBlock(),
            dir: FlowDir.HORIZONTAL,
            alignFlow: AlignValue.MIDDLE, 
            alignStack: AlignValue.MIDDLE,
            gap: 15,
            flow: FlowType.GRID
        })
        this.container.addChild(icons);

        let iconSize = 0.2*this.sizeUnit;
        for(const type of this.typeList)
        {
            const cont = new ContainerImage({
                resource: iconResource,
                frame: this.getIconFrame(type),
                size: new TwoAxisValue().fromSingle(iconSize)
            })
            icons.addChild(cont);
            iconSize *= 0.5;

        }
    }

    setup()
    {
        const dims = CONFIG.cards.size;
        this.ctx = createContext({ width: dims.x, height: dims.y, alpha: true, willReadFrequently: false });
        this.dims = new Point(dims);
        this.sizeUnit = Math.min(this.dims.x, this.dims.y);
        this.center = new Point().fromXY(0.5*dims.x, 0.5*dims.y);

        this.cornerIconSize = 0.15*this.sizeUnit;

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

    getIconFrame(elem:string)
    {
        return ELEMENTS[elem].frame
    }

    getBackgroundFrame()
    {
        return 0; // @DEBUGGING
        return BACKGROUNDS[this.typeList[1]].frame
    }

    getCreatureFrame()
    {
        return 0; // @DEBUGGING
        return CREATURES[this.getMainIcon()].frame
    }

    drawBackground()
    {
        const ctx = this.ctx
        ctx.fillStyle = CONFIG.cards.backgroundColor;
        ctx.fillRect(0, 0, this.dims.x, this.dims.y);

        const size = this.sizeUnit * CONFIG.cards.backgroundScale;
        const alpha = CONFIG.cards.backgroundAlpha;

        const res = CONFIG.resLoader.getResource("creatures");
        const params = {
            resource: res,
            pos: new TwoAxisValue().fromPoint(this.center),
            size: new TwoAxisValue().fromSingle(size),
            pivot: new Point().setXY(0.5, 0.5),
            alpha: alpha,
            frame: this.getCreatureFrame(),
            background: true // @TODO: implement
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
        const imageContainer = new Container();
        this.container.addChild(imageContainer);

        const bgResource = CONFIG.resLoader.getResource("backgrounds");
        const bgContainer = new ContainerImage({ 
            resource: bgResource,
            frame: this.getBackgroundFrame(),
            width: new SizeValue(1.0, SizeType.PARENT)
        });
        imageContainer.addChild(bgContainer);

        const creatureResource = CONFIG.resLoader.getResource("creatures");
        const creatureContainer = new ContainerImage({ 
            resource: creatureResource,
            frame: this.getCreatureFrame(),
            width: new SizeValue(1.0, SizeType.PARENT)
        });
        imageContainer.addChild(creatureContainer);

        // Icon top-right
        const iconResource = CONFIG.resLoader.getResource("icons");
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
        imageContainer.boxInput.stroke = new StrokeValue(20, "00FF00");

        console.log(imageContainer.clipPath);

        // Icon reminder list (of what's on the card, overlays image)
        const iconReminderSize = 0.5*this.cornerIconSize;
        const iconReminderPadding = 0.2*iconReminderSize;
        const iconReminders = new Container({
            anchor: AnchorValue.BOTTOM_LEFT,
            padding: iconReminderPadding,
            size: new TwoAxisValue().setFreeGrow(),
            dir: FlowDir.VERTICAL,
            flow: FlowType.GRID
        })
        this.container.addChild(iconReminders);

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
        const bannerY = 0.33*this.sizeUnit;
        const bannerHeight = 0.2*this.sizeUnit;
        const bannerContainer = new Container({
            pos: new TwoAxisValue(0, bannerY),
            size: new TwoAxisValue(new SizeValue(1.0, SizeType.PARENT), bannerHeight),
            dir: FlowDir.HORIZONTAL,
        })
        this.container.addChild(bannerContainer);

        const bannerResource = CONFIG.resLoader.getResource("cardBanner"); // @TODO: add
        const bannerBG = new ContainerImage({
            resource: bannerResource,
            size: new TwoAxisValue(new SizeValue(1.0, SizeType.PARENT), bannerHeight),
            background: true
        })
        bannerContainer.addChild(bannerBG);

        const iconResource = CONFIG.resLoader.getResource("icons");
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
        const icons = new Container({
            padding: padding,
            size: new TwoAxisValue().setBlock(),
            dir: FlowDir.HORIZONTAL,
            alignFlow: AlignValue.MIDDLE, // @TODO
            flow: FlowType.GRID
        })
        this.container.addChild(icons);

        const iconResource = CONFIG.resLoader.getResource("icons");
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
        const footer = new Container({
            anchor: AnchorValue.BOTTOM_LEFT,
            dir: FlowDir.HORIZONTAL,
            size: new TwoAxisValue().setBlock()
        })
        this.container.addChild(footer);

        // icon again in bottom left
        const iconResource = CONFIG.resLoader.getResource("icons");
        const iconContainer = new ContainerImage({
            resource: iconResource,
            frame: this.getIconFrame(this.getMainIcon()),
            size: new TwoAxisValue().fromSingle(this.cornerIconSize),
            anchor: AnchorValue.BOTTOM_LEFT
        })
        footer.addChild(iconContainer);

        // the text with the name of the creature
        const textBox = new Container({
            size: new TwoAxisValue().setBlock(),
            fill: "#FFFFFF",
            stroke: new StrokeValue(5, "#FF0000")
        })
        footer.addChild(textBox);

        const creatureName = new ContainerText({
            size: new TwoAxisValue().setBlock(),
            font: new TextConfig(),
            text: this.getCreatureName()
        })
        textBox.addChild(creatureName);


        // fineprint in the margin
        const fineprint = new Container({
            anchor: AnchorValue.BOTTOM_CENTER
        })
        this.container.addChild(fineprint);

        const fineprintText = new ContainerText({
            size: new TwoAxisValue().setBlock(),
            margin: new FourSideValue(0,0,-20,0),
            font: new TextConfig(),
            text: this.getFinePrintText()
        })
        fineprint.addChild(fineprintText)


    }

    getFinePrintText() : string
    {
        const div = " · "
        const arr = ["Creature Quellector", this.getMainIcon(), this.getTagLine()]
        return arr.join(div);
    }

    getTagLine() : string
    {
        return "@TODO: Generate?"
    }

    getCreatureName() : string
    {
        return "@TODO: Generate? Fixed list of options?"
    }
}