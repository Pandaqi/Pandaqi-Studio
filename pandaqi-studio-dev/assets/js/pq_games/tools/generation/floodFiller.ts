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
    mask?: any[],
    forbidden?: any[]
}

export default class FloodFiller
{
    elements: any[]
    filter: (a:any, b:any) => boolean
    neighborFunction: string
    mask: any[]
    forbidden: any[]
    grid: any[][]

    constructor()
    {
        this.elements = [];
    }

    count() { return this.get().length; }
    get() { return this.elements; }
    addElement(elem:any) { this.elements.push(elem); }
    addElements(list:any[]) { for(const elem of list) { this.addElement(elem); } }
    grow(params:FloodFillParams) 
    {
        let start = params.start;
        let existing = params.existing ?? [];
        let mask = params.mask ?? [];
        this.mask = mask;
        this.forbidden = params.forbidden ?? [];
        if(existing.length > 0) { start = existing[0]; }

        const grid = params.grid;
        this.grid = grid;
        
        const neighborFunction = params.neighborFunction ?? null;
        this.neighborFunction = neighborFunction;

        const defaultFilter = (a:any, b:any) => { return true; };
        const filter = params.filter ?? defaultFilter;
        this.filter = filter;

        const defaultPickFunction = (list, nbs) => { return fromArray(nbs); }
        const neighborPickFunction = params.neighborPickFunction ?? defaultPickFunction;

        const bounds = params.bounds ?? { min: 1, max: 1000000 };

        const maxSize = rangeInteger(bounds.min, bounds.max);
        let list = [start];
        if(existing.length > 0) { list = existing.slice(); }

        while(list.length < maxSize)
        {
            const nbs = this.getAllValidNeighbors(list);
            if(nbs.length <= 0) { break; }

            const nb = neighborPickFunction(list, nbs);
            list.push(nb);
        }

        this.elements = list;
        return list.slice();
    }

    getAllValidNeighbors(list:any[])
    {
        const nbSet = new Set();
        for(const cell of list)
        {
            let nbs : any[]
            if(this.neighborFunction) { nbs = cell[this.neighborFunction](); }
            else { nbs = this.getValidNeighbors(cell); }
            
            for(const nb of nbs)
            {
                if(list.includes(nb)) { continue; }
                if(this.forbidden.includes(nb)) { continue; }
                if(this.mask.length > 0 && !this.mask.includes(nb)) { continue; }
                if(!this.filter(cell, nb)) { continue; }
                nbSet.add(nb)
            }
        }
        return Array.from(nbSet);
    }

    getValidNeighbors(elem:any) : any[]
    {
        const nbs = [];
        const basePos = new Point(elem.x, elem.y);
        for(const offset of NB_OFFSETS)
        {
            var pos = basePos.clone().move(offset);
            if(this.outOfBounds(pos, this.grid)) { continue; }
            
            const cell = this.grid[pos.x][pos.y];
            nbs.push(cell);
        }
        return nbs;
    }

    outOfBounds(pos: Point, grid: any[][])
    {
        return pos.x < 0 || pos.y < 0 || pos.x >= grid.length || pos.y >= grid[0].length
    }
}