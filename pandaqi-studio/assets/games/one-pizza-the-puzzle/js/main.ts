// @ts-nocheck
import { TRAFFIC_SIGNS, SPECIAL_INGREDIENTS, SPECIAL_BUILDINGS } from "./dictionary"
import PandaqiPhaser from "js/pq_games/website/phaser"
import { Scene, Geom } from "js/pq_games/phaser.esm"
import Random from "js/pq_games/tools/random/main"

const sceneKey = "boardGeneration"
class BoardGeneration extends Scene
{
	canvas: HTMLCanvasElement
	cfg: Record<string,any>
	map: any[][]
	shapes: any[]
	crossingCells: any[]
	possiblePolicePoints: any[]
	crossingSets: any[]
	crossingCounter: any
	pathsToExtend: any
	curRoadSet: any[]
	roadSets: any
	extendingUnconnectedRoads: boolean
	obstacles: any[]
	buildings: any[]
	specialIngredientsIncluded: any[]
	subwayCounter: number
	randomCreationOrder: any[]
	deadEnds: any[]
	fullIngredientList: any[]
	fullOrderList: any[]
	orderLengthCounter: number
	allEntrances: any[]
	numIngredientBuildings: number
	numOrderBuildings: number
	policeCells: any[]
	trafficSigns: any[]

	ROAD_EXTEND_RNG: any
	RAND_POINT_RNG: any
	BUILDING_GROW_RNG: any
	BUILDING_TYPE_RNG: any
	SHUFFLE_RNG: any
	ALLEY_RNG: any
	RANDOM_DRAW_RNG: any
	RANDOM_SQUARE_RNG: any
	TRAFFIC_SIGN_RNG: any
	VARIATION_RNG: any

	constructor()
	{
		super({ key: sceneKey });
	}

	preload() {
		this.load.crossOrigin = 'Anonymous';
		this.canvas = this.sys.game.canvas;

		let base = 'assets/';

		const sheetData = { frameWidth: 200, frameHeight: 200 }
		this.load.spritesheet('roadmarks', base + 'roadmarks.webp', sheetData) 
		this.load.spritesheet('ingredients', base + 'ingredients.webp', sheetData) // big ingredient icons, used on buildings/entrances
		this.load.spritesheet('crust', base + 'crust.webp', sheetData) // pizza crust + smaller icons used when combining pizza
		this.load.spritesheet('general_icons', base + 'general_icons.webp', sheetData) // the icons for any special buildings or elements on the map
		this.load.spritesheet('decorations', base + 'decorations.webp', sheetData) // natural decorations (such as fountain, roundabout, hedge, ...)
		this.load.spritesheet('traffic_signs', base + 'traffic_signs.webp', sheetData) // traffic signs (from the Expansion)
		this.load.spritesheet('shapes', base + 'shapes.webp', sheetData); // movement shapes to pick from (when moving a Pizza Courier)
		this.load.spritesheet('special_buildings', base + 'special_buildings.webp', sheetData) // special building icons (used when Preposterous Places is enabled)
		this.load.image('unique_shapes_hint', base + 'unique_shapes_hint.webp'); // a hint to remind players about picking unique shapes for each courier
	}

	// user-input settings should be passed through config
	create(config:Record<string,any>) {
		this.cfg = {}
		Object.assign(this.cfg, config);

		// number of cells along width of the paper
		this.cfg.resX = 10 + Math.floor(this.cfg.numPlayers*1.5);

		// ... determines grid cell size
		this.cfg.cellSize = this.canvas.width / this.cfg.resX;

		// ... determines resolution along height of paper
		this.cfg.resY = Math.floor(this.canvas.height / this.cfg.cellSize);

		//
		// purely visual settings
		//

		// border width as percentage of the total cell size (used for placements and margins that look good and scale with board size)
		this.cfg.borderWidth = 0.075

		// these colors correspond with ingredient frames
		this.cfg.buildingColorDict = 
		[
			0xFFAAAA, 0xFFFF50, 0xFFECCF, 0xFFECB2, 0xCEFFAB, 0xFFC1DC, 0xFFD8D0, // regular ingredients
			0xFFDAD4, 0xF0ECCB, 0xFFEEE7, 0xFFD4B9, 0xDEFDC7, 0xFFECF4, 0xE0EDDB // special ingredients
		];
		
		this.cfg.ingredientSpriteScale = 0.8;

		//
		// some other general settings
		//
		this.cfg.ingredientBuildingProbability = 0.6; // 60% of the map are ingredient buildings, rest is reserved or order
		this.cfg.ingredientBuildingMinimumDistance = (1.0 - this.cfg.ingredientBuildingProbability) * this.cfg.resX; // how far ingredient buildings must be apart

		this.cfg.buildingMinSize = Math.round(this.cfg.numPlayers*0.33); // when growing buildings, minimum size required (at 4 players = 2)
		this.cfg.buildingMaxSize = Math.round(this.cfg.numPlayers); // when growing buildings, maximum size allowed (at 4 players = 6)
		this.cfg.buildingGrowthChance = 0.6 + 0.033 * this.cfg.numPlayers; // between min-max, probability of continuing growth (at 4 players = 0.8)

		this.cfg.maxEntrancesPerBuilding = 2 + Math.round(this.cfg.numPlayers*0.2) // when placing extra entrances (after dead-ends), average cutoff used for ignoring buildings that already have X entrances

		this.cfg.buildingMinSize = 2;
		this.cfg.buildingMaxSize = 5;
		this.cfg.buildingGrowthChance = 0.6;
		this.cfg.maxEntrancesPerBuilding = 1 + Math.round(this.cfg.numPlayers*0.2);

		//
		// settings for creating more varied streets (instead of only straight ones)
		//

		// variation runs from 0->4, none to extreme
		const variation = parseInt(this.cfg.boardVariation) || 0;

		this.cfg.streetCornerProbability = variation/4.0; // whether to create a bend/corner in the road when we can
		this.cfg.forbidFirstStepProbability = variation/4.0; // whether to forbid the first extension of a crossing if it creates a 2x2 blob
		this.cfg.createAlleyProbability = variation/4.0; // whether to create alleys at the possible locations
		this.cfg.crossingDiagonalVariationProbability = variation/4.0; // whether to remove the original crossing and only place diagonals instead

		this.cfg.solveUglyBoxesByMergingProbability = 1.0 - variation/4.0; // whether to try and solve ugly boxes first by merging with neighboring buildings (when possible)

		this.cfg.policeFactor = Math.min( (variation + 1.0)/5.0, 1.0) * Math.max( (this.cfg.numPlayers / 4.0), 1.0); // if the board has more straight roads, we need LESS police, because they cover everything in a straight line 

		// if the "preposterous places" expansion is enabled, we want more roundabouts, as we can use them for the special buildings
		// otherwise, we usually want more hedges
		this.cfg.roundaboutProbability = 0.25
		if(this.cfg.expansions.preposterousPlaces) { this.cfg.roundaboutProbability = 0.75; }

		//
		// settings for the expansions
		//

		this.cfg.minDistancePoliceIcons = 6
		this.cfg.minDistanceTrafficSigns = 2

		this.cfg.numTrafficSigns = this.cfg.numPlayers*5;

		//this.cfg.numPizzaPolice = 1 + Math.floor(this.cfg.resX / 6.0)

		this.generateBoard();

		PandaqiPhaser.convertCanvasToImage(this);
	}

	generateBoard() {
		// create empty lists and grid (we'll need later on)
		this.prepareLists();
		this.createGrid();

		// reserve a few squares for displaying the shapes
		this.reserveShapeSquares();
		this.determineShapes();

		// create the main road network
		this.placeRandomCrossings();
		this.fillRoadNetwork();

		// place buildings, then meddle with them for more interesting (and connected) road networks
		this.createBuildings();
		this.createAlleys();
		this.solveUnconnectedAreas();

		// anywhere we have multiple crossings together, turn into some special element (roundabout, hedge, etc.)
		this.removeUglyBoxes();
		this.determineDecorationBorders();

		// reserve a few buildings (keep them empty for players to)
		this.reserveBuildings();

		// place subways, entrances and other specialties
		this.findDeadEnds();
		this.generateIngredientLists();
		this.placeEntrances();
		this.createSubways();

		// change buildings without an entrance into something else
		// (depends on expansion/settings)
		this.convertBuildingsWithoutEntrance();

		// we do this here, because the function(s) above can still CHANGE buildings
		this.determineBuildingBorders();

		// if Pizza Police enabled, place them!
		if(this.cfg.expansions.pizzaPolice) {
			this.placePizzaPolice();
		}

		// if Ingenious Ingredients enabled, swap some building ingredients with types from the expansion
		// NOTE: This needs to come BEFORE the traffic expansion, as that needs the FULL list of ingredients
		if(this.cfg.expansions.ingeniousIngredients) {
			this.swapSpecialIngredients();
		}

		// if Treacherous Traffic enabled, place the corresponding traffic signs
		if(this.cfg.expansions.treacherousTraffic) {
			this.placeTrafficSigns();
		}

		// if Preposterous Places enabled, swap some buildings and decorations with special types
		if(this.cfg.expansions.preposterousPlaces) {
			this.placeSpecialBuildings();
		}

		// visualize the whole thing
		this.visualizeGame();
	}

	createGrid() {
		for(let x = 0; x < this.cfg.resX; x++) {
			this.map[x] = [];

			for(let y = 0; y < this.cfg.resY; y++) {
				this.map[x][y] = 
					{
						pos: [x,y],
						type: 'empty',
						subType: '',
						dir: -1,
						closedSides: [false, false, false, false],
						filledSquares: [false, false, false, false],

						roundabout: false,
						deadend: false,

						entrance: false,
						police: false,
						subway: false

						
					};
			}
		}
	}

	reserveShapeSquares() {
		let CONFIG_RNG = Random.seedRandom(this.cfg.seed + "-config")

		// What to do with these?
		// hard configurations (only 2 shapes): [1,2], [2,1]
		// easy configurations (6 shapes): [2,3], [3,2]

		let possibleConfigurations = [[4,1], [3,1], [2,2], [1,3], [1,4]];
		this.cfg.shapeRectSize = possibleConfigurations[Math.floor(CONFIG_RNG() * possibleConfigurations.length)]

		for(let x = 0; x < this.cfg.shapeRectSize[0]; x++) {
			for(let y = 0; y < this.cfg.shapeRectSize[1]; y++) {
				this.map[this.cfg.resX-1-x][this.cfg.resY-1-y].type = 'shape';
			}
		}
	}

	determineShapes() {
		let RNG = Random.seedRandom(this.cfg.seed + '-shapes');

		let numShapes = this.cfg.shapeRectSize[0] * this.cfg.shapeRectSize[1];
		let allShapes = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]
		
		let splitShapes = [2, 5, 10, 11]
		let exoticShapes = [14, 16] // might also want to include 15?
		let skipShapes = [4, 13]
		let regularShapes = [4, 13, 8, 17]

		this.shapes = [];

		// if we only have 2 shapes, don't include any exotic ones (moving is hard enough as it is)
		// @IMPROV: Also include AT MOST one exotic shape?
		if(numShapes <= 2) {
			for(let i = 0; i < exoticShapes.length; i++) {
				allShapes.splice(exoticShapes.indexOf(exoticShapes[i]), 1);
			}
		}

		// always include only one SPLIT shape => then remove all of them from the total array
		this.shapes.push(splitShapes[ Math.floor(RNG() * splitShapes.length) ])
		for(let i = 0; i < splitShapes.length; i++) {
			allShapes.splice(allShapes.indexOf(splitShapes[i]), 1);
		}

