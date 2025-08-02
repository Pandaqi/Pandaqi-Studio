import LayoutOperation from "js/pq_games/layout/layoutOperation";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import ResourceShape from "js/pq_games/layout/resources/resourceShape";
import ResourceText from "js/pq_games/layout/resources/resourceText";
import TextConfig, { TextAlign } from "js/pq_games/layout/text/textConfig";
import StrokeAlign from "js/pq_games/layout/values/strokeAlign";
import PdfBuilder from "js/pq_games/pdf/pdfBuilder";
import { PageOrientation } from "js/pq_games/pdf/pdfEnums";
import MaterialVisualizer from "js/pq_games/tools/generation/MaterialVisualizer";
import Line from "js/pq_games/tools/geometry/line";
import Point from "js/pq_games/tools/geometry/point";
import Rectangle from "js/pq_games/tools/geometry/rectangle";
import seedRandom from "js/pq_games/tools/random/seedrandom";
import Cell from "./cell";
import { HINTS, HINT_ICONS, LANDMARKS, LISTS, NATURE, QUADRANTS, ROADS, STONES, TERRAINS, TERRAIN_DATA, alphabet } from "./dictionary";
import Interface from "./interface";

type Hint = { final_text?: string, html_text?: string }

export default class BoardGeneration
{
	visualizer: MaterialVisualizer
	cfg: Record<string,any>
	AVAILABLE_HINTS: any
	hintsGenerationFail: boolean
	map: Cell[][]
	mapList: Cell[]
	LOST_RIDDLES: any
	hintsPerPlayer: any
	tilesLeftPerPlayer: any
	botHintCategories: any
	FALSE_SQUARES: Cell[]
	TRUTH_SQUARES: Cell[]
	TINY_TREASURES: Cell[]
	hintGenerationTries: number
	maxHintGenerationTries: number
	numMapGenerations: number
	mapGenerationFail: boolean
	TREASURE: Cell
	roadLocations: Cell[]
	treasure: Cell
	hints: any
	landmarkCells: {}
	fixedData: { terrain: string; nature: string; stones: number|string; landmark: string; road: string }
	fontFamily = "chelsea"

