import Point from "js/pq_games/tools/geometry/point"

enum GenerationMethod
{
    DELAUNAY,
    ROPE
}

const CONFIG = {
    inkFriendly: false,
    boardSize: "regular",
    printSize: "singlePage",
    expansions: 
    {
        
    },

    convertParameters: { splitDims: "1x1" }, // @TODO: split system needs testing and work

    sheetData: null,

    generation:
    {
        mapWidth: 100,
        distBetweenPoints: 3,
        gridJitterBounds: { min: 0.1, max: 0.35 }, // relative to distBetweenPoints
        boardRatio: 1.44,
        
        noise: 
        {
            scaleFactor: 2, // lower = more zoomed in and consistent, less erratic
            numOctaves: 4,
            dampFactor: 0.66, // 1 = fully damped at edge, 0 = no influence at all
            seaLevel: 0.5,
        },

        areas:
        {
            sizeBounds: { min: 10, max: 25 },
            oceanSizeFactor: 2.0,
        },

        continents:
        {
            sizeBounds: { min: 2, max: 8 },
            maxColorChange: 20,
        }
    },

    evaluator:
    {

    },

    display:
    {

    }
}

export { CONFIG, GenerationMethod }
export default CONFIG
