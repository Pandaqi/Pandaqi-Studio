import ContainerDimensions from "./containerDimensions"
import ContainerConfig from "./containerConfig"

import BoxInput from "../values/boxInput"
import BoxOutput from "../values/boxOutput"

import PropsInput from "../values/propsInput"
import PropsOutput from "../values/propsOutput"

import FlowInput from "../values/flowInput"
import FlowOutput from "../values/flowOutput"

import Point from "js/pq_games/tools/geometry/point"
import TwoAxisValue from "../values/twoAxisValue"



enum LayoutStage {
    FIXED, // calculates sizes fixed and depending on parent ( = known)
    CONTENT, // second pass needed to calculates size (of parent) depending on content
    FLOW, // third pass needed to properly distribute contents of flow boxes
    FLOW_UPDATE, // called for intermittent updates in flow children
}

export { Container, LayoutStage }
export default class Container
{
    DEFAULT_SIZE : Point = new Point().setXY(50,50);

    config: ContainerConfig

    propsInput : PropsInput
    propsOutput : PropsOutput

    boxInput : BoxInput
    boxOutput : BoxOutput

    flowInput : FlowInput
    flowOutput : FlowOutput
    
    clipPath: Point[]
    clipBox : boolean

    root : boolean
    parent : Container
    children: Container[]
    dimensionsContent : ContainerDimensions
    targetCanvas : HTMLCanvasElement

    constructor(params:any = {})
    {
        this.config = params.config;

        this.boxInput = new BoxInput(params);
        this.propsInput = new PropsInput(params);
        this.flowInput = new FlowInput(params);

        this.clipPath = params.clipPath ?? [];
        this.clipBox = params.clipBox ?? false;

        this.root = params.root ?? false;
        
        this.children = [];
        this.parent = params.parent;
    }

    attachToPhaser(scene:any)
    {
        const canvas = scene.sys.game.canvas;
        this.boxInput.size = new TwoAxisValue(canvas.width, canvas.height);
        this.boxInput.position = new TwoAxisValue(0,0);
        this.targetCanvas = canvas;
    }

    addChild(c:Container)
    {
        this.children.push(c);
        c.parent = this;
    }

    removeChild(c:Container)
    {
        const idx = this.children.indexOf(c);
        if(idx < 0 || idx >= this.children.length) { return; }
        c.parent = null;
        this.children.splice(idx, 1);
    }

    hasNoParent() : boolean
    {
        return !this.parent;
    }

    isLeafNode() : boolean
    {
        return this.children.length <= 0
    }

    dependsOnContent() : boolean
    {
        if(this.hasNoParent()) { return false; }
        return this.boxInput.dependsOnContent();
    }

    getParentBox() : BoxOutput
    {
        if(this.root || !this.parent) { return null; }
        return this.parent.boxOutput;
    }

    getRootParent() : Container
    {
        const c = new Container({ root: true, config: this.config });
        c.boxOutput = this.boxInput.calc(this);
        c.boxOutput.makeRoot();
        return c;
    }

    isFlowItem()
    {
        if(!this.parent) { return false; }
        return this.parent.isFlowContainer();
    }

    isFlowContainer()
    {
        return this.flowInput.isActive();
    }

    calculateDimensions()
    {
        if(this.root) { return; }
        if(this.hasNoParent()) { this.parent = this.getRootParent(); }

        this.dimensionsContent = null;
        this.boxOutput = this.calculateDimensionsSelf(LayoutStage.FIXED);
        if(this.isLeafNode()) { return; }

        this.dimensionsContent = this.calculateDimensionsContent(LayoutStage.FIXED);
        if(!this.dependsOnContent() && !this.isFlowContainer()) { return; }

        this.boxOutput = this.calculateDimensionsSelf(LayoutStage.CONTENT);
        this.dimensionsContent = this.calculateDimensionsContent(LayoutStage.CONTENT);
        if(!this.isFlowContainer()) { return; }

        this.boxOutput = this.calculateDimensionsSelf(LayoutStage.FLOW);
        this.dimensionsContent = this.calculateDimensionsContent(LayoutStage.FLOW);
    }

