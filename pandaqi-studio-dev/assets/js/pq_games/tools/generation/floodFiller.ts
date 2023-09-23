import Point from "../geometry/point";
import fromArray from "../random/fromArray";
import rangeInteger from "../random/rangeInteger";

const NB_OFFSETS = [Point.RIGHT, Point.DOWN, Point.LEFT, Point.UP];

interface FloodFillParams
{
    start?:any
    grid?:any[][],
    neighborFunction: string
    neighborPickFunction?: (list:any[], nbs:any[]) => any
    filter?: (a:any, b:any) => boolean // if this returns false, a cell isn't allowed for growing
    bounds?: { min: number, max: number },
    existing?: any[],
    mask?: any[]
}

export default class FloodFiller
{
    elements: any[]

    constructor()
    {
        this.elements = [];
    }

    count() { return this.get().length; }
    get() { return this.elements; }
    grow(params:FloodFillParams) 
    {
        let start = params.start;
        let existing = params.existing ?? [];
        let mask = params.mask ?? [];
        if(existing.length > 0) { start = existing[0]; }

        const grid = params.grid;
        const neighborFunction = params.neighborFunction ?? null;
        const defaultFilter = (a:any, b:any) => { return true; };
        const filter = params.filter ?? defaultFilter;

        const defaultPickFunction = (list,nbs) => { return fromArray(nbs); }
        const neighborPickFunction = params.neighborPickFunction ?? defaultPickFunction;

        const bounds = params.bounds ?? { min: 1, max: 1000000 };

        const maxSize = rangeInteger(bounds.min, bounds.max);
        let list = [start];
        if(existing.length > 0) { list = existing.slice(); }

        while(list.length < maxSize)
        {
            const nbs = this.getAllValidNeighbors(list, grid, filter, neighborFunction, mask);
            if(nbs.length <= 0) { break; }

            const nb = neighborPickFunction(list, nbs);
            list.push(nb);
        }

        this.elements = list;
        return list.slice();
    }

    getAllValidNeighbors(list:any[], grid:any[][], filter:Function, neighborFunction:string, mask:any[])
    {
        const nbSet = new Set();
        for(const cell of list)
        {
            let nbs : any[]
            if(neighborFunction) { nbs = cell[neighborFunction](); }
            else { nbs = this.getValidNeighbors(cell, grid); }
            
            for(const nb of nbs)
            {
                if(list.includes(nb)) { continue; }
                if(mask.length > 0 && !mask.includes(nb)) { continue; }
                if(!filter(cell, nb)) { continue; }
                nbSet.add(nb)
            }
        }
        return Array.from(nbSet);
    }

    getValidNeighbors(elem:any, grid:any[][]) : any[]
    {
        const nbs = [];
        const basePos = new Point(elem.x, elem.y);
        for(const offset of NB_OFFSETS)
        {
            var pos = basePos.clone().move(offset);
            if(this.outOfBounds(pos, grid)) { continue; }
            
            const cell = grid[pos.x][pos.y];
            nbs.push(cell);
        }
        return nbs;
    }

    outOfBounds(pos: Point, grid: any[][])
    {
        return pos.x < 0 || pos.y < 0 || pos.x >= grid.length || pos.y >= grid[0].length
    }
}