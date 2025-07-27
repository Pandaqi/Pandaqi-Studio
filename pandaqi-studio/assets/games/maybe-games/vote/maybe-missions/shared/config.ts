import CONFIG_SHARED from "games/maybe-games/shared/configShared";
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
            frames: new Point(7,1)
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
        numShopCards: 20,
        shopCardsMaxFrequencyDist: 3,
        shopCardsCostBounds: new Bounds(1,3),

        numResourcesPerSide: new Bounds(1,4),
        maxResourcesRedSide: 3,
        goodIconFlipProb: 0.1,
        badIconFlipProb: 0.1,
        maxDeviationBadIcons: 2,

        masterCardIconsRange: new Bounds(5, 19)
    },

    rulebook:
    {
        marketSize: 6,
        numStartingVotesPerPlayer: 10,
        equalityWinsMission: true
    },
    
    cards:
    {
        shared:
        {
            dropShadowRadius: new CVal(0.02, "sizeUnit"),
            textColor:
            {
                green: "#002800",
                red: "#280000",
            }
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
        },

        shop:
        {
            labelOffset: new CVal(new Point(0, 0.025), "size"),
            textOffset: new CVal(new Point(0, 0.28), "size"),
            fontSizeLabel: new CVal(0.04, "sizeUnit"),
            fontSize: new CVal(0.058, "sizeUnit"),
            strokeWidthLabel: new CVal(0.0025, "sizeUnit"),
            compositeLabel: "overlay",
            textBoxDims: new CVal(new Point(0.9, 0.5), "size"),
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