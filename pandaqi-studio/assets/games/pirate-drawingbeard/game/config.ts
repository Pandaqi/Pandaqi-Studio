import { TILE_DICT, DISCRETE_LISTS } from "./dict" 
import Random from "js/pq_games/tools/random/main"
import Point from "js/pq_games/tools/geometry/point";

export const CONFIG =  
{
	_settings:
	{
		playerCount:
		{
			type: SettingType.NUMBER,
			min: 1,
			max: 6,
			default: 4
		},

		useRealMaterial:
		{
			type: SettingType.CHECK,
			label: "Use Real Material",
			remark: "Enable if you're reusing the printed out material sheet."
		},

		createPremadeGame:
		{
			type: SettingType.CHECK,
			label: "Create PDF",
			remark: "Downloads a PDF with a board and hint cards for offline play."
		},

		fastGeneration:
		{
			type: SettingType.CHECK,
			label: "Fast Generation",
			remark: "Produces a game much faster, but can lead to more unfair or chaotic games"
		},

		hints:
		{
			type: SettingType.GROUP,

			rotation:
			{
				type: SettingType.CHECK,
				label: "Rotation Hints"
			},

			special:
			{
				type: SettingType.CHECK,
				label: "Special Hints"
			},

			symbols:
			{
				type: SettingType.CHECK,
				label: "Symbol Hints"
			},

			networks:
			{
				type: SettingType.CHECK,
				label: "Network Hints",
				remark: "Not playable with real/reused material."
			},

			multiHints:
			{
				type: SettingType.CHECK,
				label: "Multi Hints",
				remark: "Players receive 1 hint by default. This allows up to 3. Can make generation faster."
			},

			advancedHints:
			{
				type: SettingType.CHECK,
				label: "Advanced Hints",
				remark: "Adds many types of hints that are really hard to figure out."
			}

		}
	},

		size: new Point(297*3.8, 210*3.8),

	assetsBase: "/pirate-drawingbeard/assets/",
	assets:
	{
		tile_types:
		{
			path: "tile_types.webp",
			frames: new Point(8,2)
		},
	
		tile_types_inkfriendly:
		{
			path: "tile_types_inkfriendly.webp",
			frames: new Point(8,2)
		},
	
		symbols:
		{
			path: "symbols.webp",
			frames: new Point(4,1)
		},
	
		symbols_inkfriendly:
		{
			path: "symbols_inkfriendly.webp",
			frames: new Point(4,1)
		},
	
		hint_cards:
		{
			path: "hint_cards.webp",
			frames: new Point(2,1)
		},
	
		// @NOTE: the assets below are ALSO used by hint visualizer, but they grab it through the phaser instance---this will BREAK DOWN once I remove the Phaser dependency entirely!!!
		// @TODO: ALSO, once we switch to my own system, I can just apply my GrayScale filter and remove all the inkfriendly shenanigans!!!
		hint_base:
		{
			path: "hint_base.webp",
			frames: new Point(8,8)
		},
	
		hint_base_inkfriendly:
		{
			path: "hint_base_inkfriendly.webp",
			frames: new Point(8,8)
		},
	
		hint_tile_type:
		{
			path: "hint_tile_type.webp",
			frames: new Point(8,2)
		},
	
		hint_tile_type_inkfriendly:
		{
			path: "hint_tile_type_inkfriendly.webp",
			frames: new Point(8,2)
		},
	
		hint_quadrant:
		{
			path: "hint_quadrant.webp",
			frames: new Point(4,1)
		},
	
		hint_quadrant_inkfriendly:
		{
			path: "hint_quadrant_inkfriendly.webp",
			frames: new Point(4,1)
		},
	
		hint_bearings:
		{
			path: "hint_bearings.webp",
			frames: new Point(4,1)
		},
	
		hint_bearings_inkfriendly:
		{
			path: "hint_bearings_inkfriendly.webp",
			frames: new Point(4,1)
		},
	
		hint_symbols:
		{
			path: "hint_symbols.webp",
			frames: new Point(4,1)
		},
	
		hint_symbols_inkfriendly:
		{
			path: "hint_symbols_inkfriendly.webp",
			frames: new Point(4,1)
		},
	},

	seed: '',
	fontFamily: "chelsea",
	playerCount: 4,
	addBot: false,
	numGens: 0,

	debugging: false, // @DEBUGGING (should be false)
	debugHintText: true,
	debugTreasureLocation: true,
	useInterface: true, // @DEBUGGING (should be true)
	inkFriendly: true,
	createPremadeGame: false,
	fastGeneration: false,
	invertHintGrid: true,

	generateMap: true,
	generateHints: true,

	pixelwidth: 0,
	pixelheight: 0,
	width: 8,
	height: 4,

	minHintsPerPlayer: 1,
	maxHintsPerPlayer: 1,
	minImpactPerHint: 3,

	minTilesLeftPerHint: 10, // when viewing the hint on its own, how many tiles does it leave/remove on the full map?
	minTilesRemovedPerHint: 3,

	cellSize: 100,
	oX: 0,
	oY: 0,
	totalTileCount: 0,

	rng: {} as Record<string,any>,

	typesIncluded: [],

	expansions: {
		symbols: false,
		networks: false,
		rot: false,
		special: false
	},
	alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
	useRealMaterial: true,
	waterOnlyAtEdges: true,
	advancedHints: false,

	initialize(game:any, config:Record<string,any> = {})
	{
		var savedData = window.localStorage.getItem(config.configKey);
		var parsedData:Record<string,any> = {};
		if(savedData) { parsedData = JSON.parse(savedData); }

		this.seed = parsedData.seed ?? "";
		this.playerCount = parseInt(parsedData.playerCount) ?? 4;
		this.addBot = (this.playerCount <= 2);
		if(this.addBot) { this.playerCount += 1; }

		this.pixelwidth = game.visualizer.size.x;
    	this.pixelheight = game.visualizer.size.y;

		this.expansions = {
			rot: parsedData.expansions.rot ?? false,
			networks: parsedData.expansions.networks ?? false,
			symbols: parsedData.expansions.symbols ?? false,
			special: parsedData.expansions.special ?? false,
		}

		this.maxHintsPerPlayer = 1;
		if(parsedData.multiHints) { this.maxHintsPerPlayer = 3; }
		if(this.addBot) { this.maxHintsPerPlayer = Math.max(this.maxHintsPerPlayer, 3); }

		this.advancedHints = parsedData.advancedHints;
		this.inkFriendly = !parsedData.inkFriendly; // input asks about "Colored?", so reverse it
		this.useRealMaterial = parsedData.useRealMaterial;
		this.createPremadeGame = parsedData.createPremadeGame;
		if(this.createPremadeGame) { this.useInterface = true; }

		this.fastGeneration = parsedData.fastGeneration;
		if(this.fastGeneration) 
		{ 
			this.minImpactPerHint = 1; 
			this.maxHintsPerPlayer = Math.max(this.maxHintsPerPlayer, 3); 
			this.minTilesLeftPerHint = 7;
		}

		this.typesIncluded = Object.keys(TILE_DICT).slice();

    	if(this.useInterface) { this.debugging = false; }

    	this.cellSize = Math.min(Math.floor(this.pixelwidth/this.width), Math.floor(this.pixelheight/this.height))

    	this.oX = (this.pixelwidth - this.width*this.cellSize) * 0.5;
    	this.oY = (this.pixelheight - this.height*this.cellSize) * 0.5;

    	this.totalTileCount = (this.width * this.height);

    	// Dynamically set all options for row/column
    	const columns = [];
    	for(let i = 0; i < this.width; i++) 
		{
    		columns.push(this.alphabet[i]);
    	}
    	DISCRETE_LISTS.column = columns;

    	const rows = [];
    	for(let i = 0; i < this.height; i++)
    	{
    		rows.push(i);
    	}
    	DISCRETE_LISTS.row = rows;
	},

	createRandomNumberGenerators(finalSeed:string, randomSeed:string)
	{
		this.rng = {};
		this.rng.general = Random.seedRandom(finalSeed + "-general");
		this.rng.map = Random.seedRandom(finalSeed + "-map");
		this.rng.hints = Random.seedRandom(finalSeed + "-hints-" + randomSeed);
		this.rng.actions = Random.seedRandom(finalSeed + "-actions");
	},

	getImageIDFromHint(hint)
	{
		return hint.id + "_" + hint.numericID;
	},
};