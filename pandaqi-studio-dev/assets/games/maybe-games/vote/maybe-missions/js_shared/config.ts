import CONFIG_SHARED from "games/easter-eggventures/js_shared/configShared";
import mergeObjects from "js/pq_games/tools/collections/mergeObjects";
import Point from "js/pq_games/tools/geometry/point";
import Bounds from "js/pq_games/tools/numbers/bounds";

const CONFIG:Record<string,any> = 
{
    debug:
    {
        omitFile: true, // @DEBUGGING (should be false)
        singleDrawPerType: true, // @DEBUGGING (should be false)
        onlyGenerate: true, // @DEBUGGING (should be false)
    },

    configKey: "maybeMissionsConfig",
    fileName: "[Material] Maybe Missions",

    // set through user config on page
    inkFriendly: false,
    itemSize: "regular",

    sets:
    {
        base: true,
        identities: false,
        gadgets: false
    },

    // assets
    assetsBase: "/maybe-games/vote/maybe-missions/assets/",
    assets:
    {
        misc:
        {
            path: "misc.webp",
            frames: new Point(8,2)
        },
    },

    generation:
    {
        numVoteCards: 60,
        numMissionCards: 40,
        numMasterCards: 20,
        numIdentityCardsEach: 20,

        numResourceBounds: new Bounds(1,4),
        goodIconFlipProb: 0.1,
        badIconFlipProb: 0.1,
        maxDeviationBadIcons: 2,
    },
    
    cards:
    {
        
    }
}

mergeObjects(CONFIG, CONFIG_SHARED);

export default CONFIG;