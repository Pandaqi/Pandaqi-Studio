import { CITY_NAMES, COOL_WORD_TEMPLATES, DIFFICULTY_LEVELS, GOODS, JUNGLE_NAME_TEMPLATES, PLAYERCOUNT_TO_CITYCOUNT, PLAYER_COLORS, PathType, TerrainType } from "../shared/dict"
import calculateRoute from "./pathfinder"
// @ts-ignore
import { noise } from "./perlin"
import LayoutOperation from "js/pq_games/layout/layoutOperation"
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup"
import ResourceShape from "js/pq_games/layout/resources/resourceShape"
import ResourceText from "js/pq_games/layout/resources/resourceText"
import TextConfig from "js/pq_games/layout/text/textConfig"
import StrokeAlign from "js/pq_games/layout/values/strokeAlign"
import BoardVisualizer from "js/pq_games/tools/generation/boardVisualizer"
import Line from "js/pq_games/tools/geometry/line"
import Point from "js/pq_games/tools/geometry/point"
import Rectangle from "js/pq_games/tools/geometry/rectangle"
import shuffle from "js/pq_games/tools/random/shuffle"

interface CityData
{
	pos: Point,
	capital: number,
	connections: CityData[],
	connectionGroup: number,
	wantedGoods: GoodData[],
	airport: boolean,
	value?: number,
	addedBonus?: number
}

interface CellData
{
	val: number,
	isWater: boolean, 
	terrainType: TerrainType,

	isForest: boolean,
	forestFrame: number,

	partOfPath: boolean,
	pathSprite: any,
	pathTypes: PathType[],

	cityAllowed: boolean, 
	city: CityData,

	halfwayPointOfPath: boolean
}

interface ConnectionData
{
	city?: CityData,
	path: Point[], 
	pathType: PathType
}

interface GoodData
{
	name: string,
	value: number
}

interface RouteConfig
{
	terrainType: TerrainType,
	pathType: PathType, 
	minVal: number, 
	maxVal: number, 
	maxLength: number, 
	snapToPath: boolean,
	allowOverlap: boolean,
}

interface ConnectionQueryData
{
	count: number,
	rot: number,
	hasBend: boolean
}

export default class BoardGeneration
{
	cfg: Record<string,any>
	generationFail: boolean
	terrain: CellData[][]
	dockLocations: Point[]
	landLocations: Point[]
	waterEdges: Line[]
	cities: CityData[]
	connections: ConnectionData[]
	numCitiesInGroup: Record<number, number>
	goodsDict: Record<string, any>

	// user-input settings should be passed through config
	async draw(vis:BoardVisualizer) : Promise<ResourceGroup[]>
	{
		this.setup(vis);
		this.generateBoard();
		return this.visualizeGame(vis);
	}

	setup(vis:BoardVisualizer)
	{
		const jungleName = this.getRandomJungleName();

		const canvasWidth = vis.size.x;
		const scaleFactorDPI = (canvasWidth/1160.0);

		const userConfig = vis.config;
		userConfig.numPlayers = parseInt(userConfig.playerCount);
		userConfig.splitDims = userConfig.splitBoard ? new Point(2,2) : null; // @TODO: is this the way??

		this.cfg = 
		{
			seed: jungleName,
			jungleName: jungleName,

			w: userConfig.size.x,
			h: userConfig.size.y,

			numCities: PLAYERCOUNT_TO_CITYCOUNT[userConfig.numPlayers] ?? 10,
			cellSize: 20,
			noiseZoom: 99.9578372,

			deepWaterLine: -0.7,
			waterLine: -0.1,
			cityLine: 0.2,
			mountainLine: 0.9,

			cityMinRadius: 4, // overridden later anyways, based on player count
			cityMaxConnectionLength: 30,
			minDistanceToEdge: 4, // overriden later anyways, based on player count

			allowRelocating: true,
			relocateProbability: 0.9,

			landCityProbability: 0.35,

			numPlayers: userConfig.numPlayers,
			difficulty: userConfig.difficulty ?? "Training Wheels",
			inkFriendly: userConfig.inkFriendly ?? false,
			splitBoard: userConfig.splitBoard ?? false,
			cityBonus: userConfig.cityBonus ?? false,
			rulesReminder: userConfig.rulesReminder ?? false,

			minPathsRequiredOfEachType: 2
		}

		this.cfg.bgColor = this.cfg.inkFriendly ? "#FFFFFF" : "#333333";

		// OPTION 1 => fewer cities = longer maximal route length
		// this.cfg.cityMaxConnectionLength = 50 - this.cfg.numCities;

		// OPTION 2 => fewer cities = zoom in on map (to ensure enough space, allow cities closer together and to bounds)
		// this scales somewhat smoothly up/down with city count
		this.cfg.cellSize = Math.max(40 - (this.cfg.numPlayers-1)*5, 20);
		this.cfg.cellSize *= scaleFactorDPI;
		
		// not needed anymore due to DPI scale factor; if(this.cfg.splitBoard) { this.cfg.cellSize *= 2.0; }

		this.cfg.noiseZoom = this.cfg.noiseZoom*(this.cfg.cellSize/20.0);

		this.cfg.cityMinRadius = Math.min(this.cfg.numPlayers, 5);
		this.cfg.minDistanceToEdge = Math.min(this.cfg.numPlayers, 4);
		this.cfg.cityMaxConnectionLength = 14 + this.cfg.numPlayers*2;

		if(this.cfg.numCities < 10) {
			this.cfg.relocateProbability = 1.0;
		}

		if(this.cfg.numPlayers > 5) { 
			this.cfg.minPathsRequiredOfEachType = 3;
		}

		// without planes, we can only get a valid board if the land is less varied ( = more large chunks of land/water)
		// so zoom in
		let planesAndTrainsDisabled = (DIFFICULTY_LEVELS[this.cfg.difficulty] < 2);
		if(planesAndTrainsDisabled) {  this.cfg.noiseZoom *= 4.0; }
		else { this.cfg.noiseZoom *= 2.0; }

		// this.cfg.waterLine = 0.4; //=> really cool effect

		this.cfg.widthInCells = Math.floor(this.cfg.w/this.cfg.cellSize);
		this.cfg.heightInCells = Math.floor(this.cfg.h/this.cfg.cellSize);

		this.cfg.oX = (this.cfg.w - this.cfg.widthInCells*this.cfg.cellSize) * 0.5;
		this.cfg.oY = (this.cfg.h - this.cfg.heightInCells*this.cfg.cellSize) * 0.5;

		console.log(this.cfg);
	}

