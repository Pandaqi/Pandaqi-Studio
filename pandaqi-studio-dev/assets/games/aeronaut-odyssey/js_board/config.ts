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
    splitDims: "1x1",
    useRealMaterial: false,

    // the real TTR trains are about an inch (25.4mm), but the blocks are really 27mm
    // I took a value even larger (slightly) to overcome any paper size differences/margins
    realBlockSizeMM: 27.66,

    boardClarity: "clean",
    boardClarityValues: { "chaos": 0.1, "okay": 0.25, "normal": 0.5, "clean": 0.75, "superclean": 1.0 },
    boardClarityNumber: 0.75,

    expansions: 
    {
        trajectories: true,
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

        block_icons_filled:
        {
            path: "block_icons_filled.webp",
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
        minConnectionsPerPoint: new Bounds(1,2),
        minBoardSpan: new Bounds(0.6,0.925), // how much of the paper size should be used by the graph

        requiredAreaSize: 0.2, // the first few points are placed in the corners (required), how much freedom do they have?
        reduceConnectivityAfterTriangulation: true, // @DEBUGGING should probably be true

        minAverageRouteLength: 1.6,

        numBlockTypes: 6,
        numBlockTypesOverride: null,

        connectionBounds: { min: 3.0, max: 3.375 }, // this is per point = city
        connRemovePercentage: 0.15, // not used anymore I think?

        forbiddenAreaGrowFactor: new Bounds(0.0,0.25),

        expectedRouteLength: { tiny: 2, small: 2, regular: 3, large: 4, huge: 5 }, // we expect at least one route of this length

        routeOverlapThicknessFactor: new Bounds(0,0.96), // how thick it makes the paths when checking for overlap; 1.0 = actual size

        numTrajectoryMultipliers: { tiny: 0.75, small: 0.85, regular: 1.0, large: 1.33, huge: 1.66 },
        numTrajectoryBounds: { min: 5, max: 6 },
        trajectorySize: new Point(1.4, 0.35), // this is relative to "block size"; roughly 4/1 ratio
        calculatedTrajectoryRectOffset: null, // as it says: calculated during generation
        trajectoryPointsMultiplier: { tiny: 0.75, small: 0.85, regular: 1.0, large: 1.33, huge: 1.66 },
        maxTrajectoryPoints: 12.0,  // @TODO: we should really scale this based on board size, maybe not use an absolute number here?
        maxScoreForNonPointsTrajectory: 0.45, // relative to maxTrajectoryPoints
        minTrajectoryScore: 3,
        balanceTrajectoryLengths: true, // @DEBUGGING (should probably be true)
        trajectoryLengthReward: { small: 1.0, medium: 1.0, large: 1.3 },

        numBonusBounds: { min: 0.2, max: 0.375 }, // relative to total number of blocks that COULD receive a bonus
        minRouteLengthForBonus: 1.5,

        numMultiRouteBlocks: { min: 0.125, max: 0.225 }, // relative to total number of blocks on the board
        minRouteLengthForMulti: 1.5,

        doubleRoutesInclude: true,
        doubleRouteBounds: { min: 0.175, max: 0.375 }, // relative to total number of routes

        numVisitorSpotsPerRoute: { min: 0.5, max: 1.0 },
        visitorSpotBounds: { min: 1, max: 3 },

        numCityBounds: { min: 17.5, max: 20 },
        numCityMultipliers: { tiny: 0.33, small: 0.66, regular: 1.0, large: 1.85, huge: 2.5 },
        numCityMargins: { tiny: 0, small: 1, regular: 1, large: 1, huge: 2 }, // how far we may be off from the ideal amount

        cityRadius: 0.3,

        trackSizeBounds: { min: 0.1, max: 0.15 },
        startWithGrid: true,

        relaxPoints: true,
        numRelaxIterations: 20,
        influenceDamping: 0.2,

        addRandomCurvesWhenUnnecessary: true,

        trySneakConnections: true,
        maxSneakConnections: 2,

        maxBlocksPerRoute: 5,
        maxBlocksPerRouteOverride: null,
        maxBlocksOverflowBeforeRelaxation: 1, // to allow slightly longer routes at initial placement, and rely on relaxation to bring them in line later

    },

    evaluator:
    {
        enable: true, // @DEBUGGING (should be true)
        performTypeBalanceCheck: true,
        performConnectivenessCheck: true, // @DEBUGGING (should be true)
        maxDifferenceTypeFrequency: new Bounds(12,7),
        maxRoutesOfSameTypeAtPoint: new Bounds(5,3),
        performTakeRouteAwayCheck: true,
        performGraphRemovals: true, // @DEBUGGING (should be true)
        maxTypeChainLength: { tiny: 2, small: 2, regular: 3, large: 3, huge: 4 },
    },

    display:
    {
        outerMargin: 0.0, // relative to (smallest) side of page
        playerAreas:
        {
            include: true,

            // multiplied by number of routes to get total spaces inside player areas; 
            // motivation = ~2 spaces per route avg, ~4 players avg
            // @UPDATE: now that you can be rewarded with "one extra inventory space", I lowered it further and further
            numSpacesPerRoute: 1.125 / 4.0, // 2.0 / 4.0, 
            edgeOffset: new Point(0.02, 0.02),
            sizeRaw: new Point(0.25, 0.25), // X is relative (scales to stay consistent), Y is absolute (shrinks as map gets bigger)
            strokeWidth: 0.0125, // relative to block size (x)
        },

        blocks:
        {
            iconSize: 0.75, // relative to maximum space (min of width and height)
            bevelOffset: 0.045, // relative to full block length
            writingSpaceScale: 0.75, // relative to maximum space
            strokeWidth: 0.045, // relative to blockSize
            writingSpaceStrokeWidth: 0.015, // relative to blockSize (probs 50% of strokeWidth or something)
            bevelLightVec: new Point(-1, -1).normalize()
        },

        trajectories:
        {
            connLineStrokeWidth: 0.05, // relative to height of trajectory window
            cityNameFontSize: 0.8, // relative to height
        },

        cityDotRadius: 0.333, // relative to full cityRadius
        cityNameRadius: 0.9, // relative to full cityDotRadius
        cityNameFontSize: 0.95, // relative to full radius of circle
        visitorSpotRadius: 0.1, // relative to blockSize
        numVisitorSpotAngles: 6,
        visitorSpotStrokeWidth: 0.02, // relative to blockSize
        arrangeVisitorSpotsForAvoidance: false, // @DEBUGGING (looks weird now, just turn it off)

        maxAvoidanceAngleBetweenRoutes: 1*Math.PI, // if angle is greater, those routes (from the same point) won't clash anyway, so ignore
        maxAngleCurveAnyway: 0.35*Math.PI,
        maxRandomRouteCurveBounds: new Bounds(0.025, 0.175),

        debugDrawOverlapRectangle: false, // @DEBUGGING (should be false)
        debugDrawForbiddenAreas: false, // @DEBUGGING (should be false)
    }
}

export { CONFIG, GenerationMethod }
export default CONFIG
