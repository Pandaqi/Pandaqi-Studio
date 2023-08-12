var PLANET_MAP = 
	{
		"Learnth": 0,
		"Uronus": 1,
		"Marsh": 2,
		"Yumpiter": 3, 
		"Meercury": 4, 
		"Intervenus": 5, 
		"Pluto": 6,
		"Naptune": 7
	}

var PLANET_SET;
var planetSetEnabled = false;
var playingManualCombo = false;

// in solo mode, this keeps track of what the AI knows
// TO DO: Expand with more metrics, like where paths are and what their numbers are (to know where we can place them)
var knowledgeAI = {
	'disabledSpaces': [],
	'fullBuildings': [],
	'myBuildingLocations': [],
}

function getRandom(myType, list) {
	const rand = Math.random();
	const total = totalProbabilities[myType];

	var sum = 0;
	for(key in list) {
		sum += (list[key].prob / total);

		if(sum >= rand) {
			return key;
		}
	}
}

function mapPlanetToDifficulty(planet) {
	return PLANET_MAP[planet];
}

function determineRandomComponentSet() {
	var planets = Object.keys(PLANET_MAP);
	var maxSetSize = 3;

	PLANET_SET = [];

	// remove all planets with a difficulty that is too high
	planets = planets.splice(0, gameDifficulty+1);

	// always add the Learnth planet
	// (TO DO: perhaps mark a few buildings as "basic/core", and only add those, instead of fixing one planet of the set)
	PLANET_SET.push( planets.splice(0, 1)[0] );

	// always add the planet we're currently playing
	// (but only if it wasn't already added; duplicates give trouble)
	var planetIndex = planets.indexOf(planet);
	if(planetIndex != -1) {
		planets.splice(planetIndex, 1);
		PLANET_SET.push( planet );
	}

	// add random planets until set is full (or no more valid planets to add)
	for(var i = 2; i < maxSetSize; i++) {
		if(planets.length <= 0) {
			break;
		}

		PLANET_SET.push( planets.splice(Math.floor(Math.random() * planets.length), 1)[0] );
	}

	planetSetEnabled = true;
	console.log(PLANET_SET);
}

function createComboComponentSet(combo) {
	var sets = {
		"Nature": ["Marsh, Pluto"],
		"Leadership": ["Uronus, Intervenus"],
		"Resources": ["Yumpiter", "Meercury"],
		"Entertainment": ["Yumpiter", "Pluto", "Naptune"],
		"Chaotic": ["Uronus", "Marsh", "Yumpiter", "Meercury", "Intervenus", "Pluto", "Naptune"],
	}

	playingManualCombo = true;

	if(sets[combo]) {
		PLANET_SET = sets[combo]
		PLANET_SET.push("Learnth")
	} else {
		determineRandomComponentSet();
	}

	planetSetEnabled = true;
	console.log(PLANET_SET)
}

// determine the total probability of effects and numbers and events
// (used to quickly sample them from the correct distribution)
// and throw out effects not present on the current planet ( = difficulty level)

// if an effect/event difficulty is too high for our current planet, ignore it completely
// if it's exactly equal to our current planet, we double the probability! (To make these occur more often when they are first introduced.)
function initList(myType, list) {
	totalProbabilities[myType] = 0;

	for(name in list) {
		var obj = list[name]
		var planet = obj.planet || "Learnth";
		var myDifficulty = mapPlanetToDifficulty(planet);

		// if we're working from a "planet set", remove everything that's not from one of those planets
		if(planetSetEnabled) {
			if(PLANET_SET.indexOf(planet) == -1) {
				delete list[name];
				continue;
			}

			// if there is a required planet, check if it is in the planet set => if not, remove this building from the options
			if(obj.requiredPlanets != undefined) {
				var allMatch = true;
				for(var i = 0; i < obj.requiredPlanets.length; i++) {
					if(PLANET_SET.indexOf(obj.requiredPlanets[i]) == -1) {
						allMatch = false;
						break;
					}
				}

				if(!allMatch) {
					delete list[name];
					continue;
				}
			}

		// otherwise, we're looking at difficulty only, and include everything up to and including our current difficulty
		} else {
			if(myDifficulty > gameDifficulty) {
				delete list[name];
				continue;
			}
		}

		if(myDifficulty == gameDifficulty && !playingManualCombo) {
			obj.prob *= 2;
		}

		// on manual combo's, I need the Learnth planet to make stuff work, but I don't want to overemphasize it
		// so, reduce its probability 
		// TO DO: Maybe this can even work for all the other planet sets as well? Especially later planets?
		if(playingManualCombo && myDifficulty == 0) {
			obj.prob *= 0.5;
		}



		totalProbabilities[myType] += list[name].prob || 0;
	}
}

