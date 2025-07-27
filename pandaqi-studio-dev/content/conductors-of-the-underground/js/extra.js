/* @TODO: CONFIG GENERATION KEYS if I ever decide to revive this and put it into the system

{{< settings/settings-box type="board" game_title="Conductors of the Underground" >}}
  {{< settings/setting-seed >}}
  {{< settings/setting-enum id="setting-boardType" text="Board type?" values="Simple,Hexagon,Rectangle" valaskey="true" remark="Hexagon boards are more structured and simpler, Rectangle boards are more varied (as there are more options for each route)" >}}
  {{< settings/setting-checkbox id="setting-inkFriendly" text="Ink Friendly?" remark="Removes many decorational elements and turns the board black-and-white." >}}
{{< /settings/settings-box >}}

*/

const BoardGeneration = new Phaser.Class({
    Extends: Phaser.Scene,

    initialize:
    function BoardGeneration()
    {
        Phaser.Scene.call(this, { key: 'boardGeneration' });
    },

    preload: function() {
		this.load.crossOrigin = 'Anonymous';
		this.canvas = this.sys.game.canvas;

		var base = 'assets/';

		this.load.spritesheet('routemarkers', base + 'routemarker_spritesheet.png', { frameWidth: 200, frameHeight: 200 });
		this.load.spritesheet('icons', base + 'icon_spritesheet.png?c=5', { frameWidth: 200, frameHeight: 200 });
		this.load.spritesheet('shapes', base + 'shape_spritesheet.png?c=1', { frameWidth: 200, frameHeight: 200 });

		// perlin noise Phaser 3 plugin (by Rex, as always)
		// returns values between -1 and 1
		this.load.plugin('rexperlinplugin', 'js/phaser_noise.js', true);

		// rounded rectangle Phaser 3 plugin (by Rex)
		this.load.plugin('rexroundrectangleplugin', 'js/phaser_rounded_rect.js', true);
    },

    create: function(config) {
    	this.cfg = {}
		Object.assign(this.cfg, config);

    	// options: 
    	// 1) 'simple' (stations are just one dot, routes merge there)
    	// 2) 'rectangle' (only horizontal, vertical and perfect diagonal), 
    	// 3) 'hexagon' (transforms grid to pretend they are hexagons; all points at equal distance)
    	this.cfg.boardType = this.cfg.boardType || "hexagon";

    	this.cfg.resX = 40;

    	this.cfg.minRouteLength = Math.floor(this.cfg.resX*0.6); // heuristic for minimum route length
    	this.cfg.numRoutes = Math.floor(this.cfg.resX*0.25); // heuristic for number of routes

    	if(this.cfg.boardType == 'simple') {
    		this.cfg.numRoutes = 6;
    		this.cfg.scaleFactor = 2.0;
    		this.cfg.resX = 10;
    		this.cfg.minRouteLength = 5;
    	}

    	if(this.cfg.boardType == 'rectangle' || this.cfg.boardType == 'simple') {
    		this.cfg.cellSizeX = this.cfg.cellSizeY = this.canvas.width / this.cfg.resX;
    		this.cfg.resY = Math.floor(this.canvas.height / this.cfg.cellSizeX);
    	} else if(this.cfg.boardType == 'hexagon') {
    		this.cfg.resX *= 2.0;
    		this.cfg.cellSizeX = this.canvas.width / this.cfg.resX;
    		this.cfg.cellSizeY = Math.sqrt(3) * this.cfg.cellSizeX;

    		this.cfg.resY = Math.floor(this.canvas.height / this.cfg.cellSizeY);
    	}

    	// oX and oY are (half-)offsets, used to center the whole map on the page
    	this.cfg.oX = 0.5*(this.canvas.width - this.cfg.cellSizeX*(this.cfg.resX-1))
    	this.cfg.oY = 0.5*(this.canvas.height - this.cfg.cellSizeY*(this.cfg.resY-1))

    	this.cfg.snapSectionToCheck = 7; // how far to look back when determining the probability of snapping to another route
    	this.cfg.snapProbability = 1.0;

    	this.cfg.stationBatchSize = 3;

    	this.cfg.forbidParallelOwnTrack = true; // check whether a new step would neighbour our own track (and forbid if so)
    	this.cfg.allowRouteSnapping = true; // check whether another road is close by and we can snap to it
    	this.cfg.checkCrossingExceptions = false; // check whether we're crossing another route (and want to run parallel instead)

    	this.cfg.maxDiagonalStationSize = 3;

    	var fontSize = (0.4*Math.max(this.cfg.cellSizeX, this.cfg.cellSizeY)/this.cfg.scaleFactor) + 'px';
   		this.cfg.routeLetterTextConfig = {
   			fontFamily: '"Secular One"',
   			fontSize: fontSize,
		    color: '#FFFFFF',
   		}


    	this.generateBoard();
    	PQ_GAMES.PHASER.convertCanvasToImage(this);
    },

    generateBoard: function() {
    	this.createGrid();
    	this.createRoutes();
    	this.fillNetwork();
    	this.createStations();

    	this.visualizeGame();
    },

    createGrid: function() {
    	this.noise = this.plugins.get('rexperlinplugin').add(this.cfg.seed);
    	this.map = [];

    	var isHexagon = (this.cfg.boardType == 'hexagon');

    	for(var x = 0; x < this.cfg.resX; x++) {
    		this.map[x] = [];

    		for(var y = 0; y < this.cfg.resY; y++) {
    			this.map[x][y] = 
	    			{
	    				x: x,
	    				y: y,
	    				type: 'empty',

	    				routeNum: -1,
	    				routeIndex: -1,

	    				station: null,
	    				stationForbidden: false,

	    				connections: []
	    			};

	    		// hexagon grids invalidate points NOT on a perfect hexagon; alternating between even and odd rows
	    		// (see image I made for clarification, if needed)
	    		if(isHexagon) {
	    			if(y % 2 == 0 && x % 2 == 0) { this.map[x][y].type = 'invalid'; }
	    			else if(y % 2 == 1 && x % 2 == 1) { this.map[x][y].type = 'invalid'; }
	    		}
    		}
    	}
    },

    fillNetwork: function() {
    	// Check if all routes are/can be connected
    	// If not, use pathfinding to create extra routes
    	// If we find loads of empty space (how to check?), also add extra routes
    },

    createStations: function() {
    	this.stations = [];

    	// simple boards don't have external stations; each dot is simply a station on its own
    	if(this.cfg.boardType == 'simple') {
    		return;
    	}

    	const batchSize = this.cfg.stationBatchSize;

    	// step through each line individually
    	for(var i = 0; i < this.routes.length; i++) {
    		var r = this.routes[i];

    		// once every X cells ( = batch size), place a station
    		// the last batch is not necessarily that long, so just end that batch when we're at the last cell
    		// also, ignore all midpoints we encounter (only applicable on hexagonal boards), as they are too close together
    		var curBatch = [];
    		var numMidPoints = 0;
    		for(var a = 0; a < r.length; a++) {
    			curBatch.push(r[a]);

    			if(r[a].midPoint) { numMidPoints++; }

    			if(curBatch.length >= batchSize + numMidPoints || a == (r.length - 1)) {
    				// Look at all batches and count the largest station we can make
    				var station = {}, maxCells = 0, cellList = []
    				var alreadyHasStation = false;

    				for(var b = 0; b < curBatch.length; b++) {
    					var p = curBatch[b]

    					if(this.map[p.x][p.y].station != null) {
    						alreadyHasStation = true;
    						break;
    					}

    					if(this.map[p.x][p.y].stationForbidden) {
    						continue;
    					}

    					var cells = this.getLargestStation(p);

    					if(cells.length > maxCells) {
    						maxCells = cells.length;
    						cellList = cells;
    					}
    				}

    				if(!alreadyHasStation && cellList.length > 0) { 
	    				// Once we've picked the largest station,
	    				// give all cells inside it a reference
	    				for(var c = 0; c < cellList.length; c++) {
	    					var p = cellList[c];

	    					this.map[p.x][p.y].station = station;

	    					var ind = this.map[p.x][p.y].routeIndex;
	    					var num = this.map[p.x][p.y].routeNum;

	    					// also forbid a station directly before or after (if it exists)
	    					if(ind > 0) { 
	    						var prevPos = this.routes[num][ind - 1]
	    						this.map[prevPos.x][prevPos.y].stationForbidden = true 

	    						if(prevPos.midPoint) {
	    							var prevPrevPos = this.routes[num][ind - 2]
	    							this.map[prevPrevPos.x][prevPrevPos.y].stationForbidden = true
	    						}
	    					}

	    					if(ind < this.routes[num].length - 1) { 
	    						var nextPos = this.routes[num][ind + 1]
	    						this.map[nextPos.x][nextPos.y].stationForbidden = true 

	    						if(nextPos.midPoint) {
	    							var nextNextPos = this.routes[num][ind + 2]
	    							this.map[nextNextPos.x][nextNextPos.y].stationForbidden = true
	    						}
	    					}
	    				}

	    				// and add the station to the full list
	    				station.cells = cellList;
	    				this.stations.push(station);
	    			}

    				// finally, empty the batch and reset number of mid points in batch
    				numMidPoints = 0;
    				curBatch = [];
    			}
    		}

    		//
	    	// Always place a dead-end station at the start and end of the line (if they don't already exist)
	    	//
	    	var p = r[0]
	    	if(this.map[p.x][p.y].station == null) { 
	    		var station = { cells: [p] }

	    		this.map[p.x][p.y].station = station;
	    		this.stations.push(station);
	    	}

	    	p = r[r.length - 1]
	    	if(this.map[p.x][p.y].station == null) { 
	    		var station = { cells: [p] }

	    		this.map[p.x][p.y].station = station;
	    		this.stations.push(station);
	    	}
    	}
    },

    getLargestStation: function(p) {
    	// all possible directions into which we can look for neighbouring nodes
    	// (when we do so, we check the inverse as well, which is why we only need half the list)
    	
    	//var options = [[1,0], [1,1], [0,1], [-1,1], [-1, 0], [-1, -1], [0, -1], [1, -1]];

    	// NOTE: Order is important: we prefer orthogonal stations over diagonal ones (more readable, take less space)
    	var options = []

    	if(this.cfg.boardType == 'rectangle') {
    		options = [{ x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: -1, y: 1 }];
    	} else if(this.cfg.boardType == 'hexagon') {
    		options = [{ x: 2, y: 0}, { x: 1, y: 1}, { x: -1, y: 1}]

    		// if we're a midpoint, don't check horizontal stations, but vertical ones
    		if(p.midPoint) {
    			options[0] = { x: 0, y: 1 }
    		}
    	}

    	var maxCells = 0, cellList = null;
    	for(var i = 0; i < options.length; i++) {
    		var o = options[i];

    		// check station in both directions (of same vector; so a line basically with p as the center point)
    		var cells = [p];
    		var forbiddenNums = [this.map[p.x][p.y].routeNum]

    		cells = cells.concat(this.checkStationRecursive(p, o, forbiddenNums));
    		cells = cells.concat(this.checkStationRecursive(p, { x: -o.x, y: -o.y }, forbiddenNums))

    		// diagonal stations are more messy than orthogonal ones (and have more chance to overlap something)
    		// so we only allow them up until a maximum size
    		var tooLongDiagonalStation = (!this.isOrthogonal(o) && cells.length > this.cfg.maxDiagonalStationSize)

    		if(cells.length > maxCells && !tooLongDiagonalStation) {
    			maxCells = cells.length
    			cellList = cells;
    		}
    	}

    	return cellList;
    },

    isOrthogonal: function(o) {
    	var epsilon = 0.05
    	return (Math.abs(o.x) <= epsilon && o.y != 0) || (o.x != 0 && Math.abs(o.y) <= epsilon);
    },

    checkStationRecursive: function(p, dir, forbiddenNums) {
    	var nextP = { x: p.x + dir.x, y: p.y + dir.y }

    	// stop check if we're out of bounds, reach an empty cell, or one of the same route num as ours
    	// (this means we automatically ignore anything on our own route)
    	if(this.outOfBounds(nextP)) { return []; }
    	if(this.isEmpty(nextP) || this.isInvalid(nextP)) { return []; }

    	var obj = this.map[nextP.x][nextP.y]
    	if(obj.station != null) { return []; }
    	if(obj.stationForbidden) { return  []; }
    	if(forbiddenNums.includes( obj.routeNum )) { return []; }

    	// NOTE: single array, passed by reference to BOTH sides of the recursion (normal and inverse)
    	forbiddenNums.push(obj.routeNum);

    	return [nextP].concat(this.checkStationRecursive(nextP, dir, forbiddenNums));
    },

    createRoutes: function() {
    	this.routes = [];

    	var numTries = 0;
    	const maxTries = 200;
    	for(var i = 0; i < this.cfg.numRoutes; i++) {
    		var route = this.performRandomWalk(i);

    		// simply discard any routes that don't fit our criteria
    		// @TODO: In the future, perhaps backtrack to earlier locations, otherwise we waste a lot of computations
    		if(route.length <= this.cfg.minRouteLength) {
    			numTries++;

    			// IMPORTANT! (Forgot to do this, fucked me up for a long time.)
				// this route failed, roll back all changes!
				if(this.cfg.boardType == 'simple') {
					// on simplified boards, we also need to remove ourselves from connection lists
					// NOTE: This must be done BEFORE resetting the values later
					for(var a = 0; a < route.length; a++) {
    					var p = route[a];
    					var num = this.map[p.x][p.y].routeNum;

    					var conns = this.map[p.x][p.y].connections;
    					for(var c = conns.length - 1; c >= 0; c--) {
    						var pos = conns[c]
    						if(pos.routeNum == num) { 
    							conns.splice(c, 1);
    						}
    					}
    				}
				}


				for(var a = 0; a < route.length; a++) {
					var p = route[a];

					this.map[p.x][p.y].type = 'empty';
					this.map[p.x][p.y].routeNum = -1;
					this.map[p.x][p.y].routeIndex = -1;
				}

				// if we still have tries to go, roll back loop as well
    			if(numTries < maxTries) { 
    				i--;
    			}

    			continue;
    		}

    		numTries = 0;
    		this.routes.push(route);
    	}
    },

    getEdgePosByIndex: function(ind) {
    	var edge = Math.floor(ind / this.cfg.numRoutes * 4);
    	var routesPerEdge = Math.ceil(this.cfg.numRoutes / 4);
    	var edgeSection = ind % routesPerEdge;

    	var x, y, invalidPos = false;

    	var numTries = 0;
    	const maxTries = 200;
    	do {
	    	if(edge == 0) {
	    		x = this.cfg.resX-1;
	    		y = (this.cfg.resY-1)/routesPerEdge*(edgeSection + Math.random())
	    	} else if(edge == 2) {
	    		x = 0;
	    		y = (this.cfg.resY-1)/routesPerEdge*(edgeSection + Math.random())
	    	} else if(edge == 1) {
	    		x = (this.cfg.resX-1)/routesPerEdge*(edgeSection + Math.random());
	    		y = this.cfg.resY-1;
	    	} else {
	    		x = (this.cfg.resX-1)/routesPerEdge*(edgeSection + Math.random());
	    		y = 0;
	    	}

	    	invalidPos = !this.isEmpty({ x: Math.floor(x), y: Math.floor(y)});
	    	numTries++;

	    	if(numTries >= maxTries) { break; }
	    } while(invalidPos)

	    if(numTries >= maxTries) { return null; }

    	return { x: Math.floor(x), y: Math.floor(y) }
    },

    markCellAsRoute: function(route, p, num) {
    	var obj = this.map[p.x][p.y]

    	obj.type = 'route';
    	obj.routeNum = num;
    	obj.routeIndex = route.length;

    	route.push(p);
    },

    // @TODO: Simplify this code for determining initial direction of route??
    getDirByStartingPosition: function(pos) {
    	var dir = { x: 0, y: 0 }

    	if(pos.x == 0) { dir.x = 1; }
    	else if(pos.x == this.cfg.resX - 1) { dir.x = -1; }
    	else if(pos.y == 0) { dir.y = 1; }
    	else { dir.y = -1; }

    	return dir;
    },

    performRandomWalk: function(i) {
    	var curPos = this.getEdgePosByIndex(i); //this.getRandomEdgePos();
    	if(curPos == null) { return []; }

    	var route = [];
    	var routeNum = this.routes.length;

    	curPos.snap = false;
    	this.markCellAsRoute(route, curPos, routeNum);

    	var curDir = this.getDirByStartingPosition(curPos);

    	var arrivedAtEdge = false;
    	while(!arrivedAtEdge) {
    		curDir = this.getNextRandomWalkPos(curPos, curDir, routeNum, route);
    		if(curDir == null) { break; }

    		// if we're a hexagon grid, and we want more than one length, also fill in the dots in-between!
    		// @TODO: Allow lengths greater than 2? Is that even needed?
    		if(this.cfg.boardType == 'hexagon') {
    			if(Math.abs(curDir.x) >= 2 || Math.abs(curDir.y) >= 2) {
    				var tPos = { x: curPos.x + 0.5*curDir.x, y: curPos.y + 0.5*curDir.y, snap: false }

    				tPos.midPoint = true;

    				this.markCellAsRoute(route, tPos, routeNum)
    			}
    		}

    		var newPos = { x: curPos.x + curDir.x, y: curPos.y + curDir.y, snap: curDir.snap };

    		// on simple boards, intersections can hold a large number of connections, so keep track of that
    		if(this.cfg.boardType == 'simple') {
    			this.addConnectionSimple(curPos, newPos, routeNum);
    			this.addConnectionSimple(newPos, curPos, routeNum);
    		}

    		curPos = newPos;
    		this.markCellAsRoute(route, curPos, routeNum)
    		arrivedAtEdge = this.isEdgePos(curPos);
    	}

    	return route;
    },

    addConnectionSimple: function(p1, p2, num) {
    	p2.routeNum = num; // save route number on connection, as it's not unique to points anymore!

    	this.map[p1.x][p1.y].connections.push(p2);
    },

    hasConnectionSimple: function(p1, p2) {
    	var cell = this.map[p1.x][p1.y]
    	for(var i = 0; i < cell.connections.length; i++) {
    		var c = cell.connections[i];
    		if(c.x == p2.x && c.y == p2.y) {
    			return true;
    		}
    	}

    	return false;
    },

    isEdgePos: function(p) {
    	return (p.x == 0 || p.x == (this.cfg.resX - 1) || p.y == 0 || p.y == (this.cfg.resY - 1))
    },

    getRandomEdgePos: function() {
    	var x = 0, y = 0, invalidPos = false;
    	do {
    		if(Math.random() <= 0.5) {
    			x = Math.floor(Math.random() * this.cfg.resX);
    			y = 0;
    		} else {
    			x = 0;
    			y = Math.floor(Math.random() * this.cfg.resY);
    		}

    		invalidPos = !this.isEmpty({ x: x, y: y });
    	} while(invalidPos);

    	return { x: x, y: y }
    },

    generateMovementOptions: function(dir) {
		var options = [dir];

		options.push(this.getMovementOption(dir, 1));
		options.push(this.getMovementOption(dir, -1));

		if(this.cfg.boardType == 'simple') {
			options.push(this.getMovementOption(dir, 2));
			options.push(this.getMovementOption(dir, -2));
		}

		return options;
    },

    getMovementOption: function(dir, offset) {
		var angle = Math.atan2(dir.y, dir.x) + offset*0.25*Math.PI;

		// straight up/down edges are NOT allowed on hexagonal board
		if(this.cfg.boardType == 'hexagon') {
			if(angle == 0.5*Math.PI || angle == 1.5*Math.PI) {
				angle += 0.25*Math.PI;
			}
		}

		return { x: this.sign(Math.cos(angle)), y: this.sign(Math.sin(angle)) };
    },

    extendDir: function(dir) {
    	// on hexagon grids, we SKIP a node on straight ( = horizontal) directions, so multiply by 2
    	if(this.cfg.boardType == 'hexagon') {
	    	var angle = Math.atan2(dir.y, dir.x);
	    	if((angle == 0 || angle == Math.PI) && !(Math.abs(dir.x) >= 2 || Math.abs(dir.y) >= 2)) {
	    		return { x: dir.x*2, y: dir.y*2 }
	    	}
	    }

	    // otherwise, just return the original direction
    	return dir;
    },

    hasRoute: function(pos, num) {
    	var cell = this.map[pos.x][pos.y]
    	for(var i = 0; i < cell.connections.length; i++) {
    		var p = cell.connections[i];
    		if(p.routeNum == num) { return true; }
    	}
    	return false;
    },

    getNextRandomWalkPos: function(pos, dir, routeNum, route) {
    	if(this.cfg.boardType == 'simple') {
    		return this.getNextRandomWalkPosSimple(pos, dir, routeNum);
    	} else {
	    	return this.getNextRandomWalkPosRegular(pos, dir, routeNum, route);
	    }
    },

    getNextRandomWalkPosSimple: function(pos, dir, routeNum) {
    	var options = this.generateMovementOptions(dir);

    	var actualOptions = [];
    	for(var i = 0; i < options.length; i++) {
    		var o = options[i]
    		var tPos = { x: pos.x + o.x, y: pos.y + o.y }

    		// can't go to cells out of bounds ...
    		if(this.outOfBounds(tPos)) { continue; }

    		// can't go to stations that already have 3 connections FROM THIS DIRECTION
    		if(this.countOccurencesOfPos(this.map[pos.x][pos.y].connections, tPos) >= 3) { continue; }

    		// can't go to stations where we've already been
    		if(this.hasRoute(tPos, routeNum)) { continue; }

    		// can'tgo parallel to our own track ... 
    		if(this.cfg.forbidParallelOwnTrack && this.hasNeighbourWithRoute(tPos, o, routeNum, false)) { continue; }

    		// if this is a diagonal line, check if it's crossing another diagonal line; forbid that with a certain probability
    		if(this.crossingDiagonalLineSimple(pos, o)) { continue; }

    		actualOptions.push(o);
    	}

    	if(actualOptions.length > 0) {
    		return actualOptions[Math.floor(Math.random() * actualOptions.length)]
    	} else {
    		return null;
    	}
    },

    crossingDiagonalLineSimple: function(pos, dir) {
    	if(this.isOrthogonal(dir)) { return false; }
    			
		var dirLeft = this.getMovementOption(dir, -1);
		var dirRight = this.getMovementOption(dir, 1);

		var posLeft = { x: pos.x + dirLeft.x, y: pos.y + dirLeft.y }
		var posRight = { x: pos.x + dirRight.x, y: pos.y + dirRight.y }

		if(!this.hasConnectionSimple(posLeft, posRight)) { return false; }

    	const crossingForbidProbability = 1.0;
		if(Math.random() > crossingForbidProbability) { return false; }
		
		return true;
    },

    getNextRandomWalkPosRegular: function(pos, dir, routeNum, route) {
    	// var options = [[1,0], [1,1], [0,1], [-1,1], [-1, 0], [-1, -1], [0, -1], [1, -1]];

    	var options = this.generateMovementOptions(dir);

    	var actualOptions = [];
    	var goStraight = false;

    	// determine how many snaps we've had in a row;
    	// probability gets lower with each of them
    	var numSnapsInLastSection = 0;
    	var sectionsToCheck = Math.min(route.length - 1, this.cfg.snapSectionToCheck);
    	for(var i = sectionsToCheck; i >= 0; i--) {
    		if(!route[i].snap) { continue; }
    		numSnapsInLastSection++;
    	}

    	var snapToRoute = -1;
    	var snapProbability = this.cfg.snapProbability / (numSnapsInLastSection + 1);

    	// if we have too many snaps, FORCE a break free
    	// @TODO: Probably better to make this "permanent" => toggle a switch to forcibly NOT snap for X cells
    	if(numSnapsInLastSection >= 0.5*this.cfg.snapSectionToCheck) {
    		snapProbability = 0.0;
    	}

    	var furthestOption = -1;
    	var curFurthestDistance = -Infinity;
    	const moveAwayProbability = 0.2;
    	
    	const goStraightProbability = 0.4;

    	const preventCrossingProbability = 0.85; 

    	const minDistanceToOwnRoute = 5;

    	for(var i = 0; i < options.length; i++) {
    		var o = this.extendDir(options[i])
    		var tPos = { x: pos.x + o.x, y: pos.y + o.y }

    		// can't go to cells out of bounds ...
    		if(this.outOfBounds(tPos)) { continue; }

    		// nor cells that are occupied ...
    		if(!this.isEmpty(tPos)) { continue; }

    		// nor parallel to our own track ... (creates ugly loops, is also nonsensical)
    		if(this.cfg.forbidParallelOwnTrack && this.hasNeighbourWithRoute(tPos, o, routeNum, false)) { continue; }

    		// nor too close to our own track
    		if(this.distanceToOwnRoute(tPos, route, minDistanceToOwnRoute) <= minDistanceToOwnRoute) { continue; }

    		// if possible, favour snapping to an existing route
    		// @TODO: This only does orthogonal snapping (horizontal/vertical), also allow diagonal?
    		if(this.cfg.allowRouteSnapping && this.hasNeighbourWithRoute(tPos, o, routeNum, true)) { 
    			snapToRoute = actualOptions.length;
    		}

    		// favour options that move the most AWAY from our start position
    		// (if probability for this is near 1.0, we almost exclusively get straight diagonal lines)
    		var distToStart = this.distanceToStart(tPos, route)
    		if(distToStart > curFurthestDistance) {
    			curFurthestDistance = distToStart;
    			furthestOption = actualOptions.length;
    		}

    		// otherwise, if possible, favour going straight
    		if(i == 0) { goStraight = true; }

    		// finally, actually ADD the option to the list of possibilities
    		actualOptions.push(o);


    	}

    	// @TODO/IDEA: Prefer lines that go towards the CENTER
    	//				=> (Possibly better) use a noise map to make lines want to go toward high-value areas.
    	// @TODO/IDEA: Don't allow ending line on the same edge as it started
    	//				=> Maybe start each generation with 1 or 2 big lines through the whole board? (Which are "nearly straight".)
    	// @TODO/IDEA: After generation, use pathfinding to connect all loose pieces and add some random extra routes
    	
    	// @TODO/PROBLEM: Whenever there are no good options, also always try to do a parallel move. (Just like we do when crossing.)
    	// @TODO/PROBLEM: Skip the first one in a new batch if we placed a station at the LAST one; we don't want two stations right after each other.

    	// @TODO/PROBLEM: What to do with diagonal stations? They can now simply cross other stations. And they are rarely picked, because they only match 1 out of every 2 parallel routes?

    	// @TODO/PROBLEM: Don't allow two routes to END (at the edge of the board) right next to each other. Looks bad and is mostly useless gameplay-wise.

    	// @TODO/IDEA: maybe, whenever we build a station, immediately DISALLOW the point before/after on the route for any other stations.


    	var newDir = null;
    	if(actualOptions.length > 0) {
    		newDir = actualOptions[Math.floor(Math.random() * actualOptions.length)]
    		
    		if(snapToRoute > -1 && Math.random() <= snapProbability) {
    			newDir = actualOptions[snapToRoute];
    		} else if(furthestOption > -1 && Math.random() <= moveAwayProbability) {
    			newDir = actualOptions[furthestOption]
    			newDir.snap = true;
    		} else if(goStraight && Math.random() <= goStraightProbability) {
    			newDir = actualOptions[0];
    		}
    	} else {
    		return null; 
    	}

    	if(this.cfg.checkCrossingExceptions) {
	    	// if this new line has two existing lines at its sides, it means we are CROSSING a line
	    	// this is usually ugly, so try to run parallel instead
	    	var newAngle = Math.atan2(newDir.y, newDir.x);
	    	var newLineOptions = 
	    	[
	    		{ x: this.sign(Math.cos(newAngle + 0.25*Math.PI)), y: this.sign(Math.sin(newAngle + 0.25*Math.PI)) },
	    		{ x: this.sign(Math.cos(newAngle - 0.25*Math.PI)), y: this.sign(Math.sin(newAngle - 0.25*Math.PI)) }
	    	]

	    	var linesAtSides = [];
    		for(var i = 0; i < 2; i++) {
    			var o = newLineOptions[i];
    			var tPos = { x: pos.x + o.x, y: pos.y + o.y };

    			if(this.outOfBounds(tPos)) { continue; }
    			if(this.map[tPos.x][tPos.y].type != 'empty') { linesAtSides[i] = this.map[tPos.x][tPos.y].routeNum; }
    		}

    		// check which of these dirs is available; if one exists, pick it and overwrite existing direction
    		var atCrossing = (linesAtSides[0] > -1 && (linesAtSides[0] == linesAtSides[1]))
    		if(atCrossing && Math.random() <= preventCrossingProbability) {
		    	var parallelOptions = [ { x: -newDir.y, y: newDir.x}, { x: newDir.y, y: -newDir.x } ]
		    	var actualParallelOptions = [];

    			for(var i = 0; i < 2; i++) {
    				var o = parallelOptions[i];
    				var tPos = { x: pos.x + o.x, y: pos.y + o.y }

    				if(this.outOfBounds(tPos)) { continue; }
    				if(this.map[tPos.x][tPos.y].type != 'empty') { continue; }

    				actualParallelOptions.push(o);
    			}

    			if(actualParallelOptions.length > 0) {
    				newDir = actualParallelOptions[Math.floor(Math.random() * actualParallelOptions.length)];
    				newDir.snap = true;
    			}
    		}
    	}

		return newDir
    },

    sign: function(val) {
    	if(Math.abs(val) <= 0.1) { return 0; }
    	else { return val/Math.abs(val); }
    },

    outOfBounds: function(p) {
    	return (p.x < 0 || p.x >= this.cfg.resX || p.y < 0 || p.y >= this.cfg.resY);
    },

    distanceToOwnRoute: function(p, route, cutoff) {
    	var dist = Infinity;
    	for(var i = (route.length - 2*cutoff); i >= 0; i--) {
    		dist = Math.min(dist, Math.abs(p.x - route[i].x) + Math.abs(p.y - route[i].y));
    	}

    	return dist;
    },

    distanceToStart: function(p, route) {
    	return Math.abs(p.x - route[0].x) + Math.abs(p.y - route[0].y);
    },

    isInvalid: function(p) {
    	return (this.map[p.x][p.y].type == 'invalid');
    },

    isEmpty: function(p) {
    	return (this.map[p.x][p.y].type == 'empty');
    },

    hasNeighbourWithRoute: function(p, dir, num = -1, numForbidden = false) {
    	var nbs = []

    	if(this.cfg.boardType == 'rectangle' || this.cfg.boardType == 'simple') {
    		// @TODO/NOTE: Enabling diagonal mostly makes routes wiggle, instead of following other routes closely
    		nbs = [
	    		{ x:1, y:0 }, { x: 0, y: 1}, { x:-1, y: 0 }, { x: 0, y: -1 }, //orthogonal
	    		{ x:1, y:1 }, { x:-1, y: 1}, { x:-1, y:-1 }, { x: 1, y: -1} //diagonal
    		]
    	} else if(this.cfg.boardType == 'hexagon') {
    		nbs = [
    			{ x: -2, y: 0 }, { x: 2, y: 0 },
    			{ x: 1, y: 1}, { x: -1, y: 1}, { x: -1, y: -1 }, { x: 1, y: -1}
    		]
    	}

    	for(var i = 0; i < nbs.length; i++) {
    		var nb = nbs[i];

    		// don't check where we came from
    		if(nb.x == -dir.x && nb.y == -dir.y) { continue; }

    		var tPos = { x: p.x + nb.x, y: p.y + nb.y }

    		// ignore out of bounds stuff
    		if(this.outOfBounds(tPos)) { continue; }

    		// ignore empty cells
    		if(this.isEmpty(tPos)) { continue; }

    		// if the number is forbidden, ignore any route with that num
    		// otherwise, ignore any route that does NOT have that num
    		var rNum = this.map[tPos.x][tPos.y].routeNum
    		if(numForbidden && rNum == num) { continue; }
    		if(!numForbidden && rNum != num) { continue; }

    		return true;
    	}

    	return false;
    },

   	visualizeGame: function() {
   		if(this.cfg.boardType == 'simple') {
   			this.visualizeGameSimple();
   			return;
   		}

   		const csX = this.cfg.cellSizeX, csY = this.cfg.cellSizeY;
   		const oX = this.cfg.oX, oY = this.cfg.oY;
   		const cs = Math.max(csX, csY);

   		var graphics = this.add.graphics();

   		// determine some random route colors
   		var routeColors = [];
   		for(var i = 0; i < this.routes.length; i++) {
   			routeColors.push( new Phaser.Display.Color(0, 0, 0).random() );
   		}

   		// draw routes
   		var circlesToDraw = [];
   		for(var i = 0; i < this.routes.length; i++) {
   			var l = this.routes[i];

   			// draw a polyline: start at first location, then loop through and keep moving until end
   			// then stroke the whole path
   			graphics.lineStyle(0.5*cs, routeColors[i].color, 1.0);
			graphics.beginPath();

			for(var j = 0; j < l.length; j++) {
				if(j == 0) {
					graphics.moveTo(l[j].x * csX + oX, l[j].y * csY + oY)
				} else {
					graphics.lineTo(l[j].x * csX + oX, l[j].y * csY + oY);										
				}

				circlesToDraw.push( { circ: new Phaser.Geom.Circle(l[j].x * csX + oX, l[j].y*csY + oY, 0.25*cs), pos: l[j], color: routeColors[i] } );
			}

			// only if we want to close it; conenct start to end => graphics.closePath();
			graphics.strokePath();
   		}

   		console.log(this.stations);

   		var textCfg = {
   			fontFamily: 'SciFly',
			fontSize: '24px',
		    color: '#fff',
		    stroke: '#010101',
		    strokeThickness: 3,
   		}

   		for(var i = 0; i < this.stations.length; i++) {
   			var s = this.stations[i];
   			var c = s.cells;

   			if(c.length <= 1) {
   				continue;
   			}

   			// get average (that's where the rounded rectangle is placed)
   			var avg = { x: 0, y: 0}
   			for(var a = 0; a < c.length; a++) {
   				avg.x += c[a].x;
   				avg.y += c[a].y;
   			}

   			avg.x /= c.length;
   			avg.y /= c.length;

   			// get the length of the station 
   			var maxDistance = 0;
   			for(var a = 0; a < c.length; a++) {
   				var dx = (c[a].x - avg.x)*csX, dy = (c[a].y - avg.y)*csY
   				var dist = Math.sqrt(dx*dx + dy*dy);
   				maxDistance = Math.max(maxDistance, dist)
   			}

   			var margin = 0.25
   			maxDistance = Math.ceil((maxDistance + csX) * 2)

   			/*
   			if(this.cfg.boardType == 'rectangle') {
   				maxDistance = Math.ceil((maxDistance + 0.5) * 2)
   			} else if(this.cfg.boardType == 'hexagon') {
   				maxDistance = maxDistance * 2
   			}
   			*/

   			// get the angle of the station
   			var angle = Math.atan2((c[1].y - c[0].y)*csY, (c[1].x - c[0].x)*csX)

   			var rect = this.add.rexRoundRectangle(avg.x * csX + oX, avg.y * csY + oY, maxDistance, cs, 5, 0xFFEEEE);
   			rect.setOrigin(0.5, 0.5);
   			rect.rotation = angle;

   			rect.setStrokeStyle(5, 0x333333, 1.0);
   			//rect.depth = 10;

   			// print station number
   			//var txt = this.add.text(rect.x, rect.y, ''+i, textCfg);
   			//txt.setOrigin(0.5);
   		}

   		var foregroundGraphics = this.add.graphics();

   		for(var i = 0; i < circlesToDraw.length; i++) {
   			var obj = circlesToDraw[i]
   			var color = obj.color.color

   			var multiStation = false;
   			var station = this.map[obj.pos.x][obj.pos.y].station
   			if(station != null) {
   				if(station.cells.length <= 1) {
   					color = obj.color.clone().brighten(75).color
   				} else {
   					multiStation = true;
   				}
   			}

   			if(multiStation) {
		   		foregroundGraphics.fillStyle(color, 1.0);
				foregroundGraphics.fillCircleShape(obj.circ);
   			} else {
   				graphics.fillStyle(color, 1.0);
				graphics.fillCircleShape(obj.circ);
   			}
   		}

   	},

   	visualizeGameSimple: function() {
   		// we need more space between dots on simple games (for clarity), that's what the scaleFactor does
   		const factor = this.cfg.scaleFactor; 

   		const csX = this.cfg.cellSizeX, csY = this.cfg.cellSizeY;
   		const oX = this.cfg.oX, oY = this.cfg.oY;
   		const cs = Math.max(csX, csY);

   		var graphics = this.add.graphics();

   		// dictionary of route colors
   		var routeColors = 
   		[
   			0x57C3E3, 0x5FE871, 0xFECF04, 0xD41A36, 0xC20F90, 0x5D5135, 0xFC9110, 0xB8D932, 
   			0x23589D, 0x049944, 0x1B4839, 0x6C0010, 0x7323FE, 0x1B1810, 0x885D0C, 0x837F12
   		];
   	
   		var foregroundGraphics = this.add.graphics();

			var stationNodes = [];

			const lineWidth = 0.23 / factor, margin = 0.02 / factor;

			for(var x = 0; x < this.cfg.resX; x++) {
				for(var y = 0; y < this.cfg.resY; y++) {
					var cell = this.map[x][y];

					if(cell.connections.length > 0) {
						stationNodes.push({ x: x, y: y });
					}

					// draw connections, but only if they go down/right (otherwise we draw connections double)
					var conns = cell.connections;
					var transferStation = false;
					var routeNums = [];
					for(var i = 0; i < conns.length; i++) {
						var pos = conns[i];

						if(!routeNums.includes(pos.routeNum)) {
							routeNums.push(pos.routeNum);
						}

						if((pos.x < x && pos.y <= y) || pos.y < y) { continue; }

						var numConnectionsToThisNode = this.countOccurencesOfPos(conns, pos);
						var myIndex = this.countOccurencesOfPos(conns, pos, i);
						var vec = { x : pos.x - x, y: pos.y - y }
						var orthoVec = { x: -vec.y, y: vec.x }

						if(numConnectionsToThisNode == 1) {
							offsetVal = 0;
						} else {
							offsetVal = myIndex * (lineWidth + margin) - 0.5 * (numConnectionsToThisNode - 1) * (lineWidth + margin)
						}

						// because diagonals are longer, offsets should shrink to compensate
						// (Why square root of 2? Because that is how much longer the diagonal is, _relative to_ orthogonal connections)
						if(!this.isOrthogonal(vec)) {
							offsetVal /= Math.sqrt(2)
						}

						var offset = { x: orthoVec.x * offsetVal, y: orthoVec.y * offsetVal }
						var line = new Phaser.Geom.Line(
							(x + offset.x)*csX + oX, 
							(y + offset.y)*csY + oY, 
							(pos.x+offset.x)*csX + oX, 
							(pos.y+offset.y)*csY + oY
						);

						graphics.lineStyle(lineWidth*cs, routeColors[pos.routeNum], 1.0);
						graphics.strokeLineShape(line);

						// draw a shape to help recognize lines (and to help colorblind people in this game)
						var shrinkFactor = 0.8;
						var avg = { x: (line.x1 + line.x2)/2, y: (line.y1 + line.y2)/2 }

						var sprite = this.add.sprite(avg.x, avg.y, 'shapes');
						sprite.setFrame(pos.routeNum);
						sprite.displayWidth = sprite.displayHeight = lineWidth*0.8*cs;
						sprite.setOrigin(0.5, 0.5);
					}


					// transfer stations special visuals are off
					/*if(routeNums.length >= 2) {
						transferStation = true;
					}*/

					// give transfer stations (points where multiple routes intersect) a rounded rectangle
					if(transferStation) {
						var rect = this.add.rexRoundRectangle(x * csX + oX, y * csY + oY, 0.8*cs/factor, 0.8*cs/factor, 5, 0xFFEEEE);
		   			rect.setOrigin(0.5, 0.5);
		   			rect.setStrokeStyle(5, 0x333333, 1.0);

					// otherwise draw a tiny dot at empty nodes to show the grid structure (allows drawing new routes during the game)
					} else if(conns.length <= 0) {
						var circ = new Phaser.Geom.Circle(x * csX + oX, y*csY + oY, 0.1*cs/factor);

						graphics.fillStyle(0xCCCCCC, 1.0);
						graphics.fillCircleShape(circ);
					}
				}
			}

			//
			// determine "free spots" around nodes
			// (they are numbered 0->7, according to angle, starting with the usual flat right = 0)
			// (this way, we know _where_ we can place special icons and indicators without obscuring things)
			//
			for(var x = 0; x < this.cfg.resX; x++) {
				for(var y = 0; y < this.cfg.resY; y++) {
					var cell = this.map[x][y];

					cell.openSpotsAround = [0, 1, 2, 3, 4, 5, 6, 7];

					for(var c = 0; c < cell.connections.length; c++) {
						var angle = Math.atan2(cell.connections[c].y - y, cell.connections[c].x - x);

						// bring angle into positive range (and add some epsilon for floating point errors)
						angle += 2*Math.PI + 0.05;

						var angleAsIndex = Math.floor(angle / (2*Math.PI) * 8) % 8;

						var index = cell.openSpotsAround.indexOf(angleAsIndex);
						if(index > -1) { cell.openSpotsAround.splice(index, 1) }
					}
				}
			}

			//
			// determine + visualize start and end points of routes
			//
			for(var i = 0; i < this.routes.length; i++) {
				var r = this.routes[i];
				var start = r[0], end = r[r.length - 1];

				this.map[start.x][start.y].routeStart = true;
				this.map[end.x][end.y].routeStart = true;

				this.placeIconAround(start, 'routeLabel', i, {});
				this.placeIconAround(end, 'routeLabel', i, {});
			}

			//
			// this is needed for drawing a special multi-colored border around nodes that have multiple routes
			//
			for(var i = 0; i < stationNodes.length; i++) {

				// first collect al numbers
				var pos = stationNodes[i];
				var allRouteNums = [];
				var conns = this.map[pos.x][pos.y].connections;
				for(var c = 0; c < conns.length; c++) {
					var num = conns[c].routeNum;
					if(!allRouteNums.includes(num)) {
						allRouteNums.push(num);
					}
				}

				var numUniqueRoutes = allRouteNums.length;

				// then draw the arcs
				var center = { x: pos.x*csX + oX, y: pos.y*csY + oY }
				var radius = 0.4*cs/factor;
				var angleStart, angleEnd;
				for(var n = 0; n < numUniqueRoutes; n++) {
					angleStart = n * (2*Math.PI/numUniqueRoutes); 
					angleEnd = (n+1) * (2*Math.PI/numUniqueRoutes);

					foregroundGraphics.lineStyle(5, routeColors[allRouteNums[n]], 1.0);

				foregroundGraphics.beginPath();
				foregroundGraphics.moveTo(center.x, center.y);

				// I think parameters are: cX, cY, r, angleStart, angleEnd, counter-clockwise?, path from center to edge of arc?
				foregroundGraphics.arc(center.x, center.y, radius, angleStart, angleEnd, false, false);
				// graphics.closePath();

				foregroundGraphics.strokePath();
				}

				// draw a circle ON TOP of this, so we don't see the ugly starting points of the arcs
				var circ = new Phaser.Geom.Circle(center.x, center.y, radius - 0.5*5);

				foregroundGraphics.fillStyle(0xFFFFFF, 1.0);
				foregroundGraphics.fillCircleShape(circ);
			}

			// Give each station a random number of free spots
			for(var i = 0; i < stationNodes.length; i++) {
				var pos = stationNodes[i];
				var cell = this.map[pos.x][pos.y];

				var spotType = 'freeSpot'
				if(cell.routeStart) {
					spotType = 'trainSpot'
				}

				var numFreeSpots = Math.floor(Math.random() * 4)+1;
				for(var a = 0; a < numFreeSpots; a++) {
					this.placeIconAround(pos, spotType, i, {});
					if(cell.openSpotsAround.length <= 0) { break; }
				}
			}

			//
			// generate a list of special icons to place, then place them
			//
			var numSpecialSpots = 10;
			var specialIcons = [];
			var totalIconProb = this.getTotal(ICONS_DICT)
			for(var i = 0; i < numSpecialSpots; i++) {
				var randNode = stationNodes[Math.floor(Math.random() * stationNodes.length)];
				var randType = this.getRandom(ICONS_DICT, totalIconProb)

				this.placeIconAround(randNode, 'special', i, { type: randType });
			}
   	},

   	placeIconAround: function(pos, type, routeNum, params) {
			const cs = Math.max(this.cfg.cellSizeX, this.cfg.cellSizeY);
			const factor = this.cfg.scaleFactor;

			var locations = this.map[pos.x][pos.y].openSpotsAround;

			if(locations.length <= 0) {
				console.log("ERROR! No space for icon!");
				return;
			}

			// pick an available angle, immediately remove it from the original array
			// (so the node knows this space can't be used anymore from now on)
			var angleIndex = locations.splice(Math.floor(Math.random() * locations.length), 1)[0];
			var angle = (angleIndex / 8.0) * 2 * Math.PI;

			// ALSO disallow it on the other side (otherwise we get overlapping markers)
			// but only on orthogonal directions (diagonal has enough space for now)
			// @TODO: TUrn this into a general "disallow icon in direction" function?
			var oppositeVec = { x: Math.cos(angle), y: Math.sin(angle) }
			var oppositePos = { x: pos.x + Math.floor(oppositeVec.x + 0.05), y: pos.y + Math.floor(oppositeVec.y+0.05) }
			if(!this.outOfBounds(oppositePos) && this.isOrthogonal(oppositeVec)) {
				console.log("DISALLOWING OPPOSITE CELL")
				var oppositeCell = this.map[oppositePos.x][oppositePos.y];
				var indx = oppositeCell.openSpotsAround.indexOf((angleIndex + 4) % 8)
				if(indx > -1) { 
					console.log("DISALLOWING OPPOSITE CELL, FOR REAL")
					oppositeCell.openSpotsAround.splice(indx, 1); 
				}
			}

			// determine the spritesheet used for the underlying image of marker
			var key = 'routemarkers'
			var size = 0.8*cs/factor;
			var rad = size + 0.05*cs/factor; // must be outside of nodes + have some margin
			if(type == 'freeSpot') {
				key = 'icons'
				size = 0.5*cs/factor;
				rad = size + 0.25*cs/factor;
			} else if(type == 'trainSpot') {
				key = 'icons';
			}

			var sprite = this.add.sprite(
				pos.x*this.cfg.cellSizeX + Math.cos(angle)*rad + this.cfg.oX, 
				pos.y*this.cfg.cellSizeY + Math.sin(angle)*rad + this.cfg.oY, 
				key
			);

			sprite.displayWidth = sprite.displayHeight = size;
			sprite.setFrame(routeNum);
			sprite.setRotation(angle);
			sprite.setOrigin(0.5, 0.5);

			if(type == 'freeSpot') {
				sprite.setFrame(0);

			} else if(type == 'trainSpot') {
				sprite.setFrame(1);

			} else if(type == 'routeLabel') {
				// @TODO: Make this global; so I don't have to redefine here and waste computational resources
				var routeLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

				var txt = this.add.text(sprite.x, sprite.y, routeLetters.charAt(routeNum), this.cfg.routeLetterTextConfig);
				txt.setOrigin(0.5, 0.5);

			} else if(type == 'number') {
				var txt = this.add.text(sprite.x, sprite.y, params.num, this.cfg.routeLetterTextConfig);
				txt.setOrigin(0.5, 0.5);

			} else if(type == 'special') {
				var specialType = params.type;

				// @TODO: Make a dictionary, select type from that, and convert string to iconFrame

				var specialSprite = this.add.sprite(sprite.x, sprite.y, 'icons');
				specialSprite.displayWidth = specialSprite.displayHeight = sprite.displayWidth;

				specialSprite.setFrame(ICONS_DICT[specialType].iconFrame);
				sprite.setFrame(ICONS_DICT[specialType].routeMarkerFrame);

				specialSprite.setOrigin(0.5, 0.5);
			}
   	},

   	countOccurencesOfPos: function(list, pos, cutoff = -1) {
   		var sum = 0;
   		for(var i = 0; i < list.length; i++) {
   			// if we only want the number of occurences until the cutoff,
   			// return early
   			if(cutoff > -1 && i >= cutoff) {
   				return sum;
   			}

   			if(list[i].x == pos.x && list[i].y == pos.y) {
   				sum++;
   			}
   		}
   		return sum;
   	},

   	getRandom: function(list, total, RNG) {
		const rand = Math.random();

		var sum = 0;
		for(key in list) {
			sum += (list[key].prob / total);

			if(sum >= rand) {
				return key;
			}
		}

		return null;
	},

	getTotal: function(list) {
		var sum = 0;
		for(key in list) {
			sum += list[key].prob;
		}

		return sum;
	},

   	shuffle: function(a) {
	    var j, x, i;
	    for (i = a.length - 1; i > 0; i--) {
	        j = Math.floor(Math.random() * (i + 1));
	        x = a[i];
	        a[i] = a[j];
	        a[j] = x;
	    }

	    return a;
	},
});