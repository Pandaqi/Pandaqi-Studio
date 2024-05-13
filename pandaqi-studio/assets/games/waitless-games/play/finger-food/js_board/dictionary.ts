import Point from "js/pq_games/tools/geometry/point"

const INGREDIENTS = {
    // low-level
    flour: { frame: 0, colorGroup: "red", prob: 1.25 },
    butter: { frame: 1, colorGroup: "yellow", power: 2 },
    sugar: { frame: 2, colorGroup: "blue", power: 1, prob: 1.5 },
    egg: { frame: 3, colorGroup: "red", power: 1, prob: 1.5, timerRelevant: true },
    water: { frame: 4, colorGroup: "blue", forbiddenIngredients: ["salt"] }, // these are similar, so never add both
    salt: { frame: 5, colorGroup: "white", power: 1, forbiddenIngredients: ["water"] },

    // mid-level
    chocolate: { frame: 6, colorGroup: "red", power: 1, prob: 1.5, timerRelevant: true },
    milk: { frame: 7, colorGroup: "blue", timerRelevant: true },
    sprinkles: { frame: 8, colorGroup: "pink", prob: 0.66, timerRelevant: true },
    cream: { frame: 9, colorGroup: "white", power: 1, min: 3, prob: 1.2, timerRelevant: true },
    bread: { frame: 10, colorGroup: "red", power: 2 },

    // high-level
    pie: { frame: 11, colorGroup: "yellow", prob: 0.35 },
    cake: { frame: 12, colorGroup: "pink", power: 1, max: 3, prob: 0.75, timerRelevant: true },
    cookie: { frame: 13, colorGroup: "red", max: 3, power: 2, prob: 0.5, timerRelevant: true },
    smoothie: { frame: 14, colorGroup: "pink", power: 1, minUniqueTypesRequired: 5 },
    baguette: { frame: 15, colorGroup: "yellow", power: 2, prob: 1.25, max: 3 },
    croissant: { frame: 16, colorGroup: "red", power: 2, requiredExpansions: ["machines"], prob: 1.5 },
    cupcake: { frame: 17, colorGroup: "blue", power: 1, requiredExpansions: ["machines"], prob: 1.75, timerRelevant: true },
    brownie: { frame: 18, colorGroup: "red", requiredExpansions: ["machines"], prob: 1.25 },
    cheesecake: { frame: 19, colorGroup: "pink", power: 2, requiredIngredients: ["milk", "cream", "egg"], max: 4, prob: 0.75, timerRelevant: true },
    applepie: { frame: 20, colorGroup: "red", requiredExpansions: ["recipeBook"], prob: 1.25 },
    icecream: { frame: 21, colorGroup: "blue", power: 1, requiredExpansions: ["recipeBook"], prob: 1.5 },
}

const MACHINES = {
    oven: { frame: 0, colorGroup: "red", power: 1, prob: 1.2 },
    microwave: { frame: 1, colorGroup: "turquoise", max: 2, prob: 0.75, timerRelevant: true },
    knife: { frame: 2, colorGroup: "white", max: 3, power: 2, prob: 1.5, timerRelevant: true },
    slicer: { frame: 3, colorGroup: "red", max: 1, prob: 0.66, timerRelevant: true },
    conveyor_belt: { frame: 4, colorGroup: "yellow" },
    multicooker: { frame: 5, colorGroup: "white", power: 1, max: 3, prob: 1.25 },
    pressure_cooker: { frame: 6, colorGroup: "blue", max: 3, prob: 0.4 },
    bread_machine: { frame: 7, colorGroup: "red", power: 2, prob: 1.25 },

    deep_fryer: { frame: 8, colorGroup: "yellow", power: 2, max: 5, prob: 1.5, timerRelevant: true },
    juicer: { frame: 9, colorGroup: "blue", power: 1, prob: 1.25 },
    ice_cream_machine: { frame: 10, colorGroup: "pink", power: 1, max: 4 },
    soup_kettle: { frame: 11, max: 1, colorGroup: "pink", prob: 1.5, timerRelevant: true },
    toaster: { frame: 12, colorGroup: "red", power: 2, prob: 1.35, max: 3, requiredIngredients: ["bread", "baguette", "croissant"] },
    waffle_iron: { frame: 13, colorGroup: "yellow", power: 1, max: 2, prob: 1.5, timerRelevant: true },
    timer: { frame: 14, colorGroup: "white", max: 4 },
    kitchen_scales: { frame: 15, colorGroup: "blue", power: 2, max: 4, prob: 1.2, timerRelevant: true },

    mixer: { frame: 16, colorGroup: "turquoise", power: 1, requiredExpansions: ["money"], prob: 1.33 },
    blender: { frame: 17, colorGroup: "blue", requiredExpansions: ["money"], prob: 1.33 },
    refrigerator: { frame: 18, colorGroup: "blue", power: 1, requiredExpansions: ["money"], max: 3, forbiddenMachines: ["freezer"], prob: 1.5, timerRelevant: true }, // @TODO: check if placed next to money on adjacent squares in evaluator
    freezer: { frame: 19, colorGroup: "pink", power: 2, requiredExpansions: ["money"], max: 1, forbiddenMachines: ["refrigerator"], prob: 1.5, timerRelevant: true }, // @TODO: needs money in same row/column checked in evaluator
    coffeemaker: { frame: 20, colorGroup: "red", power: 1, requiredExpansions: ["money"], max: 4, prob: 1.33, timerRelevant: true }
}

const MONEY = {
    money: { frame: -1 }
}

const TUTORIAL = {
    howtoplay: { frame: 0 },
    objective: { frame: 1 },
    money: { frame: 2 },
    fixedFingers: { frame: 3 },
    recipeBook: { frame: 4 }
}

const MAIN_TYPES = {
    ingredient: { DICT: INGREDIENTS },
    machine: { DICT: MACHINES },
    money: { DICT: MONEY },
    tutorial: { DICT: TUTORIAL }
}

const CUSTOM = {
    tutorialBG: { frame: 0 },
    machineBG: { frame: 1 },
    moneyBG: { frame: 2 },
    moneyFrame: { frame: 3 },
    fingerFrame: { frame: 4 },
    moneyIcon: { frame: 5 }
}

// @NOTE: no green or gray/black, as those are for money and machines
const COLOR_GROUPS = {
    red: "#FFCC55", // also orange
    yellow: "#FFFFAA",
    blue: "#CCCCFF",
    turquoise: "#CCFFFF",
    pink: "#FFCCFF", // also purple
    white: "#DDDDDD",
    machine: "#484848",
    money: "#056703",
    tutorial: "#FFFFFF",
    reserved: "#FFFFFF" // ??
}

const NB_OFFSETS = [
    Point.RIGHT,
    Point.DOWN,
    Point.LEFT,
    Point.UP
]

export {
    MAIN_TYPES,
    INGREDIENTS,
    MACHINES,
    MONEY,
    TUTORIAL,
    COLOR_GROUPS,
    CUSTOM,
    NB_OFFSETS
}