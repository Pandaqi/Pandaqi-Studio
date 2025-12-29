import { fromArray, Vector2, assignGridNeighbors, GridNeighborType, rangeInteger, shuffle, createContext, Rectangle, LayoutOperation, ResourceShape, Line, isApprox, Bounds, getMaterialDataForRulebook } from "lib/pq-games";
import { InteractiveExampleSimulator, loadRulebook } from "lib/pq-rulebook";
import Cell from "../board/cell";
import { CONFIG } from "../shared/config";
import { ActionSet, SETS } from "../shared/dict";

class Collection
{
    icons: string[]

    constructor(num:number, options:string[])
    {
        const makeSame = Math.random() <= 0.33;
        const sameOption = fromArray(options);
        const arr = [];
        for(let i = 0; i < num; i++)
        {
            let type = makeSame ? sameOption : fromArray(options);
            arr.push(type);
        }
        this.icons = arr;
    }

    countType(tp:string)
    {
        let sum = 0;
        for(const elem of this.icons)
        {
            if(elem != tp) { continue; }
            sum++;
        }
        return sum;
    }

    async draw(sim:InteractiveExampleSimulator)
    {
        const images = [];
        for(const icon of this.icons)
        {
            const frame = SETS.base[icon].frame;
            const img = sim.getVisualizer().getResource("base").getImageFrameAsResource(frame);
            images.push(img.toHTMLElement());
        }
        return images;
    }
}

class Board
{
    size: Vector2
    grid: Cell[][]

    constructor(size:number, options:string[])
    {
        this.size = new Vector2(size, size);

        const arr:Cell[][] = [];
        for(let x = 0; x < size; x++)
        {
            arr[x] = [];
            for(let y = 0; y < size; y++)
            {
                const pos = new Vector2(x,y);
                arr[x][y] = new Cell(pos, fromArray(options));
            }
        }

        assignGridNeighbors({
            type: GridNeighborType.ALL,
            grid: arr
        })

        const maxCrossedOut = Math.min(0.5*size*size, 5);
        const numCrossedOut = rangeInteger(0, maxCrossedOut);
        const cells = shuffle(arr.flat());
        for(let i = 0; i < numCrossedOut; i++)
        {
            cells.pop().crossedOut = true;
        }
        
        this.grid = arr;
    }

    async draw(sim: InteractiveExampleSimulator, collection:Collection)
    {
        const canvSize = new Vector2(720, 720);
        const ctx = createContext({ size: canvSize, alpha: false });
        const cellSize = canvSize.clone().div(this.size);
        const res = sim.getVisualizer().getResource("base");

        for(let x = 0; x < this.size.x; x++)
        {
            for(let y = 0; y < this.size.y; y++)
            {

                const cell = this.grid[x][y];
                const posGrid = new Vector2(x,y);
                const pos = cellSize.clone().scale(posGrid);
                const posCenter = pos.move(cellSize.clone().scale(0.5));

                const isValidMove = this.isValidMove(cell, collection);

                const rect = new Rectangle({ center: new Vector2(), extents: cellSize });
                const bgColor = isValidMove ? "#AAFFAA" : "#FFFFFF";
                const rectOp = new LayoutOperation({
                    pos: pos,
                    stroke: "#000000",
                    strokeWidth: 4,
                    fill: bgColor
                })

                new ResourceShape(rect).toCanvas(ctx, rectOp);

                const iconAlpha = isValidMove ? 1.0 : 0.66;
                const op = new LayoutOperation({
                    frame: SETS.base[cell.type].frame,
                    pos: posCenter,
                    size: cellSize,
                    pivot: Vector2.CENTER,
                    alpha: iconAlpha
                })

                res.toCanvas(ctx, op);

                if(cell.crossedOut)
                {
                    for(let i = 0; i < 2; i++)
                    {
                        const line = new Line(cellSize.clone().scale(-0.5), cellSize.clone().scale(0.5));
                        const lineOp = new LayoutOperation({
                            stroke: "#444444",
                            strokeWidth: 8,
                            pos: posCenter,
                            rot: i == 0 ? 0 : 0.5*Math.PI
                        })
    
                        new ResourceShape(line).toCanvas(ctx, lineOp);
                    }    
                }
            }
        }

        const canv = ctx.canvas;
        canv.style.width = "100%";
        canv.style.maxWidth = "350px";
        canv.style.margin = "auto";
        canv.style.display = "block";

        return canv;
    }

    isValidMove(cell:Cell, collection:Collection)
    {
        if(cell.crossedOut) { return false; }

        const nbs = cell.getNeighbors();
        for(const nb of nbs)
        {
            let typeLimit = 0;
            if(isApprox(nb.pos.y, cell.pos.y)) { typeLimit = 1; }
            else if(isApprox(nb.pos.x, cell.pos.x)) { typeLimit = 2; }
            else { typeLimit = 3; }

            if(collection.countType(nb.type) >= typeLimit)
            {
                return false;
            }
        }

        return true;
    }
}

const NUM_UNIQUE_ICONS = new Bounds(4,6);
const COLLECTION_BOUNDS = new Bounds(2,3);
const GRID_SIZE = new Bounds(3,4);

const generate = async (sim:InteractiveExampleSimulator) =>
{
    await sim.loadMaterialCustom(getMaterialDataForRulebook(CONFIG));

    const allIcons = Object.keys(SETS.base);
    const allowedIcons = shuffle(allIcons).slice(0, NUM_UNIQUE_ICONS.randomInteger());

    const collection = new Collection(COLLECTION_BOUNDS.randomInteger(), allowedIcons);
    const o = sim.getOutputBuilder();
    console.log(collection.icons.slice());
    o.addParagraph("Your collection looks like this:");
    const collNode = o.addFlexList(await collection.draw(sim));
    collNode.style.height = "100px";

    const board = new Board(GRID_SIZE.randomInteger(), allowedIcons);
    o.addParagraph("This allows you to pick all <strong>green</strong> squares in the image below. (Crossed out squares were already picked on previous turns.)");
    o.addNode(await board.draw(sim, collection));
}

const parseRulebookTableData = (dict:ActionSet) =>
{
    const obj : Record<string,any> = {};
    for(const [key,data] of Object.entries(dict))
    {
        obj[key] = data;
        
        let desc : string = Array.isArray(data.desc) ? data.desc[0] : data.desc;
        desc = desc.replace('<img id="misc" frame="0">', 'points');
        obj[key].desc = desc;
    }

    return obj;
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
        base:
        {
            icons:
            {
                config:
                {
                    sheetURL: CONFIG._resources.files.base.path,
                    sheetWidth: 8,
                    base: CONFIG._resources.base,
                }
            },
            data: parseRulebookTableData(SETS.base)
        },

        advanced:
        {
            icons:
            {
                config:
                {
                    sheetURL: CONFIG._resources.files.advanced.path,
                    sheetWidth: 8,
                    base: CONFIG._resources.base,
                }
            },
            data: parseRulebookTableData(SETS.advanced)
        },

        expert:
        {
            icons:
            {
                config:
                {
                    sheetURL: CONFIG._resources.files.expert.path,
                    sheetWidth: 8,
                    base: CONFIG._resources.base,
                },
            },
            data: parseRulebookTableData(SETS.expert)
        },
    }
}

loadRulebook(CONFIG_RULEBOOK);