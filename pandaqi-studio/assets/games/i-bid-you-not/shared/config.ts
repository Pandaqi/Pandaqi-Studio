import TextConfig, { TextWeight } from "js/pq_games/layout/text/textConfig"
import CVal from "js/pq_games/tools/generation/cval"
import Point from "js/pq_games/tools/geometry/point"
import Bounds from "js/pq_games/tools/numbers/bounds"

const CONFIG:any = 
{
    _settings:
    {
        sets:
        {
            type: SettingType.GROUP,

            base:
            {
                type: SettingType.CHECK,
                label: "Base Game",
                default: true
            },

            oddInventions:
            {
                type: SettingType.CHECK,
                label: "Odd Inventions",
            },

            doubleDevices:
            {
                type: SettingType.CHECK,
                label: "Double Devices",
            },
        }
    },

    debug:
    {
        omitFile: false, // @DEBUGGING (should be false)
        singleDrawPerType: false, // @DEBUGGING (should be false)
        onlyGenerate: false, // @DEBUGGING (should be false)
    },

    configKey: "iBidYouNotConfig",
    fileName: "I Bid You Not",

    // set through user config on page
    inkFriendly: false,
    itemSize: "regular",

    fonts:
    {
        heading: "digitalt",
        body: "inter"
    },

    sets:
    {
        base: true,
        oddInventions: false,
        doubleDevices: false
    },

    // assets
    assetsBase: "/i-bid-you-not/assets/",
    assets:
    {
        digitalt:
        {
            path: "fonts/Digitalt.woff2",
        },

        inter:
        {
            path: "fonts/InterTight-Regular.woff2",
        },

        inter_bold:
        {
            key: "inter",
            path: "fonts/InterTight-Black.woff2",
            textConfig: new TextConfig({ weight: TextWeight.BOLD })
        },

        types:
        {
            path: "tile_types.webp",
            frames: new Point(8,3)
        },

        misc:
        {
            path: "misc.webp",
            frames: new Point(8,1)
        },
    },

    rulebook:
    {
        tileSize: new Point(256, 256)
    },

    tiles:
    {
        drawerConfig:
        {
            autoStroke: true,
            sizeElement: new Point(1, 1),
            size: 
            { 
                small: new Point(5,7),
                regular: new Point(3,5),
                large: new Point(2,3)
            },
        }, 

        generation:
        {
            defaultFreqPerType: 5,
            staggerBounds: new Bounds(1,4), // a random number between these are picked for advancing a tile's number for copies
            staggerConstant: 0.35, // this can be used to grow/shrink the stagger faster
            priceNumberDistribution: [-7,-5,-3,-2,-1,1,2,3,4,5,6,7,8,9],
            setNumBounds:
            {
                base: new Bounds(0, 64),
                oddInventions: new Bounds(-64, -1),
                doubleDevices: new Bounds(65, 100)
            },
            setStaggerDir:
            {
                base: 1,
                oddInventions: -1,
                doubleDevices: 1
            }
        },

        numbers:
        {
            fontSize: new CVal(0.125, "sizeUnit"),
            starDims: new CVal(new Point(0.2), "sizeUnit"),
            textColor: "#FFFFFF",
            strokeColor: "#000000",
            strokeWidth: new CVal(0.0075, "sizeUnit")
        },

        podium:
        {
            pos: new CVal(new Point(0.5, 0.585), "size"),
            size: new CVal(new Point(1.0), "sizeUnit"),
        },

        type:
        {
            pos: new CVal(new Point(0.5, 0.3), "size"),
            size: new CVal(new Point(0.475), "sizeUnit")
        },

        spotlight:
        {
            size: new CVal(new Point(0.55), "sizeUnit"),
            alpha: 0.5,
            composite: "overlay",
            numBounds: new Bounds(1,3)
        },

        action:
        {
            pos: new CVal(new Point(0.5, 0.83), "size"),
            size: new CVal(new Point(0.9, 0.4), "size"),
            fontSize: new CVal(0.0575, "sizeUnit"),
            textColor: "#000000",
            rectPosY: new CVal(0.66, "sizeUnit"),
            bgColor: "#FFFFFF",
            rectStrokeColor: "#000000",
            rectStrokeWidth: new CVal(0.01, "sizeUnit")

        },

        priceTag:
        {
            rotBounds: new Bounds(-0.2 * Math.PI, 0.2 * Math.PI),
            size: new CVal(new Point(0.25), "sizeUnit"),
            textColor: "#000000",
            fontSize: new CVal(0.075, "sizeUnit"), // @NOTE: probably same or close to label fontSize
            offset: new CVal(0.1525, "sizeUnit"),
            textRotationCompensation: -0.025 * Math.PI // @NOTE: because the price tag drawing is wonky, price tag text needs a slight adjustment to "align"
        },

        label:
        {
            pos: new CVal(new Point(0.5, 0.616), "size"),
            size: new CVal(new Point(0.75, 0.1), "size"),
            fontSize: new CVal(0.075, "sizeUnit"),
            textColor: "#000000"
        },

        audience:
        {
            pos: new CVal(new Point(), "size"),
            size: new CVal(new Point(1.0), "size"),
            alpha: 0.5
        }

    },
}

export default CONFIG