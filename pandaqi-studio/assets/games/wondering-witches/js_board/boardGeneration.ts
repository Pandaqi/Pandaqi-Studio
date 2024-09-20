import { INGREDIENTS, SPECIAL_CELLS } from "../js_shared/dict"
import Section from "./section"
// @ts-ignore
import { Scene } from "js/pq_games/phaser/phaser.esm"
import Point from "js/pq_games/tools/geometry/point"
import ResourceLoader from "js/pq_games/layout/resources/resourceLoader"
import setDefaultPhaserSettings from "js/pq_games/phaser/setDefaultPhaserSettings"
import resourceLoaderToPhaser from "js/pq_games/phaser/resourceLoaderToPhaser"
import shuffle from "js/pq_games/tools/random/shuffle"
import Cell from "./cell"
import LayoutOperation from "js/pq_games/layout/layoutOperation"
import imageToPhaser from "js/pq_games/phaser/imageToPhaser"
import ResourceText from "js/pq_games/layout/resources/resourceText"
import textToPhaser from "js/pq_games/phaser/textToPhaser"
import TextConfig from "js/pq_games/layout/text/textConfig"
import Line from "js/pq_games/tools/geometry/line"
import { circleToPhaser, lineToPhaser, rectToPhaser } from "js/pq_games/phaser/shapeToPhaser"
import Circle from "js/pq_games/tools/geometry/circle"
import Color from "js/pq_games/layout/color/color"

interface GenData
{
	graphics: any
	sprites: any[]
	gardens: Garden[]
	ingredients: Cell[]
	specialCells: Cell[]
	numGardensOfPotionLength: number 
}

type Garden = Cell[]

export default class BoardGeneration extends Scene
{
	canvas:HTMLCanvasElement
	cfg:Record<string,any>
	gen:GenData
	
	constructor()
	{
		super({ key: "boardGeneration" });
	}

	preload() 
	{
		setDefaultPhaserSettings(this); 
	}

	async create(userConfig: any) 
	{
        await resourceLoaderToPhaser(userConfig.visualizer.resLoader, this);

		userConfig.visualizer.startCollection();

		this.createConfig(userConfig);
		this.generateBoard();
		this.visualize();
		
		await userConfig.visualizer.convertCanvasToImage(this);

		if(!this.cfg.pageBack) { userConfig.visualizer.endCollection(); return; }

		this.generateBoard();
		this.visualize();

		await userConfig.visualizer.convertCanvasToImage(this);
		userConfig.visualizer.endCollection();
	}

	createConfig(userConfig:Record<string,any>)
	{
		const cfg : Record<string,any> = {};
		userConfig.numPlayers = parseInt(userConfig.numPlayers);
		Object.assign(cfg, userConfig);

		console.log(cfg);

		// divide the paper into rectangles based on player count
		cfg.paperSectionsLibrary = [
			[[0,0,8,4]],
			[[0,0,4,4], [4,0,4,4]],
			[[0,0,5,2], [0,2,5,2], [5,0,3,4]],
			[[0,0,4,2], [4,0,4,2], [0,2,4,2], [4,2,4,2]],
			[[0,0,3,2], [3,0,3,2], [0,2,3,2], [3,2,3,2], [6,0,2,4]],
		];

		cfg.paperSections = cfg.paperSectionsLibrary[cfg.numPlayers - 1];
		cfg.sections = [];
		for(const section of cfg.paperSections)
		{
			cfg.sections.push(new Section(cfg, section[0], section[1], section[2], section[3]));
		}

		cfg.xLines = 8;
		cfg.yLines = 4;

		cfg.graphicsScaleFactor = 4.0;

		cfg.recipeLength = 4;
		cfg.maxGardenSize = cfg.recipeLength;
		cfg.minGardensOfPotionLength = 2; // how many gardens should exist (at least) that can contain the final potion
		cfg.useBackPage = userConfig.pageBack;

		cfg.fullWidth = this.canvas.width;
		cfg.fullHeight = this.canvas.height;

		cfg.lineWidth = 3 * cfg.graphicsScaleFactor;
		cfg.tinyLineWidth = Math.floor(0.5*cfg.lineWidth);
		cfg.thickLineWidth = 2 * cfg.lineWidth;

		cfg.gridColor = "#6666FF";
		cfg.gridAlpha = 0.5;

		cfg.rectWidth = (cfg.fullWidth / cfg.xLines)
		cfg.rectHeight = (cfg.fullHeight / cfg.yLines)
		cfg.spriteSize = cfg.rectWidth*0.9;
		cfg.totalNumCells = cfg.xLines * cfg.yLines;

		cfg.numCellBounds = { min: 0, max: 3 } // this is PER SECTION
		cfg.maxSpecialCells = Math.round(0.2 * cfg.totalNumCells); // this is in TOTAL
		cfg.specialCellNames = Object.keys(SPECIAL_CELLS);
		cfg.numSpecialCells = cfg.specialCellNames.length;

		cfg.numIngredientBounds = { min: 0, max: 2 }
		cfg.maxIngredients = Math.round(0.1 * cfg.totalNumCells);

		cfg.gardenColors = ["#99FF99", "#99EE99", "#99DD99", "#99CC99", "#99BB99", "#99AA99"];
		cfg.gardenBorderColor = "#000000";

		const elem = document.createElement("span");
		elem.id = "special-cell-container";
		document.body.appendChild(elem);
		cfg.specialCellContainer = elem;

		cfg.playerColorsHex = ['#800000', '#9A6324', "#008080", "#911EB4", "#808088"];
		cfg.fontSize = 16.0 * cfg.graphicsScaleFactor;
		cfg.textConfig = 
		{ 
			fontFamily: 'mali', 
			fontSize: cfg.fontSize, 
		}
		cfg.txtShadowColor = '#000000BB';
		cfg.txtShadowSize = 10 * cfg.graphicsScaleFactor;

		this.cfg = cfg;
	}

