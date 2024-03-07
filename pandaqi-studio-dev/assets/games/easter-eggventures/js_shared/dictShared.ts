import Point from "js/pq_games/tools/geometry/point";

interface Area
{
    pos: Point,
    type: string
}

type AreaList = Area[];

interface TileData
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

type TileDataDict = Record<string,TileData>;

const EGGS_SHARED:TileDataDict =
{
    red: { frame: 0, color: "#E61948", invertContrast: true },
    green: { frame: 1, color: "#3CB44B", invertContrast: true },
    yellow: { frame: 2, color: "#FFE119" },
    blue: { frame: 3, color: "#4363D8", invertContrast: true },
    orange: { frame: 4, color: "#F58231" },
    cyan: { frame: 5, color: "#42D4F4" },
    magenta: { frame: 6, color: "#F032E6", invertContrast: true },
    pink: { frame: 7, color: "#FABED4" },
}


const MISC_SHARED = 
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

export
{
    EGGS_SHARED,
    MISC_SHARED,
    TileData,
    TileDataDict
}