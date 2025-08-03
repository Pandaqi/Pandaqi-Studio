import RendererPixi from "js/pq_games/layout/renderers/rendererPixi";
import { POINT_TYPES } from "../shared/dict";
import { boardPicker } from "./boardPhotomone";
import { CONFIG_SHARED } from "games/easter-eggventures/shared/configShared";

export const CONFIG = 
{
    _game:
    {
        fileName: "Photomone (Board)",
        renderer: new RendererPixi()
    },

    WORDS: null, // will contain words photomone instance

    pointTypesDictionary: POINT_TYPES,
    pointTypes: {},
    pointBounds: {},
    pointRadiusFactor: 0,
    width: 512,
    height: 512 * (1/1.4142), // A4/A5 paper ratio
    debugSmoothing: false,
    smoothSteps: 30,
    edgeMargin: 0,
    minDistBetweenPoints: 0,
    startingLineMaxDist: 0,
    startingLinePointRadius: 0,
    createImage: true,

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
                path: "/photomone-games/draw/photomone/assets/point_types.webp",
                frames: new Point(8,3),
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
        printWordsOnPaper:
        {
            type: SettingType.CHECK,
            remark: "Prints random words on the paper itself.",
            value: false,
            label: "Include Words"
        },

        wordComplexity:
        {
            type: SettingType.ENUM,
            values: ["core", "easy", "medium", "hard"],
            value: "core",
            remark: "How hard should the words be?",
            label: "Word Complexity"
        },

        addStartingLines:
        {
            type: SettingType.CHECK,
            remark: "Already adds a few random lines to the paper",
            label: "Include Lines",
            value: false,
        },

        useEllipseOutline:
        {
            type: SettingType.CHECK,
            remark: "Makes the board more circular / organic.",
            label: "Use Round Edge",
            value: false,
        },

        expansions:
        {
            type: SettingType.GROUP,

            sneakySpots:
            {
                type: SettingType.CHECK,
                label: "Sneaky Spots",
                value: false,
            },

            precisePainters:
            {
                type: SettingType.CHECK,
                label: "Precise Painters",
                value: false,
            },

            actionAnts:
            {
                type: SettingType.CHECK,
                label: "Action Ants",
                value: false,
            },

            coopColony:
            {
                type: SettingType.CHECK,
                label: "Coop Colony",
                value: false,
            },

            antertainmentBreak:
            {
                type: SettingType.CHECK,
                label: "Antertainment Break",
                value: false,
            },
        }
    },

    _material:
    {
        board:
        {
            picker: boardPicker,
            mapper: MapperPreset.FULL_PAGE
        }
    }
}

mergeObjects(CONFIG, CONFIG_SHARED);