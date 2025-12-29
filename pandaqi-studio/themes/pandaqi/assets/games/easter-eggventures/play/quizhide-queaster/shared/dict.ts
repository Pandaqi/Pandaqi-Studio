import { EGGS_SHARED, TileDataDict } from "games/easter-eggventures/shared/dictShared";
import { Vector2, Bounds } from "lib/pq-games";

export enum TileType
{
    EGG = "egg",
    PAWN = "pawn",
    ROOM = "room",
    OBSTACLE = "obstacle"
}

export enum CardType
{
    CLUE = "clue",
    SCORE = "score",
}

type MaterialType = TileType|CardType;

// Do we need this dictionary? YES. To assign the possible _slots_ of the room.
export const ROOMS:TileDataDict =
{
    bedroom: { frame: 0, areas: [{ pos: new Vector2(445, 346) }] },
    bathroom: { frame: 1, areas: [{ pos: new Vector2(761, 745) }] },
    gym: { frame: 2, areas: [{ pos: new Vector2(282, 384) }] },
    office: { frame: 3, areas: [{ pos: new Vector2(260, 258) }, { pos: new Vector2(638, 630) }] },
    dining_room: { frame: 4, areas: [{ pos: new Vector2(522, 536) }] },
    living_room: { frame: 5, areas: [{ pos: new Vector2(512, 446) }] },
    play_room: { frame: 6, areas: [{ pos: new Vector2(530, 593) }, { pos: new Vector2(793, 244) }] },
    library: { frame: 7, areas: [{ pos: new Vector2(515, 624) }] },

    basement: { frame: 8, areas: [{ pos: new Vector2(330, 797) }] },
    attic: { frame: 9, areas: [{ pos: new Vector2(483, 609) }, { pos: new Vector2(703, 269) }] },
    foyer: { frame: 10, areas: [{ pos: new Vector2(207, 241) }, { pos: new Vector2(714, 591) }] },
    home_theatre: { frame: 11, areas: [{ pos: new Vector2(429, 381) }] },
    kitchen: { frame: 12, areas: [{ pos: new Vector2(546, 840) }, { pos: new Vector2(786, 224) }] },
    laundry_room: { frame: 13, areas: [{ pos: new Vector2(515, 684) }] },
    storage: { frame: 14, areas: [{ pos: new Vector2(537, 454) }] },
    garden: { frame: 15, areas: [{ pos: new Vector2(575, 199) }, { pos: new Vector2(255, 846) }] },

    home_theatre_2: { frame: 16, areas: [{ pos: new Vector2(773, 756) }], set: "cluesRooms" },
    bedroom_2: { frame: 17, areas: [{ pos: new Vector2(511, 218) }, { pos: new Vector2(646, 842) }] },
    bedroom_3: { frame: 18, areas: [{ pos: new Vector2(319, 471) }], set: "cluesRooms" },
    bathroom_2: { frame: 19, areas: [{ pos: new Vector2(713, 300) }, { pos: new Vector2(715, 795) }] },
    gym_2: { frame: 20, areas: [{ pos: new Vector2(503, 726) }] },
    gym_3: { frame: 21, areas: [{ pos: new Vector2(526, 510) }], set: "cluesRooms" },
    office_2: { frame: 22, areas: [{ pos: new Vector2(203, 824) }, { pos: new Vector2(803, 342) }] },
    office_3: { frame: 23, areas: [{ pos: new Vector2(332, 439) }], set: "cluesRooms" },

    dining_room_2: { frame: 24, areas: [{ pos: new Vector2(202, 834) }, { pos: new Vector2(788, 303) }] },
    dining_room_3: { frame: 25, areas: [{ pos: new Vector2(526, 603) }], set: "cluesRooms" },
    living_room_2: { frame: 26, areas: [{ pos: new Vector2(556, 406) }] },
    living_room_3: { frame: 27, areas: [{ pos: new Vector2(234, 316) }, { pos: new Vector2(517, 854) }], set: "cluesRooms" },
    playroom_2: { frame: 28, areas: [{ pos: new Vector2(669, 498) }] },
    playroom_3: { frame: 29, areas: [{ pos: new Vector2(743, 347) }], set: "cluesRooms" },
    library_2: { frame: 30, areas: [{ pos: new Vector2(209, 845) }, { pos: new Vector2(753, 289) }] },
    library_3: { frame: 31, areas: [{ pos: new Vector2(489, 729) }], set: "cluesRooms" },

    basement_2: { frame: 32, areas: [{ pos: new Vector2(317, 784) }] },
    basement_3: { frame: 33, areas: [{ pos: new Vector2(429, 560) }, { pos: new Vector2(796, 237) }], set: "cluesRooms" },
    attic_2: { frame: 34, areas: [{ pos: new Vector2(510, 804) }] },
    attic_3: { frame: 35, areas: [{ pos: new Vector2(680, 138) }, { pos: new Vector2(749, 802) }], set: "cluesRooms" },
    foyer_2: { frame: 36, areas: [{ pos: new Vector2(441, 644) }] },
    kitchen_2: { frame: 37, areas: [{ pos: new Vector2(270, 265) }, { pos: new Vector2(704, 830) }] },
    kitchen_3: { frame: 38, areas: [{ pos: new Vector2(774, 758) }], set: "cluesRooms" },
    laundry_room_2: { frame: 39, areas: [{ pos: new Vector2(498, 464) }] },

    laundry_room_3: { frame: 40, areas: [{ pos: new Vector2(516, 748) }], set: "cluesRooms" },
    storage_2: { frame: 41, areas: [{ pos: new Vector2(385, 560) }, { pos: new Vector2(697, 798) }], set: "cluesRooms" },
    storage_3: { frame: 42, areas: [{ pos: new Vector2(388, 817) }], set: "cluesRooms" },
    garden_2: { frame: 43, areas: [{ pos: new Vector2(176, 282) }, { pos: new Vector2(537, 814) }] },
    garden_3: { frame: 44, areas: [{ pos: new Vector2(546, 470) }], set: "cluesRooms" },
    garden_4: { frame: 45, areas: [{ pos: new Vector2(298, 697) }, { pos: new Vector2(677, 170) }], set: "cluesRooms" },
}

