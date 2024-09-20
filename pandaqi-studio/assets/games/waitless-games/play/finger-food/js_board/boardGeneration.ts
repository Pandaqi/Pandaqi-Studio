// @ts-ignore
import { Scene } from "js/pq_games/phaser/phaser.esm"
import BoardDisplay from "./boardDisplay"
import BoardState from "./boardState"
import CONFIG from "./config"
import Evaluator from "./evaluator"
import TypeManager from "./typeManager"
import setDefaultPhaserSettings from "js/pq_games/phaser/setDefaultPhaserSettings"
import resourceLoaderToPhaser from "js/pq_games/phaser/resourceLoaderToPhaser"

export default class BoardGeneration extends Scene
{

    board: BoardState
    typeManager: TypeManager
    evaluator: Evaluator

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
        this.typeManager = new TypeManager(this);
        this.evaluator = new Evaluator();
    }

    async generate()
    {
        do {
            this.board = new BoardState(this);
            const typeManager = new TypeManager(this);
            this.board.assignTypes(typeManager);
        } while(!this.evaluator.isValid(this.board));
    }

    draw()
    {
        const visualizer = new BoardDisplay(this);
        visualizer.draw(this.board);
    }    
}