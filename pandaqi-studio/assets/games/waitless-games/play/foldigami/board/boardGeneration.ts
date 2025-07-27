import BoardVisualizer from "js/pq_games/tools/generation/boardVisualizer"
import Board from "./board"
import CONFIG from "./config"
import Evaluator from "./evaluator"
import Types from "./types"
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup"

export default class BoardGeneration
{
    board: Board
    evaluator: Evaluator
    types:Types

    async draw(vis:BoardVisualizer) 
    {
        Object.assign(CONFIG, vis.config);
        this.setup(vis);
        await this.generate();
        const group = new ResourceGroup();
        this.board.draw(vis, group);
        this.evaluator.draw(vis, group, this.board);
        return [group];
    }

    setup(vis:BoardVisualizer)
    {
        this.types = new Types(this);
        this.board = new Board(vis, this);
        this.evaluator = new Evaluator(this);
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