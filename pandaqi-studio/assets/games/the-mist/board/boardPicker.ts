import BalancedDictionaryPicker from "js/pq_games/tools/generation/balancedDictionaryPicker";
import { CONFIG } from "../shared/config";
import { SETS } from "../shared/dict";
import BoardDraw from "./boardDraw";
import BoardState from "./boardState";
import Evaluator from "./evaluator";
import shuffle from "js/pq_games/tools/random/shuffle";
import Cell from "./cell";
import fromArray from "js/pq_games/tools/random/fromArray";
import Bounds from "js/pq_games/tools/numbers/bounds";
import assignGridNeighbors, { GridNeighborType } from "js/pq_games/tools/graphs/assignGridNeighbors";
import numberRange from "js/pq_games/tools/collections/numberRange";
import FloodFiller from "js/pq_games/tools/generation/floodFiller";
import Point from "js/pq_games/tools/geometry/point";

export const boardPicker = () =>
{
    // create master dict of ALL included powers + their texture for displaying
    let allPowers = {};
    const setsIncluded = [];
    const sets = Object.keys(CONFIG._settings.sets);
    for(const setKey of sets)
    {
        const isIncluded = CONFIG._settings.sets[setKey].value;
        if(!isIncluded) { continue; }
        const setData = SETS[setKey];
        setsIncluded.push(setKey);
        allPowers = Object.assign(allPowers, setData);

        for(const [elemKey,data] of Object.entries(setData))
        {
            data.textureKey = setKey;
        }
    }
    CONFIG.allTypes = allPowers;
    CONFIG.inSimpleMode = setsIncluded.length <= 1 && setsIncluded.includes("base");
    console.log(allPowers);

    // prepare and cache whatever we can
    const size = CONFIG.generation.size[CONFIG._settings.boardSize.value];
    const iconDistribution = determineIconDistribution(size);
    const cells = createCells(size, iconDistribution);
    assignTypes(cells);
    pickStartingPositions(cells, size);

    // keep re-generating until the evaluator calls it good enough
    const ev = new Evaluator();
    let bs:BoardState;
    do {
        bs = new BoardState().fromGrid(cells);
    } while(!ev.isValid(bs));

    // hand off the thing to be drawn later
    return new BoardDraw(bs);
}

const determineIconDistribution = (size:Point) =>
{
    const numCells = size.x * size.y;
    const distBounds = CONFIG.generation.numIconsPerCell;
    const dist = [];
    for(const [num, bounds] of Object.entries(distBounds))
    {
        const freq = Math.ceil(bounds.random() * numCells);
        for(let i = 0; i < freq; i++)
        {
            dist.push(parseInt(num));
        }
    }

    const defaultNum = CONFIG.generation.defNumIconsPerCell;
    const cellsLeft = numCells - dist.length;
    for(let i = 0; i < cellsLeft; i++)
    {
        dist.push(defaultNum)
    }

    return dist;
}

const assignTypes = (grid:Cell[][]) =>
{
    // first, pick all the exact types we'll use
    const cells = shuffle(grid.flat());
    let totalTypesNeeded = 0;
    for(const cell of cells)
    {
        totalTypesNeeded += cell.num;
    }

    // @EXCEPTION: in simple mode, we REQUIRE boots (as it's needed to make movement way more flexible)
    // Otherwise, well, we simply don't.
    if(Object.keys(CONFIG.allTypes).includes("boots"))
    {
        // @ts-ignore
        CONFIG.allTypes.boots.required = CONFIG.inSimpleMode;
    }

    const picker = new BalancedDictionaryPicker(CONFIG.allTypes);
    picker.pickPossibleTypes(CONFIG, CONFIG.generation.numUniqueTypes);        
    const typeList = picker.getFullTypeList(totalTypesNeeded);
    shuffle(typeList);

    // determine how many each type has
    const numPerType:Record<string,number> = {};
    for(const type of typeList)
    {
        if(!(type in numPerType)) { numPerType[type] = 0; }
        numPerType[type]++;
    }

    // so we can do flood-fill placement on terraform things
    // and other prepass generation on types that need it
    for(const [type, freq] of Object.entries(numPerType))
    {
        const data = CONFIG.allTypes[type];
        const prePass = data.prePass;
        if(!prePass) { continue; }

        let numWanted;
        let numPlaced = 0;
        if(prePass == "floodfill") 
        {
            numWanted = freq;
            
            const minGroupSize = 4;
            let numLeft = numWanted;
            const possibleStartingCells = cells.slice();
            while(numPlaced < numWanted && numLeft > minGroupSize && possibleStartingCells.length > 3)
            {
                const maxSize = Math.min(10, numWanted);
                const minSize = Math.max(Math.round(0.5*maxSize), minGroupSize);

                // @TODO: rewrite to new function-based floodfill
                const f = new FloodFiller();
                const group = f.grow({
                    start: fromArray(possibleStartingCells),
                    neighborFunction: "getNeighbors",
                    filter: (cell, nb) => { return nb.hasFreeSpace() && !nb.hasIcon(type); },
                    bounds: new Bounds(minSize, maxSize)
                })

                if(group.length < minGroupSize) { continue; }

                for(const elem of group)
                {
                    elem.addIcon(type);
                    possibleStartingCells.splice(possibleStartingCells.indexOf(elem), 1);
                }

                numLeft -= group.length;
                numPlaced += group.length;
            }

        } else if(prePass == "chain") {
            numWanted = Math.min(freq, 20);

            let curChain = [];
            const maxChainLength = 7;
            let lastSquare = null;
            while(numPlaced < numWanted)
            {
                if(!lastSquare)
                {
                    lastSquare = fromArray(cells);
                    lastSquare.addIcon(type);
                    curChain = [lastSquare];
                    numPlaced++;
                }
                
                const nbs = getNeighborsUnvisited(lastSquare, curChain);
                if(nbs.length <= 0) { lastSquare = null; continue; }

                const newSquare = fromArray(nbs);
                curChain.push(newSquare);
                lastSquare = newSquare;
                lastSquare.addIcon(type);
                numPlaced++;

                const chainIsLongEnough = curChain.length > maxChainLength;
                if(chainIsLongEnough) { lastSquare = null; continue; }
            }

        } else if(prePass == "rowcol") {

            const gridDims = Math.min(grid.length, grid[0].length);

            numWanted = Math.min(freq, gridDims);
            
            // @TODO: check if already full? Or just not care about that?
            const cols = shuffle(numberRange(0,gridDims-1));
            const rows = shuffle(numberRange(0,gridDims-1));
            for(let i = 0; i < numWanted; i++)
            {
                const cell = grid[cols[i]][rows[i]];
                if(!cell.hasFreeSpace()) { continue; }
                cell.addIcon(type);
                numPlaced++;
            }

        }


        // for anything we already placed, remove it from the options of course
        for(let i = 0; i < numPlaced; i++)
        {
            typeList.splice(typeList.indexOf(type), 1);
        }
    }

    // finally, fill up the rest of the cells, picking UNIQUE icons whenever possible
    for(const cell of cells)
    {
        const numIconsNeeded = cell.numIconsNeeded();
        for(let i = 0; i < numIconsNeeded; i++)
        {
            const newIcon = findNextValidIcon(cell.icons, typeList);
            cell.addIcon(newIcon);
            typeList.splice(typeList.indexOf(newIcon), 1);
        }
    }
}

