// @ts-nocheck
import Cell from "./cell"
import Edge from "./edge"
import { KEEBBLE_TYPES, KEEBBLE_LETTER_VALUES } from "./dict"
import CONFIG from "./config"
import Random from "js/pq_games/tools/random/main"
import PandaqiPhaser from "js/pq_games/website/phaser"
// @ts-ignore
import { Scene, Geom, Display } from "js/pq_games/phaser.esm"
import Point from "js/pq_games/tools/geometry/point"

interface GenerationData
{
	walls?: any[],
	cellsFlat?: Cell[],
	cells?: Cell[][]
}

const sceneKey = "boardGeneration"
export { BoardGeneration, sceneKey }
export default class BoardGeneration extends Scene
{
	canvas: HTMLCanvasElement
	cfg: Record<string,any>
	gen: GenerationData

	constructor()
	{
		super({ key: sceneKey });
	}

	preload() {
		// @ts-ignore
		this.load.crossOrigin = 'Anonymous';
		// @ts-ignore
		this.canvas = this.sys.game.canvas;

		const base = '/keebble/assets/';
		// @ts-ignore
		this.load.spritesheet('special_cells', base + 'special_cells.webp?v=1', { frameWidth: 354.5, frameHeight: 354.5 });
	}

	create(userConfig:Record<string,any>) {
		this.setup(userConfig)
		this.generate()
		this.visualize();
		PandaqiPhaser.convertCanvasToImage(this);
	}

	setup(userConfig:Record<string,any>)
	{
		userConfig.numPlayers = parseInt(userConfig.playerCount);
		const cfg = Object.assign({}, CONFIG);
		Object.assign(CONFIG, userConfig);

		console.log(CONFIG);

		if(cfg.expansions.scrabbleScoring)
		{
			cfg.showLetterValues = true;
		}

		if(cfg.gameTitle == "Keebble: Knickknack") { 
			cfg.createStartingHands = false; 
			cfg.addStartingCell = false;
			cfg.showLetterValues = true;
		}

		cfg.spriteAlpha = 1.0;
		if(cfg.forPrinting) { cfg.spriteAlpha = 0.3; }

		// @NOTE: My setting-enum shortcode automatically lowercases the values; nice, but should not forget this
		if(cfg.boardSize == "small") { 
			cfg.numCellsY = 4;
			cfg.backpackGridSize.x -= 1;
		}

		if(cfg.boardSize == "large") {
			cfg.numCellsX = 16;
			cfg.backpackGridSize.x += 1;
			cfg.backpackGridSize.y += 1;
		}

		cfg.totalNumCells = cfg.numCellsX * cfg.numCellsY;

		cfg.cellSizeX = this.canvas.width / cfg.numCellsX;
		cfg.cellSizeY = this.canvas.height / cfg.numCellsY;
		cfg.cellSize = new Point(cfg.cellSizeX, cfg.cellSizeY);
		cfg.cellSizeUnit = Math.min(cfg.cellSizeX, cfg.cellSizeY);

		cfg.spriteSize = cfg.cellSizeUnit - 2 * cfg.spriteMargin;
		cfg.letterFontSize = cfg.cellSizeUnit - 2*cfg.letterMargin;
		cfg.maxLetterStrokeOffset = 0.12*cfg.letterFontSize;
		cfg.handFontSize = 0.25*cfg.letterFontSize;

		// Text configs
		cfg.letterTextConfig = {
			fontFamily: cfg.fontFamily,
			fontSize: cfg.letterFontSize + 'px',
			color: "#FFFFFF",
			stroke: "#000000",
			strokeThickness: 24, // trying to match the thickness of the sprite strokes
		}

		cfg.letterTextStrokeConfig = {
			fontFamily: cfg.letterTextConfig.fontFamily,
			fontSize: cfg.letterTextConfig.fontSize,
			color: "transparent",
		}

		cfg.handTextConfig = {
			fontFamily: cfg.fontFamily,
			fontSize: cfg.handFontSize + 'px',
			color: "#000000",
			wordWrap: { width: cfg.cellSizeX }
		}

		this.createFullLetterDictionary(cfg);
		this.determinePlayerColors(cfg);
		this.createExpansionSetup(cfg);

		this.cfg = cfg;
	}

