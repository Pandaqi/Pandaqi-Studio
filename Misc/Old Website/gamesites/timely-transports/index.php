<?php
	require '../../default_headers.php';
?>
		<title>Timely Transports &mdash; the first ever hybrid between boardgames and computer games</title>
		<link rel="icon" type="image/png" href="gamesites/timely-transports/favicon.png" />

		<!-- Header font: Rowdies -->
		<link href="https://fonts.googleapis.com/css2?family=Rowdies:wght@300;400;700&display=swap" rel="stylesheet"> 

		<!-- Body Font: Yanone Kaffeesatz -->
		<link href="https://fonts.googleapis.com/css2?family=Yanone+Kaffeesatz:wght@300;400;700&display=swap" rel="stylesheet"> 

		<!-- Default CSS stylesheet for all boardgame pages -->
		<link rel="stylesheet" type="text/css" href="gamesites/boardgames/boardGameStyles.css">

		<!--
			COLOR SCHEME:
			
			Gray-Purplish: #7A6263
			Sage (muddy green): #CED097

			Pale Purple Pantone: #E9D6EC
			Pink Lavender: #EFBDEB

			Xiketic: #0D0106 (really dark grey)

			== BLUE ===
			Middle Blue: #7EBDC3
			Oxford Blue: #030027 (nice!)
			Blue Sapphire: #086375 (nice!)

			== GREEN ==
			White-Green: #DFF2D8
			Tea Green: #C6DEA6
			Forest Green 1: #004F2D
			Forest Green 2: #143109

			== YELLOW ==
			Yellow Green: #8FC93A (nice!)
			Citrine: #E4CC37 (nice! yellowy)

			Light Yellow: #FFE66D
			Mixed Yellow: #FFCF56 (nice!)
			Really Bright Yellow: #E9DF00

			Cadmium Orange: #E18335 (nice!)

		-->
		<style type="text/css">
			body {
				font-size: 20pt;
			}

			.taglineData {
				font-size:12pt;
				opacity: 0.5;
			}

			.bigHeaderImage {
				margin-bottom:-7.5px;
				filter: none;
			}

			ul {
				margin-top:-15px;
			}

			#btn-createPDF {
				background-color: purple;
			}

			#btn-createPDF:hover {
				color: #660033;
				background-color: pink;
			}

			main {
				background-image: url(https://i.imgur.com/t3EDO2r.png);
				background-size: 100%;
			}
		</style>
	</head>

	<body>
		<main>
			<section>
				<img src="https://i.imgur.com/7qpyA55.png" class="bigHeaderImage" />
				<div style="width: 100%; padding: 0; margin: 0; margin-bottom: -25vw;"> <!-- transition picture to flow name logo into rest of page -->
					<img src="https://i.imgur.com/Rogbg5R.png" style="max-width: 100%;" />
				</div>
				<div class="autoCenter">
					<!-- <h1>Timely Transports</h1> -->
					<p class="tagline" style="position: relative; background-color: #DFF2D8; padding: 20px; border-radius: 10px;">A hybrid board+smartphone game for 1&ndash;8 players about transporting exotic goods across the jungle.</p>
					<p class="tagline taglineData">Ages: everyone | Complexity: Low | Playtime: 20 minutes </p>
					<p style="text-align: center;"><a href="https://drive.google.com/drive/folders/1d0eedJEL16SlrI33umvVDxZOgPvqQ25r?usp=sharing" class="btn download-btn">Download</a></p>
				</div>
			</section>

			<!-- Load Phaser 3.22.0 via CDN -->
		    <!-- (The actual Phaser game node will only be created and started below, in a custom script -->
		    <script src="https://cdn.jsdelivr.net/npm/phaser@3.22.0/dist/phaser.min.js"></script>

		    <!-- Introduction + explanation text -->
		    <section>
		    	<div class="autoCenter">
		    		<h2>What do I do?</h2>
		    		<img src="https://i.imgur.com/lhhXTp6.png" class="floatingImage" />
		    		<p>You must lead a transportation company in the jungle!</p>
		    		<p>Fruit, bamboo, birds, bees, all sorts of things will randomly pop up. It's your job to get them to the right city and score some points.</p>
		    		<p>However, every time you move a vehicle, you must start a timer. If you stop the timer at the right moment, you may finish the movement. But forget about the timer and click it too late ... and you'll get a severe penalty.</p>
		    		<p>Even worse, other players work in the same jungle too. If your vehicle is still standing on a city when a new one arrives, it is bumped off the board. So keep all your vehicles going, all the time, and you might just win!</p>

		    		<h2>What do I need?</h2>
		    		<img src="https://i.imgur.com/zpNomhX.png" class="floatingImage" style="shape-outside: none; margin-left: 5px; margin-top: 30px;" />
		    		<p>This game is an innovative <strong>hybrid</strong> between an analog and digital game. How so? The game is played on a physical board with pieces to move around, but the timers (and more) are controlled by your smartphone.</p>
		    		<p>As such, each player needs to have a <strong>smartphone</strong> with them.</p>
		    		<p>These are the necessary files to print. (Click the "Download" button above to, well, download them.)</p> 
		    		<ul>
		    			<li>Two pages of materials ( = the vehicles and resource chips).</li>
		    			<li>The rules &mdash; including images, setup and examples &mdash; are only three pages.</li>
		    			<li>Scroll down this page to generate random game boards! When you find one you like, print it.</li>
		    		</ul>
		    		<p>This game uses a <strong>campaign</strong> to make it super easy to learn. It has six scenarios, increasing in difficulty, allowing you to get comfortable with the game before adding new rules and mechanics.</p>
		    		<p>That's all! The game is completely free, polished, simple, playtested, so have fun!</p>
		    	</div>
		    </section>

		    <!-- Game settings + button to start game interface on phone -->
			<section>
				<div class="autoCenter">
					<a name="game"></a>
					<h2>Game</h2>
					<p>Input your desired settings. Then click the button below to start the game interface on your device.</p>
					<p>It will take you to a new page saying "Click to start the game". Wait with clicking until all players are ready!</p>
					<p>Because it opens a new page, it's possible your browser registers this as a pop-up. It's not, I would <em>never</em> show pop-ups, so you can simply allow it.</p>

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
								
								<label for="setting-difficulty">Scenario? </label>
								<select name="setting-difficulty" id="setting-difficulty">
									<option value="Training Wheels">1. Training Wheels</option>
									<option value="Good Luck">2. Good Luck</option>
									<option value="Fancy Vehicles">3. Fancy Vehicles</option>
									<option value="Another Upgrade">4. Another Upgrade</option>
									<option value="Extraordinary Events">5. Extraordinary Events</option>
									<option value="Crazy Cargo">6. Crazy Cargo</option>
								</select>

								<label for="setting-playerRank">Which player are you? </label>
								<select name="setting-playerRank" id="setting-playerRank">
									<option value="0"> -- ignore -- </option>
									<option value="1">1st</option>
									<option value="2">2nd</option>
									<option value="3">3rd</option>
									<option value="4">4th</option>
									<option value="5">5th</option>
									<option value="6">6th</option>
									<option value="7">7th</option>
									<option value="8">8th</option>
								</select>

								<span class="settingRemark">If used, each player must input a unique rank. (Order does not matter.) By knowing which player you are, the game can space out events and sound effects more fairly and evenly.</span>

								<label for="setting-timeOuts">Add Timeouts? </label>
								<select name="setting-timeOuts" id="setting-timeOuts">
									<option value="0"> -- ignore -- </option>
									<option value="5">Every 5 minutes</option>
									<option value="10">Every 10 minutes</option>
								</select>

								<span class="settingRemark">If some of your players find the game too stressful, include regular timeouts. This gives them some time to breathe and make new plans once in a while.</span>
							</div>
						</div>
					</div>

					

					<p style="text-align: center;">
						<button class="btn" id="startGameBtn">Start Game</button>
					</p>

					<p><span class="remark">Remark:</span> on <strong>old</strong> Apple devices, the sound may be slightly delayed or elements may be bigger/smaller. In rare cases, it decides to zoom in and therefore hide the score. If this happens, simply reload and try again. (It always takes a while for Apple to properly support new web technologies.)</p>

					<script>
						document.getElementById('startGameBtn').addEventListener('click', function(ev) {
							// read input
							var playerCount = parseInt( document.getElementById('setting-playerCount').value );
							var difficulty = document.getElementById('setting-difficulty').value;
							var playerRank = parseInt( document.getElementById('setting-playerRank').value );
							var timeout = parseInt( document.getElementById('setting-timeOuts').value );

							// save in local storage
							window.localStorage.setItem('playerCount', playerCount);
							window.localStorage.setItem('difficulty', difficulty);
							window.localStorage.setItem('playerRank', playerRank);
							window.localStorage.setItem('timeout', timeout);

							// go to actual game page
							window.open("gamesites/timely-transports/game.php", "_blank")
						});
					</script>
				</div>
			</section>

			<!-- Board settings + button to randomly generate board -->
			<section>
				<div class="autoCenter">
					<h2>Board</h2>
					<a name="board"></a>
					<p>Input your desired settings. Then click the button below to generate a random board!</p>
					<p>You can generate as many boards as you want, until you find something you like.</p>
					<p>Different scenarios require different boards. For example, in scenario 1 there are fewer cities and vehicles, which means the map is much more zoomed in than on later scenarios.</p>
					<p>On higher player counts, or later scenarios, it's highly recommended to keep the "split board" option on. This creates a huge board consisting of 4 papers, which allows everyone to easily see and reach all destinations.</p>

					<div id="gameSettings">
						<div>
							<div>
								<label for="settingBoard-playerCount">Number of Players? </label>
								<select name="settingBoard-playerCount" id="settingBoard-playerCount">
									<option value="1">1</option>
									<option value="2">2</option>
									<option value="3">3</option>
									<option value="4">4</option>
									<option value="5">5</option>
									<option value="6">6</option>
									<option value="7">7</option>
									<option value="8">8</option>
								</select>
								
								<label for="settingBoard-difficulty">Scenario? </label>
								<select name="settingBoard-difficulty" id="settingBoard-difficulty">
									<option value="Training Wheels">1. Training Wheels</option>
									<option value="Good Luck">2. Good Luck</option>
									<option value="Fancy Vehicles">3. Fancy Vehicles</option>
									<option value="Another Upgrade">4. Another Upgrade</option>
									<option value="Extraordinary Events">5. Extraordinary Events</option>
									<option value="Crazy Cargo">6. Crazy Cargo</option>
								</select>
								
								<label for="settingBoard-printFriendly">Ink Friendly? </label>
								<input type="checkbox" name="settingBoard-printFriendly" id="settingBoard-printFriendly">

								<span class="settingRemark">If you want to print the board black-and-white, or just use as little ink as possible, check this option.</span>

								<label for="settingBoard-splitBoard">Bad City Bonus? </label>
								<input type="checkbox" name="settingBoard-cityBonus" id="settingBoard-cityBonus">

								<span class="settingRemark">If the computer thinks a capital is worse than the others, it will give it a few bonus points. The owner of this capital gets these for free at the start of the game.</span>

								<label for="settingBoard-splitBoard">Split Board?</label>
								<input type="checkbox" name="settingBoard-splitBoard" id="settingBoard-splitBoard" checked="checked">

								<span class="settingRemark">If disabled, the board is only <em>one</em> piece of paper (instead of four papers that combine into a larger board). Highly recommended to keep this enabled.</span>

								<label for="settingBoard-rulesReminder">Add rules reminder?</label>
								<input type="checkbox" name="settingBoard-rulesReminder" id="settingBoard-rulesReminder" checked="checked">


							</div>
						</div>
					</div>

					<div style="text-align: center;">
						<button class="btn" id="generateBoardBtn">Generate Board</button>
						<button class="btn" id="btn-createPDF" style="display:none;">Download PDF</button>
					</div>
					
					<div id="phaserContainer">
					</div>

				    <!-- Load perlin noise generator -->
				    <script src="gamesites/timely-transports/perlin.js"></script>

				    <!-- jsPDF for turning images into single printable PDF, friendlier to newcomers -->
					<!-- URL: https://github.com/MrRio/jsPDF -->
					<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.1.1/jspdf.umd.min.js"></script>

				    <!-- Load my own pathfinding library -->
				    <!-- (Also, prevent caching by appending random arguments at the end) -->
				    <script src="gamesites/timely-transports/pathfinder.js?v=10"></script>

				    <!-- Load game dictionary (with lists/data/info that I need in both board generation and game interface) -->
				    <script src="gamesites/timely-transports/gameDictionary.js?v=3"></script>

				    <!-- Load the actual board generation program -->
				    <script src="gamesites/timely-transports/boardGeneration.js?v=55"></script>
				    </script>
				</div>
			</section>

			<section>
				<div class="autoCenter">
					<h2>Feedback</h2>
					<p>As always, I make these games because I want everyone to enjoy the fun of boardgames, as inexpensively as possible.</p>
					<p>I also make these games to push the medium forward and innovate with completely new ideas and mechanics.</p>
					<p>As far as I know, a game like this has never been done before, with such a strong connected digital element <em>and</em> randomly generated player boards.</p>
					<p>If you've played the game, let me know what you think! Mail me at <a href="mailto:askthepanda@pandaqi.com">askthepanda@pandaqi.com</a></p>
					<p>Feedback, requests, player stories, bugs you've found&mdash;anything is welcome</p>

					<h2>Credits</h2>
					<p>I used the fonts <strong>Rowdies</strong> for header text and <strong>Yanone Kaffeesatz</strong> for body text, both freely available on Google Fonts.</p>
					<p>I used the <strong>Phaser 3</strong> library for programming the board generation and game interface, also completely free and open source.</p>
					<p>All other parts of the game (concept, code, graphics, rules, ...) were completely made by me, Pandaqi!</p>
					<p>I've written two in-depth articles about the creation of this game (as I usually do):</p>
					<ul>
						<li><a href="http://pandaqi.com/blog/timely-transports/devlog-timely-transports">[Devlog] Timely Transports</a>: about problems I faced, solutions I found, why I chose to do certain things (or not do them), general interesting stuff about game design.</li>
						<li><a href="http://pandaqi.com/blog/timely-transports/technical-devlog-timely-transports">[Technical Devlog] Timely Transports</a>: about the actual algorithms used for the game interface and generating the game board, both high overview and actual code samples</li>
						<li><a href="http://pandaqi.com/blog/timely-transports/update-timely-transports">[Update] Timely Transports</a>: about the huge update I did for the game, half a year after release. Why I did it, what changed, and more.
					</ul>
				</div>
			</section>

			

		</main>

		

<?php

require '../../footer.php';

?>

		