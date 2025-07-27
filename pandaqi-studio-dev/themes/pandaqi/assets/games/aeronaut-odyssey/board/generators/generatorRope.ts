import { Vector2Graph, Vector2, rangeInteger, shuffle } from "lib/pq-games";
import BoardState from "../boardState";
import CONFIG from "../config";
import Route from "../route";

export default class GeneratorRope
{
    boardState: BoardState;
    points: Vector2Graph[];
    routes: Route[];

    constructor(bs:BoardState)
    {
        this.boardState = bs;
    }

    async generate()
    {
        let points = this.createVector2s();
        points = await this.relaxVector2s(points);
        this.connectCities(points);
        this.points = points;
        return points;
    }

    createVector2s()
    {
        const arr : Vector2Graph[] = [];
        
        // create all the first points (in a semi-random grid layout)
        const numVector2s = new Vector2(Math.floor(this.size.x / this.idealTrackSize), Math.floor(this.size.y / this.idealTrackSize));
        this.sizeGrid = numVector2s;

        const grid = [];
        for(let x = 0; x < numVector2s.x; x++)
        {
            grid[x] = [];
            for(let y = 0; y < numVector2s.y; y++)
            {
                let pos = new Vector2(Math.random()*this.size.x, Math.random()*this.size.y);
                if(CONFIG.generation.startWithGrid) 
                { 
                    pos = new Vector2(x*this.idealTrackSize, y*this.idealTrackSize); 
                    pos.move(new Vector2().random().scaleFactor(0.5*this.idealTrackSize))
                }

                const p = new Vector2Graph(pos.x, pos.y);
                p.metadata.gridPos = new Vector2(x,y);
                grid[x][y] = p;
                arr.push(p);
            }
        }

        // assign them their neighbours
        // @TODO; should really make a general function for this, I keep retyping the same array and logic for getting grid neighbors
        const NB_OFFSETS = [
            Vector2.RIGHT,
            Vector2.DOWN,
            Vector2.LEFT,
            Vector2.UP,
            new Vector2(1,1),
            new Vector2(1,-1),
            new Vector2(-1,1),
            new Vector2(-1,-1)
        ]

        for(const point of arr)
        {
            for(const offset of NB_OFFSETS)
            {
                const nbPos = point.metadata.gridPos.clone().add(offset);
                if(this.outOfBounds(nbPos)) { continue; }
                point.addNeighbor(grid[nbPos.x][nbPos.y]);
            }
        }

        return arr;
    }

    outOfBounds(pos:Vector2)
    {
        return pos.x < 0 || pos.y < 0 || pos.x >= this.sizeGrid.x || pos.y >= this.sizeGrid.y
    }

    timeout(ms) 
    {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // @TODO: doesn't actually clone points right now
    async relaxVector2s(points:Vector2Graph[])
    {
        const arr = points.slice();
        const numIterations = CONFIG.generation.numRelaxIterations;

        for(let i = 0; i < numIterations; i++)
        {
            this.points = arr;
            CONFIG.boardDisplay.draw(this);
            await this.timeout(1000);

            const iterationDampingAuto = (1.0 - (i / numIterations));
            const iterationDampingFactor = CONFIG.generation.influenceDamping * iterationDampingAuto;

            // intialize all points to not move
            for(const p1 of arr)
            {
                p1.metadata.offset = new Vector2();
                p1.metadata.weight = 0;
            }

            // now check influence on (and from) surroundings
            for(const p1 of arr)
            {
                for(const p2 of p1.getNeighbors())
                {
                    const vecTo = p1.vecTo(p2);
                    const dist = vecTo.length();
                    const vecNorm = vecTo.clone().normalize();

                    const tooClose = dist < this.trackSizeBounds.min
                    const tooFar = dist > this.trackSizeBounds.max
                    let change = 0;
                    if(tooClose) { change = 0.5*(dist - this.trackSizeBounds.min); }
                    if(tooFar) { change = 0.5*(dist - this.trackSizeBounds.max); }
                    
                    if(change == 0) { continue; }

                    change *= iterationDampingFactor;

                    p1.metadata.offset.move(vecNorm.clone().scaleFactor(change));
                    p2.metadata.offset.move(vecNorm.clone().negate().scaleFactor(change));

                    p1.metadata.weight += Math.abs(change);
                    p2.metadata.weight += Math.abs(change);
                }
            }

            // now apply all those offsets at the same time
            for(const p1 of arr)
            {
                const off = p1.metadata.offset;
                p1.move(off);
                p1.clamp(new Vector2(), this.size);
            }
        }

        return arr;
    }

    connectCities(points:Vector2Graph[])
    {
        // first determine the actual cities
        const numCities = rangeInteger(CONFIG.generation.numCityBounds);
        shuffle(points);
        for(let i = 0; i < numCities; i++)
        {
            const p = points[i];
            p.metadata.city = true;
        }

        // now pathfind our way to nearest neighbors
        // @TODO: use my pathfinding algorithm, check again how it wants its input

    }

    generatePost(points)
    {

    }
}