	generateBoard() 
	{
		this.generationFail = true

		while(this.generationFail) 
		{
			this.generationFail = false;

			this.createNoise();
			this.createTerrain();
			this.placeCities();

			if(this.generationFail) 
			{
				console.log("Generation fail (after city placement); retrying");
				continue;
			}

			this.createConnections();

			if(this.generationFail) 
			{
				console.log("Generation fail (after connection pathfinding); retrying");
				continue;
			}

			this.determineCityDesires();
			this.determineCapitalValues();
		}
	}

	createNoise() 
	{
		// Used this noise library: https://github.com/josephg/noisejs
		// All noise generators return values between -1 and 1
		noise.seed(Math.random());
	}

	createTerrain() 
	{
		const z = (this.cfg.cellSize / this.cfg.noiseZoom);

		this.terrain = [];
		this.dockLocations = [];
		this.landLocations = [];

		// determine noise value per terrain cell (and initialize some other settings)
		for(let x = 0; x < this.cfg.widthInCells; x++) 
		{
			this.terrain[x] = [];

			for(let y = 0; y < this.cfg.heightInCells; y++) 
			{
				const pos = new Point(x,y);

				// take average of corners in perlin noise
				let weight = 0.25

				let noiseVal = weight*noise.simplex2(x*z, y*z);
				noiseVal += weight*noise.simplex2((x+1)*z, y*z);
				noiseVal += weight*noise.simplex2((x+1)*z, (y+1)*z);
				noiseVal += weight*noise.simplex2(x*z, (y+1)*z);

				const terrainType = noiseVal > this.cfg.waterLine ? TerrainType.LAND : TerrainType.WATER;
				const isWater = terrainType == TerrainType.WATER;

				if(!isWater && !this.isInRulesMargin(pos) && this.distanceToBounds(pos) >= this.cfg.minDistanceToEdge) {
					this.landLocations.push(pos.clone());
				}

				const data : CellData = 
				{ 
					val: noiseVal,
					isWater: isWater, 
					terrainType: terrainType,

					isForest: false,
					forestFrame: -1,

					partOfPath: false,
					pathSprite: null,
					pathTypes: [],

					cityAllowed: true, 
					city: null,

					halfwayPointOfPath: false
				};

				this.terrain[x][y] = data;
			}
		}

		// second noise map: special terrain types, like forests
		noise.seed(Math.random());

		const forestLine = 0.5;
		for(let x = 1; x < this.cfg.widthInCells; x++) 
		{
			for(let y = 1; y < this.cfg.heightInCells; y++) 
			{
				const pos = new Point(x,y);

				// no forests can be build on water
				// (might add a different ground type that CAN be built there)
				if(this.getCell(pos).isWater) { continue; }
				const noiseVal = noise.simplex2(x*z, y*z);
				this.getCell(pos).isForest = (noiseVal > forestLine);
			}
		}

		// sweep over the whole map to find interesting locations (to, for example, place cities)
		this.waterEdges = [];
		for(let x = 0; x < this.cfg.widthInCells; x++) 
		{
			for(let y = 0; y < this.cfg.heightInCells; y++) 
			{
				const pos = new Point(x,y);

				if(!this.getCell(pos).isWater) { continue; }

				let neighbors = [[1,0], [0,1], [-1,0], [0,-1]];
				let corner = [x,y];
				let waterNeighbors = 0;
				for(let n = 0; n < 4; n++) {
					const newPos = new Point(x + neighbors[n][0], y + neighbors[n][1]);
					corner = [corner[0] + neighbors[n][0], corner[1] + neighbors[n][1]]

					if(!this.outOfBounds(newPos) && this.getCell(newPos).isWater) {
						waterNeighbors++;
					} else {
						let orthoVec = neighbors[(n+1)%4]

						this.waterEdges.push(new Line(
							new Point(corner[0], corner[1]),
							new Point(corner[0] + orthoVec[0], corner[1] + orthoVec[1])
						));
					}
				}

				// place city on water edges, but NOT if they are very close to the bounds of the map
				// (this looks ugly and probably cuts off the city name/details)
				if(waterNeighbors < 4 && this.distanceToBounds(pos) >= this.cfg.minDistanceToEdge && !this.isInRulesMargin(pos)) 
				{
					this.dockLocations.push(pos.clone())
				}
			}
		}

		shuffle(this.dockLocations);
		shuffle(this.landLocations);
	}

	isInRulesMargin(pos:Point) 
	{
		if(!this.cfg.rulesReminder) { return; }

		let width = 3 + this.cfg.numPlayers;
		let height = 5 + this.cfg.numPlayers;

		return (pos.x <= width && pos.y <= height);
	}

	placeCities() 
	{
		this.cities = [];

		const numCities = this.cfg.numCities;
		const cellSize = this.cfg.cellSize;

		for(let i = 0; i < numCities; i++) 
		{
			let pos
			let tooCloseToCity = false;
			let possibleSpacesLeft = (this.dockLocations.length > 0 || this.landLocations.length > 0)

			if(!possibleSpacesLeft) { this.generationFail = true; return; }

			do {

				const mustBeLand = Math.random() <= this.cfg.landCityProbability || this.dockLocations.length <= 0;
				const cannotBeLand = this.landLocations.length <= 0;

				if(mustBeLand && cannotBeLand) { break; }

				if(mustBeLand) {
					pos = this.landLocations.splice(0, 1)[0];
				} else {
					pos = this.dockLocations.splice(0, 1)[0];
				}

				tooCloseToCity = !this.getCell(pos).cityAllowed;

				possibleSpacesLeft = (this.dockLocations.length > 0 || this.landLocations.length > 0)
				if(!possibleSpacesLeft) { break; }

			} while(tooCloseToCity && possibleSpacesLeft);

			if(!possibleSpacesLeft) {
				this.generationFail = true;
				return;
			}

			// remember this city
			const newCity : CityData = 
			{ 
				pos: pos,
				capital: null,
				connections: [],
				connectionGroup: null, 
				wantedGoods: [],
				airport: false 
			}

			this.cities.push(newCity)
			this.getCell(pos).city = newCity

			this.disallowCitiesInRadius(pos);

			// make it a player capital, if still needed
			if(i < this.cfg.numPlayers) {
				newCity.capital = i;
			}
		}
	}

