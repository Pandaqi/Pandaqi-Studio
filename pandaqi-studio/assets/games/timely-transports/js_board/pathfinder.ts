class PriorityQueue 
{
	elements: any[];

	constructor() {
		this.elements = [];
	}

	isEmpty() {
		return (this.elements.length == 0);
	}

	put(item, priority) {
		// loop through current list
		let insertIndex = 0;
		while(insertIndex < this.elements.length) {
			if(this.elements[insertIndex][0] >= priority) {
				break;
			}
			insertIndex++;
		}

		// add this element!
		this.elements.splice(insertIndex, 0, [priority, item]);
	}

	get() {
		// remove first element from elements, return it
		return this.elements.shift()[1];
	}
}

function calculateRoute(cfg, map, start, end) {
	let maxWidth = map.length;
	let maxHeight = map[0].length;

	let Q = new PriorityQueue();

	Q.put(start, 0);

	// Maps are fast for searching, need unique values, AND can use an object as the key
	let came_from = new Map();
	let cost_so_far = new Map();
	let tiles_checked = new Map();

	let startLabel = start[0] + "-" + start[1];

	came_from.set(startLabel, null);
	cost_so_far.set(startLabel, 0);

	let reachable = false;

	while( !Q.isEmpty() ) {
		let current = Q.get();

		let currentLabel = current[0] + "-" + current[1]
		tiles_checked.set(currentLabel, true);
    
    	// stop when we've found the first "shortest route" to our destination
        if(current[0] == end[0] && current[1] == end[1]) { 
        	reachable = true; 
        	break; 
        }

        // update all neighbours (to new distance, if run through the current tile)
		let positions = [[-1,0],[1,0],[0,1],[0,-1]];
		for(let a = 0; a < 4; a++) {
			let tempX = current[0] + positions[a][0];
    		let tempY = current[1] + positions[a][1];

    		// skip cells that don't exist (within the grid)
    		if(tempX < 0 || tempX >= maxWidth || tempY < 0 || tempY >= maxHeight) {
    			continue;
    		}

    		let cell = map[tempX][tempY]

    		// don't consider this tile according to rules given in the config
    		// these rules never hold for the end tile (as it's the final in the path, it can be anything)
    		let val = cell.val
    		if(!(tempX == end[0] && tempY == end[1])) {
    			if(val < cfg.minVal || val > cfg.maxVal) {
	    			continue;
	    		}
    		}

    		// nothing can cross a forest (... for now)
    		if(cell.isForest) {
    			continue;
    		}

    		// don't allow ugly boxes!
            // (a rectangle of 4 PATHS, all of the same TYPE)
    		var nbs = [[0,0], [0,-1], [-1,-1], [-1,0]];
    		var isUglyBox = true;
    		for(let n = 0; n < 4; n++) {
    			var x = nbs[n][0], y = nbs[n][1]
    			if(x < 0 || y < 0 || x >= maxWidth || y >= maxHeight) { isUglyBox = false; break; }
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
    		let new_cost = cost_so_far.get(currentLabel) + 1;

    		// get the tile
    		let next = [tempX, tempY];
    		let nextLabel = tempX + "-" + tempY;

    		// if the tile hasn't been visited yet, OR the new cost is lower than the current one, revisit it and save the update!
    		if(!cost_so_far.has(nextLabel) || new_cost < cost_so_far.get(nextLabel) ) {
    			if(tiles_checked.has(nextLabel)) {
    				continue;
    			}

    			// save the lower cost
    			cost_so_far.set(nextLabel, new_cost)

    			// calculate heuristic
    			// 1) Calculate Manhattan distance to target tile
    			let dX = Math.abs(tempX - end[0]);
    			let dY = Math.abs(tempY - end[1]);
    			let heuristic = (dX + dY)

				// 2) Persuade algorithm to stay on the main land (away from (deep) water) if possible (or vice versa)
				if(cfg.terrainType == 'water') {
					heuristic += cell.val*20;
				} else if(cfg.terrainType == 'land') {
					heuristic += (1.0 - cell.val)*20;
				}

				// 3) If this is already part of a path, always move path towards it
				// (so, conversely, if it's NOT part of a path, or it's the wrong path type, move away from it)
				if(cfg.snapToPath) {
					if(!cell.partOfPath) {
						heuristic += 100;
					}
				}

    			// add this tile to the priority queue
    			// 3) Tie-breaker: Add a small number (1.01) to incentivice the algorithm to explore tiles more near the target, instead of at the start
    			let priority = new_cost + heuristic * (1.0 + 0.01);
    			Q.put(next, priority);

    			// save where we came from
    			came_from.set(nextLabel, current)
    		}
		}
	}

	// if it was unreachable, return null
	if(!reachable) {
		return null;
	}

	// reconstruct the path
	let path = []
	let current = end

    while((current[0] != start[0] || current[1] != start[1])) {
        path.push(current)
        current = came_from.get(current[0] + "-" + current[1])
    }

    path.push(start); // add the start position to the path
    path.reverse(); // reverse the array (default goes backwards; the reverse should go forward)

	return path
}

export default calculateRoute