enum ActionType
{
    SCORE_PLUS,
    SCORE_MIN,
    SCORE_BOTH,
    ACTION
}

interface ActionData
{
    frame?: number,
    label?: string,
    desc?: string,
    type?: ActionType,
    prob?: number, // default is 1
    minAbs?: number,
    maxAbs?: number,
    textureKey?: string, // filled in automatically upon loading (based on set name)
}

type ActionSet = Record<string, ActionData>;
const BASE_SET:ActionSet = 
{
    guitarist: { frame: 0, label: "Guitarist", desc: "Worth +1 point.", type: ActionType.SCORE_PLUS, prob: 2.5 },
    ballerina: { frame: 1, label: "Ballerina", desc: "Worth +3 points, if you have at least 3.", type: ActionType.SCORE_PLUS },
    soccer: { frame: 2, label: "Athlete", desc: "Worth as many points as how many you have (of this type).", type: ActionType.SCORE_PLUS, maxAbs: 8, minAbs: 4 },
    baby: { frame: 3, label: "Baby", desc: "Worth as many points as your LOWEST scoring type.", type: ActionType.SCORE_BOTH },
    oldman: { frame: 4, label: "Elderly Man", desc: "Worth as many points as your HIGHEST scoring type.", type: ActionType.SCORE_BOTH },
    oldwoman: { frame: 5, label: "Knitting Lady", desc: "Worth +3 points if you have the least (out of all players), otherwise -3.", type: ActionType.SCORE_BOTH, minAbs: 5 },
    explorer: { frame: 6, label: "Explorer", desc: "Worth +4 points if you have the most (out of all players), otherwise -4.", type: ActionType.SCORE_BOTH, minAbs: 5 },
    veterinarian: { frame: 7, label: "Veterinarian", desc: "Worth +2 points", type: ActionType.SCORE_PLUS, prob: 1.33 }, // make less frequent than guitarist
}

const ADVANCED_SET:ActionSet = 
{
    astronaut: { frame: 0, label: "Astronaut", desc: "Worth +5 points. You may only grab this type ONCE.", type: ActionType.SCORE_PLUS, maxAbs: 3 }, // appears very infrequently to give players a sense of urgency---might not be the right play, but we'll see
    doctor: { frame: 1, label: "Doctor", desc: "Worth +1 point. The Repel rule does NOT apply to this type.", type: ActionType.SCORE_PLUS, maxAbs: 8 },
    firefighter: { frame: 2, label: "Firefighter", desc: "Worth -2 points, but you may pick 3 squares this turn.", type: ActionType.ACTION },
    police: { frame: 3, label: "Police", desc: "Worth -2 points, but pick another square this turn while ignoring the Repel rule.", type: ActionType.ACTION },
    baker: { frame: 4, label: "Baker", desc: "Worth +5 points if you have 3 (or more), otherwise -15.", type: ActionType.SCORE_BOTH, minAbs: 5, maxAbs: 14 },
    judge: { frame: 5, label: "Judge", desc: "Worth +3 points if you have only ONE, otherwise -3.", type: ActionType.SCORE_BOTH, minAbs: 6 },
    king: { frame: 6, label: "King", desc: "Worth +12 points. Once taken, however, you never take another turn.", type: ActionType.SCORE_PLUS, maxAbs: 3 }, // only appears VERY infrequently, of course
    mail: { frame: 7, label: "Mail Carrier", desc: "Worth +2 points. You may only pick this if an adjacent square has already been picked.", type: ActionType.SCORE_PLUS, maxAbs: 8 },
}


// Options: (architect), (tailor), queen (too similar king), flycatcher (too out-there)
// Options: cat, dog, dragon, gnome
// Options: student, gardener

const EXPERT_SET:ActionSet = 
{
    painter: { frame: 0, label: "Painter", desc: "Worth +2 points for every square of this type that is NOT crossed out.", type: ActionType.SCORE_PLUS, minAbs: 4, maxAbs: 10 },
    photographer: { frame: 1, label: "Photographer", desc: "Worth +1 point for every square of this type that is crossed out.", type: ActionType.SCORE_PLUS, minAbs: 2, maxAbs: 7 },
    hairdresser: { frame: 2, label: "Hairdresser", desc: "Worth +1 point for every ROW (horizontal) that's completely crossed out.", type: ActionType.SCORE_PLUS },
    lifeguard: { frame: 3, label: "Life Guard", desc: "Worth +2 points for every COLUMN (vertical) that's completely crossed out.", type: ActionType.SCORE_PLUS },
    actress: { frame: 4, label: "Actress", desc: "Worth +5 points if both main diagonals of the board are completely crossed out, otherwise -5", type: ActionType.SCORE_BOTH, maxAbs: 5 },
    singer: { frame: 5, label: "Singer", desc: "Worth -6 points. Once crossed out, nobody may pick an adjacent square.", type: ActionType.SCORE_MIN, maxAbs: 3, prob: 0.75 }, // low max, otherwise it locks the board way too much
    taxi_driver: { frame: 6, label: "Taxi Driver", desc: "Worth -3 points, but you may remove up to 3 icons from any inventory.", type: ActionType.ACTION, maxAbs: 4, prob: 0.75 }, // low max, otherwise too powerful
    pilot: { frame: 7, label: "Pilot", desc: "Worth -2 points, but you may pick any square in the same row/column (ignoring all other rules).", type: ActionType.ACTION, maxAbs: 7, prob: 1.33 },
}


const SETS:Record<string, ActionSet> = 
{
    base: BASE_SET,
    advanced: ADVANCED_SET,
    expert: EXPERT_SET
}

const MISC =
{
    spyglass: { frame: 0 },
    suspect: { frame: 1 },

    // @TODO
}

export 
{
    ActionData,
    SETS,
    BASE_SET,
    ADVANCED_SET,
    EXPERT_SET,
    MISC
}
