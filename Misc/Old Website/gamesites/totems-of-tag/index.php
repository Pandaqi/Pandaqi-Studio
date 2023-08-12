<?php
	require '../../default_headers.php';
?>
		<title>Totems of Tag&mdash;Dodgeball for 1-4 players, with many twists</title>

		<!-- Favicon -->
		<link rel="icon" type="image/png" href="gamesites/totems-of-tag/favicon.png" />

		<!-- Zen Tokyo Zoo + Loop -->
		<link rel="preconnect" href="https://fonts.googleapis.com">
		<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
		<link href="https://fonts.googleapis.com/css2?family=Zen+Loop:ital@0;1&family=Zen+Tokyo+Zoo&display=swap" rel="stylesheet"> 
		<link href="https://fonts.googleapis.com/css2?family=Advent+Pro&display=swap" rel="stylesheet">
		
		<style type="text/css">
			body {
				background-image: url(https://i.imgur.com/0Cl5dFX.png);
				background-position: center;
				background-color: #94FF8C;
				background-size: 100%;
				font-family: 'Advent Pro', cursive;
				font-size: 24px;
				line-height: 120%;
				color: #101010;
			}

			main {
				max-width: 720px;
				margin: auto;
				padding: 15px;
				box-sizing: border-box;
			}

			#gameHeader {
				text-align: center;
			}

			#gameHeader > img {
				max-width: 100%;
			}

			img {
				max-width: 100%;
			}

			/* to place the YouTube video nicely (size and position) */
			.videoContainer {
				position:relative;
				padding-bottom:56.25%;
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

			.videoOverHeader {
				position: absolute;
				top: 50%;
				left: 0;
				right: 0;
				max-width: 380px;

				margin: auto;
				transform: translateY(-50%);

				border: 5px solid #6BB73E;
				border-radius: 5px;
				box-shadow: #202 0 0 10px 2px;

				margin-left: 250px;
				margin-top: 110px;
			}

			h1, h2 {
				font-family: 'Zen Tokyo Zoo', cursive;
				text-align: center;
				font-size:52px;
				margin-bottom: 10px;
				margin-top: 40px;

				text-decoration: none;
				text-transform: none;
			}

			.buyLink, main a {
				display: inline-block;
				padding: 20px;
				background-color: #6BB73E;
				color: rgba(0,0,0,0.75);
				border-radius:0.5em;
				text-decoration: none;
				font-family: 'Zen Tokyo Zoo', cursive;
				font-size: 32px;

				transition: background-color 0.5s, color 0.5s;
				box-shadow: 0 0 10px 2px #333;

				margin: 10px;
				max-width: 100%;
			}


			.buyLink:hover, main a:hover {
				background-color: #A33;
				color: rgba(255,255,255,0.75);
			}

			/* The container to display GIF and TEXT nicely next to each other (on wide screens)
			   or underneath (on narrow screens) */

			.gifContainer {
				max-width: 100%;
				box-sizing: border-box;
			}

			.horizontalFlex {
				display: flex;
				align-items: center;
				position: relative;
				justify-content: center;
				align-content: center;
			}

			.horizontalFlex > div {
				width: 50%;
				box-sizing: border-box;
			}

			.horizontalFlex .textSide {
				padding: 10px;
				padding-top: 0px;
			}

			.horizontalFlex .textSide p:first-child {
				margin-top:0px;
			}

			.horizontalFlex .nonTextSide {
				margin-right: 10px;
				text-align: center;

				margin-bottom: 10px;
			}

			/* Screenshot gallery */
			.screenshotGallery {
				height: 240px;
				overflow-x: scroll;
				overflow-y: hidden;
				white-space: nowrap;
				box-sizing: border-box;
			}

			.screenshotGallery > div {
				display: inline-block;
				height: 240px;
				white-space: nowrap;
				margin: 0px;
				box-sizing: border-box;
			}

			.screenshotGallery > div > img {
				max-height: auto;
			}

			/* Better links */
			main a {
				display: inline-block;
				max-width: 400px;
				font-size: 24px;
			}

			p {
				padding-right: 10px;
				box-sizing:border-box;
			}

			@media all and (max-width: 680px) {
				.videoOverHeader {
					max-width: 500px;
					margin: auto !important;
				}
			}

			
		</style>

	</head>

	<body>
		<main>
			<section id="gameHeader" style="position:relative;">
				<img src="https://i.imgur.com/wsdA4Uo.png" />
				<div class="videoOverHeader">
					<div class="videoContainer">
						<iframe width="560" height="315" src="https://www.youtube.com/embed/KSz3iXlhZ8k" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
					</div>
				</div>
			</section>

			<section style="text-align:center; display: flex; justify-content: center; flex-wrap: wrap;">
				<div id="desktopDownloadBtn">
					<a href="http://pandaqi.itch.io/totems-of-tag" class="buyLink">Download</a>
					<p style="margin-top:0px; margin-bottom:30px; opacity: 0.5;">(Windows, Mac, Linux; itch.io)</p>
				</div>
			</section>

			<section>
				<p>It's <strong>dodgeball</strong>, but without any restrictions!</p>
				<p>All players enter an arena. Hit your opponents with balls to remove lives. Only one can survive.</p>
				<p>Each arena is different, powerups force you to think on your feet, and unique ball types keep games varied.</p> 
				<p>Players can control their throw <strong>power</strong> (by holding longer) and <strong>curve</strong> (by rotating). To make matters worse, players can perform dashes and tackles ...</p>
				<p>Playable by anyone who just wants some fun, but enough strategy and skill to stay interesting.</p>
			</section>

			<h2>Screenshots!</h2>
			<section class="screenshotGallery">
				<div><img src="https://i.imgur.com/5ua1CY0.png" /></div>
				<div><img src="https://i.imgur.com/4ecDTm9.png" /></div>
				<div><img src="https://i.imgur.com/ocwbR9D.png" /></div>

				<div><img src="https://i.imgur.com/gT0cStL.png" /></div>
				
				<div><img src="https://i.imgur.com/epoLmKs.png" /></div>
				<div><img src="https://i.imgur.com/qQdWIUb.png" /></div>
				<div><img src="https://i.imgur.com/RPYBd4W.png" /></div>
			</section>

			<section>
				<h2>Controls</h2>
				<p>This game is playable on <span style="color:#b8341f;">Windows/Mac/Linux</span> with any combination of keyboard and controllers. It supports 2-4 players.</p>
				<p>To play the game, you only need two controls &mdash; move around and throw the ball &mdash; making it accessible to anyone!</p>
				<p>Mastering the game however, with all its weird ball types and curving shots, will take time. (And some more buttons, if you want to.)</p>
			</section>

			<section>
				<h2>The 1-week challenge</h2>
				<p>I love local multiplayer games. However, I tend to make projects TOO BIG, so I challenge myself to develop tiny ideas in just a week.</p>
				<p>This is the third game made via this challenge. Below are links to the other games:</p>
				<div style="text-align: center;">
					<a href="https://pandaqi.com/a-recipe-for-disaster">A Recipe for Disaster</a>
					<a href="https://pandaqi.com/i-wish-you-good-hug">I Wish You Good Hug</a>
				</div>
				<p>This game started with the simple idea: "what if I just create the game of dodgeball (which most people know from high school)?"</p>
				<p>In the end, because of the limited time frame, I wasn't able to create an extra mode that actually follows the common "rules" for dodgeball. Instead, there is only one "free-for-all mode". Additionally, after creating the whole game, I'm pretty certain it would've worked better in 3D. So I might still make that.</p>
				<p>And ... well, this is awkward. The idea of "totems" barely made it into the game. I wanted to make the whole art style based on totems, but soon realized I didn't know how to make it look good (in 2D, drawing the totems from all directions) within the limited time I had. So the updated version (in 3D) will probably have more of that theme :p</p>
				<p>For my full thoughts about this game, read the devlog:</p>
				<div style="text-align: center; margin-bottom: 50px;">
					<a href="https://pandaqi.com/blog/devlog-totems-of-tag" style="margin: auto;">Totems of Tag: What I've Learned</a>
				</div>
			</section>

		</main>


<?php

require '../../footer.php';

?>

		