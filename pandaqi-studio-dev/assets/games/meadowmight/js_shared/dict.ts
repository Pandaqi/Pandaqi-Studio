interface TileConfig
{
    fences?: boolean[], // four values; "true" means that side gets a fence
    numPlayer?: number, // default is 1
    numEmpty?: number, // default is whatever's set in config
    numSheep?: number, // default is whatever's set in config
    numWolf?: number, // default is whatever's set in config (should probably be 1)
}

const TILE_TYPES:Record<string,TileConfig> =
{
    open: { fences: [false, false, false, false] },
    single: { fences: [true, false, false, false] },
    double_corner: { fences: [true, true, false, false] },
    double_parallel: { fences: [true, false, true, false] },
    triple: { fences: [true, true, true, false] },
    closed: { fences: [true, true, true, true], numSheep: 0, numPlayer: 0, numWolf: 0 }
}

interface PlayerSheepConfig
{
    frame: number,
    color?: string,
}

const PLAYER_SHEEP:Record<string,PlayerSheepConfig> =
{
    player0: { frame: 0 },
    player1: { frame: 1 },
    player2: { frame: 2 },
    player3: { frame: 3 },
    player4: { frame: 4 }
}

const ASSETS =
{
    grass: { frame: 0 },
    sheep: { frame: 1 }, // neutral sheep; player sheeps are separate spritesheet
    fence: { frame: 2 },
    wolf: { frame: 3 },
}

export 
{
    ASSETS,
    PLAYER_SHEEP,
    TILE_TYPES
}
