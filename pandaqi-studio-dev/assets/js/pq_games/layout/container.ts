import Point from "js/pq_games/tools/geometry/point"
import ContainerAnchor from "./containerAnchor"
import ContainerFlow from "./containerFlow"
import ContainerDimensions from "./containerDimensions"
import StrokeValue from "./values/strokeValue"
import FourSideValue from "./values/fourSideValue"
import ContainerConfig from "./containerConfig"

enum FlowStage {
    PRE,
    POST
}

export default class Container
{
    DEFAULT_SIZE : Point = new Point().setXY(50,50);

    config: ContainerConfig

    margin : FourSideValue
    padding : FourSideValue
    stroke : StrokeValue
    fill : string
    
    widthFixed : number
    heightFixed : number
    widthDynamic: number
    heightDynamic : number
    widthMin : number
    widthMax : number
    heightMin : number
    heightMax : number

    flow : ContainerFlow
    keepRatio : number

    offset : Point
    anchor : ContainerAnchor
    clipPath: Point[]

    parent : Container
    children: Container[]

    dimensionsSelf : ContainerDimensions
    dimensionsContent : ContainerDimensions
    dimensions : ContainerDimensions

    constructor(params:any = {})
    {
        this.config = params.config;

        this.margin = new FourSideValue(params.margin);
        this.padding = new FourSideValue(params.padding);

        this.stroke = params.stroke ?? new StrokeValue();
        this.fill = params.fill ?? "transparent";

        this.widthFixed = params.widthFixed;
        this.heightFixed = params.heightFixed;
        this.widthDynamic = params.widthDynamic ?? 1.0;
        this.heightDynamic = params.heightDynamic;
        this.widthMin = params.widthMin ?? 0;
        this.widthMax = params.widthMax ?? Infinity;
        this.heightMin = params.heightMin ?? 0;
        this.heightMax = params.heightMax ?? Infinity;

        this.flow = params.flow ?? ContainerFlow.NONE;
        this.keepRatio = params.keepRatio ?? 0.0;
        this.offset = params.offset ?? new Point();
        this.anchor = params.anchor ?? ContainerAnchor.NONE;

        this.clipPath = params.clipPath ?? [];

        this.children = [];
        this.parent = params.parent;
        this.calculateDimensions();
    }

    addChild(c:Container)
    {
        this.children.push(c);
        c.parent = this;
        this.calculateDimensions();
    }

    removeChild(c:Container)
    {
        const idx = this.children.indexOf(c);
        if(idx < 0 || idx >= this.children.length) { return; }
        c.parent = null;
        this.children.splice(idx, 1);
        this.calculateDimensions();
    }

    convertOffsetToAnchor(offsetTop:Point, offsetBottom:Point, dims:ContainerDimensions) : Point
    {
        const p = offsetTop.clone();
        const a = this.anchor;
        if(!this.parent.dimensions.width || !this.parent.dimensions.height) { return p; }

        const rightEdge = this.parent.dimensions.width - offsetBottom.x - dims.width;
        const bottomEdge = this.parent.dimensions.height - offsetBottom.y - dims.height;
        const center = new Point().setXY(
            0.5*this.parent.dimensions.width - 0.5*dims.width,
            0.5*this.parent.dimensions.height - 0.5*dims.height
        );

        if(a == ContainerAnchor.TOP_LEFT || a == ContainerAnchor.NONE) {
            // do nothing
        } else if(a == ContainerAnchor.TOP_CENTER) {
            p.x = center.x;
        } else if(a == ContainerAnchor.TOP_RIGHT) {
            p.x = rightEdge;
        } else if(a == ContainerAnchor.CENTER_LEFT) {
            p.y = center.y;
        } else if(a == ContainerAnchor.CENTER_CENTER) {
            p.x = center.x;
            p.y = center.y;
        } else if(a == ContainerAnchor.CENTER_RIGHT) {
            p.x = bottomEdge;
            p.y = center.y;
        } else if(a == ContainerAnchor.BOTTOM_LEFT) {
            p.y = bottomEdge;
        } else if(a == ContainerAnchor.BOTTOM_CENTER) {
            p.x = center.x;
            p.y = bottomEdge;
        } else if(a == ContainerAnchor.BOTTOM_RIGHT) {
            p.x = rightEdge;
            p.y = bottomEdge;
        }

        return p;
    }

    isRoot() : boolean
    {
        return !this.parent;
    }

    isLeafNode() : boolean
    {
        return this.children.length <= 0
    }

    dimensionsDependOnContent() : boolean
    {
        return this.widthGrowsWithContent() || this.heightGrowsWithContent();
    }