	disallowCitiesInRadius(pos:Point) 
	{
		// disallow other cities in a certain radius around it
		const r = this.cfg.cityMinRadius;
		for(let a = -r; a <= r; a++) 
		{
			for(let b = -r; b <= r; b++) 
			{
				const newPos = new Point(pos.x + a, pos.y + b);
				if(this.outOfBounds(newPos)) { continue; }
				this.getCell(newPos).cityAllowed = false;
			}
		}
	}

	// when relocating a city, we forget all other constraints _on initial placement_
	// afterwards, we do disallow stuff in a certain radius
	moveCity(ind : number, c : CityData) : boolean
	{
		let pos = c.pos.clone();

		if(this.dockLocations.length <= 0) {
			this.generationFail = true;
			return false;
		}

		// remove from old position
		this.getCell(pos).city = null

		// find a new one that is ... adequate
		let cityTooClose = false;
		do {
			let newPos = this.dockLocations.splice(0, 1)[0];
			pos = newPos;

			// Perform a rudimentary distance check to all previous cities
			// (to prevent city clashes which make the map ugly and unplayable)
			cityTooClose = false;
			for(let i = 0; i < this.cities.length; i++) 
			{
				if(i == ind) { continue;}
				const otherCity = this.cities[i];
				let dist = Math.abs(otherCity.pos.x - pos.x) + Math.abs(otherCity.pos.y - pos.y);

				if(dist <= this.cfg.cityMinRadius) {
					cityTooClose = true;
					break;
				}
			}

		} while( (this.getCell(pos).city != null || cityTooClose) && this.dockLocations.length > 0);

		if(this.dockLocations.length <= 0) { return false; }

		// move to new position (update data on both city and terrain)
		this.getCell(pos).city = c;
		c.pos = pos.clone();

		// disallow anything within our new radius
		this.disallowCitiesInRadius(pos);
		return true;
	}

	createConnections() 
	{
		const cityRange = this.cfg.cityMaxConnectionRadius;
		const connectionProbability = 0.95;
		
		this.connections = [];

		const maxPathLength = this.cfg.cityMaxConnectionLength;
		let planesAndTrainsDisabled = (DIFFICULTY_LEVELS[this.cfg.difficulty] < 2);

		let pathTypesCovered : Record<PathType, number> = { [PathType.BOAT]: 0, [PathType.ROAD]: 0, [PathType.RAIL]: 0 };
		if(planesAndTrainsDisabled) { delete pathTypesCovered.rail; }

		// as we place cities, we keep track of connection groups
		// why? so we can ENSURE all cities are reachable by placing at least one AIRPORT on each connection group
		let nextConnectionGroup = 0;

		for(let i = 0; i < this.cities.length; i++) 
		{
			let curCity = this.cities[i];
			let possibleConnections : ConnectionData[] = [];

			// capitals have a larger range and more connections!
			let tempPathLength = maxPathLength;
			let tempConnectionProbability = connectionProbability;
			if(curCity.capital != null) {
				tempPathLength += 15;
				tempConnectionProbability = 0.99;
			}

			// check all other cities 
			// (but no need to check those we already did)
			for(let j = (i+1); j < this.cities.length; j++) 
			{
				let otherCity = this.cities[j];

				// first check if there is a path over water
				let pathOverWaterExists = false;
				let pathWater = this.getPath(TerrainType.WATER, null, curCity, otherCity);

				if(pathWater != null && pathWater.length <= maxPathLength) 
				{
					pathOverWaterExists = true;
					possibleConnections.push({ city: otherCity, path: pathWater, pathType: PathType.BOAT });
				}

				if(pathOverWaterExists) { continue; }

				// then check if there is a path over land
				// (either regular road or railroad)
				let pathType = Math.random() < 0.5 ? PathType.ROAD : PathType.RAIL;
				if(planesAndTrainsDisabled) { pathType = PathType.ROAD; }

				let pathLand = this.getPath(TerrainType.LAND, pathType, curCity, otherCity);

				if(pathLand != null && pathLand.length <= maxPathLength) 
				{
					possibleConnections.push({ city: otherCity, path: pathLand, pathType: pathType });
				}
			}

			// if we have NO possible connections (at the moment or in the future)
			if(this.cfg.allowRelocating) 
			{
				if(possibleConnections.length <= 0 && curCity.connections.length <= 0 && Math.random() <= this.cfg.relocateProbability) 
				{
					// move this city somewhere else and try again
					const res = this.moveCity(i, curCity);
					if(!res) { break; }
					i--;
					continue;
				}
			}

			// capitals MUST have at least two connections
			if(curCity.capital != null && possibleConnections.length <= 1) 
			{
				this.generationFail = true;
				return;
			}

			// sort all connections based on distance (path length), ascending
			possibleConnections.sort((a, b) => (a.path.length > b.path.length) ? 1 : -1)

			// always place the first one, others have 50% probability
			for(let c = 0; c < possibleConnections.length; c++) 
			{
				if(c > 0 && Math.random() > tempConnectionProbability) 
				{
					break;
				}

				let conn = possibleConnections[c];
				let otherCity = conn.city

				// re-check the paths!
				// because we've placed a path, others might become MORE EFFICIENT! (by snapping to it)
				// last paramater = allow overlap
				if(c > 0) 
				{
					let newPath;
					if(conn.pathType == PathType.BOAT) {
						newPath = this.getPath(TerrainType.WATER, null, curCity, otherCity, true);
					} else {
						newPath = this.getPath(TerrainType.LAND, conn.pathType, curCity, otherCity, true);
					}

					if(newPath != null) {
						conn.path = newPath;
					}
				}
				
				curCity.connections.push(otherCity);
				otherCity.connections.push(curCity);
				
				const connectionData : ConnectionData = { path: conn.path, pathType: conn.pathType };
				this.connections.push(connectionData);

				if(otherCity.connectionGroup != null && curCity.connectionGroup == null) {
					curCity.connectionGroup = otherCity.connectionGroup;
				}

				// keep track which path types are in the game
				// so we can brute-force one in if it doesn't exist
				// (exception: plane connections are another thing entirely)
				pathTypesCovered[conn.pathType]++;

				// remember, for each square in the path, that it is now part of a path
				// (this is used to connect paths nicely during pathfind)
				this.addPathToBoard(conn);
				
			}

			// determine connection group of this city
			if(curCity.connectionGroup == null) {
				curCity.connectionGroup = ++nextConnectionGroup;
			}

			for(let c = 0; c < curCity.connections.length; c++) {
				let conn = curCity.connections[c];
				conn.connectionGroup = curCity.connectionGroup;
			}
		}

		// Each connection group gets at least ONE airport; otherwise, there's just a X% chance of getting one
		// @IMPROV: The connection group algorithm is faulty => multiple airports may be placed if cities are evaluated in a nasty order
		//         => instead, keep a list of all cities in current "set" => on each update to set, give all cities the lowest number out of all sets
		// let airportProbability = 0.1
		this.numCitiesInGroup = {};
		let airportsPlaced = 0;

		let citiesCopy = this.cities.slice();
		shuffle(citiesCopy);

		for(let i = 0; i < citiesCopy.length; i++) {
			let c = citiesCopy[i];
			let g = c.connectionGroup;

			if(this.numCitiesInGroup[g] == undefined) {
				airportsPlaced++;
				if(!planesAndTrainsDisabled) { c.airport = true; }
				this.numCitiesInGroup[g] = 0;
			}

			this.numCitiesInGroup[g]++;
		}

		// if we are playing "TRAINING WHEELS" or "GOOD LUCK"
		// planes and trains aren't in the game yet
		// so any map that requires them is a bust
		if(planesAndTrainsDisabled) {
			if(airportsPlaced > 1) {
				this.generationFail = true;
				return;
			}
		} else {
			// if we have no airports or only 1, make that 2 by default
			if(airportsPlaced <= 1) {

				// now add two new ones
				let prevIndex = null;
				let numAirportsToPlace = 2 - airportsPlaced;
				for(let i = 0; i < numAirportsToPlace; i++) {
					let randIndex
					do {
						randIndex = Math.floor(Math.random() * this.cities.length);
					} while(randIndex == prevIndex || this.cities[randIndex].airport)

					prevIndex = randIndex;

					this.cities[randIndex].airport = true;
				}
			}
		}

		// lastly, check if all (possible/wanted) path types exist on the map
		// if not, brute force one into the game
		// and if even that is not possible, generation fails and we must try again completely
		for(const pathType in pathTypesCovered) 
		{
			while(pathTypesCovered[pathType] < this.cfg.minPathsRequiredOfEachType) 
			{
				const terrainType = (pathType == PathType.BOAT) ? TerrainType.WATER : TerrainType.LAND;
				let breakLoop = false;
				for(let i = 0; i < this.cities.length; i++) 
				{
					const cityA = this.cities[i];
					for(let j = (i+1); j < this.cities.length; j++) 
					{
						if(i == j) { continue; }

						const cityB = this.cities[j];
						if(cityA.connections.includes(cityB)) { continue; }

						let path = this.getPath(terrainType, pathType as PathType, cityA, cityB, true);

						if(path != null) {
							this.addPathToBoard({ path: path, pathType: pathType as PathType })
							breakLoop = true;
							pathTypesCovered[pathType]++;
							break;
						}
					}

					if(breakLoop) { break; }
				}

				// if we didn't ever break the loop, we never found a suitable path
				// so, return out of the function and restart generation
				if(!breakLoop) {
					this.generationFail = true;
					return;
				}
			}
		}
	}

