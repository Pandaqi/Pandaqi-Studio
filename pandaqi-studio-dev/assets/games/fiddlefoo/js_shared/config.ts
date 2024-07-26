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

    configKey: "fiddlefooConfig",
    fileName: "[Material] Fiddlefoo",

    // set through user config on page
    inkFriendly: false,
    itemSize: "regular",
    pageSize: "a4",

    sets:
    {
        base: true,
        expansion: true,
    },

    fonts:
    {
        heading: "casanova",
        body: "andada",
    },

    // assets
    assetsBase: "/fiddlefoo/assets/",
    assets:
    {
        andada:
        {
            path: "fonts/Andada-Regular.woff2",
        },

        andada_bold:
        {
            key: "andada",
            path: "fonts/Andada-Bold.woff2",
            textConfig: new TextConfig({ weight: TextWeight.BOLD }),
        },

        andada_italic:
        {
            key: "andada",
            path: "fonts/Andada-Italic.woff2",
            textConfig: new TextConfig({ style: TextStyle.ITALIC }),
        },

        casanova:
        {
            path: "fonts/Casanova.woff2",
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
        defaultMaxNumOnCard: 16,
        numCardsPerColor:
        {
            red: 16,
            green: 16,
            blue: 16,
            purple: 6
        }
    },

    tiles:
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