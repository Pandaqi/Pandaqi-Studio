interface ElementData { 
    frame: number,
}

const ELEMENTS:Record<string, ElementData> = {
    fire: { frame: 0 },
    electric: { frame: 1 },
    star: { frame: 2 },
    dragon: { frame: 3 },
    water: { frame: 4 },
    ice: { frame: 5 },
    poison: { frame: 6 },
    weather: { frame: 7 },
    earth: { frame: 8 },
    grass: { frame: 9 },
    rock: { frame: 10 },
    bug: { frame: 11 },
    air: { frame: 12 },
    magic: { frame: 13 },
    ghost: { frame: 14 },
    dark: { frame: 15 }
}


interface CreatureData {
    frame: number,
}

const CREATURES:Record<string, CreatureData> = {

}

interface BackgroundData {
    frame: number,
}

const BACKGROUNDS:Record<string, BackgroundData> = {

}

export {
    ELEMENTS,
    CREATURES,
    BACKGROUNDS
}