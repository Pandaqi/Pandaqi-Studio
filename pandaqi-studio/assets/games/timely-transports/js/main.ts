// @ts-nocheck
import { CITY_NAMES, PLAYERCOUNT_TO_CITYCOUNT, PLAYER_COLORS, GOODS, DIFFICULTY_LEVELS } from "./gameDictionary"
import calculateRoute from "./pathfinder"
import { noise } from "./perlin"
import PandaqiPhaser from "js/pq_games/website/phaser"
import { Scene, Geom } from "js/pq_games/phaser.esm"

const sceneKey = "boardGeneration"
class BoardGeneration extends Scene
{
	canvas: HTMLCanvasElement
	cfg: Record<string,any>
	generationFail: boolean
	terrain: any[]
	dockLocations: any[]
	landLocations: any[]
	waterEdges: any[]
	cities: any[]
	connections: any[]
	numCitiesInGroup: any
	GOODS: any
	constructor()
	{
		super({ key: sceneKey });
	}

	preload() 
	{
		this.load.crossOrigin = 'Anonymous';
		this.canvas = this.sys.game.canvas;

		let base = 'assets/';

		this.load.image('city', base + 'city.png');
		this.load.spritesheet('cities', base + 'cities.webp', { frameWidth: 100, frameHeight: 100 })

		this.load.image('airport', base + 'airport.png');
		this.load.image('airplane_tile_sprite', base + 'airplane_tile_sprite.png?cc=1');
		this.load.image('seaprintfriendly', base + 'seaprintfriendly.png?cc=1');

		this.load.spritesheet('forest', base + 'forest.webp', { frameWidth: 100, frameHeight: 200 });
		this.load.spritesheet('forest_printfriendly', base + 'forest_printfriendly.webp', { frameWidth: 100, frameHeight: 200 });

		this.load.spritesheet('goods', base + 'goods.webp', { frameWidth: 100, frameHeight: 100 });

		this.load.spritesheet('searoutes', base + 'searoutes.png?cc=1', { frameWidth: 50, frameHeight: 50 });
		this.load.spritesheet('searoutes_printfriendly', base + 'searoutes_printfriendly.png?cc=1', { frameWidth: 50, frameHeight: 50 });
		this.load.spritesheet('landroutes', base + 'landroutes.png?cc=1', { frameWidth: 50, frameHeight: 50 });
		this.load.spritesheet('railroutes', base + 'railroutes.png?cc=1', { frameWidth: 50, frameHeight: 50 });

		this.load.image('inbetween_space', base + 'inbetween_space.png');
		this.load.image('rules_overview', base + 'rules_overview.webp');
	}

	// user-input settings should be passed through config
	create(config) 
	{
		const jungleName = this.getRandomJungleName();

		const canvasWidth = this.canvas.width;
		const scaleFactorDPI = (canvasWidth/1160.0);
		config.numPlayers = parseInt(config.playerCount);

		this.cfg = 
		{
			"seed": jungleName,
			"jungleName": jungleName,

			'w': this.canvas.width,
			'h': this.canvas.height,

			'numCities': PLAYERCOUNT_TO_CITYCOUNT[config.numPlayers] || 10,
			'cellSize': 20,
			'noiseZoom': 99.9578372,

			'deepWaterLine': -0.7,
			'waterLine': -0.1,
			'cityLine': 0.2,
			'mountainLine': 0.9,

			'cityMinRadius': 4, // overridden later anyways, based on player count
			'cityMaxConnectionLength': 30,
			'minDistanceToEdge': 4, // overriden later anyways, based on player count

			'allowRelocating': true,
			'relocateProbability': 0.9,

			'landCityProbability': 0.35,

			'numPlayers': config.numPlayers,
			'difficulty': config.difficulty || "Training Wheels",
			'printFriendly': config.inkFriendly || false,
			'splitBoard': config.splitBoard || false,
			'cityBonus': config.cityBonus || false,
			'rulesReminder': config.rulesReminder || false,

			'minPathsRequiredOfEachType': 2
		}

		this.cfg.bgColor = this.cfg.printFriendly ? "#FFFFFF" : "#333333";

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

		// create the board
		this.generateBoard();

		// convert board into image
		PandaqiPhaser.convertCanvasToImage(this);
	}

	generateBoard() {
		this.generationFail = true

		while(this.generationFail) {
			this.generationFail = false;

			this.createNoise();
			this.createTerrain();

			this.placeCities();

			if(this.generationFail) {
				console.log("Generation fail; retrying");
				continue;
			}

			this.createConnections();

			if(this.generationFail) {
				console.log("Generation fail; retrying");
				continue;
			}

			this.determineCityDesires();
			this.determineCapitalValues();

			
		}

		this.visualizeGame();
	}

	createNoise() {
		// Used this noise library: https://github.com/josephg/noisejs
		// All noise generators return values between -1 and 1
		noise.seed(Math.random());
	}

