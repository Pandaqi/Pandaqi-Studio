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
    guitarist: { frame: 0, label: "Guitarist", desc: "Worth <b>+1 point</b>.", type: ActionType.SCORE_PLUS, prob: 2.5 },
    ballerina: { frame: 1, label: "Ballerina", desc: "Worth <b>+3 points</b>, if you have at least 3.", type: ActionType.SCORE_PLUS },
    soccer: { frame: 2, label: "Athlete", desc: "Worth as many points as <b>how many you have</b> (of this type).", type: ActionType.SCORE_PLUS, maxAbs: 8, minAbs: 4 },
    baby: { frame: 3, label: "Baby", desc: "Worth as many points as your <b>lowest scoring type</b>.", type: ActionType.SCORE_BOTH },
    oldman: { frame: 4, label: "Elderly Man", desc: "Worth as many points as your <b>highest scoring type</b>.", type: ActionType.SCORE_BOTH },
    oldwoman: { frame: 5, label: "Knitting Lady", desc: "Worth <b>+3 points</b> if you <b>have the least</b> (out of all players), otherwise <b>-3</b>.", type: ActionType.SCORE_BOTH, minAbs: 5 },
    explorer: { frame: 6, label: "Explorer", desc: "Worth <b>+4 points</b> if you <b>have the most</b> (out of all players), otherwise <b>-4</b>.", type: ActionType.SCORE_BOTH, minAbs: 5 },
    veterinarian: { frame: 7, label: "Veterinarian", desc: "Worth <b>+2 points</b>.", type: ActionType.SCORE_PLUS, prob: 1.33 }, // make less frequent than guitarist
}

const ADVANCED_SET:ActionSet = 
{
    astronaut: { frame: 0, label: "Astronaut", desc: "Worth <b>+5 points</b>. You may only grab this type <b>once</b>.", type: ActionType.SCORE_PLUS, maxAbs: 3 }, // appears very infrequently to give players a sense of urgency---might not be the right play, but we'll see
    doctor: { frame: 1, label: "Doctor", desc: "Worth <b>+1 point</b>. The Repel rule does <b>not</b> apply to this type until you have 3 (or more).", type: ActionType.SCORE_PLUS, maxAbs: 8 },
    firefighter: { frame: 2, label: "Firefighter", desc: "Worth <b>-2 points</b>, but you may pick 3 squares this turn.", type: ActionType.ACTION },
    police: { frame: 3, label: "Police", desc: "Worth <b>-2 points</b>. Pick another square this turn while ignoring the Repel rule.", type: ActionType.ACTION },
    baker: { frame: 4, label: "Baker", desc: "Worth <b>+5 points</b> if you have 3 (or more), otherwise <b>-15</b>.", type: ActionType.SCORE_BOTH, minAbs: 5, maxAbs: 14 },
    judge: { frame: 5, label: "Judge", desc: "Worth <b>+3 points</b> if you have only <b>one</b>, otherwise <b>-3</b>.", type: ActionType.SCORE_BOTH, minAbs: 6 },
    king: { frame: 6, label: "King", desc: "Worth <b>+12 points</b>. Once taken, however, you <b>never</b> take another turn.", type: ActionType.SCORE_PLUS, maxAbs: 3 }, // only appears VERY infrequently, of course
    mail: { frame: 7, label: "Mail Carrier", desc: "Worth <b>+2 points</b>. You may only pick this if an <b>adjacent square was already picked</b>.", type: ActionType.SCORE_PLUS, maxAbs: 8 },
}



const EXPERT_SET:ActionSet = 
{
    painter: { frame: 0, label: "Painter", desc: "Worth <b>+2 points</b> for every square of this type that is <b>not</b> crossed out.", type: ActionType.SCORE_PLUS, minAbs: 4, maxAbs: 10 },
    photographer: { frame: 1, label: "Photographer", desc: "Worth <b>+1 point</b> for every square of this type that is <b>crossed out</b>.", type: ActionType.SCORE_PLUS, minAbs: 2, maxAbs: 7 },
    hairdresser: { frame: 2, label: "Hairdresser", desc: "Worth <b>+1 point</b> for every <b>row</b> (horizontal) that's completely crossed out.", type: ActionType.SCORE_PLUS },
    lifeguard: { frame: 3, label: "Life Guard", desc: "Worth <b>+2 points</b> for every <b>column</b> (vertical) that's completely crossed out.", type: ActionType.SCORE_PLUS },
    actress: { frame: 4, label: "Actress", desc: "Worth <b>+5 points</b> if both main diagonals of the board are completely crossed out, otherwise <b>-5</b>", type: ActionType.SCORE_BOTH, maxAbs: 5 },
    singer: { frame: 5, label: "Singer", desc: "Worth <b>-6 points</b>. Once crossed out, <b>nobody</b> may pick an <b>adjacent square</b>.", type: ActionType.SCORE_MIN, maxAbs: 3, prob: 0.75 }, // low max, otherwise it locks the board way too much
    taxi_driver: { frame: 6, label: "Taxi Driver", desc: "Worth <b>-3 points</b>, but you may <b>remove</b> up to 3 icons from <b>any inventory</b>.", type: ActionType.ACTION, maxAbs: 4, prob: 0.75 }, // low max, otherwise too powerful
    pilot: { frame: 7, label: "Pilot", desc: "Worth <b>-2 points</b>. Pick <b>another square</b> in the same row or column (ignoring all other rules).", type: ActionType.ACTION, maxAbs: 7, prob: 1.33 },
}


const SETS:Record<string, ActionSet> = 
{
    base: BASE_SET,
    advanced: ADVANCED_SET,
    expert: EXPERT_SET
}

const MISC =
{
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
