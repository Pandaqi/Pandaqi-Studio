
const SETS = 
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

const TILES: Record<string, TileData> = 
{
    sleigh: { frame: 0, color: "#3D04A5" },
    reindeer: { frame: 1, color: "#410800" },
    house: { frame: 2, color: "#003A70", custom: true },
    tree: { frame: 3, color: "#094C01" },
    present_square: { frame: 4, bgLight: true },
    present_circle: { frame: 5, bgLight: true },
    present_triangle: { frame: 6, bgLight: true },
    wildcard: { frame: 7, bgLight: true }
}

interface MiscData
{
    frame: number,
}

const MISC:Record<string, MiscData> =
{
    bg_hole: { frame: 0 }, // better for LIGHT backgrounds (e.g. present white)
    bg_hole_inverse: { frame: 1 }, // better for DARK backgrounds (basically everything else)
    UNUSED: { frame: 2 },
    points_star: { frame: 3 }
}

export 
{
    TILES,
    MISC,
    SETS
}
