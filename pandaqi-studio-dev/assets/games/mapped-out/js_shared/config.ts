import Point from "js/pq_games/tools/geometry/point"

const CONFIG:any = 
{
    debug:
    {
        omitFile: true, // @DEBUGGING (should be false)
        singleDrawPerType: true, // @DEBUGGING (should be false)
        onlyGenerate: true, // @DEBUGGING (should be false)
    },

    configKey: "mappedOutConfig",
    fileName: "[Material] Mapped Out",

    // set through user config on page
    inkFriendly: false,
    itemSize: "regular",
    pageSize: "a4",

    fonts:
    {
        heading: "vanillawhale",
        body: "sourceserif",
    },

    sets:
    {
        base: true,
        landsUnknown: false,
        unclearInstructions: false,
    },

    // assets
    assetsBase: "/mapped-out/assets/",
    assets:
    {
        sourceserif:
        {
            path: "fonts/SourceSerif418pt-Regular.woff2",
        },

        vanillawhale:
        {
            path: "fonts/VanillaWhale-Regular.woff2",
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

    tiles:
    {
        // @TODO: copy square drawerConfig from other project
    }
}

export default CONFIG