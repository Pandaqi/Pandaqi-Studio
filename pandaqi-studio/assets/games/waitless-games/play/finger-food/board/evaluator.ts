import BoardState from "./boardState"
import { CONFIG } from "../shared/config"

export default class Evaluator
{
    constructor() {}
    isValid(board:BoardState) : boolean
    {
        if(board.fail) { return false; }

        const refs = board.getCellsOfType("refridgerator");
        for(const ref of refs)
        {
            const nbs = board.getCellsAdjacent(ref);
            let hasMoneyNeighbor = false;
            for(const nb of nbs)
            {
                if(nb.mainType != "money") { continue; }
                hasMoneyNeighbor = true;
                break;
            }
            if(!hasMoneyNeighbor) { return false; }
        }

        const freezers = board.getCellsOfType("freezer");
        for(const freezer of freezers)
        {
            const nbs = board.getCellsOnSameAxis(freezer);
            let hasMoneyNeighbor = false;
            for(const nb of nbs)
            {
                if(nb.mainType != "money") { continue; }
                hasMoneyNeighbor = true;
                break;
            }
            if(!hasMoneyNeighbor) { return false; }
        }

        const hasTimer = board.getCellsOfType("timer").length > 0;
        const timerRelevantCells = board.getCellsWithProperty("timerRelevant").length;
        if(hasTimer && timerRelevantCells < CONFIG.evaluator.timerRelevantCellsMinimum) { return false; }

        return true; 
    }
}