
import { rand, getSetting } from "lib/pq-games";
import { PLANET_MAP } from "../shared/dict"
import { initializeDictionaries } from "./configurator"
import { CONFIG } from "../shared/config"
import { MaterialVisualizer, ResourceGroup, Rectangle, Vector2, LayoutOperation, ResourceShape, TextConfig, ResourceText, Circle, Line } from "lib/pq-games"

interface Cell
{
	x:number,
	y:number,
	type?:string
}

export default class BoardGeneration
{
	grid: Cell[][]
	startingPositions: Cell[]
	obstacles: Cell[]
	cfg:Record<string,any>

	async draw(vis:MaterialVisualizer) : Promise<HTMLCanvasElement>
	{
		this.setupConfig(vis);
		initializeDictionaries(this.cfg);
		return await this.generateBoard(vis);
	}

	setupConfig(vis:MaterialVisualizer)
	{
		this.cfg =
		{
			...CONFIG.generation,
			lists: {},
			totalProbabilities: {},
			playerCount: getSetting("playerCount", CONFIG) ?? 3,
			planet: getSetting("planet", CONFIG),
			manualCombo: getSetting("manualCombo", CONFIG),
		}

		this.cfg.numPlayers = this.cfg.playerCount;
		this.cfg.cellWidth = (vis.size.x / this.cfg.gridWidth);
		this.cfg.cellHeight = (vis.size.y / this.cfg.gridHeight);
		this.cfg.minSizeCell = Math.min(this.cfg.cellWidth, this.cfg.cellHeight)*this.cfg.spriteScale;

		this.cfg.soloMode = (this.cfg.playerCount == 1);
		this.cfg.difficulty = PLANET_MAP[this.cfg.planet];
	}

	async generateBoard(vis:MaterialVisualizer) 
	{
		this.createGrid();
		this.determineStartingPositions();
		this.determineRandomObstacles();
		return await this.visualizeBoard(vis);
	}

	createGrid() 
	{
		this.grid = [];

		for(let i = 0; i < this.cfg.gridWidth; i++) 
		{
			this.grid[i] = [];
			for(let j = 0; j < this.cfg.gridHeight; j++) 
			{
				this.grid[i][j] = null;
			}
		}
	}	

	determineStartingPositions()
	{
		this.startingPositions = [];

		const cappedPlayerCount = Math.min(this.cfg.maxPlayerCount, this.cfg.playerCount);
		for(let i = 0; i < cappedPlayerCount; i++) 
		{
			let x: number, y: number 

			do {
				x = Math.floor(rand() * (this.cfg.gridWidth - 2)) + 1;
				y = Math.floor(rand() * (this.cfg.gridHeight - 2)) + 1;
			} while(this.grid[x][y] != null)

			let obj = { x: x, y: y }

			this.grid[x][y] = obj
			this.startingPositions.push(obj);
		}
	}

	determineRandomObstacles() 
	{
		this.obstacles = [];

		const numObstacles = this.cfg.numObstacles - this.startingPositions.length;
		for(let i = 0; i < numObstacles; i++) {
			let x: number, y: number 

			let randType = this.getRandom(this.cfg.lists.components);
			if(randType == 'effects') { randType = 'path' }

			do {
				x = Math.floor(rand() * this.cfg.gridWidth);
				y = Math.floor(rand() * this.cfg.gridHeight);
			} while(this.grid[x][y] != null || (randType == 'resource' && this.edgeCell(x,y)))

			let obj = { x: x, y: y, type: randType }

			this.grid[x][y] = obj
			this.obstacles.push(obj);
		}
	}

	getRandom(list) 
	{
		const randValue = rand();
		let totalProb = 0;
		for(const key of Object.keys(list))
		{
			totalProb += list[key].prob || 1;
		}
	
		let sum = 0;
		const fractionProb = (1.0 / totalProb);
		for(const key of Object.keys(list)) 
		{
			sum += list[key].prob * fractionProb;
			if(sum >= randValue) { return key; }
		}
	}

	edgeCell(x:number, y:number) 
	{
		return (x == 0 || y == 0 || x == (this.cfg.gridWidth - 1) || y == (this.cfg.gridHeight - 1));
	}

