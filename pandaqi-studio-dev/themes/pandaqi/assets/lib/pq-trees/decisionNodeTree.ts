import Point from "js/pq_games/tools/geometry/point";
import DecisionNode from "./decisionNode";
import DecisionNodeStyles from "./decisionNodeStyles";
import Line from "js/pq_games/tools/geometry/line";
import ResourceShape from "js/pq_games/layout/resources/resourceShape";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import ResourceText from "js/pq_games/layout/resources/resourceText";
import TextConfig, { TextAlign } from "js/pq_games/layout/text/textConfig";

interface DrawParams
{
    offset: Point, // global offset when drawing (needed to center the whole tree within the canvas)

    width: number // full width of one node
    widthShrink: number // how much the content area is shrunk ( = how much margin is added)
    heightMargin: number, // how much extra margin to add when calculating height of box
    keepSymmetrical: boolean // options are placed equidistant underneath their parent; if turned off, they are shrunk to the smallest size and just placed in sequence
    marginBetweenLayers: number, // how much space is between layers (vertically)
    fontSize: number,
}

export { DecisionNodeTree, DrawParams }
export default class DecisionNodeTree
{
    parents: DecisionNodeTree[]
    children: DecisionNodeTree[]
    pathTexts: string[] // @TODO: might want to save connections as its own object (DecisionNodeLink) so I can store properties on it?
    text: string
    style: DecisionNodeStyles

    spaceNeeded: number
    heightNeeded: number

    layer: number
    x:number
    y:number
    boxWidth: number
    boxHeight: number

    constructor()
    {
        this.parents = [];
        this.children = [];
        this.pathTexts = [];
    }

    copy(n:DecisionNode)
    {
        this.text = n.text;
        this.style = new DecisionNodeStyles(n.style);
    }

    countParents() { return this.parents.length; }
    addParent(p:DecisionNodeTree)
    {
        this.parents.push(p);
    }

    countChildren() { return this.children.length; }
    addChild(c:DecisionNodeTree, text:string)
    {
        this.pathTexts.push(text);
        this.children.push(c);
    }

    getAsList()
    {
        const arr = [];
        arr.push(this);
        for(const child of this.children)
        {
            arr.push(child.getAsList());
        }
        return arr.flat();
    }

    determineLayers(num:number)
    {
        this.layer = num;
        for(const child of this.children)
        {
            child.determineLayers(num + 1);
        }
    }

    determineHorizontalSpaceNeeded(params)
    {
        let space = 0;
        let maxSpace = 0;
        for(const child of this.children)
        {
            const childSpace = child.determineHorizontalSpaceNeeded(params);
            space += childSpace;
            maxSpace = Math.max(maxSpace, childSpace);
        }
        space = Math.max(space, 1);
        maxSpace = Math.max(maxSpace, 1);
        
        const numChildren = Math.max(this.countChildren(), 1);
        if(params.keepSymmetrical) { space = maxSpace * numChildren; }

        this.spaceNeeded = space;
        return space;
    }

    determineHorizontalPositions(x:number, params:DrawParams)
    {
        this.x = x * params.width;

        let totalSpaceNeededByChildren = 0;
        let maxSpaceNeededByChild = 0;
        for(const child of this.children)
        {
            totalSpaceNeededByChildren += child.spaceNeeded;
            maxSpaceNeededByChild = Math.max(maxSpaceNeededByChild, child.spaceNeeded);
        }

        const keepSym = params.keepSymmetrical;
        if(keepSym)
        {
            totalSpaceNeededByChildren = this.countChildren() * maxSpaceNeededByChild;
        }
        
        let globalOffset = -0.5 * totalSpaceNeededByChildren;
        for(let i = 0; i < this.children.length; i++)
        {
            const child = this.children[i];
            const myOffset = keepSym ? 0.5*maxSpaceNeededByChild : 0.5*child.spaceNeeded;
            globalOffset += myOffset;
            const childPos = x + globalOffset;
            child.determineHorizontalPositions(childPos, params);
            globalOffset += myOffset;
        }
    }

    determineVerticalSpaceNeeded(params:DrawParams)
    {
        const res = this.getTextResource(params);
        const availableWidth = params.width * params.widthShrink;
        const dims = res.measureDims(new Point(availableWidth, 4096));

        this.heightNeeded = dims.size.y + params.heightMargin;

        for(const child of this.children)
        {
            child.determineVerticalSpaceNeeded(params);
        }
    }

