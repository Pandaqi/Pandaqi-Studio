import { Bounds } from "lib/pq-games"

export enum GenerationMethod
{
    DELAUNAY,
    ROPE
}

export const CONFIG = 
{
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
        gridJitterBounds: new Bounds(0.1, 0.35), // relative to distBetweenPoints
        edgeJitterChunkSize: 1.0,
        edgeJitterBounds: new Bounds(0.05, 0.9), // relative to chunkSize of jitter
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
            sizeBounds: new Bounds(10, 25),
            oceanSizeFactor: 2.0,
        },

        continents:
        {
            sizeBounds: new Bounds(3, 8),
            maxColorChange: 20,
            scorePerArea: 1,
            scoreRegionDensityBounds: new Bounds(0.5, 3),
            scoreRandomness: new Bounds(-1.5, 1.5)
        }
    },

    evaluator:
    {

    },

    display:
    {
        smoothOutlines: true
    }
}