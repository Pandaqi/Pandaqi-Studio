import CVal from "js/pq_games/tools/generation/cval";
import Point from "js/pq_games/tools/geometry/point";

export default
{
    debug:
    {
        omitFile: true, // @DEBUGGING (should be false)
        singleDrawPerType: true, // @DEBUGGING (should be false)
        onlyGenerate: true, // @DEBUGGING (should be false)
    },

    configKey: "bunnyBiddingConfig",
    fileName: "[Material] Bunny Bidding",

    // set through user config on page
    inkFriendly: false,
    itemSize: "regular",

    sets:
    {
        base: true,
        special: false,
        powers: false
    },

    fonts:
    {
        heading: "whatever",
        body: "whatever"
    },

    // assets
    assetsBase: "/easter-eggventures/play/bunny-bidding/assets/",
    assets:
    {
        /*misc:
        {
            path: "misc.webp",
            frames: new Point(6,1)
        },*/
    },

    generation:
    {
        specialEggInterval: 4, // on numbers 1-99, this means we get ~25 unique numbers for special eggs
        maxEggNumber: 99,
        numUniqueEggs: 6,
        defaultFrequencies:
        {
            regularEgg: 10,
            specialEgg: 1
        }
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

        text:
        {
            fontSize: new CVal(0.05, "sizeUnit"),
            translate: new CVal(new Point(0.5, 0.75), "size"),
            dims: new CVal(new Point(0.9, 0.25), "size")
        },

        eggNumber:
        {
            fontSize: new CVal(0.1, "sizeUnit"),
            translate: new CVal(new Point(0.5, 0.75), "size"), // @TODO
        }
    }
}