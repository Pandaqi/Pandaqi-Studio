import TextConfig, { TextStyle, TextWeight } from "js/pq_games/layout/text/textConfig"
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

    configKey: "waterfallConfig",
    fileName: "[Material] Waterfall",

    // set through user config on page
    inkFriendly: false,
    itemSize: "regular",
    pageSize: "a4",

    fonts:
    {
        heading: "merienda",
        body: "avrile",
    },


    sets:
    {
        // @TODO
    },

    // assets
    assetsBase: "/waterfall/assets/",
    assets:
    {
        ibmplex:
        {
            path: "fonts/IBMPlexSerif-Regular.woff2",
        },

        ibmplex_bold:
        {
            key: "ibmplex",
            path: "fonts/IBMPlexSerif-Bold.woff2",
            textConfig: new TextConfig({ weight: TextWeight.BOLD })
        },

        ibmplex_italic:
        {
            key: "ibmplex",
            path: "fonts/IBMPlexSerif-Italic.woff2",
            textConfig: new TextConfig({ style: TextStyle.ITALIC })
        },

        // @TODO: add BoldItalic too?

        trollhunter:
        {
            path: "fonts/Trollhunters.woff2",
        },

        romespalace:
        {
            path: "fonts/GETRONDE.woff2",
        },

        beasts:
        {
            path: "beasts.webp",
            frames: new Point(4,4)
        },

        food:
        {
            path: "food.webp",
            frames: new Point(5,2)
        },

        victims:
        {
            path: "victims.webp",
            frames: new Point(8,2)
        },

        card_templates:
        {
            path: "card_templates.webp",
            frames: new Point(2,1)
        },
        /*
        misc:
        {
            path: "misc.webp",
            frames: new Point(12,1)
        },
        */
    },

    rulebook:
    {
        
    },

    generation:
    {
        
    },

    cards:
    {
        drawerConfig:
        {
            autoStroke: true,
            dimsElement: new Point(1, 1.4),
            dims: { 
                small: new Point(4,4),
                regular: new Point(3,3),
                large: new Point(2,2)
            },  
        },
    },
}

export default CONFIG