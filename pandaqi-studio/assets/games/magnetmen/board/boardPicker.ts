import { Point } from "js/pq_games/pixi/pixi.mjs";
import BalancedDictionaryPicker from "js/pq_games/tools/generation/balancedDictionaryPicker";
import shuffle from "js/pq_games/tools/random/shuffle";
import { CONFIG } from "../shared/config";
import { SETS } from "../shared/dict";
import BoardState from "./boardState";
import Cell from "./cell";
import BoardDraw from "./boardDraw";

export const boardPicker = () =>
{
    // easy reference for all powers enabled
    let allPowers = {};
    const includedSets = [];
    for(const [setKey,included] of Object.entries(CONFIG.sets))
    {
        if(!included) { continue; }
        const setData = SETS[setKey];
        allPowers = Object.assign(allPowers, setData);
        includedSets.push(setKey);

        for(const [elemKey,data] of Object.entries(setData))
        {
            data.textureKey = setKey;
        }
    }
    CONFIG.allTypes = allPowers;
    console.log(allPowers);

    CONFIG.beginnerMode = includedSets.length <= 1 && includedSets.includes("base");

    // create board state
    const size = CONFIG.generation.size[CONFIG._settings.boardSize.value];

    const typeList = determineTypes(size);
    const cells = createCells(typeList, size);
    const bs = new BoardState().fromGrid(cells);
    return new BoardDraw(bs);
}


const determineTypes = (size:Point) =>
{
    const numCells = size.x * size.y;

    if(Object.keys(CONFIG.allTypes).includes(CONFIG.generation.beginnerDestroyType))
    {
        CONFIG.allTypes[CONFIG.generation.beginnerDestroyType].required = CONFIG.beginnerMode;
    }

    const picker = new BalancedDictionaryPicker(CONFIG.allTypes);
    const numBounds = CONFIG.beginnerMode ? CONFIG.generation.numUniqueTypes.beginner : CONFIG.generation.numUniqueTypes.other;
    picker.pickPossibleTypes(CONFIG, numBounds);

    console.log(picker.typesPossible);
    
    const typeList = picker.getFullTypeList(numCells);
    return typeList;
}

const createCells = (list:string[], size:Point) =>
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