import fromArray from "../random/fromArray";
import FloodFiller from "./floodFiller";

class FloodFillerTreeNode<T>
{
    floodFiller:FloodFiller<T>
    parent:FloodFillerTreeNode<T>
    children:FloodFillerTreeNode<T>[]
    metadata:Record<string,any>

    constructor(f:FloodFiller<T>)
    {
        this.floodFiller = f;
        this.children = [];
        this.parent = null;
        this.metadata = {};
    }

    hasParent() { return this.parent != null; }
    hasElement(elem) { return this.floodFiller.hasElement(elem); }
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

    getNeighborsToNode(n:FloodFillerTreeNode<T>)
    {
        const ourElems = this.floodFiller.get();
        const nbElems = n.floodFiller.getAllValidNeighbors();
        const arr = [];
        for(const nbElem of nbElems)
        {
            if(!ourElems.includes(nbElem)) { continue; }
            arr.push(nbElem);
        }
        return arr;
    }
}

export { FloodFillerTree, FloodFillerTreeNode }
export default class FloodFillerTree<T>
{
    root: FloodFillerTreeNode<T>

    constructor() {}

    get() { return this.root; }
    count() { return this.root.count(); }
    grow(floodParams)
    {
        let assigned = [];
        let curParent : FloodFillerTreeNode<T> = null;

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
            const f : FloodFiller<T> = new FloodFiller();
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

    getAllValidNeighbors(assigned:any[], f:FloodFiller<T>) : T[]
    {
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