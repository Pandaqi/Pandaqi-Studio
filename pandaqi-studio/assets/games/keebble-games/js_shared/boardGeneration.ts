import Cell from "./cell"
import CONFIG from "./config"
import { KEEBBLE_TYPES } from "./dict"
import Edge from "./edge"
import Color from "js/pq_games/layout/color/color"
import DropShadowEffect from "js/pq_games/layout/effects/dropShadowEffect"
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
import getWeighted from "js/pq_games/tools/random/getWeighted"
import shuffle from "js/pq_games/tools/random/shuffle"

interface GenerationData
{
	walls?: any[],
	cellsFlat?: Cell[],
	cells?: Cell[][]
}

export default class BoardGeneration
{
	cfg: Record<string,any>
	gen: GenerationData
	playerColors: Color[]
	baseCellBackgroundHue: number

	async draw(vis:BoardVisualizer) : Promise<ResourceGroup[]>
	{
		this.setup(vis)
		this.generate()
		return this.visualize(vis);
	}

	setup(vis:BoardVisualizer)
	{
		const userConfig = vis.config;
		userConfig.numPlayers = parseInt(userConfig.playerCount);
		Object.assign(CONFIG, userConfig);

		console.log(CONFIG);

		const cfg = CONFIG;
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

		cfg.cellSizeX = vis.size.x / cfg.numCellsX;
		cfg.cellSizeY = vis.size.y / cfg.numCellsY;
		cfg.cellSize = new Point(cfg.cellSizeX, cfg.cellSizeY);
		cfg.cellSizeUnit = Math.min(cfg.cellSizeX, cfg.cellSizeY);

		cfg.spriteSize = cfg.cellSizeUnit - 2 * cfg.spriteMargin;
		cfg.letterFontSize = cfg.cellSizeUnit - 2*cfg.letterMargin;
		cfg.maxLetterStrokeOffset = 0.12*cfg.letterFontSize;
		cfg.handFontSize = 0.25*cfg.letterFontSize;

		// Text configs
		cfg.letterTextConfig = new TextConfig({
			font: cfg.fontFamily,
			size: cfg.letterFontSize
		}).alignCenter();

		cfg.handTextConfig = new TextConfig({
			font: cfg.fontFamily,
			size: cfg.handFontSize
		}).alignCenter();

		this.createFullLetterDictionary(cfg);
		this.determinePlayerColors(cfg);
		this.createExpansionSetup(cfg);
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
		
		const hueDistBetweenPlayers = 360.0 / cfg.numPlayers;
		for(let i = 0; i < cfg.numPlayers; i++)
		{
			const hue = i*hueDistBetweenPlayers;
			const col = new Color(hue, 70, 70);
			colors.push(col);
		}

		this.playerColors = colors;
	}

	createExpansionSetup(cfg)
	{
		if(cfg.expansions.cellDance) { cfg.expansions.specialCells = true; }

		const typesCopy = structuredClone(cfg.typesOriginal);
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

		if(!CONFIG.addWalls) { return; }

		const edges = this.getAllEdges();
		shuffle(edges);
		const min = CONFIG.numWalls.min * edges.length;
		const max = CONFIG.numWalls.max * edges.length;
		const numWalls = Math.floor( Math.random() * (max - min) + min);
		
		for(let i = 0; i < numWalls; i++)
		{
			this.gen.walls.push(edges.pop());
		}
	}

