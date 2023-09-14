function moveMonster() {
	// show monster movement/animation, nothing else
	STATE.gotoMonsterScreen();

	//
	// check if we even want to/can move
	// (if not, immediately jump to next player)
	//
	var canMove = true;

	// each monster has its own probability of moving after each turn
	var moveProb = MONSTER.moving.prob;
	if(STATE.getState() == 'action-pass') { moveProb *= 0.5; }
	if(Math.random() > moveProb) { canMove = false; }

	// otherwise, just call the specific move function for this monster
	if(canMove) {
		MONSTER.move();
	}

	// finally, end the monster turn, and go to next player ( = open next turn)
	finalizeMonsterMove();
}

// we execute a DELAY here, before REALLY ending the monster move, for two reasons:
// 1) to give feedback to players - it "feels" like a monster moving should take time
// 2) to make sure the phaser game updates properly before we pause it
function finalizeMonsterMove() {
	endMonsterMove();

	// when debugging, remove that "unnecessary" delay to speed things up
	if(cfg.debugging) {
		cfg.monsterMoveDelay = 40;
	}

	var gm = GAME.scene.keys.mainGame;
	gm.time.addEvent({
		delay: cfg.monsterMoveDelay,
		callback: function() {
			gm.performPostAction();
	    },
	    loop: false
	})
}

function endMonsterMove() {
	// move animals
	// NOTE: we don't do this per cell (as below), as animals will be MOVING between cells, causing all sorts of issues
	for(var i = 0; i < ANIMALS.length; i++) {
		ANIMALS[i].move();
	}

	// update the map 
	// 1) fade tracks, or simply update them
	// 2) spoil food
	// 3) refill water if needed
	// 4) update tracks for windy weather, if needed
	var weather = STATE.getCurrentWeather();
	for(var x = 0; x < cfg.width; x++) {
		for(var y = 0; y < cfg.height; y++) {
			var cell = MAP.getCell({x:x,y:y});

			cell.updateTracks(weather);
			cell.updateFood(weather);
			cell.updateWater(weather);
			cell.updateWindTracks(weather);
		}
	}
}
