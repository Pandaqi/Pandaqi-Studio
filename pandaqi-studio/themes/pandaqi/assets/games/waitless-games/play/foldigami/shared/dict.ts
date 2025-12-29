export const BASE_TYPES = 
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

interface CellTypeData
{
    num?: { min: number, max: number },
    tutorial?: string,
    type?: string,
    skipEval?: boolean,
    tutFrame?: number,
    prob?: number,
    needsTeam?: boolean,
    value?: { min: number, max: number },
    allowAllRotations?: boolean,
    keepTeamEachPick?: boolean,
    difficulty?: string,
    usesBlankSquares?: true,
    needsSpy?: boolean,
    score?: number,
    numPerTeam?: { min: number, max: number },
    numEachPick?: number,
    dirDecidesTeam?: boolean,
    ignore?:boolean,
    id?:string,
    hasMultiple?:boolean,
    frame?: number
}

export const CELL_TYPES:Record<string,CellTypeData> = 
{
    scroll: { num: { min: 1, max: 1 }, tutorial: "scroll", type: "required", skipEval: true },
    crown1: { num: { min: 1, max: 2 }, type: "objective", skipEval: true, prob: 0.1 },
    crown2: { tutFrame: 21, num: { min: 2, max: 5 }, type: "objective", skipEval: true, needsSpy: true, prob: 0.2 },
    crown3: { tutFrame: 23, num: { min: 2, max: 4 }, type: "objective", needsTeam: true, score: 6, difficulty: "hard", usesBlankSquares: true, prob: 1 },
    
    dragon: { needsTeam: true, value: { min: 1, max: 3 }, type: "score", prob: 2 },
    
    arrow1: { needsTeam: true, type: "score", allowAllRotations: true, difficulty: "medium", usesBlankSquares: true, prob: 0.66 },
    arrow2: { tutFrame: 16, type: "score", allowAllRotations: true, difficulty: "medium", dirDecidesTeam: true, usesBlankSquares: true, prob: 0.33 },
    
    bomb: { type: "board", num: { min: 0, max: 3 }, skipEval: true, prob: 0.75 },
    twins1: { needsTeam: true, keepTeamEachPick: true, numPerTeam: { min: 0, max: 1 }, numEachPick: 2, type: "score", score: 6, prob: 0.66 },
    twins2: { tutFrame: 17, type: "score", num: { min: 3, max: 7 }, score: 2, prob: 1.33, needsTeam: true },
    
    shield1: { needsTeam: true, numPerTeam: { min: 0, max: 1 }, numEachPick: 1, type: "board", skipEval: true, needsSpy: true, prob: 1.0 },
    shield2: { tutFrame: 19, type: "objective", needsTeam: true, numEachPick: 1, numPerTeam: { min: 0, max: 1 }, skipEval: true, prob: 0.3 },

    sword: { needsTeam: true, type: "score", allowAllRotations: true, usesBlankSquares: true, prob: 1.5 },
    tiger1: { num: { min: 3, max: 6 }, type: "score", needsSpy: true, difficulty: "medium", prob: 0.5 },
    tiger2: { tutFrame: 20, needsTeam: true, num: { min: 1, max: 5 }, type: "score", difficulty: "medium", score: 1, usesBlankSquares: true, prob: 1.2 },
    
    spy: { needsTeam: true, num: { min: 1, max: 4 }, type: "board", skipEval: true, difficulty: "medium", prob: 1 },
    bird: { value: { min: 1, max: 3 }, type: "rot", allowAllRotations: true, dirDecidesTeam: true, prob: 1.75 },
    tortoise: { value: { min: 1, max: 3 }, type: "rot", prob: 1.33 },
    
    bear1: { type: "rot", needsSpy: true, difficulty: "hard", prob: 0.1 },
    bear2: { tutFrame: 18, type: "rot", needsSpy: true, difficulty: "hard", usesBlankSquares: true, prob: 0.75 },
    
    joker1: { needsTeam: true, value: { min: 1, max: 4 }, type: "board", skipEval: true, prob: 0.5 },
    joker2: { tutFrame: 22, needsTeam: true, value: { min: 1, max: 4 }, type: "score", prob: 0.25 },
}

export const TUTORIAL_DATA = 
{
    objective: { frame: 15 },
    foldAction: { frame: 14 }
}