import Point from "js/pq_games/tools/geometry/point"

const CONFIG:any = 
{
    debug:
    {
        omitFile: true, // @DEBUGGING (should be false)
        singleDrawPerType: true, // @DEBUGGING (should be false)
        onlyGenerate: true, // @DEBUGGING (should be false)
    },

    configKey: "Six of Sparrows",
    fileName: "[Material] Six of Sparrows",

    // set through user config on page
    inkFriendly: false,
    itemSize: "regular",
    pageSize: "a4",

    fonts:
    {
        heading: "sancreek",
        body: "sedan",
    },

    sets:
    {
        base: true,
        expansion: false
    },

    // assets
    assetsBase: "/six-of-sparrows/assets/",
    assets:
    {
        sedan:
        {
            path: "fonts/Sedan-Regular.woff2",
        },

        sancreek:
        {
            path: "fonts/Sancreek-Regular.woff2",
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

export default CONFIG