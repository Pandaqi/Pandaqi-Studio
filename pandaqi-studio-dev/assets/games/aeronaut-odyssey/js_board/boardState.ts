import PointGraph from "js/pq_games/tools/geometry/pointGraph";
import CONFIG, { GenerationMethod } from "./config"
import Point from "js/pq_games/tools/geometry/point";
import GeneratorDelaunay from "./generators/generatorDelaunay";
import GeneratorRope from "./generators/generatorRope";
import Trajectories from "./trajectories";
import Route from "./route";
import Routes from "./routes";

type Generator = GeneratorDelaunay|GeneratorRope;

export default class BoardState
{
    points: PointGraph[]
    routes: Route[]

    dims: Point
    generator: Generator;
    trajectories: Trajectories;
    
    // @NOTE: The board simply measures in blocks (1 = the length of one train block)
    // Only boardDisplay converts this to the actual page size and pixels
    constructor()
    {
        const blocksFactor = CONFIG.generation.numBlocksFullWidthMultipliers[CONFIG.boardSize];
        const blocksX = Math.round(CONFIG.generation.numBlocksFullWidth * blocksFactor);
        const blocksY = Math.floor(blocksX / CONFIG.generation.pageRatio);
        
        this.dims = new Point(blocksX, blocksY);
        this.trajectories = new Trajectories(this);
    }

    async generate()
    {
        // this comes before the rest, because we need to know how much space its 
        // rectangle will take up _before_ placing the cities and routes
        this.trajectories.generatePre();

        const m = CONFIG.generation.method;
        if(m == GenerationMethod.DELAUNAY) {
            this.generator = new GeneratorDelaunay(this);
        } else if(m == GenerationMethod.ROPE) {
            this.generator = new GeneratorRope(this);
        }
        
        this.points = await this.generator.generate();
        this.routes = new Routes(this).generate(this.points);

        this.generator.generatePost(this.points);
        this.trajectories.generatePost();
    }


    getPoints() { return this.points; }
    getRoutes() { return this.routes; }
}