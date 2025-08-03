import { CONFIG_SHARED } from "games/photomone-games/shared/config";
import { POINT_TYPES_DIGITAL, TUTORIAL_PARAMS } from "./dict";

export const CONFIG =
{
    _game:
    {
        fileName: "Photomone: Digital Antists"
    },

    WORDS: null,
    RESOURCE_LOADER: null, // accessed by CanvasDrawable

    pointTypesDictionary: POINT_TYPES_DIGITAL,
    pointTypes: {},

    width: 512,
    height: 512 * (1/1.4142), // A4/A5 paper ratio
    resizePolicy: "width", // width, height or full
    resolution: 2,
    debugPowerups: [],
    timerLength: 30,

    pointRadiusFactor: 0.0175,
    pointRadiusSpecialFactor: 0.0175*1.9,
    lineWidthFactor: 0.0175,
    pointBounds: { min: 160, max: 185 },
    tutorialParams: TUTORIAL_PARAMS,

    numTurnBounds: { min: 6, max: 10 },

    wordInterface:
    {
        listenToExpansions: false
    },

    _resources:
    {
        base: "/photomone-game/assets/",
        files:
        {
            geldotica:
            {
                path: "fonts/GelDoticaLowerCaseThick.woff2"
            },

            proza:
            {
                path: "fonts/ProzaLibre-Medium.woff2"
            },

            point_types:
            {
                path: "/photomone-games/draw/photomone-digital-antists/assets/point_types.webp",
                frames: new Point(8,2),
                useAbsolutePath: true
            },

            icon_points:
            {
                path: "icon_points.webp"
            },

            icon_lines:
            {
                path: "icon_lines.webp"
            }
        }
    },

    _settings:
    {
        enableTutorial:
        {
            type: SettingType.CHECK,
            value: true,
            label: "Tutorial?",
            remark: "Explains how to play while taking your first few turns."
        },

        wordComplexity:
        {
            type: SettingType.ENUM,
            values: ["core", "easy", "medium"],
            value: "core",
            label: "Word Complexity",
            remark: "How hard should the words be?"
        },

        timerLength:
        {
            type: SettingType.NUMBER,
            min: 30,
            max: 90,
            step: 15,
            value: 30,
            label: "Timer Duration",
            remark: "How many seconds do you want to have per drawing?"
        },

        sneakySpots:
        {
            type: SettingType.CHECK,
            label: "Sneaky Spots",
            value: false,
            remark: "Adds dots with special powers."
        },

        categories:
        {
            type: SettingType.MULTI,
            values: ["anatomy", "animals", "clothes", "food", "items", "nature", "occupations", "places", "sports", "vehicles"],
            value: ["anatomy", "animals", "clothes", "food", "items", "nature", "occupations", "places", "sports", "vehicles"],
            
        }
    }
}

mergeObjects(CONFIG, CONFIG_SHARED);