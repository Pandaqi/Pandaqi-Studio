import Point from "js/pq_games/tools/geometry/point"
import CONFIG from "./config"
import createContext from "js/pq_games/canvas/createContext"

import Container from "js/pq_games/layout/containers/container"
import ContainerImage from "js/pq_games/layout/containers/containerImage"
import AnchorValue from "js/pq_games/layout/values/anchorValue"
import ContainerConfig from "js/pq_games/layout/containers/containerConfig"

import TwoAxisValue from "js/pq_games/layout/values/twoAxisValue"
import { SizeValue, SizeType } from "js/pq_games/layout/values/sizeValue"
import StrokeValue from "js/pq_games/layout/values/strokeValue"
import FourSideValue from "js/pq_games/layout/values/fourSideValue"

import { ELEMENTS, CREATURES, BACKGROUNDS } from "./dict"

export default class Card 
{

    typeList : string[]
    ctx : CanvasRenderingContext2D
    dims : Point
    sizeUnit : number
    center : Point
    container : Container

    constructor(t:string[]) 
    {    
        this.typeList = t;
        console.log(this.typeList);
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
            anchor: AnchorValue.CENTER_RIGHT
        })
        subContainer.addChild(iconContainer);

        const iconContainer2 = new ContainerImage({
            resource: iconResource,
            frame: this.getIconFrame(this.getMainIcon()),
            size: new TwoAxisValue().fromSingle(0.5*size),
            anchor: AnchorValue.BOTTOM_RIGHT
        })
        subContainer.addChild(iconContainer2);
    }

    setup()
    {
        const dims = CONFIG.cards.size;
        this.ctx = createContext({ width: dims.x, height: dims.y, alpha: true, willReadFrequently: false });
        this.dims = new Point(dims);
        this.sizeUnit = Math.min(this.dims.x, this.dims.y);
        this.center = new Point().fromXY(0.5*dims.x, 0.5*dims.y);

        const params = { 
            size: new TwoAxisValue().fromPoint(this.dims),
            padding: new FourSideValue(0.05*this.sizeUnit),
            config: new ContainerConfig({ debugDimensions: true })
        };

        console.log("PARAMS", params);

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

        // const size = this.sizeUnit * CONFIG.cards.backgroundScale;
        const size = this.sizeUnit;
        const alpha = CONFIG.cards.backgroundAlpha;

        const res = CONFIG.resLoader.getResource("creatures");
        const params = {
            resource: res,
            pos: new TwoAxisValue().fromPoint(this.center),
            size: new TwoAxisValue().fromSingle(size),
            pivot: new Point().setXY(0.5, 0.5),
            alpha: alpha,
            frame: this.getCreatureFrame()
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
        const size = 0.15*this.sizeUnit;
        const iconContainer = new ContainerImage({
            resource: iconResource,
            frame: this.getIconFrame(this.getMainIcon()),
            size: new TwoAxisValue().fromSingle(size),
            anchor: AnchorValue.TOP_RIGHT
        })
        // this.container.addChild(iconContainer);

        // Debugging icon in random anchor place
        const iconDebug = new ContainerImage({
            resource: iconResource,
            frame: this.getIconFrame(this.getMainIcon()),
            size: new TwoAxisValue().fromSingle(size),
            anchor: AnchorValue.BOTTOM_CENTER
        })
        // imageContainer.addChild(iconDebug);

        // Clip the creature image
        // (By now, we know the dimensions of the cut-out, so we can use that)
        imageContainer.clipPath = this.getClipPath(imageContainer, iconContainer);
        imageContainer.boxInput.stroke = new StrokeValue(20, "00FF00");

        console.log(imageContainer.clipPath);

        // Icon reminder list (of what's on the card, overlays image)
    }

    drawBanner()
    {

    }

    drawContent()
    {

    }

    drawFooter()
    {

    }
}