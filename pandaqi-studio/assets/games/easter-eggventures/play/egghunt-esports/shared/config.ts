import { CONFIG_SHARED } from "games/easter-eggventures/shared/configShared";
import mergeObjects from "js/pq_games/tools/collections/mergeObjects";
import CVal from "js/pq_games/tools/generation/cval";
import Point from "js/pq_games/tools/geometry/point";
import { tilePicker } from "../game/tilePicker";

export const CONFIG:Record<string,any> =
{
    _settings:
    {
        addTextOnObstacles:
        {
            type: SettingType.CHECK,
            value: true,
            remark: "Obstacle tiles explain their own power, instead of having to remember."
        },

        sets:
        {
            type: SettingType.GROUP,

            base:
            {
                type: SettingType.CHECK,
                label: "Base Game",
                value: true
            },

            specialEggs:
            {
                type: SettingType.CHECK,
                label: "Special Eggs",
                value: false
            },

            eggstraObstacles:
            {
                type: SettingType.CHECK,
                label: "Eggstra Obstacles",
                value: false
            }
        }
    },

    _debug:
    {
        omitFile: false, // @DEBUGGING (should be false)
        singleDrawPerType: false, // @DEBUGGING (should be false)
        onlyGenerate: false, // @DEBUGGING (should be false)
    },

    _game:
    {
        fileName: "Egghunt Esports",
    },

    // assets
    assetsBase: "/easter-eggventures/play/egghunt-esports/assets/",
    assets:
    {
        special_eggs:
        {
            path: "special_eggs.webp",
            frames: new Point(8,2),
            loadIf: ["sets.specialEggs"],
        },

        obstacles:
        {
            path: "obstacles.webp",
            frames: new Point(10,2),
            loadIf: ["sets.eggstraObstacles", "sets.base"],
        },
    },

    generation:
    {
        maxNumPlayers: 6,
        maxNumEggs: 5,
        defaultEggNumbering: [-7, -5, -3, 1, 2, 3, 4, 6, 8],
        defaultFrequencies:
        {
            specialEgg: 1,
            obstacle: 3
        }
    },

    _material:
    {
        tiles:
        {
            picker: tilePicker
        }
    },
    
    _drawing:
    {
        tiles:
        {
            eggNumber:
            {
                position: new CVal(new Point(0.5, 0.64), "size"),
                fontSize: new CVal(0.4, "sizeUnit"),
                fillColor: "#212121",
                strokeColor: "#EFEFEF",
                strokeWidth: new CVal(0.01, "sizeUnit"),
                alpha: 1.0,
                composite: "source-over"
            }
        }
    }
}

mergeObjects(CONFIG, CONFIG_SHARED);