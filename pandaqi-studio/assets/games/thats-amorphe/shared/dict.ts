const ICONS = { 
	name_this: { frame: 0, prob: 4 },
	reveal: { frame: 1, prob: 4 },
	rotate: { frame: 2, prob: 4 },
	bonus: { frame: 3, prob: 4 },
	duomorph: { frame: 4, prob: 2 },
	morph_this: { frame: 5, prob: 3 },
	verbinator: { frame: 6, prob: 3 },
	reverse_morph: { frame: 7, prob: 3 },
	skip: { frame: 8, prob: 1 },
	glue: { frame: 9, prob: 2 }
}

const ICONS_SPECIAL = {
	multinumber: { frame: 0, prob: 4 },
	riser: { frame: 1, prob: 2 },
	hand_word: { frame: 2, prob: 1 },
	score_penalty: { frame: 3, prob: 1.5 },
	same_letter: { frame: 4, prob: 2 },
	same_num_letters: { frame: 5, prob: 1 },
	inverted_score: { frame: 6, prob: 1.5 },
	face_up: { frame: 7, prob: 2 }
}

const ICONS_PICTURES = {
	add_line: { frame: 0, prob: 4 },
	add_line_self: { frame: 0, prob: 3 },
	bonus: { frame: 2, prob: 2 },
	reveal_unused: { frame: 3, prob: 2 },
	morph_this: { frame: 4, prob: 1.5, resize: 0.775 },
	morph_this_self: { frame: 5, prob: 1.5, resize: 0.775 },
	skip: { frame: 6, prob: 1 },
	actions_free: { frame: 7, prob: 1.5, resize: 0.7 },
	blind_morph: { frame: 8, prob: 3 }
}

export {
    ICONS,
    ICONS_SPECIAL,
    ICONS_PICTURES
}