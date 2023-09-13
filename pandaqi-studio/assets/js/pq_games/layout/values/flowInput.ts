import NumberValue from "./numberValue"
import BoxOutput from "./boxOutput"
import Point from "js/pq_games/tools/geometry/point"
import { Container, LayoutStage } from "../containers/container"
import ContainerDimensions from "../containers/containerDimensions"
import FlowOutput from "./flowOutput"
import AlignValue from "./alignValue"
import SizeValue from "./sizeValue"
import InputGroup from "./inputGroup"

enum FlowType {
    NONE,
    GRID
}

enum FlowDir {
    NONE,
    HORIZONTAL,
    VERTICAL
}

export { FlowInput, FlowDir, FlowType }
export default class FlowInput extends InputGroup
{
    flow : FlowType
    dir: FlowDir
    grow : NumberValue
    shrink: NumberValue
    gap : SizeValue
    alignFlow : AlignValue
    alignStack : AlignValue
    alignContent: AlignValue
    wrap: boolean

    // these are set by the system (if you're a child of a flow parent)
    position : Point 
    resizeAbsolute : Point

    constructor(params:Record<string,any>)
    {
        super(params);
        
        this.flow = params.flow ?? FlowType.NONE;
        this.dir = params.dir ?? FlowDir.NONE;
        this.grow = new NumberValue(params.grow ?? 0);
        this.shrink = new NumberValue(params.shrink ?? 1);
        this.gap = new SizeValue(params.gap);
        this.alignFlow = params.alignFlow ?? AlignValue.START;
        this.alignStack = params.alignStack ?? AlignValue.START;
        this.alignContent = params.alignContent ?? AlignValue.START;
        this.wrap = params.wrap ?? false;
    }

    applyToHTML(div:HTMLDivElement)
    {
        div.style.flexGrow = this.grow.get().toString();
        div.style.flexShrink = this.shrink.get().toString();

        if(!this.isActive()) { return; }

        div.style.display = "flex";
        div.style.flexDirection = this.dir == FlowDir.HORIZONTAL ? "row" : "column";
        div.style.flexWrap = this.wrap ? "wrap" : "nowrap";
        div.style.justifyContent = this.convertAlignValueToCSSProp(this.alignFlow);
        div.style.alignItems = this.convertAlignValueToCSSProp(this.alignStack);
        div.style.alignContent = this.convertAlignValueToCSSProp(this.alignContent);
        div.style.gap = this.gap.toCSS();

    }

    convertAlignValueToCSSProp(v:AlignValue) : string
    {
        if(v == AlignValue.START) { return "start"; }
        else if(v == AlignValue.MIDDLE) { return "center"; }
        else if (v == AlignValue.END) { return "end"; }
        else if (v == AlignValue.SPACE_BETWEEN) { return "space-between"; }
        else if (v == AlignValue.SPACE_AROUND) { return "space-around"; }
        else if (v == AlignValue.SPACE_EVENLY) { return "space-evenly"; }
        else if (v == AlignValue.STRETCH) { return "stretch"; }
    }

    isActive()
    {
        return this.flow != FlowType.NONE;
    }

    calc(cont:Container) : FlowOutput
    {
        var f = new FlowOutput();
        f.gap = this.gap.get();
        f.grow = this.grow.get();
        f.shrink = this.shrink.get();
        f.position = this.position;
        f.resizeAbsolute = this.resizeAbsolute;

        const dimsContent = cont.dimensionsContent;

        if(!dimsContent) { return f; }
        if(!this.isActive()) { return f; } // active means we're a flow PARENT and must set up our children
        if(!this.allHaveSize(cont.children)) { return f; }

        let flowVec = new Point(1,0);
        let stackVec = new Point(0,1);
        let anchorPos = new Point(); // Padding offset is added when box is displayed regularly; cont.boxOutput.getTopAnchor();
        if(this.dir == FlowDir.VERTICAL) { flowVec = new Point(0,1); stackVec = new Point(1,0); }
        if(this.alignFlow == AlignValue.END) { flowVec.negate(); }
        if(this.alignStack == AlignValue.END) { stackVec.negate(); }

        // @TODO: Correct anchorPos when coming from other edge
        //  => When coming from LEFT, we actually need to add child size FIRST, then place, then add gap+extra size 

        const contDims = cont.boxOutput.getUsableSize();
        const flowLines = [];

        const params = {
            container: cont,
            anchorPos: anchorPos,
            flowVec: flowVec,
            stackVec: stackVec,
            maxSize: contDims,
        }

        let curFlowLine = new FlowLine(params);
        
        for(const child of cont.children)
        {
            if(child.boxInput.ghost) { continue; }

            curFlowLine.add(child);
            if(!curFlowLine.isFull() || !this.wrap) { continue; }

            curFlowLine.finalize();
            flowLines.push(curFlowLine);
            anchorPos = curFlowLine.getNextAnchorPos();
            curFlowLine = new FlowLine();
        }

        // we miss the last line if it's not full
        curFlowLine.finalize();
        flowLines.push(curFlowLine);
        return f;
    }

