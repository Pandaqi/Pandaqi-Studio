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

            soloShips:
            {
                type: SettingType.CHECK,
                default: false,
                remark: "Cuts the paper into smaller boards; each player is confined to their own little piece."
            },

            newRoutes:
            {
                type: SettingType.CHECK,
                default: true,
            }
        }
    },

    debug:
    {
        omitFile: true, // @DEBUGGING (should be false)
        singleDrawPerType: true, // @DEBUGGING (should be false)
        onlyGenerate: true, // @DEBUGGING (should be false)
    },

    configKey: "boatsAtBlockbaseConfig",
    fileName: "[Material] Boats at Blockbase",

    // set through user config on page
    inkFriendly: false,
    itemSize: "regular",
    pageSize: "a4",

    fonts:
    {
        heading: "seagardens",
        body: "chelsea",
    },

    sets:
    {
        base: true,
    },

    // assets
    assetsBase: "/boats-at-blockbase/assets/",
    assets:
    {
        chelsea:
        {
            path: "fonts/Chelsea.woff2",
        },

        seagardens:
        {
            path: "fonts/SeaGardens3DFilled-Regular.woff2",
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