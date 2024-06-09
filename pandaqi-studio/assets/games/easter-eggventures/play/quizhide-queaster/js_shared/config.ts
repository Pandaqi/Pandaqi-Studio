import CONFIG_SHARED from "games/easter-eggventures/js_shared/configShared";
import Point from "js/pq_games/tools/geometry/point";
import mergeObjects from "js/pq_games/tools/collections/mergeObjects";
import Bounds from "js/pq_games/tools/numbers/bounds";
import CVal from "js/pq_games/tools/generation/cval";

const CONFIG:Record<string,any> =
{
    debug:
    {
        omitFile: false, // @DEBUGGING (should be false)
        singleDrawPerType: false, // @DEBUGGING (should be false)
        onlyGenerate: false, // @DEBUGGING (should be false)
    },

    configKey: "quizhideQueasterConfig",
    fileName: "[Material] Quizhide Queaster",

    // set through user config on page
    inkFriendly: false,
    itemSize: "regular",

    sets:
    {
        base: true,
        cluesRooms: false,
    },

    // assets
    assetsBase: "/easter-eggventures/play/quizhide-queaster/assets/",
    assets:
    {
        clue_cards:
        {
            path: "clue_cards.webp",
            frames: new Point(11,8),
            disableCaching: true
        },

        rooms:
        {
            path: "rooms.webp",
            frames: new Point(8,6),
            disableCaching: true
        },

        // @NOTE: some of these frames have been hijacked for misc sprites; had to do that because my broken laptop can't handle loading more individual asset files
        objects:
        {
            path: "objects.webp",
            frames: new Point(8,1),
        },
    },

    generation:
    {
        clueCardBoundsBase: new Bounds(0, 43), // the range of frames to use for generating clue cards; so basically stores the usable frames of the spritesheet
        clueCardBoundsExpansion: new Bounds(44, 88-1),
        numScoreCards: 16,
        scoringRuleIterationRandomness: new Bounds(-2,3),
        scoringCardAvgScore: 2,
        maxValuePerEgg: 3,
        maxNumEggs: 5, 
        maxNumPlayers: 6,
        defaultFrequencies:
        {
            eggToken: 5,
            roomTile: 1,
            obstacleTile: 4 // there are 7 obstacles, 7 * 4 = 28 = ~25 = eggTokens
        }
    },


    tiles:
    {
        customDrawerConfig:
        {
            autoStroke: true,
            dimsElement: new Point(1, 1),
            dims: 
            { 
                small: new Point(4,6),
                regular: new Point(2,4),
                large: new Point(1,2)
            },
        }, 

        objects:
        {
            dims: new CVal(new Point(1.0), "sizeUnit")
        },

        rooms:
        {
            hidingSlotDims: new CVal(new Point(0.1825), "sizeUnit"),
            hidingSlotsFrame: 0
        }
    },

    cards:
    {
        drawerConfig:
        {
            autoStroke: true,
            dimsElement: new Point(1, 1.4),
            dims: { 
                small: new Point(5,5),
                regular: new Point(4,4),
                large: new Point(3,3)
            }, 
        }, 

        score:
        {
            fontSize: new CVal(0.1, "sizeUnit")
        }
    }
}

mergeObjects(CONFIG, CONFIG_SHARED);
delete CONFIG.assets.eggs_backgrounds;
delete CONFIG.assets.misc;

export default CONFIG;