function createClickableName(myType, list, name) {
	var effect = list[name];

	var effectIcon = document.createElement('div');
	effectIcon.classList.add('effectIcon');
	effectIcon.classList.add('buttonType-' + myType);
	effectIcon.innerHTML = name;

	effectIcon.setAttribute('data-name', name);

	effectIcon.addEventListener('click', function(ev) {
		var name = ev.currentTarget.getAttribute('data-name');
		var eff = list[name]

		var probElement = (eff.prob / totalProbabilities[myType])
		var probComponent = (components[myType].prob / totalProbabilities['components'])
		var numComponentsPerRound = numOptionsPerRound * 2;

		var prob = Math.ceil(probElement * probComponent * 100) // * numComponentsPerRound;

		var typeClass = "type" + eff.type.split(" ")[0];

		var gameExplanationsDiv = document.getElementById('gameExplanations');
		gameExplanationsDiv.innerHTML = "<strong>" + name + " <span class='effectTypeText " + typeClass + "'>(" + eff.type + ")</span>:</strong> " + eff.desc + " <span class='probabilityText'>(" + prob + "% probability of appearing)</span>";

		gameExplanationsDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
	});

	return effectIcon;
}

function createComponent(name, compList) {
	switch(name) {
		case 'path':
			var number;

			do {
				number = getRandom('numbers', numbers)
			} while(compList.includes(number));
			
			var numberCont = document.createElement('div');
			numberCont.classList.add('numberText');
			numberCont.innerHTML = number;

			compList.push(number);

			return numberCont;

		case 'people':
			var randPerson = getRandom('people', people);

			var cont = document.createElement('div');
			cont.classList.add('peopleIcon');

			var imageKey = randPerson.charAt(0).toUpperCase() + randPerson.slice(1) + "Icon.png";
			cont.innerHTML = '<img src="gamesites/starry-skylines/' + imageKey + '" />';

			compList.push(randPerson);

			return cont;

		case 'buildings':
			var randName;

			do {
				randName = getRandom('buildings', buildings);
			} while(compList.includes(randName));

			compList.push(randName);

			return createClickableName('buildings', buildings, randName);

		case 'effects':
			var randName;

			do {
				randName = getRandom('effects', effects);
			} while(compList.includes(randName));

			compList.push(randName);

			return createClickableName('effects', effects, randName);

		case 'resource':
			var randResource = getRandom('resources', resources);

			var cont = document.createElement('div');
			cont.classList.add('resourceLineIcon');
			
			var imageKey = randResource.charAt(0).toUpperCase() + randResource.slice(1) + "Icon.png";
			cont.innerHTML = '<img src="gamesites/starry-skylines/' + imageKey + '" />';

			compList.push(randResource);

			return cont;
	}
}

function showEvent(gameDiv) {
	var randEventName = getRandom('events', events)
	var randEvent = events[randEventName];

	var container = document.createElement('div');
	container.id = "eventContainer";
	container.innerHTML = '<div><h2>' + randEventName + '</h2><p>' + randEvent.desc + '</p></div>'
	gameDiv.appendChild(container);
}

function getRandomNumComponents() {
	const rand = Math.random()

	// use a simple distribution for #components: 50% chance of getting 2, 25% of getting 1 or 3
	if(rand <= 0.25) {
		return 1
	} else if (rand <= 0.75) {
		return 2
	} else {
		return 3
	}
}

function spaceIsDisabled(x, y) {
	for(var i = 0; i < knowledgeAI.disabledSpaces.length; i++) {
		var s = knowledgeAI.disabledSpaces[i]
		if(s.x == x && s.y == y) {
			return true;
		}
	}

	return false;
}

function removeBuildingAt(loc) {
	for(var i = 0; i < knowledgeAI.myBuildingLocations.length; i++) {
		var s = knowledgeAI.myBuildingLocations[i];
		if(s.x == loc.x && s.y == loc.y) {
			knowledgeAI.myBuildingLocations.splice(i, 1);
			break;
		}
	}
}

