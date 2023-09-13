const KEEBBLE_TYPES = {
    start: { frame: 0, prob: 0, col: 0xFCFFC5 },
    doubleWord: { frame: 1, prob: 1, expansion: "specialCells", col: 0xBCF484, knickknack: true, humanName: "Double Word" },
    tripleWord: { frame: 2, prob: 0.5, expansion: "specialCells", col: 0xBCF484, knickknack: true, humanName: "Triple Word" },
    doubleLetter: { frame: 3, prob: 2, expansion: "specialCells", col: 0xA2FFCD, knickknack: true, humanName: "Double Letter" },
    tripleLetter: { frame: 4, prob: 1.5, expansion: "specialCells", col: 0xA2FFCD, knickknack: true, humanName: "Triple Letter" },
    bigAsk: { frame: 5, prob: 0.5, expansion: "cellDance", col: 0x98DDFF },
    thief: { frame: 6, prob: 2.0, expansion: "cellDance", col: 0xCEC3FF },
    destroyer: { frame: 7, prob: 1.0, expansion: "cellDance", col: 0xFFCFDA },
    goAgain: { frame: 8, prob: 2.0, expansion: "cellDance", col: 0x9AFF9D },
    garbage: { frame: 9, prob: 1.5, expansion: "cellDance", col: 0xFFCFDA },
    blockade: { frame: 10, prob: 1.5, expansion: "cellDance", col: 0xCEC3FF },
    collector: { frame: 11, prob: 2.0, expansion: "cellDance", col: 0xFFCAA0 },
    wall: { frame: 11, prob: 0.0, expansion: "none", col: 0x000000 } //@TODO: why on earth do I need to subtract 1 from the frame here?
}

const KEEBBLE_LETTER_VALUES = {
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

export {
    KEEBBLE_TYPES,
    KEEBBLE_LETTER_VALUES
}