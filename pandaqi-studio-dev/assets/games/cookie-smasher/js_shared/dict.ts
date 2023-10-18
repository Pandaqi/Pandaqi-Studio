import Bounds from "js/pq_games/tools/numbers/bounds";

enum Type
{
    MEAT = "MEAT",
    DRINK = "DRINK",
    FRUIT = "FRUIT",
    CEREAL = "CEREAL",
    SPICE = "SPICE"
}

interface CardData
{
    frame: number,
    color: string,
    type: Type,
    num: number,
    numRange?: Bounds,
    numRange2?: Bounds,
    desc: string,
    safe?: boolean,
    textureKey?: string, // set automatically during generation to remember the spritesheet needed for us
    rulesDisabled?: boolean, // whether it's allowed to be used for rules examples
    freq?: number, // how often it should appear, relative to baseline (multiplier, rounded afterwards)
}

type CardSet = Record<string, CardData>;

const setStarter:CardSet = {
    cream: { frame: 0, type: Type.MEAT, num: 5, desc: "if exactly 1 Cookie was played", color: "gray" },
    pork: { frame: 1, type: Type.MEAT, num: 2, desc: "if exactly 1 Pork was played", color: "pink" },
    wine: { frame: 2, type: Type.DRINK, num: 6, desc: "if next to a Cookie or Wine", color: "red" },
    coffee: { frame: 3, type: Type.DRINK, num: 8, desc: "if 3(+) cards of the same type are in sequence", color: "beige" },
    apple: { frame: 4, type: Type.FRUIT, num: 6, desc: "if no card is higher than this one", color: "red" },
    pear: { frame: 5, type: Type.FRUIT, num: 4, desc: "if no card is lower than this one", color: "green" },
    cookie: { frame: 6, type: Type.CEREAL, num: 9, desc: "if nothing else is poisoned", color: "beige" },
    mustard: { frame: 7, type: Type.CEREAL, num: 3, desc: "if no Cookies or other Mustard were played", color: "yellow" }, // old power = if no Cookies were played
    pepper: { frame: 8, type: Type.SPICE, num: 7, desc: "if there are multiple poisoned foods", color: "green" },
    mint: { frame: 9, type: Type.SPICE, num: 1, desc: "always poisoned", color: "blue" }
}

const setBeginner:CardSet = {
    fish: { frame: 0, type: Type.MEAT, num: 4, desc: "if Fish occurs the most", color: "blue" },
    cheese: { frame: 1, type: Type.MEAT, num: 2, desc: "if Cheese occurs the least", color: "yellow" },
    water: { frame: 2, type: Type.DRINK, num: 7, desc: "if between two cards of the same type", color: "blue" },
    milk: { frame: 3, type: Type.DRINK, num: 3, desc: "if between two cards of a different type", color: "gray" },
    orange: { frame: 4, type: Type.FRUIT, num: 0, numRange: new Bounds(3,8), desc: "if no other card has %num% or %numRange2%", color: "orange", numRange2: new Bounds(3,8) }, // @TODO: make sure numbers are different, or do I already do that?
    cauliflower: { frame: 5, type: Type.FRUIT, num: 0, numRange: new Bounds(3,6), desc: "if %numRange2%(+) cards are higher than %num%", color: "green", numRange2: new Bounds(2,3) },
    bread: { frame: 6, type: Type.CEREAL, num: 6, desc: "if all lower cards are poisoned", color: "beige" }, // old power = "if everything else is poisoned"
    honey: { frame: 7, type: Type.CEREAL, num: 9, desc: "if at most 2 different types were played", color: "yellow" }, // old power = "if all cards have the same type (excluding me)"
    cinnamon: { frame: 8, type: Type.SPICE, num: 4, desc: "if played by last round's winner", color: "beige", rulesDisabled: true },
    ginger: { frame: 9, type: Type.SPICE, num: 1, desc: "if NOT played by last round's winner", color: "red", rulesDisabled: true }
}

// @TODO: a really high amount of NONE rounds (can I swap some type with another?)
const setAmateur:CardSet = {
    beef: { frame: 0, type: Type.MEAT, num: 5, desc: "if more cards are above 5 than below it", color: "red" },
    eggs: { frame: 1, type: Type.MEAT, num: 2, desc: "if any food appears 2(+) times", color: "yellow" },
    soup: { frame: 2, type: Type.DRINK, num: 6, desc: "if any card has two identical neighbors", color: "purple" }, // old power = "if both its neighbors are the same"
    tea: { frame: 3, type: Type.DRINK, num: 7, desc: "if NO card has a neighbor of the same type", color: "purple" },
    pea: { frame: 4, type: Type.FRUIT, num: 9, desc: "if %type% appears more often than any other type", color: "green" },
    cabbage: { frame: 5, type: Type.FRUIT, num: 4, desc: "if %type% appears more often than %type%", color: "green" },
    wheat: { frame: 6, type: Type.CEREAL, num: 6, desc: "if all higher cards are %type%", color: "beige" }, // old power = "if all cards are %type%"
    rice: { frame: 7, type: Type.CEREAL, num: 3, desc: "if no cards are %type%", color: "gray" }, // @TODO: ensure picked types are NEVER the same as the card
    nutmeg: { frame: 8, type: Type.SPICE, num: 1, desc: "if from the player with the most points", color: "beige", rulesDisabled: true },
    saffron: { frame: 9, type: Type.SPICE, num: 8, desc: "if from the player with the least points", color: "pink", rulesDisabled: true }
}

