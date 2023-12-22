import Point from "js/pq_games/tools/geometry/point"
import Bounds from "js/pq_games/tools/numbers/bounds"
import { ActionType } from "./dict"

const CONFIG = 
{
    configKey: "theMistConfig",
    fileName: "[Board] The Mist",
    resLoader: null,
    allTypes: {},
    inSimpleMode: false,

    // all debugging toggles
    debug:
    {

    },

    // set through user config on page
    inkFriendly: false,
    includeRules: true,
    boardSize: "regular", // tiny, small, regular, big, huge
    sets:
    {
        base: true,
        advanced: false,
        expert: false
    },
    
    fonts:
    {
        heading: "adventure",
        body: "inika"
    },

    // assets
    assetsBase: "/the-mist/assets/",
    assets:
    {
        adventure:
        {
            path: "fonts/AdventureScript.woff2",
            set: false
        },

        inika:
        {
            path: "fonts/Inika.woff2",
            set: false
        },

        bg_map:
        {
            path: "bg_map.webp",
            set: false
        },

        misc:
        {
            path: "misc.webp",
            frames: new Point(8,1),
            set: false
        },

        sidebar:
        {
            path: "sidebar.webp",
            frames: new Point(2,1),
            set: false
        },

        base:
        {
            path: "base.webp",
            frames: new Point(8,2),
            set: true
        },

        advanced:
        {
            path: "advanced.webp",
            frames: new Point(8,2),
            set: true
        },

        expert:
        {
            path: "expert.webp",
            frames: new Point(8,2),
            set: true
        },
    },

    // how generation/balancing happens
    gen:
    {
        dims: {
            tiny: new Point(5,5),
            small: new Point(7,7),
            regular: new Point(9,9),
            big: new Point(11,11),
            huge: new Point(13,13)
        },

        maxNumPlayers: 6,
        minIconsForStartingPosition: 3,
        maxStartingPositionEdgeDistError: 1,

        typeTemplate: [ActionType.SCORE, ActionType.MOVE, ActionType.MOVE, ActionType.STATE, ActionType.TERRA],
        numUniqueTypes: new Bounds(6,9),
        numIconsPerCell: {
            1: new Bounds(0, 0.066),
            2: new Bounds(0.0875, 0.195),
            3: new Bounds(0.175, 0.375)
        },
        defNumIconsPerCell: 4
    },

    // how to draw stuff
    draw:
    {
        edgeMargin: new Point(0.05), // ~pageSizeUnit
        bgColor: "#fffdc9", //"#040404",

        bg:
        {
            mapAlpha: 0.215,
            mapScale: new Point(1.025, 1.035)
        },
        
        sidebar:
        {
            rectStrokeWidth: 0.0015, // ~pageSizeUnit
            width: 0.3, // ~innerPageSizeX
            extraMargin: 0.03, // ~pageSizeX; padding between board and sidebar
            tutImageRatio: 565.0/572.0,
            fontSize: 0.3, // ~entrySizeY
            maxFontSize: 42, // an absolute maximum, anything higher is too large and unnecessary
            lineHeight: 1.033,
            iconSimpleScale: 0.5, // ~iconSize (regular)
            iconPadding: 0.01, // ~entrySizeX (regular)
            iconYPadding: 0.1, // ~entrySizeY
            iconScale: 0.9, // ~iconSize (regular) => this just creates some breathing room between edge roundedRect and image
        
            metadataScale: 0.33 // ~iconSize (regular)
        },

        cells:
        {
            strokeWidth: 0.01, // ~cellSizeUnit
            strokeColor: "#332211", // "#FFFFFF",
            strokeWidthMultiplierStart: 6, // ~strokeWidth
            fillColorStart: "#FFFEFE",
            strokeColorStart: "#663311",
            triangleStrokeWidth: 0.01, // ~cellSizeUnit
            triangleStrokeColor: "#886633", //"#DCDCDC",
            iconSize: 0.3, // ~cellSizeUnit
            bgColorLightness: 97,
            bgColorDarken: 9,

            dotRadius: 0.115, // ~cellSizeUnit
            dotStrokeWidth: 0.01, // as thin as triangles, should be visible yet leave loads of space
            iconOffsetFromCenter: 0.6125, // ~cellSizeUnit
        },
    }
}

export default CONFIG