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
        trajectories: false,
        bonusBalloons: false,
        multiRoutes: false
    },

    boardDisplay: null,
    convertParameters: { splitDims: "1x1" }, // @TODO: split system needs testing and work

    sheetData: null,

    generation:
    {
        method: GenerationMethod.DELAUNAY,
        numBlocksFullWidth: 12, // for knowing the scale at which to display everything
        numBlocksFullWidthMultipliers: { tiny: 0.5, small: 0.75, regular: 1.0, big: 1.5, huge: 2.0 },

        pageRatio: 1.41,
        minConnectionsPerPoint: 2,

        numBlockTypes: 5,

        connectionBounds: { min: 2.5, max: 3.5 }, // this is per point = city

        numTrajectoryBounds: { min: 3, max: 6}, // @TODO: scale with board size
        trajectorySize: new Point(3, 1), // this is relative to "block size"
        maxTrajectoryLength: 2.0, // relative to numBlocksFullWidth
        maxTrajectoryPoints: 20.0, 
        trajectoryVarietyMarginFactor: 1.33, // higher = less variety/balance, but more likely and faster solution

        numBonusBounds: { min: 0.2, max: 0.375 }, // relative to total number of blocks that COULD receive a bonus
        minRouteLengthForBonus: 1.5,

        numMultiRouteBlocks: { min: 0.1, max: 0.2 }, // relative to total number of blocks on the board
        minRouteLengthForMulti: 1.5,

        doubleRoutesInclude: true,
        doubleRouteBounds: { min: 0.1, max: 0.2 }, // relative to total number of routes

        numVisitorSpotsPerRoute: { min: 0.5, max: 0.75 },
        visitorSpotBounds: { min: 1, max: 5 },

        numCityBounds: { min: 16, max: 20 },
        numCityMultipliers: { tiny: 0.33, small: 0.66, regular: 1.0, big: 1.5, huge: 2.0 },

        cityRadius: 0.15,

        trackSizeBounds: { min: 0.1, max: 0.15 },
        startWithGrid: true,
        numRelaxIterations: 20,
        influenceDamping: 0.2,

        maxBlocksPerRoute: 5,
        maxBlocksOverflowBeforeRelaxation: 1, // to allow slightly longer routes at initial placement, and rely on relaxation to bring them in line later
        connRemovePercentage: 0.15
    },

    evaluator:
    {
        performTypeBalanceCheck: true,
        maxDifferenceTypeFrequency: 5,
        maxRoutesOfSameTypeAtPoint: 3,
        performTakeRouteAwayCheck: true,
    },

    display:
    {
        outerMargin: 0.1, // relative to (smallest) side of page
        playerAreas:
        {
            include: true
        },
        visitorSpotRadius: 0.1, // relative to blockSize
    }
}

export { CONFIG, GenerationMethod }
export default CONFIG
