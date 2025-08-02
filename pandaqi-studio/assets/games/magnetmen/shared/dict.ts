enum ActionType
{
    SCORE_PLUS,
    SCORE_MIN,
    SCORE_BOTH,
    ACTION
}

export interface ActionData
{
    frame?: number,
    label?: string,
    desc?: string|string[],
    type?: ActionType,
    prob?: number, // default is 1
    minAbs?: number,
    maxAbs?: number,
    textureKey?: string, // filled in automatically upon loading (based on set name)
}

export const MISC =
{
    points: { frame: 0 },
    corner_magnet: { frame: 1 }
    // @TODO
}

export const pIcon = '<img id="misc" frame="' + MISC.points.frame + '">';

export type ActionSet = Record<string, ActionData>;
export const BASE_SET:ActionSet = 
{
    guitarist: { frame: 0, label: "Guitarist", desc: "Worth <b>+1 " + pIcon + "</b>.", type: ActionType.SCORE_PLUS, prob: 2.5 },
    ballerina: { frame: 1, label: "Ballerina", desc: "Worth <b>+4 " + pIcon + "</b> if you <b>have the most</b> (out of all players), otherwise <b>-4</b>.", type: ActionType.SCORE_BOTH, minAbs: 4 },
    soccer: { frame: 2, label: "Athlete", desc: "Worth as many " + pIcon + " as <b>how many you have</b> (of this type).", type: ActionType.SCORE_PLUS, maxAbs: 8, minAbs: 4 },
    baby: { frame: 3, label: "Baby", desc: "Worth as many " + pIcon + " as your <b>lowest scoring type</b>.", type: ActionType.SCORE_BOTH },
    oldman: { frame: 4, label: "Elderly Man", desc: "Worth as many " + pIcon + " as your <b>highest scoring type</b>.", type: ActionType.SCORE_BOTH },
    oldwoman: { frame: 5, label: "Knitting Lady", desc: "Worth <b>+3 " + pIcon + "</b> if you <b>have the least</b> (out of all players), otherwise <b>-3</b>.", type: ActionType.SCORE_BOTH, minAbs: 5 },
    explorer: { frame: 6, label: "Explorer", desc: "When picked, <b>destroy</b> any square. (Make unrecognizable; it's not on the board anymore.)", type: ActionType.ACTION, minAbs: 5, prob: 1.33 },
    veterinarian: { frame: 7, label: "Veterinarian", desc: "Worth <b>+2 " + pIcon + "</b>.", type: ActionType.SCORE_PLUS, prob: 1.33 }, // make less frequent than guitarist
}

export const ADVANCED_SET:ActionSet = 
{
    astronaut: { frame: 0, label: "Astronaut", desc: ["Worth <b>+1 " + pIcon + "</b>. Ignore all <b>crossed out</b> icons when applying the Repel rule to this type.", "Worth <b>+1 " + pIcon + "</b>. Ignore all <b>non-crossed out</b> icons when applying the Repel rule to this type."], type: ActionType.SCORE_PLUS },
    doctor: { frame: 1, label: "Doctor", desc: ["Worth <b>+1 " + pIcon + "</b>. The Repel rule does <b>not</b> apply to this type until you have 3 (or more).", "Worth <b>+2 " + pIcon + "</b>. The Repel rule does only applies to this type while you have fewer than 3."], type: ActionType.SCORE_PLUS, maxAbs: 8 },
    firefighter: { frame: 2, label: "Firefighter", desc: ["Worth <b>-4 " + pIcon + "</b>, but you may pick 3 squares this turn. You can't pick another Firefighter.", "Worth <b>-2 " + pIcon + "</b>. Pick another square this turn while ignoring the Repel rule."], type: ActionType.ACTION },
    police: { frame: 3, label: "Police", desc: "Worth <b>+3 " + pIcon + ".</b> Can be picked <b>twice</b>. After the second time, <b>destroy</b> the square.", type: ActionType.ACTION },
    baker: { frame: 4, label: "Baker", desc: "Worth <b>+5 " + pIcon + "</b> if you have 3(+) of this type, otherwise <b>-15</b>.", type: ActionType.SCORE_BOTH, minAbs: 5, maxAbs: 14 },
    judge: { frame: 5, label: "Judge", desc: ["Worth <b>+3 " + pIcon + "</b> if you have 1, otherwise <b>-3</b>. <b>Can't be destroyed!</b>", "Worth <b>+4 " + pIcon + "</b> if you have 2, otherwise <b>-4</b>. <b>Can't be destroyed!</b>"], type: ActionType.SCORE_BOTH, minAbs: 6, prob: 1.25 }, // @NOTE: The "can't be destroyed" is necessary, otherwise people circumvent this exact target by just ... destroying the square (or some random other square) on each turn.
    king: { frame: 6, label: "King", desc: ["Worth <b>+12 " + pIcon + "</b>. Once taken, however, you <b>never</b> take another turn.", "Worth <b>+6 " + pIcon + "</b>. You may only grab this type <b>once</b>, then never grab an adjacent square again."], type: ActionType.SCORE_PLUS, maxAbs: 3 }, // only appears VERY infrequently, of course
    mail: { frame: 7, label: "Mail Carrier", desc: ["Worth <b>+2 " + pIcon + "</b>. You may only pick this if an <b>adjacent square is crossed out.</b>.", "Worth <b>+3 " + pIcon + "</b>. You may only pick this if <b>no adjacent square</b> is crossed out."], type: ActionType.SCORE_PLUS, maxAbs: 8 },
}

