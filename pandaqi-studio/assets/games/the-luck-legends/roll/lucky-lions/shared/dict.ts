
export enum CardType
{
    ZOO,
    ANIMAL
}

// the actual background/decorations on cards is a dark green/brown vibe
export enum AnimalType
{
    LION = "Lion", // yellow
    FOX = "Fox", // orange-brown-red
    PANDA = "Panda", // black-white
    FLAMINGO = "Flamingo", // pink-purple
    DOLPHIN = "Dolphin", // turquoise-blue
}

interface GeneralData
{
    frame?: number,
    desc?: string,
    hideCycle?: boolean,
    requirePeople?: boolean,
    forbidPeople?: boolean,
}

export const ZOO_CARDS:Record<string, GeneralData> = 
{
    autowin: { desc: "<b>%animal% always wins</b>. Everything else is a tie.", hideCycle: true },
    autolose: { desc: "<b>%animal% always loses</b>. Everything else is a tie.", hideCycle: true },
    player_exclude: { desc: "Pick one player who does <b>not</b> get to roll.", requirePeople: true },
    extra_rule: { desc: "<b>%animal% beats %animal%</b> if only those animals are played.", forbidPeople: true },
    die_split: { desc: "Only use <b>%cyclesize% cards</b> for your die. (Temporarily set aside your other cards.)" },
    double_roll: { desc: "All battlers roll <b>twice</b> and pick <i>one of the results</i> as final." }
}

export const ANIMALS:Record<AnimalType, GeneralData> =
{
    [AnimalType.LION]: { frame: 0, desc: "In case of a <b>tie</b>, I always <i>win</i>." },
    [AnimalType.FOX]: { frame: 1, desc: "You may <b>reroll</b>.\n(Foxes can be used only <i>once</i> per battle.)" },
    [AnimalType.PANDA]: { frame: 2, desc: "If I'm <b>not on the Zoo Card</b>, <i>switch</i> to a different Zoo." },
    [AnimalType.FLAMINGO]: { frame: 3, desc: "In case of a <b>tie</b>, I always <i>lose</i>." },
    [AnimalType.DOLPHIN]: { frame: 4, desc: "<b>Nobody wins nor loses</b>.\n<i>Discard</i> me; <i>Draw</i> a new card." },
}

export const MISC:Record<string, GeneralData> = 
{
    cycle_2: { frame: 0 },
    cycle_3: { frame: 1 },
    cycle_4: { frame: 2 },
    cycle_5: { frame: 3 },
    people_icon: { frame: 4 },
    textbox_zoo: { frame: 5 },
    textbox_animal: { frame: 6 },
}

export const TEMPLATES:Record<string, GeneralData> = 
{
    zoo: { frame: 0 },
    animal: { frame: 1 },
    texture: { frame: 2 },
}