	// draw background rectangles (for nicer grid coloring)
	visualizeBackground(vis:MaterialVisualizer, group:ResourceGroup)
	{		
		const inkFriendly = vis.inkFriendly;
		for(let i = 0; i < this.cfg.gridWidth; i++) 
		{
			const x = i * this.cfg.cellWidth;

			for(let j = 0; j < this.cfg.gridHeight + 1; j++) 
			{
				const y = j * this.cfg.cellHeight;
				const colorIdx = (i + j) % 2;
				let color = vis.get("bgColors")[colorIdx];
				if(inkFriendly) { color = vis.get("bgColorsInkfriendly")[colorIdx]; }

				const rect = new Rectangle().fromTopLeft(new Vector2(x,y), new Vector2(this.cfg.cellWidth, this.cfg.cellHeight));
				const opRect = new LayoutOperation({
					fill: color
				})
				group.add(new ResourceShape(rect), opRect);
			}
		}

		const numFlowers = Math.floor(rand() * 16) + 15;
		for(let i = 0; i < numFlowers; i++)
		{
			const randX = rand()*vis.size.x;
			const randY = rand()*vis.size.y;
			const randSize = (rand()*0.5 + 0.5)*this.cfg.minSizeCell;
			const randRot = rand()*2*Math.PI;

			const res = vis.getResource("flower_icon");
			const op = new LayoutOperation({
				pos: new Vector2(randX, randY),
				size: new Vector2(randSize),
				rot: randRot,
				alpha: 0.05
			})
			group.add(res, op);
		}
	}

	// @IMPROV: draw random decorations (flowers, grass, etc.)
	// draw player starting positions (skipped anything green-like, as the board is already green on the background)
	visualizeStartingPositions(vis:MaterialVisualizer, group:ResourceGroup)
	{
		const inkFriendly = vis.inkFriendly;
		const res = vis.getResource("StartingPositionIcon");

		for(let i = 0; i < this.startingPositions.length; i++) 
		{
			const pos = this.startingPositions[i];
			const rect = new Rectangle().fromTopLeft(new Vector2(pos.x * this.cfg.cellWidth, pos.y * this.cfg.cellHeight), new Vector2(this.cfg.cellWidth, this.cfg.cellHeight));

			const color = vis.get("playerColors")[i];
			if(!inkFriendly)
			{
				const opRect = new LayoutOperation({ fill: color });
				group.add(new ResourceShape(rect), opRect);
			}

			const op = new LayoutOperation({
				pos: rect.center.clone(),
				size: new Vector2(this.cfg.minSizeCell),
				frame: i,
			})
			group.add(res, op);
		}
	}

	visualizeCellContents(vis:MaterialVisualizer, group:ResourceGroup)
	{
		const inkFriendly = vis.inkFriendly;
		const lineGroup = new ResourceGroup();

		const textConfig = new TextConfig({
			font: vis.get("fonts.heading"),
			size: vis.get("path.fontSize")
		}).alignCenter();

		// draw random obstacles, buildings, numbers, stuff
		for(const obj of this.obstacles) 
		{	
			const x = (obj.x + 0.5) * this.cfg.cellWidth;
			const y = (obj.y + 0.5) * this.cfg.cellHeight;
			const t = obj.type;

			if(t == "path") {
				const randNum = Math.floor(rand() * 15) + 1
				const resText = new ResourceText({ text: randNum.toString(), textConfig: textConfig });
				const opText = new LayoutOperation({
					pos: new Vector2(x,y),
					size: new Vector2(2*textConfig.size),
					fill: vis.get("path.fontColor"),
					stroke: inkFriendly ? vis.get("path.strokeColorGray") : vis.get("path.strokeColor"),
					strokeWidth: vis.get("path.strokeWidth")
				})
				group.add(resText, opText);

			} else if(t == "people") {
				const randPerson = this.getRandom(this.cfg.lists.people)
				const spriteSize = this.cfg.minSizeCell * vis.get("people.scale");
				const backgroundCircle = new Circle({ center: new Vector2(x,y), radius: 0.9*0.5*spriteSize });
				const opCircle = new LayoutOperation({
					fill: vis.get("people.color")
				});
				group.add(new ResourceShape(backgroundCircle), opCircle);

				const textureKey = this.capitalize(randPerson) + "Icon";
				const res = vis.getResource(textureKey);
				const op = new LayoutOperation({
					pos: new Vector2(x,y),
					size: new Vector2(spriteSize)
				})
				group.add(res, op);
			
			} else if(t == "buildings") {
				const terrainTypes = CONFIG.generation.terrainTypes;
				const randType = terrainTypes[Math.floor(rand() * terrainTypes.length)]

				if(!inkFriendly)
				{
					const color = vis.get("buildingColors")[randType];
					const pos = new Vector2(obj.x*this.cfg.cellWidth, obj.y*this.cfg.cellHeight);
					const bgRect = new Rectangle().fromTopLeft(pos, new Vector2(this.cfg.cellWidth, this.cfg.cellHeight));
					const opRect = new LayoutOperation({
						fill: color
					})
					group.add(new ResourceShape(bgRect), opRect);
				}

				const textureKey = this.capitalize(randType) + 'Icon';
				const res = vis.getResource(textureKey);
				const op = new LayoutOperation({
					pos: new Vector2(x,y),
					size: new Vector2(this.cfg.minSizeCell)
				})
				group.add(res, op);
			
			} else if(t == "resource") {
				const randResource = this.getRandom(this.cfg.lists.resources);
				const color = vis.get("resourceColors")[randResource];

				// random direction (horizontal or vertical)
				let startX = obj.x*this.cfg.cellWidth, startY = obj.y*this.cfg.cellHeight
				let newX = startX + this.cfg.cellWidth, newY = startY
				const makeVertical = rand() >= 0.5;
				if(makeVertical) 
				{
					newX = startX
					newY = startY + this.cfg.cellHeight
				}

				const lw = vis.get("resources.lineWidth");
				const line = new Line(new Vector2(startX, startY), new Vector2(newX, newY));
				const opLine = new LayoutOperation({
					stroke: color,
					strokeWidth: lw
				})
				lineGroup.add(new ResourceShape(line), opLine);

				const avgX = 0.5*(startX + newX);
				const avgY = 0.5*(startY + newY);
				const spriteSize = 0.95*lw;

				const textureKey = this.capitalize(randResource) + 'Icon';
				const res = vis.getResource(textureKey);
				const op = new LayoutOperation({
					pos: new Vector2(avgX, avgY),
					size: new Vector2(spriteSize)
				})
				group.add(res, op);
			}
		}
		group.add(lineGroup, new LayoutOperation({ pivot: Vector2.ZERO, depth: 100 }));
	}

