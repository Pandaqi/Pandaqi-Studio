export enum Type
{
    PERSON = "PERSON",
    HAND = "HAND", // group of both decoration and treat
    DECORATION = "DECORATION",
    TREAT = "TREAT"
}

export enum ReqType
{
    TYPE = "TYPE",
    SET = "SET",
    CARD = "CARD",
}

export interface CardData
{
    frame: number,
    type: Type,
    color?: string,
    power?: boolean
    desc?: string, // tagline or special power (if power = true)
    value?: number,
    freq?: number, // how often a specific person appears; doesn't apply to other types
    textureKey?: string, // set automatically during generation to remember the spritesheet needed for us

    minDeco?: number,
    maxDeco?: number,
    minTreats?: number,
    maxTreats?: number,

    forbidFlip?: boolean
    allowSpecial?: ReqType[]
}

type CardSet = Record<string, CardData>;

// When it's a tagline, it's written in third person.
// When it's an active power, it's written in first person.
export const setStarter:CardSet = 
{
    spook: { frame: 0, type: Type.PERSON, desc: '"Why is there a hole in my blanket?" -Mum', forbidFlip: true },
    skeleton: { frame: 1, type: Type.PERSON, desc: "Has even more skeletons in their closet.", forbidFlip: true },
    zombie: { frame: 2, type: Type.PERSON, desc: "Brainsss ... eh, I mean, Sweetsss.", forbidFlip: true },
    frankenstein: { frame: 3, type: Type.PERSON, desc: "'Well, uh, actually, Frankenstein is the inventor.' -Famous last words", forbidFlip: true },
    vampire: { frame: 4, type: Type.PERSON, desc: "Keeps an absurd number of diaries.", forbidFlip: true },
    reaper: { frame: 5, type: Type.PERSON, desc: "Feeling kinda grim this evening.", forbidFlip: true },
    werewolf: { frame: 6, type: Type.PERSON, desc: "Half-man, half-wolf, quarter-hungry, eighth-scary.", forbidFlip: true },
    witch: { frame: 7, type: Type.PERSON, desc: "Can make candy magically disappear into her mouth.", forbidFlip: true }, 
}

export const setDecorationsStarter:CardSet =
{
    pumpkin: { frame: 0, type: Type.DECORATION, value: 1, color: "orange" },
    tombstone: { frame: 1, type: Type.DECORATION, value: 1.5, color: "blue" },
    ghost: { frame: 2, type: Type.DECORATION, value: 2, color: "gray" },
    plant: { frame: 3, type: Type.DECORATION, value: 2.5, color: "green" },
}

export const setTreatsStarter:CardSet =
{
    chocolate: { frame: 0, type: Type.TREAT, value: 1, color: "brown" },
    cookie: { frame: 1, type: Type.TREAT, value: 1.5, color: "purple" },
    taffy: { frame: 2, type: Type.TREAT, value: 2, color: "pink" },
    pretzel: { frame: 3, type: Type.TREAT, value: 2.5, color: "turquoise" }
}

export const setBeginner:CardSet = 
{
    devil: { frame: 0, type: Type.PERSON, desc: "On visit: destroy 1 decoration of yours.", power: true },
    mummy: { frame: 1, type: Type.PERSON, desc: "I only walk two steps (at most).", maxDeco: 2, power: true },
    ninja: { frame: 2, type: Type.PERSON, desc: "I ignore wildcards.", power: true },
    pirate: { frame: 3, type: Type.PERSON, desc: "On walk: pay any treat to prevent me from walking away.", power: true },
    scarecrow: { frame: 4, type: Type.PERSON, desc: "On visit: all your other visitors go back from whence they came.", power: true },
    dino: { frame: 5, type: Type.PERSON, desc: "Tries to make that bowl of sweets go extinct." },
    mermaid: { frame: 6, type: Type.PERSON, desc: "Has to be carried, to the frustration of all." },
    joker: { frame: 7, type: Type.PERSON, desc: "I walk in the other direction.", power: true }, 
}

export const setDecorationsBeginner =
{
    skeleton: { frame: 0, type: Type.DECORATION, value: 0.75, color: "gray" },
    candle: { frame: 1, type: Type.DECORATION, value: 1.25, color: "pink" },
    cat: { frame: 2, type: Type.DECORATION, value: 1.75, color: "yellow" },
    spider: { frame: 3, type: Type.DECORATION, value: 2.75, color: "blue" },
}

export const setTreatsBeginner =
{
    peanuts: { frame: 0, type: Type.TREAT, value: 0.75, color: "red" },
    lollipop: { frame: 1, type: Type.TREAT, value: 1.25, color: "purple" },
    cupcake: { frame: 2, type: Type.TREAT, value: 1.75, color: "orange" },
    gummies: { frame: 3, type: Type.TREAT, value: 2.75, color: "turquoise" }
}

