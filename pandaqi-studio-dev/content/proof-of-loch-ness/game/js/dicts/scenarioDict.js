var DEFAULT_SCENARIO = {
	width: 8,
	height: 8,
	clockIncreasePerMove: 4,

	// possible values: photograph, video, hideout, collectibles, ...
	winCondition: {
		type: "photograph",
		limit: 3,
		numFilm: 4
	},

	// possible values: time, money, ...
	loseCondition: {
		type: "time",
		limit: 24*7,
		maxWrongItems: 10,
		maxGuesses: 5,
	},
	money: {
		enabled: false,
		budget: 50,
	},
	tracksIncluded: {
		movement: false,
		water: false,
		food: false,
	},
	rulesIncluded: {
		playerTracks: false,
		frequencyBonus: false,
		nightVision: false
	},
	probabilities: {
		food: 0.3,
		water: 0.33,
		playerTracks: 0.5,
		planeTrackDestroy: 0.5,
		environmentTracks: 1.0,
	},
	hideTerrainInPicture: true,
	showStats: true,
	actions: ["action-move", "action-picture"]
}

var SCENARIOS = {
	"Uni": {
		preferredMonster: "Unicorn",
		showStats: false,
		hideTerrainInPicture: false,
		tracksIncluded: {
			movement: true
		}
	},

	"Desert": {
		tracksIncluded: {
			movement: true,
			water: true
		},
		hideTerrainInPicture: false,
		showStats: false,
		actions: ["action-move", "action-picture"],
		preferredMonster: "CactusCat"
	},

	"Forest": {
		preferredMonster: "Bigfoot",
		showStats: false,
		tracksIncluded: {
			movement: true,
			water: true,
			edges: true
		},
		rulesIncluded: {
			weather: true,
			edges: true,
		},
		actions: ["action-move", "action-picture", "action-pass", "action-weather"]
	},

	"Pegasus Park": {
		preferredMonster: "Pegasus",
		showStats: false,
		hideTerrainInPicture: false
	},

	"Nessie": {
		"width": 8,
		"height": 8,
		"clockIncreasePerMove": 4,
		"winCondition": {
			"type": "photograph",
		},
		"loseCondition": {
			"type": "time",
			"limit": 24*7
		},
		"tracksIncluded": {
			"movement": true,
			"water": false,
			"food": false
		},
		"hideTerrainInPicture": false,
		"showStats": false,
		"actions": ["action-move", "action-picture", "action-pass", "action-plane"],
		"preferredMonster": "Nessie"
	},

	"AnimalTest": {
		preferredMonster: "Bigfoot",
		rulesIncluded: {
			animals: true
		},
		loseCondition: {
			type: "money"
		},
		numAnimals: 5,
		money: {
			enabled: true,
			budget: 1
		},
		tracksIncluded: {
			movement: true,
		},
		actions: ["action-move", "action-picture", "action-collect"]
		
	},

	"Platypus": {
		preferredMonster: "Platypus",
		tracksIncluded: {
			movement: true,
			environment: true
		},
		winCondition: {
			type: "hideout"
		},
		actions: ["action-move", "action-picture", "action-pickhideout", "action-plane"]
	},

	"Dragon": {
		preferredMonster: "Dragon",
		tracksIncluded: {
			movement: true,
			food: true,
		},
		winCondition: {
			type: "hideout"
		},
		actions: ["action-move", "action-picture", "action-pickhideout", "action-plane"]
	},

	"Yeti": {
		preferredMonster: "Yeti",
		tracksIncluded: {
			movement: true
		},
		rulesIncluded: {
			animals: true,
			weather: true
		},
		numAnimals: 5,
		actions: ["action-move", "action-picture", "action-plane", "action-collect"]
	},

	"Tatzelwurm": {
		preferredMonster: "Tatzelwurm",
		tracksIncluded: {
			movement: true
		},
		actions: ["action-move", "action-picture", "action-plane", "action-areascan"]
	}
}