
enum CardType
{
    ZOO,
    ANIMAL
}

// the actual background/decorations on cards is a dark green/brown vibe
enum AnimalType
{
    LION = "lion", // yellow
    FOX = "fox", // orange-brown-red
    PANDA = "panda", // black-white
    FLAMINGO = "flamingo", // pink-purple
    DOLPHIN = "dolphin", // turquoise-blue
}

interface GeneralData
{
    frame?: number,
    desc?: string,
    hideCycle?: boolean,
    requirePeople?: boolean,
    forbidPeople?: boolean,
}

const ZOO_CARDS:Record<string, GeneralData> = 
{
    autowin: { desc: "<b>%animal% always wins</b>, everything else is a tie.", hideCycle: true },
    autolose: { desc: "<b>%animal% always loses</b>, everything else is a tie.", hideCycle: true },
    player_exclude: { desc: "Pick one player who does <b>not</b> get to roll.", requirePeople: true },
    extra_rule: { desc: "<b>%animal% > Animal %animal%</b>. If those two exact animals are played, this rule determines who wins.", forbidPeople: true },
    die_split: { desc: "Only use <b>%cyclesize% cards</b> for your die. (Temporarily set your other cards aside while rolling.)" },
    double_roll: { desc: "All battlers roll <b>twice</b>, in-turn, and pick <i>which of the two outcomes</i> they want to keep." }
}

const ANIMALS:Record<AnimalType, GeneralData> =
{
    [AnimalType.LION]: { frame: 0, desc: "In case of a <b>tie</b>, I always <i>win</i>." },
    [AnimalType.FOX]: { frame: 1, desc: "You may request a <b>re-roll</b>. (The fox ability can only trigger <i>once</i> per battle.)" },
    [AnimalType.PANDA]: { frame: 2, desc: "If I'm <b>not on the Zoo Card</b>, <i>switch</i> to a different Zoo Card; re-roll." },
    [AnimalType.FLAMINGO]: { frame: 3, desc: "In case of a <b>tie</b>, I always <i>lose</i>." },
    [AnimalType.DOLPHIN]: { frame: 4, desc: "<b>Nobody wins or loses</b> this battle. <i>Discard</i> this card and <i>draw</i> a new one from deck." },
}

const MISC:Record<string, GeneralData> = 
{
    cycle_2: { frame: 0 },
    cycle_3: { frame: 1 },
    cycle_4: { frame: 2 },
    cycle_5: { frame: 3 },
    people_icon: { frame: 4 },
    textbox_zoo: { frame: 5 },
    textbox_animal: { frame: 6 },
}

const TEMPLATES:Record<string, GeneralData> = 
{
    zoo: { frame: 0 },
    animal: { frame: 1 },
    texture: { frame: 2 },
}

export 
{
    MISC,
    ANIMALS,
    ZOO_CARDS,
    TEMPLATES,
    CardType,
    AnimalType
}