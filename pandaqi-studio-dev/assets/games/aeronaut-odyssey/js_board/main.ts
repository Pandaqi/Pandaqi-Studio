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

    async preload() {
        setDefaultPhaserSettings(this);
        await resLoader.loadPlannedResources();
        resourceLoaderToPhaser(resLoader, this)
    }

    async create(userConfig:Record<string,any>) {
        this.setup(userConfig)
        await this.generate();
        this.draw();
        PandaqiPhaser.convertCanvasToImage(this, CONFIG.convertParameters);
    }

    setup(userConfig:Record<string,any>)
    {
        Object.assign(CONFIG, userConfig);
        CONFIG.convertParameters.splitDims = CONFIG.printSize;
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