export const setAdvanced:CardSet = 
{
    alien: { frame: 0, type: Type.PERSON, desc: "Any pair of the same type is a wildcard for you (this round).", power: true }, // @NOTE: allows no special types, as that defeats its power
    cyclops: { frame: 1, type: Type.PERSON, desc: "I spy with my little eye ... CHOCOLATE!", allowSpecial: [ReqType.SET] },
    astronaut: { frame: 2, type: Type.PERSON, desc: "On visit: you may draw 3 cards. But if you do, you can't score me.", power: true, allowSpecial: [ReqType.SET, ReqType.CARD] },
    gnome: { frame: 3, type: Type.PERSON, desc: "On score: replace me with 3 new Persons.", power: true, allowSpecial: [ReqType.CARD] },
    yeti: { frame: 4, type: Type.PERSON, desc: "Still searching for somebody who hands out ice cream treats.", allowSpecial: [ReqType.SET] },
    cowboy: { frame: 5, type: Type.PERSON, desc: "On score: don't replace me with a new Person.", power: true, allowSpecial: [ReqType.CARD] },
    zorro: { frame: 6, type: Type.PERSON, desc: "On score: give any treats paid to your neighbors.", power: true, allowSpecial: [ReqType.SET, ReqType.CARD] },
    cyborg: { frame: 7, type: Type.PERSON, desc: "Input: infinite candy. Output: ?", allowSpecial: [ReqType.SET, ReqType.CARD] }, 
}

export const setExpert:CardSet =
{
    powerfrog: { frame: 0, type: Type.PERSON, desc: "On visit: rotate on or more decorations (to use the other side).", power: true, allowSpecial: [ReqType.SET, ReqType.CARD] }, // yoda, duh
    batkid: { frame: 1, type: Type.PERSON, desc: "While on the street, all wildcards are worth nothing", power: true, allowSpecial: [ReqType.CARD] },
    darkmonth: { frame: 2, type: Type.PERSON, desc: "On score: all Persons immediately walk 2 steps backward.", power: true }, // buzz lightyear
    snowlaf: { frame: 3, type: Type.PERSON, desc: "I walk backwards if somebody has my requirements and is closer in that direction.", power: true }, // olaf 
    webman: { frame: 4, type: Type.PERSON, desc: "On visit: take one or more decorations back into your hand", power: true, allowSpecial: [ReqType.SET] }, // spiderman
    hairykin: { frame: 5, type: Type.PERSON, desc: "On score: steal two cards (decoration or hand)", power: true, allowSpecial: [ReqType.CARD] }, // harley quinn
    supperman: { frame: 6, type: Type.PERSON, desc: "On visit: pay 4 cards with the same icon to score any Person.", power: true, allowSpecial: [ReqType.SET] }, // superman
    pinkie: { frame: 7, type: Type.PERSON, desc: "On visit: you can't score another Person (this round).", power: true }, // barbie  
}

// @NOTE: Unused atm
export const setDecorationsAdvanced:CardSet =
{
    bat: { frame: 0, type: Type.DECORATION, value: 1, color: "gray" },
    hand: { frame: 1, type: Type.DECORATION, value: 1, color: "green" },
    todo7: { frame: 2, type: Type.DECORATION, value: 3, color: "?" },
    todo8: { frame: 3, type: Type.DECORATION, value: 3, color: "?" },
}

// @NOTE: Unused atm
export const setTreatsAdvanced:CardSet =
{
    corn: { frame: 0, type: Type.TREAT, value: 0.5, color: "yellow" },
    cane: { frame: 1, type: Type.TREAT, value: 1, color: "red" },
    cookie: { frame: 2, type: Type.TREAT, value: 1.5, color: "orange" },
    wrapper: { frame: 3, type: Type.TREAT, value: 2, color: "blue" }
}



export const SET_ORDER = ["starter", "beginner", "advanced", "expert"];
export const SETS:Record<string, CardSet> = 
{
    people_starter: setStarter,
    people_beginner: setBeginner,
    people_advanced: setAdvanced,
    people_expert: setExpert,

    decorations_starter: setDecorationsStarter,
    decorations_beginner: setDecorationsBeginner,

    treats_starter: setTreatsStarter,
    treats_beginner: setTreatsBeginner,
}

export const MISC =
{
    decorations: { frame: 0 },
    treats: { frame: 1 },
    power: { frame: 2 },
    score: { frame: 3 }, // the score star at top of persons
    wildcard: { frame: 4 }, // wildcard icon (to replace dec/treat icons anywhere)
    beam: { frame: 5 }, // beam of light behind characters
    card: { frame: 6 }, // for people requiring #cards
    set: { frame: 7 }, // for people requiring sets of the SAME types
    set_unique: { frame: 8 } // for people requiring sets of UNIQUE types
}

// The dark ones are for the types
// Everything else is quite bright/light and for food backgrounds
export const COLORS = {
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