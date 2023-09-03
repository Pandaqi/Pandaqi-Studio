import Random from "js/pq_games/tools/random/main";

export default class BoardHole
{

    constructor()
    {
        this.cells = [];
    }

    count() { return this.getCells().length; }
    getCells() { return this.cells; }
    grow(start, grid, bounds) 
    {
        var maxSize = Random.rangeInteger(bounds.min, bounds.max);
        var list = [start];
        this.convertCell(start);
        while(list.length < maxSize)
        {
            var nbs = this.getAllValidNeighbors(list, grid);
            if(nbs.length <= 0) { break; }

            var nb = Random.fromArray(nbs);
            list.push(nb);
            this.convertCell(nb);
        }

        this.cells = list;
        console.log(this.cells);
    }

    convertCell(cell)
    {
        cell.setHole(true);
        cell.setType("tree");
    }

    getAllValidNeighbors(list, grid)
    {
        const nbSet = new Set();
        for(const cell of list)
        {
            const nbs = cell.getValidNeighbors(grid);
            for(const nb of nbs)
            {
                if(nb.isHole()) { continue; }
                nbSet.add(nb)
            }
        }

        return Array.from(nbSet);
    }
}