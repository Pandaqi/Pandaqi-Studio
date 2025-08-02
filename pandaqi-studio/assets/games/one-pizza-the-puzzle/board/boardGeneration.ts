import { SPECIAL_BUILDINGS, SPECIAL_INGREDIENTS, TRAFFIC_SIGNS } from "../shared/dict";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import Color from "js/pq_games/layout/color/color";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import ResourceText from "js/pq_games/layout/resources/resourceText";
import TextConfig from "js/pq_games/layout/text/textConfig";
import Line from "js/pq_games/tools/geometry/line";
import Point from "js/pq_games/tools/geometry/point";
import Rectangle from "js/pq_games/tools/geometry/rectangle";
import getWeighted from "js/pq_games/tools/random/getWeighted";
import seedRandom from "js/pq_games/tools/random/seedrandom";
import shuffle from "js/pq_games/tools/random/shuffle";
import Building from "./building";
import Cell, { Order } from "./cell";
import Obstacle from "./obstacle";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import ResourceShape from "js/pq_games/layout/resources/resourceShape";
import StrokeAlign from "js/pq_games/layout/values/strokeAlign";
import { CONFIG } from "../shared/config";

type RandomizerFunction = () => number;
type TrafficSign = { pos: Point, type: string, side: number, ind: number };

const NBS = [new Point(1,0), new Point(0,1), new Point(-1,0), new Point(0,-1)];
const NBS_BOX = [new Point(), new Point(1,0), new Point(1,1), new Point(0,1)];
const CELL_OFFSETS = [new Point(1,-1), new Point(1,1), new Point(-1, 1), new Point(-1,-1)];

const DIRECTIONS = [
	[1,2,4,8], // Dead end
	[5,10], // Straight line
	[3,6,12,9], // Corner
	[7, 14, 13, 11], // T-crossing (3-way)
	[15] // All (4-way)
]

type Border = Point[]

export default class BoardGeneration
{
	canvas: HTMLCanvasElement
	cfg: Record<string,any>
	map: Cell[][]
	mapList: Cell[]
	extendingUnconnectedRoads: boolean
	obstacles: Obstacle[]
	buildings: Building[]
	subwayCounter: number
	specialIngredientsIncluded: number[]
	deadEnds: Point[]
	orderLengthCounter: number
	numIngredientBuildings: number
	numOrderBuildings: number
	trafficSigns: TrafficSign[]
	policeCells: Cell[]
	possiblePolicePoints: Point[]
	allEntrances: Cell[]
	fullIngredientList: number[]
	crossingCells: Point[]
	crossingSets: Point[][]
	pathsToExtend: Point[]

	randomCreationOrder: any[]
	fullOrderList: any[]
	shapes: any[]
	crossingCounter: any
	curRoadSet: any[]
	roadSets: any

	ROAD_EXTEND_RNG: RandomizerFunction
	RAND_POINT_RNG: RandomizerFunction
	BUILDING_GROW_RNG: RandomizerFunction
	BUILDING_TYPE_RNG: RandomizerFunction
	SHUFFLE_RNG: RandomizerFunction
	ALLEY_RNG: RandomizerFunction
	RANDOM_DRAW_RNG: RandomizerFunction
	RANDOM_SQUARE_RNG: RandomizerFunction
	TRAFFIC_SIGN_RNG: RandomizerFunction
	VARIATION_RNG: RandomizerFunction

	fontFamily = "leckerli"

	// user-input settings should be passed through config
	async draw(vis:MaterialVisualizer) : Promise<HTMLCanvasElement>
	{
		this.cfg = CONFIG;

		this.cfg.visualizer = vis;
		this.cfg.numPlayers = parseInt(this.cfg.playerCount);

		// number of cells along width of the paper
		this.cfg.resX = 10 + Math.floor(this.cfg.numPlayers*1.5);

		// ... determines grid cell size
		this.cfg.cellSize = this.cfg.size.x / this.cfg.resX;

		// ... determines resolution along height of paper
		this.cfg.resY = Math.floor(this.cfg.size.y / this.cfg.cellSize);

		//
		// purely visual settings
		//

		// border width as percentage of the total cell size (used for placements and margins that look good and scale with board size)
		this.cfg.borderWidth = 0.075

		// these colors correspond with ingredient frames
		this.cfg.buildingColorDict = 
		[
			"#FFAAAA", "#FFFF50", "#FFECCF", "#FFECB2", "#CEFFAB", "#FFC1DC", "#FFD8D0", // regular ingredients
			"#FFDAD4", "#F0ECCB", "#FFEEE7", "#FFD4B9", "#DEFDC7", "#FFECF4", "#E0EDDB" // special ingredients
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
		const variation = parseInt(this.cfg.boardVariation) ?? 0;

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

		return await this.generateBoard(vis);
	}

	async generateBoard(vis:MaterialVisualizer) 
	{
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
			this.placeSpecialBuildings(); // @TODO: I completely removed this function somehow! Did I ever use it in the first place? Check Git history.
		}

		// visualize the whole thing
		return await this.visualizeGame(vis);
	}

	createGrid() 
	{
		this.map = [];

		for(let x = 0; x < this.cfg.resX; x++) 
		{
			this.map[x] = [];

			for(let y = 0; y < this.cfg.resY; y++) 
			{
				const c = new Cell();
				c.setPosition(new Point(x,y));
				this.map[x][y] = c;
			}
		}

		this.mapList = this.map.flat();
	}

	getCell(p:Point)
	{
		return this.map[p.x][p.y];
	}

	reserveShapeSquares() 
	{
		const CONFIG_RNG = seedRandom(this.cfg.seed + "-config")

		// What to do with these?
		// hard configurations (only 2 shapes): [1,2], [2,1]
		// easy configurations (6 shapes): [2,3], [3,2]
		const possibleConfigurations = [
			new Point(4,1), new Point(3,1), new Point(2,2), 
			new Point(3,1), new Point(1,4)
		];
		this.cfg.shapeRectSize = possibleConfigurations[Math.floor(CONFIG_RNG() * possibleConfigurations.length)]

		for(let x = 0; x < this.cfg.shapeRectSize.x; x++) 
		{
			for(let y = 0; y < this.cfg.shapeRectSize.y; y++) 
			{
				this.map[this.cfg.resX-1-x][this.cfg.resY-1-y].setType('shape');
			}
		}
	}

	determineShapes() 
	{
		let RNG = seedRandom(this.cfg.seed + '-shapes');

		let numShapes = this.cfg.shapeRectSize.x * this.cfg.shapeRectSize.y;
		let allShapes = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]
		
		let splitShapes = [2, 5, 10, 11]
		let exoticShapes = [14, 16] // might also want to include 15?
		let skipShapes = [4, 13]
		let regularShapes = [4, 13, 8, 17]

		this.shapes = [];

		// if we only have 2 shapes, don't include any exotic ones (moving is hard enough as it is)
		// @IMPROV: Also include AT MOST one exotic shape?
		if(numShapes <= 2) {
			for(const shape of exoticShapes) {
				allShapes.splice(allShapes.indexOf(shape), 1);
			}
		}

		// always include only one SPLIT shape => then remove all of them from the total array
		this.shapes.push(splitShapes[ Math.floor(RNG() * splitShapes.length) ])
		for(const shape of splitShapes) 
		{
			allShapes.splice(allShapes.indexOf(shape), 1);
		}

		for(let i = 0; i < numShapes - 1; i++) 
		{
			const randIndex = Math.floor(RNG() * allShapes.length)

			const randVal = allShapes[randIndex];
			this.shapes.push(randVal);

			allShapes.splice(randIndex, 1);

			// each shape has TWO possibilities; if we pick one, remove its twin sister from the array
			let sisterIndex = allShapes.indexOf( (randVal + 9) % 18 )
			if(sisterIndex > -1) { allShapes.splice(sisterIndex, 1) };

			// if this was a regular shape, disallow all other regular shapes
			if(regularShapes.includes(randVal)) 
			{
				for(const shape of regularShapes) 
				{
					let ind = allShapes.indexOf(shape);
					if(ind > -1) { allShapes.splice(ind, 1); }
				}
			}
		}

