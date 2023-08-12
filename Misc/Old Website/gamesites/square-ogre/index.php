<?php
	require '../../default_headers.php';
?>
		<title>Square Ogre&mdash;Wanted to see the world ... </title>

		<!-- Favicon -->
		<link rel="icon" type="image/png" href="gamesites/square-ogre/favicon.png" />

		<!-- Andika New Basic + Hanalei Fill -->
		<link rel="preconnect" href="https://fonts.gstatic.com">
		<link href="https://fonts.googleapis.com/css2?family=Andika+New+Basic:ital,wght@0,400;0,700;1,400;1,700&family=Hanalei+Fill&display=swap" rel="stylesheet"> 

		<style type="text/css">
			body {
				background-image: url(https://i.imgur.com/bfG5qLM.png);
				background-repeat: repeat-y;
				background-position: center;
				background-color: #070110;
				background-size: 100%;
				font-family: 'Andika New Basic', sans-serif;
				font-size: 20px;
				color: #FCFCFC;
			}

			main {
				max-width: 900px;
				margin: auto;
			}

			#gameHeader {
				text-align: center;
			}

			#gameHeader > img {
				max-width: 100%;
			}

			img.imageAsHeading {
				max-width: 100%;
				margin-top: 70px;
				margin-bottom: -20px;
			}

			img.imageAsHeading + p {
				margin-top: 0px;
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

			h1 {
				font-family: 'Hanalei Fill', cursive;
				text-align: center;
				font-size:52px;
				margin-bottom: 10px;
				margin-top: 40px;

				color: #FCFCFC;
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
				font-family: 'Hanalei Fill', cursive;
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

			/* Gallery of screenshots (allow horizontal scrolling) */
			/* Unused at the moment => I decided to integrate the screenshots more into the page, instead of just giving a gallery */
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

			p {
				padding-right: 10px;
				box-sizing:border-box;
			}

			.horizontalNoFlex p {
				padding-left: 10px;
			}

			@media all and (max-width: 900px) {
				.horizontalFlex {
					flex-wrap: wrap;
				}

				.horizontalFlex > div {
					width: 100%;
				}

				.horizontalFlex .nonTextSide {
					margin-right: 0px;
				}

				.imageRight {
					flex-direction: column-reverse;
				}
			}
		</style>

	</head>

	<body>
		<main>
			<section id="gameHeader" style="position:relative;">
				<img src="https://i.imgur.com/XYP1CFm.png" />
				<div class="videoOverHeader">
					<div class="videoContainer">
						<iframe width="560" height="315" src="https://youtube.com/embed/wbbFJdYkwZ4" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
					</div>
				</div>
			</section>

			<section style="text-align:center; display: flex; justify-content: center; flex-wrap: wrap;">
				<div id="desktopDownloadBtn">
					<a href="http://pandaqi.itch.io/square-ogre" class="buyLink">Buy "Square Ogre" (&euro;3.99)</a>
					<p style="margin-top:0px; margin-bottom:30px;">(Windows, Mac, Linux, Android)</p>
				</div>

				<div>
					<a href="https://play.google.com/store/apps/details?id=com.pandaqi.square_ogre" class="buyLink">Try "Square Ogre" (free)</a>
					<p style="margin-top:0px; margin-bottom:30px;">(Android)</p>
				</div>
			</section>
			<section style="text-align:center;">
				
			</section>

			<img src="https://i.imgur.com/qUPz6Sd.png" class="imageAsHeading" />
			<!-- <h1>A Puzzler for Everyone</h1> -->
			<section class="horizontalFlex">
				<div class="nonTextSide">
					<img src="https://i.imgur.com/k0irtHB.gif" loading="lazy" class="gifContainer"/>
				</div>
				<div class="textSide">
					<p><strong>Square Ogre</strong> is a cute <strong>puzzle game</strong> with the simplest possible controls (swipe in a direction to move that way). Help Ogre improve his eyesight, so he can finally find the cave exit.</p>
					<p>It's based upon a children's story and therefore suitable <strong>for all ages</strong>. The simple controls allow puzzles to stay small and uncluttered, with the solution often hiding in plain sight ... </p>
				</div>
			</section>

			<!--<h1>A Cave of Content</h1>-->
			<img src="https://i.imgur.com/L1dh7pW.png" class="imageAsHeading" />
			<section class="horizontalFlex">
				<div class="textSide">
					<p><strong>500 unique puzzles</strong> across <strong>20 worlds</strong> will entertain you for tens of hours!</p>
					<p>Start of a new world? A brand new mechanic to explore! This makes the game easy to learn, yet varied and challenging.</p>
				</div>

				<div class="nonTextSide">
					<img src="https://i.imgur.com/qAhMdO1.gif" loading="lazy" class="gifContainer"/>
				</div>
			</section>

			<img src="https://i.imgur.com/ikEBEZD.png" class="imageAsHeading" />
			<!-- <h1>The Ways of the Ogre</h1> -->
			<section class="horizontalFlex">
				<div class="nonTextSide">
					<img src="https://i.imgur.com/ZEYkwbk.gif" loading="lazy" class="gifContainer"/>
				</div>

				<div class="textSide">
					<p>You'll be opening doors, flying from trampolines, skidding across icy floors, collecting mysterious scrolls, and most importantly ... </p>
					<p> ... improving his eyesight. The world is so beautiful! There is so much to see! Square eyes just aren't enough to take it all in. Would you help Square Ogre add some more corners to that eye?</p>
				</div>
			</section>

			<section class="horizontalNoFlex">
				<img src="https://i.imgur.com/uMqu9S5.png" class="imageAsHeading" />
				<!-- <h1>Round Ogre</h1> -->
				<p>The story of Square Ogre doesn't end here! (Well, it does for now, but soon that will change.)</p>
				<p>To keep this game simple and streamlined, I decided to split it into two games, with the latter one called <em>Round Ogre</em>.</p>
				<p>She has no trouble seeing, with her perfectly round eyes, but ... that creates a whole other sort of trouble.</p>
				<p>She's just too enthusiastic about life! She wants to see it all! She can barely keep her eyes closed, but when you finally manage to do so ... well, that's awkward, she might be sleepwalking for quite some time.</p>
				<p style="text-align: center;"> <a href="https://pandaqi.com/round-ogre">Round Ogre (COMING SOON)</a> </p>
			</section>

			<img src="https://i.imgur.com/VX2InoL.png" class="imageAsHeading" />
			<!-- <h1>More than a game!</h1> -->
			<section class="horizontalFlex">
				<div class="nonTextSide">
					<img style="max-width:100%;" src="https://i.imgur.com/l3GV72A.png" />
				</div>

				<div>
					<p>This game is actually an extension to an <em>interactive picture book</em> I published in the Netherlands:</p>
					<p style="text-align: center;"> <a href="https://nietdathetuitmaakt.nl/boeken/vierkante-ogre">Vierkante Ogre (prentenboek)</a> </p>
					<p>If you're Dutch, and you like the look of this game, I highly recommend checking out this book and supporting my work!</p>
					<p>Below is the setup of Square Ogre's story. This is <em>not</em> part of the game: that just contains the puzzles.</p>
				</div>
			</section>

			<section class="horizontalNoFlex">
				<img src="https://i.imgur.com/g8vxevW.png" class="imageAsHeading" />
				<!-- <h1>The Curse of the Ogres</h1> -->
				<p>Long ago, Ogres roamed our lands. They were a welcome sight, a happy sight, as they brought joy everywhere with their odd games and interesting sports.</p>
				<img src="https://i.imgur.com/ZrECc8j.png" style="max-width:300px;float:right; margin:10px;" />
				<p>But then they disappeared.</p>
				<p>Dear reader, you will learn that a terrible and mysterious curse plagues the Ogrefolk: as they grow older, they become blind! They've tried to escape their cave for centuries now, but nobody can find the exit with their blurry sight.</p>
				<p>Until one day Square Ogre wakes up from a nightmare ... and finds himself touched by the curse. His sight becomes fuzzy and any glance at a lamp causes him to lose the game. He can't run through the halls anymore, can't play with this friend <em>Round Ogre</em>, can't do anything!</p>
				<p>What's up with this curse? Where does it come from and what does it do? Will he ever be able to see his friend again?</p>
				<p>Will the Ogres ever find the exit?</p>
			</section>

			<section class="horizontalNoFlex">
				<img src="https://i.imgur.com/XyLNVtS.png" class="imageAsHeading" />
				<!-- <h1>Feedback</h1> -->
				<p>Played the game? Liked it? Didn't like it? Whatever it is, don't hesitate to contact me:</p>
				<p style="text-align: center;"> <a href="mailto:askthepanda@pandaqi.com">askthepanda@pandaqi.com</a></p>
				<p>I love hearing your stories. And your feedback will only make this game better.</p>
				<p>Want to support me and ensure the creation of more awesome games? Consider buying the paid premium version of the game. Or leave a tip. Or donate. Or share the word. Anything is appreciated!</p>
			</section>
		</main>


<?php

require '../../footer.php';

?>

		