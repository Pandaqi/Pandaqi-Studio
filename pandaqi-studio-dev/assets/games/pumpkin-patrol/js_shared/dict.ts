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

const setStarter:CardSet = 
{
    spook: { frame: 0, type: Type.PERSON },
    skeleton: { frame: 1, type: Type.PERSON },
    zombie: { frame: 2, type: Type.PERSON },
    frankenstein: { frame: 3, type: Type.PERSON },
    vampire: { frame: 4, type: Type.PERSON },
    reaper: { frame: 5, type: Type.PERSON },
    werewolf: { frame: 6, type: Type.PERSON },
    witch: { frame: 7, type: Type.PERSON }, 
    
    pumpkin: { frame: 8, type: Type.DECORATION, value: 1, color: "orange" },
    tombstone: { frame: 9, type: Type.DECORATION, value: 1, color: "blue" },
    ghost: { frame: 10, type: Type.DECORATION, value: 3, color: "gray" },
    plant: { frame: 11, type: Type.DECORATION, value: 4, color: "green" },

    chocolate: { frame: 12, type: Type.TREAT, value: 1, color: "brown" },
    cookie: { frame: 13, type: Type.TREAT, value: 2, color: "purple" },
    taffy: { frame: 14, type: Type.TREAT, value: 3, color: "pink" },
    pretzel: { frame: 15, type: Type.TREAT, value: 3, color: "turquoise" }
}

const SET_ORDER = ["starter", "beginner", "amateur", "advanced", "expert"];
const SETS:Record<string, CardSet> = 
{
    starter: setStarter,
    /*beginner: setBeginner,
    amateur: setAmateur,
    advanced: setAdvanced,
    expert: setExpert*/
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
    SET_ORDER,
    COLORS,
}
