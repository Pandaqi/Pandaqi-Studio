
const SPECIAL_CARDS =
{
    discard: { frame: 0, freq: 1, desc: "<b>When Paired</b>: Discard 1 card." },
    draw: { frame: 1, freq: 1, desc: "<b>When Thrown</b>: Draw 1 card." },
    instaplay: { frame: 2, freq: 1, desc: "<b>When Drawn</b>: Immediately play this card." },
    move: { frame: 3, freq: 1, desc: "<b>When Paired</b>: Move 1 card to any new spot (adjacent to the map)." },
    notes_match_penalty: { frame: 4, freq: 1, desc: "<b>When Thrown</b>: If you threw me because of matching music notes, draw 2 new cards." },
    reveal_to_all: { frame: 5, freq: 1, desc: "<b>When Drawn</b>: Show me to everyone." }, 

    play_again: { frame: 6, freq: 1, desc: "<b>When Paired</b>: Play another card of a different color." },
    notes_match_forbid: { frame: 7, freq: 1, desc: "<b>When Thrown</b>: You may never throw me because I fit within a Range." },
    swap_map: { frame: 8, freq: 1, desc: "<b>When Drawn</b>: Swap 3 cards from your hand with cards from the map." },
    remove_cards: { frame: 9, freq: 1, desc: "<b>When Paired</b>: Remove up to 3 cards from the map." },
    wildcard_throw: { frame: 10, freq: 1, desc: "<b>When Thrown</b>: You may throw me whenever it would normally <b>not</b> be allowed." },
    hand_match_penalty: { frame: 11, freq: 1, desc: "<b>When Drawn</b>: If I have the same color as the last card played, draw another card." },

    wildcard_pair: { frame: 12, freq: 1, desc: "<b>When Paired</b>: I can pair with cards of a different color, but <b>not</b> the wildcard (if included)." },
    cant_throw: { frame: 13, freq: 1, desc: "<b>When Thrown</b>: You can't give me away if you have 3 cards left (or fewer)." },
    hand_match_note_penalty: { frame: 14, freq: 1, desc: "<b>When Drawn</b>: If I have the same number of music notes as the last card played, draw another card." },
    score_double_worst: { frame: 15, freq: 1, desc: "<b>When Scored</b>: I'm worth double the value of your worst-scoring card." },
    score_minus_conditional: { frame: 16, freq: 1, desc: "<b>When Scored</b>: I'm worth 10 minus points, if this is the color you have the most (at the end)." },
    throw_other_colors: { frame: 17, freq: 1, desc: "<b>When Paired</b>: Players may also throw cards of other colors at you (within the Range you created)." },
 
    safety_rule_disable: { frame: 18, freq: 1, desc: "<b>When Paired</b>: The \"Safesong\" rule (if the Distance is big enough) doesn't apply." },
    range_limit: { frame: 19, freq: 1, desc: "<b>When Paired</b>: You can't create a Range smaller than 4." },
    distance_limit: { frame: 20, freq: 1, desc: "<b>When Paired</b>: You can't create a Distance larger than 2." },
}

const TEMPLATES = 
{
    yellow: { frame: 0, written: "Yellow" },
    red: { frame: 1, written: "Red" },
    blue: { frame: 2, written: "Blue" },
    purple: { frame: 3, written: "Purple" },
    note: { frame: 4 },
    special_bg: { frame: 5 }
}

export {
    SPECIAL_CARDS,
    TEMPLATES
};