	createFullLetterDictionary(cfg)
	{
		let obj = {};
		cfg.letterDictionary = obj;

		for(const [letter, score] of Object.entries(cfg.scrabbleScores))
		{
			obj[letter] = {
				score: score,
				// @ts-ignore
				prob: (1.0 / score)
			}
		}
	}

	determinePlayerColors(cfg)
	{
		const colors = [];
		cfg.playerColors = colors;
		
		const hueDistBetweenPlayers = 1.0 / cfg.numPlayers;
		for(let i = 0; i < cfg.numPlayers; i++)
		{
			const hue = i*hueDistBetweenPlayers;
			const col = new Display.Color.HSLToColor(hue, 0.7, 0.7).color;
			colors.push(col);
		}
	}

	createExpansionSetup(cfg)
	{
		if(cfg.expansions.cellDance) { cfg.expansions.specialCells = true; }

		const typesCopy = structuredClone(cfg.types);
		cfg.types = typesCopy;
		for(const [type,data] of Object.entries(typesCopy))
		{
			// @ts-ignore
			const needsExpansion = data.expansion;
			if(!needsExpansion) { continue; }

			// @ts-ignore
			const expansionIncluded = cfg.expansions[data.expansion]
			if(expansionIncluded) { continue; }

			delete typesCopy[type];
		}
	}

	generate()
	{
		this.gen = {};

		const [cells, cellsFlat] = this.getAllCells();
		this.gen.cells = cells;
		this.gen.cellsFlat = cellsFlat;
		
		this.pickStartingCell();
		this.assignRandomStartingHands();
		this.placeRandomLetters();
		this.placeRandomSpecialCells();
		this.placeWalls();
	}

	placeWalls()
	{
		this.gen.walls = [];

		if(!this.cfg.addWalls) { return; }

		const edges = this.getAllEdges();
		Random.shuffle(edges);
		const min = this.cfg.numWalls.min * edges.length;
		const max = this.cfg.numWalls.max * edges.length;
		const numWalls = Math.floor( Math.random() * (max - min) + min);
		
		for(let i = 0; i < numWalls; i++)
		{
			this.gen.walls.push(edges.pop());
		}
	}

	getCenterCells()
	{
		const cX1 = Math.floor(0.5 * this.cfg.numCellsX);
		const cX2 = Math.ceil(0.5 * this.cfg.numCellsX);
		const cY1 = Math.floor(0.5 * this.cfg.numCellsY);
		const cY2 = Math.ceil(0.5 * this.cfg.numCellsY);

		return [
			this.gen.cells[cX1][cY1],
			this.gen.cells[cX2][cY1],
			this.gen.cells[cX2][cY2],
			this.gen.cells[cX1][cY2]
		]
	}

	getEdgeCells()
	{
		const arr = [];
		for(const cell of this.gen.cellsFlat)
		{
			if(cell.x == 0 || cell.x == (this.cfg.numCellsX-1)) { arr.push(cell); }
			else if(cell.y == 0 || cell.y == (this.cfg.numCellsY-1)) { arr.push(cell); }
		}
		return arr;
	}

	pickStartingCell()
	{
		if(!this.cfg.addStartingCell) { return; }

		const centerCells = this.getCenterCells();
		Random.shuffle(centerCells);
		centerCells.pop().setType("start");
	}

	shuffle(array) {
		for (let i = array.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[array[i], array[j]] = [array[j], array[i]];
		}
	}

	getAllCells()
	{
		const grid = [];
		
		for(let x = 0; x < this.cfg.numCellsX; x++)
		{
			grid[x] = [];

			for(let y = 0; y < this.cfg.numCellsY; y++)
			{
				grid[x][y] = new Cell(x,y);
			}
		}

		return [grid, grid.flat()];
	}

	getAllEdges()
	{
		const edges = [];
		for(let x = 1; x < this.cfg.numCellsX; x++)
		{
			for(let y = 1; y < this.cfg.numCellsY; y++)
			{
				const pos = new Point(x, y);
				
				if(y < (this.cfg.numCellsY-1)) 
				{
					const posDown = new Point(x, y + 1);
					edges.push(new Edge(pos, posDown, 0.0))
				}
				
				if(x < (this.cfg.numCellsX-1))
				{
					const posRight = new Point(x + 1, y);
					edges.push(new Edge(pos, posRight, 0.5*Math.PI))
				}
			}
		}

		return edges;
	}

