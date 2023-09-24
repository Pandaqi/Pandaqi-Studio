import Point from "js/pq_games/tools/geometry/point";
import CONFIG from "./config"
import createGrid from "js/pq_games/tools/graphs/createGrid";
import PathFinder from "js/pq_games/tools/pathFinder/pathFinder";
import assignGridNeighbors from "js/pq_games/tools/graphs/assignGridNeighbors";
import PointGraph from "js/pq_games/tools/geometry/pointGraph";
import shuffle from "js/pq_games/tools/random/shuffle";
import Path from "js/pq_games/tools/geometry/paths/path";
import Bounds from "js/pq_games/tools/numbers/bounds";
import FloodFillerTree from "js/pq_games/tools/generation/floodFillerTree";
import PathSegment from "./pathSegment";

export default class Board
{
    dims: Point
    grid: PointGraph[][];
    paths: PathSegment[];
    sections: FloodFillerTree;

    constructor()
    {
        const mapWidth = CONFIG.generation.mapWidth;
        const mapHeight = Math.floor(mapWidth / CONFIG.generation.boardRatio);
        this.dims = new Point(mapWidth, mapHeight);
    }

    generate()
    {
        this.createGrid();
        this.createSections();
        this.createPaths();
        this.createSquaresOnPaths();
    }

    getPoints() { return this.grid.flat(); }
    createGrid()
    {
        this.grid = createGrid(this.dims, (pos:Point) => { return new PointGraph(pos); })
        assignGridNeighbors({ grid: this.grid })
    }

    getCornerPoints()
    {
        return [
            this.grid[0][0], 
            this.grid[this.dims.x-1][0],
            this.grid[this.dims.x-1][this.dims.y-1],
            this.grid[0][this.dims.y-1]
        ]
    }

    createSections()
    {
        const tree = new FloodFillerTree();
        const params = {
            start: this.grid[0][0],
            neighborFunction: "getNeighbors",
            bounds: new Bounds(8, 20)
        }
        tree.grow(params);
        this.sections = tree;
        console.log(tree.get());
    }

    createPaths()
    {
        this.paths = [];
        this.createMainPath();
    }

    createMainPath()
    {
        const f = new PathFinder({
            connectionFunction: (p) => { return p.getNeighbors(); }
        });
        f.costMap = f.assignRandomWeights({ points: this.getPoints() });

        const corners = shuffle(this.getCornerPoints());
        const start = corners.pop();
        const end = corners.pop();
        
        const pathRaw = f.getPath({ start: start, end: end });
        const path = new Path({ points: pathRaw });

        const pathSegment = new PathSegment(path);
        this.paths.push(pathSegment);
    }

    createSquaresOnPaths()
    {
        for(const path of this.paths)
        {
            path.createSquares();       
        }
    }
}