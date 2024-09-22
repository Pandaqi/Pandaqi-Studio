import Point from "js/pq_games/tools/geometry/point";

export default
{
    assetsBase: "/photomone-games/draw/photomone-antsassins/assets/",
    debugWithoutPDF: false, // @DEBUGGING (should be false)
    debugWithDragDrop: false, // @DEBUGGING (should be false)

    pdfBuilder: null,
    resLoader: null,

    inkFriendly: false,
    generatorReductionFactor: 1.0,

    tileShape: "hexagon",
    tileType: "mosaic",
    reducedTileSize: true,
    version: "mosaic", // v1 = simple, v2 = multiline, v3 = mosaic
    numTeamsOnCodeCard: 4,
    numSecretTilesPerTeam: 1,
    addAlmostActions: true,

    includeTokens: false,
    includeCodeCards: false,
    includeTiles: false,

    clouds: {
        numClouds: { min: 7, max: 14 },
        strength: { min: 0.4, max: 0.8 },
        radius: { min: 0.125, max: 0.65 },
        backgroundColor: "#3388EE",
        color: "#FFFFFF",
        percentageBounds: { min: 0.4, max: 0.85 }
    },

    photomone: {
        colors: [],
        strokeStyle: "#000000",
        fillStyle: "#333333",
        pointRadius: 0.04, // relative to tile size
        lineWidth: 0.025, // relative to tile size
        numPoints: { min: 3, max: 6 }, // this is EXCLUDING the edge points
        numConnectionsPerPoint: { min: 1, max: 2 },
        numColors: 3, 
        maxRandomization: { min: 0.03, max: 0.085 }
    },

    simple: {
        colors: [],
        numColors: 3,
        gridPointScalar: 0.66,
        lineWidth: 0.04,
    },

    shapes: {
        colors: [],
        possibleShapeTypes: ["triangle", "rectangle", "circle"],
        numShapes: { min: 5, max: 9 },
        radius: { min: 0.125, max: 0.4 },
        numUniqueRadii: 3,
        numUniqueRotations: 4,
        numColors: 3,
    },

    mosaic: {
        useDelaunay: true, // highly recommended, much more varied and interesting
        delaunayRandomization: { min: 0.05, max: 0.2 },
        numColors: 3,
        colors: [],
        colorsInkfriendly: [], // @TODO
        colorVariation: { min: -9, max: 9 },
        shrinkShapeFactor: 0.925,
        mergeShapesProbability: 0.3,
        enhancements: {
            innerPolygons: true,
            innerPolygonBounds: { min: 0.33, max: 0.66 },
            innerPolygonFillProbability: 0.25,
            innerPolygonStrokeProbability: 0.225,
            innerPolygonLinePickProbability: 0.25,
            strokeColor: "rgba(255,255,255,0.67)",
            strokeWidth: 0.015,
            hairs: true
        }
    },

    randomWalk: {
        numLines: { min: 0.25, max: 0.3 }, // as fraction of maximum possible lines
        length: { min: 2, max: 8 }, // length bounds of one random walk
        lineWidth: 0,
        color: "#333333",
        smooth: true,
        version: "multi",
        types: {
            corners: 0,
            middle: 2,
            betweenLeft: 1,
            betweenRight: 3
        },
        colors: {
            corners: "#3F6435",
            middle: "#CB28AD",
            betweenLeft: "#0040FF",
            betweenRight: "#FF8100"
        },
        colorsInkfriendly: {
            corners: "#AAAAAA",
            middle: "#121212",
            betweenLeft: "#454545",
            betweenRight: "#767676"
        },
        shadowBlur: 0.015, // depends on canvas size
        typeOrder: ["corners", "betweenLeft", "betweenRight", "middle"],
        lineWidths: {
            corners: 0.03*0.5,
            middle: 0.08*0.5,
            betweenLeft: 0.05*0.5,
            betweenRight: 0.05*0.5
        }, // depends on canvas size + grid resolution
        startOnNonEmptyPointProb: 0.8,
        intersectProb: 0.5,
        stopAfterIntersectionProb: 0.75,
        maxIntersections: 1,
        maxConnections: 3,
        maxEdgePoints: 2,
        varyWalkLengths: true,
        insidePointMaxDistFromCenter: 0.25, // this is a ratio of the full hexagon size (2*radius)
        useSharedCostMap: true,
        maxTypesPerTile: 3,
        maxLinesPerTile: 0.36, // this is a percentage of the total number of possible lines

        enhancements_v2: {
            dotsBetween: true,
            dotsBetweenBounds: { min: 0, max: 1 },
            dotsBetweenRadius: 0.0325, // relative to size of tile
            shapesAttached: true,
            shapeBounds: { min: 0, max: 1 },
            shapeTypes: ["circle", "triangle", "rectangle"],
            hairs: true,
            hairBounds: { min: 0, max: 2 },
            halfLines: true,
            halfLineProbability: 0.25,
            edgeLines: true,
            edgeLineProbability: 0.225
        }
    },

    tiles: {
        debug: false, // @DEBUGGING (should be false)
        numPages: 2,
        size: new Point(4, 5),
        varyDimsPerShape: true,

        // @TODO: this is to handle the nasty name clash between Point (from antassinss) and Point (from my general library)
        tileSize: new Point() as any,
        tileCenter: new Point() as any,
        tileSizeOffset: new Point() as any,

        sizePerShape: {
            rectangle: new Point(4, 5),
            hexagon: new Point(5, 5),
            triangle: new Point(5, 7),
            //triangle: { x: 8, y: 6 },
        },
        sizePerShapeReduced: {
            rectangle: new Point(6, 8),
            hexagon: new Point(6, 8),
            triangle: new Point(10, 8),
        },
        bgColor: "#EBEBEB",
        bgColorInkfriendly: "#FFFFFF",
        outlineStyle: "#000000",
        outlineWidth: 0.025, // depends on canvas size only
        gridPointSize: 0.125, // depends on canvas size + grid resolution
        gridPointEdgeSizeFactor: 1.55,
        gridPointColor: "#858585",
        gridResolution: 4,
        groupSize: { min: 6, max: 11 }
    },

    cards: {
        debug: false, // @DEBUGGING (should be false)
        numPages: 1,
        size: new Point(4, 5),
        sizeResult: new Point(),
        grid: new Point(5, 5),

        bgPatterns: {
            team0: null,
            team1: null,
            team2: null,
            team3: null,
            antsassin: null
        },

        varyGridPerShape: true,
        numUniqueAlmostActions: { min: 2, max: 4 },
        almostTilesPerTeam: 5,
        gridPerShape: {
            rectangle: new Point(5, 5),
            hexagon: new Point(5, 5),
            triangle: new Point(10, 5)
        },
        gridPerShapeReduced: {
            rectangle: new Point(6, 6),
            hexagon: new Point(6, 6),
            triangle: new Point(6, 6)
        },
        strokeStyle: "#000000",
        fillStyle: "#EDEDED",
        fillStyleInkfriendly: "#FFFFFF",
        lineWidth: 0.025,
        innerMargin: 0.25,
        cells: {
            strokeStyle: "#000000",
            lineWidth: 0.0075, // 0.015
            shadowBlur: 0.0, // 0.3
            shadowBlurSecretTile: 0.3,
            margin: 0.125
        },
        startingTeam: {
            lineWidth: 0.01,
            innerScale: 0.925
        },
        actionSpriteSize: 0.8,
        actionProb: 0.575,
        numAssassins: 4,
        minDistToAssassinTile: 3, // manhattan distance, between a secret tile (for a team) and a possible assassin
        percentageNeutral: 0.15,
        teamColors: {
            team0: "#FF383C",
            team1: "#3898FF",
            team2: "#9C528B",
            team3: "#8BC745",
            antsassin: "#333333",
            neutral: "#EACA89"
        },
        almostColors: {
            team0: "#9F1F22",
            team1: "#19497D",
            team2: "#511443",
            team3: "#45691A"
        },
        teamColorsInkFriendly: {
            team0: "#565656",
            team1: "#ABABAB",
            antsassin: "#212121",
            neutral: "#FFFFFF"
        },
        almostColorsInkFriendly: {
            team0: "#565656",
            team1: "#ABABAB",
            antsassin: "#212121",
            neutral: "#FFFFFF"
        },
        patternData: {
            team0: "#D42327",
            strokeWidth: 0.05,
            team1: "#1A61AD",
            circleRadius: 0.08,
            team2: "#763A67",
            team3: "#558919",
            team3StrokeWidth: 0.05,
            antsassin: "#464041"
        },
        groupSize: {
            min: 2,
            max: 5
        }
    },

    tokens: {
        debug: false, // @DEBUGGING (should be false)
        numPages: 1,
        size: new Point(8, 8),
        sizeResult: new Point(),
        types: []
    }
}