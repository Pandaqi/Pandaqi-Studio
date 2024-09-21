import ResourceGroup from "js/pq_games/layout/resources/resourceGroup"
import BoardVisualizer from "js/pq_games/tools/generation/boardVisualizer"
import BoardDisplay from "./boardDisplay"
import BoardState from "./boardState"
import CONFIG from "./config"
import Evaluator from "./evaluator"
import TypeManager from "./typeManager"

export default class BoardGeneration 
{
    board: BoardState
    typeManager: TypeManager
    evaluator: Evaluator
    visualizer: BoardVisualizer

    async draw(vis:BoardVisualizer) : Promise<ResourceGroup[]>
    {
        this.visualizer = vis;
        Object.assign(CONFIG, vis.config);
        this.setup()
        await this.generate();
        return this.visualize(vis);
    }

    setup()
    {
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

    visualize(vis:BoardVisualizer)
    {
        const visualizer = new BoardDisplay(this);
        return visualizer.draw(vis, this.board);
    }    
}