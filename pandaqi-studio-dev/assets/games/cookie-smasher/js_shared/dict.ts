import Bounds from "js/pq_games/tools/numbers/bounds";

enum Type
{
    MEAT,
    DRINK,
    FRUIT,
    CEREAL,
    SPICE
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
}

type CardSet = Record<string, CardData>;

const setStarter:CardSet = {
    cream: { frame: 0, type: Type.MEAT, num: 5, desc: "if exactly 1 Cookie was played", color: "gray" },
    pork: { frame: 1, type: Type.MEAT, num: 3, desc: "if exactly 1 Pork was played", color: "pink" },
    wine: { frame: 2, type: Type.DRINK, num: 4, desc: "if next to a Cookie", color: "red" },
    coffee: { frame: 3, type: Type.DRINK, num: 6, desc: "if 3(+) cards of the same type are in a row", color: "beige" },
    apple: { frame: 4, type: Type.FRUIT, num: 6, desc: "if no card is higher than this one", color: "red" },
    pear: { frame: 5, type: Type.FRUIT, num: 4, desc: "if no card is lower than this one", color: "green" },
    cookie: { frame: 6, type: Type.CEREAL, num: 1, desc: "if nothing else is poisoned", color: "beige" },
    mustard: { frame: 7, type: Type.CEREAL, num: 2, desc: "if no Cookies have been played", color: "yellow" },
    pepper: { frame: 8, type: Type.SPICE, num: 7, desc: "if there are multiple poisoned foods", color: "?" },
    mint: { frame: 9, type: Type.SPICE, num: 8, desc: "if there are no poisoned foods AND no Cookies", color: "?" }
}

const setBeginner:CardSet = {
    fish: { frame: 0, type: Type.MEAT, num: 4, desc: "if Fish is the most occurring food", color: "blue" },
    cheese: { frame: 1, type: Type.MEAT, num: 3, desc: "if Cheese is the least occurring food", color: "yellow" },
    water: { frame: 2, type: Type.DRINK, num: 5, desc: "if between two cards of the same food", color: "blue" },
    milk: { frame: 3, type: Type.DRINK, num: 2, desc: "if between two cards of a different food", color: "gray" },
    orange: { frame: 4, type: Type.FRUIT, num: 0, numRange: new Bounds(3,8), desc: "if no card has number %num%", color: "orange" },
    cauliflower: { frame: 5, type: Type.FRUIT, num: 0, numRange: new Bounds(3,8), desc: "if %numRange2%(+) cards have number %num%", color: "green", numRange2: new Bounds(2,4) },
    bread: { frame: 6, type: Type.CEREAL, num: 9, desc: "if everything else is poisoned", color: "beige" },
    honey: { frame: 7, type: Type.CEREAL, num: 7, desc: "if all cards have the same type (excluding me)", color: "yellow" },
    cinnamon: { frame: 8, type: Type.SPICE, num: 4, desc: "if played by last round's winner", color: "beige" },
    ginger: { frame: 9, type: Type.SPICE, num: 1, desc: "if NOT played by last round's winner", color: "red" }
}

const setAmateur:CardSet = {
    beef: { frame: 0, type: Type.MEAT, num: 5, desc: "if more cards are above 5 than below it", color: "red" },
    eggs: { frame: 1, type: Type.MEAT, num: 9, desc: "if any food appears 3(+) times", color: "?" },
    soup: { frame: 2, type: Type.DRINK, num: 6, desc: "if both neighbors are the same type", color: "?" },
    tea: { frame: 3, type: Type.DRINK, num: 4, desc: "if there are NO two neighbors of the same type", color: "?" },
    pea: { frame: 4, type: Type.FRUIT, num: 7, desc: "if %type% appears more often than any other type", color: "green" },
    cabbage: { frame: 5, type: Type.FRUIT, num: 8, desc: "if %type% appears more often than %type%", color: "green" },
    porridge: { frame: 6, type: Type.CEREAL, num: 3, desc: "if all cards are %type% (excluding me)", color: "?" },
    rice: { frame: 7, type: Type.CEREAL, num: 2, desc: "if no cards are %type% (excluding me)", color: "gray" },
    nutmeg: { frame: 8, type: Type.SPICE, num: 1, desc: "if from the player with the most points", color: "?" },
    saffron: { frame: 9, type: Type.SPICE, num: 5, desc: "if from the player with the least points", color: "?" }
}

const setAdvanced:CardSet = {
    quail: { frame: 0, type: Type.MEAT, num: 1, desc: "if there's a tie for least occurring food", color: "?" },
    ham: { frame: 1, type: Type.MEAT, num: 7, desc: "if there's a tie for most occurring food", color: "red" },
    mead: { frame: 2, type: Type.DRINK, num: 6, desc: "if next to poisoned food", color: "?" },
    ale: { frame: 3, type: Type.DRINK, num: -1, desc: "raises the number of its neighbors by %numRange2%", color: "?", numRange2: new Bounds(1,4), safe: true },
    berries: { frame: 4, type: Type.FRUIT, num: 4, desc: "if Safe Food was played", color: "?" },
    carrot: { frame: 5, type: Type.FRUIT, num: 5, desc: "if there are no duplicates", color: "orange" },
    chocolate: { frame: 6, type: Type.CEREAL, num: 9, desc: "if all cards are Chocolate or Safe.", color: "beige" }, // @TODO: should appear a lot
    barley: { frame: 7, type: Type.CEREAL, num: 8, desc: "if no numbers are further than 2 apart", color: "?" }, // @TODO: potentially randomize
    hazelnut: { frame: 8, type: Type.SPICE, num: 3, desc: "if the previous 2 rounds were won by the same player", color: "?" },
    almond: { frame: 9, type: Type.SPICE, num: 2, desc: "if distance to nearest %type% card is 2(+) cards", color: "?" } // @TODO: potentially randomize
}

const setExpert = {
    chicken: { frame: 0, type: Type.MEAT, num: 5, desc: "if average number per card is higher than 5", color: "yellow" },
    butter: { frame: 1, type: Type.MEAT, num: 8, desc: "if two foods were played equally often, and at least twice", color: "gray" },
    beer: { frame: 2, type: Type.DRINK, num: -1, desc: "flips the truth of its neighbors (regular <-> poisoned)", color: "yellow", safe: true },
    cider: { frame: 3, type: Type.DRINK, num: 2, desc: "if NOT next to poisoned food", color: "?" },
    broccoli: { frame: 4, type: Type.FRUIT, num: 3, desc: "if NO Safe Food was played", color: "green" },
    date: { frame: 5, type: Type.FRUIT, num: -1, desc: "flips the truth of all cards with %any%", color: "?", safe: true },
    sugar: { frame: 6, type: Type.CEREAL, num: 6, desc: "if all non-Sugar cards are next to a Sugar card", color: "?" },
    wheat: { frame: 7, type: Type.CEREAL, num: 9, desc: "if all cards are Safe Food (excluding me)", color: "?" },
    sage: { frame: 8, type: Type.SPICE, num: -1, desc: "Eliminates all cards with %any%", color: "?", safe: true },
    parsley: { frame: 9, type: Type.SPICE, num: -1, desc: "Once revealed, swap it for another hand card", color: "?", safe: true }
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
