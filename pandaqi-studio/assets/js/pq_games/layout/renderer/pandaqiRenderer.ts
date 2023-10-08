import Dims from "js/pq_games/tools/geometry/dims";
import LayoutNode from "../layoutNode";
import { CanvasLike } from "../resources/resourceImage";

enum LayoutStage {
    FIXED, // calculates sizes fixed and depending on parent ( = known)
    CONTENT, // second pass needed to calculates size (of parent) depending on content
    FLOW, // third pass needed to properly distribute contents of flow boxes
    FLOW_UPDATE, // called for intermittent updates in flow children
}

export default class PandaqiRenderer
{
    calculateDimensions(node:LayoutNode)
    {
        if(node.root) { return; }
        if(node.hasNoParent()) { node.parent = node.getRootParent(); }

        node.dimensionsContent = null;
        this.calculateDimensionsSelf(node, LayoutStage.FIXED);
        if(node.isLeafNode()) { return; }

        this.calculateDimensionsContent(node, LayoutStage.FIXED);
        if(!node.dependsOnContent() && !node.isFlowNode()) { return; }

        this.calculateDimensionsSelf(node, LayoutStage.CONTENT);
        this.calculateDimensionsContent(node, LayoutStage.CONTENT);
        if(!node.isFlowNode()) { return; }

        this.calculateDimensionsSelf(node, LayoutStage.FLOW);
        this.calculateDimensionsContent(node, LayoutStage.FLOW);
    }

    // In post, it only updates width/height/x/y if it isn't fixed (it grows with content)
    calculateDimensionsSelf(node:LayoutNode, layoutStage:LayoutStage = LayoutStage.FIXED)
    {
        const flowOutput = node.flowInput.calc(node);
        node.flowOutput = flowOutput;

        const boxOutput = node.boxInput.calc(node);
        node.propsOutput = node.propsInput.calc(node);
        node.bgOutput = node.bgInput.calc(node);
        node.boxOutput = boxOutput;
    }

    calculateDimensionsContent(node: LayoutNode, layoutStage:LayoutStage = LayoutStage.FIXED)
    {
        const dimsContent = new Dims();
        for(const child of node.children)
        {
            child.calculateDimensions();
            if(child.boxInput.ghost) { continue; }
            dimsContent.takeIntoAccount(child.getDimensions());
        }

        dimsContent.grow(node.boxOutput.padding);
        node.dimensionsContent = dimsContent;
    }

    async toCanvas(node: LayoutNode, targetCanvas: CanvasLike, calcDims = true)
    {
        if(calcDims) { this.calculateDimensions(node); }
        if(targetCanvas instanceof CanvasRenderingContext2D) { targetCanvas = targetCanvas.canvas; }

        const canv = document.createElement("canvas");
        const root = node.getRootLayoutNode();
        canv.width = root.boxOutput.size.x;
        canv.height = root.boxOutput.size.y;
        if(canv.width <= 0 || canv.height <= 0) { return; }

        const ctx = canv.getContext("2d");
        ctx.imageSmoothingEnabled = false;
        ctx.imageSmoothingQuality = "low";
        ctx.globalAlpha = node.propsOutput.alpha;

        let pos = node.getGlobalPosition();        
        if(node.propsOutput.fill != "transparent")
        {
            ctx.fillStyle = node.propsOutput.fill;
            ctx.fillRect(pos.x, pos.y, node.boxOutput.size.x, node.boxOutput.size.y);
        }
        
        ctx.save();

        if(node.resource)
        {
            node.resource.toCanvas(canv);
        }

        for(const child of node.children)
        {
            child.toCanvas(canv, false);
        }

        ctx.restore();
        
        if(node.getConfig().debugDimensions)
        {
            ctx.strokeStyle = "#FF0000";
            ctx.lineWidth = 5;
            ctx.strokeRect(pos.x, pos.y, node.boxOutput.size.x, node.boxOutput.size.y);
        }

        // @TODO: properly take different sides into account + align properly (inside, middle, outside)
        /*
        if(node.boxInput.stroke.isVisible())
        {
            ctx.strokeStyle = this.boxOutput.stroke.color;
            ctx.lineWidth = this.boxOutput.stroke.width.top; 
            ctx.stroke(this.getClipPath());
        }
        */

        // apply our canvas operation to the final canvas in its entirety
        node.operation.applyToCanvas(canv);

        // then finally draw the results onto the bigger canvas that called us
        targetCanvas.getContext("2d").drawImage(canv, 0, 0);
    }
}