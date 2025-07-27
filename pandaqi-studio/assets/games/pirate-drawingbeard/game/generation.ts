import Color from "js/pq_games/layout/color/color"
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
import Config from "./config"
import { SYMBOLS, TILE_DICT } from "./dictionary"
import { createPremadeGame } from "./extractor"
import HintVisualizer from "./hintVisualizer"
import Hints from "./hints"
import Interface from "./interface"
import Map from "./map"

export default class BoardGeneration
{
	visualizer:BoardVisualizer

    async start(vis:BoardVisualizer) 
	{
		this.visualizer = vis;
		document.getElementById('debugging').innerHTML = '';

		await vis.resLoader.loadPlannedResources();

		const div = document.createElement("div");
		div.id = "game-canvases-container";
		const container = document.getElementsByTagName("main")[0];
		container.insertBefore(div, container.firstChild);

    	Config.initialize(this, vis.config);

    	const timeout = 20;
    	let interval;
    	const mainGenerationAction = () =>
    	{
    		Config.numGens += 1;

    		Map.initialize();
    		Hints.initialize();

    		const hasSolution = Hints.solution;
			if(!hasSolution) { return; }

			clearInterval(interval);
			this.onGenerationFinished();
    	}

    	interval = setInterval(mainGenerationAction.bind(this), timeout);
	}

	// we pass a flat list to the HINT visualizer; it saves the final image on the hint object itself
	async onGenerationFinished()
	{    	
		// prepare all hints as cached images
		await HintVisualizer.visualizeAll(Hints.getAsList(), this.visualizer);

		// create the main map (always needed)
		const groupMap = this.visualize();
		const imgMap = await this.visualizer.finishDraw(groupMap);
		Map.cachedImages["fullMap"] = imgMap[0];
		
		const images = [imgMap];

		// if premade game, generate hint cards too
		if(Config.createPremadeGame) {
			const groupHintCards = this.visualizeHintCards();
			const imgHints = await this.visualizer.finishDraw(groupHintCards);
			images.push(imgHints);

			createPremadeGame(images.flat());
		
		// if hybrid game, generate treasure/solution overlay + add our results to page
		} else {
			const groupSolution = this.visualizeTreasure();
			const imgSolution = await this.visualizer.finishDraw(groupSolution);
			images.push(imgSolution);
			Map.cachedImages["solutionMap"] = imgSolution[0];
		}
		
		// initialize the interface => @TODO: come earlier?
		Interface.initialize();	
	}

	/*
		VISUALIZATION
	 */
	visualize() : ResourceGroup
	{
		const group = new ResourceGroup();

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

		const networkGroup = new ResourceGroup();
		group.add(networkGroup);

		const opLine = new LayoutOperation({
			stroke: "#000000",
			strokeWidth: 10
		});

		const opLineSpecial = new LayoutOperation({
			stroke: new Color(0,0,0,0.5),
			strokeWidth: 1,
		});

		const resTileType = this.visualizer.getResource(textureKey);
		const resSymbol = this.visualizer.getResource(symbolTextureKey);

		for(let i = 0; i < Map.mapList.length; i++)
		{
			const cell = Map.mapList[i];
			const fX = oX + cell.x*cs + 0.5*cs;
			const fY = oY + cell.y*cs + 0.5*cs;
			const pos = new Point(fX, fY);

			// show tile type
			const type = cell.type;
			const frame = TILE_DICT[type].frame;

			const spriteRotation = cell.rot * 0.5 * Math.PI;
			const opTileType = new LayoutOperation({
				pos: pos,
				size: new Point(cs),
				pivot: Point.CENTER,
				frame: frame,
				rot: spriteRotation
			});
			group.add(resTileType, opTileType);

			// show network connections
			if(Config.expansions.networks)
			{
				for(const nb of cell.connNbs)
				{
					let nbX = oX + nb.x*cs + 0.5*cs;
					let nbY = oY + nb.y*cs + 0.5*cs;

					const line = new Line(new Point(fX, fY), new Point(nbX, nbY));
					networkGroup.add(new ResourceShape(line), opLine);
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
						pos: pos,
						size: new Point(cs),
						frame: symbolFrame,
						rot: finalRotation
					})
					group.add(resSymbol, op);
				}
			}

