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
        action_tiles:
        {
            path: "action_tiles.webp",
            frames: new Point(8,2)
        },

        map_tiles:
        {
            path: "map_tiles.webp",
            frames: new Point(8,1)
        },
    },

    generation:
    {
        maxNumPlayers: 6,
        maxNumEggs: 6,
        numRuleTiles: 45,
        maxEntriesPerObjective: 10,
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
    
    tiles:
    {
        action:
        {
            iconPos: new CVal(new Point(0.5, 0.25), "size"),
            iconDims: new CVal(new Point(0.4), "size"),
        },
        
        objective:
        {
            iconPos: new CVal(new Point(0.5, 0.275), "size"),
            iconDims: new CVal(new Point(0.5), "size"),
            textBoxPos: new CVal(new Point(0.5, 0.66), "size")
        },

        movementGrid:
        {
            pos: new CVal(new Point(0.5, 0.175), "size"),
            dims: new CVal(new Point(0.55), "size")
        },

        powerText:
        {
            fontSize: new CVal(0.1, "size"),
            textBoxPos: new CVal(new Point(0.5, 0.72), "size")
        },

        helperText:
        {
            fontSize: new CVal(0.05, "size"),
            yOffset: new CVal(0.066, "size")
        },

        map:
        {
            iconDims: new CVal(new Point(0.8), "size")
        }
    }
}

mergeObjects(CONFIG, CONFIG_SHARED);
export default CONFIG;