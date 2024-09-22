

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

const TERRAINS = ['grass', 'water', 'desert', 'mountain', 'tundra', 'snow'];
const TERRAIN_DATA = 
{
	grass: {
		color: "#009E73",
		nature: ['tree', 'flower']
	},

	water: {
		color: "#56B4E9",
		nature: ['flower']
	},

	desert: {
		color: "#F0E442",
		nature: ['tree']
	},

	mountain: {
		color: "#000000",
		nature: ['tree', 'flower']
	},

	tundra: {
		color: "#CC79A7",
		nature: ['tree', 'flower']
	},

	snow: {
		color: "#FFFFFF",
		nature: ['tree', 'flower']
	}
}

const NATURE = ['', 'tree', 'flower'];
const STONES = [0,1,2,3,4];
const QUADRANTS = ['top left', 'top right', 'bottom left', 'bottom right'];
const LANDMARKS = ['ship', 'temple', 'rocks'];
const ROADS = ['', 'straight', 'corner', 'end']

const HINT_ICONS = {
	grass: [0],
	water: [1],
	desert: [2],
	mountain: [3],
	tundra: [4],
	snow: [5],
	tree: [6],
	flower: [7],
	stones: [8],
	"straight road": [9],
	"corner road": [10],
	"end road": [11],
	ship: [12],
	temple: [13],
	rocks: [14],
	nature: [6,7],
	landmark: [12,13,14],
	"road piece": [9,10,11]
}

const LISTS = {
	terrain: TERRAINS,
	nature: NATURE,
	stones: STONES,
	landmark: LANDMARKS,
	quadrant: QUADRANTS,
	road: ROADS,
	row: [] as number[],
	column: [] as string[]
}


