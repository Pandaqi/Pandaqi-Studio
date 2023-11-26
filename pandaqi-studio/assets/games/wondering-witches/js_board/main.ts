// @ts-nocheck
import { SPECIAL_CELLS } from "../js_shared/dict"
import Random from "js/pq_games/tools/random/main"
import OnPageVisualizer from "js/pq_games/website/onPageVisualizer"
import Section from "./section"
import { Scene, Geom } from "js/pq_games/phaser/phaser.esm"

const sceneKey = "boardGeneration"
class BoardGeneration extends Scene
{
	canvas:HTMLCanvasElement
	cfg:Record<string,any>
	gen: { graphics: any; sprites: any[]; gardens: any[]; ingredients: any[]; specialCells: any[]; numGardensOfPotionLength: number }
	
	constructor()
	{
		super({ key: sceneKey });
	}

	preload() {
		this.load.crossOrigin = 'Anonymous';
		this.canvas = this.sys.game.canvas;

		const base = 'assets/';
		const frameData = { frameWidth: 120, frameHeight: 120 };

		this.load.spritesheet('ingredients', base + 'ingredient_spritesheet.webp', frameData);
		this.load.spritesheet('specialCells', base + 'special_cell_spritesheet.webp', frameData);
	}

	async create(userConfig: any) {
		OnPageVisualizer.startCollection();

		this.createConfig(userConfig);
		this.generateBoard();
		this.visualize();
		
		await OnPageVisualizer.convertCanvasToImage(this);

		if(!this.cfg.pageBack) { OnPageVisualizer.endCollection(); return; }

		this.generateBoard();
		this.visualize();

		await OnPageVisualizer.convertCanvasToImage(this);
		OnPageVisualizer.endCollection();
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

		cfg.gridColor = 0x6666ff;
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

		cfg.gardenColors = [0x99FF99, 0x99EE99, 0x99DD99, 0x99CC99, 0x99BB99, 0x99AA99];
		cfg.gardenBorderColor = 0x000000;
		cfg.specialCellContainer = document.getElementById('special-cell-container');

		cfg.playerColors = [0x800000, 0x9A6324, 0x008080, 0x911EB4, 0x808088];
		cfg.playerColorsHex = ['#800000', '#9a6324', "#008080", "#911EB4", "#808088"];
		cfg.fontSize = 16.0 * cfg.graphicsScaleFactor;
		cfg.txtConfig = { 
			fontFamily: 'Mali', 
			fontSize: cfg.fontSize + "px", 
			color: cfg.playerColorsHex[0], 
			stroke: "#FFFFFF", 
			strokeThickness: cfg.fontSize / 4.0 
		}
		cfg.txtShadowColor = 'rgba(0,0,0,0.75)';
		cfg.txtShadowSize = 10 * cfg.graphicsScaleFactor;

		this.cfg = cfg;
	}

	generateBoard() 
	{
		this.gen = {
			graphics: null,
			sprites: [],
			gardens: [],
			ingredients: [],
			specialCells: [],
			numGardensOfPotionLength: 0
		}

		const shuffledSections = Random.shuffle(this.cfg.sections.slice());
		for(const section of shuffledSections)
		{
			this.fillSection(section);
		}
	}

	fillSection(section: any) 
	{	
		this.growGardens(section);
		console.log(section);
		this.placeIngredients(section);
		this.placeSpecialCells(section);
	}

