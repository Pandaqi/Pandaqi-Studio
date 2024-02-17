import Point from "js/pq_games/tools/geometry/point";
import CONFIG from "./config"
import createGrid from "js/pq_games/tools/graphs/createGrid";
import PathFinder from "js/pq_games/tools/pathfinding/pathFinder";
import assignGridNeighbors from "js/pq_games/tools/graphs/assignGridNeighbors";
import PointGraph from "js/pq_games/tools/geometry/pointGraph";
import shuffle from "js/pq_games/tools/random/shuffle";
import Path from "js/pq_games/tools/geometry/paths/path";
import Bounds from "js/pq_games/tools/numbers/bounds";
import FloodFillerTree, { FloodFillerTreeNode } from "js/pq_games/tools/generation/floodFillerTree";
import PathSegment from "./pathSegment";
import fromArray from "js/pq_games/tools/random/fromArray";
import calculatePathLength from "js/pq_games/tools/geometry/paths/calculatePathLength";
import mergePaths from "js/pq_games/tools/geometry/paths/mergePaths";
import PathAdvanced from "js/pq_games/tools/geometry/paths/pathAdvanced";

export default class Board
{
    dims: Point
    grid: PointGraph[][];
    paths: PathSegment[];
    sections: FloodFillerTree;
    pathsIntermediate: any[];

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
        this.createPathForNode(this.sections.root);
        this.mergeIntermediatePaths();
    }

    mergeIntermediatePaths()
    {
        this.paths = [];

        let pathsTaken = [];
        while(true)
        {
            const pathLists = this.getPathsRecursive(this.sections.root, pathsTaken);

            let longestPath = null;
            let longestLength = 0;
            for(const pathList of pathLists)
            {
                const length = this.getPathListLength(pathList);
                if(length <= longestLength) { continue; }
                longestPath = pathList;
                longestLength = length;
            }

            if(longestLength <= 0) { break; }

            pathsTaken = pathsTaken.concat(longestPath);
            const longestPathMerged = mergePaths(longestPath);
            this.paths.push(new PathSegment(longestPathMerged));
        }

        console.log(this.paths);

        // we want longest to be drawn on top of everything else, side branches drawn behind
        // so reverse
        this.paths.reverse();
    }

    getPathListLength(pathList:Path[])
    {
        let length = 0;
        for(const path of pathList)
        {
            length += calculatePathLength(path.toPath());
        }
        return length;
    }

    getPathsRecursive(n:FloodFillerTreeNode, exclude:Path[])
    {
        const options = n.metadata.paths;
        const pathsFinal = [];
        console.log(options);
        for(let i = 0; i < options.length; i++)
        {
            const option = options[i];
            const newPath = exclude.includes(option) ? [] : [option];
            if(i >= n.children.length) { 
                if(!exclude.includes(option)) { pathsFinal.push(newPath); }
                continue; 
            }
            
            const childOptions = this.getPathsRecursive(n.children[i], exclude);
            for(const childOption of childOptions)
            {
                if(childOption.length <= 0) { continue; }
                const childPath = newPath.slice();
                childPath.push(childOption);
                pathsFinal.push(childPath.flat());
                break;
            }
        }
        return pathsFinal;
    }

    createPathForNode(n:FloodFillerTreeNode)
    {
        const firstElem = n.floodFiller.get()[0];
        let start = n.metadata.pathStart ?? firstElem;
        const ends = [];
        for(const child of n.children)
        {
            const cells = child.getNeighborsToNode(n);
            const cell = fromArray(cells);
            ends.push(cell);
            child.metadata.pathStart = cell;
        }

        const leafNode = n.children.length <= 0;
        if(leafNode)
        {
            ends.push(this.getFurthestPointFrom(start, n.floodFiller.get()));
        }

        n.metadata.paths = [];
        for(const end of ends)
        {
            const path = this.createPathBetweenPoints(start, end, n);
            n.metadata.paths.push(path);
            start = null; // any subsequent paths should start from a point on the existing line
        }

        for(const child of n.children)
        {
            this.createPathForNode(child);
        }
    }

    getFurthestPointFrom(p:PointGraph, points:PointGraph[])
    {
        let maxDist = 0;
        let maxElem = null;
        for(const point of points)
        {
            const dist = p.distTo(point);
            if(dist <= maxDist) { continue; }
            maxDist = dist;
            maxElem = point;
        }
        return maxElem;
    }

    createPathBetweenPoints(start:PointGraph, end:PointGraph, n:FloodFillerTreeNode) : PathAdvanced
    {
        // decides whether something is a connection or not
        // we must filter out anything that isn't actually inside the section from our Node
        const connFunc = (p) => 
        { 
            const allNbs = p.getNeighbors(); 
            const arr = [];
            for(const nb of allNbs)
            {
                if(!n.hasElement(nb) && nb != end && nb != start) { continue; }

                let intersectsPath = false;
                for(const path of n.metadata.paths)
                {
                    if(path.hasPoint(nb)) { intersectsPath = true; break; }
                }
                if(intersectsPath) { continue; }

                arr.push(nb);
            }
            return arr;
        }

        const f = new PathFinder({
            connectionFunction: connFunc
        });
        f.costMap = f.assignRandomWeights({ points: this.getPoints() });

        let pathRaw
        if(start) {
            pathRaw = f.getPath({ start: start, end: end });
        } else {
            while(true)
            {
                const randStart = this.getRandomPointFromPaths(n.metadata.paths);
                pathRaw = f.getPath({ start: randStart, end: end });
                if(pathRaw.length > 0) { break; }
            }
        }

        const path = new PathAdvanced({ points: pathRaw });
        return path;
    }

    getRandomPointFromPaths(pathList:Path[])
    {
        console.log("SHOULD RANDOMIZE");
        const randPath = fromArray(pathList);
        const randPoint = randPath.getRandomPoint();
        console.log(randPoint);
        return randPoint;
    }

    /*
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
    */

    createSquaresOnPaths()
    {
        for(const path of this.paths)
        {
            path.createSquares();       
        }
    }
}