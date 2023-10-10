import Color from "js/pq_games/layout/color/color"

interface BonusData
{
    prob?: number,
    frame: number,
    singleSpace?: boolean,
    value?: number,
    once?: boolean,
    ability?: boolean
}

// value = how valuable one of this type is COMPARED to one point (that's the baseline bonus type)
const BONUSES:Record<string, BonusData> = 
{
    points: { frame: 0, prob: 2.33, singleSpace: true }, // you simply get X points
    balloons: { frame: 1, prob: 1.33, value: 1.66 }, // you get X balloons of a certain type
    inventory: { frame: 2, prob: 1, value: 1.25 }, // you may expand your inventory space by X
    swap: { frame: 3, prob: 1, value: 1.5 }, // you may swap X balloons from your inventory for another type

    // you may steal X balloons from another player
    abilitySteal: { frame: 4, prob: 0.5, once: true, ability: true, value: 2 }, 

    // you may complete trajectories even if there are no slots left
    abilityTrajectory: { frame: 5, prob: 1, once: true, ability: true, singleSpace: true }, 

    // you may claim a route already claimed by somebody else
    abilityShare: { frame: 6, prob: 1, once: true, ability: true, singleSpace: true }, 

    // you may teleport to any other city
    abilityTeleport: { frame: 7, prob: 1, once: true, ability: true, singleSpace: true }, 

    // you may steal one balloon from anybody moving over this route
    abilityStealRoute: { frame: 8, prob: 1, ability: true, singleSpace: true }, 

    // immediately take another turn
    abilityExtraTurn: { frame: 9, prob: 0.75, ability: true, singleSpace: true }
}

interface BlockData
{
    frame: number,
    color: string|Color,
    expansion?: string,
    unpickable?: boolean
}

const BLOCKS:Record<string,BlockData> = 
{
    red: { frame: 0, color: "#EE3230" },
    orange: { frame: 1, color: "#FD832D" },
    yellow: { frame: 2, color: "#FBEB47" },
    white: { frame: 3, color: "#FAFAFA" }, // slightly off-white because it looks less stark/harsh
    black: { frame: 4, color: "#222B28" }, 
    blue: { frame: 5, color: "#0BB3D0" },
    pink: { frame: 6, color: "#A9659E" },
    green: { frame: 7, color: "#91C846" },

    // this is never automatically picked for blocks; added manually to make sure they appear
    // but they are linked: GRAY is for tracks (no icon, gray color); WILDCARD is for bonuses (icon; no color)
    // the code automatically converts one to the other where needed
    // not completely clean, but it's fine
    wildcard: { frame: 8, color: "??", unpickable: true },
    gray: { frame: 9, color: "#C8D2D8", unpickable: true }
}

export
{
    BONUSES,
    BLOCKS
}