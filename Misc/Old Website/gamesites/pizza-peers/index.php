<?php
	require '../../default_headers.php';
?>
		<title>Pizza Peers&mdash;Tasty Local Multiplayer!</title>
		<link rel="icon" type="image/png" href="gamesites/pizza-peers/favicon.png" />

		<!-- PIXEL font from Google Fonts -->
    	<link href="https://fonts.googleapis.com/css2?family=VT323&display=swap" rel="stylesheet"> 

		<style type="text/css">
			* {
				font-variant-ligatures: none;
			}

			body {
				font-family: 'VT323', monospace;
				font-size: 20px;

				background-color: rgb(251, 240, 226);
				color: #222222;

				position: relative;
				height: 100%;
			}

			h2 {
				font-family: 'VT323', monospace;
				font-size: 48px;
				margin-bottom: -15px;
				margin-top: 60px;
				line-height: 90%;
				text-transform: none;
			}

			#questContainer h2 {
				font-size: 32px;
			}

			.videoContainer, .gifContainer {
				border-radius: 0.5em;
				box-shadow: 0 0 10px 3px #23120B;
				box-sizing: border-box;
			}

			.videoContainer {
				position:relative;
				padding-bottom:56.25%;
				padding-top:30px;
				height:0;
				overflow:hidden;
			}

			.videoContainer iframe, .videoContainer object, .videoContainer embed {
				position:absolute;
				top:0;
				left:0;
				width:100%;
				height:100%;
			}

			#main {
				max-width: 600px;
				margin: auto;

				padding:10px;
				box-sizing: border-box;
			}

			strong {
				font-weight: normal;
				color: brown;
			}

			em {
				font-style: normal;
				color: purple;
			}

			ol {
				margin-top: -15px;
			}

			a.specialLink {
				border-radius: 5px;
				padding: 5px;
				background-color: #CCC;
				color: black !important;
				display: inline-block;

				transition: background-color 0.3s, color 0.3s;
			}


			a.specialLink:hover {
				background-color: #333;
				color: white !important;
			}
			
			.bigHeaderImage {
				background-image: url(https://i.imgur.com/4406K6E.png);
				background-size: cover;
				background-position: 50% 0%;

				padding: 50px;
			}

			.logo {
				max-width: 600px;
				margin: auto;
			}

			.logo .videoContainer {
				display:none;
			}

			.logo:hover .videoContainer {
				display: block;
			}

			.logo:hover #mainLogo {
				display: none;
			}

			#mainLogo {
				max-width: 100%; 
				filter: drop-shadow(0px 0px 1px black);
			}



			.difficultySeparator {
			    position: relative;
			    text-align: center;
			    margin-top: 50px;
			}

			.difficultyName {
				background-color: rgb(251, 240, 226);
				padding: 6px;
				color: #AAA;
				font-size: 36px;
			}

			.line {
			    border-top: 4px dashed #AAA;
			    width: 100%;
			    position: absolute;
			    top: 50%;
			    z-index: -2;
			}


			img {
				width: 100%;

				image-rendering: pixelated;
        		image-rendering: -moz-crisp-edges;
        		image-rendering: crisp-edges;
			}

		</style>
	</head>

	<body>

		<div class="bigHeaderImage" style="margin-bottom: -40px;">
			<div class="logo">
				<img src="https://i.imgur.com/jNDhTL1.gif" id="mainLogo" />

				<!-- TO DO: Update to actual video; now it's just the Art Hockey one -->
				<div class="videoContainer"><iframe width="560" height="315" src="https://youtube.com/embed/6BKfPS9q3qI" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>

				<p style="text-align: center; opacity: 0.75;">(Hover/click logo for the trailer)</p>
			</div>
		</div>

		<section id="main">
			<h2>How do I start a game?</h2>

			<p>Go to <a href="https://pizza-peers.herokuapp.com" class="specialLink">pizza-peers.herokuapp.com</a> on a computer. Press <strong>start game</strong>.</p>
			<p>Now all players can connect with their smartphone! Go to the same website, enter the room code and a fun username, and click <strong>join game</strong>.</p>
			<p>While everyone's connecting, you can choose your <strong>difficulty</strong>. The higher the difficulty, the more mechanics and rules are in the game. I highly recommend starting with "amateur" and working your way up from there!</p>

			<h2>What's my goal?</h2>

			<p>Work together to keep your pizza place alive until the timer runs out! You lose if you <strong>fail three deliveries</strong>.</p>
			<p>Do not worry if you don't immediately remember the rules below. Have fun, play a few rounds, and everything will become clear.</p>

			<h2>How do I move?</h2>

			<p>Simply move your finger around the screen! (For example: if you touch the top left, your character moves in that direction.)</p>

			<img src="https://i.imgur.com/yfvGrCR.gif" />

			<div class="difficultySeparator">
				<span class='difficultyName'>Difficulty: Amateur</span>
				<div class='line'></div>
			</div>

			<h2>How do I make a pizza?</h2>

			<p>Every pizza goes through these steps. (On lower difficulty settings, though, you only do a few of these steps.)</p>
			<ol>
				<li>Gather ingredients</li>
				<li>Combine into pizza</li>
				<li>Bake the pizza</li>
				<li>Deliver</li>
			</ol>

			<h2>How do I get ingredients?</h2>

			<p>There are 5 main ingredients: dough, tomatoes, cheese, spice and vegetables.</p>
			<p>You can buy ingredients by walking to the corresponding building and pressing the button on your phone.</p>
			<p><em>Beware!</em> You only have space for <strong>three things</strong> in your personal backpack.</p>

			<img src="https://i.imgur.com/CYUoIte.gif" />

			<h2>How do I deliver?</h2>

			<p>Buildings will automatically place orders. How do you know? The building will flicker and their order will fly above it.</p>
			<p>Also, an orange circle appears in front of it. Stand on it and press "deliver order" on your phone!</p>

			<img src="https://i.imgur.com/NiMpC9v.gif" />

			<div class="difficultySeparator">
				<span class='difficultyName'>Difficulty: Cook</span>
				<div class='line'></div>
			</div>

			<h2>How do I combine ingredients?</h2>

			<p>Combining is done on <strong>tables</strong>.</p>
			<p>Walk up to them and press the buttons on your phone to drop or pick up ingredients.</p>
			<p><em>Beware!</em> You can only combine ingredients if you have the basis of all pizzas: <strong>dough</strong></p>

			<img src="https://i.imgur.com/merAj4q.gif" />

			<h2>Allergies!</h2>

			<p>Each player receives a list of "allergies" at the start of the game. This remains visible at all times on your phone.</p>
			<p>You cannot <em>hold</em> any of these ingredients in your backpack!</p>
			<p>If you have 4+ players, you also cannot hold a pizza that <em>contains</em> any of those ingredients.</p>

			<img src="https://i.imgur.com/Tifc1oc.gif" />

			<div class="difficultySeparator">
				<span class='difficultyName'>Difficulty: Chef</span>
				<div class='line'></div>
			</div>

			<h2>How do I bake a pizza?</h2>

			<p>Baking is done at <strong>ovens</strong>.</p>
			<p>Walk up to them and press the button to drop the pizza.</p>
			<p>Baking takes time. The heat meter will show you the current temperature.</p>
			<p>If it's <strong>green</strong> (or higher), the pizza is hot enough.</p>

			<img src="https://i.imgur.com/ofDAha2.gif" />

			<h2>How do I get orders?</h2>

			<p>From now on, buildings will not automatically order something &mdash; you need to ask them first!</p>
			<p>A <strong>dancing exclamation mark</strong> means this building wants to order.</p>
			<p>Walk toward the orange circle in front of it and press "take their order" on your phone, before you're too late!</p>

			<img src="https://i.imgur.com/jsohu61.gif" />

			<div class="difficultySeparator">
				<span class='difficultyName'>Difficulty: Master Chef</span>
				<div class='line'></div>
			</div>

			<h2>Special stuff</h2>

			<p><strong>Cooldown</strong>: pizzas automatically cool down when out of the oven. So do not take too long when delivering!</p>
			<p><strong>Burned</strong>: a pizza that is too hot will become black. It's useless from now on.</p>
			<p><strong>Vehicles</strong>: use vehicles to move way faster. When inside a vehicle, however, you cannot interact with anything.</p>
			<p><strong>Money Penalty</strong>: you get a (severe) money penalty for failing orders!</p>

			<h2>Want more?</h2>

			<p>This game is part of <a class="specialLink" href="http://pandaqi.com/the-peerful-project">The Peerful Project</a>. It's a collection of innovative free local multiplayer games, using smartphones as controllers. Why is it called like that? Because the technology powering this system is called peer-to-peer :)</p>

			<p>Currently, "Pizza Peers" is the first and only game within the project, but more are coming!</p>
			
			<h2>Want to create something like this?</h2>

			<p>I wrote an in-depth article series about servers, peer-to-peer networking, using Phaser for browser games and more! Check out: 
				<a class="specialLink" href="http://pandaqi.com/blog/pizza-peers/how-i-created-pizza-peers">How I Created Pizza Peers</a>

			<h2>Interesting things!</h2>

			<p>Questions? Feedback? Improvements? Don't hesitate to <a class="specialLink" href="/about/contact">contact me</a>.</p>

			<p>This game is optimized for <strong>local multiplayer</strong> play: people within the same room using the same Wi-Fi network. It works flawlessly there. In any other setup, connections may fail or be delayed.</p>

			<p>This game is <strong>completely free</strong>, no need to sign up, no adverts, no installation! It's just a tiny website.</p>

			<p><strong>If you like my work</strong>, though, please support me by donating, buying any of my games or simply sharing my work!</p>

			<p>The game is hosted on a free server (precisely because I earn no income from it). Because of the way I designed the game, this should rarely be a problem. It just means that, occasionally, establishing your first connection with the server might take a few seconds longer.</p>
		</section>

		

<?php

require '../../footer.php';

?>

		