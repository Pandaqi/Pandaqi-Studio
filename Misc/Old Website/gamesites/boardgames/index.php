<?php
	require '../../default_headers.php';
?>
		<title>Boardgames - Free Print 'n Play Titles</title>
		<link rel="icon" type="image/png" href="gamesites/boardgames/favicon.png" />

		<!-- Patua One; header font, thick, friendly -->
		<link href="https://fonts.googleapis.com/css2?family=Patua+One&display=swap" rel="stylesheet"> 

		<!-- Poppins; body font, nice, legible -->
		<link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">

		<style type="text/css">
			/*
				COLOR SCHEME

				bright red:   #ef3e36;
				blue:         #17bebb;
				dark green:   #2e282a;
				warm beige:   #edb88b;
				even lighter: #fad8d6;

			*/

			h1, h2, h3, h4, h5, h6 {
				font-family: 'Patua One', cursive;
				text-decoration: none;
				text-transform: none;
				text-align: center;
				margin-top: 0px;
				margin-bottom: 0px;
			}

			.spaceousHeader {
				margin-top: 60px;
			}

			h1 {
				font-size: 6vw;
			}

			#questContainer h2 {
				font-size: 22px;
			}

			h2 {
				font-size: 48px;
			}

			h3 {
				margin-top: 0px;
			}

			body {
				font-family: 'Poppins', sans-serif;
				font-size: 16pt;

				overflow-y: scroll;
				overflow-x: hidden;

				background-color: #fad8d6;
			}

			.autoCenter {
				max-width: 960px;
				margin: auto;
				padding: 20px;
				box-sizing: border-box;
				position: relative;
			}

			.gameGrid {
				display: grid;
				grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
				/*grid-template-rows: repeat(auto-fill, minmax(300px, 1fr));*/
				grid-column-gap: 10px;
				grid-row-gap: 10px;
				width: 100%;
				box-sizing: border-box;
			}

			.gameGrid > a, .gameGrid > a:visited {
				padding: 20px 20px;
				border-radius: 10px;
				box-shadow: inset 0 -4px 0 rgba(0, 0, 0, 0.4);
				border-width: 0;
				text-decoration: none;

				box-sizing: border-box;

				background-color: rgba(255,255,255,0.4);
				color: black;

				display:block;

				transition: background 0.3s, color 0.3s;
			}

			.gameGrid > a:hover {
				background-color: rgba(0,0,0,0.5);
				color: white;
			}

			.gameGrid > a img {
				/*box-shadow: 0 0 10px rgba(0,0,0,0.2);*/
				filter: drop-shadow(0 0 5px #333);
				max-height: initial !important;
			}

			p, ul, ol {
				max-width: 550px;
				margin-left: auto;
				margin-right: auto;
				hyphens: auto;
			}

			ul, ol {
				margin-top: -20px;
			}

			p.fullWidthParagraph {
				max-width: 960px;
				text-align: center;
			}

			section img {
				max-width: 100%;
			}

			img.wideImage {
				border-bottom: 5px solid rgba(0,0,0,0.2);
			}

			.colorScheme-red {
				background-color: #9a0901;
				border-color: #cd1c14;
				color: white;
			}

			.colorScheme-beige {
				background-color: #edb88b;
				border-color: #cb9669;
			}

			/*.colorScheme-beige .gameGrid > a, .colorScheme-beige .gameGrid > a:visited {
				background-color: #F4D4B9;
			}*/

			.colorScheme-blue {
				background-color: #39dfdd;
				border-color: #17bebb;
			}

			/*
			.colorScheme-blue .gameGrid > a, .colorScheme-blue .gameGrid > a:visited {
				background-color: #AAEBEA;
			}*/

			.colorScheme-green {
				background-color: #2e282a;
				border-color: #4f4a4c;

				color: #E8E8E8;
			}

			section {
				border-width: 0px;
				border-bottom-width: 20px;
				border-style:solid;
			}

			.backgroundPattern {
				background-image: url(https://i.imgur.com/5Zfh2iU.png);
			    background-size: contain;
			}

			.btn {
				padding: 10px 20px;
				border-radius: 15px;
				box-shadow: inset 0 -4px 0 rgba(0, 0, 0, 0.4);
				border-width: 0;
				text-decoration: none;
				font-weight: bold;

				background: rgba(255,255,255,0.9);
				color: black;

				transition: background 0.3s, color 0.3s;

				display: inline-block;
				margin: 10px;
			}

			.btn:hover {
				background: rgba(0,0,0,0.1);
				color: white;
			}

			.remark {
				font-size: 12pt;
				max-width: 100%; 
				color: #1D706F;
			}

			.needsMoreTesting {
				text-align:center;
				opacity:0.5;
			}

			.gridTwoWide {
				grid-column: auto / span 2;
			}

			.gridThreeWide {
				grid-column: auto / span 3;
			}

			@media all and (max-width: 600px) {
				.backgroundPattern {
					background-image: none;
				}

				.gridTwoWide {
					grid-column: auto;
				}

				.gridThreeWide {
					grid-column: auto;
				}
			}
			
		</style>
	</head>

	<body>
		<main>
			<section class="colorScheme-red">
				<div class="autoCenter">
					<h1 class="spaceousHeader">Boardgames</h1>
					<p class="fullWidthParagraph">Welcome to my collection of free "Print & Play" boardgames!</p>
					<p class="fullWidthParagraph">
						<a class="btn" href="boardgames#print_and_play">Print and Play?</a> 
						<a class="btn" href="boardgames#explanation">How does it work?</a> 
						<a class="btn" href="boardgames#one_paper_games">One Paper Games</a>
					</p>
				</div>
			</section>

			<section class="newSection colorScheme-beige backgroundPattern">
				<a name="one_paper_games"></a>
				<img src="https://i.imgur.com/StAeV9B.jpg" class="wideImage" alt="one paper games" />
				<div class="autoCenter">
					<h2>One Paper Games</h2>
					<p>These games only require you to print <em>a single sheet of paper</em> and find a pen(cil) somewhere!</p>
					<p>You can download, explain, carry, play or pause these games instantly, because of their simplicity and low requirements.</p>
					<p>Additionally, they are language-independent: only one person needs to understand English to read the rules, all other files don't have (essential) text.</p>
					<p>Do not think them easy, however! These games are the most innovative games I've ever made and are often complemented by a small website for cool expansions and play variants.</p>

					<!-- Coming Soon image: https://i.imgur.com/u4CZHaw.png -->
					<div class="gameGrid">

						<a href="#">
							<img src="https://i.imgur.com/u4CZHaw.png" />
							<h3>Conductors of the Underground</h3>
							<p>Coming soon ...</p>
						</a>

						<a href="one-pizza-the-puzzle" class="gridTwoWide">
							<img src="https://i.imgur.com/JGfMeSl.png" />
							<h3>One Pizza the Puzzle</h3>
							<p>A game about sending pizza couriers all over town, delivering orders, and most of all: cutting off other players because you are not allowed to cross other lines drawn on the board.</p>
						</a>

						<a href="unstable-universe" class="gridThreeWide">
							<img src="https://i.imgur.com/rlTkS1C.png" />
							<h3>Unstable Universe</h3>
							<p>The only boardgame where you're allowed to cut the paper into pieces, especially when you are losing.</p>
						</a>

						<a href="starry-skylines" class="gridThreeWide">
							<img src="https://i.imgur.com/mdQ0jDg.png" />
							<h3>Starry Skylines</h3>
							<p>You are all simultaneously building advanced cities in space. On the same planet. And no, this is not a cooperative game.</p>
						</a>

						<a href="wondering-witches" class="gridThreeWide">
							<img src="https://i.imgur.com/6v6CDTh.png" />
							<h3>Wondering Witches</h3>
							<p>You are brewing a secret potion to defeat your greatest enemies&mdash;as witches tend to do&mdash;but the High Witch is terrible at communicating the recipe ...</p>
						</a>

						<a href="epic-medics">
							<img src="https://i.imgur.com/1tgN1u3.png" />
							<h3>Epic Medics</h3>
							<p>Oh no, a terrible pandemic is raging across the country! Will you be the heroic medics ... or will you play the virus?</p>
						</a>

						<a href="paper-thieves">
							<img src="https://i.imgur.com/6ImWDHH.jpg" />
							<h3>Paper Thieves</h3>
							<p>Steal enough treasures and flee the city, before the police catches you!</p>
						</a>
					</div>
				</div>
			</section>

			<section class="newSection colorScheme-blue backgroundPattern">
				<img src="https://i.imgur.com/HVtHdxb.png" class="wideImage" alt="boardgames" />
				<div class="autoCenter">
					<a name="game_list"></a>
					<h2>List of Games</h2>
					<p>Pick any game you like! It's free, it's fun, I love seeing people enjoy my games.</p>
					<p>Some of these games are available in multiple languages (because I'm actually Dutch), but don't worry, I translated each of them manually and tried to keep it as simple as possible.</p>
					<div class="gameGrid">
						<a href="timely-transports" class="gridThreeWide">
							<img src="https://i.imgur.com/7qpyA55.png" />
							<h3>Timely Transports</h3>
							<p>The first ever hybrid board+smartphone game for 1&ndash;8 players about transporting exotic goods across the jungle!</p>
						</a>

						<a href="wie-is-de-trol" class="gridTwoWide">
							<img src="https://i.imgur.com/xg7jMEJ.png">
							<h3>Wie is de trol? (NL) </h3>
							<p>Iedereen probeert in uitdagende opdrachten zoveel mogelijk geld te verdienen ... behalve de trol. Die probeert alles te laten mislukken, zonder te worden gepakt. Kan jij de trol ontmaskeren?<br/><br/>(This game is only available in Dutch, as it's based on a popular Dutch TV show.) </p>
						</a>

						<a href="naivigation">
							<img src="https://i.imgur.com/fO63dlV.png" />
							<h3>Naivigation (NL/EN)</h3>
							<p>Try to race to the finish ... with all players steering the same car at the same time!</p>
						</a>

						<a href="swerving-shots">
							<img src="https://i.imgur.com/XODkzab.png" />
							<h3>Swerving Shots (NL/EN)</h3>
							<p>You're dueling cowboys ... but everyone shoots simultaneously and their bullets must follow the paths you created.</p>
							<p>Collisions might occur. And that means you might just shoot yourself.</p>
						</a>

						<a href="the-animal-bandit">
							<img src="https://i.imgur.com/9NFgZ1E.png" />
							<h3>The Animal Bandit (NL/EN)</h3>
							<p>Tiny, simple card game in which everyone has a single rule: smuggle the fabulous unicorn out of the city.</p>
							<p class="needsMoreTesting">NMT</p>
						</a>
					</div>
					<p class="remark"><em>Copyright?</em> I maintain the motto "Don't steal my games, share them". Feel free to play these games, share them with others, customize them to your liking, and let them inspire you. Do not copy the name/concept, rules or graphic assets and/or present them as your own, especially not for commercial purposes. Credit me when talking about my work, to support the free creation of these games and to keep this website online.</p>
					<p class="remark"><em>Remark:</em> The label "NMT" means "needs more testing". The game is tested and finished, but for whatever reason, I was unable to playtest the game in certain configurations. If you can, please play the game with your group and report the results!</p>
					<p class="remark"><em>Remark:</em> For years, I also maintained a full list of all my boardgames (even the first ones I ever made), with Dutch explanations. This page still exists: <a href="http://nietdathetuitmaakt.nl/bordspellen">Bordspellen</a></p>
				</div>
			</section>

			<section class="newSection colorScheme-green">
				<img src="https://i.imgur.com/57pgXHv.png" alt="print 'n play" class="wideImage" />
				<div class="autoCenter">
					<a name="print_and_play"></a>
					
					<h2>Print & Play</h2>
					<p>It means you can download the game files, print them yourself, and then play them &mdash; for free!</p>
					<p>This system has a few obvious <strong>disadvantages</strong>: the components aren't as nice and game quality isn't guaranteed.</p>
					<p>But there are also numerous <strong>advantages</strong>: you get free games, I can create any game I want (not just whatever is "commercially viable"), and games are constantly updated (using your feedback)!</p>
				</div>
			</section>

			<section class="newSection colorScheme-beige backgroundPattern">
				<img src="https://i.imgur.com/7ZHbveP.png" class="wideImage" alt="frequently asked questions" />
				<div class="autoCenter">
					<a name="explanation"></a>
					<h2>How does it work?</h2>
					<p>Click on a game, any game.</p>
					<p>This will take you to the official game page, with a big button labeled "Download".</p>
					<p>Clicking it leads to a folder with all the files. (I use Google Drive, which is quick, freely accessible to anyone, and always works.)</p>
					<p>The structure is always as follows:</p>
					<ul>
						<li><strong>Rules</strong> contains the rulebook</li>
						<li><strong>Files</strong> contains any files you need to print</li>
					</ul>

					<h2 style="margin-top: 60px;">Can I play offline?</h2>
					<p>Yes! Anytime, anywhere, even without a connection.</p>
					<p>Because many of my boardgames have a digital component (sometimes optional, sometimes required), I do my best to make this website completely available offline.</p>
					<p>When you visit a page (or play a game) for the first time, it will <em>save</em> all the code and resources on your device.</p>
					<p>From that moment, you can disconnect from the internet, or my servers can crash, but it doesn't matter! You'll still be able to play the game. At any time.</p>
					<p style="font-size: 10pt; opacity: 0.75;"><strong>Remark</strong> Of course, you must have visited the page at least <em>once</em>, otherwise nothing can be saved on your device yet. I can't do magic!</p>
					<p style="font-size: 10pt; opacity: 0.75;"><strong>Remark</strong> On many mobile browsers, you can also add this website to your homescreen. This provides a quick link to the content, like it was an app you could open.</p>

					<h2>Can I help?</h2>
					<p>Of course! If you've tried a game, any <strong>feedback</strong> about the page, rules, files, whatever is welcome. I am human, I make mistakes. These games will only improve if I know what everyone is experiencing.</p>
					<p>Additionally, because the games are free, but keeping a website online surely is not, I ask for <strong>financial support</strong> if you can give it. You could ... </p>
					
					<p>Buy any of my video games (<a href="http://pandaqi.itch.io">Pandaqi on Itch.io</a>). They are all free, but you can "donate" by giving a tip when downloading.</p>

					<p>Donate via PayPal:</p>
					<div>
						<form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_top" style="max-width: 100px; margin: auto; margin-bottom: -50px;">
							<input type="hidden" name="cmd" value="_s-xclick" />
							<input type="hidden" name="hosted_button_id" value="BVNZNXC7TP3VG" />
							<input type="image" src="https://www.paypalobjects.com/en_US/NL/i/btn/btn_donateCC_LG.gif" border="0" name="submit" title="PayPal - The safer, easier way to pay online!" alt="Donate with PayPal button" />
							<img alt="" border="0" src="https://www.paypal.com/en_NL/i/scr/pixel.gif" width="1" height="1" />
						</form>
					</div>

					<p style="margin-top: 60px;">Give me a project to do as a freelancer! I work as a writer, musician, graphic designer, programmer and some things in between. (<a href="https://rodepanda.com">Rode Panda - Portfolio</a>)</p>

					<p>Or you could support me via one of the big "Buy me a Coffee" websites: 
						<div style="text-align: center;">
							<style>.bmc-button img{height: 34px !important;width: 35px !important;margin-bottom: 1px !important;box-shadow: none !important;border: none !important;vertical-align: middle !important;}.bmc-button{padding: 7px 15px 7px 10px !important;line-height: 35px !important;height:51px !important;text-decoration: none !important;display:inline-flex !important;color:#FFFFFF !important;background-color:#FF813F !important;border-radius: 8px !important;border: 1px solid transparent !important;font-size: 24px !important;letter-spacing: 0.6px !important;box-shadow: 0px 1px 2px rgba(190, 190, 190, 0.5) !important;-webkit-box-shadow: 0px 1px 2px 2px rgba(190, 190, 190, 0.5) !important;margin: 0 auto !important;font-family:'Cookie', cursive !important;-webkit-box-sizing: border-box !important;box-sizing: border-box !important;}.bmc-button:hover, .bmc-button:active, .bmc-button:focus {-webkit-box-shadow: 0px 1px 2px 2px rgba(190, 190, 190, 0.5) !important;text-decoration: none !important;box-shadow: 0px 1px 2px 2px rgba(190, 190, 190, 0.5) !important;opacity: 0.85 !important;color:#FFFFFF !important;}</style><link href="https://fonts.googleapis.com/css?family=Cookie" rel="stylesheet"><a class="bmc-button" target="_blank" href="https://www.buymeacoffee.com/pandaqi"><span style="margin-left:5px;font-size:24px !important;">Buy me a coffee</span></a>

							<script type='text/javascript' src='https://ko-fi.com/widgets/widget_2.js'></script>
							<script type='text/javascript'>kofiwidget2.init('Support Me on Ko-fi', '#29abe0', 'W7W71FZ8S');kofiwidget2.draw();</script> 
						</div>
					</p>
				</div>
			</section>

		</main>

		

<?php

require '../../footer.php';

?>

		