const INGREDIENTS = {
    // low-level
    flour: { frame: 0, color: 0xFFFFFF },
    butter: { frame: 1, color: 0xFFFFFF },
    sugar: { frame: 2, color: 0xFFFFFF },
    egg: { frame: 3, color: 0xFFFFFF },
    water: { frame: 4, color: 0xFFFFFF },
    salt: { frame: 5, color: 0xFFFFFF },

    // mid-level
    chocolate: { frame: 6, color: 0xFFFFFF },
    milk: { frame: 7, color: 0xFFFFFF },
    sprinkles: { frame: 8, color: 0xFFFFFF },
    cream: { frame: 9, color: 0xFFFFFF },
    bread: { frame: 10, color: 0xFFFFFF },

    // high-level
    pie: { frame: 11, color: 0xFFFFFF },
    cake: { frame: 12, color: 0xFFFFFF },
    cookie: { frame: 13, color: 0xFFFFFF }, // @TODO: add a low maximum of cookies, otherwise it's impossible to own all of them
    smoothie: { frame: 14, color: 0xFFFFFF, minUniqueTypesRequired: 5 }, // @TODO: listen to that property
    baguette: { frame: 15, color: 0xFFFFFF },
    croissant: { frame: 16, color: 0xFFFFFF, requiredExpansions: ["machine"] },
    cupcake: { frame: 17, color: 0xFFFFFF, requiredExpansions: ["machine"] },
    brownie: { frame: 18, color: 0xFFFFFF, requiredExpansions: ["machine"] },
    cheesecake: { frame: 19, color: 0xFFFFFF },
    applepie: { frame: 20, color: 0xFFFFFF },
    icecream: { frame: 21, color: 0xFFFFFF },
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

export {
    MAIN_TYPES,
    INGREDIENTS,
    MACHINES,
    MONEY,
    TUTORIAL
}