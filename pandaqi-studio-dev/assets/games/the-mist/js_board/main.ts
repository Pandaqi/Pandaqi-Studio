import PandaqiPhaser from "js/pq_games/website/phaser"
// @ts-ignore
import { Scene } from "js/pq_games/phaser/phaser.esm"
import ResourceLoader from "js/pq_games/layout/resources/resourceLoader"
import resourceLoaderToPhaser from "js/pq_games/phaser/resourceLoaderToPhaser"
import setDefaultPhaserSettings from "js/pq_games/phaser/setDefaultPhaserSettings"
import CONFIG from "../js_shared/config"
import BoardState from "./boardState"
import BoardGen from "./boardGen"
import BoardDraw from "./boardDraw"
import Evaluator from "./evaluator"
import { SETS } from "../js_shared/dict"

const sceneKey = "boardGeneration"

const resLoader = new ResourceLoader({ base: CONFIG.assetsBase });
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
        this.setup(userConfig);

        const assetsToLoad = {};
        for(const [key,data] of Object.entries(CONFIG.assets))
        {
            const textureKey = key.split("_")[0];
            if(data.set && !CONFIG.sets[textureKey]) { continue; }
            assetsToLoad[key] = data;
        }

        resLoader.planLoadMultiple(assetsToLoad);
        
        await resLoader.loadPlannedResources();
        await resourceLoaderToPhaser(resLoader, this);

        const board = await this.generate();
        this.draw(board);
        PandaqiPhaser.convertCanvasToImage(this);
    }

    setup(userConfig:Record<string,any>)
    {
        Object.assign(CONFIG, userConfig);

        // create master dict of ALL included powers + their texture for displaying
        let allPowers = {};
        for(const [setKey,included] of Object.entries(CONFIG.sets))
        {
            if(!included) { continue; }
            const setData = SETS[setKey];
            allPowers = Object.assign(allPowers, setData);

            for(const [elemKey,data] of Object.entries(setData))
            {
                data.textureKey = setKey;
            }
        }
        CONFIG.allTypes = allPowers;
        console.log(allPowers);

    }

    async generate()
    {
        const evaluator = new Evaluator();
        const boardGen = new BoardGen();
        let board:BoardState;
        do {
            board = await boardGen.generate();
        } while(!evaluator.isValid(board));
        return board;
    }

    draw(board:BoardState)
    {
        const boardDraw = new BoardDraw();
        boardDraw.draw(this, board);
    }    
}

PandaqiPhaser.linkTo({ scene: BoardGeneration, key: sceneKey });
