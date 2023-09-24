import Point from "js/pq_games/tools/geometry/point"
import Bounds from "js/pq_games/tools/numbers/bounds"


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
        mapWidth: 15,
        boardRatio: 1.44,

        squareSizeInPathPoints: 1, // after moving X points on the path, we start a new square

        paths:
        {
            smoothResolution: 10,
            thickness: 0.5, // relative to cell size / dist between two grid points
        }
    },

    evaluator:
    {

    },

    display:
    {
    }
}

export default CONFIG
