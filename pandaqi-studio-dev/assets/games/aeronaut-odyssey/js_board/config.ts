import Point from "js/pq_games/tools/geometry/point"
import Bounds from "js/pq_games/tools/numbers/bounds"

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
    useRealMaterial: false,
    boardClarity: "clean",

    expansions: 
    {
        trajectories: false,
        bonusBalloons: false,
        multiRoutes: false,
        wildWinds: false,
    },

    fonts:
    {
        heading: "ArmWrestler"
    },

    assetsBase: "/aeronaut-odyssey/assets/",
    assets:
    {
        block_icons:
        {
            path: "block_icons.webp",
            frames: new Point(10,1)
        },

        bonus_icons:
        {
            path: "bonus_icons.webp",
            frames: new Point(10,1)
        }
    },

    boardDisplay: null,

    blockSizeOverride: null, // used by "use real material" to get the right block length for plastic trains
    numBlocksXOverride: null,

    sheetData: null,

    generation:
    {
        method: GenerationMethod.DELAUNAY,
        numBlocksFullWidth: 12, // for knowing the scale at which to display everything
        numBlocksFullWidthMultipliers: { tiny: 0.5, small: 0.75, regular: 1.0, large: 1.5, huge: 2.0 },
        blockHeightRelativeToWidth: 0.25,

        outerMarginBoard: 0.85, // relative to block size; (here because this must be taken into account during generation)
        pageRatio: 1.41428571,
        minConnectionsPerPoint: 2,
        minBoardSpan: 0.8, // how much of the paper size should be used by the graph

        requiredAreaSize: 0.2, // the first few points are placed in the corners (required), how much freedom do they have?
        reduceConnectivityAfterTriangulation: false, // @DEBUGGING should probably be true

        numBlockTypes: 6,

        connectionBounds: { min: 3.0, max: 3.375 }, // this is per point = city

        forbiddenAreaGrowFactor: 0.25,

        routeOverlapThicknessFactor: 0.3, // how thick it makes the paths when checking for overlap; 1.0 = actual size

        numTrajectoryMultipliers: { tiny: 0.75, small: 0.85, regular: 1.0, large: 1.33, huge: 1.5 },
        numTrajectoryBounds: { min: 3, max: 5 },
        trajectorySize: new Point(2, 0.5), // this is relative to "block size"
        calculatedTrajectoryRectOffset: null, // as it says: calculated during generation
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
        playerAreas:
        {
            include: true,
            numSpacesPerRoute: 2.0 / 4.0, // multiplied by number of routes to get total spaces inside player areas; motivation = ~3 spaces per route avg, ~4 players avg
            edgeOffset: new Point(0.02, 0.02),
            sizeRaw: new Point(0.35, 0.25), // X is relative (scales to stay consistent), Y is absolute (shrinks as map gets bigger)
            strokeWidth: 0.0125, // relative to block size (x)
        },

        blocks:
        {
            iconSize: 0.8, // relative to maximum space (min of width and height)
            bevelOffset: 0.066, // relative to full block length
            writingSpaceScale: 0.8, // relative to maximum space
            strokeWidth: 0.045, // relative to blockSize
            writingSpaceStrokeWidth: 0.015, // relative to blockSize (probs 50% of strokeWidth or something)
            bevelLightVec: new Point(-1, -1).normalize()
        },

        trajectories:
        {
            connLineStrokeWidth: 0.05, // relative to height of trajectory window
        },

        cityDotRadius: 0.333, // relative to full cityRadius
        cityNameRadius: 0.9, // relative to full cityDotRadius
        visitorSpotRadius: 0.1, // relative to blockSize
        numVisitorSpotAngles: 6,
        visitorSpotStrokeWidth: 0.02, // relative to blockSize

        maxAvoidanceAngleBetweenRoutes: 1*Math.PI, // if angle is greater, those routes (from the same point) won't clash anyway, so ignore
        maxAngleCurveAnyway: 0.35*Math.PI,
        maxRandomRouteCurveBounds: new Bounds(0.025, 0.175),

        debugDrawOverlapRectangle: false, // @DEBUGGING (should be false)
        debugDrawForbiddenAreas: false, // @DEBUGGING (should be false)
    }
}

export { CONFIG, GenerationMethod }
export default CONFIG
