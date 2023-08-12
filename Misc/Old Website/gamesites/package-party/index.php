<?php
	require '../../default_headers.php';
?>
		<title>Package Party&mdash;Local multiplayer for everyone about delivering packages</title>
		<link rel="icon" type="image/png" href="gamesites/package-party/favicon.png" />

		<link href="https://fonts.googleapis.com/css?family=Fredoka+One" rel="stylesheet"> 
		<link href="https://fonts.googleapis.com/css?family=Open+Sans&display=swap" rel="stylesheet">

		<style type="text/css">
			body {
				background-image: url('gamesites/package-party/itch_bg.png');
				background-repeat: repeat;
				font-family: 'Open Sans';
				font-size: 20px;
			}

			main {
				max-width: 900px;
				margin: auto;
			}

			#gameHeader {
				text-align: center;
				display:none;
			}

			#gameHeader > img {
				max-width: 100%;
			}

			.gifContainer {
				max-width: 100%;
				box-sizing: border-box;
			}

			.videoContainer, .gifContainer {
				border: 10px solid brown;
				border-radius: 0.5em;
				box-shadow: 0 0 10px 5px black;
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

			h1 {
				font-family: 'Fredoka One';
				/*text-align: center;*/
				font-size:42px;
				margin-bottom: 0px;
				margin-top:0px;

				color: #330000;
			}

			.buyLink {
				margin-top:60px;
				display: inline-block;
				padding: 20px;
				background-color: brown;
				color: white;
				border-radius:0.5em;
				text-decoration: none;
				font-family: 'Fredoka One';

				transition: background-color 0.5s, color 0.5s;
				box-shadow: 0 0 10px 2px #333;
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
				margin-right: 20px;
				text-align: center;

				margin-bottom: 10px;
			}

			main a {
				display:block;
				padding: 20px;
				background-color: #0E6A43;
				color: white;
				border-radius:0.5em;
				text-decoration: none;
				font-family: 'Fredoka One';

				transition: background-color 0.5s, color 0.5s;
				box-shadow: 0 0 10px 2px #333;
			}

			main a:hover {
				background-color: white;
				color: #333;
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

			@media all and (max-width: 600px) {
				
				#gameHeader {
					display:block;
				}
			}
		</style>

		<!--
		GOLDEN RULES OF LANDING PAGES:
		 -> No navigation (people will click through, get distracted, clutters the page)
		 -> Big, wide images that show off your game
		 -> Start with trailer or animated GIF (that shows game as quickly as possible)
		 		=> HOLY GRAIL: (autoplay) trailer inside a big wide header image!
		 -> Put download buttons above the fold/as high as you can => the page was designed to make people download/buy, so use it in that way
		 -> Add some movement, but keep it simple otherwise => very simple but clean landing pages are known to sell better
		 -> Add a press kit; maybe not at the top, but somewhere it's easy to find

		 -> Add quotes/reviews as early as you can (and make them look nice and like your game is absolutely amazing)
		       => Social proof is really powerful

		 -> When you add screenshots, make sure they are from different settings and don't look very similar. (Maybe even different color palette.)

		-->
	</head>

	<body>
		<main>
			<section id="gameHeader">
				<img src="gamesites/package-party/name_logo_itch.png" />
			</section>

			<!-- TO DO: Put impressive image on background, once I have an impressive image -->

			<!-- style="width:50vw;height:28.125vw;" -->
			<section style="margin-top:20px;">
				<div class="videoContainer">
					<iframe src="https://www.youtube.com/embed/Fcyjk8app9w" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
				</div>
			</section>

			<section style="text-align:center;">
				<a href="http://pandaqi.itch.io/package-party" class="buyLink">Buy Package Party on itch.io for &euro;5</a>
				<p style="margin-top:0px; color: #333; margin-bottom:60px;">(or try the free demo there)</p>
			</section>

			<section class="horizontalFlex imageRight">
				<div class="textSide">
					<p><strong>Package Party</strong> is a local multiplayer (“couch co-op”) game for literally anyone. Gather your friends, family, kids, girlfriend, boyfriend, neighbors, neighbor’s dog – and start working together to deliver packages!
					  </p>
					<p>Up to 4 people must cooperate and coordinate to get those pesky boxes where they belong &hellip; without damaging them too much or arriving two hours too late.
					  </p>
					<p>Sounds easy, I hear you say. I could do that alone, I hear you think.
					  </p>
					<p>Oh, you sweet summer child. 
					  </p>
				</div>
				<div class="nonTextSide">
					<img src="https://i.imgur.com/RaqMnfD.gif" class="gifContainer" />
				</div>
			</section>

			<section class="horizontalFlex">
				<div class="nonTextSide">
					<img src="https://i.imgur.com/GAT3Kgr.gif" class="gifContainer" />
				</div>
				<div class="textSide">
					<p>There will be &hellip;
					  <br></p>
					<ul><li>Conveyor belts
					  </li><li>Ravines
					  </li><li>Moving bridges
					  </li><li>Gates that somehow always seem closed
					  </li><li>Security cameras with lasers that kill you (people and their security these days &hellip;)
					  </li><li>Trampolines
					  </li><li>Catapults
					  </li><li>Farm animals that get in the way
					  </li><li>Police that doesn’t like it when you run a traffic light because you’re in a hurry
					  </li><li>Orders from Santa Claus himself
					  </li><li>A mix of many genres: action, platforming, stealth and puzzle solving
					  </li><li>And much more!
					  </li></ul>
				</div>
			</section>

			<section class="horizontalFlex imageRight">
				<div class="textSide">
					<h1>Is this game for me?</h1>
					<p>Do you need a party game? Or a game you could play with people who’ve never played a game before? (Or those who always say "nah, I'm just not that into gaming"?)</p>
					<p>Do you want to spend quality time with your dear ones, and do you have 1-4 players and a (somewhat) working computer? </p>
					<p>Then Package Party might be the game for you.</p>
					<div class="gameObject" data-type='panda' data-id='9' data-top='-10px' data-left='-10px'></div>
				</div>
				<div class="nonTextSide">
					<img src="https://i.imgur.com/IfsmsG8.gif" class="gifContainer" />
				</div>
			</section>

			<section class="horizontalFlex">
				<div class="nonTextSide">
					<img src="https://i.imgur.com/f24v5pF.gif" class="gifContainer">
				</div>
				<div class="textSide">
					<h1>Simple controls, deep gameplay</h1>
					<p>Package Party is so easy to pick up that literally anyone can join in the fun: gamers and non-gamers alike.</p>
					<p>For example, the first two worlds of the game only require a <em>single button</em> (for moving around).</p>
					<p>Any time a new mechanic is introduced, it's explained with quick animated video tutorials, right when you need it.</p>
					<p>But don't let that fool you. As the game progresses, only the most capable and talented delivery workers will be able to get that three star score!
				</div>
			</section>

			<section class="horizontalFlex imageRight">
				<div class="textSide">
					<h1>Succeed together, fail together</h1>
					<p>This game was designed to be <em>cooperative</em> and <em>local multiplayer</em>.<br></p>
					<p>Why did I do this? Because I think local multiplayer games are awesome and the strongest form of gaming. Sure, there’s many online multiplayer games, but local co-op will always have my preference. It’s just a stronger experience, as you’re physically close to each other and can actually communicate by speaking, gestures, pointing, taking over somebody else’s controller, whatever.
					  </p>
					<p>This game will allow you to connect with anyone (friends, family, partner, stranger on the bus) and have a fun time together, in real life. This is, in my opinion, what games are meant to be.
					  </p>
					<p>I’ve seen couch co-op games start new relationships, strengthen current relationships, and generally lead to a quality time for everyone. (Even those who aren’t playing, but just watching.)
					  </p>
					<p>That’s the force of good I want to be in this world: to make people laugh, cooperate, talk, and play together. And to introduce non-gamers, or only casual gamers, to a whole new world of possibilities and awesome experiences.
					  </p>
				</div>
				<div class="nonTextSide">
					<img class="gifContainer" src="https://i.imgur.com/ITAVWoL.gif">
				</div>
			</section>

			<section class="horizontalFlex">
				<div class="nonTextSide">
					<img class="gifContainer" src="https://i.imgur.com/M4nOgzx.gif">
				</div>
				<div class="textSide">
					<h1>Early Access</h1>
					<p>The game is currently in Early Access. To see what that means (which features are present and promised) ... </p>
					<p><a href="http://pandaqi.itch.io/package-party">Visit the itch.io page!</a></p>
				</div>
			</section>

			<section class="horizontalFlex imageRight">
				<div class="textSide">
					<h1>Stay updated?</h1>
					<p>I write and record weekly <strong>devlogs</strong> about the game!</p>
					<p><a href="https://pandaqi.itch.io/package-party/devlog">Package Party Written Devlog</a></p>
					<p><a href="https://www.youtube.com/playlist?list=PLdcjUlpB8mtsHLwNP-A_OfCMGNBOwlwjk">Package Party Video Devlog</a></p>
					<p style="margin-top:40px;">To receive all updates...</p>
					<p><a href="http://pandaqi.itch.io/package-party">Follow the game on itch.io</a></p>
					<p><a href="https://www.youtube.com/channel/UCUegxnNkcycM67gvyeD4CEQ">Subscribe to my YouTube channel</a></p>
					<p><a href="about/subscribe">Subscribe to my Email newsletter</a></p>
				</div>
				<div class="nonTextSide">
					<img class="gifContainer" src="https://i.imgur.com/HEz2T0P.gif">
				</div>	
			</section>
		</main>


<?php

require '../../footer.php';

?>

		