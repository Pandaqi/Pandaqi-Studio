const TILE_DICT = {
	"empty tile": { frame: 0, prob: 3, material: 10, symbolSlots: [true,true,true], fixedSymbols: ['circle', 'square', 'plus'] },
	water: { frame: 1, 'custom': true, material: 6, symbolSlots: [false,false,false], fixedSymbols: [null,null,null] },
	palmtree: { frame: 2, prob: 2, material: 6, symbolSlots: [true,true,true], fixedSymbols: ['circle',null,'circle'] },
	key: { frame: 3, material: 3, symbolSlots: [true,false,true], fixedSymbols: ['circle',null,'plus'] },
	arrow: { frame: 4, material: 6, symbolSlots: [true,false,true], fixedSymbols: ['square',null,'plus'] },
	compass: { frame: 5, material: 1, 'once': true, symbolSlots: [false,false,false], fixedSymbols: [null,null,null] },
	map: { frame: 6, material: 1, 'once': true, symbolSlots: [false,true,false], fixedSymbols: [null,'plus',null] },
	lighthouse: { frame: 7, material: 3, symbolSlots: [true,true,true], fixedSymbols: [null,'square','square'] }
}

const BEARINGS = {
	'North-East': { frame: 0 },
	'South-East': { frame: 1 },
	'South-West': { frame: 2 },
	'North-West': { frame: 3 }
}

const QUADRANTS = {
	'top left': { frame: 0 },
	'top right': { frame: 1 },
	'bottom left': { frame: 2 },
	'bottom right': { frame: 3 }
}

const SYMBOLS = {
	circle: { frame: 0 },
	square: { frame: 1 },
	plus: { frame: 2 }
}

const DISCRETE_LISTS = {
	type: Object.keys(TILE_DICT), // the main one; see TILE_DICT
	neighborCount: [2,3,4], // when hints count how many neighbors (at least) have something; hence 0,1 are missing
	networkCount: [1,2,3,4,5], // with how many other tiles it is connected in the network
	rot: [0,1,2,3], // quarter rotations, 4 possible states
	bearings: Object.keys(BEARINGS), // quadrants indicated by the compass tile
	row: [], // filled in dynamically
	column: [], // filled in dynamically
	quadrant: Object.keys(QUADRANTS),
	symbol: Object.keys(SYMBOLS)
}

const BEARING_CONDITIONS = [
	[{ property: 'x', check: 'morethan' }, { property: 'y', check: 'morethan' }],
	[{ property: 'x', check: 'lessthan' }, { property: 'y', check: 'morethan' }],
	[{ property: 'x', check: 'lessthan' }, { property: 'y', check: 'lessthan' }],
	[{ property: 'x', check: 'morethan' }, { property: 'y', check: 'lessthan' }],
]

const FIXED_MAP_TILES = ['A1', 'A2', 'B1', 'B4', 'C4', 'D2', 'E2', 'E3', 'F1', 'F3', 'G2', 'H4'];

