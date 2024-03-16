import { EGGS_SHARED, TileDataDict } from "games/easter-eggventures/js_shared/dictShared";
import Point from "js/pq_games/tools/geometry/point";
import Bounds from "js/pq_games/tools/numbers/bounds";

enum TileType
{
    EGG = "egg",
    PAWN = "pawn",
    ROOM = "room",
    OBSTACLE = "obstacle"
}

enum CardType
{
    CLUE = "clue",
    SCORE = "score",
}

type MaterialType = TileType|CardType;

// Do we need this dictionary? YES. To assign the possible _slots_ of the room.
const ROOMS:TileDataDict =
{
    bedroom: { frame: 0, areas: [{ pos: new Point(445, 346) }] },
    bathroom: { frame: 1, areas: [{ pos: new Point(761, 745) }] },
    gym: { frame: 2, areas: [{ pos: new Point(282, 384) }] },
    office: { frame: 3, areas: [{ pos: new Point(260, 258) }, { pos: new Point(638, 630) }] },
    dining_room: { frame: 4, areas: [{ pos: new Point(522, 536) }] },
    living_room: { frame: 5, areas: [{ pos: new Point(512, 446) }] },
    play_room: { frame: 6, areas: [{ pos: new Point(530, 593) }, { pos: new Point(793, 244) }] },
    library: { frame: 7, areas: [{ pos: new Point(515, 624) }] },

    basement: { frame: 8, areas: [{ pos: new Point(330, 797) }] },
    attic: { frame: 9, areas: [{ pos: new Point(483, 609) }, { pos: new Point(703, 269) }] },
    foyer: { frame: 10, areas: [{ pos: new Point(207, 241) }, { pos: new Point(714, 591) }] },
    home_theatre: { frame: 11, areas: [{ pos: new Point(429, 381) }] },
    kitchen: { frame: 12, areas: [{ pos: new Point(546, 840) }, { pos: new Point(786, 224) }] },
    laundry_room: { frame: 13, areas: [{ pos: new Point(515, 684) }] },
    storage: { frame: 14, areas: [{ pos: new Point(537, 454) }] },
    garden: { frame: 15, areas: [{ pos: new Point(575, 199) }, { pos: new Point(255, 846) }] },

    home_theatre_2: { frame: 16, areas: [{ pos: new Point(773, 756) }], set: "cluesRooms" },
    bedroom_2: { frame: 17, areas: [{ pos: new Point(511, 218) }, { pos: new Point(646, 842) }] },
    bedroom_3: { frame: 18, areas: [{ pos: new Point(319, 471) }], set: "cluesRooms" },
    bathroom_2: { frame: 19, areas: [{ pos: new Point(713, 300) }, { pos: new Point(715, 795) }] },
    gym_2: { frame: 20, areas: [{ pos: new Point(503, 726) }] },
    gym_3: { frame: 21, areas: [{ pos: new Point(526, 510) }], set: "cluesRooms" },
    office_2: { frame: 22, areas: [{ pos: new Point(203, 824) }, { pos: new Point(803, 342) }] },
    office_3: { frame: 23, areas: [{ pos: new Point(332, 439) }], set: "cluesRooms" },

    dining_room_2: { frame: 24, areas: [{ pos: new Point(202, 834) }, { pos: new Point(788, 303) }] },
    dining_room_3: { frame: 25, areas: [{ pos: new Point(526, 603) }], set: "cluesRooms" },
    living_room_2: { frame: 26, areas: [{ pos: new Point(556, 406) }] },
    living_room_3: { frame: 27, areas: [{ pos: new Point(234, 316) }, { pos: new Point(517, 854) }], set: "cluesRooms" },
    playroom_2: { frame: 28, areas: [{ pos: new Point(669, 498) }] },
    playroom_3: { frame: 29, areas: [{ pos: new Point(743, 347) }], set: "cluesRooms" },
    library_2: { frame: 22, areas: [{ pos: new Point(209, 845) }, { pos: new Point(753, 289) }] },
    library_3: { frame: 23, areas: [{ pos: new Point(489, 729) }], set: "cluesRooms" },

    basement_2: { frame: 24, areas: [{ pos: new Point(317, 784) }] },
    basement_3: { frame: 25, areas: [{ pos: new Point(429, 560) }, { pos: new Point(796, 237) }], set: "cluesRooms" },
    attic_2: { frame: 26, areas: [{ pos: new Point(510, 804) }] },
    attic_3: { frame: 27, areas: [{ pos: new Point(680, 138) }, { pos: new Point(749, 802) }], set: "cluesRooms" },
    foyer_2: { frame: 28, areas: [{ pos: new Point(441, 644) }] },
    kitchen_2: { frame: 29, areas: [{ pos: new Point(270, 265) }, { pos: new Point(704, 830) }] },
    kitchen_3: { frame: 30, areas: [{ pos: new Point(774, 758) }], set: "cluesRooms" },
    laundry_room_2: { frame: 31, areas: [{ pos: new Point(498, 464) }] },

    laundry_room_3: { frame: 32, areas: [{ pos: new Point(516, 748) }] },
    storage_2: { frame: 33, areas: [{ pos: new Point(385, 560) }, { pos: new Point(697, 798) }], set: "cluesRooms" },
    storage_3: { frame: 34, areas: [{ pos: new Point(388, 817) }], set: "cluesRooms" },
    garden_2: { frame: 35, areas: [{ pos: new Point(176, 282) }, { pos: new Point(537, 814) }] },
    garden_3: { frame: 36, areas: [{ pos: new Point(546, 470) }] },
    garden_4: { frame: 37, areas: [{ pos: new Point(298, 697) }, { pos: new Point(677, 170) }], set: "cluesRooms" },
}

const OBSTACLES:TileDataDict =
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

const MATERIAL:Record<MaterialType, TileDataDict> = 
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

const TYPE_DATA:Record<MaterialType, TileTypeData> =
{
    [TileType.EGG]: { textureKey: "eggs", backgroundKey: "eggs_backgrounds", label: "Egg Token" },
    [TileType.ROOM]: { textureKey: "rooms", backgroundKey: "", label: "Room Tile" },
    [TileType.PAWN]: { textureKey: "", backgroundKey: "", label: "Player Pawn" },
    [TileType.OBSTACLE]: { textureKey: "objects", backgroundKey: "", label: "Object" },
    [CardType.CLUE]: { textureKey: "clue_cards", backgroundKey: "", label: "Clue Card" },
    [CardType.SCORE]: { textureKey: "", backgroundKey: "", label: "Score Card" },
}

export 
{
    ROOMS,
    OBSTACLES,
    TileType,
    CardType,
    MATERIAL,
    TYPE_DATA
}
