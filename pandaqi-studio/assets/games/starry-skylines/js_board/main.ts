// @ts-nocheck
import { PLANET_MAP } from "../js_shared/dict"
import configurator from "./configurator"
import PandaqiPhaser from "js/pq_games/website/phaser"
import { Scene, Geom } from "js/pq_games/phaser.esm"

const sceneKey = "boardGeneration"
class BoardGeneration extends Scene
{
	canvas: HTMLCanvasElement
	grid: any[]
	startingPositions: any[]
	obstacles: any[]
	cfg:Record<string,any>

	constructor()
	{
		super({ key: sceneKey });
	}

	preload() {
		this.load.crossOrigin = 'Anonymous';
		this.canvas = this.sys.game.canvas;

		const base = 'assets/';

		this.load.spritesheet("planets", base + "starry_planets.webp", { frameWidth: 236, frameHeight: 236 });

		// all people icons ( + animal)
		this.load.image('peopleIcon', base + 'PeopleIcon.png');
		this.load.image('criminalIcon', base + 'CriminalIcon.png');
		this.load.image('educatedIcon', base + 'EducatedIcon.png');
		this.load.image('sickIcon', base + 'SickIcon.png');

		this.load.image('animalIcon', base + 'AnimalIcon.png');

		// all resource lines
		this.load.image('oxygenIcon', base + 'OxygenIcon.png');
		this.load.image('waterIcon', base + 'WaterIcon.png');
		this.load.image('electricityIcon', base + 'ElectricityIcon.png');

		// all terrain types
		this.load.image('rockIcon', base + 'RockIcon.png');
		this.load.image('riverIcon', base + 'RiverIcon.png');
		this.load.image('gardenIcon', base + 'GardenIcon.png?cc=1');
		
		this.load.image("flower_icon", base + "flower_icon.webp")

		// icon for starting position
		this.load.spritesheet('startingPositionIcon', base + 'StartingPositionIcon.png?cc=1', { frameWidth: 500, frameHeight: 500 });
	}

	create(userConfig = {}) 
	{
		this.setupConfig(userConfig);
		configurator.initializeDictionaries(this.cfg);
		this.generateBoard();
		PandaqiPhaser.convertCanvasToImage(this);
	}

