import Point from "js/pq_games/tools/geometry/point"
import CONFIG from "./config"
import Canvas from "js/pq_games/canvas/main"
import CanvasOperation from "js/pq_games/canvas/canvasOperation"

import Container from "js/pq_games/layout/container"
import ContainerImage from "js/pq_games/layout/containerImage"
import ContainerAnchor from "js/pq_games/layout/containerAnchor"

import StrokeValue from "js/pq_games/layout/values/strokeValue"
import FourSideValue from "js/pq_games/layout/values/fourSideValue"
import ContainerConfig from "js/pq_games/layout/containerConfig"

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
        this.drawBackground();

        this.drawHeader();
        this.drawBanner();
        this.drawContent();
        this.drawFooter();

        this.container.drawTo(this.getCanvas());
    }

    setup()
    {
        const dims = CONFIG.cards.size;
        this.ctx = Canvas.createNewContext({ width: dims.x, height: dims.y, alpha: true, willReadFrequently: false });
        this.dims = new Point(dims);
        this.sizeUnit = Math.min(this.dims.x, this.dims.y);
        this.center = new Point().fromXY(0.5*dims.x, 0.5*dims.y);

        const params = { 
            widthFixed: this.dims.x, 
            heightFixed: this.dims.y, 
            padding: new FourSideValue(0.05*this.sizeUnit),
            config: new ContainerConfig()
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
            pos: this.center.clone(),
            size: new Point().setXY(size, size),
            alpha: alpha,
            frame: this.getCreatureFrame()
        }
        
        const cont = new ContainerImage(params);
        this.container.addChild(cont);
    }

    getClipPath(imageContainer:Container, iconContainer:Container) : Point[]
    {
        var margin = 0.05*this.sizeUnit
        var imageDims = imageContainer.dimensions;
        var iconDims = iconContainer.dimensions;
        var points = [
            new Point().setXY(0, 0),
            new Point().setXY(imageDims.width - iconDims.width - margin, 0),
            new Point().setXY(imageDims.width - iconDims.width - margin, iconDims.height + margin),
            new Point().setXY(imageDims.width, iconDims.height + margin),
            new Point().setXY(imageDims.width, imageDims.height),
            new Point().setXY(0, imageDims.height)
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
            widthDynamic: 1.0
        });
        imageContainer.addChild(bgContainer);

        const creatureResource = CONFIG.resLoader.getResource("creatures");
        const creatureContainer = new ContainerImage({ 
            resource: creatureResource,
            frame: this.getCreatureFrame(),
            widthDynamic: 1.0
        });
        imageContainer.addChild(creatureContainer);

        // Icon top-right
        const iconResource = CONFIG.resLoader.getResource("icons");
        const size = 0.15*this.sizeUnit;
        const iconContainer = new ContainerImage({
            resource: iconResource,
            frame: this.getIconFrame(this.getMainIcon()),
            widthFixed: size,
            heightFixed: size,
            anchor: ContainerAnchor.TOP_RIGHT
        })
        this.container.addChild(iconContainer);

        // Debugging icon in random anchor place
        const iconDebug = new ContainerImage({
            resource: iconResource,
            frame: this.getIconFrame(this.getMainIcon()),
            widthFixed: size,
            heightFixed: size,
            anchor: ContainerAnchor.BOTTOM_CENTER
        })
        imageContainer.addChild(iconDebug);

        // Clip the creature image
        // (By now, we know the dimensions of the cut-out, so we can use that)
        imageContainer.clipPath = this.getClipPath(imageContainer, iconContainer);
        imageContainer.stroke = new StrokeValue(20, "00FF00");

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