<?php
	require '../../default_headers.php';
?>
		<title>Wondering Witches&mdash;brew potions, deduce recipes, and enchant the poorly communicating High Witch</title>
		<link rel="icon" type="image/png" href="gamesites/wondering-witches/favicon.png" />

		<!--
		POSSIBLE FONTS:
		* Arimo (just basic body font)
		* Mali (more playful)
		* Niconne (more cursive)
		* Rochester (also more cursive)
		* Bad Script (cursive, but thinner, less pronounced)
		-->

		<link href="https://fonts.googleapis.com/css2?family=Niconne&display=swap" rel="stylesheet">
		<link href="https://fonts.googleapis.com/css2?family=Mali:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet"> 

		<!--
		COLOR SCHEME

		Dark Purple: #4B2142
		Reddish Purple: #74226C
		Desaturated purple: #816E94
		Greyish Blue: #8CC7A1
		Blueish: #97EAD2

		-->

		<!-- Default CSS stylesheet for all boardgame pages -->
		<link rel="stylesheet" type="text/css" href="gamesites/boardgames/boardGameStyles.css">

		<style type="text/css">

			h1, h2, h3, h4, h5, h6 {
				font-family: 'Niconne', cursive;
			}

			.autoCenter h2 {
				margin-bottom: 0px;
			}

			body {
				font-family: 'Mali', cursive;
				background-color: #4B2142;
				color: white;
			}

			.tagline {
				color: rgba(255,255,255,0.8);
			} 

			a, a:visited {
				color: #97EAD2;
			}

			a.btn, a.btn:visited {
				font-family: 'Niconne';
				background-color: #536ACC;
				color: black;
			}

			a.btn:hover {
				background-color: rgb(0, 0, 100);
				color: rgb(175, 175, 255);
			}

			a.download-btn, a.download-btn:visited {
				font-size: 48px;
			}

			a.event-btn, a.event-btn:visited, a.download-btn, a.download-btn:visited {
				background-color: #74226C;
				color: #97EAD2;
				box-shadow: 0 0 10px purple;
			}

			a.event-btn:hover, a.download-btn:hover {
				background-color: #97EAD2;
				color: #74226C;
			}

			a.solution-btn, a.solution-btn:visited {
				background-color: #FF3333;
				color: white;
				box-shadow: 0 0 10px red;
				font-size: 16px;
				padding: 5px;
				border-radius: 2px;
				width: 100%;
				margin: 0px;
			}

			a.solution-btn:hover {
				background-color: white;
				color: #FF3333;
			}

			ul {
				margin-top:-15px;
			}

			select {
				padding: 5px;
			}

			.bigHeaderImage {
				max-width:100%; 
				border-bottom: 5px solid rgba(255,255,255,0.3);
				filter: none;
			}

			#unfoldExplanation {
				scroll-margin: 20px;
			}

			#unfoldExplanation h3 {
				font-size: 30px;
				margin-bottom: 15px;
			}

			#ingredientClicker {
				display: grid;
				/* 120px regular size, 4px for margin/padding */
				grid-template-columns: repeat(auto-fit, minmax(124px, 1fr));
				/*grid-template-rows: repeat(auto-fill, minmax(300px, 1fr));*/
				grid-column-gap: 10px;
				grid-row-gap: 10px;
				width: 100%;
				box-sizing: border-box;
			}

			#currentCauldron .oneIngredient {
				width: 100%;
				background-color: rgba(255, 255, 255, 0.8);
				color: black;
				
				margin-top: 10px;
				margin-bottom: 10px;

				box-sizing: border-box;
				padding: 10px;
				border-radius: 5px;

				display: flex;
				align-content: center;
				justify-content: space-between;
				align-items: center;

				scroll-margin: 20px;
			}

			#potionResult {
				text-align: center;
				background-color: rgba(0,0,0,0.3);
				padding: 40px;
				border-radius: 5px;
			}

			.winMessage {
				color: rgb(100, 255, 100);
				font-size: 32px;
			}

			#effectsInPlay, #potionResult, #usePotionButton, #currentCauldron, #ingredientClicker, #effectExplanations {
				display: none;

				/* to disable annoying accidental selection of buttons/text */
				-webkit-touch-callout: none; /* iOS Safari */
			    -webkit-user-select: none; /* Safari */
			     -khtml-user-select: none; /* Konqueror HTML */
			       -moz-user-select: none; /* Old versions of Firefox */
			        -ms-user-select: none; /* Internet Explorer/Edge */
			            user-select: none; /* Non-prefixed version, currently
			                                  supported by Chrome, Opera and Firefox */
			}

			#effectExplanations {
				border-left: 20px solid white;
				padding-left: 10px;
				box-sizing: border-box;
				background-color: rgba(0,0,0,0.3);
				padding: 10px;
				border-radius: 5px;
			}

			.effectName {
				padding: 5px;
				background-color: rgba(0,0,0,0.3);
				margin: 5px;
				cursor: pointer;
				display: inline-block;
			}

			.specialCellExplainer {
				display: flex;
				justify-content: center;
				align-items: center;
				align-content: center;
				box-sizing: border-box;
			}

			.specialCellExplainer span {
				padding: 10px;
				box-sizing: border-box;
			}

			.specialCellSprite {
				background: url(gamesites/wondering-witches/SpecialCellSpritesheet.png) no-repeat;

				width: 120px;
				height: 120px;
				background-size: cover;
				display: inline-block;

				image-rendering: pixelated;
			}

			.ingSprite, .ingSprite-small {
		        /* load spritesheet once */
		        background: url("https://i.imgur.com/wC9G0UE.png") no-repeat;

		        /* on the element itself, we move the background-position along the negative x-direction to find the right sprite */

		        /* set size and make sure the background stretches to fill the height completely */
		        width: 120px;
		        height: 120px; 
		        background-size: cover;
		        margin: 4px;
		        display: inline-block;

		        /* some browsers (such as Chrome) have a tendency to blur image when scaling them up or down => this fixes that */
		        image-rendering: pixelated;
        		/*image-rendering: -moz-crisp-edges;
        		image-rendering: crisp-edges;*/
		     }

		     .ingSprite-small {
		     	width: 60px;
		     	height: 60px;
		     }

		    .ingButton {
		    	background-color: rgba(255,255,255,0.8);
		    	border: none;
		    	border-radius: 2px; 
		    	box-shadow: 0 0 10px black;

		    	padding: 0;
		    	text-align: center;
		    }

			@media all and (max-width: 600px) {
				.ingredientName-inCauldron {
					display: none;
				}
			}
			
		</style>
	</head>

	<body>
		<main>
			<img src="https://i.imgur.com/6v6CDTh.png" class="bigHeaderImage" />

			<section>
				<div class="autoCenter">
					<p class="tagline">Ten ingredients, one correct combination.</p>
					<p class="tagline">A cooperative <a href="boardgames#one_paper_games">One Paper Game</a> for 1&ndash;8 players about finding the right potion, in a world where ingredients can have wonderous effects and the High Witch is terrible at communicating.</p>
					<p class="tagline taglineData">Requirements: A blank paper! | Ages: everyone | Complexity: Easy | Playtime: 30-60 minutes </p>
					<p style="text-align: center;"><a href="https://drive.google.com/open?id=1y4WescX98VLllbV7FqojADUnAr5fc8Vx" class="btn download-btn">Download</a></p>
				</div>
			</section>

			<section>
				<div class="autoCenter">
					<h2>How can I play?</h2>
					<p>To play this game, you only need a <strong>blank sheet of paper</strong> and <strong><a href="wondering-witches#board">this part</a></strong> of this website.</p>
					<p>The rules can be downloaded by clicking the Download button. They are only 4 pages for your first game, including nice images and examples, and a large font (because I like large fonts).</p>
					<p>(If you don't like blank papers, there is a game board you can download and print. And if you don't like boardgames with an online component, don't worry, there is an offline version!)</p>

					<h2>How does it work?</h2>
					<p style="text-align:center;"><a href="#" id="unfoldExplanationBtn">Click here</a> for an (extremely short) overview of the game rules.</p>
					<span id="unfoldExplanation" style="display: none;">
						<h3>Objective</h3>
						<ul>
							<li>You WIN by recreating the secret recipe (the correct ingredients in the correct order)</li>
							<li>You LOSE if the whole board is full</li>
						</ul>
						<h3>Setup</h3>
						<ul>
							<li>Fold the paper in half five times, to divide the page into 32 "cells"</li>
							<li>Click the "generate board" button (lower on the page) to get a starting setup. Copy that to the paper.</li>
							<li>Scroll further down and click "start game" to make the computer generate a <em>random puzzle</em></li>
						</ul>
						<h3 style="margin-bottom: -20px;">What can I do?</h3>
						<p>All players get their own piece of the witch garden and take turns simultaneously. You can <em>plant</em>, <em>grow</em> or <em>pluck</em> ingredients (to use them in a potion).</p>
						<p>When a cauldron is FULL, you must use or "test" the potion inside. Copy the ingredients to this website, and it will tell you the result!</p>
						<p>For example, it might tell you that two ingredients were in the correct order. Or that some ingredients have a special effect. Or you might accidentally poison your friend.</p>
						<p>Brew your potions wisely ... and you might just discover the secret combination.</p>
					</span>
				</div>

				<script>
					document.getElementById('unfoldExplanationBtn').addEventListener('click', function(ev) {
						ev.preventDefault();

						var curState = document.getElementById('unfoldExplanation').style.display;
						var newState = 'none';

						if(curState == 'none') {
							document.getElementById('unfoldExplanation').scrollIntoView();
							newState = 'block';
						}

						document.getElementById('unfoldExplanation').style.display = newState;
					})
				</script>
			</section>

			<section>
				<div class="autoCenter">
					<a name="board"></a>
					<h2>Random board</h2>
					<p>Click the button below to randomly generate a game board! (Check the rules to see how everything works.)</p>
					<p>Simply copy the gardens, cauldrons and ingredients below to your actual paper. I've already flipped the back side for you, so you can just copy that immediately (to the backside of the paper) as well.</p>
					<p>If you've enabled special cells (higher difficulties), their explanation will appear underneath the board.</p>
					<p id="playerCountForm" style="text-align: center;">
						<span style="display:block;">
							<label for="difficulty" style="margin-right:15px;">Difficulty?</label>
							<select id="difficulty">
								<option value="0">First Game</option>
								<option value="1">Beginner</option>
								<option value="2">Amateur Witch</option>
								<option value="3">Spice Sorcerer</option>
								<option value="4">Potion Master</option>
								<option value="5">High Witch</option>
							</select>
						</span>

						<span style="display:block;">
							<label for="playerCount" style="margin-right:15px;">How many players?</label>
							<select id="playerCount">
								<option value="1">1</option>
								<option value="2">2</option>
								<option value="3">3</option>
								<option value="4">4</option>
								<option value="5">5</option>
								<option value="6">6</option>
								<option value="7">7</option>
								<option value="8">8</option>
							</select>
						</span> 
					</p>
					<p style="text-align: center;"><a class="btn event-btn" id="generateBoardBtn">Generate Board</a></p>
					<div id="phaserContainer">
					</div>
					<span id="specialCellContainer">
					</span>
				</div>

				<!-- Load Phaser 3.22.0 via CDN -->
			    <!-- (The actual Phaser game node will only be created and started below, in a custom script -->
			    <script src="https://cdn.jsdelivr.net/npm/phaser@3.22.0/dist/phaser.min.js"></script> 

			    <!-- Load the game file responsible for generating a random board -->
			    <script src="gamesites/wondering-witches/boardGeneration.js"></script>
			</section>

			<section>
				<div class="autoCenter">
					<a name="high-witch"></a>
					<h2>The High Witch</h2>
					<p class="onlineWitchExplanation">Welcome to the online High Witch! Click the button below to start a new game.</p>
					<p class="onlineWitchExplanation">(<em>Huh, what's this?</em> This websites generates a random puzzle for you to solve. Read the rules for the full explanation.)</p>
					<p style="text-align: center;"><a class="btn event-btn" id="usePotionButton">Use Potion</a></p>
					<p><div id="potionResult"></div></p>
					<p><div id="currentCauldron"></div></p>
					<p><div id="ingredientClicker"></div></p>
					<p style="text-align: center;"><a class="btn event-btn" id="eventButton">Start Game</a></p>
					<p><div id="effectsInPlay"></div></p>
					<p><div id="effectExplanations"></div></p>
					<p id="solutionRevealer" style="text-align: center; display: none;">Danger Zone: <a class="btn solution-btn" id="solutionButton">I've lost &mdash; show me the solution!</a></p>
				</div>
			</section>

			<!-- Load the file responsible for making the game interactive (and actually generating the puzzle) -->
			<script src="gamesites/wondering-witches/interactiveGame.js"></script>

			<section>
				<div class="autoCenter">
					<h2>Feedback & Credits</h2>
					<p>If you've tried the game, let me know your thoughts! Mail me at: <a href="mailto:askthepanda@pandaqi.com">askthepanda@pandaqi.com</a></p>
					<p>All parts of the game were made by me, except for the fonts. These are <strong>Niconne</strong> for headings and <strong>Mali</strong> for the body text.</p>
					<p>The computer parts of this game were made using standard website code (HTML/CSS/JavaScript) and the Phaser (v3) framework </p>
					<p>As always, I wrote two devlogs about the development process of this game:</p>
					<ul>
						<li><a href="https://pandaqi.com/blog/wondering-witches/devlog-wondering-witches">[Devlog] Wondering Witches</a> => about the whole process for the (board)game</li>
						<li><a href="https://pandaqi.com/blog/wondering-witches/technical-devlog-wondering-witches">[Technical Devlog] Wondering Witches</a> => about the technical side, programming this website</li>
					</ul>
				</div>
			</section>
		</main>

		

<?php

require '../../footer.php';

?>

		