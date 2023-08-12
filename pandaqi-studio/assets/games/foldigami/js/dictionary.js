const BASE_TYPES = 
{
    scroll: { frame: 0, bg: "#FFC8B0" },
    crown: { frame: 1, bg: "#FFF586" },
    dragon: { frame: 2, bg: "#EAFFB8" },
    arrow: { frame: 3, bg: "#FFB880" },
    bomb: { frame: 4, bg: "#FF9082" },
    twins: { frame: 5, bg: "#E497FF" },
    shield: { frame: 6, bg: "#CFEDFF" },
    sword: { frame: 7, bg: "#C8C8C8" },
    tiger: { frame: 8, bg: "#C8C8C8" },
    spy: { frame: 9, bg: "#75CDFF" },
    bird: { frame: 10, bg: "#FF9082" },
    tortoise: { frame: 11, bg: "#DFDFDF" },
    bear: { frame: 12, bg: "#FFB880" },
    joker: { frame: 13, bg: "#FFB767" },
}

const CELL_TYPES = 
{
    scroll: { num: { min: 1, max: 1 }, tutorial: "scroll", type: "required", skipEval: true },
    crown1: { num: { min: 1, max: 2 }, type: "objective", skipEval: true },
    crown2: { tutFrame: 21, num: { min: 2, max: 5 }, type: "objective", skipEval: true, needsSpy: true },
    crown3: { tutFrame: 23, num: { min: 2, max: 4 }, type: "objective", needsTeam: true, score: 6, difficulty: "hard", usesBlankSquares: true },
    
    dragon: { needsTeam: true, value: { min: 1, max: 3 }, type: "score" },
    
    arrow1: { needsTeam: true, type: "score", allowAllRotations: true, difficulty: "medium", usesBlankSquares: true },
    arrow2: { tutFrame: 16, type: "score", allowAllRotations: true, difficulty: "medium", dirDecidesTeam: true, usesBlankSquares: true },
    
    bomb: { type: "board", num: { min: 0, max: 3 }, skipEval: true },
    twins1: { needsTeam: true, keepTeamEachPick: true, numPerTeam: { min: 0, max: 1 }, numEachPick: 2, type: "score", score: 6 },
    twins2: { tutFrame: 17, type: "score", num: { min: 3, max: 7 }, score: 2 },
    
    shield1: { needsTeam: true, num: { min: 0, max: 1 }, type: "board", skipEval: true, needsSpy: true },
    shield2: { tutFrame: 19, type: "objective", needsTeam: true, num: { min: 0, max: 1 }, skipEval: true },

    sword: { needsTeam: true, type: "score", allowAllRotations: true, usesBlankSquares: true },
    tiger1: { num: { min: 3, max: 6 }, type: "score", needsSpy: true, difficulty: "medium" },
    tiger2: { tutFrame: 20, needsTeam: true, num: { min: 1, max: 5 }, type: "score", difficulty: "medium", score: 1, usesBlankSquares: true },
    
    spy: { needsTeam: true, num: { min: 1, max: 4 }, type: "board", skipEval: true, difficulty: "medium" },
    bird: { value: { min: 1, max: 3 }, type: "rotation", allowAllRotations: true, dirDecidesTeam: true },
    tortoise: { value: { min: 1, max: 3 }, type: "rotation" },
    
    bear1: { type: "rotation", needsSpy: true, difficulty: "hard" },
    bear2: { tutFrame: 18, type: "rotation", needsSpy: true, difficulty: "hard", usesBlankSquares: true },
    
    joker1: { needsTeam: true, value: { min: 1, max: 4 }, type: "board", skipEval: true },
    joker2: { tutFrame: 22, needsTeam: true, value: { min: 1, max: 4 }, type: "score" },
}

const TUTORIAL_DATA = 
{
    objective: { frame: 15 },
    foldAction: { frame: 14 }
}

export { CELL_TYPES, TUTORIAL_DATA, BASE_TYPES }