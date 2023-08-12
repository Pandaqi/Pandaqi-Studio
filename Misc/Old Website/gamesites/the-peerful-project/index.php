<?php
	require '../../default_headers.php';
?>
		<title>The Peerful Project - Free Multiplayer Games for Everyone</title>
		<link rel="icon" type="image/png" href="gamesites/the-peerful-project/peerfulProject-favicon.png" />

		<!-- QUIRKY/FUN font, headings, from Google Fonts -->
    	<link href="https://fonts.googleapis.com/css2?family=Capriola&display=swap" rel="stylesheet">

    	<!-- Body/workhorse font - Rubik - alternative to Simplifica? -->
    	<link href="https://fonts.googleapis.com/css2?family=Rubik:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet"> 

		<style type="text/css">
			/*
				COLOR SCHEME:

				(beige-like):   #f9dbbd;     "peach puff"
				(light pink):   #ffa5ab;     "schauss pink"
				(darker pink):  #da627d;     "blush"
				(even darker):  #a53860;     "rich maroon"
				(dark scarlet): #450920;     "dark scarlet"

			*/

			/*
				FONTS TO REMEMBER:

				Patua One (mostly header font);
				Rubik (used it here);
				Poppins (good body font);

				FONTS THAT DIDN'T MAKE THE CUT (too illegible, or didn't fit the atmosphere)
				
				Penna
				Simplifica
			*/

			h1, h2, h3, h4, h5, h6 {
				font-family: 'Capriola', sans-serif;
				text-decoration: none;
				text-transform: none;
				line-height: 120%;
				margin-bottom: -10px;

				transition: color 0.3s, font-size 0.3s;
			}

			h1 {
				font-size: 5vw;
			}

			h2 {
				font-size: 42px;
			}

			#questContainer h2 {
				font-size: 22px;
			}

			body {
				font-family: 'Rubik', sans-serif;
				font-size: 16pt;

				/*
				font-family: "Simplifica";
				font-size: 20pt;
				letter-spacing: 1px;
				*/
				
				overflow-y: scroll;
				overflow-x: hidden;

				background-color: #f9dbbd;
			}

			/* The hero image */
			.hero-image {
			  /* Use "linear-gradient" to add a darken background effect to the image (photographer.jpg). This will make the text easier to read */
			  background-image: linear-gradient(rgba(69, 9, 32, 0.75), rgba(69, 9, 32, 0.75)), url("gamesites/the-peerful-project/peerfulProject-header.gif");

			  min-height: 500px;

			  background-position: center bottom;
			  background-repeat: no-repeat;
			  background-size: contain;
			  position: relative;

			  display:flex;
			  justify-content: center;
			  align-content: center;
			  align-items: center;

			  image-rendering: pixelated;
        	  image-rendering: -moz-crisp-edges;
        	  image-rendering: crisp-edges;

			  
			  transition: all 0.3s;

			  /* meh, transition on background (size) is not well-supported at all */
			  -moz-transition: background 0.3s;
			  -webkit-transition: background 0.3s;
			  -ms-transition: background 0.3s;
			  -o-transition: background 0.3s;
			}

			.hero-image h1, .hero-image h2 {
				margin-top:0px;
				margin-bottom:-25px;
			}

			.hero-text, .center-text {
			  margin:auto;
			  max-width: 960px;
			  text-align: center;
			  color: white;
			  font-size: 20pt;
			  box-sizing: border-box;
			  padding:10px;
			  padding-bottom:40px;
			  padding-top:40px;
			}

			.center-text {
				font-size: 16pt;
				max-width: 600px;
			}

			.hero-tagline {
				font-variant: small-caps;
				font-size: 16pt;
				color: #ffa5ab;
			}

			.hero-image a.pageLink {
				border-radius: 5px;
				background-color: #450920;
				color: #f9dbbd;
				padding: 5px;
				padding-left: 10px;
				padding-right: 10px;
				text-decoration: none;
				display: inline-block;
				margin: 10px;

				transition: background-color 0.3s, color 0.3s;
			}

			.hero-image a.pageLink:hover {
				background-color: #f9dbbd;
				color: #450920;
			}

			a.fullSizeLink {
				display:block;
				margin:0;
				padding:0;
				width:100%;
				height:100%;

				text-decoration: none;
			}

			a.fullSizeLink:hover h2 {
				color: #ffa5ab;
				font-size: 300%;
			}

			a.fullSizeLink section {
				background-position: center;
				background-size: cover;
			}

			@keyframes linkEnter {
			  from {
			  	background-color: black;
			  	transform: scale(1.0);
			  }

			  to {
			  	background-color: white;
			  	transform: scale(1.05);
			  }
			}

			@keyframes linkExit {
			  to {
			  	background-color: black;
			  	transform: scale(1.0);
			  }

			  from {
			  	background-color: white;
			  	transform: scale(1.05);
			  }
			}

			a.fullSizeLink .hero-image {
				animation-name: linkExit;
				animation-duration: 0.3s;
				animation-fill-mode: forwards;
			}

			a.fullSizeLink:hover .hero-image {
				box-shadow: 0 0 15px black;

				animation-name: linkEnter;
			}

			a.pageAnchor {
				visibility: hidden;
			}

			.two-sided-container {
				max-width: 960px;
				margin: auto;

				display: flex;
				flex-wrap: wrap;
				justify-content: center;
				align-content: center;
				align-items: center;
			}

			.two-sided-container div {
				max-width: 480px;
				padding: 10px;
				box-sizing: border-box;
				flex-grow: 1;
			}

			.two-sided-container div h2, .two-sided-container div p {
				max-width: 350px;
				margin-left: auto;
				margin-right: auto;
			}

			.two-sided-container .image-side {
				padding: 50px;
			}

			.two-sided-container .image-side img {
				width: 100%;
				max-width: 350px;
				margin: auto;
				display: block;

				filter: drop-shadow(0 0 20px #333);

				image-rendering: pixelated;
        		image-rendering: -moz-crisp-edges;
        		image-rendering: crisp-edges;
			}

			@media all and (max-width: 600px) {
			  .two-sided-container div {
			  	width: 100%;
			  	max-width: 100%;
			  }

			  .two-sided-container .image-side {
			  	order: 0;
			  }

			  .two-sided-container :not(.image-side) {
			  	order: 1;
			  }

			  h1 {
			  	font-size: 8vw;	
			  }
			}
		</style>
	</head>

	<body>
		<main>
			<section class="hero-image">
				<div class="hero-text">
					<h1>The Peerful Project</h1>
					<p class="hero-tagline">Free multiplayer games, right in your browser</p>
					<p>Your computer is the game, your smartphone the controller.</p>
					<a class="pageLink" href="the-peerful-project#explanation">What's this?</a> <a class="pageLink" href="the-peerful-project#gamelist">View games list</a>
				</div>
			</section>	

			<section>
				<a name="explanation" class="pageAnchor"></a>
				<div class="two-sided-container">
					<div class="left-side">
						<h2>Play anywhere, play quickly</h2>
						<p><strong>The Peerful Project</strong> is a collection of free local multiplayer games, immediately playable by anyone with a browser.</p>
						<p>Start the game on a computer, connect all smartphone(s), and play begins!</p>
					</div>
					<div class="right-side image-side">
						<img src="https://i.imgur.com/tKG8htt.gif" />
					</div>
				</div>
			</section>

			<section>
				<div class="two-sided-container">
					<div class="left-side image-side">
						<img src="gamesites/the-peerful-project/peerfulProject-largerFavicon.gif" />
					</div>
					<div class="right-side">
						<h2>No installation, no controllers</h2>
						<p>All players use (the browser on) their smartphone to control the game.</p>
						<p>You don't need to buy any extra stuff, or teach your grandparents what each button means. They'll already know.</p>
					</div>
				</div>
			</section>

			<section class="hero-image" style="background-position: center top; background-image: linear-gradient(rgba(69, 9, 32, 0.75), rgba(69, 9, 32, 0.75)), url(gamesites/the-peerful-project/peerfulProject-headerGames.gif);">
				<div class="center-text">
					<a name="gamelist" class="pageAnchor"></a>
					<h1>Games</h1>
					<p class="hero-tagline">Click on a game to visit its official page</p>
					<p>Below is the list of games within the Peerful Project.</p>
					<p>They are completely free (no ads, no account, nothing).</p> 
					<!-- <p>(I treat these projects like professional games, with their own dedicated page, server, following, and things like that. However, as I don't earn any income from this project, updates and new releases can be irregular.)</p> -->
					<a class="pageLink" href="blog/why-i-created-the-peerful-project">Read my Blog: "Why I started the Peerful Project"</a>
				</div>
			</section>	

			<a class="fullSizeLink" href="pizza-peers">
				<section class="hero-image" style="background-image: linear-gradient(rgba(11, 1, 4, 0.75), rgba(11, 1, 4, 0.75)), url(https://i.imgur.com/4406K6E.png);">
					<div class="center-text bright-background">
						<h2>Pizza Peers</h2>
						<p class="hero-tagline">Tasty cooperative delivering fun</p>
						<p>Grab ingredients, create tasty combinations, bake until they're just right, and deliver them before the customer gets angry.</p>
						<p>Oh, and some of the players might be ... allergic to certain essential ingredients.</p>
					</div>
				</section>
			</a>
		</main>

		

<?php

require '../../footer.php';

?>

		