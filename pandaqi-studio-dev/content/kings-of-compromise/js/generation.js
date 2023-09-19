const Generation = new Phaser.Class({

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

		this.load.spritesheet('sprites', base + 'sprites.png', { frameWidth: 200, frameHeight: 200 });
    },

    create: function(config) {
    	this.generateConfiguration(config);
    	this.prepareData();

    	this.generateMap();
    	this.generateHints();
    	this.visualize();

    	var ths = this;
    	ths.time.addEvent({
		    delay: 1000,
		    loop: false,
		    callback: function() {
    			ths.scrambleMap();
    			ths.visualize();
    		}
    	});

    	loadInterface();
	},

	/*
		CONFIG GENERATION
	*/
	generateConfiguration: function(config = {})
	{
		var savedData = window.localStorage.kingsOfCompromiseConfig;
		var parsedData = {};
		if(savedData) { parsedData = JSON.parse(savedData); }

		var playerCount = parseInt(parsedData.playerCount) || 4;
		var seed = parsedData.seed || "";

    	this.cfg = 
    	{
    		'seed': seed,
    		'debugging': true, // @DEBUGGING (should be false)
    		'useInterface': false, // @DEBUGGING (should be true)
    		'inkFriendly': true,

    		'generateMap': true,
    		'generateHints': false,
    		'scrambleMap': true,

    		'pixelwidth': this.canvas.width,
    		'pixelheight': this.canvas.height,
    		'width': 4,
    		'height': 4,

    		'playerCount': playerCount,
    		'minHintsPerPlayer': 2,
			'maxHintsPerPlayer': 3,
    	}

    	if(this.cfg.useInterface) {
    		this.cfg.debugging = false;
    	}

    	this.cfg.cellSize = Math.min(Math.floor(this.cfg.pixelwidth/this.cfg.width), Math.floor(this.cfg.pixelheight/this.cfg.height))

    	this.cfg.oX = (this.cfg.pixelwidth - this.cfg.width*this.cfg.cellSize) * 0.5;
    	this.cfg.oY = (this.cfg.pixelheight - this.cfg.height*this.cfg.cellSize) * 0.5;

    	this.cfg.totalTileCount = (this.cfg.width * this.cfg.height);

    	window.CONFIG = this.cfg;
	},

	prepareData: function()
	{
		// @TODO: remove any categories/stuff not used because it's disabled/in expansions

		// only allow generating owners that are actually players in the game
		var possibleOwners = [];
		for(let i = 0; i < this.cfg.playerCount; i++)
		{
			possibleOwners.push(i);
		}

		ELEMENTS.owner = possibleOwners;
	},

	/*
		MAP GENERATION
	 */
	generateMap: function() {
		if(!this.cfg.generateMap) { return; }

		this.mapGenFail = true
		this.numMapGens = 0;

		while(this.mapGenFail) {
			this.numMapGens += 1;
			this.mapGenFail = false;

			this.determineSeed();
			this.prepareGrid();

			this.createTiles();
			this.createCreatures();
			this.createStructures();
			this.createNature();
			// some fourth category here? 

			this.createOwners();
		}
	},

	determineSeed: function() {
		var randomSeedLength = Math.floor(Math.random() * 6) + 3;
		var randomSeed = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, randomSeedLength);

		if(this.cfg.seed == '') { this.cfg.seed = randomSeed; }
		var finalSeed = this.cfg.seed + "_" + this.numMapGens;

		this.cfg.seed = finalSeed; 
		this.cfg.rng = {};
		this.cfg.rng.general = PQ_GAMES.TOOLS.random.seedRandom(finalSeed + "-general");
		this.cfg.rng.map = PQ_GAMES.TOOLS.random.seedRandom(finalSeed + "-map");
		this.cfg.rng.hints = PQ_GAMES.TOOLS.random.seedRandom(finalSeed + "-hints-" + randomSeed);
		this.cfg.rng.actions = PQ_GAMES.TOOLS.random.seedRandom(finalSeed + "-actions");
	},

	prepareGrid: function() {
		this.map = [];
		this.mapList = [];

		// create base objects for the grid/tiles
		for(var x = 0; x < this.cfg.width; x++) {
			this.map[x] = [];

			for(var y = 0; y < this.cfg.height; y++) {
				var quadrant = Math.floor(2 * x / this.cfg.width) + Math.floor(2 * y / this.cfg.height)*2;
				var isEdge = (x == 0 || x == (this.cfg.width-1)) || (y == 0 || y == (this.cfg.height-1));

				var obj = { 
					'x': x,
					'y': y,
					'isEdge': isEdge,
					'quadrant': quadrant,
					'nbs': [],

					'owner': [],

					'tile': [],
					'structure': [],
					'nature': [],
					'creature': [],
				};

				this.map[x][y] = obj;
				this.mapList.push(obj);
			}
		}

		// saving all our (valid) neighbours once at the start saves a lot of time (and for loops) later on
		var nbCoords = [{ "x": 1, "y": 0 },{ "x": 0, "y": 1 },{ "x": -1, "y": 0 },{ "x": 0, "y": -1 }]
		for(var x = 0; x < this.cfg.width; x++) {
			for(var y = 0; y < this.cfg.height; y++) {
				
				var nbs = [];
				for(let i = 0; i < nbCoords.length; i++) {
					var newPos = { "x": x + nbCoords[i].x, "y": y + nbCoords[i].y };
					if(this.outOfBounds(newPos.x, newPos.y)) { continue; }
					nbs.push(newPos);
				}

				this.map[x][y].nbs = nbs;
			}
		}
	},

	materialLimitReached: function(arr, category, type)
	{
		if(!(type in arr)) { arr[type] = 0; }
		return arr[type] >= MATERIALS[category];
	},

	createTiles: function()
	{
		var tilesUsedPerType = {};

		for(let i = 0; i < this.mapList.length; i++)
		{
			var type = this.pickRandomTypeInCategory("tile", tilesUsedPerType);
			tilesUsedPerType[type] += 1;
			this.mapList[i].tile = [type];
		}
	},

	// @TODO: Lots of overlap between creation functions ... for now. If that remains, combine them
	createCreatures: function()
	{
		var creaturesUsedPerType = {};
		const emptyProbability = 0.2;

		for(let i = 0; i < this.mapList.length; i++)
		{
			var numSlots = TILE_DATA[this.mapList[i].tile].slots.creature;

			for(let s = 0; s < numSlots; s++)
			{
				if(this.cfg.rng.map() <= emptyProbability) { continue; }

				var type = this.pickRandomTypeInCategory("creature", creaturesUsedPerType);
				if(type == null) { continue; }

				creaturesUsedPerType[type] += 1;
				this.mapList[i].creature.push(type);	
			}
		}
	},

	createStructures: function()
	{
		var structuresUsedPerType = {};
		const emptyProbability = 0.4;

		for(let i = 0; i < this.mapList.length; i++)
		{
			var numSlots = TILE_DATA[this.mapList[i].tile].slots.structure;

			for(let s = 0; s < numSlots; s++)
			{
				if(this.cfg.rng.map() <= emptyProbability) { continue; }

				var type = this.pickRandomTypeInCategory("structure", structuresUsedPerType);
				if(type == null) { continue; }

				structuresUsedPerType[type] += 1;
				this.mapList[i].structure.push(type);	
			}
		}
	},

	createNature: function()
	{
		var natureUsedPerType = {};
		const emptyProbability = 0.3;

		for(let i = 0; i < this.mapList.length; i++)
		{
			var numSlots = TILE_DATA[this.mapList[i].tile].slots.nature;

			for(let s = 0; s < numSlots; s++)
			{
				if(this.cfg.rng.map() <= emptyProbability) { continue; }

				var type = this.pickRandomTypeInCategory("nature", natureUsedPerType);
				if(type == null) { continue; }

				natureUsedPerType[type] += 1;
				this.mapList[i].nature.push(type);	
			}
		}
	},

	createOwners: function()
	{
		// @TODO: some check to ensure each player is used at least once or twice, no player just owns the whole board
		for(let i = 0; i < this.mapList.length; i++)
		{
			this.mapList[i].owner = [this.getRandomPlayer()];
		}
	},

	// @TODO: use exclusions to prevent re-checking categories with material limit reached all the time?
	pickRandomTypeInCategory: function(category, stats)
	{
		var type;
		var numTries = 0;
		var maxTries = 30;
		do {
			type = this.getRandomElementFromCategory(category);
			numTries += 1;
		} while(this.materialLimitReached(stats, category, type) && numTries < maxTries);
		
		if(numTries >= maxTries) { return null; }
		return type;
	},

	/*
		HINTS GENERATION
	 */
	generateHints: function()
	{
		if(!this.cfg.generateHints) { return; }

		this.hintGenFail = true;
		this.numHintGens = 0;

		while(this.hintGenFail)
		{
			this.hintGenFail = false;
			this.numHintGens += 1;

			this.buildAllValidHints();
			this.reduceHintListToMostValuable();
		}

		this.distributeHintsOverPlayers();
	},

	buildAllValidHints: function()
	{
		// @TODO: All that shit

		this.hints = [];
	},

	reduceHintListToMostValuable: function()
	{
		var numTestsPerTile = 10;

		// Try random actions for each hint and check if it still holds
		// The more often it fails, the more important the hint turned out to be
		for(let i = 0; i < this.hints.length; i++)
		{
			var numFails = 0;
			var hint = this.hints[i];
			for(let t = 0; t < numTestsPerTile; t++)
			{
				var cmd = this.doRandomAction();
				if(!this.hintIsValid(hint)) { numFails += 1; }
				this.undoAction(cmd);
			}
			hint.score = (numFails / (numTestsPerTile + 0.0));
		}

		// Sort hints based on that score
		this.hints.sort(function(a,b) {
			return a.score < b.score
		});

		// Remove excess first
		// Then merely remove until we've reached minimum or all remaining hints are valuable enough
		var desiredNumHints = this.cfg.minHintsPerPlayer * this.cfg.playerCount;
		var maxNumHints = this.cfg.maxHintsPerPlayer
		var minimumScoreForHint = 0.5; // @TODO: figure out
		
		this.hints = this.hints.slice(0, maxNumHints);
		while(this.hints.length > desiredNumHints)
		{
			if(this.hints[this.hints.length - 1].score > minimumScoreForHint) { break; }
			this.hints.pop();
		}
	},

	distributeHintsOverPlayers: function()
	{

	},

	/*
		HINT BUILDING/MATCHING/CHECKING
	 */
	hintIsValid: function(hint)
	{

	},

	/*
		DO/UNDO ACTIONS ON THE MAP
	 */
	scrambleMap: function()
	{
		if(!this.cfg.scrambleMap) { return; }

		var numChanges = 30; // @TODO: actually find a good number, maybe depend on map size
		for(let i = 0; i < numChanges; i++)
		{
			this.doRandomAction();
		}
	},

	getRandomPlayer: function()
	{
		return Math.floor(this.cfg.rng.general() * this.cfg.playerCount);
	},

	getRandomActionType: function()
	{
		return ACTION_TYPES[Math.floor(this.cfg.rng.actions() * ACTION_TYPES.length)];
	},

	getRandomCategory: function()
	{
		return CATEGORIES[Math.floor(this.cfg.rng.actions() * CATEGORIES.length)];
	},

	getRandomCell: function()
	{
		return this.mapList[Math.floor(this.cfg.rng.actions() * this.mapList.length)];
	},

	getRandomElementFromCategory: function(cat, exclude = [])
	{
		var list = ELEMENTS[cat].slice();
		this.handleExclusions(list, exclude);
		return list[Math.floor(this.cfg.rng.actions() * list.length)];
	},

	handleExclusions: function(list, exclude)
	{
		for(let i = list.length-1; i >= 0; i--)
		{
			if(!exclude.includes(list[i])) { continue; }
			list.splice(i,1);
		}
	},

	doRandomAction: function()
	{
		var params = {
			"type": this.getRandomActionType(),
			"category": this.getRandomCategory(),
			"oldValue": null,
			"newValue": null,
			"cell": this.getRandomCell()
		}

		params.oldValue = params.cell[params.category];

		// tiles must always be something, so only swapping
		if(params.category == "tile") { params.type = "swap"; }

		// if there's currently nothing, we obviously can only add stuff
		if(params.oldValue.length <= 0 && params.type != "add") { params.type = "add"; }

		// can't add if there's no room
		var tileType = params.cell.tile[0];
		var numSlots = TILE_DATA[tileType].slots[params.category];
		if(params.category == "tile") { numSlots = 1; }
		if(params.oldValue.length >= numSlots && params.type == "add") { params.type = "swap"; }

		var excludeArray = [];
		if(params.type == "swap") { excludeArray = [params.oldValue[params.oldValue.length-1]]; }
		params.newValue = this.getRandomElementFromCategory(params.category, excludeArray);

		this.doAction(params);

		return params;
	},

	doAction: function(params)
	{
		if(params.type == "remove") {
			params.cell[params.category].pop();

		} else if(params.type == "add") {
			params.cell[params.category].push(params.newValue);
		
		} else if(params.type == "swap") {
			params.cell[params.category].pop();
			params.cell[params.category].push(params.newValue);
		}
	},

	undoAction: function(params)
	{
		params.cell[params.category] = params.oldValue;
	},

	/*
		VISUALIZATION
	 */
	visualize: function()
	{
		const oX = this.cfg.oX;
		const oY = this.cfg.oY;
		const cs = this.cfg.cellSize;
		const inkFriendly = this.cfg.inkFriendly;

		// THE MAP ITSELF
		const offset = [
			{ "x": -0.25*cs, "y": -0.25*cs },
			{ "x": 0.25*cs, "y": -0.25*cs },
			{ "x": -0.25*cs, "y": 0.25*cs },
			{ "x": 0.25*cs, "y": 0.25*cs }
		];

		const elemSpriteSize = 0.35*cs;
		const ownerSpriteSize = 0.2*cs;

		const blueprintOrder = ['creature', 'nature', 'structure', 'TODO some fourth category', 'owner']
		const blueprintAlpha = 0.5;

		for(let i = 0; i < this.mapList.length; i++)
		{
			var cell = this.mapList[i];
			var tile = cell.tile[0];
			var fX = oX + cell.x*cs + 0.5*cs;
			var fY = oY + cell.y*cs + 0.5*cs;

			var slotOrder = TILE_DATA[tile].slot_order;

			// TILE
			var frame = ELEMENTS.tile.indexOf(tile);
			var tileSprite = this.add.sprite(fX, fY, 'sprites', frame);
			tileSprite.displayWidth = tileSprite.displayHeight = cs;
			tileSprite.setOrigin(0.5, 0.5);

			// BLUEPRINTS FOR SPRITES
			for(let a = 0; a < slotOrder.length; a++)
			{
				var value = slotOrder[a];
				frame = 48 + blueprintOrder.indexOf(value);

				var blueprintSprite = this.add.sprite(fX + offset[a].x, fY + offset[a].y, 'sprites', frame);
				blueprintSprite.displayWidth = blueprintSprite.displayHeight = elemSpriteSize;
				blueprintSprite.setOrigin(0.5, 0.5);

				blueprintSprite.alpha = blueprintAlpha;
			}

			// CREATURE
			for(let a = 0; a < cell.creature.length; a++)
			{
				frame = 8 + ELEMENTS.creature.indexOf(cell.creature[a]);
				var offsetIdx = slotOrder.indexOf("creature") + a;
				var creatureSprite = this.add.sprite(fX + offset[offsetIdx].x, fY + offset[offsetIdx].y, 'sprites', frame);
				creatureSprite.displayWidth = creatureSprite.displayHeight = elemSpriteSize;
				creatureSprite.setOrigin(0.5, 0.5);
			}

			// NATURE
			for(let a = 0; a < cell.nature.length; a++)
			{
				frame = 16 + ELEMENTS.nature.indexOf(cell.nature[a]);
				var offsetIdx = slotOrder.indexOf("nature") + a;
				var natureSprite = this.add.sprite(fX + offset[offsetIdx].x, fY + offset[offsetIdx].y, 'sprites', frame);
				natureSprite.displayWidth = natureSprite.displayHeight = elemSpriteSize;
				natureSprite.setOrigin(0.5, 0.5);
			}

			// STRUCTURE
			for(let a = 0; a < cell.structure.length; a++)
			{
				frame = 24 + ELEMENTS.structure.indexOf(cell.structure[a]);
				var offsetIdx = slotOrder.indexOf("structure") + a;
				var structureSprite = this.add.sprite(fX + offset[offsetIdx].x, fY + offset[offsetIdx].y, 'sprites', frame);
				structureSprite.displayWidth = structureSprite.displayHeight = elemSpriteSize;
				structureSprite.setOrigin(0.5, 0.5);
			}

			// FOURTH CATEGORY??

			// OWNER
			// (completely separate from other system)
			var hasOwner = (cell.owner.length > 0);
			if(hasOwner) {
				frame = 40 + cell.owner[0];
				var ownerSprite = this.add.sprite(fX, fY, 'sprites', frame);
				ownerSprite.displayWidth = ownerSprite.displayHeight = ownerSpriteSize;
				ownerSprite.setOrigin(0.5, 0.5);
			} else {
				frame = 48 + blueprintOrder.indexOf('owner');
				var blueprintSprite = this.add.sprite(fX, fY, 'sprites', frame);
				blueprintSprite.displayWidth = blueprintSprite.displayHeight = ownerSpriteSize;
				blueprintSprite.setOrigin(0.5, 0.5);
				blueprintSprite.alpha = blueprintAlpha;
			}
		}

		// @TODO: display tools (grid lines, numbers/letters, etcetera)
		// @TODO: display debugging (wishes, ??)


	},

	/*
		UTILITY/HELPER FUNCTIONS
	 */
	outOfBounds: function(x, y)
	{
		return (x < 0 || x >= this.cfg.width) || (y < 0 || y >= this.cfg.height);
	}

});

function startPhaserGame(gameConfig = {}) {
	document.getElementById('phaser-container').innerHTML = '';

	var config = {
	    type: Phaser.CANVAS,
	    scale: {
	        mode: Phaser.Scale.FIT,
	        parent: 'phaser-container',
	        autoCenter: Phaser.Scale.CENTER_BOTH,
	        width: '100%',
	        height: '100%'
	    },
	    render: {
	    	transparent: true
	    },

	    backgroundColor: '#FFFFFF',
	    parent: 'phaserGameContainer'
	}

	window.GAME = new Phaser.Game(config); 

	GAME.scene.add('generation', Generation, false, {});
	GAME.scene.start('generation', gameConfig);
}

startPhaserGame();