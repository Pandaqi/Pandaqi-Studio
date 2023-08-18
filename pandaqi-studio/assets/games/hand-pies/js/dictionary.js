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
    cookie: { frame: 13, color: 0xFFFFFF },
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

}

const MONEY = {

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
    machines: { DICT: MACHINES },
    money: { DICT: MONEY },
    tutorial: { DICT: TUTORIAL }
}

export default {
    MAIN_TYPES,
    INGREDIENTS,
    MACHINES,
    MONEY,
    TUTORIAL
}