const getNeighborsUnvisited = (cell:Cell, visited:Cell[]) =>
{
    const nbs = cell.getNeighbors();
    const arr = [];
    for(const nb of nbs)
    {
        if(visited.includes(nb)) { continue; }
        arr.push(nb);
    }
    return arr;
}

const findNextValidIcon = (current:string[], options:string[]) =>
{
    for(const option of options)
    {
        if(current.includes(option)) { continue; }
        return option;
    }
    return options[0];
}

const createCells = (size:Point, list:number[]) =>
{
    const arr = [];
    list = shuffle(list.slice());
    let counter = 0;
    for(let x = 0; x < size.x; x++)
    {
        arr[x] = [];
        for(let y = 0; y < size.y; y++)
        {
            const numIcons = list[counter];
            const cell = new Cell(new Point(x,y), numIcons);
            arr[x].push(cell);
            counter++;
        }
    }

    console.log(arr);

    assignGridNeighbors({
        type: GridNeighborType.ORTHOGONAL,
        grid: arr
    })

    return arr;
}

const getDistToEdge = (cell:Cell, size:Point) : number =>
{
    const xDist = Math.min(cell.pos.x, size.x - 1 - cell.pos.x);
    const yDist = Math.min(cell.pos.y, size.y - 1 - cell.pos.y);
    return xDist + yDist;
}

const getDistToCells = (cell:Cell, list:Cell[]) : number =>
{
    let minDist = Infinity;
    for(const otherCell of list)
    {
        const xDist = Math.abs(cell.pos.x - otherCell.pos.x);
        const yDist = Math.abs(cell.pos.y - otherCell.pos.y);
        minDist = Math.min(xDist + yDist, minDist);
    }
    return minDist;
}

const pickStartingPositions = (grid:Cell[][], size:Point) =>
{
    const cells = shuffle(grid.flat());
    
    // pick any random first starting position
    const baseCell = cells.pop();
    const baseDistToEdge = getDistToEdge(baseCell, size);

    // select all other options with roughly equal distance to edge + enough icons for choice at start
    // (it's the most limiting / deciding factor)
    const options = [];
    const optionsLoose = [];
    const minIcons = CONFIG.generation.minIconsForStartingPosition;
    const maxError = CONFIG.generation.maxStartingPositionEdgeDistError;
    for(const cell of cells)
    {
        const distToEdge = getDistToEdge(cell, size);
        const diff = Math.abs(distToEdge - baseDistToEdge);
        if(diff > 2*maxError) { continue; }
        optionsLoose.push(cell);
        if(diff > maxError) { continue; }
        if(cell.countIcons() < minIcons) { continue; }
        options.push(cell);
    }

    // pick randomly from those, keeping a minimum distance
    const minDistRequired = Math.floor(Math.min(size.x, size.y) * 0.5);
    const startingPositions : Cell[] = [baseCell];
    shuffle(optionsLoose);
    for(const option of options)
    {
        const minDist = getDistToCells(option, startingPositions);
        if(minDist < minDistRequired) { continue; }
        startingPositions.push(option);
        optionsLoose.splice(optionsLoose.indexOf(option), 1);
    }

    // if it EVER happens that this doesn't yield enough options, just fill up with random options that are more "looose"
    const playerCount = CONFIG.generation.maxNumPlayers;
    while(startingPositions.length < playerCount)
    {
        startingPositions.push(optionsLoose.pop());
    }

    // then just convert the selected cells
    for(let i = 0; i < playerCount; i++)
    {
        startingPositions[i].makeStartingPosition();
    }
}