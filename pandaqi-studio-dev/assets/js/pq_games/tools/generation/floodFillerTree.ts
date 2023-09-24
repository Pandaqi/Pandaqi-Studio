import fromArray from "../random/fromArray";
import FloodFiller from "./floodFiller";

class FloodFillerTreeNode
{
    floodFiller:FloodFiller
    parent:FloodFillerTreeNode
    children:FloodFillerTreeNode[]

    constructor(f)
    {
        this.floodFiller = f;
        this.children = [];
        this.parent = null;
    }

    hasParent() { return this.parent != null; }
    setParent(n) { this.parent = n; }
    count() 
    { 
        let sum = 1;
        for(const child of this.children)
        {
            sum += child.count();
        }
        return sum;
    }
    addChild(f)
    {
        this.children.push(f);
        f.setParent(this);
    }
}

export { FloodFillerTree, FloodFillerTreeNode }
export default class FloodFillerTree
{
    root: FloodFillerTreeNode

    constructor() {}

    get() { return this.root; }
    count() { return this.root.count(); }
    grow(floodParams)
    {
        let assigned = [];
        let curParent : FloodFillerTreeNode = null;

        const forbiddenOriginal = floodParams.forbidden;

        while(true)
        {
            // pick a random neighbor to use for the next floodfill
            if(curParent)
            {
                const nbs = this.getAllValidNeighbors(assigned, curParent.floodFiller);

                // if we have no neighbors, go back up the tree until we find one that does
                // if we hit the root with no results, we're done
                if(nbs.length <= 0)
                {
                    if(!curParent.hasParent()) { break; }
                    curParent = curParent.parent;
                    continue;
                }

                const nb = fromArray(nbs);
                floodParams.start = nb;
            }

            let forbidden = assigned;
            if(forbiddenOriginal) { forbidden = floodParams.forbidden.slice().concat(assigned); }
            floodParams.forbidden = forbidden;

            // perform a flood fill on the currently set start element
            const f = new FloodFiller();
            const list = f.grow(floodParams);
            for(const elem of list)
            {
                assigned.push(elem);
            }

            const tooSmall = list.length < floodParams.bounds.min;
            if(tooSmall)
            {
                curParent.floodFiller.addElements(list);
                continue;
            }

            const node = new FloodFillerTreeNode(f);

            // attach to parent, set as the new parent to start from
            if(!curParent) { curParent = node; }
            else { curParent.addChild(node); }
            curParent = node;
        }

        this.root = curParent;
    }

    getAllValidNeighbors(assigned:any[], f:FloodFiller)
    {
        console.log(f);
        console.log("searching neighbors");
        
        const arr = [];
        const nbs = f.getAllValidNeighbors(f.get());
        for(const nb of nbs)
        {
            if(assigned.includes(nb)) { continue; }
            arr.push(nb);
        }
        return arr;
    }
}