	addPathToBoard(conn : ConnectionData) 
	{
		const halfwayPoint = Math.floor(0.5*conn.path.length);

		for(let p = 0; p < conn.path.length; p++) 
		{
			let point = conn.path[p];
			let cell = this.getCell(point);

			if(p == halfwayPoint) { cell.halfwayPointOfPath = true; }
			cell.partOfPath = true;

			// @IMPROV: Maybe just use a SET instead of an array (gaurantees unique values anyway)
			if(!cell.pathTypes.includes(conn.pathType)) {
				cell.pathTypes.push(conn.pathType);
			}	
		}
	}

	getPath(terrainType : TerrainType, pathType : PathType, a : CityData, b : CityData, overrideOverlap : boolean = false) 
	{
		let routeConfig : RouteConfig
		let allowOverlap = false
		if(Math.random() <= 0.5 || overrideOverlap) { allowOverlap = true; }

		if(terrainType == TerrainType.WATER) {
			routeConfig = 
				{ 
					terrainType: TerrainType.WATER,
					pathType: PathType.BOAT, 
					minVal: -1, 
					maxVal: this.cfg.waterLine, 
					maxLength: this.cfg.cityMaxConnectionLength, 
					snapToPath: true,
					allowOverlap: allowOverlap,
				}
		} else if(terrainType == TerrainType.LAND) {
			routeConfig = 
				{ 
					terrainType: TerrainType.LAND,
					pathType: pathType, 
					minVal: this.cfg.waterLine, 
					maxVal: this.cfg.mountainLine, 
					maxLength: this.cfg.cityMaxConnectionLength, 
					snapToPath: true,
					allowOverlap: allowOverlap,
				}
		}

		return calculateRoute(routeConfig, this.terrain, a.pos.clone(), b.pos.clone());
	}

	getRandomGood(total) 
	{
		const rand = Math.random()
		let sum = 0
		for(const name in this.goodsDict) {
			sum += (this.goodsDict[name].prob / total)

			if(sum >= rand) {
				return name;
			}
		}
	}

	determineCityDesires() 
	{
		// first, truncate list to the goods we actually want
		// whilst calculating total probability
		// and adding each good to the list (twice if it's a default good and the number of cities supports this)
		const goodsList = [];
		const gameDifficulty = DIFFICULTY_LEVELS[this.cfg.difficulty];

		let totalGoodProbability = 0;
		this.goodsDict = {}; // deep copy GOODS list, but only keep the ones actually in the game
		
		for(const name in GOODS) 
		{
			const goodDifficulty = DIFFICULTY_LEVELS[GOODS[name].difficulty || "Training Wheels"];
			if(goodDifficulty > gameDifficulty) { continue; }

			totalGoodProbability += GOODS[name].prob;

			goodsList.push(name);
			if(goodDifficulty == 0 && this.cfg.numCities > 10) { goodsList.push(name); }

			this.goodsDict[name] = GOODS[name];
		}

		// vanilla may only appear ONCE on the board
		// it's already added above, so just delete it now
		if(this.goodsDict['Vanilla']) {
			totalGoodProbability -= this.goodsDict['Vanilla'].prob;
			delete this.goodsDict['Vanilla']
		}

		// now add goods randomly, following probability distribution, 
		// until we have enough (roughly 1.5 per city)
		const desiredTotalNumberGoods = Math.floor(this.cities.length * 1.5)
		while(goodsList.length < desiredTotalNumberGoods) {
			let randGood = this.getRandomGood(totalGoodProbability);

			goodsList.push(randGood)
		} 

		// shuffle the goods list
		shuffle(goodsList);

		// while we have goods, loop through the cities and give them to each city, including a point value
		let counter = 0;
		while(goodsList.length > 0) 
		{
			const good = goodsList[goodsList.length - 1]

			if(this.cityHasRoomForGood(counter, good)) 
			{
				const data = GOODS[good];
				const value = Math.floor(Math.random()*(data.pointMax + 1 - data.pointMin)) + data.pointMin;

				const goodData : GoodData = { name: good, value: value };
				this.cities[counter].wantedGoods.push(goodData);

				goodsList.pop();
			}
			
			counter = (counter + 1) % this.cities.length;
		}
	}

