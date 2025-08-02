import { SettingType, TextConfig, TextStyle, TextWeight, Vector2 } from "lib/pq-games";

export const CONFIG =
{
    _generation:
    {
        sets:
        {
            type: SettingType.GROUP,

            base:
            {
                type: SettingType.CHECK,
                default: true,
            },

            puzzleGiants:
            {
                type: SettingType.CHECK,
            },

            puzzleDancers:
            {
                type: SettingType.CHECK,
            },
        }
    },

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
            frames: new Vector2(4,4)
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
            sizeElement: new Vector2(1, 1.4),
            size: 
            { 
                small: new Vector2(4,4),
                regular: new Vector2(3,3),
                large: new Vector2(2,2)
            }, 
        },

    },
}