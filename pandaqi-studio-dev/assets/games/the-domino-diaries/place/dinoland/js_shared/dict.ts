
enum DominoType
{
    REGULAR = "regular",
    PAWN = "pawn",
    ASTEROID = "asteroid", // include crosshair + egghatch
    IMPACT = "impact"
}

enum TerrainType
{
    GRASS = "grass",
    STONE = "stone",
    WATER = "water",
    LAVA = "lava",
    DESERT = "desert",
    WILDCARD = "wildcard"
}

enum DinoType
{
    EGG = "egg", // neutral egg that will hatch into a dinosaur LATER
    TRI = "tri", // triceratops; thorny carnivore
    BRACHIO = "brachio", // brachiosaurus; long-necked herbivore
    VELO = "velo", // velociraptor
    STEGO = "stego", // stegosaurus; ankylosaurus another option
    WILDCARD = "wildcard"
}

interface GeneralData
{
    frame?: number,
    sets?: string[],
    needsArrow?: boolean,
    desc?: string,
    multi?: boolean, // if true, the card can appear multiple times; otherwise it's just once
}

const TERRAINS:Record<TerrainType, GeneralData> = 
{
    [TerrainType.GRASS]: { frame: 0, sets: ["base", "expansion"] },
    [TerrainType.STONE]: { frame: 1, sets: ["base", "expansion"] },
    [TerrainType.WATER]: { frame: 2, sets: ["base", "expansion"] },
    [TerrainType.LAVA]: { frame: 3, sets: ["base", "expansion"] },
    [TerrainType.DESERT]: { frame: 4, sets: ["expansion"] },
    [TerrainType.WILDCARD]: { frame: 5, sets: ["expansion"] }
}

const DINOS:Record<DinoType, GeneralData> =
{
    [DinoType.EGG]: { frame: 0, sets: ["base", "expansion"], desc: "Hatches when Egg Hatch on top of asteroid deck." },
    [DinoType.TRI]: { frame: 1, sets: ["base", "expansion"], desc: "Move crosshairs in direction of arrow.", needsArrow: true },
    [DinoType.BRACHIO]: { frame: 2, sets: ["base"], desc: "Look at the next 5 asteroid tiles." },
    [DinoType.VELO]: { frame: 3, sets: ["base", "expansion"], desc: "Discard the top asteroid tile." },
    [DinoType.STEGO]: { frame: 4, sets: ["expansion"], desc: "Look at or Replace any player's hand." },
    [DinoType.WILDCARD]: { frame: 5, sets: ["expansion"], desc: "Can be any dinosaur you want!" }
}

const ASTEROID_TILES:Record<string, GeneralData> =
{
    move_pawn: { frame: 0, desc: "Move one Pawn of yours to a different (unclaimed) Area.", multi: true },
    return_asteroid: { frame: 1, desc: "Put one discarded Asteroid Tile back into the deck at a random location." },
    switch_impact: { frame: 2, desc: "Switch the Impact Card to a different one." },
    move_crosshairs: { frame: 3, desc: "Move a Crosshair in any direction 3 times.", multi: true },
    draw_dominoes: { frame: 4, desc: "Draw 3 more dominoes into your hand." },
    swap_hand: { frame: 5, desc: "Swap your hand with another player's hand." },
    look_last: { frame: 6, desc: "Look at the FINAL 5 tiles of the Asteroid Deck." },
    overlap: { frame: 7, desc: "Place 1 Domino on top of others. It may not overlap a space with a Pawn.", multi: true },
    return_pawn: { frame: 8, desc: "Return any 1 Pawn on the board to its owner." },
    claim_again: { frame: 9, desc: "This turn, you may claim areas that were already claimed." },
    insta_end: { frame: 10, desc: "If everyone has used all their pawns, the game ends immediately." },
    hatch_all_terrain: { frame: 11, desc: "Hatch all eggs, but the terrain on the replacement must match the terrain below." },
    hatch_all_unclaimed: { frame: 12, desc: "Hatch all unclaimed eggs as if they belong to you." },
    rearrange_asteroid: { frame: 13, desc: "Look at the top 5 Asteroid Tiles and put them back in any order you want." },
    mini_impact: { frame: 14, desc: "Remove all dominoes that overlap the single space at which the Crosshairs point." }
}

// @TODO: a Tooth icon in the center indicates the "target" (the one place where the crosshairs meet)
const IMPACT_TILES:Record<string, GeneralData> =
{
    regular: { frame: 0, desc: "Destroy target and its 8 neighbors." },
    single: { frame: 1, desc: "Destroy all Areas with same color as target." },
    longest_row: { frame: 2, desc: "Destroys all squares in the longest row (of the two that the Crosshairs point at)." }, // just show both row and column (coming from crosshairs); in longest you highlight the LONGER one, in shortest you highlight the SHORTER one
    shortest_row: { frame: 3, desc: "Destroys all squares in the shortest row (of the two that the Crosshairs point at)."},
    regular_wrap: { frame: 4, desc: "Destroy target and its 8 neighbors, including wrapping around the map. (If you go off the map one side, return on the opposite side.)" },
    radius_double: { frame: 5, desc: "Destroy all squares within a distance of 2 of target." },
    radius_double_kind: { frame: 6, desc: "Destroy all squares within a distance of 2 of target, but not diagonally." },
    radius_double_noarea: { frame: 7, desc: "Destroy all squares within a distance of 2 of target. Destroying a single square, however, does NOT destroy its entire area." },
    single_dino: { frame: 8, desc: "Destroy all squares with the same (lack of) dinosaur as target. (Destroying a single square, however, does NOT destroy its entire area.)" },
    regular_kind: { frame: 9, desc: "Destroy target and its 8 neighbors, but not diagonally." },
    random_shape_0: { frame: 10, desc: "Destroy these squares. (The tooth indicates the position of the asteroid target.)" }, // these are just some locations around the target in some pattern, which is easier to visualize than to describe
    random_shape_1: { frame: 11, desc: "Destroy these squares. (The tooth indicates the position of the asteroid target.)" },
    random_shape_2: { frame: 12, desc: "Destroy these squares. (The tooth indicates the position of the asteroid target.)" },
    random_shape_3: { frame: 13, desc: "Destroy these squares. (The tooth indicates the position of the asteroid target.)" },
    random_shape_5: { frame: 14, desc: "Destroy these squares. (The tooth indicates the position of the asteroid target.)" },
    regular_limit: { frame: 15, desc: "Destroy target and its 8 neighbors. Areas are only fully destroyed, however, if the asteroid hits multiple spaces inside them." }
}

const MISC:Record<string, GeneralData> =
{
    arrow: { frame: 0 },
    asteroid_crosshair: { frame: 1 },
    asteroid_regular: { frame: 2, desc: "A regular Asteroid tile." },
    asteroid_egghatch: { frame: 3, desc: "Hatch all eggs!" }
}

export 
{
    TERRAINS,
    DINOS,
    MISC,
    ASTEROID_TILES,
    IMPACT_TILES,
    DinoType,
    DominoType,
    TerrainType,
}