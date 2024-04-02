import Config from "./config"
import Extractor from "./extractor"
import HintVisualizer from "./hintVisualizer"
import Hints from "./hints"
import Interface from "./interface"
import Map from "./map"
import { TILE_DICT, SYMBOLS } from "./dictionary"
// @ts-ignore
import { Scene, GameObjects } from "js/pq_games/phaser/phaser.esm"
import Point from "js/pq_games/tools/geometry/point"
import ResourceLoader from "js/pq_games/layout/resources/resourceLoader"
import setDefaultPhaserSettings from "js/pq_games/phaser/setDefaultPhaserSettings"
import resourceLoaderToPhaser from "js/pq_games/phaser/resourceLoaderToPhaser"
import Rectangle from "js/pq_games/tools/geometry/rectangle"
import { lineToPhaser, rectToPhaser } from "js/pq_games/phaser/shapeToPhaser"
import LayoutOperation from "js/pq_games/layout/layoutOperation"
import Line from "js/pq_games/tools/geometry/line"
import imageToPhaser from "js/pq_games/phaser/imageToPhaser"
import TextConfig from "js/pq_games/layout/text/textConfig"
import ResourceText from "js/pq_games/layout/resources/resourceText"
import textToPhaser from "js/pq_games/phaser/textToPhaser"
import ResourceImage from "js/pq_games/layout/resources/resourceImage"
import Color from "js/pq_games/layout/color/color"

const assetsBase = "/pirate-drawingbeard/assets/"
const assets =
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
}


const resLoader = new ResourceLoader({ base: assetsBase });
resLoader.planLoadMultiple(assets);

export default class Generation extends Scene
{
	canvas: HTMLCanvasElement
	textures: any

    constructor()
	{
		super({ key: "generation" });
	}

    preload() 
	{
		setDefaultPhaserSettings(this);
		document.getElementById('debugging').innerHTML = '';
	}

    async create(config:Record<string,any>) 
	{
		await resLoader.loadPlannedResources();
        await resourceLoaderToPhaser(resLoader, this);

    	Config.initialize(this, config);
    	HintVisualizer.prepare();

    	const timeout = 20;
    	let interval;
    	const mainGenerationAction = () =>
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
	}

	// we pass a flat list to the HINT visualizer; it saves the final image on the hint object itself
	onGenerationFinished()
	{    	
		this.visualize();
		HintVisualizer.visualizeAll(Hints.getAsList(), this.onHintVisualizationFinished.bind(this)); 
	}

	getImageIDFromHint(hint)
	{
		return hint.id + "_" + hint.numericID;
	}

	// if debugging, just stop here and keep the phaser game alive
	// otherwise, cache the images (and destroy phaser afterwards)
	onHintVisualizationFinished()
	{
		for(let i = 0; i < Hints.perPlayer.length; i++)
		{
			const hints = Hints.perPlayer[i];
			for(const hint of hints)
			{
				const img = hint.image;
				const id = this.getImageIDFromHint(hint);
				this.textures.addBase64(id, img.src);

				// @NOTE: this force-adds the image to the resourceLoader too, which is a roundabout way to have the whole system be as decoupled from Phaser as possible
				const resImg = new ResourceImage(img);
				resImg.setUniqueKey(id);
				resLoader.addResource(id, resImg);
			}
		}

		if(Config.useInterface) 
		{
			Extractor.cacheImages(this.onImageCachingFinished.bind(this));
			return;
		}

		this.finishCreation();
	}

	// if we want a PDF, create it now
	onImageCachingFinished()
	{
		if(Config.createPremadeGame) 
		{
			Extractor.createPremadeGame(this.onPremadeCreationFinished.bind(this));
			return;
		}

		this.finishCreation();
	}

	onPremadeCreationFinished()
	{
		this.finishCreation();
	}

	// this is only called when we're completely, totally, definitely done with creation
	// which means we fire up the interface
	finishCreation()
	{
		Interface.initialize();
	}

	/*
		VISUALIZATION
	 */
	visualize()
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