    determineVerticalPositions(y:number, params:DrawParams)
    {
        const nodesAsList = this.getAsList();
        let maxLayer = 0;
        for(const node of nodesAsList)
        {
            maxLayer = Math.max(maxLayer, node.layer);
        }

        const nodesPerLayer = [];
        for(let i = 0; i < maxLayer + 1; i++) { nodesPerLayer.push([]); }
        for(const node of nodesAsList)
        {
            nodesPerLayer[node.layer].push(node);
        }

        let curY = y;
        for(let i = 0; i < nodesPerLayer.length; i++)
        {
            let maxHeight = 0;
            const nodes = nodesPerLayer[i];
            for(const node of nodes)
            {
                node.y = curY;
                
                // tallest node from the whole layer decides the height of the whole layer
                maxHeight = Math.max(maxHeight, node.heightNeeded);
            }

            curY += maxHeight;
            curY += params.marginBetweenLayers;

            console.log(params.marginBetweenLayers);
        }
    }

    // @TODO: reaaaally don't like this passing around of the same params
    finalizePositions(params:any)
    {
        this.boxWidth = params.widthShrink * params.width;
        this.boxHeight = this.heightNeeded;
        for(const child of this.children)
        {
            child.finalizePositions(params);
        }
    }

    calculatePositions(params:DrawParams)
    {
        this.determineLayers(0);
        this.determineHorizontalSpaceNeeded(params);
        this.determineHorizontalPositions(0, params);
        this.determineVerticalSpaceNeeded(params);
        this.determineVerticalPositions(0, params);
        this.finalizePositions(params);
    }

    getLeftEdge() { return this.x - 0.5 * this.boxWidth; }
    getRightEdge() { return this.x + 0.5 * this.boxWidth; }
    getTopEdge() { return this.y; }
    getBottomEdge() { return this.y + this.heightNeeded; }

    getMaxDistanceToMe()
    {
        const list = this.getAsList();
        let maxX = 0;
        let maxY = 0;
        for(const node of list)
        {
            maxX = Math.max(maxX, Math.abs(node.getLeftEdge() - this.getRightEdge()), Math.abs(node.getRightEdge() - this.getLeftEdge()));
            maxY = Math.max(maxY, Math.abs(node.getTopEdge() - this.getBottomEdge()), Math.abs(node.getBottomEdge() - this.getTopEdge()));
        }

        return new Point(maxX, maxY);
    }

    // @TODO: params should go in for how to draw this shit
    getTextResource(params)
    {
        const textConfig = new TextConfig({
            font: "Helvetica",
            size: params.fontSize,
            alignHorizontal: TextAlign.MIDDLE,
            alignVertical: TextAlign.MIDDLE
        });
        const resText = new ResourceText({ text: this.text, textConfig: textConfig });
        return resText;
    }

    async draw(ctx:CanvasRenderingContext2D, params:DrawParams)
    {
        // draw the actual box
        ctx.fillStyle = "#999999";

        const offset = params.offset;
        const width = this.boxWidth;
        const height = this.boxHeight;
        const x = this.x - 0.5 * this.boxWidth + offset.x; // x position is anchored in center
        const y = this.y + offset.y; // y position is anchored at top
        
        ctx.beginPath();
        ctx.roundRect(x, y, width, height, 0.1*this.boxWidth);
        ctx.fill();

        // draw the text
        const resText = this.getTextResource(params);
        const opText = new LayoutOperation({
            pos: new Point(this.x + offset.x, this.y + 0.5*this.heightNeeded + offset.y),
            size: new Point(this.boxWidth, this.boxHeight),
            fill: "#000000",
            pivot: new Point(0.5),
        })
        resText.toCanvas(ctx, opText);

        const hasChildren = this.countChildren() > 0;
        if(!hasChildren) { return; }

        // draw lines to all its connections
        const exitPos = new Point(this.x + offset.x, this.getBottomEdge() + offset.y);
        const distToChildren = this.children[0].getTopEdge() - this.getBottomEdge();
        const exitTargetPos = exitPos.clone().move(new Point(0, 0.5*distToChildren));
        const centerLine = new Line(exitPos, exitTargetPos);
        const res = new ResourceShape({ shape: centerLine });
        const op = new LayoutOperation({
            stroke: "#333333",
            strokeWidth: 10,
        });
        await res.toCanvas(ctx, op);

        const leftEdge = new Point(this.children[0].x + offset.x, exitTargetPos.y);
        const rightEdge = new Point(this.children[this.children.length-1].x + offset.x, exitTargetPos.y);
        const horizontalLine = new Line(leftEdge, rightEdge);
        res.shape = horizontalLine;
        await res.toCanvas(ctx, op);

        for(const child of this.children)
        {
            const entryPos = new Point(child.x + offset.x, exitTargetPos.y);
            const entryPosTarget = new Point(child.x + offset.x, child.y + offset.y);
            const entryLine = new Line(entryPos, entryPosTarget);
            res.shape = entryLine;
            await res.toCanvas(ctx, op);

            // ask children to continue drawing themselves and the tree
            await child.draw(ctx, params);
        }
    }
}