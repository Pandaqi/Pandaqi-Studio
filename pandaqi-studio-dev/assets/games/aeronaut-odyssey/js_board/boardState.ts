import PointGraph from "js/pq_games/tools/geometry/pointGraph";
import CONFIG, { GenerationMethod } from "./config"
import Point from "js/pq_games/tools/geometry/point";
import GeneratorDelaunay from "./generators/generatorDelaunay";
import GeneratorRope from "./generators/generatorRope";
import Trajectories from "./trajectories";
import Route from "./route";
import Routes from "./routes";
import Evaluator from "./evaluator";
import ForbiddenAreas from "./forbiddenAreas";
import PlayerAreas from "./playerAreas";

type Generator = GeneratorDelaunay|GeneratorRope;

export default class BoardState
{
    points: PointGraph[]
    failed: boolean

    dims: Point
    generator: Generator;
    forbiddenAreas: ForbiddenAreas;
    playerAreas: PlayerAreas;
    trajectories: Trajectories;
    routesManager: Routes;
    
    // @NOTE: The board simply measures in blocks (1 = the length of one train block)
    // Only boardDisplay converts this to the actual page size and pixels
    constructor()
    {
        const blocksFactor = CONFIG.generation.numBlocksFullWidthMultipliers[CONFIG.boardSize];
        const blocksX = CONFIG.numBlocksXOverride ?? Math.ceil(CONFIG.generation.numBlocksFullWidth * blocksFactor);
        const blocksY = blocksX / CONFIG.generation.pageRatio;
        
        this.dims = new Point(blocksX, blocksY);
        this.trajectories = new Trajectories(this);
        this.playerAreas = new PlayerAreas(this);
        this.forbiddenAreas = new ForbiddenAreas();
        this.failed = false;
    }

    async generate()
    {
        // this comes before the rest, because we need to know how much space the
        // forbidden rectangles will take up _before_ placing the cities and routes
        this.playerAreas.generatePre(); // also, this must come before trajectories
        this.trajectories.generatePre();

        const evaluator = new Evaluator();
        const m = CONFIG.generation.method;
        if(m == GenerationMethod.DELAUNAY) {
            this.generator = new GeneratorDelaunay(this);
        } else if(m == GenerationMethod.ROPE) {
            this.generator = new GeneratorRope(this);
        }
        
        this.points = await this.generator.generate();
        this.routesManager = new Routes(this);
        this.routesManager.generate(this.points);
        evaluator.removeInvalidGraphParts(this);
        if(!evaluator.areRoutesValid(this)) { return this.fail(); }

        this.generator.generatePost(this.points);
        this.trajectories.generatePost();
        if(!evaluator.areTrajectoriesValid(this)) { return this.fail(); }
    }

    fail() { this.failed = true; return false; }
    getPoints() { return this.points; }
    getRoutes() { return this.routesManager.get(); }

    // @TODO: use a pointManager instead? (like with routes?) Make the Generator that manager?
    removePoint(p:PointGraph)
    {
        const routes : Route[] = p.metadata.routes;
        for(const route of routes)
        {
            this.routesManager.remove(route);
        }

        this.points.splice(this.points.indexOf(p), 1);
    }

}