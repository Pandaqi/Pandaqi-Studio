import BoardDisplay from "./boardDisplay"
import BoardState from "./boardState"
import { CONFIG } from "./config"
import Evaluator from "./evaluator"

export const boardPicker = () : BoardDisplay =>
{
    const evaluator = new Evaluator();

    let cellTexture = "cell_types";
    if(CONFIG.inkFriendly || CONFIG.simplifiedIcons) { cellTexture = "cell_types_simplified"; }
    CONFIG.cellTexture = cellTexture;

    let board
    do {
        board = new BoardState(this);
    } while(!evaluator.isValid(board));

    return new BoardDisplay(board);
}