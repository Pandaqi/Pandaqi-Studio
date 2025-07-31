export const KEEBBLE_TYPES = 
{
    start: { frame: 0, prob: 0, col: "#FCFFC5" },
    doubleWord: { frame: 1, prob: 1, expansion: "specialCells", col: "#BCF484", knickknack: true, humanName: "Double Word", desc: "Doubles the value of the first word that uses it." },
    tripleWord: { frame: 2, prob: 0.5, expansion: "specialCells", col: "#BCF484", knickknack: true, humanName: "Triple Word", desc: "Triples the value of the first word that uses it." },
    doubleLetter: { frame: 3, prob: 2, expansion: "specialCells", col: "#A2FFCD", knickknack: true, humanName: "Double Letter", desc: "Doubles the value of the letter inside." },
    tripleLetter: { frame: 4, prob: 1.5, expansion: "specialCells", col: "#A2FFCD", knickknack: true, humanName: "Triple Letter", desc: "Triples the value of the letter inside." },
    bigAsk: { frame: 5, prob: 0.5, expansion: "cellDance", col: "#98DDFF", desc: "You can name <em>six letters</em> at the end of this turn (instead of the usual two)." },
    thief: { frame: 6, prob: 2.0, expansion: "cellDance", col: "#CEC3FF", desc: "Steal a letter from another player. (They cross it out; you add it to your hand.)" },
    destroyer: { frame: 7, prob: 1.0, expansion: "cellDance", col: "#FFCFDA", desc: "Cross out two cells on the board. They are unusable and mean nothing until the end of the game." },
    goAgain: { frame: 8, prob: 2.0, expansion: "cellDance", col: "#9AFF9D", desc: "Once this turn is done, immediately take another one!" },
    garbage: { frame: 9, prob: 1.5, expansion: "cellDance", col: "#FFCFDA", desc: "Everyone removes the letter placed on this cell from their hand. (Example: if you placed an A on this square, everybody loses all their \"A\"s.)" },
    blockade: { frame: 10, prob: 1.5, expansion: "cellDance", col: "#CEC3FF", desc: "Place at most 3 letters from your hand in empty cells. They don't score any points, but they also don't need to form valid words ..." },
    collector: { frame: 11, prob: 2.0, expansion: "cellDance", col: "#FFCAA0", desc: "This turn, you may exceed the hand limit." },
    wall: { frame: 12, prob: 0.0, expansion: "none", col: "#000000" }
}

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