	createTerrain() {
		const z = (this.cfg.cellSize / this.cfg.noiseZoom);

		this.terrain = [];
		this.dockLocations = [];
		this.landLocations = [];

		// determine noise value per terrain cell (and initialize some other settings)
		for(let x = 0; x < this.cfg.widthInCells; x++) {
			this.terrain[x] = [];

			for(let y = 0; y < this.cfg.heightInCells; y++) {
				// take average of corners in perlin noise
				let weight = 0.25

				let noiseVal = weight*noise.simplex2(x*z, y*z);
				noiseVal += weight*noise.simplex2((x+1)*z, y*z);
				noiseVal += weight*noise.simplex2((x+1)*z, (y+1)*z);
				noiseVal += weight*noise.simplex2(x*z, (y+1)*z);

				let terrainType = 'water'
				if(noiseVal > this.cfg.waterLine) {
					terrainType = 'land'
				}

				let isWater = (noiseVal <= this.cfg.waterLine)

				if(!isWater && !this.isInRulesMargin(x,y) && this.distanceToBounds(x, y) >= this.cfg.minDistanceToEdge) {
					this.landLocations.push([x,y]);
				}

				this.terrain[x][y] = 
				{ 
					'val': noiseVal,
					'isWater': isWater, 
					'terrainType': terrainType,

					'isForest': false,
					'forestFrame': -1,

					'partOfPath': false,
					'pathSprite': null,
					'pathTypes': [],

					'cityAllowed': true, 
					'city': null,

					'halfwayPointOfPath': false
				};
			}
		}

		// second noise map: special terrain types, like forests
		noise.seed(Math.random());

		const forestLine = 0.5;
		for(let x = 1; x < this.cfg.widthInCells; x++) {
			for(let y = 1; y < this.cfg.heightInCells; y++) {

				// no forests can be build on water
				// (might add a different ground type that CAN be built there)
				if(this.terrain[x][y].isWater) {
					continue;
				}

				let noiseVal = noise.simplex2(x*z, y*z);

				this.terrain[x][y].isForest = (noiseVal > forestLine);
			}
		}

		// sweep over the whole map to find interesting locations (to, for example, place cities)
		this.waterEdges = [];
		for(let x = 0; x < this.cfg.widthInCells; x++) {
			for(let y = 0; y < this.cfg.heightInCells; y++) {
				
				if(!this.terrain[x][y].isWater) {
					continue;
				}

				let neighbors = [[1,0], [0,1], [-1,0], [0,-1]];
				let corner = [x,y];
				let waterNeighbors = 0;
				for(let n = 0; n < 4; n++) {
					let newX = x + neighbors[n][0], newY = y + neighbors[n][1];
					corner = [corner[0] + neighbors[n][0], corner[1] + neighbors[n][1]]

					if(!this.outOfBounds(newX, newY) && this.terrain[newX][newY].isWater) {
						waterNeighbors++;
					} else {
						let orthoVec = neighbors[(n+1)%4]

						this.waterEdges.push([corner[0], corner[1], corner[0] + orthoVec[0], corner[1] + orthoVec[1]]);
					}
				}

				// place city on water edges, but NOT if they are very close to the bounds of the map
				// (this looks ugly and probably cuts off the city name/details)
				if(waterNeighbors < 4 && this.distanceToBounds(x, y) >= this.cfg.minDistanceToEdge && !this.isInRulesMargin(x,y)) {
					this.dockLocations.push([x,y])
				}
			}
		}

		this.shuffle(this.dockLocations);
		this.shuffle(this.landLocations);
	}

	isInRulesMargin(x,y) {
		if(!this.cfg.rulesReminder) { return; }

		let width = 3 + this.cfg.numPlayers;
		let height = 5 + this.cfg.numPlayers;

		return (x <= width && y <= height);
	}

