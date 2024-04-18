import CONFIG_SHARED from "games/maybe-games/js_shared/configShared";
import mergeObjects from "js/pq_games/tools/collections/mergeObjects";
import CVal from "js/pq_games/tools/generation/cval";
import Point from "js/pq_games/tools/geometry/point";
import Bounds from "js/pq_games/tools/numbers/bounds";

const CONFIG:Record<string,any> = 
{
    debug:
    {
        omitFile: false, // @DEBUGGING (should be false)
        singleDrawPerType: false, // @DEBUGGING (should be false)
        onlyGenerate: false, // @DEBUGGING (should be false)
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

    fonts:
    {
        heading: "trebek"
    },

    // assets
    assetsBase: "/maybe-games/vote/maybe-missions/assets/",
    assets:
    {
        trebek:
        {
            key: "trebek",
            path: "fonts/StarTrebek.woff2",
        },

        card_templates:
        {
            path: "card_templates.webp",
            frames: new Point(6,1)
        },

        misc:
        {
            path: "misc.webp",
            frames: new Point(8,3)
        },
    },

    generation:
    {
        numVoteCards: 60,
        numMissionCards: 40,
        numMasterCards: 20,
        numIdentityCardsEach: 18,

        numResourcesPerSide: new Bounds(1,4),
        goodIconFlipProb: 0.1,
        badIconFlipProb: 0.1,
        maxDeviationBadIcons: 2,

        masterCardIconsRange: new Bounds(5, 19)
    },
    
    cards:
    {
        shared:
        {
            dropShadowRadius: new CVal(0.02, "sizeUnit")
        },

        resources:
        {
            iconOffset: new CVal(new Point(0, 0.125), "size"),
            iconDims: new CVal(new Point(0.225), "sizeUnit"),
            iconCrossOffsetY: 0.25,
            iconDimsCrossFactor: 0.75,
        },

        randomText:
        {
            fontSize: new CVal(0.175, "sizeUnit"),
            color: "#000000",
            colorStroke: "#FFFFFF",
            strokeWidth: new CVal(0.01, "sizeUnit")
        },

        master:
        {
            iconPos: new CVal(new Point(0.5, 0.4), "size"),
            iconDims: new CVal(new Point(0.35), "sizeUnit"),
            rectPos: new CVal(new Point(0.5, 0.585), "size"),
            rectDims: new CVal(new Point(0.9, 0.295), "size"),
            rectBlur: new CVal(0.035, "sizeUnit"),

            fontSize: new CVal(0.0685, "sizeUnit"),
            textColor: "#000000"
        },

        identity:
        {
            rectPos: 
            {
                good: new CVal(new Point(0.5, 0.366), "size"),
                bad: new CVal(new Point(0.5, 0.725), "size")
            },
            rectDims: new CVal(new Point(0.9, 0.325), "size"),
            rectBlur: new CVal(0.035, "sizeUnit"),
            
            fontSize: new CVal(0.0733, "sizeUnit"),
            textColor: "#000000"
        }
    },

    votes:
    {
        number:
        {
            pos: new CVal(new Point(0.5, 0.725), "size"),
            fontSize: new CVal(0.375, "sizeUnit"),
            color: "#000000",
            colorStroke: "#FFFFFF",
            strokeWidth: new CVal(0.025, "sizeUnit")
        }
    }
}

mergeObjects(CONFIG, CONFIG_SHARED);

export default CONFIG;