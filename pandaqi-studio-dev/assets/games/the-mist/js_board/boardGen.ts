import BalancedDictionaryPicker from "js/pq_games/tools/generation/balancedDictionaryPicker";
import BoardState from "./boardState";
import { SETS } from "../js_shared/dict";
import CONFIG from "../js_shared/config";
import Point from "js/pq_games/tools/geometry/point";
import Cell from "./cell";
import shuffle from "js/pq_games/tools/random/shuffle";
import numberRange from "js/pq_games/tools/collections/numberRange";
import fromArray from "js/pq_games/tools/random/fromArray";
import assignGridNeighbors, { GridNeighborType } from "js/pq_games/tools/graphs/assignGridNeighbors";
import FloodFiller from "js/pq_games/tools/generation/floodFiller";
import Bounds from "js/pq_games/tools/numbers/bounds";
import rangeInteger from "js/pq_games/tools/random/rangeInteger";

// Generates a balanced board, then spits out a BoardState object holding it
export default class BoardGen
{
    async generate()
    {
        const dims = CONFIG.gen.dims[CONFIG.boardSize];

        const iconDistribution = this.determineIconDistribution(dims);
        const cells = this.createCells(dims, iconDistribution);
        this.assignTypes(cells);
        this.pickStartingPositions(cells, dims);
        
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
            const freq = Math.ceil(bounds.random() * numCells);
            for(let i = 0; i < freq; i++)
            {
                dist.push(parseInt(num));
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

    assignTypes(grid:Cell[][])
    {
        // first, pick all the exact types we'll use
        const cells = shuffle(grid.flat());
        let totalTypesNeeded = 0;
        for(const cell of cells)
        {
            totalTypesNeeded += cell.num;
        }

        const picker = new BalancedDictionaryPicker(CONFIG.allTypes);
        picker.pickPossibleTypes(CONFIG, CONFIG.gen.numUniqueTypes);        
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
                    
                    const nbs = this.getNeighborsUnvisited(lastSquare, curChain);
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
                const newIcon = this.findNextValidIcon(cell.icons, typeList);
                cell.addIcon(newIcon);
                typeList.splice(typeList.indexOf(newIcon), 1);
            }
        }
    }

    getNeighborsUnvisited(cell:Cell, visited:Cell[])
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

    findNextValidIcon(current:string[], options:string[])
    {
        for(const option of options)
        {
            if(current.includes(option)) { continue; }
            return option;
        }
        return options[0];
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

    getDistToEdge(cell:Cell, dims:Point) : number
    {
        const xDist = Math.min(cell.pos.x, dims.x - 1 - cell.pos.x);
        const yDist = Math.min(cell.pos.y, dims.y - 1 - cell.pos.y);
        return xDist + yDist;
    }

    getDistToCells(cell:Cell, list:Cell[]) : number
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

    pickStartingPositions(grid:Cell[][], dims:Point)
    {
        const cells = shuffle(grid.flat());
        
        // pick any random first starting position
        const baseCell = cells.pop();
        const baseDistToEdge = this.getDistToEdge(baseCell, dims);

        // select all other options with roughly equal distance to edge + enough icons for choice at start
        // (it's the most limiting / deciding factor)
        const options = [];
        const optionsLoose = [];
        const minIcons = CONFIG.gen.minIconsForStartingPosition;
        const maxError = CONFIG.gen.maxStartingPositionEdgeDistError;
        for(const cell of cells)
        {
            const distToEdge = this.getDistToEdge(cell, dims);
            const diff = Math.abs(distToEdge - baseDistToEdge);
            if(diff > 2*maxError) { continue; }
            optionsLoose.push(cell);
            if(diff > maxError) { continue; }
            if(cell.countIcons() < minIcons) { continue; }
            options.push(cell);
        }

        // pick randomly from those, keeping a minimum distance
        const minDistRequired = Math.floor(Math.min(dims.x, dims.y) * 0.5);
        const startingPositions : Cell[] = [baseCell];
        shuffle(optionsLoose);
        for(const option of options)
        {
            const minDist = this.getDistToCells(option, startingPositions);
            if(minDist < minDistRequired) { continue; }
            startingPositions.push(option);
            optionsLoose.splice(optionsLoose.indexOf(option), 1);
        }

        // if it EVER happens that this doesn't yield enough options, just fill up with random options that are more "looose"
        const playerCount = CONFIG.gen.maxNumPlayers;
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
}