		// @ts-ignore
		const networkGraphics = this.add.graphics();
		// @ts-ignore
		const specialTileGraphics = this.add.graphics();

		const opLine = new LayoutOperation({
			stroke: "#000000",
			strokeWidth: 10
		});

		const opLineSpecial = new LayoutOperation({
			stroke: new Color(0,0,0,0.5),
			strokeWidth: 1,
		});

		const resTileType = resLoader.getResource(textureKey);
		const resSymbol = resLoader.getResource(symbolTextureKey);

		for(let i = 0; i < Map.mapList.length; i++)
		{
			const cell = Map.mapList[i];
			const fX = oX + cell.x*cs + 0.5*cs;
			const fY = oY + cell.y*cs + 0.5*cs;
			const pos = new Point(fX, fY);

			// show tile type
			const type = cell.type;
			const frame = TILE_DICT[type].frame;

			const spriteRotation = cell.rotation * 0.5 * Math.PI;
			const opTileType = new LayoutOperation({
				translate: pos,
				dims: new Point(cs),
				pivot: Point.CENTER,
				frame: frame,
				rotation: spriteRotation
			});
			imageToPhaser(resTileType, opTileType, this);

			// show network connections
			if(Config.expansions.networks)
			{
				for(const nb of cell.connNbs)
				{
					let nbX = oX + nb.x*cs + 0.5*cs;
					let nbY = oY + nb.y*cs + 0.5*cs;

					const line = new Line(new Point(fX, fY), new Point(nbX, nbY));
					lineToPhaser(line, opLine, networkGraphics);
				}
			}
			
			// show symbols
			if(Config.expansions.symbols)
			{
				for(let s = 0; s < cell.symbols.length; s++)
				{
					let symbol = cell.symbols[s];
					if(symbol == null) { continue; }

					const symbolFrame = SYMBOLS[symbol].frame;
					const finalRotation = spriteRotation + (s+1)*0.5*Math.PI;

					const op = new LayoutOperation({
						translate: pos,
						dims: new Point(cs),
						frame: symbolFrame,
						rotation: finalRotation
					})
					imageToPhaser(resSymbol, op, this);
				}
			}

			// the Map tile is very special and gets a whole grid on top of it
			if(type == "map")
			{
				// this anchors the remaining graphics to the top left of this tile
				specialTileGraphics.x = pos.x;
				specialTileGraphics.y = pos.y;
				specialTileGraphics.rotation = spriteRotation + 0.5*Math.PI; // map is rotated sideways, made more sense for tile and arrow

				const maxGridWidth = 0.66*cs;
				const gridCellSize = Math.floor(maxGridWidth/Map.width);
				const gridSize = new Point( Map.width*gridCellSize, Map.height*gridCellSize);
				const gridOffset = new Point( -0.5*gridSize.x, -0.5*gridSize.y);

				for(let x = 1; x < Map.width; x++)
				{
					const line = new Line(new Point(gridOffset.x + x*gridCellSize, gridOffset.y), new Point(gridOffset.x + x*gridCellSize, gridOffset.y + gridSize.y));
					lineToPhaser(line, opLineSpecial, specialTileGraphics);
				}

				for(let y = 1; y < Map.height; y++)
				{
					const line = new Line(new Point(gridOffset.x, gridOffset.y + y*gridCellSize), new Point(gridOffset.x + gridSize.x, gridOffset.y + y*gridCellSize));
					lineToPhaser(line, opLineSpecial, specialTileGraphics);
				}

				// @ts-ignore
				let markGroup = this.add.container();
				for(const tile of Map.markedMapTiles)
				{
					const pos = new Point( 
						gridOffset.x + (tile.x+0.5)*gridCellSize, 
						gridOffset.y + (tile.y+0.5)*gridCellSize
					);

					const res = resLoader.getResource(hintBaseKey);
					const op = new LayoutOperation({
						translate: pos,
						dims: new Point(0.66 * gridCellSize),
						pivot: Point.CENTER,
						frame: 10
					})
					const markSprite = imageToPhaser(res, op, this);
					markGroup.add(markSprite);
				}

				markGroup.x = pos.x;
				markGroup.y = pos.y;
				markGroup.rotation = spriteRotation + 0.5*Math.PI;

			}
		}