	getEmptyCells()
	{
		const list = this.gen.cellsFlat;
		const arr = [];
		for(let i = 0; i < list.length; i++)
		{
			if(!list[i].isEmpty()) { continue; }
			arr.push(list[i]);
		}
		return arr;
	}

	getFixedScore(letter)
	{
		return this.cfg.letterDictionary[letter].score;
	}

	getRandomLetter()
	{
		return Random.getWeighted(this.cfg.letterDictionary);
	}

	getTotalForKey(obj, key)
	{
		let sum = 0;
		for(const [elem, val] of Object.entries(obj))
		{
			// @ts-ignore
			if(!(key in val)) { val[key] = 1.0; }
			sum += val[key];
		}
		return sum;
	}

	getRandomType()
	{
		return Random.getWeighted(this.cfg.types);
	}

	scaleToBoardSize(val)
	{
		return val * this.cfg.totalNumCells;
	}

	placeRandomLetters()
	{
		const max = this.scaleToBoardSize(this.cfg.numLetters.max);
		const min = this.scaleToBoardSize(this.cfg.numLetters.min);
		const numLetters = Math.floor(Math.random() * (max - min) + min);
		const letters = [];
		for(let i = 0; i < numLetters; i++)
		{
			letters.push(this.getRandomLetter());
		}

		const locations = this.getEmptyCells();
		Random.shuffle(locations);
		while(letters.length)
		{
			const cell = locations.pop();
			cell.setLetter(letters.pop());
			this.removeNeighbors(cell, locations);
		}		
	}

	placeRandomSpecialCells()
	{
		if(!this.cfg.expansions.specialCells) { return; }

		const max = this.scaleToBoardSize(this.cfg.numSpecial.max);
		const min = this.scaleToBoardSize(this.cfg.numSpecial.max);
		const numCells = Math.floor(Math.random() * (max - min) + min);
		const types = [];
		for(let i = 0; i < numCells; i++)
		{
			types.push(this.getRandomType());
		}

		const locations = this.getEmptyCells();
		Random.shuffle(locations);
		while(types.length && locations.length)
		{
			const cell = locations.pop();
			cell.setType(types.pop());
			this.removeNeighbors(cell, locations);
		}
	}

	removeNeighbors(cell, list)
	{
		let removed = 0;
		for(let i = 0; i < list.length; i++)
		{
			const l = list[i];
			if(!cell.isNeighborWith(l)) { continue; }
			list.splice(i, 1);
			removed++;
			if(removed >= this.cfg.disallowedNeighborsOnPlacement) { break; }
		}
	}

	getRandomStartHand(size)
	{
		const hand = [];
		for(let i = 0; i < size; i++)
		{
			hand.push(this.getRandomLetter());
		}
		return hand;
	}

	assignRandomStartingHands()
	{
		if(!this.cfg.createStartingHands) { return; }

		const min = this.cfg.startHandSize.min;
		const max = this.cfg.startHandSize.max;
		const size = Math.floor(Math.random() * (max - min) + min);

		const numPlayers = this.cfg.numPlayers;
		const hands = [];
		for(let i = 0; i < numPlayers; i++)
		{
			hands.push(this.getRandomStartHand(size));
		}

		const locations = this.getEdgeCells();
		Random.shuffle(locations);
		while(hands.length)
		{
			const c = locations.pop();
			const h = hands.pop();
			const playerNum = hands.length;
			c.setHand(playerNum, h)
			this.removeNeighbors(c, locations);
		}
	}

	visualize()
	{
		this.visualizeBackground();
		this.visualizeGrid();
		this.visualizeCells();
		this.visualizeWalls();
	}

	cellToRect(c, randomness = 0)
	{
		const pixelPos = this.toPixelPos(c.x, c.y);
		const pixelSize = this.cfg.cellSize;

		if(c.hasHand()) { randomness = 0; }
		const off = this.getWonkyOffset(randomness);

		pixelPos.x += off.x
		pixelPos.y += off.y;

		return new Geom.Rectangle(pixelPos.x, pixelPos.y, pixelSize.x, pixelSize.y);
	}

