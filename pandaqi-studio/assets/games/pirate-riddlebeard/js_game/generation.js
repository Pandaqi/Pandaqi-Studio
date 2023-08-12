import Interface from "./interface"
import { TERRAINS, TERRAIN_DATA, NATURE, STONES, QUADRANTS, LANDMARKS, ROADS, HINT_ICONS, LISTS, HINTS, scaleFactor, pdfSize, alphabet } from "./dictionary"
import Random from "js/pq_games/tools/random/main"

export default new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:
    function Generation()
    {
        Phaser.Scene.call(this, { key: 'generation' });
    },

    preload: function() {
		this.load.crossOrigin = 'Anonymous';
		this.canvas = this.sys.game.canvas;

		var base = 'assets/';

		this.load.spritesheet('elements', base + 'elements.png', { frameWidth: 400, frameHeight: 400 });
		this.load.spritesheet('icons', base + 'icons.png', { frameWidth: 400, frameHeight: 400 });
		this.load.image('hint_card', base + 'hint_card.png');
    },

    create: function(config) {
    	this.generateConfiguration(config);

    	var algo = 'forward';
    	if(Math.random() <= 0.1) { algo = 'backward'; }
    	if(this.cfg.expansions.theLostRiddles) { algo = 'forward'; }

    	this.cfg.algorithm = algo; 
    	this.AVAILABLE_HINTS = structuredClone(HINTS);

    	// remove any categories that aren't in this game anyway
    	// (useful for creating lower difficulty games with less hint diversity)
    	for(category in this.AVAILABLE_HINTS) {
    		if(this.cfg.hintCategories.includes(category)) { continue; }
    		delete this.AVAILABLE_HINTS[category];
    	}

    	// remove "advanced" hints if this option isn't enabled
    	if(!this.cfg.advancedHints) {
    		for(category in this.AVAILABLE_HINTS) {
    			for(let i = this.AVAILABLE_HINTS[category].length-1; i >= 0; i--) {
    				if(!("advanced" in this.AVAILABLE_HINTS[category][i])) { continue; }
    				this.AVAILABLE_HINTS[category].splice(i, 1);
    			}
    		}
    	}

    	console.log("=== STARTING HINT GENERATION ===")
		console.log("Algorithm: " + this.cfg.algorithm);
		console.log("=== STARTING HINT GENERATION ===");

		this.determineSeed();

    	this.hintsGenerationFail = true;

    	var timeout = 12;
    	var interval;
		var mainGenerationAction = function() {
		    this.generateBoard();

			this.hintGenerationTries = 0;
			this.maxHintGenerationTries = 50;
			
			var foundSolution = false;
			console.log("(Re)trying hint generation")

	    	while(this.hintsGenerationFail && this.hintGenerationTries < this.maxHintGenerationTries) {
	    		this.hintGenerationTries += 1;
	    		this.hintsGenerationFail = false;

	    		if(this.cfg.algorithm == 'backward') {
	    			this.generateInstructionsBackward();
	    		} else if(this.cfg.algorithm == 'forward') {
	    			this.generateInstructionsForward();
	    		}

	    		if(this.hintsGenerationFail) { continue; }
	    		
	    		this.distributeHintsAcrossPlayers();

	    		this.checkHintValueBalance();
	    		if(this.hintsGenerationFail) { continue; }

	    		foundSolution = true;
	    	};

	    	if(foundSolution) { 
	    		clearInterval(interval); 
	    		this.finishCreation();
	    	}
		};

		interval = setInterval(mainGenerationAction.bind(this), timeout);

	},

	finishCreation: function()
	{
		this.addLiarsCouncilHints();
	    this.addTinyTreasuresHints();
	    this.calculateBotbeardInformation();

		this.visualizeGame();
		this.convertCanvasToImage();

		var shortstring = this.convertToStringCoordinates(this.treasure); 
		var longstring = "(x = " + (this.treasure.x+1) + ", y = " + (this.treasure.y+1) + ")"
		var treasureCoords = shortstring + " " + longstring

		// save loads of data somewhere else, so we can close the game before starting the interface
		const config = {
			'treasureCoords': treasureCoords,
			'map': this.map,
			'leftoverHints': this.LOST_RIDDLES,
			'hintsPerPlayer': this.hintsPerPlayer,
			'tilesLeftPerPlayer': this.tilesLeftPerPlayer,
			'allLocationsAsStrings': this.getAllLocationsAsStrings(),
			'botData': {
				'categories': this.botHintCategories
			}
		}
		Object.assign(config, this.cfg);

		if(this.cfg.premadeGame)
		{
			this.createPreMadeGame();
		}

		const ui = new Interface(config);
		ui.start();
	},

	calculateBotbeardInformation: function()
	{
		if(!this.cfg.addBot) { return; }

		// first just save which squares CAN be the treasure according to the bot hints
		var locs = this.mapList.slice();
		var botHints = this.hintsPerPlayer[this.hintsPerPlayer.length - 1];
		for(let i = 0; i < botHints.length; i++)
		{
			this.removeInvalidLocationsDueToHint(locs, botHints[i]);
		}

		for(let i = 0; i < locs.length; i++)
		{
			locs[i].botPositive = true;
		}

		// then save a list of the hint categories 
		this.botHintCategories = [];
		for(let i = 0; i < botHints.length; i++)
		{
			this.botHintCategories.push(botHints[i].category);
		}

		// then the most difficult part: the propose action
		// pick random pairs of tiles, clear one, check if it changes the bots answer, then put back the original
		var numProposeChecks = 350;
		var proposalExtraChangeProb = 0.55;
		for(let i = 0; i < numProposeChecks; i++)
		{
			var tileA = this.mapList[Math.floor(Math.random() * this.mapList.length)];
			var oldTileA = structuredClone(tileA);
			var otherPos = { "x": tileA.x, "y": tileA.y };
			otherPos.x = Math.max(Math.min(otherPos.x - 2 + Math.floor(Math.random()*5), this.cfg.width-1), 0);
			otherPos.y = Math.max(Math.min(otherPos.y - 2 + Math.floor(Math.random()*5), this.cfg.height-1), 0);

			var tileB = this.map[otherPos.x][otherPos.y];
			var posAsString = this.convertToStringCoordinates(otherPos);
			var alreadyCheckedThisTileAndItsTrue = (posAsString in tileA.proposeData) && tileA.proposeData[posAsString].changed;
			var pickExtremeTileB = (Math.random() <= 0.1) || (alreadyCheckedThisTileAndItsTrue);
			if(pickExtremeTileB) {
				tileB = this.mapList[Math.floor(Math.random() * this.mapList.length)];
			}

			var proposal = {};
			var originalAnswer = tileB.botPositive;
			var list = [tileB];

			if(Math.random() <= 0.66) {
				tileA.nature = this.getRandomNature([tileA.nature]);
				proposal.nature = tileA.nature;
			}

			if(this.cfg.elements.stones && Math.random() <= proposalExtraChangeProb) {
				tileA.stones = this.getRandomStones([tileA.stones]);
				proposal.stones = tileA.stones;
			}

			if(this.cfg.elements.landmarks && Math.random() <= proposalExtraChangeProb) {
				tileA.landmark = this.getRandomLandmark([tileA.landmark]);
				proposal.landmark = tileA.landmark;
			}
			
			if(this.cfg.elements.roads && Math.random() <= proposalExtraChangeProb) {
				tileA.road = this.getRandomRoad([tileA.road]);
				proposal.road = tileA.road;
			}

			var nothingChangedYet = (Object.keys(proposal).length == 0);
			if(nothingChangedYet || Math.random() <= 0.66) {
				tileA.terrain = this.getRandomTerrain([tileA.terrain]);
				proposal.terrain = tileA.terrain;
			}
			
			for(let h = 0; h < botHints.length; h++) 
			{
				this.removeInvalidLocationsDueToHint(list, botHints[h]);
			}

			var newAnswer = (list.length > 0);

			tileA.nature = oldTileA.nature;
			tileA.stones = oldTileA.stones;
			tileA.landmark = oldTileA.landmark;
			tileA.road = oldTileA.road;
			tileA.terrain = oldTileA.terrain;

			var changed = (originalAnswer != newAnswer);
			proposal.changed = changed;
			tileA.proposeData[this.convertToStringCoordinates(tileB)] = proposal;
		}
	},

	getAllLocationsAsStrings: function()
	{
		var list = this.mapList.slice();
		for(let i = 0; i < list.length; i++)
		{
			list[i] = this.convertToStringCoordinates(list[i]);
		}
		return list;
	},

	addLiarsCouncilHints: function()
	{
		if(!this.cfg.expansions.liarsCouncil) { return; }

		// randomly hand false squares to players
		var falseSquaresPerPlayer = [];
		for(let i = 0; i < this.cfg.playerCount; i++)
		{
			falseSquaresPerPlayer.push([]);
		}

		while(this.FALSE_SQUARES.length > 0) {
			var randPlayer = Math.floor(this.cfg.rng.hints() * this.cfg.playerCount);
			var square = this.FALSE_SQUARES[this.FALSE_SQUARES.length - 1];
			var string = this.convertToStringCoordinates(square);
			if(falseSquaresPerPlayer[randPlayer].includes(string)) { 
				this.FALSE_SQUARES.pop();
				continue;
			}

			falseSquaresPerPlayer[randPlayer].push(string);
			if(this.cfg.rng.hints() <= 0.75) { this.FALSE_SQUARES.pop(); }
		}

		// randomly hand truth squares to players
		var truthSquaresPerPlayer = [];
		for(let i = 0; i < this.cfg.playerCount; i++)
		{
			truthSquaresPerPlayer.push([]);
		}

		while(this.TRUTH_SQUARES.length > 0) {
			var randPlayer = Math.floor(this.cfg.rng.hints() * this.cfg.playerCount);
			var square = this.TRUTH_SQUARES[this.TRUTH_SQUARES.length - 1];
			var string = this.convertToStringCoordinates(square);
			if(truthSquaresPerPlayer[randPlayer].includes(string)) { 
				this.TRUTH_SQUARES.pop();
				continue;
			}

			truthSquaresPerPlayer[randPlayer].push(string);
			if(this.cfg.rng.hints() <= 0.75) { this.TRUTH_SQUARES.pop(); }
		}

		// convert them into hints, stick them to the end
		for(let i = 0; i < this.cfg.playerCount; i++)
		{
			var falseSquares = falseSquaresPerPlayer[i];
			if(falseSquares.length > 0) {
				var hint = {}
				hint.final_text = "These are FALSE squares: " + falseSquares.join(", ");
				hint.html_text = hint.final_text;
				this.hintsPerPlayer[i].push(hint);
			}

			var truthSquares = truthSquaresPerPlayer[i];
			if(truthSquares.length > 0) {
				var hint = {}
				hint.final_text = "These are TRUTH squares: " + truthSquares.join(", ");
				hint.html_text = hint.final_text;
				this.hintsPerPlayer[i].push(hint);
			}
		}
	},

	addTinyTreasuresHints: function()
	{
		if(!this.cfg.expansions.tinyTreasures) { return; }

		for(let i = 0; i < this.cfg.playerCount; i++)
		{
			var space = this.TINY_TREASURES[i];
			var hint = {};
			hint.final_text = "There's a tiny treasure here: " + this.convertToStringCoordinates(space);
			hint.html_text = hint.final_text
			this.hintsPerPlayer[i].push(hint);
		}
	},

	distributeHintsAcrossPlayers: function()
	{
		// this.hints is a dictionary with key = category, value = list of all hints in that category
		var categories = Object.keys(this.hints);
		this.shuffle(categories);

		var hintsPerPlayer = [];
		for(let i = 0; i < this.cfg.playerCount; i++)
		{
			hintsPerPlayer[i] = [];
		}

		var curPlayer = Math.floor(this.cfg.rng.hints() * this.cfg.playerCount);
		for(let i = 0; i < categories.length; i++)
		{
			var category = categories[i];
			var list = this.hints[category];
			this.shuffle(list);

			for(let a = 0; a < list.length; a++)
			{
				hintsPerPlayer[curPlayer].push(list[a]);
				curPlayer = (curPlayer + 1) % this.cfg.playerCount;
			}
		}

		this.hintsPerPlayer = hintsPerPlayer;

		if(this.cfg.debugging) { console.log("HINTS PER PLAYER"); console.log(this.hintsPerPlayer); }
	},

	checkHintValueBalance: function()
	{
		var offset = 0;
		var t = this.hintGenerationTries;
		var m = this.maxHintGenerationTries;
		if(t >= 0.7*m) { offset = 1; }
		if(t >= 0.8*m) { offset = 2; }
		if(t >= 0.9*m) { offset = 3; }

		if(this.cfg.playerCount == 5) { offset += 1; }
		else if(this.cfg.playerCount == 6) { offset += 2; }

		var tilesLeft = [];

		var minOptionsLeft = Math.round(0.33*this.cfg.totalTileCount); // min options is the more important number, so no offset change here
		var maxOptionsLeft = Math.round(0.75*this.cfg.totalTileCount) + offset;

		var failIfOptionsNotBalanced = (this.numMapGenerations < 20);

		this.tilesLeftPerPlayer = [];

		var failed = false;
		for(let i = 0; i < this.hintsPerPlayer.length; i++)
		{
			var hints = this.hintsPerPlayer[i];
			var locs = this.mapList.slice();
			
			for(let h = 0; h < hints.length; h++)
			{
				var prevNumSolutions = locs.length;
				this.removeInvalidLocationsDueToHint(locs, hints[h]);
				if(Math.abs(prevNumSolutions - locs.length) < this.cfg.minImpactPerHint && this.cfg.forbidUselessHintsPerPlayer) {
					failed = true;
					break;
				}
			}

			var value = locs.length;
			tilesLeft.push(value);

			this.tilesLeftPerPlayer.push(locs);

			if(value < minOptionsLeft) { failed = true; }
			if(value > maxOptionsLeft && failIfOptionsNotBalanced) { failed = true; }
			if(failed) { break; }
		}

		if(failed) { this.hintsGenerationFail = true; return; }
		if(this.cfg.debugging) { console.log("TILES LEFT PER PLAYER"); console.log(tilesLeft); }
		if(!failIfOptionsNotBalanced) { return; }

		var maxDifference = Math.round(0.3*this.cfg.totalTileCount) + offset;
		
		for(let a = 0; a < tilesLeft.length; a++)
		{
			for(let b = 0; b < tilesLeft.length; b++)
			{
				if(a == b) { continue; }
				if(Math.abs(tilesLeft[a] - tilesLeft[b]) <= maxDifference) { continue; }
				failed = true;
				break;
			}

			if(failed) { break; }
		}

		if(failed) { this.hintsGenerationFail = true; }
	},

	/*
		GENERATION
	*/
	generateConfiguration: function(config = {})
	{
		var data = JSON.parse(window.localStorage.pirateRiddlebeardData);

    	this.cfg = 
    	{
    		'seed': data.seed || "",
    		'debugging': false, // @DEBUGGING (should be false)
    		'premadeGame': data.premadeGame,
    		'useInterface': true, //@DEBUGGING (should be true)
    		'inkFriendly': true,

    		'pixelwidth': this.canvas.width,
    		'pixelheight': this.canvas.height,
    		'width': 8,
    		'height': 4,

    		'playerCount': data.playerCount || 4,
    		'addBot': (data.playerCount <= 2),
    		'minHintsPerPlayer': 1,
			'maxHintsPerPlayer': 1,
			'minImpactPerHint': 3, // how many squares each hint should REMOVE, at least
			'forbidUselessHintsPerPlayer': true,

			'treePercentage': 0.15,
			'flowerPercentage': 0.15,
			'stonesPercentage': 0.33,
			'roadPercentage': 0.5,
			'hintCategories': [],

			"multiHint": data.multiHint,
			"advancedHints": data.advancedHints,
			'invertHintGrid': true, // on premade hint cards, marks all squares which can NOT be the treasure, instead of those that COULD be it

			"elements": {
				'allTerrains': data.allTerrains,
				"stones": data.includeStones,
				"roads": data.includeRoads,
				"landmarks": data.includeLandmarks
			},

			"expansions": {
				"liarsCouncil": data.expansions.liarsCouncil,
				"theLostRiddles": data.expansions.theLostRiddles,
				"tinyTreasures": data.expansions.tinyTreasures,
				"gamblerOfMyWord": data.expansions.gamblerOfMyWord
			},

			'wrapBoard': false, // experimental
    	}

    	if(this.cfg.wrapBoard) { console.error("CAUTION! Board wrapping is turned ON"); }

    	// Not 100% sure this is better, but at least it leads to better generation
    	// And it feels like some players with fewer hints is a good simplification for the game
    	if(this.cfg.multiHint) {
    		this.cfg.minHintsPerPlayer = 1;
    		this.cfg.maxHintsPerPlayer = 2.5;
    	}

    	if(this.cfg.premadeGame) {
    		this.cfg.useInterface = false;
    		this.cfg.debugging = false;
    	}

    	// 12x6 is certainly bigger than the usual board, but not enormously so
    	if(data.isColored) {
    		this.cfg.inkFriendly = false;

    		this.cfg.width = 12;
    		this.cfg.height = 6;
    	}

    	if(this.cfg.useInterface) {
    		this.cfg.debugging = false;
    	}

    	this.cfg.hintCategories = ['terrain', 'nature', 'general'];
    	if(this.cfg.elements.stones) { this.cfg.hintCategories.push("stones"); }
    	if(this.cfg.elements.roads) { this.cfg.hintCategories.push("roads"); }
    	if(this.cfg.elements.landmarks) { this.cfg.hintCategories.push("landmarks"); }

    	if(this.cfg.expansions.tinyTreasures) { this.cfg.hintCategories.push("tinyTreasures"); }

    	this.cfg.cellSize = Math.min(Math.floor(this.cfg.pixelwidth/this.cfg.width), Math.floor(this.cfg.pixelheight/this.cfg.height))

    	this.cfg.oX = (this.cfg.pixelwidth - this.cfg.width*this.cfg.cellSize) * 0.5;
    	this.cfg.oY = (this.cfg.pixelheight - this.cfg.height*this.cfg.cellSize) * 0.5;

    	this.cfg.totalTileCount = (this.cfg.width * this.cfg.height);

    	// if we have a bot, add that as an extra player as usual
    	// (in the interface, we just need to make sure we don't display its data on startup)
    	if(this.cfg.addBot) {
    		this.cfg.playerCount += 1;
    	}

    	// calculate the row/column lists dynamically here, as it depends on board size
    	// (all other lists are static and saved in dictionary.js)
    	var rows = [];
    	for(let i = 0; i < this.cfg.height; i++) {
    		rows.push((i+1)); // stupid humans starting to count at 1
    	}

    	var cols = [];
    	for(let i = 0; i < this.cfg.width; i++) {
    		cols.push(alphabet[i]);
    	}

    	LISTS.row = rows;
    	LISTS.column = cols;

    	// on ink friendly maps, there can only be 4 stones at most on a cell
    	if(this.cfg.inkFriendly) {
    		STONES.splice(STONES.indexOf(4), 1);
    		LISTS.stones = STONES;
    	}

    	// on first/basic maps, we only use the first X terrains
    	if(!this.cfg.elements.allTerrains) {
    		TERRAINS.splice(3);
    		LISTS.terrain = TERRAINS
    	}
	},

	generateBoard: function() {
		this.mapGenerationFail = true
		this.numMapGenerations = 0;

		while(this.mapGenerationFail) {
			this.numMapGenerations += 1;
			this.mapGenerationFail = false;

			this.prepareGrid();
			this.createTerrain();
			if(this.mapGenerationFail) { continue; }

			this.createLandmarks();
			this.createRoads();
			this.createStones();
			this.createNature();

			this.createLiarsCouncil();
			this.createTinyTreasures();
		}
	},

	determineSeed: function() {
		var randomSeedLength = Math.floor(Math.random() * 10) + 2;
		var randomSeed = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, randomSeedLength);

		if(this.cfg.seed == '') { this.cfg.seed = randomSeed; }
		var finalSeed = this.cfg.seed;

		this.cfg.seed = finalSeed; 
		this.cfg.rng = {};
		this.cfg.rng.general = Random.seedRandom(finalSeed + "-general");
		this.cfg.rng.map = Random.seedRandom(finalSeed + "-map");
		this.cfg.rng.hints = Random.seedRandom(finalSeed + "-hints-" + randomSeed);
	},

	prepareGrid: function() {
		this.map = [];
		this.mapList = [];

		for(var x = 0; x < this.cfg.width; x++) {
			this.map[x] = [];

			for(var y = 0; y < this.cfg.height; y++) {
				var quadrant = Math.floor(2 * x / this.cfg.width) + Math.floor(2 * y / this.cfg.height)*2;
				var isEdge = (x == 0 || x == (this.cfg.width-1)) || (y == 0 || y == (this.cfg.height-1));

				var obj =
				{ 
					'x': x,
					'y': y,

					'row': (y+1),
					'column': alphabet[x],

					'isEdge': isEdge,
					'terrain': '',
					'nature': '',
					'stones': 0,
					'quadrant': quadrant,
					'road': '',
					'roadOrient': 0,
					'landmark': '',

					'falseSquare': false,
					'truthSquare': false,
					'tinyTreasure': false,

					'botPositive': false,
					'proposeData': {}
				};

				this.map[x][y] = obj;
				this.mapList.push(obj);
			}
		}

		// saving all our (valid) neighbours once at the start saves a lot of time (and for loops) later on
		var nbCoords = [{"x":1,"y":0},{"x":0,"y":1},{"x":-1,"y":0},{"x":0,"y":-1}]
		for(var x = 0; x < this.cfg.width; x++) {
			for(var y = 0; y < this.cfg.height; y++) {
				
				var nbs = [];
				for(let i = 0; i < nbCoords.length; i++) {
					var newPos = { "x": x + nbCoords[i].x, "y": y + nbCoords[i].y };

					if(this.cfg.wrapBoard) {
						newPos.x = (newPos.x + this.cfg.width) % this.cfg.width;
						newPos.y = (newPos.y + this.cfg.height) % this.cfg.height;
					}

					if(this.outOfBounds(newPos.x, newPos.y)) { continue; }
					
					nbs.push(this.map[newPos.x][newPos.y]);
				}

				this.map[x][y].nbs = nbs;
			}
		}
	},

	createTerrain: function() {

		if(this.cfg.debugging) { console.log(" => Creating terrain ... "); }

		// don't use NOISE for terraina nymore
		// noise.seed(this.cfg.rng.map());

		// randomly place some starting dots for each terrain
		var numDots = Math.floor(0.5 * Math.pow(this.cfg.totalTileCount, 0.5));
		var numStartingDots = numDots;
		var minDistBetweenSameTerrain = Math.round(Math.sqrt(numStartingDots));
		var allLocations = this.mapList.slice();
		var filledLocations = {};
		var numFilledLocations = 0;

		this.shuffle(allLocations);

		for(let t = 0; t < TERRAINS.length; t++) {
			var curTerrain = TERRAINS[t];

			for(let i = 0; i < numStartingDots; i++) {
				var loc = allLocations.pop();
				if(!(curTerrain in filledLocations)) {
					filledLocations[curTerrain] = [];
				}

				if(!this.minDistanceApart(loc, filledLocations[curTerrain], minDistBetweenSameTerrain)) {
					allLocations.unshift(loc);
					continue;
				}

				loc.terrain = curTerrain;
				filledLocations[curTerrain].push(loc);
				numFilledLocations += 1;
			}
		}

		// now keep growing random squares until the board is filled
		var boardFilled = false;
		while(!boardFilled) {
			var randTerrain = this.getRandomTerrain();
			if(!(randTerrain in filledLocations)) { continue; }

			var numOptions = filledLocations[randTerrain].length;

			if(numOptions <= 0) { continue; }

			var idx = Math.floor(this.cfg.rng.map() * numOptions);
			var loc = filledLocations[randTerrain][idx];
			var newTerrain = loc.terrain;
			var nbs = this.getEmptyNeighbors(loc, ["terrain"]);

			var completelySurrounded = (nbs.length == 0);
			if(completelySurrounded) {
				filledLocations[randTerrain].splice(idx, 1);
				continue;
			}

			var newLoc = nbs[Math.floor(this.cfg.rng.map() * nbs.length)];
			newLoc.terrain = newTerrain;

			filledLocations[newTerrain].push(newLoc);
			numFilledLocations += 1;

			boardFilled = (numFilledLocations >= this.cfg.totalTileCount);
		}

		// SAFETY CHECK: if a terrain is severely underrepresented, we fail the generation
		// (1.0/TERRAINS) is what we'd expect on average, if it falls below 10% of that, we deem it a bad situation
		var minCellsPerTerrain = Math.round( (0.1 * (1.0/TERRAINS.length)) * (this.cfg.width * this.cfg.height) );

		for(terrain in filledLocations) {
			if(filledLocations[terrain].length < minCellsPerTerrain) {
				this.mapGenerationFail =  true;
				break;
			}
		}

	},

	createNature: function() {
		if(this.cfg.debugging) { console.log(" => Creating nature ... "); }

		var noNatureAllowed = (!this.cfg.hintCategories.includes("nature"));
		if(noNatureAllowed) { return; }

		// create starting nature
		var startingDots = Math.floor(0.6 * Math.pow(this.cfg.totalTileCount, 0.5));

		var numStartingTrees = startingDots;
		var numStartingFlowers = startingDots;
		var minDistBetweenNature = Math.round(Math.sqrt(startingDots));
		var allLocations = this.mapList.slice();
		this.shuffle(allLocations);

		var nature = { 
			"tree": [],
			"flower": []
		}

		for(let i = 0; i < numStartingTrees; i++)
		{
			var badCell = true;
			var cell;
			
			while(badCell && allLocations.length > 0) {
				cell = allLocations.pop();
				badCell = this.natureIsForbidden(cell, "tree") || !this.minDistanceApart(cell, nature.tree, minDistBetweenNature);
				if(badCell) { allLocations.unshift(cell); }
			}

			if(badCell) { break; }

			cell.nature = 'tree';
			nature.tree.push(cell);
		}

		for(let i = 0; i < numStartingFlowers; i++)
		{
			var badCell = true;
			var cell;
			while(badCell && allLocations.length > 0) {
				cell = allLocations.pop();
				badCell = this.natureIsForbidden(cell, "flower") || !this.minDistanceApart(cell, nature.flower, minDistBetweenNature)
			}

			if(badCell) { break; }

			cell.nature = 'flower';
			nature.flower.push(cell);
		}

		// now grow this until we have enough
		var targetTrees = Math.floor((0.8 + 0.4*this.cfg.rng.map()) * this.cfg.treePercentage * (this.cfg.totalTileCount));
		var targetFlowers = Math.floor((0.8 + 0.4*this.cfg.rng.map()) * this.cfg.flowerPercentage * (this.cfg.totalTileCount));

		var totalNum = { 
			'tree': nature.tree.length,
			'flower': nature.flower.length
		};

		var numTries = 0;
		var maxTries = 100;

		while(numTries < maxTries)
		{
			var type = 'tree';
			var enoughTrees = (totalNum.tree >= targetTrees);
			var enoughFlowers = (totalNum.flower >= targetFlowers);
			if(this.cfg.rng.map() <= 0.5 || enoughTrees) { type = 'flower'; }

			numTries += 1;

			if(enoughTrees && enoughFlowers) { break; }
			if(nature[type].length <= 0) { break; }

			var idx = Math.floor(this.cfg.rng.map() * nature[type].length);
			var loc = nature[type][idx];
			var nbs = this.getEmptyNeighbors(loc, ["nature", "road", "landmark"]);

			for(let i = nbs.length-1; i >= 0; i--)
			{
				if(this.natureIsForbidden(nbs[i], type)) {
					nbs.splice(i,1);
				}
			}

			var completelySurrounded = (nbs.length == 0);
			if(completelySurrounded) { 
				nature[type].splice(idx, 1);
				continue;
			}

			var newLoc = nbs[Math.floor(this.cfg.rng.map() * nbs.length)];
			newLoc.nature = type;
			nature[type].push(newLoc);
			totalNum[type] += 1;

		}
	},

	createLiarsCouncil: function()
	{
		if(!this.cfg.expansions.liarsCouncil) { return; }

		var allLocs = this.mapList.slice();
		this.shuffle(allLocs);

		var numFalseSquares = Math.round( (this.cfg.rng.map()*0.33 + 0.33)*this.cfg.playerCount )
		var numTruthSquares = Math.round( (this.cfg.rng.map()*0.33 + 0.33)*this.cfg.playerCount )

		this.FALSE_SQUARES = [];
		for(let i = 0; i < numFalseSquares; i++)
		{
			var square = allLocs.pop();
			if(square == this.TREASURE) { continue; }
			square.falseSquare = true;
			this.FALSE_SQUARES.push(square);
		}

		this.TRUTH_SQUARES = [];
		for(let i = 0; i < numTruthSquares; i++)
		{
			var square = allLocs.pop();
			if(square == this.TREASURE) { continue; }
			square.truthSquare = true;
			this.TRUTH_SQUARES.push(square);
		}

		if(this.cfg.debugging) {
			console.log("FALSE/TRUTH SQUARES");
			console.log(this.FALSE_SQUARES);
			console.log(this.TRUTH_SQUARES);
		}
	},

	createTinyTreasures: function()
	{
		if(!this.cfg.expansions.tinyTreasures) { return; }

		var allLocs = this.mapList.slice();
		this.shuffle(allLocs);

		this.TINY_TREASURES = [];

		for(let i = 0; i < this.cfg.playerCount; i++)
		{
			var square = allLocs.pop();
			if(square == this.TREASURE) { continue; }
			square.tinyTreasure = true;
			this.TINY_TREASURES.push(square);
		}

		if(this.cfg.debugging) { console.log("TINY TREASURES"); console.log(this.TINY_TREASURES); }
	},

	natureIsForbidden: function(cell, type)
	{
		if(!TERRAIN_DATA[cell.terrain].nature.includes(type)) { return true; }
		if(cell.nature != '') { return true; } // already has nature check ... is this okay?
		if(cell.road != '') { return true; }
		if(cell.landmark != '') { return true; }
		return false;
	},

	minDistanceApart: function(cell, list, dist)
	{
		for(let i = 0; i < list.length; i++)
		{
			var newCell = list[i];
			if(this.distBetweenCells(cell, newCell) < dist) { return false; }
		}
		return true;
	},

	distBetweenCells: function(a, b)
	{
		return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
	},

	createStones: function() {
		if(this.cfg.debugging) { console.log(" => Creating stones ... "); }

		var noStonesAllowed = (!this.cfg.hintCategories.includes("stones"));
		if(noStonesAllowed) { return; }

		var numStones = Math.floor( (0.8 + this.cfg.rng.map()*0.4) * this.cfg.stonesPercentage * (this.cfg.width * this.cfg.height));

		var stonesPerNumber = [0,0,0,0,0];
		stonesPerNumber[4] = 1 + Math.round(this.cfg.rng.map());
		stonesPerNumber[3] = Math.floor((0.1 + 0.1*this.cfg.rng.map()) * numStones);
		stonesPerNumber[2] = Math.floor((0.2 + 0.2*this.cfg.rng.map()) * numStones);
		stonesPerNumber[1] = numStones - stonesPerNumber[2] - stonesPerNumber[3] - stonesPerNumber[4];

		if(this.cfg.inkFriendly) {
			stonesPerNumber[3] += stonesPerNumber[4];
			stonesPerNumber[4] = 0;
		}

		for(let i = 1; i < stonesPerNumber.length; i++)
		{
			for(let a = 0; a < stonesPerNumber[i]; a++) 
			{
				cell = null;
				badCell = true;

				while(badCell) {
					cell = this.getRandomCell(this.cfg.rng.map);
					badCell = (cell.stones > 0);
				}

				cell.stones = i;
			}
		}
	},

	createRoads: function() {
		if(this.cfg.debugging) { console.log(" => Creating roads ... "); }

		var noRoadsAllowed = (!this.cfg.hintCategories.includes("roads"));
		if(noRoadsAllowed) { return; }

		var numRoadSequences = Math.max(Math.floor(this.cfg.roadPercentage * (0.6 + 0.4*this.cfg.rng.map()) * Math.pow(this.cfg.totalTileCount, 0.5)), 1);
		var maxRoadLength = Math.max( Math.floor(0.8 * Math.pow(this.cfg.totalTileCount, 0.5)), 4); 

		var edgeCells = this.generateListWithEdgeLocations();
		var landmarkCells = this.generateListWithLandmarkLocations();
		var startCells = edgeCells;
		startCells['landmark'] = landmarkCells;

		this.roadLocations = [];

		// NOTE TO SELF: I've found this to be the cleanest and easiest way to get the correct orientation for corners in roads
		// No calculating, no checks, no annoying tricks, just a lookup in a fixed matrix
		// (And if it shows the result 'X' somewhere, I know there must be a terrible bug in the code and can easily find it)
		var cornerMatrix = [
			['X',   0, 'X',   3],
			[  2, 'X',   3, 'X'],
			['X',   1, 'X',   2],
			[  1, 'X',   0, 'X']
		];

		var locationCategories = ['left', 'top', 'right', 'bottom', 'landmark'];
		this.shuffle(locationCategories);

		var curLocationIndex = 0;
		
		for(let i = 0; i < numRoadSequences; i++)
		{
			var curLocation = locationCategories[curLocationIndex];
			curLocationIndex = (curLocationIndex + 1) % locationCategories.length;

			if(startCells[curLocation].length <= 0) { continue; }
			
			var oldCell;
			var badCell;
			do {
				oldCell = startCells[curLocation].pop();
				badCell = oldCell.road != '' || !this.minDistanceApart(oldCell, this.roadLocations, 3);
			} while(badCell && startCells[curLocation].length > 0);

			if(startCells[curLocation].length <= 0) { continue; }
	
			var curRoad = [oldCell];
			var roadDirs = [this.getDirFromEdge(oldCell)];
			var tempMinRoadLength = Math.max(Math.round(0.4 * Math.sqrt(this.cfg.totalTileCount)), 3);
			var tempMaxRoadLength = Math.min(Math.floor(this.cfg.rng.map() * maxRoadLength) + tempMinRoadLength, maxRoadLength);

			while(true)
			{
				var nbs = this.getEmptyNeighbors(oldCell, ["road", "landmark"]);
				if(nbs.length == 0) { break; }

				var newCell = nbs[Math.floor(this.cfg.rng.map() * nbs.length)];
				var dir = this.findDirBetweenCells(oldCell, newCell);
				var lastDir = roadDirs[roadDirs.length - 1];
				curRoad.push(newCell);
				roadDirs.push(dir);

				var roadData = this.calculateRoadData(lastDir, dir, cornerMatrix, oldCell);

				oldCell.road = roadData.type;
				oldCell.roadOrient = roadData.orient;

				oldCell = newCell;
				this.roadLocations.push(oldCell);

				if(oldCell.isEdge && curRoad.length >= tempMinRoadLength) { break; }
				if(curRoad.length >= tempMaxRoadLength) { break; }
			}

			// wherever the road ended, make that a dead end
			// (Exception: neatly running back into the edge again with a straight path)
			oldCell.road = 'dead end';
			oldCell.roadOrient = -roadDirs[roadDirs.length - 1];

			if(oldCell.isEdge) {
				var lastDir = roadDirs[roadDirs.length - 1];
				var dir = (this.getDirFromEdge(oldCell) + 2) % 4;
				var roadData = this.calculateRoadData(lastDir, dir, cornerMatrix, oldCell);

				oldCell.road = roadData.type;
				oldCell.roadOrient = roadData.orient;
			}

			// if the road ended up too short, just completely delete and undo
			var tooShort = (curRoad.length < tempMinRoadLength);
			if(tooShort) {
				for(let a = 0; a < curRoad.length; a++) {
					curRoad[a].road = '';
					curRoad[a].roadOrient = -1;
					this.roadLocations.pop();
				}
				i -= 1;
			}
		}
	},

	getDirFromEdge: function(cell)
	{
		var dir = 0;
		if(cell.x == 0) { dir = 0; }
		else if(cell.x == (this.cfg.width-1)) { dir = 2; }
		else if(cell.y == 0) { dir = 3; }
		else if(cell.y == (this.cfg.height-1)) { dir = 1; }
		return dir;
	},

	calculateRoadData: function(lastDir, dir, matrix, cell)
	{
		var roadType = 'straight';
		if(dir != lastDir) { roadType = 'corner'; }

		var orient = lastDir;
		if(roadType == 'corner') {
			orient = matrix[lastDir][dir];
		}

		// the road didn't start from the edge? always a dead end
		if(orient == 'X' || cell.landmark != '') { 
			roadType = 'dead end';
			orient = -((dir + 2) % 4);
		}

		return {
			'type': roadType,
			'orient': orient
		}
	},

	findDirBetweenCells: function(oldCell, newCell)
	{
		var vector = [newCell.x - oldCell.x, newCell.y - oldCell.y];
		if(vector[0] == 1) { return 0; }
		else if(vector[0] == -1) { return 2; }
		else if(vector[1] == -1) { return 1; }
		return 3;
	},

	createLandmarks: function() {
		if(this.cfg.debugging) { console.log(" => Creating landmarks ... "); }

		this.landmarkCells = {}; // general dictionary used to quickly access which landmarks are where during hint generation

		var noLandmarksAllowed = (!this.cfg.hintCategories.includes("landmarks"))
		if(noLandmarksAllowed) { return; }

		var landmarks = LANDMARKS.slice();
		this.shuffle(landmarks);
		if(this.cfg.rng.map() <= 0.5) { landmarks.pop(); }

		var minDistBetweenLandmarks = 2;
		var placedLandmarks = [];
		for(let i = 0; i < landmarks.length; i++)
		{
			cell = null;
			badCell = true;

			while(badCell) {
				cell = this.getRandomCell(this.cfg.rng.map);
				badCell = !this.minDistanceApart(cell, placedLandmarks, minDistBetweenLandmarks);
			}

			var type = landmarks[i];
			cell.landmark = type;
			placedLandmarks.push(cell);

			this.landmarkCells[type] = cell;
		}
	},

	getRandomCell: function(RNG) {
		var x = Math.floor(RNG() * this.cfg.width);
		var y = Math.floor(RNG() * this.cfg.height);
		return this.map[x][y];
	},

	getAverageNoise: function(x, y, zoom) {
		const weight = 0.25
		const z = (this.cfg.cellSize / zoom);

		var noiseVal = weight*noise.simplex2(x*z, y*z);
		noiseVal += weight*noise.simplex2((x+1)*z, y*z);
		noiseVal += weight*noise.simplex2((x+1)*z, (y+1)*z);
		noiseVal += weight*noise.simplex2(x*z, (y+1)*z);

		return noiseVal;
	},

	/*
		FORWARD (INSTRUCTION GENERATION)

		Algorithm:
		 - Pick a location
		 - Generate _all_ hints for it
		 - Randomly remove hints from it and check ...
		 - ... until it doesn't point to 1 location anymore, but multiple
		 - The previous state was our perfect solution!

		Pros:
		 - Ensures a solution
		 - No contradictory hints
		 - No retries necessary
		 - Quite easy to modify to your needs

		Cons:
		 - More expensive to calculate
	*/	
	generateInstructionsForward: function() {
		var allLocations = this.mapList.slice();
		var location = allLocations[Math.floor(this.cfg.rng.hints() * allLocations.length)];

		if(this.cfg.debugging) { console.log("TREASURE LOCATION"); console.log(location); }

		var hints = {};
		for(category in this.AVAILABLE_HINTS) {
			hints[category] = [];

			for(let i = 0; i < this.AVAILABLE_HINTS[category].length; i++) {
				var originalHint = this.AVAILABLE_HINTS[category][i];

				// This array starts with ONE entry (with exactly enough space to hold all params)
				// Over time, this entry gets duplicated to create ALL possible combinations of options
				var fixedValues = [Array(originalHint.params.length)];	

				// Now generate all these combinations of input parameters
				for(let p = 0; p < originalHint.params.length; p++) {
					var param = originalHint.params[p];

					if("variable" in param) { continue; }

					// generate list of all values THIS parameter can take on
					var list = [];
					var isNegated = ("negated" in param);

					var mustBeDifferent = ("different" in param);
					if(mustBeDifferent) { originalHint.different = true; }

					var mustBeHigher = ("mustbehigher" in param);
					var realValue = 'unknown';

					if(param.type == "discrete") {
						list = LISTS[param.property].slice();
						realValue = location[param.property];

						// SPECIAL CASE: landmarks might not all be included, so only remember those that ARE
						if(param.property == 'landmark') {
							list = Object.keys(this.landmarkCells);
						}
					} else if(param.type == "bounds") {
						let tempMin = param.min;
						let tempMax = param.max;

						// with basic hints, stuff is within at most 1 space(s), because 2 and 3 are just too hard to calculate for new players
						if(!this.cfg.advancedHints) { tempMax = Math.min(tempMax, 1); }

						for(let a = tempMin; a <= tempMax; a++) {
							list.push(a);
						}
					}

					// if negated, it removes the one option that is actually true on this cell
					if(isNegated) {
						this.handleExclusions(list, [realValue])
					}

					// Now add this value to all the existing fixedValues to create all possible combinations
					var newFixedValues = [];
					
					for(let a = 0; a < list.length; a++)
					{
						for(let b = 0; b < fixedValues.length; b++) {
							var newVal = fixedValues[b].slice();
							newVal[p] = list[a];

							if(mustBeDifferent && this.arrayHasDuplicates(newVal)) { continue; } // doesn't catch duplicates between values yet to be calculated
							if(mustBeHigher) {
								if(newVal[p-1] >= newVal[p]) { continue; } // bound hints want LOW,HIGH order, never the other way around
								if(newVal[p-1] > realValue || newVal[p] < realValue) { continue; } // and the bounds must obviously be CORRECT for the real value on the cell
							}

							newFixedValues.push(newVal);
						}
					}

					fixedValues = newFixedValues;
				}

				// And finally actually BUILD the hints according to these combinations
				for(let a = 0; a < fixedValues.length; a++) {
					var hint = structuredClone(originalHint);
					hint.final_values = fixedValues[a];
					this.buildHint(hint, location, 'calculate');

					if("different" in hint && this.arrayHasDuplicates(hint.final_values)) { continue; }
					if(hint.error) { continue; }

					hints[category].push(hint);
				}
			}
		}

		if(this.cfg.debugging) {
			console.log("ALL HINTS");
			console.log(structuredClone(hints));
		}

		for(category in hints) {
			this.shuffle(hints[category]);
		}

		// hard remove stuff from hint IDs that already have enough 
		var hintsById = {};
		var maxHintsPerId = 3;
		for(category in hints) {
			for(let i = hints[category].length-1; i >= 0; i--)
			{
				var hint = hints[category][i];
				var id = hint.id;
				if(!(id in hintsById)) {
					hintsById[id] = 0;
				}

				var maxHints = maxHintsPerId;
				if("duplicates" in hint) { maxHints = hint.duplicates; }

				if(hintsById[id] >= maxHints) {
					hints[category].splice(i,1);
				}

				hintsById[id] += 1;
			}
		}

		if(this.cfg.debugging) {
			console.log("REDUCED LIST OF HINTS");
			console.log(structuredClone(hints));
		}

		// now do the same thing as with "backward" => add hints one at a time until only one location remains
		var multipleSolutions = true;
		var validLocations = this.mapList.slice();
		var finalHints = [];
		var totalNumHints = 0;

		var categories = Object.keys(hints);
		var categoryCounter = 0;

		var leftoverHints = structuredClone(hints);

		while(multipleSolutions)
		{
			var category = categories[categoryCounter];
			var availableHints = hints[category];

			var noHintsAtAll = this.countNumElementsInDictionary(hints) <= 0;
			if(noHintsAtAll) { break; }

			var noHintsInCategory = (availableHints.length <= 0);
			if(noHintsInCategory) {
				categoryCounter = (categoryCounter + 1) % categories.length;
				continue;
			}

			var newHint = structuredClone(availableHints.pop());
			var prevNumSolutions = validLocations.length;
			var oldValidLocations = validLocations.slice();

			this.removeInvalidLocationsDueToHint(validLocations, newHint);

			var hintDidNothing = (Math.abs(prevNumSolutions - validLocations.length) < this.cfg.minImpactPerHint);
			if(hintDidNothing) { 
				validLocations = oldValidLocations; 
				continue; 
			}

			this.removeForbiddenHints(hints, newHint);

			if(!(category in finalHints)) { finalHints[category] = []; }

			finalHints[category].push(newHint);
			categoryCounter = (categoryCounter + 1) % categories.length;
			totalNumHints += 1;
			multipleSolutions = (validLocations.length > 1);
		}

		if(validLocations.length != 1) {
			this.hintsGenerationFail = true;
			return;
		}

		if(totalNumHints < this.cfg.playerCount*this.cfg.minHintsPerPlayer) {
			this.hintsGenerationFail = true;
			return;
		}

		if(totalNumHints > this.cfg.playerCount*this.cfg.maxHintsPerPlayer)
		{
			this.hintsGenerationFail = true;
			return;
		}

		if(this.cfg.debugging) { console.log("FINAL HINTS"); console.log(finalHints); }

		this.hints = finalHints;
		this.treasure = location;

		if(this.cfg.expansions.theLostRiddles) {

			// a very expensive way to remove all hints (from the reduced list) that are actually used
			// but didn't see anything better at the moment
			// at least it's categorized, which significantly reduces the lists we need to traverse
			var finalLeftoverHints = [];
			for(category in leftoverHints)
			{
				for(let i = 0; i < leftoverHints[category].length; i++)
				{
					if(!(category in this.hints)) { continue; }
					for(let a = 0; a < this.hints[category].length; a++)
					{
						if(this.hints[category][a].id == leftoverHints[category][i].id) { continue; }
						finalLeftoverHints.push( leftoverHints[category][i] );
					}
				}
			}

			this.shuffle(finalLeftoverHints);

			var maxNumLostRiddles = 30;
			while(finalLeftoverHints.length > maxNumLostRiddles) {
				finalLeftoverHints.pop();
			}

			this.LOST_RIDDLES = finalLeftoverHints;

			if(this.cfg.debugging) {
				console.log("THE LOST RIDDLES");
				console.log(this.LOST_RIDDLES);
			}
		}
	},

	countNumElementsInDictionary: function(dict)
	{
		var sum = 0;
		for(key in dict) {
			sum += dict[key].length;
		}
		return sum;
	},

	findAllValidLocationsWithHints: function(hints)
	{
		var locs = this.mapList.slice();
		var arr = [];

		for(let i = 0; i < locs.length; i++) 
		{
			var loc = locs[i];
			var allMatch = true;
			
			for(let h = 0; h < hints.length; h++) 
			{
				var newHint = structuredClone(hints[h]);
				this.buildHint(newHint, loc, 'check');
				var hintsMatch = this.matchHints(newHint, hints[h]);
				if(hintsMatch) { continue; }
				
				allMatch = false;
				break; 
			}

			if(!allMatch) { continue; }
			arr.push(loc);
		}

		return arr;
	},

	/*
		BACKWARD (INSTRUCTION GENERATION)

		Loop:
		 - Pick random hint type (alternate categories, no doubles)
		 - Completely generate it (fill in random values, build final text)
		 - Cross off any locations that don't fit this new hint
		 - 1 location remains? Solution found
		 - 0 locations remain? Solution impossible

		Optimizations:
		 - Keep track of fixedData to prevent contradictory random hints
		 - Force number of hints within a playable range

		Pros:
		 - Simple to code and understand
		 - Very fast to execute
		 - Solutions can be _anything_

		Cons:
		 - Needs many (re)tries before a solution is found
		 - As solutions are so diverse, you can also end up with really obvious/stupid ones
	*/	
	generateInstructionsBackward: function() {
		// contains info about things we DEFINITELY know about the final location while generating hints
		// (reduces change of impossible hints, makes algorithm faster/smoother)
		this.fixedData = {
			'terrain': 'unknown',
			'nature': 'unknown',
			'stones': 'unknown',
			'landmark': 'unknown',
			'road': 'unknown'
		}; 

		var hintsCopy = structuredClone(this.AVAILABLE_HINTS);

		var categories = Object.keys(hintsCopy);
		categories = this.shuffle(categories);

		var hints = {};

		var validLocations = this.mapList.slice();

		var categoryCounter = 0;

		var noSolution = false;
		var hasSolution = false;
		var solutionTooSmall = false;
		var solutionTooBig = false;

		while(true)
		{
			var curCategory = categories[categoryCounter];
			var possibleHints = hintsCopy[curCategory];

			var noHintsLeftInTotal = (this.countNumElementsInDictionary(hintsCopy) <= 0);
			if(noHintsLeftInTotal) { 
				hasSolution = false; 
				break; 
			}

			var noHints = (possibleHints.length <= 0);
			if(noHints) { 
				categoryCounter = (categoryCounter + 1) % categories.length;
				continue; 
			}

			var chosenIndex = Math.floor(this.cfg.rng.hints() * possibleHints.length);
			var chosenHint = structuredClone(possibleHints[chosenIndex]);

			this.buildHint(chosenHint, null, "random");

			var isSelfDestructHint = ("once" in chosenHint);
			if(isSelfDestructHint) { hintsCopy[curCategory].splice(chosenIndex, 1); }

			var hintErrored = chosenHint.error;
			if(hintErrored) { 
				hintsCopy[curCategory].splice(chosenIndex, 1);
				continue; 
			}

			var oldValidLocations = validLocations.slice();
			var prevNumSolutions = validLocations.length;
			this.removeInvalidLocationsDueToHint(validLocations, chosenHint);

			var hintDidNothing = (Math.abs(prevNumSolutions - validLocations.length) < this.cfg.minImpactPerHint);
			if(hintDidNothing) { 
				validLocations = oldValidLocations; 
				hintsCopy[curCategory].splice(chosenIndex, 1);
				continue; 
			}

			if(!(curCategory in hints)) { hints[curCategory] = []; }

			hints[curCategory].push(chosenHint);

			this.removeForbiddenHints(hintsCopy, chosenHint)

			categoryCounter = (categoryCounter + 1) % categories.length;

			noSolution = (validLocations.length <= 0);
			hasSolution = (validLocations.length == 1);

			var numHints = this.countNumElementsInDictionary(hints);
			solutionTooSmall = (numHints < this.cfg.playerCount*this.cfg.minHintsPerPlayer);
			solutionTooBig = (numHints >= this.cfg.playerCount*this.cfg.maxHintsPerPlayer);

			if(hasSolution && solutionTooSmall) { hasSolution = false; break; }
			if(noSolution) { break; }
			if(solutionTooBig) { break; }
			if(hasSolution) { break; }
			
		}

		if(!hasSolution) { 
			this.hintsGenerationFail = true; 
			return;
		}

		this.hints = hints;
		this.treasure = validLocations[0];
	},

	removeForbiddenHints: function(list, hint)
	{
		if(!("forbids" in hint)) { return; }

		var cat = hint.category;
		for(let i = 0; i < hint.forbids.length; i++) 
		{
			var id = hint.forbids[i];
			for(let a = 0; a < list[cat].length; a++) {
				if(list[cat][a].id != id) { continue; }
				list[cat].splice(a, 1);
				break;
			}
		}
	},

	generateListWithLandmarkLocations: function() {
		var arr = [];
		for(landmarkName in this.landmarkCells) {
			arr.push(this.landmarkCells[landmarkName]);
		}
		return arr;
	},

	// Not very efficient, but this function is only called ONCE at MOST, so ... 
	generateListWithEdgeLocations: function() {
		var obj = {
			'left': [],
			'top': [],
			'right': [],
			'bottom': []
		};

		for(var x = 0; x < this.cfg.width; x++) {
			obj.top.push(this.map[x][0]);
			obj.bottom.push(this.map[x][this.cfg.height-1]);
		}

		for(var y = 0; y < this.cfg.height; y++) {
			obj.left.push(this.map[0][y]);
			obj.right.push(this.map[this.cfg.width-1][y]);
		}
		return obj;
	},

	// For each location, we build HINTS again (following the fixed values we already have)
	// Then check if the final text is identical to the original hint text
	removeInvalidLocationsDueToHint: function(arr, hint) 
	{
		for(let i = arr.length-1; i >= 0; i--)
		{
			var cell = arr[i];
			var newHint = structuredClone(hint);
			this.buildHint(newHint, cell, "check");

			var hintsMatch = this.matchHints(newHint, hint);
			if(!hintsMatch) { arr.splice(i, 1); }
		}
	},

	// a is the new hint (with newly calculated values based on its cell)
	// b is the original version
	matchHints: function(a, b)
	{
		var type = a.type;
		var incompatibleHints = (type != b.type);
		if(incompatibleHints) { return false; }

		var variable = [];
		if("variable" in a) { variable = a.variable; }

		if(type == 'exact') 
		{
			return this.arraysAreEqual(a.final_values, b.final_values);
		} 
		else if(type == 'negated')
		{
			return this.arraysAreNonEqual(a.final_values, b.final_values);
		} 
		else if(type == 'single')
		{
			return this.arraysOneMatch(a.final_values, b.final_values);
		}
		else if(type == 'greaterthan')
		{
			var idx = variable[0];
			return a.final_values[idx] >= b.final_values[idx];
		}
		else if(type == 'lessthan')
		{
			var idx = variable[0];
			return a.final_values[idx] <= b.final_values[idx];
		} 
		else if(type == 'bounds')
		{
			var low = variable[0];
			var high = variable[1];
			return a.final_values[0] >= b.final_values[low] && a.final_values[1] <= b.final_values[high]
		}
	},

	/*
		
		Given a hint object, builds the final values and text
		Three different targets:
		 - "Random": fills in the values completely randomly, used in backward algorithm only
		 - "Check": used for _checking_ if a cell matches a hint
		 - "Calculate": calculates the values from the cell itself, used in forward algorithm only

		The check and calculate are _mostly_ the same, but especially on "negated" or "choice" hints,
		it's faster to do handle things slightly differently 

	*/
	buildHint: function(hint, cell = null, target = 'check')
	{
		var values = [];
		var knownValues = [];
		if ("final_values" in hint) { knownValues = hint.final_values; }
		
		var calculate = (target == "calculate") && (cell != null);
		var check = (target == "check") && (cell != null);
		var randomize = (target == "random");

		if(calculate || check) { values = knownValues.slice(); }

		var baseText = hint.text;
		var failed = false; // if true, it displays an alternative test
		var error = false; // if true, the complete hint is invalid and discarded

		var noValuesSetYet = (values.length == 0);
		if(noValuesSetYet) {
			for(let i = 0; i < 10; i++) {
				if(!hint.text.includes("<" + i + ">")) { continue; }
				values.push(0);
			}
		}

		switch(hint.id) 
		{
			/* TERRAIN HINTS */
			case "terrain_wrong":
				if(check) { 
					values[0] = cell.terrain;
				} else if(calculate) {
					// do nothing
				} else { 
					values[0] = this.getRandomTerrain([this.fixedData.terrain]); 
				}
				break;

			case "terrain_wrong_choice":
				if(check) {
					values[0] = cell.terrain;
					values[1] = cell.terrain;
				} else if(calculate) {
					// just copy knownValues, happens automatically
				} else {
					var terrainA = this.getRandomTerrain([this.fixedData.terrain]);
					var terrainB = this.getRandomTerrain([this.fixedData.terrain, terrainA]);

					values[0] = terrainA;
					values[1] = terrainB;
				}

				break;

			case "terrain_choice":
				if(check || calculate) { 
					values[0] = cell.terrain;
					values[1] = cell.terrain;
					if(calculate) { values[1] = knownValues[1]; }
				} else { 
					var terrainA = this.getRandomTerrain();
					if(this.fixedData.terrain != 'unknown') { 
						terrainA = this.fixedData.terrain; 
					} else { 
						this.fixedData.terrain = terrainA; 
					}

					values[0] = terrainA; 
					values[1] = this.getRandomTerrain([terrainA]); 
				}
				break;

			case "terrain_same":
				var bool = false;

				if(check || calculate) {
					bool = this.hasNeighborWith({
						"cell": cell,
						"property": "terrain",
						"value": cell.terrain,
					})
				} else {
					bool = Math.random() <= 0.75
				}

				values[0] = this.createNotString(bool);
				break;

			case "terrain_same_neighbors":
				var value
				
				if(check || calculate) {
					value = this.countMatchingNeighbors({
						"cell": cell,
						"property": "terrain"
					})
				} else {
					value = Math.floor(this.cfg.rng.hints() * 4);
				}

				if(value == 0 || value == 1) { value = 'NO'; }
				values[0] = value;

				break;

			case "terrain_one_until_diff":
				var bool = false;

				if(check || calculate) {

					for(let i = 0; i < cell.nbs.length; i++)
					{
						if(cell.nbs[i].terrain == cell.terrain) { continue; }
						bool = true;
						break;
					}

				} else {
					bool = Math.random() <= 0.5;
				}

				values[0] = this.createNotString(bool);

				break;

			case "terrain_count":
				if(check || calculate) {
					var count = this.countTiles({
						"cell": cell,
						"property": "terrain",
						"value": knownValues[1],
						"radius": knownValues[2]
					});
					values[0] = count;

				} else {
					var terrainToCheck = this.getRandomTerrain();
					values[1] = terrainToCheck;

					var searchRadius = this.getRandomSearchRadius(hint.params[2]);
					values[2] = searchRadius;

					var numTiles = Math.floor(this.cfg.rng.hints()*this.getMaxTilesInRadius(searchRadius));
					values[0] = numTiles;
					
				}
				break;

			case "terrain_dist":
				if(check || calculate) {
					var dist = this.findClosest({
						"cell": cell,
						"property": "terrain",
						"value": knownValues[0]
					});
					values[1] = this.modifyHintValue(dist, hint, target);
				} else {
					var numTiles = Math.floor(this.cfg.rng.hints() * 6) + 2; // "at most", so higher numbers preferred
					var terrainToCheck = this.getRandomTerrain();
					values[0] = terrainToCheck;
					values[1] = numTiles;
				}

				break;

			case "terrain_type_diversity":
				if(check || calculate) {
					var tiles = this.getTilesRadius({
						"cell": cell,
						"radius": knownValues[1]
					});

					var types = {};
					for(let i = 0; i < tiles.length; i++) {
						var key = tiles[i].terrain;
						types[key] = true;
					}

					var diversity = Object.keys(types).length;
					values[0] = this.modifyHintValue(diversity, hint, target);

				} else {
					var searchRadius = this.getRandomSearchRadius(hint.params[1]);
					values[1] = searchRadius;

					var maxPossible = Math.min(TERRAINS.length, this.getMaxTilesInRadius(searchRadius));

					var numDifferentTerrains = Math.floor(this.cfg.rng.hints() * (maxPossible-2)) + 1; // "at least", so lower
					values[0] = numDifferentTerrains;
				}

				break;

			case "terrain_count_diversity":
				if(check || calculate) {
					var tiles = this.getTilesRadius({
						"cell": cell,
						"radius": knownValues[1]
					});

					var sum = 0;
					for(let i = 0; i < tiles.length; i++) {
						if(tiles[i].terrain == cell.terrain) { continue; }
						sum += 1;
					}

					values[0] = this.modifyHintValue(sum, hint, target);

				} else {
					var searchRadius = this.getRandomSearchRadius(hint.params[1]);
					values[1] = searchRadius;

					var numDifferentTiles = Math.floor(this.cfg.rng.hints() * (this.getMaxTilesInRadius(searchRadius) - 1)) + 1; // "at most", so go high
					values[0] = numDifferentTiles;
				}

				break;

			case "terrain_new":
				if(check || calculate) {
					var dist = this.findClosest({
						"cell": cell,
						"property": "terrain",
						"value": knownValues[0]
					});

					values[1] = this.modifyHintValue(dist, hint, target);
				} else {
					var randTerrain = this.getRandomTerrain();
					values[0] = randTerrain;

					var searchRadius = Math.floor(this.cfg.rng.hints() * 4) + 2;
					values[1] = searchRadius;
				}

				break;

			case "terrain_new_first":
				if(check || calculate) {
					var allTerrains = TERRAINS.slice();

					var closestTerrain = "";
					var closestDist = Infinity;

					for(let i = 0; i < allTerrains.length; i++) {
						if(allTerrains[i] == cell.terrain) { continue; }

						var dist = this.findClosest({
							"cell": cell,
							"property": "terrain",
							"value": allTerrains[i]
						})
						if(dist >= closestDist) { continue; }

						closestTerrain = allTerrains[i];
						closestDist = dist;
					}

					values[0] = closestTerrain;
					values[1] = closestTerrain;

					if(calculate) { values[1] = knownValues[1]; }	

				} else {
					var terrainA = this.getRandomTerrain([this.fixedData.terrain]);
					var terrainB = this.getRandomTerrain([this.fixedData.terrain, terrainA]);
					values[0] = terrainA;
					values[1] = terrainB;
				}

				break;

			/* NATURE HINTS */
			case "nature_choice":
				if(check || calculate) { 
					values[0] = cell.nature;
					values[1] = cell.nature;

					if(calculate) { values[1] = knownValues[1]; }
				} else { 
					var natureA = this.getRandomNature();
					if(this.fixedData.nature != 'unknown') { 
						natureA = this.fixedData.nature; 
					} else { 
						this.fixedData.nature = natureA; 
					}

					values[0] = natureA; 
					values[1] = this.getRandomNature([natureA]); 
				}

				// only needed to make it look like a proper sentence to players
				if(values[0] == '') { values[0] = 'lack of nature'; }
				if(values[1] == '') { values[1] = 'lack of nature'; }

				break;

			case "nature_wrong":
				if(check) { 
					values[0] = cell.nature;
				} else if(calculate) {
					// do nothing
				} else { 
					var wrongNature = this.getRandomNature([this.fixedData.nature]);
					values[0] = wrongNature; 
				}

				if(values[0] == '') { values[0] = 'lack of nature'; }
				break;

			case "nature_same":
				var bool = false;

				if(check || calculate) {
					bool = this.hasNeighborWith({
						"cell": cell,
						"property": "nature",
						"value": cell.nature,
					})
				} else {
					bool = Math.random() <= 0.75
				}

				values[0] = this.createNotString(bool);
				break;

			case "nature_same_neighbors":
				var value
				
				if(check || calculate) {
					var num = this.countMatchingNeighbors({
						"cell": cell,
						"property": "nature"
					})
					value = num
				} else {
					value = Math.floor(this.cfg.rng.hints() * 4);
				}

				if(value == 0 || value == 1) { value = 'NO'; }
				values[0] = value;

				break;

			case "nature_dist":
				if(check || calculate) {
					var dist = this.findClosest({
						"cell": cell,
						"property": "nature",
						"value": "any" 
					});
					values[0] = this.modifyHintValue(dist, hint, target);
				} else {
					var randDist = Math.floor(this.cfg.rng.hints() * 6) + 2;
					values[0] = randDist;
				}

				break;

			case "nature_count":
				if(check || calculate) {
					var count = this.countTiles({
						"cell": cell,
						"property": "nature",
						"value": "any",
						"radius": knownValues[1]
					});
					values[0] = count;

				} else {
					var searchRadius = this.getRandomSearchRadius(hint.params[1]);
					values[1] = searchRadius;

					var numNature = Math.floor(this.cfg.rng.hints()*this.getMaxTilesInRadius(searchRadius));
					values[0] = numNature;

					
				}
				break;

			case "nature_soil":
				if(check || calculate) {
					var searchGroup = this.getTilesProperty({
						"property": "terrain",
						"value": cell.terrain
					});

					var count = this.countTiles({
						"group": searchGroup,
						"property": "nature",
						"value": "any"
					});

					values[0] = this.modifyHintValue(count, hint, target);
				} else {
					var numNature = Math.floor(this.cfg.rng.hints() * 5) + 1;
					values[0] = numNature;
				}

				break;

			case "nature_flower":
				if(check || calculate) {
					var count = this.countTiles({
						"cell": cell,
						"property": "nature",
						"value": "flower",
						"radius": knownValues[1]
					});
					values[0] = this.modifyHintValue(count, hint, target);
				} else {
					var searchRadius = this.getRandomSearchRadius(hint.params[1]);
					values[1] = searchRadius;

					var numFlowers = Math.floor(this.cfg.rng.hints() * (this.getMaxTilesInRadius(searchRadius)-1)) + 1; // "at most", higher numbers
					values[0] = numFlowers;
				}

				break;

			case "nature_tree":
				if(check || calculate) {
					var count = this.countTiles({
						"cell": cell,
						"property": "nature",
						"value": "tree",
						"radius": knownValues[1]
					});

					if(count == 0) { error = true; }

					values[0] = this.modifyHintValue(count, hint, target);
				} else {
					var searchRadius = this.getRandomSearchRadius(hint.params[1]);
					values[1] = searchRadius;

					var numTrees = Math.floor(this.cfg.rng.hints() * this.getMaxTilesInRadius(searchRadius)); // "at least", lower numbers
					values[0] = numTrees;
				}

				break;

			case "nature_compare":
				var stringA = "fewer";
				var stringB = "than";

				if(check || calculate) {
					var params = {
						"cell": cell,
						"property": "nature",
						"value": "tree",
						"radius": knownValues[2]
					}

					var numTrees = this.countTiles(params);

					params.value = "flower";
					var numFlowers = this.countTiles(params);

					if(numTrees == numFlowers) {
						stringA = "equally many";
						stringB = "as";
					} else if(numTrees > numFlowers) {
						stringA = "more";
					}

					

				} else {
					if(this.cfg.rng.hints() <= 0.5) { stringA = "more"; }
					values[2] = this.getRandomSearchRadius(hint.params[2]);
				}

				values[0] = stringA;
				values[1] = stringB;

				break;

			case "nature_adjacent_nature":
				var bool = true;

				if(check || calculate) {
					var dist = this.findClosest({
						"cell": cell,
						"property": "nature",
						"value": "any",
						"ignoreSelf": true
					});
					bool = (dist == 1);
				} else {
					bool = (this.cfg.rng.hints() <= 0.5);
				}

				values[0] = this.createNotString(bool);

				break;

			case "nature_twospaces_tree":
				var bool = true;

				if(check || calculate) {
					var dist = this.findClosest({
						"cell": cell,
						"property": "nature",
						"value": "tree"
					});
					bool = (dist <= 2);
				} else {
					bool = (this.cfg.rng.hints() <= 0.5);
				}

				values[0] = this.createNotString(bool);

				break;

			case "nature_twospaces_flower":
				var bool = true;

				if(check || calculate) {
					var dist = this.findClosest({
						"cell": cell,
						"property": "nature",
						"value": "flower"
					});
					bool = (dist <= 2);
				} else {
					bool = (this.cfg.rng.hints() <= 0.5);
				}

				values[0] = this.createNotString(bool);

				break;

			/* STONE HINTS */
			case 'stones_bounds':
				if(check) {
					values[0] = cell.stones;
					values[1] = cell.stones;

				} else if(calculate) {
					// do nothing

				} else {
					var stonesMin = LANDMARKS[0];
					var stonesMax = LANDMARKS[LANDMARKS.length - 1];

					var low = Math.floor(this.cfg.rng.hints() * (stonesMin - 1));
					low = Math.max(low, stonesMin);

					var high = low + Math.floor(this.cfg.rng.hints() * (stonesMax - low)) + 1;
					high = Math.min(high, stonesMax);

					if(this.fixedData.stones == 'unknown') { 
						this.fixedData.stones = Math.floor(0.5 * (low+high));
					}

					values[0] = low;
					values[1] = high;
				}

				break;

			case 'stones_wrong':
				if(check) {
					values[0] = cell.stones;
				} else if(calculate) {
					// do nothing
				} else {
					var wrongLandmark = this.getRandomStones([this.fixedData.stones]);
					values[0] = wrongLandmark;
				}

				break;

			case 'stones_wrong_choice':
				if(check) {
					values[0] = cell.stones;
					values[1] = cell.stones;
				} else if(calculate) {
					// do nothing
				} else {
					var wrongA = this.getRandomStones([this.fixedData.stones]);
					var wrongB = this.getRandomStones([this.fixedData.stones, wrongA]);

					values[0] = wrongA;
					values[1] = wrongB;
				}

				break;

			case "stones_same":
				var bool = false;

				if(check || calculate) {
					bool = this.hasNeighborWith({
						"cell": cell,
						"property": "stones",
						"value": cell.stones,
					})
				} else {
					bool = Math.random() <= 0.75
				}

				values[0] = this.createNotString(bool);
				break;

			case "stones_same_neighbors":
				var value
				
				if(check || calculate) {
					var num = this.countMatchingNeighbors({
						"cell": cell,
						"property": "stones"
					})
					value = num
				} else {
					value = Math.floor(this.cfg.rng.hints() * 4);
				}

				if(value == 0 || value == 1) { value = 'NO'; }
				values[0] = value;

				break;

			case 'stones_dist':
				if(check || calculate) {
					var dist = this.findClosest({
						"cell": cell,
						"property": "stones",
						"value": "any"
					});
					values[0] = this.modifyHintValue(dist, hint, target);
				} else {
					var numTiles = Math.floor(this.cfg.rng.hints() * 5) + 2; // "at most", so a bit higher
					values[0] = numTiles;
				}

				break;

			case 'stones_count':
				if(check || calculate) {
					var count = this.countTiles({
						"cell": cell,
						"property": "stones",
						"value": "any",
						"radius": knownValues[1]
					});

					if(count == 0) { error = true; }

					values[0] = this.modifyHintValue(count, hint, target);

				} else {
					var searchRadius = this.getRandomSearchRadius(hint.params[1]);
					values[1] = searchRadius;

					var numLandmarks = Math.floor(this.cfg.rng.hints()*this.getMaxTilesInRadius(searchRadius)); // "at least", so a bit lower
					values[0] = numLandmarks;
				}

				break;

			case 'stones_sum':
				if(check || calculate) {
					var sum = this.countTiles({
						"cell": cell,
						"property": "stones",
						"radius": knownValues[0],
						"useValue": true
					});
					values[1] = this.modifyHintValue(sum, hint, target);

				} else {
					var searchRadius = this.getRandomSearchRadius(hint.params[0]);
					values[0] = searchRadius;

					var maxNumStones = LANDMARKS[LANDMARKS.length - 1];
					var randSum = Math.floor(this.cfg.rng.hints()*this.getMaxTilesInRadius(searchRadius)*maxNumStones); // "at most", so higher
					values[1] = randSum;

					
				}

				break;

			case "stones_adjacent_stones":
				var bool = true;

				if(check || calculate) {
					var dist = this.findClosest({
						"cell": cell,
						"property": "stones",
						"value": "any",
						"ignoreSelf": true
					});
					bool = (dist == 1);
				} else {
					bool = (this.cfg.rng.hints() <= 0.5);
				}

				values[0] = this.createNotString(bool);

				break;

			/* GENERAL HINTS */
			case "general_horizontal":
				var dir = 'right';
				if(check || calculate) {
					if(cell.x < 0.5*this.cfg.width) {
						dir = 'left';
					}
				} else {
					if(this.cfg.rng.hints() <= 0.5) {
						dir = 'left';
					}
				}
				values[0] = dir;

				break;

			case "general_vertical":
				var dir = 'bottom';
				if(check || calculate) {
					if(cell.y < 0.5*this.cfg.height) {
						dir = 'top';
					}
				} else {
					if(this.cfg.rng.hints() <= 0.5) {
						dir = 'top';
					}
				}
				values[0] = dir;

				break;

			case "general_wrong_row":
				if(check) { 
					values[0] = cell.row;
				} else if(calculate) {
					// do nothing
				} else { 
					values[0] = this.getRandomRow();
				}

				break;

			case "general_wrong_row_choice":
				if(check) { 
					values[0] = cell.row;
					values[1] = cell.row;
				} else if(calculate) {
					// do nothing
				} else { 
					var rowA = this.getRandomRow();
					var rowB = this.getRandomRow([rowA]);

					values[0] = rowA;
					values[1] = rowB;
				}

				break;

			case "general_wrong_column":
				if(check) { 
					values[0] = cell.column;
				} else if(calculate) {
					// do nothing
				} else { 
					values[0] = this.getRandomColumn();
				}

				break;

			case "general_wrong_column_choice":
				if(check) { 
					values[0] = cell.column;
					values[1] = cell.column;
				} else if(calculate) {
					// do nothing
				} else { 
					var colA = this.getRandomColumn();
					var colB = this.getRandomColumn([colA]);

					values[0] = colA;
					values[1] = colB;
				}

				break;

			case "general_wrong_row_column":
				if(check) { 
					values[0] = cell.row;
					values[1] = cell.column;
				} else if(calculate) {
					// do nothing
				} else { 
					var row = this.getRandomRow();
					var col = this.getRandomColumn();

					values[0] = row;
					values[1] = col;
				}

				break;

			case "general_quadrant":	
				if(check) {	
					values[0] = QUADRANTS[cell.quadrant];
				} else if(calculate) {
					// do nothing
				} else {
					values[0] = QUADRANTS[Math.floor(this.cfg.rng.hints() * QUADRANTS.length)];
				}

				break;

			case "general_map_bounds":
				var val = 'closer';
				var val2 = 'than';

				if(check || calculate) {
					// we add +0.5 twice, then subtract 1, to make sure distance is correct no matter from what direction you come
					var distToCenter = Math.abs(cell.x - (0.5*this.cfg.width-0.5)) + Math.abs(cell.y - (0.5*this.cfg.height-0.5)) - 1;
					var distToEdge = Math.min(Math.min(cell.x, this.cfg.width - cell.x), Math.min(cell.y, this.cfg.height - cell.y))

					if(distToCenter > distToEdge) {
						val = 'further';
					} else if(distToCenter == distToEdge) {
						val = 'equally close';
						val2 = 'as';
					}
				} else {
					if(this.cfg.rng.hints() <= 0.5) {
						val = 'further';
					}
				}

				values[0] = val;
				values[1] = val2;

				break;

			case "general_nature_vs_stone":
				var val = 'more';
				var val2 = 'than';

				if(check || calculate) {
					var params = {
						"cell": cell,
						"property": "nature",
						"value": "any",
						"radius": knownValues[2]
					};
					var numNature = this.countTiles(params);

					params.property = "stones";
					var numStones = this.countTiles(params);

					if(numNature == numStones) {
						val = 'equally much';
						val2 = 'as';
					} else if(numNature < numStones) {
						val = 'less';
					}
				} else {
					if(this.cfg.rng.hints() <= 0.5) {
						val = 'less';
					}

					var searchRadius = this.getRandomSearchRadius(hint.params[2]);
					values[2] = searchRadius;
				}

				values[0] = val;
				values[1] = val2;

				break;

			case "general_surrounded":
				if(check || calculate) {
					values[0] = this.getNonEmptyNeighbors({ "cell": cell });
				} else {
					values[0] = Math.floor(this.cfg.rng.hints()*4);
				}
				break;

			/* LANDMARK HINTS */
			case "landmark_closest":
				if(check || calculate) {
					var closestLandmark = this.findClosest({
						"cell": cell,
						"property": "landmark",
						"value": "any",
						"returnObj": true,
						"forbidTies": true
					});

					if(closestLandmark == null) { error = true; }
					values[0] = closestLandmark;
				} else {
					values[0] = this.getRandomLandmark();
				}

				break;

			case "landmark_fixed":
				var bool = true;

				if(check || calculate) {
					var dist = this.findClosest({
						"cell": cell,
						"property": "landmark",
						"value": "any"
					});
					bool = (dist <= 2);
				} else {
					bool = (this.cfg.rng.hints() <= 0.5);
				}

				values[0] = this.createNotString(bool);

				break;

			case "landmark_dist":
				if(check || calculate) {
					var dist = this.findClosest({
						"cell": cell,
						"property": "landmark",
						"value": knownValues[1]
					})
					values[0] = this.modifyHintValue(dist, hint, target);
				} else {
					values[0] = Math.floor(this.cfg.rng.hints() * 5) + 1;
					values[1] = this.getRandomLandmark();
				}

				break;

			case "landmark_compare":
				var stringA = "closer";
				var stringB = "than";

				if(check || calculate) {
					var distA = this.distBetweenCells(cell, this.landmarkCells[knownValues[1]])
					var distB = this.distBetweenCells(cell, this.landmarkCells[knownValues[3]])

					if(distA == distB) {
						stringA = "equally far";
						stringB = "as";
					} else if(distA > distB) {
						stringA = "further";
					}
				} else {
					if(this.cfg.rng.hints() <= 0.5) {
						stringA = "further";
					}

					var landmarkA = this.getRandomLandmark();
					var landmarkB = this.getRandomLandmark([landmarkA]);
					values[1] = landmarkA;
					values[3] = landmarkB;
				}

				values[0] = stringA;
				values[2] = stringB;

				break;

			case "landmark_sum":
				if(check || calculate) {
					var dist = 0;

					for(landmarkName in this.landmarkCells)
					{
						dist += this.distBetweenCells(cell, this.landmarkCells[landmarkName]);
					}

					values[0] = this.modifyHintValue(dist, hint, target);

				} else {
					values[0] = Math.floor(this.cfg.rng.hints() * 20) + 5;
				}

				break;

			case "landmark_adjacent":
				var bool = false;

				if(check || calculate) {
					var dist = this.findClosest({
						"cell": cell,
						"property": "landmark",
						"value": "any",
						"ignoreSelf": true
					});

					bool = (dist == 1);
				} else {
					bool = (this.cfg.rng.hints() <= 0.25);
				}

				values[0] = this.createNotString(bool);

				break;

			/* ROAD HINTS */
			case "road_right_choice":

				if(check || calculate) { 
					values[0] = cell.road;
					values[1] = cell.road;
					if(calculate) { values[1] = knownValues[1]; }
				} else { 
					var roadA = this.getRandomRoad();
					if(this.fixedData.road != 'unknown') {
						roadA = this.fixedData.road;
					} else {
						this.fixedData.road = roadA;
					}

					values[0] = roadA; 
					values[1] = this.getRandomRoad([roadA]); 
				}

				if(values[0] == '') { values[0] = 'lack of'; }
				if(values[1] == '') { values[1] = 'lack of'; }

				break;

			case "road_wrong":

				if(check) {
					values[0] = cell.road;
				} else if(calculate) {
					// do nothing
				} else {
					var roadA = this.getRandomRoad([this.fixedData.road]);
				}

				if(values[0] == '') { values[0] = 'lack of'; }

				break;

			case "road_wrong_choice":

				if(check) {
					values[0] = cell.road;
					values[1] = cell.road;
				} else if(calculate) {
					// do nothing
				} else {
					var roadA = this.getRandomRoad([this.fixedData.road]);
					var roadB = this.getRandomRoad([this.fixedData.road, roadA]);

					values[0] = roadA;
					values[1] = roadB;
				}

				if(values[0] == '') { values[0] = 'lack of'; }
				if(values[1] == '') { values[1] = 'lack of'; }

				break;

			case "road_same":
				var bool = false;

				if(check || calculate) {
					bool = this.hasNeighborWith({
						"cell": cell,
						"property": "road",
						"value": cell.road,
					})
				} else {
					bool = Math.random() <= 0.75
				}

				values[0] = this.createNotString(bool);
				break;

			case "road_same_neighbors":
				var value
				
				if(check || calculate) {
					var num = this.countMatchingNeighbors({
						"cell": cell,
						"property": "road"
					})
					value = num
				} else {
					value = Math.floor(this.cfg.rng.hints() * 4);
				}

				if(value == 0 || value == 1) { value = 'NO'; }
				values[0] = value;

				break;

			case "road_count":
				if(check || calculate) {
					var count = this.countTiles({
						"cell": cell,
						"property": "road",
						"value": "any",
						"radius": knownValues[1]
					})
					values[0] = this.modifyHintValue(count, hint, target);
				} else {
					var searchRadius = this.getRandomSearchRadius(hint.params[1]);
					values[1] = searchRadius;

					var numRoads = Math.floor(this.cfg.rng.hints()*this.getMaxTilesInRadius(searchRadius));
					values[0] = numRoads;

				}

				break;

			case "road_adjacency":
				var bool = false;

				if(check || calculate) {
					var dist = this.findClosest({
						"cell": cell,
						"property": "road",
						"value": "any",
						"ignoreSelf": true
					});

					bool = (dist == 1);
				} else {
					bool = (this.cfg.rng.hints() <= 0.5);
				}

				values[0] = this.createNotString(bool);

				break;

			case "road_two_straight":
				var bool = false;

				if(check || calculate) {
					var dist = this.findClosest({
						"cell": cell,
						"property": "road",
						"value": "straight"
					});

					bool = (dist <= 2);
				} else {
					bool = (this.cfg.rng.hints() <= 0.5);
				}

				values[0] = this.createNotString(bool);

				break;

			case "road_two_curved":
				var bool = false;

				if(check || calculate) {
					var dist = this.findClosest({
						"cell": cell,
						"property": "road",
						"value": "corner"
					});

					bool = (dist <= 2);
				} else {
					bool = (this.cfg.rng.hints() <= 0.5);
				}

				values[0] = this.createNotString(bool);

				break;

			case "road_compare":
				var stringA = "fewer";
				var stringB = "than";

				if(check || calculate) {
					var params = {
						"cell": cell,
						"property": "road",
						"value": "straight",
						"radius": knownValues[2]
					}

					var numStraights = this.countTiles(params);

					params.value = "corner";
					var numCorners = this.countTiles(params);

					if(numStraights == numCorners) {
						stringA = "equally many";
						stringB = "as";
					} else if(numStraights > numCorners) {
						stringA = "more";
					}

				} else {
					if(this.cfg.rng.hints() <= 0.5) {
						stringA = "more";
					}

					values[2] = this.getRandomSearchRadius(hint.params[2]);
				}

				values[0] = stringA;
				values[1] = stringB;

				break;

			case "road_dead_end":

				if(check || calculate) {
					var dist = this.findClosest({
						"cell": cell,
						"property": "road",
						"value": "dead end"
					});

					if(!isFinite(dist)) { error = true; }

					values[0] = this.modifyHintValue(dist, hint, target);

				} else {
					values[0] = Math.floor(this.cfg.rng.hints()*5) + 1;
				}

				break;

			/* TINY TREASURES */
			case "tiny_treasure_adjacent":
				var bool = true;

				if(check || calculate) {
					var dist = this.findClosest({
						"cell": cell,
						"property": "tinyTreasure",
						"value": true,
						"ignoreSelf": true
					});
					bool = (dist == 1);
				} else {
					bool = (this.cfg.rng.hints() <= 0.5);
				}

				values[0] = this.createNotString(bool);

				break;

			case "tiny_treasure_two_spaces":

				var bool = true;

				if(check || calculate) {
					var dist = this.findClosest({
						"cell": cell,
						"property": "tinyTreasure",
						"value": true
					});
					bool = (dist <= 2);
				} else {
					bool = (this.cfg.rng.hints() <= 0.5);
				}

				values[0] = this.createNotString(bool);

				break;

			case "tiny_treasure_closest":
				if(check || calculate) {
					var dist = this.findClosest({
						"cell": cell,
						"property": "tinyTreasure",
						"value": true
					});
					values[0] = dist;
				} else {
					values[0] = Math.floor(this.cfg.rng.hints() * 4) + 1;
				}

				break;

			case "tiny_treasure_count":
				if(check || calculate) {
					var count = this.countTiles({
						"cell": cell,
						"property": "tinyTreasure",
						"value": true,
						"radius": knownValues[1]
					});
					values[0] = this.modifyHintValue(count, hint, target);

				} else {
					var searchRadius = this.getRandomSearchRadius(hint.params[1]);
					values[1] = searchRadius;

					var numTiles = Math.floor(this.cfg.rng.hints()*this.getMaxTilesInRadius(searchRadius));
					values[0] = numTiles;
				}

				break;

			case "tiny_treasure_sum":
				if(check || calculate) {
					var dist = 0;
					for(let i = 0; i < this.TINY_TREASURES.length; i++)
					{
						dist += this.distBetweenCells(cell, this.TINY_TREASURES[i]);
					}
					values[0] = dist; // exact value, so no modification
				} else {
					values[0] = Math.floor(this.cfg.rng.hints() * 20) + 5;
				}

				break;
		}

		if(error) {
			hint.error = true;
			return;
		}

		// some hints can fail and have a nice other hint we can display then
		if(failed) {
			baseText = hint.fail_text;
		}

		// replace parts of the hint with the values we found
		// (some hints shuffle the OUTPUT only, so the pattern isn't always the same for players)
		var shuffleOutput = ("shuffle" in hint);
		var outputValues = values.slice();
		if(shuffleOutput) { outputValues = this.shuffle(outputValues); }

		for(let i = 0; i < outputValues.length; i++) {
			var val = outputValues[i];
			baseText = baseText.replace("<" + i + ">", val);
		}

		// add icons into the (HTML) text to display with the hints
		var htmlText = baseText;
		for(iconName in HINT_ICONS)
		{
			var replaceString = iconName;
			var plural = iconName + "s";
			if(htmlText.includes(plural)) {
				replaceString = plural;
			}
			if(htmlText.includes("lack of " + iconName)) {
				continue;
			}

			var iconString = "";
			var frames = HINT_ICONS[iconName];
			for(let i = 0; i < frames.length; i++)
			{
				iconString += "<span class='icon' style='background-position-x:-" + frames[i]*25 + "px;'></span>";
			}

			htmlText = htmlText.replace(replaceString, replaceString + " (" + iconString + ")")
		}
		
		// save the final text and values on the hint
		hint.final_text = baseText;
		hint.html_text = htmlText;
		hint.final_values = values;
	},

	modifyHintValue: function(val, hint, target)
	{
		if(target != "calculate") { return val; }

		var dir = 1;
		if(hint.type == 'greaterthan') { dir = -1; }

		var randOffset = 0;
		var randCheck = this.cfg.rng.hints();
		if(randCheck <= 0.6) { randOffset = 1; }
		else if(randCheck <= 0.8) { randOffset = 2; }

		// minimum is always 1 => "at most 0" = 0 and "at least 0" tells you nothing
		// optional improvement: maximum is the maximum distance something could be in a map
		val += dir * randOffset;
		val = Math.max(val, 1);

		return val;
	},

	createNotString: function(val) {
		if(val) { return ''; }
		else { return 'NOT '; }
	},

	getRandomSearchRadius: function(param)
	{
		if(param.type == 'bounds' && !this.cfg.advancedHints) { param.max = 1; }
		return Math.floor(this.cfg.rng.hints() * (param.max - param.min + 1)) + param.min;
	},

	/*
		VISUALIZATION
	*/
	clearBoard: function()
	{
		let allSprites = this.children.list.filter(x => x instanceof Phaser.GameObjects.Sprite);
		allSprites.forEach(x => x.destroy());

		let allGraphics = this.children.list.filter(x => x instanceof Phaser.GameObjects.Graphics);
		allGraphics.forEach(x => x.destroy());

		let allText = this.children.list.filter(x => x instanceof Phaser.GameObjects.Text);
		allText.forEach(x => x.destroy());
	},

	visualizeTreasureOnly: function() {
		this.clearBoard();
		this.showTreasureRectangle();
	},

	visualizeHintCards: function()
	{
		var cardMargin = { "x": 20, "y": 20 };
		var margin = { "x": 30, "y": 80 };
		var metadataMargin = { "x": 150, "y": 37 }
		var scale = 0.35
		var cardSize = { "w": 1038*scale, "h": 1074*scale }

		var txtConfig = 
			{
				fontFamily: 'Chelsea Market', 
				fontSize: '16px',
				color: '#111111', 
				stroke: '#FFFFFF',
				strokeThickness: 1,
				wordWrap: { width: cardSize.w - margin.x*2, useAdvancedWrap: false }
			}

		var metadataConfig = structuredClone(txtConfig);
		metadataConfig.fontSize = '11px';
		metadataConfig.strokeThickness = 0;

		var cellSize = Math.floor((cardSize.w - margin.x*2) / this.cfg.width);
		var gridHeight = this.cfg.height * cellSize;
		var gridWidth = this.cfg.width * cellSize;
		var extraGridMargin = { "x": 3, "y": 30 }; // just to center it nicely on the card

		var graphics = this.add.graphics();
		var lineWidth = 2;
		var lineColor = 0x000000;
		var alpha = 0.4;
		graphics.lineStyle(lineWidth, lineColor, alpha); 
		graphics.fillStyle(lineColor, 0.33*alpha);

		for(let i = 0; i < this.cfg.playerCount; i++)
		{
			var row = i % 3;
			var col = Math.floor(i / 3);

			// create card background
			var sprite = this.add.sprite(cardMargin.x + row*cardSize.w, cardMargin.y + col*cardSize.h, 'hint_card');
			sprite.displayWidth = cardSize.w;
			sprite.displayHeight = cardSize.h;
			sprite.setOrigin(0.0, 0.0);

			// add metadata (player number, seed, etcetera) in header
			var metadata = "(player " + (i+1) + "; " + this.cfg.seed + ")";
			var txt = this.add.text(sprite.x + metadataMargin.x, sprite.y + metadataMargin.y, metadata, metadataConfig);

			// generate the full string to place on top of the card
			var hints = this.hintsPerPlayer[i];
			var hintTexts = [];
			for(let h = 0; h < hints.length; h++)
			{
				hintTexts.push(hints[h].final_text);
			}
			var hintString = hintTexts.join("\n\n");

			// actually place the hint string
			var txt = this.add.text(sprite.x + margin.x, sprite.y + margin.y, hintString, txtConfig);
			var heightLeftForGrid = cardSize.h - margin.y - cardMargin.y - txt.getBounds().height - extraGridMargin.y;
			var multiplier = Math.min((heightLeftForGrid/gridHeight), 1);

			// create the hint grid
			var gridPos = { "x": sprite.x + margin.x + extraGridMargin.x , "y": sprite.y + cardSize.h - gridHeight - extraGridMargin.y };
			var cs = cellSize * multiplier;

			for(let x = 1; x < this.cfg.width; x++)
			{
				var line = new Phaser.Geom.Line(gridPos.x + x*cs, gridPos.y, gridPos.x + x * cs, gridPos.y + (this.cfg.height*cs));
				graphics.strokeLineShape(line);
			}

			for(let y = 1; y < this.cfg.height; y++)
			{
				var line = new Phaser.Geom.Line(gridPos.x, gridPos.y + y * cs, gridPos.x + (this.cfg.width*cs), gridPos.y + y * cs);
				graphics.strokeLineShape(line);
			}

			var tiles = this.tilesLeftPerPlayer[i];
			if(this.cfg.invertHintGrid) { tiles = this.invertLocationList(tiles); }

			// draw a rectangle for all locations that are still possible (because of yur hints)
			for(let t = 0; t < tiles.length; t++)
			{
				var tile = tiles[t];
				var rect = new Phaser.Geom.Rectangle(gridPos.x + tile.x*cs, gridPos.y + tile.y*cs, cs, cs);
				graphics.fillRectShape(rect);

			}

		}

		this.children.bringToTop(graphics);
	},

	// Basically, we create a new list with all locations ...
	// ... except those that are present in arr
	// which essentially means we "invert" that list
	// (Splicing as we go is just a minor performance optimization)
	invertLocationList: function(arr)
	{
		var locs = this.mapList.slice();
		var list = [];
		for(let i = 0; i < locs.length; i++)
		{
			var match = false;
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
	},

	convertToStringCoordinates: function(cell)
	{
		return alphabet[cell.x] + "" + (cell.y+1);
	},

	visualizeGame: function() {
		var graphics = this.add.graphics();

		const bgRect = new Phaser.Geom.Rectangle(0, 0, this.cfg.pixelWidth, this.cfg.pixelHeight);
		graphics.fillStyle(0xFFFFFF, 1.0);
		graphics.fillRectShape(bgRect);

		const oX = this.cfg.oX;
		const oY = this.cfg.oY;
		const cs = this.cfg.cellSize;
		const inkFriendly = this.cfg.inkFriendly;

		for(var x = 0; x < this.cfg.width; x++) {
			for(var y = 0; y < this.cfg.height; y++) {
				var fX = oX + x*cs;
				var fY = oY + y*cs;
				var rect = new Phaser.Geom.Rectangle(fX, fY, cs, cs);
				var cell = this.map[x][y];
				
				var terrain = cell.terrain;

				if(inkFriendly) {
					var frame = TERRAINS.indexOf(terrain);
					var terrainIcon = this.add.sprite(fX + 0.5*cs, fY + 0.5*cs, 'icons', frame);
					terrainIcon.displayWidth = terrainIcon.displayHeight = cs;
					terrainIcon.setOrigin(0.5, 0.5);
				} else {
					graphics.fillStyle(TERRAIN_DATA[terrain].color, 1.0);
					graphics.fillRectShape(rect);
				}
				

				// stone sprites must be shown UNDERNEATH nature sprites, hence they are created first
				var stones = cell.stones;
				var hasStones = (stones > 0);

				if(hasStones) {
					var frame = 16;
					var key = 'elements';
					if(inkFriendly) { 
						frame = 10;
						key = 'icons';
					}
					

					var positions = [0,1,2,3];
					if(inkFriendly) { positions = [1,2,3]; }
					this.shuffle(positions);

					for(let s = 0; s < stones; s++) {
						var stoneSprite = this.add.sprite(fX + 0.5*cs, fY + 0.5*cs, key, frame);
						stoneSprite.displayWidth = cs;
						stoneSprite.displayHeight = cs;
						stoneSprite.setOrigin(0.5, 0.5);
						stoneSprite.rotation = positions[s] * 0.5 * Math.PI;
					}
					
				}

				// nature
				var nature = cell.nature;
				var hasNature = (nature != '');
				var natureScale = 1.0;
				if(!inkFriendly) { natureScale = 0.66; }

				if(hasNature) {
					var frame = 0;
					var terrainOffset = TERRAINS.indexOf(terrain);
					if(nature == 'flower') { frame = 8; }
					frame += terrainOffset;

					var natureSprite;
					
					if(inkFriendly) {
						var iconFrame = 8;
						if(nature == 'flower') { iconFrame = 9; }
						natureSprite = this.add.sprite(fX + 0.5*cs, fY + 0.5*cs, 'icons', iconFrame);
					} else {
						natureSprite = this.add.sprite(fX + 0.5*cs, fY + 0.5*cs, 'elements', frame);
					}

					natureSprite.displayWidth = cs * natureScale;
					natureSprite.displayHeight = cs * natureScale;
					natureSprite.setOrigin(0.5, 0.5);
					natureSprite.rotation = Math.floor(this.cfg.rng.map()*4) * 0.5 * Math.PI;
				}

				// road
				var road = cell.road;
				var roadScale = 1.0;
				var hasRoad = (road != '');
				if(hasRoad) {
					var terrainIndex = TERRAINS.indexOf(terrain);
					var frame = 24;
					var iconFrame = 11;
					if(road == 'corner') { frame = 32; iconFrame = 12; }
					if(road == 'dead end') { frame = 40; iconFrame = 13; }
					frame += terrainIndex;

					var roadSprite;
					if(inkFriendly) {
						roadSprite = this.add.sprite(fX + 0.5*cs, fY + 0.5*cs, 'icons', iconFrame);
					} else {
						roadSprite = this.add.sprite(fX + 0.5*cs, fY + 0.5*cs, 'elements', frame);
					}

					roadSprite.displayWidth = cs * roadScale;
					roadSprite.displayHeight = cs * roadScale;
					roadSprite.setOrigin(0.5, 0.5);

					roadSprite.rotation = cell.roadOrient * 0.5 * Math.PI;

				}

				// landmarks
				var landmark = cell.landmark;
				var landmarkScale = 1.0;
				var hasLandmark = (landmark != '');
				if(hasLandmark) {
					var frame = 48 + LANDMARKS.indexOf(landmark);
					var iconFrame = 16 + LANDMARKS.indexOf(landmark);

					var landmarkSprite;
					if(inkFriendly) {
						landmarkSprite = this.add.sprite(fX + 0.5*cs, fY + 0.5*cs, 'icons', iconFrame);
					} else {
						landmarkSprite = this.add.sprite(fX + 0.5*cs, fY + 0.5*cs, 'elements', frame);
					}

					landmarkSprite.displayWidth = cs * landmarkScale;
					landmarkSprite.displayHeight = cs * landmarkScale;
					landmarkSprite.setOrigin(0.5, 0.5);
					landmarkSprite.rotation = Math.floor(this.cfg.rng.map()*4) * 0.5 * Math.PI;
				}
			}
		}

		// draw divider lines to clearly separate tiles
		var topGraphics = this.add.graphics();

		var gridLineWidth = Math.round(0.015*this.cfg.cellSize);
		var lineColor = 0x000000;
		topGraphics.lineStyle(gridLineWidth, lineColor, 1.0); 

		var fontSize = Math.round(0.0725*cs)
		var margin = Math.round(0.0275*cs)
		var txtConfig = 
			{
				fontFamily: 'Chelsea Market', 
				fontSize: fontSize + 'px',
				color: '#111111', 
				stroke: '#FFFFFF',
				strokeThickness: 1,
			}

		for(let x = 0; x <= this.cfg.width; x++) {
			var line = new Phaser.Geom.Line(oX + x*cs, oY + 0, oX + x*cs, oY + this.cfg.height*cs);
			topGraphics.strokeLineShape(line);

			if(x == this.cfg.width) { continue; }
			var txt = this.add.text(oX + (x+0.5)*cs, oY + margin, alphabet[x], txtConfig);
			txt.setOrigin(0.5, 0.0);
		}

		for(let y = 0; y <= this.cfg.height; y++) {
			var line = new Phaser.Geom.Line(oX + 0, oY + y*cs, oX + this.cfg.width*cs, oY + y*cs);	
			topGraphics.strokeLineShape(line);

			if(y == this.cfg.height) { continue; }
			var txt = this.add.text(oX + margin, oY + (y+0.5)*cs, (y+1), txtConfig);
			txt.setOrigin(0.0, 0.5);
		}

		// display the map seed (underneath the A in the upper left square)
		var txt = this.add.text(oX + 0.5*cs + margin, oY + margin + 12, this.cfg.seed, txtConfig);
		txt.setOrigin(0.5, 0.0);

		// draw a divider between squares with a different terrain
		// (helps a ton with clarity)
		var lineWidth = Math.round(2.5*gridLineWidth);
		topGraphics.lineStyle(lineWidth, lineColor, 1.0);

		var tiles = this.mapList.slice();
		for(let i = 0; i < tiles.length; i++)
		{
			var pos = { 'x': tiles[i].x, 'y': tiles[i].y }
			var posBelow = { 'x': pos.x, 'y': pos.y + 1 }
			var posRight = { 'x': pos.x + 1, 'y': pos.y }

			if(!this.outOfBounds(posBelow.x, posBelow.y) && tiles[i].terrain != this.map[posBelow.x][posBelow.y].terrain)
			{
				var line = new Phaser.Geom.Line(oX + posBelow.x*cs, oY + posBelow.y*cs, oX + (posBelow.x+1)*cs, oY + posBelow.y*cs);
				topGraphics.strokeLineShape(line);
			}

			if(!this.outOfBounds(posRight.x, posRight.y) && tiles[i].terrain != this.map[posRight.x][posRight.y].terrain)
			{
				var line = new Phaser.Geom.Line(oX + posRight.x*cs, oY + posRight.y*cs, oX + posRight.x*cs, oY + (posRight.y+1)*cs);
				topGraphics.strokeLineShape(line);
			}
		}

		// display the hints (only when debugging of course)
		if(this.cfg.debugging) {
			var txtConfig = 
				{
					fontFamily: 'Chelsea Market', 
					fontSize: '16px',
					color: '#111111', 
					stroke: '#FFFFFF',
					strokeThickness: 5,
				}

			var margin = 12;
			var lineHeight = 24;
			var counter = 0;
			for(category in this.hints) 
			{
				for(let i = 0; i < this.hints[category].length; i++)
				{
					var txt = this.add.text(oX + margin, oY + margin + counter*lineHeight, this.hints[category][i].final_text, txtConfig);
					txt.setOrigin(0,0);
					txt.depth = 10000;
					counter += 1;
				}
			}
		}

		// highlight the location (only when debugging)
		if(this.cfg.debugging)
		{
			this.showTreasureRectangle();
		}
	},

	showTreasureRectangle: function()
	{
		var graphics = this.add.graphics();
		var loc = this.treasure;

		var fX = this.cfg.oX + loc.x*this.cfg.cellSize;
		var fY = this.cfg.oY + loc.y*this.cfg.cellSize;
		var rect = new Phaser.Geom.Rectangle(fX, fY, this.cfg.cellSize, this.cfg.cellSize);

		graphics.lineStyle(10, 0xFF0000, 1.0);
		graphics.strokeRectShape(rect);
	},

	/*
		HELPER FUNCTIONS
	*/
	getMaxTilesInRadius: function(rad)
	{
		rad -= 1; // just to offset it so it works with how hints are presented to players
		return 2*(rad*rad) - 2*rad + 1;
	},

	getEmptyNeighbors: function(cell, properties) {
		var arr = [];

		for(let i = 0; i < cell.nbs.length; i++) {
			var nb = cell.nbs[i];
			var empty = true;
			for(let p = 0; p < properties.length; p++)
			{
				var curVal = nb[properties[p]];
				if(!(curVal == '' || curVal == 0)) { 
					empty = false;
					break; 
				}
			}
			if(!empty) { continue; }
			
			arr.push(nb);
		}

		return arr;
	},

	getNonEmptyNeighbors: function(param)
	{
		var cell = param.cell;
		var arr = [];

		for(let i = 0; i < cell.nbs.length; i++) {
			var nb = cell.nbs[i];
			if(nb.nature == '' && nb.stones == 0 && nb.landmark == '' && nb.road == '') { continue; }
			
			arr.push(nb);
		}
		return arr;
	},

	hasNeighborWith: function(param)
	{
		for(let i = 0; i < param.cell.nbs.length; i++) {
			if(param.cell.nbs[i][param.property] != param.value) { continue; }
			return true;
		}
		return false;
	},

	countMatchingNeighbors: function(param)
	{
		var prop = param.property;
		var types = {};
		for(let i = 0; i < param.cell.nbs.length; i++)
		{
			var nb = param.cell.nbs[i];
			if(!(nb[prop] in types)) { types[nb[prop]] = 0; }
			types[nb[prop]] += 1;
		}

		var largestType = 'unknown';
		var largestNum = -1;
		for(type in types) 
		{
			if(types[type] <= largestNum) { continue; }
			largestNum = types[type];
			largestType = type;
		}

		if(largestType == 'unknown') { return 0; }
		return largestNum;
	},

	findClosest: function(param)
	{
		var originalCell = param.cell;
		var tiles = this.mapList.slice();
		var params = structuredClone(param);
		params.cell = param.cell;

		var closestObj = null;
		var closestDist = Infinity;

		var isTied = false;

		for(let i = 0; i < tiles.length; i++) {
			var newCell = tiles[i];

			var isSelf = (originalCell == newCell);
			var ignoreSelf = ("ignoreSelf" in params);
			if(ignoreSelf && isSelf) { continue; }

			params.cell = newCell;
			var matchesPattern = this.matchProperty(params);
			if(!matchesPattern) { continue; }

			var dist = Math.abs(newCell.x - originalCell.x) + Math.abs(newCell.y - originalCell.y);
			if(dist == closestDist) { isTied = true; }
			if(dist > closestDist) { continue; }

			closestObj = newCell;
			closestDist = dist;
			isTied = false;
		}

		if("forbidTies" in params && isTied) {
			return null;
		}

		if("returnObj" in params) {
			return closestObj[param.property];
		}

		return closestDist;
	},

	countTiles: function(param)
	{
		var tiles;
		var params = structuredClone(param);
		params.cell = param.cell;

		if("group" in params) {
			tiles = params.group;
		} else {
			tiles = this.getTilesRadius(params);
		}

		var useValue = false;
		if("useValue" in params) { useValue = true; }
		
		var sum = 0;
		for(let i = 0; i < tiles.length; i++) {
			params.cell = tiles[i];

			var matchesPattern = this.matchProperty(params);
			if(!matchesPattern) { continue; }

			var increment = 1;
			if(useValue) { increment = tiles[i][params.property]; }
			sum += increment;
		}

		return sum;
	},

	matchProperty: function(param)
	{
		var realValue = param.cell[param.property];
		var matchesPattern = (realValue == param.value)
		if(param.value == 'any') {
			matchesPattern = (realValue != 0 && realValue != '');
		}
		return matchesPattern;
	},

	getTilesProperty: function(param)
	{
		var allTiles = this.mapList.slice();
		for(let i = allTiles.length - 1; i >= 0; i--)
		{
			param.cell = allTiles[i];
			var matchesPattern = this.matchProperty(param);
			if(matchesPattern) { continue; }
			allTiles.splice(i,1);
		}
		return allTiles;
	},

	getTilesRadius: function(param)
	{
		var oX = param.cell.x;
		var oY = param.cell.y;

		var arr = [];
		for(let x = -param.radius; x <= param.radius; x++) {
			for(let y = -param.radius; y <= param.radius; y++) {
				var dist = Math.abs(x) + Math.abs(y);
				if(dist > param.radius) { continue; }

				var fX = oX + x;
				var fY = oY + y;

				if(this.cfg.wrapBoard) {
					fX = (fX + this.cfg.width) % this.cfg.width;
					fY = (fY + this.cfg.height) % this.cfg.height;
				}

				if(this.outOfBounds(fX, fY)) { continue; }

				arr.push(this.map[fX][fY]);
			}
		}
		return arr;
	},

	arraysAreEqual: function(a,b)
	{
		if(a.length != b.length) { return false; }

		for(let i = 0; i < a.length; i++) {
			if(a[i] != b[i]) { return false; }
		}
		return true;
	},

	arraysAreNonEqual: function(a,b)
	{
		if(a.length != b.length) { return false; }

		for(let i = 0; i < a.length; i++) {
			if(a[i] == b[i]) { return false; }
		}
		return true;
	},

	arraysOneMatch: function(a,b)
	{
		for(let i = 0; i < a.length; i++) {
			if(i >= b.length) { break; }
			if(a[i] == b[i]) { return true; }
		}
		return false;
	},

	arrayHasDuplicates: function(a)
	{
		return (new Set(a)).size !== a.length;
	},

	// @IMPROV: All these functions do basically the same thing; should generalize and make this cleaner?
	getRandomStones: function(exclude = [])
	{
		var stones = STONES.slice();
		this.handleExclusions(stones, exclude);
		return stones[Math.floor(this.cfg.rng.hints() * stones.length)];
	},

	getRandomNature: function(exclude = [])
	{
		var nature = NATURE.slice();
		this.handleExclusions(nature, exclude);
		return nature[Math.floor(this.cfg.rng.hints() * nature.length)];
	},

	getRandomTerrain: function(exclude = [])
	{
		var terrains = TERRAINS.slice();
		this.handleExclusions(terrains, exclude);
		return terrains[Math.floor(this.cfg.rng.hints() * terrains.length)];
	},

	getRandomLandmark: function(exclude = [])
	{
		if(Object.keys(this.landmarkCells).length <= 0) { return ''; }
		var landmarks = Object.keys(this.landmarkCells).slice();
		this.handleExclusions(landmarks, exclude);
		return landmarks[Math.floor(this.cfg.rng.hints() * landmarks.length)];
	},

	getRandomRoad: function(exclude = [])
	{
		var roads = ROADS.slice();
		this.handleExclusions(roads, exclude);
		return roads[Math.floor(this.cfg.rng.hints() * roads.length)];
	},

	getRandomRow: function(exclude = [])
	{
		var rows = LISTS.row.slice();
		this.handleExclusions(rows, exclude);
		return rows[Math.floor(this.cfg.rng.hints() * rows.length)];
	},

	getRandomColumn: function(exclude = [])
	{
		var cols = LISTS.column.slice();
		this.handleExclusions(cols, exclude);
		return cols[Math.floor(this.cfg.rng.hints() * cols.length)];
	},

	handleExclusions: function(arr, exclude) 
	{
		for(let i = 0; i < exclude.length; i++) 
		{
			var ind = arr.indexOf(exclude[i]);
			if(ind < 0) { continue; }
			arr.splice(ind, 1);
		}
	},

	shuffle: function(a) {
	    var j, x, i;
	    for (i = a.length - 1; i > 0; i--) {
	        j = Math.floor(this.cfg.rng.general() * (i + 1));
	        x = a[i];
	        a[i] = a[j];
	        a[j] = x;
	    }

	    return a;
	},

	pixelToCell: function(a) {
		return { 'x': Math.floor(a.x/this.cfg.cellSize), 'y': Math.floor(a.y/this.cfg.cellSize) }
	},

	outOfBounds: function(x, y) {
		return (x < 0 || x >= this.cfg.width || y < 0 || y >= this.cfg.height);
	},

	/* Converts canvas into image */
	// Why? 
	//  - So I can delete the phaser game, which eats battery and resources on phones
	//  - So I can just save two images: one of the map, one of the treasure location and easily display them when the player wants
	//  - So players can save the map and print it, if they want

	convertCanvasToImage: function() {
		if(!this.cfg.useInterface) { return; }

		var ths = this;
		var phaser = document.getElementById('phaser-container');
		const cfg = this.cfg;

		// First save the whole map
		ths.time.addEvent({
		    delay: 200,
		    loop: false,
		    callback: function() {
		        var canv = phaser.firstChild;

				var img = new Image();
				img.src = canv.toDataURL();

				// When done, save just the overlay with the solution
				img.addEventListener('load', function() {
					cfg.finalMap = img;

					ths.visualizeTreasureOnly();
					ths.time.addEvent({
						delay: 200,
						loop: false,
						callback: function() {
							var canv = phaser.firstChild;

							var img2 = new Image();
							img2.src = canv.toDataURL();

							img2.addEventListener('load', function() {
								cfg.solutionMap = img2;

								GAME.destroy(true);

								phaser.innerHTML = '';

								var div1 = document.createElement("div");
								div1.id = 'mainMap';
								div1.classList.add('mapImageContainer');
								phaser.appendChild(div1);

								var div2 = document.createElement("div");
								div2.id = 'solutionMap';
								div2.classList.add('mapImageContainer');
								div2.style.display = "none";
								phaser.appendChild(div2);

								div1.appendChild(img);
								div2.appendChild(img2);
								phaser.style.display = 'none';

							})
						},
					});
				});
		    }
		})
	},

	/* 
		Creates a "premade game"
		 -> Creates a PDF
		 -> First page is the board
		 -> Second page creates hint cards + the right hints on top of them
	 */
	createPreMadeGame: function()
	{
		var ths = this;
		var phaser = document.getElementById('phaser-container');
		var pdfImages = [];

		// Save an image of the whole map
		ths.time.addEvent({
		    delay: 200,
		    loop: false,
		    callback: function() {
		        var canv = phaser.firstChild;
				var img = new Image();
				img.src = canv.toDataURL();
				img.addEventListener('load', function() {
					pdfImages.push(img);
					ths.createHintCards(pdfImages);
				});
			}
		});
	},

	createHintCards: function(pdfImages)
	{
		this.clearBoard();
		this.visualizeHintCards();

		var phaser = document.getElementById('phaser-container');
		var ths = this;
		
		// Save an image of these hint cards
		ths.time.addEvent({
		    delay: 200,
		    loop: false,
		    callback: function() {
		        var canv = phaser.firstChild;
				var img = new Image();
				img.src = canv.toDataURL();
				img.addEventListener('load', function() {
					pdfImages.push(img);
					ths.clearBoard();
					ths.createPDF(pdfImages);
				});
			}
		});
	},

	createPDF: function(pdfImages)
	{
		var pdfConfig = {
			orientation: "l", // landscape
			unit: 'mm',
			format: [pdfSize.width, pdfSize.height]
		}
		var doc = new window.jspdf.jsPDF(pdfConfig);
		var width = doc.internal.pageSize.getWidth(), height = doc.internal.pageSize.getHeight();
	    for(var i = 0; i < pdfImages.length; i++) {
	    	if(i > 0) { doc.addPage(); }
	    	doc.addImage(pdfImages[i], 'png', 0, 0, width, height, undefined, 'FAST');
	    }

	    doc.save('Premade Pirate Riddlebeard Game');
	}
});