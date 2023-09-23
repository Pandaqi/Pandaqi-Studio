import PointGraph from "js/pq_games/tools/geometry/pointGraph";
import CONFIG, { GenerationMethod } from "./config"
import Point from "js/pq_games/tools/geometry/point";
import range from "js/pq_games/tools/random/range";
// @ts-ignore
import * as d3 from "js/pq_games/tools/graphs/d3-delaunay@6"
import Region from "./region";
import signRandom from "js/pq_games/tools/numbers/signRandom";
import { createNoise2D } from "js/pq_games/tools/generation/simplexNoise"
import calculateCentroid from "js/pq_games/tools/geometry/paths/calculateCentroid";
import clamp from "js/pq_games/tools/numbers/clamp";
import lerp from "js/pq_games/tools/numbers/lerp";
import FloodFiller from "js/pq_games/tools/generation/floodFiller";
import shuffle from "js/pq_games/tools/random/shuffle";
import Area from "./area";
import Continent from "./continent";

export default class BoardState
{
    dims: Point
    grid: Point[][];
    dimsGrid: Point;
    regions: Region[];
    areas: any[];
    continents: Continent[];
    
    // @NOTE: The board works in relative (scaled-down) coordinates, 
    // the display scales it up to its actual size
    // this is to separate both steps and make them truly independent
    constructor()
    {
        const mapWidth = CONFIG.generation.mapWidth;
        const mapHeight = mapWidth / CONFIG.generation.boardRatio;
        this.dims = new Point(mapWidth, mapHeight);
        this.dimsGrid = this.dims.clone().scaleFactor(1.0 / CONFIG.generation.distBetweenPoints).round();
    }

    generate()
    {
        this.createGrid();
        this.createVoronoi();
        this.createNoise();
        this.assignAreas();
        this.assignContinents();
    }

    getGrid() { return this.grid; }
    getPoints() { return this.grid.flat(); }
    createGrid()
    {
        const grid = [];
        const distBetween = CONFIG.generation.distBetweenPoints;
        const jitterBounds = CONFIG.generation.gridJitterBounds;
        for(let x = 0; x < this.dimsGrid.x; x++)
        {
            grid[x] = [];
            for(let y = 0; y < this.dimsGrid.y; y++)
            {
                let jitterX = range(jitterBounds) * signRandom();
                let jitterY = range(jitterBounds) * signRandom();
                const p = new Point(
                    (x + 0.5 + jitterX) * distBetween, 
                    (y + 0.5 + jitterY) * distBetween
                );
                p.clamp(new Point(), this.dims);
                grid[x][y] = p;
            }
        }

        this.grid = grid;
    }

    getAsDelaunayList(pts:Point[])
    {
        const arr = [];
        for(const pt of pts)
        {
            arr.push([pt.x, pt.y]);
        }
        console.log(arr);
        return arr;
    }

    createVoronoi()
    {
        const delaunay = d3.Delaunay.from(this.getAsDelaunayList(this.getPoints()));
        const voronoi = delaunay.voronoi([0, 0, this.dims.x, this.dims.y]);

        const list : Region[] = [];
        let counter = 0;
        for(const pol of voronoi.cellPolygons())
        {
            const pts = [];
            for(const p of pol)
            {
                pts.push(new Point(p[0], p[1]));
            }

            list.push(new Region(counter, pts));
            counter++;
        }

        for(let i = 0; i < list.length; i++)
        {
            const region = list[i];
            const neighbourIndices = voronoi.neighbors(i);
            const nbs = [];
            for(const idx of neighbourIndices)
            {
                nbs.push(list[idx]);
            }
            region.setNeighbors(nbs);
            region.connectNeighborsToEdges(voronoi);
        }

        this.regions = shuffle(list);

        const p = new Point(5,0);
        console.log(p.rotate(0.5*Math.PI));
        console.log(p.rotate(Math.PI));

        console.log(this.regions);
    }

    getNoiseValue(point:Point, noise2D:Function)
    {
        point = point.clone();

        const pointOriginal = point.clone();
        const scale = CONFIG.generation.noise.scaleFactor / CONFIG.generation.mapWidth;
        point.scaleFactor(scale);

        const numOctaves = CONFIG.generation.noise.numOctaves;
        let sum = 0;
        let amplitude = 1.0;
        let frequency = 1.0;
        let maxValue = 0;

        // with each octave, the influence of the noise is halved ( = its amplitude)
        // but the detail or variation is doubled
        for(let i = 0; i < numOctaves; i++)
        {
            const rawNoise = 0.5 * (noise2D(point.x * frequency, point.y * frequency) + 1);

            sum += amplitude * rawNoise;
            maxValue += amplitude;
            amplitude /= 2.0;
            frequency *= 2.0;
        }
        
        const dampFactor = CONFIG.generation.noise.dampFactor;
        let noise01 = clamp(sum / maxValue, 0.0, 1.0);
        const distToEdge01 = lerp(1, this.getDistToClosestEdge(pointOriginal), dampFactor);
        let noiseDamped = noise01 * distToEdge01
        return noiseDamped;
    }