function getRandomAILocation(option, num) {
	var type = option.types[num]

	var bLoc = knowledgeAI.myBuildingLocations
	if(type == 'people') {
		if(bLoc.length > 0) {
			return bLoc[Math.floor(Math.random() * bLoc.length)];							
		}
	}

	var xPos, yPos
	var iterations = 0, maxIterations = 100;
	do {
		xPos = Math.floor(Math.random() * 8);
		yPos = Math.floor(Math.random() * 8);

		iterations++;
	} while ( spaceIsDisabled(xPos, yPos) && iterations <= maxIterations);

	return { x: xPos, y: yPos }
}

function convertLocationToString(loc) {
	var horizontalMarks = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']

	return horizontalMarks[loc.x] + "" + (loc.y+1)
}

function registerAIFail(ev, option) {
	var button = ev.currentTarget
	var num = parseInt(button.getAttribute('data-id')) 
	var location = option.locations[num]
	var optionType = option.types[num]

	removeBuildingAt(location);

	// remove button as feedback
	button.parentNode.removeChild(button);
}

function calculateOptionScore(option) {
	var score = 0;

	// values for the overall component categories
	var pointValues = {
		'buildings': 2,
		'people': 1,
		'path': 1.75,
		'resource': 1.25
	}

	// values for specific components that are good/bad
	// (most are not included of course, can be extended at will)
	var specificPointValues = {
		'people': 0,
		'criminal': -0.5,
		'sick': -0.25,
		'educated': 1,
		'animal': 2,
	}

	for(var i = 0; i < option.types.length; i++) {
		// each component type is worth a default point value
		score += pointValues[ option.types[i] ]
		score += specificPointValues[ option.values[i] ] || 0;
	}

	return score;
}

function showComputerOption(gameDiv) {
	var options = [];

	var bestScore = 0, bestScoreIndex = 0;

	// create options and add to container
	for(var i = 0; i < numOptionsPerRound; i++) {
		const container = document.createElement('div');
		const numComponents = getRandomNumComponents()

		var option = { 'types': [], 'values': [], 'container': container, 'locations': [] };

		for(var c = 0; c < numComponents; c++) {
			const flexbox = document.createElement('div');
			flexbox.classList.add('optionAI');

			randomComponentName = getRandom('components', components);

			// computer doesn't execute effects
			if(randomComponentName == 'effects') {
				randomComponentName = 'buildings'
			}

			// keep track of component types ( = name of category) and values (actual specific component)
			const comp = createComponent(randomComponentName, option.values);
			option.types.push(randomComponentName);

			// LOCATION (on board to place component)
			const loc = getRandomAILocation(option, c);
			const locContainer = document.createElement('span');
			locContainer.innerHTML = convertLocationToString(loc);

			option.locations.push(loc);

			// FAILURE BUTTON (to click when this component cannot be placed)
			const failureButton = document.createElement('button');
			failureButton.innerHTML = 'X';
			failureButton.setAttribute('data-id', c);
			failureButton.classList.add('failureAIButton');
			failureButton.addEventListener('click', function(ev) {
				registerAIFail(ev, option)
			});

			flexbox.appendChild(comp);
			flexbox.appendChild(locContainer);
			flexbox.appendChild(failureButton)

			container.appendChild(flexbox)
		}

		// keep track of the best option as we create them
		var score = calculateOptionScore(option);
		if(score > bestScore) {
			bestScore = score;
			bestScoreIndex = i;
		}

		gameDiv.appendChild(container);
		options.push(option);
	}

	// disable all options we did NOT choose
	// already execute the option we DID choose
	for(var i = 0; i < numOptionsPerRound; i++) {
		if(i != bestScoreIndex) {
			options[i].container.style.pointerEvents = 'none';
			options[i].container.style.opacity = 0.1;
		} else {
			var option = options[i];

			// How does this work? 
			// We already register the building being placed AND space being filled
			// Then, if the player clicks the "failure button", we remove the building again (but leave the space disabled)
			for(var c = 0; c < option.types.length; c++) {
				if(option.types[c] != 'people') {
					knowledgeAI.myBuildingLocations.push(option.locations[c]);
					knowledgeAI.disabledSpaces.push(option.locations[c]);
				}
			}
		}
	}
}

