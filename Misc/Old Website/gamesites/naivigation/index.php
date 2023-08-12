<?php
	require '../../default_headers.php';
?>
		<title>Naivigation&mdash;a cooperative and chaotic race to the finish</title>
		<link rel="icon" type="image/png" href="gamesites/naivigation/favicon.png" />

		<link href="gamesites/naivigation/customFonts.css" rel="stylesheet" />

		<!--
		FONTS:
		Proxima Nova (different weights) for heading and body
		MMSchoolRD for the in-game action cards (more playful)
		-->

		<!--
		COLOR SCHEME:

		Green (car/land): #D2E6AB
		=> Darker shade: #53672E

		Blue (water): #5899C6
		=> Darker shade: #26526D

		Purple (mountains/air travel): #59365E
		=> Lighter shade: #BC84BA

		Reddish (desert/train): #E03926     
		=> Darker shade: #8D2F28
		-->

		<link rel="stylesheet" type="text/css" href="gamesites/boardgames/boardGameStyles.css">

		<style type="text/css">
			.redCategory {
				background-color: #E03926;
				color: white;
			}

			.blueCategory {
				background-color: #26526D;
				color: white;
			}

			.purpleCategory {
				background-color: #59365E;
				color: white;
			}

			.greenCategory {
				background-color: #53672E;
				color: white;
			}

			.autoCenter h2 {
				font-size: 64px;
				margin-bottom: 0px;
				box-sizing: border-box;
				padding: 20px;

				box-shadow: inset 0 -10px 0 rgba(0, 0, 0, 0.4);
				border-width: 0;
			}

			h1, h2, h3, h4, h5, h6 {
				font-family: 'Proxima Nova Rg', cursive;
			}

			body {
				font-family: 'Proxima Nova Rg', cursive;
				font-size: 16pt;
				line-height: 130%;

				background-color: #D2E6AB;
				color: black;
			}

			.autoCenter {
				max-width: 800px;
				padding: none;
			}

			.autoCenter p {
				padding-left: 20px;
				padding-right: 20px;
				box-sizing: border-box;
			}

			.tagline {
				max-width: 650px;
				color: rgba(0, 0, 0, 0.8);
			} 

			a, a:visited {
				color: #97EAD2;
			}

			a.btn, a.btn:visited {
				font-family: 'Proxima Nova Rg';
				background-color:#8D2F28; 
				color: white;
			}

			a.btn:hover {
				background-color: #E03926;
				color: white;
			}

			a.download-btn, a.download-btn:visited {
				font-size: 48px;
				font-weight: 900;
				filter: drop-shadow(0 0 10px black);
				line-height: initial; /* to get some more space and a bigger/fuller button */
				box-shadow: inset 0 -10px 0 rgba(0, 0, 0, 0.4);
			}

			ul, ol {
				margin-top:-17.5px;
				margin-left: -20px;
			}

			.bigHeaderImage {
				max-width:100%; 
				filter: none;
				transition: filter 1s;
				pointer-events: all;
			}

			.bigHeaderImage:hover {
				filter: drop-shadow(0 0 10px black);
			}

			@media all and (max-width: 600px) {
				h2 {
					font-size: 32px;
				}
			}
			
		</style>
	</head>

	<body>
		<main>
			<img src="https://i.imgur.com/fO63dlV.png" class="bigHeaderImage" />

			<section>
				<div class="autoCenter">
					<p class="tagline">Everyone steers the same car. Will you make it to the finish?</p>
					<p class="tagline">A cooperative game for 2&ndash;10 players about guessing the actions of your fellow players, creating a solid plan without saying anything ... and then failing to execute that plan and driving your car into a lake.
					<p class="tagline taglineData">Languages: EN,NL | Ages: Everyone | Complexity: Easy | Playtime: 30-60 minutes </p>
					<p style="text-align: center;"><a href="https://drive.google.com/open?id=1KYVfdGHwlhRCrBbBwFuwgL5mWycQ8lb3" class="btn download-btn">Download</a></p>
				</div>
			</section>

			<!-- Add a gameplay image here? -->
			<!-- Also, add images to "How does it Work?" for extra clarification? -->

			<section>
				<div class="autoCenter">
					<h2 class="purpleCategory">What do I need?</h2>
					<p>This game is "print 'n play", which means you can play it for free by taking these simple steps:</p>
					<ol>
						<li>Click the "Download" button to go to my Google Drive.</li>
						<li>Once there, download the Rules and Files in your preferred language.</li>
						<li>Print the files (6 pages in total) and cut out any cards/tiles.</li>
						<li>Read/print the rules (6 pages&mdash;including images, examples, and clarifications)</li>
						<li>Find some friends and start playing!</li>
					</ol>
					<p>Each game I create has been thoroughly playtested and designed as professionally as possible. Nevertheless, if you find errors, unclear rules, or have ideas for improvements, never hesitate to let me know: <strong>askthepanda@pandaqi.com</strong></p>
				</div>
			</section>

			<section>
				<div class="autoCenter">
					<h2 class="blueCategory">How does it work?</h2>
					<p>To win the game, you need to drive to the finish line. However, all players are steering the car simultaneously.</p>
					<p>Each round, you extend the road, reveal a new "instruction" from your navigation, and hand out some cards. (These cards contain instructions like "drive forward" or "turn to the left".)</p>
					<p>Without communicating, players need to play cards from their hands face-down, until the complete row has been filled.</p>
					<p>Then the magic happens! Reveal all the instructions and execute them, moving the car over the road.</p>
					<p>If you ignore the navigation instruction, or simply take too long to reach the finish, you collectively lose the game!</p>
					<p>And if you accidentally drive off the road (and perhaps even off the game board) ... your car will be severely damaged. And no, finishing with a car that's <em>total loss</em> does not count.</p>
					<p>(This is a quick overview of the rules. Read the rulebook for specifics. It's a simple game, really, but so much fun :) )</p>
				</div>
			</section>

			<section>
				<div class="autoCenter">
					<h2 class="redCategory">Expansions</h2>
					<p>This game has, so far, been enjoyed the most by all my playtesters. It also has loads of possibilities, which is why I am working on expansions!</p>
					<p>The base game is about steering a car together, but what if you were steering a train instead? Or flying airplanes? Or sitting on a boat?</p>
					<p>The grand plan is to make a separate and unique game for each vehicle, but also a way to play <em>all of them</em> simultaneously. These are the planned expansions:</p>
					<ul>
						<li><strong>Singing Sails</strong></li>
						<li><strong>Troublesome Trains</strong></li>
						<li><strong>Frightening Flights</strong></li>
						<li><strong>Naivigation: Around the World</strong></li>
						<li>(Base game: also has some minor expansions in the works)</li>
					</ul>
					<p>I wanted to make the base game as perfect as possible, before diving into spin-offs. As I write this (May 2020), I deem the base game finished and can start executing the other ideas.</p>
				</div>
			</section>

			
		</main>

		

<?php

require '../../footer.php';

?>

		