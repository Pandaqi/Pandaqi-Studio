<?php
	require '../../default_headers.php';
?>
		<title>A Recipe for Disaster&mdash;Baking breads by throwing hats ... </title>

		<!-- Favicon -->
		<link rel="icon" type="image/png" href="gamesites/a-recipe-for-disaster/favicon.png" />

		<!-- Chewy + Open Sans Condensed -->
		<link rel="preconnect" href="https://fonts.gstatic.com">
		<link href="https://fonts.googleapis.com/css2?family=Chewy&family=Open+Sans+Condensed:wght@700&display=swap" rel="stylesheet"> 

		<style type="text/css">
			body {
				background-image: url(https://i.imgur.com/uOasoF9.png);
				background-repeat: repeat-y;
				background-position: center;
				background-color: #070110;
				background-size: 100%;
				font-family: 'Open Sans Condensed', sans-serif;
				font-size: 20px;
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
				max-width: 500px;
				margin: auto;
				transform: translateY(-50%);

				border: 5px solid #6BB73E;
				border-radius: 5px;
				box-shadow: #202 0 0 10px 2px;
			}

			h1, h2 {
				font-family: 'Chewy', cursive;
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
				font-family: 'Chewy', cursive;
				font-size: 32px;

				transition: background-color 0.5s, color 0.5s;
				box-shadow: 0 0 10px 2px #333;

				margin: 10px;
				max-width: 100%;
			}


			.buyLink:hover, main a:hover {
				background-color: #944FC0;
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
		</style>

	</head>

	<body>
		<main>
			<section id="gameHeader" style="position:relative;">
				<img src="https://i.imgur.com/n4sStx5.png" />
				<div class="videoOverHeader">
					<div class="videoContainer">
						<iframe width="560" height="315" src="https://www.youtube.com/embed/MQ7srCHHXZg" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
					</div>
				</div>
			</section>

			<section style="text-align:center; display: flex; justify-content: center; flex-wrap: wrap;">
				<div id="desktopDownloadBtn">
					<a href="http://pandaqi.itch.io/a-recipe-for-disaster" class="buyLink">Download</a>
					<p style="margin-top:0px; margin-bottom:30px;">(Windows, Mac, Linux, Android; itch.io)</p>
				</div>

				<div>
					<a href="https://play.google.com/store/apps/details?id=com.pandaqi.a_recipe_for_disaster" class="buyLink">Download</a>
					<p style="margin-top:0px; margin-bottom:30px;">(Android; Play Store)</p>
				</div>
			</section>
			<section style="text-align:center;">
				
			</section>

			<section>
				<p>Ever wondered how to run a bakery without hands? Well, wonder no more!</p>
				<p>In "A Recipe for Disaster" you'll cooperatively bake the best breads ... by moving and throwing. (Because obviously, you do not need hands for throwing something.)</p>
				<p>A short couch coop chaos game for 1-4 players. A campaign with 20 levels. A masterclass in creative baking.</p>
				<p>On mobile, it plays with 2 players, opposite each other, each with their own two joysticks for moving and throwing.</p>
			</section>

			<section>
				<h2>Controls</h2>
				<p>This game is playable ... </p>
				<ul>
					<li>On Windows/Mac/Linux with any combination of keyboard and controllers</li>
    				<li>On Android with, well, your finger and the touchscreen</li>
    			</ul>
    			<p>On mobile, make sure your phone supports multitouch, and that (media) gestures are off!</p>
    			<p>The images below explain all controls you'll ever need!</p>

    			<img src="https://i.imgur.com/pJVnvyF.png" />
    			<img src="https://i.imgur.com/56QwjRU.png" />
			</section>

			<section>
				<h2>What do I do?</h2>
				<p>You'll mainly throw ingredients at your teammates (which they don't need), collect way too many yeast (which you didn't need), and accidentally throw stuff (which you DID need) in the recycling bin ... but somehow still deliver edible bread in time.</p>
				<p>In short: you'll be baking bread.</p>
				<p>In long: the game is split into 20 levels. Each level teaches a new ingredient, or machine, or mechanic. The image below shows the full workflow for baking bread that is active in the final level.</p>

				<img src="https://i.imgur.com/Wcr7oWW.png" />
			</section>

			<section>
				<h2>The 1-week challenge</h2>
				<p>I love couch co-op games.</p>
				<p>However, I tend to overscope my projects big time, so I decided to do the following: pick an old idea I've wanted to make for a long time, and just see how far I can get in a week. (In the end, it became 1.5 weeks, but hey.)</p>
				<p>Surprisingly, if you contain your scope and just focus on one thing (baking bread), you can create awesome games in a short time period!</p>
				<p>For a more detailed "devlog" (with the lessons I learned, the original idea, etcetera), visit ...</p>

				<div style="text-align: center; margin-bottom: 50px;">
					<a href="https://pandaqi.com/blog/devlog-a-recipe-for-disaster" style="margin: auto;">A Recipe For Disaster: What I've Learned</a>
				</div>
			</section>

		</main>


<?php

require '../../footer.php';

?>

		