	// draw the GRID lines (both vertical and horizontal)
	// Also add coordinates: LETTERS is HORIZONTAL, NUMBERS is VERTICAL
	visualizeGrid(vis:MaterialVisualizer, group:ResourceGroup)
	{
		const textConfig = new TextConfig({
			font: vis.get("fonts.heading"),
			size: vis.get("grid.fontSize")
		}).alignCenter();

		const inkFriendly = vis.inkFriendly;
		const color = inkFriendly ? vis.get("grid.lineColorGray") : vis.get("grid.lineColor");

		const opLine = new LayoutOperation({
			stroke: color,
			strokeWidth: vis.get("grid.lineWidth")
		})

		for(let i = 0; i <= this.cfg.gridWidth; i++) 
		{
			const x = i * this.cfg.cellWidth;

			const line = new Line(new Vector2(x,0), new Vector2(x, vis.size.y));
			group.add(new ResourceShape(line), opLine);

			const finalX = x + 0.5*this.cfg.cellWidth;
			const finalY = vis.get("grid.textMargin");

			const str = vis.get("horizontalMarks").at(i);
			const resText = new ResourceText({ text: str, textConfig: textConfig });
			const opText = new LayoutOperation({
				pos: new Vector2(finalX, finalY),
				size: new Vector2(2*textConfig.size),
				fill: vis.get("grid.fontColor")
			})
			group.add(resText, opText);

		}

		for(let i = 0; i <= this.cfg.gridHeight; i++) 
		{
			const y = i * this.cfg.cellHeight;

			const line = new Line(new Vector2(0,y), new Vector2(vis.size.x, y));
			group.add(new ResourceShape(line), opLine);

			const finalX = vis.get("grid.textMargin");
			const finalY = y + 0.5*this.cfg.cellHeight;

			const str = (i + 1).toString();
			const resText = new ResourceText({ text: str, textConfig: textConfig });
			const opText = new LayoutOperation({
				pos: new Vector2(finalX, finalY),
				size: new Vector2(2*textConfig.size),
				fill: vis.get("grid.fontColor")
			})
			group.add(resText, opText);
		}
	}

	visualizePlanets(vis:MaterialVisualizer, group:ResourceGroup)
	{
		const spriteSize = 0.33*this.cfg.minSizeCell;
		const margin = 0.33*spriteSize;
		let x = vis.size.x - 0.5*spriteSize - margin;
		let y = vis.size.y - 0.5*spriteSize - margin;

		const res = vis.getResource("starry_planets");

		for(const planet of this.cfg.planetSet)
		{
			const frame = PLANET_MAP[planet];
			const op = new LayoutOperation({
				pos: new Vector2(x,y),
				size: new Vector2(spriteSize),
				frame: frame
			})
			group.add(res, op);
			x -= spriteSize;
		}
	}

	async visualizeBoard(vis:MaterialVisualizer) 
	{
		const group = vis.prepareDraw();

		this.visualizeBackground(vis, group);
		this.visualizeStartingPositions(vis, group);
		this.visualizeCellContents(vis, group);
		this.visualizeGrid(vis, group);
		this.visualizePlanets(vis, group);
		return await vis.finishDraw(group);
	}

	capitalize(str:string)
	{
		return str.slice(0,1).toUpperCase() + str.slice(1);
	}
}