const HINT_CATEGORIES = ['type', 'rotation', 'general', 'arrows', 'special', 'symbols', 'network'];
const HINT_DICT = [
	/* TYPE */
	{
		id: "type_self",
		category: "type",
		text: "It's <0>on a(n) <1>",
		swapResistant: true,
		params: [
			{ type: "notstring", variable: true },
			{ type: "discrete", property: "type" }
		],
		layers: [
			{ type: "texture", key: "hint_base", frame: 0 },
			{ type: "texture", key: "hint_tile_type", list: TILE_DICT, index: 1 }
		],
		notCrossData: { y: 0.75 },
	},

	{
		id: "type_adjacent",
		category: "type",
		text: "It's <0>adjacent to a(n) <1>",
		params: [
			{ type: "notstring", variable: true },
			{ type: "discrete", property: "type" }
		],
		layers: [
			{ type: "texture", key: "hint_base", frame: 1 },
			{ type: "texture", key: "hint_tile_type", list: TILE_DICT, index: 1, x: 0.75, scale: 0.45 }
		]
	},

	{
		id: "type_self_duo",
		category: "type",
		text: "It's <0>on a(n) <1> or a(n) <2>",
		swapResistant: true,
		different: true,
		params: [
			{ type: "notstring", variable: true },
			{ type: "discrete", property: "type" },
			{ type: "discrete", property: "type" }
		],
		layers: [
			{ type: "texture", key: "hint_base", frame: 2 },
			{ type: "texture", key: "hint_tile_type", list: TILE_DICT, index: 1, shuffle: true, x: 0.33, y: 0.33, scale: 0.45 },
			{ type: "texture", key: "hint_tile_type", list: TILE_DICT, index: 2, shuffle: true, x: 0.66, y: 0.66, scale: 0.45 }
		]
	},

	{
		id: "type_row",
		category: "type",
		text: "It's <0>on the same row as a(n) <1>",
		params: [
			{ type: "notstring", variable: true },
			{ type: "discrete", property: "type" }
		],
		layers: [
			{ type: "texture", key: "hint_base", frame: 3 },
			{ type: "texture", key: "hint_tile_type", list: TILE_DICT, index: 1, x: 0.2, scale: 0.33 },
		]
	},

	{
		id: "type_column",
		category: "type",
		text: "It's <0>on the same column as a(n) <1>",
		params: [
			{ type: "notstring", variable: true },
			{ type: "discrete", property: "type" }
		],
		layers: [
			{ type: "texture", key: "hint_base", frame: 4 },
			{ type: "texture", key: "hint_tile_type", list: TILE_DICT, index: 1, y: 0.2, scale: 0.33 },
		]
	},

	{
		id: "type_surrounded",
		category: "type",
		text: "It's <0>completely surrounded ( = all neighbors are not empty tiles)",
		params: [
			{ type: "notstring", variable: true }
		],
		layers: [
			{ type: "texture", key: "hint_base", frame: 5 },
		]
	},

	{
		id: "type_between",
		category: "type",
		text: "It's <0>between a(n) <1> and a(n) <2>",
		advanced: true,
		params: [
			{ type: "notstring", variable: true },
			{ type: "discrete", property: "type" },
			{ type: "discrete", property: "type" }
		],
		layers: [
			{ type: "texture", key: "hint_base", frame: 6 },
			{ type: "texture", key: "hint_tile_type", list: TILE_DICT, index: 1, x: 0.175, scale: 0.33 },
			{ type: "texture", key: "hint_tile_type", list: TILE_DICT, index: 2, x: 0.825, scale: 0.33 },
		],
		notCrossData: { y: 0.66, scale: 0.33 } 
	},

	{
		id: "type_distance",
		category: "type",
		text: "The closest <0> is <1>within 2 tiles",
		params: [
			{ type: "discrete", property: "type" },
			{ type: "notstring", variable: true }
		],
		layers: [
			{ type: "texture", key: "hint_base", frame: 7 },
			{ type: "texture", key: "hint_tile_type", list: TILE_DICT, index: 0, x: 0.74, y: 0.74, scale: 0.45 },
		]
	},

	{
		id: "type_sum",
		category: "type",
		text: "It <0>has at least <1> neighbors of type <2>",
		advanced: true,
		params: [
			{ type: "notstring", variable: true },
			{ type: "discrete", property: "neighborCount" },
			{ type: "discrete", property: "type" },
		],
		layers: [
			{ type: "texture", key: "hint_base", frame: 8 },
			{ type: "texture", key: "hint_tile_type", list: TILE_DICT, index: 2, x: 0.5, y: 0.175, scale: 0.25 },
			{ type: "texture", key: "hint_tile_type", list: TILE_DICT, index: 2, x: 0.825, y: 0.5, scale: 0.25 },
			{ type: "texture", key: "hint_tile_type", list: TILE_DICT, index: 2, x: 0.5, y: 0.825, scale: 0.25 },
			{ type: "texture", key: "hint_tile_type", list: TILE_DICT, index: 2, x: 0.175, y: 0.5, scale: 0.25 },
		],
		layerCutoff: { index: 1, offset: 1 },
		notCrossData: { scale: 0.33 }
	},

	/* ARROWS */
	{
		id: "arrow_points",
		category: "arrows",
		text: "<0>arrow points to it",
		params: [
			{ type: "notstring", variable: true }
		],
		layers: [
			{ type: "texture", key: "hint_base", frame: 9 },
		]
	},

	{
		id: "arrow_duo",
		category: "arrows",
		text: "It <0>has TWO arrows pointing to it",
		params: [
			{ type: "notstring", variable: true }
		],
		layers: [
			{ type: "texture", key: "hint_base", frame: 10 },
		]
	},	

	/* ROTATION */
	{
		id: "rotation_self",
		category: "rotation",
		text: "It <0>has rotation <1>",
		swapResistant: true,
		params: [
			{ type: "notstring", variable: true },
			{ type: "discrete", property: "rotation" }
		],
		layers: [
			{ type: "texture", key: "hint_base", frame: 11, rotationIndex: 1 },
		]
	},

	{
		id: "rotation_adjacent",
		category: "rotation",
		text: "It's <0>next to a tile with rotation <1>",
		params: [
			{ type: "notstring", variable: true },
			{ type: "discrete", property: "rotation" }
		],
		layers: [
			{ type: "texture", key: "hint_base", frame: 12 },
			{ type: "texture", key: "hint_tile_type", frame: 9, rotationIndex: 1, x: 0.75, scale: 0.5 }
		],
		notCrossData: { y: 0.75 }
	},

	{
		id: "rotation_neighbor_point",
		category: "rotation",
		text: "It <0>has a neighbor rotated towards us",
		params: [
			{ type: "notstring", variable: true },
		],
		layers: [
			{ type: "texture", key: "hint_base", frame: 13 }
		],
		notCrossData: { scale: 0.25 }
	},

	{
		id: "rotation_neighbor_match",
		category: "rotation",
		text: "It <0>has a neighbor with the SAME rotation as itself",
		params: [
			{ type: "notstring", variable: true },
		],
		layers: [
			{ type: "texture", key: "hint_base", frame: 14 }
		],
		notCrossData: { y: 0.75 }
	}, 

	{
		id: "rotation_neighbor_arrow_match",
		category: "rotation",
		text: "It's <0>rotated such that two rotation arrows meet at its edge",
		params: [
			{ type: "notstring", variable: true },
		],
		layers: [
			{ type: "texture", key: "hint_base", frame: 15 }
		],
		notCrossData: { y: 0.75 }
	},

	{
		id: "rotation_neighbor_similarity_count",
		category: "rotation",
		advanced: true,
		text: "It <0>has more neighbors with the SAME rotation as itself than neighbors with a DIFFERENT one",
		params: [
			{ type: "notstring", variable: true },
		],
		layers: [
			{ type: "texture", key: "hint_base", frame: 16 }
		],
		notCrossData: { scale: 0.25 }
	},

	/* SPECIAL */
	{
		id: "special_compass",
		category: "special",
		text: "It's <0>in the <1> section indicated by the compass",
		params: [
			{ type: "notstring", variable: true },
			{ type: "discrete", property: "bearings" }
		],
		layers: [
			{ type: "texture", key: "hint_base", frame: 19 }, // blank compass tile (purple)
			{ type: "texture", key: "hint_bearings", list: BEARINGS, index: 1, scale: 0.85 }
		],
	},

	{
		id: "special_map",
		category: "special",
		text: "It's <0>in a tile marked on the map tile",
		params: [
			{ type: "notstring", variable: true },
		],
		layers: [
			{ type: "texture", key: "hint_base", frame: 20 }
		],
		notCrossData: { scale: 0.33, y: 0.75 }
	},

	/* GENERAL */
	{
		id: "general_horizontal",
		category: "general",
		text: "It's <0>in the left half of the map",
		params: [
			{ type: "notstring", variable: true },
		],
		layers: [
			{ type: "texture", key: "hint_base", frame: 17 }
		],
	},

	{
		id: "general_vertical",
		category: "general",
		text: "It's <0>in the top half of the map",
		params: [
			{ type: "notstring", variable: true },
		],
		layers: [
			{ type: "texture", key: "hint_base", frame: 18 }
		],
	},

	{
		id: "general_quadrant",
		category: "general",
		text: "It's <0>in the <1> quadrant",
		advanced: true,
		params: [
			{ type: "notstring", variable: true },
			{ type: "discrete", property: "quadrant" }
		],
		layers: [
			{ type: "texture", key: "hint_quadrant", list: QUADRANTS, index: 1 }
		],
	},

	{
		id: "general_row",
		category: "general",
		text: "It's <0>in row <1>",
		params: [
			{ type: "notstring", variable: true },
			{ type: "discrete", property: "row" }
		],
		layers: [
			{ type: "grid", "highlight": { type: "row", index: 1 } }
		],
		notCrossData: { scale: 0.33 }
	},

	{
		id: "general_column",
		category: "general",
		text: "It's <0>in column <1>",
		params: [
			{ type: "notstring", variable: true },
			{ type: "discrete", property: "column" }
		],
		layers: [
			{ type: "grid", "highlight": { type: "column", index: 1 } }
		],
		notCrossData: { scale: 0.33 }
	},


	/* SYMBOLS */
	{
		id: "symbol_self",
		category: "symbols",
		text: "It <0>has symbol <1>",
		swapResistant: true,
		params: [
			{ type: "notstring", variable: true },
			{ type: "discrete", property: "symbol" }
		],
		layers: [
			{ type: "texture", key: "hint_base", frame: 0 },
			{ type: "texture", key: "hint_symbols", list: SYMBOLS, index: 1 }
		],
		notCrossData: { y: 0.75 }
	},

	{
		id: "symbol_self_duo",
		category: "symbols",
		text: "It <0>has symbol <1> or <2>",
		swapResistant: true,
		different: true,
		params: [
			{ type: "notstring", variable: true },
			{ type: "discrete", property: "symbol", shuffle: true },
			{ type: "discrete", property: "symbol", shuffle: true }
		],
		layers: [
			{ type: "texture", key: "hint_base", frame: 21 },
			{ type: "texture", key: "hint_symbols", list: SYMBOLS, index: 1, x: 0.225, y: 0.275, scale: 0.5 },
			{ type: "texture", key: "hint_symbols", list: SYMBOLS, index: 2, x: 0.725, y: 0.775, scale: 0.5 }
		]
	},

	{
		id: "symbol_neighbor",
		category: "symbols",
		text: "It <0>has a neighbor with symbol <1>",
		params: [
			{ type: "notstring", variable: true },
			{ type: "discrete", property: "symbol" }
		],
		layers: [
			{ type: "texture", key: "hint_base", frame: 1 }, // uses the basic adjacency hint image
			{ type: "texture", key: "hint_symbols", list: SYMBOLS, index: 1, x: 0.725, scale: 0.55 }
		]
	},

	{
		id: "symbol_match_any",
		category: "symbols",
		text: "It <0> matches a symbol with any neighbor",
		params: [
			{ type: "notstring", variable: true }
		],
		layers: [
			{ type: "texture", key: "hint_base", frame: 22 },
		],
		notCrossData: { y: 0.75, scale: 0.25 }
	},

	{
		id: "symbol_match_edge",
		category: "symbols",
		text: "It <0> matches a symbol with a neighbor at the same edge",
		params: [
			{ type: "notstring", variable: true },
		],
		layers: [
			{ type: "texture", key: "hint_base", frame: 23 },
		],
		notCrossData: { y: 0.75, scale: 0.25 }
	},

	{
		id: "symbol_count",
		category: "symbols",
		text: "It <0> has multiple symbols",
		swapResistant: true,
		"digital": true,
		params: [
			{ type: "notstring", variable: true },
		],
		layers: [
			{ type: "texture", key: "hint_base", frame: 24 },
		],
		notCrossData: { y: 0.75 }
	},

	{
		id: "symbol_match_count",
		category: "symbols",
		text: "It <0> has multiple symbols of the same type",
		swapResistant: true,
		"digital": true,
		params: [
			{ type: "notstring", variable: true },
		],
		layers: [
			{ type: "texture", key: "hint_base", frame: 25 },
		],
		notCrossData: { y: 0.75 }
	},

	{
		id: "symbol_diversity",
		category: "symbols",
		text: "Its neighbors <0>have more symbols of type <1> than type <2>",
		advanced: true,
		different: true,
		params: [
			{ type: "notstring", variable: true },
			{ type: "discrete", property: "symbol" },
			{ type: "discrete", property: "symbol" },
		],
		layers: [
			{ type: "texture", key: "hint_base", frame: 26 },
			{ type: "texture", key: "hint_symbols", list: SYMBOLS, index: 1, x: 0.175, scale: 0.33 },
			{ type: "texture", key: "hint_symbols", list: SYMBOLS, index: 1, y: 0.175, scale: 0.33 },
			{ type: "texture", key: "hint_symbols", list: SYMBOLS, index: 1, x: 0.825, scale: 0.33 },
			{ type: "texture", key: "hint_symbols", list: SYMBOLS, index: 2, y: 0.825, scale: 0.33 },
		],
		notCrossData: { scale: 0.25 }
	},

	/* NETWORK */
	{
		id: "network_connected",
		category: "network",
		text: "It's <0>connected to a network",
		swapResistant: true, // not entirely true, still good to mark it as such
		params: [
			{ type: "notstring", variable: true },
		],
		layers: [
			{ type: "texture", key: "hint_base", frame: 27 },
		],
		notCrossData: { y: 0.825 }
	},

	{
		id: "network_connected_type",
		category: "network",
		text: "It's <0>connected to a(n) <1>",
		params: [
			{ type: "notstring", variable: true },
			{ type: "discrete", property: "type" },
		],
		layers: [
			{ type: "texture", key: "hint_base", frame: 28 },
			{ type: "texture", key: "hint_tile_type", list: TILE_DICT, index: 1, x: 0.75, scale: 0.33, y: 0.375 }
		],
		notCrossData: { y: 0.825 }
	},

	{
		id: "network_connected_rotation",
		category: "network",
		expansion: "rotation",
		text: "It's <0>connected to a tile with rotation <1>",
		params: [
			{ type: "notstring", variable: true },
			{ type: "discrete", property: "rotation" },
		],
		layers: [
			{ type: "texture", key: "hint_base", frame: 27 },
			{ type: "texture", key: "hint_tile_type", frame: 9, rotationIndex: 1, x: 0.75, scale: 0.51, y: 0.375 } // empty tile with rotation icon, placed and rotated within hint
		],
		notCrossData: { y: 0.825 }
	},

	{
		id: "network_connected_symbol",
		category: "network",
		expansion: "symbols",
		text: "It's <0>connected to a tile with symbol <1>",
		params: [
			{ type: "notstring", variable: true },
			{ type: "discrete", property: "symbol" },
		],
		layers: [
			{ type: "texture", key: "hint_base", frame: 28 },
			{ type: "texture", key: "hint_symbols", list: SYMBOLS, index: 1, x: 0.75, scale: 0.5, y: 0.375 } // but this overlays the symbol sprite on an existing tile
		],
		notCrossData: { y: 0.825 }
	},

	{
		id: "network_connected_count",
		category: "network",
		text: "It's <0>connected to at least <1> non-empty tiles",
		params: [
			{ type: "notstring", variable: true },
			{ type: "discrete", property: "networkCount" },
		],
		layers: [
			{ type: "texture", key: "hint_base", frame: 29 },
			{ type: "texture", key: "hint_tile_type", frame: 12, y: 0.2, scale: 0.275 },
			{ type: "texture", key: "hint_tile_type", frame: 12, x: 0.8, scale: 0.275 },
			{ type: "texture", key: "hint_tile_type", frame: 12, y: 0.8, scale: 0.275 },
			{ type: "texture", key: "hint_tile_type", frame: 12, x: 0.2, scale: 0.275 },
		],
		notCrossData: { scale: 0.33 },
		layerCutoff: { index: 1, offset: 1 },
	},

	{
		id: "network_connection_count",
		category: "network",
		text: "It <0>has at least <1> network connections",
		params: [
			{ type: "notstring", variable: true },
			{ type: "discrete", property: "neighborCount" },
		],
		layers: [
			{ type: "texture", key: "hint_base", frame: 29 },
			{ type: "texture", key: "hint_tile_type", frame: 13, y: 0.2, scale: 0.275, rot: 3 },
			{ type: "texture", key: "hint_tile_type", frame: 13, x: 0.8, scale: 0.275, rot: 0 },
			{ type: "texture", key: "hint_tile_type", frame: 13, y: 0.8, scale: 0.275, rot: 1 },
			{ type: "texture", key: "hint_tile_type", frame: 13, x: 0.2, scale: 0.275, rot: 2 },
		],
		notCrossData: { scale: 0.33 },
		layerCutoff: { index: 1, offset: 1 },
	},

	{
		id: "network_connected_symbol_max",
		category: "network",
		expansion: "symbols",
		advanced: true,
		text: "The most occuring symbol in its network is <0>the <1>",
		params: [
			{ type: "notstring", variable: true },
			{ type: "discrete", property: "symbol" },
		],
		layers: [
			{ type: "texture", key: "hint_base", frame: 30 },
			{ type: "texture", key: "hint_symbols", list: SYMBOLS, index: 1, x: 0.75, scale: 0.5, y: 0.375 },
		],
		notCrossData: { y: 0.825 }
	},

	{
		id: "network_connected_type_max",
		category: "network",
		text: "The most occuring type in its network is <0>the <1>",
		advanced: true,
		params: [
			{ type: "notstring", variable: true },
			{ type: "discrete", property: "type" },
		],
		layers: [
			{ type: "texture", key: "hint_base", frame: 30 },
			{ type: "texture", key: "hint_tile_type", list: TILE_DICT, index: 1, x: 0.75, scale: 0.5, y: 0.375 },
		],
		notCrossData: { y: 0.825 }
	},
];

export {
	TILE_DICT,
	BEARINGS,
	QUADRANTS,
	SYMBOLS,
	DISCRETE_LISTS,
	BEARING_CONDITIONS,
	FIXED_MAP_TILES,
	HINT_CATEGORIES,
	HINT_DICT
}