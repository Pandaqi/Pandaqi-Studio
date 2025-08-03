import Config from "./config"
import Hints from "./hints"
import { TILE_DICT, DISCRETE_LISTS, BEARING_CONDITIONS, FIXED_MAP_TILES } from "../shared/dict"
import Point from "js/pq_games/tools/geometry/point";
import Cell from "./cell";

class MapClass
{
	mapGenFail = false
	numMapGens = 0
	cachedImages:Record<string,any> = {}

	width = 0
	height = 0
	totalTileCount = 0

	map:Cell[][] = []
	mapList:Cell[] = []

	arrowTiles:Cell[] = []
	edgeTiles:Cell[] = []
	waterTiles:Cell[] = []
	networkTiles:Cell[] = []

	compassTile:Cell = null
	compassBlocks = []

	mapTile:Cell = null
	markedMapTiles = []

	possibleTypes:string[] = []
	treasureLocation:Cell = null

	tilesLeftPerPlayer = []

	typeSummedProb = 0
	materialPerType:Record<string,number> = {}

	initialize()
	{
		if(!Config.generateMap) { return; }

		this.mapGenFail = true
		this.numMapGens = 0;

		this.width = Config.width;
		this.height = Config.height;
		this.totalTileCount = Config.totalTileCount;

		while(this.mapGenFail) 
		{
			this.numMapGens += 1;
			this.mapGenFail = false;

			this.seed();
			this.grid();
			this.randomize();
			this.network();
			this.treasure();
		}
	}

	seed()
	{
		const randomSeedLength = Math.floor(Math.random() * 6) + 3;
		const randomSeed = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, randomSeedLength);

		if(Config.seed == '') { Config.seed = randomSeed; }
		const finalSeed = Config.seed + "_" + Config.numGens + "_" + this.numMapGens;
		