	generateBoard() 
	{
		this.gen = 
		{
			graphics: null,
			sprites: [],
			gardens: [],
			ingredients: [],
			specialCells: [],
			numGardensOfPotionLength: 0
		}

		const shuffledSections = shuffle(this.cfg.sections.slice()) as Section[];
		for(const section of shuffledSections)
		{
			this.fillSection(section);
		}
	}

	fillSection(section:Section) 
	{	
		this.growGardens(section);
		this.placeIngredients(section);
		this.placeSpecialCells(section);
	}

	placeSpecialCells(section:Section)
	{
		if(!this.cfg.supercells) { return; }
		
		const tiles = shuffle(section.getTilesFlat(true));
		let min = this.cfg.numCellBounds.min
		let max = this.cfg.numCellBounds.max;
		if(this.cfg.numPlayers <= 2) { min++; max++; }
		if(this.cfg.numPlayers <= 1) { min++; max++; }

		let numWanted = Math.floor(Math.random() * (max - min)) + min;
		const nothingPlacedYet = this.gen.specialCells.length <= 0;
		if(nothingPlacedYet && numWanted == 0) { numWanted++; }

		for(let i = 0; i < numWanted; i++)
		{
			const hitMaximum = this.gen.specialCells.length >= this.cfg.maxSpecialCells;
			const outOfOptions = tiles.length <= 0
			if(hitMaximum || outOfOptions) { break; }

			// slightly favor good ( = type 0) over bad cells
			let idx = Math.floor(Math.random() * this.cfg.numSpecialCells);
			let name = this.cfg.specialCellNames[idx];

			const isBadType = SPECIAL_CELLS[name].type == 1
			if(isBadType) 
			{ 
				idx = Math.floor(Math.random() * this.cfg.numSpecialCells); 
				name = this.cfg.specialCellNames[idx];
			}

			const cell = tiles.pop();
			cell.setType(name);
			this.gen.specialCells.push(cell);
		}
	}

	placeIngredients(section:Section)
	{	
		const tiles = shuffle(section.getTilesFlat(true));
		let min = this.cfg.numIngredientBounds.min
		let max = this.cfg.numIngredientBounds.max;
		if(this.cfg.numPlayers <= 2) { min++; max++; }
		if(this.cfg.numPlayers <= 1) { min++; max++; }
		let numWanted = Math.floor(Math.random() * (max - min)) + min;
		
		const nothingPlacedYet = this.gen.ingredients.length;
		if(nothingPlacedYet && numWanted == 0) { numWanted++; }

		for(let i = 0; i < numWanted; i++)
		{
			const hitMaximum = this.gen.ingredients.length >= this.cfg.maxIngredients;
			const outOfOptions = tiles.length <= 0
			if(hitMaximum || outOfOptions) { break; }

			const randIngredient = Math.floor(Math.random()*this.cfg.recipeLength); 
			const cell = tiles.pop();
			cell.setIngredient(randIngredient);
			this.gen.ingredients.push(cell);
		}
	}