	placeCities() {
		const numCities = this.cfg.numCities;

		const w = this.cfg.w;
		const h = this.cfg.h;
		const cellSize = this.cfg.cellSize;

		const oX = this.cfg.oX;
		const oY = this.cfg.oY;

		this.cities = [];

		const z = (cellSize / this.cfg.noiseZoom);
		const cityLine = this.cfg.cityLine;
		const mountainLine = this.cfg.mountainLine;
		for(let i = 0; i < numCities; i++) {
			let pos, x, y
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

				x = pos[0]
				y = pos[1]

				tooCloseToCity = !this.terrain[x][y].cityAllowed;

				possibleSpacesLeft = (this.dockLocations.length > 0 || this.landLocations.length > 0)
				if(!possibleSpacesLeft) { break; }

			} while(tooCloseToCity && possibleSpacesLeft);

			if(!possibleSpacesLeft) {
				this.generationFail = true;
				return;
			}

			// remember this city
			let newCity = 
			{ 
				'x': x, 
				'y': y, 
				'capital': null,
				'connections': [],
				'connectionGroup': null, 
				'wantedGoods': [],
				'airport': false 
			}

			this.cities.push(newCity)
			this.terrain[x][y].city = newCity

			this.disallowCitiesInRadius(x, y);

			// make it a player capital, if still needed
			if(i < this.cfg.numPlayers) {
				newCity.capital = i;
			}
		}
	}

	disallowCitiesInRadius(x,y) {
		// disallow other cities in a certain radius around it
		const r = this.cfg.cityMinRadius;
		for(let a = -r; a <= r; a++) {
			for(let b = -r; b <= r; b++) {
				let newX = x + a, newY = y + b

				if(this.outOfBounds(newX, newY)) {
					continue;
				}

				this.terrain[newX][newY].cityAllowed = false;
			}
		}
	}

	// when relocating a city, we forget all other constraints _on initial placement_
	// afterwards, we do disallow stuff in a certain radius
	moveCity(ind, c) {
		let x = c.x, y = c.y

		if(this.dockLocations.length <= 0) {
			this.generationFail = true;
			return;
		}

		// remove from old position
		this.terrain[x][y].city = null

		// find a new one that is ... adequate
		let cityTooClose = false;
		do {
			let pos = this.dockLocations.splice(0, 1)[0];
			
			x = pos[0]
			y = pos[1]

			// Perform a rudimentary distance check to all previous cities
			// (to prevent city clashes which make the map ugly and unplayable)
			cityTooClose = false;
			for(let i = 0; i < this.cities.length; i++) {
				if(i == ind) { continue;}
				const otherCity = this.cities[i];
				let dist = Math.abs(otherCity.x - x) + Math.abs(otherCity.y - y);

				if(dist <= this.cfg.cityMinRadius) {
					cityTooClose = true;
					break;
				}
			}

		} while( (this.terrain[x][y].city != null || cityTooClose) && this.dockLocations.length > 0);

		if(this.dockLocations.length <= 0) {
			this.generationFail = true;
			return;
		}

		// move to new position (update data on both city and terrain)
		this.terrain[x][y].city = c;
		c.x = x;
		c.y = y;

		// disallow anything within our new radius
		this.disallowCitiesInRadius(x, y);
	}

	createConnections() {
		const cityRange = this.cfg.cityMaxConnectionRadius;
		const connectionProbability = 0.95;
		
		this.connections = [];

		const maxPathLength = this.cfg.cityMaxConnectionLength;
		let planesAndTrainsDisabled = (DIFFICULTY_LEVELS[this.cfg.difficulty] < 2);

		let pathTypesCovered = { 'boat': 0, 'road': 0, 'rail': 0 };
		if(planesAndTrainsDisabled) { delete pathTypesCovered.rail; }

		// as we place cities, we keep track of connection groups
		// why? so we can ENSURE all cities are reachable by placing at least one AIRPORT on each connection group
		let nextConnectionGroup = 0;

		for(let i = 0; i < this.cities.length; i++) {
			let curCity = this.cities[i];
			let possibleConnections = [];

			// capitals have a larger range and more connections!
			let tempPathLength = maxPathLength;
			let tepmConnectionProbability = connectionProbability;
			if(curCity.capital != null) {
				tempPathLength += 15;
				tepmConnectionProbability = 0.99;
			}

			// check all other cities 
			// (but no need to check those we already did)
			for(let j = (i+1); j < this.cities.length; j++) {
				let otherCity = this.cities[j];

				// first check if there is a path over water
				let pathOverWaterExists = false;
				let pathWater = this.getPath('water', null, curCity, otherCity);

				if(pathWater != null && pathWater.length <= maxPathLength) {
					pathOverWaterExists = true;
					possibleConnections.push({ 'city': otherCity, 'path': pathWater, 'pathType': 'boat' });
				}

				if(pathOverWaterExists) {
					continue;
				}

				// then check if there is a path over land
				// (either regular road or railroad)
				let pathType = Math.random() < 0.5 ? 'road' : 'rail';
				if(planesAndTrainsDisabled) { pathType = 'road'; }

				let pathLand = this.getPath('land', pathType, curCity, otherCity);

				if(pathLand != null && pathLand.length <= maxPathLength) {
					possibleConnections.push({ 'city': otherCity, 'path': pathLand, 'pathType': pathType });
				}
			}

			// if we have NO possible connections (at the moment or in the future)
			if(this.cfg.allowRelocating) {
				if(possibleConnections.length <= 0 && curCity.connections.length <= 0 && Math.random() <= this.cfg.relocateProbability) {
					// move this city somewhere else and try again
					this.moveCity(i, curCity);

					if(this.generationFail) {
						return;
					}

					i--;
					continue;
				}
			}

			// capitals MUST have at least two connections
			if(curCity.capital != null && possibleConnections.length <= 1) {
				this.generationFail = true;
				return;
			}

			// sort all connections based on distance (path length), ascending
			possibleConnections.sort((a, b) => (a.path.length > b.path.length) ? 1 : -1)

			// always place the first one, others have 50% probability
			for(let c = 0; c < possibleConnections.length; c++) {
				if(c > 0 && Math.random() > tepmConnectionProbability) {
					break;
				}

				let conn = possibleConnections[c];
				let otherCity = conn.city

				// re-check the paths!
				// because we've placed a path, others might become MORE EFFICIENT! (by snapping to it)
				// last paramater = allow overlap
				if(c > 0) {
					let newPath;
					if(conn.pathType == 'boat') {
						newPath = this.getPath('water', null, curCity, otherCity, true);
					} else {
						newPath = this.getPath('land', conn.pathType, curCity, otherCity, true);
					}

					if(newPath != null) {
						conn.path = newPath;
					}
				}
				
				curCity.connections.push(otherCity);
				otherCity.connections.push(curCity);
				
				this.connections.push({ 'path': conn.path, 'pathType': conn.pathType });

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
		this.shuffle(citiesCopy);

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
		for(const pathType in pathTypesCovered) {
			while(pathTypesCovered[pathType] < this.cfg.minPathsRequiredOfEachType) {
				let terrainType = 'water';
				if(pathType != 'boat') {
					terrainType = 'land';
				}

				let breakLoop = false;
				for(let i = 0; i < this.cities.length; i++) {
					const cityA = this.cities[i];
					for(let j = (i+1); j < this.cities.length; j++) {
						if(i == j) { continue; }


						const cityB = this.cities[j];
						if(cityA.connections.includes(cityB)) { continue; }

						let path = this.getPath(terrainType, pathType, cityA, cityB, true);

						if(path != null) {
							this.addPathToBoard({ 'path': path, 'pathType': pathType })
							breakLoop = true;
							pathTypesCovered[pathType]++;
							break;
						}
					}

					if(breakLoop) {
						break;
					}
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

	addPathToBoard(conn) {
		let halfwayPoint = Math.floor(0.5*conn.path.length);

		for(let p = 0; p < conn.path.length; p++) {
			let point = conn.path[p];
			let cell = this.terrain[point[0]][point[1]];

			if(p == halfwayPoint) { cell.halfwayPointOfPath = true; }
			cell.partOfPath = true;

			// @IMPROV: Maybe just use a SET instead of an array (gaurantees unique values anyway)
			if(!cell.pathTypes.includes(conn.pathType)) {
				cell.pathTypes.push(conn.pathType);
			}
			
		}
	}

	getPath(type, pathType, a, b, overrideOverlap = null) 
	{
		let routeConfig
		let allowOverlap = false
		if(Math.random() <= 0.5) { allowOverlap = true; }
		if(overrideOverlap != null) { allowOverlap = true; }

		if(type == 'water') {
			routeConfig = 
				{ 
					'terrainType': 'water',
					'pathType': 'boat', 
					'minVal': -1, 
					'maxVal': this.cfg.waterLine, 
					'maxLength': this.cfg.cityMaxConnectionLength, 
					'snapToPath': true,
					'allowOverlap': allowOverlap,
				}
		} else if(type == 'land') {
			routeConfig = 
				{ 
					'terrainType': 'land',
					'pathType': pathType, 
					'minVal': this.cfg.waterLine, 
					'maxVal': this.cfg.mountainLine, 
					'maxLength': this.cfg.cityMaxConnectionLength, 
					'snapToPath': true,
					'allowOverlap': allowOverlap,
				}
		}

		return calculateRoute(routeConfig, this.terrain, this.vecToArr(a), this.vecToArr(b));
	}

	getRandomGood(total) {
		const rand = Math.random()
		let sum = 0
		for(const name in this.GOODS) {
			sum += (this.GOODS[name].prob / total)

			if(sum >= rand) {
				return name;
			}
		}
	}

	determineCityDesires() {
		// first, truncate list to the goods we actually want
		// whilst calculating total probability
		// and adding each good to the list (twice if it's a default good and the number of cities supports this)
		const goodsList = [];
		const gameDifficulty = DIFFICULTY_LEVELS[this.cfg.difficulty];

		let totalGoodProbability = 0;
		this.GOODS = {}; // deep copy GOODS list, but only keep the ones actually in the game
		
		for(const name in GOODS) {
			const goodDifficulty = DIFFICULTY_LEVELS[GOODS[name].difficulty || "Training Wheels"];
			if(goodDifficulty > gameDifficulty) {
				continue;
			}

			totalGoodProbability += GOODS[name].prob;

			goodsList.push(name);
			if(goodDifficulty == 0 && this.cfg.numCities > 10) { goodsList.push(name); }

			this.GOODS[name] = GOODS[name];
		}

		// vanilla may only appear ONCE on the board
		// it's already added above, so just delete it now
		if(this.GOODS['Vanilla']) {
			totalGoodProbability -= this.GOODS['Vanilla'].prob;
			delete this.GOODS['Vanilla']
		}

		// now add goods randomly, following probability distribution, 
		// until we have enough (roughly 1.5 per city)
		const desiredTotalNumberGoods = Math.floor(this.cities.length * 1.5)
		while(goodsList.length < desiredTotalNumberGoods) {
			let randGood = this.getRandomGood(totalGoodProbability);

			goodsList.push(randGood)
		} 

		// shuffle the goods list
		this.shuffle(goodsList);

		// while we have goods, loop through the cities and give them to each city, including a point value
		let counter = 0;
		while(goodsList.length > 0) {
			const good = goodsList[goodsList.length - 1]

			if(this.cityHasRoomForGood(counter, good)) {
				const data = GOODS[good];
				const value = Math.floor(Math.random()*(data.pointMax + 1 - data.pointMin)) + data.pointMin;

				this.cities[counter].wantedGoods.push({ 'name': good, 'value': value });

				goodsList.pop();
			}
			
			counter = (counter + 1) % this.cities.length;
		}
	}

	determineCapitalValues() {
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

	visualizeGame() {
		let graphics = this.add.graphics();

		const oX = this.cfg.oX;
		const oY = this.cfg.oY;

		// terrain (grid) blocks
		const cs = this.cfg.cellSize;
		const deepWaterLine = this.cfg.deepWaterLine;
		const waterLine = this.cfg.waterLine;
		const mountainLine = this.cfg.mountainLine;

		for(let x = 0; x < this.cfg.widthInCells; x++) {
			for(let y = 0; y < this.cfg.heightInCells; y++) {
				let rect = new Geom.Rectangle(oX + x*cs, oY + y*cs, cs, cs);
				let noiseVal = this.terrain[x][y].val;

				if(noiseVal <= deepWaterLine) {
					graphics.fillStyle(0x030027, 1.0);
				} else if(noiseVal <= waterLine) {
					graphics.fillStyle(0x086375, 1.0);
				} /*else if(noiseVal <= 0.2) {
					graphics.fillStyle(0x143109, 1.0);
				} else if(noiseVal <= 0.4) {
					graphics.fillStyle(0x004F2D, 1.0);
				} */ else if(noiseVal <= 0.5) {
					graphics.fillStyle(0x8FC93A, 1.0);
				} else if(noiseVal <= mountainLine) {
					graphics.fillStyle(0xC6DEA6, 1.0);
				} else {
					graphics.fillStyle(0x7A6263, 1.0);
				}

				if(this.terrain[x][y].isForest) {
					let frame = this.checkNeighbourForestFrame(x, y);

					let imageKey = 'forest'
					if(this.cfg.printFriendly) {
						imageKey = 'forest_printfriendly';
					}

					let forest = this.add.sprite(rect.x + 0.5*cs, rect.y + 0.5*cs, imageKey, frame);

					let randSizeChange = Math.random()*8 - 4;
					let randOffsetChangeX = Math.random()*0.2-0.1, randOffsetChangeY = Math.random()*0.2-0.1;

					forest.displayWidth = cs + randSizeChange;
					forest.displayHeight = forest.displayWidth * 2.0;
					forest.setOrigin(0.5 + randOffsetChangeX, 1.0 + randOffsetChangeY);

					forest.depth = y;

					forest.flipX = Math.random() < 0.5 ? true : false;

					this.terrain[x][y].forestFrame = frame;
				}
				
				// if printfriendly, don't draw any colors and use outlines/stripes for sea and stuff
				// otherwise, just draw the terrain in detail
				if(this.cfg.printFriendly) {
					if(noiseVal <= waterLine) {
						let seaSprite = this.add.sprite(rect.x, rect.y, 'seaprintfriendly');

						seaSprite.displayWidth = seaSprite.displayHeight = cs;
						seaSprite.setOrigin(0,0);
						seaSprite.depth = y - 0.51;
						seaSprite.setAlpha(0.5);
					}
				} else {
					graphics.fillRectShape(rect);
				}
				
				// we also perform a sweep over all the paths to remove ugly connections
				// we check a box around ourselves, rotated if necessary
				this.checkUglyBox(x, y);


			}
		}

		// also perform a REVERSE sweep to remove ugly boxes
		// (which will catch many cases that the other sweep never caught)
		for(let x = this.cfg.widthInCells-1; x >= 0; x--) {
			for(let y = this.cfg.heightInCells-1; y >= 0; y--) {
				this.checkUglyBox(x,y);
			}
		}

		// render all water edges (for clearer separation between land and water)
		const waterEdgeLineWidth = 1.5
		for(let i = 0; i < this.waterEdges.length; i++) {
			let e = this.waterEdges[i];

			let line = new Geom.Line(oX + e[0]*cs, oY + e[1]*cs, oX + e[2]*cs, oY + e[3]*cs);
			
			graphics.lineStyle(waterEdgeLineWidth, 0x000000, 1.0); 
			graphics.strokeLineShape(line);
		}

		// connections (between cities)
		for(let x = 0; x < this.cfg.widthInCells; x++) {
			for(let y = 0; y < this.cfg.heightInCells; y++) {
				let curCell = this.terrain[x][y];
				if(!curCell.partOfPath) { continue; }

				for(let t = 0; t < curCell.pathTypes.length; t++) {
					// count connections to determine which sprite to display
					// (and how to rotate it)
					let pathType = curCell.pathTypes[t]
					let connectionInfo = this.countConnections(x, y, pathType);

					let spriteFrame = (connectionInfo.count - 1)
					if(connectionInfo.count == 2) {
						if(connectionInfo.hasBend) {
							spriteFrame = 0;
						}
					}

					let spriteRotation = connectionInfo.rotation

					let rect = new Geom.Rectangle(oX + x*cs, oY + y*cs, cs, cs);
					let sheetKey
					if(pathType == 'boat') {
						sheetKey = 'searoutes'
						if(this.cfg.printFriendly) {
							sheetKey = 'searoutes_printfriendly'
						}
					} else if(pathType == 'road') {
						sheetKey = 'landroutes'
					} else if(pathType == 'rail') {
						sheetKey = 'railroutes'
					}

					rect = this.add.sprite(rect.x + 0.5*cs, rect.y + 0.5*cs, sheetKey, spriteFrame);
					rect.displayWidth = cs;
					rect.displayHeight = cs;

					rect.setOrigin(0.5, 0.5);
					rect.angle = spriteRotation*90

					rect.depth = y;

					if(curCell.halfwayPointOfPath) {
						// Check if there is already such a cell above/left/diagonal from us
						// If so, don't display this one, as it's (most likely) redundant and ugly

						let shouldPlaceSprite = true;
						for(let xx = 0; xx < 3; xx++) {
							for(let yy = 0; yy < 3; yy++) {
								let pos = [x-1+xx, y-1+yy];
								if(xx == 1 && yy == 1) { continue; }
								if(this.outOfBounds(pos[0], pos[1])) { continue; }

								let cell = this.terrain[pos[0]][pos[1]];
								if(cell.halfwayPointOfPath || cell.city != null) { 
									shouldPlaceSprite = false; 
									curCell.halfwayPointOfPath = false;
									break;
								}
							}
						}

						if(shouldPlaceSprite) {
							let sprite = this.add.sprite(rect.x, rect.y, 'inbetween_space');
							sprite.displayWidth = sprite.displayHeight = this.cfg.cellSize*0.75;
							sprite.setOrigin(0.5, 0.5);
							sprite.depth = rect.depth + 0.5;
						}
					}

					// curCell.pathSprite = rect;
				}
			}
		}

		// cities
		let radius = this.cfg.cellSize*0.5*1.5;
		let textCfg:Record<string,any> = 
			{
				fontFamily: 'Rowdies', 
				fontSize: Math.max(radius, 20) + 'px',
				color: '#111111', 
				stroke: '#FFFFFF',
				strokeThickness: 3,
			}

		let goodNumberCfg = 
			{
				fontFamily: "Rowdies",
				fontSize: Math.max(radius, 16) + 'px',
				color: '#111111',
				stroke: "#FFFFFF",
				strokeThickness: 1.5
			}

		let bonusTxtCfg = 
			{
				fontFamily: "Rowdies",
				fontSize: textCfg.fontSize,
				color: "#66FF66",
				stroke: "#003300",
				strokeThickness: 1.5
			}

		for(let i = 0; i < this.cities.length; i++) {
			let c = this.cities[i];

			let xPos = oX + (c.x + 0.5)*cs, yPos = oY + (c.y + 0.5)*cs
			let circ

			textCfg.stroke = '#FFFFFF';

			if(c.capital == null) {
				circ = this.add.sprite(xPos, yPos, 'city')
				textCfg.color = '#111111';
			} else {
				circ = this.add.sprite(xPos, yPos, 'cities', c.capital)
				textCfg.color = PLAYER_COLORS[c.capital];

				// some players colors are so bright that I need to manually set a black outline
				if(textCfg.color == '#FFFF00' || textCfg.color == '#FFA500') {
					textCfg.stroke = '#111111'
				}
			}

			circ.displayWidth = radius*4;
			circ.displayHeight = radius*4;
			circ.setOrigin(0.5, 0.5);

			circ.depth = c.y + 1.1

			// display name of city BELOW it
			let yOffset = -6
			let txt = this.add.text(circ.x, circ.y + 2*radius + yOffset, CITY_NAMES[i], textCfg);
			txt.setOrigin(0.5, 0.5);
			txt.depth = 10000;

			// display wanted goods
			let wg = c.wantedGoods;
			let iconSize = 2*radius;
			for(let g = 0; g < wg.length; g++) {
				let good = wg[g];
				let spritesheetFrame = GOODS[good.name].frame
				let value = good.value;

				let sprite = this.add.sprite(circ.x + (-wg.length*0.5 + g + 0.5)*iconSize, circ.y - 2*radius, 'goods', spritesheetFrame);
				sprite.displayWidth = sprite.displayHeight = 2*radius;
				sprite.depth = 10000 + 1;

				let text = this.add.text(sprite.x, sprite.y, value, goodNumberCfg);
				text.depth = 10000 + 1;
			}

			// Airport is indicated by underline (with arrow pattern) to city name!
			if(c.airport) {
				let pos1 = txt.getBottomLeft()
				let pos2 = txt.getBottomRight()
				let thickness = Math.max(radius*0.5, 8)
				let yOffset = -5
				let rect = new Geom.Rectangle(pos1.x, pos1.y + yOffset, (pos2.x-pos1.x), thickness)

				let gr = this.add.graphics();
				gr.fillStyle(0xFF6666, 1.0);
				gr.fillRectShape(rect);

				gr.depth = 10000 + 1;

				let tileSprite = this.add.tileSprite(rect.x, rect.y, rect.width, rect.height, 'airplane_tile_sprite');
				tileSprite.setOrigin(0,0);
				
				tileSprite.tileScaleX = tileSprite.tileScaleY = (thickness/20.0);

				tileSprite.depth = gr.depth + 1;
			}

			// If city bonuses are enabled, display it on the city (only if non-zero)
			if(this.cfg.cityBonus) {
				const b = c.addedBonus;
				if(b > 0) {
					let txt = this.add.text(circ.x, circ.y, '+' + b, bonusTxtCfg);
					txt.setOrigin(0.5, 0.5);
					txt.depth = 10000;
				}
			}
		}

		// some overlay text about the map settings
		//  -> Random Jungle Name
		//  -> # Players
		//  -> Chosen Difficulty
		let fontSize = 12;
		let margin = 8
		if(this.cfg.splitBoard) { fontSize *= 2; margin *= 2; }

		textCfg = 
		{
			fontFamily: 'Rowdies',
			fontSize: fontSize + 'px',
			color: '#FFFFFF'
		}

		let txt1 = this.add.text(oX + margin, oY + margin, '"' + this.cfg.jungleName + '"', textCfg);
		txt1.setOrigin(0,0);
		txt1.depth = 20000;

		let playerText = this.cfg.numPlayers + ' Player'
		if(this.cfg.numPlayers > 1) { playerText += 's'; }

		let txt2 = this.add.text(oX + margin, oY + margin + fontSize, playerText, textCfg);
		txt2.setOrigin(0, 0);
		txt2.depth = 20000;

		let txt3 = this.add.text(oX + margin, oY + margin + fontSize*2, this.cfg.difficulty, textCfg);
		txt3.setOrigin(0,0);
		txt3.depth = 20000;	

		// a rectangle behind the text, to make it legible (and look a bit like a map legend)
		let maxWidth = Math.max(txt1.getRightCenter().x, txt3.getRightCenter().x) - margin;
		let maxHeight = txt3.getBottomRight().y - (txt1.getTopLeft().y - 0.5*margin) + 0.5*margin;
		let rect = new Geom.Rectangle(txt1.getLeftCenter().x - 0.5*margin, txt1.getTopLeft().y - 0.5*margin, maxWidth + margin, maxHeight + margin);

		let overlayGraphics = this.add.graphics();
		overlayGraphics.fillStyle(0x000000, 0.5);
		overlayGraphics.fillRectShape(rect);

		overlayGraphics.depth = 20000 - 1;	

		// display a RULE REMINDER underneath it
		if(this.cfg.rulesReminder) {
			let overview = this.add.sprite(rect.x, rect.y + maxHeight + margin, 'rules_overview');
			let ratio = (overview.displayWidth / overview.displayHeight);
			overview.displayWidth = maxWidth + margin;
			overview.displayHeight = overview.displayWidth / ratio;
			overview.depth = 20000 - 1;
			overview.setOrigin(0,0);
		}
	}

	getRandomJungleName() {
		const templates = 
		[
			"X Forest", 
			"X Rainforest",
			"X Jungle",
			"X Woods",
			"X Territory",
			"X Wilderness",
			"X Park",
			"Forest of X",
			"Rainforest of X",
			"Jungle of X",
			"Planes of X",
			"Park of X"
		]

		const coolWords = 
		[
			"Nimi", 
			"Takuto",
			"Ungukto",
			"Tulosi",
			"Berchake",
			"El Charpo", 
			"Caro",
			"Ziza",
			"Rain",
			"Winds",
			"Sun",
			"Sea",
			"Power",
			"Madness",
			"Fun",
			"Thunder",
			"Gods",
			"Lions",
			"Monkeys",
			"Flowers",
			"Juga",
			"Xirp",
			"Dragon",
			"Stone",
			"Fire",
			"Water",
			"Flow"
		]

		const randTemplate = templates[Math.floor(Math.random() * templates.length)];
		const randWord = coolWords[Math.floor(Math.random() * coolWords.length)];

		return randTemplate.replace("X", randWord);
	}

	shuffle(a) {
		let j, x, i;
		for (i = a.length - 1; i > 0; i--) {
			j = Math.floor(Math.random() * (i + 1));
			x = a[i];
			a[i] = a[j];
			a[j] = x;
		}

		return a;
	}

	pixelToCell(a) {
		return { 'x': Math.floor(a.x/this.cfg.cellSize), 'y': Math.floor(a.y/this.cfg.cellSize) }
	}

	vecToArr(a) {
		return [a.x, a.y];
	}

	checkUglyBox(x,y) {
		// if we're not even part of a path, ignore this
		if(!this.terrain[x][y].partOfPath) {
			return;
		}

		// if the box would go out of bounds, ignore this
		if(this.outOfBounds(x + 1, y + 1)) {
			return;
		}

		// first check if we have a box
		let curCell = this.terrain[x][y]

		for(let i = (curCell.pathTypes.length-1); i >= 0; i--) {
			let pathType = curCell.pathTypes[i]

			let numNeighbors = 0;
			for(let ooX = 0; ooX < 2; ooX++) {
				for(let ooY = 0; ooY < 2; ooY++) {
					let tempCell = this.terrain[x+ooX][y+ooY]
					if(this.validNeighbour(curCell, tempCell, pathType)) {
						numNeighbors++;
					}
				}
			}

			if(numNeighbors < 4) {
				continue;
			}

			// now check if we can remove a square
			let externalConns = [[-1,0], [0,-1], [1,0], [0,1]];
			let cell = [x, y];

			// for each rotation (top left, top right, bottom right, bottom left)
			// NOTE: it DOES work, but it doesn't catch all possible cases (because it only looks at isolated 2x2 squares, once)
			for(let rotation = 0; rotation < 4; rotation++) {
				let numExternalConns = 0;

				// check if we have a vital external connection
				let curRotatedCell = this.terrain[cell[0]][cell[1]]
				for(let ec = rotation; ec < rotation+2; ec++) {
					let tempX = cell[0] + externalConns[ec % 4][0], tempY = cell[1] + externalConns[ec % 4][1];

					if(this.outOfBounds(tempX, tempY)) { continue; }

					let tempCell = this.terrain[tempX][tempY]
					if(this.validNeighbour(curRotatedCell, tempCell, pathType)) {
						numExternalConns++;
					}
				}

				// if no external connections, the we can just remove this path!
				// also STOP the loop, because now the ugly box is already gone!
				if(numExternalConns == 0) {
					curRotatedCell.pathTypes.filter(function(e) { return e !== pathType })

					if(curRotatedCell.pathTypes.length <= 0) {
						curRotatedCell.partOfPath = false;
					}
					break;
				}

				// keep track of the current cell (of our 2x2 square) that we are considering
				let orthoVec = externalConns[(rotation + 2) % 4]
				cell = [cell[0] + orthoVec[0], cell[1] + orthoVec[1]]
			}
		}
	}

	countConnections(x, y, pathType = null) {
		let nbs = [[1,0], [0,1], [-1,0], [0,-1]]
		let sum = 0;
		let curCell = this.terrain[x][y]

		let rotation = -1;
		let lastRotation = -1;
		let hasBend = false;
		for(let a = 0; a < 4; a++) {
			let nbX = x + nbs[a][0], nbY = y + nbs[a][1];

			if(this.outOfBounds(nbX, nbY)) {
				continue;
			}

			let nbCell = this.terrain[nbX][nbY];
			if(this.validNeighbour(curCell, nbCell, pathType)) {
				sum++;

				if(rotation == -1 || (rotation == 0 && a == 3)) {
					rotation = a;
				}

				if(lastRotation != -1 && (a - lastRotation) % 2 == 1) {
					hasBend = true;
				}

				lastRotation = a;
			}
		}

		// now keep looping until we find all neighbours in a row => the first one should be our rotation
		// @IMPROV: Can we generalize this for all numbers?
		if(sum == 3) {
			let neighboursInARow = 0;
			let sequenceStarter = -1;
			let iterator = 0;
			while(true) {
				let nbX = x + nbs[iterator][0], nbY = y + nbs[iterator][1];

				let addNeighbour = false;
				if(!this.outOfBounds(nbX, nbY)) {
					let nbCell = this.terrain[nbX][nbY];
					if(this.validNeighbour(curCell, nbCell, pathType)) {
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

				if(neighboursInARow >= sum) {
					break;
				}

				iterator = (iterator + 1) % 4;
			}

			rotation = sequenceStarter;
		}

		return { 'count': sum, 'rotation': rotation, 'hasBend': hasBend }
	}

	validNeighbour(a, b, pathType = null) 
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

	checkNeighbourForestFrame(x, y) {
		// if any neighbour is a forest (which already has a frame), copy that
		let dirs = [[-1,0], [0,-1]];
		for(let a = 0; a < dirs.length; a++) {
			let nbX = x + dirs[a][0], nbY = y + dirs[a][1]
			if(this.outOfBounds(nbX, nbY)) { continue; }

			if(this.terrain[nbX][nbY].isForest) {
				return this.terrain[nbX][nbY].forestFrame
			}
		}

		// otherwise, return a random frame
		return Math.floor(Math.random()*4)
	}

	distanceToBounds(x,y) {
		let left = x
		let right = this.cfg.widthInCells - 1 - x
		let top = y
		let bottom = this.cfg.heightInCells - 1 - y

		return Math.min(Math.min(left, right), Math.min(top, bottom));
	}

	outOfBounds(x, y) {
		return (x < 0 || x >= this.cfg.widthInCells || y < 0 || y >= this.cfg.heightInCells);
	}
}

PandaqiPhaser.linkTo(BoardGeneration, sceneKey);