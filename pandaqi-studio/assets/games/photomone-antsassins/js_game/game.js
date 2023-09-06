import Tiles from "./tiles/tiles"
import CodeCards from "./cards"
import Tokens from "./tokens"
import ResourceLoader from "js/pq_games/canvas/resourceLoader"
import PdfBuilder from "js/pq_games/pdf/pdfBuilder"
import DragDropDebugger from "./tools/dragdrop"

const config = {
    debugWithoutPDF: false, // @DEBUGGING (should be false)
    debugWithDragDrop: false, // @DEBUGGING (should be false)
    tileShape: "hexagon",
    tileType: "mosaic",
    reducedTileSize: true,
    version: "mosaic", // v1 = simple, v2 = multiline, v3 = mosaic
    numTeamsOnCodeCard: 4,
    numSecretTilesPerTeam: 1,
    addAlmostActions: true,
    clouds: {
        numClouds: { min: 7, max: 14 },
        strength: { min: 0.4, max: 0.8 },
        radius: { min: 0.125, max: 0.65 },
        backgroundColor: "#3388EE",
        color: "#FFFFFF",
        percentageBounds: { min: 0.4, max: 0.85 }
    },
    photomone: {
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
        numColors: 3,
        gridPointScalar: 0.66,
        lineWidth: 0.04,
    },
    shapes: {
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
        dims: { x: 4, y: 5 },
        varyDimsPerShape: true,
        dimsPerShape: {
            rectangle: { x: 4, y: 5 },
            hexagon: { x: 5, y: 5 },
            triangle: { x: 5, y: 7 },
            //triangle: { x: 8, y: 6 },
        },
        dimsPerShapeReduced: {
            rectangle: { x: 6, y: 8 },
            hexagon: { x: 6, y: 8 },
            triangle: { x: 10, y: 8 },
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
        dims: { x: 4, y: 5 },
        grid: { x: 5, y: 5 },
        varyGridPerShape: true,
        numUniqueAlmostActions: { min: 2, max: 4 },
        almostTilesPerTeam: 5,
        gridPerShape: {
            rectangle: { x: 5, y: 5 },
            hexagon: { x: 5, y: 5 },
            triangle: { x: 10, y: 5 }
        },
        gridPerShapeReduced: {
            rectangle: { x: 6, y: 6 },
            hexagon: { x: 6, y: 6 },
            triangle: { x: 6, y: 6 }
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
        teamColorsInkfriendly: {
            team0: "#565656",
            team1: "#ABABAB",
            antsassin: "#212121",
            neutral: "#FFFFFF"
        },
        almostColorsInkfriendly: {
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
        dims: { x: 8, y: 8 }
    }
}

export default class Generator {
    constructor() {}

    async start()
    {
        const fontURL = "/photomone/assets/fonts/GelDoticaLowerCaseThick.woff2";
        const fontFile = new FontFace("GelDoticaLowerCase", "url(" + fontURL + ")");
        document.fonts.add(fontFile);

        await fontFile.load();

        const resLoader = new ResourceLoader();
        resLoader.planLoad("tokens", { path: "assets/tokens_new.webp", frames: { x: 8, y: 1 } });
        resLoader.planLoad("almostActions", { path: "assets/almost_actions.webp", frames: { x: 8, y: 1 } });
        await resLoader.loadPlannedResources();

        const pdfBuilderConfig = { orientation: "portrait" };
        const pdfBuilder = new PdfBuilder(pdfBuilderConfig);
        
        config.pdfBuilder = pdfBuilder;
        config.resLoader = resLoader;
        Object.assign(config, JSON.parse(window.localStorage.photomoneAntsassinsConfig || "{}"));

        config.numTeamsOnCodeCard = parseInt(config.numTeamsOnCodeCard);
        config.numSecretTilesPerTeam = parseInt(config.numSecretTilesPerTeam);

        // last minute change: the simple version only supports rectangles and a 3+1 = 4 point tile
        if(config.tileType == "simple") { 
            config.tileShape = "rectangle"; 
            config.tiles.gridResolution = 3;
            config.tiles.dimsPerShape.rectangle = { x: 7, y: 8 }
            config.tiles.dimsPerShapeReduced.rectangle = { x: 10, y: 12 }
            config.cards.gridPerShapeReduced.rectangle =  { x: 8, y: 8 }
        }

        console.log(config);

        // some repetitive code, both here and inside the classes, but it's fine
        // it's a minor "issue", but it helps readability of the code
        const tiles = new Tiles(config);
        console.log("[Photomone] Created Tiles");
        const cards = new CodeCards(config);
        console.log("[Photomone] Created Code Cards");
        const tokens = new Tokens(config);
        console.log("[Photomone] Created Tokens");

        await tiles.convertToImages();
        await cards.convertToImages();
        await tokens.convertToImages();

        const images = [tiles.getImages(), cards.getImages(), tokens.getImages()].flat();
        console.log("[Photomone] Created Images");

        if(config.debugWithDragDrop)
        {
            const dragdrop = new DragDropDebugger(config, tiles.getIndividualImages());
        }

        if(config.debugWithoutPDF)
        {    
            for(const img of images)
            {
                img.style.maxWidth = "100%";
                document.body.appendChild(img);
            }
            return;
        }

        pdfBuilder.addImages(images);
        let fileName = "[Photomone; Antsassins] Material";
        const pdfConfig = { customFileName: fileName }
        pdfBuilder.downloadPDF(pdfConfig);
    }
}