		Config.createRandomNumberGenerators(finalSeed, randomSeed);
	}

	grid()
	{
		this.map = [];
		this.edgeTiles = [];
		this.materialPerType = {};
		this.compassTile = null;
		this.mapTile = null;
		this.waterTiles = [];
		this.arrowTiles = [];

		const w = this.width;
		const h = this.height;

		// create base objects for the grid/tiles
		for(let x = 0; x < w; x++) 
		{
			this.map[x] = [];

			for(let y = 0; y < h; y++) 
			{
				const quadrant = Math.floor(2 * x / w) + Math.floor(2 * y / h)*2;
				const isEdge = (x == 0 || x == (w-1)) || (y == 0 || y == (h-1));
				const pos = new Point(x,y);

				const cell = new Cell();
				cell.setPosition(pos);
				cell.setLabelData(y.toString(), Config.alphabet[x]);
				cell.setGridData(isEdge, quadrant, DISCRETE_LISTS.quadrant[quadrant])

				this.map[x][y] = cell;
				if(isEdge) { this.edgeTiles.push(cell); }
			}
		}

		this.mapList = this.map.flat();

		// saving all our (valid) neighbours once at the start saves a lot of time (and for loops) later on
		// we save the ACTUAL NEIGHBOR CELL, not just its location (like previous iterations of this idea)
		const nbCoords = [
			new Point(1,0),
			new Point(0,1),
			new Point(-1,0),
			new Point(0,-1)
		]

		for(const cell of this.mapList)
		{
			const nbs = [];
			for(let i = 0; i < nbCoords.length; i++) 
			{
				const newPos = new Point(cell.x + nbCoords[i].x, cell.y + nbCoords[i].y);
				if(this.outOfBounds(newPos)) { continue; }
				nbs.push(this.map[newPos.x][newPos.y]);

				this.map[cell.x][cell.y].nbs = nbs;
			}
		}
	}

	randomize()
	{
		const types = [];
		this.possibleTypes = Config.typesIncluded.slice();

		// Even digitally, I apply the material limit, just more loosely/randomly
		if(!Config.useRealMaterial) 
		{ 
			for(const key in TILE_DICT) 
			{
				if(TILE_DICT[key].once) { continue; }
				TILE_DICT[key].material += 5;
			}
		}

		// If we only want water at the edges, we determine those tiles first
		// Then remove water as an option
		if(Config.waterOnlyAtEdges) 
		{
			this.possibleTypes.splice(this.possibleTypes.indexOf("water"), 1);

			const numEdgeStarters = 1 + Math.floor(Config.rng.map() * 4);
			for(let i = 0; i < numEdgeStarters; i++)
			{
				let tile = this.getRandomEdgeTile(this.waterTiles);
				tile.type = 'water';
				this.waterTiles.push(tile);
			}

			let numExtra = 2 + Math.floor(Config.rng.map() * 5);

			if(Config.useRealMaterial) {
				numExtra = Math.min(TILE_DICT.water.material - numEdgeStarters, numExtra);
			}
			
			for(let i = 0; i < numExtra; i++)
			{
				const randTile = this.waterTiles[Math.floor(Config.rng.map() * this.waterTiles.length)];
				const arr = [];
				for(let n = 0; n < randTile.nbs.length; n++)
				{
					if(randTile.nbs[n].type == 'water') { continue; }
					arr.push(randTile.nbs[n]);
				}

				if(arr.length == 0) { i--; continue; }

				const newTile = arr[Math.floor(Config.rng.map() * arr.length)];
				newTile.type = 'water';
				this.waterTiles.push(newTile);
			}
		}


		// RULE 1: at least one of each available type
		// (some types only get ONE and are removed after this)
		// (reverse loop because "checkMaterialLimit" can change this array)
		for(let i = this.possibleTypes.length-1; i >= 0; i--)
		{
			let type = this.possibleTypes[i];
			types.push(type);
			this.checkMaterialLimit(type, this.possibleTypes);
		}

		this.typeSummedProb = this.calculateListProbabilities(this.possibleTypes);

		// RULE 2: fill randomly after that
		// ("empty" is simply one of the possible types)
		while(types.length < (this.totalTileCount-this.waterTiles.length))
		{
			let newType = this.getRandomTileType();
			types.push(newType);
			this.checkMaterialLimit(newType, this.possibleTypes);
		}

		// Shuffle and assign
		this.shuffle(types);

		for(let i = 0; i < this.mapList.length; i++)
		{
			let cell = this.mapList[i];

			cell.rot = Math.floor(Config.rng.map() * 4);

			// type comes last, otherwise the "continue" screws things up
			let alreadyHasType = (cell.type != '');
			if(alreadyHasType) { continue; }

			cell.type = types.pop();

			if(cell.type == "arrow") {
				this.arrowTiles.push(cell);
			} else if(cell.type == "compass") {
				this.compassTile = cell;
			} else if(cell.type == "map") {
				this.mapTile = cell;
			} else if(cell.type == "water") {
				this.waterTiles.push(cell);
			}
		}

		// assign symbols, if needed
		if(Config.expansions.symbols)
		{
			const EMPTY_SYMBOL_PROB = 0.33; // @TODO: move somewhere else?
			for(let i = 0; i < this.mapList.length; i++)
			{
				let cell = this.mapList[i];
				let symbolSlots = TILE_DICT[cell.type].symbolSlots;

				if(Config.useRealMaterial) {
					cell.symbols = TILE_DICT[cell.type].fixedSymbols;
					continue;
				}

				for(let s = 0; s < symbolSlots.length; s++)
				{
					if(!symbolSlots[s]) { continue; }
					if(Config.rng.map() <= EMPTY_SYMBOL_PROB) { continue }
					cell.symbols[s] = this.getRandomSymbol();
				}
			}
		}

		// Pre-save the blocks that the compass generates
		this.compassBlocks = [];
		for(let i = 0; i < 4; i++)
		{
			let conditions = structuredClone(BEARING_CONDITIONS[i]);
			for(let c = 0; c < conditions.length; c++) {
				// @ts-ignore
				conditions[c].value = this.compassTile[conditions[c].property];
			}

			this.compassBlocks.push( this.selectTilesWithConditions(conditions) );
		}

		// Pre-save map tiles
		
		this.markedMapTiles = [];

		if(Config.useRealMaterial)
		{
			let mapTileCoordinates = FIXED_MAP_TILES;
			for(let i = 0; i < mapTileCoordinates.length; i++)
			{
				let pos = this.convertToRealPos(mapTileCoordinates[i]);
				let realTile = this.map[pos.x][pos.y];
				this.markedMapTiles.push(realTile);
			}
		} 
		else 
		{	
			let numMarkedMapTiles = Math.floor(Config.rng.map() * (0.33*this.totalTileCount)) + Math.floor(0.25*this.totalTileCount);
			let mapListCopy = this.mapList.slice();
			this.shuffle(mapListCopy); // (NEVER shuffle the original mapList)
			for(let i = 0; i < numMarkedMapTiles; i++)
			{
				this.markedMapTiles.push(mapListCopy[i]);
			}
		}
	}

	network()
	{
		if(!Config.expansions.networks) { return; }

		let minEdges = Math.floor(Config.rng.map() * 5) + 4; // currently not really used for anything ... it just goes to max all the time
		let maxEdges = Math.floor(Config.rng.map() * 6) + 10;

		let totalNumEdges = 0;
		let walks = [];

		const CONTINUE_EXISTING_WALK_PROB = 0.25; // higher means all networks become one BIG network, which usually is BAD for hints and the game
		const POISON_WALK_CYCLE = 2;

		this.networkTiles = [];

		// first GENERATE the actual network
		while(totalNumEdges < maxEdges)
		{
			// pick a start tile (randomly or from an existing random walk)
			let startTile = this.getRandomTile();

			if(walks.length > 1 && (Config.rng.map() <= CONTINUE_EXISTING_WALK_PROB || startTile.networkPoison)) {
				let randIdx = Math.floor(Config.rng.map() * walks.length);
				if(randIdx % POISON_WALK_CYCLE == 0) { randIdx = (randIdx + 1) % walks.length; }
				let randWalk = walks[randIdx];
				startTile = randWalk[Math.floor(Config.rng.map() * randWalk.length)];
			}

			// randomly walk into valid directions
			let length = Math.floor(Config.rng.map() * 3) + 2;
			let newWalk = [startTile];
			let curTile = startTile;

			let makePoison = (walks.length % POISON_WALK_CYCLE == 0); // one in X walks is POISON and stands on its own, whatever happens
			startTile.networkPoison = makePoison;

			for(let i = 0; i < length; i++)
			{
				let nb = this.getRandomValidNetworkNeighbor(curTile);
				if(nb == null) { break; }

				curTile.connNbs.push(nb);
				nb.connNbs.push(curTile);
				
				newWalk.push(nb);
				curTile = nb;
				curTile.networkPoison = makePoison;
			}

			// save what we just did
			totalNumEdges += (newWalk.length-1);
			walks.push(newWalk);

		}

		// now SAVE which tiles are connected, because we'll need it for the hints
		// NOTE/@TODO: This is pretty expensive, but I don't see a cheaper way?
		for(let i = 0; i < this.mapList.length; i++)
		{
			let cellA = this.mapList[i];
			cellA.allConnectedTiles.push(cellA);

			if(!this.isNetworkTile(cellA)) { continue; }
			this.networkTiles.push(cellA);

			for(let j = 0; j < this.mapList.length; j++)
			{
				if(i == j) { continue; }

				let cellB = this.mapList[j];
				if(!this.isNetworkTile(cellB)) { continue; }
				if(cellB.allConnectedTiles.includes(cellA)) { continue; }
				if(!this.cellsAreConnected(cellA, cellB)) { continue; }

				cellA.allConnectedTiles.push(cellB);
				cellB.allConnectedTiles.push(cellA);
			}
		}

		// also SAVE how often each symbol occurs in our network, also needed for a hint
		for(let i = 0; i < this.mapList.length; i++)
		{
			let perTileType = {};
			let perType = {};
			let cell = this.mapList[i];

			for(let t = 0; t < cell.allConnectedTiles.length; t++)
			{
				let conn = cell.allConnectedTiles[t];
				let type = conn.type;
				if(!(type in perTileType)) { perTileType[type] = 0; }
				perTileType[type] += 1;

				let symbols = conn.symbols;
				for(let s = 0; s < symbols.length; s++)
				{
					let symbol = symbols[s];
					if(symbol == null) { continue; }

					if(!(symbol in perType)) { perType[symbol] = 0; }
					perType[symbol] += 1;
				}
			}

			cell.networkSymbolCount = perType;
			cell.networkTypeCount = perTileType;
		}
	}

	treasure()
	{
		this.treasureLocation = this.mapList[Math.floor(Config.rng.map() * this.mapList.length)];
	}

	checkMaterialLimit(type, list)
	{
		if(!(type in this.materialPerType)) { this.materialPerType[type] = 0; }
		this.materialPerType[type] += 1

		if(this.materialPerType[type] < TILE_DICT[type].material) { return; }

		list.splice(list.indexOf(type), 1);
		this.typeSummedProb = this.calculateListProbabilities(list);
	}

	/* UTILITIES */
	selectTilesWithConditions(conds)
	{
		let arr = [];

		for(let i = 0; i < this.mapList.length; i++)
		{
			let match = true;
			for(let c = 0; c < conds.length; c++)
			{
				if(this.conditionHolds(this.mapList[i], conds[c])) { continue; }
				match = false;
				break;
			}

			if(!match) { continue; }

			arr.push(this.mapList[i]);
		}

		return arr;
	}

	conditionHolds(cell, cond)
	{
		if(cond.check == "lessthan") {
			return cell[cond.property] <= cond.value
		} else if(cond.check == "morethan") {
			return cell[cond.property] >= cond.value;
		}
	}

	calculateListProbabilities(list)
	{
		let sum = 0;
		for(let i = 0; i < list.length; i++)
		{
			let data = TILE_DICT[list[i]];
			if(!("prob" in data)) { data.prob = 1; }
			sum += data.prob;
		}
		return sum;
	}

	getArrowsPointingAtUs(cell, quickFail = false)
	{
		let arr = [];
		for(let i = 0; i < Map.arrowTiles.length; i++)
		{
			if(!Map.cellPointsTo(Map.arrowTiles[i], cell)) { continue; }
			arr.push(i);
			if(quickFail) { return arr; }
		}
		return arr;
	}

	cellPointsTo(a:Cell, b:Cell)
	{
		let dir = this.getDirFromRotation(a.rot);
		let pos = new Point(a.x, a.y);

		while(true)
		{
			pos.x += dir.x;
			pos.y += dir.y;

			if(this.outOfBounds(pos)) { return false; }
			if(this.map[pos.x][pos.y] == b) { return true; }
		}
	}

	hasInDir(params)
	{
		let dir = params.dir;
		let pos = new Point(params.cell.x, params.cell.y);
		let curCell;

		while(true)
		{
			pos.x += dir.x;
			pos.y += dir.y;

			if(this.outOfBounds(pos)) { return false; }

			curCell = this.map[pos.x][pos.y];
			if(curCell[params.property] == params.value) { return true; }
		}
	}

	getDirFromRotation(rot) : Point
	{
		return new Point(
			Math.round(Math.cos(rot*0.5*Math.PI)),
			Math.round(Math.sin(rot*0.5*Math.PI))
		);
	}

	getRotationFromDir(dir:Point) : number
	{
		if(dir.x == 1) { return 0; }
		else if(dir.x == -1) { return 2; }
		else if(dir.y == 1) { return 1; }
		return 3;
	}

	getRotationTowardsCell(target:Point, start:Point)
	{
		return this.getRotationFromDir(this.getDirTowardsCell(target, start));
	}

	getDirTowardsCell(target:Point, start:Point) : Point
	{
		return new Point(target.x - start.x, target.y - start.y);
	}

	cellsAreConnected(a:Cell, b:Cell)
	{
		let cellsToCheck = [a];
		let cellsChecked = [];

		while(cellsToCheck.length > 0)
		{
			let curCell = cellsToCheck.pop();
			if(curCell == b) { return true; }

			for(let i = 0; i < curCell.connNbs.length; i++)
			{
				if(cellsChecked.includes(curCell.connNbs[i])) { continue; }
				cellsToCheck.push(curCell.connNbs[i]);
			}

			cellsChecked.push(curCell);
		}

		return false;
	}

	isWithinRadius(param)
	{
		let tiles = this.getTilesInRadius(param);
		for(let t = 0; t < tiles.length; t++)
		{
			if(tiles[t][param.property] != param.value) { continue; }
			return true;
		}
		return false;
	}

	getTilesInRadius(param)
	{
		const oX = param.cell.x, oY = param.cell.y;
		const arr = [];
		for(let x = -param.radius; x <= param.radius; x++) 
		{
			for(let y = -param.radius; y <= param.radius; y++) 
			{
				let dist = Math.abs(x) + Math.abs(y);
				if(dist > param.radius) { continue; }

				let fX = oX + x, fY = oY + y;
				const pos = new Point(fX,fY);
				if(this.outOfBounds(pos)) { continue; }

				arr.push(this.map[fX][fY]);
			}
		}
		return arr;
	}

	matchProperty(a,b)
	{
		if(Array.isArray(a)) { return a.includes(b); }
		return a == b;
	}

	adjacentToMatchList(params)
	{
		let list = params.cell[params.property];
		let excludeList = [];
		if("exclude" in params) { excludeList = params.exclude; }

		for(let i = 0; i < list.length; i++)
		{
			let elem = list[i];
			if(excludeList.includes(elem)) { continue; }

			params.value = elem;
			let match = Map.adjacentToMatch(params);
			if(!match) { continue; }
			return true;
		}

		return false;
	}

	adjacentToMatch(params)
	{
		for(let i = 0; i < params.cell.nbs.length; i++) 
		{
			let nb = params.cell.nbs[i];
			if(!this.matchProperty(nb[params.property], params.value)) { continue; }
			return true;
		}
		return false;
	}

	matchNetworkConnection(params)
	{
		for(let i = 0; i < params.cell.allConnectedTiles.length; i++)
		{
			let tile = params.cell.allConnectedTiles[i];
			if(!this.matchProperty(tile[params.property], params.value)) { continue; }
			return true;
		}
		return false;
	}

	countMatchingNeighbors(params)
	{
		let sum = 0;
		for(let i = 0; i < params.cell.nbs.length; i++)
		{
			let nb = params.cell.nbs[i];
			if(!this.matchProperty(nb[params.property], params.value)) { continue; }
			sum += 1;
		}
		return sum;
	}

	getRandomValidNetworkNeighbor(cell:Cell)
	{
		let arr = [];
		for(let i = 0; i < cell.nbs.length; i++)
		{
			// either they are poisoned, or we are, skip!
			if(cell.nbs[i].networkPoison) { continue; }
			if(cell.networkPoison && cell.nbs[i].connNbs.length > 0) { continue; }

			let alreadyConnected = cell.connNbs.includes(cell.nbs[i]);
			if(alreadyConnected) { continue; }

			arr.push(cell.nbs[i]);
		}

		return arr[Math.floor(Config.rng.map() * arr.length)];
	}

	getListPerType(list:string[])
	{
		const perType = {};
		
		for(let i = 0; i < list.length; i++)
		{
			let elem = list[i];
			if(elem == null) { continue; }
			
			if(!(elem in perType)) { perType[elem] = 0; }
			perType[elem] += 1;
		}
		return perType;
	}

	countNonEmptyEntries(list:any[])
	{
		let sum = 0;
		for(let i = 0; i < list.length; i++)
		{
			let elem = list[i];
			if(elem == null || elem == '') { continue; }
			sum += 1;
		}
		return sum;
	}

	getTilesInColumn(col:number)
	{
		return this.map[col].slice();
	}

	getTilesInRow(row:string)
	{
		const arr = [];
		for(let i = 0; i < this.width; i++)
		{
			arr.push(this.map[i][row]);
		}
		return arr;
	}

	tileListHasType(list:Cell[], type:string)
	{
		for(let i = 0; i < list.length; i++)
		{
			if(list[i].type != type) { continue; }
			return true;
		}
		return false;
	}

	getRandomTile()
	{
		return this.mapList[Math.floor(Config.rng.map() * this.mapList.length)];
	}

	getRandomTileType()
	{
		let rand = Config.rng.map();
		let sum = 0.0;
		let counter = -1;
		while(sum < rand)
		{
			counter += 1;
			sum += TILE_DICT[this.possibleTypes[counter]].prob / (this.typeSummedProb + 0.0);
		}

		return this.possibleTypes[counter];
	}

	getRandomEdgeTile(exclusions = [])
	{
		let list = this.edgeTiles.slice();
		this.handleExclusions(list, exclusions);
		return list[Math.floor(Config.rng.map() * list.length)];
	}

	getRandomSymbol()
	{
		return DISCRETE_LISTS.symbol[Math.floor(Config.rng.map() * DISCRETE_LISTS.symbol.length)];
	}

	isNetworkTile(cell:Cell)
	{
		return (cell.connNbs.length > 0);
	}

	outOfBounds(pos:Point)
	{
		return (pos.x < 0 || pos.x >= this.width) || (pos.y < 0 || pos.y >= this.height);
	}

	convertToStringPos(cell:Cell)
	{
		return Config.alphabet[cell.x] + (cell.y + 1);
	}

	convertToRealPos(str:string) : Point
	{
		return new Point(
			Config.alphabet.indexOf(str.charAt(0)),
			parseInt(str.slice(1)) - 1
		);
	}

	getAllLocationsAsStrings()
	{
		let list = this.mapList.slice();
		const arr:string[] = [];
		for(let i = 0; i < list.length; i++)
		{
			arr.push( this.convertToStringPos(list[i]) );
		}
		return arr;
	}

	testTileSwap(tileA:Cell, tileB:Cell)
	{
		// swap
		Map.map[tileA.x][tileA.y] = tileB;
		Map.map[tileB.x][tileB.y] = tileA;

		// calculate
		let list = Hints.getBotbeardPositiveList();
		let positiveA = list.includes(tileA);
		let positiveB = list.includes(tileB);

		// undo swap
		Map.map[tileA.x][tileA.y] = tileA;
		Map.map[tileB.x][tileB.y] = tileB;

		// return if answers changed, per cell
		return [positiveA != tileA.botPositive, positiveB != tileB.botPositive];
	}

	invertLocationList(arr:Cell[])
	{
		const locs = this.mapList.slice();
		const list = [];
		for(let i = 0; i < locs.length; i++)
		{
			let match = false;
			for(let a = arr.length - 1; a >= 0; a--)
			{
				if(locs[i] != arr[a]) { continue; }
				match = true;
				arr.splice(a, 1);
				break;
			}

			if(match) { continue; }
			list.push(locs[i]);
		}
		return list;
	}

	handleExclusions(arr, exclude) 
	{
		for(let i = 0; i < exclude.length; i++) 
		{
			let ind = arr.indexOf(exclude[i]);
			if(ind < 0) { continue; }
			arr.splice(ind, 1);
		}
	}

	shuffle(a:any[]) 
	{
	    let j, x, i;
	    for (i = a.length - 1; i > 0; i--) {
	        j = Math.floor(Config.rng.general() * (i + 1));
	        x = a[i];
	        a[i] = a[j];
	        a[j] = x;
	    }

	    return a;
	}
};

const Map = new MapClass();
export default Map;