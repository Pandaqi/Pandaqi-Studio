import InteractiveExample from "js/pq_rulebook/examples/interactiveExample"
import { CELLS } from "../js_shared/dictionary"
import Point from "js/pq_games/tools/geometry/point"
import rangeInteger from "js/pq_games/tools/random/rangeInteger"

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

function outOfBounds(pos:Point, dims:Point)
{
    return pos.x < 0 || pos.y < 0  || pos.x >= dims.x || pos.y >= dims.y;
}

async function generate()
{
    // create initial grid
    const CELL_SIZE = 64;
    const dimBounds = { min: 5, max: 8 }
    const dim = rangeInteger(dimBounds);
    const dims = new Point(dim, dim);
    const grid : Cell[][] = [];
    for(let x = 0; x < dims.x; x++)
    {
        grid[x] = [];
        for(let y = 0; y < dims.y; y++)
        {
            grid[x][y] = new Cell(x,y);
        }
    }

    // place player somewhere
    const randPos = new Point(rangeInteger(0, dims.x-1), rangeInteger(0, dims.y-1));
    grid[randPos.x][randPos.y].player = true;

    // create numbers and directions
    const numbers : number[] = [];
    for(let x = 0; x < dims.x; x++)
    {
        numbers.push(rangeInteger(1,4));
    }

    const directions : number[] = [];
    const DIR_VECS = [
        Point.RIGHT,
        Point.DOWN,
        Point.LEFT,
        Point.UP
    ]
    for(let y = 0; y < dims.y; y++)
    {
        directions.push(rangeInteger(0,3));
    }

    // find all possible moves
    const curNumber = numbers[randPos.x];
    const curDirection = directions[randPos.y];
    const curDirectionVec = DIR_VECS[curDirection];
    const possibleMoves : Point[] = [];
    for(let i = 1; i <= 4; i++)
    {
        const newPos = randPos.clone().move(curDirectionVec.clone().scaleFactor(i));
        if(outOfBounds(newPos, dims)) { break; }
        possibleMoves.push(newPos);
    }

    for(let i = 0; i < 4; i++)
    {
        const dirVec = DIR_VECS[i];
        const newPos = randPos.clone().move(dirVec.clone().scaleFactor(curNumber));
        if(outOfBounds(newPos, dims)) { continue; }
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
    canv.width = (dims.x+2) * CELL_SIZE;
    canv.height = (dims.y+2) * CELL_SIZE;

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
    ctx.font = (0.5*CELL_SIZE) + "px 'Mail Ray Stuff'";
    ctx.fillStyle = "#FFEEDD";
    for(let i = 0; i < numbers.length; i++)
    {
        const str = numbers[i].toString();
        ctx.fillText(str, (i+1+0.5)*CELL_SIZE, 0.8*CELL_SIZE);
        ctx.fillText(str, (i+1+0.5)*CELL_SIZE, (dims.y+1+0.5)*CELL_SIZE);
    }

    const ARROW_SYMBOLS = ["→", "↓", "←", "↑"]
    for(let i = 0; i < directions.length; i++)
    {
        const symb = ARROW_SYMBOLS[directions[i]];
        ctx.fillText(symb, 0.5*CELL_SIZE, (i+1+0.66)*CELL_SIZE);
        ctx.fillText(symb, (dims.x+1+0.5)*CELL_SIZE, (i+1+0.66)*CELL_SIZE);
    }

    const container = document.createElement("div");
    container.style.textAlign = "center";
    container.appendChild(canv);

    o.addParagraph("You are at the red square. The green squares show all valid jumps.");
    o.addNode(container);
    o.addParagraph("Either you follow the direction command (" + ARROW_SYMBOLS[curDirection] + ") and go as far as you like, or you follow the distance command (" + numbers[randPos.x] + ") but go in any direction.");
    o.addParagraph("Once done, execute whatever action is on your new square. (And cross out your previous square.)");

}

const e = new InteractiveExample({ id: "turn" });
e.setButtonText("Give me an example turn!");
e.setGenerationCallback(generate);

const o = e.getOutputBuilder();

// Print all the cell types into the rulebook automatically
const container = document.getElementById("kangaruse-type-table");
if(container)
{
    const table = document.createElement("table");
    container.appendChild(table);
    
    for(const [cellType,cellData] of Object.entries(CELLS))
    {
        const row = document.createElement("tr");
        const iconCell = document.createElement("td");
        const icon = document.createElement("div");
        iconCell.appendChild(icon);
        icon.classList.add("icon");
    
        // @ts-ignore
        const frame = cellData.frame;
        const frameVec = { x: frame % 8, y: Math.floor(frame / 8) }
        const offsetPerFrame = 64;
    
        icon.style.width = offsetPerFrame + "px";
        icon.style.height = offsetPerFrame + "px";
    
        icon.style.backgroundPositionX = (-frameVec.x * offsetPerFrame) + "px";
        icon.style.backgroundPositionY = (-frameVec.y * offsetPerFrame) + "px";
    
        const descCell = document.createElement("td");
        // @ts-ignore
        descCell.innerHTML = cellData.desc;
    
        row.appendChild(iconCell);
        row.appendChild(descCell);
    
        table.appendChild(row);
    }
}
