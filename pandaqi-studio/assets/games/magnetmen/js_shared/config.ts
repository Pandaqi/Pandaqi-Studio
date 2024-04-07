import TextConfig, { TextWeight } from "js/pq_games/layout/text/textConfig"
import Point from "js/pq_games/tools/geometry/point"
import Bounds from "js/pq_games/tools/numbers/bounds"

const CONFIG = 
{
    configKey: "magnetmenConfig",
    fileName: "[Board] Magnetmen",
    resLoader: null,
    useWEBGL: false,
    allTypes: {},
    beginnerMode: true,

    // all debugging toggles
    debug:
    {

    },

    // set through user config on page
    inkFriendly: false,
    includeRules: true,
    boardSize: "regular", // small, regular, big, huge
    sets:
    {
        base: true,
        advanced: false,
        expert: false
    },
    
    fonts:
    {
        heading: "vina",
        body: "urbanist"
    },

    // assets
    assetsBase: "/magnetmen/assets/",
    assets:
    {
        vina:
        {
            path: "fonts/VinaSans-Regular.woff2",
            set: false
        },

        urbanist:
        {
            path: "fonts/Urbanist-Regular.woff2",
            set: false
        },

        urbanist_bold:
        {
            key: "urbanist",
            path: "fonts/Urbanist-Black.woff2",
            textConfig: new TextConfig({ weight: TextWeight.BOLD }),
            set: false
        },

        misc:
        {
            path: "misc.webp",
            frames: new Point(4,1),
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
            frames: new Point(8,1),
            set: true
        },

        base_simplified:
        {
            path: "base_simplified.webp",
            frames: new Point(8,1),
            set: true
        },

        advanced:
        {
            path: "advanced.webp",
            frames: new Point(8,1),
            set: true
        },

        advanced_simplified:
        {
            path: "advanced_simplified.webp",
            frames: new Point(8,1),
            set: true
        },

        expert:
        {
            path: "expert.webp",
            frames: new Point(8,1),
            set: true
        },

        expert_simplified:
        {
            path: "expert_simplified.webp",
            frames: new Point(8,1),
            set: true
        },
    },

    // how generation/balancing happens
    gen:
    {
        dims: {
            small: new Point(6,6),
            regular: new Point(8,8),
            big: new Point(10,9),
            huge: new Point(11,11)
        },

        beginnerDestroyType: "explorer",

        // two requirements for this
        // => it should FIT in the sidebar
        // => the number of slots (in player inventory) should be low enough to FORCE many types to be used twice or thrice during the game.
        numUniqueTypes: { 
            beginner: new Bounds(5,6),
            other: new Bounds(6,7)
        }
    },

    // how to draw stuff
    draw:
    {
        edgeMargin: new Point(0.05), // ~pageSizeUnit
        bgColor: "#020823",
        
        sidebar:
        {
            width: 0.3, // ~innerPageSizeX
            extraMargin: 0.03, // ~pageSizeX; padding between board and sidebar
            tutImageRatio: 639.0/572.0,
            fontSize: 0.3, // ~entrySizeY
            maxFontSize: 42, // an absolute maximum, anything higher is too large and unnecessary
            lineHeight: 1.033,
            iconSimpleScale: 0.5, // ~iconSize (regular)
            iconPadding: 0.01, // ~entrySizeX (regular)
            iconYPadding: 0.1, // ~entrySizeY
            iconScale: 0.925, // ~iconSize (regular) => this just creates some breathing room between edge roundedRect and image
        },

        cells:
        {
            strokeWidth: 0.03, // ~cellSizeUnit
            iconSize: 0.75, // ~cellSizeUnit
            bgColorLightness: 97,
            bgColorDarken: 9
        },

        inventories:
        {
            height: 0.05, // ~boardSizeUnit
            strokeWidth: 0.03, // ~cellSizeUnit
            numSlots: {
                small: 9, 
                regular: 14,
                big: 18,
                huge: 20
            },
            extraMargin: 0.0175, // ~pageSizeUnit
        }
    }
}

export default CONFIG