		// @ts-ignore
		this.children.bringToTop(specialTileGraphics);
		//this.children.bringToTop(networkGraphics); => actually works better when behind!

		// display the HOOK that indicates top left!
		const resHook = resLoader.getResource(hintBaseKey);
		const opHook = new LayoutOperation({
			translate: new Point(oX + 0.1*cs, oY),
			dims: new Point(0.25*cs),
			pivot: Point.CENTER,
			frame: 11
		});
		imageToPhaser(resHook, opHook, this);

		// display the SEED
		const textConfig = new TextConfig({
			font: "Chelsea Market",
			size: 11
		})

		const opText = new LayoutOperation({
			translate: new Point(oX + 0.5*cs, oY + 0.05*cs),
			fill: "#111111",
			stroke: "#FFFFFF",
			strokeWidth: 3,
			pivot: new Point(0.5, 0),
			// depth: 10000 => not supported by my own system yet
		});

		const resText = new ResourceText({ text: Config.seed, textConfig: textConfig });
		textToPhaser(resText, opText, this);

		// display the hints (only when debugging of course)
		if(Config.debugging && Config.debugHintText) 
		{
			const margin = 12;
			const lineHeight = 24;
			let counter = 0;
			for(let i = 0; i < Hints.perPlayer.length; i++)
			{
				let playerString = "P" + (i+1) + ": ";

				for(let j = 0; j < Hints.perPlayer[i].length; j++)
				{
					const opTextDebug = opText.clone();
					opTextDebug.translate = new Point(oX + margin, oY + margin + counter*lineHeight);
					opTextDebug.pivot = new Point();
					const str = playerString + Hints.perPlayer[i][j].text;

					const resTextDebug = new ResourceText({ text: str, textConfig: textConfig });
					textToPhaser(resTextDebug, opTextDebug, this);

					counter++;
				}
				
			}
		}

