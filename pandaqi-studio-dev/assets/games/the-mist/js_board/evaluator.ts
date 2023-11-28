import FloodFiller from "js/pq_games/tools/generation/floodFiller";
import BoardState from "./boardState";

export default class Evaluator
{
    isValid(bs:BoardState) : boolean
    {
        // If a cell has ONLY an attacker icon, but it's adjacent to an attacker, then there is NO pickable option!
        const attackers = this.getCellsOfType(bs, "attacker");
        for(const attacker of attackers)
        {
            if(attacker.countIcons() > 1) { continue; }

            const nbs = attacker.getNeighbors();
            let hasAttackerNeighbor = false;
            for(const nb of nbs)
            {
                if(nb.hasIcon("attacker")) { hasAttackerNeighbor = true; break; }
            }
            
            if(!hasAttackerNeighbor) { continue; }

            console.error("[Evaluator] Rejected: A cell has no possible options due to ATTACKER.")
            return false;
        }

        // Long chains of boars would allow a SUPERTURN that's just too overpowered
        const boars = this.getCellsOfType(bs, "boar");
        const MAX_BOAR_CHAIN = 3;
        for(const boar of boars)
        {
            const f = new FloodFiller();
            const group = f.grow({
                start: boar,
                mask: boars,
            })

            if(group.length <= MAX_BOAR_CHAIN) { continue; }

            console.error("[Evaluator] Rejected: a chain of boars that's too long");
            return false;
        }

        return true;
    }

    getCellsOfType(bs:BoardState, type:string)
    {
        const arr = [];
        for(const cell of bs.cells)
        {
            if(!cell.hasIcon(type)) { continue; }
            arr.push(cell);
        }
        return arr;
    }
}