		for(let i = 0; i < numShapes - 1; i++) {
			let randIndex = Math.floor(RNG() * allShapes.length)

			let randVal = allShapes[randIndex];
			this.shapes.push(randVal);

			allShapes.splice(randIndex, 1);

			// each shape has TWO possibilities; if we pick one, remove its twin sister from the array
			let sisterIndex = allShapes.indexOf( (randVal + 9) % 18 )
			if(sisterIndex > -1) { allShapes.splice(sisterIndex, 1) };

			// if this was a regular shape, disallow all other regular shapes
			if(regularShapes.includes(randVal)) {
				for(let a = 0; a < regularShapes.length; a++) {
					let ind = allShapes.indexOf(regularShapes[a]);
					if(ind > -1) { allShapes.splice(ind, 1); }
				}
			}
		}

		this.shuffle(this.shapes);
	}

	getRandomPoint() {
		let x,y
		do {
			x = Math.floor(this.RAND_POINT_RNG() * this.cfg.resX);
			y = Math.floor(this.RAND_POINT_RNG() * this.cfg.resY);
		} while(this.map[x][y].type != 'empty');

		return [x, y]
	}

	placeRandomCrossings() {
		const numCrossings = Math.floor(this.cfg.resX * 0.25);

		for(let i = 0; i < numCrossings; i++) {
			let pos = this.getRandomPoint();
			let obj = this.map[pos[0]][pos[1]];

			obj.type = 'road';
			obj.subType = 'crossing';

			this.crossingCells.push(pos);

			this.possiblePolicePoints.push(pos);

			this.crossingSets.push([pos.slice()]);
			obj.originCrossing = this.crossingCounter;
			this.crossingCounter++;

			this.pathsToExtend.push(pos);
		}
	}

	fillRoadNetwork() {
		const nbs = [[1,0], [0,1], [-1,0], [0,-1]]

		this.curRoadSet = []

		// As long as we have paths to extend, do so
		while(this.pathsToExtend.length > 0) {
			let pos = this.pathsToExtend.splice(0, 1)[0]
			let obj = this.map[pos[0]][pos[1]]

			// crossings are extended in ALL directions, 
			// otherwise roads are extended in just ONE (valid) direction
			if(obj.subType == 'crossing') {
				for(let i = 0; i < 4; i++) {
					this.extendRoad(pos, nbs[i])
				}
			} else {
				let dir = this.getValidExtensionDir(pos)
				if(dir == null) { continue; }

				this.extendRoad(pos, dir)				    			
			}

			// Turned this off because it just didn't work out for several reasons
			// (Hard to implement, can't loose connectedness of crossing set due to subway placement, weird glitches)
			//this.performCrossingDiagonalVariation();
		}

		this.roadSets.push(this.curRoadSet);
	}

	performCrossingDiagonalVariation() {
		// road variation: randomly remove crossing cells, but add their diagonals
		for(let i = this.crossingCells.length - 1; i >= 0; i--) {	
			if(this.VARIATION_RNG() <= this.cfg.crossingDiagonalVariationProbability) {
				let pos = this.crossingCells[i];
				let crossing = this.map[pos[0]][pos[1]].originCrossing

				this.removeRoadCell(pos);

				// there are two diagonals: top left to bottom right, and bottom left to top right
				// here we randomly pick one
				if(this.VARIATION_RNG() <= 0.5) {
					this.addRoadCell([pos[0] + 1, pos[1] + 1], [ 1, 0], crossing);
					this.addRoadCell([pos[0] - 1, pos[1] - 1], [-1, 0], crossing)
				} else {
					this.addRoadCell([pos[0] + 1, pos[1] - 1], [ 0,-1], crossing);
					this.addRoadCell([pos[0] - 1, pos[1] + 1], [ 0, 1], crossing);
				}
			}
		}

		this.crossingCells = [];
	}

	addRoadCell(pos, dir, originCrossing) {
		if(this.outOfBounds(pos)) { return; }

		let obj = this.map[pos[0]][pos[1]]
		obj.type = 'road';
		obj.dir = dir;
		obj.originCrossing = originCrossing;

		// remember which crossing set and road set we belong to
		this.crossingSets[originCrossing].push(pos.slice());
		this.curRoadSet.push(pos.slice());
	}

	removeRoadCell(pos) {
		if(this.outOfBounds(pos)) { return; }

		let obj = this.map[pos[0]][pos[1]]
		if(obj.type != 'road') { return; }

		// remove ourselves from any sets we were put into
		// @IMPROV: also remove ourselves from the curRoadSet

		// NOTE: some road types, like alleys, don't originate from a crossing, that's why we check
		if(obj.originCrossing) {
			let cs = this.crossingSets[obj.originCrossing];
			for(let i = 0; i < cs.length; i++) {
				let tPos = cs[i];
				if(tPos[0] == pos[0] && tPos[1] == pos[1]) {
					this.crossingSets[obj.originCrossing].splice(i, 1);
					break;
				}
			}
		}

		obj.type = 'empty';
		obj.dir = [1,0];
		obj.originCrossing = -1;
	}

	getValidExtensionDir(pos) {
		// find a free direction into which to extend
		let nbs = [[1,0], [0,1], [-1,0], [0,-1]]
		let validExtensionDirections = [];
		for(let i = 0; i < 4; i++) {
			let nb = nbs[i];
			let tPos = [pos[0] + nb[0], pos[1] + nb[1]]

			if(this.outOfBounds(tPos)) { continue; }
			if(!this.cellFilled(tPos)) { validExtensionDirections.push(nb); }
		}

		if(validExtensionDirections.length <= 0) { return null; }

		// choose a random direction
		return validExtensionDirections[Math.floor(this.ROAD_EXTEND_RNG() * validExtensionDirections.length)];
	}

	extendRoad(pos, dir) {
		let tPos = [pos[0], pos[1]];
		let canContinue = true;
		let cellsFilled = [];

		// keep track of which crossing originated this path => we belong to that group of roads
		let originCrossing = this.map[pos[0]][pos[1]].originCrossing;

		let numExtensionsUntilCorner = 0;
		let lastCornerDir = 0;

		// also check if the FIRST extension would already hit something
		// lower this probability to get more roads (and intersections+decorations)
		// NOTE: don't do this when we're solving unconnected areas, as then we want as many road connections as we can get
		if(!this.extendingUnconnectedRoads) {
			if(this.neighbourCellFilled([pos[0]+dir[0], pos[1]+dir[1]], dir) && this.VARIATION_RNG() <= this.cfg.forbidFirstStepProbability) { canContinue = false; 
			}
		}

		// keep extending the road until we hit something ...
		while(canContinue) {
			// take one step
			let tempDir = dir.slice();

			// @IMPROV: Make this CLEANER => put into its own function?

			// if this is NOT the first cell, and the previous cell was NOT a corner,
			// we may take a corner in the road with some probability
			if(numExtensionsUntilCorner >= 2 && this.VARIATION_RNG() <= this.cfg.streetCornerProbability) {
				tempDir = [-dir[1], dir[0]];

				// always take the OPPOSITE corner from the last one
				// this way, we always return to a straight line
				if(lastCornerDir != 0) {
					tempDir = [-lastCornerDir*tempDir[0], -lastCornerDir*tempDir[1]]
					lastCornerDir = 0;
				} else {
					lastCornerDir = 1;

					// if the first chosen direction is invalid, or with 50% probability, try the other direction
					let tempTPos = [tPos[0] + tempDir[0], tPos[1] + tempDir[1]]
					if(this.VARIATION_RNG() <= 0.5 || (this.outOfBounds(tempTPos)) || (this.cellFilled(tempTPos))) {
						lastCornerDir = -1;
						tempDir = [-tempDir[0], -tempDir[1]]
					}
				}

				// only definitely apply the change if we can actually reach the cell we want to go to
				let tempTPos = [tPos[0] + tempDir[0], tPos[1] + tempDir[1]]
				if(this.outOfBounds(tempTPos) || this.cellFilled(tempTPos)) {
					lastCornerDir = 0;
					tempDir = dir;
					numExtensionsUntilCorner++;
				} else {
					numExtensionsUntilCorner = 0;				    				
				}
			} else {
				numExtensionsUntilCorner++;
			}

			tPos[0] += tempDir[0];
			tPos[1] += tempDir[1];

			// if we're out of bounds or hit a filled cell, stop
			if(this.outOfBounds(tPos) || this.cellFilled(tPos)) { canContinue = false; break; }

			// otherwise, fill the new cell as a road
			this.addRoadCell(tPos, tempDir, originCrossing);

			// remember this cell (as a COPY) as one of the cells we filled
			cellsFilled.push(tPos.slice());

			// if one of our neighbours is filled, immediately stop, as we are already connected to something else
			// again, don't do this on unconnected roads, as it increases the probability of ugly one-off sections
			if(!this.extendingUnconnectedRoads) {
				if(this.neighbourCellFilled(tPos, tempDir)) { canContinue = false; break; }
			}
		}

		// add some new cells to the extension algorithm, one for each chunk of X tiles
		const streetChunkSize = 5;
		while(cellsFilled.length >= streetChunkSize) {
			let randCell = cellsFilled[Math.floor(this.ROAD_EXTEND_RNG() * (streetChunkSize - 1)) + 1]

			this.pathsToExtend.push(randCell);
			cellsFilled.splice(0, 5);
		}
	}

	prepareLists() {
		// here we prepare our seeded random number generators
		let seed = this.cfg.seed;
		this.RAND_POINT_RNG = Random.seedRandom(seed + "-randPoints");
		this.BUILDING_GROW_RNG = Random.seedRandom(seed + "-buildingGrowth");
		this.BUILDING_TYPE_RNG = Random.seedRandom(seed + '-buildingType');
		this.SHUFFLE_RNG = Random.seedRandom(seed + "-shuffle");

		this.ALLEY_RNG = Random.seedRandom(seed + "-alleys");

		this.ROAD_EXTEND_RNG = Random.seedRandom(seed + "-roadExtensions");
		this.VARIATION_RNG = Random.seedRandom(seed + "-roadVariations");

		this.RANDOM_DRAW_RNG = Random.seedRandom(seed + "-randomDraws");
		this.RANDOM_SQUARE_RNG = Random.seedRandom(seed + "-randomSpecialties");

		this.TRAFFIC_SIGN_RNG = Random.seedRandom(seed + "-trafficSigns");

		// here we create some lists we'll use in many different places
		// (and don't want to re-initialize)
		this.map = [];

		this.pathsToExtend = [];

		this.obstacles = [];
		this.buildings = [];

		// this contains all UNCONNECTED lists of roads
		// so we can place (at least) one subway tunnel in all of them
		this.roadSets = [];

		// this is a BETTER system for keeping track of connected lists of roads
		// when placing a road, we remember which crossing it originated from => these must all be connected
		// so place ONE subway on each road-set with a dead end!
		this.crossingCounter = 0;
		this.crossingSets = [];

		this.crossingCells = []; // needed for the variation in which we place diagonals on crossings

		this.possiblePolicePoints = []; // police is preferably placed on crossings (maximum visibility), so keep track of those during generation

		// when extending unconnected roads, certain parts of the extendRoad algorithm change, so we need this toggle
		this.extendingUnconnectedRoads = false;

		this.specialIngredientsIncluded = [];

		// to give each subway its own number!
		this.subwayCounter = 0;

		// this is needed to RANDOMLY iterate a 2D array of positions
		// (otherwise we get artefacts/patterns from always starting at the top left)
		this.randomCreationOrder = [];
		for(let x = 0; x < this.cfg.resX; x++) {
			for(let y = 0; y < this.cfg.resY; y++) {
				this.randomCreationOrder.push([x,y]);
			}
		}

		this.shuffle(this.randomCreationOrder);


	}

	createBuildings() {
		for(let i = 0; i < this.randomCreationOrder.length; i++) {
			let pos = this.randomCreationOrder[i];
			if(this.map[pos[0]][pos[1]].type != 'empty') { continue; }

			this.growBuilding(pos);
		}
	}

	generateBordersToPos(pos, buildingIndex) {
		let nbs = [[1,0], [0,1], [-1,0], [0,-1]]
		let borders = [];
		let corner = [pos[0] + 1, pos[1]]

		for(let i = 0; i < 4; i++) {
			let nb = nbs[i];
			let nextDir = nbs[(i + 1) % 4];
			let nextCorner = [corner[0] + nextDir[0], corner[1] + nextDir[1]]
			let tPos = [pos[0] + nb[0], pos[1] + nb[1]]

			if(!this.outOfBounds(tPos)) { 
				let obj = this.map[tPos[0]][tPos[1]];

				if(obj.type != 'building' || obj.buildingIndex != buildingIndex) { 
					borders.push([corner, nextCorner])
				}
			}

			corner = nextCorner
		}

		return borders;
	}

	convertDirToIndex(dir) {
		if(dir[0] == 1 && dir[1] == 0) {
			return 0;
		} else if(dir[0] == 0 && dir[1] == 1) {
			return 1;
		} else if(dir[0] == -1 && dir[1] == 0) {
			return 2;
		} else if(dir[0] == 0 && dir[1] == -1) {
			return 3;
		}

		return -1;
	}

	convertIndexToDir(num) {
		if(num < 0 || num >= 4) { return null; }

		let dirs = [[1,0], [0,1], [-1,0], [0,-1]];
		return dirs[num]
	}

	growBuilding(pos) {
		let obj = this.map[pos[0]][pos[1]]
		let buildingIndex = this.buildings.length;
		
		// start building with this cell ( + set the cell itself to be of type building)
		let building = this.generateEmptyBuilding();
		building.tiles = [pos];
		building.index = buildingIndex;
		building.empty = false;

		const minSize = this.cfg.buildingMinSize, maxSize = this.cfg.buildingMaxSize;
		const growthChance = this.cfg.buildingGrowthChance;
		
		obj.type = 'building';
		obj.buildingIndex = buildingIndex;

		let nbCells = this.generateValidNeighbours(pos);
		let continueGrowing = (nbCells.length > 0);

		// as long as we are BELOW maximum size, we have a new CELL to add, and random chance likes us
		while(continueGrowing) {
			// pick the first cell in the list
			let tPos = nbCells.splice(0, 1)[0];
			let cell = this.map[tPos[0]][tPos[1]];

			// turn it into a building
			cell.type = 'building';
			cell.buildingIndex = buildingIndex;

			building.tiles.push(tPos)

			// add all its valid neighbours to list of potential candidates for growth
			nbCells = nbCells.concat( this.generateValidNeighbours(tPos) );

			// check if we want to continue
			continueGrowing = (building.tiles.length < (maxSize - 1) && (building.tiles.length < minSize || this.BUILDING_GROW_RNG() <= growthChance) && nbCells.length > 0)
		}

		// finally, add the building we created to the list
		this.buildings.push(building);
	}

	generateValidNeighbours(pos) {
		let nbs = [[1,0], [0,1], [-1,0], [0,-1]]
		let validNeighbours = [];

		for(let i = 0; i < 4; i++) {
			let nb = nbs[i];
			let tPos = [pos[0] + nb[0], pos[1] + nb[1]]

			if(this.outOfBounds(tPos)) { continue; }
			if(this.cellFilled(tPos)) { continue; }

			validNeighbours.push(tPos);
		}

		return this.shuffle(validNeighbours);
	}

	shuffle(a) {
		return Random.shuffle(a, this.SHUFFLE_RNG)
	}

	outOfBounds(pos) {
		return (pos[0] < 0 || pos[0] >= this.cfg.resX || pos[1] < 0 || pos[1] >= this.cfg.resY)
	}

	cellFilled(pos) {
		return (this.map[pos[0]][pos[1]].type != 'empty')
	}

	sameOriginCrossing(pos1, pos2) {
		return (this.map[pos1[0]][pos1[1]].originCrossing == this.map[pos2[0]][pos2[1]].originCrossing)
	}

	neighbourCellFilled(pos, dir) {
		let nbs = [[1,0], [0,1], [-1,0], [0,-1]]
		for(let i = 0; i < 4; i++) {
			let nb = nbs[i];
			let tPos = [pos[0] + nb[0], pos[1] + nb[1]]

			// ignore the direction we came from
			if(dir[0] == -nb[0] && dir[1] == -nb[1]) { continue; }

			if(this.outOfBounds(tPos)) { continue; }
			if(this.sameOriginCrossing(pos, tPos)) { continue; }
			if(this.cellFilled(tPos)) { return true; }
		}

		return false;
	}

	getOrientationFromNeighbours(pos) {
		// Get how many roads we are neighbouring, and which ones exactly => turn into binary number
		// Depending on the number, use a different rotation/frame
		let nbs = [[1,0], [0,1], [-1,0], [0,-1]]
		let binary = 0;

		let obj = this.map[pos[0]][pos[1]]
		let returnObj = { rotation: 0, frame: 0 };

		for(let i = 0; i < 4; i++) {
			if(obj.closedSides[i]) { continue; }

			let nb = nbs[i];
			let tPos = [pos[0] + nb[0], pos[1] + nb[1]]

			if(this.outOfBounds(tPos)) { continue; }

			let tempObj = this.map[tPos[0]][tPos[1]];

			let num = 0;
			if(tempObj.type == 'road') { num = 1; }

			binary += num * Math.pow(2, i);
		}

		let directions = [
			[1,2,4,8], // Dead end
			[5,10], // Straight line
			[3,6,12,9], // Corner
			[7, 14, 13, 11], // T-crossing (3-way)
			[15] // All (4-way)
		]

		for(let i = 0; i < directions.length; i++) {
			if(!directions[i].includes(binary)) { continue; }

			returnObj.frame = i;
			returnObj.rotation = directions[i].indexOf(binary) * 0.5 * Math.PI;
			break;
		}

		return returnObj;
	}

	solveUnconnectedAreas() {
		// Keep repeating this algorithm until all unconnected areas are resolved
		let unconnectedBuildings = [];
		do {

			// Step 0) find all unconnected buildings
			unconnectedBuildings = [];
			for(let i = 0; i < this.buildings.length; i++) {
				let b = this.buildings[i];

				if(b.tiles.length <= 0) { continue; }

				for(let t = 0; t < b.tiles.length; t++) {
					let pos = b.tiles[t];
					if(this.connectedWithRoad(pos)) {
						b.streetConnection = true;
						break;
					}
				}

				if(!b.streetConnection) {
					unconnectedBuildings.push(b);
				}
			}

			// Step 1) Merge all unconnected buildings into one
			for(let i = 0; i < unconnectedBuildings.length; i++) {
				let b = unconnectedBuildings[i];
				let buildingIndex = b.index;

				for(let t = 0; t < b.tiles.length; t++) {
					let pos = b.tiles[t]
					let unconnectedNb = this.getNeighborBuilding('unconnected', pos, buildingIndex);

					if(unconnectedNb == null) { continue; }

					this.mergeBuildings(b, unconnectedNb);
					//i--; // try to find another connection for this building! => wait, that's not really necessary, as long as we don't BREAK here
					//break;
				}
			}

			// Step 2) Any building that is sufficiently small (size <= 6), 
			//         will go through all tiles, and just merge them with random neighbouring buildings
			//         until all tiles are gone
			const smallBuildingThreshold = 6;
			for(let i = unconnectedBuildings.length - 1; i >= 0; i--) {
				let b = unconnectedBuildings[i];

				if(b.tiles.length <= 0) { unconnectedBuildings.splice(i, 1); continue; }
				if(b.tiles.length > smallBuildingThreshold) { continue; } 

				let counter = b.tiles.length - 1;
				let tempTiles = b.tiles.slice();
				while(tempTiles.length > 0) {
					let pos = tempTiles[counter], buildingIndex = b.index;
					let connectedNb = this.getNeighborBuilding('connected', pos, buildingIndex)

					if(connectedNb == null) { counter = (counter - 1) % tempTiles.length; continue; }

					this.addToBuilding(connectedNb, pos);
					tempTiles.splice(counter, 1);

					counter = (counter - 1) % tempTiles.length;
				}

				this.resetToEmptyBuilding(b);

				unconnectedBuildings.splice(i, 1);
			}

			// Step 3) Any building larger than that, is turned 'empty' again
			//         place one crossing per 5 tiles, and just repeat the whole algorithm of
			//		   "extend roads => fill network => create buildings"
			this.extendingUnconnectedRoads = true;
			for(let i = 0; i < unconnectedBuildings.length; i++) {
				let b = unconnectedBuildings[i];

				let crossingLocations = [];
				for(let t = 0; t < b.tiles.length; t++) {
					let pos = b.tiles[t], obj = this.map[pos[0]][pos[1]]
					
					obj.type = 'empty'

					if(t % 5 == 0) {
						crossingLocations.push(pos);
					}
				}

				this.resetToEmptyBuilding(b);

				for(let l = 0; l < crossingLocations.length; l++) {
					let pos = crossingLocations[l], obj = this.map[pos[0]][pos[1]]

					obj.type = 'road';
					obj.subType = 'crossing';

					this.crossingSets.push([pos.slice()]);
					obj.originCrossing = this.crossingCounter;
					this.crossingCounter++;

					this.possiblePolicePoints.push(pos);

					this.pathsToExtend.push(pos);
				}

				this.fillRoadNetwork();
				this.createBuildings();
			}

		} while(unconnectedBuildings.length > 0);
	}

	createAlleys() {
		for(let i = this.buildings.length - 1; i >= 0; i--) {
			let b = this.buildings[i];

			this.determineBuildingSurroundings(b);

			let numUniqueStreets = 0, maxStreetSize = 0;
			for(let d = 0; d < 4; d++) {
				if(b.streetDirs[d] > 0) {
					maxStreetSize = Math.max(b.streetDirs[d], maxStreetSize);
					numUniqueStreets++;
				}
			}

			// ignore unconnected streets
			// @TODO: If I calculate this, I really don't need the "streetConnection" parameter on buildings
			if(numUniqueStreets == 0) {
				continue;
			}

			// either we have only ONE connection with at most TWO roads, or all our connections have AT MOST ONE road
			let allowAllifying = (numUniqueStreets == 1 && maxStreetSize <= 2) || (maxStreetSize <= 1);
			if(allowAllifying && this.ALLEY_RNG() <= this.cfg.createAlleyProbability) {

				// convert this whole building into roads!
				for(let t = 0; t < b.tiles.length; t++) {
					let pos = b.tiles[t]
					let obj = this.map[pos[0]][pos[1]];
					
					obj.type = 'road';
					obj.subType = 'alley';
					obj.dir = [1,0]; // the right direction is calculated in the next loop, this is just a default

					this.curRoadSet.push(pos)
				}

				// now calculate which "direction" the road takes (this is an approximation)
				// we check our neighbours, and the first one we find, we presume we came from that direction
				for(let t = 0; t < b.tiles.length; t++) {
					let pos = b.tiles[t];
					this.map[pos[0]][pos[1]].dir = this.calculateDirFromSurroundings(pos);
				}

				this.buildings[i] = this.generateEmptyBuilding(i);
			}
		}
	}

	calculateDirFromSurroundings(pos) {
		let nbs = [[1,0], [0,1], [-1,0], [0,-1]];
		for(let i = 0; i < 4; i++) {
			let tPos = [pos[0] + nbs[i][0], pos[1] + nbs[i][1]]
			if(this.outOfBounds(tPos)) { continue; }
			if(this.map[tPos[0]][tPos[1]].type == 'road') {
				return [ -nbs[i][0], -nbs[i][1] ];
			}
		}

		return [1,0];
	}

	generateEmptyBuilding(index = -1) {
		return {
			'tiles': [],
			'borders': [],
			'index': index,
			'streetConnection': false,
			'streetDirs': [0, 0, 0, 0],
			'empty': true,
			'type': '',
			'numEntrances': 0,
			
			'ingredient': null,
			'order': null,

			'sideDishes': [],

			'special': null,
			
			'centerCellData': null
		};
	}

	resetToEmptyBuilding(b) {
		b.tiles = [];

		this.buildings[b.buildingIndex] = this.generateEmptyBuilding(b.buildingIndex);
	}

	determineBuildingSurroundings(b) {
		for(let t = 0; t < b.tiles.length; t++) {
			let pos = b.tiles[t];

			let nbs = [[1,0], [0,1], [-1,0], [0,-1]]
			for(let i = 0; i < 4; i++) {
				let nb = nbs[i];
				let tPos = [pos[0] + nb[0], pos[1] + nb[1]]

				if(this.outOfBounds(tPos)) { continue; }

				let obj = this.map[tPos[0]][tPos[1]];
				b.streetDirs[ this.convertDirToIndex(obj.dir) ]++;
			}
		}
	}

	determineBuildingBorders() {
		// now we have our list of buildings, each of which is an ARRAY of positions [x,y]
		// it's time to determine their BOUNDARIES ( = which lines should I draw to show where buildings start/end?)
		for(let i = 0; i < this.buildings.length; i++) {
			let b = this.buildings[i];

			for(let p = 0; p < b.tiles.length; p++) {
				let pos = b.tiles[p];

				b.borders = b.borders.concat( this.generateBordersToPos(pos, i) )
			}
		}
	}

	determineDecorationBorders() {
		let specialPlacesEnabled = this.cfg.expansions.preposterousPlaces

		for(let i = 0; i < this.obstacles.length; i++) {
			let o = this.obstacles[i];

			o.borders = [];

			if(o.type == 'hedge') { continue; }

			// obstacles are saved with their CENTER point, so startPoint + vector2(1,1)
			// now we just look at its neighbours and check if they have the property "roundabout" set to true
			let nbs = [[-1, 0], [0, -1], [1, 0], [0, 1]]
			let borders = [[-1,1], [-1,-1], [1,-1], [1,1]]
			for(let a = 0; a < nbs.length; a++) {
				let nb = nbs[a];
				let tPos = [o.center[0] + nb[0], o.center[1] + nb[1]]

				let shouldAddBorder = false
				let neighbourObstacle = this.obstacleWithCenter(tPos)

				// only add a border if it's the actual border of a set of decorations
				if(neighbourObstacle == null || this.outOfBounds(tPos)) { shouldAddBorder = true; }

				// EXCEPT when special buildings are enabled: then place borders if the neighbouring decoration is NOT the same as ours
				if(!shouldAddBorder && specialPlacesEnabled) {
					if(neighbourObstacle != null && neighbourObstacle.specialBuilding != o.specialBuilding) {
						shouldAddBorder = true;
					}
				}

				if(shouldAddBorder) {
					let border = 
					[
						o.center[0] + borders[a][0]*0.5, 
						o.center[1] + borders[a][1]*0.5,
						o.center[0] + borders[(a+1)%4][0]*0.5,
						o.center[1] + borders[(a+1)%4][1]*0.5
					]

					o.borders.push(border)
				}
			}
		}
	}

	obstacleWithCenter(pos) {
		for(let i = 0; i < this.obstacles.length; i++) {
			if(this.obstacles[i].type == 'hedge') { continue; }

			let c = this.obstacles[i].center;
			if(c[0] == pos[0] && c[1] == pos[1]) {
				return this.obstacles[i];
			}
		}

		return null
	}

	removeUglyBoxes() {
		let dirVectors = [[1,0], [2,1], [1,2], [0,1]];
		let boxNbs = [[0,0], [1,0], [1,1], [0,1]];
		let solutionTypes = ['hedge', 'roundabout'];

		let RNG = Random.seedRandom(this.cfg.seed + '-uglyBoxes');
		let specialPlacesEnabled = this.cfg.expansions.preposterousPlaces // @TODO: I repeat this variable all over the code, maybe just save it once in this.cfg?
		let roundabouts = [];

		for(let i = 0; i < this.randomCreationOrder.length; i++) {
			let pos = this.randomCreationOrder[i];
			let uData = this.getUglyBoxData(pos);

			if(!uData.isBox) { continue; }

			// first, try to MERGE the ugly box with nearby buildings with a certain probability
			let uglyBoxMerged = false;
			if(RNG() <= this.cfg.solveUglyBoxesByMergingProbability) {
				uglyBoxMerged = this.mergeUglyBox(pos, RNG);
			}

			if(uglyBoxMerged) { continue; }

			// I usually want more HEDGES than ROUNDABOUTS
			let randSolution = 'hedge';
			if(uData.hasRoundabout || RNG() <= this.cfg.roundaboutProbability) { randSolution = 'roundabout'; }

			if(randSolution == 'hedge') {
				let randDir = Math.floor(RNG() * 4);
				let vec = dirVectors[randDir];

				let start = boxNbs[randDir], end = boxNbs[(randDir + 1) % 4];

				// remember (on both sides of the hedge) that the opposite side is closed off
				this.map[pos[0] + start[0]][pos[1] + start[1]].closedSides[randDir] = true;
				this.map[pos[0] + end[0]][pos[1] + end[1]].closedSides[(randDir + 2) % 4] = true;

				// each hedge starts from the point (1,1) and just goes to one of the four directions
				let h = {
					type: randSolution,
					line: [pos[0]+1, pos[1]+1, pos[0]+vec[0], pos[1]+vec[1]],
					specialBuilding: null,
					rotation: 0
				} 

				h.rotation = Math.atan2(h.line[3] - h.line[1], h.line[2] - h.line[0])

				this.obstacles.push(h)

			} else if(randSolution == 'roundabout') {

				// remember all these cells were used for a roundabout
				for(let a = 0; a < 4; a++) {
					let tPos = [pos[0] + boxNbs[a][0], pos[1] + boxNbs[a][1]]
					this.map[tPos[0]][tPos[1]].roundabout = true;
					this.map[tPos[0]][tPos[1]].filledSquares[a+1] = true; // (a+1) just happens to be the direction that we're filling with this decoration; check the boxNbs array above and the array used in "getSquarePositionByIndex", they should match
				}

				// just drop some ornamentation in the center
				let r = {
					type: randSolution,
					center: [pos[0] + 1, pos[1] + 1],
					specialBuilding: null,
				}

				this.obstacles.push(r);
				roundabouts.push(r);
			}
		}

		// once we know all decorations, convert a certain percentage of them into special buildings (if applicable)
		if(specialPlacesEnabled) { 
			let decorationsToConvert = Math.min( Math.max(0.66*roundabouts.length, 5), roundabouts.length);
			for(let i = 0; i < decorationsToConvert; i++) {
				let type = this.getRandom(SPECIAL_BUILDINGS)

				roundabouts[i].specialBuilding = type;
			}

			// Go through all of these and check, for each Plaza, if they neighbour a decoration cell
			// If so, convert that cell to a plaza as well

			// @TODO: I use this twice in almost identical code => removeUglyBoxes() and determineDecorationBorders()
			//  => can I put it in a single function?
			let nbs = [[-1, 0], [0, -1], [1, 0], [0, 1]]
			for(let i = 0; i < this.obstacles.length; i++) {
				let o = this.obstacles[i];
				if(o.specialBuilding != 'Plaza') { continue; }

				for(let a = 0; a < 4; a++) {
					let tPos = [o.center[0] + nbs[a][0], o.center[1] + nbs[a][1] ]
					let nbObs = this.obstacleWithCenter(tPos)

					if(nbObs) { nbObs.specialBuilding = 'Plaza'; }
				}
			}

			// @TODO: keep a counter on cells with the current SIZE of their plaza?
			// @TODO: Go through all cells one more time. Any plazas with a size that is too small, are converted back into something else
		}
		
	}

	mergeUglyBox(pos, RNG) {
		let boxNbs = [[0,0], [1,0], [1,1], [0,1]];
		let success = false;
		for(let i = 0; i < boxNbs.length; i++) {
			let tPos = [pos[0] + boxNbs[i][0], pos[1] + boxNbs[i][1]]

			let buildingSide1 = this.buildingAtSide(tPos, (i+2) % 4);
			let buildingSide2 = this.buildingAtSide(tPos, (i+3) % 4);

			if(buildingSide1 && buildingSide2) {
				this.removeRoadCell(tPos);

				let randBuilding = buildingSide1;
				if(RNG() <= 0.5) { randBuilding = buildingSide2; }

				this.addToBuilding(randBuilding, tPos);
				success = true;
			}
		}

		return success;
	}

	getUglyBoxData(pos) {
		let boxNbs = [[0,0], [1,0], [1,1], [0,1]];
		let hasRoundabout = false;
		for(let i = 0; i < boxNbs.length; i++) {
			let tPos = [pos[0] + boxNbs[i][0], pos[1] + boxNbs[i][1]]

			if(this.outOfBounds(tPos) || !this.isRoad(tPos)) { return { isBox: false }; }
			if(this.sideClosed(tPos, i)) { return { isBox: false }; }

			if(this.isRoundabout(tPos)) { hasRoundabout = true; }
		}

		return { isBox: true, hasRoundabout: hasRoundabout };
	}

	buildingAtSide(pos, num) {
		let dir = this.convertIndexToDir(num);
		let tPos = [pos[0] + dir[0], pos[1] + dir[1]];

		if(this.outOfBounds(tPos)) { return null; }

		let obj = this.map[tPos[0]][tPos[1]];
		if(obj.type != 'building') { return null; }

		return this.buildings[obj.buildingIndex];
	}

	sideClosed(pos, num) {
		return (this.map[pos[0]][pos[1]].closedSides[num]);
	}

	isRoundabout(pos) {
		return (this.map[pos[0]][pos[1]].roundabout);
	}

	isRoad(pos) {
		return (this.map[pos[0]][pos[1]].type == 'road')
	}

	mergeBuildings(b1, b2) {
		for(let t = 0; t < b2.tiles.length; t++) {
			this.addToBuilding(b1, b2.tiles[t]);
		}

		this.resetToEmptyBuilding(b2);
	}

	addToBuilding(b, pos) {
		b.tiles.push(pos);

		let tile = this.map[pos[0]][pos[1]]
		tile.buildingIndex = b.index;
		tile.type = 'building';
	}

	connectedWithRoad(pos) {
		let nbs = [[1,0], [0,1], [-1,0], [0,-1]]

		for(let i = 0; i < 4; i++) {
			let nb = nbs[i];
			let tPos = [pos[0] + nb[0], pos[1] + nb[1]]

			if(this.outOfBounds(tPos)) { continue; }
			
			let obj = this.map[tPos[0]][tPos[1]];
			if(obj.type != 'road') { continue; }

			return true;
		}

		return false;
	}

	getNeighborBuildingTile(pos, maxEntrances = -1) {
		let nbs = [[1,0], [0,1], [-1,0], [0,-1]]

		this.shuffle(nbs);

		for(let i = 0; i < 4; i++) {
			let nb = nbs[i];
			let tPos = [pos[0] + nb[0], pos[1] + nb[1]]

			if(this.outOfBounds(tPos)) { continue; }

			let obj = this.map[tPos[0]][tPos[1]];
			if(obj.type != 'building') { continue; } // ignore non-buildings

			let bObj = this.buildings[obj.buildingIndex]
			if(maxEntrances > -1 && bObj.numEntrances >= maxEntrances) { continue; }
			
			return { 'pos': tPos, 'building': obj.buildingIndex, 'dir': nb };
		}

		return null;
	}

	getNeighborBuilding(type = 'connected', pos, buildingIndex) {
		let nbs = [[1,0], [0,1], [-1,0], [0,-1]]

		this.shuffle(nbs);

		for(let i = 0; i < 4; i++) {
			let nb = nbs[i];
			let tPos = [pos[0] + nb[0], pos[1] + nb[1]]

			if(this.outOfBounds(tPos)) { continue; }

			let obj = this.map[tPos[0]][tPos[1]];

			if(obj.type != 'building') { continue; } // ignore non-buildings
			if(obj.buildingIndex == buildingIndex) { continue; } // ignore tiles from the same building

			let relatedBuilding = this.buildings[obj.buildingIndex];
			if(type == 'unconnected' && !relatedBuilding.streetConnection) {
				return relatedBuilding;
			} else if(type == 'connected' && relatedBuilding.streetConnection) {
				return relatedBuilding;
			}
		}

		return null;
	}

	reserveBuildings() {
		let buildingsCopy = this.buildings.slice();
		buildingsCopy.sort(function(a,b) { if(a.tiles.length < b.tiles.length) { return 1; } else { return -1; }})

		// the biggest building is reserved as the bank
		buildingsCopy[0].type = 'bank'

		// the rest is reserved for players
		const numBuildingsToReserve = this.cfg.numPlayers;
		for(let i = 1; i < (numBuildingsToReserve + 1); i++) {
			buildingsCopy[i].type = 'reserved'
		}
	}

	placeSubway(pos) {
		let ind = this.getFreeSquareIndex(pos);
		if(ind == null) { return; }

		this.map[pos[0]][pos[1]].filledSquares[ind] = true;
		this.map[pos[0]][pos[1]].subway = { positionIndex: ind, counter: this.subwayCounter };

		this.subwayCounter++;
	}

	findDeadEnds() {
		this.deadEnds = [];

		for(let x = 0; x < this.cfg.resX; x++) {
			for(let y = 0; y < this.cfg.resY; y++) {
				let pos = [x,y]
				let obj = this.map[x][y];
				if(obj.type != 'road') { continue; }

				let orient = this.getOrientationFromNeighbours(pos);
				if(orient.frame != 0) { continue; }

				obj.deadend = true
				this.deadEnds.push(pos)
			}
		}
	}

	createSubways() {
		let SUBWAY_RNG = Random.seedRandom(this.cfg.seed + '-subways')

		// place at least ONE subway on each crossing set
		for(let i = 0; i < this.crossingSets.length; i++) {
			let s = this.crossingSets[i];
			let subwaySpots = [];

			for(let j = 0; j < s.length; j++) {
				let pos = s[j];
				if(this.map[pos[0]][pos[1]].deadend) {
					subwaySpots.push(pos);
				}
			}

			if(subwaySpots.length > 0) {
				let randDeadEnd = subwaySpots.splice(Math.floor(SUBWAY_RNG() * subwaySpots.length), 1)[0];
				this.placeSubway(randDeadEnd);
			}
		}

		// then fill out the board with the road sets (which should contain most if not all roads)
		let numRoadSets = this.roadSets.length;
		for(let i = 0; i < numRoadSets; i++) {
			let subwaySpots = [];

			for(let j = 0; j < this.roadSets[i].length; j++) {
				let pos = this.roadSets[i][j]
				let obj = this.map[pos[0]][pos[1]]
				let orient = this.getOrientationFromNeighbours(pos);

				// this subway is already placed, or it's not a dead end, so don't count it
				if(!obj.deadend || obj.subway) { continue; }

				// if this is an unused dead end, save it as a potential subway
				subwaySpots.push(pos);
			}

			// now pick a random dead end to place a subway
			let subwaysToPlace = Math.ceil(subwaySpots.length / 5.0)
			for(let j = 0; j < subwaysToPlace; j++) {
				if(subwaySpots.length <= 0) { break; }

				let randDeadEnd = subwaySpots.splice(Math.floor(SUBWAY_RNG() * subwaySpots.length), 1)[0];
				this.placeSubway(randDeadEnd);
			}
		}
	}

	generateIngredientLists() {
		// generate a huge list of ingredients; 
		// they will be placed in that order, and skipped (temporarily) whenever placement isn't suitable
		let ings = [0, 1, 2, 3, 4, 5, 6];

		this.fullIngredientList = [];
		while(this.fullIngredientList.length < this.buildings.length) {
			this.fullIngredientList = this.fullIngredientList.concat( this.shuffle(ings.slice()) )
		}

		// do the same for orders;
		// for example: a pizza wants 3 ingredients, it just picks 3 subsequent ones from the list (skipping any duplicates)
		this.fullOrderList = [];

		// 28 = 1 + 2 + ... + 6 + 7, so all possible pizza types once per player, should be enough no?
		let listMax = 28 * this.cfg.numPlayers;

		// we want orders of diverse length, so we want to know the length of the previous order and take the next one at all times
		this.orderLengthCounter = 2;

		while(this.fullOrderList.length < listMax) {
			this.fullOrderList = this.fullOrderList.concat( this.shuffle(ings.slice()) )
		}
	}

	placeEntrances() {
		this.allEntrances = [];

		let RNG = Random.seedRandom(this.cfg.seed + "-entrances");

		// IMPORTANT/REMEMBER: We may NEVER shuffle this buildings list, as that screws up the buildingIndex reference everywhere (an int, array index)
		// figure out how many non-empty buildings we have
		let numNonEmptyBuildings = 0, numSingleTileBuildings = 0;
		for(let i = 0; i < this.buildings.length; i++) {
			if(this.buildings[i].tiles.length <= 0) { continue; }
			numNonEmptyBuildings++;

			if(this.buildings[i].tiles.length <= 1) { numSingleTileBuildings++; }
		}

		// figure out number of ingredient and order buildings based on that
		// (first subtract reserved buildings and bank)
		// (also, single tile buildings are ALWAYS ingredients, so keep that in mind)
		numNonEmptyBuildings -= (this.cfg.numPlayers + 1 + 1)

		this.numIngredientBuildings = Math.round(0.66 * numNonEmptyBuildings) - numSingleTileBuildings;
		this.numOrderBuildings = numNonEmptyBuildings - this.numIngredientBuildings;

		// first do all the dead ends
		for(let i = 0; i < this.deadEnds.length; i++) {
			let de = this.deadEnds[i];
			let obj = this.map[de[0]][de[1]];

			this.placeSingleEntrance(de, obj)
		}

		// then fill it up with entrances at more random positions
		// keep trying until there are no more entrances being placed (not a perfect algorithm, but works very well in most circumstances)
		// @paramater (3rd) => if something already has X entrance(s), ignore it
		let entrancesPlacedThisRound = 0;
		do {
			entrancesPlacedThisRound = 0;

			for(let i = 0; i < this.randomCreationOrder.length; i++) {
				let pos = this.randomCreationOrder[i];
				let obj = this.map[pos[0]][pos[1]]

				if(obj.type != 'road') { continue; }

				let maxEntrances = 1 + Math.floor(RNG() * this.cfg.maxEntrancesPerBuilding)
				let result = this.placeSingleEntrance(pos, obj, maxEntrances)

				if(result) { entrancesPlacedThisRound++; }
			}
		} while(entrancesPlacedThisRound > 0);
	}

	createRandomOrder() {
		let order = [];
		let numIngredients = this.orderLengthCounter;

		for(let i = 0; i < numIngredients; i++) {

			let newIng, counter = -1, duplicate = false;
			do {
				counter++;

				if(counter >= this.fullOrderList.length) {
					newIng = null;
					break;
				}

				newIng = this.fullOrderList[counter];
				duplicate = order.includes(newIng);
			} while(duplicate);

			if(newIng == null) { continue; }

			order.push(newIng);
			this.fullOrderList.splice(counter, 1);
		}

		this.orderLengthCounter = (this.orderLengthCounter + 1) % 8
		if(this.orderLengthCounter <= 0) { this.orderLengthCounter = 2; }

		return order;
	}

	placeSingleEntrance(pos, obj, maxEntrances = -1) {
		// find connected neighbour building (returns an object with some useful properties)
		let b = this.getNeighborBuildingTile(pos, maxEntrances);

		// no building around us? continue!
		if(b == null) { return false; }

		// now inform the building
		let buildingIndex = b.building
		let bObj = this.buildings[buildingIndex]
		bObj.numEntrances++;

		// if the building has NOT been claimed as a specific type yet ...
		if(bObj.type == '') {
			if(this.numIngredientBuildings > 0 || bObj.tiles.length <= 1) {
				bObj.type = 'ingredient'
				bObj.ingredient = this.pickSuitableIngredient(pos)
				bObj.centerCellData = this.pickCenterCellAndNeighbour(bObj)

				// at the original calculation, we took into account that we'd get ALL single tile buildings from orders
				// so if that's not the case (this building was ours anyway, not an order building), undo the decrement
				if(this.numIngredientBuildings > 0 && bObj.tiles.length <= 1) {
					this.numIngredientBuildings++;
				}

				this.numIngredientBuildings--;
			} else {
				bObj.type = 'order'
				bObj.order = this.createRandomOrder();

				this.numOrderBuildings--;
			}
		}

		// place entrance such that it connects with that building
		let ing = bObj.ingredient
		let pizzaOrder = bObj.order
		let dirIndex = this.convertDirToIndex(b.dir)

		obj.filledSquares[dirIndex] = true;
		let entrancePos = this.getSquarePositionOnCell(pos, dirIndex, false);

		obj.entrance = { 'pos': entrancePos, 'building': b.building, 'ingredient': ing, 'order': pizzaOrder  }

		this.allEntrances.push(obj);

		return true;
	}

	getSquarePositionOnCell(pos, ind, center = true) {
		let offsets = [[1,-1], [1,1], [-1, 1], [-1,-1]]
		let offset = offsets[ind]
		let newPos = [pos[0] + 0.5 + 0.25*offset[0], pos[1] + 0.5 + 0.25*offset[1]]

		if(center) {
			return newPos;
		} else {
			return [newPos[0] - 0.25, newPos[1] - 0.25]
		}
		
	}

	pickSuitableIngredient(b) {
		// keep trying ingredients further up the chain, until we find a suitable one
		let counter = -1, suitable = false, ingredient = -1; 
		do {
			counter++;

			if(counter >= this.fullIngredientList.length) {
				ingredient = this.fullIngredientList[0];
				counter = 0;
				break;
			}

			ingredient = this.fullIngredientList[counter];

			let closestEntranceOfSameType = this.distanceToSameEntrance(b, ingredient)
			suitable = (closestEntranceOfSameType > this.cfg.ingredientBuildingMinimumDistance)
		} while (!suitable);

		// then remove that from the list and return it
		this.fullIngredientList.splice(counter, 1)
		return ingredient;
	}

	distanceToSameEntrance(pos, ing) {
		let minDist = Infinity;
		for(let i = 0; i < this.allEntrances.length; i++) {
			let e = this.allEntrances[i];

			// NOTE: "e" is a TILE on the map, not a BUILDING => its "entrance" property holds info about the entrance (duh)
			if(e.entrance.ingredient != ing) { continue; }

			minDist = Math.min(minDist, Math.abs(e.pos[0] - pos[0]) + Math.abs(e.pos[1] - pos[1]))
		}

		return minDist;
	}

	convertBuildingsWithoutEntrance() {
		let specialPlacesEnabled = this.cfg.expansions.preposterousPlaces

		for(let i = 0; i < this.buildings.length; i++) {
			let buildingObj = this.buildings[i]

			if(buildingObj.tiles.length <= 0) { continue; }
			if(buildingObj.numEntrances > 0) { continue; }
			if(buildingObj.type != '') { continue; }

			// if we have the special places/buildings expansion enabled
			// we want to replace these buildings with special ones
			if(specialPlacesEnabled) {
				let randSpecialType = this.getRandom(SPECIAL_BUILDINGS);

				buildingObj.type = 'special';
				buildingObj.special = randSpecialType;

				buildingObj.centerCellData = this.pickCenterCellAndNeighbour(buildingObj)

			// otherwise, just ..
			// merge these buildings with a neighbour building (if it exists)
			// if no merge is possible, just set the building to 'reserved' ( = empty)
			} else {
				// @TODO: Make this a general function, because we also call the exact same thing multiple times during other algorithms
				let buildingIndex = buildingObj.index;

				for(let t = 0; t < buildingObj.tiles.length; t++) {
					let pos = buildingObj.tiles[t]
					let nb = this.getNeighborBuilding('connected', pos, buildingIndex);

					if(nb == null) { 
						buildingObj.type = 'reserved' 
					} else {
						this.mergeBuildings(nb, buildingObj);
					}
				}
			}
		}
	}

	getRandomPolicePoint() {
		let x,y
		let invalidPoint = false;
		let tries = 0, maxTries = 200;
		do {
			x = Math.floor(this.RAND_POINT_RNG() * this.cfg.resX);
			y = Math.floor(this.RAND_POINT_RNG() * this.cfg.resY);

			invalidPoint = (this.map[x][y].type != 'road') || this.map[x][y].police || (this.distanceToClosestPolice([x,y]) <= this.cfg.minDistancePoliceIcons);
			tries++;
		} while(invalidPoint && tries < maxTries);

		if(tries >= maxTries) { return null; }

		return [x, y]
	}

	distanceToClosestPolice(posA) {
		let dist = Infinity;
		for(let i = 0; i < this.policeCells.length; i++) {
			let posB = this.policeCells[i];
			dist = Math.min(dist, Math.abs(posA[0]-posB[0]) + Math.abs(posA[1]-posB[1]))
		}

		return dist;
	}

	getFreeSquareIndex(pos) {
		return this.getRandomFalseValue(this.map[pos[0]][pos[1]].filledSquares)
	}

	// @TODO: This is almost a copy of the getOrientationFromNeighbour function, make general to avoid repeating myself?
	getEmptySide(pos) {
		let nbs = [[1,0], [0,1], [-1,0], [0,-1]]
		let tempArr = [];

		let obj = this.map[pos[0]][pos[1]]
		for(let i = 0; i < 4; i++) {
			if(obj.closedSides[i]) { continue; }

			let nb = nbs[i];
			let tPos = [pos[0] + nb[0], pos[1] + nb[1]]

			if(this.outOfBounds(tPos)) { continue; }

			let tempObj = this.map[tPos[0]][tPos[1]];

			if(tempObj.type == 'road') { tempArr.push(i) }
		}

		if(tempArr.length <= 0) { return null; }
		return tempArr[Math.floor(this.RANDOM_SQUARE_RNG() * tempArr.length)]
	}

	getRandomFalseValue(arr) {
		let tempArr = [];

		// go through all squares; if they are free (filled = false), add to temporary array
		// then just return a random element from that
		for(let i = 0; i < arr.length; i++) {
			if(!arr[i]) { tempArr.push(i); }
		}

		if(tempArr.length <= 0) { return null; }

		return tempArr[Math.floor(this.RANDOM_SQUARE_RNG() * tempArr.length)];
	}

	placePizzaPolice() {
		this.policeCells = [];

		this.shuffle(this.possiblePolicePoints);

		const numPolice = Math.max(Math.round(this.possiblePolicePoints.length*this.cfg.policeFactor), 1.0);

		let pos
		for(let i = 0; i < numPolice; i++) {
			if(this.possiblePolicePoints.length > 0) {
				pos = this.possiblePolicePoints.splice(0, 1)[0];
			} else {
				pos = this.getRandomPolicePoint();
			}

			if(pos == null) { break; }

			let ind = this.getFreeSquareIndex(pos);
			if(ind == null) { continue; }

			this.policeCells.push(pos);

			this.map[pos[0]][pos[1]].filledSquares[ind] = true;
			this.map[pos[0]][pos[1]].police = { positionIndex: ind };
		}
	}

	distanceToClosestTrafficSign(posA) {
		let dist = Infinity;
		for(let i = 0; i < this.trafficSigns.length; i++) {
			let posB = this.trafficSigns[i].pos;
			dist = Math.min(dist, Math.abs(posA[0]-posB[0]) + Math.abs(posA[1]-posB[1]))
		}

		return dist;
	}

	getRandomTrafficPoint(type) {
		let isGate = TRAFFIC_SIGNS[type].gate;
		let x,y
		let invalidPoint = false;
		let tries = 0, maxTries = 200;
		do {
			x = Math.floor(this.RAND_POINT_RNG() * this.cfg.resX);
			y = Math.floor(this.RAND_POINT_RNG() * this.cfg.resY);

			invalidPoint = (this.map[x][y].type != 'road') || this.map[x][y].trafficSign || (this.distanceToClosestTrafficSign([x,y]) <= this.cfg.minDistanceTrafficSigns);
			tries++;
			
			// if the point still seems valid, check one last item, depending on the type of traffic sign
			// It's invalid if ...
			//  => NO GATE? The cell has NO free squares to use
			//  => GATE? The cell has NO empty sides to use
			if(!invalidPoint) {
				if(isGate) {
					// NOTE: We also disallow gates on roundabout cells, because those are only half-width
					// However, this severely restricts placement, so maybe we want ...
					// @TODO: Be more precise with checking this SIDE/EDGE overlaps with a DECORATION
					invalidPoint = this.map[x][y].roundabout || (this.getEmptySide([x,y]) == null)
				} else {
					invalidPoint = (this.getFreeSquareIndex([x,y]) == null)
				}
			}
		} while(invalidPoint && tries < maxTries);

		if(tries >= maxTries) { return null; }

		return [x, y]
	}

	placeTrafficSigns() {
		const numSigns = this.cfg.numTrafficSigns;

		this.trafficSigns = [];

		for(let i = 0; i < numSigns; i++) {
			let randType = this.getRandom(TRAFFIC_SIGNS);
			let pos = this.getRandomTrafficPoint(randType);

			if(pos == null) { break; }

			let obj = { pos: pos, type: randType, side: -1, ind: -1 }
			if(TRAFFIC_SIGNS[randType].gate) {
				let side = this.getEmptySide(pos);
				obj.side = side;

				// NOTE: We don't "fill/close" the side, because that would mess with showing the correct road orientation and sprite
			} else {
				let ind = this.getFreeSquareIndex(pos);
				obj.ind = ind

				this.map[pos[0]][pos[1]].filledSquares[ind] = true;
			}

			this.trafficSigns.push(obj)
			this.map[pos[0]][pos[1]].trafficSign = true;
		}
	}

	swapSpecialIngredients() {
		let RNG = Random.seedRandom(this.cfg.seed + "-specialIngredients");

		// find DUPLICATE ingredient buildings; save them as possibilities for swapping
		let ingredientsCovered = [false, false, false, false, false, false, false]
		let possibleSwapBuildings = [];
		let orderBuildings = [];

		// to make sure we evaluate buildings in a random order
		// AND to give the regular ingredients the LARGEST buildings (with the most entrances)...
		let buildingsCopy = this.buildings.slice();
		this.shuffle(buildingsCopy);
		buildingsCopy.sort(function(a,b) { if(a.tiles.length < b.tiles.length) { return 1; } else { return -1; }})

		for(let i = 0; i < buildingsCopy.length; i++) {
			let b = buildingsCopy[i];
			let ing = b.ingredient

			if(b.tiles.length <= 0) { continue; }
			if(ing == null) { 
				// do NOT include the largest pizza, as players have no use for a 12-dollar pizza in this game
				if(b.order != null && b.order.length < 7) {
					orderBuildings.push(b);
				}
				continue; 
			}

			if(!ingredientsCovered[ing]) {
				ingredientsCovered[ing] = true;
			} else {
				possibleSwapBuildings.push(b)
			}
		}

		// now swap the buildings with ingredients from the expansion
		// 1) we swap roughly 66% of the possible buildings
		// 2) if we have less than 7 spaces, we prevent repeating ourselves => after that, they are just drawn randomly
		let numSpecialIngredientsWanted = Math.min(Math.max(possibleSwapBuildings.length * 0.66, 1))
		for(let i = 0; i < numSpecialIngredientsWanted; i++) {
			let b = possibleSwapBuildings[i];
			let type, frame

			if(this.specialIngredientsIncluded.length < 7) {
				do {
					type = this.getRandom(SPECIAL_INGREDIENTS)
					frame = SPECIAL_INGREDIENTS[type].iconFrame
				} while(this.specialIngredientsIncluded.includes(frame));

				this.specialIngredientsIncluded.push(frame);
			} else {
				type = this.getRandom(SPECIAL_INGREDIENTS)
				frame = SPECIAL_INGREDIENTS[type].iconFrame
			}

			b.ingredient = frame;

			// if we added the "required side dish", also add that to some of the existing orders
			let requiredSideDish = SPECIAL_INGREDIENTS[type].requiredSideDish
			if(requiredSideDish && orderBuildings.length > 0) {
				let randOrderBuilding = orderBuildings.splice(Math.floor(RNG()*orderBuildings.length), 1)[0];
				randOrderBuilding.sideDishes.push(type)
			}
		}
	}

	placeSpecialBuildings() {
		// @TODO: Find all decorations. Replace small groups (1-3) with random buildings, large groups with PLAZAS
		//  => This means the "border detection"/"group detection" must happen before this ... but also again afterward?

		// @TODO: Add some more decorations + functional sprites to the road squares that do cool stuff
	}

	visualizeGame() {
		const roadGraphics = this.add.graphics();
		const gridGraphics = this.add.graphics();

		const shadowGraphics = this.add.graphics();
		const buildingGraphics = this.add.graphics();
		buildingGraphics.depth = 10;

		const overlayGraphics = this.add.graphics();

		const cs = this.cfg.cellSize

		//
		// Draw some nice grid lines
		// We go _half resolution_ here, to give each square 4 quadrants
		//
		gridGraphics.lineStyle(2, 0x000000, 0.2);
		for(let x = 0; x < this.cfg.resX; x += 0.5) {
			let line = new Geom.Line(x * cs, 0, x * cs, this.cfg.resY * cs);
			gridGraphics.strokeLineShape(line);
		}

		for(let y = 0; y < this.cfg.resY; y += 0.5) {
			let line = new Geom.Line(0, y * cs, this.cfg.resX * cs, y * cs);
			gridGraphics.strokeLineShape(line);
		}

		let fontSize = cs*0.5*0.5;
		const strokeThickness = 0.15*fontSize;
		let subwayTextCfg = {
			fontFamily: 'Leckerli One',
			fontSize: fontSize + 'px',
			color: '#FFFFFF',
			stroke: '#6C0003',
			strokeThickness: strokeThickness
		}

		//
		// Go through all cells, create a graphic based on what they are
		//
		for(let x = 0; x < this.cfg.resX; x++) {
			for(let y = 0; y < this.cfg.resY; y++) {
				let obj = this.map[x][y];
				let rect = new Geom.Rectangle(x * cs, y * cs, cs, cs)

				let color = 0xEEEEEE

				// @TODO: check where crossings start
				/*if(obj.subType == 'crossing') {
					color = 0x999999;
				}*/

				if(this.cfg.inkFriendly) {
					color = 0xFFFFFF;
				}


				if(obj.type == 'road') {
					let roadmark = this.add.sprite(rect.x + 0.5*cs, rect.y + 0.5*cs, 'roadmarks');
					roadmark.displayWidth = roadmark.displayHeight = cs;
					roadmark.setOrigin(0.5, 0.5)
					roadmark.alpha = 0.75;

					let orient = this.getOrientationFromNeighbours([x, y]);
					roadmark.setFrame(orient.frame);
					roadmark.rotation = orient.rotation

					roadGraphics.fillStyle(color, 1.0);
					roadGraphics.fillRectShape(rect);


					let margin = this.cfg.borderWidth

					// If this has a subway, place its sprite
					if(obj.subway) {
						let subwayPos = this.getSquarePositionOnCell([x,y], obj.subway.positionIndex, true);

						let sprite = this.add.sprite(subwayPos[0]*cs, subwayPos[1]*cs, 'decorations');
						sprite.displayWidth = sprite.displayHeight = (0.5-margin)*cs;
						sprite.setFrame(1);
						sprite.setOrigin(0.5, 0.5);
						sprite.depth = 5;

						let txt = this.add.text(sprite.x, sprite.y, (obj.subway.counter + 1), subwayTextCfg);
						txt.setOrigin(0.5, 0.5);
						txt.depth = 6;
					}

					if(obj.entrance) { this.visualizeEntrance(obj, roadGraphics) }

					if(obj.police) {
						
						let policePos = this.getSquarePositionOnCell([x,y], obj.police.positionIndex, true);

						let sprite = this.add.sprite(policePos[0]*cs, policePos[1]*cs, 'general_icons');
						sprite.displayWidth = sprite.displayHeight = (0.5-margin)*cs;
						sprite.setOrigin(0.5, 0.5);
						sprite.setFrame(1);
						sprite.depth = 5;
					}


				} else if(obj.type == 'building') {

					let buildingObj = this.buildings[obj.buildingIndex]

					if(buildingObj.type == 'ingredient') {
						color = this.cfg.buildingColorDict[buildingObj.ingredient]
					} else if(buildingObj.type == 'order') {
						color = 0x91ACFF
					} else if(buildingObj.type == 'reserved' || buildingObj.type == 'bank') {
						color = 0xFFFFFF
					} else if(buildingObj.type == 'special') {
						color = SPECIAL_BUILDINGS[buildingObj.special].color;
					} else {
						color = 0x333333
					}
					
					if(!buildingObj.streetConnection) {
						color = 0x666666
					}

					if(this.cfg.inkFriendly) {
						color = 0xFFFFFF;
					}

					buildingGraphics.fillStyle(color, 1.0);
					buildingGraphics.fillRectShape(rect);

					// draw the ingredient icon on all cells within the building
					// or, if it's a special building, draw its special icon
					// EXCEPTION: on inkFriendly mode, only draw it for the center cell
					if(buildingObj.type == 'ingredient' || buildingObj.type == 'special') {
						if(!this.cfg.inkFriendly || (x == buildingObj.centerCellData.cell[0] && y == buildingObj.centerCellData.cell[1])) {

							let ingredientSprite;
							if(buildingObj.type == 'ingredient') {
								ingredientSprite = this.add.sprite(rect.x + 0.5*cs, rect.y + 0.5*cs, 'ingredients')
								ingredientSprite.setFrame(buildingObj.ingredient)
							} else {
								ingredientSprite = this.add.sprite(rect.x + 0.5*cs, rect.y + 0.5*cs, 'special_buildings');
								ingredientSprite.setFrame(SPECIAL_BUILDINGS[buildingObj.special].iconFrame)
							}
							ingredientSprite.displayWidth = ingredientSprite.displayHeight = cs * this.cfg.ingredientSpriteScale;

							ingredientSprite.setOrigin(0.5, 0.5)
							ingredientSprite.depth = 15;
						}
					}

					// draw a shadow by moving the rect slightly off
					if(!this.cfg.inkFriendly) {
						let shadowOffset = this.cfg.borderWidth*this.cfg.cellSize;
						let shadowRect = Geom.Rectangle.Clone(rect);
						shadowRect.setPosition(rect.x + shadowOffset, rect.y + shadowOffset)

						shadowGraphics.fillStyle(0x000000, 0.3);
						shadowGraphics.fillRectShape(shadowRect);
					}
				}

				
			}
		}

		//
		// Draw all building borders
		//
		const borderWidth = this.cfg.borderWidth*this.cfg.cellSize;
		for(let a = 0; a < this.buildings.length; a++) {
			for(let i = 0; i < this.buildings[a].borders.length; i++) {
				let b = this.buildings[a].borders[i];

				// b is an ARRAY [startCorner, endCorner], where each corner is of format [x,y]
				// API: new Geom.Line(x1, y1, x2, y2)
				let line = new Geom.Line(b[0][0] * cs, b[0][1] * cs, b[1][0] * cs, b[1][1] * cs);

				buildingGraphics.lineStyle(borderWidth, 0x000000, 1.0);
				buildingGraphics.strokeLineShape(line);
			}
		}

		//
		// Draw decorations (hedges & roundabouts)
		//
		this.visualizeDecorations(buildingGraphics, overlayGraphics);

		//
		// Draw orders (on buildings that have them)
		//
		this.visualizeOrders();

		//
		// Draw bank icon on the bank
		// ( + draw seed within it)
		//
		let obj = this.pickCenterCellAndNeighbour(this.cfg.bankBuilding)
		let randTile = obj.cell, randNeighbour = obj.buildingCellsAround[Math.floor(this.RANDOM_DRAW_RNG() * obj.buildingCellsAround.length)]

		let sprite = this.add.sprite((randTile[0]+0.5) * cs, (randTile[1] + 0.5) * cs, 'general_icons')
		sprite.setFrame(0)
		sprite.displayWidth = sprite.displayHeight = cs * this.cfg.ingredientSpriteScale;
		sprite.setOrigin(0.5, 0.5)
		sprite.depth = 15;

		const seedFontSize = 16 * (this.canvas.width / 1160.0);
		let seedTextCfg = {
			fontFamily: 'Leckerli One',
			fontSize: seedFontSize + 'px',
			color: '#AAAAAA',
			wordWrap: { width: cs, useAdvancedWrap: true }
		}

		let txt = this.add.text((randNeighbour[0] + 0.5)*cs, (randNeighbour[1] + 0.5)*cs, '' + this.cfg.seed, seedTextCfg);
		txt.setOrigin(0.5, 0.5)
		txt.depth = 15;

		//
		// Draw traffic signs
		//
		if(this.trafficSigns != undefined) { this.visualizeTrafficSigns() }

		//
		// Draw movement shapes
		//

		let rectStart = [this.cfg.resX-this.cfg.shapeRectSize[0], this.cfg.resY-this.cfg.shapeRectSize[1]]

		// Big background rectangle
		let rect = new Geom.Rectangle(rectStart[0]*cs, rectStart[1]*cs, this.cfg.shapeRectSize[0]*cs, this.cfg.shapeRectSize[1]*cs);

		overlayGraphics.fillStyle(0xFFCCCC, 1.0);
		overlayGraphics.lineStyle(this.cfg.borderWidth*cs, 0x330000, 1.0);

		overlayGraphics.fillRectShape(rect);
		overlayGraphics.strokeRectShape(rect);

		// Draw shapes individually
		let moveShapeSize = 0.8*cs
		for(let i = 0; i < this.shapes.length; i++) {
			let row = Math.floor(i / this.cfg.shapeRectSize[0])
			let col = i % this.cfg.shapeRectSize[0]

			let sprite = this.add.sprite((rectStart[0]+0.5+col)*cs, (rectStart[1] + 0.5+row)*cs, 'shapes');
			sprite.displayWidth = sprite.displayHeight = moveShapeSize;
			sprite.setOrigin(0.5, 0.5);
			sprite.setFrame(this.shapes[i]);

			sprite.depth = 20;
		}

		// draw hint about picking UNIQUE shapes
		let hintMargin = 4;
		let hint = this.add.sprite(rect.x + 0.5*rect.width, rect.y + rect.height - hintMargin, 'unique_shapes_hint')
		hint.displayWidth = 0.6*moveShapeSize;
		hint.displayHeight = (160.0/400.0) * hint.displayWidth;
		hint.setOrigin(0.5, 1);

		hint.depth = 22;
		hint.alpha = 0.66;

		//
		// Some extra filters and modifications if inkFriendly is on?
		//
	}

	visualizeEntrance(obj, roadGraphics) {
		const cs = this.cfg.cellSize;
		const specialPlacesEnabled = this.cfg.expansions.preposterousPlaces;

		let entData = obj.entrance
		let rectEntrance = new Geom.Rectangle(entData.pos[0] * cs, entData.pos[1] * cs, 0.5*cs, 0.5*cs)
		let connectedBuilding = this.buildings[entData.building]

		// copy color from the building we're connected to
		// otherwise default to a light blue
		// NOTE: Ingredients can be changed on buildings, so this value is NOT necessarily the same as entData.ingredient
		let color = 0xCCCCFF;
		let realIngredient = connectedBuilding.ingredient
		if(realIngredient != null) { color = this.cfg.buildingColorDict[realIngredient] }
		
		if(connectedBuilding.type == 'reserved') { color = 0xFFEEDA; } // restaurants get a light brown/beige-ish tint
		if(connectedBuilding.type == 'bank') { color = 0xC5C1C1; } // banks get a light gray

		// banks and restaurants only get an entrance if special places are enabled
		if((connectedBuilding.type == 'bank' || connectedBuilding.type == 'reserved') && !specialPlacesEnabled) { return; }

		roadGraphics.fillStyle(color, 1.0);
		roadGraphics.fillRectShape(rectEntrance);

		// determine if this entrance should display some sort of sprite
		let entSprite = null;
		if(entData.ingredient != null) {
			entSprite = this.add.sprite(rectEntrance.x + 0.5*rectEntrance.width, rectEntrance.y + 0.5*rectEntrance.width, 'ingredients')
			entSprite.setFrame(realIngredient)
		} 

		if(connectedBuilding.type == 'bank') {
			entSprite = this.add.sprite(rectEntrance.x + 0.5*rectEntrance.width, rectEntrance.y + 0.5*rectEntrance.width, 'general_icons')
			entSprite.setFrame(0)
		} else if(connectedBuilding.type == 'reserved'){
			entSprite = this.add.sprite(rectEntrance.x + 0.5*rectEntrance.width, rectEntrance.y + 0.5*rectEntrance.width, 'general_icons')
			entSprite.setFrame(3)
		}

		// if some sprite was created, set the correct settings
		if(entSprite != null) {
			entSprite.displayWidth = entSprite.displayHeight = rectEntrance.width * this.cfg.ingredientSpriteScale
			entSprite.setOrigin(0.5, 0.5)
			entSprite.alpha = 0.75;

		}
	}

	visualizeTrafficSigns() {
		const cs = this.cfg.cellSize;

		const fontSize = 20 * (this.canvas.width / 1160.0);
		let gateTextCfg = {
			fontFamily: 'Leckerli One',
			fontSize: fontSize + 'px',
			color: '#AAAAAA',
		}

		for(let i = 0; i < this.trafficSigns.length; i++) {
			let obj = this.trafficSigns[i];
			let dictObj = TRAFFIC_SIGNS[obj.type]

			// IT'S A GATE!
			if(dictObj.gate) {
				let pos = [ 
					obj.pos[0] + 0.5 + 0.5*Math.cos(obj.side * 0.5 * Math.PI),
					obj.pos[1] + 0.5 + 0.5*Math.sin(obj.side * 0.5 * Math.PI)
				]

				let sprite = this.add.sprite(pos[0]*cs, pos[1]*cs, 'traffic_signs');
				sprite.displayWidth = sprite.displayHeight = cs;
				sprite.setOrigin(0.5, 0.5);
				sprite.setFrame(dictObj.iconFrame);
				sprite.rotation = obj.side * 0.5 * Math.PI;

				sprite.depth = 5;

				if(obj.type == 'Line Gate') {
					// Place low number inside
					let string = Math.floor(this.TRAFFIC_SIGN_RNG()*2)+1

					// The higher the player count, the more likely you are to get a 3
					// (we need that, otherwise there's just not enough room for all lines)
					if(this.TRAFFIC_SIGN_RNG() <= this.cfg.numPlayers*0.025) { string = 3; }

					gateTextCfg.color = '#2D0B37';

					let txt = this.add.text(sprite.x, sprite.y, string, gateTextCfg);
					txt.setOrigin(0.5, 0.5)
					txt.depth = 6;

				} else if(obj.type == 'Ingredient Gate' || obj.type == 'Smuggler Gate') {
					// Place random ingredient inside
					let randIngredient = Math.floor(this.TRAFFIC_SIGN_RNG()*7);
					if(this.TRAFFIC_SIGN_RNG() <= (this.specialIngredientsIncluded.length)/14) {
						randIngredient = this.specialIngredientsIncluded[Math.floor(this.TRAFFIC_SIGN_RNG()*this.specialIngredientsIncluded.length)];
					}

					let sprite2 = this.add.sprite(sprite.x, sprite.y, 'ingredients');
					sprite2.displayWidth = sprite.displayHeight = 0.35*cs;
					sprite2.setFrame(randIngredient);
					sprite2.setOrigin(0.5, 0.5);
					sprite2.depth = 6;

					// If smuggler, add (small, randomly rotated) cross icon on top
					if(obj.type == 'Smuggler Gate') {
						let cross = this.add.sprite(sprite.x + 0.075*cs, sprite.y - 0.075*cs, 'general_icons');
						cross.displayWidth = cross.displayHeight = 0.2*cs;
						cross.setFrame(2);
						cross.setOrigin(0.5, 0.5);

						cross.rotation = Math.random()*0.5*Math.PI - 0.25*Math.PI;
						cross.depth = 7;
					}


				} else if(obj.type == 'Backpack Gate') {
					// Add number + "<" or ">" sign
					let string = '';
					if(this.TRAFFIC_SIGN_RNG() <= 0.5) {
						string = '<' + (Math.floor(this.TRAFFIC_SIGN_RNG()*5) + 3)
					} else {
						string = '>' + (Math.floor(this.TRAFFIC_SIGN_RNG()*4) + 1)
					}

					gateTextCfg.color = '#166332';

					let txt = this.add.text(sprite.x, sprite.y, string, gateTextCfg);
					txt.setOrigin(0.5, 0.5)
					txt.depth = 6;
				}

			// NOT A GATE; just a regular sign, display inside the designated square
			} else {
				let margin = this.cfg.borderWidth
				let pos = this.getSquarePositionOnCell(obj.pos, obj.ind, true);

				let sprite = this.add.sprite(pos[0]*cs, pos[1]*cs, 'traffic_signs');
				sprite.displayWidth = sprite.displayHeight = (0.5-margin)*cs;
				sprite.setOrigin(0.5, 0.5);
				sprite.setFrame(dictObj.iconFrame);

				sprite.depth = 5;
				sprite.alpha = 0.75;
			}

		}
	}

	visualizeDecorations(buildingGraphics, overlayGraphics) {
		const cs = this.cfg.cellSize;

		let DECORATION_RNG = Random.seedRandom(this.cfg.seed + "-decorations");
		let numRoundaboutDecorations = 4;
		for(let i = 0; i < this.obstacles.length; i++) {
			let o = this.obstacles[i];

			if(o.type == 'hedge') {
				let h = o.line;
				let line = new Geom.Line(h[0] * cs, h[1] * cs, h[2] * cs, h[3] * cs);

				let sprite = this.add.sprite(h[0] * cs, h[1] * cs, 'decorations');
				sprite.displayWidth = sprite.displayHeight = cs;
				sprite.setFrame(0);
				sprite.setOrigin(0.0, 0.5);
				sprite.rotation = o.rotation;
				sprite.depth = 15;

				buildingGraphics.lineStyle(this.cfg.borderWidth*cs, 0x006600, 1.0);
				buildingGraphics.strokeLineShape(line);
			
			} else if(o.type == 'roundabout') {
				let rect = new Geom.Rectangle((o.center[0] - 0.5) * cs, (o.center[1]-0.5) * cs, cs, cs);

				// if special places are enabled, we use all roundabouts for special buildings
				// otherwise, pick a random decoration/roundabout sprite to display
				let sprite, color, strokeColor
				if(o.specialBuilding != null) {
					let buildingType = o.specialBuilding

					sprite = this.add.sprite(o.center[0]*cs, o.center[1]*cs, 'special_buildings');
					sprite.setFrame(SPECIAL_BUILDINGS[buildingType].iconFrame);

					color = SPECIAL_BUILDINGS[buildingType].color;
					strokeColor = 0x000000;

					sprite.displayWidth = sprite.displayHeight = this.cfg.ingredientSpriteScale * cs;

					// lower opacity on open field, both to signal its function (cross it any way you like) and make player lines more readable
					if(buildingType == 'Plaza') { sprite.alpha = 0.55; }
				} else {
					sprite = this.add.sprite(o.center[0]*cs, o.center[1]*cs, 'decorations');
					sprite.setFrame(Math.floor(DECORATION_RNG() * numRoundaboutDecorations) + 2);
					
					color = 0x9EFB7B;
					strokeColor = 0x0E5E00;

					sprite.displayWidth = sprite.displayHeight = cs;
				}


				// just some random depth values so that: SPRITE is on top of everything, but RECTANGLE behind it is also on top of road
				sprite.depth = 20;
				overlayGraphics.depth = 19;

				// ink-friendly maps get a WHITE background and LIGHTGRAY border on decorations
				// otherwise we get a LIGHT GREEN + DARK GREEN combo
				if(!this.cfg.inkFriendly) {
					overlayGraphics.fillStyle(color, 1.0);
					overlayGraphics.lineStyle(this.cfg.borderWidth*cs, strokeColor, 1.0);
				} else {
					overlayGraphics.fillStyle(0xFFFFFF, 1.0);
					overlayGraphics.lineStyle(this.cfg.borderWidth*cs, 0xCCCCCC, 1.0);
				}

				overlayGraphics.fillRectShape(rect);

				// draw borders individually (because it's ugly to get borders between two adjacent decoration elements)
				for(let b = 0; b < o.borders.length; b++) {
					let border = o.borders[b];

					let line = new Geom.Line(border[0]*cs, border[1]*cs, border[2]*cs, border[3]*cs);
					overlayGraphics.strokeLineShape(line);
				}
			}
		}
	}

	visualizeOrders() {
		const cs = this.cfg.cellSize;
		const fontSize = 16 * (this.canvas.width / 1160.0);
		const priceTextCfg = {
			fontFamily: 'Leckerli One',
			fontSize: fontSize + 'px',
			color: '#003636',
			//stroke: '#010101',
			//strokeThickness: 2,
		}

		this.cfg.bankBuilding = null;

		let DRAW_RNG = Random.seedRandom(this.cfg.seed + '-drawStuff')
		for(let i = 0; i < this.buildings.length; i++) {
			let b = this.buildings[i];

			if(b.type == 'bank') { this.cfg.bankBuilding = b; continue; }
			if(b.type != 'order') { continue; }

			let obj = this.pickCenterCellAndNeighbour(b)
			let cell = obj.cell, buildingCellsAround = obj.buildingCellsAround

			// get order, add crust at the start
			let order = b.order.slice()
			order.unshift(-1);

			// generate sprites for the order, place on top of cell
			for(let o = 0; o < order.length; o++) {
				let sprite = this.add.sprite((cell[0] + 0.5) * cs, (cell[1] + 0.5) * cs, 'crust')
				sprite.setFrame(order[o] + 1);
				sprite.displayWidth = sprite.displayHeight = cs * this.cfg.ingredientSpriteScale;
				sprite.setOrigin(0.5, 0.5);
				sprite.depth = 15;
			}

			// generate sprites for the sideDishes as well
			for(let sd = 0; sd < b.sideDishes.length; sd++) {
				let data = SPECIAL_INGREDIENTS[b.sideDishes[sd]]

				let sprite = this.add.sprite((cell[0] + 0.5) * cs, (cell[1] + 0.5) * cs, 'ingredients')
				sprite.setFrame(data.iconFrame);
				sprite.displayWidth = sprite.displayHeight = 0.4*cs;
				sprite.setOrigin(0.5, 0.5);
				sprite.depth = 15;


				sprite.x += data.iconOffset[0]*cs;
				sprite.y += data.iconOffset[1]*cs;
			}

			// place a price tag underneath
			
			// the price is equal to the number of ingredients (including crust)
			// HOWEVER we lower the price on the lowest pizzas, and raise it on the highest ones, to give players incentive to go for that
			let price = order.length; 
			let lowCutOff = 0.5/order.length, highCutOff = 1.0 - 0.25*order.length/8.0
			let rand = DRAW_RNG()
			if(rand <= lowCutOff) {
				price--;
			} else if(rand >= highCutOff) {
				price++; 					    			
			}

			if(order.length == 8) { price = 10; }

			/*if(order.length == 2) { price = 1; }
			if(order.length == 3) { if(DRAW_RNG() <= 0.5) { price = 2; } else { price = 3; } }
			if(order.length == 7) { price = 8; }
			if(order.length == 8) { price = 10; }*/

			// also add 2 money for each (required) side dish
			price += b.sideDishes.length*2;

			let randNeighbourCell = buildingCellsAround[Math.floor(DRAW_RNG() * buildingCellsAround.length)]
			let txt = this.add.text((randNeighbourCell[0] + 0.5) * cs, (randNeighbourCell[1] + 0.5) * cs, '$' + price, priceTextCfg)
			txt.setOrigin(0.5, 0.5)
			txt.depth = 15;

			// place a courier icon underneath THAT (to remind players they get a new courier for delivering)
			let courierSprite = this.add.sprite(txt.x, txt.y + 8 - 0.13*cs, 'general_icons');
			courierSprite.displayWidth = courierSprite.displayHeight = 0.5*cs;
			courierSprite.setOrigin(0.5, 0);
			courierSprite.setFrame(4);
			courierSprite.depth = 15;
		}
	}

	pickCenterCellAndNeighbour(b) {
		// pick a random cell on the building, preferably somewhere near the middle
		// (it has the most cells of the same building around it)
		let cell = null, buildingCellsAround = null;

		for(let t = 0; t < b.tiles.length; t++) {
			let tempCell = b.tiles[t];
			let tempBuildingCellsAround = this.getAllBuildingCellsAround(tempCell, b.index)
			if(buildingCellsAround == null || tempBuildingCellsAround.length > buildingCellsAround.length) {
				cell = tempCell;
				buildingCellsAround = tempBuildingCellsAround
			}

			// can never have more than 4, so break here
			if(buildingCellsAround.length == 4) {
				break;
			}
		}

		return { 'cell': cell, 'buildingCellsAround': buildingCellsAround}
	}

	getAllBuildingCellsAround(pos, ind) {
		let nbs = [[1,0], [0,1], [-1,0], [0,-1]]
		
		let buildingCellsAround = [];
		for(let i = 0; i < 4; i++) {
			let nb = nbs[i];
			let tPos = [pos[0] + nb[0], pos[1] + nb[1]]

			if(this.outOfBounds(tPos)) { continue; }

			let obj = this.map[tPos[0]][tPos[1]];
			if(obj.type != 'building') { continue; } // ignore non-buildings
			if(obj.buildingIndex != ind) { continue; }

			buildingCellsAround.push(tPos);
		}

		return buildingCellsAround
	}

	getRandom(list) {
		return Random.getWeighted(list, "prob", this.RANDOM_DRAW_RNG);
	}
}

PandaqiPhaser.linkTo({ scene: BoardGeneration, key: sceneKey });
