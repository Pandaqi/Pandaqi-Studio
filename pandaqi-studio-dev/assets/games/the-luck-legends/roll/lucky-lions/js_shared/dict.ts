
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
    autowin: { desc: "Animal %animal% always wins, everything else is a tie.", hideCycle: true },
    autolose: { desc: "Animal %animal% always loses, everything else is a tie.", hideCycle: true },
    player_exclude: { desc: "Pick one player who does <b>not</b> get to roll.", requirePeople: true },
    extra_rule: { desc: "Animal %animal% > Animal %animal%. If those two exact animals are played, this rule determines who wins.", forbidPeople: true },
    die_split: { desc: "Only use %cyclesize% cards for your die. (Temporarily set your other cards aside while rolling.)" },
    double_roll: { desc: "All battlers roll <b>twice</b>, in-turn, and pick which of the two outcomes they want to keep." }
}

const ANIMALS:Record<AnimalType, GeneralData> =
{
    [AnimalType.LION]: { frame: 0, desc: "In case of a tie, I always win." },
    [AnimalType.FOX]: { frame: 1, desc: "You may request a re-roll. (The fox ability can only trigger once per battle.)" },
    [AnimalType.PANDA]: { frame: 2, desc: "If I'm not on the Zoo Card, switch to a different Zoo Card; re-roll." },
    [AnimalType.FLAMINGO]: { frame: 3, desc: "In case of a tie, I always lose." },
    [AnimalType.DOLPHIN]: { frame: 4, desc: "Nobody wins or loses this battle. Discard this card and draw a new one from deck." },
}

const MISC:Record<string, GeneralData> = 
{
    cycle_2: { frame: 0 },
    cycle_3: { frame: 1 },
    cycle_4: { frame: 2 },
    cycle_5: { frame: 3 },
    cycle_hidden: { frame: 4 }
}

export 
{
    MISC,
    ANIMALS,
    ZOO_CARDS,
    CardType,
    AnimalType
}