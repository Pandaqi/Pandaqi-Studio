
import { MaterialVisualizer, ResourceGroup, LayoutOperation, Color, Vector2, Line, ResourceShape, TextConfig, StrokeAlign, ResourceText, Rectangle, convertCanvasToImage } from "lib/pq-games"
import { CONFIG } from "../shared/config"
import { SYMBOLS, TILE_DICT } from "./dict"
import { createPremadeGame } from "./extractor"
import HintVisualizer from "./hintVisualizer"
import Hints from "./hints"
import Interface from "./interface"
import Map from "./map"

export default class BoardGeneration
{
	visualizer:MaterialVisualizer

    async start(vis:MaterialVisualizer) 
	{
		this.visualizer = vis;
		document.getElementById('debugging').innerHTML = '';

		await vis.resLoader.loadPlannedResources();

		const div = document.createElement("div");
		div.id = "game-canvases-container";
		const container = document.getElementsByTagName("main")[0];
		container.insertBefore(div, container.firstChild);

		// @TODO: used to be vis.config, but that's not a thing anymore!
    	CONFIG.initialize(this, vis.configurator.itemsCalculated);

    	const timeout = 20;
    	let interval;
    	const mainGenerationAction = () =>
    	{
    		CONFIG.numGens += 1;

    		Map.initialize();
    		Hints.initialize();

    		const hasSolution = Hints.solution;
			if(!hasSolution) { return; }

			clearInterval(interval);
			this.onGenerationFinished(vis);
    	}

    	interval = setInterval(mainGenerationAction.bind(this), timeout);
	}

	// we pass a flat list to the HINT visualizer; it saves the final image on the hint object itself
	async onGenerationFinished(vis:MaterialVisualizer)
	{    	
		// prepare all hints as cached images
		await HintVisualizer.visualizeAll(Hints.getAsList(), this.visualizer);

		// create the main map (always needed)
		const groupMap = this.visualize(vis);
		const imgMapAsCanvas = await this.visualizer.finishDraw(groupMap);
		const imgMap = await convertCanvasToImage(imgMapAsCanvas);
		Map.cachedImages["fullMap"] = imgMap;
		
		const images = [imgMap];

		// if premade game, generate hint cards too
		if(CONFIG._settings.createPremadeGame.value) {
			const groupHintCards = this.visualizeHintCards(vis);
			const imgHintsAsCanvas = await this.visualizer.finishDraw(groupHintCards);
			const imgHints = await convertCanvasToImage(imgHintsAsCanvas);
			images.push(imgHints);

			createPremadeGame(images);
		
		// if hybrid game, generate treasure/solution overlay + add our results to page
		} else {
			const groupSolution = this.visualizeTreasure();
			const imgSolutionAsCanvas = await this.visualizer.finishDraw(groupSolution);
			const imgSolution = await convertCanvasToImage(imgSolutionAsCanvas);
			images.push(imgSolution);
			Map.cachedImages["solutionMap"] = imgSolution;
		}
		
		// initialize the interface
		Interface.initialize();	
	}

