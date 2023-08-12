<?php
	require '../../default_headers.php';
?>
		<title>The Curse of Coop &mdash; enter a cursed temple ... or rule it as a (mad) god</title>
		<link rel="icon" type="image/png" href="gamesites/the-curse-of-coop/favicon.png" />

		<!-- Default CSS stylesheet for all boardgame pages -->
		<link rel="stylesheet" type="text/css" href="gamesites/boardgames/boardGameStyles.css">

		<!-- Langar (header font) -->
		<link rel="preconnect" href="https://fonts.gstatic.com">
		<link href="https://fonts.googleapis.com/css2?family=Langar&display=swap" rel="stylesheet"> 

		<!-- Londrina Solid (body font; 4 weights) -->
		<link href="https://fonts.googleapis.com/css2?family=Londrina+Solid:wght@100;300;400;900&display=swap" rel="stylesheet"> 

		<!-- Font Awesome => for the pizza icons -->
		<script src="https://kit.fontawesome.com/d60575e6ff.js" crossorigin="anonymous"></script>

		<style type="text/css">

			h1, h2, h3, h4, h5, h6 {
				font-family: 'Langar', cursive;
			}

			body {
				font-family: 'Londrina Solid', cursive;
				font-weight: 300; /* Londrina is quite a thick font, so opt for lighter variants in most cases */
			}

			input, button, select, option {
				font-family: 'Londrina Solid', cursive;
			}

			a.btn, #gameButton {
				font-family: 'Langar', cursive;
			}

			p.tagline {
				font-weight: 500;
			}
		</style>
	</head>

	<body>
		<main>
			<section>
				<img src="?" />
				<div class="autoCenter">
					<h1>The Curse of Coop</h1>
					<p class="tagline" id="introBox">A <a class="link" href="boardgames#one_paper_games">One Paper Game</a> for 2&ndash;8 players about entering a cursed temple as a researcher. Some players, however, might be in it for the gold ... In fact, as you trudge through dark caverns and mysterious rooms, you get the feeling the whole temple might be against you!</p>
					<p class="tagline taglineData">Ages: everyone | Complexity: Low | Playtime: ~15 minutes per player </p>
					<p style="text-align: center;"><a href="?" class="btn download-btn">Download</a></p>
				</div>
			</section>

			<section>
				<div class="autoCenter">
					<h2>What's the idea?</h2>
					<p>Lala</p>
				</div>
			</section>

			<!-- A SEEDED random number generator, so everything is consistent across devices -->
			<!-- URL: https://github.com/davidbau/seedrandom -->
			<script src="//cdnjs.cloudflare.com/ajax/libs/seedrandom/3.0.5/seedrandom.min.js"></script>

			<!-- jsPDF for turning images into single printable PDF, friendlier to newcomers -->
			<!-- URL: https://github.com/MrRio/jsPDF -->
			<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.1.1/jspdf.umd.min.js"></script>

			<!-- Load Phaser 3.24.0 -->
			<script src="https://cdn.jsdelivr.net/npm/phaser@3.24.0/dist/phaser.min.js"></script>

			<section>
				<div class="autoCenter">
					<h2>Board Generation</h2>
					<p>Input any seed you want (your favorite artist, a made-up word, whatever) and your player count.</p>
					<p>Click "Generate Board", save the image (or PDF) and print it.</p>

					<div id="gameSettings">
						<div>
							<div>
								<label for="setting-inputSeed">Seed? </label>
								<input type="text" id="setting-inputSeed" placeholder="... type anything ..." maxlength="20" />

								<span class="settingRemark">The same seed (max. 20 characters) will always produce exactly the same board.</span>

								<label for="setting-playerCount">How many players? </label>
								<select name="setting-playerCount" id="setting-playerCount">
									<option value="2">2</option>
									<option value="3">3</option>
									<option value="4" selected>4</option>
									<option value="5">5</option>
									<option value="6">6</option>
									<option value="7">7</option>
									<option value="8">8</option>
								</select>

								<label for="setting-inkFriendly">Ink Friendly? </label>
								<input type="checkbox" name="setting-inkFriendly" id="setting-inkFriendly">

								<span class="settingRemark">Removes many decorational elements and turns the board (mostly) grayscale.</span>

								<h3 style="grid-column: 1 / span 2;">Expansions</h3>

								<label for="setting-pizzaPolice">Blabla? </label>
								<input type="checkbox" name="setting-pizzaPolice" id="setting-pizzaPolice">
							</div>
						</div>
					</div>

					<div style="text-align: center;">
						<button id="btn-generateBoard">Generate Board</button>
						<button id="btn-createPDF" style="display:none;">Download PDF</button>
					</div>

					<div id="phaserContainer" style="text-align: center;">
					</div>
				</div>
			</section>

			<!-- General script for starting board generation, showing it correctly, and turning it into a PDF -->
			<script src="gamesites/boardgames/generalCanvasScript.js?v=1"></script>

			<!-- The specific settings for this game, such as size of the canvas -->
			<script>
				function generateGameConfig() {
					// TO DO: Custom settings for game config (read expansions and stuff)

					// Set proper size and title
					gameConfig.size = { 'width': 210*scaleFactor, 'height': 297*scaleFactor }
					gameConfig.orientation = 'portrait'
					gameConfig.gameTitle = 'The Curse of Coop'
				}
			</script>

			<script>
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

						var base = 'gamesites/the-curse-of-coop/';

						// TO DO: Load assets here
				    },

				    create: function() {
				    	this.setupBoard();
				    	this.generateBoard();
				    	this.visualizeBoard();
    				
    					convertCanvasToImage(this);
				    },

				    setupBoard: function() {
				    	// TO DO: Use this to set global properties (number of cells, number of locations, sizes of things, etc.)
				    	this.cfg = {};

				    	// TO DO: Also prepare lists (of all possible items, curses, etc.)
				    },

				    generateBoard: function() {

				    },

				    visualizeBoard: function() {

				    },
				});
			</script>
		</main>


<?php

require '../../footer.php';

?>

		