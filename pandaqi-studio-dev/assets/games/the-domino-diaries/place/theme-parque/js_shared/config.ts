import TextConfig, { TextStyle, TextWeight } from "js/pq_games/layout/text/textConfig"
import CVal from "js/pq_games/tools/generation/cval"
import Point from "js/pq_games/tools/geometry/point"
import Bounds from "js/pq_games/tools/numbers/bounds"
import { PathType } from "./dict"

const CONFIG:any = 
{
    debug:
    {
        omitFile: true, // @DEBUGGING (should be false)
        singleDrawPerType: true, // @DEBUGGING (should be false)
        onlyGenerate: true, // @DEBUGGING (should be false)
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

        wildride:
        {
            path: "fonts/WildRide.woff2",
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
            wishneyland: 22,
            unibearsal: 22,
            rollercoasters: 22,
        },

        frequencies:
        {
            pathType:
            {
                [PathType.REGULAR]: 0.575,
                [PathType.QUEUE1]: 0.3,
                [PathType.QUEUE2]: 0.125
            }
        }
    },

    dominoes:
    {
        drawerConfig:
        {
            dimsElement: new Point(1,2),
            dims: { 
                small: new Point(6,8),
                regular: new Point(4,6),
                large: new Point(3,5)
            },  
            autoStroke: true
        },
    },
}

export default CONFIG