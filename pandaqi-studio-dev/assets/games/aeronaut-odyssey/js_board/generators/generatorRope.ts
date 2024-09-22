import PointGraph from "js/pq_games/tools/geometry/pointGraph";
import BoardState from "../boardState";
import rangeInteger from "js/pq_games/tools/random/rangeInteger";
import shuffle from "js/pq_games/tools/random/shuffle";
import CONFIG from "../config";
import Point from "js/pq_games/tools/geometry/point";
import Route from "../route";

export default class GeneratorRope
{
    boardState: BoardState;
    points: PointGraph[];
    routes: Route[];

    constructor(bs:BoardState)
    {
        this.boardState = bs;
    }

    async generate()
    {
        let points = this.createPoints();
        points = await this.relaxPoints(points);
        this.connectCities(points);
        this.points = points;
        return points;
    }

    createPoints()
    {
        const arr : PointGraph[] = [];
        
        // create all the first points (in a semi-random grid layout)
        const numPoints = new Point(Math.floor(this.size.x / this.idealTrackSize), Math.floor(this.size.y / this.idealTrackSize));
        this.sizeGrid = numPoints;

        const grid = [];
        for(let x = 0; x < numPoints.x; x++)
        {
            grid[x] = [];
            for(let y = 0; y < numPoints.y; y++)
            {
                let pos = new Point(Math.random()*this.size.x, Math.random()*this.size.y);
                if(CONFIG.generation.startWithGrid) 
                { 
                    pos = new Point(x*this.idealTrackSize, y*this.idealTrackSize); 
                    pos.move(new Point().random().scaleFactor(0.5*this.idealTrackSize))
                }

                const p = new PointGraph(pos.x, pos.y);
                p.metadata.gridPos = new Point(x,y);
                grid[x][y] = p;
                arr.push(p);
            }
        }

        // assign them their neighbours
        // @TODO; should really make a general function for this, I keep retyping the same array and logic for getting grid neighbors
        const NB_OFFSETS = [
            Point.RIGHT,
            Point.DOWN,
            Point.LEFT,
            Point.UP,
            new Point(1,1),
            new Point(1,-1),
            new Point(-1,1),
            new Point(-1,-1)
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

    outOfBounds(pos:Point)
    {
        return pos.x < 0 || pos.y < 0 || pos.x >= this.sizeGrid.x || pos.y >= this.sizeGrid.y
    }

    timeout(ms) 
    {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // @TODO: doesn't actually clone points right now
    async relaxPoints(points:PointGraph[])
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
                p1.metadata.offset = new Point();
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
                p1.clamp(new Point(), this.size);
            }
        }

        return arr;
    }

    connectCities(points:PointGraph[])
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