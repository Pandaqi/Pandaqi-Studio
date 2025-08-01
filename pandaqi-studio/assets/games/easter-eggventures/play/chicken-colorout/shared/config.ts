import { CONFIG_SHARED } from "games/easter-eggventures/shared/configShared";
import Point from "js/pq_games/tools/geometry/point";
import mergeObjects from "js/pq_games/tools/collections/mergeObjects";
import Bounds from "js/pq_games/tools/numbers/bounds";
import CVal from "js/pq_games/tools/generation/cval";

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
                default: true
            },

            score:
            {
                type: SettingType.CHECK,
                label: "Terrific Tiles",
                remark: "This is also the material for the Special Scores expansion."
            },

            pawns:
            {
                type: SettingType.CHECK,
                label: "Peering Pawns"
            }
        }
    },

    debug:
    {
        omitFile: false, // @DEBUGGING (should be false)
        singleDrawPerType: false, // @DEBUGGING (should be false)
        onlyGenerate: false, // @DEBUGGING (should be false)
    },

    configKey: "chickenColoroutConfig",
    fileName: "Chicken Colorout",

    // set through user config on page
    inkFriendly: false,
    itemSize: "regular",

    sets:
    {
        base: true,
        score: false,
        pawns: false,
    },

    // assets
    assetsBase: "/easter-eggventures/play/chicken-colorout/assets/",
    assets:
    {
        tiles:
        {
            path: "tiles.webp",
            frames: new Point(8,1)
        },

        requirements:
        {
            path: "requirements.webp",
            frames: new Point(8,1)
        },

        misc_unique:
        {
            path: "misc_unique.webp",
            frames: new Point(8,2)
        },
    },

    generation:
    {
        maxNumEggs: 6,
        maxNumPlayers: 6,
        victoryEggsDistribution: { 1: 20, 5: 14, 10: 8 },
        numExtraStarterTiles: 3,
        requirementNegationProb: 0.25,
        requirementNegationFrame: 0, // simply the frame of the red X symbol
        numEggSlotDistribution:
        {
            1: { prob: 0.125 },
            2: { prob: 0.325 },
            3: { prob: 0.35 },
            4: { prob: 0.15 },
            5: { prob: 0.05 },
        },
        numDecorationBounds: new Bounds(0,2),
        numMapTiles:
        {
            base: 32,
            terrific: 18
        },
        defaultFrequencies:
        {
            eggToken: 10,
        },
        grid:
        {
            size: new Point(4,4),
            squaresNeededForText: new Point(2,2)
        }
    },

    eggs:
    {
        victory:
        {
            textPos: new CVal(new Point(0.5, 0.75), "size"),
            fontSize: new CVal(0.235, "sizeUnit"),
            textColor: "#000000"
        }
    },

    tiles:
    {
        starter:
        {
            tutorialSize: new CVal(new Point(0.95), "size")
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

mergeObjects(CONFIG, CONFIG_SHARED);