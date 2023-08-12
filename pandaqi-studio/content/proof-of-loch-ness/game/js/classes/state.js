class State {

	constructor() {
		// what action/state/screen we're currently using
		this.curGameState = 'choose-action';

		// quick references to ALL elements we need from the HTML/interface
		this.actions = document.getElementById('move')
		this.game = document.getElementById('game')
		
		this.phaserGameCont = document.getElementById('phaserGameContainer');

		this.monster = document.getElementById('monster');
		this.monsterText = document.getElementById('monster-text');
		this.monsterIcon = document.getElementById('monster-icon');
		this.monsterHeader = document.getElementById('monster-header');

		this.statsContainer = document.getElementById('stats');

		this.head = document.getElementById('game-header')
		this.instruc = document.getElementById('game-instruction')

		this.moveHead = document.getElementById('move-header');

		this.feedbackNode = document.getElementById('move-feedback');

		// quick-link to scenario
		this.scn = SCENARIOS[cfg.scenario];

		// crucial variables for game state (used to be global)
		this.clock = 0;
		this.moveCounter = -1;
		this.curPlayer = -1;

		this.money = 0;
		this.stats = [0,0,0,0];

		// variables for checking of some objective was reached (if it can't be checked in a single turn)
		this.matchedPhotographsInSequence = 0;
	}

	initialize() {
		this.initializeStats();
		this.initializeWeather();
		this.initializeMoney();
	}

	getState() {
		return this.curGameState;
	}

	getCurPlayer() {
		return PLAYERS[this.curPlayer];
	}
	
	gotoMonsterScreen() {
		this.actions.style.display = 'none';
		this.statsContainer.style.display = 'none';
		this.game.style.display = 'none';

		this.monster.style.display = 'block';
		this.monsterIcon.style.animationPlayState = "running";
	}

	gotoGameInterface(newState) {
		this.curGameState = newState

		this.actions.style.display = 'none';
		this.statsContainer.style.display = 'none';
		this.monster.style.display = 'none';

		this.game.style.display = 'block';
		if(newState == "action-pass") {
			this.phaserGameCont.style.display = 'none';
		} else {
			this.phaserGameCont.style.display = 'block';
		}

		var ac =  ACTIONS[this.curGameState];

		var actionName = ac.label;
		if(this.scn.money.enabled) { actionName += " ($" + ac.cost + ")"; }

		this.head.innerHTML = actionName;

		var actionInstructions = ac.instruction;
		this.instruc.innerHTML = actionInstructions;

		var gm = GAME.scene.keys.mainGame;
		gm.openAction();

		// if we requested the results, just make a picture and immediately go back again
		if(newState == 'action-gameresults') {
			var callbackFunc = function() {
				document.getElementById('move-instruction').innerHTML = 'This is what the game looked like: ';

				STATE.showMonsterProperties();
				STATE.clearActionList();

				document.getElementById('move-picture').classList.add("gameover-move-picture");
				document.getElementById('weather').style.display = 'none';

	            STATE.toggleMoveResults(true);
	            STATE.gotoNextPlayer();
			}
			gm.convertCanvasToImage(callbackFunc);
		}
	}

	gotoActionList() {
		this.curGameState = 'choose-action'

		var roleIndex = PLAYERS[this.curPlayer].getRoleIndex();

		this.moveHead.innerHTML = '<span class="role-icon role-' + roleIndex + '"></span><span>Player ' + (this.curPlayer + 1) + '</span>';
		if(cfg.gameOver) {
			this.moveHead.innerHTML = 'Game Over';
		}

		this.actions.style.display = 'block';
		if(this.scn.showStats) { this.statsContainer.style.display = 'flex'; }
		
		this.game.style.display = 'none';
		this.monster.style.display = 'none';

		this.monsterIcon.style.animationPlayState = "paused";
	}

	initializeMonsterScreen() {
		var monsterProps = MONSTERS[cfg.monster];

		this.monsterHeader.innerHTML = 'Monster Move';
		this.monsterText.innerHTML = '<strong>' + monsterProps.name + '</strong> is moving ...';

		var xPos = -(monsterProps.frame % 8)*64;
		var yPos = -Math.floor(monsterProps.frame / 8)*64;

		this.monsterIcon.style.backgroundPosition = xPos + "px " + yPos + "px";
	}

	/*
	 * WEATHER
	 */
	initializeWeather() {
		var numTurns = -1; 

		if(this.scn.loseCondition.type == "time") {
			numTurns = this.scn.loseCondition.limit / this.scn.clockIncreasePerMove;
		} else if(this.scn.loseCondition.type == "money") {
			numTurns = this.scn.money.budget;
		}

		// get all possible weather types for this terrain + their weights
		var possibleWeathers = TERRAINS[MAP.generalTerrain].weather;
		var sumOfWeathers = possibleWeathers.reduce(function(sum, weather) { return sum + weather.weight; }, 0);

		// pre-fill the whole array with the weather type for each turn
		this.weather = [];
		for(var i = 0; i < numTurns; i++) {
			var index = this.getRandomWeighted(possibleWeathers, sumOfWeathers);
			this.weather.push(possibleWeathers[index].type);
		}
	}

	getCurrentWeather() {
		return this.weather[this.moveCounter];
	}

	getRandomWeighted(arr, total) {
		const rand = Math.random();

		var sum = 0;
		for(var i = 0; i < arr.length; i++) {
			sum += (arr[i].weight / total);

			if(sum >= rand) {
				return i;
			}
		}

		return null;
	}

	updateWeather() {
		if(!SCENARIOS[cfg.scenario].rulesIncluded.weather) { 
			document.getElementById('weather').style.display = 'none';
			return; 
		}

		var newWeatherType = this.weather[this.moveCounter];
		document.getElementById('weather').innerHTML = '<span class="weather-icon icon-weather-' + newWeatherType + '"></span>';
	}

	getWeatherFuture(index) {
		var actualIndex = (this.moveCounter + 1 + index);
		if(actualIndex >= this.weather.length) { return null; }

		return this.weather[actualIndex];
	}

	/* 
	 * MONEY
	 */
	initializeMoney() {
		this.money = this.scn.money.budget;
	}

	payForCurrentAction() {
		this.payMoney(ACTIONS[this.curGameState].cost);
	}

	payMoney(pay) {
		this.money -= pay;
	}

	receiveMoney(val) {
		this.money += val;
	}

	updateMoney() {
		if(!this.scn.money.enabled) { return; }

		var clampedMoney = Math.max(this.money, 0);

		document.getElementById('clock-day').classList.add("money");
		document.getElementById('clock-day').innerHTML = '$' + clampedMoney;
	}

	/*
	 *
	 */
	initializeStats() {
		stats[0] = 0; // number of CORRECT (collected) tracks
		stats[1] = this.scn.loseCondition.maxWrongItems || 0; // number of WRONG (collected tracks)
		stats[2] = this.scn.loseCondition.maxGuesses || 0; // number of GUESSES (where the hideout is)
		stats[3] = this.scn.winCondition.numFilm || 2; // amount of FILM (one is needed for each photograph)

		this.updateStats();
	}

	updateStats() {
		for(var i = 0; i < 4; i++) {
			document.getElementById('stats-' + i).innerHTML = this.stats[i];
		}
	}

	addToStat(index, val) {
		if(index < 0 || index >= 4) { return; }
		this.stats[index] += val;
	}

	/*
	 * CLOCK + TIMING FUNCTIONS
	 */
	updateClock() {
		this.clock += cfg.clockIncreasePerMove;

		var day = (Math.floor(this.clock / 24) + 1);
		document.getElementById('clock-day').innerHTML = day;

		var time = (this.clock % 24);
		var deg = (time / 24) * 360;
		document.getElementById('clock-hand').style.transform = 'rotate('+deg+'deg)'; 
	}

	isNight() {
		return (this.clock % 24) >= 20;
	}

	isDusk() {
		return (this.clock % 24) >= 16 && (this.clock % 24) < 20;
	}

	isDawn() {
		return (this.clock % 24) >= 4 && (this.clock % 24) < 8;
	}

	checkGameOver() {
		// if we're already in game over state, no sense in checking again!
		// NOTE: don't use _this_.gameOver, as that references the function on this object
		if(cfg.gameOver) { return; }

		var curScenario = SCENARIOS[cfg.scenario];

		//
		// WIN
		//
		var w = curScenario.winCondition;
		var hasWon = false;

		if(MONSTER.matchedPhotograph) {
			this.matchedPhotographsInSequence++;
		} else {
			this.matchedPhotographsInSequence = 0;
		}

		// check against the specific win condition for this scenario
		switch(w.type) {
			case 'photograph':
				hasWon = MONSTER.matchedPhotograph
				break;

			case 'video':
				hasWon = (this.matchedPhotographsInSequence >= w.limit);
				break;

			case 'hideout':
				hasWon = MONSTER.foundHideout;
				break;

			case 'collectibles':
				hasWon = (this.stats[0] >= w.limit);
				break;

		}

		// reset anything that keeps track of these win conditions
		MONSTER.matchedPhotograph = false;

		if(hasWon) {
			this.gameOver(true);
			return;
		}


		//
		// LOSE
		//
		var l = curScenario.loseCondition;
		var hasLost = false;

		// check against the specific loss condition for this scenario
		switch(l.type) {
			case 'time':
				hasLost = (this.clock >= l.limit)
				break;

			case 'money':
				hasLost = (this.money <= 0);
				break;
		}

		// collecting items, but wasted all our space?
		if(w.type == 'collectibles') {
			if(stats[1] <= 0) { hasLost = true; }
		}

		// or general loss conditions
		// picking hideouts, but wasted all your chances?
		if(w.type == 'hideout') {
			if(stats[2] <= 0) { hasLost = true; }
		}

		if(hasLost) {
			this.gameOver(false);
			return;
		}
	}

	debug() {
		// if(!cfg.debugging) { this.gameOver(true); }

		cfg.debugging = true;

		var gm = GAME.scene.keys.mainGame
		gm.showElementsForPicture();
		gm.showCompleteMonsterPath();
		gm.scene.resume();

	}

	gameOver(win) {
		var msg = "Congratulations! You won!"
		if(!win) { msg = "Unfortunately, you lost ... "; }

		document.getElementById("popup").style.display = 'block';
		document.getElementById("popup-text").innerHTML = msg;

		this.replaceActionsWithGameResults();

		cfg.debugging = true;
		cfg.gameOver = true;

		var gm = GAME.scene.keys.mainGame
		gm.showElementsForPicture();
		gm.showCompleteMonsterPath();

		gm.scene.resume();
		
	}

	replaceActionsWithGameResults() {
		this.clearActionList();
		createActionButton('action-gameresults');

		var btn = createActionButton('action-reload', false);
		btn.addEventListener('click', function(ev) {
			location.reload();
			return false;
		});
	}

	clearActionList() {
		document.getElementById('action-buttonList').innerHTML = '';
	}

	showMonsterProperties() {
		var str = '<p>Monster properties:</p><ul>';
		var props = MONSTERS[cfg.monster].pickableProperties;
		for(var i = 0; i < props.length; i++) {
			var prop = props[i].key
			var dataType = props[i].type;
			var val = MONSTER[prop]

			// some data types should be converted to a more friendly (and correct) format
			if(dataType == 'player') { val = 'Player ' + (val+1); }
			else if(dataType == 'dir') { val = (val > 0) ? 'forward' : 'backward'; }

			str += '<li><strong>' + prop + ":</strong> " + val + '</li>';
		}
		str += '</ul>';

		document.getElementById('move-feedback').innerHTML = str;
		document.getElementById('move-feedback').classList.add('gameover-move-feedback');

		//document.getElementById('game-gameresults').style.display = 'block';
	}

	toggleMoveResults(val) {
		var prop = 'none';

		// if we want to toggle ON ...
		if(val) { 
			var hasTextFeedback = document.getElementById('move-feedback').innerHTML.length > 0
			var hasImageFeedback = (document.getElementById('move-picture').style.display == 'inline-block');

			// ... AND we have something to show (either text or image), do it
			if(hasTextFeedback || hasImageFeedback) {
				prop = 'block'; 
			}
		}

		document.getElementById('move-results').style.display = prop;
	}

	displayActionFeedback(msg, positive = false) {
		var str = '<span class="fb-bad">';
		if(positive) { str = '<span class="fb-good">' }

		document.getElementById("game-instruction").innerHTML = str + msg + '</span>';
	}

	addToMoveFeedback(msg) {
		this.feedbackNode.innerHTML += msg;
	}

	gotoNextPlayer() {
		// find the next valid player
		// (for example, we skip anyone that's disabled)
		var curP;
		var playerNotValid;
		do {
			this.curPlayer = (this.curPlayer + 1) % cfg.playerCount;
			curP = this.getCurPlayer();

			playerNotValid = curP.isDisabled();
			if(playerNotValid) {
				document.getElementById('move-feedback').innerHTML += '<p><span class="fb-bad">Player ' + (this.curPlayer+1) + ' is disabled!</span> Continuing with next player ... </p>';
			}

			curP.setDisabled(false);
		} while(playerNotValid);

		// update counters
		this.moveCounter++;

		// update UI
		this.updateClock();
		this.updateWeather();
		this.updateMoney();
		this.updateStats();
		this.toggleMoveResults(true);

		// check if we've won or lost
		this.checkGameOver();

		// pause/reset the game
		var gm = GAME.scene.keys.mainGame;
		gm.scene.pause();
		gm.clearSelectionArea(); 

		// then continue to the action list
		this.gotoActionList();
	}

}