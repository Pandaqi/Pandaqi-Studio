<?php
	require '../../default_headers.php';
?>
		<title>Bread &amp; Plunder &mdash; the adventure of space pirates using a bakery to cover up their crimes</title>
		<link rel="icon" type="image/png" href="gamesites/bread-and-plunder/favicon.png" />
		<base href="gamesites/bread-and-plunder/">

		<link href="https://fonts.googleapis.com/css2?family=Acme&family=Rajdhani:wght@300;500;700&display=swap" rel="stylesheet">

		<style type="text/css">

			/*
			FONTS? 
			Teko (space-like): https://fonts.google.com/specimen/Teko
			Sniglet (cartoony, thick): https://fonts.google.com/specimen/Sniglet
			Chilanka (hand-written, but looks nice)

			Acme (legible, but hint of pirateness): https://fonts.google.com/specimen/Acme
			Rajdhani (thinner space-like): https://fonts.google.com/specimen/Rajdhani
			
			Bready (pirate-like, thick, nice font) => free for personal use only (Dafont)
			Pirates & Robbers (the PERFECT FONT) => not sure about if I can use it though?

			Ezcar (not sure about this game, but will surely use this for something): https://fonts.google.com/specimen/Eczar

			Spectral (extremely nice, free, commissioned workhorse font): https://fonts.google.com/specimen/Spectral

			*/

			h1, h2, h3, h4, h5, h6 {
				font-family: 'Acme', cursive;
				text-decoration: none;
				text-transform: none;
				text-align: center;
			}

			h1 {
				font-size: 8vw;
				margin-bottom: 10px;
			}

			.autoCenter h2 {
				font-size: 48px;
				margin-bottom: 0px;
			}

			body {
				font-family: 'Rajdhani', sans-serif;
				font-size: 20pt;

				overflow-y: scroll;
				overflow-x: hidden;

				color: #0D0106;
				background-color: #DFF2D8;
			}

			.autoCenter {
				max-width: 960px;
				margin: auto;
				padding: 20px;
				box-sizing: border-box;
			}

			.tagline {
				font-weight: bold;
				max-width: 550px;
				margin-left: auto;
				margin-right: auto;
				color: #0D0106;
				text-align: center;
			} 

			a {
				color: #143109;
			}

			a.btn, a.btn:visited, button.btn, button.btn:visited {
				font-family: 'Acme', cursive;
				font-size: 24pt;
				text-decoration: none;
				background-color: #248232;
				padding: 20px;
				margin: 10px;
				color: #FCFFFC;
				border-radius: 10px;
				box-sizing: border-box;
				display: inline-block;

				transition: background-color 0.3s, color 0.3s;
			}

			a.btn:hover, button.btn:hover {
				background-color: rgb(0, 0, 100);
				color: rgb(175, 175, 255);
				cursor: pointer;
			}


			a.download-btn, a.download-btn:visited {
				background-color: #F4C095;
				color: #040F0F;
				margin: auto;
				display: inline-block;
			}

			a.download-btn:hover {
				background-color: #040F0F;
				color: #F4C095;
			}

			ul {
				margin-top:-15px;
			}

			select {
				font-family: inherit; 
				padding: 10px;
				background-color: rgba(0,0,0,0.5);
				color: white;
				border: none;
				border-radius: 5px;
			}

			.bigHeaderImage {
				max-width:100%; 
				margin: auto; 
				margin-bottom:-7.5vw;
				filter:drop-shadow(0 0 10px black);
				pointer-events:none;
			}

			#phaserContainer img {
				box-shadow: 0 0 5px #333;
			}

			#gameSettings {
				text-align: center;
			}

			#gameSettings > div {
				margin: auto;
				display: inline-block;
				padding: 20px;
				background-color: #143109;
				border-radius: 5px;
				color: white;
			}

			#gameSettings > div > div {
				text-align: left;
				grid-gap: 15px;
				display: grid;
				grid-template-columns: auto auto;
			}

			.settingRemark {
				color: rgba(255,255,255,0.5);
				max-width: 300px;
				font-size: 12pt;
				grid-column: 1 / 3;
				margin-top: -10px;
			}

			.remark {
				color: #143109;
				font-weight: bold;
			}

			@media all and (max-width: 600px) {
				h1 {
					font-size: 52px;
				}
			}
			
		</style>
	</head>

	<body>
		<main>
			<section>
				<img src="#" class="bigHeaderImage" />
				<div class="autoCenter">
					<h1>Bread &amp; Plunder</h1>
					<p class="tagline">A boardgame for 1&ndash;8 players playing pirates in space, while keeping up a pretend bakery to cover-up your crimes.</p>
					<p class="tagline" style="font-size:12pt; opacity: 0.5;">Ages: everyone | Complexity: Medium | Playtime: 45 minutes </p>
					<p style="text-align: center;"><a href="#" class="btn download-btn">Download</a></p>
				</div>
			</section>

			<section>
				<div class="autoCenter">
					<p>This is a board game (no device/app required during play), BUT all components are randomly generated beforehand!</p>
					<p>Input any word you like below ("SPACE", "PIRATES", ...) and click "generate game"</p>
					<p>This will create several images, containing a random universe, player ships and powers, cities, and more.</p>
					<p>Print these and play the game!</p>
					<p><em>Remark:</em> you can also print all materials as a PDF! This will often be quicker and easier to download and print.</p>
					<p><em>Remark:</em> because it's randomly generated, there's a tiny probability that it generates a game that is clearly unfair or unbalanced. (Or it simply creates a game board that looks ugly.) So check if you like what you see, before you print!</p> 
				</div>
			</section>

			<!-- A SEEDED random number generator, so everything is consistent across devices -->
			<!-- URL: https://github.com/davidbau/seedrandom -->
			<script src="//cdnjs.cloudflare.com/ajax/libs/seedrandom/3.0.5/seedrandom.min.js"></script>

			<!-- jsPDF for turning images into single printable PDF, friendlier to newcomers -->
			<!-- URL: https://github.com/MrRio/jsPDF -->
			<script src="https://unpkg.com/jspdf@latest/dist/jspdf.min.js"></script>

			<!-- Load Phaser 3.24.0 (I don't want to automatically load latest version for chance of incompatibility) -->
			<script src="https://cdn.jsdelivr.net/npm/phaser@3.24.0/dist/phaser.min.js"></script>

			<section>
				<div class="autoCenter">
					<h2>Testing</h2>
					<p><input type="text" id="input-seed" /></p>
					<button id="btn-inputSeed">Input Seed</button>
					<button id="btn-createPDF">Create PDF</button>

					<div id="phaserContainer">
					</div>
				</div>
			</section>

			<script>
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

						var base = 'gamesites/timely-transports/';
				    },

				    create: function(config) {
				    	// user-input settings should be passed through config
				    	this.cfg = {}
				    	
				    	this.cfg.resolutionX = 10; // number of points across the width of the paper
				    	this.cfg.resolutionY = Math.floor((210/297) * this.cfg.resolutionX); // number of points across the height of the paper
				    	this.cfg.cellSizeX = this.canvas.width / this.cfg.resolutionX;
				    	this.cfg.cellSizeY = this.canvas.height / this.cfg.resolutionY

				    	this.mainGraphics = null;
				    	this.connectionsToDraw = [];

				    	this.generateBoard();
				    	// this.convertCanvasToImage();
				    },

				    generateBoard: function() {
				    	this.generateStars();
				    	this.placePoints();

				    	// for debugging, it helps if I see what's going on each relaxing iteration
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
				    	const RNG = new Math.seedrandom(seed + 'stars');

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

				    	const RNG = new Math.seedrandom(seed);
				    	const RNG2 = new Math.seedrandom(seed);
				    	const RNG3 = new Math.seedrandom(seed);

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

				    			// TO DO: @Optimization. Don't do cell switching if cell index doesn't change!
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

				    	this.convertCanvasToImage();
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
				    },

				    convertCanvasToImage: function() {
				    	this.time.addEvent({
						    delay: 200,
						    callback: function() {
						        var canv = document.getElementById('phaserContainer').firstChild;

								var img = new Image();
								img.src = canv.toDataURL();
								img.style.maxWidth = '100%';
								document.getElementById('phaserContainer').appendChild(img);
								document.getElementById('phaserContainer').style.overflow = "visible";

								pdfImages.push(img);

								// finally, destroy this whole game
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
				var seed = "";
				const pdfImages = [];

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

					    backgroundColor: '#000000',
					    parent: 'phaserContainer',
					    scene: [BoardGeneration],
					}

					window.GAME = new Phaser.Game(config); 
					GAME.scene.start('boardGeneration', gameConfig);
				}

				document.getElementById('btn-inputSeed').addEventListener('click', function() {
					seed = document.getElementById('input-seed').value;

					startPhaser();
				});

				//
				// PDF creation
				//
				function createPDF() {
					var pdfConfig = {
					  orientation: 'landscape',
					  unit: 'mm',
					  format: [297*scaleFactor, 210*scaleFactor]
					}

					var doc = new jsPDF(pdfConfig);

					var width = doc.internal.pageSize.getWidth(), height = doc.internal.pageSize.getHeight();

				    // DOC: addImage(imageData, format, x, y, width, height, alias, compression, rotation)
				    for(var i = 0; i < pdfImages.length; i++) {
				    	if(i > 0) {
					    	doc.addPage();
				    	}
				    	
				    	doc.addImage(pdfImages[i], 'png', 0, 0, width, height);
				    }

				    doc.save('Bread & Plunder (' + seed + ').pdf');
				    //doc.output('datauri');
				}

				document.getElementById('btn-createPDF').addEventListener('click', function() {
					createPDF();
				})
				
			</script>

		</main>

		

<?php

require '../../footer.php';

?>

		