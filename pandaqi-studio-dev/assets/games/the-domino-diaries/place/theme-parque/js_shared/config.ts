import TextConfig, { TextStyle, TextWeight } from "js/pq_games/layout/text/textConfig"
import CVal from "js/pq_games/tools/generation/cval"
import Point from "js/pq_games/tools/geometry/point"
import Bounds from "js/pq_games/tools/numbers/bounds"
import { PathType } from "./dict"
import Color from "js/pq_games/layout/color/color"

const CONFIG:any = 
{
    debug:
    {
        omitFile: false, // @DEBUGGING (should be false)
        singleDrawPerType: false, // @DEBUGGING (should be false)
        onlyGenerate: false, // @DEBUGGING (should be false)
    },

    configKey: "themeParqueConfig",
    fileName: "[Material] Theme Parque",

    // set through user config on page
    inkFriendly: false,
    itemSize: "regular",
    addText: true,

    fonts:
    {
        heading: "wildride",
        body: "besley",
    },

    sets:
    {
        pawns: true,
        base: true,
        wishneyland: false,
        unibearsal: false,
        rollercoasters: false
    },

    // assets
    assetsBase: "/the-domino-diaries/place/theme-parque/assets/",
    assets:
    {
        besley:
        {
            path: "fonts/Besley-Regular.woff2",
        },

        besley_bold:
        {
            key: "besley",
            path: "fonts/Besley-Black.woff2",
            textConfig: new TextConfig({ weight: TextWeight.BOLD })
        },

        besley_italic:
        {
            key: "besley",
            path: "fonts/Besley-Italic.woff2",
            textConfig: new TextConfig({ style: TextStyle.ITALIC })
        },

        besley_bold_italic:
        {
            key: "besley",
            path: "fonts/Besley-BlackItalic.woff2",
            textConfig: new TextConfig({ weight: TextWeight.BOLD, style: TextStyle.ITALIC })
        },

        wildride:
        {
            path: "fonts/WildRide.woff2",
        },

        pawns:
        {
            path: "pawns.webp",
            frames: new Point(6,1),
            loadIf: ["sets.pawns"],
            disableCaching: true
        },

        attractions:
        {
            path: "attractions.webp",
            frames: new Point(4,3),
            disableCaching: true
        },

        decorations:
        {
            path: "decorations.webp",
            frames: new Point(4,3),
            disableCaching: true
        },

        stalls:
        {
            path: "stalls.webp",
            frames: new Point(4,3),
            disableCaching: true
        },

        paths:
        {
            path: "paths.webp",
            frames: new Point(5,4),
            disableCaching: true
        },

        misc:
        {
            path: "misc.webp",
            frames: new Point(8,1),
            disableCaching: true
        },
    },

    rulebook:
    {

    },

    generation:
    {
        numUniquePawns: 6,
        numPawnsPerPlayer: 3,
        numDominoes:
        {
            base: 44,
            wishneyland: 24,
            unibearsal: 24,
            rollercoasters: 30,
        },

        emptyPathValue: 0.1, // most attractions are 2--3, lower = appears MORE
        coasterPartValue: 0.05, // these are only combined with paths in their expansion, so they should overcrowd those by having a lower value

        frequencies:
        {
            pathType:
            {
                [PathType.REGULAR]: 0.5,
                [PathType.QUEUE1]: 0.325,
                [PathType.QUEUE2]: 0.175
            },

            coasterPart:
            {
                [PathType.COASTER]: 1.0
            }
        }
    },

    dominoes:
    {
        drawerConfig:
        {
            dimsElement: new Point(1, 2),
            dims: { 
                small: new Point(7,5),
                regular: new Point(5,3),
                large: new Point(4,2)
            },  
            autoStroke: true
        },

        bg:
        {
            baseColor: new Color("#4FD34B"), // #2FB32B
            randomizationBounds: new Bounds(-8, 8),
            dotTextureAlpha: 0.15,
            dotTextureComposite: "overlay",
            gradientAlpha: 0.4,
            gradientComposite: "source-over"
        },

        text:
        {
            fontSize: new CVal(0.065, "sizeUnit")
        },

        score:
        {
            dims: new CVal(new Point(0.3), "sizeUnit"),
            fontSize: new CVal(0.2, "sizeUnit"),
            textColor: "#000000",
            strokeColor: "#FFFFFF",
            strokeWidth: new CVal(0.045, "dominoes.score.fontSize")
        },

        entrance:
        {
            dims: new CVal(new Point(0.75), "sizeUnit")
        },

        main:
        {
            dims: new CVal(new Point(0.8), "sizeUnit")
        },

        paths:
        {
            tunnelDims: new CVal(new Point(0.66), "sizeUnit")
        },

        setText:
        {
            fontSize: new CVal(0.065, "sizeUnit")
        }
    },
}

export default CONFIG