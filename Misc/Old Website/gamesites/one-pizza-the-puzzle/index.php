<?php
	require '../../default_headers.php';
?>
		<title>One Pizza The Puzzle &mdash; deliver one pizza before anyone else without crossing paths</title>
		<link rel="icon" type="image/png" href="gamesites/one-pizza-the-puzzle/favicon_moustache.png" />

		<!-- Default CSS stylesheet for all boardgame pages -->
		<link rel="stylesheet" type="text/css" href="gamesites/boardgames/boardGameStyles.css">

		<!-- TO DO: Remove fonts I didn't use (but save them somewhere for possible later use) -->
		<!-- Courgette: thick, somewhat cursive/fluid font -->
		<!-- <link href="https://fonts.googleapis.com/css2?family=Courgette&display=swap" rel="stylesheet"> -->

		<!-- Parisienne: extremely cursive and slanted handwriting font -->
		<!-- 'Parisienne', cursive -->
		<!-- <link href="https://fonts.googleapis.com/css2?family=Parisienne&display=swap" rel="stylesheet"> -->

		<!-- Leckerli One: slightly thicker and more consistent Courgette font -->
		<!-- Nunito: flexible workhorse font, good pairing -->
		<!-- 'Leckerli one', cursive -->
		<link href="https://fonts.googleapis.com/css2?family=Leckerli+One&family=Nunito:ital,wght@0,300;0,400;0,700;0,900;1,300;1,400;1,700;1,900&display=swap" rel="stylesheet"> 

		<!-- Font Awesome => for the pizza icons -->
		<script src="https://kit.fontawesome.com/d60575e6ff.js" crossorigin="anonymous"></script>

		<!-- Alternative: Pacifico -->

		<style type="text/css">

			h1, h2, h3, h4, h5, h6 {
				font-family: 'Leckerli One', cursive;
			}

			body {
				font-family: 'Nunito', sans-serif;
				background-color: #FFCD7E;
				background-image: url(https://i.imgur.com/j4grv8m.png);
				background-size: 100%;
			}

			input, button, select, option {
				font-family: 'Nunito', sans-serif;
			}

			a.btn, #gameButton {
				font-family: 'Leckerli One', cursive;
			}

			#gameButton {
				/*color: #9F9ADB;*/
				background-color: #452545;
				color: #FFFFFF;
			}

			#gameButton:hover {
				background-color: #f25fff;
				color: #040004;
			}

			a.download-btn, a.download-btn:visited {
				background-color: #472917;
				color: #FFFFFF;
			}

			a.download-btn:hover {
				background-color: #FF8B7E;
				color: #330000;
			}


			#gameSettings > div {
				background-color: #472917;
			}

			#btn-createPDF {
				font-weight: 900;
			    font-family: 'Leckerli One', cursive;
			    font-size: 24pt;
			    background-color: #1D3C6C;
			    padding: 20px;
			    margin: 10px;
			    color: #fcfffc;
			    border-radius: 10px;
			    box-sizing: border-box;
			    display: inline-block;
			    transition: background-color .3s,color .3s;
			    border-color: transparent;
			}

			#btn-createPDF:hover {
				cursor: pointer;
				background-color: #66A2FF;
				color: #030E1F;
			}


			#reviewContainer {
				display: grid;
				grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
				grid-column-gap: 10px;
				grid-row-gap: 10px;

				font-size: 24px;

				font-weight: 100;
				font-style: italic;
			}

			#reviewContainer > div {
				position: relative;
				z-index: -1;
			}

			#reviewRating {
				margin-top: -20px;
				color: #ea4620;
				font-style: normal;
				font-size: 30px;
			}


			h3 { 
				margin-bottom: -18px;
			}

			#introBox {
			    border-radius: 15px;
			    padding: 20px;
			}

			.bigHeaderImage {
				filter: none;
			}

			@media all and (max-width: 900px) {
				#introBox {
					 background-color: #FFCD7E;
				}

				#gameSettings {
					font-size: 12px;
				}

				body {
				    background-image: none;
				}
			}



			
		</style>
	</head>

	<body>
		<main>
			<section>
				<img src="https://i.imgur.com/MyxuzyE.png" class="bigHeaderImage" />
				<div class="autoCenter" style="position: relative; margin-top: -15vw;">
					<!-- <h1>One Pizza The Puzzle</h1> -->
					<p class="tagline" id="introBox">A <a class="link" href="boardgames#one_paper_games">One Paper Game</a> for 2&ndash;8 players about running your own pizza business. A raging rivalry, however, makes it impossible to cross paths with other pizza couriers without causing huge problems ...</p>
					<p class="tagline taglineData">Ages: everyone | Complexity: Low-Medium | Playtime: ~15 minutes per player </p>
					<p style="text-align: center;"><a href="https://drive.google.com/drive/folders/19oX1xwugq8ArnmKhe8kDO5fuZNPDTfKd" class="btn download-btn">Download</a></p>
				</div>
			</section>

			<section>
				<div class="autoCenter">
					<h2>What's the idea?</h2>
					<p style="text-align:center;">
						<img style="max-width: 100%;" src="https://i.imgur.com/1mpSTdW.gif">
					</p>
					
					<h3>Setup</h3>
					<p>Each player picks an empty building to start a shiny new pizza restaurant. You also receive one <em>pizza courier</em>, which is just a continuous line you will draw on the board during the game.</p>
					
					<h3>Gameplay</h3>
					<p>Each turn, you take one action for each courier you own: either <strong>Move</strong>, <strong>Eat</strong> or <strong>Reset</strong>.</p>
					
					<h3>Actions</h3>
					<p><strong>Move?</strong> Pick one of the shapes printed on the board. Now extend the line of your courier with that shape.</p>
					<ul class="fa-ul">
						<li><span class="fa-li"><i class="fas fa-pizza-slice"></i></span>If you pass an ingredient building, you get that ingredient!</li>
						<li><span class="fa-li"><i class="fas fa-pizza-slice"></i></span>If you pass a building with an order, you can deliver the pizza (if you have the ingredients) for money!</li>
					</ul>
					<p><strong>Eat?</strong> Devour an ingredient you own to execute a special power! Maybe you want to teleport through buildings, or you just want to annoy others by moving <em>their</em> courier in the wrong direction.</p>
					<p>But here's the real pizza problem: you may never cross another line, not even your own! So you guessed it ... </p>
					<p><strong>Reset?</strong> If you're stuck, you have to reset your courier back to base, for a severe penalty.</p>
					
					<h3>Objective</h3>
					<p>Plan ahead, take the smartest routes, and you might be the first to earn <strong>10 money</strong>. But that's only <em>one piece of the puzzle</em> ...</p>
				</div>
			</section>

			<section>
				<div class="autoCenter">
					<h2>What do I need?</h2>
					<p>Three simple steps:</p>
					<ul class="fa-ul">
						<li><span class="fa-li"><i class="fas fa-pizza-slice"></i></span>Generate a random game board below and print it.</li>
						<li><span class="fa-li"><i class="fas fa-pizza-slice"></i></span>Read pages 1,2 and 4 of the rules. (Click "Download" to find the PDF.)</li>
						<li><span class="fa-li"><i class="fas fa-pizza-slice"></i></span>Grab some pens and some friends. (Using pens with different colors is preferred, but not required.)</li>
					</ul>
					<p>Voila, you can play.</p>
					<p><strong>Tip for (Quick) Teaching:</strong> explain the "Move" action in detail, as that is the core of the game. Say the "Reset" action will be explained whenever someone gets stuck. Then just place the list of ingredients on the table so everyone can look up their power when you "Eat" them. Start playing!</p>
				</div>
			</section>

			<section>
				<div class="autoCenter">
					<h2>Reviews</h2>
					<div id="reviewContainer">
						<div><p>&ldquo;This game made me realize several things: I love food, I cannot draw straight lines, and I was born to be a ruthless pizza courier.&rdquo;</p><p id="reviewRating">&starf; &starf; &starf; &starf; &starf;</p></div>
						<div><p>&ldquo;I suspect 50% of the players will not appreciate the cheesy pun in the title. As they say: tomatoes before swine.&rdquo;</p><p id="reviewRating">&starf; &starf; &starf; &starf;</p></div>
						<div><p>&ldquo;A steaming hot game with delicious decisions, tasty competitiveness, topped with maze-like mechanics and a side dish of pizza parcour possibilities.&rdquo;</p><p id="reviewRating">&starf; &starf; &starf; &starf; &starf;</p></div>
					</div>
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
					<p>Click "Generate Board". Save the image and print it.</p>

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

								<label for="setting-boardVariation">Variation? </label>
								<select name="setting-boardVariation" id="setting-boardVariation">
									<option value="0">None</option>
									<option value="1">Small</option>
									<option value="2" selected>Medium</option>
									<option value="3">Large</option>
									<option value="4">Extreme</option>
								</select>

								<span class="settingRemark">Higher means more curving streets, irregular building shapes, and distinct areas. Choose whatever you prefer.</span>

								<label for="setting-inkFriendly">Ink Friendly? </label>
								<input type="checkbox" name="setting-inkFriendly" id="setting-inkFriendly">

								<span class="settingRemark">Removes many decorational elements and turns the board (mostly) grayscale.</span>

								<h3 style="grid-column: 1 / span 2;">Expansions</h3>

								<label for="setting-pizzaPolice">Pizza Police? </label>
								<input type="checkbox" name="setting-pizzaPolice" id="setting-pizzaPolice">

								<label for="setting-treacherousTraffic">Treacherous Traffic? </label>
								<input type="checkbox" name="setting-treacherousTraffic" id="setting-treacherousTraffic">

								<label for="setting-ingeniousIngredients">Ingenious Ingredients? </label>
								<input type="checkbox" name="setting-ingeniousIngredients" id="setting-ingeniousIngredients">

								<label for="setting-preposterousPlaces">Preposterous Places? </label>
								<input type="checkbox" name="setting-preposterousPlaces" id="setting-preposterousPlaces">
							</div>
						</div>
					</div>

					<div style="text-align: center;">
						<button id="gameButton">Generate Board</button>
						<button id="btn-createPDF" style="display:none;">Download PDF</button>
					</div>

					<div id="phaserContainer">
					</div>

					<p>There are <strong>four expansions</strong> for this game. As usual, I recommend you first learn the base game, then try out each expansion individually (in no particular order), before combining it all into the ultimate experience.</p>
					<p>Although highly unlikely, it's possible (with the expansions enabled) that some of the starting positions ( = empty buildings) are unfairly placed. So, before printing, always do a quick check to see if every starting position seems okay.</p>
				</div>
			</section>

			<section>
				<div class="autoCenter">
					<h2>Feedback & Credits</h2>
					<p>As always, any and all feedback is welcome! Let me know about your positive and negative experiences at: <a href="mailto:askthepanda@pandaqi.com">askthepanda@pandaqi.com</a></p>
					<p>The whole game was made by myself: concept, rules, visuals, and the code that generates those random boards.</p>
					<p>Interested in how such a development process goes? Check out my devlogs at <a href="https://pandaqi.com/blog/one-pizza">Pandaqi Blog</a>. That page contains all the devlogs, but here are links to the specific first articles:</p>
					<ul class="fa-ul">
						<li><span class="fa-li"><i class="fas fa-pizza-slice"></i></span><a href="https://pandaqi.com/blog/one-pizza/devlog-one-pizza">[Devlog] One Pizza</a> => about the general process, issues I faced, how I solved them, changes and different versions of the game, explanations about what works (and doesn't work) for boardgames, ...</li>
						<li><span class="fa-li"><i class="fas fa-pizza-slice"></i></span><a href="https://pandaqi.com/blog/one-pizza/technical-devlog-one-pizza">[Technical Devlog] One Pizza</a> => TO DO (Will explain the algorithms and code behind randomly generating complex game boards, which are still balanced and fun to play at all times.)</li>
					</ul>
					<p>The fonts used are <strong>Leckerli One</strong> (because it just looked like a font you'd find on a pizza box) and <strong>Nunito</strong> (the body font&mdash;minimal, readable, available in many different weights)</p>
					<p>All visuals were drawn in <strong>Affinity Designer</strong> as vector art, the game board generated using <strong>JavaScript</strong> and <strong>Phaser v3</strong> game engine.</p>
				</div>
			</section>

			<!-- Several dictionaries/lists containing all special elements from expansions and their properties -->
			<script src="gamesites/one-pizza-the-puzzle/expansionDictionaries.js"></script>

			<!-- The whole code for starting, executing, and finalizing board generation -->
			<script src="gamesites/one-pizza-the-puzzle/boardGeneration.js?c=12"></script>
		</main>


<?php

require '../../footer.php';

?>

		