const setAdvanced:CardSet = {
    quail: { frame: 0, type: Type.MEAT, num: 1, desc: "if there's a tie for least occurring food", color: "yellow" },
    ham: { frame: 1, type: Type.MEAT, num: 4, desc: "if there's a tie for most occurring food", color: "red" },
    mead: { frame: 2, type: Type.DRINK, num: 5, desc: "if next to poisoned food", color: "yellow" },
    ale: { frame: 3, type: Type.DRINK, num: 0, desc: "raises the number of its neighbors by %numRange2%", color: "yellow", numRange2: new Bounds(1,4), safe: true },
    berries: { frame: 4, type: Type.FRUIT, num: 3, desc: "if Safe Food was played", color: "purple" },
    carrot: { frame: 5, type: Type.FRUIT, num: 5, desc: "if there are no duplicates (excluding me)", color: "orange" },
    chocolate: { frame: 6, type: Type.CEREAL, num: 9, desc: "if all neighbors are Chocolate or Safe.", color: "beige", freq: 2.0 },
    barley: { frame: 7, type: Type.CEREAL, num: 8, desc: "if no numbers are further than %numRange2% apart", color: "beige", numRange2: new Bounds(4,6) },
    hazelnut: { frame: 8, type: Type.SPICE, num: 6, desc: "if the previous 2 rounds were won by the same player", color: "green", rulesDisabled: true }, // @TODO: find something better and more likely
    almond: { frame: 9, type: Type.SPICE, num: 2, desc: "if distance to nearest %type% is %numRange2%(+) cards", color: "blue", numRange2: new Bounds(2,3) } // @TODO: again, ensure the type picked is never the same type as this card
}

const setExpert = {
    chicken: { frame: 0, type: Type.MEAT, num: 6, desc: "if the average number is higher than 6", color: "yellow" },
    butter: { frame: 1, type: Type.MEAT, num: 8, desc: "if two foods were played equally often, and at least twice", color: "gray" }, // @TODO: convoluted, find something better
    beer: { frame: 2, type: Type.DRINK, num: 9, desc: "flips the truth of its neighbors (regular <-> poisoned)", color: "yellow", safe: true },
    cider: { frame: 3, type: Type.DRINK, num: 5, desc: "if NOT next to poisoned food", color: "yellow" },
    broccoli: { frame: 4, type: Type.FRUIT, num: 3, desc: "if NO Safe Food was played", color: "green" },
    date: { frame: 5, type: Type.FRUIT, num: 9, desc: "flips the truth of all cards with %any%", color: "green", safe: true },
    sugar: { frame: 6, type: Type.CEREAL, num: 7, desc: "if all non-Sugar cards are next to a Sugar card", color: "purple" },
    porridge: { frame: 7, type: Type.CEREAL, num: 8, desc: "if all cards are Safe Food (excluding me)", color: "beige" },
    sage: { frame: 8, type: Type.SPICE, num: 0, desc: "Eliminates all cards with %any%", color: "purple", safe: true }, // @TODO: if this is a number, it's REALLY rare ... make it "below num" instead?
    parsley: { frame: 9, type: Type.SPICE, num: 0, desc: "Once revealed, swap it for another hand card", color: "blue", safe: true, rulesDisabled: true } // @TODO: NO, simply not feasible, do something else
}

const TYPES = {
    [Type.MEAT]: { frame: 0, color: "redDark" },
    [Type.DRINK]: { frame: 1, color: "blueDark" },
    [Type.FRUIT]: { frame: 2, color: "greenDark" },
    [Type.CEREAL]: { frame: 3, color: "yellowDark" },
    [Type.SPICE]: { frame: 4, color: "purpleDark" }
}

const SETS:Record<string, CardSet> = 
{
    starter: setStarter,
    beginner: setBeginner,
    amateur: setAmateur,
    advanced: setAdvanced,
    expert: setExpert
}

const COLORS = {
    beige: "#5E2C04",
    blue: "#385D97",
    turquoise: "#49A078",
    green: "#3BC14A",
    purple: "#C349FC",
    pink: "#AF3966",
    orange: "#DD6E42",
    red: "#FFAAAA",
    yellow: "#C49F1D",
    gray: "#ECECEC"
}

export 
{
    Type,
    CardData,
    SETS,
    COLORS,
    TYPES
}
