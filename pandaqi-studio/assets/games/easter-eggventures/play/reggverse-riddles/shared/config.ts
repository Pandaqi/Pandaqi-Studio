import CONFIG_SHARED from "games/easter-eggventures/shared/configShared";
import Point from "js/pq_games/tools/geometry/point";
import mergeObjects from "js/pq_games/tools/collections/mergeObjects";
import Bounds from "js/pq_games/tools/numbers/bounds";
import CVal from "js/pq_games/tools/generation/cval";

const CONFIG:Record<string,any> =
{
    _settings:
    {
        sets:
        {
            type: SettingType.GROUP,

            base:
            {
                type: SettingType.CHECK,
                label: "Base Game",
                default: true
            },

            actionTiles:
            {
                type: SettingType.CHECK,
                label: "Action Tiles",
            },

            secretObjectives:
            {
                type: SettingType.CHECK,
                label: "Secret Objectives",
            },
        }
    },

    debug:
    {
        omitFile: false, // @DEBUGGING (should be false)
        singleDrawPerType: false, // @DEBUGGING (should be false)
        onlyGenerate: false, // @DEBUGGING (should be false)
    },

    configKey: "reggverseRiddlesConfig",
    fileName: "Reggverse Riddles",

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
            frames: new Point(8,2),
            loadIf: ["sets.actionTiles"]
        },

        map_tiles:
        {
            path: "map_tiles.webp",
            frames: new Point(8,1),
        },

        misc_unique:
        {
            path: "misc_unique.webp",
            frames: new Point(6,1)
        },
    },

    generation:
    {
        maxNumPlayers: 6,
        maxNumEggs: 6,
        numRuleTiles: 45,
        maxEntriesPerObjective: 10,
        maxNumSecretObjectives: 22,
        defaultFrequencies:
        {
            eggToken: 10,
            mapTile: 4,
            actionTile: 1,
        },
        movementInstructions:
        {
            gridDims: new Point(3, 3),
            numValid: new Bounds(1, 3)
        },

        // the available options for dynamic replacement of rule tile strings
        dynamicOptions:
        {
            numEggs: [2,3],
            numPawns: [2,3],
            side: ["left", "right", "top", "bottom"],
            row: ["horizontal row", "vertical column"]
        }
    },
    
    tiles:
    {
        shared:
        {
            effectBlurRadius: new CVal(0.01, "sizeUnit")
        },

        action:
        {
            iconPos: new CVal(new Point(0.5, 0.25), "size"),
            iconDims: new CVal(new Point(0.4), "size"),
        },
        
        objective:
        {
            fontSize: new CVal(0.07, "sizeUnit"),
            iconPos: new CVal(new Point(0.5, 0.275), "size"),
            iconDims: new CVal(new Point(0.5), "size"),
            textBoxPos: new CVal(new Point(0.5, 0.72), "size")
        },

        movementGrid:
        {
            pos: new CVal(new Point(0.5, 0.22), "size"),
            size: new CVal(new Point(0.38), "size"),
            strokeWidth: new CVal(0.005, "sizeUnit"),
            strokeDarkenValue: -66
        },

        powerText:
        {
            fontSize: new CVal(0.085, "sizeUnit"),
            textBoxPos: new CVal(new Point(0.5, 0.78), "size"),
            textBoxDims: new CVal(new Point(0.9, 0.5), "size")
        },

        helperText:
        {
            fontSize: new CVal(0.044, "sizeUnit"),
            yOffset: new CVal(0.05, "sizeUnit")
        },

        map:
        {
            iconDims: new CVal(new Point(0.8), "size")
        }
    }
}

mergeObjects(CONFIG, CONFIG_SHARED);
delete CONFIG.assets.eggs_backgrounds;

export default CONFIG;