	setupConfig(userConfig:Record<string,any>)
	{
		const minSize = Math.min(this.canvas.width, this.canvas.height);

		this.cfg = {
			minSize: minSize,
			gridWidth: 8,
			gridHeight: 8,
			playerCount: parseInt(userConfig.playerCount ?? 3),
			lists: {},
			totalProbabilities: {},
			spriteScale: 0.9,
			maxPlayerCount: 3,
			numObstacles: 6,
			bgRectColors: [0xAAFFAA, 0x99DD99],
			bgRectColorsGray: [0xFFFFFF, 0xEEEEEE],
			playerColors: [0xFF0000, 0x0000FF, 0xFFFF00, 0xFF00FF, 0x00FFFF, 0x000000, 0xAA8800],
			peopleColor: 0xFA7921,
			peopleSpriteScale: 0.4,
			terrainTypes: ['rock', 'river', 'garden'],
			buildingColors: {
				river: 0x6EB4FF,
				rock: 0xD8D8D8,
				garden: 0x63FF7D
			},
			resourceColors: {
				water: 0x2B60AD,
				oxygen: 0x29C1B1,
				electricity: 0xFFFF00
			},
			resourceLineWidth: 0.025*minSize,
			horizontalMarks: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
			fontFamily: 'Montserrat Subrayada',
			grid: {
				fontSize: Math.round(0.025*minSize) + "px",
				fontColor: "#000000",
				lineWidth: 0.003*minSize,
				lineColor: 0x666666,
				lineColorGray: 0x999999,
				textMargin: { x: 0.0125*minSize, y: 0.0125*minSize }
			},
			path: {
				fontSize: Math.round(0.1*minSize) + "px",
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

		for(var i = 0; i < this.cfg.gridWidth; i++) {
			this.grid[i] = [];
			for(var j = 0; j < this.cfg.gridHeight; j++) {
				this.grid[i][j] = null;
			}
		}
	}	

	determineStartingPositions()
	{
		this.startingPositions = [];

		const cappedPlayerCount = Math.min(this.cfg.maxPlayerCount, this.cfg.playerCount);
		for(var i = 0; i < cappedPlayerCount; i++) {
			let x: number, y: number 

			do {
				x = Math.floor(Math.random() * (this.cfg.gridWidth - 2)) + 1;
				y = Math.floor(Math.random() * (this.cfg.gridHeight - 2)) + 1;
			} while(this.grid[x][y] != null)

			var obj = { x: x, y: y}

			this.grid[x][y] = obj
			this.startingPositions.push(obj);
		}
	}

	determineRandomObstacles() 
	{
		this.obstacles = [];

		const numObstacles = this.cfg.numObstacles - this.startingPositions.length;
		for(var i = 0; i < numObstacles; i++) {
			var x: number, y: number 

			var randType = this.getRandom(this.cfg.lists.components);
			if(randType == 'effects') { randType = 'path' }

			do {
				x = Math.floor(Math.random() * this.cfg.gridWidth);
				y = Math.floor(Math.random() * this.cfg.gridHeight);
			} while(this.grid[x][y] != null || (randType == 'resource' && this.edgeCell(x,y)))

			var obj = { 'x': x, 'y': y, 'type': randType }

			this.grid[x][y] = obj
			this.obstacles.push(obj);
		}
	}

	getRandom(list: { [x: string]: { prob: number } }) 
	{
		const rand = Math.random();
		let totalProb = 0;
		for(const key of Object.keys(list))
		{
			totalProb += list[key].prob || 1;
		}
	
		let sum = 0;
		const fractionProb = (1.0 / totalProb);
		for(const key of Object.keys(list)) {
			sum += list[key].prob * fractionProb;
			if(sum >= rand) { return key; }
		}
	}

	edgeCell(x: number,y: number) 
	{
		return (x == 0 || y == 0 || x == (this.cfg.gridWidth - 1) || y == (this.cfg.gridHeight - 1));
	}

	// draw background rectangles (for nicer grid coloring)
	visualizeBackground(graphics:any)
	{		
		const inkFriendly = this.cfg.inkFriendly;
		for(var i = 0; i < this.cfg.gridWidth; i++) {
			const x = i * this.cfg.cellWidth;

			for(var j = 0; j < this.cfg.gridHeight + 1; j++) {
				const y = j * this.cfg.cellHeight;
				const colorIdx = (i + j) % 2;
				let color = this.cfg.bgRectColors[colorIdx];
				if(inkFriendly) { color = this.cfg.bgRectColorsGray[colorIdx]; }

				graphics.fillStyle(color, 1.0);
				const rect = new Geom.Rectangle(x, y, this.cfg.cellWidth, this.cfg.cellHeight);
				graphics.fillRectShape(rect);
			}
		}

		const numFlowers = Math.floor(Math.random() * 16) + 15;
		for(let i = 0; i < numFlowers; i++)
		{
			const randX = Math.random()*this.canvas.width;
			const randY = Math.random()*this.canvas.height;
			const randSize = (Math.random()*0.5 + 0.5)*this.cfg.minSizeCell;
			const randRot = Math.random()*2*Math.PI;

			var sprite = this.add.sprite(randX, randY, 'flower_icon');
			sprite.setOrigin(0.5, 0.5);
			sprite.setRotation(randRot);
			sprite.setAlpha(0.05);
			sprite.displayWidth = sprite.displayHeight = randSize;
		}
	}

	// @IMPROV: draw random decorations (flowers, grass, etc.)
	// draw player starting positions (skipped anything green-like, as the board is already green on the background)
	visualizeStartingPositions(graphics: any)
	{
		const inkFriendly = this.cfg.inkFriendly;
		for(let i = 0; i < this.startingPositions.length; i++) {
			const pos = this.startingPositions[i];
			const rect = new Geom.Rectangle(pos.x * this.cfg.cellWidth, pos.y * this.cfg.cellHeight, this.cfg.cellWidth, this.cfg.cellHeight);

			const color = this.cfg.playerColors[i];
			if(!inkFriendly)
			{
				graphics.fillStyle(color, 1.0);
				graphics.fillRectShape(rect);
			}

			var sprite = this.add.sprite(rect.x + 0.5*this.cfg.cellWidth, rect.y + 0.5*this.cfg.cellHeight, 'startingPositionIcon');

			sprite.setOrigin(0.5, 0.5);
			sprite.setFrame(i);
			sprite.displayWidth = sprite.displayHeight = this.cfg.minSizeCell;
			sprite.tint = color;
		}
	}

	visualizeCellContents(graphics: any)
	{
		const inkFriendly = this.cfg.inkFriendly;
		const resourceLineGraphics = this.add.graphics();
		const textCfg = {
			fontFamily: this.cfg.fontFamily,
			fontSize: this.cfg.path.fontSize,
			color: this.cfg.path.fontColor,
			stroke: inkFriendly ? this.cfg.path.strokeColorGray : this.cfg.path.strokeColor,
			strokeThickness: this.cfg.path.strokeWidth,
		}

		// draw random obstacles, buildings, numbers, stuff
		for(const obj of this.obstacles) {	
			const x = (obj.x + 0.5) * this.cfg.cellWidth;
			const y = (obj.y + 0.5) * this.cfg.cellHeight;
			const t = obj.type;

			if(t == "path") {
				const randNum = Math.floor(Math.random() * 15) + 1
				const txt = this.add.text(x, y, randNum.toString(), textCfg);
				txt.setOrigin(0.5, 0.5);
			} else if(t == "people") {
				const randPerson = this.getRandom(this.cfg.lists.people)
				const spriteSize = this.cfg.minSizeCell * this.cfg.peopleSpriteScale;
				const backgroundCircle = new Geom.Circle(x, y, 0.9*0.5*spriteSize)

				graphics.fillStyle(this.cfg.peopleColor, 1.0);
				graphics.fillCircleShape(backgroundCircle);

				const textureKey = randPerson + 'Icon';
				const sprite = this.add.sprite(x, y, textureKey);
				sprite.setOrigin(0.5, 0.5);
				sprite.displayWidth = sprite.displayHeight = spriteSize;
			} else if(t == "buildings") {
				const terrainTypes = this.cfg.terrainTypes;
				const randType = terrainTypes[Math.floor(Math.random() * terrainTypes.length)]

				const backgroundRectangle = new Geom.Rectangle(obj.x*this.cfg.cellWidth, obj.y*this.cfg.cellHeight, this.cfg.cellWidth, this.cfg.cellHeight);

				const textureKey = randType + 'Icon';
				const sprite = this.add.sprite(x, y, textureKey);
				sprite.setOrigin(0.5, 0.5);
				sprite.displayWidth = sprite.displayHeight = this.cfg.minSizeCell;

				if(!inkFriendly)
				{
					const color = this.cfg.buildingColors[randType];
					graphics.fillStyle(color, 1.0);
					graphics.fillRectShape(backgroundRectangle)
				}
			} else if(t == "resource") {
				const randResource = this.getRandom(this.cfg.lists.resources);
				const color = this.cfg.resourceColors[randResource];

				// random direction (horizontal or vertical)
				var startX = obj.x*this.cfg.cellWidth, startY = obj.y*this.cfg.cellHeight
				var newX = startX + this.cfg.cellWidth, newY = startY
				const makeVertical = Math.random() >= 0.5;
				if(makeVertical) {
					newX = startX
					newY = startY + this.cfg.cellHeight
				}

				const line = new Geom.Line(startX, startY, newX, newY);
				const lw = this.cfg.resourceLineWidth;
				resourceLineGraphics.lineStyle(lw, color, 1.0);
				resourceLineGraphics.strokeLineShape(line);

				const avgX = 0.5*(startX + newX);
				const avgY = 0.5*(startY + newY);
				const spriteSize = 0.95*lw;

				const textureKey = randResource + 'Icon';
				const sprite = this.add.sprite(avgX, avgY, textureKey);
				sprite.setOrigin(0.5, 0.5);
				sprite.displayWidth = sprite.displayHeight = spriteSize;
			}
		}
	}

	// draw the GRID lines (both vertical and horizontal)
	// Also add coordinates: LETTERS is HORIZONTAL, NUMBERS is VERTICAL
	visualizeGrid(graphics: any)
	{
		const gridTextCfg = {
			fontFamily: this.cfg.fontFamily,
			fontSize: this.cfg.grid.fontSize,
			color: this.cfg.grid.fontColor,
		}

		const inkFriendly = this.cfg.inkFriendly;
		const color = inkFriendly ? this.cfg.grid.lineColorGray : this.cfg.grid.lineColor;

		graphics.lineStyle(this.cfg.grid.lineWidth, color, 1.0);

		for(var i = 0; i <= this.cfg.gridWidth; i++) {
			var x = i * this.cfg.cellWidth;

			var line = new Geom.Line(x, 0, x, this.canvas.height);
			graphics.strokeLineShape(line);

			const finalX = x + 0.5*this.cfg.cellWidth;
			const finalY = this.cfg.grid.textMargin.y;

			var txt = this.add.text(finalX, finalY, this.cfg.horizontalMarks.at(i), gridTextCfg);
			txt.setOrigin(0.5, 0.5);
		}

		for(var i = 0; i <= this.cfg.gridHeight; i++) {
			var y = i * this.cfg.cellHeight;

			var line = new Geom.Line(0, y, this.canvas.width, y);
			graphics.strokeLineShape(line);

			const finalX = this.cfg.grid.textMargin.x;
			const finalY = y + 0.5*this.cfg.cellHeight;

			var txt = this.add.text(finalX, finalY, (i + 1).toString(), gridTextCfg);
			txt.setOrigin(0.5, 0.5);
		}
	}

	visualizePlanets()
	{
		const spriteSize = 0.33*this.cfg.minSizeCell;
		const margin = 0.33*spriteSize;
		let x = this.canvas.width - 0.5*spriteSize - margin;
		let y = this.canvas.height - 0.5*spriteSize - margin;
		for(const planet of this.cfg.planetSet)
		{
			const frame = PLANET_MAP[planet];
			console.log(frame);
			const sprite = this.add.sprite(x, y, "planets");
			sprite.setOrigin(0.5, 0.5);
			sprite.displayWidth = sprite.displayHeight = spriteSize;
			sprite.setFrame(frame);
			x -= spriteSize;
		}
	}

	visualizeBoard() 
	{
		const graphics = this.add.graphics();
		
		this.visualizeBackground(graphics);
		this.visualizeStartingPositions(graphics);
		this.visualizeCellContents(graphics);
		this.visualizeGrid(graphics);
		this.visualizePlanets();
	}
}

PandaqiPhaser.linkTo({ scene: BoardGeneration, key: sceneKey });