	determineCapitalValues() 
	{
		const weights = {
			connection: 2.0,
			connectionGroup: 1.0,
			good: 0.5,
			airport: 5
		}

		let highestValue = -1;
		for(let i = 0; i < this.cfg.numPlayers; i++) {
			let c = this.cities[i];
			let sum = 0;

			// an airport is worth a LOT
			// (because you can immediately go to other players)
			if(c.airport) {
				sum += weights.airport;
			}

			// count the (weighted) point value of goods it accepts
			for(let a = 0; a < c.wantedGoods.length; a++) {
				sum += weights.good * c.wantedGoods[a].value;
			}

			// count number of connections
			let numCons = c.connections.length;

			// if a connection is a capital, it's less valuable ( = more competition close by)
			for(let a = 0; a < numCons; a++) {
				let val = 1.0;
				if(c.connections[a].capital) {
					val = 0.5;
				}

				sum += weights.connection * val;
			}

			// count total number of cities within same connection group
			if(c.connectionGroup != null)
			{
				sum += weights.connectionGroup * this.numCitiesInGroup[c.connectionGroup];
			}

			// no connections at all? BAD CAPITAL! ALWAYS!
			if(numCons == 0) { sum = 0; }

			// finally, save value on city object and track highest value
			c.value = sum;
			highestValue = Math.max(highestValue, sum);
		}

		// calculate point value based on difference with highest value
		// (cap it at 4 => should never really go above that, but just to be sure)
		const differencePerPoint = 3;
		for(let i = 0; i < this.cfg.numPlayers; i++) {
			this.cities[i].addedBonus = Math.min( Math.floor((highestValue - this.cities[i].value) / differencePerPoint), 4);
		}
	}

	cityHasRoomForGood(i, name) {
		const city = this.cities[i];

		if(city.wantedGoods.length >= 3) {
			return false;
		}

		for(let i = 0; i < city.wantedGoods.length; i++) {
			if(city.wantedGoods[i].name == name) {
				return false;
			}
		}

		return true;
	}