/*

Hints are divided based on _category_. (Helps structure, but also greatly helps when randomly drawing hints.)

Each hint MUST have:
 - id (string) => unique identifier (used in algorithm to determine what values it actually calculates)
 - type (string enum) => how the algorithm checks if a hint matches with a location
 	- exact = all values must match exactly
 	- negated = all values must NOT match
 	- single = one of the values must match, others don't matter
 	- greaterthan = the calculated value must be greater than the given value
 	- lessthan = the calculated value must be less than the given value
 	- bounds = the calculated value must be between the given values
 - text (string) => the hint itself, with substrings of format "<NUMBER>" for values to be replaced

Some MUST have:
 - variable (array) (greaterthan/lessthan) => the index of the value(s) that will be calculated _per cell_ (and is thus variable)
 - params (array of objects) (forward algo) => gives information about what the different values should be
 	- type = discrete (any value from a specific list, such as terrains)
 	- type = bounds (any value between two numerical bounds)

Optional:
 - once (boolean) => delete the hints once it has been used once
 - shuffle (boolean) => shuffle the order of all output values when printing the final hint to the player
 - duplicates (number) => how many times this hint is allowed in the FORWARD algorithm
 - forbids (array of hint id strings) => when this hint is chosen during generation, it forbids hints of the given ids
 - fail_text (string) => the hint in case calculating the values has failed or is somehow impossible => stopped using this as there's usually a better workaround

*/
const HINTS = 
{

	terrain: 
		[
			{
				id: "terrain_wrong",
				category: "terrain",
				type: "negated",
				text: "It's NOT on <0>",
				duplicates: 1,
				forbids: ["terrain_wrong_choice"],
				params: [
					{ type: "discrete", property: "terrain", negated: true }
				]
			},

			{
				id: "terrain_wrong_choice",
				category: "terrain",
				type: "negated",
				text: "It's NOT on <0> or <1>",
				duplicates: 1,
				forbids: ["terrain_wrong"],
				params: [
					{ type: "discrete", property: "terrain", negated: true },
					{ type: "discrete", property: "terrain", negated: true, different: true }
				]
			},

			{
				id: "terrain_choice",
				category: "terrain",
				type: "single",
				text: "It's on <0> OR <1>",
				duplicates: 1,
				shuffle: true,
				params: [
					{ type: "discrete", property: "terrain", variable: true },
					{ type: "discrete", property: "terrain", different: true }
				]
			},

			{
				id: "terrain_new",
				category: "terrain",
				type: "lessthan",
				text: "There's <0> within at most <1> space(s)",
				variable: [1],
				params: [
					{ type: "discrete", property: "terrain" },
					{ type: "number", variable: true }
				]
			},

			{
				id: "terrain_same",
				category: "terrain",
				type: "exact",
				text: "It's <0>next to a tile with the SAME terrain as itself",
				params: [
					{ type: "notstring", variable: true }
				]
			},

			{
				id: "terrain_same_neighbors",
				category: "terrain",
				type: "exact",
				text: "It has exactly <0> neighbors with the same terrain",
				params: [
					{ type: "number", variable: true }
				]
			},

			{
				id: "terrain_one_until_diff",
				category: "terrain",
				type: "exact",
				text: "It's <0>next to a DIFFERENT terrain than itself",
				params: [
					{ type: "notstring", variable: true }
				]
			},

			{
				id: "terrain_count",
				category: "terrain",
				type: "exact",
				text: "It has <0> <1> tiles within <2> space(s)",
				advanced: true,
				params: [
					{ type: "number", variable: true },
					{ type: "discrete", property: "terrain" },
					{ type: "bounds", min: 1, max: 2 }
				]
			},

			{ 
				id: "terrain_dist",
				category: "terrain",
				type: "lessthan",
				text: "The closest <0> tile is at most <1> space(s) away",
				advanced: true,
				variable: [1],
				params: [
					{ type: "discrete", property: "terrain" },
					{ type: "number", variable: true }
				]
			},

			{
				id: "terrain_type_diversity",
				category: "terrain",
				type: "greaterthan",
				text: "There are at least <0> terrain types within <1> space(s)",
				advanced: true,
				variable: [0],
				params: [
					{ type: "number", variable: true },
					{ type: "bounds", min: 1, max: 2 }
				]
			},

			{
				id: "terrain_count_diversity",
				category: "terrain",
				type: "lessthan",
				text: "At most <0> tiles with a DIFFERENT terrain than itself exist within <1> space(s)",
				advanced: true,
				variable: [0],
				params: [
					{ type: "number", variable: true },
					{ type: "bounds", min: 1, max: 2 }
				]
			},

			{
				id: "terrain_new_first",
				category: "terrain",
				type: "single",
				text: "The closest DIFFERENT terrain to it is <0> OR <1>",
				advanced: true,
				shuffle: true,
				duplicates: 1,
				params: [
					{ type: "discrete", property: "terrain", variable: true },
					{ type: "discrete", property: "terrain", different: true }
				]
			}
		],

	nature:
		[
			{
				id: "nature_choice",
				category: "nature",
				type: "single",
				text: "It has a <0> OR a <1>",
				once: true,
				shuffle: true,
				duplicates: 1,
				forbids: ["nature_wrong"],
				params: [
					{ type: "discrete", property: "nature", variable: true },
					{ type: "discrete", property: "nature", different: true }
				],
			},

			{
				id: "nature_wrong",
				category: "nature",
				type: "negated",
				text: "It does NOT have a <0>",
				once: true,
				duplicates: 1,
				forbids: ["nature_choice"],
				params: [
					{ type: "discrete", property: "nature", negated: true }
				]
			},


			{
				id: "nature_adjacent_nature",
				category: "nature",
				type: "exact",
				text: "It's <0>next to nature",
				params: [
					{ type: "notstring", variable: true }
				]
			},

			{
				id: "nature_twospaces_tree",
				category: "nature",
				type: "exact",
				text: "It's <0>within 2 spaces of a tree",
				params: [
					{ type: "notstring", variable: true }
				]
			},

			{
				id: "nature_twospaces_flower",
				category: "nature",
				type: "exact",
				text: "It's <0>within 2 spaces of a flower",
				params: [
					{ type: "notstring", variable: true }
				]
			},

			{
				id: "nature_compare",
				category: "nature",
				type: "exact",
				text: "It has <0> trees <1> flowers within <2> space(s)",
				params: [
					{ type: "comparestring", variable: true },
					{ type: "comparestringhelp", variable: true },
					{ type: "bounds", min: 1, max: 3 }
				]
			},

			{
				id: "nature_same",
				category: "nature",
				type: "exact",
				text: "It's <0>next to a tile with the SAME nature as itself",
				params: [
					{ type: "notstring", variable: true }
				]
			},

			{
				id: "nature_same_neighbors",
				category: "nature",
				type: "exact",
				text: "It has exactly <0> neighbors with the same nature",
				params: [
					{ type: "number", variable: true }
				]
			},

			{
				id: "nature_count",
				category: "nature",
				type: "exact",
				text: "There is <0> nature within <1> space(s)",
				advanced: true,
				variable: [0],
				params: [
					{ type: "number", variable: true },
					{ type: "bounds", min: 1, max: 2 }
				]
			},

			{
				id: "nature_dist",
				category: "nature",
				type: "lessthan",
				text: "The closest nature is at most <0> space(s) away",
				advanced: true,
				variable: [0],
				duplicates: 1,
				params: [
					{ type: "number", variable: true }
				]
			},	

			{
				id: "nature_soil",
				category: "nature",
				type: "lessthan",
				text: "There is at most <0> nature on tiles of the SAME terrain as itself",
				advanced: true,
				variable: [0],
				params: [
					{ type: "number", variable: true }
				]
			},

			{
				id: "nature_flower",
				category: "nature",
				type: "lessthan",
				text: "It has at most <0> flowers within <1> space(s)",
				advanced: true,
				variable: [0],
				params: [
					{ type: "number", variable: true },
					{ type: "bounds", min: 1, max: 3 }
				]
			},

			{
				id: "nature_tree",
				category: "nature",
				type: "greaterthan",
				text: "It has at least <0> trees within <1> space(s)",
				advanced: true,
				variable: [0],
				params: [
					{ type: "number", variable: true },
					{ type: "bounds", min: 1, max: 3 }
				]
			},
		],

	stones: 
		[
			{
				id: "stones_bounds",
				category: "stones",
				type: "bounds",
				text: "It has between <0> and <1> stones",
				variable: [0,1],
				duplicates: 1,
				params: [
					{ type: "discrete", property: "stones" },
					{ type: "discrete", property: "stones", mustBeHigher: true }
				]
			},

			{
				id: "stones_wrong",
				category: "stones",
				type: "negated",
				text: "It does NOT have <0> stones",
				duplicates: 1,
				once: true,
				forbids: ["stones_wrong_choice"],
				params: [
					{ type: "discrete", property: "stones", negated: true },
				]
			},

			{
				id: "stones_wrong_choice",
				category: "stones",
				type: "negated",
				text: "It does NOT have <0> or <1> stones",
				duplicates: 1,
				once: true,
				forbids: ["stones_wrong"],
				params: [
					{ type: "discrete", property: "stones", negated: true },
					{ type: "discrete", property: "stones", negated: true, different: true },
				]
			},

			{
				id: "stones_adjacent_stones",
				category: "stones",
				type: "exact",
				text: "It's <0>next to stones",
				params: [
					{ type: "notstring", variable: true }
				]
			},

			{
				id: "stones_count",
				category: "stones",
				type: "greaterthan",
				text: "There are at least <0> stone TILES within <1> space(s)",
				variable: [0],
				params: [
					{ type: "number", variable: true },
					{ type: "bounds", min: 1, max: 3 }
				]
			},

			{
				id: "stones_same",
				category: "stones",
				type: "exact",
				text: "It's <0>next to a tile with the SAME number of stones as itself",
				params: [
					{ type: "notstring", variable: true }
				]
			},

			{
				id: "stones_same_neighbors",
				category: "stones",
				type: "exact",
				text: "It has exactly <0> neighbors with the same number of stones",
				params: [
					{ type: "number", variable: true }
				]
			},

			{
				id: "stones_dist",
				category: "stones",
				type: "lessthan",
				text: "The closest TILE with stones is at most <0> space(s) away",
				advanced: true,
				variable: [0],
				duplicates: 1,
				params: [
					{ type: "number", variable: true }
				]
			},

			{
				id: "stones_sum",
				category: "stones",
				type: "lessthan",
				text: "The sum of all stones within <0> space(s) is at most <1>",
				advanced: true,
				variable: [1],
				params: [
					{ type: "bounds", min: 1, max: 2 },
					{ type: "number", variable: true },
				]
			},

		],

	general: 
		[
			{
				id: "general_horizontal",
				category: "general",
				type: "exact",
				text: "It's in the <0> half of the map",
				params: [
					{ type: "discrete", variable: true }
				]
			},

			{
				id: "general_vertical",
				category: "general",
				type: "exact",
				text: "It's in the <0> half of the map",
				params: [
					{ type: "discrete", variable: true }
				]
			},

			{
				id: "general_surrounded",
				category: "general",
				type: "exact",
				text: "<0> of its neighbors have something on them",
				params: [
					{ type: "number", variable: true }
				]
			},

			{
				id: "general_wrong_row",
				category: "general",
				type: "negated",
				text: "It's NOT in row <0>",
				duplicates: 1,
				once: true,
				forbids: ["general_vertical", "general_wrong_row_column", "general_wrong_row_choice"],
				params: [
					{ type: "discrete", property: "row", negated: true }
				]
			},

			{
				id: "general_wrong_row_choice",
				category: "general",
				type: "negated",
				text: "It's NOT in row <0> or row <1>",
				duplicates: 1,
				once: true,
				forbids: ["general_vertical", "general_wrong_row_column", "general_wrong_row"],
				params: [
					{ type: "discrete", property: "row", negated: true },
					{ type: "discrete", property: "row", negated: true, different: true }
				]
			},

			{
				id: "general_wrong_column",
				category: "general",
				type: "negated",
				duplicates: 1,
				once: true,
				text: "It's NOT in column <0> or column <1>",
				forbids: ["general_horizontal", "general_wrong_row_column", "general_wrong_column_choice"],
				params: [
					{ type: "discrete", property: "column", negated: true }
				]
			},

			{
				id: "general_wrong_column_choice",
				category: "general",
				type: "negated",
				duplicates: 1,
				once: true,
				text: "It's NOT in column <0> or column <1>",
				forbids: ["general_horizontal", "general_wrong_row_column", "general_wrong_column"],
				params: [
					{ type: "discrete", property: "column", negated: true },
					{ type: "discrete", property: "column", negated: true, different: true }
				]
			},

			{
				id: "general_wrong_row_column",
				category: "general",
				type: "negated",
				duplicates: 1,
				once: true,
				text: "It's NOT in row <0> or column <1>",
				forbids: ["general_wrong_row", "general_wrong_column"],
				params: [
					{ type: "discrete", property: "row", negated: true },
					{ type: "discrete", property: "column", negated: true }
				]
			},

			{
				id: "general_quadrant",
				category: "general",
				type: "negated",
				text: "It's NOT in the <0> quadrant",
				advanced: true,
				params: [
					{ type: "discrete", property: "quadrant" }
				]
			},

			{
				id: "general_map_bounds",
				category: "general",
				type: "exact",
				text: "It's <0> to the center of the map <1> to the edge",
				advanced: true,
				params: [
					{ type: "discrete", variable: true },
					{ type: "discrete", variable: true }
				]
			},

			// @IMPROV: useless if stones aren't included in the map at all ... on the other hand, will always get filtered out if that's the case
			{
				id: "general_nature_vs_stone",
				category: "general",
				type: "exact",
				text: "It has <0> nature <1> stone within <2> space(s)",
				advanced: true,
				params: [
					{ type: "discrete", variable: true },
					{ type: "discrete", variable: true },
					{ type: "bounds", min: 1, max: 3 }
				]
			},		

		],

	landmarks:
		[
			{
				id: "landmark_closest",
				category: "landmark",
				text: "The closest landmark is the <0>",
				type: "exact",
				once: true,
				params: [
					{ type: "discrete", variable: true }
				]
			},

			{
				id: "landmark_fixed",
				category: "landmark",
				text: "It's <0>within 2 spaces of a landmark",
				type: "exact",
				once: true,
				duplicates: 1,
				params: [
					{ type: "notstring", variable: true }
				]
			},

			{
				id: "landmark_adjacent",
				category: "landmark",
				text: "It's <0>next to a landmark",
				type: "exact",
				params: [
					{ type: "notstring", variable: true }
				]
			},

			{
				id: "landmark_compare",
				category: "landmark",
				text: "It's <0> to the <1> <2> to the <3>",
				type: "exact",
				params: [
					{ type: "comparestring", variable: true },
					{ type: "discrete", property: "landmark" },
					{ type: "comparestringhelp", variable: true },
					{ type: "discrete", property: "landmark" }
				]
			},


			{
				id: "landmark_dist",
				category: "landmark",
				text: "It's at most <0> space(s) from the <1>",
				type: 'lessthan',
				advanced: true,
				variable: [0],
				params: [
					{ type: "number", variable: true },
					{ type: "discrete", property: "landmark" }
				]
			},

			{
				id: "landmark_sum",
				category: "landmark",
				text: "The combined distance to ALL landmarks is at least <0>",
				advanced: true,
				type: "greaterthan",
				variable: [0],
				params: [
					{ type: "number", variable: true }
				]
			},
		],

	roads: 
		[

			{
				id: "road_right_choice",
				category: "roads",
				text: "It has a <0> road OR a <1> road",
				type: "single",
				shuffle: true,
				once: true,
				duplicates: 1,
				params: [
					{ type: "discrete", property: "road", variable: true },
					{ type: "discrete", property: "road", different: true }
				]
			},

			{
				id: "road_wrong",
				category: "roads",
				text: "It does NOT have a <0> road",
				type: "negated",
				once: true,
				duplicates: 1,
				forbids: ["road_wrong_choice"],
				params: [
					{ type: "discrete", property: "road", negated: true }
				]
			},

			{
				id: "road_wrong_choice",
				category: "roads",
				text: "It does NOT have a <0> road OR a <1> road",
				type: "negated",
				once: true,
				duplicates: 1,
				forbids: ["road_wrong"],
				params: [
					{ type: "discrete", property: "road", negated: true },
					{ type: "discrete", property: "road", negated: true, different: true }				
				]
			},

			{
				id: "road_count",
				category: "roads",
				text: "It has at most <0> road pieces within <1> space(s)",
				type: "lessthan",
				variable: [0],
				params: [
					{ type: "number", variable: true },
					{ type: "bounds", min: 1, max: 3 }
				]
			},

			{
				id: "road_adjacency",
				category: "roads",
				text: "It's <0>next to a road",
				type: "exact",
				params: [
					{ type: "notstring", variable: true }
				]
			},

			{
				id: "road_same",
				category: "roads",
				type: "exact",
				text: "It's <0>next to a tile with the SAME road type as itself",
				params: [
					{ type: "notstring", variable: true }
				]
			},

			{
				id: "road_same_neighbors",
				category: "nature",
				type: "exact",
				text: "It has exactly <0> neighbors with the same road type",
				params: [
					{ type: "number", variable: true }
				]
			},

			{
				id: "road_two_straight",
				category: "roads",
				text: "It's <0>within 2 spaces of a straight road",
				type: "exact",
				params: [
					{ type: "notstring", variable: true }
				]
			},

			{
				id: "road_two_curved",
				category: "roads",
				text: "It's <0>within 2 spaces of a corner road",
				type: "exact",
				params: [
					{ type: "notstring", variable: true }
				]
			},

			{
				id: "road_dead_end",
				category: "roads",
				text: "The closest end road is at most <0> space(s) away",
				type: "lessthan",
				variable: [0],
				params: [
					{ type: "number", variable: true }
				]
			},

			{
				id: "road_compare",
				category: "roads",
				text: "It has <0> straight roads <1> corner roads within <2> space(s)",
				advanced: true,
				type: "exact",
				params: [
					{ type: "comparestring", variable: true }, // more than, less than
					{ type: "comparestringhelp", variable: true },
					{ type: "bounds", min: 1, max: 3 }
				]
			},
		],

	tinyTreasures:
		[
			{
				id: "tiny_treasure_adjacent",
				category: "tiny treasures",
				text: "It's <0>next to a tiny treasure",
				type: "exact",
				once: true,
				params: [
					{ type: "notstring", variable: true }
				]
			},

			{
				id: "tiny_treasure_two_spaces",
				category: "tiny treasures",
				text: "It's <0>within 2 spaces of a tiny treasure",
				type: "exact",
				once: true,
				params: [
					{ type: "notstring", variable: true }
				]
			},

			{
				id: "tiny_treasure_closest",
				category: "tiny treasures",
				text: "The closest tiny treasure is <0> space(s) away",
				type: "exact",
				once: true,
				params: [
					{ type: "number", variable: true }
				]
			},

			{
				id: "tiny_treasure_count",
				category: "tiny treasures",
				text: "It has at most <0> tiny treasure(s) within <1> space(s)",
				type: "lessthan",
				advanced: true,
				once: true,
				variable: [0],
				params: [
					{ type: "number", variable: true },
					{ type: "bounds", min: 1, max: 3 }
				]
			},

			{
				id: "tiny_treasure_sum",
				category: "tiny treasures",
				text: "The distance to all tiny treasures combined is <0>",
				type: "exact",
				advanced: true,
				once: true,
				params: [
					{ type: "number", variable: true },
				]
			},
		]
}

export {
	TERRAINS,
	TERRAIN_DATA,
	NATURE,
	STONES,
	QUADRANTS,
	LANDMARKS,
	ROADS,
	HINT_ICONS,
	LISTS,
	HINTS,
	alphabet
}