    // In post, it only updates width/height/x/y if it isn't fixed (it grows with content)
    calculateDimensionsSelf(layoutStage:LayoutStage) : BoxOutput
    {
        const flowOutput = this.flowInput.calc(this, this.dimensionsContent);
        this.flowOutput = flowOutput;

        const boxOutput = this.boxInput.calc(this);
        const propsOutput = this.propsInput.calc(boxOutput.size);
        this.propsOutput = propsOutput;

        return boxOutput;
    }

    calculateDimensionsContent(layoutStage:LayoutStage) : ContainerDimensions
    {
        const dimsContent = new ContainerDimensions();
        for(const child of this.children)
        {
            child.calculateDimensions();
            if(child.boxInput.background) { continue; }
            dimsContent.takeIntoAccount(child);
        }

        dimsContent.grow(this.boxOutput.padding);
        return dimsContent;
    }

    getConfig() : ContainerConfig
    {
        return this.getRootContainer().config;
    }

    getRootContainer() : Container
    {
        let curNode : Container = this;
        while(!curNode.hasNoParent())
        {
            curNode = curNode.parent;
        }
        return curNode;
    }

    drawTo(targetCanvas:HTMLCanvasElement = this.targetCanvas)
    {
        var canv = this.drawToPre();
        if(canv.width <= 0 || canv.height <= 0)
        {
            return console.error("Element with size 0", this);
        }

        this.drawToCustom(canv);
        this.drawToPost(targetCanvas, canv);
    }

    drawToPre() : HTMLCanvasElement
    {
        var canv = document.createElement("canvas");
        canv.width = this.boxOutput.size.x;
        canv.height = this.boxOutput.size.y;

        var ctx = canv.getContext("2d");

        if(this.getConfig().useFullSizeCanvas)
        {
            var root = this.getRootContainer();
            canv.width = root.boxOutput.size.x;
            canv.height = root.boxOutput.size.y;

            let pos = this.boxOutput.position;
            ctx.translate(pos.x, pos.y);
        }

        ctx.globalAlpha = this.propsOutput.alpha;

        if(this.propsOutput.fill != "transparent")
        {
            ctx.fillStyle = this.propsOutput.fill;
            ctx.fillRect(0, 0, this.boxOutput.size.x, this.boxOutput.size.y);
        }
        
        ctx.save();
        if(this.clipPath.length > 0 || this.clipBox)
        {
            ctx.clip(this.getClipPath());
        }
        return canv
    }

    drawToCustom(canv:HTMLCanvasElement)
    {
        for(const child of this.children)
        {
            child.drawTo(canv);
        }
    }

    drawToPost(targetCanvas:HTMLCanvasElement, canv:HTMLCanvasElement)
    {
        const ctx = canv.getContext("2d")
        ctx.restore();
        
        if(this.getConfig().debugDimensions)
        {
            // @DEBUGGING
            ctx.strokeStyle = "#FF0000";
            ctx.lineWidth = 5;
            ctx.strokeRect(0,0,this.boxOutput.size.x, this.boxOutput.size.y);
        }

        // @TODO: properly take different sides into account + align properly (inside, middle, outside)
        if(this.boxInput.stroke.isVisible())
        {
            ctx.strokeStyle = this.boxOutput.stroke.color;
            ctx.lineWidth = this.boxOutput.stroke.width.top; 
            ctx.stroke(this.getClipPath());
        }

        let pos = this.boxOutput.position;
        if(this.getConfig().useFullSizeCanvas) { pos = new Point(); }

        targetCanvas.getContext("2d").drawImage(canv, pos.x, pos.y);
    }

    getClipPath() : Path2D
    {
        if(this.clipPath.length > 0) { return this.convertToPath2D(this.clipPath); }
        return this.convertToPath2D(this.getDefaultClipPath());
    }

    convertToPath2D(pathInput:Point[]) : Path2D
    {
        var path = new Path2D();
        for(const point of pathInput)
        {
            path.lineTo(point.x, point.y);
        }
        path.lineTo(pathInput[0].x, pathInput[0].y);
        return path
    }

    getDefaultClipPath() : Point[]
    {
        const dims = this.boxOutput;
        return [
            new Point().setXY(0, 0),
            new Point().setXY(dims.size.x, 0),
            new Point().setXY(dims.size.x, dims.size.y),
            new Point().setXY(0, dims.size.y)
        ]
    }
}