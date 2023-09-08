import NumberValue from "./numberValue"
import BoxOutput from "./boxOutput"
import Point from "js/pq_games/tools/geometry/point"
import { Container, LayoutStage } from "../containers/container"
import ContainerDimensions from "../containers/containerDimensions"
import FlowOutput from "./flowOutput"
import AlignValue from "./alignValue"

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
export default class FlowInput
{
    flow : FlowType
    dir: FlowDir
    resize : NumberValue
    gap : NumberValue // @TODO: should actually be a size value, properly calculated and all
    alignFlow : AlignValue
    alignStack : AlignValue
    wrap: boolean

    // these are set by the system (if you're a child of a flow parent)
    position : Point 
    resizeAbsolute : Point

    constructor(params:Record<string,any>)
    {
        this.flow = params.flow ?? FlowType.NONE;
        this.dir = params.dir ?? FlowDir.NONE;
        this.resize = new NumberValue(params.resize ?? 1);
        this.gap = new NumberValue(params.gap);
        this.alignFlow = params.alignFlow ?? AlignValue.START;
        this.alignStack = params.alignStack ?? AlignValue.START;
        this.wrap = params.wrap ?? false;
    }

    isActive()
    {
        return this.flow != FlowType.NONE;
    }

    calc(cont:Container, dimsContent:ContainerDimensions = null) : FlowOutput
    {
        var f = new FlowOutput();
        f.gap = this.gap.get();
        f.resize = this.resize.get();
        f.position = this.position;
        f.resizeAbsolute = this.resizeAbsolute;

        if(!dimsContent) { return f; }
        if(!this.isActive()) { return f; } // active means we're a flow PARENT and must set up our children

        let flowVec = new Point(1,0);
        let stackVec = new Point(0,1);
        let anchorPos = new Point(); // Padding offset is added when box is displayed regularly; cont.boxOutput.getTopAnchor();
        if(this.dir == FlowDir.VERTICAL) { flowVec = new Point(0,1); stackVec = new Point(1,0); }
        if(this.alignFlow == AlignValue.END) { flowVec.negate(); }
        if(this.alignStack == AlignValue.END) { stackVec.negate(); }

        console.log("Calculating");
        console.log(cont.children);

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
            curFlowLine.add(child);
            if(!curFlowLine.isFull() || !this.wrap) { continue; }

            curFlowLine.finalize();
            flowLines.push(curFlowLine);
            anchorPos = curFlowLine.getNextAnchorPos();
            curFlowLine = new FlowLine();
        }

        // we miss the last line if it's not full
        // @TODO: so _check_ if it's full or not?
        curFlowLine.finalize();
        flowLines.push(curFlowLine);

        console.log(flowLines);

        return f;
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
        let numResizeChunks = 0;
        let resizingHappens = false;
        for(const child of this.list)
        {
            const val = child.flowOutput.resize;
            numResizeChunks += val;
            if(val != 1) { resizingHappens = true; }
        }

        // If even one container is set to resize, then everything resizes + updates positions
        // Furthermore, any spacing parameters are ignored, for there's no space left to fill!
        if(resizingHappens)
        {
            // each child will now add/remove this based on its flow.resize input
            const resizePerChunk = this.getAvailableSpace().scaleFactor(1.0 / numResizeChunks);
            for(const child of this.list)
            {
                child.flowInput.resizeAbsolute = resizePerChunk.clone();
                child.calculateDimensionsSelf(LayoutStage.FLOW_UPDATE);
            }
        }

        this.alignFlowAxis();
        this.alignStackAxis();
    }

    getAvailableSpace()
    {
        const dims = this.getDimensions();
        return this.maxSize.clone().sub(dims.getSize());
    }

    getAvailableSpaceElement(elem:Container)
    {
        const dims = new ContainerDimensions().fromBox(elem.boxOutput);
        return this.maxSize.clone().sub(dims.getSize());
    }

    // Space left in the flow axis depends on the entirety of space taken up
    // (As all elements are laid out in this axis)
    alignFlowAxis()
    {
        const availableSpace = this.getAvailableSpace().dot(this.flowVec.clone().abs());
        const negativeSpace = availableSpace <= 0;
        if(negativeSpace) { return; }

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
            spaceBetween = availableSpace / (this.count() - 1);
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
            const negativeSpace = availableSpace <= 0;
            if(negativeSpace && flowInput.alignStack != AlignValue.END) { continue; }

            let spaceBefore = 0;
            if(flowInput.alignStack == AlignValue.MIDDLE || flowInput.alignStack == AlignValue.SPACE_AROUND) {
                spaceBefore = 0.5*availableSpace;
            } else if(flowInput.alignStack == AlignValue.END) {
                // compensate for size of child, as anchor of boxes is always top left
                spaceBefore = -this.stackVec.clone().scale(child.boxOutput.getSize()).length();
            }

            // @TODO: better not to read this directly the modify
            // Solution 1) keep an array of positions (populated in alignFlowAxis), modify this
            // Solution 2) only modify that single axis, not the whole point
            const oldPos = this.positions[counter].clone();
            console.log("Flow input position is: ", oldPos);
            const offset = this.stackVec.clone().abs().scaleFactor(spaceBefore);
            const newPos = oldPos.move(offset);
            console.log("New position is: ", newPos);
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