<?php
	require '../../default_headers.php';
?>
		<!-- Ik weet gewoon nog steeds niet of het nou lijp of leip is: https://www.startpagina.nl/v/kunst-cultuur/taal/vraag/70252/schrijf-lijp-leip-leip-geeft/ -->
		<!-- Maar we gaan voor de lange ij ... denk ik -->
		<title>Lijpe Lessen &mdash; improviseer jezelf door de middelbare school</title>
		<link rel="icon" type="image/png" href="gamesites/lijpe-lessen/favicon.png" />

		<!-- Default CSS stylesheet for all boardgame pages -->
		<link rel="stylesheet" type="text/css" href="gamesites/boardgames/boardGameStyles.css">

		<!-- Grandstander: main font, cartoony, thick, playful -->
		<link href="https://fonts.googleapis.com/css2?family=Grandstander:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&display=swap" rel="stylesheet"> 

		<style type="text/css">

			h1, h2, h3, h4, h5, h6 {
				font-family: 'Grandstander', sans-serif;
				font-weight: 900;
			}


			body {
				font-family: 'Grandstander', sans-serif;
				color: black;
				background-color: beige;
				font-size: 14pt;
			}

			.autoCenter {
				max-width: 700px;
			}

			.tagline {
				color: black;
			} 

			.bigHeaderImage {
				filter: none;
			}

			a {
				color: #248232
			}

			ul {
				margin-top: -15px;
			}

			a.btn, a.btn:visited {
				font-family: 'Grandstander', sans-serif;
				font-weight: 900;
				background-color: #248232;
				color: #FCFFFC;
				line-height: 120%;
			}

			a.btn:hover {
				background-color: rgb(0, 0, 100);
				color: rgb(175, 175, 255);
			}

			a.download-btn, a.download-btn:visited {
				background-color: #D25757;
				color: rgba(255,255,255,0.8);
			}

			a.download-btn:hover {
				background-color: #040F0F;
				color: #F4C095;
			}

			#gameSettings > div {
				background-color: #B2D265;
				color: black;
			}

			/* 
				some slight improvements to design of settings box
				TO DO: might transfer this to the main CSS for all boardgames pages (as well as automatic vertical centering of text? see game.php)
			*/
			#gameSettings > div > div {
				align-items: center;
			}

			#gameButton {
				font-weight: 900;

				font-family: 'Grandstander', sans-serif;
				font-size: 24pt;

				background-color: #248232;
				padding: 20px;
				margin: 10px;

				color: #FCFFFC;

				border-radius: 10px;
				box-sizing: border-box;
				display: inline-block;

				transition: background-color 0.3s, color 0.3s;

				border-color: transparent;
			}

			#gameButton:hover {
				background-color: #D25757;
				color: #040F0F;
				cursor: pointer;
			}

			input[type="checkbox"] {
				width: 100%;
				height: 100%;
			}


			.settingRemark {
				max-width: 400px;
				font-weight: 300;
				color: rgb(0, 50, 0);
			}

			
		</style>
	</head>

	<body>
		<main>
			<section>
				<img src="#" class="bigHeaderImage" />
				<div class="autoCenter">
					<!-- <h1>Lijpe Lessen</h1> -->
					<p class="tagline">Een spel voor 3&ndash;10 spelers waarbij docenten ter plekke aan de hand van willekeurige woorden een les moeten improviseren en de scholieren proberen met hun eigen geïmproviseerde verhaal de toets te halen.</p>
					<p class="tagline taglineData">Leeftijd: alle | Complexiteit: Laag | Speeltijd: ligt eraan </p>
					<p style="text-align: center;"><a href="#" class="btn download-btn">Download</a></p>
				</div>
			</section>

			<section>
				<div class="autoCenter">
					<h2>Hoe werkt het?</h2>
					<p>Lala</p>
				</div>
			</section>

			<section>
				<div class="autoCenter">
					<a name ="game"></a>
					<h2>Speel het spel!</h2>
					<p>Kies de gewenste instellingen hieronder en klik "Start spel!"</p>
					<p>Je hoeft het spel maar op één apparaat (computer, tablet, smartphone) op te starten.</p>
					<p><em>Opmerking:</em> het spel opent op een nieuwe pagina. Op sommige apparaten denkt hij daarom dat dit een pop-up is en blokkeert deze. Dat is het niet, ik zou nooit pop-ups laten zien.</p>

					<div id="gameSettings">
						<div>
							<div>
								<label for="setting-playerCount">Hoeveel spelers? </label>
								<select name="setting-playerCount" id="setting-playerCount">
									<option value="3" selected>3</option>
									<option value="4">4</option>
									<option value="5">5</option>
									<option value="6">6</option>
									<option value="7">7</option>
									<option value="8">8</option>
									<option value="9">9</option>
									<option value="10">10</option>
								</select>

								<label for="setting-numRounds">Hoeveel dagen? </label>
								<select name="setting-numRounds" id="setting-numRounds">
									<option value="2">2</option>
									<option value="3">3</option>
									<option value="4">4</option>
									<option value="5">5</option>
									<option value="6">6</option>
									<option value="7">7</option>
								</select>

								<h3 style="grid-column: 1 / span 2;">Uitbreidingen</h3>
								<label for="setting-locations">Locaties? </label>
								<input type="checkbox" name="setting-locations" id="setting-locations">

								<label for="setting-gym">Lichamelijke Opvoeding? </label>
								<input type="checkbox" name="setting-gym" id="setting-gym">	

								<label for="setting-parents">Boze Ouders? </label>
								<input type="checkbox" name="setting-parents" id="setting-parents">								
							</div>
						</div>
					</div>

					<div style="text-align: center;">
						<button id="gameButton">Start spel!</button>
					</div>
				</div>
			</section>

			<script>
				document.getElementById('gameButton').addEventListener('click', function(ev) {
					var cfg = 
					{
						'playerCount': parseInt(document.getElementById('setting-playerCount').value),
						'numRounds': document.getElementById('setting-numRounds').value,
						'expansions': 
						{
							'locations': document.getElementById('setting-locations').checked,
							'gym': document.getElementById('setting-gym').checked,
							'parents': document.getElementById('setting-parents').checked
						}
					}

					// save in local storage
					window.localStorage.setItem('trol-config', JSON.stringify(cfg));

					// go to actual game page
					window.open("gamesites/lijpe-lessen/game.php", "_blank")
				})

			</script>

		</main>

		

<?php

require '../../footer.php';

?>

		