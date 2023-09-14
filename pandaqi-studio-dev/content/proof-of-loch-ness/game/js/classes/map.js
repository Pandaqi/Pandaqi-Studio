class GameMap {
	
	constructor(w, h) {
		this.w = w;
		this.h = h;

		this.seed;

		this.edges = {
			'h': null,
			'v': null,
		}

		this.map = null;

		this.scn = null;
		this.mon = null;
		this.generalTerrain = null;
	}

	/* SEEDING & TERRAIN */
	getRandomSeed(length) {
	   var result           = '';
	   var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	   var charactersLength = characters.length;
	   for ( var i = 0; i < length; i++ ) {
	      result += characters.charAt(Math.floor(Math.random() * charactersLength));
	   }
	   return result;
	}

	createSeed() {
		if(cfg.seed == null || cfg.seed.length <= 0) { cfg.seed = this.getRandomSeed(6); }

		this.seed = PQ_GAMES.TOOLS.random.seedRandom(cfg.seed);
	}

	getCurrentSeed() {
		return this.seed;
	}

	modifyForPerlin(val, y = false) {
		var cs = cfg.cellSizeX;
		if(y) { cs = cfg.cellSizeY; }

		val *= (cs / cfg.noiseZoom);

		var epsilon = 0.0002
		if(Math.abs(Math.round(val) - val) <= epsilon) {
			val += epsilon*2;
		}

		return val;
	}

	sampleNoise(x, y, noiseConfig = null) {
		if(cfg.noiseFunction == "cubic") {
			return cubicNoiseSample2(noiseConfig, x, y)*2 - 1;

		} else if(cfg.noiseFunction == "perlin") {
			x = this.modifyForPerlin(x);
			y = this.modifyForPerlin(y, true);

			return noise.perlin2(x+0.5, y+0.5);

		} else if(cfg.noiseFunction == "simplex") {
			x = this.modifyForPerlin(x);
			y = this.modifyForPerlin(y, true);

			return noise.simplex2(x+0.5,y+0.5);
		}
	}

	/* INITIALIZATION (create map, fill it out with stuff) */
	initialize() {
		this.createSeed();

		this.scn = SCENARIOS[cfg.scenario];
		this.mon = MONSTERS[cfg.monster];
		this.generalTerrain = this.mon.terrain.type;
		this.trn = TERRAINS[this.generalTerrain];

		this.createBaseMap();
		this.createEdges();
		this.createOverlayTerrain();
		this.placeSources();
		this.placeHideout();
	}

	createBaseMap() {
		//
		// first lay down the groundwork: water, land, mountains
		//
		var terrainSeed = this.seed();
		var noiseConfig = cubicNoiseConfig(terrainSeed);
		if(cfg.noiseFunction == 'perlin' || cfg.noiseFunction == 'simplex') {
			noiseConfig = noise.seed(terrainSeed);
		}

		this.map = [];

		var waterLine = this.trn.waterLine, mountainLine = this.trn.mountainLine, grassLine = this.trn.grassLine;

		for(var x = 0; x < cfg.width; x++) {
			this.map[x] = [];
			for(var y = 0; y < cfg.height; y++) {
				var terrain = this.sampleNoise(x, y, noiseConfig);
				var c = new Cell({ x: x, y: y });

				switch(this.generalTerrain) {
					case 'lake':
						c.setTerrain('water');
						break;

					case 'desert':
						c.setTerrain('sand');
						break;

					case 'grassland':
						c.setTerrain('grass');
						break;

					case 'forest':
						if(terrain < waterLine) {
							c.setTerrain('water');
						} else {
							c.setTerrain('grass');
						}
						break;

					case 'rainforest':
						if(terrain < waterLine)  {
							c.setTerrain('water');
						} else {
							c.setTerrain('grass_rainforest');
						}
						break;

					case 'swamp':
						if(terrain < waterLine) {
							c.setTerrain('water');
						} else {
							c.setTerrain('grass_swamp');
						}
						break;

					case 'mountain':
						if(terrain < mountainLine) {
							c.setTerrain('grass');
						} else {
							c.setTerrain('mountain');
						}
						break;

					case 'urban':
						if(terrain < grassLine) {
							c.setTerrain('grass');
						} else {
							c.setTerrain('urban');
						}
						break;
				}

				this.map[x][y] = c;
			}
		}
	}

	createEdges() {
		//
		// now create stuff on the EDGES
		// (first build the default edges into an array)
		//
		this.edges.h = [];
		this.edges.v = [];

		for(var x = 0; x < (cfg.width+1); x++) {
			this.edges.h[x] = [];
			this.edges.v[x] = [];

			for(var y = 0; y < (cfg.height+1); y++) {
				this.edges.h[x][y] = new Edge('h', {x:x, y:y});
				this.edges.v[x][y] = new Edge('v', {x:x, y:y});
			}
		}

		var allPossibleEdges = TERRAINS[this.generalTerrain].edges;

		// EDGES aren't part of the game? bail out here, keep all edges "empty"
		if(!this.scn.rulesIncluded.edges) { return; }

		//
		// some elements are directional: they start somewhere and then grow
		//
		var possibleDirectionalEdges = ["river", "road"];
		for(var i = possibleDirectionalEdges.length-1; i >= 0; i--) {
			if(!allPossibleEdges.includes(possibleDirectionalEdges[i])) {
				possibleDirectionalEdges.splice(i, 1);
			}
		}

		if(possibleDirectionalEdges.length > 0) {
			var numDirectionalEdges = 5;
			for(var i = 0; i < numDirectionalEdges; i++) {
				var randType = possibleDirectionalEdges[Math.floor(Math.random()*possibleDirectionalEdges.length)];

				var start;
				var invalidStart;
				switch(randType) {
					// RIVERS
					// 1) rivers start from the edge of the map OR a water square within the terrain
					// 2) then they just walk randomly until they think they're done
					case 'river':
						do {
							start = { x: Math.floor(Math.random() * this.w), y: Math.floor(Math.random() * this.h) }
							invalidStart = (!this.getCell(start).isWater() && !this.atEdgeOfMap(start));
						} while(invalidStart);

						break;

					// ROADS
					// 1) can start anywhere, just not on water
					// 2) then they just walk randomly until they think they're done
					case 'road':
						do {
							start = { x: Math.floor(Math.random() * this.w), y: Math.floor(Math.random() * this.h) }
							invalidStart = this.getCell(start).isWater();
						} while(invalidStart);

						break;
				}
				
				

				// We extend in both directions separetely
				var dir = (Math.random() <= 0.5) ? 'h' : 'v';
				this.edges[dir][start.x][start.y].setType(randType);

				
				for(var a = 0; a < 1; a++) {
					var useEdgeStart = (a == 0);
					var riverLength = 1;

					var continueWalking;
					var e = { dir: dir, pos: start };
					do {
						var continuations = this.getPossibleNextEdges(e.dir, e.pos, useEdgeStart);
						if(continuations.length <= 0) { break; }

						var e = continuations[Math.floor(Math.random() * continuations.length)];
						if(this.outOfBounds(e.pos)) { break; }

						this.edges[e.dir][e.pos.x][e.pos.y].setType(randType);

						riverLength++;
						continueWalking = (Math.random() <= (2.0/riverLength))
					} while (continueWalking);
				}
				
			}
		}

		//
		// other elements can be added completely randomly, so fill up the map with those
		//
		var randomEdgeProbability = 0.4

		var possibleRandomEdges = ["shrub", "wall"];
		for(var i = possibleRandomEdges.length-1; i >= 0; i--) {
			if(!allPossibleEdges.includes(possibleRandomEdges[i])) {
				possibleRandomEdges.splice(i, 1);
			}
		}

		if(possibleRandomEdges.length > 0) {
			for(var x = 0; x < (cfg.width+1); x++) {
				for(var y = 0; y < (cfg.height+1); y++) {
					if(!this.edges.h[x][y].hasContent() && Math.random() <= randomEdgeProbability) {
						this.edges.h[x][y].setType(possibleRandomEdges[Math.floor(Math.random()*possibleRandomEdges.length)]);
					}

					if(!this.edges.v[x][y].hasContent() && Math.random() <= randomEdgeProbability) {
						this.edges.v[x][y].setType(possibleRandomEdges[Math.floor(Math.random()*possibleRandomEdges.length)]);
					}
				}
			}
		}
	}

	createOverlayTerrain() {
		//
		// then assign special areas, such as forests
		//
		if(!TERRAINS[this.generalTerrain].useOverlayTerrain) { return; }

		var terrainDuoSeed = this.seed();
		var noiseConfig = cubicNoiseConfig(terrainDuoSeed);
		if(cfg.noiseFunction == 'perlin' || cfg.noiseFunction == 'simplex') {
			noiseConfig = noise.seed(terrainDuoSeed);
		}

		var overlayTerrainLine = TERRAINS[this.generalTerrain].overlayTerrainLine;
		var forbidOverlayOnWater = true; // Probably the best idea to make this consistent, instead of reading => TERRAINS[this.generalTerrain].forbidOverlayOnWater;
		for(var x = 0; x < cfg.width; x++) {
			for(var y = 0; y < cfg.height; y++) {
				var terrainDuo = this.sampleNoise(x, y, noiseConfig);
				var cell = this.getCell({x:x, y:y});

				if(cell.isWater() && forbidOverlayOnWater) { continue; }

				if(terrainDuo >= overlayTerrainLine) {
					cell.setOverlayTerrain("default");
				}

			}
		}	
	}

	placeSources() {
		//
		// now randomly place food sources, water sources, ...
		//
		var terrain = TERRAINS[this.generalTerrain];
		for(var x = 0; x < cfg.width; x++) {
			for(var y = 0; y < cfg.height; y++) {
				var pos = { x: x, y: y };
				var c = this.getCell(pos);

				if(this.scn.tracksIncluded.food && !terrain.forbidFoodSources) {
					if(Math.random() <= this.scn.probabilities.food) {
						c.addFoodSource();
					}
				}

				if(this.scn.tracksIncluded.water && !terrain.forbidWaterSources) {
					if(Math.random() <= this.scn.probabilities.water && !c.isWater()) {
						c.addWaterSource();
					}
				}

				
			}
		}
	}

	placeHideout() {
		if(!this.mon.hideout.enabled) { return; }

		var pos = MAP.getRandomPos(this.mon.hideout.requirements);
		this.getCell(pos).makeHideout();

		this.hideout = this.getCell(pos);
	}

	/* EDGE ALGORITHMS */
	// gets specific edge; dir = 'h', 'v'
	getEdge(dir, pos) {
		return this.edges[dir][pos.x][pos.y];
	}

	// finds which edge is at the side dir (0-3; start right, ccw) of the position
	getEdgeAtDir(pos, dir) {
		if(dir == 0) {
			return this.edges.v[pos.x+1][pos.y];
		} else if(dir == 1) {
			return this.edges.h[pos.x][pos.y+1];
		} else if(dir == 2) {
			return this.edges.v[pos.x][pos.y];
		} else if(dir == 3) {
			return this.edges.h[pos.x][pos.y];
		}
	}

	getPossibleNextEdges(dir, pos, fromStart = true) {
		if(dir == 'h') {
			if(fromStart) {
				return [
					{ dir: 'v', pos: { x: pos.x    , y: pos.y - 1} },
					{ dir: 'v', pos: { x: pos.x    , y: pos.y    } },
					{ dir: 'h', pos: { x: pos.x - 1, y: pos.y    } }
				];
			} else {
				return [
					{ dir: 'v', pos: { x: pos.x + 1, y: pos.y - 1} },
					{ dir: 'v', pos: { x: pos.x + 1, y: pos.y    } },
					{ dir: 'h', pos: { x: pos.x    , y: pos.y    } }
				];
			}
		} else {
			if(fromStart) {
				return [
					{ dir: 'h', pos: { x: pos.x - 1, y: pos.y    } },
					{ dir: 'h', pos: { x: pos.x    , y: pos.y    } },
					{ dir: 'v', pos: { x: pos.x    , y: pos.y - 1} },
				]
			} else {
				return [
					{ dir: 'h', pos: { x: pos.x - 1, y: pos.y + 1} },
					{ dir: 'h', pos: { x: pos.x    , y: pos.y + 1} },
					{ dir: 'v', pos: { x: pos.x    , y: pos.y + 1} },
				]
			}
		}
	}
	
	/* CELL & DIMENSION CHECKING */
	getCell(pos) {
		return this.map[pos.x][pos.y];
	}

	outOfBounds(pos) {
		return (pos.x < 0 || pos.x >= this.w || pos.y < 0 || pos.y >= this.h)
	}

	atEdgeOfMap(pos) {
		return (pos.x == 0 || pos.x == (this.w-1)) || (pos.y == 0 || pos.y == (this.h-1))
	}

	convertPosToIndex(pos) {
		return pos.x * cfg.height + pos.y;
	}

	/* QUERIES ( = get very specific information from current board state) */
	possibleRipple(pos) {
		if(this.outOfBounds(pos)) { return false; } 
		if(!this.getCell(pos).isWater()) { return false; }
		return true;
	}

	getRandomPos(requirements = {}) {
		var randX, randY
		var invalidPos
		var pos

		do {
			randX = Math.floor(Math.random() * cfg.width);
			randY = Math.floor(Math.random() * cfg.height);

			var pos = { x: randX, y: randY };
			var cell = this.getCell(pos);

			invalidPos = false;

			// check EMPTY req
			if(requirements.empty && cell.hasMonster()) { 
				invalidPos = true; 

			// check WATER req
			} else if(requirements.water && !cell.isWater()) { 
				invalidPos = true; 

			// check PLAYER DISTANCE req
			} else if(requirements.hasOwnProperty('minPlayerDist')) { 
				// positive values check a RANGE
				// (negative values are used elsewhere for special distance checks)
				var d = requirements.minPlayerDist;
				if(d > 0) { invalidPos = this.checkIfPlayersWithinRange(pos, d-1); }
			
			// check HIDEOUT req	
			} else if(requirements.atHideout && !cell.isHideout()) {
				invalidPos = true;
			}

		} while(invalidPos);

		return pos;
	}

	getRandomCellFurthestAwayFromPlayers() {
		var cells = [];
		var maxVal = -1;

		for(var x = 0; x < cfg.width; x++) {
			for(var y = 0; y < cfg.height; y++) {

				var val = 0;
				for(var i = 0; i < PLAYERS.length; i++) {
					val += Math.abs(PLAYERS[i].pos.x-x) + Math.abs(PLAYERS[i].pos.y-y);
				}

				if(val > maxVal) {
					maxVal = val;
					cells = [{ x: x, y: y }];
				} else if(val == maxVal) {
					cells.push({ x: x, y: y });
				}
			}
		}

		return cells[Math.floor(Math.random()*cells.length)];
	}

	getPlayersWithinRange(pos, range, ignore = []) {
		var arr = [];
		for(var i = 0; i < PLAYERS.length; i++) {
			if(ignore.includes(i)) { continue; }

			var p = PLAYERS[i];
			var dist = Math.abs(p.pos.x - pos.x) + Math.abs(p.pos.y - pos.y);

			if(dist <= range) {
				arr.push(i);
			}
		}
		return arr;
	}

	checkIfPlayersWithinRange(pos, range, ignore = []) {
		for(var i = 0; i < PLAYERS.length; i++) {
			if(ignore.includes(i)) { continue; }

			var p = PLAYERS[i];
			var dist = Math.abs(p.pos.x - pos.x) + Math.abs(p.pos.y - pos.y);

			if(dist <= range) {
				return true;
			}
		}
		return false;
	}

	findClosestCellWithinRange(pos, range, params = {}) {
		var bestCell = null, bestDist = Infinity;

		for(var x = -range; x <= range; x++) {
			for(var y = -range; y <= range; y++) {
				// check if position even exists
				var tempPos = { x: pos.x + x, y: pos.y + y };
				if(this.outOfBounds(tempPos)) { continue; }

				var cell = this.getCell(tempPos);

				// check params
				if(params.food && !cell.hasFoodSource(true)) { continue; }

				// check against dist
				var dist = Math.abs(tempPos.x - pos.x) + Math.abs(tempPos.y - pos.y);
				if(dist < bestDist) {
					bestCell = cell;
					bestDist = dist;
				}

			}
		}

		return bestCell;
	}

	distToHideout(pos) {
		return Math.abs(pos.x - this.hideout.pos.x) + Math.abs(pos.y - this.hideout.pos.y);
	}

	findClosestAnimal(pos, types) {
		var closestAnim = null, closestDist = Infinity;
		for(var i = 0; i < ANIMALS.length; i++) {
			var a = ANIMALS[i];
			if(a.isAlive() && types.includes(a.type)) {
				var dist = Math.abs(a.pos.x - pos.x) + Math.abs(a.pos.y - pos.y);
				if(dist < closestDist) {
					closestAnim = a;
					closestDist = dist;
				}
			}
		}
		return closestAnim;
	}

	getValidNeighbours(pos, params = {}, weights = {}) {
		var nbs = [[1,0],[0,1],[-1,0],[0,-1]]
		var distance = params.distance || 1;


		//
		// PRE-CHECK
		// remove any options that would be illegal in any case
		//

		// remove options that are always illegal ( =out of bounds)
		// (in this same loop, we convert locations to their ACTUAL location, including distance and stuff)
		for(var a = 3; a >= 0; a--) {
			var newX = nbs[a][0]*distance + pos.x;
			var newY = nbs[a][1]*distance + pos.y;

			var newPos = { x: newX, y: newY };

			if(this.outOfBounds(newPos)) { nbs.splice(a, 1); }
			else { nbs[a] = { x: newX, y: newY }; }
		}

		// now remove options that are only illegal if the monster has a certain property
		// (example: a flying/big/jumping monster can leap over walls, others can't)
		for(var a = nbs.length-1; a >= 0; a--) {
			var newPos = nbs[a];
			var oppositeDir = (a+2) % 4;
			var edge = MAP.getEdgeAtDir(newPos, oppositeDir);
			var cell = MAP.getCell(newPos);

			if(edge.isType("wall") && !params.canLeapWalls) { 
				nbs.splice(a, 1); 
			} else if(edge.isType("road") && !params.canCrossRoads) { 
				nbs.splice(a, 1); 
			} else if(params.forcedWater && !cell.isWater()) { 
				nbs.splice(a, 1); 
			} else if(params.ignoreIndices) {  // quick exit if we've been explicitly told to ignore this square
				if(params.ignoreIndices.includes(this.convertPosToIndex(newPos))) { 
					nbs.splice(a,1); 
				}
			}
		}

		// check weather conditions
		// HEAT? Water is preferred over EVERYTHING. (If the creature needs water, that is.)
		var weather = STATE.getCurrentWeather();
		if(weather == "heat") {
			if(params.waterSource) {
				weights.waterSource = 100000;
			}
		}

		// check the distance from all players for each neighbour (this is only necessary when fleeing from them)
		// so we have a list of squares with greatest/smallest distance
		// NOTE: lots of overlap between these two functions below, can I generalize this???
		var bestFleeSquares = [];
		if(params.fleeFromPlayers) {

			var fleeScores = [];
			for(var a = 0; a < nbs.length; a++) {
				var totalDist = 0;
				var tempPos = nbs[a];

				for(var b = 0; b < params.fleeFromPlayers.length; b++) {
					var p = PLAYERS[params.fleeFromPlayers[b]];
					var dist = Math.abs(p.pos.x - tempPos.x) + Math.abs(p.pos.y - tempPos.y);
					totalDist += dist;
				}

				fleeScores.push({ pos: tempPos, dist: totalDist });
			}

			// sort descending
			fleeScores.sort(function(a,b) { return b.dist - a.dist; });

			// only keep all with the best score (in case of ties, we get a nice list with all the best options)
			var bestScore = fleeScores[0].dist;
			fleeScores = fleeScores.filter(function(a) { return (a.dist == bestScore); });

			for(var i = 0; i < fleeScores.length; i++) {
				bestFleeSquares.push(this.convertPosToIndex(fleeScores[i].pos));
			}
		}

		// these are better if they are CLOSER to the hideout
		// so sort the other way around
		var bestHideoutSquares = [];
		if(params.goHome) {
			var hideoutScores = [];
			var hideoutPos = this.hideout.pos;
			for(var a = 0; a < nbs.length; a++) {
				var p = nbs[a];
				var dist = Math.abs(p.x - hideoutPos.x) + Math.abs(p.y - hideoutPos.y);
				hideoutScores.push({ pos: p, dist: dist });
			}

			hideoutScores.sort(function(a,b) { return a.dist - b.dist; });

			var bestScore = hideoutScores[0].dist;
			hideoutScores = hideoutScores.filter(function(a) { return a.dist == bestScore; });

			for(var i = 0; i < hideoutScores.length; i++) {
				bestHideoutSquares.push(this.convertPosToIndex(hideoutScores[i].pos));
			}
		}

		//
		// THE BIG ALGORITHM
		// Each monster has "weights" determining their priorities
		//  => Go through weights from high to low
		//  => For each, remove any neighbours that DON'T match the requirements
		//  => Continue to next priority, until we can't trim the list any further
		//

		var priorities = Object.keys(weights);
		priorities.sort(function(a,b) { return weights[b] - weights[a]; });

		var newNbs = nbs.slice();
		for(var i = 0; i < priorities.length; i++) {
			var key = priorities[i];

			// if this is NOT enabled (it is false, or null, whatever), skip
			if(!params[key]) { continue; }

			var tempNewNbs = newNbs.slice();
			for(var a = tempNewNbs.length-1; a >= 0; a--) {
				var p = tempNewNbs[a];
				var cell = this.getCell(p);
				var validOption = false;

				switch(key) {
					case 'fleeFromPlayers':
						validOption = bestFleeSquares.includes(this.convertPosToIndex(p));
						break;

					case 'overlayTerrain':
						validOption = cell.hasOverlayTerrain();
						break;

					case 'preferredDir':
						validOption = (p.x == params.preferredDir.x && p.y == params.preferredDir.y);
						break;

					case 'foodSource':
						validOption = cell.hasFoodSource(true);
						break;

					case 'waterSource':
						validOption = cell.hasDrinkableWater();
						break;

					case 'forbidCrossOwnPath':
						validOption = !cell.monsterVisited;
						break;

					case 'avoidTracks':
						validOption = !cell.hasTracks()
						break;

					case 'goHome':
						validOption = bestHideoutSquares.includes(this.convertPosToIndex(p));
						break;

					case 'forcedNonWater':
						validOption = !cell.isWater();
						break;

					case 'maxDistFromHideout':
						var hideoutPos = this.hideout.pos;
						validOption = (Math.abs(hideoutPos.x - p.x) + Math.abs(hideoutPos.y - p.y)) <= params.maxDistFromHideout;
						break;

					case 'uniqueSquare':
						validOption = !cell.monsterVisited;
						break;

					case 'forbidCrossingItself':
						validOption = !cell.hasPartOfMultiSquareMonster();
						break;
				}

				if(!validOption) {
					tempNewNbs.splice(a,1);
				}
			}

			// now we have two lists: newNbs is the one with valid options so far, tempNewNbs with valid options _according to the current property
			// if there's nothing valid according to our property, don't influence the results
			if(tempNewNbs.length <= 0) { continue; }

			// otherwise, only keep the matches (because they match THIS REQUIREMENT and all PREVIOUS REQUIREMENTS), then continue
			newNbs = tempNewNbs;

			// only one neighbour or no neighbours left? no need for further selection
			if(newNbs.length <= 1) { break; }
		}

		// we have some nice results? give them back
		if(newNbs.length > 0) {
			return newNbs;
		}

		// we have no results, but we want to ALWAYS return something? Just return original neighbours
		if(params.alwaysReturn) {
			return nbs;
		}

		// otherwise return empty list
		return [];
	}

}