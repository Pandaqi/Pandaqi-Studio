enum TerrainType
{
	LAND = "land",
	WATER = "water"
}

enum PathType
{
	BOAT = "boat",
	ROAD = "road",
	RAIL = "rail",
}

const CITY_NAMES = 
	[
		"Al Riz", "Bisto", "Camor", "Dimba", "El Doso",
		"Fehrty", "Gigli", "Haimo", "Incar", "Jublo", 
		"Kurtze", "Lusso", "Mirk", "Niri", "O-Kota", 
		"Peso", "Quasi", "Rigrag", "Si-Sa", "Truqa", 
		"Uko", "Vraze", "Wohl", "Xe", "Yunai", 
		"Zompo" 
	];

const PLAYERCOUNT_TO_CITYCOUNT = 
	[
		-1,
		6,
		8,
		10,
		12,
		14,
		16,
		18,
		20,
	];

const VEHICLE_MAP = {
	jeep: 
		{
			frame: 0,
			timerMin: 15,
			timerMax: 30,
		},

	canoe: 
		{
			frame: 1,
			timerMin: 15,
			timerMax: 30,
		},

	trolly: 
		{
			frame: 2,
			timerMin: 10,
			timerMax: 20,
		},

	plane: 
		{
			frame: 3,
			timerMin: 20,
			timerMax: 30,
		},

	tourbus: 
		{
			frame: 4,
			timerMin: 12,
			timerMax: 25,
		},

	kayak: 
		{ 
			frame: 5,
			timerMin: 6,
			timerMax: 18
		},

	draisine: 
		{
			frame: 6,
			timerMin: 9,
			timerMax: 18
		},

	crane: 
		{
			frame: 7,
			timerMin: 25,
			timerMax: 45
		} 
}

const PLAYER_COLORS = 
	[
		'#FF0000',
		'#0000FF',
		'#800080',
		'#008080',
		'#FFA500',
		'#A52A2A',
		'#FFFF00',
		'#2B5400',
	];

const DIFFICULTY_LEVELS = 
	{
		"Training Wheels": 0,
		"Good Luck": 1,
		"Fancy Vehicles": 2,
		"Another Upgrade": 3,
		"Extraordinary Events": 4,
		"Crazy Cargo": 5
	};

const GOODS = 
	{
		// Regular Goods
		Fruit: 
			{
				pointMin: 1,
				pointMax: 2,
				prob: 4,
				frame: 0,
			}, 

		Bamboo:
			{
				pointMin: 1, 
				pointMax: 3,
				prob: 3.5,
				frame: 1,
			},

		Bees:
			{
				pointMin: 2,
				pointMax: 4,
				prob: 3,
				frame: 2,
			},

		People:
			{
				pointMin: 3,
				pointMax: 4,
				prob: 2.5,
				frame: 3,
			},

		// Advanced Cargo
		Vanilla: 
			{
				pointMin: 6,
				pointMax: 6,
				prob: 2,
				frame: 4,
				difficulty: "Crazy Cargo",
			},

		Rubber:
			{
				pointMin: 0,
				pointMax: 5,
				prob: 3,
				frame: 5,
				difficulty: "Crazy Cargo",
			},

		Mahogany:
			{
				pointMin: 3,
				pointMax: 5,
				prob: 2,
				frame: 6,
				difficulty: "Crazy Cargo",
			},

		Toucan:
			{
				pointMin: 4,
				pointMax: 4,
				prob: 2,
				frame: 7,
				difficulty: "Crazy Cargo",
			},
	};

// each event has a description (flavour text + what it does), probability of appearing (relative to total), and perhaps a maximum length (to make some events shorter/longer)
const EVENTS = {

	// these change good VALUES
	'Value Increased': 
		{
			desc: "Good news! The value of GOOD changed with +1 point!",
			prob: 3
		},

	'Value Decreased':
		{
			desc: "Oh no! The value of GOOD changed with -1 point!",
			prob: 3
		},

	'Value Multiply':
		{
			desc: "Amazing news! The value of GOOD is now doubled!",
			prob: 1
		},

	'Elasticity':
		{
			desc: "Amazing News! Rubber is always worth 5 points!",
			prob: 1,
			difficulty: "Advanced Cargo"
		},

	'Inelasticity':
		{
			desc: "Oh no! Rubber is always worth 0 points!",
			prob: 1,
			difficulty: "Advanced Cargo"
		},

	// these change good DESIRES
	'Hype':
		{
			desc: "The city CITY now also wants GOOD, and will give you NUMBER points for it.",
			prob: 2
		},

	'Recession':
		{
			desc: "The city CITY does not want any goods anymore.",
			prob: 3
		},

	'Rubber Madness':
		{
			desc: "ALL cities will accept </span><span class='good-name'>Rubber</span><span> for 2 points",
			prob: 1,
			difficulty: "Advanced Cargo",
		},

	'Rubber Sickness':
		{
			desc: "NO city will accept </span><span class='good-name'>Rubber</span><span>.",
			prob: 1,
			difficulty: "Advanced Cargo",
		},

	// these change ROUTES (what you can and cannot use)
	'Blocked':
		{
			desc: "You can NOT move to a city that already has a vehicle in it",
			prob: 3,
			lengthMin: 10,
			lengthMax: 30
		},

	'Wild Waters':
		{
			desc: "The waters are stormy and wild! You may not use any sea route.",
			prob: 1,
			lengthMin: 10,
			lengthMax: 20,
		},

	'Dangerous Paths':
		{
			desc: "Dangerous animals have been sighted in the jungle! You may not use any land routes (because you are too afraid).",
			prob: 1,
			lengthMin: 10,
			lengthMax: 20,
		},

	'Turbulent Skies':
		{
			desc: "The skies are turbulent! You may not use a plane.",
			prob: 1,
			lengthMin: 10,
			lengthMax: 20,
		},

	'Lockdown':
		{
			desc: "To contain a contagious virus, the city CITY has gone into lockdown. Nobody may travel to or from it.",
			prob: 1,
		}
}

const JUNGLE_NAME_TEMPLATES = 
[
	"X Forest", 
	"X Rainforest",
	"X Jungle",
	"X Woods",
	"X Territory",
	"X Wilderness",
	"X Park",
	"Forest of X",
	"Rainforest of X",
	"Jungle of X",
	"Planes of X",
	"Park of X"
]

const COOL_WORD_TEMPLATES = 
[
	"Nimi", 
	"Takuto",
	"Ungukto",
	"Tulosi",
	"Berchake",
	"El Charpo", 
	"Caro",
	"Ziza",
	"Rain",
	"Winds",
	"Sun",
	"Sea",
	"Power",
	"Madness",
	"Fun",
	"Thunder",
	"Gods",
	"Lions",
	"Monkeys",
	"Flowers",
	"Juga",
	"Xirp",
	"Dragon",
	"Stone",
	"Fire",
	"Water",
	"Flow"
]


export {
	CITY_NAMES,
	PLAYERCOUNT_TO_CITYCOUNT,
	VEHICLE_MAP,
	PLAYER_COLORS,
	GOODS,
	EVENTS,
	DIFFICULTY_LEVELS,
	JUNGLE_NAME_TEMPLATES,
	COOL_WORD_TEMPLATES,
	TerrainType,
	PathType
}