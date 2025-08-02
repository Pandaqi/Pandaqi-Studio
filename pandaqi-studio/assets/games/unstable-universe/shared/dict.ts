export const NODE_ACTION_TYPES = ['Cutting', 'Turn', 'Modify', 'Movement', 'Progression', 'Blocking', 'Ownership']
export const NODE_CATEGORIES = 
{
	Plants: 
		{
			color: "#7BF1A8",
			lightColor: "#94E59E",
		},

	Nature:
		{
			color: "#009FB7",
			lightColor: "#C2DDF7",
		},

	Magical:
		{
			color: "#FED766",
			lightColor: "#FFEBAF",
		},

	Enemies:
		{
			color: "#E08D79",
			lightColor: "#FEAB97",
		},

	Resources:
		{
			color: "#EFF1F3",
			lightColor: "#FFFFFF",
		},

	Misc:
		{
			color: "#A882DD",
			lightColor: "#DAC9F2",
		},

	Technology:
		{
			color: "#8C7A6B",
			lightColor: "#FFD2AC",
		},

	Center:
		{
			color: "#FFD6E0",
			lightColor: "#FF9EB6",
		}
}

/* big dictionary of nodes

@parameters: 
 - min: minimum number of times this type should appear on the board
 - prob: probability of appearing (relative to total)
 - forbiddenOnEdge: whether this node may appear on the edge of the board

*/
export const NODES_DICT = 
{
	'Center':
		{
			prob: 0,
			category: 'Center',
			actionTypes: [],
			iconFrame: 0
		},

	'Oil':
		{
			min: 5,
			prob: 5,
			category: 'Resources',
			actionTypes: ['Cutting'],
			iconFrame: 1
		},

	'Fish':
		{
			min: 3,
			prob: 3,
			category: 'Nature',
			actionTypes: ['Turn'],
			iconFrame: 2,

			maxSequence: 1,
		},

	'Water':
		{
			min: 5,
			prob: 5,
			category: 'Nature',
			actionTypes: ['Movement'],
			maxSequence: 4,
			iconFrame: 3,

			maxDistanceFromEdge: 2,
		},

	'Wood': 
		{
			min: 3,
			prob: 3,
			category: 'Technology',
			actionTypes: ['Cutting'],
			iconFrame: 4
		},

	'Fruit':
		{
			min: 6,
			prob: 3,
			category: 'Plants',
			actionTypes: ['Cutting'],
			iconFrame: 5,

			requirements: ['Dynamite']
		},

	'Dynamite':
		{
			min: 4,
			max: 7,
			prob: 3,
			category: 'Enemies',
			actionTypes: ['Modify'],
			iconFrame: 6
		},

	'Stardust':
		{
			min: 6,
			prob: 3,
			category: 'Magical',
			actionTypes: ['Progression'],
			iconFrame: 7,

			requirements: ['Critters'],
		},

	'Critters':
		{
			min: 5, 
			prob: 5,
			category: 'Enemies',
			actionTypes: ['Progression'],
			iconFrame: 8,

			forbiddenOnEdge: true,
			minDistanceFromEdge: 2,
			maxSequence: 1,

			needsNumber: true,
			typeNeeded: 'Stardust',

			requirements: ['Stardust']
		},

	'Puppy':
		{
			min: 2,
			max: 5,
			prob: 3,
			category: 'Misc',
			actionTypes: ['Blocking'],
			maxSequence: 1,
			iconFrame: 9
		},

	/*
	'Twinbird':
		{
			min: 3,
			max: 4,
			prob: 3,
			category: 'Nature',
			actionTypes: ['Ownership'],
			maxSequence: 1,
			iconFrame: 10
		},
	*/

	//
	// nastyNodes (Expansion)
	//
	'Clock':
		{
			min: 3,
			max: 5,
			prob: 3,
			category: 'Magical',
			actionTypes: ['Turn'],
			maxSequence: 1,
			iconFrame: 11,

			expansion: 'nastyNodes',
		},

	'Critter Boss':
		{
			min: 1,
			max: 3,
			prob: 3,
			category: 'Enemies',
			actionTypes: ['Progression'],
			maxSequence: 1,
			iconFrame: 12,

			forbiddenOnEdge: true,
			minDistanceFromEdge: 2,

			needsNumber: true,
			typeNeeded: 'Critters',

			expansion: 'nastyNodes',

			requirements: ['Critters'],
		},

	'Leapfrog':
		{
			min: 3,
			prob: 4,
			category: 'Nature',
			actionTypes: ['Movement'],
			iconFrame: 13,

			expansion: 'nastyNodes',
			requirements: ['Clock']
		},

	'Stone':
		{
			min: 2,
			prob: 2,
			category: 'Resources',
			actionTypes: ['Ownership'],
			maxSequence: 1,
			iconFrame: 14,

			expansion: 'nastyNodes',
		},

	'Shield':
		{
			min: 1,
			max: 3,
			prob: 3,
			category: 'Misc', 
			actionTypes: ['Blocking'],
			maxSequence: 1,
			iconFrame: 15,

			expansion: 'nastyNodes',
		},

	'Fire':
		{
			min: 1,
			max: 4,
			prob: 3,
			category: 'Technology',
			actionTypes: ['Cutting', 'Modify'],
			maxSequence: 1,
			iconFrame: 16,

			expansion: 'nastyNodes',
			requirements: ['Wood', 'Oil']
		},

	'Poison':
		{
			min: 1,
			max: 5,
			prob: 3,
			category: 'Plants',
			actionTypes: ['Blocking'],
			iconFrame: 17,

			expansion: 'nastyNodes',
			requirements: ['Healing']
		},

	'Healing':
		{
			min: 1,
			max: 5,
			prob: 3,
			category: 'Plants',
			actionTypes: ['Cutting'],
			iconFrame: 18,

			expansion: 'nastyNodes',
			requirements: ['Poison']
		},

	'Parasite':
		{
			min: 2,
			max: 5,
			prob: 4,
			category: 'Nature',
			actionTypes: ['Cutting'],
			iconFrame: 19,

			expansion: 'nastyNodes',
		},

	//
	// nodesOfKnowledge
	// 
	'Sun':
		{
			min: 4,
			max: 7,
			prob: 5,
			category: 'Technology',
			actionTypes: ['Cutting', 'Progression'],
			iconFrame: 20,

			expansion: 'nodesOfKnowledge',
			requirements: ['Moon'],
			maxSequence: 1,
		},

	'Moon':
		{
			min: 4,
			max: 7,
			prob: 5,
			category: 'Resources',
			actionTypes: ['Cutting', 'Progression'],
			iconFrame: 21,

			expansion: 'nodesOfKnowledge',
			requirements: ['Sun'],
			maxSequence: 1,
		},

	'Knowledge':
		{
			min: 2,
			max: 4,
			prob: 3,
			category: 'Misc',
			actionTypes: ['Turn'],
			iconFrame: 22,

			expansion: 'nodesOfKnowledge'
		},

	'Black Matter':
		{
			min: 3,
			max: 6,
			prob: 5,
			category: 'Magical',
			actionTypes: ['Modify', 'Movement'],
			iconFrame: 23,

			expansion: 'nodesOfKnowledge'
		},

	'Chameleon':
		{
			min: 2,
			max: 5,
			prob: 3,
			category: 'Nature',
			actionTypes: ['Ownership'],
			iconFrame: 24,

			expansion: 'nodesOfKnowledge'
		},

	'Night Owl':
		{
			min: 2,
			max: 5,
			prob: 5,
			category: 'Enemies',
			actionTypes: ['Cutting'],
			iconFrame: 25,

			expansion: 'nodesOfKnowledge',
			requirements: ['Sun', 'Moon']
		},

	'Curse':
		{
			min: 2,
			max: 4,
			prob: 4,
			category: 'Magical',
			actionTypes: ['Turn'],
			iconFrame: 26,

			expansion: 'nodesOfKnowledge',
			requirements: ['Wall Plant'],
			maxSequence: 1,
		},

	'Wall Plant':
		{
			min: 2,
			max: 4,
			prob: 4,
			category: 'Plants',
			actionTypes: ['Modify', 'Blocking'],
			iconFrame: 27,

			expansion: 'nodesOfKnowledge',
			requirements: ['Curse'],
			maxSequence: 1,
		},

	'Village Ruins':
		{
			min: 2,
			max: 4,
			prob: 4,
			category: 'Misc',
			actionTypes: ['Ownership'],
			iconFrame: 28,

			expansion: 'nodesOfKnowledge',
			maxSequence: 1,
		},

	//
	// theElectricExpansion

	'Electricity':
		{
			min: 6,
			max: 10,
			prob: 3,

			category: 'Technology',
			actionTypes: ['Progression'],
			iconFrame: 30,

			expansion: 'theElectricExpansion',
			maxSequence: 1,

			requirements: ['Battery', 'Shovel', 'Factory']
		},

	'Battery':
		{
			min: 3,
			max: 5,
			prob: 4,

			category: 'Magical',
			actionTypes: ['Progression'],
			iconFrame: 31,

			expansion: 'theElectricExpansion',

			requirements: ['Electricity', 'Shovel', 'Factory']
		},

	'Shovel':
		{
			min: 6,
			max: 10,
			prob: 4,

			category: 'Magical',
			actionTypes: ['Progression'],
			iconFrame: 32,

			expansion: 'theElectricExpansion',
			maxSequence: 1,

			requirements: ['Electricity', 'Battery', 'Factory']
		},

	'Factory':
		{
			min: 3,
			max: 5,
			prob: 4,

			category: 'Misc',
			actionTypes: ['Turn', 'Movement', 'Ownership', 'Modify'],
			iconFrame: 33,

			expansion: 'theElectricExpansion',

			requirements: ['Electricity', 'Battery', 'Shovel']
		},

	'Electric Shield':
		{
			min: 3,
			max: 5,
			prob: 4,

			category: 'Misc',
			actionTypes: ['Blocking'],
			iconFrame: 34,

			expansion: 'theElectricExpansion'
		},

	'Wind':
		{
			min: 3,
			max: 5,
			prob: 4,

			category: 'Misc',
			actionTypes: ['Movement', 'Cutting'],
			iconFrame: 35,

			expansion: 'theElectricExpansion'
		},

	'Dragon Dino':
		{
			min: 1,
			max: 3,
			prob: 4,

			needsNumber: true,
			typeNeeded: 'Electricity',

			category: 'Enemies',
			actionTypes: ['Progression'],
			iconFrame: 36,

			expansion: 'theElectricExpansion',

			forbiddenOnEdge: true,
			minDistanceFromEdge: 2,

			requirements: ['Electricity']
		},

	'Untamed Wildlands':
		{
			min: 2,
			max: 5,
			prob: 2,

			category: 'Nature',
			actionTypes: ['Cutting', 'Blocking'],
			iconFrame: 37,

			expansion: 'theElectricExpansion'
		},

	'Biomass':
		{
			min: 3,
			max: 6,
			prob: 4,

			category: 'Plants',
			actionTypes: ['Cutting', 'Turn'],
			iconFrame: 38,

			expansion: 'theElectricExpansion',

			requirements: ['Electricity']
		},
};