	edgeToCenterPos(e)
	{
		const c = e.getCenterPos();
		return this.toPixelPos(c.x, c.y);
	}

	getHueAsRatio(hue)
	{
		if(hue < 0) { hue += 360.0 }
		if(hue >= 360) { hue -= 360.0; }
		return hue / 360.0;
	}

	getCellBackgroundColor(c = null)
	{
		if(c)
		{
			if(c.hasHand()) { return this.cfg.playerColors[c.getPlayerNum()]; }
			if(c.getType()) { return this.cfg.types[c.getType()].col; }
		}
		
		const baseHue = this.cfg.baseCellBackgroundHue;
		const hue = this.getHueAsRatio( baseHue + (Math.random()-0.5)*this.cfg.cellBackgroundHueVariation)
		return Display.Color.HSLToColor(hue, 0.3, 0.8).color;
	}

	visualizeBackground()
	{
		if(this.cfg.inkFriendly) { return; }

		const cells = this.gen.cellsFlat.slice();
		Random.shuffle(cells);
		const rand = this.cfg.baseCellBackgroundRandomness * this.cfg.cellSizeUnit;

		const graphics = this.add.graphics();
		const bg = new Geom.Rectangle(0, 0, this.canvas.width, this.canvas.height);
		graphics.fillStyle(this.getCellBackgroundColor(null));
		graphics.fillRectShape(bg);

		for(const c of cells)
		{
			const rect = this.cellToRect(c, rand);
			let col = this.getCellBackgroundColor(c);
			graphics.fillStyle(col);
			graphics.fillRectShape(rect);
		}
	}

	visualizeGrid()
	{

		// vertical lines
		const lw = this.cfg.lineWidth;
		const col = this.cfg.gridColor;
		const alpha = this.cfg.gridAlpha;
		for(let x = 1; x < this.cfg.numCellsX; x++)
		{
			const xPixels = x * this.cfg.cellSizeX;
			const l = this.add.line(0, 0, xPixels, 0, xPixels, this.canvas.height, col, alpha);
			l.setOrigin(0,0);
			l.setLineWidth(lw, lw);
		}

		// horizontal lines
		for(let y = 1; y < this.cfg.numCellsY; y++)
		{
			const yPixels = y * this.cfg.cellSizeY;
			const l = this.add.line(0, 0, 0, yPixels, this.canvas.width, yPixels, col, alpha);
			l.setOrigin(0,0);
			l.setLineWidth(lw, lw);

		}
	}

	toPixelPos(x,y)
	{
		return { x: this.cfg.cellSizeX * x, y: this.cfg.cellSizeY * y };
	}

	toCenteredPixelPos(x,y)
	{
		return this.toPixelPos(x+0.5,y+0.5);
	}

	toOffsetPixelPos(startPos, offsetPos, cellSize)
	{
		return {
			x: startPos.x + offsetPos.x * cellSize.x,
			y: startPos.y + offsetPos.y * cellSize.y
		}
	}

	visualizeCells()
	{
		const cells = this.gen.cellsFlat.slice();

		while(cells.length)
		{
			const c = cells.pop();

			this.visualizeLetter(c);
			this.visualizeHand(c);
			this.visualizeType(c);
		}
	}

	getFrameForType(type)
	{
		return this.cfg.types[type].frame;
	}

	getWonkyOffset(maxOffset = 100, cutoff = 0.66)
	{
		let randAngle = Math.random() * 2 * Math.PI;
		let rand = cutoff + Math.random()*(1.0 - cutoff);
		let dist = rand * maxOffset;
		return {
			x: Math.cos(randAngle) * dist,
			y: Math.sin(randAngle) * dist
		}
	}

