<?php
	require '../../default_headers.php';
?>
		<title>I wish you good hug&mdash;Help create a teddy bear topia</title>

		<!-- Favicon -->
		<link rel="icon" type="image/png" href="gamesites/i-wish-you-good-hug/favicon.png" />

		<!-- Original Surfer + Orelega One + Zilla Slab (thinner version of Orelega, fits better here) -->
		<link rel="preconnect" href="https://fonts.gstatic.com">
		<link href="https://fonts.googleapis.com/css2?family=Orelega+One&family=Original+Surfer&display=swap" rel="stylesheet"> 
		<link href="https://fonts.googleapis.com/css2?family=Zilla+Slab:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet"> 
		
		<style type="text/css">
			body {
				/*background-image: url(https://i.imgur.com/uOasoF9.png);
				background-repeat: repeat-y;
				background-position: center;*/
				background-color: #94FF8C;
				background-size: 100%;
				font-family: 'Zilla Slab', cursive;
				font-size: 20px;
				line-height: 140%;
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
				font-family: 'Original Surfer', cursive;
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
				font-family: 'Original Surfer', cursive;
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
				<img src="https://i.imgur.com/hVCxjM3.png" />
				<div class="videoOverHeader">
					<div class="videoContainer">
						<iframe width="560" height="315" src="https://www.youtube.com/embed/9Qwpho6_8uc" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
					</div>
				</div>
			</section>

			<section style="text-align:center; display: flex; justify-content: center; flex-wrap: wrap;">
				<div id="desktopDownloadBtn">
					<a href="http://pandaqi.itch.io/i-wish-you-good-hug" class="buyLink">Download</a>
					<p style="margin-top:0px; margin-bottom:30px; opacity: 0.5;">(Windows, Mac, Linux, Android; itch.io)</p>
				</div>

				<div>
					<a href="https://play.google.com/store/apps/details?id=com.pandaqi.i_wish_you_good_hug" class="buyLink">Download</a>
					<p style="margin-top:0px; margin-bottom:30px; opacity: 0.5;">(Android; Play Store)</p>
				</div>
			</section>
			<section style="text-align:center;">
				
			</section>

			<section>
				<p>You have been given the most important task known to mankind: <span style="color:purple;">making sure that teddybears get the soft, warm hugs they deserve!</span></p>
				<p>In "I Wish You Good Hug", 1-4 players will cooperatively try to grab teddy bears (by hugging them) and (gently) throw them in the arms of their fellow players. Why? So they'll eventually end up in a warm soft bed!</p>
				<p>But <span style="color:#43610d;">... you can only <em>move</em> and <em>rotate</em></span>.</p>
				<p>So we've added some very special cells to help you, such as trampolines that periodically shoot the teddy bears, stores where you can buy pillows, and holes where you can throw away those prickly cacti that sometimes appear.</p>
				<p>A short couch coop chaos game for 1-4 players. A campaign with 27 levels. A cute and warm hug, in video game form.</p>
			</section>

			<section>
				<h2>Controls</h2>
				<p>This game is playable ... </p>
				<ul>
					<li>On <span style="color:#b8341f;">Windows/Mac/Linux</span> with any combination of keyboard and controllers</li>
    				<li>On <span style="color:#b8341f;">Android</span>. Make sure multitouch is on and (media) gestures are off.</li>
    			</ul>
    			<p>The full game only has two controls: move your character around and rotate it.</p>
    			<p>This means it's simple to pick up and playable by literally anyone. But not because it's an easy game &mdash; oh no, properly hugging is never easy!</p>

    			<img src="https://i.imgur.com/0gXJwcW.png" />
    			<img src="https://i.imgur.com/w33WI08.png" />
			</section>

			<section>
				<h2>What do I do?</h2>
				<p>The objective is the same throughout the whole game: <span style="color:purple;">get teddy bears to where they want to go!</span></p>
				<p>However, you can only grab bears by hugging them, and there are a great many thorny obstacles to avoid on your way. You must move past cacti, alarm clocks, shooters, and more, whilst being correctly rotated to hug the things you want to hug.</p>
				<img src="https://i.imgur.com/O0KhGMq.png" />
				
				<p>Additionally, there's an annoying but necessary secret ingredient called <em>teamwork</em>. Each player has their own area and cannot (easily) visit others, which means you'll have to communicate, hand your bears to your teammates, and make sure they are rotated correctly to receive them.</p>
				<p>In other words: throwing a bear in this game is the ultimate trust hug.</p>
			</section>

			<section>
				<h2>Other links</h2>
				<p>This game was featured on the GamesKeys website (as a handpicked, underplayed mobile game):</p>
				<div style="text-align: center;">
					<a href="https://gameskeys.net/product/i-wish-you-good-hug/">I Wish You Good Hug (on GamesKeys)</a>
				</div>
			</section>

			<section>
				<h2>The 1-week challenge</h2>
				<p>I love couch co-op games and have tons of cute, little ideas for them.</p>
				<p>However, I have the tendency to make every project TOO BIG, so I challenged myself to make those tiny ideas in just a week. This is the second game made via this challenge. The first game was "A Recipe for Disaster".</p>
				<div style="text-align: center;">
					<a href="https://pandaqi.com/a-recipe-for-disaster">A Recipe for Disaster</a>
				</div>
				<p>Originally, this game was called <em>Huggy Bastard</em> ... but that didn't seem very family friendly and might have given the wrong impression. So I changed it last-minute.</p>
				<p>If you have any <em>feedback</em> (improvements, bugs, things that are unclear/too hard/too easy, etc.), never hesitate to let me know. Even though I can do a lot of development in a week, these games are bound to have areas that can be greatly improved with your feedback.</p>
				<p>For a more detailed "devlog" (with the lessons I learned, the original idea, etcetera), visit ...</p>

				<div style="text-align: center; margin-bottom: 50px;">
					<a href="https://pandaqi.com/blog/devlog-i-wish-you-good-hug" style="margin: auto;">I Wish You Good Hug: What I've Learned</a>
				</div>
			</section>

		</main>


<?php

require '../../footer.php';

?>

		