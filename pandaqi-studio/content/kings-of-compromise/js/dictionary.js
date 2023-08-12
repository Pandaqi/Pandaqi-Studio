const ACTION_TYPES = ['add', 'remove', 'swap'];
const CATEGORIES = ['tile', 'creature', 'structure', 'nature', 'owner'];

const TILE_DATA = {
	"grass": { 
		"slots": {
			"creature": 1,
			"structure": 1,
			"nature": 1,
			"owner": 1
		},
		"slot_order": ["creature", "structure", "nature"]
	},

	"water": {
		"slots": {
			"creature": 1,
			"structure": 1,
			"nature": 1,
			"owner": 1
		},
		"slot_order": ["creature", "structure", "nature"]
	},

	"desert": {
		"slots": {
			"creature": 1,
			"structure": 1,
			"nature": 1,
			"owner": 1
		},
		"slot_order": ["creature", "structure", "nature"]
	},

	"mountain": {
		"slots": {
			"creature": 1,
			"structure": 1,
			"nature": 1,
			"owner": 1
		},
		"slot_order": ["creature", "structure", "nature"]
	},
}

// @TODO: actually fill in all (correct) values
// @TODO: remove player numbers from "owner" list that aren't in the game
const ELEMENTS = {
	"tile": ["grass", "water", "desert", "mountain"],
	"creature": ['elf', 'dwarf', 'unicorn', 'dragon'],
	"structure": ['farm', 'school', 'house', 'castle'],
	"nature": ["tree"],
	"owner": [1,2,3,4,5,6],
}

// The physicsl limit to how much material we have per category, per type within that category
const MATERIALS = {
	"tile": 5,
	"creature": 5,
	"structure": 5,
	"nature": 5
}

const HINTS = [];