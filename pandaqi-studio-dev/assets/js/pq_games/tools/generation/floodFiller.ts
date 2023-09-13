import Point from "../geometry/point";
import fromArray from "../random/fromArray";
import rangeInteger from "../random/rangeInteger";

const NB_OFFSETS = [Point.RIGHT, Point.DOWN, Point.LEFT, Point.UP];

export default class FloodFiller
{
    elements: any[]

    constructor()
    {
        this.elements = [];
    }

    count() { return this.get().length; }
    get() { return this.elements; }
    grow(params:Record<string,any>) 
    {
        const start = params.start;
        const grid = params.grid;
        const neighborFunction = params.neighborFunction ?? null;
        const defaultFilter = (a:any, b:any) => { return true; };
        const filter = params.filter ?? defaultFilter;
        const bounds = params.bounds ?? { min: 1, max: Infinity };

        const maxSize = rangeInteger(bounds.min, bounds.max);
        const list = [start];
        while(list.length < maxSize)
        {
            const nbs = this.getAllValidNeighbors(list, grid, filter, neighborFunction);
            if(nbs.length <= 0) { break; }

            const nb = fromArray(nbs);
            list.push(nb);
        }

        this.elements = list;
    }

    getAllValidNeighbors(list:any[], grid:any[][], filter:Function, neighborFunction:string)
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