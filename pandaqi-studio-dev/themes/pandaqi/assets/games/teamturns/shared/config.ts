import { SettingType, TextConfig, TextStyle, Vector2 } from "lib/pq-games";

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

            megaMoves:
            {
                type: SettingType.CHECK,
            },

            cookyClasses:
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

    configKey: "teamturnsConfig",
    fileName: "[Material] Teamturns",

    // set through user config on page
    inkFriendly: false,
    itemSize: "regular",
    pageSize: "a4",

    fonts:
    {
        heading: "sledge",
        body: "chizz",
    },

    sets:
    {
        base: true,
        megaMoves: false,
        cookyClasses: false
    },

    // assets
    assetsBase: "/teamturns/assets/",
    assets:
    {
        chizz:
        {
            path: "fonts/Chizz.woff2",
        },

        chizz_italic:
        {
            key: "sourceserif",
            path: "fonts/Chizz-Italic.woff2",
            textConfig: new TextConfig({ style: TextStyle.ITALIC })
        },

        sledge:
        {
            path: "fonts/Sledge.woff2",
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