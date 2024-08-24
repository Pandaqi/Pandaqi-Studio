import TextConfig, { TextStyle, TextWeight } from "js/pq_games/layout/text/textConfig"
import CVal from "js/pq_games/tools/generation/cval"
import Point from "js/pq_games/tools/geometry/point"
import Bounds from "js/pq_games/tools/numbers/bounds"

const CONFIG:any = 
{
    debug:
    {
        omitFile: false, // @DEBUGGING (should be false)
        singleDrawPerType: false, // @DEBUGGING (should be false)
        onlyGenerate: false, // @DEBUGGING (should be false)
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

        templates:
        {
            path: "templates.webp",
            frames: new Point(4,1)
        },

        special_cards:
        {
            path: "special_cards.webp",
            frames: new Point(6,4)
        },

        misc:
        {
            path: "misc.webp",
            frames: new Point(6,1)
        },
    },

    rulebook:
    {
        
    },

    generation:
    {
        defaultMaxNumOnCard: 16,
        noteBounds: new Bounds(1,4),
        numCardsPerColor:
        {
            yellow: 16,
            red: 16,
            blue: 16,
            purple: 6
        }
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

        numbers:
        {
            offset: new CVal(new Point(0.125, 0.125), "sizeUnit"),
            textColor: "#030303",
            fontSize: new CVal(0.185, "sizeUnit")
        },

        numberCenter:
        {
            textPos: new CVal(new Point(0.5), "size"),
            fontSize: new CVal(0.5, "sizeUnit"),
            strokeColor: "#FDFDFD",
            strokeWidth: new CVal(0.02, "sizeUnit"),
        },

        typeWritten:
        {
            offset: new CVal(new Point(0, 0.1), "size"),
            fontSize: new CVal(0.055, "sizeUnit"),
        },

        special:
        {
            iconPos: new CVal(new Point(0.5, 0.225), "size"),
            iconDims: new CVal(new Point(0.43), "sizeUnit"),
            iconBGDims: new CVal(new Point(0.485), "sizeUnit"),

            fontSize: new CVal(0.05, "sizeUnit"),
            textPos: new CVal(new Point(0.5, 0.765), "size"),
            textDims: new CVal(new Point(0.645, 0.4), "sizeUnit"),
            textColor: "#030303"
        },

        notes:
        {
            noteSize: new CVal(new Point(0.1), "sizeUnit"),
            lineOffset: new CVal(0.025, "sizeUnit"),
            offsetGroup: new CVal(new Point(0.16, 0), "size"),
        }
    },
}

export default CONFIG