function showOptions(gameDiv) {
	for(var i = 0; i < numOptionsPerRound; i++) {
		const container = document.createElement('div');

		const numComponents = getRandomNumComponents()

		const componentsSoFar = [];
		const componentTypesSoFar = [];

		// first buffer all options into a list (instead of placing them immediately)
		// so I can sort them later
		const allComponents = [];

		for(var c = 0; c < numComponents; c++) {
			var randomComponentName
			var componentCount

			// if something has already been used TWICE, never use it a third time within the same option
			do {
				randomComponentName = getRandom('components', components);
				componentCount = componentTypesSoFar.filter(x => x == randomComponentName).length;
			} while( componentCount >= 2 )

			componentTypesSoFar.push(randomComponentName);

			const comp = createComponent(randomComponentName, componentsSoFar);
			allComponents.push({ 'comp': comp, 'type': randomComponentName });
		}

		// sort components (effects bubble to front), then add to container
		allComponents.sort((a, b) => (a.type == 'effects' && b.type != 'effects') ? -1 : 1)
		for(var c = 0; c < numComponents; c++) {
			container.appendChild(allComponents[c].comp);
		}

		gameDiv.appendChild(container);
	}

	
}

var gameStarted = false;
var curRound = -1;

const numOptionsPerRound = 3;

var totalProbabilities = {};

const eventProbability = 0.75;
var lastClickWasEvent = false;

var soloMode = false;
var playerCount = 1, planet = "Learnth";

var showingGameBoard = false;

document.getElementById('gameButton').addEventListener('click', function(ev) {
	// if we're currently showing a generated game board,
	// remove it
	if(showingGameBoard) {
		showingGameBoard = false;

		document.getElementById('phaserContainer').style.display = 'none';
	}

	// if this is the first button press,
	// do some one-time setup
	if(!gameStarted) 
	{
		// change button text
		gameStarted = true;
		ev.currentTarget.innerHTML = 'Next Round';

		// read options + remove it
		var pcElem = document.getElementById("setting-playerCount");
		playerCount = pcElem.options[pcElem.selectedIndex].value;

		if(playerCount == 1) {
			soloMode = true;
		}

		var planetElem = document.getElementById("setting-planet");
		planet = planetElem.options[planetElem.selectedIndex].value;
		
		// meh, one global variable is alright
		window.gameDifficulty = mapPlanetToDifficulty(planet);

		var createStartingSetup = document.getElementById("setting-startingSetup").checked		

		var manualCombo = document.getElementById('setting-manualCombo').value			

		var settingsContainer = document.getElementById('gameSettings')
		settingsContainer.innerHTML = '';
		settingsContainer.style.display = 'none';

		if(manualCombo == '') {
			determineRandomComponentSet();
		} else {
			createComboComponentSet(manualCombo);
		}

		// initialize list (by adding everything that's allowed per category, removing everything that's not)
		initList('numbers', numbers);
		initList('events', events);

		initList('effects', effects);
		initList('buildings', buildings);

		initList('resources', resources);
		initList('people', people);

		initList('components', components);

		// generate a random playing board (if needed)
		if(createStartingSetup) {
			startPhaser();

			ev.currentTarget.innerHTML = 'Copied board, start game!'
			showingGameBoard = true;
			return;
		}
	}

	// clear the current contents
	var gameDiv = document.getElementById('gameOptions')
	gameDiv.innerHTML = '';

	// clear the explanation
	var gameExplanationsDiv = document.getElementById('gameExplanations');
	gameExplanationsDiv.innerHTML = '';

	gameDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });

	// randomly decide to show an event
	// Conditions:
	//  => game must already be on its way 
	//  => previous click did not lead to an event (aka we're not currently already on an event)
	//  => if we're on solo mode, never show events after computer turns
	if(curRound >= 0 && !lastClickWasEvent) {
		if(Math.random() <= eventProbability && !(soloMode && curRound % 2 == 0)) {
			ev.currentTarget.innerHTML = 'Continue';
			lastClickWasEvent = true;

			showEvent(gameDiv);
			return;
		}
	}

	// update round (only happens on actual options, not events)
	curRound++;

	ev.currentTarget.innerHTML = 'Next Round';
	lastClickWasEvent = false;

	if(soloMode && curRound % 2 == 0) {
		showComputerOption(gameDiv);
	} else {
		showOptions(gameDiv);						
	}
});