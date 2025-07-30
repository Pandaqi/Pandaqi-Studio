import { shuffle } from "lib/pq-games";
import { ADDERTJES, Q, ROLVOORDELEN, Task, TASKS } from "./dict";
import { CONFIG } from "./config";

/*
There are five game phases:
 => Setup (executed once): all players must enter their name + get to know if they are the mole
 => Task: game shows a task to be completed
 => Test: each player, individually, takes the test. (Candidates have their score recorded, the answers of the mole are deemed the real answers)
 => Test Results: one "afvaller" is indicated (or in last round, the "winner" of the whole game)
 => Game end: the game is over, the mole is revealed
*/
let gamePhase : string = 'setup';
let subGamePhase : string = 'register';

let numPlayers : number;
let numTasksPerRound : number; 
let numQuestionsPerTask : number;
let numRounds : number;
let firstGame : boolean;

// some configuration/globally needed variables
let taskList : Task[]
let oldTaskList : Task[];
let questionList : Q[];

let task : Task;
let curRound : number = -1;
let curTask : number = -1;
let curQuestion : number = -1;
let curQuestionHintIndex : number = -1;

let players : any[] = [];
let moleIndex : number = -1;
let curTestTakerIndex : number = -1;
let playersThatTookTest : number = 0;

let calculatingTestResults : boolean = false;
let testStatistics = 
{
	allResults: [],
	resultsWithPlayerAttached: [],
	numberCorrectMoleVoters: 0
};

let previousTaskWasForbidden : boolean = false;

let timerInterval : number = null;
let timerValue : number = 0;

let gokkerResults = null;

const pickRandomTaskOfType = (roundNum:number, type:string) =>
{
	for(let i = 0; i < TASKS.length; i++) 
	{
		const t = TASKS[i]
		const p = t.params

		// don't pick task if we have firstGame enabled, and it's not fit for a first game
		const notSuitable = (firstGame && !p.firstGame) || (p.forbiddenAtStart && roundNum == 0) || (p.forbiddenAtEnd && roundNum == (numRounds - 1));
		if(notSuitable) { continue; }

		// don't pick two forbidden tasks after each other
		const isSecondConsecutiveForbidden = t.category.indexOf('Verboden') != -1 && previousTaskWasForbidden;
		if(isSecondConsecutiveForbidden) { continue; }

		// otherwise, if type matches, return it immediately and remove from original list!
		if(t.type == type) 
		{
			previousTaskWasForbidden = (t.category.indexOf('Verboden') != -1)
			return TASKS.splice(i, 1)[0];
		}
	}

	// if we find NO task of this type, just return the first task in the list as fail-safe
	return TASKS.splice(0, 1)[0];
}

const getRandomAddertje = () => 
{
	if(ADDERTJES.length <= 0) { return "Geen" }
	return ADDERTJES.splice(Math.floor(Math.random()*ADDERTJES.length), 1)[0];
}

const getRandomRolVoordeel = () => 
{
	if(ROLVOORDELEN.length <= 0) { return "Geen" }
	return ROLVOORDELEN.splice(Math.floor(Math.random() * ROLVOORDELEN.length), 1)[0];
}

//
// Preparation for each game (list of tasks, give actions to buttons, pick a mole, etc.)
//
const pickMole = () => { moleIndex = Math.floor(Math.random() * numPlayers); }

