import OnPageVisualizer from "js/pq_games/website/onPageVisualizer"
// @ts-ignore
import { Scene } from "js/pq_games/phaser/phaser.esm"
import BoardState from "./boardState"
import BoardDisplay from "./boardDisplay"
import Evaluator from "./evaluator"
import CONFIG from "./config"
import ResourceLoader from "js/pq_games/layout/resources/resourceLoader"
import Point from "js/pq_games/tools/geometry/point"
import setDefaultPhaserSettings from "js/pq_games/phaser/setDefaultPhaserSettings"
import resourceLoaderToPhaser from "js/pq_games/phaser/resourceLoaderToPhaser"

const sceneKey = "boardGeneration"
const assetsBase = "/kangaruse/assets/"
const assets =
{
	general_spritesheet:
    {
        path: "general_spritesheet.webp",
        frames: new Point(8,1),
    },

    cell_types:
    {
        path: "cell_types.webp",
        frames: new Point(8,4),
    },

    cell_types_simplified:
    {
        path: "cell_types_simplified.webp",
        frames: new Point(8,4),
    },

    sidebar_tutorial:
    {
        path: "sidebar_tutorial.webp",
    }
}
const resLoader = new ResourceLoader({ base: assetsBase });
resLoader.planLoadMultiple(assets);
CONFIG.resLoader = resLoader;

class BoardGeneration extends Scene
{

    evaluator:Evaluator
    board:BoardState
    canvas:HTMLCanvasElement

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

OnPageVisualizer.linkTo({ scene: BoardGeneration, key: sceneKey, backend: "phaser" });

