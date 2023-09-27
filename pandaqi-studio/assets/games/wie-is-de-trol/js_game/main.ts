import shuffle from "js/pq_games/tools/random/shuffle";
import { ADDERTJES, Q, ROLVOORDELEN, TASKS } from "./dict";

/*
There are five game phases:
 => Setup (executed once): all players must enter their name + get to know if they are the mole
 => Task: game shows a task to be completed
 => Test: each player, individually, takes the test. (Candidates have their score recorded, the answers of the mole are deemed the real answers)
 => Test Results: one "afvaller" is indicated (or in last round, the "winner" of the whole game)
 => Game end: the game is over, the mole is revealed
*/
let gamePhase = 'setup';
let subGamePhase = 'register';

let gameConfig, numPlayers, numTasksPerRound, numQuestionsPerTask, numRounds, firstGame;

// some configuration/globally needed variables
let taskList, oldTaskList;
let questionList;

let task;
let curRound = -1;
let curTask = -1, curQuestion = -1;
let curQuestionHintIndex = -1;

let players = [];
let moleIndex = -1;
let curTestTakerIndex = -1;
let playersThatTookTest = 0;

let calculatingTestResults = false;
let testStatistics = {
	allResults: [],
	resultsWithPlayerAttached: [],
	numberCorrectMoleVoters: 0
};

let previousTaskWasForbidden = false;

let timerInterval = null;
let timerValue = 0;

let gokkerResults = null;

function pickRandomTaskOfType(roundNum, type) {
	for(let i = 0; i < TASKS.length; i++) {
		let t = TASKS[i]
		let p = t.params

		// don't pick task if we have firstGame enabled, and it's not fit for a first game
		if(firstGame && !p.firstGame) {
			continue;
		}

		// don't pick two forbidden tasks after each other
		if(t.category.indexOf('Verboden') != -1 && previousTaskWasForbidden) {
			continue;
		}

		// don't pick task if it cannot fit in this round
		if(p.forbiddenAtStart && roundNum == 0) {
			continue;
		}

		if(p.forbiddenAtEnd && roundNum == (numRounds - 1)) {
			continue;
		}

		// otherwise, if type matches, return it immediately and remove from original list!
		if(t.type == type) {
			previousTaskWasForbidden = (t.category.indexOf('Verboden') != -1)
			return TASKS.splice(i, 1)[0];
		}
	}

	// if we find NO task of this type, just return the first task in the list as fail-safe
	return TASKS.splice(0, 1)[0];
}

function getRandomAddertje() {
	if(ADDERTJES.length <= 0) { return "Geen" }

	return ADDERTJES.splice(Math.floor(Math.random()*ADDERTJES.length), 1)[0];
}

function getRandomRolVoordeel() {
	if(ROLVOORDELEN.length <= 0) { return "Geen" }

	return ROLVOORDELEN.splice(Math.floor(Math.random() * ROLVOORDELEN.length), 1)[0];
}

//
// Preparation for each game (list of tasks, give actions to buttons, pick a mole, etc.)
//
function preparePlayers() {
	moleIndex = Math.floor(Math.random() * numPlayers);
}

function prepareTaskList() {
	// remove any tasks from the list that are NOT suitable for the current settings
	for(let i = TASKS.length - 1; i >= 0; i--) {
		let p = TASKS[i].params

		// min/max number of players
		if(p.minPlayers != undefined && p.minPlayers > numPlayers) {
			TASKS.splice(i, 1);
			continue;
		}

		if(p.maxPlayers != undefined && p.maxPlayers < numPlayers) {
			TASKS.splice(i, 1);
			continue;
		}

		// expansions not included
		if(p.eigenschappen == true && !gameConfig.expansions.eigenschappen) {
			TASKS.splice(i, 1);
			continue;
		}

		if(p.specialeKrachten == true && !gameConfig.expansions.specialeKrachten) {
			TASKS.splice(i, 1);
			continue;
		}

		if(p.bondjes == true && !gameConfig.expansions.bondjes) {
			TASKS.splice(i, 1);
			continue;
		}
	}

	// randomly order tasks 
	// (because we'll just be searching from start of list whenever we grab a new task of a certain type)
	shuffle(TASKS);

	taskList = [];
	oldTaskList = [];

	// pre-create the list of miscellaneous tasks (the third one per round), 
	// to ensure we have enough of each type
	let taskTypes = ['simple', 'money', 'help'];
	let leftoverTasks = [];
	if(gameConfig.expansions.specialeKrachten) {
		taskTypes.push('specialeKrachten')
		leftoverTasks.push('specialeKrachten')
	}

	if(gameConfig.expansions.eigenschappen) {
		taskTypes.push('eigenschappen')
		leftoverTasks.push('eigenschappen')
	}

	if(gameConfig.expansions.bondjes) {
		taskTypes.push('bondjes')
		leftoverTasks.push('bondjes')
	}

	// while we don't have enough leftover tasks yet, keep adding random ones
	while(leftoverTasks.length < numRounds) {
		leftoverTasks.push( taskTypes[Math.floor(Math.random() * taskTypes.length)] )
	}

	shuffle(leftoverTasks)

	// @IMPROV: This assumes 3 tasks per round => make variable somehow?
	// finally, create the actual rounds: one MONEY, one HELP, one LEFTOVER (shuffle afterwards)
	for(let i = 0; i < numRounds; i++) {
		let tempTaskList = [];

		tempTaskList.push(pickRandomTaskOfType(i, 'money'));
		tempTaskList.push(pickRandomTaskOfType(i, 'help'));
		tempTaskList.push(pickRandomTaskOfType(i, leftoverTasks.splice(0, 1)[0]));

		// make tasks for this round appear in a random order in final game
		shuffle(tempTaskList);
		taskList = taskList.concat(tempTaskList);
	}
}

