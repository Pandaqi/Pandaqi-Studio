import PandaqiPhaser from "js/pq_games/website/phaser"
// @ts-ignore
import { Scene } from "js/pq_games/phaser/phaser.esm"
import BoardState from "./boardState"
import BoardDisplay from "./boardDisplay"
import Evaluator from "./evaluator"
import CONFIG from "./config"
import ResourceLoader from "js/pq_games/layout/resources/resourceLoader"
import resourceLoaderToPhaser from "js/pq_games/phaser/resourceLoaderToPhaser"
import setDefaultPhaserSettings from "js/pq_games/phaser/setDefaultPhaserSettings"
import { getDPIScalar } from "js/pq_games/pdf/main"

const sceneKey = "boardGeneration"
const resLoader = new ResourceLoader({ base: CONFIG.assetsBase });
resLoader.planLoadMultiple(CONFIG.assets);
CONFIG.resLoader = resLoader;

class BoardGeneration extends Scene
{

    board: BoardState
    canvas: HTMLCanvasElement

	constructor()
	{
		super({ key: sceneKey });
	}

    async preload() 
    {
        setDefaultPhaserSettings(this);    
    }

    async create(userConfig:Record<string,any>) 
    {
        await resLoader.loadPlannedResources();
        await resourceLoaderToPhaser(resLoader, this);

        this.setup(userConfig)
        await this.generate();
        this.draw();
        PandaqiPhaser.convertCanvasToImage(this);
    }

    setup(userConfig:Record<string,any>)
    {
        Object.assign(CONFIG, userConfig);

        CONFIG.generation.numBlockTypesOverride = null;
        CONFIG.generation.maxBlocksPerRouteOverride = null;
        CONFIG.blockSizeOverride = null;
        CONFIG.numBlocksXOverride = null;

        // just converts string input to a percentage number I can instantly use everywhere
        CONFIG.boardClarityNumber = CONFIG.boardClarityValues[CONFIG.boardClarity];

        if(CONFIG.useRealMaterial)
        {
            CONFIG.generation.numBlockTypesOverride = 8; // all of them (wildWinds is also turned on to include gray routes)
            CONFIG.generation.maxBlocksPerRouteOverride = 6; // base game obviously allows route lengths 1--6

            // the real TTR trains are about an inch (25.4mm), but the blocks are really 27mm
            // I took a value somewhere between that
            CONFIG.blockSizeOverride = 26.5 * getDPIScalar(); // 26 millimeters to pixels
            CONFIG.numBlocksXOverride = Math.floor(this.canvas.width / CONFIG.blockSizeOverride);

            const tooLittleSpace = (CONFIG.boardSize == "large" || CONFIG.boardSize == "huge") && CONFIG.splitDims == "1x1";
            if(tooLittleSpace) { CONFIG.splitDims = "2x2"; }
        }
    }

    async generate()
    {
        const evaluator = new Evaluator();
        do {
            this.board = new BoardState();
            await this.board.generate();
        } while(!evaluator.isValid(this.board));
    }

    draw()
    {
        const boardDisplay = new BoardDisplay(this);
        boardDisplay.draw(this.board);
    }    
}

PandaqiPhaser.linkTo({ scene: BoardGeneration, key: sceneKey });
