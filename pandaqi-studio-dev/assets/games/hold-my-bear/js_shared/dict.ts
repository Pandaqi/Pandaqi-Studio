interface AnimalData
{
    frame: number,
    color: string,
    expansion?: string,
    power?: string
}

const ANIMALS:Record<string, AnimalData> = {
    // base set
    bear: { frame: 0, color: "#553311" },
    ferret: { frame: 1, color: "#0000FF" },
    tiger: { frame: 2, color: "#FFAA00" },
    chicken: { frame: 3, color: "#FFFF00" },
    dog: { frame: 4, color: "#00FFFF" },
    cat: { frame: 5, color: "#00FFFF" },
    hamster: { frame: 6, color: "#FF00FF" },
    vole: { frame: 7, color: "#00FF00" },

    // expansion
}

export 
{
    ANIMALS,
    AnimalData
}
