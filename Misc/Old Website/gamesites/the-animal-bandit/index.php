<?php
	require '../../default_headers.php';
?>
		<title>The Animal Bandit&mdash;a game about smuggling unicorns and fooling friends</title>
		<link rel="icon" type="image/png" href="gamesites/the-animal-bandit/favicon.png" />

		<!-- Two custom fonts loaded from a custom (converted) file -->
		<!-- The actual fonts are 
		     * Berlin Sans FB Demi 
		     * Kayak Sans => but this one isn't accepted by browsers somehow?
		       So replaced it with "Kalyant"
		-->
		<link href="gamesites/the-animal-bandit/customFonts.css" rel="stylesheet"> 

		<!-- Default CSS stylesheet for all boardgame pages -->
		<link rel="stylesheet" type="text/css" href="gamesites/boardgames/boardGameStyles.css">

		<style type="text/css">
			h1, h2, h3, h4, h5, h6 {
				font-family: 'Berlin Sans FB Demi', cursive;
			}

			.autoCenter h2 {
				margin-top: 60px;
				margin-bottom: -15px;
			}

			.autoCenter h3 {
				margin-top: 40px;
				margin-bottom: -15px;
			}

			body {
				font-family: 'Kalyant Demo', cursive;
				background-color: #F2D64A;
				color: #3A1022;
			}

			.autoCenter {
				position: relative;
			}

			.tagline {
				color: inherit;
			} 

			a.btn, a.btn:visited {
				background-color: #536ACC;
				color: black;
			}

			a.btn:hover {
				background-color: rgb(0, 0, 100);
				color: rgb(175, 175, 255);
			}

			a.download-btn, a.download-btn:visited {
				font-family: 'Berlin Sans FB Demi';
				background-color: #FF2900;
				color: #FFC4AA;
			}

			a.download-btn:hover {
				background-color: #FFC4AA;
				color: #FF2900;
			}

			ul {
				margin-top:-20px;
			}

			.headerImageBg {
				position: absolute;
				left: 0;
				right: 0;
				top: 0;
				bottom: 0;
				opacity: 0.2;
				z-index: -1;
				max-width: 100%;
				width: 100%;
			}
			
		</style>
	</head>

	<body>
		<main>
			<section>
				<img class="headerImageBg" src="https://i.imgur.com/ApRuuU5.png">
				<div class="autoCenter">
					<h1>The Animal Bandit</h1>
					<p class="tagline">A game for 3&ndash;6 smugglers desperate to get that unicorn out of the city.</p>
					<p class="tagline taglineData">Languages: English, Dutch | Ages: Everyone | Complexity: Easy | Playtime: 20-30 minutes</p>
					<p style="text-align: center;"><a href="https://drive.google.com/open?id=1MHd_tAhJ2YP6pBRPXRZEKKxxZGvunPFx" class="btn download-btn">Download</a></p>
				</div>
			</section>

			<section>
				<div class="autoCenter">
					<img src="https://i.imgur.com/MGQnUYj.jpg" class="boardImage" />
				</div>
			</section>

			<section>
				<div class="autoCenter smallWidth">
					<h2>About this game</h2>
					<p>This game was meant as a simple, tiny card game using two innovative mechanics: the idea of <em>smuggling piles</em> and a completely <em>dynamic market</em>.</p>
					
					<h3>Smuggling Piles</h3>
					<p>I wanted to make a game where you needed to smuggle one animal (= the unicorn) out of the city. To do so, however, you first had to succesfully fool or pass <em>all other players</em>. I think this mechanic was quite a good idea, although it took some time to figure it out, and I will use it more in the future.</p>
					
					<h3>Dynamic Market</h3>
					<p>I also wanted a game where you could buy/sell animals, and their value would depend on the current market (just like, you know, in real life). This also works quite well, although I think it might have made the game more complex than needed.</p>
					
					<h3>Errors? Feedback? Ideas?</h3>
					<p>As always, the game has been thoroughly tested and finished, but I am just one man&mdash;I can always use more playtesters! (Additionally, this game underwent major changes along the way, which renders old playtests somewhat obsolete.)</p>
					<p>As such, I kindly ask you to try this game and report your results! Is it too long? At which points could the game be simplified? How could the game utilize these mechanics in a better way?</p>
				</div>
			</section>

		</main>

		

<?php

require '../../footer.php';

?>

		