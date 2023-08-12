var canvasScaleFactor = 3.8
var cfg = {
	"debugging": false, // @ DEBUGGING (should be false)
	"gameOver": false,

	"scenario": "Uni",
	"monster": "Unicorn",

	"width": 16,
	"height": 16,
	"canvasWidth": 210*canvasScaleFactor,
	"canvasHeight": 297*canvasScaleFactor,

	"cellSizeX": 20,
	"cellSizeY": 20,

	"seed": "",
	"noiseFunction": "perlin",
	"noiseZoom": 199.9876,

	"playerCount": 1,

	"grid": {
		"lineWidth": 2.5,
		"lineColor": 0x333333,
		"lineAlpha": 1.0
	},

	"clockIncreasePerMove": 4,
	"timeLimit": 24*7,

	"monsterMoveDelay": 2000,

	"windTracksProbability": 0.2,
}

var ACTIONS = {
	"action-move": { 
		"label": "Move", 
		"cost": 1,
		"instruction": "Tap the area you're moving to.", 
		"view": "subdiv", "inputMode": "pickarea", 
		"icon": "icon-move", 
		isPostAction: false 
	},

	"action-picture": { 
		"label": "Photograph", 
		"cost": 2,
		"instruction": "Draw the area you want to photograph.", 
		"view": "subdiv", "inputMode": "drawarea", 
		"icon": "icon-picture", 
		isPostAction: true 
	},

	"action-pass": { 
		"label": "Pass",
		"cost": 0,
		"instruction": "Click confirm to make this action definitive.", 
		"view": "fullgrid", "inputMode": "pickarea", 
		"icon": "icon-pass", 
		isPostAction: false 
	},

	"action-plane": { 
		"label": "Fly", 
		"cost": 3,
		"instruction": "Tap your destination", 
		"view": "subdiv", "inputMode": "pickarea", 
		"icon": "icon-plane", 
		isPostAction: false 
	},

	"action-weather": { 
		"label": "Weather Prediction", 
		"cost": 1,
		"instruction": "Draw an area.", 
		view: "subdiv", "inputMode": "drawarea", 
		"icon": "icon-weather",
		isPostAction: false
	},

	"action-gameresults": { 
		"label": "Game Over", 
		cost: 0,
		"instruction": "Check out this game!", 
		"view": "fullgrid", "inputMode": null, 
		"icon": "icon-gameresults",
		isPostAction: false
	},
	"action-reload": { 
		"label": "Reload", 
		cost: 0,
		"instruction": null, 
		"view": null, "inputMode": null, 
		"icon": "icon-reload",
		isPostAction: false
	},

	"action-pickhideout": { 
		"label": "Pick Hideout",
		cost: 0, 
		"instruction": "Tap the area you want to pick", 
		"view": "subdiv", "inputMode":"pickarea", 
		"icon": "icon-pickhideout",
		isPostAction: false
	},
	
	"action-areascan": { 
		"label": "Area Scan", 
		cost: 2,
		"instruction": "Draw the area you want to scan", 
		"view": "fullgrid", "inputMode": "drawarea", 
		"icon": "icon-areascan",
		isPostAction: false 
	},

	"action-collect": {
		"label": "Collect",
		cost: 2,
		"instruction": "Draw the area in which you want to collect everything",
		"view": "subdiv", "inputMode": "drawarea",
		"icon": "icon-collect",
		isPostAction: true
	}
}

var TRACKS = {
	"ripple": { "frame": 0, prob: 1.0, fadesAway: true, "texture": "environment_tracks", "counterReset": 3,  "combineTracks": true, "useRotation": true },
	"footprint": { "frame": 2, prob: 1.0, fadesAway: true, "texture": "movement_tracks", "counterReset": 5, "combineTracks": false, "useRotation": false },
	"poop": { frame: 0, prob: 1.0, fadesAway: true, texture: "misc", counterReset: 4, combineTracks: false, useRotation: false },
	"blood": { frame: 1, prob: 0.25, fadesAway: true, texture: "misc", counterReset: 6 },
	"feather": { frame: 2, prob: 0.25, fadesAway: false, texture: "misc" },
	"lifesign": { frame: 4, fadesAway: true, counterReset: 1, texture: "misc" }
}

var EDGES = {
	"river": { "frame": 0 },
	"shrub": { "frame": 2 },
	"wall": { "frame": 4 },
	"road": { "frame": 6 }
}

var CELL_TERRAINS = ['water', 'sand', 'grass', 'grass_rainforest', 'grass_swamp', 'mountain', 'urban'];
var PLAYER_ROLES = ['cartographer', 'explorer', 'adventurer', 'fighter', 'tracker', 'photographer', 'biologist', 'scientist', 'journalist'];

var STATE;

var MAP;
var CORNERS = [];

var MONSTER = null; 

var PLAYERS = [];
var ANIMALS = [];