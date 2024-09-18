import TextConfig, { TextStyle, TextWeight } from "js/pq_games/layout/text/textConfig"
import Point from "js/pq_games/tools/geometry/point"
import autoLoadFontCSS from "js/pq_games/website/autoLoadFontCSS";

const CONFIG:any = 
{
    debug:
    {
        omitFile: true, // @DEBUGGING (should be false)
        singleDrawPerType: true, // @DEBUGGING (should be false)
        onlyGenerate: true, // @DEBUGGING (should be false)
    },

    configKey: "puzzleSpeciesConfig",
    fileName: "[Material] Puzzle Species",

    // set through user config on page
    inkFriendly: false,
    itemSize: "regular",
    pageSize: "a4",

    fonts:
    {
        heading: "freckleface",
        body: "shantell",
    },

    sets:
    {
        base: true,
        puzzleGiants: false,
        puzzleDancers: false,
    },

    // assets
    assetsBase: "/puzzle-species/assets/",
    assets:
    {
        shantell:
        {
            path: "fonts/ShantellSans-Regular.woff2",
        },

        shantell_italic:
        {
            key: "shantell",
            path: "fonts/ShantellSans-Italic.woff2",
            textConfig: new TextConfig({ style: TextStyle.ITALIC })
        },

        shantell_bold:
        {
            key: "shantell",
            path: "fonts/ShantellSans-ExtraBold.woff2",
            textConfig: new TextConfig({ weight: TextWeight.BOLD })
        },

        shantell_bold_italic:
        {
            key: "shantell",
            path: "fonts/ShantellSans-ExtraBoldItalic.woff2",
            textConfig: new TextConfig({ style: TextStyle.ITALIC, weight: TextWeight.BOLD })
        },

        freckleface:
        {
            path: "fonts/FreckleFace-Regular.woff2",
        },

        misc:
        {
            path: "misc.webp",
            frames: new Point(4,4)
        },

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
            dims: 
            { 
                small: new Point(4,4),
                regular: new Point(3,3),
                large: new Point(2,2)
            }, 
        },

    },
}

autoLoadFontCSS(CONFIG);

export default CONFIG