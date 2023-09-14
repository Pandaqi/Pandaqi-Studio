// all edge types (in correct order): "river", "shrub", "wall", "road"
// all weather types (in correct order): "regular", "rain", "heat", "snow", "thunder", "windy", "freezing", "unknown" (used in weather predictions)


var TERRAINS = {
	"grassland": {
		weather: [{type:"regular", weight: 6}, {type: "rain", weight: 2}],
		edges: ["river", "shrub", "wall"],

		possibleAnimals: [],
		hasNaturalWater: false,
	},

	"desert": {
		weather: [{type:"regular", weight: 3}, {type:"heat", weight: 6}],
		edges: [],

		possibleAnimals: [],
		hasNaturalWater: false,
	},

	"forest": {
		weather: [{type:"regular", weight: 2}, {type: "rain", weight: 2}],
		edges: ["river", "shrub"],

		useOverlayTerrain: true,
		overlayTerrainLine: 0.0,
		forbidOverlayOnWater: true,
		waterLine: -0.1,

		forbidWaterSources: true,
		hasNaturalWater: true,

		possibleAnimals: ['Fish']
	},

	"lake": {
		weather: [{type:"regular", weight: 1}],
		edges: [],

		forbidWaterSources: true,
		hasNaturalWater: true,
		possibleAnimals: ['Fish']
	},

	"rainforest": {
		weather: [{type:"regular", weight: 1},{type:"rain", weight: 7}],
		edges: [],

		useOverlayTerrain: true,
		overlayTerrainLine: 0.0,
		waterLine: -0.4,

		hasNaturalWater: false,

		possibleAnimals: [],
	},

	"swamp": {
		weather: [{type:"regular", weight: 1}],
		edges: [],

		useOverlayTerrain: true,
		overlayTerrainLine: 0.0,
		waterLine: 0.075,

		forbidWaterSources: true,
		hasNaturalWater: true,

		possibleAnimals: [],
	},

	"mountain": {
		weather: [{type:"regular", weight: 2}, {type:"snow", weight: 6}, {type:"freezing", weight: 3}],
		edges: [],

		mountainLine: 0.075,

		useOverlayTerrain: true,
		overlayTerrainLine: 0.0,

		possibleAnimals: ['Ibex'],
		hasNaturalWater: false,
	},

	"urban": {
		weather: [{type:"regular", weight: 1}],
		edges: [],

		useOverlayTerrain: true,
		overlayTerrainLine: 0.3,
		waterLine: -1.0,

		grassLine: -0.2,

		possibleAnimals: [],
		hasNaturalWater: false,
	},
}