
import Board from "./board"
import { CONFIG } from "../shared/config"
import Evaluator from "./evaluator"
import { MaterialVisualizer } from "lib/pq-games"
import { prepareCorrectCellTypes } from "./types"


export default class BoardGeneration
{
    board: Board
    evaluator: Evaluator
    //types:Types

    async draw(vis:MaterialVisualizer) 
    {
        this.setup(vis);
        return await this.board.draw(vis);
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