export const EXPERT_SET:ActionSet = 
{
    painter: { frame: 0, label: "Painter", desc: "Worth <b>+2 " + pIcon + "</b> for every square of this type that is <b>not</b> crossed out.", type: ActionType.SCORE_PLUS, minAbs: 4, maxAbs: 10 },
    photographer: { frame: 1, label: "Photographer", desc: "Worth <b>+1 " + pIcon + "</b> for every square of this type that is <b>crossed out</b>.", type: ActionType.SCORE_PLUS, minAbs: 2, maxAbs: 7 },
    hairdresser: { frame: 2, label: "Hairdresser", desc: ["Worth <b>+1 " + pIcon + "</b> for every <b>row / column</b> that's completely crossed out.", "Worth <b>+3 " + pIcon + "</b> for every row / column that has <b>no</b> destroyed squares."], type: ActionType.SCORE_PLUS },
    lifeguard: { frame: 3, label: "Life Guard", desc: ["Worth <b>+3 " + pIcon + "</b>. You can't pick this if your left neighbor can't pick it.", "Worth <b>+3 " + pIcon + "</b>. You can't pick this if your right neighbor can't pick it."], type: ActionType.SCORE_PLUS },
    actress: { frame: 4, label: "Actress", desc: ["The player(s) currently in the lead must destroy one icon from their collection.", "The player(s) currently in last place get any icon they want (in their collection)."], type: ActionType.ACTION, maxAbs: 5 },
    singer: { frame: 5, label: "Singer", desc: ["Worth <b>-5 " + pIcon + "</b>. Once crossed out, <b>nobody</b> may pick an <b>adjacent square</b>.", "Worth <b>-3 " + pIcon + "</b>, but you may <b>destroy</b> up to 2 icons from <b>any inventory</b>."], type: ActionType.SCORE_MIN, maxAbs: 4, prob: 0.75 }, // low max, otherwise it locks the board way too much / too powerful
    taxi_driver: { frame: 6, label: "Taxi Driver", desc: "Worth as many " + pIcon + " as the <b>number</b> of adjacent squares that are <b>crossed out</b>.", type: ActionType.SCORE_PLUS }, 
    pilot: { frame: 7, label: "Pilot", desc: "Worth <b>-2 " + pIcon + "</b>. Pick <b>another square</b> in the same row or column (ignoring all rules).", type: ActionType.ACTION, maxAbs: 7, prob: 1.33 },
}

// The old ballerina action is just a worse Baker, so probably just keep it out => "Worth <b>+3 points</b>, if you have at least 3."
// Too hard to explain, too meh: "Worth <b>+5 " + pIcon + "</b> if both main diagonals of the board are completely crossed out, otherwise <b>-5</b>"

export const SETS:Record<string, ActionSet> = 
{
    base: BASE_SET,
    advanced: ADVANCED_SET,
    expert: EXPERT_SET
}