	visualizeGame(vis:BoardVisualizer) 
	{
		// @ts-ignore
		const group = new ResourceGroup();

		const oX = this.cfg.oX;
		const oY = this.cfg.oY;

		// terrain (grid) blocks
		const cs = this.cfg.cellSize;
		const deepWaterLine = this.cfg.deepWaterLine;
		const waterLine = this.cfg.waterLine;
		const mountainLine = this.cfg.mountainLine;

		for(let x = 0; x < this.cfg.widthInCells; x++) 
		{
			for(let y = 0; y < this.cfg.heightInCells; y++) 
			{
				const pos = new Point(x,y);
				const rect = new Rectangle().fromTopLeft(new Point(oX + x*cs, oY + y*cs), new Point(cs));
				const noiseVal = this.getCell(pos).val;
				const cell = this.getCell(pos);

				let terrainColor = null;
				if(noiseVal <= deepWaterLine) {
					terrainColor = "#030027";
				} else if(noiseVal <= waterLine) {
					terrainColor = "#086375";
				} /*else if(noiseVal <= 0.2) {
					terrainColor = "#143109";
				} else if(noiseVal <= 0.4) {
					terrainColor = "#004F2D";
				} */ else if(noiseVal <= 0.5) {
					terrainColor = "#8FC93A";
				} else if(noiseVal <= mountainLine) {
					terrainColor = "#C6DEA6"
				} else {
					terrainColor = "#7A6263";
				}

				if(cell.isForest) 
				{
					const frame = this.checkNeighbourForestFrame(pos);
					const imageKey = this.cfg.inkFriendly ? "forest_printfriendly" : "forest";
					const randSizeChange = Math.random()*8 - 4;
					const randOffsetChangeX = Math.random()*0.2-0.1, randOffsetChangeY = Math.random()*0.2-0.1;
					const forestWidth = cs + randSizeChange;

					const res = vis.getResource(imageKey);
					const rectPos = rect.getTopLeft();
					const op = new LayoutOperation({
						pos: new Point(rectPos.x + 0.5*cs, rectPos.y + 0.5*cs),
						size: new Point(forestWidth, forestWidth*2.0),
						pivot: new Point(0.5 + randOffsetChangeX, 1.0 + randOffsetChangeY),
						flipX: Math.random() <= 0.5,
						frame: frame,
						depth: y
					});
					group.add(res, op);
				}
				
				// if printfriendly, don't draw any colors and use outlines/stripes for sea and stuff
				// otherwise, just draw the terrain in detail
				if(this.cfg.inkFriendly) 
				{
					if(noiseVal <= waterLine) 
					{
						const res = vis.getResource("seaprintfriendly");
						const op = new LayoutOperation({
							pos: rect.getTopLeft(),
							size: new Point(cs),
							alpha: 0.5,
							depth: y - 0.51,
						})
						group.add(res, op);
					}
				} else {
					const opRect = new LayoutOperation({ fill: terrainColor });
					group.add(new ResourceShape(rect), opRect);
				}
				
				// we also perform a sweep over all the paths to remove ugly connections
				// we check a box around ourselves, rotated if necessary
				this.checkUglyBox(pos);
			}
		}

		// also perform a REVERSE sweep to remove ugly boxes
		// (which will catch many cases that the other sweep never caught)
		for(let x = this.cfg.widthInCells-1; x >= 0; x--) 
		{
			for(let y = this.cfg.heightInCells-1; y >= 0; y--) 
			{
				this.checkUglyBox(new Point(x,y));
			}
		}

		// render all water edges (for clearer separation between land and water)
		const waterEdgeLineWidth = 1.5
		const opWaterEdge = new LayoutOperation({ stroke: "#000000", strokeWidth: waterEdgeLineWidth });
		for(const e of this.waterEdges) 
		{
			const start = new Point(oX + e.start.x*cs, oY + e.start.y*cs);
			const end = new Point(oX + e.end.x*cs, oY + e.end.y*cs)
			const line = new Line(start, end);
			group.add(new ResourceShape(line), opWaterEdge);
		}

		// connections (between cities)
		for(let x = 0; x < this.cfg.widthInCells; x++) 
		{
			for(let y = 0; y < this.cfg.heightInCells; y++) 
			{
				const pos = new Point(x,y);

				let curCell = this.getCell(pos);
				if(!curCell.partOfPath) { continue; }

				for(let t = 0; t < curCell.pathTypes.length; t++) 
				{
					// count connections to determine which sprite to display
					// (and how to rotate it)
					let pathType = curCell.pathTypes[t]
					let connectionInfo = this.countConnections(pos, pathType);

					let spriteFrame = (connectionInfo.count - 1)
					if(connectionInfo.count == 2 && connectionInfo.hasBend) { spriteFrame = 0; }

					const spriteRotation = connectionInfo.rot

					let sheetKey
					if(pathType == PathType.BOAT) {
						sheetKey = 'searoutes'
						if(this.cfg.inkFriendly) {
							sheetKey = 'searoutes_printfriendly'
						}
					} else if(pathType == PathType.ROAD) {
						sheetKey = 'landroutes'
					} else if(pathType == PathType.RAIL) {
						sheetKey = 'railroutes'
					}

					const resRoad = vis.getResource(sheetKey);
					const opRoad = new LayoutOperation({
						pos: new Point(oX + (x+0.5)*cs, oY + (y+0.5)*cs),
						size: new Point(cs),
						frame: spriteFrame,
						pivot: Point.CENTER,
						rot: spriteRotation * 0.5 * Math.PI,
						depth: y
					});
					group.add(resRoad, opRoad);

					if(curCell.halfwayPointOfPath) 
					{
						// Check if there is already such a cell above/left/diagonal from us
						// If so, don't display this one, as it's (most likely) redundant and ugly

						let shouldPlaceSprite = true;
						for(let xx = 0; xx < 3; xx++) 
						{
							for(let yy = 0; yy < 3; yy++) 
							{
								const pos = new Point(x - 1 + xx, y - 1 + yy);
								if(xx == 1 && yy == 1) { continue; }
								if(this.outOfBounds(pos)) { continue; }

								let cell = this.getCell(pos);
								if(cell.halfwayPointOfPath || cell.city != null) 
								{ 
									shouldPlaceSprite = false; 
									curCell.halfwayPointOfPath = false;
									break;
								}
							}
						}

						if(shouldPlaceSprite) 
						{
							const res = vis.getResource("inbetween_space");
							const op = new LayoutOperation({
								pos: opRoad.pos.clone(),
								size: new Point(this.cfg.cellSize*0.75),
								pivot: Point.CENTER,
								depth: y + 0.5
							});
							group.add(res, op);
						}
					}

					// curCell.pathSprite = rect;
				}
			}
		}

		// cities
		const radius = this.cfg.cellSize*0.5*1.5;
		const textCfg:Record<string,any> = 
		{
			fontFamily: 'rowdies', 
			fontSize: Math.max(radius, 20),
			color: '#111111', 
			stroke: '#FFFFFF',
			strokeThickness: 3,
		}

		const textConfig = new TextConfig({
			font: textCfg.fontFamily,
			size: textCfg.fontSize
		}).alignCenter();

		const goodNumberCfg = 
		{
			fontFamily: "rowdies",
			fontSize: Math.max(radius, 16),
			color: '#111111',
			stroke: "#FFFFFF",
			strokeThickness: 3
		}

		const textConfigGoodNumber = new TextConfig({
			font: goodNumberCfg.fontFamily,
			size: goodNumberCfg.fontSize
		}).alignCenter();

		const bonusTxtCfg = 
		{
			fontFamily: "rowdies",
			fontSize: textCfg.fontSize,
			color: "#66FF66",
			stroke: "#003300",
			strokeThickness: 3
		}

		const textConfigBonus = new TextConfig({
			font: bonusTxtCfg.fontFamily,
			size: bonusTxtCfg.fontSize
		}).alignCenter();

		for(let i = 0; i < this.cities.length; i++) 
		{
			const c = this.cities[i];
			let xPos = oX + (c.pos.x + 0.5)*cs, yPos = oY + (c.pos.y + 0.5)*cs

			const opText = new LayoutOperation({
				fill: textCfg.color,
				stroke: textCfg.stroke,
				strokeWidth: textCfg.strokeThickness,
				strokeAlign: StrokeAlign.OUTSIDE,
				size: new Point(10,2).scale(textConfig.size),
				pivot: Point.CENTER
			});

			const opSprite = new LayoutOperation({
				pos: new Point(xPos, yPos), 
				size: new Point(radius*4),
				pivot: Point.CENTER,
				depth: yPos + 1.1
		    });
			
			let res;
			if(c.capital == null) {
				res = vis.getResource("city");
				opText.setFill("#111111");
			} else {
				res = vis.getResource("cities");
				const newColor = PLAYER_COLORS[c.capital];
				opText.setFill(newColor);
				opSprite.frame = c.capital;

				// some players colors are so bright that I need to manually set a black outline
				if(newColor == '#FFFF00' || newColor == '#FFA500') {
					opText.setStroke('#111111');
				}
			}
			group.add(res, opSprite);

			// display name of city BELOW it
			const yOffset = -6
			const opTextCity = opText.clone();
			opTextCity.pos = new Point(xPos, yPos + 2*radius + yOffset);
			opTextCity.depth = 10000;

			const resTextCity = new ResourceText({ text: CITY_NAMES[i], textConfig: textConfig });
			group.add(resTextCity, opTextCity); // txt

			// display wanted goods
			let wg = c.wantedGoods;
			const iconSize = 2*radius;

			for(let g = 0; g < wg.length; g++) 
			{
				const good = wg[g];
				const spritesheetFrame = GOODS[good.name].frame
				const value = good.value;

				const pos = new Point(xPos + (-wg.length*0.5 + g + 0.5)*iconSize, yPos - 2*radius);
				const resGood = vis.getResource("goods");
				const opGood = new LayoutOperation({
					pos: pos,
					size: new Point(2*radius),
					frame: spritesheetFrame,
					depth: 10000 + 1,
					pivot: Point.CENTER	
				})
				group.add(resGood, opGood);

				const opText = new LayoutOperation({
					pos: pos.clone().add(new Point(0, 0.33*iconSize)),
					fill: goodNumberCfg.color,
					stroke: goodNumberCfg.stroke,
					strokeWidth: goodNumberCfg.strokeThickness,
					strokeAlign: StrokeAlign.OUTSIDE,
					size: new Point(5*radius),
					depth: 10000 + 1,
					pivot: Point.CENTER
				})

				const resText = new ResourceText({ text: value.toString(), textConfig: textConfigGoodNumber });
				group.add(resText, opText);
			}

			// Airport is indicated by underline (with arrow pattern) to city name!
			if(c.airport) 
			{
				const pos1 = new Point(opTextCity.pos.x - 0.5*textConfig.size, opTextCity.pos.y + 0.5*textConfig.size);
				const pos2 = new Point(opTextCity.pos.x + 0.5*textConfig.size, opTextCity.pos.y + 0.5*textConfig.size);
				const thickness = Math.max(radius*0.5, 8)
				const yOffset = -5;

				const rectPos = new Point(pos1.x, pos1.y + yOffset);
				const rectSize = new Point((pos2.x-pos1.x), thickness);

				let posStart = rectPos.clone();
				const numRepeats = 4;
				const sizeFinal = rectSize.clone();
				const sizePerRepeat = new Point(sizeFinal.x / numRepeats);
				rectSize.y = sizePerRepeat.x;
				const rect = new Rectangle().fromTopLeft(rectPos, rectSize);

				// @ts-ignore
				const graphicsAirport = this.add.graphics();
				graphicsAirport.depth = 10000 + 1;
				const opRect = new LayoutOperation({ fill: "#FF6666" });
				group.add(new ResourceShape(rect), opRect);

				// this repeats a tiny texture several times (horizontally) to mimic what used to be a Phaser native tileSprite
				// @TODO: this is probably not centered/positioned correctly anymore
				const resAirplaneTexture = vis.getResource("airplane_tile_sprite");
				for(let i = 0; i < numRepeats; i++)
				{
					const opAirplaneTexture = new LayoutOperation({
						pos: posStart.clone(),
						size: sizePerRepeat,
						depth: graphicsAirport.depth + 1
					});
					posStart.x += sizePerRepeat.x;
					group.add(resAirplaneTexture, opAirplaneTexture);
				}
			}

			// If city bonuses are enabled, display it on the city (only if non-zero)
			if(this.cfg.cityBonus) 
			{
				const b = c.addedBonus;
				if(b > 0) 
				{
					const resText = new ResourceText({ text: '+' + b, textConfig: textConfigBonus });
					const opText = new LayoutOperation({
						pos: new Point(xPos, yPos),
						size: new Point(2*textConfigBonus.size),
						pivot: Point.CENTER,
						depth: 10000,
						fill: bonusTxtCfg.color,
						stroke: bonusTxtCfg.stroke,
						strokeWidth: bonusTxtCfg.strokeThickness
					})
					group.add(resText, opText);
				}
			}
		}

		// some overlay text about the map settings
		//  -> Random Jungle Name
		//  -> # Players
		//  -> Chosen Difficulty
		let fontSize = 0.5 * this.cfg.cellSize;
		let margin = 0.5 * fontSize;
		const color = "#FFFFFF"

		const textConfigDetails = new TextConfig({
			font: "rowdies",
			size: fontSize,
		})

		const jungleNameString = '"' + this.cfg.jungleName + '"';
		const anchorPos = new Point(oX + margin, oY + margin);
		const opTextDetails1 = new LayoutOperation({
			pos: anchorPos,
			size: new Point(15*textConfigDetails.size, 2*textConfigDetails.size),
			fill: color,
			depth: 20000
		});
		const resText = new ResourceText({ text: jungleNameString, textConfig: textConfigDetails });
		group.add(resText, opTextDetails1); // txt1

		let playerTextString = this.cfg.numPlayers + ' Player'
		if(this.cfg.numPlayers > 1) { playerTextString += 's'; }

		const opTextDetails2 = opTextDetails1.clone();
		opTextDetails2.pos = anchorPos.clone().add(new Point(0, fontSize));
		const resText2 = new ResourceText({ text: playerTextString, textConfig: textConfigDetails });
		group.add(resText2, opTextDetails2); // txt2

		const opTextDetails3 = opTextDetails1.clone();
		opTextDetails3.pos = anchorPos.clone().add(new Point(0, 2*fontSize));
		const diffString = this.cfg.difficulty.toString();
		const resText3 = new ResourceText({ text: diffString, textConfig: textConfigDetails });
		group.add(resText3, opTextDetails3); // txt3

		// a rectangle behind the text, to make it legible (and look a bit like a map legend)
		// @TODO: this used to be exact calculations using Phaser's functions to get text size; now it's just a rough estimation
		const maxWidth = 10*textConfigDetails.size;
		const maxHeight = 5*textConfigDetails.size;

		const rectPos = new Point(margin);
		const rectSize = new Point(maxWidth + margin, maxHeight + margin);
		const rect = new Rectangle().fromTopLeft(rectPos, rectSize);

		const op = new LayoutOperation({ fill: "#000000", depth: 20000-1, alpha: 0.75 });
		group.add(new ResourceShape(rect), op);
	
		// display a RULE REMINDER underneath it
		if(this.cfg.rulesReminder) 
		{
			const res = vis.getResource("rules_overview");
			const ratio = 675.0 / 833;
			const sizeX = maxWidth + margin;
			const op = new LayoutOperation({
				pos: new Point(rectPos.x, rectPos.y + maxHeight + margin),
				size: new Point(sizeX, sizeX / ratio),
				depth: 20000 - 1,
			});
			group.add(res, op);
		}

		return [group];
	}

