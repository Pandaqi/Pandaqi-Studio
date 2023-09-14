// take the default object for scenario/monster
// then _override_ any keys present in the specific scenario/monster chosen
function fillOutConfig() {
	// scenario update
	var s = SCENARIOS[cfg.scenario];
	overridePropertiesOnObject(s, DEFAULT_SCENARIO);

	// monster update
	var m = MONSTERS[cfg.monster];
	overridePropertiesOnObject(m, DEFAULT_MONSTER);

	// if the monster has "any" terrain, pick one at random and set it
	if(m.terrain.type == "any") {
		var allTerrains = Object.keys(TERRAINS);
		m.terrain.type = allTerrains[Math.floor(Math.random()*allTerrains.length)];
	}

	// for all animals, fill it out (also with default monster properties)
	var animList = TERRAINS[m.terrain.type].possibleAnimals || [];
	for(key in ANIMAL_DICT) {
		// skip animals that aren't even IN this terrain
		if(!animList.includes(key)) { continue; }
		overridePropertiesOnObject(ANIMAL_DICT[key], DEFAULT_MONSTER);
	}

	// manually copy some properties I'd rather have on the cfg object
	// (I should keep these to a minimum; everyhting else belongs to monster, scenario or terrain)
	cfg.width = s.width;
	cfg.height = s.height;

	// finally, read some properties to finalize configuration
	cfg.cellSizeX = cfg.canvasWidth / cfg.width;
	cfg.cellSizeY = cfg.canvasHeight / cfg.height;
}

// Go through all properties in "b"
// If they are not present in "a", set them in "a"
// If it's an object, get more detailed
function overridePropertiesOnObject(a, b) {
	for(key in b) {
		if(typeof(b[key]) === "object") {
			if(!a.hasOwnProperty(key)) { a[key] = b[key]; }
			else { overridePropertiesOnObject(a[key], b[key]) }
		} else {
			if(!a.hasOwnProperty(key)) { a[key] = b[key]; }
		}	
	}
}

function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

function initializePlayers() {
	PLAYERS = [];

	var scn = SCENARIOS[cfg.scenario];
	var playerRoles = [];
	if(scn.rulesIncluded.playerRoles) {
		playerRoles = PLAYER_ROLES.slice();
		shuffleArray(playerRoles);
	}

	for(var i = 0; i < cfg.playerCount; i++) {
		var role = (i < playerRoles.length) ? playerRoles[i] : "default";

		PLAYERS.push(new Player(i, role));
	}
}

function determineMonster() {
	// each scenario has a "preferred" or "default" monster
	var scenarioMonster = SCENARIOS[cfg.scenario].preferredMonster;

	// but any other monster can be input as well, which overrides that
	var userInputMonster = cfg.monster;

	// choose one, set it
	var chosenMonster = userInputMonster || scenarioMonster;
	cfg.monster = chosenMonster;
}

function readPlayerInput() {
	let config = JSON.parse(window.localStorage.getItem("proofOfLochNessConfig"));

	cfg.playerCount = parseInt(config.playerCount) || 4;
	cfg.scenario = config.scenario || "Yeti";

	// if monster is set to "preferred", we remove it from the config
	// so it initializes the default monster (for the given scenario) by default
	var mon = config.monster;
	if(mon == 'Preferred') {
		delete cfg.monster;
	} else {
		cfg.monster = mon;
	}
}

function setup() {
	readPlayerInput();
	determineMonster();
	fillOutConfig();

	MAP = new GameMap(cfg.width, cfg.height);
	MAP.initialize();

	STATE = new State();
	STATE.initialize();

	MONSTER = new Monster(cfg.monster);
	MONSTER.setup();

	initializePlayers();
}

setup();