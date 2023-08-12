<?php
	require '../../default_headers.php';
?>
		<title>Conductors of the Underground &mdash; fix the transit mess in Hades' underworld</title>
		<link rel="icon" type="image/png" href="gamesites/conductors-of-the-underground/favicon.png" />

		<!-- Default CSS stylesheet for all boardgame pages -->
		<link rel="stylesheet" type="text/css" href="gamesites/boardgames/boardGameStyles.css">

		<!-- TO DO: Find some nice fonts -->

		<style type="text/css">

			h1, h2, h3, h4, h5, h6 {
				font-family: 'Leckerli One', cursive;
			}

			body {
				font-family: 'Nunito', sans-serif;
			}

			input, button, select, option {
				font-family: 'Nunito', sans-serif;
			}

			a.btn, #gameButton {
				font-family: 'Leckerli One', cursive;
			}
			
		</style>
	</head>

	<body>
		<main>
			<section>
				<img src="#" class="bigHeaderImage" />
				<div class="autoCenter">
					<h1>Conductors of the Underground</h1>
					<p class="tagline">Hades has some trouble controlling his underworld. There are just too many souls arriving across the Styx! Help every soul to the right place by efficiently sending trains across the network. A <a class="link" href="boardgames#one_paper_games">One Paper Game</a> for 2&ndash;8 players.</p>
					<p class="tagline taglineData">Ages: everyone | Complexity: Low | Playtime: 45 minutes </p>
					<p style="text-align: center;"><a href="#" class="btn download-btn">Download</a></p>
				</div>
			</section>

			<section>
				<div class="autoCenter">
					<h2>What's the idea?</h2>
					<p>Hades has some trouble controlling his underworld. There are just too many souls arriving! And all of them have different needs, curses and treatments!</p>
					<p>He has asked you to take care of his troubles. The player who wins ( = TO DO OBJECTIVE HERE) will officially receive the job as Conductor of the Underground, for all eternity. Isn’t that nice?</p>
				</div>
			</section>

			<!-- A SEEDED random number generator, so everything is consistent across devices -->
			<!-- URL: https://github.com/davidbau/seedrandom -->
			<script src="//cdnjs.cloudflare.com/ajax/libs/seedrandom/3.0.5/seedrandom.min.js"></script>

			<!-- Load Phaser 3.24.0 (I don't want to automatically load latest version for chance of incompatibility) -->
			<script src="https://cdn.jsdelivr.net/npm/phaser@3.24.0/dist/phaser.min.js"></script>

			<section>
				<div class="autoCenter">
					<h2>Board Generation</h2>
					<p>Testing, testing, testing ... </p>
					<p><em>Where is the "player count" setting?</em> You don't need it! Each board can support any player count you want. With fewer players, the rules simply tell you to ignore certain parts of the board.</p>

					<div id="gameSettings">
						<div>
							<div>
								<label for="setting-inputSeed">Seed? </label>
								<input type="text" id="setting-inputSeed" placeholder="... type anything ..." maxlength="20" />

								<span class="settingRemark">The same seed (max. 20 characters) will always produce exactly the same board.</span>

								<label for="setting-inkFriendly">Ink Friendly? </label>
								<input type="checkbox" name="setting-inkFriendly" id="setting-inkFriendly">

								<span class="settingRemark">Removes many decorational elements and turns the board black-and-white.</span>
							</div>
						</div>
					</div>

					<div style="text-align: center;">
						<button id="gameButton">Generate Board</button>
					</div>

					<div id="phaserContainer">
					</div>
				</div>
			</section>

			<script>
				var gameConfig = {};

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

						var base = 'gamesites/conductors-of-the-underground/';

						// perlin noise Phaser 3 plugin (by Rex, as always)
						// returns values between -1 and 1
						this.load.plugin('rexperlinplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexperlinplugin.min.js', true);
				    },

				    create: function(config) {
				    	this.cfg = {}

				    	// number of cells along width of the paper
				    	this.cfg.resX = 30;

				    	// ... determines grid cell size
				    	this.cfg.cellSize = this.canvas.width / this.cfg.resX;

				    	// ... determines resolution along height of paper
				    	this.cfg.resY = Math.floor(this.canvas.height / this.cfg.cellSize);

				    	this.generateBoard();
				    	this.convertCanvasToImage();
				    },

				    generateBoard: function() {
				    	this.createGrid();
				    	this.placeRandomPoints();
				    	
				    	this.primsAlgorithm();
				    	this.randomFillNetwork();
				    	
				    	console.log(this.stations);

				    	this.visualizeGame();
				    },

				    createGrid: function() {
				    	this.noise = this.plugins.get('rexperlinplugin').add(gameConfig.seed);
				    	this.map = [];

				    	for(var x = 0; x < this.cfg.resX; x++) {
				    		this.map[x] = [];

				    		for(var y = 0; y < this.cfg.resY; y++) {
				    			this.map[x][y] = 
					    			{
					    				x: x,
					    				y: y,
					    				type: 'empty',
					    				station: null,
					    			};
				    		}
				    	}
				    },

				    primsAlgorithm: function() {
				    	this.connections = [];

				    	var pointsToVisit = this.stations.length
				    	var curPoint = this.stations[0];
				    	var list = [curPoint];

				    	// use Prim's algorithm to build a minimum spanning tree from ALL points
				    	while(list.length < pointsToVisit) {
				    		var query = this.findNearestStation(list, 1);
				    		var p1 = query.p1, p2 = query.p2;

				    		list.push(p2);
				    		this.connections.push(this.createConnectionLine(p1, p2));

							// NOTE: createConnectionLine also changes p1 and p2 to include data about their connection
				    		this.map[p1.x][p1.y].station.conns.push(p2);
				    		this.map[p2.x][p2.y].station.conns.push(p1);
				    	}
				    },

				    randomFillNetwork: function() {
				    	var numConnectionsToAdd = 20;

				    	for(var i = 0; i < numConnectionsToAdd; i++) {
				    		var p = this.stations[Math.floor(Math.random() * this.stations.length)];

				    		var query = this.findNearestStation([p], 3);
				    		var p1 = query.p1, p2 = query.p2;

				    		if(p1 == null || p2 == null) {
				    			i--;
				    			continue;
				    		}

				    		var line;
				    		var connectionIndex = this.alreadyHasConnection(p1, p2);
				    		console.log(connectionIndex);
				    		if(connectionIndex > -1) {
				    			// TO DO: Make offset random/calculated, instead of a fixed -1
				    			var data = this.map[p1.x][p1.y].station.conns[connectionIndex].data

				    			console.log(p1)
				    			console.log(this.map[p1.x][p1.y])
				    			console.log(data)

				    			console.log(p2)
				    			line = this.createConnectionLine(p1, p2, data, -1)
				    		} else {
				    			line = this.createConnectionLine(p1, p2)

				    			this.map[p1.x][p1.y].station.conns.push(p2);
				    			this.map[p2.x][p2.y].station.conns.push(p1);
				    		}

				    		this.connections.push(line)

				    	}
				    },

				    alreadyHasConnection: function(p1, p2) {
				    	var station = this.map[p1.x][p1.y].station;
				    	for(var i = 0; i < station.conns.length; i++) {
				    		var c = station.conns[i];
				    		if(c.x == p2.x && c.y == p2.y) { return i; }
				    	}

				    	return -1;
				    },

				    // check circles around the point for the nearest station
				    // (if multiple at the same radius/distance, pick randomly from that list)
				    // ignore any station that already has "maxConns" connections
				    findNearestStation: function(list, maxConns = -1) {
				    	var minRadius = Infinity, minDist = Infinity, minStationFrom = null, minStationTo = null;

				    	for(var i = 0; i < list.length; i++) {
				    		var p = list[i];
					    	var radius = 1

					    	while(radius < this.cfg.resX) {

					    		var foundSomething = false;
						    	for(var x = -radius; x < radius; x++) {
						    		for(var y = -radius; y < radius; y++) {
						    			// don't check ourselves of course
						    			if(x == 0 && y == 0) { continue; }

						    			// and don't check stuff out of bounds
						    			var tPos = { 'x': p.x + x, 'y': p.y + y };
						    			if(this.outOfBounds(tPos)) { continue; }

						    			var val = this.map[tPos.x][tPos.y];
						    			if(val.type != 'station') { continue; }
						    			if(maxConns >= 0 && val.station.conns.length >= maxConns) { continue; }

						    			var dist = Math.abs(x) + Math.abs(y)
						    			if(dist < minDist) { 
						    				minDist = dist;

						    				minStationFrom = { x: p.x, y: p.y };
						    				minStationTo = tPos;

						    				minRadius = Math.min(minRadius, radius);
						    				foundSomething = true;
						    			}
						    		}
						    	}

						    	if(foundSomething || radius >= minRadius) {
						    		break;
						    	} else {
						    		radius++;
						    	}
						    }
						}

						return { p1: minStationFrom, p2: minStationTo }
				    },

				    outOfBounds: function(p) {
				    	return (p.x < 0 || p.x >= this.cfg.resX || p.y < 0 || p.y >= this.cfg.resY);
				    },

				    // creates a connection between station 1 (p1) and station 2 (p2)
				    // following a restriction on angles (only 45 degrees ... for now)
				    // NOTE (important): Also updates the points to include data about the connection!
				    createConnectionLine: function(p1, p2, fixedData = null, offset = 0) {
				    	// duplicate lines get an offset perpendicular to the line
				    	if(fixedData != null) {
				    		p1.x += -fixedData.vecStart.y*offset;
				    		p1.y += fixedData.vecStart.x*offset;

				    		p2.x += -fixedData.vecEnd.y*offset;
				    		p2.y += fixedData.vecEnd.x*offset;

				    		// TO DO: Increase/decrease angle based on whether we're on the inside or outside
				    	}

				    	// get (Manhattan) x and y distance
				    	var dx = p2.x - p1.x, dy = p2.y - p1.y
				    	var signX = this.makeBinary(dx), signY = this.makeBinary(dy)

				    	// determine the maximum size that an angle could take
				    	var maxAngleSize = Math.min(Math.abs(dx), Math.abs(dy));

				    	// if no angle is needed, create a simple straight line!
				    	if(maxAngleSize == 0 || (fixedData != null && fixedData.angle == 0)) { 
				    		if(fixedData == null) {
				    			var vec = { x: signX, y: signY }

				    			p1.data = { angle: 0, vecStart: vec, vecEnd: vec, type: 'straight' }
				    			p2.data = { angle: 0, vecStart: { x: -vec.x, y: -vec.y }, vecEnd: { x: -vec.x, y: -vec.y }, type: 'straight' }
				    		}
				    		return [p1, p2]; 
				    	}

				    	// pick a random length for the angled piece (1 to max)
				    	var angleSize = Math.floor(Math.random() * maxAngleSize) + 1;

				    	// if we're creating a duplicate connection, copy the angle of previous connections (so it looks good)
				    	if(fixedData != null) {
				    		angleSize = fixedData.angle;
				    	}

				    	// find out how much we have to travel "straight" if we use that angle
				    	var newX = Math.abs(dx) - angleSize, newY = Math.abs(dy) - angleSize;
				    	var vecStart = { x: 0, y: 0 }
				    	if(newX > newY) {
				    		newY = 0;
				    		vecStart = { x: signX, y: 0 }
				    	} else {
				    		newX = 0;
				    		vecStart = { x: 0, y: signY }
				    	}

				    	// now create a line following that angle
				    	var pAngleStart = { 'x': p1.x + signX*newX, 'y': p1.y + signY*newY }
				    	var pAngleEnd = { 'x': pAngleStart.x + signX*angleSize, 'y': pAngleStart.y + signY*angleSize };

				    	var vecEnd = { x: this.makeBinary(p2.x - pAngleEnd.x), y: this.makeBinary(p2.y - pAngleEnd.y) }

				    	// Save the line vector at start and end on the first point,
				    	// save the reverse of that on the second point (both in direction and which one is start/end)
				    	if(fixedData == null) {
				    		p1.data = { angle: angleSize, vecStart: vecStart, vecEnd: vecEnd, type: 'angled' }
				    		p2.data = { angle: angleSize, vecStart: { x: -vecEnd.x, y: -vecEnd.y }, vecEnd: { x: -vecStart.x, y: -vecStart.y }, type: 'angled' }
				    	}
				    	
				    	return [p1, pAngleStart, pAngleEnd, p2]
				    },

				    makeBinary: function(val) {
				    	if(val == 0) { return 0; }
				    	else { return val/Math.abs(val); }
				    },

				    placeRandomPoints: function() {
				    	var numPoints = 100;

				    	this.stations = [];

				    	for(var i = 0; i < numPoints; i++) {
				    		var pos = this.getRandomPos(true, true);
				    		
				    		var newStation = {
				    			x: pos.x,
				    			y: pos.y,
				    			conns: []
				    		}

				    		this.map[pos.x][pos.y].type = 'station';
				    		this.map[pos.x][pos.y].station = newStation;

				    		this.stations.push(newStation);
				    	}
				    	
				    },

				   	visualizeGame: function() {
				   		const cs = this.cfg.cellSize;

				   		var graphics = this.add.graphics();

				   		// draw connections
				   		for(var i = 0; i < this.connections.length; i++) {
				   			var l = this.connections[i];

				   			// draw a polyline: start at first location, then loop through and keep moving until end
				   			// then stroke the whole path
				   			graphics.lineStyle(0.9*cs, 0xFF00FF, 1.0);
							graphics.beginPath();
							graphics.moveTo((l[0].x + 0.5) * cs, (l[0].y + 0.5) * cs);

							for(var j = 1; j < l.length; j++) {
								graphics.lineTo((l[j].x + 0.5) * cs, (l[j].y + 0.5) * cs);								
							}

							// only if we want to close it; conenct start to end => graphics.closePath();
							graphics.strokePath();
				   		}

				   		// place all stations
				   		for(var i = 0; i < this.stations.length; i++) {
				   			var pos = this.stations[i];
				   			var circ = new Phaser.Geom.Circle((pos.x + 0.5) * cs, (pos.y + 0.5) * cs, 0.45*cs);

				   			graphics.fillStyle(0x000000, 1.0);
				   			graphics.fillCircleShape(circ);
				   		}
				   	},

				   	getRandomPos: function(empty = true, followNoise = true) {
				   		var RNG = new Math.seedrandom(gameConfig.seed + "-randomPos");

				   		var x,y,invalidPos = false;
				   		do {
				   			x = Math.floor(Math.random() * this.cfg.resX);
				   			y = Math.floor(Math.random() * this.cfg.resY);

				   			invalidPos = false;

				   			if(empty && this.map[x][y].type != 'empty') {
				   				invalidPos = true;
				   				continue;
				   			}

				   			var val = 0.5*(this.noise.perlin2(x * this.cfg.cellSize, y * this.cfg.cellSize) + 1.0)
				   			if(followNoise && RNG() > val) {
				   				invalidPos = true;
				   				continue;
				   			}

				   		} while(invalidPos);

				   		return { 'x': x, 'y': y }
				   	},

				    convertCanvasToImage: function() {
				    	this.time.addEvent({
						    delay: 100,
						    callback: function() {
						        var canv = document.getElementById('phaserContainer').firstChild;

								var img = new Image();
								img.src = canv.toDataURL();
								img.style.maxWidth = '100%';
								document.getElementById('phaserContainer').appendChild(img);
								document.getElementById('phaserContainer').style.overflow = "visible";

								GAME.destroy(true);
						    },
						    loop: false
						})
				    },
				});

				//
				// Seed saving + generation start
				//

				// http://www.endmemo.com/sconvert/millimeterpixel.php
				// 1 mm = 3.779528 px; 1 px = 0.264583 mm
				const scaleFactor = 3.8;

				function startPhaser(gameConfig) {
					document.getElementById('phaserContainer').innerHTML = '';

					var config = {
					    type: Phaser.CANVAS,
					    scale: {
					        mode: Phaser.Scale.FIT,
					        parent: 'phaserContainer',
					        autoCenter: Phaser.Scale.CENTER_BOTH,
					        width: 297*scaleFactor,
					        height: 210*scaleFactor
					    },

					    backgroundColor: '#FFFFFF',
					    parent: 'phaserContainer',
					    scene: [BoardGeneration],
					}

					window.GAME = new Phaser.Game(config); 
					GAME.scene.start('boardGeneration', gameConfig);
				}

				document.getElementById('gameButton').addEventListener('click', function() {
					var randomSeedLength = Math.floor(Math.random() * 6) + 3;
					var randomSeed = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, randomSeedLength);

					gameConfig = 
					{
						'seed': document.getElementById('setting-inputSeed').value || randomSeed,
						'inkFriendly': document.getElementById('setting-inkFriendly').checked || false,
					}

					startPhaser();
				});
			</script>

		</main>

		

<?php

require '../../footer.php';

?>

		