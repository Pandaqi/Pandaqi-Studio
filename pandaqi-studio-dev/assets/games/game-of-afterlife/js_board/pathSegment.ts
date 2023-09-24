import Path from "js/pq_games/tools/geometry/paths/path";
import CONFIG from "./config";

export default class PathSegment
{
    path: Path;
    squares: string[]

    constructor(path:Path)
    {
        this.path = path;
        this.squares = [];
    }

    toPath() { return this.path.toPath(); }
    lengthRaw() { return this.toPath().length; }
    createSquares()
    {
        const squareSize = CONFIG.generation.squareSizeInPathPoints;
        const numSquares = Math.floor( this.lengthRaw() / squareSize);
        this.squares = this.pickSquaresBalanced(numSquares);
    }

    // @TODO: actually pick, actually fairly
    pickSquaresBalanced(num:number)
    {
        const arr = [];
        for(let i = 0; i < num; i++)
        {
            arr.push("lala");
        }
        return arr;
    }
}