	getRandomJungleName() 
	{
		const randTemplate = JUNGLE_NAME_TEMPLATES[Math.floor(Math.random() * JUNGLE_NAME_TEMPLATES.length)];
		const randWord = COOL_WORD_TEMPLATES[Math.floor(Math.random() * COOL_WORD_TEMPLATES.length)];
		return randTemplate.replace("X", randWord);
	}

	checkUglyBox(pos:Point) 
	{
		// if we're not even part of a path, ignore this
		if(!this.getCell(pos).partOfPath) { return; }

		// if the box would go out of bounds, ignore this
		const otherCorner = new Point(pos.x + 1, pos.y + 1);
		if(this.outOfBounds(otherCorner)) { return; }

		// first check if we have a box
		let curCell = this.getCell(pos)

		for(let i = (curCell.pathTypes.length-1); i >= 0; i--) 
		{
			let pathType = curCell.pathTypes[i]

			let numNeighbors = 0;
			for(let ooX = 0; ooX < 2; ooX++) 
			{
				for(let ooY = 0; ooY < 2; ooY++) 
				{
					const tempPos = new Point(pos.x + ooX, pos.y + ooY);
					let tempCell = this.getCell(tempPos);
					if(this.validNeighbour(curCell, tempCell, pathType)) 
					{
						numNeighbors++;
					}
				}
			}

			if(numNeighbors < 4) { continue; }

			// now check if we can remove a square
			let externalConns = [[-1,0], [0,-1], [1,0], [0,1]];
			let cell = pos.clone();

			// for each rot (top left, top right, bottom right, bottom left)
			// NOTE: it DOES work, but it doesn't catch all possible cases (because it only looks at isolated 2x2 squares, once)
			for(let rot = 0; rot < 4; rot++) 
			{
				let numExternalConns = 0;

				// check if we have a vital external connection
				let curRotatedCell = this.getCell(cell);
				for(let ec = rot; ec < rot+2; ec++) 
				{
					const tempPos = new Point(cell.x + externalConns[ec % 4][0], cell.y + externalConns[ec % 4][1]);

					if(this.outOfBounds(tempPos)) { continue; }

					let tempCell = this.getCell(tempPos);
					if(this.validNeighbour(curRotatedCell, tempCell, pathType)) {
						numExternalConns++;
					}
				}

				// if no external connections, the we can just remove this path!
				// also STOP the loop, because now the ugly box is already gone!
				if(numExternalConns == 0) 
				{
					curRotatedCell.pathTypes.filter(function(e) { return e !== pathType })

					if(curRotatedCell.pathTypes.length <= 0) 
					{
						curRotatedCell.partOfPath = false;
					}
					break;
				}

				// keep track of the current cell (of our 2x2 square) that we are considering
				let orthoVec = externalConns[(rot + 2) % 4]
				cell = new Point(cell.x + orthoVec[0], cell.y + orthoVec[1]);
			}
		}
	}

