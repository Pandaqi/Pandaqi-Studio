// @ts-ignore
import { Scene } from "js/pq_games/phaser/phaser.esm"
import resourceLoaderToPhaser from "js/pq_games/phaser/resourceLoaderToPhaser"
import setDefaultPhaserSettings from "js/pq_games/phaser/setDefaultPhaserSettings"
import BoardDisplay from "./boardDisplay"
import BoardState from "./boardState"
import CONFIG from "./config"
import Evaluator from "./evaluator"
import BoardVisualizer from "js/pq_games/tools/generation/boardVisualizer"
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup"

export default class BoardGeneration
{
    evaluator:Evaluator
    board:BoardState

    async draw(vis:BoardVisualizer) 
    {
        Object.assign(CONFIG, vis.config);
        this.setup()
        await this.generate();
        return this.visualize(vis);
    }

    setup()
    {
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

    visualize(vis:BoardVisualizer)
    {
        const visualizer = new BoardDisplay(this);
        const group = new ResourceGroup();
        visualizer.draw(vis, group, this.board);
        return [group];
    }    
}