function prepareButtons() {
	document.getElementById('inputButton').addEventListener('click', function(ev) {
		inputButtonPressed();
	});

	document.getElementById('continueButton').addEventListener('click', function(ev) {
		continueButtonPressed();
	});
}

//
// What to do when pressing certain buttons
//
function inputButtonPressed() {
	if(gamePhase != 'setup' && gamePhase != 'test') {
		return;
	}

	// @ts-ignore
	let val = document.getElementById('inputText').value;

	// during setup, the input button registers players
	if(gamePhase == 'setup') {
		if(subGamePhase == 'register') {

			// basic error checking
			if(val.length <= 0 || val.length >= 20) {
				createErrorMessage("Je naam is te lang of te kort!")
				return;
			}

			for(let i = 0; i < players.length; i++) {
				if(players[i].name.toLowerCase() == val.toLowerCase()) {
					createErrorMessage("Deze naam bestaat al!");
					return;
				}
			}

			let playerObj = { name: val, mole: false };
			let resultText = 'Jij bent een kandidaat!'

			if(players.length == moleIndex) {
				playerObj.mole = true;
				resultText = 'Jij bent DE TROL!'
			}

			players.push(playerObj);

			document.getElementById('inputResult').innerHTML = resultText;
			document.getElementById('inputText').style.display = 'none';
			document.getElementById('inputButton').innerHTML = 'Ga door!';

			subGamePhase = 'showRole';
		} else {
			document.getElementById('inputResult').innerHTML = '';
			document.getElementById('inputText').style.display = 'block';
			document.getElementById('inputButton').innerHTML = 'Registreer speler'

			subGamePhase = 'register';

			if(players.length >= numPlayers) {
				startGamePhase();
			}
		}
	
	// during the test, the input button starts a new test for the given player
	} else if(gamePhase == 'test') {
		if(subGamePhase == 'inbetween') {

			// find index (in players list) of this player
			curTestTakerIndex = -1;
			for(let i = 0; i < players.length; i++) {
				if(players[i].name.toLowerCase() == val.toLowerCase()) {
					curTestTakerIndex = i;
					break;
				}
			}

			// basic error checking
			if(curTestTakerIndex == -1) {
				createErrorMessage("Deze speler bestaat niet!");
				return;
			}

			let p = players[curTestTakerIndex]
			if(p.takenTest) {
				createErrorMessage("Deze speler heeft de test al gemaakt!");
				return;
			}

			// save the given settings
			p.testSettings = {
				// @ts-ignore
				'jokerCount': parseInt(document.getElementById('setting-jokerCount').value) ?? 0,
				// @ts-ignore
				'redCards': parseInt(document.getElementById('setting-redCards').value) ?? 0,
				// @ts-ignore
				'freePass': document.getElementById('setting-freePass').checked,
				// @ts-ignore
				'destroyFreePass': document.getElementById('setting-destroyFreePass').checked,
				// @ts-ignore
				'specialeKracht': document.getElementById('setting-specialeKracht').value ?? ""
			}

			let lastRound = (curRound == numRounds - 1)
			if(p.testSettings.specialeKracht == 'Helderziende' && lastRound) {
				p.jokerCount++;
			}

			// actually start the test
			p.takenTest = true;
			p.testAnswers = [];

			p.testStartTime = Date.now();

			subGamePhase = 'test';
			curQuestion = 0;
			playersThatTookTest++;

			// plan to display a hint at a random question
			curQuestionHintIndex = Math.floor(Math.random() * questionList.length);

			toggleInputInterface('none');

			displayNextQuestion();
		}
		
	}
}

function answerButtonPressed(answer) {
	players[curTestTakerIndex].testAnswers.push(parseInt(answer));

	curQuestion++;
	if(curQuestion >= questionList.length) {
		finishTestCycle();
		return;
	}

	displayNextQuestion();
}

function continueButtonPressed() {
	if(calculatingTestResults) {
		return;
	}

	if(timerInterval != null) {
		clearInterval(timerInterval);
		timerInterval = null;
	}

	if(gamePhase == 'gameOver') {
		location.reload();
		return;
	}

	if(curTask == -1) {
		startGamePhase();
		return;
	}

	curTask++;

	if(curTask >= numTasksPerRound) {
		startTestPhase();
	} else {
		displayNextTask();
	}
}