			// the Map tile is very special and gets a whole grid on top of it
			if(type == "map")
			{
				// this anchors the remaining graphics to the top left of this tile
				// map is rotated sideways, made more sense for tile and arrow
				const specialTileGroup = new ResourceGroup();
				const opSubGroup = new LayoutOperation({ pos: pos, rot: spriteRotation + 0.5 * Math.PI, depth: 1000 });
				group.add(specialTileGroup, opSubGroup);

				const maxGridWidth = 0.66*cs;
				const gridCellSize = Math.floor(maxGridWidth/Map.width);
				const gridSize = new Point( Map.width*gridCellSize, Map.height*gridCellSize);
				const gridOffset = new Point( -0.5*gridSize.x, -0.5*gridSize.y);

				for(let x = 1; x < Map.width; x++)
				{
					const line = new Line(new Point(gridOffset.x + x*gridCellSize, gridOffset.y), new Point(gridOffset.x + x*gridCellSize, gridOffset.y + gridSize.y));
					specialTileGroup.add(new ResourceShape(line), opLineSpecial);
				}

				for(let y = 1; y < Map.height; y++)
				{
					const line = new Line(new Point(gridOffset.x, gridOffset.y + y*gridCellSize), new Point(gridOffset.x + gridSize.x, gridOffset.y + y*gridCellSize));
					specialTileGroup.add(new ResourceShape(line), opLineSpecial);
				}

				for(const tile of Map.markedMapTiles)
				{
					const pos = new Point( 
						gridOffset.x + (tile.x+0.5)*gridCellSize, 
						gridOffset.y + (tile.y+0.5)*gridCellSize
					);

					const res = this.visualizer.getResource(hintBaseKey);
					const op = new LayoutOperation({
						pos: pos,
						size: new Point(0.66 * gridCellSize),
						pivot: Point.CENTER,
						frame: 10
					})
					specialTileGroup.add(res, op);
				}

			}
		}

		// display the HOOK that indicates top left!
		const resHook = this.visualizer.getResource(hintBaseKey);
		const opHook = new LayoutOperation({
			pos: new Point(oX + 0.1*cs, oY),
			size: new Point(0.25*cs),
			pivot: Point.CENTER,
			frame: 11
		});
		group.add(resHook, opHook);

		// display the SEED
		const textConfig = new TextConfig({
			font: Config.fontFamily,
			size: 11
		})

		const opText = new LayoutOperation({
			pos: new Point(oX + 0.5*cs, oY + 0.05*cs),
			size: new Point(5*textConfig.size),
			fill: "#111111",
			stroke: "#FFFFFF",
			strokeWidth: 3,
			strokeAlign: StrokeAlign.OUTSIDE,
			pivot: new Point(0.5, 0),
			// depth: 10000 => not supported by my own system yet
		});

		const resText = new ResourceText({ text: Config.seed, textConfig: textConfig });
		group.add(resText, opText);

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
					opTextDebug.pos = new Point(oX + margin, oY + margin + counter*lineHeight);
					opTextDebug.pivot = new Point();
					const str = playerString + Hints.perPlayer[i][j].text;

					const resTextDebug = new ResourceText({ text: str, textConfig: textConfig });
					group.add(resTextDebug, opTextDebug);
					counter++;
				}
				
			}
		}

		return group;
	}

	// NOTE: we simply overlap the rectangle with the map that's already there; makes it simpler for the interface to display the solution
	visualizeTreasure() : ResourceGroup
	{
		const group = new ResourceGroup();

		let fX = Config.oX + Map.treasureLocation.x*Config.cellSize;
		let fY = Config.oY + Map.treasureLocation.y*Config.cellSize;

		const rect = new Rectangle().fromTopLeft(new Point(fX, fY), new Point(Config.cellSize));
		const op = new LayoutOperation({
			stroke: "#FF0000",
			strokeWidth: 6
		})
		group.add(new ResourceShape(rect), op);
		return group;
	}

	visualizeHintCards() : ResourceGroup
	{
		const group = new ResourceGroup();

		let cardMargin = new Point( 20, 20);
		let metadataMargin = new Point( 150, 20)
		let headerHeight = 70;
		let scale = 0.735 // @IMPROV: calculate dynamically based on PDF size
		let cardSize = new Point(495*scale, 525*scale);

		let cardIdx = 0;
		if(Config.inkFriendly) { cardIdx = 1; }

		const alpha = 0.4;
		const opGridStroke = new LayoutOperation({
			stroke: new Color(0,0,0),
			strokeWidth: 2,
			alpha: alpha,
		});

		const opGridFill = new LayoutOperation({
			fill: new Color(0,0,0),
			alpha: 0.5*alpha,
		});

		const resHintCard = this.visualizer.getResource("hint_cards");

		const textConfig = new TextConfig({
			font: Config.fontFamily,
			size: 11
		})

		for(let i = 0; i < Config.playerCount; i++)
		{
			// card background
			const row = i % 3;
			const col = Math.floor(i / 3);

			const basePos = new Point(cardMargin.x + row*cardSize.x, cardMargin.y + col*cardSize.y);
			const opHintCard = new LayoutOperation({
				pos: basePos,
				size: cardSize,
				frame: cardIdx
			})
			group.add(resHintCard, opHintCard);

			// add metadata (player number, seed, etcetera) in header
			const metadata = "(player " + (i+1) + "; " + Config.seed + ")";

			const resTextMetadata = new ResourceText({ text: metadata, textConfig: textConfig });
			const opTextMetadata = new LayoutOperation({
				pos: new Point(basePos.x + metadataMargin.x, basePos.y + metadataMargin.y),
				size: new Point(100*textConfig.size, 2*textConfig.size),
				fill: "#111111",
			});
			group.add(resTextMetadata, opTextMetadata);

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

				const id = Config.getImageIDFromHint(hints[h]);
				const resTemp = this.visualizer.getResource(id);
				const opTemp = new LayoutOperation({
					pos: new Point(xPos, yPos),
					size: new Point(hintImageSize),
					pivot: new Point(0.5, 0)
				});
				group.add(resTemp, opTemp);
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
				group.add(new ResourceShape(line), opGridStroke);
			}

			for(let y = 1; y < Config.height; y++)
			{
				const line = new Line(new Point(gridPos.x, gridPos.y + y*cs), new Point(gridPos.x + gridSize.x, gridPos.y + y*cs));
				group.add(new ResourceShape(line), opGridStroke);
			}

			// draw a rectangle for all locations that are still possible (because of yur hints)
			for(const tile of tiles)
			{
				const rect = new Rectangle().fromTopLeft(new Point(gridPos.x + tile.x*cs, gridPos.y + tile.y*cs), new Point(cs));
				group.add(new ResourceShape(rect), opGridFill);
			}
		}

		return group;
	}
}
