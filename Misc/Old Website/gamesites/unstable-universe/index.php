<?php
	require '../../default_headers.php';
?>
		<title>Unstable Universe &mdash; the only boardgame where you're allowed to cut the paper into pieces</title>
		<link rel="icon" type="image/png" href="gamesites/unstable-universe/favicon.png" />

		<!-- Default CSS stylesheet for all boardgame pages -->
		<link rel="stylesheet" type="text/css" href="gamesites/boardgames/boardGameStyles.css">

		<!-- SciFly Sans font -->
		<link rel="stylesheet" type="text/css" href="gamesites/unstable-universe/customFonts.css">

		<!-- Font Awesome => I'm experimenting with adding more icons on the website and rules -->
		<script src="https://kit.fontawesome.com/d60575e6ff.js" crossorigin="anonymous"></script>

		<style type="text/css">

			/*
			FONTS?

			These are all soft/cuddly fonts that also look space-like (and are legible):; 
			Gigar
			Rampung
			SciFly-Sans
			Nemesia-Bold
			Merge-one

			This website is nice:
			URL: https://www.whatfontis.com/NMY_Filson-Soft-Regular.similar

			(gives list of fonts similar to a pro font I really like but cannot afford)
			*/

			h1, h2, h3, h4, h5, h6 {
				font-family: 'SciFly';
			}

			body {
				font-family: 'SciFly';
				background-color: #C2DDF7;
				background-image: url(https://i.imgur.com/dGXlnMW.png);
				background-size: 100%;
			}

			div.autoCenter {
				max-width: 650px;
			}

			h3 {
				margin-bottom: -18px;
			}

			a.link {
				color: #248232;
				border-bottom: 2px solid;
				text-decoration: none;
				transition: color 0.3s, background-color 0.3s;
			}

			a.link:hover {
				color: #E33D3D;
			}

			a.btn, a.btn:visited, button.btn {
				font-family: 'SciFly';
			}

			#gameSettings > div {
				background-color: #154558;
			}

			#reviewContainer {
				display: grid;
				grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
				grid-column-gap: 10px;
				grid-row-gap: 10px;

				font-size: 24px;
				color: gray;
			}

			#reviewContainer > div {
				background-color: #C2DDF7;
				position: relative;
				z-index: -1;
			}

			#reviewRating {
				margin-top: -20px;
				color: #6d6d02;
			}

			#gameButton {
				font-family: 'SciFly';
			}

			#btn-createPDF {
				font-weight: 900;
			    font-family: 'SciFly', sans-serif;
			    font-size: 24pt;
			    background-color: #FF6666;
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
				background-color: #FFAAAA;
				color: #111111;
			}

			.bigHeaderImage {
				filter: none;
				border-bottom: 5px solid  #E33D3D;
			}

			#tagContainer {
				margin-top: -10vw;
				background-color: #C2DDF7;
				position: relative;
				border-top:  5px solid #E33D3D;
				border-radius: 0.5em;
			}

			a.download-btn, a.download-btn:visited {
				background-color: #154558;
				color: white;
			}

			a.download-btn:hover {
				background-color: #FEAB97;
				color: black;
			}

			@media all and (max-width: 900px) {
			  body {
			    background-image: none;
			  }
			}
			
		</style>
	</head>

	<body>
		<main>
			<section>
				<img src="https://i.imgur.com/rlTkS1C.png" class="bigHeaderImage" />
				<div class="autoCenter" id="tagContainer">
					<!-- <h1>Unstable Universe</h1> -->
					<p class="tagline">The only boardgame where you're allowed to cut the paper into pieces, especially when you are losing. A <a class="link" href="boardgames#one_paper_games">One Paper Game</a> for 2&ndash;9 players.</p>
					<p class="tagline taglineData">Ages: everyone | Complexity: Low | Playtime: 30-60 minutes </p>
					<p style="text-align: center;"><a href="https://drive.google.com/drive/folders/1wu61RX3FCPVfmWjDTW7yOoeqhsgfuMLr?usp=sharing" class="btn download-btn">Download</a></p>
				</div>
			</section>

			<section>
				<div class="autoCenter">
					<h2>What's the idea?</h2>
					<p>You are exploring and conquering a (randomly generated) ice planet!</p>
					<p><img style="max-width: 100%;" alt="Explanation video rules Unstable Universe" title="Explanation video rules Unstable Universe" src="https://i.imgur.com/UuG2Hue.gif"></p>

					<h3>What can I do?</h3>
					<p>Starting from the edge of the board, everyone takes the same action each turn: move to a new node.</p>
					<ul class="fa-ul">
						<li><span class="fa-li"><i class="fas fa-cut"></i></span>Some nodes have special actions, such as teleportation.</li>
						<li><span class="fa-li"><i class="fas fa-cut"></i></span>Most nodes, however, trigger a <strong>cutting action</strong>.</li>
					</ul>

					<h3>Cutting the board?!</h3>
					<p>Yes, you must <strong>cut into the game board</strong> following certain rules!</p>
					<p>If a piece of paper comes loose, it drifts away and is out of the game, including all people on it.</p>

					<h3>When do I win?</h3>
					<p>Be the first to fulfill your personal mission and reach the center!</p>

					<h3>Remarks</h3>
					<p><strong>Don't like cutting?</strong> The rules explain a variant in which you don't have to cut the paper, if you want to re-use the same board (or don't trust other people with scissors ...). The board also uses as little ink as possible.</p>
					<!-- <p><strong>Want more?</strong> There are five expansions that add exciting elements to the game! See below (and the rulebook) for a general overview.</p> -->
				</div>
			</section>

			<section>
				<div class="autoCenter">
					<h2>What do I need?</h2>
					<p>Three small steps:</p>
					<ul class="fa-ul">
						<li><span class="fa-li"><i class="fas fa-cut"></i></span>Generate a random board below and print it.</li>
						<li><span class="fa-li"><i class="fas fa-cut"></i></span>Read the rules (one page).</li>
						<li><span class="fa-li"><i class="fas fa-cut"></i></span>Grab some pens, scissors and friends.</li>
					</ul>
					<p>Voila, you can play!</p>
					<p>The rules for the base game are one page (including images and examples). The other pages explain what all the different nodes and expansions do.</p>
					<p>(If you want to conserve ink when printing: only page 1, 3 and 4 are relevant for the base game.)</p>
					<p><strong>Tip for Teaching:</strong> only explain the first page, then immediately start playing! Simply place the node list on the table, so players can look up what something does whilst playing.</p>
					<p><strong>Tip for Cleanup:</strong> when the game is done, you should have a bunch of puzzle pieces ( = all pieces of paper you cut off). Here's the challenge: try to fit them back together to recreate the original paper! Sounds easier than it is :)</p>
				</div>
			</section>

			<section>
				<div class="autoCenter" style="max-width: 960px;">
					<h2>Reviews</h2>
					<div id="reviewContainer">
						<div><p>&ldquo;What a cutting-edge game!&rdquo;</p><p id="reviewRating">&starf; &starf; &starf; &starf; &starf;</p></div>
						<div><p>&ldquo;The second game about rocks, papers and scissors &mdash; and already a classic&rdquo;</p><p id="reviewRating">&starf; &starf; &starf; &starf;</p></div>
						<div><p>&ldquo;This game cuts right through the crowd with its innovative mechanics and makes the efforts of its competition look paper-thin&rdquo;</p><p id="reviewRating">&starf; &starf; &starf; &starf;</p></div>
					</div>
				</div>
			</section>

			<!-- A SEEDED random number generator, so everything is consistent across devices -->
			<!-- URL: https://github.com/davidbau/seedrandom -->
			<script src="//cdnjs.cloudflare.com/ajax/libs/seedrandom/3.0.5/seedrandom.min.js"></script>

			<!-- jsPDF for turning images into single printable PDF, friendlier to newcomers -->
			<!-- URL: https://github.com/MrRio/jsPDF -->
			<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.1.1/jspdf.umd.min.js"></script>

			<!-- Load Phaser 3.24.0 (I don't want to automatically load latest version for chance of incompatibility) -->
			<script src="https://cdn.jsdelivr.net/npm/phaser@3.24.0/dist/phaser.min.js"></script>

			<section>
				<div class="autoCenter" style="max-width: 960px;">
					<a name="board"></a>
					<h2>Board Generation</h2>
					<p>Input your settings below. The "seed" can be anything (like your name, city, or favourite animal).</p>
					<p>If this is your first game, or a new group of players, enable the "First Game" option.</p>
					<p>Click "Generate Board", save the image, and print it. You're ready to go!</p>

					<p><strong>Woah, that's a lot of expansions!</strong> Yeah, cutting games have many awesome possibilities I wanted to explore. The expansions are completely independent and as simple as possible. Still, it's recommended to try them in the order listed, and only combine multiple of them once you're comfortable with each on its own.</p>

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
									<option value="9">9</option>
								</select>

								<label for="setting-firstGame">First Game(s)? </label>
								<input type="checkbox" name="setting-firstGame" id="setting-firstGame">

								<span class="settingRemark">Everyone gets the same Mission, to simplify learning and teaching the game.</span>

								<label for="setting-inkFriendly">Ink Friendly? </label>
								<input type="checkbox" name="setting-inkFriendly" id="setting-inkFriendly">

								<span class="settingRemark">Removes many decorational elements and turns the board black-and-white.</span>

								<label for="setting-secretBoard">Secret Board? </label>
								<input type="checkbox" name="setting-secretBoard" id="setting-secretBoard">

								<h3 style="grid-column: 1 / span 2; margin-bottom: 0px;">Expansions</h3>
								
								<label for="setting-nastyNodes">Nasty Nodes? </label>
								<input type="checkbox" name="setting-nastyNodes" id="setting-nastyNodes">

								<label for="setting-nodesOfKnowledge">Nodes of Knowledge? </label>
								<input type="checkbox" name="setting-nodesOfKnowledge" id="setting-nodesOfKnowledge">

								<label for="setting-theElectricExpansion">The Electric Expansion? </label>
								<input type="checkbox" name="setting-theElectricExpansion" id="setting-theElectricExpansion">

								<label for="setting-extremeExpeditions">Extreme Expeditions? </label>
								<input type="checkbox" name="setting-extremeExpeditions" id="setting-extremeExpeditions">

								<label for="setting-sharpScissors">Sharp Scissors? </label>
								<input type="checkbox" name="setting-sharpScissors" id="setting-sharpScissors">
							</div>
						</div>
					</div>

					<div style="text-align: center;">
						<button id="gameButton">Generate Board</button>
						<button id="btn-createPDF" style="display:none;">Download PDF</button>
					</div>

					<div id="phaserContainer">
					</div>

					<p style="max-width: 650px; margin: auto; margin-top: 20px; opacity: 0.5;"><em>What's a secret board?</em> The "Expeditions" expansion adds nodes that trigger whenever their piece of paper comes loose. If you are <em>able to print double-sided</em>, these nodes will be placed on the backside of the paper. This means the paper actually has secret treasures and traps that will only be revealed during the game!</p>
					<p style="max-width: 650px; margin: auto; margin-top: 20px; opacity: 0.5;">(It's advisable to perform one "test print", to make sure your printer mirrors the backside correctly. If not, there's probably a setting on your printer for "page flip", and you need the opposite of what it's currently at.)</p>
				</div>
			</section>

			<section>
				<div class="autoCenter">
					<h2>Feedback</h2>
					<p>Found a mistake? Have a positive or negative experience with this game you want to share? Other feedback? Always let me know at <a class="link" href="mailto:askthepanda@pandaqi.com">askthepanda@pandaqi.com</a></p>
					<p>This game and all its assets were completely created by me, Pandaqi, and so is this website that generates random game boards. Check out my other (board)games or support me if you enjoy my work!</p>
					<p>As usual, the font is the only thing I didn't create myself. This time I used SciFly, created by Tomi Haaparanta.</p>
					<p>Also as usual, I wrote two detailed articles about the development of this game:</p>
					<ul>
						<li><a href="https://pandaqi.com/blog/unstable-universe/devlog-unstable-universe-part-1" class="link">[Devlog] Unstable Universe</a> => about the general process, problems, decision making, why I did what I did</li>
						<li><a href="https://pandaqi.com/blog/unstable-universe/technical-devlog-unstable-universe" class="link">[Technical Devlog] Unstable Universe</a> => about the algorithms and (programming) techniques used for creating this website that generates random game boards</li>
					</ul>
					<div style="display: flex; width: 100%; flex-wrap: wrap;">
						<div>
							<img src="https://i.imgur.com/Cx60sOj.jpg" style="max-width: 100%;" />
						</div>
						<div>
							<img src="https://i.imgur.com/RTJdSLY.jpg" style="max-width: 100%;" />
						</div>
					</div>
					<p style="opacity:0.5;">
						Two pictures of the game "in action". Some people in my play groups insist on using these way too complex icons, like a sheep or stick figure&mdash;I recommend just using simple shapes in your games. The bottom board is from an older version of the game, but the sunlight in the picture was really nice, so I decided to keep it on this page.
					</p>
				</div>
			</section>

			<script src="gamesites/unstable-universe/nodeDictionary.js?c=8"></script>
			<script src="gamesites/unstable-universe/game.js?c=36"></script>

		</main>

		

<?php

require '../../footer.php';

?>

		