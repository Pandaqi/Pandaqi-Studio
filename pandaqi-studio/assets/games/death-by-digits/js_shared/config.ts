import TextConfig, { TextStyle } from "js/pq_games/layout/text/textConfig"
import CVal from "js/pq_games/tools/generation/cval"
import Point from "js/pq_games/tools/geometry/point"

const CONFIG:any = 
{
    debug:
    {
        omitFile: false, // @DEBUGGING (should be false)
        singleDrawPerType: false, // @DEBUGGING (should be false)
        onlyGenerate: false, // @DEBUGGING (should be false)
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

        card_templates:
        {
            path: "card_templates.webp",
            frames: new Point(3,1)
        },

        expansion_icons:
        {
            path: "expansion_icons.webp",
            frames: new Point(6,1)
        },

        number_icons:
        {
            path: "number_icons.webp",
            frames: new Point(6,4)
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
            sizeElement: new Point(1, 1.4),
            size: 
            { 
                small: new Point(4,4),
                regular: new Point(3,3),
                large: new Point(2,2)
            }, 
        },

        colors:
        {
            darkenFactor: 50,
        },

        numbers:
        {
            offset: new CVal(new Point(0.133, 0.133), "sizeUnit"),
            fontSize: new CVal(0.165, "sizeUnit"),
            minusSignScaleFactor: 0.775,
        },

        numberCenter:
        {
            textPos: new CVal(new Point(0.5), "size"),
            textPosSpecial: new CVal(new Point(0.5, 0.375), "size"),
            fontSize: new CVal(0.4, "sizeUnit"),
            fontSizeSpecial: new CVal(0.275, "sizeUnit")
        },

        icons:
        {
            offsetFromNumber: new CVal(new Point(-0.0115, 0.2), "sizeUnit"),
            size: new CVal(new Point(0.125), "sizeUnit"),
        },

        special:
        {
            iconOffset: new CVal(new Point(0.275), "sizeUnit"),
            iconDims: new CVal(new Point(0.2), "sizeUnit"),
            textPos: new CVal(new Point(0.5, 0.6), "size"),
            textDims: new CVal(new Point(0.55, 0.35), "size"),
            fontSize: new CVal(0.06, "sizeUnit"),
        }
    },
}

export default CONFIG