    allHaveSize(list:Container[]) : boolean
    {
        for(const elem of list)
        {
            if(!elem.boxOutput.size || !elem.boxOutput.size.isValid()) { return false; }
        }
        return true;
    }
}

class FlowLine
{
    container: Container;

    list: Container[]
    flowVec: Point
    stackVec: Point
    maxSize: Point
    anchorPos: Point
    curPos: Point

    positions: Point[]
    resizes: Point[]

    constructor(params:Record<string,any> = {})
    {
        this.container = params.container;
        this.list = [];

        this.flowVec = params.flowVec ?? new Point(1,0);
        this.stackVec = params.stackVec ?? new Point(0,1);
        this.maxSize = params.maxSize ?? new Point(Infinity, Infinity);
        this.anchorPos = params.anchorPos ?? new Point();
        this.resetCurrentPosition();
    }

    finalize()
    {
        // if positive, we can GROW; if negative, we must SHRINK
        let numGrowChunks = 0;
        let numShrinkChunks = 0;
        for(const child of this.list)
        {
            numGrowChunks += child.flowOutput.grow;
            numShrinkChunks += child.flowOutput.shrink;
        }

        const availableSpace = this.getAvailableSpace().scale(this.flowVec.abs());
        let numChunks = numGrowChunks;
        if(availableSpace.length() < 0) { numChunks = numShrinkChunks; }

        if(numChunks > 0)
        {
            // each child will now add/remove this based on its flow.resize input
            const resizePerChunk = availableSpace.scaleFactor(1.0 / numChunks);
            for(const child of this.list)
            {
                child.flowInput.resizeAbsolute = resizePerChunk.clone();
                child.calculateDimensionsSelf(LayoutStage.FLOW_UPDATE);
            }
        }


        this.alignFlowAxis();
        this.alignStackAxis();
    }

    getElementSize(elem:Container)
    {
        return elem.boxOutput.getSize();
    }

    getAvailableSpace()
    {
        let spaceUsedFlow = 0;
        let spaceUsedStack = 0;
        for(const child of this.list)
        {
            const elemSize = this.getElementSize(child);
            spaceUsedFlow += elemSize.dot(this.flowVec.clone().abs());
            spaceUsedStack = Math.max(elemSize.dot(this.stackVec.clone().abs()), spaceUsedStack); 
        }

        spaceUsedFlow += this.container.flowOutput.gap * (this.count() - 1);

        const dims = this.flowVec.clone().abs().scaleFactor(spaceUsedFlow);
        dims.add(this.stackVec.clone().abs().scaleFactor(spaceUsedStack))
        return this.maxSize.clone().sub(dims);
    }

    getAvailableSpaceElement(elem:Container)
    {
        return this.maxSize.clone().sub(this.getElementSize(elem));
    }

    // Space left in the flow axis depends on the entirety of space taken up
    // (As all elements are laid out in this axis)
    alignFlowAxis()
    {
        const availableSpace = this.getAvailableSpace().dot(this.flowVec.clone().abs());

        const flowInput = this.container.flowInput;
        let spaceEdge = 0;
        let spaceBetween = 0;
        if(flowInput.alignFlow == AlignValue.MIDDLE) 
        { 
            spaceEdge = 0.5 * availableSpace;
        }

        if(flowInput.alignFlow == AlignValue.SPACE_AROUND)
        {
            spaceEdge = 0.5 * (availableSpace / this.count());
            spaceBetween = spaceEdge*2;
        }

        if(flowInput.alignFlow == AlignValue.SPACE_BETWEEN)
        {
            console.log("SPACE BETWEEN");
            spaceBetween = availableSpace / (this.count() - 1);
            console.log(spaceBetween);
        }
        
        this.resetCurrentPosition();
        this.curPos.move(this.flowVec.clone().scaleFactor(spaceEdge));
        let counter = -1;
        for(const child of this.list)
        {
            counter++;
            const pos = this.updateCurrentPosition(child, spaceBetween);
            child.flowInput.position = pos;
            this.positions[counter] = pos;
            child.calculateDimensionsSelf(LayoutStage.FLOW_UPDATE);
        }
    }