	countConnections(pos:Point, pathType:PathType = null) : ConnectionQueryData
	{
		const nbs = [new Point(1,0), new Point(0,1), new Point(-1,0), new Point(0,-1)];
		let sum = 0;
		let curCell = this.getCell(pos);

		let rot = -1;
		let lastRotation = -1;
		let hasBend = false;
		for(let a = 0; a < 4; a++) 
		{
			const nbPos = new Point(pos.x + nbs[a].x, pos.y + nbs[a].y);
			if(this.outOfBounds(nbPos)) { continue; }

			let nbCell = this.getCell(nbPos);
			if(!this.validNeighbour(curCell, nbCell, pathType)) { continue; }

			sum++;
			if(rot == -1 || (rot == 0 && a == 3)) {
				rot = a;
			}

			if(lastRotation != -1 && (a - lastRotation) % 2 == 1) {
				hasBend = true;
			}

			lastRotation = a;
		}

		// now keep looping until we find all neighbours in a row => the first one should be our rot
		// @IMPROV: Can we generalize this for all numbers?
		if(sum == 3) 
		{
			let neighboursInARow = 0;
			let sequenceStarter = -1;
			let iterator = 0;
			while(true) 
			{
				const nbPos = new Point(pos.x + nbs[iterator].x, pos.y + nbs[iterator].y);

				let addNeighbour = false;
				if(!this.outOfBounds(nbPos)) 
				{
					let nbCell = this.getCell(nbPos);
					if(this.validNeighbour(curCell, nbCell, pathType)) 
					{
						addNeighbour = true;
					}
				}

				if(addNeighbour) {
					if(neighboursInARow == 0) {
						sequenceStarter = iterator;
					}
					neighboursInARow++;
				} else {
					neighboursInARow = 0;
				}

				if(neighboursInARow >= sum) { break; }
				iterator = (iterator + 1) % 4;
			}

			rot = sequenceStarter;
		}

		return { count: sum, rot: rot, hasBend: hasBend }
	}

	validNeighbour(a : CellData, b : CellData, pathType = null) 
	{
		let matchingPathType = false;

		if(pathType == null) {
			for(let i = 0; i < a.pathTypes.length; i++) {
				if(b.pathTypes.includes(a.pathTypes[i])) {
					matchingPathType = true;
					break;
				}
			}
		} else {
			matchingPathType = b.pathTypes.includes(pathType);
		}

		return b.partOfPath && (matchingPathType || b.city != null);
	}

	checkNeighbourForestFrame(pos:Point) 
	{
		// if any neighbour is a forest (which already has a frame), copy that
		let dirs = shuffle( [new Point(-1,0), new Point(0,-1), new Point(0,1), new Point(1,0)] );
		for(const dir of dirs) 
		{
			const nbPos = new Point(pos.x + dir.x, pos.y + dir.y);
			if(this.outOfBounds(nbPos)) { continue; }

			const cell = this.getCell(nbPos);
			if(cell.isForest && cell.forestFrame != -1) 
			{
				return cell.forestFrame
			}
		}

		// otherwise, return a random frame
		const myCell = this.getCell(pos);
		myCell.forestFrame = Math.floor(Math.random()*4)
		return myCell.forestFrame;
	}

	distanceToBounds(pos:Point) 
	{
		const left = pos.x
		const right = this.cfg.widthInCells - 1 - pos.x
		const top = pos.y
		const bottom = this.cfg.heightInCells - 1 - pos.y
		return Math.min(Math.min(left, right), Math.min(top, bottom));
	}

	outOfBounds(pos:Point) 
	{
		return (pos.x < 0 || pos.x >= this.cfg.widthInCells || pos.y < 0 || pos.y >= this.cfg.heightInCells);
	}

	getCell(pos:Point)
	{
		return this.terrain[pos.x][pos.y];
	}
}