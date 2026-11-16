
export const SETS = 
{
    baseGame: {},
    secondSleigh: {},
    toughTrees: {}
}

interface TileData
{
    frame: number,
    color?: string,
    bgLight?: boolean,
    custom?: boolean, // whether they need custom logic for drawing
}

export const TILES: Record<string, TileData> = 
{
    sleigh: { frame: 0, color: "#3D04A5" },
    reindeer: { frame: 1, color: "#410800" },
    house: { frame: 2, color: "#003A70", custom: true },
    tree: { frame: 3, color: "#094C01" },
    present_square: { frame: 4, bgLight: true },
    present_circle: { frame: 5, bgLight: true },
    present_triangle: { frame: 6, bgLight: true },
    wildcard: { frame: 7, bgLight: true },
}

interface MiscData
{
    frame: number,
}

export const MISC:Record<string, MiscData> =
{
    bg_hole: { frame: 0 }, // better for LIGHT backgrounds (e.g. present white)
    bg_hole_inverse: { frame: 1 }, // better for DARK backgrounds (basically everything else)
    UNUSED: { frame: 2 },
    points_star: { frame: 3 }
}

interface ActionData
{
    label: string,
    desc: string
}

export const SPECIAL_ACTIONS:Record<string, ActionData> = 
{
    destroy: { label: "Destroy", desc: "Remove one tile from the board." },
    add: { label: "Add", desc: "Add one tile to the board, ignoring placement rules." },
    free_sleigh: { label: "Free Sleigh", desc: "Move the sleigh once WITHOUT removing the tiles it passes." },
    teleport_sleigh: { label: "Teleport Sleigh", desc: "Teleport the sleigh to any other (valid) location." },
    copycat_number: { label: "Copycat Number", desc: "This tile becomes the same number as its highest neighbor." },
    copycat_type: { label: "Copycat Type", desc: "This tile becomes the same type as its highest neighbor." },
    satisfied: { label: "Satisfied", desc: "All adjacent houses are also satisfied if you deliver one wrong present." },
    replace: { label: "Replace", desc: "This is a wildcard. You must place it ON TOP of an existing tile." },
    swap_hand: { label: "Swap Hand", desc: "Shuffle your hand tiles back into the deck, then draw a new hand." },
}