export const OBSTACLES:TileDataDict =
{
    // @NOTE: frame 0 skip because it holds the egg_slot graphic
    pillow: { frame: 1 },
    pot_plant: { frame: 2 },
    table: { frame: 3 },
    cloth: { frame: 4 },
    sofa: { frame: 5 },
    rug: { frame: 6 },
    bowl: { frame: 7 }
}

export const MATERIAL:Record<MaterialType, TileDataDict> = 
{
    [TileType.EGG]: EGGS_SHARED,
    [TileType.ROOM]: ROOMS,
    [TileType.PAWN]: {},
    [TileType.OBSTACLE]: OBSTACLES,
    [CardType.CLUE]: {},
    [CardType.SCORE]: {},
}

interface TileTypeData
{
    textureKey: string,
    backgroundKey: string,
    label: string,
    color?: string,
    backgroundRandom?: Bounds // selects one of its frames from the background spritesheet at random 
}

export const TYPE_DATA:Record<MaterialType, TileTypeData> =
{
    [TileType.EGG]: { textureKey: "eggs", backgroundKey: "eggs_backgrounds", label: "Egg Token" },
    [TileType.ROOM]: { textureKey: "rooms", backgroundKey: "", label: "Room Tile" },
    [TileType.PAWN]: { textureKey: "", backgroundKey: "", label: "Player Pawn" },
    [TileType.OBSTACLE]: { textureKey: "objects", backgroundKey: "", label: "Object" },
    [CardType.CLUE]: { textureKey: "clue_cards", backgroundKey: "", label: "Clue Card" },
    [CardType.SCORE]: { textureKey: "", backgroundKey: "", label: "Score Card" },
}