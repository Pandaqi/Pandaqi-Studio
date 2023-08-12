<?php
	require '../../default_headers.php';
?>
		<title>Company of the Tackling Tourists&mdash;Monuments, gotta visit them aaaaall!</title>

		<!-- Favicon -->
		<link rel="icon" type="image/png" href="gamesites/company-of-the-tackling-tourists/favicon.png" />

		<!-- Arvo (body text), Hammock (heading text) => but no hammock actually appears, because it's baked into the images! -->
		<link rel="preconnect" href="https://fonts.googleapis.com">
		<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
		<link href="https://fonts.googleapis.com/css2?family=Arvo:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet"> 

		<link rel="stylesheet" href="gamesites/company-of-the-tackling-tourists/stylesheet.css" />

		<style type="text/css">
			body {
				background-image: url(https://i.imgur.com/1oBYaTo.png);
				background-repeat: repeat-y;
				background-position: center;
				background-color: #070110;
				background-size: 100%;
				font-family: 'Arvo', sans-serif;
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

			.image-as-header {
				margin-top: 50px;
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

			.buyLink {
				display: inline-block;
				padding: 20px;
				background-color: #6BB73E;
				color: rgba(0,0,0,0.75);
				border-radius:0.5em;
				text-decoration: none;
				font-family: 'HAMMOCK', cursive;
				font-size: 42px;

				transition: background-color 0.5s, color 0.5s;
				box-shadow: 0 0 10px 2px #333;

				margin: 10px;
				max-width: 100%;

				padding-top: 10px; /* Hammock likes too much space at the top */
			}


			.buyLink:hover {
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

			p {
				padding-right: 10px;
				box-sizing:border-box;
			}

			main a {
				color: #5b2c15;
			}

			#downloadBtnContainer {
				text-align:center; 
				display: flex; 
				justify-content: center; 
				flex-wrap: wrap;
			}

			@media all and (max-width: 600px) {
				#downloadBtnContainer {
					margin-top: 30px;
				}
			}
		</style>

	</head>

	<body>
		<main>
			<section id="gameHeader" style="position:relative;">
				<img src="https://i.imgur.com/BjWju0w.png" />
				<div class="videoOverHeader">
					<div class="videoContainer">
						<iframe width="560" height="315" src="https://www.youtube.com/embed/MQ7srCHHXZg" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
					</div>
				</div>
			</section>

			<section id="downloadBtnContainer">
				<div id="desktopDownloadBtn">
					<a href="http://pandaqi.itch.io/company-of-the-tackling-tourists" class="buyLink">Buy (7 euros)</a>
					<p style="margin-top:0px; margin-bottom:30px; font-size: 14px; opacity: 0.75;">(Windows, Mac, Linux)</p>
				</div>
				<div id="desktopDownloadBtn">
					<a href="http://pandaqi.itch.io/company-of-the-tackling-tourists" class="buyLink">Download (free demo)</a>
					<p style="margin-top:0px; margin-bottom:30px; font-size: 14px; opacity: 0.75;">(Windows, Mac, Linux)</p>
				</div>
			</section>

			<p>Welcome to your new job as a tour guide! </p>
			<p>You must be excited to guide these well-paying tourists to beautiful landmarks. I mean, who hasn't heard of the Eiffel shower? Or the Leaning Tower of Pizza?</p>
			<p>
			  But what’s this? It seems our rival companies appeared here at the same time!&nbsp;And is ... is that a crocodile sneaking towards your tourists?</p>
			<p>You know what? I'll be going now, good luck! Guide your tourists to all landmarks on the map before anyone else &hellip; and without – ehm – “losing” too many of them.</p>
			<p>We're glad to have you at the <em>Company of the Tackling Tourists</em>!</p>
			
			<section>
				<img class="image-as-header" src="https://img.itch.zone/aW1nLzY5ODYwNDkucG5n/original/a3%2ByfB.png">

				<p>A random world is generated, full of wonderful landmarks, but also full of hazards.&nbsp;</p>
				<p><strong>Be the first player to succesfully visit all landmarks.</strong> (Which gets you into the Taj Mahall of Fame.)</p>
				<p>To help with that, you'll need to pick up the right tourists along the way ... and lose them when they've become a burden. </p>
				<p><em>The Hanging Barbers</em> must be visited in the correct order, whilst the <em>Unique Horn</em> can only be visited with unique tourists, and the <em>Kilivanjaro </em>will drive around the map changing location.</p>
				<p>A game about being more speedy and creative than the other players, which comes down to good tourist management, quick reflexes amidst the chaos, and smart strategy.</p>
				<p>Oh, and, when two players meet, their tourists might just tackle each other off the map. Which, you know, is bad for the reviews.</p>
			</section>

			<section>
				<img class="image-as-header" src="https://img.itch.zone/aW1nLzY5ODYwNTIucG5n/original/OHaZ6i.png">

				<p>This game supports <strong>2-4 players</strong> (locally) using whatever combination of <strong>controllers and keyboard</strong> you want. Games last roughly <strong>5 minutes.</strong></p>
				<p>Accessible to anyone - with one simple objective and control - but with enormous depth for those that seek it. As they say: easy to pick up, hard to master.</p>
				<p>To play the game, you only need one control.</p>
				<img src="https://img.itch.zone/aW1nLzY5OTExNTIucG5n/original/l7rKL4.png">
				<p>Once more hazards appear, however, you'll long for stronger and more varied movement.</p>
				<img src="https://img.itch.zone/aW1nLzY5OTExNTUucG5n/original/0bC1O2.png">
				<img src="https://img.itch.zone/aW1nLzY5OTExNTYucG5n/original/nU%2FgGd.png">
			
			</section>

			<section>
				<img class="image-as-header" src="https://img.itch.zone/aW1nLzY5ODYwNTMucG5n/original/2tVD2L.png">

				<p>This game uses a new "tutorial" system I invented, after many frustrations with how games teach themselves.</p>
				<p>It removes any annoying "upfront learning" and makes learning the game a piece of cake!</p>
				<p>Each time you start the next <em>campaign</em> level, you are shown 1-3 "cards". </p>
				<p><img src="https://img.itch.zone/aW1nLzY5OTEwMjAucG5n/original/VCgVb9.png"></p>
				<p>Press anything to reveal ( = flip) the next card. It will give you one new snippet of information, with text and images, like "new control: dashing" or "new landmark: the eiffel shower".</p>
				<p>Once all cards are flipped, the game starts! </p>
				<p>This way, the game&nbsp;never overwhelms you with information, you can read the new bits at your own pace, and will be playing within 30 seconds. (Anything that can be taught interactively, such as which buttons to press, is done so.)</p>
				<p><img src="https://img.itch.zone/aW1nLzY5OTEwMjMucG5n/original/RdWyrH.png"></p>
			</section>
			
			<section>
				<img class="image-as-header" src="https://img.itch.zone/aW1nLzY5ODYwNTUucG5n/original/YzVubH.png">

				<p>The <strong>full game</strong> contains 20 terrain types, 20 tourist types, and 30 landmarks.</p>
				<p>If you choose the <strong>campaign</strong>, you'll learn all these elements in order, each level adding one new cool thing. (The first worlds teach essential mechanics. You could easily stop there, if you're satisfied with that. The rest can be seen as "DLCs".)</p>
				<p>If you choose <strong>free play</strong>,  you handpick the elements you want to appear, creating a random world that only contains the landmarks/tourists/terrain <em>you</em> like best.</p>
				<p>Want to get a taste first? There's a <strong>generous demo version. </strong>My main goal with these games is to give people cool experiences to enjoy together, not make as much money as possible. Additionally, I believe you have the right to test games before buying, <em>especially</em> local multiplayer ones.</p>
				<p>This demo contains the first 4 worlds of the campaign and 9 options per element (terrain/tourist/landmark) in free play. It's completely free to download, play, and enjoy forever.</p>
				<p><em>Remark:</em> to make the game as easy to understand as possible, especially for non-English players,  it communicates a lot via icons (on landmarks, when giving feedback, etc.). This can be turned off in the settings, if you prefer written (English) feedback.</p>
			</section>

			<section>
				<img class="image-as-header" src="https://img.itch.zone/aW1nLzY5ODYwNTYucG5n/original/2Rh1Mb.png">

				<p>For <em>all</em> the details behind development, visit my devlog: <a href="https://pandaqi.com/blog/company-of-the-tackling-tourists" target="_blank">[Devlog] Company of the Tackling Tourists</a></p>
				<p>To play my other local multiplayer games (which are all completely free): </p>
				<ul>
					<li><a href="https://pandaqi.com/a-recipe-for-disaster">A Recipe for Disaster</a></li>
					<li><a href="https://pandaqi.com/i-wish-you-good-hug">I Wish You Good Hug</a></li>
					<li><a href="https://pandaqi.com/totems-of-tag">Totems of Tag</a></li>
				</ul>
				<p>If you played the game, let me know! Feedback, positive or negative, is always good.</p>
				<p>This game is finished, but that doesn't mean the idea is finished. With some major changes to its core, I think the game could shine as a 3D (party)game with&nbsp;support for 1-6 players. If this game becomes popular enough, and with your valuable feedback, that sequel will be made!</p>

			</section>

		</main>


<?php

require '../../footer.php';

?>

		