export const MISSION_NODES_DICT = 
{
	Preserver: 
	{
		prob: 1,
		color: "#009FB7",
		lightColor: "#C2DDF7",
		iconFrame: 0
	},

	Peacemaker:
	{
		prob: 1,
		color: "#E08D79",
		lightColor: "#FEAB97",
		iconFrame: 1,

		relevantNodes: ['Dynamite', 'Fire', 'Gas']
	},

	Fighter:
	{
		prob: 1,
		color: "#EFF1F3",
		lightColor: "#FFFFFF",
		iconFrame: 2,

		relevantNodes: ['Critters', 'Critter Boss', 'Night Owl', 'Dragon Dino']
	},

	Traveler:
	{
		prob: 1,
		color: "#8C7A6B",
		lightColor: "#FFD2AC",
		iconFrame: 3
	},

	Biologist:
	{
		prob: 1,
		color: "#7BF1A8",
		lightColor: "#94E59E",
		iconFrame: 4
	},

	Collector:
	{
		prob: 1,
		color: "#A882DD",
		lightColor: "#DAC9F2",
		iconFrame: 5
	},

	Explorer:
	{
		prob: 1,
		expansion: 'extremeExpeditions',
		color: "#FED766",
		lightColor: "#FFEBAF",
		iconFrame: 6
	},

	Digger:
	{
		prob: 1,
		expansion: 'sharpScissors',
		color: "#FFD6E0",
		lightColor: "#FF9EB6",
		iconFrame: 7
	},

	Conquerer:
	{
		prob: 1,
		expansion: 'nodesOfKnowledge',
		color: "#A23E48",
		lightColor: "#F6A7A3",
		iconFrame: 8
	},

	Destroyer:
	{
		prob: 1,
		color: "#37392E",
		lightColor: "#EEFFA3",
		iconFrame: 9,
		expansion: 'nastyNodes'
	}
}