    // Space left in the stack axis merely depends on the size of individual elements
    // (As there are no others competing for space on the same axis)
    alignStackAxis()
    {
        const flowInput = this.container.flowInput;

        let counter = -1;
        for(const child of this.list)
        {
            counter++;

            const availableSpace = this.getAvailableSpaceElement(child).dot(this.stackVec.clone().abs());
            let spaceBefore = 0;
            if(flowInput.alignStack == AlignValue.MIDDLE || flowInput.alignStack == AlignValue.SPACE_AROUND) {
                spaceBefore = 0.5*availableSpace;
            } else if(flowInput.alignStack == AlignValue.END) {
                // compensate for size of child, as anchor of boxes is always top left
                spaceBefore = -this.stackVec.clone().scale(child.boxOutput.getSize()).length();
            }

            // @NOTE: we keep this `positions` array because reading current position directly
            // might be wrong or accidentally _change_ the base value, which means if
            // the flow layout is called multiple times, the results will be wildly different (and WRONG)
            const oldPos = this.positions[counter].clone();
            const offset = this.stackVec.clone().abs().scaleFactor(spaceBefore);
            const newPos = oldPos.move(offset);
            child.flowInput.position = newPos;
            child.calculateDimensionsSelf(LayoutStage.FLOW_UPDATE);
        }
    }

    count()
    {
        return this.list.length;
    }

    getGapFlow()
    {
        return this.flowVec.clone().scaleFactor(this.container.flowOutput.gap);
    }

    getGapStack()
    {
        return this.stackVec.clone().scaleFactor(this.container.flowOutput.gap);
    }

    updateCurrentPosition(child:Container, extraSpace:number = 0) : Point
    {
        const childSize = child.boxOutput.getSize();
        const offset = this.flowVec.clone().scale(childSize);
        
        const extra = this.getGapFlow();
        extra.add(this.flowVec.clone().scaleFactor(extraSpace))

        const oldPos = this.curPos.clone();
        
        const newPos = oldPos.clone();
        newPos.move(offset);
        const betweenPos = newPos.clone();
        newPos.move(extra); 
        this.curPos = newPos;

        if(this.container.flowInput.alignFlow == AlignValue.END) { return betweenPos; }
        return oldPos;
    }

    resetCurrentPosition()
    {
        this.curPos = this.anchorPos.clone();
        this.positions = [];
        this.resizes = [];

        if(this.container.flowInput.alignFlow == AlignValue.END)
        {
            this.curPos.move(this.flowVec.clone().abs().scale(this.maxSize))
        }

        if(this.container.flowInput.alignStack == AlignValue.END)
        {
            this.curPos.move(this.stackVec.clone().abs().scale(this.maxSize))
        }
    }

    add(child:Container)
    {
        const pos = this.updateCurrentPosition(child);
        child.flowInput.position = pos;
        child.calculateDimensionsSelf(LayoutStage.FLOW_UPDATE);
        this.list.push(child);
    }

    getMaxSizeInFlowDir()
    {
        return this.maxSize.clone().scale(this.flowVec).length();
    }

    isFull()
    {
        return this.curPos.clone().scale(this.flowVec).length() > this.getMaxSizeInFlowDir();
    }

    canFit(size:Point) : boolean
    {
        return this.curPos.clone().move(size).scale(this.flowVec).length() <= this.getMaxSizeInFlowDir();
    }

    getDimensions(list = this.list) : ContainerDimensions
    {
        const dims = new ContainerDimensions();
        for(const cont of list)
        {
            dims.takeIntoAccount(cont);
        }
        return dims
    }

    getNextAnchorPos() : Point
    {
        const dims = this.getDimensions().getSize();
        const offset = this.stackVec.clone().scale(dims);
        offset.add(this.getGapStack());
        return this.anchorPos.clone().move(offset);
    }
}