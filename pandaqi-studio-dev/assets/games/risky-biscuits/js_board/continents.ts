import FloodFiller from "js/pq_games/tools/generation/floodFiller";
import Area from "./area";
import BoardState from "./boardState";
import CONFIG from "./config";
import Continent from "./continent";
import shuffle from "js/pq_games/tools/random/shuffle";
import Bounds from "js/pq_games/tools/numbers/bounds";

export default class Continents
{
    continents: Continent[]

    constructor() { }

    get() { return this.continents.slice(); }
    count() { return this.continents.length; }
    generate(b:BoardState)
    {
        const [continents, continentsTooSmall] = this.floodFillContinents(b);
        this.breakHugeContinents(continents, continentsTooSmall);
        this.assignIslandsToClosest(continents, continentsTooSmall);
        
        this.continents = continents;
        console.log("== CONTINENTS ==");
        console.log(this.continents);
    }

    findClosestDistBetweenAreas(a:Area[], b:Area[])
    {
        let minDist = Infinity
        for(const area1 of a)
        {
            for(const area2 of b)
            {
                const dist = area1.centroid.distTo(area2.centroid);
                minDist = Math.min(minDist, dist);
            }
        }
        return minDist;
    }

    floodFillContinents(b:BoardState)
    {
        const unassigned = b.areas.slice();

        const growFilter = (a,b) => 
        {
            return b.getType() == "land"
        }

        const sizeBounds = CONFIG.generation.continents.sizeBounds;

        // first assign the big ones
        const continents : Continent[] = [];
        const continentsTooSmall : Continent[] = []
        while(unassigned.length > 0)
        {
            const a = unassigned.pop();
            if(a.getType() != "land") { continue; }
            if(a.hasContinent()) { continue; }

            const f = new FloodFiller();
            const params = {
                start: a,
                neighborFunction: "getNeighbors",
                filter: growFilter
            }
            const list = f.grow(params);

            const tooSmall = list.length < sizeBounds.min;
            if(tooSmall)
            {
                continentsTooSmall.push(new Continent(-1, list));
                continue;
            }

            shuffle(list);
            const continent = new Continent(continents.length, list);
            continents.push(continent);
        }

        return [continents, continentsTooSmall];
    }

    breakHugeContinents(continents:Continent[], continentsTooSmall:Continent[])
    {
        const sizeBounds = CONFIG.generation.continents.sizeBounds;

        // we might end up with one or two HUGE continents
        // use a divide-and-conquer approach to break them up
        const growFilterDivide = (a,b) =>
        {
            return a.continent == b.continent;
        }

        const neighborPick = (list, nbs) =>
        {
            let minDist = Infinity;
            let minNB = null;
            for(const nb of nbs)
            {
                const dist = list[0].centroid.distTo(nb.centroid);
                if(dist >= minDist) { continue; }
                minDist = dist;
                minNB = nb;
            }
            return minNB;
        }

        const params = {
            start: null,
            bounds: null,
            neighborFunction: "getNeighbors",
            neighborPickFunction: neighborPick,
            filter: growFilterDivide,
        }

        for(const continent of continents)
        {
            while(continent.count() > sizeBounds.max)
            {
                const leftoverAreas = this.halveContinentSize(continent, params);
                const lists = this.floodFillAreaList(leftoverAreas);
                
                for(const list of lists)
                {
                    const newContinent = new Continent(continents.length, list);
                    const tooSmall = list.length < sizeBounds.min;
                    if(tooSmall) { continentsTooSmall.push(newContinent); }
                    else { continents.push(newContinent); }
                }                
            }
        }
        
    }

    halveContinentSize(continent:Continent, params)
    {
        const targetSize = Math.ceil(0.5 * continent.count());
        const oldAreas = continent.getAreas().slice();
        const f = new FloodFiller();
        params.start = continent.getMostExtremeArea();
        params.bounds = new Bounds(targetSize, targetSize);
        
        const list = f.grow(params);
        continent.setAreas(list);

        for(const elem of list)
        {
            oldAreas.splice(oldAreas.indexOf(elem), 1);
        }

        return oldAreas;
    }

    floodFillAreaList(areas:Area[])
    {
        for(const area of areas)
        {
            area.setContinent(null);
        }

        const growFilter = (a,b) =>
        {
            return !b.hasContinent();
        }

        const params = {
            start: null,
            mask: null, 
            neighborFunction: "getNeighbors",
            filter: growFilter,
        }

        const unassigned = areas.slice();
        const lists = [];
        while(unassigned.length > 0)
        {
            const a = unassigned.pop();

            const f = new FloodFiller();
            params.start = a;
            params.mask = areas;
            
            const list = f.grow(params);
            lists.push(list);

            // we don't turn them into continents yet, 
            // so I need to manually remove any cells that have already been chosen
            for(const elem of list)
            {
                const idx = unassigned.indexOf(elem);
                if(idx < 0) { continue; }
                unassigned.splice(idx, 1);
            }
        }
        return lists;
    }

    assignIslandsToClosest(continents, continentsTooSmall)
    {
        if(continentsTooSmall.length <= 0) { return; }

        // if ALL continents were too small, we need to add one and start the chain
        if(continents.length <= 0)
        {
            const c = continentsTooSmall.pop();
            c.id = 0;
            continents.push(c);
        }

        // now find the closest continent for the ones that were too small
        // and assign them to _those_
        for(const contTooSmall of continentsTooSmall)
        {

            let closestContinent = null;
            let closestDist = Infinity;

            for(const continent of continents)
            {
                const dist = this.findClosestDistBetweenAreas(contTooSmall.areas, continent.areas);
                if(dist >= closestDist) { continue; }
                closestDist = dist;
                closestContinent = continent;
            }

            closestContinent.mergeWith(contTooSmall);
        }

    }
}