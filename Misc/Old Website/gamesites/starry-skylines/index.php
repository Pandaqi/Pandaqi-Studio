<?php
	require '../../default_headers.php';
?>
		<title>Starry Skylines &mdash; build your new city in space, together</title>
		<link rel="icon" type="image/png" href="gamesites/starry-skylines/favicon.png" />

		<!-- More fantasy-like fonts (didn't become the theme of this game eventually, still nice) -->
		<!-- https://fonts.google.com/specimen/Fondamento -->
		<!-- https://fonts.google.com/specimen/Grenze+Gotisch -->

		<!-- Titillium Web; body font -->
		<link href="https://fonts.googleapis.com/css2?family=Titillium+Web:ital,wght@0,200;0,300;0,400;0,600;0,700;0,900;1,200;1,300;1,400;1,600;1,700&display=swap" rel="stylesheet"> 
		<!-- Montserrat Subrayada: header font -->
		<link href="https://fonts.googleapis.com/css2?family=Montserrat+Subrayada:wght@400;700&display=swap" rel="stylesheet"> 

		<!-- Default CSS stylesheet for all boardgame pages -->
		<link rel="stylesheet" type="text/css" href="gamesites/boardgames/boardGameStyles.css">

		<!-- Color scheme (I just needed some dark space-colors) 
	
		Rich Black: 040F0F
		Outer Space Crayola: 2D3A3A
		Forest Green: 248232
		Green Pantone: 2BA84A
		Baby Powder: FCFFFC

		For a bit more color accents: pink/reddish => F4C095

		Other possible accents:
		Bright Pink: EA638C
		Light Yellow: FFFBDB
		Red Salsa: FB3640
		Blue NCS: 0094C6
		Citrine (a nicer yellow, I think): E8D33F
		Pumpkin: FA7921
		Purple Navy: 67597A


		-->

		<style type="text/css">

			h1, h2, h3, h4, h5, h6 {
				font-family: 'Montserrat Subrayada', sans-serif;
			}

			.autoCenter h2 {
				margin-bottom: 0px;
			}

			body {
				font-family: 'Titillium Web', sans-serif;
				color: #FCFFFC;
				background-color: #040F0F;
				background-image: url(https://i.imgur.com/P4oR1Xw.jpg);
				background-size: 100%;
			}

			.tagline {
				color: #FCFFFC;
			} 

			a {
				color: #E8D33F;
			}

			a.btn, a.btn:visited {
				font-family: 'Montserrat Subrayada', sans-serif;
				background-color: #248232;
				color: #FCFFFC;
			}

			a.btn:hover {
				background-color: rgb(0, 0, 100);
				color: rgb(175, 175, 255);
			}

			a.download-btn, a.download-btn:visited {
				background-color: #F4C095;
				color: #040F0F;
				font-size: 20pt;
			}

			a.download-btn:hover {
				background-color: #040F0F;
				color: #F4C095;
			}

			ul {
				margin-top:-15px;
			}

			.bigHeaderImage {
				filter: none;
				
				-webkit-mask-image: -webkit-linear-gradient(top, white, white 90%, transparent);
			    mask-image: linear-gradient(to bottom, white, white 90%, transparent);
			}

			#gameSettings > div {
				background-color: rgba(255, 255, 255, 0.2);
				box-shadow: 0 0 5px #FCFFFC;
			}

			.optionAI {
				display: flex;
				justify-content: space-between;
				flex-direction: row;
				align-items: center;
				align-content: center;
			}

			.failureAIButton {
				background: #300;
				border: none;
				color: red;
				font-weight: bold;
				font-size: 150%;
				border-radius: 5px;
			}

			.failureAIButton:hover {
				background: pink;
				color: #111111;
				box-shadow: 0 0 5px black;
				cursor: pointer;
			}

			#gameOptions {
				display: flex;
				width: 100%;
				flex-direction: row;
			}

			#gameOptions > div {
				width: 100%;
				background-color: #248232;
				border-radius: 10px;
				margin: 20px;
				padding: 10px;
				box-sizing: border-box;
			}

			#gameOptions > div > .numberText, #gameOptions > div > div > .numberText {
				text-align: center;
				font-size: 43px;
				font-family: 'Montserrat Subrayada', sans-serif;
				background-color: rgba(0,0,0,0.25);
				border-radius: 10px;
				margin: 10px;
				
				margin-top: 5px;
				margin-bottom: 5px;

				box-sizing: border-box;

				padding-left: 10px;
				padding-right: 10px;
			}

			#gameOptions > div > .peopleIcon, #gameOptions > div > div > .peopleIcon {
				text-align: center;
				background-color: #FA7921;
				border-radius: 10px;
				margin: 10px;
				margin-top: 5px;
				margin-bottom: 5px;
				padding: 10px;
				color: #040F0F;

				padding-bottom: 0px;
			}

			#gameOptions > div > .peopleIcon > img, #gameOptions > div > div > .peopleIcon > img {
				width: 36px;
			}

			#gameOptions > div > .resourceLineIcon, #gameOptions > div > div > .resourceLineIcon {
				text-align: center;
				background-color: #0094C6;
				border-radius: 10px;
				margin: 10px;
				margin-top: 5px;
				margin-bottom: 5px;
				padding: 10px;
				color: #FCFFFC;

				padding-bottom: 0px;
			}

			#gameOptions > div > .resourceLineIcon > img, #gameOptions > div > div > .resourceLineIcon > img {
				width: 36px;
			}

			#gameOptions > div > .effectIcon, #gameOptions > div > div > .effectIcon {
				margin: 10px;
				
				margin-top: 5px;
				margin-bottom: 5px;

				padding: 10px;
				text-align: center;
				
				border-radius: 10px;
				color: #040F0F;
			}

			.buttonType-buildings {
				background-color: rgba(255,255,255,0.5);
			}

			.buttonType-effects {
				background-color: #FB3640;
			}

			#gameOptions > div > .effectIcon:hover, #gameOptions > div > div > .effectIcon:hover {
				background-color: #F4C095;
				cursor: pointer;
			}

			#eventContainer > div {
				padding-left: 50px;
				padding-right: 50px;
				box-sizing: border-box;
			}

			#eventContainer h2 {
				margin-top: 12px;
			}

			#gameOptions > #eventContainer {
				background-color: #E8D33F ;
				color: black;
			}


			#gameButton {
				font-family: 'Montserrat Subrayada', sans-serif;
				font-size: 24pt;

				background-color: #248232;
				padding: 20px;
				margin: 10px;

				color: #FCFFFC;

				border-radius: 10px;
				box-sizing: border-box;
				display: inline-block;

				transition: background-color 0.3s, color 0.3s;

				border-color: transparent;
			}

			#gameButton:hover {
				background-color: #F4C095;
				color: #040F0F;
				cursor: pointer;
			}

			.probabilityText {
				color: rgba(255,255,255,0.5);
			}

			.effectTypeText {
				font-weight: 100;
			}

			/* all styles for the different effect categories */
			.typeEnvironment {
				color: #2BA84A;
			}

			.typeGovernment {
				color: gray;
			}

			.typeEntertainment {
				color: #FB3640;
			}

			.typeBuilding {
				color: brown;
			}

			.typeEffect {
				color: #EA638C;
			}

			.typeStreet {
				color: #FA7921;
			}

			.typeA {
				color: #67597A;
			}

			.typeB {
				color: #0094C6;
			}

			@media all and (max-width: 600px) {
				#gameOptions {
					flex-direction: column;
				}

				#gameOptions > div {
					margin: 0px;
					margin-bottom: 20px;
				}

				#eventContainer > div {
					padding-left: 0px;
					padding-right: 0px;
				}

				.download-btn {
					font-size: 16pt;
				}
			}
			
		</style>
	</head>

	<body>
		<main>
			<section>
				<img src="https://i.imgur.com/mdQ0jDg.png" class="bigHeaderImage" />
				<div class="autoCenter">
					<!-- <h1>Starry Skylines</h1> -->
					<p class="tagline">A <a href="boardgames#one_paper_games" style="color:#248232;">One Paper Game</a> for 1&ndash;9 players about simultaneously building a city in space.</p>
					<p class="tagline taglineData">Ages: everyone | Complexity: Low | Playtime: 30-60 minutes </p>
					<p style="text-align: center;"><a href="https://drive.google.com/drive/folders/1_CkFN2QRv_amGofQcfP9RkGQgiZj9HXh" class="btn download-btn">Download</a></p>
				</div>
			</section>

			<section>
				<div class="autoCenter">
					<h2>How to play</h2>
					<p style="text-align:center;"><img src="https://i.imgur.com/sZqDM0n.gif" style="max-width:100%;background-color: white;" /></p>
					<p>Players try to build the nicest neighbourhood on a newly discovered planet and score the most points. The problem? Your opponents are doing the same and invading your precious space!</p>
					<p>Each round, this website presents three new options. Each player must pick one of the options and execute it.</p>
					<p>An option can contain <em>buildings</em> to place, <em>people</em> to add to your buildings, a <em>special effect</em> to execute or a <em>street number</em> to place.</p>
					<p>Play continues until the board is full or a player has been unable to do a move for several turns.</p>
					<p>Count your people, count your buildings, get awards for special achievements, and voila &mdash; the player with the most points wins!</p>
				</div>
			</section>

			<section>
				<div class="autoCenter">
					<h2>What do I need?</h2>
					<p>You only need to grab a single sheet of paper (and some pens), fold it six times, and fire up this website!</p>
					<p>Also, of course, read the rulebook. (Only until page 4, after that comes the campaign with higher difficulties.)</p>
					<p>After a quick setup, you can immediately play. What are you waiting for?</p>
					<p>This website will handle everything for you and will show explanations for all the different buildings and mechanics (if you click on them).</p>
				</div>
			</section>

			<section>
				<div class="autoCenter">
					<a name ="game"></a>
					<h2>Play the game!</h2>
					<p>Once you've found a piece of paper and read the rules, you'll need this part of the website.</p>
					<p>At the start of each turn, press the button to generate three new options. Each player must pick exactly one option and execute it!</p>
					<p>Tip: click/tap an effect to see what it does!</p>
					<p>Alternatively, follow this link for an easy to search list with all possible effects/buildings: <a target="_blank" href="https://pandaqi.com/gamesites/starry-skylines/componentList.php">Show All Components</a> This game has 100+ effects and buildings on the highest difficulty, so don't worry about forgetting them!</p>

					<div id="gameSettings">
						<div>
							<div>
								<label for="setting-playerCount">Number of Players? </label>
								<select name="setting-playerCount" id="setting-playerCount">
									<option value="1">1</option>
									<option value="2">2</option>
									<option value="3">3</option>
									<option value="4">4</option>
									<option value="5">5</option>
									<option value="6">6</option>
									<option value="7">7</option>
									<option value="8">8</option>
								</select>
								
								<label for="setting-planet">Planet? </label>
								<select name="setting-planet" id="setting-planet">
									<option value="Learnth">Learnth (first game)</option>
									<option value="Uronus">Uronus</option>
									<option value="Marsh">Marsh</option>
									<option value="Yumpiter">Yumpiter</option>
									<option value="Meercury">Meercury</option>
									<option value="Intervenus">Intervenus</option>
									<option value="Pluto">Pluto</option>
									<option value="Naptune">Naptune</option>
								</select>
								
								<label for="setting-startingSetup">Create Starting Setup? </label>
								<input type="checkbox" name="setting-startingSetup" id="setting-startingSetup">

								<label for="setting-manualCombo">Play handpicked combination? </label>
								<select name="setting-manualCombo" id="setting-manualCombo">
									<option value="">-- ignore --</option>
									<option value="Nature">Nature</option>
									<option value="Leadership">Leadership</option>
									<option value="Resources">Resources</option>
									<option value="Entertainment">Entertainment</option>
									<option value="Chaotic">Chaotic</option>
								</select>

								<span class="settingRemark" style="max-width: 500px;">Choose a handpicked combination of planets if you want to follow a particular theme. Only use this if you've read the rules for all planets before.</span>
							</div>
						</div>
					</div>

					<div id="phaserContainer" style="text-align: center;">
					</div>

					<div id="gameOptions">

					</div>

					<div id="gameExplanations">
					</div>

					<div style="text-align: center;">
						<button id="gameButton">Start Game</button>
					</div>
				</div>
			</section>

			<section>
				<div class="autoCenter">
					<h2>Feedback</h2>
					<p>Found a mistake? Anything unclear? Ideas for improvements/expansions?</p>
					<p>Don't hesitate to contact me: <a href="mailto:askthepanda@pandaqi.com">askthepanda@pandaqi.com</a></p>
					<p>This game is absolutely <strong>huge</strong> (both in terms of content and possibilities), so I am sure the game will be updated over time and other people will have loads of feedback.</p>
					<p>(For example, in an earlier version, someone told me that fast travel stations appeared way too often, especially because they aren't always useful. Feedback like that is awesome and will only improve these games!)</p>
					<p>I make these games, for free, to give everyone the opportunity to enjoy games together (as easy and inexpensive as possible). So any feedback is always welcome.</p>
					<p>I've also written a detailed devlopment log about the whole process of creating this game: <a href="http://pandaqi.com/blog/starry-skylines/devlog-starry-skylines">[Devlog] Starry Skylines</a></p>
				</div>
			</section>

			<section>
				<div class="autoCenter">
					<h2>Credits</h2>
					<p>This game was fully created by myself (Pandaqi): graphics, rules, website, the whole thing. (I make loads of professional board games and video games, check them out!)</p>
					<p>However, it is <em>heavily inspired</em> by the boardgame <a href="https://boardgamegeek.com/boardgame/233867/welcome">Welcome To ...</a>. If you like this game, make sure to check that one out as well!</p>
					<p>Fonts are freely available from Google Fonts. I use <a href="https://fonts.google.com/specimen/Titillium+Web">Titillium Web</a> for the body text and <a href="https://fonts.google.com/specimen/Montserrat+Subrayada">Montserrat Subrayada</a> for the headers. (Because the first font looked "space-y" but was also nicely legible, whilst the second font looked like the letters were skylines. Perfect!)</p>
					<p>In case you were wondering what the game looks like when playing, here are some of our finished papers from playtest sessions:</p>
					<p><img src="https://i.imgur.com/z9lu2qh.jpg" style="max-width: 100%;" /></p>
					<p style="opacity:0.5;">(Yeah, we couldn't find any white paper, therefore we used yellow ones. This is a section of the campaign I played with two players; there are more games on the backside of these papers.)</p>
				</div>
			</section>

			<!-- Load the huge lists with all possible effects/buildings/etc. -->
			<script src="gamesites/starry-skylines/componentLibrary.js"></script>

			<!-- Load the main game interface (display options, events, buttons, etc.) -->
			<script src="gamesites/starry-skylines/mainGame.js"></script>

			<!-- Load Phaser 3.24.0 -->
			<script src="https://cdn.jsdelivr.net/npm/phaser@3.24.0/dist/phaser.min.js"></script>

			<!-- Load the Phaser game, which generates the random starting board/setup -->
			<script src="gamesites/starry-skylines/boardGeneration.js"></script>
		</main>

		

<?php

require '../../footer.php';

?>