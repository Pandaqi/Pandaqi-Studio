<?php
	require '../../default_headers.php';
?>
		<title>Swerving Shots&mdash;a wild duel of strategic shots</title>
		<link rel="icon" type="image/png" href="gamesites/swerving-shots/favicon.png" />

		<!-- Baloo 2, used for both normal text and headings -->
		<link href="gamesites/swerving-shots/customFonts.css" rel="stylesheet"> 

		<!-- Default CSS stylesheet for all boardgame pages -->
		<link rel="stylesheet" type="text/css" href="gamesites/boardgames/boardGameStyles.css">

		<style type="text/css">
			h1, h2, h3, h4, h5, h6 {
				font-family: 'Carnivalee Freakshow', cursive;
			}

			.autoCenter h2 {
				margin-top: 60px;
				margin-bottom: -15px;
			}

			body {
				font-family: 'Bodoni MT', cursive;
				background-color: #D9C6A8;
			}

			main {
				position: relative;
			}

			main::after {
				background-image: url(https://i.imgur.com/vHOtMsP.jpg);
				content: "";
				opacity: 0.5;
				top: 0;
				left: 0;
				bottom: 0;
				right: 0;
				position: absolute;
				z-index: -1;  
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
				font-family: 'Carnivalee Freakshow';
				background-color: #D2579E;
				color: #F1E9D4;
			}

			a.download-btn:hover {
				background-color: rgb(255, 106, 100);
				color: rgb(0,0,0,0.75);
			}

			ul {
				margin-top:-20px;
			}
			
		</style>
	</head>

	<body>
		<main>
			<section>
				<div class="autoCenter">
					<img src="https://i.imgur.com/XODkzab.png" style="max-width:100%;"/>
					<!-- <h1>Serving Shots</h1> -->
					<p class="tagline">A game for 2&ndash;6 cowboys about shooting bullets at the same time ... with all the (un)expected consequences. Now including two expansions!</p>
					<p class="tagline taglineData">Languages: English, Dutch | Ages: Everyone | Complexity: Easy | Playtime: 30-60 minutes</p>
					<p style="text-align: center;"><a href="https://drive.google.com/open?id=1gGXtVCAP-v0ZD5yqrv1osYf0QE9SK4WB" class="btn download-btn">Download</a></p>
				</div>
			</section>

			<section>
				<div class="autoCenter">
					<img src="https://i.imgur.com/7FXJVBO.jpg" class="boardImage" />
				</div>
			</section>

			<section>
				<div class="autoCenter smallWidth">
					<h2 style="margin-top:0px;">Important Remarks</h2>
					<p>The game asks you to keep track of <strong>damage</strong>. I did not include a way in the rules/materials to do this, for everyone I know has their own preferred method. You can write it own a piece of paper, you can use dice, you can type it on a phone/computer if it's nearby, whatever you like.</p>
					<p>Similarly, the game asks you to keep track of <strong>how many tiles</strong> your bullet has crossed. This is always a small number, so I assume everyone can remember or reconstruct this. However, I do intend on making something to help with this that also fits the game theme.</p>
					<p>The <strong>rules</strong> have two distinct versions: English and Dutch (manual translation, of course). Some non-essential text (such as remarks in example images), however, may still be in the wrong language. I rather spend more time making a good game than translating absolutely <em>everything</em> in multiple languages.</p>

					<h2>Frequently Asked Questions</h2>
					<p><strong>Why did you make this game for free?</strong> Because I like allowing everyone to play these games, regardless of your income. I also like making innovative games, and this idea of "you're not a color/pawn, you're a side of the board" hasn't been seen before, as far as I can tell.</p>
					<p>Nevertheless, if you do enjoy the games I'm creating, please support me by sharing the news, donating, or buying some of my other work.</p>
					<p><strong>How difficult is this game?</strong> The base rules are six pages, but that is including examples and images and rather large fonts. The expansions are two or three pages.</p>
					<p><strong>Will it be updated?</strong> If you find errors, or improvements, or have other feedback, I will always listen and improve the game. A third expansion is also in the works. By all other accounts, this game is finished.</p>	
				</div>
			</section>

		</main>

		

<?php

require '../../footer.php';

?>

		