//
// Displaying tasks & questions
//
function displayNextTask() {
	task = taskList[curTask];

	document.getElementById('title').scrollIntoView({ behavior: "smooth", block: "start" });

	// some magic replacements to highlight important elements, like which cards to play
	let description = task.desc.replace(/\#/gi, '<span class="numPlayersIndicator">#</span>');

	description = description.replace(/(renkaart(en)?)/gi, '<span class="cardType-base cardType-running">$1</span>')
	description = description.replace(/(puzzelkaart(en)?)/gi, '<span class="cardType-base cardType-puzzling">$1</span>')
	description = description.replace(/(informatiekaart(en)?)/gi, '<span class="cardType-base cardType-information">$1</span>')
	description = description.replace(/(inspanningskaart(en)?)/gi, '<span class="cardType-base cardType-effort">$1</span>')

	description = description.replace(/(samenwerkingskaart(en)?)/gi, '<span class="cardType-base cardType-cooperation">$1</span>')
	description = description.replace(/(wantrouwkaart(en)?)/gi, '<span class="cardType-base cardType-distrust">$1</span>')
	description = description.replace(/(ontspanningskaart(en)?)/gi, '<span class="cardType-base cardType-relaxation">$1</span>')
	description = description.replace(/(leiderkaart(en)?)/gi, '<span class="cardType-base cardType-leader">$1</span>')

	document.getElementById('title').innerHTML = task.name;

	if(firstGame) {
		let reminderButton = document.createElement('button');
		reminderButton.innerHTML = '?';
		reminderButton.classList.add('hintButton');
		reminderButton.setAttribute('data-hint', 'hidden');
		reminderButton.addEventListener('click', function(ev) {
			toggleRuleReminder(reminderButton);
		});

		document.getElementById('title').appendChild(reminderButton);
	}


	document.getElementById('story').innerHTML = task.story;
	document.getElementById('desc').innerHTML = description;

	document.getElementById('category').innerHTML = task.category.join(", ");
	document.getElementById('money').innerHTML = task.money;
	document.getElementById('addertje').innerHTML = getRandomAddertje();
	document.getElementById('rolvoordeel').innerHTML = getRandomRolVoordeel();

	// only display timer if needed; and if so, set to the right value
	if(task.params.timePerPlayer != undefined || task.params.totalTime != undefined) {
		document.getElementById('timer').style.display = 'block';

		// two possible parameters: time per player (for individual tasks) or total time (when you do it as a group, regardless of size)
		let timeInSeconds = 60;
		if(task.params.timePerPlayer != undefined) {
			timeInSeconds = task.params.timePerPlayer*numPlayers;
		} else {
			timeInSeconds = task.params.totalTime;
		}

		timerValue = timeInSeconds;

		document.getElementById('timerValue').setAttribute('data-originalTimerValue', timerValue.toString());
		document.getElementById('timerValue').innerHTML = convertSecondsToString(timerValue);
	} else {
		document.getElementById('timer').style.display = 'none';
	}
}

function startTimer() {
	document.getElementById('timerValue').style.color = 'green';

	// if it's zero (or negative), reset to original timer value
	if(timerValue <= 0) {
		timerValue = parseInt( document.getElementById('timerValue').getAttribute('data-originalTimerValue') );
	}

	timerInterval = setInterval(function() {
		timerValue -= 1;
		document.getElementById('timerValue').innerHTML = convertSecondsToString(timerValue);

		if(timerValue <= 0) {
			stopTimer();

			document.getElementById('timerValue').style.color = 'red';
			// @IMPROV: Raise alarm, animate, whatever!?
		}
	}, 1000);
}

function stopTimer() {
	clearInterval(timerInterval);
	timerInterval = null;

	document.getElementById('timerValue').style.color = 'white';
}

function convertSecondsToString(s) {
	let minutes : number|string = Math.floor(s / 60);
	if(minutes < 10) {
		minutes = "0" + minutes;
	}

	let seconds : number|string = Math.floor(s % 60);
	if(seconds < 10) {
		seconds = "0" + seconds;
	}

	return minutes + ":" + seconds;
}

function toggleRuleReminder(btn) {
	let reminderText = '<p>Elke opdracht volgt deze structuur:</p><ol><li>Pak startinzet uit bank + iedere speler mag eigen geld inzetten</li><li>Meeste geld ingezet? Je mag nieuwe PM nomineren</li><li>Leider kiest welke speler begint.</li><li>Tijdens je beurt, trek je één kaart, en speelt zoveel kaarten (open) als je wilt.</li><li>Speel één ronde (met de klok mee), check dan resultaat</li></ol>'

	if(btn.getAttribute('data-hint') == 'visible') {
		btn.setAttribute('data-hint', 'hidden')

		document.getElementById('ruleReminder').style.display = 'none';
	} else {
		btn.setAttribute('data-hint', 'visible');

		document.getElementById('ruleReminder').style.display = 'block';
		document.getElementById('ruleReminder').innerHTML = reminderText
	}
}

function toggleTaskReminder(btn, taskName) {
	if(btn.getAttribute('hint') == 'visible') {
		btn.setAttribute('hint', 'hidden');

		document.getElementById('story').style.display = 'none';
	} else {
		btn.setAttribute('hint', 'visible');

		let correspondingTask = null;
		for(let i = 0; i < oldTaskList.length; i++) {
			if(oldTaskList[i].name == taskName) {
				correspondingTask = oldTaskList[i];
				break;
			}
		}

		document.getElementById('story').style.display = 'block';
		document.getElementById('story').innerHTML = correspondingTask.desc;
	}
}

function getRandomMoneyValue() {
	let moneyValues = [10, 20, 50, 100];
	let randNumBriefjes = Math.floor(Math.random() * 3) + 3;

	let total = 0;
	for(let m = 0; m < randNumBriefjes; m++) {
		total += moneyValues[Math.floor(Math.random() * moneyValues.length)];
	}

	return total;
}

function displayRandomOffer() {
	// @IMPROV: Think of more (varied/interesting/challenging) offers
	// 		  (Maybe also some things that don't require taking a lot of money out of the shared money jar)

	let offerTypes = ['moneyToJokers', 'moneyToFreePass', 'moneyToCards', 'moneyToMisc'];
	let randType = offerTypes[Math.floor(Math.random() * offerTypes.length)]

	let msg = '<strong>Aanbieding! </strong>';
	let reward, geldBedrag;

	switch(randType) {
		case 'moneyToJokers':
			geldBedrag = getRandomMoneyValue();
			reward = Math.floor(Math.random() * 2) + 2

			msg += 'Haal <strong>' + geldBedrag + ' euro</strong> uit de pot in ruil voor <strong>' + reward + ' jokers</strong>';
			break;

		case 'moneyToFreePass':
			geldBedrag = getRandomMoneyValue();
			reward = 'vrijstelling';
			if(Math.random() <= 0.5) {
				reward = 'zwarte vrijstelling'
			}

			msg += 'Haal <strong>' + geldBedrag + ' euro</strong> uit de pot in ruil voor een <strong>' + reward + '</strong>';
			break;

		case 'moneyToCards':
			geldBedrag = getRandomMoneyValue();
			reward = Math.floor(Math.random() * 5) + 5;
			msg += 'Haal <strong>' + geldBedrag + ' euro</strong> uit de pot in ruil voor <strong>' + reward + ' kaarten</strong>'
			break;

		case 'moneyToMisc':
			let possibleRewards = ['persoonlijke pot'];

			if(gameConfig.expansions.specialeKrachten) {
				possibleRewards.push('speciale krachten')
			}

			if(gameConfig.expansions.eigenschappen) {
				possibleRewards.push('eigenschappen');
			}

			geldBedrag = getRandomMoneyValue();
			let rewardType = possibleRewards[Math.floor(Math.random() * possibleRewards.length)];
			reward = Math.floor(Math.random() * 3) + 1;

			msg += 'Haal <strong>' + geldBedrag + ' euro</strong> uit de pot';

			if(rewardType == 'persoonlijke pot') {
				msg += ', verdubbel dit, en voeg dit bedrag toe aan je persoonlijke pot'
			} else if(rewardType == 'speciale krachten') {
				msg += ' in ruil voor ' + reward + ' speciale kracht(en) naar keuze (die niet in het bezit van iemand anders zijn)'
			} else if(rewardType == 'eigenschappen') {
				msg += ' om ' + reward + ' negatieve eigenschappen weg te doen of positieve eigenschappen aan te trekken'
			}

			break;
	}

	document.getElementById('story').style.display = 'block';
	document.getElementById('story').innerHTML = msg;
}

function displayNextQuestion() {
	document.getElementById('title').scrollIntoView({ behavior: "smooth", block: "start" });

	// document.getElementById('story').style.display = 'none';
	document.getElementById('options').innerHTML = '';

	let q = questionList[curQuestion];
	
	let connectedTask = q.connectedTask;
	let question = q.question;
	let options = q.answers.slice(); // copy of array, instead of reference => why? because mole can edit option list

	// display button to display reminder/hint about what an exercise was about
	let hintButton = null;
	if(connectedTask != null) {
		hintButton = document.createElement('button');
		hintButton.innerHTML = '?';
		hintButton.classList.add('hintButton');

		hintButton.addEventListener('click', function(ev) {
			toggleTaskReminder(hintButton, connectedTask);
		});

		hintButton.setAttribute('hint', 'hidden');
	}

	let title = 'Vraag over <em>' + connectedTask + '</em>';
	if(connectedTask == null) {
		title = 'De grote vraag ...';
	}

	let curPlayerIsMole = (curTestTakerIndex == moleIndex);
	let lastRound = (curRound == numRounds - 1)
	let lastQuestion = (curQuestion == questionList.length - 1);

	document.getElementById('story').style.display = 'none';

	if(!lastRound) {
		// the mole gets hints every question (+ a self destroy option on the last question)
		// candidates only get a hint at a predefined index
		if(curPlayerIsMole) {
			displayMoleHint();
			
			if(lastQuestion) {
				addSelfDestroyOption(options);
			}
		} else {
			if(curQuestion == curQuestionHintIndex) {
				displayMoleHint(false);
			}
		}

		// SPECIALE KRACHT: Helderziende
		let p = players[curTestTakerIndex]
		if(p.testSettings.specialeKracht == 'Helderziende' && curQuestion < 3) {
			displayMoleHint(false, 'Task', curQuestion);
		}

		// SPECIALE KRACHT: Afluisteraar
		if(p.testSettings.specialeKracht == 'Afluisteraar') {
			displayMoleHint(false, 'KnownAnswers', curQuestion);
		}

		// SPECIALE KRACHT: Handelaar
		if(p.testSettings.specialeKracht == 'Handelaar') {
			if(curQuestion == curQuestionHintIndex) {
				displayRandomOffer();
			}
		}
	}

	document.getElementById('title').innerHTML = title;
	document.getElementById('desc').innerHTML = '<p>' + question + '</p>';

	if(hintButton != null) {
		document.getElementById('title').appendChild(hintButton);
	}

	for(let j = 0; j < options.length; j++) {
		let cont = document.createElement('div');
		let number = document.createElement('button');
		number.innerHTML = (j+1).toString();
		cont.appendChild(number);

		number.setAttribute('data-num', j + "");
		number.addEventListener('click', function(ev) {
			let number = (ev.currentTarget as HTMLElement).getAttribute('data-num');
			answerButtonPressed(number);
		})

		let text = document.createElement('p');
		text.innerHTML = options[j];
		cont.appendChild(text);

		document.getElementById('options').appendChild(cont);
	}
}

function addSelfDestroyOption(list) {
	list.push( "Maak mij de afvaller" );
}

function displayMoleHint(mole = true, fixedHint = null, fixedIndex = -1) {
	document.getElementById('story').style.display = 'block';

	// the mole will also get information about tasks, who voted on them, etc.
	// candidates will only get "easy" information, such as that the leader will become important next round
	let hintTypes = ['Categories', 'Task', 'Money', 'Treasurer', 'Leader', 'TaskType', 'Snitch'];
	if(!mole) {
		hintTypes = ['Categories', 'Money', 'Treasurer', 'Leader'];
	}

	let randomHintType = hintTypes[Math.floor(Math.random() * hintTypes.length)];
	if(fixedHint != null) {
		randomHintType = fixedHint
	}

	let hintText = '<strong>Hint! </strong>';

	let randTaskIndex = Math.floor(Math.random() * numTasksPerRound);
	if(fixedIndex >= 0) {
		randTaskIndex = fixedIndex;
	}


	// NOTE: At this time, the previous tasks have alread been removed from the system
	// So going from 0-numTasksPerRound already looks at the upcoming tasks
	// (If multiple stuff, just seperate with a mid dot => &middot; => looks better than anything else)
	switch(randomHintType) {
		case 'Categories':
			hintText += 'Opdracht ' + (randTaskIndex+1) + ' (van de volgende ronde) heeft deze categorieën: ';
			hintText += taskList[randTaskIndex].category.join(", ");

			break;

		case 'Task':
			hintText += 'Dit is opdracht ' + (randTaskIndex + 1) + ' van de volgende ronde: ';
			hintText += taskList[randTaskIndex].desc;

			break;

		case 'TaskType':
			hintText += 'In opdracht ' + (randTaskIndex+1) + ' (van de volgende ronde) '

			if(taskList[randTaskIndex].type == 'help' || taskList[randTaskIndex].type == 'specialeKrachten' || taskList[randTaskIndex].type == 'eigenschappen') {
				hintText += 'zijn hulpmiddelen (jokers en dergelijke) te verdienen!';
			} else {
				hintText += 'zijn GEEN hulpmiddelen (jokers en dergelijke) te verdienen!';
			}

			break;

		case 'Money':
			hintText += 'Opdracht ' + (randTaskIndex+1) + ' (van de volgende ronde) heeft deze startinzet: ';
			hintText += taskList[randTaskIndex].money;
			break;

		case 'Treasurer':
			let numTreasurerTasks = 0;
			for(let i = 0; i < numTasksPerRound; i++) {
				if(taskList[i].treasurer) {
					numTreasurerTasks++;
				}
			}

			if(numTreasurerTasks == 0) {
				hintText += 'In de komende opdrachten wordt de penningmeester NIET belangrijk.'
			} else {
				hintText += 'De komende ronde kent ' + numTreasurerTasks + ' opdracht(en) waarin de penningmeester belangrijk is.'
			}

			break;

		case 'Leader':
			let numLeaderTasks = 0;
			for(let i = 0; i < numTasksPerRound; i++) {
				if(taskList[i].leader) {
					numLeaderTasks++;
				}
			}

			if(numLeaderTasks == 0) {
				hintText += 'In de komende opdrachten wordt de leider NIET belangrijk.'
			} else {
				hintText += 'De komende ronde kent ' + numLeaderTasks + ' opdracht(en) waarin de leider belangrijk is'
			}

			break;

		case 'Snitch':
			let correctMoleVotersHistory = [];
			let correctMoleVotersNow = [];

			let testLength = questionList.length
			for(let i = 0; i < players.length; i++) {
				if(i == moleIndex) { continue; }

				// check both the current and previous test (because we don't know at what point the mole will be taking the test)
				let p = players[i]
				if(p.votedCorrectMole) {
					correctMoleVotersHistory.push( p.name );
				}

				if(p.takenTest) {
					if(p.testAnswers[testLength - 1] == moleIndex) {
						correctMoleVotersNow.push( p.name );
					}
				}
			}

			if(correctMoleVotersNow.length <= 0 && correctMoleVotersHistory.length <= 0) {
				hintText += 'Gefeliciteerd! Niemand heeft (tot nog toe) op jou gestemd bij deze en de vorige test!';
			} else if(correctMoleVotersNow.length > 0) {
				let randomMoleVoter = correctMoleVotersNow[Math.floor(Math.random() * correctMoleVotersNow.length)]
				hintText += 'Oh nee! De speler <em>' + randomMoleVoter + '</em> heeft jou als trol aangewezen bij deze test';
			} else {
				let randomMoleVoter = correctMoleVotersHistory[Math.floor(Math.random() * correctMoleVotersHistory.length)]
				hintText += 'Oh nee! De speler <em>' + randomMoleVoter + '</em> heeft jou als trol aangewezen bij de vorige test';
			}

			break;

		case 'KnownAnswers':
			hintText += 'Dit waren de antwoorden van andere spelers: '

			let lastQuestion = (randTaskIndex == (questionList.length - 1))
			let splitText = [];
			for(let i = 0; i < players.length; i++) {
				if(players[i].takenTest) {
					let answer = players[i].testAnswers[randTaskIndex]

					// if we display the true answers by the mole, we can easily give away the secret, so make these random
					if(players[i].mole) {
						do {
							answer = Math.floor(Math.random() * players.length)
						} while(answer == i || answer >= players.length)
					}

					splitText.push( players[i].name + ") " + (answer + 1));
				}
			}

			hintText += splitText.join(' &middot; ');

			break;
	}

	document.getElementById('story').innerHTML = hintText;
}

function addQuestionToList(q, taskName) {
	// remember the original task, and push to total list
	q.connectedTask = taskName;
	questionList.push(q);
}

function createQuestionList() {
	questionList = [];

	// for each task ...
	for(let i = 0; i < numTasksPerRound; i++) {
		let task = taskList[i];
		let questions = task.questions;

		// go through all questions connected to it ...
		// (or only add as many as the current settings allow => @IMPROV: Maybe shuffle this? Now it always adds the same on reduced settings?)
		let numQ = Math.min(numQuestionsPerTask, questions.length)
		for(let q = 0; q < numQ; q++) {
			addQuestionToList(questions[q], task.name);
		}
	}

	// EXCEPTION: if it's the last round, add random questions from previous tasks
	let lastRound = (curRound == numRounds - 1);
	if(lastRound) {
		for(let i = 0; i < oldTaskList.length; i++) {
			let task = oldTaskList[i];
			let questions = task.questions;

			// add one question out of the total (for this particular task)
			addQuestionToList(questions[Math.floor(Math.random() * questions.length)], task.name);

			// sometimes, skip a task completely
			i += Math.floor(Math.random() * 2);
		}
	}

	shuffle(questionList);

	// finally, add the big question "Wie is de Trol?" => ALWAYS at the end!
	let answers = [];

	for(let i = 0; i < players.length; i++) {
		answers.push( players[i].name );
	}

	let q = new Q("Wie is de Trol?", answers);
	questionList.push(q);
}

function removeCurrentRoundTasks() {
	for(let i = 0; i < numTasksPerRound; i++) {
		oldTaskList.push( taskList.shift() );
	}
}

function getPlayerWithWorstTestResult() {
	// create object to keep track of test statistics
	testStatistics = {
		allResults: [],
		resultsWithPlayerAttached: [],
		numberCorrectMoleVoters: 0,
	};

	// first, register the answers from the mole as the "correct" answers
	let correctAnswers = players[moleIndex].testAnswers;

	// if the mole chose to self-destruct, they will always get the worst score, no other computation necessary
	// (on the LAST question, the very LAST button was pressed)
	let selfDestruct = (correctAnswers[correctAnswers.length - 1] == players.length);
	if(selfDestruct) {
		// If mole choses to self-destruct, just fill the test statistics with random values
		for(let i = 0; i < players.length - 1; i++) {
			testStatistics.allResults.push(Math.floor(Math.random() * questionList.length));

			if(Math.random() <= 1.0/(players.length - 1)) {
				testStatistics.numberCorrectMoleVoters++;
			}
		}

		// Finally, just return the name of the mole
		return players[moleIndex].name;
	}

	// check if anyone entered a "zwarte vrijstelling"
	// (we only need one for the effect to work, no matter who used it)
	let destroyFreePass = false;
	let numPlayersWithFreePass = 0;
	for(let i = 0; i < players.length; i++) {
		if(players[i].testSettings.destroyFreePass) {
			destroyFreePass = true;
			break
		}
	}

	// (What's this? In the last round, we want the BEST score, so we check in the reverse direction)
	let lastRound = (curRound == numRounds - 1)
	let checkingDir = lastRound ? -1 : 1;

	// then grade the test from all other players
	let maxPossibleTestScore = questionList.length
	let worstPlayer = null, worstScore = checkingDir*Infinity, worstTime = checkingDir*Infinity;
	for(let i = 0; i < players.length; i++) {
		if(i == moleIndex) { continue; }

		// first grade all the questions independently
		let p = players[i];
		let score = 0;
		for(let a = 0; a < p.testAnswers.length; a++) {
			if(p.testAnswers[a] == correctAnswers[a]) {
				score++;

				let lastQuestion = (a == p.testAnswers.length - 1);
				if(lastQuestion) {
					// exception: red carded players cannot vote correct mole on very last round
					if(lastRound && p.testSettings.redCards > 0) {
						p.votedCorrectMole = false;
					} else {
						testStatistics.numberCorrectMoleVoters++;
						p.votedCorrectMole = true;
					}
				} else {
					p.votedCorrectMole = false;
				}
			}
		}

		// now check for any jokers/vrijstellingen/stuff, but only if they are not destroyed
		if(!destroyFreePass) {
			// free pass?
			if(p.testSettings.freePass) {
				// on the last round, free passes count as two jokers instead
				if(lastRound) {
					p.testSettings.jokerCount += 2;

				// otherwise, keep track of it and immediately CONTINUE! (can't be the worst player)
				} else {
					numPlayersWithFreePass++;
					continue;
				}
				
			}

			// update score based on jokers/red cards, clamp between 0 and maximum score
			score = Math.min(Math.max(score + p.testSettings.jokerCount - p.testSettings.redCards, 0), maxPossibleTestScore)
		}

		testStatistics.allResults.push(score);

		testStatistics.resultsWithPlayerAttached.push({ playerIndex: i, score: score })

		// finally, check score against current worst score
		if(checkingDir*score < checkingDir*worstScore) {
			worstScore = score;
			worstPlayer = p;
			worstTime = p.timeTaken
		} else if(score == worstScore) {
			if(checkingDir*p.timeTaken > checkingDir*worstTime) {
				worstPlayer = p;
				worstTime = p.timeTaken;
			}
		}
	}

	// SPECIALE KRACHT: Gokker
	// sort all players by score (DESCENDING) => check if the Gokker is in the top 50%
	if(gameConfig.expansions.specialeKrachten) {
		testStatistics.resultsWithPlayerAttached.sort((a,b) => { return a.score - b.score });

		for(let i = 0; i < testStatistics.resultsWithPlayerAttached.length; i++) {
			let playerIndex = testStatistics.resultsWithPlayerAttached[i].player;
			if(players[playerIndex].testSettings.specialeKracht == 'Gokker') {
			
				// succesfully gegokt!
				if(i < 0.5*testStatistics.resultsWithPlayerAttached.length) {
					gokkerResults = 0;

				// not so succesfully gegokt!
				} else {
					gokkerResults = getRandomMoneyValue();
				}

				break;
			}
		}
	}

	// check if ALL players have a free pass => because in that case, nobody should exit
	let allPlayersHaveFreePass = (numPlayersWithFreePass >= players.length);
	if(allPlayersHaveFreePass) {
		return "NIEMAND! Iedereen gaat door naar de volgende ronde.";
	}

	return worstPlayer.name;
}

function startTestCycle() {
	gamePhase = 'test';
	subGamePhase = 'inbetween';

	toggleGameInterface('none');
	toggleSettingsInterface();

	document.getElementById('title').innerHTML = 'Test';

	let msg = 'Het is tijd voor de test! Typ je naam, zorg dat niemand meekijkt, en vul de vragen zo goed mogelijk in.';
	if(playersThatTookTest > 0) {
		msg = 'De test is ingevuld! Roep de volgende speler maar.'
	}

	document.getElementById('desc').innerHTML = '<p>' + msg + '</p>';

	document.getElementById('inputText').innerHTML = '';
	document.getElementById('inputButton').innerHTML = 'Begin test!';
	
	toggleInputInterface();
}

function finishTestCycle() {
	document.getElementById('options').innerHTML = '';

	let p = players[curTestTakerIndex]
	p.timeTaken = Date.now() - p.testStartTime // in milliseconds, should always be positive

	// SPECIALE KRACHT: Fotofinish
	// (we use a trick: just set time to 0, so we never lose on time!)
	if(p.testSettings.specialeKracht == 'Fotofinish') {
		p.timeTaken = 0;
	}

	// if all players have taken the test, go to test results!
	if(playersThatTookTest >= players.length) {
		startTestResultsPhase();
		return;
	}

	// otherwise, start a new cycle
	startTestCycle();
}

//
// Starting new phases
//
function startSetupPhase() {
	gamePhase = 'setup';
	subGamePhase = 'register';

	toggleGameInterface('none');
	toggleSettingsInterface('none');
	toggleInputInterface();

	document.getElementById('title').innerHTML = 'Welkom!'
	document.getElementById('desc').innerHTML = '<p>Zorg ervoor dat anderen niet kunnen meekijken.</p><p>Laat dan iedere speler één voor één naar de computer komen, hun naam intypen, en op de knop drukken. Je krijgt meteen te weten of jij de trol bent of niet.</p><p>(Vergeet niet daarna opnieuw op de knop te drukken.)</p>';
}

function startGamePhase() {
	if(taskList.length <= 0) {
		startGameOverPhase();
		return;
	}

	gamePhase = 'task';
	subGamePhase = 'task';

	curTask = 0;
	curRound++;

	document.getElementById('continueButton').innerHTML = 'Ga door!'

	toggleGameInterface();
	toggleInputInterface('none');

	displayNextTask();
}

function startTestPhase() {
	gamePhase = 'test';
	subGamePhase = 'inbetween';

	createQuestionList();
	removeCurrentRoundTasks();

	startTestCycle();
}

function clearTestResults() {
	// reset all variables keeping track of current test progress 
	curQuestion = -1;
	playersThatTookTest = 0;
	for(let i = 0; i < players.length; i++) {
		players[i].takenTest = false;
	}
}

function displayRandomTestStatistic() {
	let statistics = ['worstResult', 'bestResult', 'averageResult', 'doubleResults']

	if(testStatistics.numberCorrectMoleVoters > 0) {
		statistics.push('correctMoles');
	} else {
		statistics.push('shame')
	}

	let randStatistic = statistics[Math.floor(Math.random() * statistics.length)]
	let res = testStatistics.allResults

	switch(randStatistic) {
		case 'worstResult':
			return "Deze speler had slechts " + res.sort()[0] + " vragen goed.";

		case 'bestResult':
			return 'De beste speler van deze ronde had ' + res.sort()[res.length - 1] + ' vragen goed.';

		case 'averageResult':
			let avg = 0;
			for(let i = 0; i < res.length; i++) {
				avg += res[i];
			}

			let roundedAvg = Math.round((avg/res.length) * 10)/10
			return 'Het gemiddelde aantal goede antwoorden op deze test was ' + roundedAvg + '.';

		case 'doubleResults':
			let numDoubles = 0;

			res.sort();

			for(let i = 0; i < res.length; i++) {
				if(i < (res.length - 1) && res[i] == res[i+1]) {
					numDoubles++;
				} 

				if(i > 0 && res[i] == res[i-1]) {
					numDoubles++;
				}
			}

			return 'Deze test waren er ' + numDoubles + ' spelers die exact dezelfde score hadden als iemand anders.';

		case 'correctMoles':
			return 'Minstens één iemand heeft bij deze test de juiste trol ingevuld!';
			
		case 'shame':
			return 'Hmm. Jullie hebben de test best wel slecht gemaakt.'

	}
}

function startTestResultsPhase() {
	gamePhase = 'testResults';
	subGamePhase = 'testResults';

	document.getElementById('options').innerHTML = '';

	// calculate player (who is not the mole) with weakest score
	let lastRound = (curRound == numRounds - 1)
	let eliminatedPlayerName = getPlayerWithWorstTestResult();

	let msg = '<p>De afvaller is ... <strong class="eliminatedPlayer">' + eliminatedPlayerName + '</strong></p><p>' + displayRandomTestStatistic() + '</p>';
	if(lastRound) {
		msg = '<p>Dit was de laatste ronde!</p><p>De persoon die de test het beste heeft gemaakt is ... <strong class="winningPlayer">' + eliminatedPlayerName + '</strong>!</p><p>Maar als niemand de trol heeft ontmaskerd, wint diegene alsnog, dus klik snel door.</p>';
	}

	if(gokkerResults != null) {
		msg += '<p>Bovendien is er een <strong>Gokker</strong> ingezet! Deze speler heeft ... '

		if(gokkerResults == 0) {
			msg += 'GOED gegokt en krijgt twee jokers!</p>'
		} else {
			msg += 'FOUT gegokt en daardoor gaat er ' + gokkerResults + ' euro uit de pot!</p>'
		}

		gokkerResults = null;
	}

	document.getElementById('title').innerHTML = 'Test Resultaat!'
	document.getElementById('desc').innerHTML = '';

	document.getElementById('story').style.display = 'block';
	document.getElementById('story').innerHTML = 'De testresultaten worden nu bekenen ... ';

	calculatingTestResults = true;
	let messages = ['door ons team van trolexperts ...', 'moeilijke berekeningen worden gedaan ... ', 'ah, eindelijk een antwoord: ']
	let messageRevealCounter = 0;				
	let myInterval = setInterval(function() {
		if(messageRevealCounter >= messages.length) {
			clearInterval(myInterval);

			document.getElementById('desc').innerHTML = msg;
			calculatingTestResults = false;

			document.getElementById('continueButton').style.display = 'block';
			return;
		}

		document.getElementById('story').innerHTML += messages[messageRevealCounter];
		messageRevealCounter++;
	}, 2000);

	// @IMPROV/IDEA: once in a while, give some other information, such as how BAD the worst score was exactly or how GOOD the best one was.
	// @IMPROV: Style invalid inputs better using the :invalid pseudo-selector
	// @IMPROV: Pick _fewer_ questions per task on larger player counts. (Otherwise the test phase will just take too long.)
	// @IMPROV: Show a new hint on EVERY question to the mole? (Ensure he knows ALL upcoming tasks?)

	toggleInputInterface('none');
	
	//toggleGameInterface(); => no, only toggle the button to be visible
	document.getElementById('continueButton').style.display = 'block';

	clearTestResults();

	// NOTE: by setting curTask to -1, we trigger the next round, instead of merely trying to load the next task
	curTask = -1;
	document.getElementById('continueButton').innerHTML = 'Begin volgende ronde!';
	document.getElementById('continueButton').style.display = 'none';
}

function startGameOverPhase() {
	gamePhase = 'gameOver';
	subGamePhase = 'gameOver';

	toggleGameInterface();
	toggleInputInterface('none');

	document.getElementById('timer').style.display = 'none'
	document.getElementById('metadata').style.display = 'none'
	document.getElementById('story').style.display = 'none'

	// check win condition:
	// was the mole found? if not, the mole wins!
	// (@IMPROV: the winner from the test was already found on the last screen - might want to change that order)
	let moleWasFound = false;
	for(let i = 0; i < players.length; i++) {
		if(i == moleIndex) { continue; }

		if(players[i].votedCorrectMole) {
			moleWasFound = true;
		}
	}

	let msg = '<p>Gefelicteerd ... trol!</p><p>Niemand heeft op jou gestemd in de laatste test, dus jij hebt gewonnen!</p><p>Je mag jezelf nu op spectaculaire wijze onthullen!</p>';
	if(moleWasFound) {
		msg = '<p>Het spijt me, trol. Je bent gevonden.</p><p>Maar geen zorgen &mdash; je mag jezelf nu op spectaculaire wijze onthullen!</p>'
	}

	// Some nice statistics about the final test, because people like to see that
	// NOTE: I insert the mole here (because they aren't in that list by default), with a random score between 0 and number of questions
	msg = '<p>Hier zijn wat leuke statistieken over de laatste test:</p><ul>'

	testStatistics.resultsWithPlayerAttached.push({ playerIndex: moleIndex, score: Math.floor(Math.random()*questionList.length) })
	testStatistics.resultsWithPlayerAttached.sort((a,b) => { return a.score - b.score });

	for(let i = 0; i < testStatistics.resultsWithPlayerAttached.length; i++) {
		let r = testStatistics.resultsWithPlayerAttached[i];
		let player = players[r.playerIndex]
		let score = r.score

		msg += '<li><strong>' + player.name + '</strong> had ' + score + ' vragen goed</li>'
	}

	msg += '</ul>'

	document.getElementById('title').innerHTML = 'Het spel is voorbij!'
	document.getElementById('desc').innerHTML = msg
	document.getElementById('continueButton').innerHTML = 'Speel nog een potje!'

	allowBackButton();
}

function startGame() {
	readConfiguration()
	preparePlayers();
	prepareTaskList();
	prepareButtons();

	startSetupPhase();

	preventBackButton();
}

//
// Helper/tool functions
//
function preventBackButton() {
	// works on computer, not mobile
	window.onbeforeunload = function() { return "Als je de pagina verlaat, raak je het hele spel kwijt. Weet je het zeker?"; };

	// works on mobile (well, everywhere really, it just disallows back button to do anything)
	// URL: https://stackoverflow.com/questions/12381563/how-to-stop-browser-back-button-using-javascript
	// (second answer)
	pushStateHelper();
	window.addEventListener('popstate', pushStateHelper);
}

function pushStateHelper(ev = null) {
	history.pushState(null, document.title, location.href);
}

function allowBackButton() {
	// remove message to prevent people from leaving
	window.onbeforeunload = null;

	// and the mobile variant as well
	window.removeEventListener('popstate', pushStateHelper);
}

function readConfiguration() {
	// NOTE: gameConfig.expansions has a dictionary that knows which expansion is included (true) or not (false)
	gameConfig = JSON.parse(window.localStorage.getItem("wieIsDeTrolConfig"));

	// If no settings saved (we came here directly, not via main page), use default settings object
	if(gameConfig == null || gameConfig == undefined) {
		gameConfig = 
			{
				'playerCount': 3,
				'numRounds': 'Automatisch',
				'numQuestions': 3,
				'firstGame': false,
				'expansions': 
					{
						'addertjes': false,
						'eigenschappen': false,
						'bondjes': false,
						'specialeKrachten': false,
						'fysiekeOpdrachten': false,
					}
			}
	}

	if(!gameConfig.expansions.addertjes) {
		document.getElementById('addertjeContainer').style.display = 'none';
	}

	if(!gameConfig.expansions.specialeKrachten) {
		document.getElementById('setting-specialeKracht-label').style.display = 'none';
		document.getElementById('setting-specialeKracht').style.display = 'none';
	}

	numPlayers = parseInt(gameConfig.playerCount) || 3;
	numTasksPerRound = 3;
	numQuestionsPerTask = parseInt(gameConfig.numQuestions) || 3;
	firstGame = gameConfig.firstGame;

	if(gameConfig.numRounds == 'Automatisch') {
		numRounds = Math.max(numPlayers - 2, 2);					
	} else {
		numRounds = parseInt(gameConfig.numRounds) || 3;
	}

}

function toggleGameInterface(newVal = 'block') {
	document.getElementById('metadata').style.display = newVal;
	document.getElementById('timer').style.display = newVal;
	document.getElementById('story').style.display = newVal;
	document.getElementById('continueButton').style.display = newVal;
}

function toggleInputInterface(newVal = 'block') {
	// @ts-ignore
	document.getElementById('inputText').value = '';
	document.getElementById('input').style.display = newVal;
}

function toggleSettingsInterface(newVal = 'block') {
	// reset any old settings that might have been remembered
	// @ts-ignore
	document.getElementById('setting-jokerCount').value = 0;
	// @ts-ignore
	document.getElementById('setting-redCards').value = 0;
	// @ts-ignore
	document.getElementById('setting-freePass').checked = false;
	// @ts-ignore
	document.getElementById('setting-destroyFreePass').checked = false;
	// @ts-ignore
	document.getElementById('setting-specialeKracht').value = '';

	// change the whole container visibility
	document.getElementById('inputSettings').style.display = newVal;
}

function createErrorMessage(msg) {
	alert("Foutje! " + msg);
}

startGame();