    async start(vis:MaterialVisualizer) 
	{
		await vis.resLoader.loadPlannedResources();

		this.visualizer = vis;
    	this.generateConfiguration(vis.config);

		const div = document.createElement("div");
		div.id = "game-canvases-container";
		const container = document.getElementsByTagName("main")[0];
		container.insertBefore(div, container.firstChild);

    	let algo = 'forward';
    	if(Math.random() <= 0.1) { algo = 'backward'; }
    	if(this.cfg.expansions.theLostRiddles) { algo = 'forward'; }

    	this.cfg.algorithm = algo; 
    	this.AVAILABLE_HINTS = structuredClone(HINTS);

    	// remove any categories that aren't in this game anyway
    	// (useful for creating lower difficulty games with less hint diversity)
    	for(const category in this.AVAILABLE_HINTS) 
		{
    		if(this.cfg.hintCategories.includes(category)) { continue; }
    		delete this.AVAILABLE_HINTS[category];
    	}

    	// remove "advanced" hints if this option isn't enabled
    	if(!this.cfg.advancedHints) 
		{
    		for(const category in this.AVAILABLE_HINTS) 
			{
    			for(let i = this.AVAILABLE_HINTS[category].length-1; i >= 0; i--) 
				{
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

    	const timeout = 12;
    	let interval;
		let mainGenerationAction = () => 
		{
		    this.generateBoard();

			this.hintGenerationTries = 0;
			this.maxHintGenerationTries = 50;
			
			let foundSolution = false;
			console.log("(Re)trying hint generation")

	    	while(this.hintsGenerationFail && this.hintGenerationTries < this.maxHintGenerationTries) 
			{
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

	    	if(foundSolution) 
			{ 
	    		clearInterval(interval); 
	    		this.finishCreation();
	    	}
		};

		interval = setInterval(mainGenerationAction.bind(this), timeout);
	}

	async finishCreation()
	{
		this.addLiarsCouncilHints();
	    this.addTinyTreasuresHints();
	    this.calculateBotbeardInformation();

		let shortstring = this.convertToStringCoordinates(this.treasure); 
		let longstring = "(x = " + (this.treasure.x+1) + ", y = " + (this.treasure.y+1) + ")"
		let treasureCoords = shortstring + " " + longstring

		// save loads of data somewhere else, so we can close the game before starting the interface
		const config = 
		{
			treasureCoords: treasureCoords,
			map: this.map,
			leftoverHints: this.LOST_RIDDLES,
			hintsPerPlayer: this.hintsPerPlayer,
			tilesLeftPerPlayer: this.tilesLeftPerPlayer,
			allLocationsAsStrings: this.getAllLocationsAsStrings(),
			botData: 
			{
				categories: this.botHintCategories
			}
		}
		Object.assign(config, this.cfg);

		// @NOTE: still add/start UI even on premade game, to give feedback about that process to user!
		const ui = new Interface(config);
		ui.start();

		if(this.cfg.premadeGame) {
			this.visualizePremadeGame();
		} else {
			this.visualizeHybridGame();
		}
	}

	async visualizePremadeGame()
	{
		// create actual images
		const groupMap = this.visualizeGame();
		const groupHints = this.visualizeHintCards();
		const imgMap = await this.visualizer.finishDraw(groupMap);
		const imgHints = await this.visualizer.finishDraw(groupHints);

		// download as PDF
		const pdfImages = [imgMap, imgHints].flat();
		const pdfBuilder = new PdfBuilder({ orientation: PageOrientation.LANDSCAPE });
		for(const img of pdfImages)
		{
			pdfBuilder.addImage(img);
		}

		const pdfParams = { customFileName: "[Pirate Riddlebeard] Premade Game" };
		pdfBuilder.downloadPDF(pdfParams);
	}

	async visualizeHybridGame()
	{
		// create actual images
		const groupMap = this.visualizeGame();
		const groupSolution = this.visualizeTreasureOnly();
		const imgMap = await this.visualizer.finishDraw(groupMap);
		const imgSolution = await this.visualizer.finishDraw(groupSolution);

		// add to page
		const gameImagesContainer = document.getElementById("game-canvases-container");
		const div1 = document.createElement("div");
		div1.id = 'mainMap';
		div1.classList.add('mapImageContainer');
		gameImagesContainer.appendChild(div1);

		const div2 = document.createElement("div");
		div2.id = 'solutionMap';
		div2.classList.add('mapImageContainer');
		div2.style.display = "none";
		gameImagesContainer.appendChild(div2);

		div1.appendChild(imgMap[0]);
		div2.appendChild(imgSolution[0]);
		gameImagesContainer.style.display = 'none';
	}

	calculateBotbeardInformation()
	{
		if(!this.cfg.addBot) { return; }

		// first just save which squares CAN be the treasure according to the bot hints
		let locs = this.mapList.slice();
		let botHints = this.hintsPerPlayer[this.hintsPerPlayer.length - 1];
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
		let numProposeChecks = 350;
		let proposalExtraChangeProb = 0.55;
		for(let i = 0; i < numProposeChecks; i++)
		{
			const tileA = this.mapList[Math.floor(Math.random() * this.mapList.length)];
			const oldTileA = structuredClone(tileA);
			const otherPos = new Point(tileA.x, tileA.y);
			otherPos.x = Math.max(Math.min(otherPos.x - 2 + Math.floor(Math.random()*5), this.cfg.width-1), 0);
			otherPos.y = Math.max(Math.min(otherPos.y - 2 + Math.floor(Math.random()*5), this.cfg.height-1), 0);

			let tileB = this.map[otherPos.x][otherPos.y];
			const posAsString = this.convertToStringCoordinates(otherPos);
			const alreadyCheckedThisTileAndItsTrue = (posAsString in tileA.proposeData) && tileA.proposeData[posAsString].changed;
			const pickExtremeTileB = (Math.random() <= 0.1) || (alreadyCheckedThisTileAndItsTrue);
			if(pickExtremeTileB) {
				tileB = this.mapList[Math.floor(Math.random() * this.mapList.length)];
			}

			const proposal : Record<string,any> = {};
			const originalAnswer = tileB.botPositive;
			const list = [tileB];

			if(Math.random() <= 0.66) 
			{
				tileA.nature = this.getRandomNature([tileA.nature]);
				proposal.nature = tileA.nature;
			}

			if(this.cfg.elements.stones && Math.random() <= proposalExtraChangeProb) 
			{
				tileA.stones = this.getRandomStones([tileA.stones]);
				proposal.stones = tileA.stones;
			}

			if(this.cfg.elements.landmarks && Math.random() <= proposalExtraChangeProb) 
			{
				tileA.landmark = this.getRandomLandmark([tileA.landmark]);
				proposal.landmark = tileA.landmark;
			}
			
			if(this.cfg.elements.roads && Math.random() <= proposalExtraChangeProb) 
			{
				tileA.road = this.getRandomRoad([tileA.road]);
				proposal.road = tileA.road;
			}

			let nothingChangedYet = (Object.keys(proposal).length == 0);
			if(nothingChangedYet || Math.random() <= 0.66) 
			{
				tileA.terrain = this.getRandomTerrain([tileA.terrain]);
				proposal.terrain = tileA.terrain;
			}
			
			for(let h = 0; h < botHints.length; h++) 
			{
				this.removeInvalidLocationsDueToHint(list, botHints[h]);
			}

			const newAnswer = (list.length > 0);

			tileA.nature = oldTileA.nature;
			tileA.stones = oldTileA.stones;
			tileA.landmark = oldTileA.landmark;
			tileA.road = oldTileA.road;
			tileA.terrain = oldTileA.terrain;

			const changed = (originalAnswer != newAnswer);
			proposal.changed = changed;
			tileA.proposeData[this.convertToStringCoordinates(tileB)] = proposal;
		}
	}

	getAllLocationsAsStrings()
	{
		const list = this.mapList.slice();
		const arr = [];
		for(let i = 0; i < list.length; i++)
		{
			arr.push( this.convertToStringCoordinates(list[i]) );
		}
		return arr;
	}

	addLiarsCouncilHints()
	{
		if(!this.cfg.expansions.liarsCouncil) { return; }

		// randomly hand false squares to players
		let falseSquaresPerPlayer = [];
		for(let i = 0; i < this.cfg.playerCount; i++)
		{
			falseSquaresPerPlayer.push([]);
		}

		while(this.FALSE_SQUARES.length > 0) 
		{
			let randPlayer = Math.floor(this.cfg.rng.hints() * this.cfg.playerCount);
			let square = this.FALSE_SQUARES[this.FALSE_SQUARES.length - 1];
			let string = this.convertToStringCoordinates(square);

			if(falseSquaresPerPlayer[randPlayer].includes(string)) 
			{ 
				this.FALSE_SQUARES.pop();
				continue;
			}

			falseSquaresPerPlayer[randPlayer].push(string);
			if(this.cfg.rng.hints() <= 0.75) { this.FALSE_SQUARES.pop(); }
		}

		// randomly hand truth squares to players
		let truthSquaresPerPlayer = [];
		for(let i = 0; i < this.cfg.playerCount; i++)
		{
			truthSquaresPerPlayer.push([]);
		}

		while(this.TRUTH_SQUARES.length > 0) 
		{
			let randPlayer = Math.floor(this.cfg.rng.hints() * this.cfg.playerCount);
			let square = this.TRUTH_SQUARES[this.TRUTH_SQUARES.length - 1];
			let string = this.convertToStringCoordinates(square);

			if(truthSquaresPerPlayer[randPlayer].includes(string)) 
			{ 
				this.TRUTH_SQUARES.pop();
				continue;
			}

			truthSquaresPerPlayer[randPlayer].push(string);
			if(this.cfg.rng.hints() <= 0.75) { this.TRUTH_SQUARES.pop(); }
		}

		// convert them into hints, stick them to the end
		for(let i = 0; i < this.cfg.playerCount; i++)
		{
			let falseSquares = falseSquaresPerPlayer[i];
			let hint : Hint = {};

			if(falseSquares.length > 0) 
			{
				hint.final_text = "These are FALSE squares: " + falseSquares.join(", ");
				hint.html_text = hint.final_text;
				this.hintsPerPlayer[i].push(hint);
			}

			let truthSquares = truthSquaresPerPlayer[i];
			if(truthSquares.length > 0) 
			{
				hint.final_text = "These are TRUTH squares: " + truthSquares.join(", ");
				hint.html_text = hint.final_text;
				this.hintsPerPlayer[i].push(hint);
			}
		}
	}

	addTinyTreasuresHints()
	{
		if(!this.cfg.expansions.tinyTreasures) { return; }

		for(let i = 0; i < this.cfg.playerCount; i++)
		{
			let space = this.TINY_TREASURES[i];
			let hint : Hint = {};
			hint.final_text = "There's a tiny treasure here: " + this.convertToStringCoordinates(space);
			hint.html_text = hint.final_text
			this.hintsPerPlayer[i].push(hint);
		}
	}

	distributeHintsAcrossPlayers()
	{
		// this.hints is a dictionary with key = category, value = list of all hints in that category
		let categories = Object.keys(this.hints);
		this.shuffle(categories);

		let hintsPerPlayer = [];
		for(let i = 0; i < this.cfg.playerCount; i++)
		{
			hintsPerPlayer[i] = [];
		}

		let curPlayer = Math.floor(this.cfg.rng.hints() * this.cfg.playerCount);
		for(let i = 0; i < categories.length; i++)
		{
			let category = categories[i];
			let list = this.hints[category];
			this.shuffle(list);

			for(let a = 0; a < list.length; a++)
			{
				hintsPerPlayer[curPlayer].push(list[a]);
				curPlayer = (curPlayer + 1) % this.cfg.playerCount;
			}
		}

		this.hintsPerPlayer = hintsPerPlayer;

		if(this.cfg.debugging) { console.log("HINTS PER PLAYER"); console.log(this.hintsPerPlayer); }
	}

	checkHintValueBalance()
	{
		let offset = 0;
		let t = this.hintGenerationTries;
		let m = this.maxHintGenerationTries;
		if(t >= 0.7*m) { offset = 1; }
		if(t >= 0.8*m) { offset = 2; }
		if(t >= 0.9*m) { offset = 3; }

		if(this.cfg.playerCount == 5) { offset += 1; }
		else if(this.cfg.playerCount == 6) { offset += 2; }

		let tilesLeft : number[] = [];

		let minOptionsLeft = Math.round(0.33*this.cfg.totalTileCount); // min options is the more important number, so no offset change here
		let maxOptionsLeft = Math.round(0.75*this.cfg.totalTileCount) + offset;

		let failIfOptionsNotBalanced = (this.numMapGenerations < 20);

		this.tilesLeftPerPlayer = [];

		let failed = false;
		for(let i = 0; i < this.hintsPerPlayer.length; i++)
		{
			const hints = this.hintsPerPlayer[i];
			const locs = this.mapList.slice();
			
			for(let h = 0; h < hints.length; h++)
			{
				let prevNumSolutions = locs.length;
				this.removeInvalidLocationsDueToHint(locs, hints[h]);
				if(Math.abs(prevNumSolutions - locs.length) < this.cfg.minImpactPerHint && this.cfg.forbidUselessHintsPerPlayer) {
					failed = true;
					break;
				}
			}

			const value = locs.length;
			tilesLeft.push(value);

			this.tilesLeftPerPlayer.push(locs);

			if(value < minOptionsLeft) { failed = true; }
			if(value > maxOptionsLeft && failIfOptionsNotBalanced) { failed = true; }
			if(failed) { break; }
		}

		if(failed) { this.hintsGenerationFail = true; return; }
		if(this.cfg.debugging) { console.log("TILES LEFT PER PLAYER"); console.log(tilesLeft); }
		if(!failIfOptionsNotBalanced) { return; }

		const maxDifference = Math.round(0.3*this.cfg.totalTileCount) + offset;
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
	}

	/*
		GENERATION
	*/
	generateConfiguration(config = {})
	{
		let data = JSON.parse(window.localStorage.pirateRiddlebeardData);

    	this.cfg = 
    	{
    		seed: data.seed ?? "",
    		debugging: false, // @DEBUGGING (should be false)
    		premadeGame: data.premadeGame,
    		useInterface: true, //@DEBUGGING (should be true)
    		inkFriendly: true,

    		pixelwidth: this.visualizer.size.x,
    		pixelheight: this.visualizer.size.y,
    		width: 8,
    		height: 4,

    		playerCount: data.playerCount ?? 4,
    		addBot: (data.playerCount <= 2),
    		minHintsPerPlayer: 1,
			maxHintsPerPlayer: 1,
			minImpactPerHint: 3, // how many squares each hint should REMOVE, at least
			forbidUselessHintsPerPlayer: true,

			treePercentage: 0.15,
			flowerPercentage: 0.15,
			stonesPercentage: 0.33,
			roadPercentage: 0.5,
			hintCategories: [],

			multiHint: data.multiHint,
			advancedHints: data.advancedHints,
			invertHintGrid: true, // on premade hint cards, marks all squares which can NOT be the treasure, instead of those that COULD be it

			elements: {
				allTerrains: data.allTerrains,
				stones: data.includeStones,
				roads: data.includeRoads,
				landmarks: data.includeLandmarks
			},

			expansions: {
				liarsCouncil: data.expansions.liarsCouncil,
				theLostRiddles: data.expansions.theLostRiddles,
				tinyTreasures: data.expansions.tinyTreasures,
				gamblerOfMyWord: data.expansions.gamblerOfMyWord
			},

			wrapBoard: false, // experimental
    	}

    	if(this.cfg.wrapBoard) { console.error("CAUTION! Board wrapping is turned ON"); }

    	// Not 100% sure this is better, but at least it leads to better generation
    	// And it feels like some players with fewer hints is a good simplification for the game
    	if(this.cfg.multiHint) 
		{
    		this.cfg.minHintsPerPlayer = 1;
    		this.cfg.maxHintsPerPlayer = 2.5;
    	}

    	if(this.cfg.premadeGame) 
		{
    		this.cfg.useInterface = false;
    		this.cfg.debugging = false;
    	}

    	// 12x6 is certainly bigger than the usual board, but not enormously so
    	if(data.isColored) 
		{
    		this.cfg.inkFriendly = false;

    		this.cfg.width = 12;
    		this.cfg.height = 6;
    	}

    	if(this.cfg.useInterface) 
		{
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
    	if(this.cfg.addBot) { this.cfg.playerCount += 1; }

    	// calculate the row/column lists dynamically here, as it depends on board size
    	// (all other lists are static and saved in dictionary.js)
    	const rows : number[] = [];
    	for(let i = 0; i < this.cfg.height; i++) 
		{
    		rows.push((i+1)); // stupid humans starting to count at 1
    	}

    	const cols : string[] = [];
    	for(let i = 0; i < this.cfg.width; i++) 
		{
    		cols.push(alphabet[i]);
    	}

    	LISTS.row = rows;
    	LISTS.column = cols;

    	// on ink friendly maps, there can only be 4 stones at most on a cell
    	if(this.cfg.inkFriendly) 
		{
    		STONES.splice(STONES.indexOf(4), 1);
    		LISTS.stones = STONES;
    	}

    	// on first/basic maps, we only use the first X terrains
    	if(!this.cfg.elements.allTerrains) 
		{
    		TERRAINS.splice(3);
    		LISTS.terrain = TERRAINS
    	}
	}

	generateBoard() 
	{
		this.mapGenerationFail = true
		this.numMapGenerations = 0;

		while(this.mapGenerationFail) 
		{
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
	}

	determineSeed() 
	{
		const randomSeedLength = Math.floor(Math.random() * 10) + 2;
		const randomSeed = Math.random().toString(36).replace(/[^a-z]+/g, '').slice(0, randomSeedLength);

		if(this.cfg.seed == '') { this.cfg.seed = randomSeed; }
		const finalSeed = this.cfg.seed;

		this.cfg.seed = finalSeed; 
		this.cfg.rng = {};
		this.cfg.rng.general = seedRandom(finalSeed + "-general");
		this.cfg.rng.map = seedRandom(finalSeed + "-map");
		this.cfg.rng.hints = seedRandom(finalSeed + "-hints-" + randomSeed);
	}

	prepareGrid() 
	{
		this.map = [];
		this.mapList = [];

		for(let x = 0; x < this.cfg.width; x++) 
		{
			this.map[x] = [];

			for(let y = 0; y < this.cfg.height; y++) 
			{
				const quadrant = Math.floor(2 * x / this.cfg.width) + Math.floor(2 * y / this.cfg.height)*2;
				const isEdge = (x == 0 || x == (this.cfg.width-1)) || (y == 0 || y == (this.cfg.height-1));

				const cell = new Cell();
				cell.setPosition(new Point(x,y));
				cell.setLabelData((y+1).toString(), alphabet[x]);
				cell.setGridData(isEdge, quadrant);

				this.map[x][y] = cell;
			}
		}

		this.mapList = this.map.flat();

		// saving all our (valid) neighbours once at the start saves a lot of time (and for loops) later on
		let nbCoords = [new Point(1,0), new Point(0,1), new Point(-1,0), new Point(0,-1)]
		for(let x = 0; x < this.cfg.width; x++) 
		{
			for(let y = 0; y < this.cfg.height; y++) 
			{
				
				const nbs = [];
				for(const nbCoord of nbCoords) 
				{
					const newPos = new Point( x + nbCoord.x, y + nbCoord.y);
					if(this.cfg.wrapBoard) 
					{
						newPos.x = (newPos.x + this.cfg.width) % this.cfg.width;
						newPos.y = (newPos.y + this.cfg.height) % this.cfg.height;
					}

					if(this.outOfBounds(newPos)) { continue; }
					nbs.push(this.map[newPos.x][newPos.y]);
				}

				this.map[x][y].nbs = nbs;
			}
		}
	}

	createTerrain() 
	{

		if(this.cfg.debugging) { console.log(" => Creating terrain ... "); }

		// randomly place some starting dots for each terrain
		let numDots = Math.floor(0.5 * Math.pow(this.cfg.totalTileCount, 0.5));
		let numStartingDots = numDots;
		let minDistBetweenSameTerrain = Math.round(Math.sqrt(numStartingDots));
		let allLocations = this.mapList.slice();
		let filledLocations = {};
		let numFilledLocations = 0;

		this.shuffle(allLocations);

		for(let t = 0; t < TERRAINS.length; t++) {
			let curTerrain = TERRAINS[t];

			for(let i = 0; i < numStartingDots; i++) {
				let loc = allLocations.pop();

				if(!(curTerrain in filledLocations)) 
				{
					filledLocations[curTerrain] = [];
				}

				if(!this.minDistanceApart(loc, filledLocations[curTerrain], minDistBetweenSameTerrain)) 
				{
					allLocations.unshift(loc);
					continue;
				}

				loc.terrain = curTerrain;
				filledLocations[curTerrain].push(loc);
				numFilledLocations += 1;
			}
		}

		// now keep growing random squares until the board is filled
		let boardFilled = false;
		while(!boardFilled) 
		{
			let randTerrain = this.getRandomTerrain();
			if(!(randTerrain in filledLocations)) { continue; }

			let numOptions = filledLocations[randTerrain].length;

			if(numOptions <= 0) { continue; }

			let idx = Math.floor(this.cfg.rng.map() * numOptions);
			let loc = filledLocations[randTerrain][idx];
			let newTerrain = loc.terrain;
			let nbs = this.getEmptyNeighbors(loc, ["terrain"]);

			let completelySurrounded = (nbs.length == 0);
			if(completelySurrounded) {
				filledLocations[randTerrain].splice(idx, 1);
				continue;
			}

			let newLoc = nbs[Math.floor(this.cfg.rng.map() * nbs.length)];
			newLoc.terrain = newTerrain;

			filledLocations[newTerrain].push(newLoc);
			numFilledLocations += 1;

			boardFilled = (numFilledLocations >= this.cfg.totalTileCount);
		}

		// SAFETY CHECK: if a terrain is severely underrepresented, we fail the generation
		// (1.0/TERRAINS) is what we'd expect on average, if it falls below 10% of that, we deem it a bad situation
		let minCellsPerTerrain = Math.round( (0.1 * (1.0/TERRAINS.length)) * (this.cfg.width * this.cfg.height) );

		for(const terrain in filledLocations) {
			if(filledLocations[terrain].length < minCellsPerTerrain) {
				this.mapGenerationFail =  true;
				break;
			}
		}

	}

	createNature() {
		if(this.cfg.debugging) { console.log(" => Creating nature ... "); }

		let noNatureAllowed = (!this.cfg.hintCategories.includes("nature"));
		if(noNatureAllowed) { return; }

		// create starting nature
		let startingDots = Math.floor(0.6 * Math.pow(this.cfg.totalTileCount, 0.5));

		let numStartingTrees = startingDots;
		let numStartingFlowers = startingDots;
		let minDistBetweenNature = Math.round(Math.sqrt(startingDots));
		let allLocations = this.mapList.slice();
		this.shuffle(allLocations);

		let nature = { 
			"tree": [],
			"flower": []
		}

		for(let i = 0; i < numStartingTrees; i++)
		{
			let badCell = true;
			let cell;
			
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
			let badCell = true;
			let cell;
			while(badCell && allLocations.length > 0) {
				cell = allLocations.pop();
				badCell = this.natureIsForbidden(cell, "flower") || !this.minDistanceApart(cell, nature.flower, minDistBetweenNature)
			}

			if(badCell) { break; }

			cell.nature = 'flower';
			nature.flower.push(cell);
		}

		// now grow this until we have enough
		let targetTrees = Math.floor((0.8 + 0.4*this.cfg.rng.map()) * this.cfg.treePercentage * (this.cfg.totalTileCount));
		let targetFlowers = Math.floor((0.8 + 0.4*this.cfg.rng.map()) * this.cfg.flowerPercentage * (this.cfg.totalTileCount));

		let totalNum = { 
			'tree': nature.tree.length,
			'flower': nature.flower.length
		};

		let numTries = 0;
		let maxTries = 100;

		while(numTries < maxTries)
		{
			let type = 'tree';
			let enoughTrees = (totalNum.tree >= targetTrees);
			let enoughFlowers = (totalNum.flower >= targetFlowers);
			if(this.cfg.rng.map() <= 0.5 || enoughTrees) { type = 'flower'; }

			numTries += 1;

			if(enoughTrees && enoughFlowers) { break; }
			if(nature[type].length <= 0) { break; }

			let idx = Math.floor(this.cfg.rng.map() * nature[type].length);
			let loc = nature[type][idx];
			let nbs = this.getEmptyNeighbors(loc, ["nature", "road", "landmark"]);

			for(let i = nbs.length-1; i >= 0; i--)
			{
				if(this.natureIsForbidden(nbs[i], type)) {
					nbs.splice(i,1);
				}
			}

			let completelySurrounded = (nbs.length == 0);
			if(completelySurrounded) { 
				nature[type].splice(idx, 1);
				continue;
			}

			let newLoc = nbs[Math.floor(this.cfg.rng.map() * nbs.length)];
			newLoc.nature = type;
			nature[type].push(newLoc);
			totalNum[type] += 1;

		}
	}

	createLiarsCouncil()
	{
		if(!this.cfg.expansions.liarsCouncil) { return; }

		const allLocs = this.mapList.slice();
		this.shuffle(allLocs);

		const numFalseSquares = Math.round( (this.cfg.rng.map()*0.33 + 0.33)*this.cfg.playerCount )
		const numTruthSquares = Math.round( (this.cfg.rng.map()*0.33 + 0.33)*this.cfg.playerCount )

		this.FALSE_SQUARES = [];
		for(let i = 0; i < numFalseSquares; i++)
		{
			let square = allLocs.pop();
			if(square == this.TREASURE) { continue; }
			square.falseSquare = true;
			this.FALSE_SQUARES.push(square);
		}

		this.TRUTH_SQUARES = [];
		for(let i = 0; i < numTruthSquares; i++)
		{
			let square = allLocs.pop();
			if(square == this.TREASURE) { continue; }
			square.truthSquare = true;
			this.TRUTH_SQUARES.push(square);
		}

		if(this.cfg.debugging) 
		{
			console.log("FALSE/TRUTH SQUARES");
			console.log(this.FALSE_SQUARES);
			console.log(this.TRUTH_SQUARES);
		}
	}

	createTinyTreasures()
	{
		if(!this.cfg.expansions.tinyTreasures) { return; }

		let allLocs = this.mapList.slice();
		this.shuffle(allLocs);

		this.TINY_TREASURES = [];

		for(let i = 0; i < this.cfg.playerCount; i++)
		{
			let square = allLocs.pop();
			if(square == this.TREASURE) { continue; }
			square.tinyTreasure = true;
			this.TINY_TREASURES.push(square);
		}

		if(this.cfg.debugging) { console.log("TINY TREASURES"); console.log(this.TINY_TREASURES); }
	}

	natureIsForbidden(cell:Cell, type:string)
	{
		if(!TERRAIN_DATA[cell.terrain].nature.includes(type)) { return true; }
		if(cell.nature != '') { return true; } // already has nature check ... is this okay?
		if(cell.road != '') { return true; }
		if(cell.landmark != '') { return true; }
		return false;
	}

	minDistanceApart(cell:Cell, list:Cell[], dist:number)
	{
		for(const otherCell of list)
		{
			if(this.distBetweenCells(cell, otherCell) < dist) { return false; }
		}
		return true;
	}

	distBetweenCells(a:Cell, b:Cell)
	{
		return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
	}

	createStones() 
	{
		if(this.cfg.debugging) { console.log(" => Creating stones ... "); }

		const noStonesAllowed = (!this.cfg.hintCategories.includes("stones"));
		if(noStonesAllowed) { return; }

		const numStones = Math.floor( (0.8 + this.cfg.rng.map()*0.4) * this.cfg.stonesPercentage * (this.cfg.width * this.cfg.height));

		const stonesPerNumber = [0,0,0,0,0];
		stonesPerNumber[4] = 1 + Math.round(this.cfg.rng.map());
		stonesPerNumber[3] = Math.floor((0.1 + 0.1*this.cfg.rng.map()) * numStones);
		stonesPerNumber[2] = Math.floor((0.2 + 0.2*this.cfg.rng.map()) * numStones);
		stonesPerNumber[1] = numStones - stonesPerNumber[2] - stonesPerNumber[3] - stonesPerNumber[4];

		if(this.cfg.inkFriendly) 
		{
			stonesPerNumber[3] += stonesPerNumber[4];
			stonesPerNumber[4] = 0;
		}

		for(let i = 1; i < stonesPerNumber.length; i++)
		{
			for(let a = 0; a < stonesPerNumber[i]; a++) 
			{
				let cell = null;
				let badCell = true;

				while(badCell) 
				{
					cell = this.getRandomCell(this.cfg.rng.map);
					badCell = (cell.stones > 0);
				}

				cell.stones = i;
			}
		}
	}

	createRoads() 
	{
		if(this.cfg.debugging) { console.log(" => Creating roads ... "); }

		const noRoadsAllowed = (!this.cfg.hintCategories.includes("roads"));
		if(noRoadsAllowed) { return; }

		const numRoadSequences = Math.max(Math.floor(this.cfg.roadPercentage * (0.6 + 0.4*this.cfg.rng.map()) * Math.pow(this.cfg.totalTileCount, 0.5)), 1);
		const maxRoadLength = Math.max( Math.floor(0.8 * Math.pow(this.cfg.totalTileCount, 0.5)), 4); 

		const edgeCells = this.generateListWithEdgeLocations();
		const landmarkCells = this.generateListWithLandmarkLocations();
		const startCells = edgeCells;
		startCells['landmark'] = landmarkCells;

		this.roadLocations = [];

		// NOTE TO SELF: I've found this to be the cleanest and easiest way to get the correct orientation for corners in roads
		// No calculating, no checks, no annoying tricks, just a lookup in a fixed matrix
		// (And if it shows the result 'X' somewhere, I know there must be a terrible bug in the code and can easily find it)
		let cornerMatrix = [
			['X',   0, 'X',   3],
			[  2, 'X',   3, 'X'],
			['X',   1, 'X',   2],
			[  1, 'X',   0, 'X']
		];

		const locationCategories = ['left', 'top', 'right', 'bottom', 'landmark'];
		this.shuffle(locationCategories);

		let curLocationIndex = 0;
		for(let i = 0; i < numRoadSequences; i++)
		{
			const curLocation = locationCategories[curLocationIndex];
			curLocationIndex = (curLocationIndex + 1) % locationCategories.length;

			if(startCells[curLocation].length <= 0) { continue; }
			
			let oldCell;
			let badCell;
			do {
				oldCell = startCells[curLocation].pop();
				badCell = oldCell.road != '' || !this.minDistanceApart(oldCell, this.roadLocations, 3);
			} while(badCell && startCells[curLocation].length > 0);

			if(startCells[curLocation].length <= 0) { continue; }
	
			let curRoad = [oldCell];
			let roadDirs = [this.getDirFromEdge(oldCell)];
			let tempMinRoadLength = Math.max(Math.round(0.4 * Math.sqrt(this.cfg.totalTileCount)), 3);
			let tempMaxRoadLength = Math.min(Math.floor(this.cfg.rng.map() * maxRoadLength) + tempMinRoadLength, maxRoadLength);

			while(true)
			{
				const nbs = this.getEmptyNeighbors(oldCell, ["road", "landmark"]);
				if(nbs.length == 0) { break; }

				const newCell = nbs[Math.floor(this.cfg.rng.map() * nbs.length)];
				const dir = this.findDirBetweenCells(oldCell, newCell);
				const lastDir = roadDirs[roadDirs.length - 1];
				curRoad.push(newCell);
				roadDirs.push(dir);

				const roadData = this.calculateRoadData(lastDir, dir, cornerMatrix, oldCell);

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

			if(oldCell.isEdge) 
			{
				let lastDir = roadDirs[roadDirs.length - 1];
				let dir = (this.getDirFromEdge(oldCell) + 2) % 4;
				let roadData = this.calculateRoadData(lastDir, dir, cornerMatrix, oldCell);

				oldCell.road = roadData.type;
				oldCell.roadOrient = roadData.orient;
			}

			// if the road ended up too short, just completely delete and undo
			const tooShort = (curRoad.length < tempMinRoadLength);
			if(tooShort) 
			{
				for(let a = 0; a < curRoad.length; a++) {
					curRoad[a].road = '';
					curRoad[a].roadOrient = -1;
					this.roadLocations.pop();
				}
				i -= 1;
			}
		}
	}

	getDirFromEdge(cell:Cell)
	{
		let dir = 0;
		if(cell.x == 0) { dir = 0; }
		else if(cell.x == (this.cfg.width-1)) { dir = 2; }
		else if(cell.y == 0) { dir = 3; }
		else if(cell.y == (this.cfg.height-1)) { dir = 1; }
		return dir;
	}

	calculateRoadData(lastDir, dir, matrix, cell:Cell)
	{
		let roadType = 'straight';
		if(dir != lastDir) { roadType = 'corner'; }

		let orient = lastDir;
		if(roadType == 'corner') {
			orient = matrix[lastDir][dir];
		}

		// the road didn't start from the edge? always a dead end
		if(orient == 'X' || cell.landmark != '') { 
			roadType = 'dead end';
			orient = -((dir + 2) % 4);
		}

		return {
			type: roadType,
			orient: orient
		}
	}

	findDirBetweenCells(oldCell:Cell, newCell:Cell)
	{
		const vector = [newCell.x - oldCell.x, newCell.y - oldCell.y];
		if(vector[0] == 1) { return 0; }
		else if(vector[0] == -1) { return 2; }
		else if(vector[1] == -1) { return 1; }
		return 3;
	}

	createLandmarks() 
	{
		if(this.cfg.debugging) { console.log(" => Creating landmarks ... "); }

		this.landmarkCells = {}; // general dictionary used to quickly access which landmarks are where during hint generation

		const noLandmarksAllowed = (!this.cfg.hintCategories.includes("landmarks"))
		if(noLandmarksAllowed) { return; }

		const landmarks = LANDMARKS.slice();
		this.shuffle(landmarks);
		if(this.cfg.rng.map() <= 0.5) { landmarks.pop(); }

		const minDistBetweenLandmarks = 2;
		const placedLandmarks = [];
		for(let i = 0; i < landmarks.length; i++)
		{
			let cell = null;
			let badCell = true;

			while(badCell) 
			{
				cell = this.getRandomCell(this.cfg.rng.map);
				badCell = !this.minDistanceApart(cell, placedLandmarks, minDistBetweenLandmarks);
			}

			let type = landmarks[i];
			cell.landmark = type;
			placedLandmarks.push(cell);

			this.landmarkCells[type] = cell;
		}
	}

	getRandomCell(RNG) 
	{
		let x = Math.floor(RNG() * this.cfg.width);
		let y = Math.floor(RNG() * this.cfg.height);
		return this.map[x][y];
	}

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
	generateInstructionsForward() 
	{
		let allLocations = this.mapList.slice();
		let location = allLocations[Math.floor(this.cfg.rng.hints() * allLocations.length)];

		if(this.cfg.debugging) { console.log("TREASURE LOCATION"); console.log(location); }

		let hints = {};
		for(const category in this.AVAILABLE_HINTS) 
		{
			hints[category] = [];

			for(let i = 0; i < this.AVAILABLE_HINTS[category].length; i++) 
			{
				let originalHint = this.AVAILABLE_HINTS[category][i];

				// This array starts with ONE entry (with exactly enough space to hold all params)
				// Over time, this entry gets duplicated to create ALL possible combinations of options
				let fixedValues = [Array(originalHint.params.length)];	

				// Now generate all these combinations of input parameters
				for(let p = 0; p < originalHint.params.length; p++) 
				{
					let param = originalHint.params[p];

					if("variable" in param) { continue; }

					// generate list of all values THIS parameter can take on
					let list = [];
					let isNegated = ("negated" in param);

					let mustBeDifferent = ("different" in param);
					if(mustBeDifferent) { originalHint.different = true; }

					let mustBeHigher = ("mustbehigher" in param);
					let realValue = 'unknown';

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
					let newFixedValues = [];
					
					for(let a = 0; a < list.length; a++)
					{
						for(let b = 0; b < fixedValues.length; b++) {
							let newVal = fixedValues[b].slice();
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
					let hint = structuredClone(originalHint);
					hint.final_values = fixedValues[a];
					this.buildHint(hint, location, 'calculate');

					if("different" in hint && this.arrayHasDuplicates(hint.final_values)) { continue; }
					if(hint.error) { continue; }

					hints[category].push(hint);
				}
			}
		}

		if(this.cfg.debugging) 
		{
			console.log("ALL HINTS");
			console.log(structuredClone(hints));
		}

		for(const category in hints) 
		{
			this.shuffle(hints[category]);
		}

		// hard remove stuff from hint IDs that already have enough 
		let hintsById = {};
		let maxHintsPerId = 3;
		for(const category in hints) 
		{
			for(let i = hints[category].length-1; i >= 0; i--)
			{
				let hint = hints[category][i];
				let id = hint.id;
				if(!(id in hintsById)) {
					hintsById[id] = 0;
				}

				let maxHints = maxHintsPerId;
				if("duplicates" in hint) { maxHints = hint.duplicates; }

				const alreadyHaveEnough = hintsById[id] >= maxHints;
				if(alreadyHaveEnough) 
				{
					hints[category].splice(i,1);
				}

				hintsById[id] += 1;
			}
		}

		if(this.cfg.debugging) 
		{
			console.log("REDUCED LIST OF HINTS");
			console.log(structuredClone(hints));
		}

		// now do the same thing as with "backward" => add hints one at a time until only one location remains
		let multipleSolutions = true;
		let validLocations = this.mapList.slice();
		let finalHints = [];
		let totalNumHints = 0;

		let categories = Object.keys(hints);
		let categoryCounter = 0;

		let leftoverHints = structuredClone(hints);

		while(multipleSolutions)
		{
			let category = categories[categoryCounter];
			let availableHints = hints[category];

			let noHintsAtAll = this.countNumElementsInDictionary(hints) <= 0;
			if(noHintsAtAll) { break; }

			let noHintsInCategory = (availableHints.length <= 0);
			if(noHintsInCategory) {
				categoryCounter = (categoryCounter + 1) % categories.length;
				continue;
			}

			let newHint = structuredClone(availableHints.pop());
			let prevNumSolutions = validLocations.length;
			let oldValidLocations = validLocations.slice();

			this.removeInvalidLocationsDueToHint(validLocations, newHint);

			let hintDidNothing = (Math.abs(prevNumSolutions - validLocations.length) < this.cfg.minImpactPerHint);
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

		if(this.cfg.expansions.theLostRiddles) 
		{
			// a very expensive way to remove all hints (from the reduced list) that are actually used
			// but didn't see anything better at the moment
			// at least it's categorized, which significantly reduces the lists we need to traverse
			let finalLeftoverHints = [];
			for(const category in leftoverHints)
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

			const maxNumLostRiddles = 30;
			while(finalLeftoverHints.length > maxNumLostRiddles) 
			{
				finalLeftoverHints.pop();
			}

			this.LOST_RIDDLES = finalLeftoverHints;

			if(this.cfg.debugging) 
			{
				console.log("THE LOST RIDDLES");
				console.log(this.LOST_RIDDLES);
			}
		}
	}

	countNumElementsInDictionary(dict:Record<string,any>)
	{
		let sum = 0;
		for(const key in dict) {
			sum += dict[key].length;
		}
		return sum;
	}

	findAllValidLocationsWithHints(hints)
	{
		let locs = this.mapList.slice();
		let arr = [];

		for(let i = 0; i < locs.length; i++) 
		{
			let loc = locs[i];
			let allMatch = true;
			
			for(let h = 0; h < hints.length; h++) 
			{
				let newHint = structuredClone(hints[h]);
				this.buildHint(newHint, loc, 'check');
				let hintsMatch = this.matchHints(newHint, hints[h]);
				if(hintsMatch) { continue; }
				
				allMatch = false;
				break; 
			}

			if(!allMatch) { continue; }
			arr.push(loc);
		}

		return arr;
	}

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
	generateInstructionsBackward() {
		// contains info about things we DEFINITELY know about the final location while generating hints
		// (reduces change of impossible hints, makes algorithm faster/smoother)
		this.fixedData = 
		{
			terrain: 'unknown',
			nature: 'unknown',
			stones: 'unknown',
			landmark: 'unknown',
			road: 'unknown'
		}; 

		let hintsCopy = structuredClone(this.AVAILABLE_HINTS);

		let categories = Object.keys(hintsCopy);
		categories = this.shuffle(categories);

		let hints = {};

		let validLocations = this.mapList.slice();

		let categoryCounter = 0;

		let noSolution = false;
		let hasSolution = false;
		let solutionTooSmall = false;
		let solutionTooBig = false;

		while(true)
		{
			let curCategory = categories[categoryCounter];
			let possibleHints = hintsCopy[curCategory];

			let noHintsLeftInTotal = (this.countNumElementsInDictionary(hintsCopy) <= 0);
			if(noHintsLeftInTotal) { 
				hasSolution = false; 
				break; 
			}

			let noHints = (possibleHints.length <= 0);
			if(noHints) { 
				categoryCounter = (categoryCounter + 1) % categories.length;
				continue; 
			}

			let chosenIndex = Math.floor(this.cfg.rng.hints() * possibleHints.length);
			let chosenHint = structuredClone(possibleHints[chosenIndex]);

			this.buildHint(chosenHint, null, "random");

			let isSelfDestructHint = ("once" in chosenHint);
			if(isSelfDestructHint) { hintsCopy[curCategory].splice(chosenIndex, 1); }

			let hintErrored = chosenHint.error;
			if(hintErrored) { 
				hintsCopy[curCategory].splice(chosenIndex, 1);
				continue; 
			}

			let oldValidLocations = validLocations.slice();
			let prevNumSolutions = validLocations.length;
			this.removeInvalidLocationsDueToHint(validLocations, chosenHint);

			let hintDidNothing = (Math.abs(prevNumSolutions - validLocations.length) < this.cfg.minImpactPerHint);
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

			let numHints = this.countNumElementsInDictionary(hints);
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
	}

	removeForbiddenHints(list, hint)
	{
		if(!("forbids" in hint)) { return; }

		let cat = hint.category;
		for(let i = 0; i < hint.forbids.length; i++) 
		{
			let id = hint.forbids[i];
			for(let a = 0; a < list[cat].length; a++) {
				if(list[cat][a].id != id) { continue; }
				list[cat].splice(a, 1);
				break;
			}
		}
	}

	generateListWithLandmarkLocations() 
	{
		let arr = [];
		for(const landmarkName in this.landmarkCells) {
			arr.push(this.landmarkCells[landmarkName]);
		}
		return arr;
	}

	// Not very efficient, but this function is only called ONCE at MOST, so ... 
	generateListWithEdgeLocations() 
	{
		const obj = {
			left: [],
			top: [],
			right: [],
			bottom: []
		};

		for(let x = 0; x < this.cfg.width; x++) 
		{
			obj.top.push(this.map[x][0]);
			obj.bottom.push(this.map[x][this.cfg.height-1]);
		}

		for(let y = 0; y < this.cfg.height; y++) 
		{
			obj.left.push(this.map[0][y]);
			obj.right.push(this.map[this.cfg.width-1][y]);
		}
		return obj;
	}

	// For each location, we build HINTS again (following the fixed values we already have)
	// Then check if the final text is identical to the original hint text
	removeInvalidLocationsDueToHint(arr, hint) 
	{
		for(let i = arr.length-1; i >= 0; i--)
		{
			let cell = arr[i];
			let newHint = structuredClone(hint);
			this.buildHint(newHint, cell, "check");

			let hintsMatch = this.matchHints(newHint, hint);
			if(!hintsMatch) { arr.splice(i, 1); }
		}
	}

	// a is the new hint (with newly calculated values based on its cell)
	// b is the original version
	matchHints(a, b)
	{
		let type = a.type;
		let incompatibleHints = (type != b.type);
		if(incompatibleHints) { return false; }

		let variable = [];
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
			let idx = variable[0];
			return a.final_values[idx] >= b.final_values[idx];
		}
		else if(type == 'lessthan')
		{
			let idx = variable[0];
			return a.final_values[idx] <= b.final_values[idx];
		} 
		else if(type == 'bounds')
		{
			let low = variable[0];
			let high = variable[1];
			return a.final_values[0] >= b.final_values[low] && a.final_values[1] <= b.final_values[high]
		}
	}

	/*
		
		Given a hint object, builds the final values and text
		Three different targets:
		 - "Random": fills in the values completely randomly, used in backward algorithm only
		 - "Check": used for _checking_ if a cell matches a hint
		 - "Calculate": calculates the values from the cell itself, used in forward algorithm only

		The check and calculate are _mostly_ the same, but especially on "negated" or "choice" hints,
		it's faster to do handle things slightly differently 

	*/
	buildHint(hint, cell = null, target = 'check')
	{
		let values : any[] = [];
		let knownValues = [];
		if ("final_values" in hint) { knownValues = hint.final_values; }
		
		let calculate = (target == "calculate") && (cell != null);
		let check = (target == "check") && (cell != null);
		let randomize = (target == "random");

		if(calculate || check) { values = knownValues.slice(); }

		let baseText = hint.text;
		let failed = false; // if true, it displays an alternative test
		let error = false; // if true, the complete hint is invalid and discarded

		let noValuesSetYet = (values.length == 0);
		if(noValuesSetYet) {
			for(let i = 0; i < 10; i++) {
				if(!hint.text.includes("<" + i + ">")) { continue; }
				values.push(0);
			}
		}

		let bool, value, val, val2, dir, stringA, stringB

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
					let terrainA = this.getRandomTerrain([this.fixedData.terrain]);
					let terrainB = this.getRandomTerrain([this.fixedData.terrain, terrainA]);

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
					let terrainA = this.getRandomTerrain();
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
				bool = false;

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
				bool = false;

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
					let count = this.countTiles({
						"cell": cell,
						"property": "terrain",
						"value": knownValues[1],
						"radius": knownValues[2]
					});
					values[0] = count;

				} else {
					let terrainToCheck = this.getRandomTerrain();
					values[1] = terrainToCheck;

					let searchRadius = this.getRandomSearchRadius(hint.params[2]);
					values[2] = searchRadius;

					let numTiles = Math.floor(this.cfg.rng.hints()*this.getMaxTilesInRadius(searchRadius));
					values[0] = numTiles;
					
				}
				break;

			case "terrain_dist":
				if(check || calculate) {
					let dist = this.findClosest({
						"cell": cell,
						"property": "terrain",
						"value": knownValues[0]
					});
					values[1] = this.modifyHintValue(dist, hint, target);
				} else {
					let numTiles = Math.floor(this.cfg.rng.hints() * 6) + 2; // "at most", so higher numbers preferred
					let terrainToCheck = this.getRandomTerrain();
					values[0] = terrainToCheck;
					values[1] = numTiles;
				}

				break;

			case "terrain_type_diversity":
				if(check || calculate) {
					let tiles = this.getTilesRadius({
						"cell": cell,
						"radius": knownValues[1]
					});

					let types = {};
					for(let i = 0; i < tiles.length; i++) {
						let key = tiles[i].terrain;
						types[key] = true;
					}

					let diversity = Object.keys(types).length;
					values[0] = this.modifyHintValue(diversity, hint, target);

				} else {
					let searchRadius = this.getRandomSearchRadius(hint.params[1]);
					values[1] = searchRadius;

					let maxPossible = Math.min(TERRAINS.length, this.getMaxTilesInRadius(searchRadius));

					let numDifferentTerrains = Math.floor(this.cfg.rng.hints() * (maxPossible-2)) + 1; // "at least", so lower
					values[0] = numDifferentTerrains;
				}

				break;

			case "terrain_count_diversity":
				if(check || calculate) {
					let tiles = this.getTilesRadius({
						"cell": cell,
						"radius": knownValues[1]
					});

					let sum = 0;
					for(let i = 0; i < tiles.length; i++) {
						if(tiles[i].terrain == cell.terrain) { continue; }
						sum += 1;
					}

					values[0] = this.modifyHintValue(sum, hint, target);

				} else {
					let searchRadius = this.getRandomSearchRadius(hint.params[1]);
					values[1] = searchRadius;

					let numDifferentTiles = Math.floor(this.cfg.rng.hints() * (this.getMaxTilesInRadius(searchRadius) - 1)) + 1; // "at most", so go high
					values[0] = numDifferentTiles;
				}

				break;

			case "terrain_new":
				if(check || calculate) {
					let dist = this.findClosest({
						"cell": cell,
						"property": "terrain",
						"value": knownValues[0]
					});

					values[1] = this.modifyHintValue(dist, hint, target);
				} else {
					let randTerrain = this.getRandomTerrain();
					values[0] = randTerrain;

					let searchRadius = Math.floor(this.cfg.rng.hints() * 4) + 2;
					values[1] = searchRadius;
				}

				break;

			case "terrain_new_first":
				if(check || calculate) {
					let allTerrains = TERRAINS.slice();

					let closestTerrain = "";
					let closestDist = Infinity;

					for(let i = 0; i < allTerrains.length; i++) {
						if(allTerrains[i] == cell.terrain) { continue; }

						let dist = this.findClosest({
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
					let terrainA = this.getRandomTerrain([this.fixedData.terrain]);
					let terrainB = this.getRandomTerrain([this.fixedData.terrain, terrainA]);
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
					let natureA = this.getRandomNature();
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
					let wrongNature = this.getRandomNature([this.fixedData.nature]);
					values[0] = wrongNature; 
				}

				if(values[0] == '') { values[0] = 'lack of nature'; }
				break;

			case "nature_same":
				bool = false;

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
				if(check || calculate) {
					let num = this.countMatchingNeighbors({
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
					let dist = this.findClosest({
						"cell": cell,
						"property": "nature",
						"value": "any" 
					});
					values[0] = this.modifyHintValue(dist, hint, target);
				} else {
					let randDist = Math.floor(this.cfg.rng.hints() * 6) + 2;
					values[0] = randDist;
				}

				break;

			case "nature_count":
				if(check || calculate) {
					let count = this.countTiles({
						"cell": cell,
						"property": "nature",
						"value": "any",
						"radius": knownValues[1]
					});
					values[0] = count;

				} else {
					let searchRadius = this.getRandomSearchRadius(hint.params[1]);
					values[1] = searchRadius;

					let numNature = Math.floor(this.cfg.rng.hints()*this.getMaxTilesInRadius(searchRadius));
					values[0] = numNature;

					
				}
				break;

			case "nature_soil":
				if(check || calculate) {
					let searchGroup = this.getTilesProperty({
						"property": "terrain",
						"value": cell.terrain
					});

					let count = this.countTiles({
						"group": searchGroup,
						"property": "nature",
						"value": "any"
					});

					values[0] = this.modifyHintValue(count, hint, target);
				} else {
					let numNature = Math.floor(this.cfg.rng.hints() * 5) + 1;
					values[0] = numNature;
				}

				break;

			case "nature_flower":
				if(check || calculate) {
					let count = this.countTiles({
						"cell": cell,
						"property": "nature",
						"value": "flower",
						"radius": knownValues[1]
					});
					values[0] = this.modifyHintValue(count, hint, target);
				} else {
					let searchRadius = this.getRandomSearchRadius(hint.params[1]);
					values[1] = searchRadius;

					let numFlowers = Math.floor(this.cfg.rng.hints() * (this.getMaxTilesInRadius(searchRadius)-1)) + 1; // "at most", higher numbers
					values[0] = numFlowers;
				}

				break;

			case "nature_tree":
				if(check || calculate) {
					let count = this.countTiles({
						"cell": cell,
						"property": "nature",
						"value": "tree",
						"radius": knownValues[1]
					});

					if(count == 0) { error = true; }

					values[0] = this.modifyHintValue(count, hint, target);
				} else {
					let searchRadius = this.getRandomSearchRadius(hint.params[1]);
					values[1] = searchRadius;

					let numTrees = Math.floor(this.cfg.rng.hints() * this.getMaxTilesInRadius(searchRadius)); // "at least", lower numbers
					values[0] = numTrees;
				}

				break;

			case "nature_compare":
				stringA = "fewer";
				stringB = "than";

				if(check || calculate) {
					let params = {
						"cell": cell,
						"property": "nature",
						"value": "tree",
						"radius": knownValues[2]
					}

					let numTrees = this.countTiles(params);

					params.value = "flower";
					let numFlowers = this.countTiles(params);

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
				bool = true;

				if(check || calculate) {
					let dist = this.findClosest({
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
				bool = true;

				if(check || calculate) {
					let dist = this.findClosest({
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
				bool = true;

				if(check || calculate) {
					let dist = this.findClosest({
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
					let stonesMin = STONES[0];
					let stonesMax = STONES[STONES.length - 1];

					let low = Math.floor(this.cfg.rng.hints() * (stonesMin - 1));
					low = Math.max(low, stonesMin);

					let high = low + Math.floor(this.cfg.rng.hints() * (stonesMax - low)) + 1;
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
					let wrongLandmark = this.getRandomStones([this.fixedData.stones]);
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
					let wrongA = this.getRandomStones([this.fixedData.stones]);
					let wrongB = this.getRandomStones([this.fixedData.stones, wrongA]);

					values[0] = wrongA;
					values[1] = wrongB;
				}

				break;

			case "stones_same":
				bool = false;

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
				if(check || calculate) {
					let num = this.countMatchingNeighbors({
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
					let dist = this.findClosest({
						"cell": cell,
						"property": "stones",
						"value": "any"
					});
					values[0] = this.modifyHintValue(dist, hint, target);
				} else {
					let numTiles = Math.floor(this.cfg.rng.hints() * 5) + 2; // "at most", so a bit higher
					values[0] = numTiles;
				}

				break;

			case 'stones_count':
				if(check || calculate) {
					let count = this.countTiles({
						"cell": cell,
						"property": "stones",
						"value": "any",
						"radius": knownValues[1]
					});

					if(count == 0) { error = true; }

					values[0] = this.modifyHintValue(count, hint, target);

				} else {
					let searchRadius = this.getRandomSearchRadius(hint.params[1]);
					values[1] = searchRadius;

					let numLandmarks = Math.floor(this.cfg.rng.hints()*this.getMaxTilesInRadius(searchRadius)); // "at least", so a bit lower
					values[0] = numLandmarks;
				}

				break;

			case 'stones_sum':
				if(check || calculate) {
					let sum = this.countTiles({
						"cell": cell,
						"property": "stones",
						"radius": knownValues[0],
						"useValue": true
					});
					values[1] = this.modifyHintValue(sum, hint, target);

				} else {
					let searchRadius = this.getRandomSearchRadius(hint.params[0]);
					values[0] = searchRadius;

					let maxNumStones : number = STONES[STONES.length - 1];
					let randSum = Math.floor(this.cfg.rng.hints()*this.getMaxTilesInRadius(searchRadius)*maxNumStones); // "at most", so higher
					values[1] = randSum;

					
				}

				break;

			case "stones_adjacent_stones":
				bool = true;

				if(check || calculate) {
					let dist = this.findClosest({
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
				dir = 'right';
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
				dir = 'bottom';
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
					let rowA = this.getRandomRow();
					let rowB = this.getRandomRow([rowA]);

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
					let colA = this.getRandomColumn();
					let colB = this.getRandomColumn([colA]);

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
					let row = this.getRandomRow();
					let col = this.getRandomColumn();

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
				val = 'closer';
				val2 = 'than';

				if(check || calculate) {
					// we add +0.5 twice, then subtract 1, to make sure distance is correct no matter from what direction you come
					let distToCenter = Math.abs(cell.x - (0.5*this.cfg.width-0.5)) + Math.abs(cell.y - (0.5*this.cfg.height-0.5)) - 1;
					let distToEdge = Math.min(Math.min(cell.x, this.cfg.width - cell.x), Math.min(cell.y, this.cfg.height - cell.y))

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
				val = 'more';
				val2 = 'than';

				if(check || calculate) {
					let params = {
						"cell": cell,
						"property": "nature",
						"value": "any",
						"radius": knownValues[2]
					};
					let numNature = this.countTiles(params);

					params.property = "stones";
					let numStones = this.countTiles(params);

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

					let searchRadius = this.getRandomSearchRadius(hint.params[2]);
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
					let closestLandmark = this.findClosest({
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
				bool = true;

				if(check || calculate) {
					let dist = this.findClosest({
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
					let dist = this.findClosest({
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
				stringA = "closer";
				stringB = "than";

				if(check || calculate) {
					let distA = this.distBetweenCells(cell, this.landmarkCells[knownValues[1]])
					let distB = this.distBetweenCells(cell, this.landmarkCells[knownValues[3]])

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

					let landmarkA = this.getRandomLandmark();
					let landmarkB = this.getRandomLandmark([landmarkA]);
					values[1] = landmarkA;
					values[3] = landmarkB;
				}

				values[0] = stringA;
				values[2] = stringB;

				break;

			case "landmark_sum":
				if(check || calculate) {
					let dist = 0;

					for(const landmarkName in this.landmarkCells)
					{
						dist += this.distBetweenCells(cell, this.landmarkCells[landmarkName]);
					}

					values[0] = this.modifyHintValue(dist, hint, target);

				} else {
					values[0] = Math.floor(this.cfg.rng.hints() * 20) + 5;
				}

				break;

			case "landmark_adjacent":
				bool = false;

				if(check || calculate) {
					let dist = this.findClosest({
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
					let roadA = this.getRandomRoad();
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
					let roadA = this.getRandomRoad([this.fixedData.road]);
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
					let roadA = this.getRandomRoad([this.fixedData.road]);
					let roadB = this.getRandomRoad([this.fixedData.road, roadA]);

					values[0] = roadA;
					values[1] = roadB;
				}

				if(values[0] == '') { values[0] = 'lack of'; }
				if(values[1] == '') { values[1] = 'lack of'; }

				break;

			case "road_same":
				bool = false;

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
				if(check || calculate) {
					let num = this.countMatchingNeighbors({
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
					let count = this.countTiles({
						"cell": cell,
						"property": "road",
						"value": "any",
						"radius": knownValues[1]
					})
					values[0] = this.modifyHintValue(count, hint, target);
				} else {
					let searchRadius = this.getRandomSearchRadius(hint.params[1]);
					values[1] = searchRadius;

					let numRoads = Math.floor(this.cfg.rng.hints()*this.getMaxTilesInRadius(searchRadius));
					values[0] = numRoads;

				}

				break;

			case "road_adjacency":
				bool = false;

				if(check || calculate) {
					let dist = this.findClosest({
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
				bool = false;

				if(check || calculate) {
					let dist = this.findClosest({
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
				bool = false;

				if(check || calculate) {
					let dist = this.findClosest({
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
				stringA = "fewer";
				stringB = "than";

				if(check || calculate) {
					let params = {
						"cell": cell,
						"property": "road",
						"value": "straight",
						"radius": knownValues[2]
					}

					let numStraights = this.countTiles(params);

					params.value = "corner";
					let numCorners = this.countTiles(params);

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
					let dist = this.findClosest({
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
				bool = true;

				if(check || calculate) {
					let dist = this.findClosest({
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
				bool = true;

				if(check || calculate) {
					let dist = this.findClosest({
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
					let dist = this.findClosest({
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
					let count = this.countTiles({
						"cell": cell,
						"property": "tinyTreasure",
						"value": true,
						"radius": knownValues[1]
					});
					values[0] = this.modifyHintValue(count, hint, target);

				} else {
					let searchRadius = this.getRandomSearchRadius(hint.params[1]);
					values[1] = searchRadius;

					let numTiles = Math.floor(this.cfg.rng.hints()*this.getMaxTilesInRadius(searchRadius));
					values[0] = numTiles;
				}

				break;

			case "tiny_treasure_sum":
				if(check || calculate) {
					let dist = 0;
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
		let shuffleOutput = ("shuffle" in hint);
		let outputValues = values.slice();
		if(shuffleOutput) { outputValues = this.shuffle(outputValues); }

		for(let i = 0; i < outputValues.length; i++) {
			let val = outputValues[i];
			baseText = baseText.replace("<" + i + ">", val);
		}

		// add icons into the (HTML) text to display with the hints
		let htmlText = baseText;
		for(const iconName in HINT_ICONS)
		{
			let replaceString = iconName;
			let plural = iconName + "s";
			if(htmlText.includes(plural)) {
				replaceString = plural;
			}
			if(htmlText.includes("lack of " + iconName)) {
				continue;
			}

			let iconString = "";
			let frames = HINT_ICONS[iconName];
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
	}

	modifyHintValue(val, hint, target)
	{
		if(target != "calculate") { return val; }

		let dir = 1;
		if(hint.type == 'greaterthan') { dir = -1; }

		let randOffset = 0;
		let randCheck = this.cfg.rng.hints();
		if(randCheck <= 0.6) { randOffset = 1; }
		else if(randCheck <= 0.8) { randOffset = 2; }

		// minimum is always 1 => "at most 0" = 0 and "at least 0" tells you nothing
		// optional improvement: maximum is the maximum distance something could be in a map
		val += dir * randOffset;
		val = Math.max(val, 1);

		return val;
	}

	createNotString(val) 
	{
		if(val) { return ''; }
		else { return 'NOT '; }
	}

	getRandomSearchRadius(param)
	{
		if(param.type == 'bounds' && !this.cfg.advancedHints) { param.max = 1; }
		return Math.floor(this.cfg.rng.hints() * (param.max - param.min + 1)) + param.min;
	}

	/*
		VISUALIZATION
	*/
	visualizeTreasureOnly() 
	{
		const group = new ResourceGroup();
		let loc = this.treasure;

		let fX = this.cfg.oX + loc.x*this.cfg.cellSize;
		let fY = this.cfg.oY + loc.y*this.cfg.cellSize;

		const rect = new Rectangle().fromTopLeft(new Point(fX, fY), new Point(this.cfg.cellSize));
		const op = new LayoutOperation({
			stroke: "#FF0000",
			strokeWidth: 10,
			alpha: 1.0
		});
		group.add(new ResourceShape(rect), op);
		return group;
	}

	visualizeHintCards()
	{
		const group = new ResourceGroup();

		const cardMargin = new Point(20, 20);
		const margin = new Point(30, 80);
		const metadataMargin = new Point(150, 37)
		const scale = 0.35
		const cardSize = new Point(1038*scale, 1074*scale);

		const textConfig = new TextConfig({
			font: this.fontFamily,
			size: 16
		});

		const metadataConfig = new TextConfig({
			font: this.fontFamily,
			size: 11
		});

		const cellSize = Math.floor((cardSize.x - margin.x*2) / this.cfg.width);
		const gridHeight = this.cfg.height * cellSize;
		const extraGridMargin = new Point(3, 30); // just to center it nicely on the card

		const lineWidth = 2;
		const alpha = 0.4;
		const lineColorStroke = "#000000";
		const lineColorFill = "#000000";

		const opLine = new LayoutOperation({
			stroke: lineColorStroke,
			strokeWidth: lineWidth,
			alpha: alpha
		});

		const opRect = new LayoutOperation({
			fill: lineColorFill,
			alpha: alpha
		})

		const resHintCard = this.visualizer.getResource("hint_card");

		for(let i = 0; i < this.cfg.playerCount; i++)
		{
			const row = i % 3;
			const col = Math.floor(i / 3);

			// create card background
			const posHintCard = new Point(cardMargin.x + row*cardSize.x, cardMargin.y + col*cardSize.y);
			const opHintCard = new LayoutOperation({
				pos: posHintCard,
				size: cardSize
			});
			group.add(resHintCard, opHintCard);

			// add metadata (player number, seed, etcetera) in header
			const metadata = "(player " + (i+1) + "; " + this.cfg.seed + ")";
			const resMetadataText = new ResourceText({ text: metadata, textConfig: metadataConfig });			
			const opMetadataText = new LayoutOperation({
				pos: new Point(posHintCard.x + metadataMargin.x, posHintCard.y + metadataMargin.y),
				fill: "#111111",
				size: new Point(cardSize.x - margin.x*2, cardSize.y)
			})
			group.add(resMetadataText, opMetadataText);

			// generate the full string to place on top of the card
			const hints = this.hintsPerPlayer[i];
			const hintTexts : string[] = [];
			for(let h = 0; h < hints.length; h++)
			{
				hintTexts.push(hints[h].final_text);
			}
			const hintString = hintTexts.join("\n\n");

			// actually place the hint string
			const resText = new ResourceText({ text: hintString, textConfig: textConfig });
			const opText = new LayoutOperation({
				pos: new Point(posHintCard.x + margin.x, posHintCard.y + margin.y),
				fill: "#111111",
				stroke: "#FFFFFF",
				strokeWidth: 1,
				strokeAlign: StrokeAlign.OUTSIDE,
				size: new Point(cardSize.x - margin.x*2, cardSize.y)
			})
			group.add(resText,opText); // txt

			// create the hint grid
			const textHeight = textConfig.size * 5; // @TODO: this is just a rough guess; I should really add utility functions to get the final (true) dims/boundaries of a text block ...
			const heightLeftForGrid = cardSize.y - margin.y - cardMargin.y - textHeight - extraGridMargin.y;
			const multiplier = Math.min((heightLeftForGrid/gridHeight), 1);
			const gridPos = new Point( 
				posHintCard.x + margin.x + extraGridMargin.x,
				posHintCard.y + cardSize.y - gridHeight - extraGridMargin.y
			);
			const cs = cellSize * multiplier;

			for(let x = 1; x < this.cfg.width; x++)
			{
				const line = new Line(new Point(gridPos.x + x*cs, gridPos.y), new Point(gridPos.x + x * cs, gridPos.y + (this.cfg.height*cs)));
				group.add(new ResourceShape(line), opLine);
			}

			for(let y = 1; y < this.cfg.height; y++)
			{
				const line = new Line(new Point(gridPos.x, gridPos.y + y * cs), new Point(gridPos.x + (this.cfg.width*cs), gridPos.y + y*cs));
				group.add(new ResourceShape(line), opLine);
			}

			let tiles = this.tilesLeftPerPlayer[i];
			if(this.cfg.invertHintGrid) { tiles = this.invertLocationList(tiles); }

			// draw a rectangle for all locations that are still possible (because of yur hints)
			for(let t = 0; t < tiles.length; t++)
			{
				const tile = tiles[t];
				const rect = new Rectangle().fromTopLeft(new Point(gridPos.x + tile.x * cs, gridPos.y + tile.y * cs), new Point(cs));
				group.add(new ResourceShape(rect), opRect);
			}
		}

		return group;
	}

	// Basically, we create a new list with all locations ...
	// ... except those that are present in arr
	// which essentially means we "invert" that list
	// (Splicing as we go is just a minor performance optimization)
	invertLocationList(arr)
	{
		let locs = this.mapList.slice();
		let list = [];
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

	convertToStringCoordinates(cell)
	{
		return alphabet[cell.x] + "" + (cell.y+1);
	}

	visualizeGame() 
	{
		const group = new ResourceGroup();

		const bgRect = new Rectangle().fromTopLeft(new Point(), new Point(this.cfg.pixelWidth, this.cfg.pixelHeight));
		const opRect = new LayoutOperation({
			fill: "#FFFFFF"
		});
		group.add(new ResourceShape(bgRect), opRect);

		const oX = this.cfg.oX;
		const oY = this.cfg.oY;
		const cs = this.cfg.cellSize;
		const inkFriendly = this.cfg.inkFriendly;

		const resIcons = this.visualizer.getResource("icons");

		for(let x = 0; x < this.cfg.width; x++) 
		{
			for(let y = 0; y < this.cfg.height; y++) 
			{
				const fX = oX + x*cs, fY = oY + y*cs;
				const rect = new Rectangle().fromTopLeft(new Point(fX, fY), new Point(cs));
				
				const cell = this.map[x][y];
				const spritePos = new Point(fX + 0.5*cs, fY + 0.5*cs);
				const terrain = cell.terrain;

				if(inkFriendly) {
					let frame = TERRAINS.indexOf(terrain);
					const op = new LayoutOperation({
						pos: spritePos,
						size: new Point(cs),
						frame: frame,
						pivot: Point.CENTER
					})
					group.add(resIcons, op);
				} else {
					const opRect = new LayoutOperation({
						fill: TERRAIN_DATA[terrain].color
					});
					group.add(new ResourceShape(rect), opRect);
				}
				
				// stone sprites must be shown UNDERNEATH nature sprites, hence they are created first
				let stones = cell.stones;
				let hasStones = (stones > 0);

				if(hasStones) 
				{
					let frame = 16;
					let key = 'elements';
					if(inkFriendly) { 
						frame = 10;
						key = 'icons';
					}
					
					let positions = [0,1,2,3];
					if(inkFriendly) { positions = [1,2,3]; }
					this.shuffle(positions);

					const resStones = this.visualizer.getResource(key);

					for(let s = 0; s < stones; s++)
					{
						const op = new LayoutOperation({
							pos: spritePos,
							size: new Point(cs),
							pivot: Point.CENTER,
							rot: (positions[s] * 0.5 * Math.PI),
							frame: frame
						})
						group.add(resStones, op);
					}
					
				}

				// nature
				let nature = cell.nature;
				let hasNature = (nature != '');
				let natureScale = 1.0;
				if(!inkFriendly) { natureScale = 0.66; }

				if(hasNature) 
				{
					let frame = 0;
					let terrainOffset = TERRAINS.indexOf(terrain);
					if(nature == 'flower') { frame = 8; }
					frame += terrainOffset;

					const resNature = this.visualizer.getResource( inkFriendly ? "icons" : "elements" );
					
					if(inkFriendly) {
						let iconFrame = 8;
						if(nature == 'flower') { iconFrame = 9; }
						frame = iconFrame;
					}

					const op = new LayoutOperation({
						pos: spritePos,
						frame: frame,
						size: new Point(cs * natureScale),
						pivot: Point.CENTER,
						rot: (Math.floor(this.cfg.rng.map()*4) * 0.5 * Math.PI)
					});
					group.add(resNature, op);
				}

				// road
				let road = cell.road;
				let roadScale = 1.0;
				let hasRoad = (road != '');
				if(hasRoad) 
				{
					let terrainIndex = TERRAINS.indexOf(terrain);
					let frame = 24;
					let iconFrame = 11;
					if(road == 'corner') { frame = 32; iconFrame = 12; }
					if(road == 'dead end') { frame = 40; iconFrame = 13; }
					frame += terrainIndex;

					const resRoad = this.visualizer.getResource( inkFriendly ? "icons" : "elements" );
					if(inkFriendly) { frame = iconFrame; }

					const op = new LayoutOperation({
						pos: spritePos,
						size: new Point(roadScale * cs),
						pivot: Point.CENTER,
						rot: (cell.roadOrient * 0.5 * Math.PI),
						frame: frame
					})
					group.add(resRoad, op);
				}

				// landmarks
				let landmark = cell.landmark;
				let landmarkScale = 1.0;
				let hasLandmark = (landmark != '');
				if(hasLandmark) 
				{
					let frame = 48 + LANDMARKS.indexOf(landmark);
					let iconFrame = 16 + LANDMARKS.indexOf(landmark);

					const resLandmark = this.visualizer.getResource( inkFriendly ? "icons" : "elements" );
					if(inkFriendly) { frame = iconFrame; }
					const op = new LayoutOperation({
						pos: spritePos,
						size: new Point(cs * landmarkScale),
						frame: frame,
						pivot: Point.CENTER,
						rot: Math.floor(this.cfg.rng.map()*4) * 0.5 * Math.PI
					});

					group.add(resLandmark, op);
				}
			}
		}

		// draw divider lines to clearly separate tiles
		const gridLineWidth = Math.round(0.015*this.cfg.cellSize);
		const opTop = new LayoutOperation({
			stroke: "#000000",
			strokeWidth: gridLineWidth
		});

		const fontSize = Math.round(0.0725*cs)
		const margin = Math.round(0.0275*cs);
		const textConfig = new TextConfig({
			font: this.fontFamily,
			size: fontSize,
		})
	
		const opText = new LayoutOperation({
			fill: "#111111",
			stroke: "#FFFFFF",
			strokeWidth: 1,
			strokeAlign: StrokeAlign.OUTSIDE,
			size: new Point(6*fontSize, 1.5*fontSize)
		});

		for(let x = 0; x <= this.cfg.width; x++) 
		{
			const line = new Line(new Point(oX + x*cs, oY + 0), new Point(oX + x*cs, oY + this.cfg.height*cs));
			group.add(new ResourceShape(line), opTop);

			if(x == this.cfg.width) { continue; }

			const opTextTemp = opText.clone();
			opTextTemp.pos = new Point(oX + (x+0.5)*cs, oY + margin);
			opTextTemp.pivot = new Point(0.5, 0);
			const resText = new ResourceText({ text: alphabet[x], textConfig: textConfig });
			group.add(resText, opTextTemp);
		}

		for(let y = 0; y <= this.cfg.height; y++) 
		{
			const line = new Line(new Point(oX + 0, oY + y*cs), new Point(oX + this.cfg.width*cs, oY + y*cs));
			group.add(new ResourceShape(line), opTop);

			if(y == this.cfg.height) { continue; }

			const opTextTemp = opText.clone();
			opTextTemp.pos = new Point(oX + margin, oY + (y+0.5)*cs);
			opTextTemp.pivot = new Point(0, 0.5);
			const resText = new ResourceText({ text: (y+1).toString(), textConfig: textConfig });
			group.add(resText, opTextTemp);
		}

		// display the map seed (underneath the A in the upper left square)
		textConfig.alignHorizontal = TextAlign.MIDDLE;
		const resText = new ResourceText({ text: this.cfg.seed, textConfig: textConfig });
		opText.pos = new Point(oX + 0.5*cs + margin, oY + margin + 12);
		opText.pivot = new Point(0.5, 0);
		group.add(resText, opText);

		// draw a divider between squares with a different terrain
		// (helps a ton with clarity)
		const opTopDivider = opTop.clone();
		opTopDivider.strokeWidth = Math.round(2.5*gridLineWidth);

		let tiles = this.mapList.slice();
		for(let i = 0; i < tiles.length; i++)
		{
			let pos = new Point(tiles[i].x, tiles[i].y);
			let posBelow = new Point(pos.x, pos.y + 1);
			let posRight = new Point(pos.x + 1, pos.y);

			if(!this.outOfBounds(posBelow) && tiles[i].terrain != this.map[posBelow.x][posBelow.y].terrain)
			{
				const line = new Line(new Point(oX + posBelow.x*cs, oY + posBelow.y*cs), new Point(oX + (posBelow.x+1)*cs, oY + posBelow.y*cs));
				group.add(new ResourceShape(line), opTopDivider);
			}

			if(!this.outOfBounds(posRight) && tiles[i].terrain != this.map[posRight.x][posRight.y].terrain)
			{
				const line = new Line(new Point(oX + posRight.x*cs, oY + posRight.y*cs), new Point(oX + posRight.x*cs, oY + (posRight.y+1)*cs));
				group.add(new ResourceShape(line), opTopDivider);
			}
		}

		// display the hints (only when debugging of course)
		if(this.cfg.debugging) 
		{
			const textConfigDebug = new TextConfig({
				font: this.fontFamily,
				size: 16
			});

			const margin = 12;
			const lineHeight = 24;
			let counter = 0;
			for(const category in this.hints) 
			{
				for(let i = 0; i < this.hints[category].length; i++)
				{
					const str = this.hints[category][i].final_text;
					const op = new LayoutOperation({
						pos: new Point(oX + margin, oY + margin + counter*lineHeight),
						fill: "#111111",
						stroke: "#FFFFFF",
						strokeWidth: 5,
						size: new Point(0.5*this.cfg.pixelWidth), // just a random big text box size
						depth: 1000,
					})		

					const resText = new ResourceText({ text: str, textConfig: textConfigDebug });
					group.add(resText, op);
					counter += 1;
				}
			}
		}

		return group;
	}

	/*
		HELPER FUNCTIONS
	*/
	getMaxTilesInRadius(rad:number)
	{
		rad -= 1; // just to offset it so it works with how hints are presented to players
		return 2*(rad*rad) - 2*rad + 1;
	}

	getEmptyNeighbors(cell, properties) 
	{
		let arr = [];

		for(let i = 0; i < cell.nbs.length; i++) {
			let nb = cell.nbs[i];
			let empty = true;
			for(let p = 0; p < properties.length; p++)
			{
				let curVal = nb[properties[p]];
				if(!(curVal == '' || curVal == 0)) { 
					empty = false;
					break; 
				}
			}
			if(!empty) { continue; }
			
			arr.push(nb);
		}

		return arr;
	}

	getNonEmptyNeighbors(param)
	{
		let cell = param.cell;
		let arr = [];

		for(let i = 0; i < cell.nbs.length; i++) {
			let nb = cell.nbs[i];
			if(nb.nature == '' && nb.stones == 0 && nb.landmark == '' && nb.road == '') { continue; }
			
			arr.push(nb);
		}
		return arr;
	}

	hasNeighborWith(param)
	{
		for(let i = 0; i < param.cell.nbs.length; i++) {
			if(param.cell.nbs[i][param.property] != param.value) { continue; }
			return true;
		}
		return false;
	}

	countMatchingNeighbors(param)
	{
		let prop = param.property;
		let types = {};
		for(let i = 0; i < param.cell.nbs.length; i++)
		{
			let nb = param.cell.nbs[i];
			if(!(nb[prop] in types)) { types[nb[prop]] = 0; }
			types[nb[prop]] += 1;
		}

		let largestType = 'unknown';
		let largestNum = -1;
		for(const type in types) 
		{
			if(types[type] <= largestNum) { continue; }
			largestNum = types[type];
			largestType = type;
		}

		if(largestType == 'unknown') { return 0; }
		return largestNum;
	}

	findClosest(param)
	{
		let originalCell = param.cell;
		let tiles = this.mapList.slice();
		let params = structuredClone(param);
		params.cell = param.cell;

		let closestObj = null;
		let closestDist = Infinity;

		let isTied = false;

		for(let i = 0; i < tiles.length; i++) {
			let newCell = tiles[i];

			let isSelf = (originalCell == newCell);
			let ignoreSelf = ("ignoreSelf" in params);
			if(ignoreSelf && isSelf) { continue; }

			params.cell = newCell;
			let matchesPattern = this.matchProperty(params);
			if(!matchesPattern) { continue; }

			let dist = Math.abs(newCell.x - originalCell.x) + Math.abs(newCell.y - originalCell.y);
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
	}

	countTiles(param)
	{
		let tiles;
		let params = structuredClone(param);
		params.cell = param.cell;

		if("group" in params) {
			tiles = params.group;
		} else {
			tiles = this.getTilesRadius(params);
		}

		let useValue = false;
		if("useValue" in params) { useValue = true; }
		
		let sum = 0;
		for(let i = 0; i < tiles.length; i++) {
			params.cell = tiles[i];

			let matchesPattern = this.matchProperty(params);
			if(!matchesPattern) { continue; }

			let increment = 1;
			if(useValue) { increment = tiles[i][params.property]; }
			sum += increment;
		}

		return sum;
	}

	matchProperty(param)
	{
		let realValue = param.cell[param.property];
		let matchesPattern = (realValue == param.value)
		if(param.value == 'any') {
			matchesPattern = (realValue != 0 && realValue != '');
		}
		return matchesPattern;
	}

	getTilesProperty(param)
	{
		let allTiles = this.mapList.slice();
		for(let i = allTiles.length - 1; i >= 0; i--)
		{
			param.cell = allTiles[i];
			let matchesPattern = this.matchProperty(param);
			if(matchesPattern) { continue; }
			allTiles.splice(i,1);
		}
		return allTiles;
	}

	getTilesRadius(param)
	{
		let oX = param.cell.x;
		let oY = param.cell.y;

		let arr = [];
		for(let x = -param.radius; x <= param.radius; x++) 
		{
			for(let y = -param.radius; y <= param.radius; y++) 
			{
				let dist = Math.abs(x) + Math.abs(y);
				if(dist > param.radius) { continue; }

				let fX = oX + x;
				let fY = oY + y;

				if(this.cfg.wrapBoard) {
					fX = (fX + this.cfg.width) % this.cfg.width;
					fY = (fY + this.cfg.height) % this.cfg.height;
				}

				const pos = new Point(fX, fY);
				if(this.outOfBounds(pos)) { continue; }

				arr.push(this.map[fX][fY]);
			}
		}
		return arr;
	}

	arraysAreEqual(a:any[], b:any[])
	{
		if(a.length != b.length) { return false; }

		for(let i = 0; i < a.length; i++) {
			if(a[i] != b[i]) { return false; }
		}
		return true;
	}

	arraysAreNonEqual(a:any[], b:any[])
	{
		if(a.length != b.length) { return false; }

		for(let i = 0; i < a.length; i++) {
			if(a[i] == b[i]) { return false; }
		}
		return true;
	}

	arraysOneMatch(a:any[], b:any[])
	{
		for(let i = 0; i < a.length; i++) {
			if(i >= b.length) { break; }
			if(a[i] == b[i]) { return true; }
		}
		return false;
	}

	arrayHasDuplicates(a:any[])
	{
		return (new Set(a)).size !== a.length;
	}

	// @IMPROV: All these functions do basically the same thing; should generalize and make this cleaner?
	getRandomStones(exclude = [])
	{
		let stones = STONES.slice();
		this.handleExclusions(stones, exclude);
		return stones[Math.floor(this.cfg.rng.hints() * stones.length)];
	}

	getRandomNature(exclude = [])
	{
		let nature = NATURE.slice();
		this.handleExclusions(nature, exclude);
		return nature[Math.floor(this.cfg.rng.hints() * nature.length)];
	}

	getRandomTerrain(exclude = [])
	{
		let terrains = TERRAINS.slice();
		this.handleExclusions(terrains, exclude);
		return terrains[Math.floor(this.cfg.rng.hints() * terrains.length)];
	}

	getRandomLandmark(exclude = [])
	{
		if(Object.keys(this.landmarkCells).length <= 0) { return ''; }
		let landmarks = Object.keys(this.landmarkCells).slice();
		this.handleExclusions(landmarks, exclude);
		return landmarks[Math.floor(this.cfg.rng.hints() * landmarks.length)];
	}

	getRandomRoad(exclude = [])
	{
		let roads = ROADS.slice();
		this.handleExclusions(roads, exclude);
		return roads[Math.floor(this.cfg.rng.hints() * roads.length)];
	}

	getRandomRow(exclude = [])
	{
		let rows = LISTS.row.slice();
		this.handleExclusions(rows, exclude);
		return rows[Math.floor(this.cfg.rng.hints() * rows.length)];
	}

	getRandomColumn(exclude = [])
	{
		let cols = LISTS.column.slice();
		this.handleExclusions(cols, exclude);
		return cols[Math.floor(this.cfg.rng.hints() * cols.length)];
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
	        j = Math.floor(this.cfg.rng.general() * (i + 1));
	        x = a[i];
	        a[i] = a[j];
	        a[j] = x;
	    }

	    return a;
	}

	outOfBounds(pos:Point) 
	{
		return (pos.x < 0 || pos.x >= this.cfg.width || pos.y < 0 || pos.y >= this.cfg.height);
	}
}