	getCenterCells()
	{
		const cX1 = Math.floor(0.5 * CONFIG.numCellsX);
		const cX2 = Math.ceil(0.5 * CONFIG.numCellsX);
		const cY1 = Math.floor(0.5 * CONFIG.numCellsY);
		const cY2 = Math.ceil(0.5 * CONFIG.numCellsY);

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
			if(cell.x == 0 || cell.x == (CONFIG.numCellsX-1)) { arr.push(cell); }
			else if(cell.y == 0 || cell.y == (CONFIG.numCellsY-1)) { arr.push(cell); }
		}
		return arr;
	}

	pickStartingCell()
	{
		if(!CONFIG.addStartingCell) { return; }

		const centerCells = this.getCenterCells();
		shuffle(centerCells);
		centerCells.pop().setType("start");
	}

	getAllCells()
	{
		const grid = [];
		
		for(let x = 0; x < CONFIG.numCellsX; x++)
		{
			grid[x] = [];

			for(let y = 0; y < CONFIG.numCellsY; y++)
			{
				grid[x][y] = new Cell(x,y);
			}
		}

		return [grid, grid.flat()];
	}

	getAllEdges()
	{
		const edges = [];
		for(let x = 1; x < CONFIG.numCellsX; x++)
		{
			for(let y = 1; y < CONFIG.numCellsY; y++)
			{
				const pos = new Point(x, y);
				
				if(y < (CONFIG.numCellsY-1)) 
				{
					const posDown = new Point(x, y + 1);
					edges.push(new Edge(pos, posDown, 0.0))
				}
				
				if(x < (CONFIG.numCellsX-1))
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

	getFixedScore(letter:string)
	{
		return CONFIG.letterDictionary[letter].score;
	}

	getRandomLetter()
	{
		return getWeighted(CONFIG.letterDictionary);
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
		return getWeighted(CONFIG.types);
	}

	scaleToBoardSize(val:number)
	{
		return val * CONFIG.totalNumCells;
	}

	placeRandomLetters()
	{
		const max = this.scaleToBoardSize(CONFIG.numLetters.max);
		const min = this.scaleToBoardSize(CONFIG.numLetters.min);
		const numLetters = Math.floor(Math.random() * (max - min) + min);
		const letters = [];
		for(let i = 0; i < numLetters; i++)
		{
			letters.push(this.getRandomLetter());
		}

		const locations = this.getEmptyCells();
		shuffle(locations);
		while(letters.length)
		{
			const cell = locations.pop();
			cell.setLetter(letters.pop());
			this.removeNeighbors(cell, locations);
		}		
	}

	placeRandomSpecialCells()
	{
		if(!CONFIG.expansions.specialCells) { return; }

		const max = this.scaleToBoardSize(CONFIG.numSpecial.max);
		const min = this.scaleToBoardSize(CONFIG.numSpecial.max);
		const numCells = Math.floor(Math.random() * (max - min) + min);
		const types = [];
		for(let i = 0; i < numCells; i++)
		{
			types.push(this.getRandomType());
		}

		const locations = this.getEmptyCells();
		shuffle(locations);
		while(types.length && locations.length)
		{
			const cell = locations.pop();
			cell.setType(types.pop());
			this.removeNeighbors(cell, locations);
		}
	}

	removeNeighbors(cell:Cell, list:Cell[])
	{
		let removed = 0;
		for(let i = 0; i < list.length; i++)
		{
			const l = list[i];
			if(!cell.isNeighborWith(l)) { continue; }
			list.splice(i, 1);
			removed++;
			if(removed >= CONFIG.disallowedNeighborsOnPlacement) { break; }
		}
	}

	getRandomStartHand(size:number)
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
		if(!CONFIG.createStartingHands) { return; }

		const min = CONFIG.startHandSize.min;
		const max = CONFIG.startHandSize.max;
		const size = Math.floor(Math.random() * (max - min) + min);

		const numPlayers = CONFIG.numPlayers;
		const hands = [];
		for(let i = 0; i < numPlayers; i++)
		{
			hands.push(this.getRandomStartHand(size));
		}

		const locations = this.getEdgeCells();
		shuffle(locations);
		while(hands.length)
		{
			const c = locations.pop();
			const h = hands.pop();
			const playerNum = hands.length;
			c.setHand(playerNum, h)
			this.removeNeighbors(c, locations);
		}
	}

	visualize(vis:BoardVisualizer)
	{
		const group = new ResourceGroup();

		this.baseCellBackgroundHue = Math.random() * 360;

		this.visualizeBackground(vis, group);
		this.visualizeGrid(vis, group);
		this.visualizeCells(vis, group);
		this.visualizeWalls(vis, group);
		return [group];
	}

	cellToRect(c:Cell, randomness = 0) : Rectangle
	{
		const pixelPos = this.toPixelPos(c.getPos());
		const pixelSize = CONFIG.cellSize;

		if(c.hasHand()) { randomness = 0; }
		const wonkyOffset = this.getWonkyOffset(randomness);
		pixelPos.add(wonkyOffset);

		return new Rectangle().fromTopLeft(pixelPos, pixelSize);
	}

	edgeToCenterPos(e:Edge)
	{
		return this.toPixelPos( e.getCenterPos() );
	}

	getCellBackgroundColor(c:Cell = undefined) : Color
	{
		if(c)
		{
			if(c.hasHand()) { return this.playerColors[c.getPlayerNum()]; }
			if(c.getType()) { return CONFIG.types[c.getType()].col; }
		}
		
		const baseHue = this.baseCellBackgroundHue;
		const hue = baseHue + (Math.random()-0.5)*CONFIG.cellBackgroundHueVariation;
		return new Color(hue, 30, 80);
	}

	visualizeBackground(vis:BoardVisualizer, group:ResourceGroup)
	{
		if(CONFIG.inkFriendly) { return; }

		const cells = this.gen.cellsFlat.slice();
		shuffle(cells);
		const rand = CONFIG.baseCellBackgroundRandomness * CONFIG.cellSizeUnit;

		const bgRect = new Rectangle().fromTopLeft(new Point(), vis.size);
		const op = new LayoutOperation({
			fill: this.getCellBackgroundColor()
		});
		group.add(new ResourceShape(bgRect), op);
		
		for(const cell of cells)
		{
			const rect = this.cellToRect(cell, rand);
			const col = this.getCellBackgroundColor(cell);
			const op = new LayoutOperation({
				fill: col
			})
			group.add(new ResourceShape(rect), op);
		}
	}

	visualizeGrid(vis:BoardVisualizer, group:ResourceGroup)
	{
		// vertical lines
		const lw = CONFIG.lineWidth;
		const col = CONFIG.gridColor;
		const alpha = CONFIG.gridAlpha;
		const op = new LayoutOperation({
			stroke: col,
			strokeWidth: lw,
			alpha: alpha,
		})

		for(let x = 1; x < CONFIG.numCellsX; x++)
		{
			const xPixels = x * CONFIG.cellSizeX;
			const line = new Line(new Point(xPixels, 0), new Point(xPixels, vis.size.y));
			group.add(new ResourceShape(line), op);
		}

		// horizontal lines
		for(let y = 1; y < CONFIG.numCellsY; y++)
		{
			const yPixels = y * CONFIG.cellSizeY;
			const line = new Line(new Point(0, yPixels), new Point(vis.size.x, yPixels));
			group.add(new ResourceShape(line), op);
		}
	}

	toPixelPos(pos:Point) : Point
	{
		return new Point(CONFIG.cellSizeX * pos.x, CONFIG.cellSizeY * pos.y);
	}

	toCenteredPixelPos(pos:Point)
	{
		return this.toPixelPos(pos.clone().add(new Point(0.5)));
	}

	toOffsetPixelPos(startPos:Point, offsetPos:Point, cellSize:Point)
	{
		return new Point(
			startPos.x + offsetPos.x * cellSize.x,
			startPos.y + offsetPos.y * cellSize.y
		);
	}

	visualizeCells(vis:BoardVisualizer, group:ResourceGroup)
	{
		const cells = this.gen.cellsFlat.slice();

		while(cells.length)
		{
			const c = cells.pop();

			this.visualizeLetter(vis, group, c);
			this.visualizeHand(vis, group, c);
			this.visualizeType(vis, group, c);
		}
	}

	getFrameForType(type:string)
	{
		return CONFIG.types[type].frame;
	}

	getWonkyOffset(maxOffset = 100, cutoff = 0.66) : Point
	{
		let randAngle = Math.random() * 2 * Math.PI;
		let rand = cutoff + Math.random()*(1.0 - cutoff);
		let dist = rand * maxOffset;
		return new Point(
			Math.cos(randAngle) * dist,
			Math.sin(randAngle) * dist
		);
	}

	visualizeLetter(vis:BoardVisualizer, group:ResourceGroup, c:Cell)
	{
		if(!c.getLetter()) { return; }
		const pixelPos = this.toCenteredPixelPos(c.getPos());
		const letter = c.getLetter().toUpperCase();

		const randOffset = this.getWonkyOffset(CONFIG.maxLetterStrokeOffset);
		const resText = new ResourceText({ text: letter, textConfig: CONFIG.letterTextConfig });
		const textDims = new Point(3*CONFIG.letterTextConfig.size);
		const op = new LayoutOperation({
			pos: pixelPos,
			size: textDims,
			pivot: Point.CENTER,
			fill: "#FFFFFF",
			stroke: "#000000",
			strokeWidth: 12, // trying to match the thickness of the sprite strokes
			strokeAlign: StrokeAlign.OUTSIDE,
			effects: [new DropShadowEffect({ offset: randOffset.scale(0.5), color: "#00000099", blur: 0 })]
		})
		group.add(resText, op);

		if(CONFIG.showLetterValues)
		{
			const txt = this.getFixedScore(c.getLetter());
			const posBottomRight = this.toPixelPos(c.getPos().add(new Point(0.85)));
			const resText = new ResourceText({ text: txt, textConfig: CONFIG.handTextConfig });
			const op = new LayoutOperation({
				pos: posBottomRight,
				fill: "#000000",
				pivot: Point.CENTER
			})
			group.add(resText, op);
		}
	}

	visualizeHand(vis:BoardVisualizer, group:ResourceGroup, c:Cell)
	{
		if(!c.hasHand()) { return; }

		const startPos = this.toPixelPos(c.getPos());
		const w = CONFIG.backpackGridSize.x;
		const h = CONFIG.backpackGridSize.y;

		const cellX = (CONFIG.cellSizeX / w);
		const cellY = (CONFIG.cellSizeY / h);
		const backpackCellSize = new Point(cellX, cellY);

		const displayAsGrid = CONFIG.expansions.tinyBackpacks
		if(displayAsGrid)
		{
			const col = CONFIG.backpackGridColor;
			const alpha = CONFIG.backpackGridAlpha;
			const lw = CONFIG.backpackLineWidth;

			const op = new LayoutOperation({
				stroke: col,
				strokeWidth: lw,
				alpha: alpha
			});

			// vertical lines
			for(let x = 1; x < w; x ++)
			{
				const pixelX = startPos.x + cellX * x;
				const line = new Line(new Point(pixelX, startPos.y), new Point(pixelX, startPos.y + CONFIG.cellSize.y));
				group.add(new ResourceShape(line), op);
			}

			// horizontal lines
			for(let y = 1; y < h; y ++)
			{
				const pixelY = startPos.y + cellY * y;
				const line = new Line(new Point(startPos.x, pixelY), new Point(startPos.x + CONFIG.cellSizeX, pixelY));
				group.add(new ResourceShape(line), op);
			}
		}

		// place letters from top left into those cells
		const displayLettersAsGrid = displayAsGrid || CONFIG.forPrinting
		const textDims = new Point(CONFIG.cellSizeX, 2*CONFIG.handTextConfig.size);
		if(displayLettersAsGrid)
		{
			const hand = c.getHand();
			for(let i = 0; i < hand.length; i++)
			{
				const col = (i % w);
				const row = Math.floor(i / w);
				const offsetPos = new Point( (col+0.5), (row+0.5) );
				const pixelPos = this.toOffsetPixelPos(startPos, offsetPos, backpackCellSize);

				const resText = new ResourceText({ text: hand[i], textConfig: CONFIG.handTextConfig });
				const op = new LayoutOperation({
					pos: pixelPos,
					size: textDims,
					pivot: Point.CENTER,
					fill: "#000000"
				})
				group.add(resText, op);
			}

			return;
		}

		// otherwise, place centered
		const pixelPos = this.toCenteredPixelPos(c.getPos());
		const txt = c.getHandAsText();
		const resText = new ResourceText({ text: txt, textConfig: CONFIG.handTextConfig });
		const op = new LayoutOperation({
			pos: pixelPos,
			size: textDims,
			pivot: Point.CENTER,
			fill: "#000000"
		});
		group.add(resText, op);
	}

	visualizeType(vis:BoardVisualizer, group:ResourceGroup, c:Cell)
	{
		if(!c.getType()) { return; }
		
		const pixelPos = this.toCenteredPixelPos(c.getPos());
		const resSpecial = vis.getResource("special_cells");
		const op = new LayoutOperation({
			pos: pixelPos,
			size: new Point(CONFIG.spriteSize),
			pivot: Point.CENTER,
			alpha: CONFIG.spriteAlpha,
			frame: this.getFrameForType(c.getType())
		});
		group.add(resSpecial, op);
	}

	visualizeWalls(vis:BoardVisualizer, group:ResourceGroup)
	{
		const resSpecial = vis.getResource("special_cells");

		for(const wall of this.gen.walls)
		{
			const pixelPos = this.edgeToCenterPos(wall);
			const op = new LayoutOperation({
				pos: pixelPos,
				size: new Point(CONFIG.spriteSize),
				rot: wall.getRotation(),
				frame: KEEBBLE_TYPES.wall.frame,
				pivot: Point.CENTER
			});
			group.add(resSpecial, op);
		}
	}
}

