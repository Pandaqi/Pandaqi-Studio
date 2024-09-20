// @ts-ignore
import { Scene } from "js/pq_games/phaser/phaser.esm"
import resourceLoaderToPhaser from "js/pq_games/phaser/resourceLoaderToPhaser"
import setDefaultPhaserSettings from "js/pq_games/phaser/setDefaultPhaserSettings"
import Board from "./board"
import CONFIG from "./config"
import Evaluator from "./evaluator"
import Types from "./types"

export default class BoardGeneration extends Scene
{
    board: Board
    evaluator: Evaluator
    canvas: HTMLCanvasElement
    types:Types

	constructor()
	{
		super({ key: "boardGeneration" });
	}

    preload() 
    {
        setDefaultPhaserSettings(this); 
    }

    async create(userConfig:Record<string,any>) 
    {
        await resourceLoaderToPhaser(userConfig.visualizer.resLoader, this);

        this.setup(userConfig)
        await this.generate();
        this.draw();
        userConfig.visualizer.convertCanvasToImage(this);
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