    getDistToClosestEdge(point:Point)
    {
        const distX = Math.min(point.x, this.dims.x - point.x) / (0.5*this.dims.x);
        const distY = Math.min(point.y, this.dims.y - point.y) / (0.5*this.dims.y);
        return new Point(distX, distY).length();
    }

    createNoise()
    {
        const noise2D = createNoise2D();

        for(const region of this.regions)
        {
            const noise = this.getNoiseValue(region.centroid, noise2D);
            region.height = noise;
        }
    }

    assignAreas()
    {
        const unassigned = this.regions.slice();
        shuffle(unassigned);

        const areaSizeBounds = CONFIG.generation.areas.sizeBounds;
        const oceanSizeFactor = CONFIG.generation.areas.oceanSizeFactor;
        const areaSizeBoundsOcean = { min: areaSizeBounds.min * oceanSizeFactor, max: areaSizeBounds.max * oceanSizeFactor };

        const growFilter = (a,b) => 
        {
            return !b.hasArea() && a.getType() == b.getType()
        }

        const areas = [];

        // initial assignment; will leave some gaps where a bigger country just didn't fit
        while(unassigned.length > 0)
        {
            const r = unassigned.pop();
            if(r.hasArea()) { continue; }

            const f = new FloodFiller();
            const bounds = r.getType() == "sea" ? areaSizeBoundsOcean : areaSizeBounds;
            const params = {
                start: r,
                neighborFunction: "getNeighbors",
                bounds: bounds,
                filter: growFilter,
            }
            const list = f.grow(params);
            
            const tooSmall = list.length < bounds.min;
            if(tooSmall) { continue; }

            const area = new Area(areas.length, list);
            areas.push(area);
        }

        // now tell existing countries to just grow as much as they want to fill the gaps
        shuffle(areas);
        for(const area of areas)
        {
            const f = new FloodFiller();
            const params = {
                existing: area.regions,
                neighborFunction: "getNeighbors",
                filter: growFilter,
            }
            const list = f.grow(params);
            area.setRegions(list);
        }

        // there might still be gaps for _completely cut off sections_ (that are too small)
        // we capture those by starting THERE and also don't caring if it's too small
        for(const region of this.regions)
        {
            if(region.hasArea()) { continue; }
            const f = new FloodFiller();
            const params = {
                start: region,
                neighborFunction: "getNeighbors",
                filter: growFilter,
            }
            const list = f.grow(params);
            const area = new Area(areas.length, list);
            areas.push(area);
        }

        // finally, make sure performance-intensive data is cached
        for(const area of areas)
        {
            area.refreshNeighbors();
        }
        
        this.areas = areas;
        
    }

    assignContinents()
    {
        const unassigned = this.areas.slice();

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

        for(const continent of continents)
        {
            while(continent.count() > sizeBounds.max)
            {
                const targetSize = Math.ceil(0.5 * continent.count());
                console.log("target size");
                console.log(targetSize);

                const oldAreas = continent.getAreas().slice();
                const f = new FloodFiller();
                const params = {
                    start: continent.areas[0],
                    neighborFunction: "getNeighbors",
                    neighborPickFunction: neighborPick,
                    filter: growFilterDivide,
                    bounds: { min: targetSize, max: targetSize }
                }
                const list = f.grow(params);
                continent.setAreas(list);

                console.log("old areas");
                console.log(oldAreas.slice());
                console.log("new list");
                console.log(list);

                for(const elem of list)
                {
                    oldAreas.splice(oldAreas.indexOf(elem), 1);
                }

                console.log("areas left");
                console.log(oldAreas.slice());

                const newContinent = new Continent(continents.length, oldAreas);
                continents.push(newContinent);
                
            }
        }
        

        // now find the closest continent for the ones that were too small
        // and assign them to _those_
        for(const contTooSmall of continentsTooSmall)
        {

            // if ALL continents were too small, we need to add one and start the chain
            if(continents.length < 0)
            {
                contTooSmall.id = 0;
                continents.push(contTooSmall);
                continue;
            }

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

        this.continents = continents;
        console.log("CONTINENTS");
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
}