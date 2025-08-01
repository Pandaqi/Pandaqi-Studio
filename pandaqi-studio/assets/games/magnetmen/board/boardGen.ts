import BalancedDictionaryPicker from "js/pq_games/tools/generation/balancedDictionaryPicker";
import Point from "js/pq_games/tools/geometry/point";
import shuffle from "js/pq_games/tools/random/shuffle";
import { CONFIG } from "../shared/config";
import BoardState from "./boardState";
import Cell from "./cell";

// Generates a balanced board, then spits out a BoardState object holding it
export default class BoardGen
{
    async generate()
    {
        const size = CONFIG.gen.size[CONFIG.boardSize];

        const typeList = this.determineTypes(size);
        const cells = this.createCells(typeList, size);
        const bs = new BoardState().fromGrid(cells);
        return bs;
    }

    determineTypes(size:Point)
    {
        const numCells = size.x * size.y;

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

    createCells(list:string[], size:Point)
    {
        const arr = [];
        list = shuffle(list.slice());
        let counter = 0;
        for(let x = 0; x < size.x; x++)
        {
            arr[x] = [];
            for(let y = 0; y < size.y; y++)
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