	visualizeLetter(c)
	{
		if(!c.getLetter()) { return; }
		const pixelPos = this.toCenteredPixelPos(c.x, c.y);
		const letter = c.getLetter().toUpperCase();

		const randOffset = this.getWonkyOffset(this.cfg.maxLetterStrokeOffset);
		const textFill = this.add.text(pixelPos.x, pixelPos.y, letter, this.cfg.letterTextConfig);
		textFill.setOrigin(0.5, 0.5);
		textFill.setShadow(randOffset.x, randOffset.y, 'rgba(0,0,0,0.5)', 5);

		//const textStroke = this.add.text(pixelPos.x, pixelPos.y, letter, this.cfg.letterTextStrokeConfig);
		//textStroke.setOrigin(0.5, 0.5);

		if(this.cfg.showLetterValues)
		{
			const txt = this.getFixedScore(c.getLetter());
			const posBottomRight = this.toPixelPos(c.x + 0.95, c.y + 0.95);
			const t = this.add.text(posBottomRight.x, posBottomRight.y, txt, this.cfg.handTextConfig);
			t.setOrigin(1.0, 1.0);
		}
	}

	visualizeHand(c)
	{
		if(!c.hasHand()) { return; }

		const startPos = this.toPixelPos(c.x, c.y);
		const w = this.cfg.backpackGridSize.x;
		const h = this.cfg.backpackGridSize.y;

		const cellX = (this.cfg.cellSizeX / w);
		const cellY = (this.cfg.cellSizeY / h);
		const backpackCellSize = new Point(cellX, cellY);

		const displayAsGrid = this.cfg.expansions.tinyBackpacks
		if(displayAsGrid)
		{
			const col = this.cfg.backpackGridColor;
			const alpha = this.cfg.backpackGridAlpha;
			const lw = this.cfg.backpackLineWidth;

			// vertical lines
			for(let x = 1; x < w; x ++)
			{
				const pixelX = startPos.x + cellX * x;
				const l = this.add.line(0, 0, pixelX, startPos.y, pixelX, startPos.y + this.cfg.cellSizeY, col, alpha)
				l.setOrigin(0,0);
				l.setLineWidth(lw, lw);
			}

			// horizontal lines
			for(let y = 1; y < h; y ++)
			{
				const pixelY = startPos.y + cellY * y;
				const l = this.add.line(0, 0, startPos.x, pixelY, startPos.x + this.cfg.cellSizeX, pixelY, col, alpha)
				l.setOrigin(0,0);
				l.setLineWidth(lw, lw);
			}
		}

		// place letters from top left into those cells
		const displayLettersAsGrid = displayAsGrid || this.cfg.forPrinting
		if(displayLettersAsGrid)
		{
			const hand = c.getHand();
			for(let i = 0; i < hand.length; i++)
			{
				const col = (i % w);
				const row = Math.floor(i / w);
				const offsetPos = { x: (col+0.5), y: (row+0.5) }
				const pixelPos = this.toOffsetPixelPos(startPos, offsetPos, backpackCellSize);
				const t = this.add.text(pixelPos.x, pixelPos.y, hand[i], this.cfg.handTextConfig);
				t.setOrigin(0.5);
			}

			return;
		}

		// otherwise, place centered
		const pixelPos = this.toCenteredPixelPos(c.x, c.y);
		const txt = c.getHandAsText();
		const t = this.add.text(pixelPos.x, pixelPos.y, txt, this.cfg.handTextConfig);
		t.setOrigin(0.5, 0.5);
	}

	visualizeType(c)
	{
		if(!c.getType()) { return; }
		const pixelPos = this.toCenteredPixelPos(c.x, c.y);
		const sprite = this.add.sprite(pixelPos.x, pixelPos.y, "special_cells");
		sprite.setAlpha(this.cfg.spriteAlpha);
		sprite.setFrame(this.getFrameForType(c.getType()));
		sprite.displayWidth = sprite.displayHeight = this.cfg.spriteSize;
		sprite.setOrigin(0.5, 0.5);
	}

	visualizeWalls()
	{
		for(const wall of this.gen.walls)
		{
			const pixelPos = this.edgeToCenterPos(wall);
			const sprite = this.add.sprite(pixelPos.x, pixelPos.y, "special_cells");
			sprite.setRotation(wall.getRotation());
			sprite.setFrame(KEEBBLE_TYPES.wall.frame);
			sprite.setOrigin(0.5, 0.5);
			sprite.displayWidth = sprite.displayHeight = this.cfg.spriteSize;
		}
	}
}

