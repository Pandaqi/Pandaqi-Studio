// @ts-ignore
import modernScreenshot from "../renderEngines/modern-screenshot.min.js"

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
import AnchorValue from "../values/anchorValue.js"
import BackgroundOutput from "../values/backgroundOutput.js"
import BackgroundInput from "../values/backgroundInput.js"
import CanvasOperation from "js/pq_games/canvas/canvasOperation.js"



enum LayoutStage {
    FIXED, // calculates sizes fixed and depending on parent ( = known)
    CONTENT, // second pass needed to calculates size (of parent) depending on content
    FLOW, // third pass needed to properly distribute contents of flow boxes
    FLOW_UPDATE, // called for intermittent updates in flow children
}

export { Container, LayoutStage }
export default class Container
{
    config: ContainerConfig

    propsInput : PropsInput
    propsOutput : PropsOutput

    boxInput : BoxInput
    boxOutput : BoxOutput

    flowInput : FlowInput
    flowOutput : FlowOutput

    bgInput : BackgroundInput
    bgOutput : BackgroundOutput
    
    clipPath: Point[]
    clipBox : boolean

    operation : CanvasOperation

    element: string

    root : boolean
    parent : Container
    children: Container[]
    dimensionsContent : ContainerDimensions
    targetCanvas : HTMLCanvasElement

    // @TODO: Implement a clone() function
    //  -> Add clone() function to the big variables natively
    //  -> Just call that and set parameters properly
    //  -> Also iteratively call clone() on all children