const prepareTaskList = () => 
{
	// remove any tasks from the list that are NOT suitable for the current settings
	for(let i = TASKS.length - 1; i >= 0; i--) 
	{
		const p = TASKS[i].params

		// min/max number of players
		const playerCountDoesntFit = (p.minPlayers != undefined && p.minPlayers > numPlayers) || (p.maxPlayers != undefined && p.maxPlayers < numPlayers);
		if(playerCountDoesntFit) 
		{
			TASKS.splice(i, 1);
			continue;
		}

		const requiredExpansionMissing = (p.eigenschappen == true && !CONFIG._settings.expansions.eigenschappen.value) || (p.specialeKrachten == true && !CONFIG._settings.expansions.specialeKrachten) || (p.bondjes == true && !CONFIG._settings.expansions.bondjes.value)
		// expansions not included
		if(requiredExpansionMissing) 
		{
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
	const taskTypes = ['simple', 'money', 'help'];
	const leftoverTasks = [];
	if(CONFIG._settings.expansions.specialeKrachten.value) 
	{
		taskTypes.push('specialeKrachten')
		leftoverTasks.push('specialeKrachten')
	}

	if(CONFIG._settings.expansions.eigenschappen.value) 
	{
		taskTypes.push('eigenschappen')
		leftoverTasks.push('eigenschappen')
	}

	if(CONFIG._settings.expansions.bondjes.value) 
	{
		taskTypes.push('bondjes')
		leftoverTasks.push('bondjes')
	}

	// while we don't have enough leftover tasks yet, keep adding random ones
	while(leftoverTasks.length < numRounds) 
	{
		leftoverTasks.push( taskTypes[Math.floor(Math.random() * taskTypes.length)] )
	}

	shuffle(leftoverTasks)

	// @IMPROV: This assumes 3 tasks per round => make variable somehow?
	// finally, create the actual rounds: one MONEY, one HELP, one LEFTOVER (shuffle afterwards)
	for(let i = 0; i < numRounds; i++) 
	{
		const tempTaskList = [];

		tempTaskList.push(pickRandomTaskOfType(i, 'money'));
		tempTaskList.push(pickRandomTaskOfType(i, 'help'));
		tempTaskList.push(pickRandomTaskOfType(i, leftoverTasks.splice(0, 1)[0]));

		// make tasks for this round appear in a random order in final game
		shuffle(tempTaskList);
		taskList = taskList.concat(tempTaskList);
	}
}

const prepareButtons = () => 
{
	document.getElementById('inputButton').addEventListener('click', inputButtonPressed);
	document.getElementById('continueButton').addEventListener('click', continueButtonPressed);
	document.getElementById("timerStartButton").addEventListener("click", startTimer);
	document.getElementById("timerStopButton").addEventListener("click", stopTimer);
}

//
// What to do when pressing certain buttons
//
const inputButtonPressed = () => 
{
	const disableInput = gamePhase != 'setup' && gamePhase != 'test';
	if(disableInput) { return; }

	// @ts-ignore
	const val = document.getElementById('inputText').value;

	// during setup, the input button registers players
	if(gamePhase == 'setup') 
	{
		if(subGamePhase == 'register') 
		{
			// basic error checking
			const badNameLength = val.length <= 0 || val.length >= 20;
			if(badNameLength) 
			{
				createErrorMessage(`Je naam is te lang of te kort!`)
				return;
			}

			for(let i = 0; i < players.length; i++) 
			{
				const nameAlreadyExists = players[i].name.toLowerCase() == val.toLowerCase();
				if(nameAlreadyExists) 
				{
					createErrorMessage(`Deze naam bestaat al!`);
					return;
				}
			}

			const playerIsMole = (players.length == moleIndex);
			const playerObj = { name: val, mole: playerIsMole };
			const resultText = playerIsMole ? `Jij bent DE TROL!` : `Jij bent een kandidaat!`;

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

			const allPlayersRegistered = players.length >= numPlayers;
			if(allPlayersRegistered) { startGamePhase(); }
		}
		return;
	} 
	
	// during the test, the input button starts a new test for the given player
	if(gamePhase == 'test') 
	{
		if(subGamePhase == 'inbetween') 
		{

			// find index (in players list) of this player
			curTestTakerIndex = players.find((x) => x.name.toLowerCase() == val.toLowerCase());
			const nonExistingPlayer = (curTestTakerIndex < 0 || curTestTakerIndex >= players.length);
			if(nonExistingPlayer) 
			{
				createErrorMessage("Deze speler bestaat niet!");
				return;
			}

			const p = players[curTestTakerIndex]
			if(p.takenTest) 
			{
				createErrorMessage("Deze speler heeft de test al gemaakt!");
				return;
			}

			// save the given settings
			p.testSettings = 
			{
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

			const lastRound = (curRound == numRounds - 1)
			const giveFreeJoker = p.testSettings.specialeKracht == 'Helderziende' && lastRound;
			if(giveFreeJoker) { p.jokerCount++; }

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

const answerButtonPressed = (answer) => 
{
	players[curTestTakerIndex].testAnswers.push(parseInt(answer));

	curQuestion++;
	const answeredAllQuestions = curQuestion >= questionList.length;
	if(answeredAllQuestions)
	{
		finishTestCycle();
		return;
	}

	displayNextQuestion();
}

const continueButtonPressed = () => 
{
	// forbid input when it's busy
	const isBusy = calculatingTestResults;
	if(isBusy) { return; }

	const timerRunning = timerInterval != null;
	if(timerRunning) 
	{
		clearInterval(timerInterval);
		timerInterval = null;
	}

	const isGameOver = gamePhase == 'gameOver';
	if(isGameOver) 
	{
		location.reload();
		return;
	}

	const isGameStart = curTask < 0;
	if(isGameStart) 
	{
		startGamePhase();
		return;
	}

	curTask++;

	const allTasksDoneForRound = curTask >= numTasksPerRound;
	if(allTasksDoneForRound) {
		startTestPhase();
	} else {
		displayNextTask();
	}
}

//
// Displaying tasks & questions
//
const displayNextTask = () => 
{
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

	if(firstGame) 
	{
		const reminderButton = document.createElement('button');
		reminderButton.innerHTML = '?';
		reminderButton.classList.add('hintButton');
		reminderButton.setAttribute('data-hint', 'hidden');
		reminderButton.addEventListener('click', (ev) => { toggleRuleReminder(reminderButton) });
		document.getElementById('title').appendChild(reminderButton);
	}

	document.getElementById('story').innerHTML = task.story;
	document.getElementById('desc').innerHTML = description;

	document.getElementById('category').innerHTML = task.category.join(", ");
	document.getElementById('money').innerHTML = task.money.toString();
	document.getElementById('addertje').innerHTML = getRandomAddertje();
	document.getElementById('rolvoordeel').innerHTML = getRandomRolVoordeel();

	// only display timer if needed; and if so, set to the right value
	const shouldDisplayTimer = task.params.timePerPlayer != undefined || task.params.totalTime != undefined;
	if(shouldDisplayTimer) 
	{
		document.getElementById('timer').style.display = 'block';

		// two possible parameters: time per player (for individual tasks) or total time (when you do it as a group, regardless of size)
		timerValue = task.params.timePerPlayer ? task.params.timePerPlayer*numPlayers : task.params.totalTime;

		document.getElementById('timerValue').setAttribute('data-originalTimerValue', timerValue.toString());
		document.getElementById('timerValue').innerHTML = convertSecondsToString(timerValue);
	} else {
		document.getElementById('timer').style.display = 'none';
	}
}

const startTimer = () => 
{
	document.getElementById('timerValue').style.color = 'green';

	// if it's zero (or negative), reset to original timer value
	const needsReset = timerValue <= 0;
	if(needsReset) 
	{
		timerValue = parseInt( document.getElementById('timerValue').getAttribute('data-originalTimerValue') );
	}

	timerInterval = setInterval(() => 
	{
		timerValue -= 1;
		document.getElementById('timerValue').innerHTML = convertSecondsToString(timerValue);

		const timerIsDone = timerValue <= 0;
		if(timerIsDone) 
		{
			stopTimer();
			document.getElementById('timerValue').style.color = 'red';
			// @IMPROV: Raise alarm, animate, whatever!?
		}
	}, 1000);
}

const stopTimer = () => 
{
	clearInterval(timerInterval);
	timerInterval = null;
	document.getElementById('timerValue').style.color = 'white';
}

const convertSecondsToString = (s:number) => {
	let minutes : number|string = Math.floor(s / 60);
	if(minutes < 10) { minutes = "0" + minutes; }

	let seconds : number|string = Math.floor(s % 60);
	if(seconds < 10) { seconds = "0" + seconds; }

	return `${minutes}:${seconds}`;
}

const toggleRuleReminder = (btn:HTMLButtonElement) => 
{
	const reminderText = '<p>Elke opdracht volgt deze structuur:</p><ol><li>Pak startinzet uit bank + iedere speler mag eigen geld inzetten</li><li>Meeste geld ingezet? Je mag nieuwe PM nomineren</li><li>Leider kiest welke speler begint.</li><li>Tijdens je beurt, trek je één kaart, en speelt zoveel kaarten (open) als je wilt.</li><li>Speel één ronde (met de klok mee), check dan resultaat</li></ol>'

	if(btn.getAttribute('data-hint') == 'visible') {
		btn.setAttribute('data-hint', 'hidden')
		document.getElementById('ruleReminder').style.display = 'none';
	} else {
		btn.setAttribute('data-hint', 'visible');
		document.getElementById('ruleReminder').style.display = 'block';
		document.getElementById('ruleReminder').innerHTML = reminderText
	}
}

const toggleTaskReminder = (btn:HTMLButtonElement, taskName:string) => 
{
	if(btn.getAttribute('hint') == 'visible') {
		btn.setAttribute('hint', 'hidden');
		document.getElementById('story').style.display = 'none';
	} else {
		btn.setAttribute('hint', 'visible');
		const correspondingTask = oldTaskList.find((x) => x.name == taskName);
		document.getElementById('story').style.display = 'block';
		document.getElementById('story').innerHTML = correspondingTask.desc;
	}
}

const getRandomMoneyValue = () =>
{
	const moneyValues = [10, 20, 50, 100];
	const randNumBriefjes = Math.floor(Math.random() * 3) + 3;

	let total = 0;
	for(let m = 0; m < randNumBriefjes; m++) {
		total += moneyValues[Math.floor(Math.random() * moneyValues.length)];
	}

	return total;
}

const displayRandomOffer = () => {
	// @IMPROV: Think of more (varied/interesting/challenging) offers
	// 		  (Maybe also some things that don't require taking a lot of money out of the shared money jar)

	const offerTypes = ['moneyToJokers', 'moneyToFreePass', 'moneyToCards', 'moneyToMisc'];
	const randType = offerTypes[Math.floor(Math.random() * offerTypes.length)]

	let msg = '<strong>Aanbieding! </strong>';
	let reward:number|string;
	let geldBedrag:number;

	switch(randType) 
	{
		case 'moneyToJokers':
			geldBedrag = getRandomMoneyValue();
			reward = Math.floor(Math.random() * 2) + 2
			msg += `Haal <strong>${geldBedrag} euro</strong> uit de pot in ruil voor <strong>${reward} jokers</strong>`;
			break;

		case 'moneyToFreePass':
			geldBedrag = getRandomMoneyValue();
			reward = Math.random() <= 0.5 ? "vrijstelling" : "zwarte vrijstelling";
			msg += `Haal <strong>${geldBedrag} euro</strong> uit de pot in ruil voor een <strong>${reward}</strong>`;
			break;

		case 'moneyToCards':
			geldBedrag = getRandomMoneyValue();
			reward = Math.floor(Math.random() * 5) + 5;
			msg += `Haal <strong>${geldBedrag} euro</strong> uit de pot in ruil voor <strong>${reward} kaarten</strong>`
			break;

		case 'moneyToMisc':
			const possibleRewards = ['persoonlijke pot'];
			if(CONFIG._settings.expansions.specialeKrachten.value) { possibleRewards.push('speciale krachten') }
			if(CONFIG._settings.expansions.eigenschappen.value) { possibleRewards.push('eigenschappen'); }

			geldBedrag = getRandomMoneyValue();
			const rewardType = possibleRewards[Math.floor(Math.random() * possibleRewards.length)];
			reward = Math.floor(Math.random() * 3) + 1;

			msg += `Haal <strong>${geldBedrag} euro</strong> uit de pot`;

			if(rewardType == 'persoonlijke pot') {
				msg += `, verdubbel dit, en voeg dit bedrag toe aan je persoonlijke pot`
			} else if(rewardType == 'speciale krachten') {
				msg += ` in ruil voor ${reward} speciale kracht(en) naar keuze (die niet in het bezit van iemand anders zijn)`
			} else if(rewardType == 'eigenschappen') {
				msg += ` om ${reward} negatieve eigenschappen weg te doen of positieve eigenschappen aan te trekken`;
			}

			break;
	}

	document.getElementById('story').style.display = 'block';
	document.getElementById('story').innerHTML = msg;
}

const displayNextQuestion = () => 
{
	document.getElementById('title').scrollIntoView({ behavior: "smooth", block: "start" });

	// document.getElementById('story').style.display = 'none';
	document.getElementById('options').innerHTML = '';

	const q = questionList[curQuestion];
	
	const connectedTask = q.connectedTask;
	const question = q.question;
	const options = q.answers.slice(); // copy of array, instead of reference => why? because mole can edit option list

	// display button to display reminder/hint about what an exercise was about
	let hintButton = null;
	const hasConnectedInformation = connectedTask != "";
	if(hasConnectedInformation) 
	{
		hintButton = document.createElement('button');
		hintButton.innerHTML = '?';
		hintButton.classList.add('hintButton');

		hintButton.addEventListener('click', (ev) => {
			toggleTaskReminder(hintButton, connectedTask);
		});

		hintButton.setAttribute('hint', 'hidden');
	}

	const title = (connectedTask == null) ? "De grote vraag ..." : `Vraag over <em>${connectedTask}</em>`;
	const curPlayerIsMole = (curTestTakerIndex == moleIndex);
	const lastRound = (curRound == numRounds - 1)
	const lastQuestion = (curQuestion == questionList.length - 1);

	document.getElementById('story').style.display = 'none';

	const shouldGiveCandidateHint = curQuestion == curQuestionHintIndex;
	if(!lastRound) 
	{
		// the mole gets hints every question (+ a self destroy option on the last question)
		// candidates only get a hint at a predefined index
		if(curPlayerIsMole) {
			displayMoleHint();
			if(lastQuestion) { addMoleSelfDestroyOption(options); }
		} else {
			if(shouldGiveCandidateHint) 
			{
				displayMoleHint(false);
			}
		}

		// SPECIALE KRACHT: Helderziende
		const p = players[curTestTakerIndex]
		if(p.testSettings.specialeKracht == 'Helderziende' && curQuestion < 3) 
		{
			displayMoleHint(false, 'Task', curQuestion);
		}

		// SPECIALE KRACHT: Afluisteraar
		if(p.testSettings.specialeKracht == 'Afluisteraar') 
		{
			displayMoleHint(false, 'KnownAnswers', curQuestion);
		}

		// SPECIALE KRACHT: Handelaar
		if(p.testSettings.specialeKracht == 'Handelaar')
		{
			if(shouldGiveCandidateHint) {
				displayRandomOffer();
			}
		}
	}

	document.getElementById('title').innerHTML = title;
	document.getElementById('desc').innerHTML = '<p>' + question + '</p>';

	if(hintButton != null) 
	{
		document.getElementById('title').appendChild(hintButton);
	}

	for(let j = 0; j < options.length; j++) 
	{
		const cont = document.createElement('div');
		const number = document.createElement('button');
		number.innerHTML = (j+1).toString();
		cont.appendChild(number);
		number.addEventListener('click', (ev) => { answerButtonPressed(j); });

		const text = document.createElement('p');
		text.innerHTML = options[j];
		cont.appendChild(text);

		document.getElementById('options').appendChild(cont);
	}
}

const addMoleSelfDestroyOption = (list:string[]) => { list.push("Maak mij de afvaller"); }

const displayMoleHint = (mole = true, fixedHint = null, fixedIndex = -1) => 
{
	document.getElementById('story').style.display = 'block';

	// the mole will also get information about tasks, who voted on them, etc.
	// candidates will only get "easy" information, such as that the leader will become important next round
	let hintTypes = ['Categories', 'Task', 'Money', 'Treasurer', 'Leader', 'TaskType', 'Snitch'];
	if(!mole) { hintTypes = ['Categories', 'Money', 'Treasurer', 'Leader']; }

	const randomHintType = fixedHint != null ? fixedHint : hintTypes[Math.floor(Math.random() * hintTypes.length)];
	let hintText = '<strong>Hint! </strong>';

	const randTaskIndex = fixedIndex >= 0 ? fixedIndex : Math.floor(Math.random() * numTasksPerRound);

	// NOTE: At this time, the previous tasks have alread been removed from the system
	// So going from 0-numTasksPerRound already looks at the upcoming tasks
	// (If multiple stuff, just seperate with a mid dot => &middot; => looks better than anything else)
	switch(randomHintType) 
	{
		case 'Categories':
			hintText += `Opdracht ${(randTaskIndex+1)} (van de volgende ronde) heeft deze categorieën: ${taskList[randTaskIndex].category.join(", ")}`;
			break;

		case 'Task':
			hintText += `Dit is opdracht ${(randTaskIndex+1)} van de volgende ronde: ${taskList[randTaskIndex].desc}`;
			break;

		case 'TaskType':
			let summary = "zijn GEEN hulpmiddelen (jokers en dergelijke) te verdienen!";
			if(taskList[randTaskIndex].type == 'help' || taskList[randTaskIndex].type == 'specialeKrachten' || taskList[randTaskIndex].type == 'eigenschappen') {
				summary = "zijn hulpmiddelen (jokers en dergelijke) te verdienen!";
			} 
			hintText += `In opdracht ${(randTaskIndex+1)} (van de volgende ronde) ${summary}`;
			break;

		case 'Money':
			hintText += `Opdracht ${(randTaskIndex+1)} (van de volgende ronde) heeft deze startinzet: ${taskList[randTaskIndex].money}`;
			break;

		case 'Treasurer':
			let numTreasurerTasks = 0;
			for(let i = 0; i < numTasksPerRound; i++) 
			{
				if(!taskList[i].treasurer) { continue; }
				numTreasurerTasks++;
			}

			hintText += (numTreasurerTasks <= 0) ? "In de komende opdrachten wordt de penningmeester NIET belangrijk." : `'De komende ronde kent ${numTreasurerTasks} opdracht(en) waarin de penningmeester belangrijk is.`
			break;

		case 'Leader':
			let numLeaderTasks = 0;
			for(let i = 0; i < numTasksPerRound; i++) 
			{
				if(!taskList[i].leader) { continue; }
				numLeaderTasks++;
			}
			hintText += (numLeaderTasks <= 0) ? `In de komende opdrachten wordt de leider NIET belangrijk.` : `De komende ronde kent ${numLeaderTasks} opdracht(en) waarin de leider belangrijk is`;
			break;

		case 'Snitch':
			const correctMoleVotersHistory = [];
			const correctMoleVotersNow = [];

			const testLength = questionList.length
			for(let i = 0; i < players.length; i++) 
			{
				const isMole = i == moleIndex;
				if(isMole) { continue; }

				// check both the current and previous test (because we don't know at what point the mole will be taking the test)
				const p = players[i]
				if(p.votedCorrectMole) { correctMoleVotersHistory.push( p.name ); }
				if(p.takenTest && p.testAnswers[testLength - 1] == moleIndex) { correctMoleVotersNow.push( p.name ); }
			}

			if(correctMoleVotersNow.length <= 0 && correctMoleVotersHistory.length <= 0) {
				hintText += `Gefeliciteerd! Niemand heeft (tot nog toe) op jou gestemd bij deze en de vorige test!`;
			} else if(correctMoleVotersNow.length > 0) {
				const randomMoleVoter = correctMoleVotersNow[Math.floor(Math.random() * correctMoleVotersNow.length)]
				hintText += `Oh nee! De speler <em>${randomMoleVoter}</em> heeft jou als trol aangewezen bij deze test`;
			} else {
				const randomMoleVoter = correctMoleVotersHistory[Math.floor(Math.random() * correctMoleVotersHistory.length)]
				hintText += `Oh nee! De speler <em>${randomMoleVoter}</em> heeft jou als trol aangewezen bij de vorige test`;
			}
			break;

		case 'KnownAnswers':
			let splitText = [];
			// if we display the true answers by the mole, we can easily give away the secret, so make these random
			const randomMoleAnswer = moleIndex == 0 ? 1 : Math.floor(Math.random() * moleIndex);
			for(let i = 0; i < players.length; i++) 
			{
				if(!players[i].takenTest) { continue; }
				const answer = players[i].mole ? randomMoleAnswer : players[i].testAnswers[randTaskIndex]
				splitText.push(`${players[i].name}) ${(answer + 1)}`);
			}

			hintText += `Dit waren de antwoorden van andere spelers: ${splitText.join(' &middot; ')}`;
			break;
	}

	document.getElementById('story').innerHTML = hintText;
}

const addQuestionToList = (q:Q, taskName:string) => 
{
	// remember the original task, and push to total list
	q.connectedTask = taskName;
	questionList.push(q);
}

const createQuestionList = () => 
{
	questionList = [];

	// for each task ...
	for(let i = 0; i < numTasksPerRound; i++) 
	{
		const task = taskList[i];
		const questions = task.questions;

		// go through all questions connected to it ...
		// (or only add as many as the current settings allow => @IMPROV: Maybe shuffle this? Now it always adds the same on reduced settings?)
		const numQ = Math.min(numQuestionsPerTask, questions.length)
		for(let q = 0; q < numQ; q++) 
		{
			addQuestionToList(questions[q], task.name);
		}
	}

	// EXCEPTION: if it's the last round, add random questions from previous tasks
	const lastRound = (curRound == numRounds - 1);
	if(lastRound) 
	{
		for(let i = 0; i < oldTaskList.length; i++) 
		{
			const task = oldTaskList[i];
			const questions = task.questions;

			// add one question out of the total (for this particular task)
			addQuestionToList(questions[Math.floor(Math.random() * questions.length)], task.name);

			// sometimes, randomly, skip a task completely
			i += Math.floor(Math.random() * 2);
		}
	}

	shuffle(questionList);

	// finally, add the big question "Wie is de Trol?" => ALWAYS at the end!
	const bigQuestionAnswers = players.map((x) => x.name);
	const bigQuestion = new Q("Wie is de Trol?", bigQuestionAnswers);
	questionList.push(bigQuestion);
}

const removeCurrentRoundTasks = () => 
{
	for(let i = 0; i < numTasksPerRound; i++) 
	{
		oldTaskList.push( taskList.shift() );
	}
}

const getPlayerWithWorstTestResult = () => 
{
	// create object to keep track of test statistics
	testStatistics = 
	{
		allResults: [],
		resultsWithPlayerAttached: [],
		numberCorrectMoleVoters: 0,
	};

	// first, register the answers from the mole as the "correct" answers
	const correctAnswers = players[moleIndex].testAnswers;

	// if the mole chose to self-destruct, they will always get the worst score, no other computation necessary
	// (on the LAST question, the very LAST button was pressed)
	const selfDestruct = (correctAnswers[correctAnswers.length - 1] == players.length);
	if(selfDestruct) 
	{
		// If mole choses to self-destruct, just fill the test statistics with random values
		for(let i = 0; i < players.length - 1; i++) 
		{
			testStatistics.allResults.push(Math.floor(Math.random() * questionList.length));

			const obfuscateCorrectMoleVoters = Math.random() <= 1.0/(players.length - 1);
			if(obfuscateCorrectMoleVoters) 
			{
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
	for(let i = 0; i < players.length; i++) 
	{
		if(!players[i].testSettings.destroyFreePass) { continue; }
		destroyFreePass = true;
		break
	}

	// (What's this? In the last round, we want the BEST score, so we check in the reverse direction)
	const lastRound = (curRound == numRounds - 1)
	const checkingDir = lastRound ? -1 : 1;

	// then grade the test from all other players
	let maxPossibleTestScore = questionList.length
	let worstPlayer = null;
	let worstScore = checkingDir*Infinity;
	let worstTime = checkingDir*Infinity;
	for(let i = 0; i < players.length; i++) 
	{
		if(i == moleIndex) { continue; }

		// first grade all the questions independently
		let p = players[i];
		p.votedCorrectMole = false;
		let score = 0;
		for(let a = 0; a < p.testAnswers.length; a++) 
		{
			const isCorrectAnswer = p.testAnswers[a] == correctAnswers[a];
			if(!isCorrectAnswer) { continue; } 

			score++;

			const lastQuestion = (a == p.testAnswers.length - 1);
			if(lastQuestion) {
				// exception: red carded players cannot vote correct mole on very last round
				if(lastRound && p.testSettings.redCards > 0) {
					p.votedCorrectMole = false;
				} else {
					testStatistics.numberCorrectMoleVoters++;
					p.votedCorrectMole = true;
				}
			}
		}

		// now check for any jokers/vrijstellingen/stuff, but only if they are not destroyed
		if(!destroyFreePass) 
		{
			// free pass?
			if(p.testSettings.freePass) 
			{
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
			const equalScoreButWorseTime = checkingDir*p.timeTaken > checkingDir*worstTime;
			if(equalScoreButWorseTime) 
			{
				worstPlayer = p;
				worstTime = p.timeTaken;
			}
		}
	}

	// SPECIALE KRACHT: Gokker
	// sort all players by score (DESCENDING) => check if the Gokker is in the top 50%
	if(CONFIG._settings.expansions.specialeKrachten.value) 
	{
		testStatistics.resultsWithPlayerAttached.sort((a,b) => { return a.score - b.score });

		for(let i = 0; i < testStatistics.resultsWithPlayerAttached.length; i++) 
		{
			const playerIndex = testStatistics.resultsWithPlayerAttached[i].player;
			const isGokker = players[playerIndex].testSettings.specialeKracht == 'Gokker';
			if(!isGokker) { continue; }
		
			gokkerResults = (i < 0.5*testStatistics.resultsWithPlayerAttached.length) ? 0 : getRandomMoneyValue();
			break;
		}
	}

	// check if ALL players have a free pass => because in that case, nobody should exit
	const allPlayersHaveFreePass = (numPlayersWithFreePass >= players.length);
	if(allPlayersHaveFreePass) { return "NIEMAND! Iedereen gaat door naar de volgende ronde."; }

	return worstPlayer.name;
}

const startTestCycle = () =>
{
	gamePhase = 'test';
	subGamePhase = 'inbetween';

	toggleGameInterface('none');
	toggleSettingsInterface();

	document.getElementById('title').innerHTML = 'Test';

	const msg = playersThatTookTest > 0 ? `De test is ingevuld! Roep de volgende speler maar.` : `Het is tijd voor de test! Typ je naam, zorg dat niemand meekijkt, en vul de vragen zo goed mogelijk in.`;

	document.getElementById('desc').innerHTML = `<p>${msg}</p>`;

	document.getElementById('inputText').innerHTML = '';
	document.getElementById('inputButton').innerHTML = 'Begin test!';
	
	toggleInputInterface();
}

const finishTestCycle = () => 
{
	document.getElementById('options').innerHTML = '';

	const p = players[curTestTakerIndex]
	p.timeTaken = Date.now() - p.testStartTime // in milliseconds, should always be positive

	// SPECIALE KRACHT: Fotofinish
	// (we use a trick: just set time to 0, so we never lose on time!)
	if(p.testSettings.specialeKracht == 'Fotofinish') 
	{
		p.timeTaken = 0;
	}

	// if all players have taken the test, go to test results!
	if(playersThatTookTest >= players.length) 
	{
		startTestResultsPhase();
		return;
	}

	// otherwise, start a new cycle
	startTestCycle();
}

//
// Starting new phases
//
const startSetupPhase = () => 
{
	gamePhase = 'setup';
	subGamePhase = 'register';

	toggleGameInterface('none');
	toggleSettingsInterface('none');
	toggleInputInterface();

	document.getElementById('title').innerHTML = `Welkom!`;
	document.getElementById('desc').innerHTML = `<p>Zorg ervoor dat anderen niet kunnen meekijken.</p><p>Laat dan iedere speler één voor één naar de computer komen, hun naam intypen, en op de knop drukken. Je krijgt meteen te weten of jij de trol bent of niet.</p><p>(Vergeet niet daarna opnieuw op de knop te drukken.)</p>`;
}

const startGamePhase = () => 
{
	const noTasksLeft = taskList.length <= 0;
	if(noTasksLeft) 
	{
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

const startTestPhase = () => 
{
	gamePhase = 'test';
	subGamePhase = 'inbetween';

	createQuestionList();
	removeCurrentRoundTasks();

	startTestCycle();
}

const clearTestResults = () => 
{
	// reset all variables keeping track of current test progress 
	curQuestion = -1;
	playersThatTookTest = 0;
	for(let i = 0; i < players.length; i++) 
	{
		players[i].takenTest = false;
	}
}

const displayRandomTestStatistic = () =>
{
	const statistics = ['worstResult', 'bestResult', 'averageResult', 'doubleResults']

	if(testStatistics.numberCorrectMoleVoters > 0) {
		statistics.push('correctMoles');
	} else {
		statistics.push('shame')
	}

	const randStatistic = statistics[Math.floor(Math.random() * statistics.length)]
	const res = testStatistics.allResults

	switch(randStatistic) {
		case 'worstResult':
			return `De "afvaller" had slechts ${res.sort()[0]} vragen goed.`;

		case 'bestResult':
			return `De beste speler van deze ronde had ${res.sort()[res.length - 1]} vragen goed.`;

		case 'averageResult':
			const total = res.reduce((prev, cur) => { return prev + cur }, 0);
			const avg = Math.round((total/res.length) * 10)/10
			return `Het gemiddelde aantal goede antwoorden op deze test was ${avg}.`;

		case 'doubleResults':
			let numDoubles = 0;

			res.sort();

			for(let i = 0; i < res.length; i++) 
			{
				const equalToNextPlayer = i < (res.length - 1) && res[i] == res[i+1];
				if(equalToNextPlayer) 
				{
					numDoubles++;
				} 

				const equalToPreviousPlayer = i > 0 && res[i] == res[i-1];
				if(equalToPreviousPlayer) 
				{
					numDoubles++;
				}
			}

			return `Deze test waren er ${numDoubles} spelers die exact dezelfde score hadden als iemand anders.`;

		case 'correctMoles':
			return `Minstens één iemand heeft bij deze test de juiste trol ingevuld!`;
			
		case 'shame':
			return `Hmm. Jullie hebben de test best wel slecht gemaakt.`

	}
}

const startTestResultsPhase = () => 
{
	gamePhase = 'testResults';
	subGamePhase = 'testResults';

	document.getElementById('options').innerHTML = '';

	// calculate player (who is not the mole) with weakest score
	const lastRound = (curRound == numRounds - 1)
	const eliminatedPlayerName = getPlayerWithWorstTestResult();

	let msg = `<p>De afvaller is ... <strong class="eliminatedPlayer">${eliminatedPlayerName}</strong></p><p>${displayRandomTestStatistic()}</p>`;
	if(lastRound) 
	{
		msg = `<p>Dit was de laatste ronde!</p><p>De persoon die de test het beste heeft gemaakt is ... <strong class="winningPlayer">${eliminatedPlayerName}</strong>!</p><p>Maar als niemand de trol heeft ontmaskerd, wint diegene alsnog, dus klik snel door.</p>`;
	}

	if(gokkerResults != null) 
	{
		const extra = gokkerResults == 0 ? "GOED gegokt en krijgt twee jokers!" : `FOUT gegokt en daardoor gaat er ${gokkerResults} euro uit de pot!`;
		msg += `<p>Bovendien is er een <strong>Gokker</strong> ingezet! Deze speler heeft ... ${extra}</p>`
		gokkerResults = null;
	}

	document.getElementById('title').innerHTML = 'Test Resultaat!'
	document.getElementById('desc').innerHTML = '';

	document.getElementById('story').style.display = 'block';
	document.getElementById('story').innerHTML = 'De testresultaten worden nu bekenen ... ';

	calculatingTestResults = true;
	const messages = ['door ons team van trolexperts ...', 'moeilijke berekeningen worden gedaan ... ', 'ah, eindelijk een antwoord: ']
	let messageRevealCounter = 0;				
	const myInterval = setInterval(() => 
	{
		const doneRevealingMessages = messageRevealCounter >= messages.length;
		if(doneRevealingMessages) 
		{
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

const startGameOverPhase= () =>
{
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
	for(let i = 0; i < players.length; i++) 
	{
		if(i == moleIndex) { continue; }
		if(!players[i].votedCorrectMole) { continue; }
		moleWasFound = true;
		break;
	}

	let msg = `<p>Gefelicteerd ... trol!</p><p>Niemand heeft op jou gestemd in de laatste test, dus jij hebt gewonnen!</p><p>Je mag jezelf nu op spectaculaire wijze onthullen!</p>`;
	if(moleWasFound) 
	{
		msg = `<p>Het spijt me, trol. Je bent gevonden.</p><p>Maar geen zorgen &mdash; je mag jezelf nu op spectaculaire wijze onthullen!</p>`
	}

	// Some nice statistics about the final test, because people like to see that
	// NOTE: I insert the mole here (because they aren't in that list by default), with a random score between 0 and number of questions
	msg = `<p>Hier zijn wat leuke statistieken over de laatste test:</p><ul>`;

	testStatistics.resultsWithPlayerAttached.push({ playerIndex: moleIndex, score: Math.floor(Math.random()*questionList.length) })
	testStatistics.resultsWithPlayerAttached.sort((a,b) => { return a.score - b.score });

	for(let i = 0; i < testStatistics.resultsWithPlayerAttached.length; i++) 
	{
		const r = testStatistics.resultsWithPlayerAttached[i];
		const player = players[r.playerIndex]
		const score = r.score

		msg += `<li><strong>${player.name}</strong> had ${score} vragen goed</li>`
	}

	msg += '</ul>'

	document.getElementById('title').innerHTML = 'Het spel is voorbij!'
	document.getElementById('desc').innerHTML = msg
	document.getElementById('continueButton').innerHTML = 'Speel nog een potje!'

	allowBackButton();
}

const startGame = () => 
{
	readConfiguration()
	pickMole();
	prepareTaskList();
	prepareButtons();

	startSetupPhase();

	preventBackButton();
}

//
// Helper/tool functions
//
const preventBackButton = () => 
{
	// works on computer, not mobile
	window.onbeforeunload = function() { return "Als je de pagina verlaat, raak je het hele spel kwijt. Weet je het zeker?"; };

	// works on mobile (well, everywhere really, it just disallows back button to do anything)
	// URL: https://stackoverflow.com/questions/12381563/how-to-stop-browser-back-button-using-javascript
	// (second answer)
	pushStateHelper();
	window.addEventListener('popstate', pushStateHelper);
}

const pushStateHelper = (ev = null) => 
{
	history.pushState(null, document.title, location.href);
}

const allowBackButton = () => 
{
	// remove message to prevent people from leaving
	window.onbeforeunload = null;

	// and the mobile variant as well
	window.removeEventListener('popstate', pushStateHelper);
}

const readConfiguration = () =>
{
	if(!CONFIG._settings.expansions.addertjes.value) 
	{
		document.getElementById('addertjeContainer').style.display = 'none';
	}

	if(!CONFIG._settings.expansions.specialeKrachten.value) 
	{
		document.getElementById('setting-specialeKracht-label').style.display = 'none';
		document.getElementById('setting-specialeKracht').style.display = 'none';
	}

	numPlayers = CONFIG._settings.playerCount.value ?? 3;
	numTasksPerRound = 3;
	numQuestionsPerTask = Math.ceil((CONFIG._settings.numQuestions.value-1)/numTasksPerRound) ?? 3;
	firstGame = CONFIG._settings.firstGame.value ?? false;

	const numRoundsSetting = CONFIG._settings.numRounds.value;
	numRounds = (numRoundsSetting == "automatisch") ? Math.max(numPlayers - 2, 2) : parseInt(numRoundsSetting) ?? 3;
}

const toggleGameInterface = (newVal = 'block') =>
{
	document.getElementById('metadata').style.display = newVal;
	document.getElementById('timer').style.display = newVal;
	document.getElementById('story').style.display = newVal;
	document.getElementById('continueButton').style.display = newVal;
}

const toggleInputInterface = (newVal = 'block') =>
{
	// @ts-ignore
	document.getElementById('inputText').value = '';
	document.getElementById('input').style.display = newVal;
}

const toggleSettingsInterface = (newVal = 'block') =>
{
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

const createErrorMessage = (msg:string) => { alert("Foutje! " + msg); }

// This actually initializes the default settings interface, and `startGame` is passed in as the callback for when that button is pressed
loadSettings(CONFIG, startGame);
