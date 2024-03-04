import CONFIG_SHARED from "games/easter-eggventures/js_shared/configShared";
import Point from "js/pq_games/tools/geometry/point";
import mergeObjects from "js/pq_games/tools/collections/mergeObjects";
import Bounds from "js/pq_games/tools/numbers/bounds";

const CONFIG:Record<string,any> =
{
    debug:
    {
        omitFile: true, // @DEBUGGING (should be false)
        singleDrawPerType: true, // @DEBUGGING (should be false)
        onlyGenerate: true, // @DEBUGGING (should be false)
    },

    configKey: "reggverseRiddlesConfig",
    fileName: "[Material] Reggverse Riddles",

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
    assetsBase: "/easter-eggventures/play/reggverse-riddles/assets/",
    assets:
    {
        special_eggs:
        {
            path: "special_eggs.webp",
            frames: new Point(8,1)
        },

        obstacles:
        {
            path: "obstacles.webp",
            frames: new Point(10,2)
        },
    },

    generation:
    {
        maxNumPlayers: 6,
        maxNumEggs: 6,
        numRuleTiles: 45,
        defaultFrequencies:
        {
            eggToken: 10,
            mapTile: 5,
            actionTile: 2,
            secretObjective: 1
        },
        movementInstructions:
        {
            gridDims: new Point(5, 3),
            numValid: new Bounds(1, 4)
        }
    },

    eggs:
    {
        drawerConfig:
        {
            autoStroke: true,
            dimsElement: new Point(1, 1),
            dims: 
            { 
                small: new Point(8,12),
                regular: new Point(6,10),
                large: new Point(4,6)
            },
        },
    },
    
    tiles:
    {

    }
}

mergeObjects(CONFIG, CONFIG_SHARED);
export default CONFIG;