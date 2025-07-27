import CONFIG, { GenerationMethod } from "./config"
import GeneratorDelaunay from "./generators/generatorDelaunay";
import GeneratorRope from "./generators/generatorRope";
import Trajectories from "./trajectories";
import Routes from "./routes";
import Evaluator from "./evaluator";
import ForbiddenAreas from "./forbiddenAreas";
import PlayerAreas from "./playerAreas";
import Cities from "./cities";
import RouteAreas from "./routeAreas";
import { Vector2Graph, Vector2 } from "lib/pq-games";

type Generator = GeneratorDelaunay|GeneratorRope;

export default class BoardState
{
    points: Vector2Graph[]
    failed: boolean

    size: Vector2
    generator: Generator;
    forbiddenAreas: ForbiddenAreas;
    playerAreas: PlayerAreas;
    trajectories: Trajectories;

    routesManager: Routes;
    pointsManager: Cities;

    // @NOTE: these are NOT read from config as they can be overriden and altered in various ways and that would just be a mess
    numBlockTypes: number;
    maxBlocksPerRoute: number;
    routeAreas: RouteAreas;
    
    // @NOTE: The board simply measures in blocks (1 = the length of one train block)
    // Only boardDisplay converts this to the actual page size and pixels
    constructor()
    {
        const blocksFactor = CONFIG.generation.numBlocksFullWidthMultipliers[CONFIG.boardSize];
        const blocksX = CONFIG.numBlocksXOverride ?? Math.ceil(CONFIG.generation.numBlocksFullWidth * blocksFactor);
        const blocksY = blocksX / CONFIG.generation.pageRatio;
        
        this.size = new Vector2(blocksX, blocksY);
        this.trajectories = new Trajectories(this);
        this.playerAreas = new PlayerAreas(this);
        this.forbiddenAreas = new ForbiddenAreas();
        this.failed = false;

        this.numBlockTypes = CONFIG.generation.numBlockTypesOverride ?? CONFIG.generation.numBlockTypes;
        this.maxBlocksPerRoute = CONFIG.generation.maxBlocksPerRouteOverride ?? CONFIG.generation.maxBlocksPerRoute;
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
        
        const points = await this.generator.generate();
        this.pointsManager = new Cities(this, points);

        this.routesManager = new Routes(this);
        this.routesManager.generate(points);
        evaluator.removeInvalidGraphParts(this);
        if(!evaluator.areRoutesValid(this)) { return this.fail(); }

        this.pointsManager.generatePost();
        this.trajectories.generatePost();
        if(!evaluator.areTrajectoriesValid(this)) { return this.fail(); }

        this.routeAreas = new RouteAreas();
        this.routeAreas.generate(this.getPoints(), this.getRoutes());
    }

    fail() { this.failed = true; return false; }
    getPoints() { return this.pointsManager.get(); }
    getRoutes() { return this.routesManager.get(); }


}