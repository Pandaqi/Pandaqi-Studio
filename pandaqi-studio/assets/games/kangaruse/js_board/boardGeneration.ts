import ResourceGroup from "js/pq_games/layout/resources/resourceGroup"
import BoardVisualizer from "js/pq_games/tools/generation/boardVisualizer"
import BoardDisplay from "./boardDisplay"
import BoardState from "./boardState"
import CONFIG from "./config"
import Evaluator from "./evaluator"

export default class BoardGeneration
{
    evaluator:Evaluator
    board:BoardState
    visualizer:BoardVisualizer

    async draw(vis:BoardVisualizer) 
    {
        this.visualizer = vis;
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