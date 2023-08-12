const BoardGeneration = new Phaser.Class({
    Extends: Phaser.Scene,

    initialize:
    function BoardGeneration()
    {
        Phaser.Scene.call(this, { key: 'boardGeneration' });
    },

    preload: function() {
    	this.load.crossOrigin = 'Anonymous';
		this.canvas = this.sys.game.canvas;

		var base = 'gamesites/starry-skylines/';

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

		// icon for starting position
		this.load.spritesheet('startingPositionIcon', base + 'StartingPositionIcon.png?cc=1', { frameWidth: 500, frameHeight: 500 });
    },

    create: function() {
    	this.generateBoard();
    },

    generateBoard: function() {
    	this.gridWidth = 8;
    	this.gridHeight = 8;

    	this.cellWidth = (this.canvas.width / this.gridWidth);
    	this.cellHeight = (this.canvas.height / this.gridHeight);

    	this.createGrid();
    	this.determineStartingPositions();
    	this.determineRandomObstacles();
    	this.visualizeBoard();
    	this.convertCanvasToImage();
    },

    createGrid: function() {
    	this.grid = [];

    	for(var i = 0; i < this.gridWidth; i++) {
    		this.grid[i] = [];
    		for(var j = 0; j < this.gridHeight; j++) {
    			this.grid[i][j] = null;
    		}
    	}
    },	

    determineStartingPositions: function() {
    	this.startingPositions = [];

    	var maxPlayerCount = 3;
    	var cappedPlayerCount = Math.min(maxPlayerCount, playerCount);
    	for(var i = 0; i < cappedPlayerCount; i++) {
    		var x, y 

    		do {
    			x = Math.floor(Math.random() * (this.gridWidth - 2)) + 1;
    			y = Math.floor(Math.random() * (this.gridHeight - 2)) + 1;
    		} while(this.grid[x][y] != null)

    		var obj = { 'x': x, 'y': y}

    		this.grid[x][y] = obj
    		this.startingPositions.push(obj);

    		if(soloMode) {
    			knowledgeAI.disabledSpaces.push(obj)
    		}
    	}
    },

    determineRandomObstacles: function() {
    	this.obstacles = [];

    	var numObstacles = 10 - this.startingPositions.length;
    	
    	for(var i = 0; i < numObstacles; i++) {
    		var x, y 

    		var randType = getRandom('components', components);
    		if(randType == 'effects') { randType = 'path' }

    		do {
    			x = Math.floor(Math.random() * this.gridWidth);
    			y = Math.floor(Math.random() * this.gridHeight);
    		} while(this.grid[x][y] != null || (randType == 'resource' && this.edgeCell(x,y)))

    		var obj = { 'x': x, 'y': y, 'type': randType }

    		this.grid[x][y] = obj
    		this.obstacles.push(obj);

    		// cross-over!
    		// if we place an obstacle here, and we're in solo mode, the AI should know this space is occupied
    		if(soloMode) {
    			knowledgeAI.disabledSpaces.push(obj)
    		}
    	}
    },

    edgeCell: function(x,y) {
    	return (x == 0 || y == 0 || x == (this.gridWidth - 1) || y == (this.gridHeight - 1));
    },

    visualizeBoard: function() {
    	var graphics = this.add.graphics();
    	var resourceLineGraphics = this.add.graphics();

		var minSize = Math.min(this.cellWidth, this.cellHeight);

    	// draw background rectangles (for nicer grid coloring)
    	for(var i = 0; i < this.gridWidth; i++) {
    		var x = i * this.cellWidth;

    		for(var j = 0; j < this.gridHeight + 1; j++) {
	    		var y = j * this.cellHeight;

	    		var color = 0xAAFFAA;
	    		if( (i + j) % 2 == 0) {
	    			color = 0x88CC88;
	    		}
	    		graphics.fillStyle(color, 1.0);

	    		var rect = new Phaser.Geom.Rectangle(x, y, this.cellWidth, this.cellHeight);
	    		graphics.fillRectShape(rect);
	    	}
    	}

    	// draw random decorations (flowers, grass, etc.)
    	// TO DO

    	// draw player starting positions (skipped anything green-like, as the board is already green on the background)
    	var playerColors = [0xFF0000, 0x0000FF, 0xFFFF00, 0xFF00FF, 0x00FFFF, 0x000000, 0xAA8800]
    	for(var i = 0; i < this.startingPositions.length; i++) {
    		var pos = this.startingPositions[i];
    		var rect = new Phaser.Geom.Rectangle(pos.x * this.cellWidth, pos.y * this.cellHeight, this.cellWidth, this.cellHeight);

    		graphics.fillStyle(playerColors[i], 1.0);
    		graphics.fillRectShape(rect);

    		var sprite = this.add.sprite(rect.x + 0.5*this.cellWidth, rect.y + 0.5*this.cellHeight, 'startingPositionIcon');

    		sprite.setOrigin(0.5, 0.5);
    		sprite.setFrame(i);
    		sprite.displayWidth = sprite.displayHeight = minSize;
    		sprite.tint = playerColors[i];
    	}

    	var textCfg = {
			fontFamily: 'Titillium Web',
			fontSize: '32px',
		    color: '#000000',
		    stroke: '#003300',
		    strokeThickness: 2,
		}

    	// draw random obstacles, buildings, numbers, stuff
    	for(var i = 0; i < this.obstacles.length; i++) {
    		var obj = this.obstacles[i];

    		var x = (obj.x + 0.5) * this.cellWidth, y = (obj.y + 0.5) * this.cellHeight

    		switch(obj.type) {
    			case 'path':
    				var randNum = Math.floor(Math.random() * 15) + 1
    				var txt = this.add.text(x, y, '' + randNum, textCfg);
					txt.setOrigin(0.5, 0.5);

    				break;

    			case 'people':
    				var randPerson = getRandom('people', people)
    				var backgroundCircle = new Phaser.Geom.Circle(x, y, 0.9*0.5*minSize)

    				graphics.fillStyle(0xFA7921, 1.0);
    				graphics.fillCircleShape(backgroundCircle);

    				var sprite = this.add.sprite(x, y, randPerson + 'Icon');

    				sprite.setOrigin(0.5, 0.5);
    				sprite.displayWidth = sprite.displayHeight = minSize;

    				break;

    			case 'buildings':
    				var terrainTypes = ['rock', 'river', 'garden']
    				var randType = terrainTypes[Math.floor(Math.random() * terrainTypes.length)]

    				var backgroundRectangle = new Phaser.Geom.Rectangle(obj.x*this.cellWidth, obj.y*this.cellHeight, this.cellWidth, this.cellHeight);

    				var sprite = this.add.sprite(x, y, randType + 'Icon');
    				sprite.setOrigin(0.5, 0.5);
    				sprite.displayWidth = sprite.displayHeight = minSize;

    				color = 0x6EB4FF // water
    				if(randType == 'rock') {
    					color = 0xD8D8D8;
    				} else if(randType == 'garden') {
    					color = 0x63FF7D;
    				}

    				graphics.fillStyle(color, 1.0);
		    		graphics.fillRectShape(backgroundRectangle)

		    		break;

		    	case 'resource':
		    		var randResource = getRandom('resources', resources);

		    		// TEST (draw simple line with color)

		    		// color based on type
		    		var color = 0x2B60AD; // water
		    		if(randResource == 'oxygen') {
		    			color = 0x29C1B1;
		    		} else if(randResource == 'electricity') {
		    			color = 0xFFFF00;
		    		}

		    		// random direction (horizontal or vertical)
		    		var startX = obj.x*this.cellWidth, startY = obj.y*this.cellHeight
		    		var newX = startX + this.cellWidth, newY = startY
		    		if(Math.random() >= 0.5) {
		    			newX = startX
		    			newY = startY + this.cellHeight
		    		}

		    		var line = new Phaser.Geom.Line(startX, startY, newX, newY);
		    		resourceLineGraphics.lineStyle(6, color, 1.0);
		    		resourceLineGraphics.strokeLineShape(line);
		    		
		    		/* TEST (draw sprite)
		    		var sprite = this.add.sprite(x, y, randResource + 'Icon');
    				sprite.setOrigin(0.5, 0.5);
    				sprite.displayWidth = sprite.displayHeight = minSize;
    				*/

		    		break;
    		}
    	}

    	// draw the GRID lines (both vertical and horizontal)
		// Also add coordinates: LETTERS is HORIZONTAL, NUMBERS is VERTICAL
		textCfg = {
			fontFamily: 'Titillium Web',
			fontSize: '10px',
		    color: '#000000',
		}
		var horizontalMarks = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

    	graphics.lineStyle(2, 0x666666, 1.0);   // color: 0xRRGGBB

    	for(var i = 0; i < this.gridWidth + 1; i++) {
    		var x = i * this.cellWidth;

    		var line = new Phaser.Geom.Line(x, 0, x, this.canvas.height);
    		graphics.strokeLineShape(line);

    		var txt = this.add.text(x + 0.5*this.cellWidth, 0 + 10, horizontalMarks[i], textCfg);
    		txt.setOrigin(0.5, 0.5);
    	}

    	for(var i = 0; i < this.gridHeight + 1; i++) {
    		var y = i * this.cellHeight;

    		var line = new Phaser.Geom.Line(0, y, this.canvas.width, y);
    		graphics.strokeLineShape(line);

    		var txt = this.add.text(0 + 5, y + 0.5*this.cellHeight, (i + 1), textCfg);
    		txt.setOrigin(0.5, 0.5);
    	}
    },

    convertCanvasToImage: function() {
		var ths = this;

		this.time.addEvent({
		    delay: 200,
		    callback: function() {
		        var canv = document.getElementById('phaserContainer').firstChild;

				var img = new Image();
				img.src = canv.toDataURL();
				img.style.maxWidth = '100%';
				document.getElementById('phaserContainer').appendChild(img);

				// finally, destroy this whole game
				GAME.destroy(true);
		    },
		    loop: false
		})
	},
});

function startPhaser(gameConfig) {
	document.getElementById('phaserContainer').innerHTML = '';

	var scaleFactor = 2;

	var config = {
	    type: Phaser.CANVAS,
	    scale: {
	        mode: Phaser.Scale.FIT,
	        parent: 'phaserContainer',
	        autoCenter: Phaser.Scale.CENTER_BOTH,
	        width: 210*scaleFactor,
	        height: 297*scaleFactor
	    },

	    backgroundColor: '#FFFFFF',
	    parent: 'phaserContainer',
	    scene: [BoardGeneration],
	}

	window.GAME = new Phaser.Game(config); 
	GAME.scene.start('boardGeneration', gameConfig);
}