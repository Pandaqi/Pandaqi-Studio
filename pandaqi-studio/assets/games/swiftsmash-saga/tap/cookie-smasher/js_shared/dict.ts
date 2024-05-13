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
    dependsOn?: string[], // list of things on which it depends (so they must be included too in the same set)
}

type CardSet = Record<string, CardData>;

// FALLBACK = Cookie + Mint
const setStarter:CardSet = {
    cream: { frame: 0, type: Type.MEAT, num: 5, desc: "if exactly 1 $cookie$ was played", color: "gray", dependsOn: ["cookie"] },
    pork: { frame: 1, type: Type.MEAT, num: 2, desc: "if exactly 1 $pork$ was played", color: "pink" },
    wine: { frame: 2, type: Type.DRINK, num: 6, desc: "if next to $cookie$ or $wine$", color: "red", dependsOn: ["cookie"] },
    coffee: { frame: 3, type: Type.DRINK, num: 8, desc: "if 3(+) cards of the same type are in sequence", color: "beige" },
    apple: { frame: 4, type: Type.FRUIT, num: 6, desc: "if no card is higher than me", color: "green" },
    pear: { frame: 5, type: Type.FRUIT, num: 4, desc: "if no card is lower than me", color: "green" },
    cookie: { frame: 6, type: Type.CEREAL, num: 9, desc: "if nothing else is poisoned", color: "beige" },
    mustard: { frame: 7, type: Type.CEREAL, num: 3, desc: "if no $cookie$ or other $mustard$", color: "yellow", dependsOn: ["cookie"] }, // old power = if no Cookies were played
    pepper: { frame: 8, type: Type.SPICE, num: 7, desc: "if multiple foods are poisoned", color: "orange" },
    mint: { frame: 9, type: Type.SPICE, num: 1, desc: "always poisoned", color: "blue" }
}

// FALLBACK = Ginger
const setBeginner:CardSet = {
    fish: { frame: 0, type: Type.MEAT, num: 4, desc: "if I appear the most", color: "pink" },
    cheese: { frame: 1, type: Type.MEAT, num: 2, desc: "if I appear the least", color: "yellow" },
    water: { frame: 2, type: Type.DRINK, num: 7, desc: "if between two cards of the same type", color: "blue" },
    milk: { frame: 3, type: Type.DRINK, num: 3, desc: "if between two cards of a different type", color: "gray" },
    orange: { frame: 4, type: Type.FRUIT, num: 0, numRange: new Bounds(3,8), desc: "if no other card has %num% or %numRange2%", color: "orange", numRange2: new Bounds(3,8) },
    cauli: { frame: 5, type: Type.FRUIT, num: 0, numRange: new Bounds(3,6), desc: "if %numRange2%(+) cards are higher than %num%", color: "green", numRange2: new Bounds(2,3) },
    bread: { frame: 6, type: Type.CEREAL, num: 6, desc: "if all lower cards are poisoned", color: "beige" }, // old power = "if everything else is poisoned"
    honey: { frame: 7, type: Type.CEREAL, num: 9, desc: "if 2(-) unique types were played", color: "yellow" }, // old power = "if all cards have the same type (excluding me)"
    cinnamon: { frame: 8, type: Type.SPICE, num: 4, desc: "if played by the king", color: "beige" },
    ginger: { frame: 9, type: Type.SPICE, num: 1, desc: "if NOT played by the king", color: "red" }
}

// FALLBACK = Cabbage + Rice (two because they are both weak)
const setAmateur:CardSet = {
    beef: { frame: 0, type: Type.MEAT, num: 5, desc: "if more cards are below 5 than above it", color: "red" },
    eggs: { frame: 1, type: Type.MEAT, num: 7, desc: "if any type appears 3(+) times", color: "yellow" }, // old = if any food appears 2(+) times
    soup: { frame: 2, type: Type.DRINK, num: 6, desc: "if any card has two identical neighbors", color: "blue" }, // old power = "if both its neighbors are the same"
    tea: { frame: 3, type: Type.DRINK, num: 4, desc: "if NO card has a neighbor of the same type", color: "purple" },
    pea: { frame: 4, type: Type.FRUIT, num: 8, desc: "if %type% appears the most", color: "green" },
    cabbage: { frame: 5, type: Type.FRUIT, num: 2, desc: "if %type% does NOT appear the most", color: "green" }, // old power = "if %type% appears more often than %type%"
    wheat: { frame: 6, type: Type.CEREAL, num: 5, desc: "if all higher cards are %type%", color: "beige" }, // old power = "if all cards are %type%"
    rice: { frame: 7, type: Type.CEREAL, num: 3, desc: "if NO cards are %type%", color: "gray" },
    nutmeg: { frame: 8, type: Type.SPICE, num: 1, desc: "eliminate all cards before me", color: "orange", safe: true }, // old = if from the player with the most points
    saffron: { frame: 9, type: Type.SPICE, num: 9, desc: "all cards after me are poisoned", color: "pink", safe: true } // old = if from the player with the least points
}

