import Bounds from "js/pq_games/tools/numbers/bounds";

enum Type
{
    PERSON = "PERSON",
    HAND = "HAND", // group of both decoration and treat
    DECORATION = "DECORATION",
    TREAT = "TREAT"
}

interface CardData
{
    frame: number,
    type: Type,
    color?: string,
    power?: boolean
    desc?: string, // tagline or special power (if power = true)
    value?: number,
    freq?: number, // how often a specific person appears; doesn't apply to other types
    textureKey?: string, // set automatically during generation to remember the spritesheet needed for us
}

type CardSet = Record<string, CardData>;

// When it's a tagline, it's written in third person.
// When it's an active power, it's written in first person.

const setStarter:CardSet = 
{
    spook: { frame: 0, type: Type.PERSON, desc: '"Why is there a hole in my blanket?" -Mum' },
    skeleton: { frame: 1, type: Type.PERSON, desc: "Has even more skeletons in their closet." },
    zombie: { frame: 2, type: Type.PERSON, desc: "I only walk two steps (at most).", power: true },
    frankenstein: { frame: 3, type: Type.PERSON, desc: "On visit: destroy one decoration of yours.", power: true },
    vampire: { frame: 4, type: Type.PERSON, desc: "Keeps an absurd amount of diaries." },
    reaper: { frame: 5, type: Type.PERSON, desc: "On score: steal two cards from another player.", power: true },
    werewolf: { frame: 6, type: Type.PERSON, desc: "I walk in the other direction.", power: true },
    witch: { frame: 7, type: Type.PERSON, desc: "Can make candy magically disappear into her mouth." }, 
    
    pumpkin: { frame: 8, type: Type.DECORATION, value: 1, color: "orange" },
    tombstone: { frame: 9, type: Type.DECORATION, value: 1.5, color: "blue" },
    ghost: { frame: 10, type: Type.DECORATION, value: 2, color: "gray" },
    plant: { frame: 11, type: Type.DECORATION, value: 2.5, color: "green" },

    chocolate: { frame: 12, type: Type.TREAT, value: 1, color: "brown" },
    cookie: { frame: 13, type: Type.TREAT, value: 1.5, color: "purple" },
    taffy: { frame: 14, type: Type.TREAT, value: 2, color: "pink" },
    pretzel: { frame: 15, type: Type.TREAT, value: 2.5, color: "turquoise" }
}

const setBeginner:CardSet = 
{
    devil: { frame: 0, type: Type.PERSON, desc: "On score: don't replace me with a new Person.", power: true },
    mummy: { frame: 1, type: Type.PERSON, desc: "On visit: you can't score another Person.", power: true },
    ninja: { frame: 2, type: Type.PERSON, desc: "I ignore wildcards.", power: true },
    pirate: { frame: 3, type: Type.PERSON, desc: "On walk: pay any treat to prevent me from walking away.", power: true },
    scarecrow: { frame: 4, type: Type.PERSON, desc: "On visit: must be alone. (All other visitors keep walking.)", power: true },
    dino: { frame: 5, type: Type.PERSON, desc: "Tries to make that bowl of sweets go extinct." },
    mermaid: { frame: 6, type: Type.PERSON, desc: "Has to be carried, to the frustration of all." },
    joker: { frame: 7, type: Type.PERSON, desc: "On visit: pay 4 cards with the same icon to score any Person.", power: true }, 
    
    skeleton: { frame: 8, type: Type.DECORATION, value: 1, color: "gray" },
    candle: { frame: 9, type: Type.DECORATION, value: 1, color: "pink" },
    cat: { frame: 10, type: Type.DECORATION, value: 3, color: "yellow" },
    spider: { frame: 11, type: Type.DECORATION, value: 3, color: "blue" },

    peanuts: { frame: 12, type: Type.TREAT, value: 0.5, color: "red" },
    lollipop: { frame: 13, type: Type.TREAT, value: 1, color: "purple" },
    cupcake: { frame: 14, type: Type.TREAT, value: 1.5, color: "orange" },
    gummies: { frame: 15, type: Type.TREAT, value: 2, color: "turquoise" }
}

const setAdvanced:CardSet = 
{
    alien: { frame: 0, type: Type.PERSON, desc: "Any pair of the same type is a wildcard for you (this round).", power: true },
    cyclops: { frame: 1, type: Type.PERSON, desc: "I spy with my little eye ... CHOCOLATE!" },
    astronaut: { frame: 2, type: Type.PERSON, desc: "On visit: if you don't score me, draw 3 cards.", power: true },
    gnome: { frame: 3, type: Type.PERSON, desc: "On score: replace me with 3 new Persons.", power: true },
    yeti: { frame: 4, type: Type.PERSON, desc: "Still searching for somebody who hands out ice cream treats." },
    cowboy: { frame: 5, type: Type.PERSON, desc: "On visit: steal one hand card from another player.", power: true },
    zorro: { frame: 6, type: Type.PERSON, desc: "On score: give any treats paid to your neighbors.", power: true },
    cyborg: { frame: 7, type: Type.PERSON, desc: "Input: infinite candy. Output: ?" }, 
    
    bat: { frame: 8, type: Type.DECORATION, value: 1, color: "gray" },
    hand: { frame: 9, type: Type.DECORATION, value: 1, color: "green" },
    todo7: { frame: 10, type: Type.DECORATION, value: 3, color: "?" },
    todo8: { frame: 11, type: Type.DECORATION, value: 3, color: "?" },

    corn: { frame: 12, type: Type.TREAT, value: 0.5, color: "yellow" },
    cane: { frame: 13, type: Type.TREAT, value: 1, color: "red" },
    cookie: { frame: 14, type: Type.TREAT, value: 1.5, color: "orange" },
    wrapper: { frame: 15, type: Type.TREAT, value: 2, color: "blue" }
}

const SET_ORDER = ["starter", "beginner", "advanced", "expert"];
const SETS:Record<string, CardSet> = 
{
    starter: setStarter,
    beginner: setBeginner,
    advanced: setAdvanced,
    /*expert: setExpert*/
}

const MISC =
{
    decorations: { frame: 0 },
    treats: { frame: 1 },
    power: { frame: 2 },
    score: { frame: 3 }, // the score star at top of persons
    wildcard: { frame: 4 }, // wildcard icon (to replace dec/treat icons anywhere)
    beam: { frame: 5 }, // beam of light behind characters
}

// The dark ones are for the types
// Everything else is quite bright/light and for food backgrounds
const COLORS = {
    brown: "#664228",
    blue: "#60928C",
    turquoise: "#23988A",
    green: "#40A016",
    purple: "#9046B6",
    pink: "#EB2E78",
    orange: "#E15200",
    red: "#CC6564",
    yellow: "#CBB042",
    gray: "#616161",
}

export 
{
    Type,
    CardData,
    SETS,
    SET_ORDER,
    COLORS,
    MISC
}