    calculateDimensions()
    {
        this.dimensionsSelf = this.calculateDimensionsSelf(FlowStage.PRE);
        this.dimensions = this.dimensionsSelf;
        if(this.isLeafNode()) { return; }

        this.dimensionsContent = this.calculateDimensionsContent(FlowStage.PRE);
        if(!this.dimensionsDependOnContent()) { return; }

        this.dimensionsSelf = this.calculateDimensionsSelf(FlowStage.POST);
        this.dimensionsContent = this.calculateDimensionsContent(FlowStage.POST);
    }

    // In post, it only updates width/height/x/y if it isn't fixed (it grows with content)
    calculateDimensionsSelf(flowStage:FlowStage) : ContainerDimensions
    {
        if(flowStage == FlowStage.POST)
        {
            let dims = this.dimensionsSelf; 
            if(this.widthGrowsWithContent()) { dims.width = this.dimensionsContent.width; }
            if(this.heightGrowsWithContent()) { dims.height = this.dimensionsContent.height; }
            return dims;      
        }

        const dims = new ContainerDimensions();

        if(this.isRoot())
        {
            dims.x = 0;
            dims.y = 0;
            dims.width = this.widthFixed;
            dims.height = this.heightFixed;
            return dims;
        }

        let sMult = this.stroke.getDimensionMultiplier();

        const parentDims = this.parent.dimensions;
        const offsetTop = new Point().setXY(
            this.parent.padding.left + this.margin.left + sMult * this.stroke.width.left, 
            this.parent.padding.top + this.margin.top + sMult * this.stroke.width.top
        );
        const offsetBottom = new Point().setXY(
            this.parent.padding.right + this.margin.right + sMult * this.stroke.width.right,
            this.parent.padding.bottom + this.margin.bottom + sMult * this.stroke.width.bottom
        )

        const parentWidth = parentDims.width - offsetTop.x - offsetBottom.x;
        const parentHeight = parentDims.height - offsetTop.y - offsetBottom.y;

        if(this.widthDynamic) { dims.width = this.widthDynamic * parentWidth; }
        if(this.heightDynamic) { dims.height = this.heightDynamic * parentHeight; }

        if(this.widthFixed) { dims.width = this.widthFixed; }
        if(this.heightFixed) { dims.height = this.heightFixed; }

        dims.width = Math.max(Math.min(dims.width, this.widthMax), this.widthMin);
        dims.height = Math.max(Math.min(dims.height, this.heightMax), this.heightMin);

        if(this.keepRatio > 0)
        {
            if(this.keepRatio >= 1.0) { dims.height = dims.width * this.keepRatio; }
            else { dims.width = dims.height / this.keepRatio; } 
        }

        const offsetAnchored = this.convertOffsetToAnchor(offsetTop, offsetBottom, dims);
        offsetAnchored.move(this.offset);

        dims.x = offsetAnchored.x;
        dims.y = offsetAnchored.y;
        
        return dims;
    }

    calculateDimensionsContent(flowStage:FlowStage) : ContainerDimensions
    {
        const dimsContent = new ContainerDimensions();
        for(const child of this.children)
        {
            child.calculateDimensions();
            dimsContent.takeIntoAccount(child);
        }

        return dimsContent;
    }

    getConfig() : ContainerConfig
    {
        return this.getRootContainer().config;
    }

    getRootContainer() : Container
    {
        let curNode : Container = this;
        while(!curNode.isRoot())
        {
            curNode = curNode.parent;
        }
        return curNode;
    }

    widthGrowsWithContent() : boolean
    {
        return !this.widthFixed && !this.widthDynamic;
    }

    heightGrowsWithContent() : boolean
    {
        return !this.heightFixed && !this.heightDynamic;
    }

    drawTo(targetCanvas:HTMLCanvasElement)
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
        canv.width = this.dimensions.width;
        canv.height = this.dimensions.height;

        var ctx = canv.getContext("2d");

        if(this.getConfig().useFullSizeCanvas)
        {
            var root = this.getRootContainer();
            canv.width = root.dimensions.width;
            canv.height = root.dimensions.height;

            let pos = this.dimensions.getPos();
            ctx.translate(pos.x, pos.y);
        }

        ctx.fillStyle = this.fill;
        ctx.fillRect(0, 0, this.dimensions.width, this.dimensions.height);
        ctx.save();
        
        ctx.clip(this.getClipPath());

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
            ctx.strokeRect(0,0,this.dimensions.width, this.dimensions.height);
        }

        // @TODO: properly take different sides into account + align properly (inside, middle, outside)
        if(this.stroke.isVisible())
        {
            ctx.strokeStyle = this.stroke.color;
            ctx.lineWidth = this.stroke.width.top; 
            ctx.stroke(this.getClipPath());
        }

        let pos = this.dimensions.getPos();
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
        const dims = this.dimensions;
        return [
            new Point().setXY(0, 0),
            new Point().setXY(dims.width, 0),
            new Point().setXY(dims.width, dims.height),
            new Point().setXY(0, dims.height)
        ]
    }
}