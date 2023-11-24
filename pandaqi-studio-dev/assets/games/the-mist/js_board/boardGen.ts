import BalancedDictionaryPicker from "js/pq_games/tools/generation/balancedDictionaryPicker";
import BoardState from "./boardState";
import { SETS } from "../js_shared/dict";
import CONFIG from "../js_shared/config";
import Point from "js/pq_games/tools/geometry/point";
import Cell from "./cell";
import shuffle from "js/pq_games/tools/random/shuffle";

// Generates a balanced board, then spits out a BoardState object holding it
export default class BoardGen
{
    async generate()
    {
        const dims = CONFIG.gen.dims[CONFIG.boardSize];

        const iconDistribution = this.determineIconDistribution(dims);
        const cells = this.createCells(dims, iconDistribution);
        this.assignTypes(cells.flat());
        
        const bs = new BoardState().fromGrid(cells);
        return bs;
    }

    determineIconDistribution(dims:Point)
    {
        const numCells = dims.x * dims.y;
        const distBounds = CONFIG.gen.numIconsPerCell;
        const dist = [];
        for(const [num, bounds] of Object.entries(distBounds))
        {
            const freq = bounds.randomInteger();
            for(let i = 0; i < freq; i++)
            {
                dist.push(num);
            }
        }

        const defaultNum = CONFIG.gen.defNumIconsPerCell;
        const cellsLeft = numCells - dist.length;
        for(let i = 0; i < cellsLeft; i++)
        {
            dist.push(defaultNum)
        }

        return dist;
    }

    assignTypes(cells:Cell[])
    {
        let totalTypesNeeded = 0;
        for(const cell of cells)
        {
            totalTypesNeeded += cell.num;
        }

        const picker = new BalancedDictionaryPicker(CONFIG.allTypes);
        picker.pickPossibleTypes(CONFIG, CONFIG.gen.numUniqueTypes);        
        const typeList = picker.getFullTypeList(totalTypesNeeded);
        shuffle(typeList);

        for(const cell of cells)
        {
            cell.icons = typeList.slice(0, cell.num);
        }
    }

    createCells(dims:Point, list:number[])
    {
        const arr = [];
        list = shuffle(list.slice());
        let counter = 0;
        for(let x = 0; x < dims.x; x++)
        {
            arr[x] = [];
            for(let y = 0; y < dims.y; y++)
            {
                const elem = list[counter];
                const cell = new Cell(new Point(x,y), elem);
                arr[x].push(cell);
                counter++;
            }
            
        }
        return arr;
    }
}