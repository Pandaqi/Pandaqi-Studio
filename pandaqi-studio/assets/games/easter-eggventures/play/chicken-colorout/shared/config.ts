import { CONFIG_SHARED } from "games/easter-eggventures/shared/configShared";
import { tilePicker } from "../game/tilePicker";
import { eggPicker } from "../game/eggPicker";
import { GENERATION } from "./generation";
import { SettingType, Vector2, Bounds, CVal, mergeObjects } from "lib/pq-games";

export const CONFIG:Record<string,any> =
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
                value: true
            },

            score:
            {
                type: SettingType.CHECK,
                label: "Terrific Tiles",
                remark: "This is also the material for the Special Scores expansion.",
                value: false
            },

            pawns:
            {
                type: SettingType.CHECK,
                label: "Peering Pawns",
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
        fileName: "Chicken Colorout",
    },

    // assets
    _resources:
    {    
        base: "/easter-eggventures/play/chicken-colorout/assets/",
        files:
        {
            tiles:
            {
                path: "tiles.webp",
                frames: new Vector2(8,1)
            },

            requirements:
            {
                path: "requirements.webp",
                frames: new Vector2(8,1)
            },

            misc_unique:
            {
                path: "misc_unique.webp",
                frames: new Vector2(8,2)
            },
        },
    },

    generation: GENERATION,

    _material:
    {
        tiles:
        {
            picker: () => tilePicker
        },

        eggs:
        {
            picker: () => eggPicker
        }
    },

    _drawing:
    {
        eggs:
        {
            victory:
            {
                textPos: new CVal(new Vector2(0.5, 0.75), "size"),
                fontSize: new CVal(0.235, "sizeUnit"),
                textColor: "#000000"
            }
        },

        tiles:
        {
            starter:
            {
                tutorialSize: new CVal(new Vector2(0.95), "size")
            },

            background:
            {
                randomFrameBounds: new Bounds(0,3),
                randomPatternFrameBounds: new Bounds(0,3),
                alpha: 0.2,
                alphaPattern: 0.08,
                color: "#79B734"
            },

            grid:
            {
                spriteDimsScaleFactor: 0.9, // relative to the cellSize we end up with
                gridLines:
                {
                    fillColor: "#000000",
                    alpha: 0.2,
                    width: new CVal(0.0125, "sizeUnit"),
                    composite: "overlay"
                }
            },

            scoreText:
            {
                fontSize: new CVal(0.06, "sizeUnit"),
                color: "#000000"
            }
        },
    }
}

mergeObjects(CONFIG, CONFIG_SHARED);