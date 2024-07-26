import TextConfig, { TextStyle, TextWeight } from "js/pq_games/layout/text/textConfig"
import CVal from "js/pq_games/tools/generation/cval"
import Point from "js/pq_games/tools/geometry/point"
import Bounds from "js/pq_games/tools/numbers/bounds"

const CONFIG:any = 
{
    debug:
    {
        omitFile: true, // @DEBUGGING (should be false)
        singleDrawPerType: true, // @DEBUGGING (should be false)
        onlyGenerate: true, // @DEBUGGING (should be false)
    },

    configKey: "deathByDigitsConfig",
    fileName: "[Material] Death by Digits",

    // set through user config on page
    inkFriendly: false,
    itemSize: "regular",
    pageSize: "a4",

    fonts:
    {
        heading: "requiem",
        body: "ancient",
    },

    // assets
    assetsBase: "/death-by-digits/assets/",
    assets:
    {
        ancient:
        {
            path: "fonts/JSL-Ancient.woff2",
        },

        ancient_italic:
        {
            key: "ancient",
            path: "fonts/JSL-AncientItalic.woff2",
            textConfig: new TextConfig({ style: TextStyle.ITALIC }),
        },

        requiem:
        {
            path: "fonts/Requiem.woff2",
        },

        misc:
        {
            path: "misc.webp",
            frames: new Point(4,2)
        },
    },

    rulebook:
    {
        
    },

    generation:
    {
        minNumber: 1,
        maxNumber: 18,
        numCardsPerNumber: 3
    },

    cards:
    {
        drawerConfig:
        {
            autoStroke: true,
            dimsElement: new Point(1, 1.4),
            dims: 
            { 
                small: new Point(4,4),
                regular: new Point(3,3),
                large: new Point(2,2)
            }, 
        },
    },
}

export default CONFIG