	placeSpecialCells(section: { getTilesFlat: (arg0: boolean) => any[] })
	{
		if(!this.cfg.supercells) { return; }
		
		const tiles = Random.shuffle(section.getTilesFlat(true));
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

	placeIngredients(section: { getTilesFlat: (arg0: boolean) => any[] })
	{	
		const tiles = Random.shuffle(section.getTilesFlat(true));
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

	growGardens(section: { getTilesFlat: () => any[] })
	{
		const locations = Random.shuffle(section.getTilesFlat());

		while(locations.length > 0) 
		{
			const pos = locations.pop();
			if(pos.hasGarden()) { continue; }

			const garden = [pos];
			const cellsToCheck = [pos];
			pos.setGarden(garden);

			let keepGrowing = true;
			while(keepGrowing) {

				let emptyNeighboursLeft = (cellsToCheck.length > 0);
				if(!emptyNeighboursLeft) { break; }

				const c = cellsToCheck.splice(0,1)[0];
				const nbs = Random.shuffle(c.getValidNeighbors());

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

	visualize() {
		this.clearVisualization();

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

	paintGarden(graphics: { fillStyle: (arg0: any, arg1: number) => void; fillRectShape: (arg0: any) => void }, garden: any, idx: number)
	{
		for(const cell of garden) 
		{
			const rect = cell.asRect();
			const color = this.cfg.gardenColors[idx % this.cfg.gardenColors.length];
			graphics.fillStyle(color, 1.0);
			graphics.fillRectShape(rect);
			
		}
	}

	findGardenBorders(garden: any, borders: any[])
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

				var dl = dirsAsLine[i];
				var line = new Geom.Line(
					myCenter.x + 0.5*dl[0]*w, 
					myCenter.y + 0.5*dl[1]*h, 
					myCenter.x + 0.5*dl[2]*w, 
					myCenter.y + 0.5*dl[3]*h
				);

				borders.push(line);
			}
		}
	}

	visualizeGardens(graphics: any)
	{
		let idx = -1;
		for(const garden of this.gen.gardens)
		{
			idx++;
			this.paintGarden(graphics, garden, idx);
		}
	}

	visualizeGardenBorders(graphics: { lineStyle: (arg0: any, arg1: any, arg2: number) => void; strokeLineShape: (arg0: any) => void })
	{
		
		const borders = [];
		for(const garden of this.gen.gardens) 
		{
			this.findGardenBorders(garden, borders);
		}

		graphics.lineStyle(this.cfg.lineWidth, this.cfg.gardenBorderColor, 1.0);
		for(const border of borders) 
		{
			graphics.strokeLineShape(border);
		}
	}

	visualizeIngredients(graphics: { fillStyle: (arg0: number, arg1: number) => void; fillCircleShape: (arg0: any) => void })
	{
		const spriteSize = this.cfg.spriteSize;

		for(const cell of this.gen.ingredients) {

			const center = cell.getCenterPos();
			const ingFrame = cell.getIngredientAsFrame();
			const sprite = this.add.sprite(center.x, center.y, 'ingredients');

			sprite.displayWidth = sprite.displayHeight = spriteSize;
			sprite.setOrigin(0.5);
			sprite.setFrame(ingFrame);
			this.gen.sprites.push(sprite);

			var seedsDot = new Geom.Circle(sprite.x + 0.35*spriteSize, sprite.y, 0.05*spriteSize);
			graphics.fillStyle(0x000000, 1.0);
			graphics.fillCircleShape(seedsDot);
		}
	}

	visualizeSpecialCells(_graphics: any)
	{
		let typesUsed = new Set();
		const spriteSize = this.cfg.spriteSize;

		for(const cell of this.gen.specialCells) {
			const center = cell.getCenterPos();
			const typeFrame = cell.getTypeAsFrame();
			const sprite = this.add.sprite(center.x, center.y, 'specialCells');

			sprite.displayWidth = sprite.displayHeight = spriteSize;
			sprite.setOrigin(0.5);
			sprite.setFrame(typeFrame);
			this.gen.sprites.push(sprite);
			typesUsed.add(cell.getType());
		}

		// add helper/reminder explanations about the cell types underneath
		this.cfg.specialCellContainer.innerHTML = '';
		for(const type of Array.from(typesUsed)) {
			var data = SPECIAL_CELLS[type];

			var elem = '<div class="special-cell-explainer">';
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
	visualizeGrid(graphics: { lineStyle: (arg0: any, arg1: any, arg2: number) => void; strokeLineShape: (arg0: any) => void; strokeRectShape: (arg0: any) => void })
	{
		// => vertical
		for(var x = 0; x < this.cfg.xLines; x++) {
			var xPos = x*this.cfg.rectWidth;
			var l = new Geom.Line(xPos, 0, xPos, this.cfg.fullHeight);
			graphics.lineStyle(this.cfg.tinyLineWidth, this.cfg.gridColor, this.cfg.gridAlpha);
			graphics.strokeLineShape(l);
		}

		// => horizontal
		for(var y = 0; y < this.cfg.yLines; y++) {
			var yPos = y*this.cfg.rectHeight;
			var l = new Geom.Line(0, yPos, this.cfg.fullWidth, yPos);
			graphics.lineStyle(this.cfg.tinyLineWidth, this.cfg.gridColor, this.cfg.gridAlpha);
			graphics.strokeLineShape(l);
		}

		// => player area
		// (stroke the rectangle; scale slightly inwards for better separation)
		let playerNum = -1;
		for(const section of this.cfg.sections) {

			const rect = section.asRect();
			const centerX = (rect.x + 0.5*rect.width)
			const centerY = (rect.y + 0.5*rect.height);

			var edgeOffset = this.cfg.thickLineWidth * 0.5;
			rect.setSize(rect.width - 2*edgeOffset, rect.height - 2*edgeOffset);
			Geom.Rectangle.CenterOn(rect, centerX, centerY);

			playerNum += 1
			graphics.lineStyle(this.cfg.thickLineWidth, this.cfg.playerColors[playerNum], 1.0);
			graphics.strokeRectShape(rect);

			this.cfg.txtConfig.color = this.cfg.playerColorsHex[playerNum];
			var txt = this.add.text(centerX, centerY, 'Player ' + (playerNum + 1), this.cfg.txtConfig);
			txt.setShadow(0, 0, this.cfg.txtShadowColor, this.cfg.txtShadowSize);
			txt.setOrigin(0.5, 0.5);
			this.gen.sprites.push(txt);
		}
	}
}

OnPageVisualizer.linkTo({ scene: BoardGeneration, key: sceneKey, backend: "phaser" });
