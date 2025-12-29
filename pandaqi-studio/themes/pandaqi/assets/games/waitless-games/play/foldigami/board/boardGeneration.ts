
import Board from "./board"
import { CONFIG } from "../shared/config"
import Evaluator from "./evaluator"
import { MaterialVisualizer, ResourceGroup } from "lib/pq-games"
import { prepareCorrectCellTypes } from "./types"


export default class BoardGeneration
{
    board: Board
    evaluator: Evaluator
    //types:Types

    async draw(vis:MaterialVisualizer) 
    {
        // @TODO: no vis.config anymore!
        Object.assign(CONFIG, vis.config);
        this.setup(vis);
        await this.generate();
        const group = new ResourceGroup();
        this.board.draw(vis, group);
        this.evaluator.draw(vis, group, this.board);
        return [group];
    }

    setup(vis:MaterialVisualizer)
    {
        prepareCorrectCellTypes();
        this.board = new Board();
        this.evaluator = new Evaluator();
    }

    async generate()
    {
        let validBoard = false;
        do {
            this.board.generate();
            validBoard = this.evaluator.evaluate(this.board);
        } while(!validBoard);
    } 
}