	/*
		VISUALIZATION
	 */
	visualize(vis:MaterialVisualizer) : ResourceGroup
	{
		const group = new ResourceGroup();

		const oX = CONFIG.oX;
		const oY = CONFIG.oY;
		const cs = CONFIG.cellSize;
		const inkFriendly = vis.inkFriendly;

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
			const pos = new Vector2(fX, fY);

			// show tile type
			const type = cell.type;
			const frame = TILE_DICT[type].frame;

			const spriteRotation = cell.rot * 0.5 * Math.PI;
			const opTileType = new LayoutOperation({
				pos: pos,
				size: new Vector2(cs),
				pivot: Vector2.CENTER,
				frame: frame,
				rot: spriteRotation
			});
			group.add(resTileType, opTileType);

			// show network connections
			if(CONFIG._settings.hints.networks.value)
			{
				for(const nb of cell.connNbs)
				{
					let nbX = oX + nb.x*cs + 0.5*cs;
					let nbY = oY + nb.y*cs + 0.5*cs;

					const line = new Line(new Vector2(fX, fY), new Vector2(nbX, nbY));
					networkGroup.add(new ResourceShape(line), opLine);
				}
			}
			
			// show symbols
			if(CONFIG._settings.hints.symbols.value)
			{
				for(let s = 0; s < cell.symbols.length; s++)
				{
					let symbol = cell.symbols[s];
					if(symbol == null) { continue; }

					const symbolFrame = SYMBOLS[symbol].frame;
					const finalRotation = spriteRotation + (s+1)*0.5*Math.PI;

					const op = new LayoutOperation({
						pos: pos,
						size: new Vector2(cs),
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
				const gridSize = new Vector2( Map.width*gridCellSize, Map.height*gridCellSize);
				const gridOffset = new Vector2( -0.5*gridSize.x, -0.5*gridSize.y);

				for(let x = 1; x < Map.width; x++)
				{
					const line = new Line(new Vector2(gridOffset.x + x*gridCellSize, gridOffset.y), new Vector2(gridOffset.x + x*gridCellSize, gridOffset.y + gridSize.y));
					specialTileGroup.add(new ResourceShape(line), opLineSpecial);
				}

				for(let y = 1; y < Map.height; y++)
				{
					const line = new Line(new Vector2(gridOffset.x, gridOffset.y + y*gridCellSize), new Vector2(gridOffset.x + gridSize.x, gridOffset.y + y*gridCellSize));
					specialTileGroup.add(new ResourceShape(line), opLineSpecial);
				}

				for(const tile of Map.markedMapTiles)
				{
					const pos = new Vector2( 
						gridOffset.x + (tile.x+0.5)*gridCellSize, 
						gridOffset.y + (tile.y+0.5)*gridCellSize
					);

					const res = this.visualizer.getResource(hintBaseKey);
					const op = new LayoutOperation({
						pos: pos,
						size: new Vector2(0.66 * gridCellSize),
						pivot: Vector2.CENTER,
						frame: 10
					})
					specialTileGroup.add(res, op);
				}

			}
		}

		// display the HOOK that indicates top left!
		const resHook = this.visualizer.getResource(hintBaseKey);
		const opHook = new LayoutOperation({
			pos: new Vector2(oX + 0.1*cs, oY),
			size: new Vector2(0.25*cs),
			pivot: Vector2.CENTER,
			frame: 11
		});
		group.add(resHook, opHook);

		// display the SEED
		const textConfig = new TextConfig({
			font: CONFIG.fontFamily,
			size: 11
		})

		const opText = new LayoutOperation({
			pos: new Vector2(oX + 0.5*cs, oY + 0.05*cs),
			size: new Vector2(5*textConfig.size),
			fill: "#111111",
			stroke: "#FFFFFF",
			strokeWidth: 3,
			strokeAlign: StrokeAlign.OUTSIDE,
			pivot: new Vector2(0.5, 0),
			// depth: 10000 => not supported by my own system yet
		});

		const resText = new ResourceText({ text: CONFIG.seed, textConfig: textConfig });
		group.add(resText, opText);

		// display the hints (only when debugging of course)
		if(CONFIG.debugging && CONFIG.debugHintText) 
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
					opTextDebug.pos = new Vector2(oX + margin, oY + margin + counter*lineHeight);
					opTextDebug.pivot = Vector2.ZERO;
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

		let fX = CONFIG.oX + Map.treasureLocation.x*CONFIG.cellSize;
		let fY = CONFIG.oY + Map.treasureLocation.y*CONFIG.cellSize;

		const rect = new Rectangle().fromTopLeft(new Vector2(fX, fY), new Vector2(CONFIG.cellSize));
		const op = new LayoutOperation({
			stroke: "#FF0000",
			strokeWidth: 6
		})
		group.add(new ResourceShape(rect), op);
		return group;
	}

	visualizeHintCards(vis:MaterialVisualizer) : ResourceGroup
	{
		const group = new ResourceGroup();

		let cardMargin = new Vector2( 20, 20);
		let metadataMargin = new Vector2( 150, 20)
		let headerHeight = 70;
		let scale = 0.735 // @IMPROV: calculate dynamically based on PDF size
		let cardSize = new Vector2(495*scale, 525*scale);

		let cardIdx = 0;
		if(vis.inkFriendly) { cardIdx = 1; }

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
			font: CONFIG.fontFamily,
			size: 11
		})

		for(let i = 0; i < CONFIG.playerCount; i++)
		{
			// card background
			const row = i % 3;
			const col = Math.floor(i / 3);

			const basePos = new Vector2(cardMargin.x + row*cardSize.x, cardMargin.y + col*cardSize.y);
			const opHintCard = new LayoutOperation({
				pos: basePos,
				size: cardSize,
				frame: cardIdx
			})
			group.add(resHintCard, opHintCard);

			// add metadata (player number, seed, etcetera) in header
			const metadata = "(player " + (i+1) + "; " + CONFIG.seed + ")";

			const resTextMetadata = new ResourceText({ text: metadata, textConfig: textConfig });
			const opTextMetadata = new LayoutOperation({
				pos: new Vector2(basePos.x + metadataMargin.x, basePos.y + metadataMargin.y),
				size: new Vector2(100*textConfig.size, 2*textConfig.size),
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

				const id = CONFIG.getImageIDFromHint(hints[h]);
				const resTemp = this.visualizer.getResource(id);
				const opTemp = new LayoutOperation({
					pos: new Vector2(xPos, yPos),
					size: new Vector2(hintImageSize),
					pivot: new Vector2(0.5, 0)
				});
				group.add(resTemp, opTemp);
			}

			// create the grid with all squares we can cross off
			let tiles = Map.tilesLeftPerPlayer[i];
			if(CONFIG.invertHintGrid) { tiles = Map.invertLocationList(tiles); }

			const cs = Math.floor((cardSize.x - 2*cardMargin.x)/CONFIG.width);
			const gridSize = new Vector2( cs*CONFIG.width, cs*CONFIG.height);
			const gridPos = new Vector2(basePos.x + cardMargin.x, basePos.y + cardSize.y - cardMargin.y - gridSize.y);
			
			for(let x = 1; x < CONFIG.width; x++)
			{
				const line = new Line(new Vector2(gridPos.x + x*cs, gridPos.y), new Vector2(gridPos.x + x*cs, gridPos.y + gridSize.y));
				group.add(new ResourceShape(line), opGridStroke);
			}

			for(let y = 1; y < CONFIG.height; y++)
			{
				const line = new Line(new Vector2(gridPos.x, gridPos.y + y*cs), new Vector2(gridPos.x + gridSize.x, gridPos.y + y*cs));
				group.add(new ResourceShape(line), opGridStroke);
			}

			// draw a rectangle for all locations that are still possible (because of yur hints)
			for(const tile of tiles)
			{
				const rect = new Rectangle().fromTopLeft(new Vector2(gridPos.x + tile.x*cs, gridPos.y + tile.y*cs), new Vector2(cs));
				group.add(new ResourceShape(rect), opGridFill);
			}
		}

		return group;
	}
}
