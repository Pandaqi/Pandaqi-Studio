import { TILE_DICT, DISCRETE_LISTS } from "./dictionary" 
import Random from "js/pq_games/tools/random/main"

export default 
{
	seed: '',
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
		rotation: false,
		special: false
	},
	alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
	useRealMaterial: true,
	waterOnlyAtEdges: true,
	advancedHints: false,

	initialize(game:any, config:Record<string,any> = {})
	{
		var savedData = window.localStorage.pirateDrawingbeardConfig;
		var parsedData:Record<string,any> = {};
		if(savedData) { parsedData = JSON.parse(savedData); }

		this.seed = parsedData.seed ?? "";
		this.playerCount = parseInt(parsedData.playerCount) ?? 4;
		this.addBot = (this.playerCount <= 2);
		if(this.addBot) { this.playerCount += 1; }

		this.pixelwidth = game.canvas.width
    	this.pixelheight = game.canvas.height

		this.expansions = {
			rotation: parsedData.expansions.rotation ?? false,
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

	}
};