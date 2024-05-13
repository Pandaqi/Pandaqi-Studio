import OnPageVisualizer from "js/pq_games/website/onPageVisualizer"
// @ts-ignore
import { Scene } from "js/pq_games/phaser/phaser.esm"
import Board from "./board"
import Evaluator from "./evaluator"
import Types from "./types"
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
    board: Board
    evaluator: Evaluator
    canvas: HTMLCanvasElement
    types:Types

	constructor()
	{
		super({ key: sceneKey });
	}

    preload() 
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
        OnPageVisualizer.convertCanvasToImage(this);
    }

    setup(userConfig:Record<string,any>)
    {
        Object.assign(CONFIG, userConfig);

        this.types = new Types(this);
        this.board = new Board(this);
        this.evaluator = new Evaluator(this);
    }

    async generate()
    {
        let validBoard = false;
        do {
            this.board.generate();
            validBoard = this.evaluator.evaluate(this.board);
        } while(!validBoard);
    }

    draw()
    {
        this.board.draw();
        this.evaluator.draw(this.board);
    }    
}

OnPageVisualizer.linkTo({ scene: BoardGeneration, key: sceneKey, backend: "phaser" });