// FALLBACK = Hazelnut + Quail (both weak)
const setAdvanced:CardSet = {
    quail: { frame: 0, type: Type.MEAT, num: 1, desc: "if there's a tie for least occurring food", color: "orange" },
    ham: { frame: 1, type: Type.MEAT, num: 5, desc: "if there's a tie for most occurring food", color: "red" },
    mead: { frame: 2, type: Type.DRINK, num: 6, desc: "if next to poisoned food", color: "yellow" },
    ale: { frame: 3, type: Type.DRINK, num: 1, desc: "raises its neighbors by %numRange2%", color: "gray", numRange2: new Bounds(1,4), safe: true },
    berries: { frame: 4, type: Type.FRUIT, num: 3, desc: "if $safe$ was played", color: "purple", dependsOn: ["safe"] },
    carrot: { frame: 5, type: Type.FRUIT, num: 5, desc: "if there are no duplicates (excluding me)", color: "orange" },
    cacao: { frame: 6, type: Type.CEREAL, num: 9, desc: "if all neighbors are $cacao$ or $safe$.", color: "beige", dependsOn: ["safe"] },
    barley: { frame: 7, type: Type.CEREAL, num: 8, desc: "if no numbers are further than %numRange2% apart", color: "beige", numRange2: new Bounds(4,6) },
    hazelnut: { frame: 8, type: Type.SPICE, num: 4, desc: "if from the player in first or last place", color: "green", rulesDisabled: true },
    almond: { frame: 9, type: Type.SPICE, num: 2, desc: "if distance to nearest %type% is %numRange2%(+) cards", color: "blue", numRange2: new Bounds(2,3) }
}

// FALLBACK = 
const setExpert:CardSet = {
    chicken: { frame: 0, type: Type.MEAT, num: 6, desc: "if the average number is higher than 6", color: "beige" },
    butter: { frame: 1, type: Type.MEAT, num: 4, desc: "if there are more odd than even numbers", color: "yellow" }, // old = two foods appear equally often, and at least twice
    beer: { frame: 2, type: Type.DRINK, num: 9, desc: "flips the truth of its neighbors", color: "blue", safe: true },
    cider: { frame: 3, type: Type.DRINK, num: 5, desc: "if NOT next to poisoned food", color: "red" },
    broccoli: { frame: 4, type: Type.FRUIT, num: 3, desc: "if 1(-) $safe$ was played", color: "green", dependsOn: ["safe"] },
    date: { frame: 5, type: Type.FRUIT, num: 7, desc: "if %type% appears more often than %type%", color: "green" },
    sugar: { frame: 6, type: Type.CEREAL, num: 9, desc: "flips the truth of all cards with %any% or %any%", color: "pink", safe: true },
    porridge: { frame: 7, type: Type.CEREAL, num: 8, desc: "if 2(+) $safe$ were played", color: "gray", dependsOn: ["safe"] }, // old = "if all cards are Safe Food (excluding me)"
    sage: { frame: 8, type: Type.SPICE, num: 1, desc: "eliminate all cards with %any% or %any%", color: "purple", safe: true },
    parsley: { frame: 9, type: Type.SPICE, num: 0, numRange: new Bounds(2,8), desc: "if I match type or number with the king's card", color: "blue", } 
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

// The dark ones are for the types
// Everything else is quite bright/light and for food backgrounds
const COLORS = {
    beige: "#EDB24E",
    blue: "#92C5BF",
    blueDark: "#296A67",
    green: "#70D349",
    greenDark: "#28791A",
    purple: "#DD92EC",
    purpleDark: "#C634E8",
    pink: "#EC92BB",
    orange: "#F49A45",
    red: "#FF9B97",
    redDark: "#B3322E",
    yellow: "#FEE075",
    yellowDark: "#957500",
    grayLight: "#E9E9E9",
    gray: "#C6C6C6"
}

export 
{
    Type,
    CardData,
    SETS,
    COLORS,
    TYPES
}
