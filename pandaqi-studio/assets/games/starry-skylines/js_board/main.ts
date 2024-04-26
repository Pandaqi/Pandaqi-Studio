import { PLANET_MAP } from "../js_shared/dict"
import configurator from "./configurator"
import OnPageVisualizer from "js/pq_games/website/onPageVisualizer"
// @ts-ignore
import { Scene } from "js/pq_games/phaser/phaser.esm"
import ResourceLoader from "js/pq_games/layout/resources/resourceLoader"
import setDefaultPhaserSettings from "js/pq_games/phaser/setDefaultPhaserSettings"
import resourceLoaderToPhaser from "js/pq_games/phaser/resourceLoaderToPhaser"
import Point from "js/pq_games/tools/geometry/point"
import imageToPhaser from "js/pq_games/phaser/imageToPhaser"
import LayoutOperation from "js/pq_games/layout/layoutOperation"
import Rectangle from "js/pq_games/tools/geometry/rectangle"
import TextConfig from "js/pq_games/layout/text/textConfig"
import ResourceText from "js/pq_games/layout/resources/resourceText"
import textToPhaser from "js/pq_games/phaser/textToPhaser"
import { circleToPhaser, lineToPhaser, rectToPhaser } from "js/pq_games/phaser/shapeToPhaser"
import Circle from "js/pq_games/tools/geometry/circle"
import Line from "js/pq_games/tools/geometry/line"

interface Cell
{
	x:number,
	y:number,
	type?:string
}

const sceneKey = "boardGeneration"
const assetsBase = "/starry-skylines/assets/";
const assets = 
{
	// the nine major planets for this game
	starry_planets:
	{
		path: "starry_planets.webp",
		frames: new Point(9,1),
	},

	// icon for starting position
	StartingPositionIcon:
	{
		path: "StartingPositionIcon.png",
		frames: new Point(3,1),
	},

	// all people icons (+ animal)
	PeopleIcon:
	{
		path: "PeopleIcon.png"
	},

	CriminalIcon:
	{
		path: "CriminalIcon.png"
	},

	EducatedIcon:
	{
		path: "EducatedIcon.png"
	},

	SickIcon:
	{
		path: "SickIcon.png"
	},

	AnimalIcon:
	{
		path: "AnimalIcon.png"
	},

	// all resource lines
	OxygenIcon:
	{
		path: "OxygenIcon.png"
	},

	WaterIcon:
	{
		path: "WaterIcon.png"
	},

	ElectricityIcon:
	{
		path: "ElectricityIcon.png"
	},

	// all terrain types
	RockIcon:
	{
		path: "RockIcon.png"
	},

	RiverIcon:
	{
		path: "RiverIcon.png"
	},

	GardenIcon:
	{
		path: "GardenIcon.png"
	},

	flower_icon:
	{
		path: "flower_icon.webp"
	},

}

const resLoader = new ResourceLoader({ base: assetsBase });
resLoader.planLoadMultiple(assets);

class BoardGeneration extends Scene
{
	canvas: HTMLCanvasElement
	grid: Cell[][]
	startingPositions: Cell[]
	obstacles: Cell[]
	cfg:Record<string,any>

	constructor()
	{
		super({ key: sceneKey });
	}

	preload() 
	{
		setDefaultPhaserSettings(this); 
	}

	async create(userConfig = {}) 
	{
		await resLoader.loadPlannedResources();
        await resourceLoaderToPhaser(resLoader, this);

		this.setupConfig(userConfig);
		configurator.initializeDictionaries(this.cfg);
		this.generateBoard();
		OnPageVisualizer.convertCanvasToImage(this);
	}

	setupConfig(userConfig:Record<string,any>)
	{
		const minSize = Math.min(this.canvas.width, this.canvas.height);

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

		this.cfg.cellWidth = (this.canvas.width / this.cfg.gridWidth);
		this.cfg.cellHeight = (this.canvas.height / this.cfg.gridHeight);
		this.cfg.minSizeCell = Math.min(this.cfg.cellWidth, this.cfg.cellHeight)*this.cfg.spriteScale;
		
		userConfig.playerCount = parseInt(userConfig.playerCount ?? 4);
		userConfig.numPlayers = userConfig.playerCount;
		Object.assign(this.cfg, userConfig);

		this.cfg.soloMode = (this.cfg.playerCount == 1);
		this.cfg.difficulty = PLANET_MAP[this.cfg.planet];
	}

