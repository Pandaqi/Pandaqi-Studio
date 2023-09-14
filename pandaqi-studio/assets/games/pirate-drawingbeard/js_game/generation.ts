import Config from "./config"
import Extractor from "./extractor"
import HintVisualizer from "./hintVisualizer"
import Hints from "./hints"
import Interface from "./interface"
import Map from "./map"
import { TILE_DICT, SYMBOLS } from "./dictionary"
// @ts-ignore
import Phaser from "js/pq_games/phaser.esm"
import Point from "js/pq_games/tools/geometry/point"

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

		let sheetData =  { frameWidth: 256, frameHeight: 256 };
		let base = 'assets/';

		this.load.spritesheet('tile_types', base + 'tile_types.webp', sheetData);
		this.load.spritesheet('tile_types_inkfriendly', base + 'tile_types_inkfriendly.webp', sheetData);

		this.load.spritesheet('symbols', base + 'symbols.webp', sheetData);
		this.load.spritesheet('symbols_inkfriendly', base + 'symbols_inkfriendly.webp', sheetData);

		this.load.spritesheet('hint_cards', base + 'hint_cards.webp', { frameWidth: 495, frameHeight: 525 });

		// (also) used by hint visualizer
		this.load.spritesheet('hint_base', base + 'hint_base.webp', sheetData);
		this.load.spritesheet('hint_base_inkfriendly', base + 'hint_base_inkfriendly.webp', sheetData);

		this.load.spritesheet('hint_tile_type', base + 'hint_tile_type.webp', sheetData);
		this.load.spritesheet('hint_tile_type_inkfriendly', base + 'hint_tile_type_inkfriendly.webp', sheetData);

		this.load.spritesheet('hint_quadrant', base + 'hint_quadrant.webp', sheetData);
		this.load.spritesheet('hint_quadrant_inkfriendly', base + 'hint_quadrant_inkfriendly.webp', sheetData);

		this.load.spritesheet('hint_bearings', base + 'hint_bearings.webp', sheetData);
		this.load.spritesheet('hint_bearings_inkfriendly', base + 'hint_bearings_inkfriendly.webp', sheetData);

		this.load.spritesheet('hint_symbols', base + 'hint_symbols.webp', sheetData);
		this.load.spritesheet('hint_symbols_inkfriendly', base + 'hint_symbols_inkfriendly.webp', sheetData);

		document.getElementById('debugging').innerHTML = '';
    },

    create: function(config) {
    	Config.initialize(this, config);
    	HintVisualizer.prepare();

    	let timeout = 20;
    	let interval;
    	let mainGenerationAction = function()
    	{
    		Config.numGens += 1;

    		Map.initialize();
    		Hints.initialize();

    		let hasSolution = Hints.solution;
    		if(hasSolution)
    		{
    			clearInterval(interval);
    			this.onGenerationFinished();
    		}
    	}

    	interval = setInterval(mainGenerationAction.bind(this), timeout);
	},

	// we pass a flat list to the HINT visualizer; it saves the final image on the hint object itself
	onGenerationFinished: function()
	{    	
		this.visualize();
		HintVisualizer.visualizeAll(Hints.getAsList(), this.onHintVisualizationFinished.bind(this)); 
	},

	// if debugging, just stop here and keep the phaser game alive
	// otherwise, cache the images (and destroy phaser afterwards)
	onHintVisualizationFinished: function()
	{
		for(let i = 0; i < Hints.perPlayer.length; i++)
		{
			let hints = Hints.perPlayer[i];
			for(let h = 0; h < hints.length; h++)
			{
				let img = hints[h].image.src;
				let id = hints[h].id + "_" + hints[h].numericID;
				this.textures.addBase64(id, img);
			}
		}

		if(Config.useInterface) {
			Extractor.cacheImages(this.onImageCachingFinished.bind(this));
			return;
		}

		this.finishCreation();
	},

	// if we want a PDF, create it now
	onImageCachingFinished: function()
	{
		if(Config.createPremadeGame) {
			Extractor.createPremadeGame(this.onPremadeCreationFinished.bind(this));
			return;
		}
		this.finishCreation();
	},

	onPremadeCreationFinished: function()
	{
		this.finishCreation();
	},

	// this is only called when we're completely, totally, definitely done with creation
	// which means we fire up the interface
	finishCreation()
	{
		Interface.initialize();
	},

	/*
		VISUALIZATION
	 */
	visualize: function()
	{
		this.clearMap();

		const oX = Config.oX;
		const oY = Config.oY;
		const cs = Config.cellSize;
		const inkFriendly = Config.inkFriendly;

		let textureKey = 'tile_types';
		let symbolTextureKey = 'symbols';
		let hintBaseKey = 'hint_tile_type';
		
		if(inkFriendly) { 
			textureKey += '_inkfriendly'; 
			symbolTextureKey += '_inkfriendly';
			hintBaseKey += '_inkfriendly';
		}

		let connLineWidth = 10;
		let connLineColor = 0x000000;
		let networkGraphics = this.add.graphics();
		networkGraphics.lineStyle(connLineWidth, connLineColor, 1.0); 

		let specialTileGraphics = this.add.graphics();

		for(let i = 0; i < Map.mapList.length; i++)
		{
			let cell = Map.mapList[i];
			let fX = oX + cell.x*cs + 0.5*cs;
			let fY = oY + cell.y*cs + 0.5*cs;

			// show tile type
			let type = cell.type;
			let frame = TILE_DICT[type].frame;

			let sprite = this.add.image(fX, fY, textureKey, frame);
			sprite.displayWidth = cs;
			sprite.displayHeight = cs;
			sprite.setOrigin(0.5, 0.5);

			// rotate correctly
			sprite.rotation = cell.rotation * 0.5 * Math.PI;

			// show network connections
			if(Config.expansions.networks)
			{
				for(let n = 0; n < cell.connNbs.length; n++)
				{
					let nbX = oX + cell.connNbs[n].x*cs + 0.5*cs;
					let nbY = oY + cell.connNbs[n].y*cs + 0.5*cs;

					let line = new Phaser.Geom.Line(fX, fY, nbX, nbY);
					networkGraphics.strokeLineShape(line);
				}
			}
			
			// show symbols
			if(Config.expansions.symbols)
			{
				for(let s = 0; s < cell.symbols.length; s++)
				{
					let symbol = cell.symbols[s];
					if(symbol == null) { continue; }

					let symbolFrame = SYMBOLS[symbol].frame;
					let finalRotation = sprite.rotation + (s+1)*0.5*Math.PI;
					let symbolSprite = this.add.image(fX, fY, symbolTextureKey, symbolFrame);
					symbolSprite.rotation = finalRotation;
					symbolSprite.displayWidth = cs;
					symbolSprite.displayHeight = cs;
				}
			}

			// the Map tile is very special and gets a whole grid on top of it
			if(type == "map")
			{
				specialTileGraphics.lineStyle(1, 0x000000, 0.5);
				specialTileGraphics.fillStyle(0xFF0000, 0.5);

				specialTileGraphics.x = sprite.x;
				specialTileGraphics.y = sprite.y;
				specialTileGraphics.rotation = sprite.rotation + 0.5*Math.PI; // map is rotated sideways, made more sense for tile and arrow

				let maxGridWidth = 0.66*cs;
				let gridCellSize = Math.floor(maxGridWidth/Map.width);
				let gridSize = new Point( Map.width*gridCellSize, Map.height*gridCellSize);
				let gridOffset = new Point( -0.5*gridSize.x, -0.5*gridSize.y);

				for(let x = 1; x < Map.width; x++)
				{
					let line = new Phaser.Geom.Line(gridOffset.x + x*gridCellSize, gridOffset.y, gridOffset.x + x*gridCellSize, gridOffset.y + gridSize.y);
					specialTileGraphics.strokeLineShape(line);
				}

				for(let y = 1; y < Map.height; y++)
				{
					let line = new Phaser.Geom.Line(gridOffset.x, gridOffset.y + y*gridCellSize, gridOffset.x + gridSize.x, gridOffset.y + y*gridCellSize);
					specialTileGraphics.strokeLineShape(line);
				}

				let markGroup = this.add.container();
				for(let i = 0; i < Map.markedMapTiles.length; i++)
				{
					let tile = Map.markedMapTiles[i];
					let fX = gridOffset.x + (tile.x+0.5)*gridCellSize;
					let fY = gridOffset.y + (tile.y+0.5)*gridCellSize;
					let markSprite = this.add.image(fX, fY, hintBaseKey, 10);
					markSprite.displayWidth = markSprite.displayHeight = 0.66*gridCellSize;

					markGroup.add(markSprite);
				}

				markGroup.x = sprite.x;
				markGroup.y = sprite.y;
				markGroup.rotation = sprite.rotation + 0.5*Math.PI;

			}
		}

		this.children.bringToTop(specialTileGraphics);
		//this.children.bringToTop(networkGraphics); => actually works better when behind!

		// display the HOOK that indicates top left!
		let hookSprite = this.add.image(oX + 0.1*cs, oY, hintBaseKey, 11);
		hookSprite.displayWidth = hookSprite.displayHeight = 0.25*cs;
		hookSprite.setOrigin(0.5, 0.5);

		// display the SEED
		let txtConfig = 
		{
			fontFamily: 'Chelsea Market', 
			fontSize: '11px',
			color: '#111111', 
			stroke: '#FFFFFF',
			strokeThickness: 3,
		}

		let txt = this.add.text(oX + 0.5*cs, oY + 0.05*cs, Config.seed, txtConfig);
		txt.setOrigin(0.5, 0);
		txt.depth = 10000;

		// display the hints (only when debugging of course)
		if(Config.debugging && Config.debugHintText) {
			let margin = 12;
			let lineHeight = 24;
			let counter = 0;
			for(let i = 0; i < Hints.perPlayer.length; i++)
			{
				let playerString = "P" + (i+1) + ": ";

				for(let j = 0; j < Hints.perPlayer[i].length; j++)
				{
					let txt = this.add.text(oX + margin, oY + margin + counter*lineHeight, playerString + Hints.perPlayer[i][j].text, txtConfig);
					txt.setOrigin(0,0);
					txt.depth = 10000;
					counter += 1;
				}
				
			}
		}

		// highlight the location (only when debugging)
		if(Config.debugging && Config.debugTreasureLocation)
		{
			this.showTreasureRectangle();
		}

	},

	// NOTE: we simply overlap the rectangle with the map that's already there; makes it simpler for the interface to display the solution
	visualizeTreasure()
	{
		this.showTreasureRectangle();
	},

	visualizeHintCards()
	{
		this.clearMap();

		let cardMargin = new Point( 20, 20);
		let margin = new Point( 30, 80);
		let metadataMargin = new Point( 150, 20)
		let headerHeight = 70;
		let scale = 0.735 // @IMPROV: calculate dynamically based on PDF size
		let cardSize = { "w": 495*scale, "h": 525*scale }

		let metadataTextConfig = 
		{
			fontFamily: 'Chelsea Market', 
			fontSize: '11px',
			color: '#111111'
		}

		let ctx = this.canvas.getContext('2d');
		let cardIdx = 0;
		if(Config.inkFriendly) { cardIdx = 1; }

		let gridGraphics = this.add.graphics();
		let lineWidth = 2;
		let lineColor = 0x000000;
		let alpha = 0.4;
		gridGraphics.lineStyle(lineWidth, lineColor, alpha); 
		gridGraphics.fillStyle(lineColor, 0.33*alpha);

		for(let i = 0; i < Config.playerCount; i++)
		{
			// card background
			let row = i % 3;
			let col = Math.floor(i / 3);

			let sprite = this.add.image(cardMargin.x + row*cardSize.w, cardMargin.y + col*cardSize.h, 'hint_cards', cardIdx);
			sprite.displayWidth = cardSize.w;
			sprite.displayHeight = cardSize.h;
			sprite.setOrigin(0.0, 0.0);

			// add metadata (player number, seed, etcetera) in header
			let metadata = "(player " + (i+1) + "; " + Config.seed + ")";
			let txt = this.add.text(sprite.x + metadataMargin.x, sprite.y + metadataMargin.y, metadata, metadataTextConfig);

			// place the hint images
			let hints = Hints.perPlayer[i];
			let maxHintHeight = 128;
			let maxHintWidth = Math.floor((cardSize.w-cardMargin.x*2) / (hints.length));
			let hintMargin = 10;
			let hintImageSize = Math.min(maxHintWidth-hintMargin, maxHintHeight);
			let hintOffset = 0.5*cardSize.w - 0.5*((hints.length-1) * (hintImageSize+hintMargin))
			for(let h = 0; h < hints.length; h++)
			{
				let xPos = sprite.x + h*(hintImageSize+hintMargin) + hintOffset;
				let yPos = sprite.y + headerHeight;

				//ctx.drawImage(img, xPos, yPos, hintImageSize, hintImageSize);
				let id = hints[h].id + "_" + hints[h].numericID;
				let hintSprite = this.add.image(xPos, yPos, id);
				hintSprite.displayWidth = hintSprite.displayHeight = hintImageSize;
				hintSprite.setOrigin(0.5, 0.0);
			}

			// create the grid with all squares we can cross off
			let tiles = Map.tilesLeftPerPlayer[i];
			if(Config.invertHintGrid) { tiles = Map.invertLocationList(tiles); }

			let cs = Math.floor((cardSize.w - 2*cardMargin.x)/Config.width);
			let gridSize = new Point( cs*Config.width, cs*Config.height);
			let gridPos = new Point( sprite.x + cardMargin.x , sprite.y + cardSize.h - cardMargin.y - gridSize.y);
			

			for(let x = 1; x < Config.width; x++)
			{
				let line = new Phaser.Geom.Line(gridPos.x + x*cs, gridPos.y, gridPos.x + x * cs, gridPos.y + gridSize.y);
				gridGraphics.strokeLineShape(line);
			}

			for(let y = 1; y < Config.height; y++)
			{
				let line = new Phaser.Geom.Line(gridPos.x, gridPos.y + y * cs, gridPos.x + gridSize.x, gridPos.y + y * cs);
				gridGraphics.strokeLineShape(line);
			}

			// draw a rectangle for all locations that are still possible (because of yur hints)
			for(let t = 0; t < tiles.length; t++)
			{
				let tile = tiles[t];
				let rect = new Phaser.Geom.Rectangle(gridPos.x + tile.x*cs, gridPos.y + tile.y*cs, cs, cs);
				gridGraphics.fillRectShape(rect);

			}
		}

		this.children.bringToTop(gridGraphics);
	},

	// @TODO: maybe save oX, oY, cellSize on ourselves as well? (Instead of referencing config all the time)
	showTreasureRectangle()
	{
		let graphics = this.add.graphics();

		let fX = Config.oX + Map.treasureLocation.x*Config.cellSize;
		let fY = Config.oY + Map.treasureLocation.y*Config.cellSize;
		let rect = new Phaser.Geom.Rectangle(fX, fY, Config.cellSize, Config.cellSize);

		let lineThickness = 6
		graphics.lineStyle(lineThickness, 0xFF0000, 1.0);
		graphics.strokeRectShape(rect);
	},

	clearMap: function()
	{
		let allSprites = this.children.list.filter(x => x instanceof Phaser.GameObjects.Sprite);
		allSprites.forEach(x => x.destroy());

		let allImages = this.children.list.filter(x => x instanceof Phaser.GameObjects.Image);
		allImages.forEach(x => x.destroy());

		let allGraphics = this.children.list.filter(x => x instanceof Phaser.GameObjects.Graphics);
		allGraphics.forEach(x => x.destroy());

		let allText = this.children.list.filter(x => x instanceof Phaser.GameObjects.Text);
		allText.forEach(x => x.destroy());

		let allContainers = this.children.list.filter(x => x instanceof Phaser.GameObjects.Container);
		allContainers.forEach(x => x.destroy());
	},

});
