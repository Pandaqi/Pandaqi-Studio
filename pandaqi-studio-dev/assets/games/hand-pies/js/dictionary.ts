const INGREDIENTS = {
    // low-level
    flour: { frame: 0, colorGroup: "red" },
    butter: { frame: 1, colorGroup: "yellow" },
    sugar: { frame: 2, colorGroup: "blue" },
    egg: { frame: 3, colorGroup: "red" },
    water: { frame: 4, colorGroup: "blue" },
    salt: { frame: 5, colorGroup: "white" },

    // mid-level
    chocolate: { frame: 6, colorGroup: "red" },
    milk: { frame: 7, colorGroup: "blue" },
    sprinkles: { frame: 8, colorGroup: "pink" },
    cream: { frame: 9, colorGroup: "white" },
    bread: { frame: 10, colorGroup: "red" },

    // high-level
    pie: { frame: 11, colorGroup: "yellow" },
    cake: { frame: 12, colorGroup: "pink" },
    cookie: { frame: 13, colorGroup: "red" }, // @TODO: add a low maximum of cookies, otherwise it's impossible to own all of them
    smoothie: { frame: 14, colorGroup: "pink", minUniqueTypesRequired: 5 }, // @TODO: listen to that property
    baguette: { frame: 15, colorGroup: "yellow" },
    croissant: { frame: 16, colorGroup: "red", requiredExpansions: ["machine"] },
    cupcake: { frame: 17, colorGroup: "blue", requiredExpansions: ["machine"] },
    brownie: { frame: 18, colorGroup: "red", requiredExpansions: ["machine"] },
    cheesecake: { frame: 19, colorGroup: "pink" },
    applepie: { frame: 20, colorGroup: "red" },
    icecream: { frame: 21, colorGroup: "blue" },
}

const MACHINES = {
    oven: { frame: 0 },
    microwave: { frame: 1, max: 2 },
    knife: { frame: 2, max: 3 },
    slicer: { frame: 3, max: 1 },
    conveyor_belt: { frame: 4 },
    multicooker: { frame: 5 },
    pressure_cooker: { frame: 6 },
    bread_machine: { frame: 7 },

    deep_fryer: { frame: 8 },
    juicer: { frame: 9 },
    ice_cream_machine: { frame: 10 },
    soup_kettle: { frame: 11, max: 1 },
    toaster: { frame: 12, requiredIngredients: ["bread", "baguette", "croissant"] },
    waffle_iron: { frame: 13, max: 2 },
    timer: { frame: 14 }, // @TODO: require inclusion of stuff related to adjacency or machine usage
    kitchen_scales: { frame: 15 }, // @TODO: actually finish this

    mixer: { frame: 16, requiredExpansions: ["money"] },
    blender: { frame: 17, requiredExpansions: ["money"] },
    refrigerator: { frame: 18, requiredExpansions: ["money"], max: 3, forbiddenMachines: ["freezer"] }, // @TODO: check if placed next to money on adjacent squares in evaluator
    freezer: { frame: 19, requiredExpansions: ["money"], max: 1, forbiddenMachines: ["refrigerator"] }, // @TODO: needs money in same row/column checked in evaluator
    coffeemaker: { frame: 20, requiredExpansions: ["money"] }
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

// @NOTE: no green or gray/black, as those are for money and machines
const COLOR_GROUPS = {
    red: "#FFAA22", // also orange
    yellow: "#FFFF00",
    blue: "#CCCCFF",
    turquoise: "#CCFFFF",
    pink: "#FFCCFF", // also purple
    white: "#DDDDDD",
    machine: "#484848",
    money: "#056703",
    tutorial: "#FFFFFF",
    reserved: "#FFFFFF" // ??
}

export {
    MAIN_TYPES,
    INGREDIENTS,
    MACHINES,
    MONEY,
    TUTORIAL,
    COLOR_GROUPS
}