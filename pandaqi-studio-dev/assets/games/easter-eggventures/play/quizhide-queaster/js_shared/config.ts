import CONFIG_SHARED from "games/easter-eggventures/js_shared/configShared";
import Point from "js/pq_games/tools/geometry/point";
import mergeObjects from "js/pq_games/tools/collections/mergeObjects";
import Bounds from "js/pq_games/tools/numbers/bounds";
import CVal from "js/pq_games/tools/generation/cval";

const CONFIG:Record<string,any> =
{
    debug:
    {
        omitFile: true, // @DEBUGGING (should be false)
        singleDrawPerType: true, // @DEBUGGING (should be false)
        onlyGenerate: true, // @DEBUGGING (should be false)
    },

    configKey: "quizhideQueasterConfig",
    fileName: "[Material] Quizhide Queaster",

    // set through user config on page
    inkFriendly: false,
    itemSize: "regular",

    sets:
    {
        base: true,
        actionTiles: false,
        secretObjectives: false
    },

    // assets
    assetsBase: "/easter-eggventures/play/quizhide-queaster/assets/",
    assets:
    {
        clue_cards:
        {
            path: "clue_cards.webp",
            frames: new Point(8,6)
        },

        rooms:
        {
            path: "rooms.webp",
            frames: new Point(8,4)
        },

        objects:
        {
            path: "objects.webp",
            frames: new Point(8,1)
        },

        // @TODO: not sure about this one yet
        special_eggs:
        {
            path: "special_eggs.webp",
            frames: new Point(8,1)
        }
    },

    generation:
    {
        clueCardBounds: new Bounds(0, 39), // the range of frames to use for generating clue cards; so basically stores the usable frames of the spritesheet
        scoringRuleIterationRandomness: new Bounds(-2,6),
        maxValuePerEgg: 4,
        maxNumEggs: 6, 
        defaultFrequencies:
        {
            eggToken: 4,
            roomTile: 1,
            obstacleTile: 6
        }
    },


    tiles:
    {
        objects:
        {
            dims: new CVal(new Point(0.5), "sizeUnit")
        }
    },

    cards:
    {
        drawerConfig:
        {
            dimsElement: new Point(1, 1.4),
            dims: { 
                small: new Point(4,4),
                regular: new Point(3,3),
                large: new Point(2,2)
            }, 
        }, 

        score:
        {
            fontSize: new CVal(0.1, "sizeUnit")
        }
    }
}

mergeObjects(CONFIG, CONFIG_SHARED);
export default CONFIG;