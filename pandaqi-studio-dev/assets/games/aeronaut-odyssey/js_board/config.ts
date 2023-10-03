import Point from "js/pq_games/tools/geometry/point"

enum GenerationMethod
{
    DELAUNAY,
    ROPE
}

const CONFIG = {
    resLoader: null,

    inkFriendly: false,
    boardSize: "regular",
    printSize: "singlePage",
    expansions: 
    {
        trajectories: false,
        bonusBalloons: false,
        multiRoutes: false,
        wildWinds: false,
    },

    assetsBase: "/aeronaut-odyssey/assets/",
    assets:
    {
        "block_icons":
        {
            src: "block_icons.webp",
            frames: new Point(10,1)
        }
    },

    boardDisplay: null,
    convertParameters: { splitDims: "1x1" }, // @TODO: split system needs testing and work

    sheetData: null,

    generation:
    {
        method: GenerationMethod.DELAUNAY,
        numBlocksFullWidth: 12, // for knowing the scale at which to display everything
        numBlocksFullWidthMultipliers: { tiny: 0.5, small: 0.75, regular: 1.0, large: 1.5, huge: 2.0 },
        blockHeightRelativeToWidth: 0.25,

        pageRatio: 1.41428571,
        minConnectionsPerPoint: 2,
        minBoardSpan: 0.8, // how much of the paper size should be used by the graph

        requiredAreaSize: 0.2, // the first few points are placed in the corners (required), how much freedom do they have?
        reduceConnectivityAfterTriangulation: false, // @DEBUGGING should probably be true

        numBlockTypes: 6,

        connectionBounds: { min: 3.0, max: 3.375 }, // this is per point = city

        forbiddenAreaGrowFactor: 0.25,

        routeOverlapThicknessFactor: 0.3, // how thick it makes the paths when checking for overlap; 1.0 = actual size

        numTrajectoryBounds: { min: 3, max: 6}, // @TODO: scale with board size
        trajectorySize: new Point(2, 0.5), // this is relative to "block size"
        maxTrajectoryLength: 2.0, // relative to numBlocksFullWidth
        maxTrajectoryPoints: 20.0, 
        minTrajectoryScore: 2,
        trajectoryVarietyMarginFactor: 1.33, // higher = less variety/balance, but more likely and faster solution

        numBonusBounds: { min: 0.2, max: 0.375 }, // relative to total number of blocks that COULD receive a bonus
        minRouteLengthForBonus: 1.5,

        numMultiRouteBlocks: { min: 0.125, max: 0.225 }, // relative to total number of blocks on the board
        minRouteLengthForMulti: 1.5,

        doubleRoutesInclude: true,
        doubleRouteBounds: { min: 0.15, max: 0.33 }, // relative to total number of routes

        numVisitorSpotsPerRoute: { min: 0.75, max: 1.25 },
        visitorSpotBounds: { min: 3, max: 6 },

        numCityBounds: { min: 16, max: 20 },
        numCityMultipliers: { tiny: 0.33, small: 0.66, regular: 1.0, large: 1.5, huge: 2.0 },

        cityRadius: 0.3,

        trackSizeBounds: { min: 0.1, max: 0.15 },
        startWithGrid: true,

        relaxPoints: true,
        numRelaxIterations: 20,
        influenceDamping: 0.2,

        addRandomCurvesWhenUnnecessary: true,

        maxBlocksPerRoute: 5,
        maxBlocksOverflowBeforeRelaxation: 1, // to allow slightly longer routes at initial placement, and rely on relaxation to bring them in line later
        connRemovePercentage: 0.15
    },

    evaluator:
    {
        enable: false, // @DEBUGGING (should be true)
        performTypeBalanceCheck: true,
        maxDifferenceTypeFrequency: 6,
        maxRoutesOfSameTypeAtPoint: 2,
        performTakeRouteAwayCheck: true,
        performGraphRemovals: false,
    },

    display:
    {
        outerMargin: 0.0, // relative to (smallest) side of page
        outerMarginBoard: 0.85, // relative to block size; @TODO: move to generation?
        playerAreas:
        {
            include: true,
            numSpacesPerRoute: 3.0 / 4.0, // multiplied by number of routes to get total spaces inside player areas; motivation = ~3 spaces per route avg, ~4 players avg
            edgeOffset: new Point(0.04, 0.02),
            sizeRaw: new Point(0.35, 0.5), // X is relative (scales to stay consistent), Y is absolute (shrinks as map gets bigger)
        },

        blocks:
        {
            iconSize: 0.8, // relative to maximum space (min of width and height)
            bevelOffset: 0.125, // relative to full block length
            writingSpaceScale: 0.9 // relative to maximum space
        },

        cityDotRadius: 0.333, // relative to full cityRadius
        cityNameRadius: 0.9, // relative to full cityDotRadius
        visitorSpotRadius: 0.1, // relative to blockSize
        numVisitorSpotAngles: 6,
        maxAvoidanceAngleBetweenRoutes: 1*Math.PI, // if angle is greater, those routes (from the same point) won't clash anyway, so ignore
        maxAngleCurveAnyway: 0.35*Math.PI,

        debugDrawOverlapRectangle: true, // @DEBUGGING (should be false)
    }
}

export { CONFIG, GenerationMethod }
export default CONFIG
