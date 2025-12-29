
import BoardDisplay from "./boardDisplay"
import BoardState from "./boardState"
import { CONFIG } from "../shared/config"
import Evaluator from "./evaluator"
import TypeManager from "./typeManager"
import { MaterialVisualizer, ResourceGroup } from "lib/pq-games"

export default class BoardGeneration 
{
    board: BoardState
    typeManager: TypeManager
    evaluator: Evaluator
    visualizer: MaterialVisualizer

    async draw(vis:MaterialVisualizer) : Promise<ResourceGroup[]>
    {
        this.visualizer = vis;
        Object.assign(CONFIG, vis.config);
        this.setup()
        await this.generate();
        return this.visualize(vis);
    }

    setup()
    {
        this.typeManager = new TypeManager();
        this.evaluator = new Evaluator();
    }

    async generate()
    {
        do {
            this.board = new BoardState();
            const typeManager = new TypeManager();
            this.board.assignTypes(typeManager);
        } while(!this.evaluator.isValid(this.board));
    }

    visualize(vis:MaterialVisualizer)
    {
        const visualizer = new BoardDisplay(this.board);
        return visualizer.draw(vis);
    }    
}