		this.shuffle(this.shapes);
	}

	getRandomPoint() : Point
	{
		let x,y
		do {
			x = Math.floor(this.RAND_POINT_RNG() * this.cfg.resX);
			y = Math.floor(this.RAND_POINT_RNG() * this.cfg.resY);
		} while(!this.getCell(new Point(x,y)).isEmpty());
		return new Point(x,y);
	}

	placeRandomCrossings() 
	{
		const numCrossings = Math.floor(this.cfg.resX * 0.25);

		for(let i = 0; i < numCrossings; i++) 
		{
			let pos = this.getRandomPoint();
			let obj = this.getCell(pos);

			obj.setType('road', 'crossing');

			this.crossingCells.push(pos);
			this.possiblePolicePoints.push(pos);

			this.crossingSets.push([pos.clone()]);
			obj.originCrossing = this.crossingCounter;
			this.crossingCounter++;

			this.pathsToExtend.push(pos);
		}
	}

	fillRoadNetwork() 
	{
		this.curRoadSet = []

		// As long as we have paths to extend, do so
		while(this.pathsToExtend.length > 0) 
		{
			let pos = this.pathsToExtend.pop();
			let obj = this.getCell(pos)

			// crossings are extended in ALL directions, 
			// otherwise roads are extended in just ONE (valid) direction
			if(obj.subType == 'crossing') {
				for(let i = 0; i < 4; i++) {
					this.extendRoad(pos, NBS[i])
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

	performCrossingDiagonalVariation() 
	{
		// road variation: randomly remove crossing cells, but add their diagonals
		for(let i = this.crossingCells.length - 1; i >= 0; i--) 
		{	
			if(this.VARIATION_RNG() <= this.cfg.crossingDiagonalVariationProbability) 
			{
				let pos = this.crossingCells[i];
				let crossing = this.getCell(pos).originCrossing

				this.removeRoadCell(pos);

				// there are two diagonals: top left to bottom right, and bottom left to top right
				// here we randomly pick one
				if(this.VARIATION_RNG() <= 0.5) {
					this.addRoadCell(new Point(pos.x + 1, pos.y + 1), new Point(1, 0), crossing);
					this.addRoadCell(new Point(pos.x - 1, pos.y - 1), new Point(-1, 0), crossing)
				} else {
					this.addRoadCell(new Point(pos.x + 1, pos.y - 1), new Point(0,-1), crossing);
					this.addRoadCell(new Point(pos.x - 1, pos.y + 1), new Point(0, 1), crossing);
				}
			}
		}

		this.crossingCells = [];
	}

	addRoadCell(pos:Point, dir:Point, originCrossing:number) 
	{
		if(this.outOfBounds(pos)) { return; }

		let obj = this.getCell(pos)
		obj.type = 'road';
		obj.dir = dir;
		obj.originCrossing = originCrossing;

		// remember which crossing set and road set we belong to
		this.crossingSets[originCrossing].push(pos.clone());
		this.curRoadSet.push(pos.clone());
	}

	removeRoadCell(pos:Point) 
	{
		if(this.outOfBounds(pos)) { return; }

		let obj = this.getCell(pos)
		if(obj.type != 'road') { return; }

		// remove ourselves from any sets we were put into
		// @IMPROV: also remove ourselves from the curRoadSet

		// NOTE: some road types, like alleys, don't originate from a crossing, that's why we check
		if(obj.originCrossing) {
			let cs = this.crossingSets[obj.originCrossing];
			for(let i = 0; i < cs.length; i++) {
				let tPos = cs[i];
				if(tPos.x == pos.x && tPos.y == pos.y) {
					this.crossingSets[obj.originCrossing].splice(i, 1);
					break;
				}
			}
		}

		obj.resetRoad();
	}

	getValidExtensionDir(pos:Point) 
	{
		// find a free direction into which to extend
		const validExtensionDirections = [];
		for(const nb of NBS) 
		{
			const tPos = new Point(pos.x + nb.x, pos.y + nb.y);
			if(this.outOfBounds(tPos)) { continue; }
			if(!this.cellFilled(tPos)) { validExtensionDirections.push(nb); }
		}

		if(validExtensionDirections.length <= 0) { return null; }

		// choose a random direction
		return validExtensionDirections[Math.floor(this.ROAD_EXTEND_RNG() * validExtensionDirections.length)];
	}

	extendRoad(pos:Point, dir:Point) 
	{
		let tPos = pos.clone();
		let canContinue = true;
		let cellsFilled = [];

		// keep track of which crossing originated this path => we belong to that group of roads
		let originCrossing = this.getCell(pos).originCrossing;

		let numExtensionsUntilCorner = 0;
		let lastCornerDir = 0;

		// also check if the FIRST extension would already hit something
		// lower this probability to get more roads (and intersections+decorations)
		// NOTE: don't do this when we're solving unconnected areas, as then we want as many road connections as we can get
		if(!this.extendingUnconnectedRoads) 
		{
			if(this.neighbourCellFilled(new Point(pos.x+dir.x, pos.y+dir.y), dir) && this.VARIATION_RNG() <= this.cfg.forbidFirstStepProbability) 
			{ 
				canContinue = false; 
			}
		}

		// keep extending the road until we hit something ...
		while(canContinue) 
		{
			// take one step
			let tempDir = dir.clone();

			// @IMPROV: Make this CLEANER => put into its own function?

			// if this is NOT the first cell, and the previous cell was NOT a corner,
			// we may take a corner in the road with some probability
			if(numExtensionsUntilCorner >= 2 && this.VARIATION_RNG() <= this.cfg.streetCornerProbability) 
			{
				tempDir = new Point(-dir.y, dir.x);

				// always take the OPPOSITE corner from the last one
				// this way, we always return to a straight line
				if(lastCornerDir != 0) {
					tempDir = new Point( -lastCornerDir*tempDir.x, -lastCornerDir*tempDir.y );
					lastCornerDir = 0;
				} else {
					lastCornerDir = 1;

					// if the first chosen direction is invalid, or with 50% probability, try the other direction
					let tempTPos = new Point(tPos.x + tempDir.x, tPos.y + tempDir.y);
					if(this.VARIATION_RNG() <= 0.5 || (this.outOfBounds(tempTPos)) || (this.cellFilled(tempTPos))) {
						lastCornerDir = -1;
						tempDir = new Point(-tempDir.x, -tempDir.y);
					}
				}

				// only definitely apply the change if we can actually reach the cell we want to go to
				let tempTPos = new Point(tPos.x + tempDir.x, tPos.y + tempDir.y);
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

			tPos.x += tempDir.x;
			tPos.y += tempDir.y;

			// if we're out of bounds or hit a filled cell, stop
			if(this.outOfBounds(tPos) || this.cellFilled(tPos)) { canContinue = false; break; }

			// otherwise, fill the new cell as a road
			this.addRoadCell(tPos, tempDir, originCrossing);

			// remember this cell (as a COPY) as one of the cells we filled
			cellsFilled.push(tPos.clone());

			// if one of our neighbours is filled, immediately stop, as we are already connected to something else
			// again, don't do this on unconnected roads, as it increases the probability of ugly one-off sections
			if(!this.extendingUnconnectedRoads) {
				if(this.neighbourCellFilled(tPos, tempDir)) { canContinue = false; break; }
			}
		}

		// add some new cells to the extension algorithm, one for each chunk of X tiles
		const streetChunkSize = 5;
		while(cellsFilled.length >= streetChunkSize) 
		{
			let randCell = cellsFilled[Math.floor(this.ROAD_EXTEND_RNG() * (streetChunkSize - 1)) + 1]

			this.pathsToExtend.push(randCell);
			cellsFilled.splice(0, 5);
		}
	}

	prepareLists() 
	{
		// here we prepare our seeded random number generators
		const seed = this.cfg.seed;
		this.RAND_POINT_RNG = seedRandom(seed + "-randPoints");
		this.BUILDING_GROW_RNG = seedRandom(seed + "-buildingGrowth");
		this.BUILDING_TYPE_RNG = seedRandom(seed + '-buildingType');
		this.SHUFFLE_RNG = seedRandom(seed + "-shuffle");

		this.ALLEY_RNG = seedRandom(seed + "-alleys");

		this.ROAD_EXTEND_RNG = seedRandom(seed + "-roadExtensions");
		this.VARIATION_RNG = seedRandom(seed + "-roadVariations");

		this.RANDOM_DRAW_RNG = seedRandom(seed + "-randomDraws");
		this.RANDOM_SQUARE_RNG = seedRandom(seed + "-randomSpecialties");

		this.TRAFFIC_SIGN_RNG = seedRandom(seed + "-trafficSigns");

		// here we create some lists we'll use in many different places
		// (and don't want to re-initialize)
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
		for(let x = 0; x < this.cfg.resX; x++) 
		{
			for(let y = 0; y < this.cfg.resY; y++)
			{
				this.randomCreationOrder.push(new Point(x,y));
			}
		}

		this.shuffle(this.randomCreationOrder);
	}

	createBuildings() 
	{
		for(let i = 0; i < this.randomCreationOrder.length; i++) 
		{
			let pos = this.randomCreationOrder[i];
			if(!this.getCell(pos).isEmpty()) { continue; }
			this.growBuilding(pos);
		}
	}

	generateBordersToPos(pos:Point, buildingIndex:number) 
	{
		const borders : Border[] = [];
		let corner = new Point(pos.x + 1, pos.y);

		for(let i = 0; i < NBS.length; i++) 
		{
			const nb = NBS[i];
			const nextDir = NBS[(i + 1) % 4];
			const nextCorner = new Point(corner.x + nextDir.x, corner.y + nextDir.y);
			const tPos = new Point(pos.x + nb.x, pos.y + nb.y);

			if(!this.outOfBounds(tPos)) 
			{ 
				const obj = this.getCell(tPos);
				if(obj.type != 'building' || obj.buildingIndex != buildingIndex) 
				{ 
					borders.push([corner, nextCorner]);
				}
			}

			corner = nextCorner
		}

		return borders;
	}

	convertDirToIndex(dir:Point) 
	{
		if(dir.x == 1 && dir.y == 0) {
			return 0;
		} else if(dir.x == 0 && dir.y == 1) {
			return 1;
		} else if(dir.x == -1 && dir.y == 0) {
			return 2;
		} else if(dir.x == 0 && dir.y == -1) {
			return 3;
		}

		return -1;
	}

	convertIndexToDir(num:number) 
	{
		if(num < 0 || num >= NBS.length) { return null; }
		return NBS[num];
	}

	growBuilding(pos) 
	{
		let obj = this.getCell(pos)
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
		while(continueGrowing) 
		{
			// pick the first cell in the list
			let tPos = nbCells.pop();
			let cell = this.getCell(tPos);

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

	generateValidNeighbours(pos:Point) 
	{
		const validNeighbours = [];
		for(const nb of NBS) 
		{
			const tPos = new Point(pos.x + nb.x, pos.y + nb.y);
			if(this.outOfBounds(tPos)) { continue; }
			if(this.cellFilled(tPos)) { continue; }
			validNeighbours.push(tPos);
		}

		return this.shuffle(validNeighbours);
	}

	shuffle(a:any[]) 
	{
		return shuffle(a, this.SHUFFLE_RNG)
	}

	outOfBounds(pos:Point) 
	{
		return (pos.x < 0 || pos.x >= this.cfg.resX || pos.y < 0 || pos.y >= this.cfg.resY);
	}

	cellFilled(pos:Point) 
	{
		return !this.getCell(pos).isEmpty();
	}

	sameOriginCrossing(pos1:Point, pos2:Point) 
	{
		return (this.getCell(pos1).originCrossing == this.getCell(pos2).originCrossing)
	}

	neighbourCellFilled(pos:Point, dir:Point) 
	{
		for(let i = 0; i < 4; i++) 
		{
			const nb = NBS[i];
			const tPos = new Point(pos.x + nb.x, pos.y + nb.y);

			// ignore the direction we came from
			if(dir.x == -nb.x && dir.y == -nb.y) { continue; }

			if(this.outOfBounds(tPos)) { continue; }
			if(this.sameOriginCrossing(pos, tPos)) { continue; }
			if(this.cellFilled(tPos)) { return true; }
		}

		return false;
	}

	getOrientationFromNeighbours(pos:Point) 
	{
		// Get how many roads we are neighbouring, and which ones exactly => turn into binary number
		// Depending on the number, use a different rot/frame
		let binary = 0;
		let obj = this.getCell(pos)
		let returnObj = { rot: 0, frame: 0 };

		for(let i = 0; i < 4; i++) 
		{
			if(obj.closedSides[i]) { continue; }

			let nb = NBS[i];
			let tPos = new Point(pos.x + nb.x, pos.y + nb.y);

			if(this.outOfBounds(tPos)) { continue; }

			let tempObj = this.getCell(tPos);

			let num = 0;
			if(tempObj.type == 'road') { num = 1; }

			binary += num * Math.pow(2, i);
		}

		for(let i = 0; i < DIRECTIONS.length; i++) 
		{
			if(!DIRECTIONS[i].includes(binary)) { continue; }

			returnObj.frame = i;
			returnObj.rot = DIRECTIONS[i].indexOf(binary) * 0.5 * Math.PI;
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
					let pos = b.tiles[t], obj = this.getCell(pos)
					
					obj.type = 'empty'

					if(t % 5 == 0) {
						crossingLocations.push(pos);
					}
				}

				this.resetToEmptyBuilding(b);

				for(let l = 0; l < crossingLocations.length; l++) 
				{
					let pos = crossingLocations[l], obj = this.getCell(pos)
					obj.setType("road", "crossing");

					obj.type = 'road';
					obj.subType = 'crossing';

					this.crossingSets.push([pos.clone()]);
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

	createAlleys() 
	{
		for(let i = this.buildings.length - 1; i >= 0; i--) 
		{
			let b = this.buildings[i];

			this.determineBuildingSurroundings(b);

			let numUniqueStreets = 0, maxStreetSize = 0;
			for(let d = 0; d < 4; d++) 
			{
				if(b.streetDirs[d] <= 0) { continue; }
				maxStreetSize = Math.max(b.streetDirs[d], maxStreetSize);
				numUniqueStreets++;
			}

			// ignore unconnected streets
			// @TODO: If I calculate this, I really don't need the "streetConnection" parameter on buildings
			if(numUniqueStreets == 0) { continue; }

			// either we have only ONE connection with at most TWO roads, or all our connections have AT MOST ONE road
			let allowAllifying = (numUniqueStreets == 1 && maxStreetSize <= 2) || (maxStreetSize <= 1);
			if(allowAllifying && this.ALLEY_RNG() <= this.cfg.createAlleyProbability) 
			{
				// convert this whole building into roads!
				for(const pos of b.tiles) 
				{
					const obj = this.getCell(pos);
					obj.setType("road", "alley");
					obj.setDir(new Point(1,0));
					this.curRoadSet.push(pos)
				}

				// now calculate which "direction" the road takes (this is an approximation)
				// we check our neighbours, and the first one we find, we presume we came from that direction
				for(const pos of b.tiles)
				{
					this.getCell(pos).dir = this.calculateDirFromSurroundings(pos);
				}

				this.buildings[i] = this.generateEmptyBuilding(i);
			}
		}
	}

	calculateDirFromSurroundings(pos:Point) : Point 
	{
		for(const nb of NBS) 
		{
			let tPos = new Point(pos.x + nb.x, pos.y + nb.y);
			if(this.outOfBounds(tPos)) { continue; }
			if(this.getCell(tPos).type == 'road') {
				return new Point(-nb.x, -nb.y);
			}
		}
		return new Point(1,0);
	}

	generateEmptyBuilding(index = -1) : Building
	{
		const b = new Building();
		b.setIndex(index);
		return b;
	}

	resetToEmptyBuilding(b:Building) 
	{
		b.reset(); // @TODO: this was in the old code, and I'm not sure if or why it's needed if we're creating an entirely new building anyway, but I fear taking it away
		const newBuilding = this.generateEmptyBuilding(b.index);
		this.buildings[b.index] = b;
		return newBuilding;
	}

	determineBuildingSurroundings(b:Building) 
	{
		for(const pos of b.tiles) 
		{
			for(let i = 0; i < 4; i++) 
			{
				let nb = NBS[i];
				let tPos = new Point(pos.x + nb.x, pos.y + nb.y);
				if(this.outOfBounds(tPos)) { continue; }

				const obj = this.getCell(tPos);
				b.streetDirs[ this.convertDirToIndex(obj.dir) ]++;
			}
		}
	}

	determineBuildingBorders() 
	{
		// now we have our list of buildings, each of which is an ARRAY of Points
		// it's time to determine their BOUNDARIES ( = which lines should I draw to show where buildings start/end?)
		for(let i = 0; i < this.buildings.length; i++) 
		{
			const b = this.buildings[i];
			for(let p = 0; p < b.tiles.length; p++) 
			{
				const pos = b.tiles[p];
				b.borders = b.borders.concat( this.generateBordersToPos(pos, i) )
			}
		}
	}

	determineDecorationBorders() 
	{
		let specialPlacesEnabled = this.cfg.expansions.preposterousPlaces

		for(const o of this.obstacles) 
		{
			o.borders = [];
			if(o.type == 'hedge') { continue; }

			// obstacles are saved with their CENTER point, so startPoint + vector2(1,1)
			// now we just look at its neighbours and check if they have the property "roundabout" set to true
			const borders = [new Point(-1,1), new Point(-1,-1), new Point(1,-1), new Point(1,1)];
			const NBS_CUSTOM = [new Point(-1,0), new Point(0,-1), new Point(1,0), new Point(0,1)]; // @UPDATE: we need a custom order for NBs here to make this correct, because old me is stupid
			for(let a = 0; a < NBS_CUSTOM.length; a++) 
			{
				const nb = NBS_CUSTOM[a];
				const tPos = new Point(o.center.x + nb.x, o.center.y + nb.y);

				let shouldAddBorder = false
				const neighbourObstacle = this.obstacleWithCenter(tPos)

				// only add a border if it's the actual border of a set of decorations
				if(neighbourObstacle == null || this.outOfBounds(tPos)) { shouldAddBorder = true; }

				// EXCEPT when special buildings are enabled: then place borders if the neighbouring decoration is NOT the same as ours
				if(!shouldAddBorder && specialPlacesEnabled) 
				{
					if(neighbourObstacle != null && neighbourObstacle.specialBuilding != o.specialBuilding) 
					{
						shouldAddBorder = true;
					}
				}

				if(shouldAddBorder) 
				{
					const border = new Line(
						new Point(o.center.x + borders[a].x*0.5, o.center.y + borders[a].y*0.5),
						new Point(o.center.x + borders[(a+1)%4].x*0.5, o.center.y + borders[(a+1)%4].y*0.5)
					)
					o.borders.push(border)
				}
			}
		}
	}

	obstacleWithCenter(pos:Point) 
	{
		for(const obstacle of this.obstacles) 
		{
			if(obstacle.type == 'hedge') { continue; }
			if(!obstacle.center.matches(pos)) { continue; }
			return obstacle;
		}
		return null
	}

	removeUglyBoxes() 
	{
		const dirVectors = [new Point(1,0), new Point(2,1), new Point(1,2), new Point(0,1)];
		const RNG = seedRandom(this.cfg.seed + '-uglyBoxes');
		const specialPlacesEnabled = this.cfg.expansions.preposterousPlaces // @TODO: I repeat this variable all over the code, maybe just save it once in this.cfg?
		const roundabouts = [];

		for(let i = 0; i < this.randomCreationOrder.length; i++) 
		{
			const pos = this.randomCreationOrder[i];
			const uData = this.getUglyBoxData(pos);

			if(!uData.isBox) { continue; }

			// first, try to MERGE the ugly box with nearby buildings with a certain probability
			let uglyBoxMerged = false;
			if(RNG() <= this.cfg.solveUglyBoxesByMergingProbability) 
			{
				uglyBoxMerged = this.mergeUglyBox(pos, RNG);
			}

			if(uglyBoxMerged) { continue; }

			// I usually want more HEDGES than ROUNDABOUTS
			let randSolution = 'hedge';
			if(uData.hasRoundabout || RNG() <= this.cfg.roundaboutProbability) { randSolution = 'roundabout'; }

			if(randSolution == 'hedge') 
			{
				const randDir = Math.floor(RNG() * 4);
				const vec = dirVectors[randDir];
				const start = NBS_BOX[randDir].clone();
				const end = NBS_BOX[(randDir + 1) % 4].clone();

				// remember (on both sides of the hedge) that the opposite side is closed off
				this.getCell(new Point(pos.x + start.x, pos.y + start.y)).closedSides[randDir] = true;
				this.getCell(new Point(pos.x + end.x, pos.y + end.y)).closedSides[(randDir + 2) % 4] = true;

				// each hedge starts from the point (1,1) and just goes to one of the four directions
				const h = new Obstacle();
				h.setType(randSolution);
				h.setLine( new Line(new Point(pos.x+1, pos.y+1), new Point(pos.x+vec.x, pos.y+vec.y)) );
				h.setRotation( Math.atan2(h.line.end.y - h.line.start.y, h.line.end.x - h.line.start.x) );
				this.obstacles.push(h)

			} else if(randSolution == 'roundabout') {

				// remember all these cells were used for a roundabout
				for(let a = 0; a < 4; a++) 
				{
					let tPos = new Point(pos.x + NBS_BOX[a].x, pos.y + NBS_BOX[a].y);
					this.getCell(tPos).roundabout = true;
					this.getCell(tPos).filledSquares[(a+1) % 4] = true; // (a+1) just happens to be the direction that we're filling with this decoration; check the NBS_BOX array above and the array used in "getSquarePositionByIndex", they should match
				}

				// just drop some ornamentation in the center
				const r = new Obstacle();
				r.setType(randSolution);
				r.setCenter(new Point(pos.x + 1, pos.y + 1));
				this.obstacles.push(r);
				roundabouts.push(r);
			}
		}

		// once we know all decorations, convert a certain percentage of them into special buildings (if applicable)
		if(specialPlacesEnabled) 
		{ 
			let decorationsToConvert = Math.min( Math.max(0.66*roundabouts.length, 5), roundabouts.length);
			for(let i = 0; i < decorationsToConvert; i++) 
			{
				let type = this.getRandom(SPECIAL_BUILDINGS)
				roundabouts[i].specialBuilding = type;
			}

			// Go through all of these and check, for each Plaza, if they neighbour a decoration cell
			// If so, convert that cell to a plaza as well

			// @TODO: I use this twice in almost identical code => removeUglyBoxes() and determineDecorationBorders()
			//  => can I put it in a single function?
			for(const o of this.obstacles) 
			{
				if(o.specialBuilding != 'Plaza') { continue; }
				for(let a = 0; a < 4; a++) 
				{
					let tPos = new Point(o.center.x + NBS[a].x, o.center.y + NBS[a].y);
					let nbObs = this.obstacleWithCenter(tPos)
					if(nbObs) { nbObs.specialBuilding = 'Plaza'; }
				}
			}

			// @TODO: keep a counter on cells with the current SIZE of their plaza?
			// @TODO: Go through all cells one more time. Any plazas with a size that is too small, are converted back into something else
		}
		
	}

	mergeUglyBox(pos:Point, RNG:RandomizerFunction) 
	{
		let success = false;
		for(let i = 0; i < NBS_BOX.length; i++) 
		{
			let tPos = new Point(pos.x + NBS_BOX[i].x, pos.y + NBS_BOX[i].y);

			let buildingSide1 = this.buildingAtSide(tPos, (i+2) % 4);
			let buildingSide2 = this.buildingAtSide(tPos, (i+3) % 4);

			if(buildingSide1 && buildingSide2) 
			{
				this.removeRoadCell(tPos);

				let randBuilding = buildingSide1;
				if(RNG() <= 0.5) { randBuilding = buildingSide2; }

				this.addToBuilding(randBuilding, tPos);
				success = true;
			}
		}

		return success;
	}

	getUglyBoxData(pos:Point) 
	{
		let hasRoundabout = false;
		for(let i = 0; i < NBS_BOX.length; i++) 
		{
			const tPos = new Point(pos.x + NBS_BOX[i].x, pos.y + NBS_BOX[i].y);
			if(this.outOfBounds(tPos) || !this.isRoad(tPos)) { return { isBox: false }; }
			if(this.sideClosed(tPos, i)) { return { isBox: false }; }

			if(this.isRoundabout(tPos)) { hasRoundabout = true; }
		}

		return { isBox: true, hasRoundabout: hasRoundabout };
	}

	buildingAtSide(pos:Point, num:number) 
	{
		let dir = this.convertIndexToDir(num);
		let tPos = new Point(pos.x + dir.x, pos.y + dir.y);

		if(this.outOfBounds(tPos)) { return null; }

		let obj = this.getCell(tPos);
		if(obj.type != 'building') { return null; }

		return this.buildings[obj.buildingIndex];
	}

	sideClosed(pos:Point, num:number) 
	{
		return (this.getCell(pos).closedSides[num]);
	}

	isRoundabout(pos:Point) 
	{
		return (this.getCell(pos).roundabout);
	}

	isRoad(pos:Point) 
	{
		return (this.getCell(pos).type == 'road')
	}

	mergeBuildings(b1:Building, b2:Building) 
	{
		for(let t = 0; t < b2.tiles.length; t++) {
			this.addToBuilding(b1, b2.tiles[t]);
		}

		this.resetToEmptyBuilding(b2);
	}

	addToBuilding(b:Building, pos:Point) 
	{
		b.tiles.push(pos);

		let tile = this.getCell(pos)
		tile.buildingIndex = b.index;
		tile.type = 'building';
	}

	connectedWithRoad(pos:Point) 
	{
		for(const nb of NBS) 
		{
			const tPos = new Point(pos.x + nb.x, pos.y + nb.y);
			if(this.outOfBounds(tPos)) { continue; }
			const obj = this.getCell(tPos);
			if(obj.type != 'road') { continue; }
			return true;
		}

		return false;
	}

	getNeighborBuildingTile(pos:Point, maxEntrances = -1) 
	{
		const nbs = NBS.slice();
		this.shuffle(nbs);

		for(const nb of nbs) 
		{
			let tPos = new Point(pos.x + nb.x, pos.y + nb.y);
			if(this.outOfBounds(tPos)) { continue; }

			let obj = this.getCell(tPos);
			if(obj.type != 'building') { continue; } // ignore non-buildings

			let bObj = this.buildings[obj.buildingIndex]
			if(maxEntrances > -1 && bObj.numEntrances >= maxEntrances) { continue; }
			
			return { pos: tPos, building: obj.buildingIndex, dir: nb };
		}

		return null;
	}

	getNeighborBuilding(type = 'connected', pos:Point, buildingIndex:number) 
	{
		const nbs = NBS.slice();
		this.shuffle(nbs);

		for(const nb of nbs) 
		{
			let tPos = new Point(pos.x + nb.x, pos.y + nb.y);
			if(this.outOfBounds(tPos)) { continue; }

			let obj = this.getCell(tPos);

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

	reserveBuildings() 
	{
		let buildingsCopy = this.buildings.slice();
		buildingsCopy.sort((a,b) => { 
			if(a.tiles.length < b.tiles.length) { return 1; }
			return -1;
		});

		// the biggest building is reserved as the bank
		buildingsCopy[0].setType('bank')

		// the rest is reserved for players
		const numBuildingsToReserve = this.cfg.numPlayers;
		for(let i = 1; i < (numBuildingsToReserve + 1); i++) 
		{
			buildingsCopy[i].setType('reserved');
		}
	}

	placeSubway(pos:Point) 
	{
		let ind = this.getFreeSquareIndex(pos);
		if(ind == null) { return; }

		this.getCell(pos).filledSquares[ind] = true;
		this.getCell(pos).subway = { positionIndex: ind, counter: this.subwayCounter };

		this.subwayCounter++;
	}

	findDeadEnds() 
	{
		this.deadEnds = [];

		for(let x = 0; x < this.cfg.resX; x++) 
		{
			for(let y = 0; y < this.cfg.resY; y++) 
			{
				const pos = new Point(x,y);
				const obj = this.getCell(pos);
				if(obj.type != 'road') { continue; }

				const orient = this.getOrientationFromNeighbours(pos);
				if(orient.frame != 0) { continue; }

				obj.deadend = true
				this.deadEnds.push(pos)
			}
		}
	}

	createSubways() 
	{
		let SUBWAY_RNG = seedRandom(this.cfg.seed + '-subways')

		// place at least ONE subway on each crossing set
		for(const s of this.crossingSets) 
		{
			const subwaySpots = [];
			for(const pos of s) 
			{
				if(!this.getCell(pos).deadend) { continue; }
				subwaySpots.push(pos);
			}

			if(subwaySpots.length > 0) 
			{
				const randDeadEnd = subwaySpots.splice(Math.floor(SUBWAY_RNG() * subwaySpots.length), 1)[0];
				this.placeSubway(randDeadEnd);
			}
		}

		// then fill out the board with the road sets (which should contain most if not all roads)
		let numRoadSets = this.roadSets.length;
		for(let i = 0; i < numRoadSets; i++) 
		{
			const subwaySpots = [];

			for(let j = 0; j < this.roadSets[i].length; j++) 
			{
				let pos = this.roadSets[i][j]
				let obj = this.getCell(pos)

				// this subway is already placed, or it's not a dead end, so don't count it
				if(!obj.deadend || obj.hasSubway()) { continue; }

				// if this is an unused dead end, save it as a potential subway
				subwaySpots.push(pos);
			}

			// now pick a random dead end to place a subway
			const subwaysToPlace = Math.ceil(subwaySpots.length / 5.0)
			for(let j = 0; j < subwaysToPlace; j++) 
			{
				if(subwaySpots.length <= 0) { break; }
				const randDeadEnd = subwaySpots.splice(Math.floor(SUBWAY_RNG() * subwaySpots.length), 1)[0];
				this.placeSubway(randDeadEnd);
			}
		}
	}

	generateIngredientLists() 
	{
		// generate a huge list of ingredients; 
		// they will be placed in that order, and skipped (temporarily) whenever placement isn't suitable
		const ings = [0, 1, 2, 3, 4, 5, 6];

		this.fullIngredientList = [];
		while(this.fullIngredientList.length < this.buildings.length) 
		{
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

	placeEntrances() 
	{
		this.allEntrances = [];

		let RNG = seedRandom(this.cfg.seed + "-entrances");

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
		for(const de of this.deadEnds) 
		{
			let obj = this.getCell(de);
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
				let obj = this.getCell(pos)

				if(obj.type != 'road') { continue; }

				let maxEntrances = 1 + Math.floor(RNG() * this.cfg.maxEntrancesPerBuilding)
				let result = this.placeSingleEntrance(pos, obj, maxEntrances)

				if(result) { entrancesPlacedThisRound++; }
			}
		} while(entrancesPlacedThisRound > 0);
	}

	createRandomOrder() : Order
	{
		const order = [];
		const numIngredients = this.orderLengthCounter;
		for(let i = 0; i < numIngredients; i++) 
		{
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

	placeSingleEntrance(pos:Point, obj:Cell, maxEntrances = -1) 
	{
		// find connected neighbour building (returns an object with some useful properties)
		let b = this.getNeighborBuildingTile(pos, maxEntrances);

		// no building around us? continue!
		if(b == null) { return false; }

		// now inform the building
		let buildingIndex = b.building
		let bObj = this.buildings[buildingIndex]
		bObj.numEntrances++;

		// if the building has NOT been claimed as a specific type yet ...
		if(bObj.type == '') 
		{
			if(this.numIngredientBuildings > 0 || bObj.tiles.length <= 1) 
			{
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
		
		const entrancePos = this.getSquarePositionOnCell(pos, dirIndex, false);
		obj.entrance = { pos: entrancePos, building: buildingIndex, ingredient: ing, order: pizzaOrder  }
		this.allEntrances.push(obj);

		return true;
	}

	getSquarePositionOnCell(pos:Point, ind:number, center = true) 
	{
		const offset = CELL_OFFSETS[ind].clone();
		const newPos = new Point(
			pos.x + 0.5 + 0.25*offset.x, 
			pos.y + 0.5 + 0.25*offset.y
		);

		if(center) { return newPos; }
		return new Point( newPos.x - 0.25, newPos.y - 0.25 );
	}

	pickSuitableIngredient(pos:Point) {
		// keep trying ingredients further up the chain, until we find a suitable one
		let counter = -1, suitable = false, ingredient = -1; 
		do {
			counter++;

			if(counter >= this.fullIngredientList.length) 
			{
				ingredient = this.fullIngredientList[0];
				counter = 0;
				break;
			}

			ingredient = this.fullIngredientList[counter];

			let closestEntranceOfSameType = this.distanceToSameEntrance(pos, ingredient)
			suitable = (closestEntranceOfSameType > this.cfg.ingredientBuildingMinimumDistance)
		} while (!suitable);

		// then remove that from the list and return it
		this.fullIngredientList.splice(counter, 1)
		return ingredient;
	}

	distanceToSameEntrance(pos:Point, ing:number) 
	{
		let minDist = Infinity;
		for(const e of this.allEntrances) 
		{
			// NOTE: "e" is a TILE on the map, not a BUILDING => its "entrance" property holds info about the entrance (duh)
			if(e.entrance.ingredient != ing) { continue; }

			minDist = Math.min(minDist, Math.abs(e.pos.x - pos.x) + Math.abs(e.pos.y - pos.y))
		}

		return minDist;
	}

	convertBuildingsWithoutEntrance() 
	{
		let specialPlacesEnabled = this.cfg.expansions.preposterousPlaces

		for(const buildingObj of this.buildings) 
		{
			if(buildingObj.tiles.length <= 0) { continue; }
			if(buildingObj.numEntrances > 0) { continue; }
			if(buildingObj.type != '') { continue; }

			// if we have the special places/buildings expansion enabled
			// we want to replace these buildings with special ones
			if(specialPlacesEnabled) 
			{
				let randSpecialType = this.getRandom(SPECIAL_BUILDINGS);

				buildingObj.setType('special');
				buildingObj.special = randSpecialType;
				buildingObj.centerCellData = this.pickCenterCellAndNeighbour(buildingObj)

			// otherwise, just ..
			// merge these buildings with a neighbour building (if it exists)
			// if no merge is possible, just set the building to 'reserved' ( = empty)
			} else {
				// @TODO: Make this a general function, because we also call the exact same thing multiple times during other algorithms
				let buildingIndex = buildingObj.index;

				for(let t = 0; t < buildingObj.tiles.length; t++) 
				{
					const pos = buildingObj.tiles[t]
					const nb = this.getNeighborBuilding('connected', pos, buildingIndex);

					if(nb == null) { 
						buildingObj.setType('reserved');
					} else {
						this.mergeBuildings(nb, buildingObj);
					}
				}
			}
		}
	}

	getRandomPolicePoint() : Point
	{
		let x,y
		let invalidPoint = false;
		let tries = 0, maxTries = 200;
		do {
			x = Math.floor(this.RAND_POINT_RNG() * this.cfg.resX);
			y = Math.floor(this.RAND_POINT_RNG() * this.cfg.resY);

			const pos = new Point(x,y);
			const notARoad = (this.getCell(pos).type != 'road');
			const isPolice = this.getCell(pos).hasPolice();
			const tooCloseToPolice = (this.distanceToClosestPolice(pos) <= this.cfg.minDistancePoliceIcons);

			invalidPoint = notARoad || isPolice || tooCloseToPolice;
			tries++;
		} while(invalidPoint && tries < maxTries);

		if(tries >= maxTries) { return null; }

		return new Point(x,y);
	}

	distanceToClosestPolice(posA:Point) 
	{
		let dist = Infinity;
		for(const posB of this.policeCells) 
		{
			dist = Math.min(dist, Math.abs(posA.x-posB.x) + Math.abs(posA.y-posB.y))
		}
		return dist;
	}

	getFreeSquareIndex(pos:Point) 
	{
		return this.getRandomFalseValue(this.getCell(pos).filledSquares)
	}

	// @TODO: This is almost a copy of the getOrientationFromNeighbour function, make general to avoid repeating myself?
	getEmptySide(pos:Point) 
	{
		const tempArr = [];
		const obj = this.getCell(pos)
		for(let i = 0; i < 4; i++) 
		{
			if(obj.closedSides[i]) { continue; }

			let nb = NBS[i];
			let tPos = new Point(pos.x + nb.x, pos.y + nb.y);
			if(this.outOfBounds(tPos)) { continue; }

			const tempObj = this.getCell(tPos);
			if(tempObj.type == 'road') { tempArr.push(i) }
		}

		if(tempArr.length <= 0) { return null; }
		return tempArr[Math.floor(this.RANDOM_SQUARE_RNG() * tempArr.length)]
	}

	getRandomFalseValue(arr:any[]) 
	{
		const tempArr = [];

		// go through all squares; if they are free (filled = false), add to temporary array
		// then just return a random element from that
		for(let i = 0; i < arr.length; i++) 
		{
			if(!arr[i]) { tempArr.push(i); }
		}

		if(tempArr.length <= 0) { return null; }
		return tempArr[Math.floor(this.RANDOM_SQUARE_RNG() * tempArr.length)];
	}

	placePizzaPolice() 
	{
		this.policeCells = [];
		this.shuffle(this.possiblePolicePoints);

		const numPolice = Math.max(Math.round(this.possiblePolicePoints.length*this.cfg.policeFactor), 1.0);
		let pos
		for(let i = 0; i < numPolice; i++) 
		{
			if(this.possiblePolicePoints.length > 0) {
				pos = this.possiblePolicePoints.pop();
			} else {
				pos = this.getRandomPolicePoint();
			}

			if(pos == null) { break; }

			let ind = this.getFreeSquareIndex(pos);
			if(ind == null) { continue; }

			this.policeCells.push(pos);

			this.getCell(pos).filledSquares[ind] = true;
			this.getCell(pos).police = { positionIndex: ind };
		}
	}

	distanceToClosestTrafficSign(posA:Point) 
	{
		let dist = Infinity;
		for(const sign of this.trafficSigns) 
		{
			const posB = sign.pos;
			dist = Math.min(dist, Math.abs(posA.x-posB.x) + Math.abs(posA.y-posB.y))
		}
		return dist;
	}

	getRandomTrafficPoint(type:string) : Point
	{
		let isGate = TRAFFIC_SIGNS[type].gate;
		let x,y
		let invalidPoint = false;
		let tries = 0, maxTries = 200;
		do {
			x = Math.floor(this.RAND_POINT_RNG() * this.cfg.resX);
			y = Math.floor(this.RAND_POINT_RNG() * this.cfg.resY);

			const pos = new Point(x,y);
			const cell = this.getCell(pos);

			const tooCloseToSign = (this.distanceToClosestTrafficSign(pos) <= this.cfg.minDistanceTrafficSigns);
			const notARoad = (cell.type != "road");
			const isTrafficSign = cell.trafficSign;

			invalidPoint = notARoad || isTrafficSign || tooCloseToSign;
			tries++;
			
			// if the point still seems valid, check one last item, depending on the type of traffic sign
			// It's invalid if ...
			//  => NO GATE? The cell has NO free squares to use
			//  => GATE? The cell has NO empty sides to use
			if(!invalidPoint) 
			{
				if(isGate) {
					// NOTE: We also disallow gates on roundabout cells, because those are only half-width
					// However, this severely restricts placement, so maybe we want ...
					// @TODO: Be more precise with checking this SIDE/EDGE overlaps with a DECORATION
					invalidPoint = cell.roundabout || (this.getEmptySide(pos) == null)
				} else {
					invalidPoint = (this.getFreeSquareIndex(pos) == null)
				}
			}
		} while(invalidPoint && tries < maxTries);

		if(tries >= maxTries) { return null; }
		return new Point(x,y);
	}

	placeTrafficSigns() {
		const numSigns = this.cfg.numTrafficSigns;

		this.trafficSigns = [];

		for(let i = 0; i < numSigns; i++) {
			let randType = this.getRandom(TRAFFIC_SIGNS);
			let pos = this.getRandomTrafficPoint(randType);

			if(pos == null) { break; }

			let obj:TrafficSign = { pos: pos, type: randType, side: -1, ind: -1 }

			if(TRAFFIC_SIGNS[randType].gate) {
				let side = this.getEmptySide(pos);
				obj.side = side;

				// NOTE: We don't "fill/close" the side, because that would mess with showing the correct road orientation and sprite
			} else {
				let ind = this.getFreeSquareIndex(pos);
				obj.ind = ind

				this.getCell(pos).filledSquares[ind] = true;
			}

			this.trafficSigns.push(obj)
			this.getCell(pos).trafficSign = true;
		}
	}

	swapSpecialIngredients() 
	{
		let RNG = seedRandom(this.cfg.seed + "-specialIngredients");

		// find DUPLICATE ingredient buildings; save them as possibilities for swapping
		let ingredientsCovered = [false, false, false, false, false, false, false]
		let possibleSwapBuildings = [];
		let orderBuildings = [];

		// to make sure we evaluate buildings in a random order
		// AND to give the regular ingredients the LARGEST buildings (with the most entrances)...
		let buildingsCopy = this.buildings.slice();
		this.shuffle(buildingsCopy);
		buildingsCopy.sort(function(a,b) { if(a.tiles.length < b.tiles.length) { return 1; } else { return -1; }})

		for(let i = 0; i < buildingsCopy.length; i++) 
		{
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
		for(let i = 0; i < numSpecialIngredientsWanted; i++) 
		{
			let b = possibleSwapBuildings[i];
			let type, frame

			if(this.specialIngredientsIncluded.length < 7) 
			{
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
			if(requiredSideDish && orderBuildings.length > 0) 
			{
				const randOrderBuilding = orderBuildings.splice(Math.floor(RNG()*orderBuildings.length), 1)[0];
				randOrderBuilding.sideDishes.push(type)
			}
		}
	}

	async visualizeGame(vis:MaterialVisualizer) 
	{
		// prepare all layers/containers
		const group = vis.prepareDraw();
		const roadGroup = new ResourceGroup();
		group.add(roadGroup);
		const gridGroup = new ResourceGroup();
		group.add(gridGroup);
		const shadowGroup = new ResourceGroup();
		group.add(shadowGroup);
		const buildingGroup = new ResourceGroup();
		// buildingGraphics.depth = 10;
		group.add(buildingGroup);
		const overlayGroup = new ResourceGroup();
		group.add(overlayGroup);
		// overlayGraphics.depth = 19;

		const cs = this.cfg.cellSize

		//
		// Draw some nice grid lines
		// We go _half resolution_ here, to give each square 4 quadrants
		//
		const opLine = new LayoutOperation({
			stroke: "#00000044",
			strokeWidth: 2
		})

		for(let x = 0; x < this.cfg.resX; x += 0.5) 
		{
			const line = new ResourceShape(new Line(new Point(x*cs,0), new Point(x*cs, this.cfg.resY*cs)));
			gridGroup.add(line, opLine);
		}

		for(let y = 0; y < this.cfg.resY; y += 0.5) 
		{
			const line = new ResourceShape(new Line(new Point(0, y*cs), new Point(this.cfg.resX*cs, y*cs)));
			gridGroup.add(line, opLine);
		}

		const fontSize = cs*0.5*0.5;
		const strokeThickness = 0.15*fontSize;
		const textConfigSubway = new TextConfig({
			font: this.fontFamily,
			size: fontSize
		}).alignCenter();

		//
		// Go through all cells, create a graphic based on what they are
		//
		for(let x = 0; x < this.cfg.resX; x++) 
		{
			for(let y = 0; y < this.cfg.resY; y++) 
			{
				const pos = new Point(x,y);
				const obj = this.getCell(pos);
				const posRect = new Point(x*cs,y*cs);
				const rect = new Rectangle().fromTopLeft(posRect, new Point(cs));

				let color = this.cfg.inkFriendly ? "#FFFFFF" : "#EEEEEE";
				if(obj.type == 'road') 
				{
					let orient = this.getOrientationFromNeighbours(pos);
					const resRoad = this.cfg.visualizer.getResource("roadmarks");
					const opRoad = new LayoutOperation({
						pos: new Point(posRect.x+0.5*cs, posRect.y+0.5*cs),
						size: new Point(cs),
						pivot: Point.CENTER,
						alpha: 0.75,
						frame: orient.frame,
						rot: orient.rot
					})
					group.add(resRoad, opRoad);

					const opRect = new LayoutOperation({ fill: color });
					roadGroup.add(new ResourceShape(rect), opRect);

					// If this has a subway, place its sprite
					const margin = this.cfg.borderWidth
					if(obj.hasSubway()) 
					{
						const subwayPos = this.getSquarePositionOnCell(pos, obj.subway.positionIndex, true);
						const subwayPosReal = new Point(subwayPos.x*cs, subwayPos.y*cs);

						const resDec = this.cfg.visualizer.getResource("decorations");
						const opDec = new LayoutOperation({
							pos: subwayPosReal,
							size: new Point((0.5-margin)*cs),
							frame: 1,
							pivot: Point.CENTER,
							depth: 5
						})
						group.add(resDec, opDec);

						const str = (obj.subway.counter + 1).toString();
						const opTextSubway = new LayoutOperation({
							pos: subwayPosReal,
							size: new Point(cs),
							pivot: Point.CENTER,
							depth: 6,
							fill: "#FFFFFF",
							stroke: "#6C0003",
							strokeWidth: strokeThickness,
							strokeAlign: StrokeAlign.OUTSIDE
						})
						const resTextSubway = new ResourceText({ text: str, textConfig: textConfigSubway });
						group.add(resTextSubway, opTextSubway);
					}

					if(obj.hasEntrance()) { this.visualizeEntrance(group, obj, roadGroup) }

					if(obj.hasPolice()) 
					{
						console.log("PLACING POLICE");
						const policePos = this.getSquarePositionOnCell(new Point(x,y), obj.police.positionIndex, true);
						const resPolice = this.cfg.visualizer.getResource("general_icons");
						const opPolice = new LayoutOperation({
							pos: new Point(policePos.x*cs, policePos.y*cs),
							size: new Point((0.5-margin)*cs),
							pivot: Point.CENTER,
							frame: 1,
							depth: 5
						});
						group.add(resPolice, opPolice);
					}


				} else if(obj.type == 'building') {

					let buildingObj = this.buildings[obj.buildingIndex]

					if(buildingObj.type == 'ingredient') {
						color = this.cfg.buildingColorDict[buildingObj.ingredient]
					} else if(buildingObj.type == 'order') {
						color = "#91ACFF"
					} else if(buildingObj.type == 'reserved' || buildingObj.type == 'bank') {
						color = "#FFFFFF"
					} else if(buildingObj.type == 'special') {
						color = SPECIAL_BUILDINGS[buildingObj.special].color;
					} else {
						color = "#333333"
					}
					
					if(!buildingObj.streetConnection) { color = "#666666" }
					if(this.cfg.inkFriendly) { color = "#FFFFFF"; }

					const opRect = new LayoutOperation({ fill: color });
					buildingGroup.add(new ResourceShape(rect), opRect);

					// draw the ingredient icon on all cells within the building
					// or, if it's a special building, draw its special icon
					// EXCEPTION: on inkFriendly mode, only draw it for the center cell
					if(buildingObj.type == 'ingredient' || buildingObj.type == 'special') 
					{
						const isCenterCell = (x == buildingObj.centerCellData.cell.x && y == buildingObj.centerCellData.cell.y);

						if(!this.cfg.inkFriendly || isCenterCell) 
						{
							const opSprite = new LayoutOperation({
								pos: new Point(posRect.x+0.5*cs, posRect.y+0.5*cs),
								size: new Point(cs * this.cfg.ingredientSpriteScale),
								pivot: Point.CENTER,
								depth: 15,
								frame: buildingObj.ingredient
							})

							let resSprite = this.cfg.visualizer.getResource("ingredients");
							if(buildingObj.type != "ingredient")
							{
								resSprite = this.cfg.visualizer.getResource("special_buildings");
								opSprite.frame = SPECIAL_BUILDINGS[buildingObj.special].iconFrame
							}
							group.add(resSprite, opSprite);
						}
					}

					// draw a shadow by moving the rect slightly off
					if(!this.cfg.inkFriendly) 
					{
						const shadowCol = new Color("#000000");
						shadowCol.a = 0.3;

						const shadowOffset = new Point(this.cfg.borderWidth*this.cfg.cellSize);
						const shadowRect = rect.clone(true);
						shadowRect.move(shadowOffset);

						const opShadow = new LayoutOperation({ fill: shadowCol });
						shadowGroup.add(new ResourceShape(shadowRect), opShadow);
					}
				}

				
			}
		}

		//
		// Draw all building borders
		//
		const borderWidth = this.cfg.borderWidth*this.cfg.cellSize;
		const opLineBorder = new LayoutOperation({
			stroke: "#000000",
			strokeWidth: borderWidth
		})
		for(const building of this.buildings) 
		{
			for(const b of building.borders) 
			{
				// b is an ARRAY [startCorner, endCorner], where each corner is a Point
				const line = new Line(new Point(b[0].x * cs, b[0].y * cs), new Point(b[1].x * cs, b[1].y * cs));
				buildingGroup.add(new ResourceShape(line), opLineBorder);
			}
		}

		//
		// Draw decorations (hedges & roundabouts)
		//
		this.visualizeDecorations(group, buildingGroup, overlayGroup);

		//
		// Draw orders (on buildings that have them)
		//
		this.visualizeOrders(group);

		//
		// Draw bank icon on the bank
		// ( + draw seed within it)
		//
		const obj = this.pickCenterCellAndNeighbour(this.cfg.bankBuilding)
		const randTile = obj.cell;
		const randNeighbour = obj.buildingCellsAround[Math.floor(this.RANDOM_DRAW_RNG() * obj.buildingCellsAround.length)]

		const resGeneral = this.cfg.visualizer.getResource("general_icons");
		const opBank = new LayoutOperation({
			pos: new Point((randTile.x+0.5)*cs, (randTile.y+0.5)*cs),
			frame: 0,
			size: new Point(cs * this.cfg.ingredientSpriteScale),
			pivot: Point.CENTER,
			depth: 15
		});
		group.add(resGeneral, opBank);

		const seedFontSize = 16 * (this.cfg.size.x / 1160.0);
		const textConfigSeed = new TextConfig({
			font: this.fontFamily,
			size: seedFontSize
		}).alignCenter();
		const opTextSeed = new LayoutOperation({
			pos: new Point((randNeighbour.x + 0.5)*cs, (randNeighbour.y + 0.5)*cs),
			size: new Point(cs),
			pivot: Point.CENTER,
			fill: "#AAAAAA",
			depth: 15
		})
		const resTextSeed = new ResourceText({ text: this.cfg.seed, textConfig: textConfigSeed });
		group.add(resTextSeed, opTextSeed);

		//
		// Draw traffic signs
		//
		this.visualizeTrafficSigns(group);

		//
		// Draw movement shapes
		//
		const rectStart = new Point(
			this.cfg.resX-this.cfg.shapeRectSize.x,
			this.cfg.resY-this.cfg.shapeRectSize.y
		);

		// Big background rectangle
		const rectStartReal = new Point(rectStart.x*cs, rectStart.y*cs);
		const rect = new Rectangle().fromTopLeft(rectStartReal, new Point(this.cfg.shapeRectSize.x*cs, this.cfg.shapeRectSize.y*cs));

		const opBGRect = new LayoutOperation({
			fill: "#FFCCCC",
			stroke: "#330000",
			strokeWidth: this.cfg.borderWidth*cs
		});
		overlayGroup.add(new ResourceShape(rect), opBGRect);

		// Draw shapes individually
		let moveShapeSize = new Point(0.8*cs);
		const resShapes = this.cfg.visualizer.getResource("shapes");
		for(let i = 0; i < this.shapes.length; i++) 
		{
			const row = Math.floor(i / this.cfg.shapeRectSize.x)
			const col = i % this.cfg.shapeRectSize.x
			const pos = new Point((rectStart.x+0.5+col)*cs, (rectStart.y + 0.5+row)*cs);

			const opShape = new LayoutOperation({
				pos: pos,
				size: moveShapeSize,
				pivot: Point.CENTER,
				frame: this.shapes[i],
				depth: 20
			})
			group.add(resShapes, opShape);
		}

		// draw hint about picking UNIQUE shapes
		const resHint = this.cfg.visualizer.getResource("unique_shapes_hint");
		const hintMargin = 4;
		const posHint = new Point(rectStartReal.x + 0.5*rect.getSize().x, rectStartReal.y + rect.getSize().y - hintMargin);
		const hintX = 0.6*moveShapeSize.x;
		const opHint = new LayoutOperation({
			pos: posHint,
			size: new Point(hintX, (160.0/400.0) * hintX),
			pivot: new Point(0.5, 1),
			depth: 22,
			alpha: 0.66
		});
		group.add(resHint, opHint);

		return await vis.finishDraw(group);
	}

	visualizeEntrance(group:ResourceGroup, obj:Cell, roadGroup:ResourceGroup) 
	{
		const cs = this.cfg.cellSize;
		const specialPlacesEnabled = this.cfg.expansions.preposterousPlaces;

		let entData = obj.entrance
		const rectPos = new Point(entData.pos.x*cs, entData.pos.y*cs);
		const rectSize = new Point(0.5*cs);
		const rectEntrance = new Rectangle().fromTopLeft(rectPos, rectSize);
		let connectedBuilding = this.buildings[entData.building]

		// copy color from the building we're connected to
		// otherwise default to a light blue
		// NOTE: Ingredients can be changed on buildings, so this value is NOT necessarily the same as entData.ingredient
		let color = "#CCCCFF";
		let realIngredient = connectedBuilding.ingredient
		if(realIngredient != null) { color = this.cfg.buildingColorDict[realIngredient] }
		
		if(connectedBuilding.type == 'reserved') { color = "#FFEEDA"; } // restaurants get a light brown/beige-ish tint
		if(connectedBuilding.type == 'bank') { color = "#C5C1C1"; } // banks get a light gray

		// banks and restaurants only get an entrance if special places are enabled
		if((connectedBuilding.type == 'bank' || connectedBuilding.type == 'reserved') && !specialPlacesEnabled) { return; }

		const opEntrance = new LayoutOperation({ fill: color });
		roadGroup.add(new ResourceShape(rectEntrance), opEntrance);

		const resGeneral = this.cfg.visualizer.getResource("general_icons");
		const resIng = this.cfg.visualizer.getResource("ingredients");
		const opSprite = new LayoutOperation({
			pos: new Point(rectPos.x + 0.5*rectSize.x, rectPos.y + 0.5*rectSize.y),
			size: new Point(rectSize.x * this.cfg.ingredientSpriteScale),
			pivot: Point.CENTER,
			alpha: 0.75
		})

		// determine if this entrance should display some sort of sprite
		let resFinal = null;
		if(entData.ingredient != null) 
		{
			resFinal = resIng;
			opSprite.frame = realIngredient;
		} 

		if(connectedBuilding.type == 'bank') {
			resFinal = resGeneral;
			opSprite.frame = 0;
		} else if(connectedBuilding.type == 'reserved') {
			resFinal = resGeneral;
			opSprite.frame = 3;
		}

		// finally, if some sprite was selected, actually create it
		if(resFinal) { group.add(resFinal, opSprite); }
	}

	visualizeTrafficSigns(group:ResourceGroup) 
	{
		if(!this.trafficSigns) { return; }

		const cs = this.cfg.cellSize;

		const fontSize = 20 * (this.cfg.size.x / 1160.0);
		//const textColor = "#AAAAAA"; => somehow didn't use this one, but want to keep it just in case

		const textConfigGate = new TextConfig({
			font: this.fontFamily,
			size: fontSize
		}).alignCenter();

		const resTrafficSigns = this.cfg.visualizer.getResource("traffic_signs");

		for(let i = 0; i < this.trafficSigns.length; i++) 
		{
			let obj = this.trafficSigns[i];
			let dictObj = TRAFFIC_SIGNS[obj.type]

			// IT'S A GATE!
			if(dictObj.gate) 
			{
				const pos = new Point(
					obj.pos.x + 0.5 + 0.5*Math.cos(obj.side * 0.5 * Math.PI),
					obj.pos.y + 0.5 + 0.5*Math.sin(obj.side * 0.5 * Math.PI)
				);

				const posReal = new Point(pos.x*cs, pos.y*cs);
				const opGate = new LayoutOperation({
					pos: posReal,
					size: new Point(cs),
					pivot: Point.CENTER,
					frame: dictObj.iconFrame,
					rot: obj.side * 0.5 * Math.PI,
					depth: 5
				});
				group.add(resTrafficSigns, opGate);

				if(obj.type == 'Line Gate') {
					// Place low number inside
					let str = ( Math.floor(this.TRAFFIC_SIGN_RNG()*2) + 1).toString();

					// The higher the player count, the more likely you are to get a 3
					// (we need that, otherwise there's just not enough room for all lines)
					if(this.TRAFFIC_SIGN_RNG() <= this.cfg.numPlayers*0.025) { str = "3"; }

					const resText = new ResourceText({ text: str, textConfig: textConfigGate });
					const opText = new LayoutOperation({
						pos: posReal,
						size: new Point(3*textConfigGate.size),
						pivot: Point.CENTER,
						depth: 6,
						fill: "#2D0B37"
					})
					group.add(resText, opText);

				} else if(obj.type == 'Ingredient Gate' || obj.type == 'Smuggler Gate') {
					// Place random ingredient inside
					let randIngredient = Math.floor(this.TRAFFIC_SIGN_RNG()*7);
					if(this.TRAFFIC_SIGN_RNG() <= (this.specialIngredientsIncluded.length)/14.0) {
						randIngredient = this.specialIngredientsIncluded[Math.floor(this.TRAFFIC_SIGN_RNG()*this.specialIngredientsIncluded.length)];
					}

					const resIng = this.cfg.visualizer.getResource("ingredients");
					const opIng = new LayoutOperation({
						pos: posReal,
						size: new Point(0.35*cs),
						frame: randIngredient,
						pivot: Point.CENTER,
						depth: 6
					})
					group.add(resIng, opIng);

					// If smuggler, add (small, randomly rotated) cross icon on top
					if(obj.type == 'Smuggler Gate') 
					{
						const resGeneral = this.cfg.visualizer.getResource("general_icons");
						const opGate = new LayoutOperation({
							pos: new Point(posReal.x + 0.075*cs, posReal.y - 0.075*cs),
							size: new Point(0.2*cs),
							frame: 2,
							pivot: Point.CENTER,
							rot: Math.random()*0.5*Math.PI - 0.25*Math.PI,
							depth: 7
						})
						group.add(resGeneral, opGate);
					}


				} else if(obj.type == 'Backpack Gate') {
					// Add number + "<" or ">" sign
					let str = '';
					if(this.TRAFFIC_SIGN_RNG() <= 0.5) {
						str = '<' + (Math.floor(this.TRAFFIC_SIGN_RNG()*5) + 3)
					} else {
						str = '>' + (Math.floor(this.TRAFFIC_SIGN_RNG()*4) + 1)
					}

					const resText = new ResourceText({ text: str, textConfig: textConfigGate });
					const opText = new LayoutOperation({
						pos: posReal,
						size: new Point(3*textConfigGate.size),
						fill: "#166332",
						pivot: Point.CENTER,
						depth: 6
					})
					group.add(resText, opText);
				}

			// NOT A GATE; just a regular sign, display inside the designated square
			} else {
				const margin = this.cfg.borderWidth
				const pos = this.getSquarePositionOnCell(obj.pos, obj.ind, true);
				const posReal = new Point(pos.x*cs, pos.y*cs); // @TODO: I should just replace AAAALL of these calls with one .toRealPosition() function

				const op = new LayoutOperation({
					pos: posReal,
					size: new Point((0.5-margin)*cs),
					pivot: Point.CENTER,
					frame: dictObj.iconFrame,
					depth: 5,
					alpha: 0.75
				})
				group.add(resTrafficSigns, op);
			}

		}
	}

	visualizeDecorations(group:ResourceGroup, buildingGroup:ResourceGroup, overlayGroup:ResourceGroup) 
	{
		const cs = this.cfg.cellSize;

		const resDecs = this.cfg.visualizer.getResource("decorations");

		let DECORATION_RNG = seedRandom(this.cfg.seed + "-decorations");
		let numRoundaboutDecorations = 4;
		for(let i = 0; i < this.obstacles.length; i++) 
		{
			let o = this.obstacles[i];

			if(o.type == 'hedge') 
			{

				let h = o.line;
				const line = new Line(new Point(h.start.x*cs, h.start.y*cs), new Point(h.end.x*cs, h.end.y*cs));

				const opHedge = new LayoutOperation({
					pos: line.start,
					size: new Point(cs),
					frame: 0,
					pivot: new Point(0, 0.5),
					rot: o.rot,
					depth: 15
				})
				group.add(resDecs, opHedge);

				const opLine = new LayoutOperation({
					stroke: "#006600",
					strokeWidth: this.cfg.borderWidth*cs
				});
				buildingGroup.add(new ResourceShape(line), opLine);
			
			} else if(o.type == 'roundabout') {

				const rectSize = new Point(cs);
				const rectPos = new Point((o.center.x - 0.5) * cs, (o.center.y-0.5) * cs);
				const rect = new Rectangle().fromTopLeft(rectPos, rectSize);

				const opRoundabout = new LayoutOperation({
					pos: new Point(o.center.x*cs, o.center.y*cs),
					pivot: Point.CENTER,
					depth: 20
				});

				// if special places are enabled, we use all roundabouts for special buildings
				// otherwise, pick a random decoration/roundabout sprite to display
				let color, strokeColor
				let resFinal = resDecs;
				if(o.specialBuilding != null) {
					const buildingType = o.specialBuilding
					resFinal = this.cfg.visualizer.getResource("special_buildings");
					opRoundabout.frame = SPECIAL_BUILDINGS[buildingType].iconFrame;
					opRoundabout.size = new Point(this.cfg.ingredientSpriteScale * cs);
					color = SPECIAL_BUILDINGS[buildingType].color;
					strokeColor = "#000000";

					// lower opacity on open field, both to signal its function (cross it any way you like) and make player lines more readable
					if(buildingType == 'Plaza') { opRoundabout.alpha = 0.55; }
				} else {
					opRoundabout.frame = Math.floor(DECORATION_RNG() * numRoundaboutDecorations) + 2;
					opRoundabout.size = new Point(cs);
					color = "#9EFB7B";
					strokeColor = "#0E5E00";
				}
				group.add(resFinal, opRoundabout);

				// ink-friendly maps get a WHITE background and LIGHTGRAY border on decorations
				// otherwise we get a LIGHT GREEN + DARK GREEN combo
				let fillColor = "#FFFFFF";
				let stroke = "#CCCCCC";
				if(!this.cfg.inkFriendly) {
					fillColor = color;
					stroke = strokeColor
				}

				const opRect = new LayoutOperation({ fill: fillColor });
				overlayGroup.add(new ResourceShape(rect), opRect);

				const opLineBorder = new LayoutOperation({
					stroke: stroke,
					strokeWidth: this.cfg.borderWidth*cs
				})

				// draw borders individually (because it's ugly to get borders between two adjacent decoration elements)
				for(const border of o.borders) 
				{
					const line = new Line(border.start.clone().scale(cs), border.end.clone().scale(cs));
					overlayGroup.add(new ResourceShape(line), opLineBorder);
				}
			}
		}
	}

	visualizeOrders(group:ResourceGroup) 
	{
		const cs = this.cfg.cellSize;
		const fontSize = 16 * (this.cfg.size.x / 1160.0);
		const textConfigPrice = new TextConfig({
			font: this.fontFamily,
			size: fontSize
		}).alignCenter();

		this.cfg.bankBuilding = null;

		const resCrust = this.cfg.visualizer.getResource("crust");
		const resIng = this.cfg.visualizer.getResource("ingredients");

		let DRAW_RNG = seedRandom(this.cfg.seed + '-drawStuff')
		for(let i = 0; i < this.buildings.length; i++) 
		{
			let b = this.buildings[i];

			if(b.type == 'bank') { this.cfg.bankBuilding = b; continue; }
			if(b.type != 'order') { continue; }

			let obj = this.pickCenterCellAndNeighbour(b)
			let cell = obj.cell, buildingCellsAround = obj.buildingCellsAround

			// get order, add crust at the start
			let order = b.order.slice()
			order.unshift(-1);

			const midPoint = new Point((cell.x + 0.5) * cs, (cell.y + 0.5) * cs);

			// generate sprites for the order, place on top of cell
			for(const ingNumber of order) 
			{
				const op = new LayoutOperation({
					pos: midPoint,
					size: new Point(this.cfg.ingredientSpriteScale * cs),
					pivot: Point.CENTER,
					depth: 15,
					frame: ingNumber + 1
				})
				group.add(resCrust, op);
			}

			// generate sprites for the sideDishes as well
			for(let sd = 0; sd < b.sideDishes.length; sd++) 
			{
				let data = SPECIAL_INGREDIENTS[b.sideDishes[sd]];
				const op = new LayoutOperation({
					pos: midPoint.clone().add(data.iconOffset.clone().scale(cs)),
					frame: data.iconFrame,
					size: new Point(0.4*cs),
					pivot: Point.CENTER,
					depth: 15
				})
				group.add(resIng, op);
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

			const randNeighbourCell = buildingCellsAround[Math.floor(DRAW_RNG() * buildingCellsAround.length)];
			const posText = new Point((randNeighbourCell.x + 0.5) * cs, (randNeighbourCell.y + 0.5) * cs);
			const opTextPrice = new LayoutOperation({
				pos: posText,
				size: new Point(cs),
				pivot: Point.CENTER,
				fill: "#003636",
				depth: 15
			})
			const resTextPrice = new ResourceText({ text: "$" + price, textConfig: textConfigPrice });
			group.add(resTextPrice, opTextPrice);

			// place a courier icon underneath THAT (to remind players they get a new courier for delivering)
			const resCourier = this.cfg.visualizer.getResource("general_icons");
			const opCourier = new LayoutOperation({
				pos: new Point(posText.x, posText.y + 8 - 0.13*cs),
				size: new Point(0.5*cs),
				pivot: new Point(0.5, 0),
				frame: 4,
				depth: 15
			})
			group.add(resCourier, opCourier);
		}
	}

	pickCenterCellAndNeighbour(b:Building) 
	{
		// pick a random cell on the building, preferably somewhere near the middle
		// (it has the most cells of the same building around it)
		let cell = null, buildingCellsAround = null;

		for(const tempCell of b.tiles) {
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

		return { cell: cell, buildingCellsAround: buildingCellsAround }
	}

	getAllBuildingCellsAround(pos:Point, ind:number) 
	{
		const buildingCellsAround = [];
		for(let i = 0; i < 4; i++) 
		{
			const nb = NBS[i];
			const tPos = new Point(pos.x + nb.x, pos.y + nb.y);
			if(this.outOfBounds(tPos)) { continue; }

			let obj = this.getCell(tPos);
			if(obj.type != 'building') { continue; } // ignore non-buildings
			if(obj.buildingIndex != ind) { continue; }

			buildingCellsAround.push(tPos);
		}

		return buildingCellsAround
	}

	getRandom(list:Record<string,any>)
	{
		return getWeighted(list, "prob", this.RANDOM_DRAW_RNG);
	}

	placeSpecialBuildings()
	{
		// @TODO
	}
}