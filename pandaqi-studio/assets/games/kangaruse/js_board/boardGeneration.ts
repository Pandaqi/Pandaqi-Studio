// @ts-ignore
import { Scene } from "js/pq_games/phaser/phaser.esm"
import resourceLoaderToPhaser from "js/pq_games/phaser/resourceLoaderToPhaser"
import setDefaultPhaserSettings from "js/pq_games/phaser/setDefaultPhaserSettings"
import BoardDisplay from "./boardDisplay"
import BoardState from "./boardState"
import CONFIG from "./config"
import Evaluator from "./evaluator"

export default class BoardGeneration extends Scene
{

    evaluator:Evaluator
    board:BoardState
    canvas:HTMLCanvasElement

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
        this.evaluator = new Evaluator();

        let cellTexture = "cell_types";
        if(CONFIG.inkFriendly || CONFIG.simplifiedIcons) { cellTexture = "cell_types_simplified"; }
        CONFIG.cellTexture = cellTexture;
    }

    async generate()
    {
        do {
            this.board = new BoardState(this);
        } while(!this.evaluator.isValid(this.board));
    }

    draw()
    {
        const visualizer = new BoardDisplay(this);
        visualizer.draw(this.board);
    }    
}