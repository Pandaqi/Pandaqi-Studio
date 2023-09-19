import LayoutNodeConfig from "./layoutNodeConfig.js"

import BoxInput from "./values/aggregators/boxInput.js"
import BoxOutput from "./values/aggregators/boxOutput.js"

import PropsInput from "./values/aggregators/propsInput.js"
import PropsOutput from "./values/aggregators/propsOutput.js"

import FlowInput from "./values/aggregators/flowInput.js"
import FlowOutput from "./values/aggregators/flowOutput.js"

import BackgroundOutput from "./values/aggregators/backgroundOutput.js"
import BackgroundInput from "./values/aggregators/backgroundInput.js"

import Point from "js/pq_games/tools/geometry/point"
import TwoAxisValue from "./values/twoAxisValue.js"
import AnchorValue from "./values/anchorValue.js"
import LayoutOperation from "js/pq_games/layout/layoutOperation.js"
import HTMLFirstRenderer from "./renderer/htmlFirstRenderer.js"
import PandaqiRenderer from "./renderer/pandaqiRenderer.js"
import Resource from "./resources/resource.js"
import createCanvas from "./canvas/createCanvas.js"
import { CanvasLike } from "./resources/resourceImage.js"
import Dims from "../tools/geometry/dims.js"

export default class LayoutNode
{
    config: LayoutNodeConfig
    renderer: HTMLFirstRenderer|PandaqiRenderer

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

    operation : LayoutOperation

    resource: Resource
    element: string

    root : boolean
    parent : LayoutNode
    children: LayoutNode[]
    dimensionsContent : Dims
    targetCanvas: CanvasLike

    constructor(params:any = {})
    {
        this.config = params.config;
        this.renderer = params.renderer ?? new HTMLFirstRenderer();
        
        this.resource = params.resource ?? null;
        this.operation = new LayoutOperation(params);

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

    clone(deep = false)
    {
        const n = new LayoutNode({
            parent: this.parent,
            element: this.element,
            root: this.root
        });

        n.resource = deep ? this.resource.clone() : this.resource;
        n.operation = deep ? this.operation.clone() : this.operation;
        n.boxInput = deep ? this.boxInput.clone() : this.boxInput;
        n.propsInput = deep ? this.propsInput.clone() : this.propsInput;
        n.flowInput = deep ? this.flowInput.clone() : this.flowInput;
        n.bgInput = deep ? this.bgInput.clone() : this.bgInput;

        let children = this.children;
        if(deep)
        {
            children = [];
            for(const child of this.children)
            {
                children.push(child.clone());
            }
        }
        n.children = children;

        return n;
    }

    addChild(c:LayoutNode)
    {
        this.children.push(c);
        c.parent = this;
    }

    removeChild(c:LayoutNode)
    {
        const idx = this.children.indexOf(c);
        if(idx < 0 || idx >= this.children.length) { return; }
        c.parent = null;
        this.children.splice(idx, 1);
    }

    /* The `to` functions */
    async toCanvas(canv:CanvasLike = this.targetCanvas, calcDims = true)
    {
        if(!canv) 
        { 
            canv = createCanvas({ 
                width: this.boxInput.size.x.get(), 
                height: this.boxInput.size.y.get()
            }); 
        }

        this.renderer.toCanvas(this, canv, calcDims);
        return canv;
    }

    async toHTML()
    {
        const div = document.createElement(this.element);
        div.style.boxSizing = "border-box";

        const wrapper = this.needsWrapperHTML() ? this.createWrapperHTML() : null;
        if(wrapper) { wrapper.appendChild(div); }

        const topElem = wrapper ? wrapper : div;
        let resNode = null;

        if(this.resource)
        {
            resNode = await this.resource.toHTML(this.operation);
            div.appendChild(resNode);
        }

        // @NOTE: yes, apply to children BEFORE applying to ourselves
        for(const child of this.children)
        {
            div.appendChild(await child.toHTML());
        }

        if(this.shouldHideOverflow()) { div.style.overflow = "hidden"; }

        this.boxInput.applyToHTML(div, wrapper, this.parent);
        this.propsInput.applyToHTML(div);
        this.flowInput.applyToHTML(div);

        // @TODO: ugly exception for border radius, should find generalized system for transfering properties to resource someday
        //  > maybe pass resNode into applyToHTML above?
        if(resNode)
        {
            resNode.style.borderRadius = this.propsInput.borderRadius.toCSS();
        }

        await this.operation.applyToHTML(div);
        
        if(wrapper) { return wrapper; }
        return div;
    }

    async toSVG()
    {

    }

    /* Helpers & Tools */
    refreshRender()
    {
        this.renderer.calculateDimensions(this);
    }

    getDimensions() : Dims
    {
        return new Dims(
            this.boxOutput.position.clone(),
            this.boxOutput.size.clone()
        )
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

    shouldHideOverflow()
    {
        return this.hasNoParent() || this.parent.root || this.clipBox || this.boxInput.ghost;
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

    getRootParent() : LayoutNode
    {
        const c = new LayoutNode({ root: true, config: this.config });
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
        return this.parent.isFlowNode();
    }

    isFlowNode()
    {
        return this.flowInput.isActive();
    }

    calculateDimensions()
    {
        this.renderer.calculateDimensions(this);
    }

    getConfig() : LayoutNodeConfig
    {
        return this.getRootLayoutNode().config;
    }

    getGlobalPosition() : Point
    {
        let curNode : LayoutNode = this;
        let pos = this.boxOutput.getPosition();
        while(!curNode.hasNoParent())
        {
            curNode = curNode.parent;
            pos.add(curNode.boxOutput.getPosition());
        }
        return pos;
    }

    getRootLayoutNode() : LayoutNode
    {
        let curNode : LayoutNode = this;
        while(!curNode.hasNoParent())
        {
            curNode = curNode.parent;
        }
        return curNode;
    }

    attachToPhaser(scene:any)
    {
        const canvas = scene.sys.game.canvas;
        this.boxInput.size = new TwoAxisValue(canvas.width, canvas.height);
        this.boxInput.position = new TwoAxisValue(0,0);
        this.targetCanvas = canvas;
    }


}