	generateBoard() 
	{
		this.createGrid();
		this.determineStartingPositions();
		this.determineRandomObstacles();
		this.visualizeBoard();
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
	visualizeBackground(graphics:any)
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
				rectToPhaser(rect, opRect, graphics);
			}
		}

		const numFlowers = Math.floor(Math.random() * 16) + 15;
		for(let i = 0; i < numFlowers; i++)
		{
			const randX = Math.random()*this.canvas.width;
			const randY = Math.random()*this.canvas.height;
			const randSize = (Math.random()*0.5 + 0.5)*this.cfg.minSizeCell;
			const randRot = Math.random()*2*Math.PI;

			const res = resLoader.getResource("flower_icon");
			const op = new LayoutOperation({
				translate: new Point(randX, randY),
				pivot: Point.CENTER,
				dims: new Point(randSize),
				rotation: randRot,
				alpha: 0.05
			})
			imageToPhaser(res, op, this);
		}
	}

	// @IMPROV: draw random decorations (flowers, grass, etc.)
	// draw player starting positions (skipped anything green-like, as the board is already green on the background)
	visualizeStartingPositions(graphics: any)
	{
		const inkFriendly = this.cfg.inkFriendly;
		const res = resLoader.getResource("StartingPositionIcon");

		for(let i = 0; i < this.startingPositions.length; i++) 
		{
			const pos = this.startingPositions[i];
			const rect = new Rectangle().fromTopLeft(new Point(pos.x * this.cfg.cellWidth, pos.y * this.cfg.cellHeight), new Point(this.cfg.cellWidth, this.cfg.cellHeight));

			const color = this.cfg.playerColors[i];
			if(!inkFriendly)
			{
				const opRect = new LayoutOperation({ fill: color });
				rectToPhaser(rect, opRect, graphics);
			}

			const op = new LayoutOperation({
				translate: rect.center.clone(),
				dims: new Point(this.cfg.minSizeCell),
				pivot: Point.CENTER,
				frame: i,
			})

			imageToPhaser(res, op, this);
		}
	}

	visualizeCellContents(graphics: any)
	{
		// @ts-ignore
		const resourceLineGraphics = this.add.graphics();
		const inkFriendly = this.cfg.inkFriendly;

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
					translate: new Point(x,y),
					dims: new Point(2*textConfig.size),
					fill: this.cfg.path.fontColor,
					stroke: inkFriendly ? this.cfg.path.strokeColorGray : this.cfg.path.strokeColor,
					strokeWidth: this.cfg.path.strokeWidth,
					pivot: Point.CENTER
				})
				textToPhaser(resText, opText, this);

			} else if(t == "people") {
				const randPerson = this.getRandom(this.cfg.lists.people)
				const spriteSize = this.cfg.minSizeCell * this.cfg.peopleSpriteScale;
				const backgroundCircle = new Circle({ center: new Point(x,y), radius: 0.9*0.5*spriteSize });
				const opCircle = new LayoutOperation({
					fill: this.cfg.peopleColor
				});
				circleToPhaser(backgroundCircle, opCircle, graphics);

				const textureKey = this.capitalize(randPerson) + "Icon";
				const res = resLoader.getResource(textureKey);
				const op = new LayoutOperation({
					translate: new Point(x,y),
					pivot: Point.CENTER,
					dims: new Point(spriteSize)
				})
				imageToPhaser(res, op, this);
			
			} else if(t == "buildings") {
				const terrainTypes = this.cfg.terrainTypes;
				const randType = terrainTypes[Math.floor(Math.random() * terrainTypes.length)]

				const textureKey = this.capitalize(randType) + 'Icon';
				const res = resLoader.getResource(textureKey);
				const op = new LayoutOperation({
					translate: new Point(x,y),
					dims: new Point(this.cfg.minSizeCell),
					pivot: Point.CENTER
				})
				imageToPhaser(res, op, this);

				if(!inkFriendly)
				{
					const color = this.cfg.buildingColors[randType];
					const pos = new Point(obj.x*this.cfg.cellWidth, obj.y*this.cfg.cellHeight);
					const bgRect = new Rectangle().fromTopLeft(pos, new Point(this.cfg.cellWidth, this.cfg.cellHeight));
					const opRect = new LayoutOperation({
						fill: color
					})
					rectToPhaser(bgRect, opRect, graphics);
				}
			
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
				lineToPhaser(line, opLine, resourceLineGraphics);

				const avgX = 0.5*(startX + newX);
				const avgY = 0.5*(startY + newY);
				const spriteSize = 0.95*lw;

				const textureKey = this.capitalize(randResource) + 'Icon'; // @TODO: ugh now I need to CAPITALIZE this shit
				const res = resLoader.getResource(textureKey);
				const op = new LayoutOperation({
					translate: new Point(avgX, avgY),
					dims: new Point(spriteSize),
					pivot: Point.CENTER
				})
				imageToPhaser(res, op, this);
			}
		}
	}

	// draw the GRID lines (both vertical and horizontal)
	// Also add coordinates: LETTERS is HORIZONTAL, NUMBERS is VERTICAL
	visualizeGrid(graphics: any)
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

			const line = new Line(new Point(x,0), new Point(x, this.canvas.height));
			lineToPhaser(line, opLine, graphics);

			const finalX = x + 0.5*this.cfg.cellWidth;
			const finalY = this.cfg.grid.textMargin.y;

			const str = this.cfg.horizontalMarks.at(i);
			const resText = new ResourceText({ text: str, textConfig: textConfig });
			const opText = new LayoutOperation({
				translate: new Point(finalX, finalY),
				dims: new Point(2*textConfig.size),
				fill: this.cfg.grid.fontColor,
				pivot: Point.CENTER
			})
			textToPhaser(resText, opText, this);

		}

		for(let i = 0; i <= this.cfg.gridHeight; i++) 
		{
			const y = i * this.cfg.cellHeight;

			const line = new Line(new Point(0,y), new Point(this.canvas.width, y));
			lineToPhaser(line, opLine, graphics);

			const finalX = this.cfg.grid.textMargin.x;
			const finalY = y + 0.5*this.cfg.cellHeight;

			const str = (i + 1).toString();
			const resText = new ResourceText({ text: str, textConfig: textConfig });
			const opText = new LayoutOperation({
				translate: new Point(finalX, finalY),
				dims: new Point(2*textConfig.size),
				fill: this.cfg.grid.fontColor,
				pivot: Point.CENTER
			})
			textToPhaser(resText, opText, this);
		}
	}

	visualizePlanets()
	{
		const spriteSize = 0.33*this.cfg.minSizeCell;
		const margin = 0.33*spriteSize;
		let x = this.canvas.width - 0.5*spriteSize - margin;
		let y = this.canvas.height - 0.5*spriteSize - margin;

		const res = resLoader.getResource("starry_planets");

		for(const planet of this.cfg.planetSet)
		{
			const frame = PLANET_MAP[planet];
			const op = new LayoutOperation({
				translate: new Point(x,y),
				dims: new Point(spriteSize),
				pivot: Point.CENTER,
				frame: frame
			})
			imageToPhaser(res, op, this);

			x -= spriteSize;
		}
	}

	visualizeBoard() 
	{
		// @ts-ignore
		const graphics = this.add.graphics();
		
		this.visualizeBackground(graphics);
		this.visualizeStartingPositions(graphics);
		this.visualizeCellContents(graphics);
		this.visualizeGrid(graphics);
		this.visualizePlanets();
	}

	capitalize(str:string)
	{
		return str.slice(0,1).toUpperCase() + str.slice(1);
	}
}

OnPageVisualizer.linkTo({ scene: BoardGeneration, key: sceneKey, backend: "phaser" });
