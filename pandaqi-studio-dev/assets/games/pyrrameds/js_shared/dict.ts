
enum CardType
{
    MEDICINE,
    PATIENT,
    SPECIAL
}

interface GeneralData
{
    frame?: number,
    set?: string,
    freq?: number,
}

const MEDICINE:Record<string,GeneralData> =
{
    lala0: { frame: 0, set: "base" },
    lala1: { frame: 1, set: "base" },
    lala2: { frame: 2, set: "base" },
    lala3: { frame: 3, set: "base" },
    lala4: { frame: 4, set: "whatever" },
    lala5: { frame: 5, set: "whatever" },
}

const PATIENTS:Record<string,GeneralData> =
{
    lala0: { frame: 0 },
    lala1: { frame: 1 },
    lala2: { frame: 2 },
    lala3: { frame: 3 },
    lala4: { frame: 4 },
    lala5: { frame: 5 },
    lala6: { frame: 6 },
    lala7: { frame: 7 },
}

const MISC:Record<string,GeneralData> =
{
    
}

export {
    CardType,
    MEDICINE,
    PATIENTS,
    MISC
}