	growGardens(section:Section)
	{
		const locations = shuffle(section.getTilesFlat());

		while(locations.length > 0) 
		{
			const pos = locations.pop();
			if(pos.hasGarden()) { continue; }

			const garden = [pos];
			const cellsToCheck = [pos];
			pos.setGarden(garden);

			let keepGrowing = true;
			while(keepGrowing) 
			{
				let emptyNeighboursLeft = (cellsToCheck.length > 0);
				if(!emptyNeighboursLeft) { break; }

				const c = cellsToCheck.splice(0,1)[0];
				const nbs = shuffle(c.getValidNeighbors());

				for(const nb of nbs)
				{
					let gardenTooBig = garden.length >= this.cfg.maxGardenSize;
					if(gardenTooBig) { break; }

					// the larger we get, the less likely we are to grow
					// but always ensure we have a few gardens of "potion" length
					const doSizeCheck = (this.gen.numGardensOfPotionLength >= this.cfg.minGardensOfPotionLength);
					const probCutoff = 1.0 / (1.5*garden.length);
					if(doSizeCheck && Math.random() > probCutoff) { continue; }

					nb.setGarden(garden);
					garden.push(nb);
					cellsToCheck.push(nb);
				}
			}

			if(garden.length == this.cfg.recipeLength)
			{
				this.gen.numGardensOfPotionLength++;
			}

			this.gen.gardens.push(garden);
		}
	}

	visualize() 
	{
		this.clearVisualization();

		// @ts-ignore
		const graphics = this.add.graphics();
		this.gen.graphics = graphics;

		this.visualizeGardens(graphics);
		this.visualizeGrid(graphics);
		this.visualizeGardenBorders(graphics);
		this.visualizeIngredients(graphics);
		this.visualizeSpecialCells(graphics);
	}

	clearVisualization()
	{
		if(this.gen.graphics) { this.gen.graphics.destroy(true); }
		for(const sprite of this.gen.sprites)
		{
			sprite.destroy(true);
		}
	}

	paintGarden(graphics:any, garden:Garden, idx: number)
	{
		for(const cell of garden) 
		{
			const rect = cell.asRect();
			const color = this.cfg.gardenColors[idx % this.cfg.gardenColors.length];
			const op = new LayoutOperation({ fill: color });
			rectToPhaser(rect, op, graphics);
		}
	}

	findGardenBorders(garden:Garden, borders: Line[])
	{
		const dirsAsLine = [[1,-1,1,1], [1,1,-1,1], [-1,1,-1,-1], [-1,-1,1,-1]];
		const w = this.cfg.rectWidth, h = this.cfg.rectHeight;
		
		for(const cell of garden) {
			const tempX = cell.x;
			const tempY = cell.y;
			const myCenter = { 
				x: (tempX + 0.5) * w, 
				y: (tempY + 0.5) * h
			};

			const nbs = cell.getBorderNeighbours();
			for(let i = 0; i < nbs.length; i++)
			{
				if(nbs[i]) { continue; }

				const dl = dirsAsLine[i];
				const line = new Line(
					new Point(myCenter.x + 0.5*dl[0]*w, 
					myCenter.y + 0.5*dl[1]*h), 
					new Point(myCenter.x + 0.5*dl[2]*w, 
					myCenter.y + 0.5*dl[3]*h)
				);

				borders.push(line);
			}
		}
	}

	visualizeGardens(graphics:any)
	{
		let idx = -1;
		for(const garden of this.gen.gardens)
		{
			idx++;
			this.paintGarden(graphics, garden, idx);
		}
	}

	visualizeGardenBorders(graphics:any)
	{
		
		const borders : Line[] = [];
		for(const garden of this.gen.gardens) 
		{
			this.findGardenBorders(garden, borders);
		}

		const opLine = new LayoutOperation({
			stroke: this.cfg.gardenBorderColor,
			strokeWidth: this.cfg.lineWidth
		})

		for(const border of borders) 
		{
			lineToPhaser(border, opLine, graphics);
		}
	}

	visualizeIngredients(graphics:any)
	{
		const spriteSize = this.cfg.spriteSize;

		const res = this.cfg.visualizer.resLoader.getResource("ingredient_spritesheet");

		const opDot = new LayoutOperation({
			fill: "#000000"
		});

		for(const cell of this.gen.ingredients) {

			const center = cell.getCenterPos();
			const ingFrame = cell.getIngredientAsFrame();

			const op = new LayoutOperation({
				translate: center,
				dims: new Point(spriteSize),
				pivot: Point.CENTER,
				frame: ingFrame
			});
			this.gen.sprites.push( imageToPhaser(res, op, this) );

			const circleCenter = new Point(center.x + 0.35*spriteSize, center.y);
			const seedsDot = new Circle({ center: circleCenter, radius: 0.05*spriteSize });
			circleToPhaser(seedsDot, opDot, graphics);
		}
	}

