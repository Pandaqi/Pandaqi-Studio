
enum Type
{
    MONSTER = "MONSTER",
    SHIELD = "SHIELD",
    BYSTANDER = "BYSTANDER",
}

interface CardData
{
    frame: number,
    color: string,
    type: Type,
    desc: string,
    textureKey?: string, // set automatically during generation to remember the spritesheet needed for us
    cantShoot?: boolean,
    cantDie?: boolean,
}

type CardSet = Record<string, CardData>;

// @TODO: the frames are all out of order
const setStarter:CardSet = 
{
    centzon: { frame: 5, type: Type.MONSTER, color: "?", desc: "only hits cards facing me" },
    monster: { frame: 3, type: Type.MONSTER, color: "?", desc: "nothing special" },
    cipactli: { frame: 4, type: Type.MONSTER, color: "?", desc: "can't hit monsters" },
    priest: { frame: 3, type: Type.BYSTANDER, color: "?", desc: "does nothing" },    
    dwarf: { frame: 1, type: Type.BYSTANDER, color: "?", desc: "can't be hit" },
    emperor: { frame: 0, type: Type.BYSTANDER, color: "?", desc: "if no monsters, both my neighbors attack" }, // old = "can't hit MONSTERs, except myself"
    bodyguard: { frame: 6, type: Type.SHIELD, color: "?", desc: "eliminate the first monster after me" },
    superhero: { frame: 7, type: Type.SHIELD, color: "?", desc: "can be hit, but never eliminated", cantDie: true },
    shieldbearer: { frame: 8, type: Type.SHIELD, color: "?", desc: "me and the next card can't be hit" }
}

const setAmateur:CardSet = 
{
    
    trickster: { frame: 2, type: Type.BYSTANDER, color: "?", desc: "rotate the next card" },
}

const setExpert:CardSet = 
{

}


const TYPES = {
    [Type.MONSTER]: { frame: 0, color: "redDark" },
    [Type.SHIELD]: { frame: 1, color: "blueDark" },
    [Type.BYSTANDER]: { frame: 2, color: "greenDark" },
}

const SETS:Record<string, CardSet> = 
{
    starter: setStarter,
    amateur: setAmateur,
    expert: setExpert,
}

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
