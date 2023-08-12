<?php
	require '../../default_headers.php';
?>
		<title>Art Hockey - Multiplayer Drawing Sport (Android Game)</title>
		<link rel="icon" type="image/png" href="gamesites/art-hockey/favicon.png" />

		<link href="https://fonts.googleapis.com/css?family=Sriracha&display=swap" rel="stylesheet"> 

		<style type="text/css">
			@font-face {
			  font-family: sketchy;
			  src: url(gamesites/art-hockey/sketchy.ttf);
			}


			body {
				background-repeat: repeat;
				font-family: 'Sriracha', cursive;
				font-size: 20px;
				line-height: 120%;

				background-color: rgb(251, 240, 226);
				color: #222222;

				position: relative;
				height: 100%;
			}

			html {
				height:initial;
			}

			.bgDiv { 
				background-image: url(gamesites/art-hockey/stars.png);
				filter: invert();

				position:absolute;
				height: 100%;
			    width: 100%;
			    top:0;
			    left:0;

				z-index: -50;
				opacity: 0.05;
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
				max-width: 550px;
				margin: auto;

				padding:10px;
				box-sizing: border-box;
			}

			h1 {
				font-family: sketchy;
				text-decoration: none;

				margin-bottom: 0px;
				margin-top: 60px;
			}

			#playStoreDownloadButton {
				display:block;
				margin:auto;
				max-width: 320px;
				height:80px;
				background: url(gamesites/art-hockey/downloadButton.png);
				background-size: 100%;
			}

			#playStoreDownloadButton:hover, #playStoreDownloadButton:active {
				background: url(gamesites/art-hockey/downloadButtonOver.png);
				background-size: 100%;
			}

			.art-hockey-red {
				color: rgb(100, 0, 0);
			}

			.art-hockey-blue {
				color: rgb(0, 0, 100);
			}

			.art-hockey-green {
				color: rgb(0, 100, 0);
			}

			.art-hockey-purple {
				color: rgb(100, 0, 100);
			}

			.multipleImageFlex {
				display: flex;
				flex-wrap: wrap;

				align-items: center;
				align-content: center;
				justify-content: center;
			}

			.multipleImageFlex img {
				margin: 10px;
				max-width: 100px;
			}

			@media all and (max-width: 600px) {
				h1 {
					font-size: 8vw;
				}
			}

		</style>
	</head>

	<body>
	<div class="bgDiv"></div>

		<section id="main">
			<img src="https://i.imgur.com/IlZyYSL.png" style="max-width:100%;" />

			<p class="videoContainer"><iframe width="560" height="315" src="https://www.youtube.com/embed/EnU19uRTz_M" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></p>

			<a href="https://play.google.com/store/apps/details?id=com.pandaqi.art_hockey" id="playStoreDownloadButton"></a>

			<p>Brush your friends aside and draw out their defenses in this creative game of air hockey ... with a twist.</p>
			<!-- <p>Up to four creative painters, rapid and nimble, must defend their goal in air hockey, SOMETHING THAT RHYMES WITH NIMBLE</p> -->
			<!-- <p>Up to 4 creative and swift painters must defend their goal in a wild game of air hockey.</p> -->
			<!-- <p>Air hockey for 1-4 players ... with a twist.</p> -->

			<h1>AIR HOCKEY ... IMPROVED</h1>
			<div style="display:flex;">
				<img src="https://i.imgur.com/5tszTgT.gif" style="margin:20px; max-width: 225px;" />
				<img src="https://i.imgur.com/QJYcMib.gif" style="margin:20px; max-width: 255px;" />
			</div>
			<p><span class="art-hockey-red">Your objective?</span> Shoot the ball against your opponent's goal.</p>
			<p><span class="art-hockey-blue">How?</span> By drawing lines to deflect the ball.</p>
			<p><span class="art-hockey-green">Problems?</span> You only have limited ink, and can only draw one line at a time.</p>
			<p><span class="art-hockey-purple">The catch?</span> The previous line you've drawn ... becomes your next goal!</p>

			<h1>MULTIPLAYER MADNESS</h1>
			<p style="text-align: center;">
				<img src="https://i.imgur.com/agOgDNO.gif" style="max-width:225px;"/>
			</p>
			<p>Play with up to three friends on the same device!</p>
			<p>Defend against attacks from all sides, grab the powerups you need, and deflect the ball into your opponent's goal ... all with a single, swift stroke of the brush.</p>

			<h1>FEATURES</h1>
			<div class="multipleImageFlex">
				<img src="https://i.imgur.com/vzpytZw.png" />
				<img src="https://i.imgur.com/y1v0pqb.png" />
				<img src="https://i.imgur.com/8gjBO8T.png" />
				<img src="https://i.imgur.com/NymOdIC.png" />
				<img src="https://i.imgur.com/sny4VzR.png" />
				<img src="https://i.imgur.com/ENF7I9r.png" />
				<img src="https://i.imgur.com/5q3OI7K.png" />
				<img src="https://i.imgur.com/YfKuxbv.png" />
			</div>
			<ul>
				<li>1-4 players supported (on the same device)</li>
				<li>Creative and unique gameplay involving drawing</li>
				<li>Computer opponents trained using advanced Machine Learning (in other words: they're good, really good.)</li>
				<li>Three challenging game modes</li>
				<li>15+ game-changing powerups</li>
			</ul>

			<h1>Powerup Library</h1>
			<a id="powerupLibrary"></a>
			<p>In case you've forgotten what a powerup does, or want a glimpse of what you can unlock, I present <strong>The Great Library of Powerups!</strong></p>
			<img src="https://i.imgur.com/LF4NKIC.png" style="max-width:100%;max-height:100%;" />

			<h1>Why free?</h1>
			<p>I strive to create innovative multiplayer games, for all ages, to bring people <em>together</em> in real life.</p>
			<p>But I know there's a great risk to buying multiplayer games: how often do you even have time to play a game with your friends or family? How can you be sure?</p>
			<p>As such, I provide these games for free, no matter how good I think they are.</p>
			<p>Within the game, you can (only if you want to) watch an advertisment to receive extra content, such as powerups. Doing so would already be a great way to support me!</p>
		</section>

		

<?php

require '../../footer.php';

?>

		