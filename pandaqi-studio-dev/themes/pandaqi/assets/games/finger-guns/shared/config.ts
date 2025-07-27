import { SettingType, Vector2 } from "lib/pq-games";

export default 
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

            flippingFingers:
            {
                type: SettingType.CHECK,
                default: false,
                remark: "A small expansion that adds more depth and wild weapons."
            }
        }
    },

    debug:
    {
        omitFile: true, // @DEBUGGING (should be false)
        singleDrawPerType: true, // @DEBUGGING (should be false)
        onlyGenerate: true, // @DEBUGGING (should be false)
    },

    configKey: "fingerGunsConfig",
    fileName: "[Material] Finger Guns",

    // set through user config on page
    inkFriendly: false,
    itemSize: "regular",
    pageSize: "a4",

    fonts:
    {
        heading: "komikahuna",
        body: "englebert",
    },

    sets:
    {
        base: true,
        flippingFingers: false,
    },

    // assets
    assetsBase: "/finger-guns/assets/",
    assets:
    {
        englebert:
        {
            path: "fonts/Englebert-Regular.woff2",
        },

        komikahuna:
        {
            path: "fonts/Komikahuna.woff2",
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