    constructor(params:any = {})
    {
        this.config = params.config;
        
        this.operation = new CanvasOperation(params);

        this.boxInput = new BoxInput(params);
        this.propsInput = new PropsInput(params);
        this.flowInput = new FlowInput(params);
        this.bgInput = new BackgroundInput(params);

        this.clipPath = params.clipPath ?? [];
        this.clipBox = params.clipBox ?? false;

        this.root = params.root ?? false;

        this.element = params.element ?? "div";
        
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

    dependsOnContent() : boolean
    {
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

    isLeafNode() : boolean
    {
        return this.children.length <= 0
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
    calculateDimensionsSelf(layoutStage:LayoutStage = LayoutStage.FIXED) : BoxOutput
    {
        const flowOutput = this.flowInput.calc(this);
        this.flowOutput = flowOutput;

        const boxOutput = this.boxInput.calc(this);
        this.propsOutput = this.propsInput.calc(this);
        this.bgOutput = this.bgInput.calc(this);

        return boxOutput;
    }

    calculateDimensionsContent(layoutStage:LayoutStage = LayoutStage.FIXED) : ContainerDimensions
    {
        const dimsContent = new ContainerDimensions();
        for(const child of this.children)
        {
            child.calculateDimensions();
            if(child.boxInput.ghost) { continue; }
            dimsContent.takeIntoAccount(child);
        }

        dimsContent.grow(this.boxOutput.padding);
        return dimsContent;
    }

    getConfig() : ContainerConfig
    {
        return this.getRootContainer().config;
    }

    getGlobalPosition() : Point
    {
        let curNode : Container = this;
        let pos = this.boxOutput.getPosition();
        while(!curNode.hasNoParent())
        {
            curNode = curNode.parent;
            pos.add(curNode.boxOutput.getPosition());
        }
        return pos;
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

    async toCanvas(targetCanvas:HTMLCanvasElement)
    {
        if(this.config.renderEngine == "pandaqi") { 
            this.calculateDimensions();
            await this.drawTo(targetCanvas); 
        } else if(this.config.renderEngine = "html2canvas") { 
            await this.toCanvasFromHTML(targetCanvas); 
        }
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
        var root = this.getRootContainer();
        canv.width = root.boxOutput.size.x;
        canv.height = root.boxOutput.size.y;

        const ctx = canv.getContext("2d");

        ctx.globalAlpha = this.propsOutput.alpha;

        let pos = this.getGlobalPosition();        
        if(this.propsOutput.fill != "transparent")
        {
            ctx.fillStyle = this.propsOutput.fill;
            ctx.fillRect(pos.x, pos.y, this.boxOutput.size.x, this.boxOutput.size.y);
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
        
        const pos = this.getGlobalPosition();
        if(this.getConfig().debugDimensions)
        {
            ctx.strokeStyle = "#FF0000";
            ctx.lineWidth = 5;
            ctx.strokeRect(pos.x, pos.y, this.boxOutput.size.x, this.boxOutput.size.y);
        }

        // @TODO: properly take different sides into account + align properly (inside, middle, outside)
        if(this.boxInput.stroke.isVisible())
        {
            ctx.strokeStyle = this.boxOutput.stroke.color;
            ctx.lineWidth = this.boxOutput.stroke.width.top; 
            ctx.stroke(this.getClipPath());
        }

        // apply our canvas operation to the final canvas in its entirety
        this.operation.apply(canv);

        // then finally draw the results onto the bigger canvas that called us
        targetCanvas.getContext("2d").drawImage(canv, 0, 0);
    }

    getClipPath() : Path2D
    {
        if(this.clipPath.length > 0) { return this.convertToPath2D(this.clipPath); }
        return this.convertToPath2D(this.getDefaultClipPath());
    }

    convertToPath2D(pathInput:Point[]) : Path2D
    {
        const pos = this.getGlobalPosition();
        var path = new Path2D();
        for(const point of pathInput)
        {
            path.lineTo(pos.x + point.x, pos.y + point.y);
        }
        path.lineTo(pos.x + pathInput[0].x, pos.y + pathInput[0].y);
        return path
    }

    convertToCSSPath(pathInput:Point[]) : string
    {
        const parts = [];
        let counter = -1;

        for(const point of pathInput)
        {
            counter++;
            if(counter == 0)
            {
                parts.push("M " + point.x + "," + point.y);
                continue;
            }
            parts.push("L " + point.x + "," + point.y);
        }
        return "path('" + parts.join(" ") + "')";
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

    needsWrapperHTML() : boolean
    {
        return this.boxInput.anchor != AnchorValue.NONE;
    }

    createWrapperHTML() : HTMLDivElement
    {
        const wrapper = document.createElement("div");
        wrapper.style.width = "100%";
        wrapper.style.height = "100%";

        if(this.boxInput.ghost)
        {
            wrapper.style.width = "auto";
            wrapper.style.height = "auto";
        }

        wrapper.style.boxSizing = "border-box";
        return wrapper;
    }

    toHTML()
    {
        const div = document.createElement(this.element);
        div.style.boxSizing = "border-box";

        const wrapper = this.needsWrapperHTML() ? this.createWrapperHTML() : null;
        if(wrapper) { wrapper.appendChild(div); }

        const topElem = wrapper ? wrapper : div;

        // @NOTE: yes, apply to children BEFORE applying to ourselves
        for(const child of this.children)
        {
            div.appendChild(child.toHTML());
        }

        if(this.shouldHideOverflow()) { div.style.overflow = "hidden"; }

        // @NOTE: Wrappers are only used for anchoring or weird positioning, which means applying clipPath to them will usually not do what you want as it's applied to the wrong sized element
        if(this.clipPath.length > 0)
        {
            div.style.clipPath = this.convertToCSSPath(this.clipPath);
        }

        this.boxInput.applyToHTML(div, wrapper, this.parent);
        this.propsInput.applyToHTML(div);
        this.flowInput.applyToHTML(div);

        this.operation.applyToHTML(topElem);
        
        // custom hook for custom elements to do whatever they want
        this.toHTMLCustom(div, wrapper);

        if(wrapper) { return wrapper; }
        return div;
    }

    shouldHideOverflow()
    {
        return this.hasNoParent() || this.parent.root || this.clipBox || this.boxInput.ghost;
    }

    toHTMLCustom(div:HTMLElement, wrapper:HTMLDivElement = null) { }

    async toCanvasFromHTML(targetCanvas:HTMLCanvasElement)
    {
        const domTree = this.toHTML();
        const options = {
            width: this.boxInput.size.x.get(),
            height: this.boxInput.size.y.get()
        }

        const canv = await modernScreenshot.domToCanvas(domTree, options);

        document.body.appendChild(domTree);
        document.body.appendChild(canv);

        const ctx = targetCanvas.getContext("2d");
        ctx.drawImage(canv, 0, 0);
    }

}