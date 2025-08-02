import Point from "js/pq_games/tools/geometry/point";

export enum EggType
{
    RED = "red",
    GREEN = "green",
    YELLOW = "yellow",
    BLUE = "blue",
    ORANGE = "orange",
    CYAN = "cyan",
    MAGENTA = "magenta",
    PINK = "pink"
}

export interface Area
{
    pos: Point,
    type?: string
}

export type AreaList = Area[];

export interface TileData
{
    frame?: number,
    label?: string,
    desc?: string,
    descNeg?: string,
    freq?: number,
    prob?: number,
    color?: string,
    invertContrast?: boolean,
    set?: string,
    type?: any,
    areas?: AreaList,
}

export type TileDataDict = Record<string,TileData>;

export const EGGS_SHARED:Record<EggType, TileData> =
{
    [EggType.RED]: { frame: 0, color: "#E61948", invertContrast: true },
    [EggType.GREEN]: { frame: 1, color: "#3CB44B", invertContrast: true },
    [EggType.YELLOW]: { frame: 2, color: "#FFE119" },
    [EggType.BLUE]: { frame: 3, color: "#4363D8", invertContrast: true },
    [EggType.ORANGE]: { frame: 4, color: "#F58231" },
    [EggType.CYAN]: { frame: 5, color: "#42D4F4" },
    [EggType.MAGENTA]: { frame: 6, color: "#F032E6", invertContrast: true },
    [EggType.PINK]: { frame: 7, color: "#FABED4" },
}


export const MISC_SHARED = 
{
    bg_pattern_0: { frame: 0 },
    bg_pattern_1: { frame: 1 },
    bg_pattern_2: { frame: 2 },
    bg_pattern_3: { frame: 3 },
    gradient: { frame: 4 },
    lightrays: { frame: 5 },
    number_bg: { frame: 6 },
    text_bg: { frame: 7 }
}