	visualizeSpecialCells(_graphics: any)
	{
		let typesUsed : Set<string> = new Set();
		const spriteSize = this.cfg.spriteSize;

		const res = this.cfg.visualizer.resLoader.getResource("special_cell_spritesheet");

		for(const cell of this.gen.specialCells) 
		{
			const center = cell.getCenterPos();
			const typeFrame = cell.getTypeAsFrame();

			const op = new LayoutOperation({
				translate: center,
				dims: new Point(spriteSize),
				pivot: Point.CENTER,
				frame: typeFrame
			})
			this.gen.sprites.push( imageToPhaser(res, op, this) );
			typesUsed.add(cell.type);
		}

		// add helper/reminder explanations about the cell types underneath
		this.cfg.specialCellContainer.innerHTML = '';
		for(const type of Array.from(typesUsed)) 
		{
			const data = SPECIAL_CELLS[type];

			let elem = '<div class="special-cell-explainer">';
			elem += '<span><div class="special-cell-sprite" style="background-position:' + (-60 * data.frame) + 'px;"></div></span>';
			elem += '<span><strong>' + data.name + '</strong></span>';
			elem += '<span>' + data.explanation + '</span>';
			elem += '</div>';

			this.cfg.specialCellContainer.innerHTML += elem;
		}
	}

	// @SOURCE (colors): 
	//  - https://graphicdesign.stackexchange.com/questions/3682/where-can-i-find-a-large-palette-set-of-contrasting-colors-for-coloring-many-d
	//  - https://sashat.me/2017/01/11/list-of-20-simple-distinct-colors/
	//
	visualizeGrid(graphics:any)
	{
		const color = new Color(this.cfg.gridColor);
		color.a = this.cfg.gridAlpha;
		const opLine = new LayoutOperation({
			stroke: color,
			strokeWidth: this.cfg.tinyLineWidth
		});

		// => vertical
		for(let x = 0; x < this.cfg.xLines; x++) 
		{
			const xPos = x*this.cfg.rectWidth;
			const l = new Line(new Point(xPos, 0), new Point(xPos, this.cfg.fullHeight));
			lineToPhaser(l, opLine, graphics);
		}

		// => horizontal
		for(let y = 0; y < this.cfg.yLines; y++) 
		{
			const yPos = y*this.cfg.rectHeight;
			const l = new Line(new Point(0, yPos), new Point(this.cfg.fullWidth, yPos));
			lineToPhaser(l, opLine, graphics);
		}

		// => player area
		// (stroke the rectangle; scale slightly inwards for better separation)
		const fontSize = this.cfg.textConfig.fontSize;
		const textConfig = new TextConfig({
			font: this.cfg.textConfig.fontFamily,
			size: fontSize
		}).alignCenter();

		let playerNum = 0;
		for(const section of this.cfg.sections)
		{
			const rect = section.asRect();
			const rectSize = rect.getSize();

			// this just slightly shrinks the rectangle because it looks better and avoids doubling edges at borders
			const edgeOffset = this.cfg.thickLineWidth * 0.5;
			rect.extents = new Point(rectSize.x - 4*edgeOffset, rectSize.y - 4*edgeOffset);

			const color = this.cfg.playerColorsHex[playerNum];
			console.log(color);
			console.log(this.cfg.playerColorsHex);
			console.log(this.cfg.thickLineWidth);
			const opRect = new LayoutOperation({
				stroke: color,
				strokeWidth: this.cfg.thickLineWidth
			})
			rectToPhaser(rect, opRect, graphics);

			const str = 'Player ' + (playerNum + 1);
			const opText = new LayoutOperation({
				translate: rect.center,
				fill: color,
				dims: new Point(20 * fontSize, 2 * fontSize),
				pivot: Point.CENTER,
				stroke: "#FFFFFF",
				strokeWidth: this.cfg.fontSize / 4.0
			})

			const resText = new ResourceText({ text: str, textConfig: textConfig });
			this.gen.sprites.push( textToPhaser(resText, opText, this) );
			// txt.setShadow(0, 0, this.cfg.txtShadowColor, this.cfg.txtShadowSize); => NOT IMPLEMENTED YET BY ME

			playerNum++;
		}
	}
}