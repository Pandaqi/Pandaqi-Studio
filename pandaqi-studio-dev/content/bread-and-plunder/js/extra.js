const BoardGeneration = new Phaser.Class({
    Extends: Phaser.Scene,

    initialize:
    function GameOver()
    {
        Phaser.Scene.call(this, { key: 'boardGeneration' });
    },

    preload: function() {
		this.load.crossOrigin = 'Anonymous';
		this.canvas = this.sys.game.canvas;

		var base = '';
    },

    create: function(config) {
    	// user-input settings should be passed through config
    	this.cfg = {}
		Object.assign(this.cfg, config);

		this.cfg.bgColor = "#000000";
		
    	this.cfg.resolutionX = 10; // number of points across the width of the paper
    	this.cfg.resolutionY = Math.floor((210/297) * this.cfg.resolutionX); // number of points across the height of the paper
    	this.cfg.cellSizeX = this.canvas.width / this.cfg.resolutionX;
    	this.cfg.cellSizeY = this.canvas.height / this.cfg.resolutionY

    	this.mainGraphics = null;
    	this.connectionsToDraw = [];

    	this.generateBoard();
    },

    generateBoard: function() {
    	this.generateStars();
    	this.placePoints();

    	this.currentIteration = 0;

    	const ths = this;
    	this.iteratingTimer = this.time.addEvent({
		    delay: 100,
		    callback: function() {
		        ths.relaxPoints();
		        ths.visualizeGame();

		        if(ths.currentIteration >= 60) {
		    		ths.finishGeneration();
		    	}
		    },
		    loop: true
		})

    	//this.relaxPoints();
    	//this.visualizeGame();
    },

    generateStars: function() {
    	const RNG = PQ_GAMES.TOOLS.random.seedRandom(gameConfig.seed + 'stars');

    	var minStars = 1;
    	var maxStars = 5;
    	var numStars = Math.floor(RNG()*(maxStars - minStars + 1)) + maxStars;

    	this.stars = [];
    	for(var i = 0; i < numStars; i++) {

    	}
    },

    placePoints: function() {
    	this.points = [];
    	this.map = [];

    	const RNG = PQ_GAMES.TOOLS.random.seedRandom(gameConfig.seed);
    	const RNG2 = PQ_GAMES.TOOLS.random.seedRandom(gameConfig.seed);
    	const RNG3 = PQ_GAMES.TOOLS.random.seedRandom(gameConfig.seed);

    	// first, place all points on exact grid intervals, and determine a random type (planet, moon, ...)
    	for(var x = 0; x < this.cfg.resolutionX; x++) {
    		this.map[x] = [];

    		for(var y = 0; y < this.cfg.resolutionY; y++) {
    			this.map[x][y] = [];

    			var val = RNG();
    			var pointType = 'mid';
    			var gravityPull = 0;

    			// TEST: Just remove some values
    			if(val >= 0.8) {
    				continue;
    			}
    			
    			if(val <= 0.05) {
    				pointType = 'planet'
    				gravityPull = 0.5 + RNG2() * 0.5
    			} else if(val <= 0.1) {
    				pointType = 'moon'
    				gravityPull = 0.15 + RNG2() * 0.5
    			} else if(val <= 0.105) {
    				pointType = 'sun'
    				gravityPull = 1.0 + RNG2() * 0.5
    			}

    			var p = { 
    				'x': x + RNG3(), 
    				'y': y + RNG3(),
    				'type': pointType,
    				'pull': gravityPull,
    				'connections': [],
    			}

    			this.points.push(p);
    			this.map[x][y].push(p);
    		}
    	}
    },

    relaxPoints: function() {
    	const numIterations = 1;
    	const numPoints = this.points.length;

    	this.currentIteration++;
    	
    	// Reduce velocity strength with each iteration (they move less and less wildly over time, so that algorithm ends smoothly)
    	var stepSize = 1.0 / this.currentIteration;
    	var equilibrium = 1.0;

    	for(var i = 0; i < numIterations; i++) {
    		// first, determine velocity based on connections
    		for(var a = 0; a < numPoints; a++) {
    			var p = this.points[a];
    			var vel = [0,0];
    			var cX = Math.floor(p.x), cY = Math.floor(p.y)

    			// find which points we'll be influenced by
    			// (just copy whatever is in each cell within a certain range)
    			var connections = [];
    			var range = 3;
    			for(var xx = -range; xx <= range; xx++) {
    				for(var yy = -range; yy <= range; yy++) {
    					if(this.outOfBounds(cX + xx, cY + yy)) {
    						continue;
    					}

    					var cells = this.map[cX + xx][cY + yy]

    					for(var cc = 0; cc < cells.length; cc++) {
    						connections.push(cells[cc]);
    					}
    				}
    			}

    			for(var c = 0; c < connections.length; c++) {
    				var p2 = connections[c];
    				var vec = [p.x - p2.x, p.y - p2.y]
    				var dist = Math.sqrt(vec[0]*vec[0] + vec[1]*vec[1]);

    				var force = 0, dir = 1.0;

    				equilibrium = p.pull + p2.pull + 0.25; // 0.25 = margin value
    				if(p.pull == 0 && p2.pull == 0) {
    					equilibrium = 1.0;
    				}

    				// testing if we need spring-like force or just pushing away
    				if(dist > equilibrium) {
    					continue;
    				}

    				// mid points should just space out themselves evenly
					force = Math.abs(dist - equilibrium);
					dir = (dist < equilibrium) ? 1.0 : -1.0;

    				if(force != 0) {
    					vel = [vel[0] + dir*vec[0]*force, vel[1] + dir*vec[1]*force]
    				}
    			}

    			p.relaxVelocity = vel
    		}

    		// then move all points based on that velocity
    		for(var a = 0; a < numPoints; a++) {
    			var p = this.points[a]

    			// @TODO: @Optimization. Don't do cell switching if cell index doesn't change!
    			// remove from old cell
    			var cX = Math.floor(p.x), cY = Math.floor(p.y)
    			var cell = this.map[cX][cY]

    			cell.splice(cell.indexOf(p), 1);

    			// actually move
    			p.x += p.relaxVelocity[0] * stepSize;
    			p.y += p.relaxVelocity[1] * stepSize;

    			this.keepPointOnScreen(p);

    			// add to new cell
    			cX = Math.floor(p.x)
    			cY = Math.floor(p.y)
    			cell = this.map[cX][cY]
    			cell.push(p);

    		}
    	}
    },

    createConnections: function() {
    	this.connectionsToDraw = [];

    	for(var a = 0; a < this.points.length; a++) {
			var p = this.points[a];
			p.connections = [];

			var cX = Math.floor(p.x), cY = Math.floor(p.y)

	    	// find everything within a certain range
	    	var range = 1;
			for(var xx = -range; xx <= range; xx++) {
				for(var yy = -range; yy <= range; yy++) {
					if(this.outOfBounds(cX + xx, cY + yy)) {
						continue;
					}

					var cells = this.map[cX + xx][cY + yy]

					for(var cc = 0; cc < cells.length; cc++) {
						var p2 = cells[cc]
						p2.tempDistance = (p.x - p2.x)*(p.x - p2.x) + (p.y - p2.y)*(p.y - p2.y)

						// do not include ourselves!
						if(p2.tempDistance == 0) {
							continue;
						}

						p.connections.push(p2);
					}
				}
			}

			// sort connections based on distance, keep only the lowest 3
			p.connections.sort(function(a,b) { if(a.tempDistance < b.tempDistance) { return -1 } else { return 1 } });
			p.connections = p.connections.slice(0, Math.min(3, p.connections.length));

			for(var i = 0; i < p.connections.length; i++) {
				// if connection already exists, don't mark it as a connection to draw
				var p2 = p.connections[i];

				if(!p2.connections.includes(p)) {
					this.connectionsToDraw.push([p.x, p.y, p2.x, p2.y]);
				}
			}

		}
    },

    finishGeneration: function() {
    	this.iteratingTimer.remove();
    	this.createConnections();
    	this.visualizeGame();
    	PQ_GAMES.PHASER.convertCanvasToImage(this);
    },

    visualizeGame: function() {
    	if(this.mainGraphics != null) {
    		this.mainGraphics.destroy();
    	}

		// visualize all points (correct place + radius + color/type)
		const graphics = this.add.graphics();
		const w = this.canvas.width, h = this.canvas.height
		const sX = this.cfg.cellSizeX, sY = this.cfg.cellSizeY

		// draw all connections (that need to be drawn)
		for(var i = 0; i < this.connectionsToDraw.length; i++) {
			var p = this.connectionsToDraw[i];
			var line = new Phaser.Geom.Line(p[0] * sX, p[1] * sY, p[2] * sX, p[3] * sY);

			graphics.lineStyle(3, 0xAAAAAA, 0.5);
			graphics.strokeLineShape(line);
		}

		for(var i = 0; i < this.points.length; i++) {
			var p = this.points[i];
			var radius = p.pull;
			var color = 0xFF0000;

			if(p.type == 'mid') {
				radius = 0.15;
				color = 0xFFFFFF;
			} else if(p.type == 'planet') {
				color = 0xAAFFAA;
			} else if(p.type == 'moon') {
				color = 0x555555;
			} else if(p.type == 'sun') {
				color = 0xFFFF00;
			}

			var circ = new Phaser.Geom.Circle(p.x * sX, p.y * sY, radius * Math.min(sX, sY));
			graphics.fillStyle(color, 1.0);
			graphics.fillCircleShape(circ);
		}

		this.mainGraphics = graphics;
    },

    keepPointOnScreen: function(p) {
    	p.x = Math.max(Math.min(p.x, this.cfg.resolutionX-1), 0);
    	p.y = Math.max(Math.min(p.y, this.cfg.resolutionY-1), 0);
    },

    outOfBounds: function(x,y) {
    	return (x < 0 || x >= this.cfg.resolutionX || y < 0 || y >= this.cfg.resolutionY);
    }
});