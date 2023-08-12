<?php
	require '../../default_headers.php';
?>
		<title>Into My Arms&mdash;Cute puzzling for 1-2 players on mobile</title>
		<link rel="icon" type="image/png" href="https://i.imgur.com/eP04L1T.png" />

		<link href="https://fonts.googleapis.com/css?family=ABeeZee" rel="stylesheet"> 
		<link href="https://fonts.googleapis.com/css?family=Caveat" rel="stylesheet">

		<style type="text/css">
			body {
				background-image: url('gamesites/into-my-arms/itch_bg.png');
				background-repeat: repeat-y;
				background-position: center;
				background-color: #0498FD;
				font-family: 'ABeeZee';
				font-size: 20px;
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

			.gifContainer {
				max-width: 100%;
				box-sizing: border-box;
			}

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

				border: 5px solid #424;
				border-radius: 5px;
				box-shadow: #202 0 0 10px 2px;
			}

			h1 {
				font-family: 'Caveat';
				text-align: center;
				font-size:52px;
				margin-bottom: 0px;
				margin-top: 62px;

				color: black;
				text-decoration: none;
				text-transform: none;
			}

			.buyLink {
				display: inline-block;
				padding: 20px;
				background-color: #0A2A43;
				color: white;
				border-radius:0.5em;
				text-decoration: none;
				font-family: 'Caveat';
				font-size: 32px;

				transition: background-color 0.5s, color 0.5s;
				box-shadow: 0 0 10px 2px #333;

				margin: 10px;
				max-width: 100%;
			}


			.buyLink:hover {
				background-color: white;
				color: #333;
			}

			.horizontalFlex {
				display: flex;
				align-items: center;
				position: relative;
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

			main a {
				display: inline-block;
				padding: 20px;
				background-color: #0A2A43;
				color: white;
				border-radius:0.5em;
				text-decoration: none;
				font-family: 'Caveat';
				margin: 10px;

				transition: background-color 0.5s, color 0.5s;
				box-shadow: 0 0 10px 2px #333;
				max-width: 250px;
				font-size: 24px;
			}

			main a:hover {
				background-color: white;
				color: #333;
			}

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
				<img src="https://i.imgur.com/DalXFXm.png" />
				<div class="videoOverHeader">
					<div class="videoContainer">
						<iframe width="560" height="315" src="https://www.youtube.com/embed/L3HQCfPT7n8" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
					</div>
				</div>
			</section>

			<section style="text-align:center; display: flex; justify-content: center; flex-wrap: wrap;">
				<div id="desktopDownloadBtn">
					<a href="http://pandaqi.itch.io/into-my-arms" class="buyLink">Download "Into My Arms" (free)</a>
					<p style="margin-top:10px; color: darkblue; margin-bottom:30px;">(Windows, Mac, Linux)</p>
				</div>

				<div>
					<a href="https://play.google.com/store/apps/details?id=com.pandaqi.intomyarms" class="buyLink">Download "Into My Arms" (free)</a>
					<p style="margin-top:10px; color: darkblue; margin-bottom:30px;">(Android)</p>
				</div>
			</section>

			<script>
			function getMobileOperatingSystem() {
			  var userAgent = navigator.userAgent || navigator.vendor || window.opera;

			      // Windows Phone must come first because its UA also contains "Android"
			    if (/windows phone/i.test(userAgent)) {
			        return "Windows Phone";
			    }

			    if (/android/i.test(userAgent)) {
			        return "Android";
			    }

			    // iOS detection from: http://stackoverflow.com/a/9039885/177710
			    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
			        return "iOS";
			    }

			    return "unknown";
			}

			// Hide the DESKTOP download button if we're on android anyway
			if(getMobileOperatingSystem() == 'Android') {
				document.getElementById('desktopDownloadBtn').style.display = 'none';
			}
			</script>

			<!-- style="width:50vw;height:28.125vw;" -->
			<section style="text-align:center;">
				
			</section>

			<section class="horizontalFlex">
				<div class="nonTextSide">
					<img src="https://img.itch.zone/aW1nLzI3MjI0ODMuZ2lm/original/wxI5ds.gif" class="gifContainer"/>

				</div>
				<div style="padding-left:10px;">
					<p>Once upon a time, a witch gave two lovers a terrible curse: <strong>they were never allowed to see each other again!</strong></p>
					<p>The only way to make the witch change her mind, is by solving 40 puzzles and proving your love is strong enough.</p>
					<p>But how, if they may never look at each other?</p>
					<p>Well, by making <strong>a leap of faith</strong>.</p>
					<p>The only way to pass each stage, is by falling backwards from a great height. Falling into your lover's arms ... that's how love will bloom tonight.</p>
				</div>
			</section>

			<section>
				<h1>Screenshots</h1>
			</section>

			<section class="screenshotGallery">
				<div><img src="https://i.imgur.com/SRnYbF9.png" /></div>
				<div><img src="https://i.imgur.com/lGGbwn4.png" /></div>
				<div><img src="https://i.imgur.com/mRfcsem.png" /></div>
				<div><img src="https://i.imgur.com/WyU5WHf.png" /></div>
				<div><img src="https://i.imgur.com/o3R9KFM.png" /></div>
				<div><img src="https://i.imgur.com/0FRiQkp.png" /></div>

				<div><img src="https://i.imgur.com/NwcfaDj.png" /></div>
				<div><img src="https://i.imgur.com/lJv6KpI.png" /></div>
				<div><img src="https://i.imgur.com/mRvGgtI.png" /></div>
				<div><img src="https://i.imgur.com/uxGIXWX.png" /></div>

				<div><img src="https://i.imgur.com/6wRahLK.png" /></div>
				<div><img src="https://i.imgur.com/RoGojCT.png" /></div>
				<div><img src="https://i.imgur.com/xZgG5TA.png" /></div>
			</section>

			<section class="horizontalNoFlex">
				<h1>Co-op puzzling</h1>
				<p>As with all my games, "Into My Arms" was originally designed as a local multiplayer game: each player simply controls one of the two lovers!</p>
				<p>This game is perfect to play with a friend, or for a parent to play with their kids, or maybe even as an ice-breaker on a first date :p</p>
				<p>Single player mode is just as enjoyable, but slightly harder, as it's more challenging to keep track of two players on your own!</p>
			</section>

			<section class="horizontalNoFlex">
				<h1>Some interesting facts</h1>
				<p>The title of the game is taken from the beautiful song <strong>Into My Arms</strong> by <strong>Nick Cave</strong>.</p>
				<p>The game has <strong>40 levels</strong> and a story about love and faith that elegantly matches all the mechanics in the game.</p>
				<p>The game was made in <strong>Godot Game Engine</strong>. Source code (for the original version) is available here:</p>
				<p style="text-align:center;"><a href="https://github.com/Pandaqi/Into-My-Arms">Into My Arms - Source</a></p>
			</section>

			<section class="horizontalNoFlex">
				<h1>Deluxe Edition</h1>
				<p>This game was originally made in two weeks for the Github Game Off (a month-long game contest). It won 11th place (out of 237)!</p>
				<p>This motivated me to turn it into a full game, which is the version you see on this page.</p>
				<p>But I'm not done yet. I think this game could be even bigger, better, beautifuler! (I know, it's "more beautiful", but that would destroy the alliteration I had going.)</p>
				<p>If you want to know when this "deluxe edition" is released, consider following me on any of my platforms:</p> 
				<p style="text-align:center;">
					<a href="http://pandaqi.itch.io/into-my-arms">Follow the game on itch.io</a> 
					<a href="https://www.youtube.com/channel/UCUegxnNkcycM67gvyeD4CEQ">Subscribe on YouTube</a>
					<a href="about/subscribe">Email newsletter</a>
				</p>
			</section>
		</main>


<?php

require '../../footer.php';

?>

		