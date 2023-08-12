<!DOCTYPE html>
<html lang="nl">
	<head>
		<title>Wie is de Trol?</title>
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<meta charset="utf-8" />

		<!-- Recursive: somewhat WIDM font, somewhat computery -->
		<link href="https://fonts.googleapis.com/css2?family=Recursive:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet"> 

		<!-- Antic slab: really nice legible font, not sure if I'll use it -->
		<!-- font-family: font-family: 'Antic Slab', serif; -->
		<link href="https://fonts.googleapis.com/css2?family=Antic+Slab&display=swap" rel="stylesheet"> 

		<!-- Lilita One: thick display font for buttons/numbers/short bursts of text -->
		<!-- Alternative = Changa One = https://fonts.google.com/specimen/Changa+One?category=Display&thickness=8 -->
		<link href="https://fonts.googleapis.com/css2?family=Lilita+One&display=swap" rel="stylesheet"> 

		<style type="text/css">

			h1, h2, h3 {
				font-weight: 900;
				line-height: 120%;
			}

			body {
				background-color: #111111;
				color: #EEEEEE;
				font-family: 'Recursive', sans-serif;
				font-size: 16pt;
				line-height: 120%;
			}

			div, p {
				line-height: 120%;
			}

			input, button, select {
				font-family: 'Recursive', sans-serif;
				font-weight: 900;
				font-size: 16pt;
			}

			option {
				font-weight: 300;
			}

			button {
				background-color: #0b4d0b;
				border: none;
				padding: 20px;
				color: white;
				border-radius: 5px;
				cursor: pointer;

				transition: 0.3s background-color, 0.3s color;
			}

			button:hover {
				background-color: lime;
				color: black;
				font-size: 22pt;
			}

			main {
				max-width: 650px;
				margin: auto;
			}

			#options {
				display: grid;
				grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
				grid-column-gap: 10px;
				grid-row-gap: 10px;
				width: 100%;
				box-sizing: border-box;
			}

			#options > div {
				display: flex;
				align-content: center;
				align-items: center;
				justify-content: left;
			}

			#options > div > * {
				padding: 20px;
				box-sizing: border-box;
			}

			#options > div > button {
				font-size: 20pt;
			}

			#story {
				font-style: italic;
				color: #AAAAAA;
				font-size: 12pt;
				font-weight: 300;
			}

			#category {
				color: red;
			}

			#money {
				color: lime;
			}

			#continueButton {
				width: 100%;
				max-width: 400px;
				margin: auto;
				font-size: 20pt;
			}

			#input {
				max-width: 400px;
				margin: auto;
			}

			#input > * {
				width: 100%;
				font-size: 20pt;
				box-sizing: border-box;
			}

			#inputSettings {
				margin: auto;
				margin-top: 20px;
				display: inline-block;
				padding: 20px;
				background-color: #143109;
				border-radius: 5px;
				color: white;
				box-sizing: border-box;
			}

			#inputSettings > div {
				text-align: left;
				grid-gap: 15px;
				display: grid;
				grid-template-columns: auto auto;
				font-size: 16pt;
				box-sizing: border-box;
				align-items: center;
			}

			.input-number {
				font-size: 20pt;
				max-width: 100%;
				width: 100%;
				box-sizing: border-box;
			}

			.input-checkbox {
				width: 100%;
				height: 100%;
			}

			.numPlayersIndicator {
				font-weight: bold;
				color: yellow;
			}

			.hintButton {
				margin-left: 20px;
				padding: 2px;
				font-size: inherit;
				opacity: 0.5;
			}

			.hintButton:hover {
				font-size: inherit;
			}

			.eliminatedPlayer, .winningPlayer {
				font-weight: 900;
				border-bottom: 2px solid;
			}

			#addertjeContainer, #rolvoordeelContainer {
				display: block; 
				margin-top: 10px;
				font-size: 12pt;
				line-height: 120%;
			}

			#addertje {
				color: yellow;
			}

			#rolvoordeel {
				color: pink;
			}

			#timer > div {
				display: flex;
				align-content: center;
				align-items: center;
				justify-content: center;
			}

			#timer > div > * {
				padding: 10px;
			}

			#timerValue {
				font-size: 22pt; 
				font-weight: 900;
			}

			#ruleReminder {
				display: none;
				font-size: 12pt;
				padding: 10px;
				background-color: rgba(0, 255, 0, 0.2);
				margin-top: -25px;
				padding-top: 5px;
				padding-bottom: 5px;
			}

			/* card types */
			.cardType-base {
				font-weight: 900;
				border-bottom: 3px solid;
				display: inline-block;
			}

			.cardType-running {
				color: #ff5656; /* light red */
			}

			.cardType-puzzling {
				color: #6c6cf5; /* light blue */
			}

			.cardType-information {
				color: #65ea65; /* light green */
			}

			.cardType-effort {
				color: #F7CF85; /* light orangy/browny */
			}

			.cardType-relaxation {
				color: #d732d7; /* light purple */
			}

			.cardType-cooperation {
				color: #3B92F3; /* light light blue */
			}

			.cardType-distrust {
				color: #ABF33B; /* muddy yellow-green */
			}

			.cardType-leader {
				color: #F3693B; /* orange-red => TO DO: might swap for a more pink color */
			}

		</style>
	</head>

	<body>
		<main>
			<h1 id="title">Title</h1>
			<div id="ruleReminder"></div>
			<p id="metadata">
				Categorie: <span id="category">??</span> | Startinzet: <span id="money">??</span>
				<span id="addertjeContainer">
					Addertje: <span id="addertje">??</span>
				</span>
				<span id="rolvoordeelContainer">
					Rolvoordeel: <span id="rolvoordeel">??</span>
				</span>
			</p>
			<div id="timer">
				<div>
					<button onclick="startTimer()">Start</button> 
					<span id="timerValue">00:00</span> 
					<button onclick="stopTimer()">Stop</button>
				</div>
			</div>
			<p id="story">Story</p>
			<div id="desc">Description</div>
			<button id="continueButton">Ga door!</button>
			<div id="options">

			</div>
			<div id="input">
				<input type="text" id="inputText" placeholder="... typ een spelernaam ..." />
				<div id="inputSettings">
					<div>
						<label for="setting-jokerCount">Jokers? </label>
						<input type="number" id="setting-jokerCount" name="setting-jokerCount" class="input-number" min="0" max="10" value="0" />

						<label for="setting-redCards">Rode kaarten? </label>
						<input type="number" id="setting-redCards" name="setting-redCards" class="input-number" min="0" max="10" value="0" />

						<label for="setting-freePass">Vrijstelling? </label>
						<input type="checkbox" name="setting-freePass" class="input-checkbox" id="setting-freePass">

						<label for="setting-destroyFreePass">Zwarte Vrijstelling? </label>
						<input type="checkbox" name="setting-destroyFreePass" class="input-checkbox" id="setting-destroyFreePass">

						<label for="setting-specialeKracht" id="setting-specialeKracht-label">Speciale Kracht? </label>
						<select name="setting-specialeKracht" id="setting-specialeKracht">
							<option value="" selected>-- geen --</option>
							<option value="Helderziende">Helderziende</option>
							<option value="Afluisteraar">Afluisteraar</option>
							<option value="Fotofinish">Fotofinish</option>
							<option value="Gokker">Gokker</option>
							<option value="Handelaar">Handelaar</option>
						</select>
					</div>
				</div>
				<p id="inputResult"></p>
				<button id="inputButton">Registreer speler</button>
			</div>
		</main>

		<script src="gameDictionary.js?newversion"></script>
		<script src="mainGame.js?newversion"></script>
	</body>
</html>