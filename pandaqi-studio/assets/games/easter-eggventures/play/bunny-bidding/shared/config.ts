import CONFIG_SHARED from "games/easter-eggventures/shared/configShared";
import mergeObjects from "js/pq_games/tools/collections/mergeObjects";
import CVal from "js/pq_games/tools/generation/cval";
import Point from "js/pq_games/tools/geometry/point";

const CONFIG:Record<string,any> = 
{
    debug:
    {
        omitFile: false, // @DEBUGGING (should be false)
        singleDrawPerType: false, // @DEBUGGING (should be false)
        onlyGenerate: false, // @DEBUGGING (should be false)
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

    // assets
    assetsBase: "/easter-eggventures/play/bunny-bidding/assets/",
    assets:
    {
        powers:
        {
            path: "powers.webp",
            frames: new Point(8,2),
            loadIf: ["sets.powers"],
        },
        
        actions:
        {
            path: "actions.webp",
            frames: new Point(10,2),
            loadIf: ["sets.special"],
        }
    },

    generation:
    {
        specialEggInterval: 4, // on numbers 1-99, this means we get ~25 unique numbers for special eggs
        maxEggNumber: 99,
        numUniqueEggs: 6,
        defaultFrequencies:
        {
            regularEgg: 10,
            specialEgg: 1,
            goalEgg: 2
        }
    },
    
    tiles:
    {
        eggNumber:
        {
            fontSize: new CVal(0.125, "sizeUnit"),
            edgeOffset: new CVal(new Point(0.1), "sizeUnit"),
            spriteDims: new CVal(new Point(0.35), "sizeUnit"),
            spriteOffset: new CVal(new Point(-0.01, 0.015), "size") // @TODO?
        },

    }
}

mergeObjects(CONFIG, CONFIG_SHARED);

export default CONFIG;