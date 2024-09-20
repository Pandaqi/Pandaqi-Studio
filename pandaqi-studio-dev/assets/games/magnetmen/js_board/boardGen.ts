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

        const typeList = this.determineTypes(dims);
        const cells = this.createCells(typeList, dims);
        const bs = new BoardState().fromGrid(cells);
        return bs;
    }

    determineTypes(dims:Point)
    {
        const numCells = dims.x * dims.y;

        if(Object.keys(CONFIG.allTypes).includes(CONFIG.gen.beginnerDestroyType))
        {
            CONFIG.allTypes[CONFIG.gen.beginnerDestroyType].required = CONFIG.beginnerMode;
        }

        const picker = new BalancedDictionaryPicker(CONFIG.allTypes);
        const numBounds = CONFIG.beginnerMode ? CONFIG.gen.numUniqueTypes.beginner : CONFIG.gen.numUniqueTypes.other;
        picker.pickPossibleTypes(CONFIG, numBounds);

        console.log(picker.typesPossible);
        
        const typeList = picker.getFullTypeList(numCells);
        return typeList;
    }

    createCells(list:string[], dims:Point)
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