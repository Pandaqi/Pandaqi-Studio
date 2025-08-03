import BoardDisplay from "./boardDisplay";
import BoardState from "./boardState";
import Evaluator from "./evaluator";
import TypeManager from "./typeManager";

export const boardPicker = () =>
{
    const evaluator = new Evaluator();

    let board
    do {
        board = new BoardState();
        const typeManager = new TypeManager();
        board.assignTypes(typeManager);
    } while(!evaluator.isValid(board));

    return new BoardDisplay(board);
}