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

    configKey: "iBidYouNotConfig",
    fileName: "[Material] I Bid You Not",

    // set through user config on page
    inkFriendly: false,
    itemSize: "regular",

    fonts:
    {
        heading: "vlaanderen",
        body: "rokkitt"
    },

    // assets
    assetsBase: "/i-bid-you-not/assets/",
    assets:
    {
        vlaanderen:
        {
            path: "fonts/VlaanderenChiseledNF.woff2",
        },

        rokkitt:
        {
            path: "/fonts/Rokkitt-Regular.woff2",
        },

        tiles:
        {
            path: "tiles.webp",
            frames: new Point(8,4)
        },

        misc:
        {
            path: "misc.webp",
            frames: new Point(5,1)
        },
    },

    rulebook:
    {

    },

    tiles:
    {
        drawerConfig:
        {
            autoStroke: true,
            dimsElement: new Point(1, 1),
            dims: 
            { 
                small: new Point(5,7),
                regular: new Point(3,5),
                large: new Point(2,3)
            },
        }, 

        generation:
        {
            numDeckTotal: 54
        },

    },
}

export default CONFIG