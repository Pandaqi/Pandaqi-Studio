
import { Vector2, rangeInteger } from "lib/pq-games"
import { InteractiveExampleSimulator, loadRulebook } from "lib/pq-rulebook"
import { CELLS } from "../shared/dict"

class Cell
{
    x:number
    y:number
    player = false
    valid = false

    constructor(x = 0, y = 0)
    {
        this.x = x;
        this.y = y;
    }
}

const outOfBounds = (pos:Vector2, size:Vector2) =>
{
    return pos.x < 0 || pos.y < 0  || pos.x >= size.x || pos.y >= size.y;
}

const generate = async (sim:InteractiveExampleSimulator) =>
{
    // create initial grid
    const CELL_SIZE = 64;
    const dimBounds = { min: 5, max: 8 }
    const dim = rangeInteger(dimBounds);
    const size = new Vector2(dim, dim);
    const grid : Cell[][] = [];
    for(let x = 0; x < size.x; x++)
    {
        grid[x] = [];
        for(let y = 0; y < size.y; y++)
        {
            grid[x][y] = new Cell(x,y);
        }
    }

    // place player somewhere
    const randPos = new Vector2(rangeInteger(0, size.x-1), rangeInteger(0, size.y-1));
    grid[randPos.x][randPos.y].player = true;

    // create numbers and directions
    const numbers : number[] = [];
    for(let x = 0; x < size.x; x++)
    {
        numbers.push(rangeInteger(1,4));
    }

    const directions : number[] = [];
    const DIR_VECS = [
        Vector2.RIGHT,
        Vector2.DOWN,
        Vector2.LEFT,
        Vector2.UP
    ]
    for(let y = 0; y < size.y; y++)
    {
        directions.push(rangeInteger(0,3));
    }

    // find all possible moves
    const curNumber = numbers[randPos.x];
    const curDirection = directions[randPos.y];
    const curDirectionVec = DIR_VECS[curDirection];
    const possibleMoves : Vector2[] = [];
    for(let i = 1; i <= 4; i++)
    {
        const newPos = randPos.clone().move(curDirectionVec.clone().scaleFactor(i));
        if(outOfBounds(newPos, size)) { break; }
        possibleMoves.push(newPos);
    }

    for(let i = 0; i < 4; i++)
    {
        const dirVec = DIR_VECS[i];
        const newPos = randPos.clone().move(dirVec.clone().scaleFactor(curNumber));
        if(outOfBounds(newPos, size)) { continue; }
        possibleMoves.push(newPos);
    }

    // highlight those squares
    for(const move of possibleMoves)
    {
        grid[move.x][move.y].valid = true;
    }

    // finally, display all this
    const cells = grid.flat();
    const canv = document.createElement("canvas") as HTMLCanvasElement;
    canv.width = (size.x+2) * CELL_SIZE;
    canv.height = (size.y+2) * CELL_SIZE;

    const ctx = canv.getContext("2d") as CanvasRenderingContext2D;

    for(const cell of cells)
    {
        let col = ((cell.x + cell.y) % 2 == 0) ? "#FFFFFF" : "#DDDDDD";
        if(cell.player) { col = "#FF0000"; }
        if(cell.valid) { col = "#00FF00"; }
        ctx.fillStyle = col;
        ctx.fillRect((cell.x+1) * CELL_SIZE, (cell.y+1) * CELL_SIZE, CELL_SIZE, CELL_SIZE); 

        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 0.05*CELL_SIZE;
        ctx.strokeRect((cell.x+1) * CELL_SIZE, (cell.y+1) * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    }

    ctx.textAlign = "center";
    ctx.font = (0.5*CELL_SIZE) + "px mailray";
    ctx.fillStyle = "#FFEEDD";
    for(let i = 0; i < numbers.length; i++)
    {
        const str = numbers[i].toString();
        ctx.fillText(str, (i+1+0.5)*CELL_SIZE, 0.8*CELL_SIZE);
        ctx.fillText(str, (i+1+0.5)*CELL_SIZE, (size.y+1+0.5)*CELL_SIZE);
    }

    const ARROW_SYMBOLS = ["→", "↓", "←", "↑"]
    for(let i = 0; i < directions.length; i++)
    {
        const symb = ARROW_SYMBOLS[directions[i]];
        ctx.fillText(symb, 0.5*CELL_SIZE, (i+1+0.66)*CELL_SIZE);
        ctx.fillText(symb, (size.x+1+0.5)*CELL_SIZE, (i+1+0.66)*CELL_SIZE);
    }

    const container = document.createElement("div");
    container.style.textAlign = "center";
    container.appendChild(canv);

    const o = sim.getOutputBuilder();
    o.addParagraph("You are at the red square. The green squares show all valid jumps.");
    o.addNode(container);
    o.addParagraph(`Either you follow the direction command (${ARROW_SYMBOLS[curDirection]}) and go as far as you like, or you follow the distance command (${numbers[randPos.x]}) but go in any direction.`);
    o.addParagraph("Once done, execute whatever action is on your new square. (And cross out your previous square.)");

}

const CONFIG_RULEBOOK =
{
    examples:
    {
        turn:
        {
            buttonText: "Give me an example turn!",
            callback: generate
        }
    },

    tables:
    {
        types:
        {
            icons:
            {
                sheetURL: "cell_types",
                sheetWidth: 8,
                base: "/games/kangaruse/assets/"
            },
            data: CELLS
        }
    }
}

loadRulebook(CONFIG_RULEBOOK);