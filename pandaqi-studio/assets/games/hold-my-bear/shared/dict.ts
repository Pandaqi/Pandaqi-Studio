export interface AnimalData
{
    frame: number,
    color: string,
    expansion?: boolean,
    type?: Action,
    desc?: string
}

enum Action
{
    PLAYED = "WHEN PLAYED", // the action triggers when card is played as part of match
    ALWAYS = "ALWAYS", // the action should always be taken into account
    GIVEN = "WHEN GIVEN", // the action triggers when this card is given away
}

export const ANIMALS:Record<string, AnimalData> = {
    // base set
    bear: { frame: 0, color: "brown" },
    ferret: { frame: 1, color: "blue" },
    tiger: { frame: 2, color: "orange" },
    chicken: { frame: 3, color: "yellow" },
    dog: { frame: 4, color: "turquoise" },
    cat: { frame: 5, color: "purple" },
    hamster: { frame: 6, color: "pink" },
    vole: { frame: 7, color: "green" },

    // expansion
    aardvark: { frame: 0, color: "pink", expansion: true, type: Action.PLAYED, desc: "Take one card from your match back into your hand." },
    giraffe: { frame: 1, color: "yellow", expansion: true, type: Action.PLAYED, desc: "Pick an animal. All players say how many such cards they have." },
    turtle: { frame: 2, color: "blue", expansion: true, type: Action.GIVEN, desc: "The receiver has to give back another card from their hand." },
    beaver: { frame: 3, color: "orange", expansion: true, type: Action.GIVEN, desc: "The receiver MUST choose to give away cards on their next turn." },
    ape: { frame: 4, color: "green", expansion: true, type: Action.ALWAYS, desc: "Can only be played in combination with other animals." },
    bat: { frame: 5, color: "gray", expansion: true, type: Action.ALWAYS, desc: "Not allowed in a match that plays multiple sports." },
    walrus: { frame: 6, color: "blue", expansion: true, type: Action.ALWAYS, desc: "Can't be combined with other animals." },
    fish: { frame: 7, color: "blue", expansion: true, type: Action.PLAYED, desc: "Becomes the same number as the highest non-fish card." },
    squid: { frame: 8, color: "purple", expansion: true, type: Action.ALWAYS, desc: "Can only be played in a match that plays multiple sports." },
    badger: { frame: 9, color: "pink", expansion: true, type: Action.PLAYED, desc: "The owner of the previous match steals a random card from you." },
    kangaroo: { frame: 10, color: "orange", expansion: true, type: Action.PLAYED, desc: "Ask a player for a card (number + animal). They give it, if possible." },
    bison: { frame: 11, color: "purple", expansion: true, type: Action.GIVEN, desc: "If the receiver has a bear, they must give one to you." },
    rabbit: { frame: 12, color: "gray", expansion: true, type: Action.PLAYED, desc: "If somebody CAN play a valid move, they MUST do so." },
    sheep: { frame: 13, color: "turquoise", expansion: true, type: Action.ALWAYS, desc: "If used for a move, it's also valid to TIE the current match." },
}

export const COLORS = {
    brown: "#5E2C04",
    blue: "#385D97",
    turquoise: "#49A078",
    green: "#3BC14A",
    purple: "#C349FC",
    pink: "#AF3966",
    orange: "#DD6E42",
    yellow: "#C49F1D",
    gray: "#ECECEC"
}