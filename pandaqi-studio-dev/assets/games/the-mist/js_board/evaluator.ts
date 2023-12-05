import FloodFiller from "js/pq_games/tools/generation/floodFiller";
import BoardState from "./boardState";
import Cell from "./cell";

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

        // Check if the majority of shipwrecks _share_ their row/column with other shipwrecks
        const shipwrecks = this.getCellsOfType(bs, "shipwreck");
        let failPercentage = 0.0;
        const MAX_FAIL_PERCENTAGE = 0.25;
        for(const ship of shipwrecks)
        {
            const row = this.getRow(bs, ship.pos.y);
            const col = this.getColumn(bs, ship.pos.x);
            const allCells = [row, col].flat();
            let numMatches = 0;
            for(const cell of allCells)
            {
                if(cell.type != "shipwreck") { continue; }
                if(cell == ship) { continue; }
                numMatches++;
            }

            if(numMatches <= 0) { failPercentage++; }
        }

        failPercentage /= shipwrecks.length;
        if(failPercentage >= MAX_FAIL_PERCENTAGE)
        {
            console.error("[Evaluator] Rejected: too many shipwrecks without sharing row/column.");
            return false;
        }

        return true;
    }

    getRow(bs:BoardState, num:number)
    {
        return bs.grid[num];
    }

    getColumn(bs:BoardState, num:number)
    {
        const arr = [];
        for(let x = 0; x < bs.dims.x; x++)
        {
            arr.push(bs[x][num]);
        }
        return arr;
    }

    getCellsOfType(bs:BoardState, type:string)
    {
        const arr : Cell[] = [];
        for(const cell of bs.cells)
        {
            if(!cell.hasIcon(type)) { continue; }
            arr.push(cell);
        }
        return arr;
    }
}