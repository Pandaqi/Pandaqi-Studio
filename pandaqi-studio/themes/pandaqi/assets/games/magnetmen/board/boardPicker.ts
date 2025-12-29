
import { CONFIG } from "../shared/config";
import { SETS } from "../shared/dict";
import BoardState from "./boardState";
import Cell from "./cell";
import BoardDraw from "./boardDraw";
import { Vector2, BalancedDictionaryPicker, shuffle } from "lib/pq-games";

export const boardPicker = () =>
{
    // easy reference for all powers enabled
    let allPowers = {};
    const includedSets = [];
    for(const [setKey,setConfig] of Object.entries(CONFIG._settings.sets))
    {
        if(!setConfig.value) { continue; }
        
        const included = setConfig.value == true;
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


const determineTypes = (size:Vector2) =>
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

const createCells = (list:string[], size:Vector2) =>
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
            const cell = new Cell(new Vector2(x,y), elem);
            arr[x].push(cell);
            counter++;
        }
        
    }
    return arr;
}