import LayoutOperation from "js/pq_games/layout/layoutOperation"
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup"
import ResourceShape from "js/pq_games/layout/resources/resourceShape"
import ResourceText from "js/pq_games/layout/resources/resourceText"
import TextConfig from "js/pq_games/layout/text/textConfig"
import BoardVisualizer from "js/pq_games/tools/generation/boardVisualizer"
import Circle from "js/pq_games/tools/geometry/circle"
import Line from "js/pq_games/tools/geometry/line"
import Point from "js/pq_games/tools/geometry/point"
import Rectangle from "js/pq_games/tools/geometry/rectangle"
import { PLANET_MAP } from "../shared/dict"
import configurator from "./configurator"

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

	async draw(vis:BoardVisualizer) 
	{
		this.setupConfig(vis);
		configurator.initializeDictionaries(this.cfg);
		return this.generateBoard(vis);
	}

	setupConfig(vis:BoardVisualizer)
	{
		const userConfig = vis.config;
		const minSize = vis.sizeUnit;

		this.cfg = 
		{
			minSize: minSize,
			gridWidth: 8,
			gridHeight: 8,
			playerCount: parseInt(userConfig.playerCount ?? 3),
			lists: {},
			totalProbabilities: {},
			spriteScale: 0.9,
			maxPlayerCount: 3,
			numObstacles: 6,
			bgRectColors: ["#AAFFAA", "#99DD99"],
			bgRectColorsGray: ["#FFFFFF", "#EEEEEE"],
			playerColors: ["#FF0000", "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF", "#000000", "#AA8800"],
			peopleColor: "#FA7921",
			peopleSpriteScale: 0.4,
			terrainTypes: ['rock', 'river', 'garden'],
			buildingColors: 
			{
				river: "#6EB4FF",
				rock: "#D8D8D8",
				garden: "#63FF7D"
			},
			resourceColors: 
			{
				water: "#2B60AD",
				oxygen: "#29C1B1",
				electricity: "#FFFF00"
			},
			resourceLineWidth: 0.025*minSize,
			horizontalMarks: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
			fontFamily: "subrayada",
			grid: 
			{
				fontSize: Math.round(0.025*minSize),
				fontColor: "#000000",
				lineWidth: 0.003*minSize,
				lineColor: 0x666666,
				lineColorGray: 0x999999,
				textMargin: { x: 0.0125*minSize, y: 0.0125*minSize }
			},
			path: 
			{
				fontSize: Math.round(0.1*minSize),
				fontColor: "#000000",
				strokeColor: "#AAFFAA",
				strokeColorGray: "#AAAAAA",
				strokeWidth: 0.005*minSize
			},

			cellWidth: 0,
			cellHeight: 0,
			minSizeCell: 0,
			soloMode: false,
			difficulty: 0,
		}

		this.cfg.cellWidth = (vis.size.x / this.cfg.gridWidth);
		this.cfg.cellHeight = (vis.size.y / this.cfg.gridHeight);
		this.cfg.minSizeCell = Math.min(this.cfg.cellWidth, this.cfg.cellHeight)*this.cfg.spriteScale;
		
		userConfig.playerCount = parseInt(userConfig.playerCount ?? 4);
		userConfig.numPlayers = userConfig.playerCount;
		Object.assign(this.cfg, userConfig);

		this.cfg.soloMode = (this.cfg.playerCount == 1);
		this.cfg.difficulty = PLANET_MAP[this.cfg.planet];
	}

	generateBoard(vis:BoardVisualizer) 
	{
		this.createGrid();
		this.determineStartingPositions();
		this.determineRandomObstacles();
		return this.visualizeBoard(vis);
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
				x = Math.floor(Math.random() * (this.cfg.gridWidth - 2)) + 1;
				y = Math.floor(Math.random() * (this.cfg.gridHeight - 2)) + 1;
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
				x = Math.floor(Math.random() * this.cfg.gridWidth);
				y = Math.floor(Math.random() * this.cfg.gridHeight);
			} while(this.grid[x][y] != null || (randType == 'resource' && this.edgeCell(x,y)))

			let obj = { x: x, y: y, type: randType }

			this.grid[x][y] = obj
			this.obstacles.push(obj);
		}
	}

	getRandom(list) 
	{
		const rand = Math.random();
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
			if(sum >= rand) { return key; }
		}
	}

	edgeCell(x:number, y:number) 
	{
		return (x == 0 || y == 0 || x == (this.cfg.gridWidth - 1) || y == (this.cfg.gridHeight - 1));
	}

	// draw background rectangles (for nicer grid coloring)
	visualizeBackground(vis:BoardVisualizer, group:ResourceGroup)
	{		
		const inkFriendly = this.cfg.inkFriendly;
		for(let i = 0; i < this.cfg.gridWidth; i++) 
		{
			const x = i * this.cfg.cellWidth;

			for(let j = 0; j < this.cfg.gridHeight + 1; j++) 
			{
				const y = j * this.cfg.cellHeight;
				const colorIdx = (i + j) % 2;
				let color = this.cfg.bgRectColors[colorIdx];
				if(inkFriendly) { color = this.cfg.bgRectColorsGray[colorIdx]; }

				const rect = new Rectangle().fromTopLeft(new Point(x,y), new Point(this.cfg.cellWidth, this.cfg.cellHeight));
				const opRect = new LayoutOperation({
					fill: color
				})
				group.add(new ResourceShape(rect), opRect);
			}
		}

		const numFlowers = Math.floor(Math.random() * 16) + 15;
		for(let i = 0; i < numFlowers; i++)
		{
			const randX = Math.random()*vis.size.x;
			const randY = Math.random()*vis.size.y;
			const randSize = (Math.random()*0.5 + 0.5)*this.cfg.minSizeCell;
			const randRot = Math.random()*2*Math.PI;

			const res = vis.getResource("flower_icon");
			const op = new LayoutOperation({
				pos: new Point(randX, randY),
				pivot: Point.CENTER,
				size: new Point(randSize),
				rot: randRot,
				alpha: 0.05
			})
			group.add(res, op);
		}
	}

	// @IMPROV: draw random decorations (flowers, grass, etc.)
	// draw player starting positions (skipped anything green-like, as the board is already green on the background)
	visualizeStartingPositions(vis:BoardVisualizer, group:ResourceGroup)
	{
		const inkFriendly = this.cfg.inkFriendly;
		const res = vis.getResource("StartingPositionIcon");

		for(let i = 0; i < this.startingPositions.length; i++) 
		{
			const pos = this.startingPositions[i];
			const rect = new Rectangle().fromTopLeft(new Point(pos.x * this.cfg.cellWidth, pos.y * this.cfg.cellHeight), new Point(this.cfg.cellWidth, this.cfg.cellHeight));

			const color = this.cfg.playerColors[i];
			if(!inkFriendly)
			{
				const opRect = new LayoutOperation({ fill: color });
				group.add(new ResourceShape(rect), opRect);
			}

			const op = new LayoutOperation({
				pos: rect.center.clone(),
				size: new Point(this.cfg.minSizeCell),
				pivot: Point.CENTER,
				frame: i,
			})
			group.add(res, op);
		}
	}

	visualizeCellContents(vis:BoardVisualizer, group:ResourceGroup)
	{
		const inkFriendly = this.cfg.inkFriendly;
		const lineGroup = new ResourceGroup();

		const textConfig = new TextConfig({
			font: this.cfg.fontFamily,
			size: this.cfg.path.fontSize
		}).alignCenter();

		// draw random obstacles, buildings, numbers, stuff
		for(const obj of this.obstacles) 
		{	
			const x = (obj.x + 0.5) * this.cfg.cellWidth;
			const y = (obj.y + 0.5) * this.cfg.cellHeight;
			const t = obj.type;

			if(t == "path") {
				const randNum = Math.floor(Math.random() * 15) + 1
				const resText = new ResourceText({ text: randNum.toString(), textConfig: textConfig });
				const opText = new LayoutOperation({
					pos: new Point(x,y),
					size: new Point(2*textConfig.size),
					fill: this.cfg.path.fontColor,
					stroke: inkFriendly ? this.cfg.path.strokeColorGray : this.cfg.path.strokeColor,
					strokeWidth: this.cfg.path.strokeWidth,
					pivot: Point.CENTER
				})
				group.add(resText, opText);

			} else if(t == "people") {
				const randPerson = this.getRandom(this.cfg.lists.people)
				const spriteSize = this.cfg.minSizeCell * this.cfg.peopleSpriteScale;
				const backgroundCircle = new Circle({ center: new Point(x,y), radius: 0.9*0.5*spriteSize });
				const opCircle = new LayoutOperation({
					fill: this.cfg.peopleColor
				});
				group.add(new ResourceShape(backgroundCircle), opCircle);

				const textureKey = this.capitalize(randPerson) + "Icon";
				const res = vis.getResource(textureKey);
				const op = new LayoutOperation({
					pos: new Point(x,y),
					pivot: Point.CENTER,
					size: new Point(spriteSize)
				})
				group.add(res, op);
			
			} else if(t == "buildings") {
				const terrainTypes = this.cfg.terrainTypes;
				const randType = terrainTypes[Math.floor(Math.random() * terrainTypes.length)]

				if(!inkFriendly)
				{
					const color = this.cfg.buildingColors[randType];
					const pos = new Point(obj.x*this.cfg.cellWidth, obj.y*this.cfg.cellHeight);
					const bgRect = new Rectangle().fromTopLeft(pos, new Point(this.cfg.cellWidth, this.cfg.cellHeight));
					const opRect = new LayoutOperation({
						fill: color
					})
					group.add(new ResourceShape(bgRect), opRect);
				}

				const textureKey = this.capitalize(randType) + 'Icon';
				const res = vis.getResource(textureKey);
				const op = new LayoutOperation({
					pos: new Point(x,y),
					size: new Point(this.cfg.minSizeCell),
					pivot: Point.CENTER
				})
				group.add(res, op);
			
			} else if(t == "resource") {
				const randResource = this.getRandom(this.cfg.lists.resources);
				const color = this.cfg.resourceColors[randResource];

				// random direction (horizontal or vertical)
				let startX = obj.x*this.cfg.cellWidth, startY = obj.y*this.cfg.cellHeight
				let newX = startX + this.cfg.cellWidth, newY = startY
				const makeVertical = Math.random() >= 0.5;
				if(makeVertical) 
				{
					newX = startX
					newY = startY + this.cfg.cellHeight
				}

				const lw = this.cfg.resourceLineWidth;
				const line = new Line(new Point(startX, startY), new Point(newX, newY));
				const opLine = new LayoutOperation({
					stroke: color,
					strokeWidth: lw
				})
				lineGroup.add(new ResourceShape(line), opLine);

				const avgX = 0.5*(startX + newX);
				const avgY = 0.5*(startY + newY);
				const spriteSize = 0.95*lw;

				const textureKey = this.capitalize(randResource) + 'Icon'; // @TODO: ugh now I need to CAPITALIZE this shit
				const res = vis.getResource(textureKey);
				const op = new LayoutOperation({
					pos: new Point(avgX, avgY),
					size: new Point(spriteSize),
					pivot: Point.CENTER
				})
				group.add(res, op);
			}
		}
		group.add(lineGroup, new LayoutOperation({ depth: 100 }));
	}

	// draw the GRID lines (both vertical and horizontal)
	// Also add coordinates: LETTERS is HORIZONTAL, NUMBERS is VERTICAL
	visualizeGrid(vis:BoardVisualizer, group:ResourceGroup)
	{
		const textConfig = new TextConfig({
			font: this.cfg.fontFamily,
			size: this.cfg.grid.fontSize
		}).alignCenter();

		const inkFriendly = this.cfg.inkFriendly;
		const color = inkFriendly ? this.cfg.grid.lineColorGray : this.cfg.grid.lineColor;

		const opLine = new LayoutOperation({
			stroke: color,
			strokeWidth: this.cfg.grid.lineWidth
		})

		for(let i = 0; i <= this.cfg.gridWidth; i++) 
		{
			const x = i * this.cfg.cellWidth;

			const line = new Line(new Point(x,0), new Point(x, vis.size.y));
			group.add(new ResourceShape(line), opLine);

			const finalX = x + 0.5*this.cfg.cellWidth;
			const finalY = this.cfg.grid.textMargin.y;

			const str = this.cfg.horizontalMarks.at(i);
			const resText = new ResourceText({ text: str, textConfig: textConfig });
			const opText = new LayoutOperation({
				pos: new Point(finalX, finalY),
				size: new Point(2*textConfig.size),
				fill: this.cfg.grid.fontColor,
				pivot: Point.CENTER
			})
			group.add(resText, opText);

		}

		for(let i = 0; i <= this.cfg.gridHeight; i++) 
		{
			const y = i * this.cfg.cellHeight;

			const line = new Line(new Point(0,y), new Point(vis.size.x, y));
			group.add(new ResourceShape(line), opLine);

			const finalX = this.cfg.grid.textMargin.x;
			const finalY = y + 0.5*this.cfg.cellHeight;

			const str = (i + 1).toString();
			const resText = new ResourceText({ text: str, textConfig: textConfig });
			const opText = new LayoutOperation({
				pos: new Point(finalX, finalY),
				size: new Point(2*textConfig.size),
				fill: this.cfg.grid.fontColor,
				pivot: Point.CENTER
			})
			group.add(resText, opText);
		}
	}

	visualizePlanets(vis:BoardVisualizer, group:ResourceGroup)
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
				pos: new Point(x,y),
				size: new Point(spriteSize),
				pivot: Point.CENTER,
				frame: frame
			})
			group.add(res, op);
			x -= spriteSize;
		}
	}

	visualizeBoard(vis:BoardVisualizer) 
	{
		const group = new ResourceGroup();

		this.visualizeBackground(vis, group);
		this.visualizeStartingPositions(vis, group);
		this.visualizeCellContents(vis, group);
		this.visualizeGrid(vis, group);
		this.visualizePlanets(vis, group);
		return [group];
	}

	capitalize(str:string)
	{
		return str.slice(0,1).toUpperCase() + str.slice(1);
	}
}