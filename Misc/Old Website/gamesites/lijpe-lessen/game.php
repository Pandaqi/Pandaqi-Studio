<!DOCTYPE html>
<html lang="nl">
	<head>
		<title>Lijpe Lessen</title>
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<meta charset="utf-8" />

		<!-- Grandstander: main font, cartoony, thick, playful -->
		<link href="https://fonts.googleapis.com/css2?family=Grandstander:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&display=swap" rel="stylesheet"> 

		<style type="text/css">

			h1, h2, h3 {
				font-weight: 900;
				text-align: center;
				font-size: 90px;
				margin: 0;
				pointer-events: none;
			}

			body {
				background-color: #F8F0FB;
				color: #211A1D;
				font-family: 'Grandstander', cursive;
				font-size: 16pt;
			}

			input, button {
				font-family: 'Grandstander', cursive;
			}

			button {
				border-radius: 5px;
				background-color: brown;
				color: #F8F0FB;
				padding: 10px;
				border: none;

				transition: color 0.3s, background-color 0.3s;
			}

			button:hover {
				background-color: white;
				color: #211A1D;
				cursor: pointer;
			}

			main {
				max-width: 650px;
				margin: auto;
			}

			#timer-controls {
				text-align: center;
				margin-top: -15px;
				margin-bottom: 40px;
			}

			#phase-theme-word, #phase-theme-subject {
				font-weight: 900;
			}

			#phase-explanation, #phase-future, #phase-theme, #policy-proposal {
				max-width: 500px;
				margin: auto;
			}

			#phase-explanation {
				font-weight: 300;
				color: gray;
			}

			#phase-future {
				font-weight: 900;
				font-size: 12px;
				text-align: center;
			}

			#phase-theme, #policy-proposal {
				text-align: center;
				margin-top: 10px;
				background-color: rgba(0, 255, 0, 0.2);
				padding: 10px;
			}

			#policy-proposal {
				background-color: rgba(0, 0, 255, 0.2);
			}

			#buttonContainer {
				text-align: center;
			}

			#continueButton {
				font-size: 30px;
				background-color: olive;
			}

			@media all and (max-width: 600px) {
			  #phase {
			  	font-size: 32px;
			  }
			}
		</style>
	</head>

	<body>
		<main>
			<h1 id="clock">00:00</h1>
			<div id="timer-controls">
				<button onclick="startTimer()">Start</button> 
				<button onclick="stopTimer()">Stop</button>
				<button onclick="speedUpTimer()">Spoel Door</button>
			</div>
			

			<h1 id="phase">??</h1>
			<div id="phase-future">phase future</div>

			<div id="phase-theme">Woord: <span id="phase-theme-word">??</span> | Vak: <span id="phase-theme-subject">??</span></div>
			<div id="policy-proposal">??</div>

			<div id="phase-explanation">phase explanation</div>
			
			<div id="buttonContainer">
				<button onclick="continueButtonPressed()" id="continueButton">Ga door!</button>
			</div>
		</main>

		<script>
			function Event(name, desc, moneyOffer) {
				this.name = name;
				this.desc = desc;
				this.moneyOffer = moneyOffer;
			}

			var gameConfig;

			var time = 0, timerInterval = null;

			var numPlayers = 0, numTeachers;
			var numDays, curDay = 0;

			var eventProbability = 1.0, justDisplayedEvent = true;
			var gameHasEnded = false;

			var EVENTS = [
				new Event('Naam', '<p>Dit is een hele bijzondere gebeurtenis! Wow!</p>', false)
			]

			var SUBJECTS = [
				'Taal',
				'Sociaal',
				'Wetenschap',
				'Kunsten',
				'Overig'
			]

			// https://handigetools.nl/willekeurige-woorden
			var WORDS = [
				'stof', 'keuze', 'naaldbos', 'kapot', 'faillisement', 'rechter', 'oorlog', 'markt', 'sympathiek', 'vermoord', 'lof',
				'gokken', 'knopje', 'bestuur', 'koninkrijk', 'klasse(n)', 'tentoonstelling', 'vogels', 'etage', 'woonhuis', 'theater',
				'bioscoop', 'directeur', 'debatteren', 'konijn', 'diavoorstelling', 'verdediger', 'routebeschrijving', 'kaart', 'spelen',
				'onderzoek', 'vergelijking', 'trekken', 'werken', 'schrijven', 'parade', 'leeg', 'rijk', 'arm', 'onbelangrijk', 'dom',
				'grote gevolgen', 'onjuist', 'imbecielen', 'decor', 'prullenbak', 'jongetjes', 'werkelijkheid', 'kennis', 'andersoortige', 
				'onsmakelijk', 'triest', 'gehandhaafd', 'stereotype', 'hard', 'centraal', 'leeswijzer', 'overweldigend', 'schuld', 'vergeten',
				'liefde', 'verboden', 'saai', 'brug', 'wetenschap', 'park', 'landschap', 'bank', 'klagen', 'oorzaak', 'aanzienlijk', 'patroon',
				'band', 'verwend', 'ontspannen', 'opvallend', 'zoogdier', 'eeuwenoud', 'vloek', 'wraak', 'passagiers', 'beroep', 'genuanceerd',
				'spits', 'riolering', 'waterkraan', 'badkamer', 'douchen', 'water', 'overstroming', 'dijk', 'symbool', 'verdwijning', 'overspannen',
				'verminderen', 'duur', 'realistisch', 'helm', 'staren', 'bril', 'handicap', 'gehoorapparaat', 'kleurenblind', 'voeten', 'handen',
				'armen', 'benen', 'hoofd', 'gezicht', 'neus', 'oren', 'ogen', 'mond', 'buik', 'maag', 'hart', 'longen', 'beesten', 'pest', 'wild',
				'afscheid', 'beslissing', 'durf', 'vakken', 'voorbereiden', 'aantrekkelijk', 'post', 'brief', 'elektriciteit', 'telefoon', 'internet',
				'uitvoering', 'social media', 'bericht', 'normaal', 'linkerhand', 'rechterhand', 'logisch', 'gulden', 'geslacht', 'rillingen',
				'auto', 'trein', 'rijden', 'paard', 'vliegtuig', 'schip', 'zee', 'karakter', 'lijk', 'schuldig', 'zwembad', 'wipwap', 'speeltuin',
				'glijbaan', 'dierentuin', 'pretpark', 'parkeerplaats', 'fiets', 'lopen', 'spreuk', 'achterstand', 'trap', 'kunstenaar', 'trouw',
				'bevel', 'werkloos', 'eigendom', 'geschiedenis', 'schilderij', 'liedje', 'appelboom', 'vlinder', 'vastknopen', 'tragisch', 'komisch',
				'verliezen', 'getuige', 'gebaar', 'kosten', 'commentaar', 'bed', 'zweten', 'lang', 'broek', 'jurk', 'deksel', 'pet', 'teenslipper', 'sandaal',
				'sok', 'riem', 'rok', 'shirt', 'vest', 'blouse', 'tellen', 'getallen', 'rekenen', 'maatregel', 'platgestampt', 'gieren', 'inventief', 
				'binnendringen', 'lucht', 'luchtig', 'vastleggen', 'conditie', 'omstreden', 'schapen', 'score', 'oorsprong', 'stilstaan', 'kostuum', 
				'kalmeren', 'medeplichtig', 'overrompelen', 'uitmonden', 'groeien', 'ver', 'dichtbij', 'classificeren'
			]

			var roleDistLibrary = [
				{ 'teachers': 1, 'students': 1, 'headmaster': 1 }, // 3 players
				{ 'teachers': 1, 'students': 2, 'headmaster': 1 },
				{ 'teachers': 2, 'students': 2, 'headmaster': 1 },
				{ 'teachers': 2, 'students': 3, 'headmaster': 1 },
				{ 'teachers': 2, 'students': 4, 'headmaster': 1 }, 
				{ 'teachers': 3, 'students': 4, 'headmaster': 1 },
				{ 'teachers': 3, 'students': 5, 'headmaster': 1 },
				{ 'teachers': 3, 'students': 6, 'headmaster': 1 }, // 10 players
			]

			var sectionLibrary = [
				{ 
					'name': 'lopen', 
					'numSeconds': 30, 
					'fakeLength': 0.2, 
					'desc': '<p>Iedereen mag naar een andere locatie lopen.</p><p>Dit is gratis en je mag overal naartoe, maar je mag <em>niet</em> buiten deze fase met je pion lopen!</p>' 
				},

				{ 
					'name': 'les', 
					'numSeconds': 120, 
					'fakeLength': 2, 
					'desc': '<p>Alle docenten met leerlingen in de klas, geven om de beurt een les.</p><p>Als de tijd om is, moet je stoppen. Kies de volgende docent die les gaat geven en klik op de knop "Volgende les!".</p>', 
					'continueBtnTxt': 'Volgende les!' 
				},

				{ 
					'name': 'pauze', 
					'numSeconds': 120, 
					'fakeLength': 0.5, 
					'desc': '<p>Tijdens de pauze zijn op verschillende plekken in de school iets te doen:</p><ul><li>Rommelen in je kluisje</li><li>In kantine eten halen</li><li>Spoedvergadering houden</li><li>Of gewoon uitrusten voor extra kaarten</li></ul>' 
				},

				{ 
					'name': 'toets', 
					'numSeconds': 120, 
					'fakeLength': 2, 
					'desc': '<p>Alle docenten met leerlingen in de klas, geven tegelijkertijd een toets.</p>' 
				},

				{
					'name': 'evaluatie',
					'numSeconds': 90,
					'fakeLength': 1,
					'desc': '<p>Het schoolhoofd ontvangt geld: aantal sterren x aantal docenten.</p><p>Roep vervolgens elke docent bij je voor een evaluatie.</p><ul><li>Elk positieve punt, levert één ratingpunt op en één aanzienpunt voor de docent.</li><li>Voor elk negatieve punt hoef je één euro salaris minder te betalen.</li></p><p>Als iedereen is geweest, kies je de beste docent en checkt de toetsresultaten.</p>'
				},

				{ 
					'name': 'vergadering', 
					'numSeconds': 300, 
					'fakeLength': 4.0, 
					'desc': '<p>Alle docenten en schoolhoofd vergaderen om regels te veranderen en resultaten te bespreken.</p>' 
				},

				{ 
					'name': 'ontspanning', 
					'numSeconds': 0, 
					'fakeLength': 0.0, 
					'desc': '<p>Einde van de dag!</p><p>Leerlingen vergeten een beetje informatie, maar kunnen wel extra kaarten trekken en bepaalde nuttige acties spelen.</p><p>Docenten kunnen ?? TO DO</p>',
					'continueBtnTxt': 'Volgende dag!'
				}
			];

			var sectionList = [];
			var curSection = -1;
			var curTeacher = 0;

			//
			// Generating random policies (which might be accepted or rejected)
			//
			function getRandomPolicy() {
				return 'TO DO: Generate random policies';
			}

			//
			// Timer related: set, start, stop, convert to string
			//
			function setTimer(val) {
				time = val;
				document.getElementById('clock').innerHTML = convertSecondsToString(val);
			}

			function startTimer() {
				if(timerInterval != null) { return; }

				document.getElementById('clock').style.color = null;

				timerInterval = setInterval(function() {
					setTimer(time - 1);

					if(time <= 0) {
						stopTimer();

						document.getElementById('continueButton').style.display = 'inline-block';
						document.getElementById('clock').style.color = 'red';
						// TO DO: Raise alarm, animate, whatever!?
					}
				}, 1000);
			}

			function stopTimer() {
				if(timerInterval == null) { return; }

				clearInterval(timerInterval);
				timerInterval = null;
			}

			function speedUpTimer() {
				setTimer(0);
			}

			function convertSecondsToString(s) {
				if(s < 0) { s = 0; }

				var minutes = Math.floor(s / 60);
				if(minutes < 10) {
					minutes = "0" + minutes;
				}

				var seconds = Math.floor(s % 60);
				if(seconds < 10) {
					seconds = "0" + seconds;
				}

				return minutes + ":" + seconds;
			}

			//
			// When continue button is pressed ...
			//
			function continueButtonPressed() {
				// if game is already done, this always reloads the page
				if(gameHasEnded) {
					location.reload();
					return;
				}

				// if we are giving classes or evaluating,
				// and we still have teachers to go, 
				// just reload timer!
				var sc = sectionList[curDay][curSection]
				if(sc.name == 'les' || sc.name == 'evaluatie') {
					if(curTeacher < (numTeachers - 1)) {
						curTeacher++;

						if(curTeacher == numTeachers - 1) {
							document.getElementById('continueButton').innerHTML = 'Ga door!';
						}

						setTimer(sc.numSeconds)
						startTimer()

						document.getElementById('continueButton').style.display = 'none';
						return;
					}
				} 
				
				// otherwise, always load the next section
				loadNextSection();
			}

			//
			// Create and display list of sections
			//
			function getRandomSection(tm, idx) {
				var section, invalidSection;
				var sc = sectionList[idx];

				do {
					invalidSection = false;
					section = sectionLibrary[Math.floor(Math.random() * sectionLibrary.length)]

					// can't stop the day until school's over
					if(section.name == 'ontspanning') {
						if(tm <= 17) {
							invalidSection = true;
						}

					// can't take two breaks right after each other
					} else if (section.name == 'pauze') {
						if(sc.length >= 2 && sc[sc.length - 2].name == 'pauze') {
							invalidSection = true;
						}

					// can't do a meeting before noon or twice after each other
					// TO DO: Don't vergader too often per day?
					} else if(section.name == 'vergadering') {
						if(tm <= 12 || (sc.length >= 2 && sc[sc.length - 2].name == 'vergadering')) {
							invalidSection = true;
						}

					// never pick a walking phase at random
					} else if(section.name == 'lopen') {
						invalidSection = true;
					}

				} while(invalidSection);

				return section;
			}

			function getNextSectionName(skipWalk = true) {
				var increment = 1;
				if(skipWalk) { increment = 2; }

				if(sectionList[curDay].length < curSection + increment) {
					return 'Einde van de dag';
				} else {
					return sectionList[curDay][curSection + increment].name;
				}
			}

			function displayEvent() {
				var randEvent = EVENTS[Math.floor(Math.random() * EVENTS.length)];

				document.getElementById('phase').innerHTML = 'gebeurtenis'
				document.getElementById('phase-explanation').innerHTML = randEvent.desc;

				justDisplayedEvent = true;
			}

			function getRandomWord() {
				// TO DO: Maybe remove words? Duplicates aren't fun
				return WORDS[Math.floor(Math.random() * WORDS.length)]
			}

			function getRandomSubject() {
				return SUBJECTS[Math.floor(Math.random() * SUBJECTS.length)]
			}

			function displayEndScreen() {
				gameHasEnded = true;

				document.getElementById('phase').innerHTML = 'Einde!';
				document.getElementById('phase-future').innerHTML = '';

				document.getElementById('phase-explanation').innerHTML = '<p>Het spel is ten einde!</p><p>Iedereen mag nu om de beurt diens persoonlijke missie onthullen! En juichen als deze is gehaald, of verdrietig afdruipen zo niet.</p>'

				document.getElementById('continueButton').style.display = 'inline-block';
				document.getElementById('continueButton').style.innerHTML = 'Speel nog een potje!';
			}

			function loadNextSection() {
				if(!justDisplayedEvent && Math.random() <= eventProbability) {
					displayEvent();
					return;
				}

				justDisplayedEvent = false;

				// update section; wrap to new days when needed
				curSection++;
				if(curSection >= sectionList[curDay].length) {
					curSection = 0;
					curDay++;
				}

				// check if game should end
				if(curDay >= sectionList.length) {
					displayEndScreen();
					return;
				}

				var sc = sectionList[curDay][curSection]

				// reset counter within the section
				curTeacher = 0;

				// show phase and explanation
				document.getElementById('phase').innerHTML = sc.name;
				document.getElementById('phase-explanation').innerHTML = sc.desc;

				// reveal upcoming phase
				document.getElementById('phase-future').innerHTML = 'Volgende dagdeel: ' + getNextSectionName();

				// determine random word and subject
				// TO DO: ONLY SHOW THIS WHEN RELEVANT (les, evaluatie, vergadering?)
				document.getElementById('phase-theme-word').innerHTML = getRandomWord();
				document.getElementById('phase-theme-subject').innerHTML = getRandomSubject();

				// hide the continue button
				document.getElementById('continueButton').innerHTML = sc.continueBtnTxt || 'Ga door!';
				document.getElementById('continueButton').style.display = 'none';

				// set time value: both on interface and behind the scenes
				setTimer(sc.numSeconds);
				startTimer();

				// load a random policy, if it's a meeting
				if(sc.name == 'vergadering') {
					document.getElementById('policy-proposal').innerHTML = getRandomPolicy();
				}
			}

			function generateDefaultSettingsObject() {
				var obj = 
					{
						'playerCount': 3,
						'numRounds': 2,
						'expansions':
						{
							'locations': false,
							'gym': false,
							'parents': false
						}
					}

				return obj
			}

			function readConfiguration() {
				gameConfig = JSON.parse(window.localStorage.getItem("trol-config"));

				// If no settings saved (we came here directly, not via main page), 
				// use default settings object
				if(gameConfig == null || gameConfig == undefined) {
					gameConfig = generateDefaultSettingsObject();
				}

				numPlayers = parseInt(gameConfig.playerCount) || 3
				numDays = parseInt(gameConfig.numRounds) || 2
				numTeachers = roleDistLibrary[numPlayers].teachers || 2
			}

			function prepareSections() {
				for(var i = 0; i < numDays; i++) {
					sectionList[i] = [];

					// day always starts at 8:30, with walking
					var dayTime = 8.5;

					sectionList[i].push(sectionLibrary[0]);
					dayTime += sectionLibrary[0].fakeLength;

					// Now just keep grabbing random (valid) sections until time's up
					while(dayTime < 24) {
						var section = getRandomSection(dayTime, i);
						
						dayTime += section.fakeLength;
						dayTime += sectionLibrary[0].fakeLength;

						sectionList[i].push(section);
						sectionList[i].push(sectionLibrary[0]);

						// day always ends on ontspanning
						if(section.name == 'ontspanning') {
							break;
						}
					}
				}
			}

			//
			// All functionality for starting the actual game
			//
			function startGame() {
				readConfiguration();
				prepareSections();

				loadNextSection();
			}

			startGame();
		</script>
	</body>
</html>