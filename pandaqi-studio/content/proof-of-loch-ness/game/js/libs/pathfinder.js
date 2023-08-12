class PriorityQueue {

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
	// quick reference to map dimensions
	let maxWidth = map.length;
	let maxHeight = map[0].length;

	// initialize all other stuff
	let Q = new PriorityQueue();

	Q.put(start, 0);

	// Maps are fast for searching, need unique values, AND can use an object as the key
	let came_from = new Map();
	let cost_so_far = new Map();
	let tiles_checked = new Map();

	let startLabel = start.x + "-" + start.y;

	came_from.set(startLabel, null);
	cost_so_far.set(startLabel, 0);

	let reachable = false;

	while( !Q.isEmpty() ) {
		let current = Q.get();

		let currentLabel = current.x + "-" + current.y
		tiles_checked.set(currentLabel, true);
    
    	// stop when we've found the first "shortest route" to our destination
        if(current.x == end.x && current.y == end.y) { 
        	reachable = true; 
        	break; 
        }

        // update all neighbours (to new distance, if run through the current tile)
		let positions = [{x:-1,y:0},{x:1,y:0},{x:0,y:1},{x:0,y:-1}];
		for(let a = 0; a < 4; a++) {
			let tempX = current.x + positions[a].x;
    		let tempY = current.y + positions[a].y;

    		// skip cells that don't exist (within the grid)
    		if(tempX < 0 || tempX >= maxWidth || tempY < 0 || tempY >= maxHeight) {
    			continue;
    		}

    		let cell = map[tempX][tempY]

    		// calculate the new cost
    		// movement is always 1 by default
            let move_cost = 1;

            //
            // @TODO: This is the place where we could listen to parameters!
            // (Raise/lower score for preferences, continue the loop if something is forbidden)
            //

    		let new_cost = cost_so_far.get(currentLabel) + move_cost;

    		// get the tile
    		let next = { x: tempX, y: tempY};
    		let nextLabel = tempX + "-" + tempY;

    		// if the tile hasn't been visited yet, OR the new cost is lower than the current one, revisit it and save the update!
    		if(!cost_so_far.has(nextLabel) || new_cost < cost_so_far.get(nextLabel) ) {
    			
                if(tiles_checked.has(nextLabel)) { continue; }

    			// save the lower cost
    			cost_so_far.set(nextLabel, new_cost)

    			// calculate heuristic
    			// 1) Calculate Manhattan distance to target tile
    			let dX = Math.abs(tempX - end.x);
    			let dY = Math.abs(tempY - end.y);
    			let heuristic = (dX + dY)

    			// add this tile to the priority queue
    			// 2) Tie-breaker: Add a small number (1.01) to incentivice the algorithm to explore tiles more near the target, instead of at the start
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

    while(!(current.x == start.x && current.y == start.y)) {
        path.push(current)
        current = came_from.get(current.x + "-" + current.y)
    }

    path.push(start); // add the start position to the path
    path.reverse(); // reverse the array (default goes backwards; the reverse should go forward)

	return path
}