		// highlight the location (only when debugging)
		if(Config.debugging && Config.debugTreasureLocation)
		{
			this.showTreasureRectangle();
		}

	}

	// NOTE: we simply overlap the rectangle with the map that's already there; makes it simpler for the interface to display the solution
	visualizeTreasure()
	{
		this.showTreasureRectangle();
	}

	visualizeHintCards()
	{
		this.clearMap();

		let cardMargin = new Point( 20, 20);
		let metadataMargin = new Point( 150, 20)
		let headerHeight = 70;
		let scale = 0.735 // @IMPROV: calculate dynamically based on PDF size
		let cardSize = new Point(495*scale, 525*scale);

		let cardIdx = 0;
		if(Config.inkFriendly) { cardIdx = 1; }

		// @ts-ignore
		let gridGraphics = this.add.graphics();
		const alpha = 0.4;
		const opGridStroke = new LayoutOperation({
			stroke: new Color(0,0,0,alpha),
			strokeWidth: 2,
		});

		const opGridFill = new LayoutOperation({
			fill: new Color(0,0,0,0.33*alpha),
		});

		const resHintCard = resLoader.getResource("hint_cards");

		const textConfig = new TextConfig({
			font: "Chelsea Market",
			size: 11
		})

		for(let i = 0; i < Config.playerCount; i++)
		{
			// card background
			const row = i % 3;
			const col = Math.floor(i / 3);

			const basePos = new Point(cardMargin.x + row*cardSize.x, cardMargin.y + col*cardSize.y);
			const opHintCard = new LayoutOperation({
				translate: basePos,
				dims: cardSize,
				frame: cardIdx
			})
			imageToPhaser(resHintCard, opHintCard, this);

			// add metadata (player number, seed, etcetera) in header
			const metadata = "(player " + (i+1) + "; " + Config.seed + ")";

			const resTextMetadata = new ResourceText({ text: metadata, textConfig: textConfig });
			const opTextMetadata = new LayoutOperation({
				translate: new Point(basePos.x + metadataMargin.x, basePos.y + metadataMargin.y),
				dims: new Point(100*textConfig.size, 2*textConfig.size),
				fill: "#111111",
			});
			textToPhaser(resTextMetadata, opTextMetadata, this);

			// place the hint images
			const hints = Hints.perPlayer[i];
			const maxHintHeight = 128;
			const maxHintWidth = Math.floor((cardSize.x - cardMargin.x*2) / (hints.length));
			const hintMargin = 10;
			const hintImageSize = Math.min(maxHintWidth-hintMargin, maxHintHeight);
			const hintOffset = 0.5*cardSize.x - 0.5*((hints.length-1) * (hintImageSize+hintMargin))
			for(let h = 0; h < hints.length; h++)
			{
				const xPos = basePos.x + h*(hintImageSize+hintMargin) + hintOffset;
				const yPos = basePos.y + headerHeight;

				const id = this.getImageIDFromHint(hints[h]);
				const resTemp = resLoader.getResource(id);
				const opTemp = new LayoutOperation({
					translate: new Point(xPos, yPos),
					dims: new Point(hintImageSize),
					pivot: new Point(0.5, 0)
				});
				imageToPhaser(resTemp, opTemp, this);
			}

			// create the grid with all squares we can cross off
			let tiles = Map.tilesLeftPerPlayer[i];
			if(Config.invertHintGrid) { tiles = Map.invertLocationList(tiles); }

			const cs = Math.floor((cardSize.x - 2*cardMargin.x)/Config.width);
			const gridSize = new Point( cs*Config.width, cs*Config.height);
			const gridPos = new Point(basePos.x + cardMargin.x, basePos.y + cardSize.y - cardMargin.y - gridSize.y);
			
			for(let x = 1; x < Config.width; x++)
			{
				const line = new Line(new Point(gridPos.x + x*cs, gridPos.y), new Point(gridPos.x + x*cs, gridPos.y + gridSize.y));
				lineToPhaser(line, opGridStroke, gridGraphics);
			}

			for(let y = 1; y < Config.height; y++)
			{
				const line = new Line(new Point(gridPos.x, gridPos.y + y*cs), new Point(gridPos.x + gridSize.x, gridPos.y + y*cs));
				lineToPhaser(line, opGridStroke, gridGraphics);
			}

			// draw a rectangle for all locations that are still possible (because of yur hints)
			for(const tile of tiles)
			{
				const rect = new Rectangle().fromTopLeft(new Point(gridPos.x + tile.x*cs, gridPos.y + tile.y*cs), new Point(cs));
				rectToPhaser(rect, opGridFill, gridGraphics);
			}
		}

		// @ts-ignore
		this.children.bringToTop(gridGraphics);
	}

	showTreasureRectangle()
	{
		// @ts-ignore
		let graphics = this.add.graphics();

		let fX = Config.oX + Map.treasureLocation.x*Config.cellSize;
		let fY = Config.oY + Map.treasureLocation.y*Config.cellSize;

		const rect = new Rectangle().fromTopLeft(new Point(fX, fY), new Point(Config.cellSize));
		const op = new LayoutOperation({
			stroke: "#FF0000",
			strokeWidth: 6
		})
		rectToPhaser(rect, op, graphics);
	}

	clearMap()
	{
		// @ts-ignore
		let allSprites = this.children.list.filter(x => x instanceof GameObjects.Sprite);
		allSprites.forEach(x => x.destroy());

		// @ts-ignore
		let allImages = this.children.list.filter(x => x instanceof GameObjects.Image);
		allImages.forEach(x => x.destroy());

		// @ts-ignore
		let allGraphics = this.children.list.filter(x => x instanceof GameObjects.Graphics);
		allGraphics.forEach(x => x.destroy());

		// @ts-ignore
		let allText = this.children.list.filter(x => x instanceof GameObjects.Text);
		allText.forEach(x => x.destroy());

		// @ts-ignore
		let allContainers = this.children.list.filter(x => x instanceof GameObjects.Container);
		allContainers.forEach(x => x.destroy());
	}

}
