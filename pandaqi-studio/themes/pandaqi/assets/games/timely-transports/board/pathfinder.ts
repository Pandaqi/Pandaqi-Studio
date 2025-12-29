
import { Vector2 } from "lib/pq-games";
import { TerrainType } from "../shared/dict";

interface PriorityItem
{
	item: Vector2,
	priority: number
}

class PriorityQueue 
{
	elements: PriorityItem[];

	constructor() 
	{
		this.elements = [];
	}

	isEmpty() 
	{
		return (this.elements.length == 0);
	}

	put(item:Vector2, priority) 
	{
		// loop through current list
		let insertIndex = 0;
		while(insertIndex < this.elements.length) {
			if(this.elements[insertIndex].priority >= priority) {
				break;
			}
			insertIndex++;
		}

		// add this element!
		this.elements.splice(insertIndex, 0, { item: item, priority: priority });
	}

	get() : Vector2
	{
		// remove first element from elements, return it
		return this.elements.shift().item;
	}
}

const getLabel = (pos:Vector2) : string => { return pos.x + "-" + pos.y }
const outOfBounds = (pos:Vector2, size:Vector2) : boolean =>
{
	return (pos.x < 0 || pos.x >= size.x || pos.y < 0 || pos.y >= size.y);
}

function calculateRoute(cfg:Record<string,any>, map, start:Vector2, end:Vector2) 
{
	const Q = new PriorityQueue();
	Q.put(start, 0);

	// Maps are fast for searching, need unique values, AND can use an object as the key
	const cameFrom = new Map();
	const costSoFar = new Map();
	const tilesChecked = new Map();

	const startLabel = getLabel(start);

	cameFrom.set(startLabel, null);
	costSoFar.set(startLabel, 0);

	let reachable = false;
	const maxSize = new Vector2(map.length, map[0].length);

	while( !Q.isEmpty() ) 
	{
		let current = Q.get();
		let currentLabel = getLabel(current);
		tilesChecked.set(currentLabel, true);
    
    	// stop when we've found the first "shortest route" to our destination
		const currentPositionIsEndPosition = current.matches(end);
        if(currentPositionIsEndPosition) 
		{ 
        	reachable = true; 
        	break; 
        }

        // update all neighbours (to new distance, if run through the current tile)
		let positions = [[-1,0],[1,0],[0,1],[0,-1]];
		for(let a = 0; a < 4; a++) 
		{
			const tempPos = new Vector2(current.x + positions[a][0], current.y + positions[a][1]);

    		// skip cells that don't exist (within the grid)
			if(outOfBounds(tempPos, maxSize)) { continue; }

    		const cell = map[tempPos.x][tempPos.y]

    		// don't consider this tile according to rules given in the config
    		// these rules never hold for the end tile (as it's the final in the path, it can be anything)
    		const val = cell.val
    		if(!(tempPos.x == end.x && tempPos.y == end.y)) {
    			if(val < cfg.minVal || val > cfg.maxVal) {
	    			continue;
	    		}
    		}

    		// nothing can cross a forest (... for now)
    		if(cell.isForest) { continue; }

    		// don't allow ugly boxes!
            // (a rectangle of 4 PATHS, all of the same TYPE)
    		const nbs = [[0,0], [0,-1], [-1,-1], [-1,0]];
    		let isUglyBox = true;
    		for(let n = 0; n < 4; n++) {
    			const x = nbs[n][0], y = nbs[n][1]
				const ubPos = new Vector2(x,y);
    			if(outOfBounds(ubPos, maxSize)) { isUglyBox = false; break; }
    			if(!map[x][y].partOfPath || !map[x][y].pathTypes.includes(cfg.pathType)) {
    				isUglyBox = false;
    				break;
    			}
    		}

            if(isUglyBox) { continue; }

    		// disallow crossing paths  of different types (only some of the time)
    		// WHY? this prevents railroads + regular roads overlapping all the time!
    		// Sometimes we DO allow some short overlaps
    		if(cell.partOfPath && !cell.pathTypes.includes(cfg.pathType)) {
    			if(!cfg.allowOverlap) {
                    continue;
                }
    		}

    		// Was used for disallowing crossing paths => does nothing now
			// if(cell.partOfPath && cell.pathType != cfg.pathType) {
			// 	continue;
			// }

    		// calculate the new cost
    		// movement is always 1, in our world 
    		let newCost = costSoFar.get(currentLabel) + 1;

    		// get the tile
    		let next = tempPos.clone();
    		let nextLabel = getLabel(next);

    		// if the tile hasn't been visited yet, OR the new cost is lower than the current one, revisit it and save the update!
    		if(!costSoFar.has(nextLabel) || newCost < costSoFar.get(nextLabel) ) 
			{
    			if(tilesChecked.has(nextLabel)) { continue; } // no endless cycles

    			// save the lower cost
    			costSoFar.set(nextLabel, newCost)

    			// calculate heuristic
    			// 1) Calculate Manhattan distance to target tile
    			let dX = Math.abs(next.x - end.x);
    			let dY = Math.abs(next.y - end.y);
    			let heuristic = (dX + dY)

				// 2) Persuade algorithm to stay on the main land (away from (deep) water) if possible (or vice versa)
				if(cfg.terrainType == TerrainType.WATER) {
					heuristic += cell.val*20;
				} else if(cfg.terrainType == TerrainType.LAND) {
					heuristic += (1.0 - cell.val)*20;
				}

				// 3) If this is already part of a path, always move path towards it
				// (so, conversely, if it's NOT part of a path, or it's the wrong path type, move away from it)
				if(cfg.snapToPath && !cell.partOfPath) 
				{
					heuristic += 100;
				}

    			// add this tile to the priority queue
    			// 3) Tie-breaker: Add a small number (1.01) to incentivice the algorithm to explore tiles more near the target, instead of at the start
    			const priority = newCost + heuristic * (1.0 + 0.01);
    			Q.put(next, priority);

    			// save where we came from
    			cameFrom.set(nextLabel, current)
    		}
		}
	}

	// if it was unreachable, return null
	if(!reachable) { return null; }

	// reconstruct the path
	const path = []
	let current = end
    while(!current.matches(start)) {
        path.push(current)
        current = cameFrom.get(getLabel(current))
    }

    path.push(start); // add the start position to the path
    path.reverse(); // reverse the array (default goes backwards; the reverse should go forward)

	return path
}

export default calculateRoute