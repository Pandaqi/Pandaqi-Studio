import PointGraph from "js/pq_games/tools/geometry/pointGraph";
import CONFIG, { GenerationMethod } from "./config"
import Point from "js/pq_games/tools/geometry/point";
import rangeInteger from "js/pq_games/tools/random/rangeInteger";
import shuffle from "js/pq_games/tools/random/shuffle";
import GeneratorDelaunay from "./generators/generatorDelaunay";
import GeneratorRope from "./generators/generatorRope";

type Generator = GeneratorDelaunay|GeneratorRope;

export default class BoardState
{
    points: PointGraph[]
    dims: Point
    generator: Generator;
    
    // @NOTE: The board simply measures in blocks (1 = the length of one train block)
    // Only boardDisplay converts this to the actual page size and pixels
    constructor()
    {
        const blocksX = CONFIG.generation.numBlocksFullWidth;
        const blocksY = Math.floor(blocksX / CONFIG.generation.pageRatio);
        this.dims = new Point(blocksX, blocksY);
    }

    async generate()
    {
        const m = CONFIG.generation.method;
        if(m == GenerationMethod.DELAUNAY)
        {
            this.generator = new GeneratorDelaunay(this);
        }
        else if(m == GenerationMethod.ROPE)
        {
            this.generator = new GeneratorRope(this);

        }
        await this.generator.generate();
    }

    getPoints()
    {
        return this.generator.points;
    }

    getRoutes()
    {
        return this.generator.routes;
    }
}