export const EXPEDITION_NODES_DICT = 
{
	'Research Race':
	{
		prob: 1,
		expansion: "extremeExpeditions",
		iconFrame: 1
	},

	'Trap':
	{
		prob: 1,
		expansion: "extremeExpeditions",
		iconFrame: 2
	},

	'Follow the Leader':
	{
		prob: 1,
		expansion: "extremeExpeditions",
		iconFrame: 3
	},

	'Whirlpool':
	{
		prob: 1,
		expansion: "extremeExpeditions",
		iconFrame: 4
	},

	'Refurbished Objects':
	{
		prob: 1,
		expansion: "extremeExpeditions",
		iconFrame: 5
	},

	'Underground Disaster':
	{
		prob: 1,
		expansion: "extremeExpeditions",
		iconFrame: 6
	},

	'Second Chance':
	{
		prob: 1,
		expansion: "extremeExpeditions",
		iconFrame: 7
	},
}

// NOTE: no need to create a dictionary for this and then copy, as this is always the same
export const TINY_NODES = 
{
	Circle:
	{
		prob: 4,
		iconFrame: 0
	},

	Pause:
	{
		prob: 2,
		iconFrame: 2
	},

	Square:
	{
		prob: 3,
		iconFrame: 1
	},

	Triangle:
	{
		prob: 1.5,
		iconFrame: 3
	},

	Cross:
	{
		prob: 2,
		iconFrame: 4
	}
}

// NOTE: Same
export const NATURAL_RESOURCES = 
{
	Coal:
	{
		prob: 2,
		iconFrame: 0
	},

	Diamonds:
	{
		prob: 2,
		iconFrame: 1
	},

	Gold:
	{
		prob: 2,
		iconFrame: 2
	},

	Minerals:
	{
		prob: 2,
		iconFrame: 3
	},

	Gas:
	{
		prob: 2,
		iconFrame: 4
	}
}

export const LANDMARKS =
{
	Mountain:
	{
		prob: 2,
		iconFrame: 0
	},

	Forest:
	{
		prob: 2,
		iconFrame: 1
	},

	Lake:
	{
		prob: 2,
		iconFrame: 2
	},

	Capital:
	{
		prob: 2,
		iconFrame: 3
	},

	Caves:
	{
		prob: 2,
		iconFrame: 4
	},
}