import Color from "js/pq_games/layout/color/color"

export const KEEBBLE_LETTER_VALUES = 
{
    A: 1,
    B: 3,
    C: 3,
    D: 2,
    E: 1,
    F: 4,
    G: 2,
    H: 4,
    I: 1,
    J: 8,
    K: 5,
    L: 1,
    M: 3,
    N: 1,
    O: 1,
    P: 3,
    Q: 10,
    R: 1,
    S: 1,
    T: 1,
    U: 1,
    V: 4,
    W: 4,
    X: 8,
    Y: 4,
    Z: 10
}

export const REAL_LETTER_FREQS = 
{
    E: 0.111,
    A: 0.085,
    R: 0.076,
    I: 0.075,
    O: 0.072,
    T: 0.070,
    N: 0.067,
    S: 0.057,
    L: 0.055,
    C: 0.045,
    U: 0.036,
    D: 0.034,
    P: 0.032,
    M: 0.030,
    H: 0.030,
    G: 0.025,
    B: 0.021,
    F: 0.018,
    Y: 0.018,
    W: 0.013,
    K: 0.011,
    V: 0.010,
    X: 0.003,
    Z: 0.003,
    J: 0.002,
    Q: 0.002
}

export interface LetterData
{
    frame:number, 
    prob?:number,
    probFactor?:number,
    probCustom?:number,
    letters:string[],
    expansion?:string
}

export const LETTERS:Record<string,LetterData> = 
{
    joker: { frame: 0, prob: 1.0, letters: [null, null, null, null] }, 
    EMDW: { frame: 1, letters: ["E", "M", "D", "W"], probFactor: 1.5 },
    A_VK: { frame: 2, letters: ["A", null, "V", "K"] },
    R_TL: { frame: 3, letters: ["R", "T", null, "L"], probFactor: 2.0 },
    ISIS: { frame: 4, letters: ["I", "S", "I", "S"] },
    OOOO: { frame: 5, letters: ["O", "O", "O", "O"], probFactor: 0.75 },
    T_IK: { frame: 6, letters: ["T", null, "I", "K"] },
    NZNZ: { frame: 7, letters: ["N", "Z", "N", "Z"] },
    S_S_: { frame: 8, letters: ["S", null, "S", null] },
    LEM_: { frame: 9, letters: ["L", "E", "M", null] },
    CADU: { frame: 10, letters: ["C", "A", "D", "U"] }, // should be really prominent
    PODO: { frame: 11, letters: ["P", "O", "D", "O"] },
    M_WE: { frame: 12, letters: ["M", null, "W", "E"] },
    HIHI: { frame: 13, letters: ["H", "I", "H", "I"] },
    GADU: { frame: 14, letters: ["G", "A", "D", "U"] },
    BWEM: { frame: 15, letters: ["B", "W", "E", "M"] },
    J_F_: { frame: 16, letters: ["J", null, "F", null] },
    YCAD: { frame: 17, letters: ["Y", "C", "A", "D"] },
    XXXX: { frame: 18, letters: ["X", "X", "X", "X"], probFactor: 0.15 },
    QOOO: { frame: 19, letters: ["Q", "O", "O", "O"], probFactor: 0.15 },

    // expansion stuff => "toughLetters"
    SDSP: { frame: 20, letters: ["S", "D", "S", "P"], probFactor: 0.33, expansion: "toughLetters" },
    T_LP: { frame: 21, letters: ["T", null, "L", "P"], probFactor: 0.33, expansion: "toughLetters" },
    RD_E: { frame: 22, letters: ["R", "D", null, "E"], probFactor: 0.33, expansion: "toughLetters" },
    AGHE: { frame: 23, letters: ["A", "G", "H", "E"], probFactor: 0.33, expansion: "toughLetters" },
    cadu: { frame: 24, letters: ["C", "A", "D", "U"], probFactor: 0.66, expansion: "toughLetters" },
    P_E_: { frame: 25, letters: ["P", null, "E", null], probFactor: 0.5, expansion: "toughLetters" },
    TYEM: { frame: 26, letters: ["T", "Y", "E", "M"], probFactor: 0.66, expansion: "toughLetters" },
}

export const CELLS = 
{
    double_word: { frame: 0, prob: 2, desc: "Doubles the value of the letter inside (when scoring this turn)." },
    double_letter: { frame: 1, prob: 4, desc: "Doubles the value of all words that use this cell (when scoring this turn)." },
    thief: { frame: 2, prob: 4, desc: "At the end of your turn, refill your hand using another player's score pile." }, // refill your hand using another player's score pile
    destroyer: { frame: 3, prob: 2, desc: "Remove one domino from the board (immediately)." }, // remove one domino from the board (immediately)
    dictionary: { frame: 4, prob: 1, desc: "All words you create this turn must be valid." }, // all words you create this turn must be valid
    shield: { frame: 5, prob: 1, desc: "Invalid words (created this turn) do not give minus points." }, // invalid words you create this turn don't give minus points
    gift: { frame: 6, prob: 2, desc: "All <em>other</em> players must give one card from their score pile back to the draw pile" }, // all _other_ players must give one card from their score pile back to the draw pile
    rotate: { frame: 7, prob: 1, desc: "Rotate a domino that's fully visible any way you like." }, // rotate a domino that's fully visible any way you like
    detour: { frame: 8, prob: 2, desc: "You're allowed to move away from your straight line (when placing dominoes this turn)" }, // you're allowed to go outside of your straight line (when placing dominoes)
    // wall frame = 9; not pickable as a cell type
    x_ray: { frame: 10, prob: 2, desc: "When scoring, pretend walls, wildcards and empty spaces aren't there." }
}

export const DOMINO_COLORS = [
    new Color(86,100,83), new Color(171,80,79), 
    new Color(231,100,87), new Color(290,100, 81), 
    new Color(4,88,86)
];