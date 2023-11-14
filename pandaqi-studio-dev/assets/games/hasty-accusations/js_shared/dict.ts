enum Type
{
    CHARACTER,
    POWER
}

interface PowerData
{
    core?: boolean,
    label?: string,
    frame?: number, // default frame in default spritesheet, applicable to MOST (non-dynamic) powers
    drawNum?: number, // how many cards you may draw at end of turn
    reqs?: string[] // any requirements that should be dynamically filled in
    prob?: number,
    desc?: string
}

// @NOTE: power names should not have underscores; those are used for creating dynamic keys for powers that need it
// (and thus, when drawing the card, to check which specific subType we have to draw)
type PowerSet = Record<string, PowerData>;
const POWERS:PowerSet = 
{
    skip: { label: "Skip Turn", drawNum: 2, frame: 0, prob: 1.5, desc: "Skip your turn.", core: true },
}

const MISC =
{
    // @TODO
}

export 
{
    Type,
    PowerData,
    POWERS,
    MISC
}
