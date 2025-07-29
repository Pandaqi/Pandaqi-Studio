import RendererPixi from "js/pq_games/layout/renderers/rendererPixi";
import BoardGenerator from "js/pq_games/tools/generation/boardGenerator";
import PHOTOMONE_BASE_PARAMS from "../../../shared/config";
import BoardGeneration from "./boardGeneration";

const SETTINGS = 
{
    printWordsOnPaper:
    {
        type: SettingType.CHECK,
        remark: "Prints random words on the paper itself.",
        label: "Include Words"
    },

    wordComplexity:
    {
        type: SettingType.ENUM,
        values: ["core", "easy", "medium", "hard"],
        default: "core",
        remark: "How hard should the words be?",
        label: "Word Complexity"
    },

    addStartingLines:
    {
        type: SettingType.CHECK,
        remark: "Already adds a few random lines to the paper",
        label: "Include Lines"
    },

    useEllipseOutline:
    {
        type: SettingType.CHECK,
        remark: "Makes the board more circular / organic.",
        label: "Use Round Edge"
    },

    expansions:
    {
        type: SettingType.GROUP,

        sneakySpots:
        {
            type: SettingType.CHECK,
            label: "Sneaky Spots"
        },

        precisePainters:
        {
            type: SettingType.CHECK,
            label: "Precise Painters"
        },

        actionAnts:
        {
            type: SettingType.CHECK,
            label: "Action Ants"
        },

        coopColony:
        {
            type: SettingType.CHECK,
            label: "Coop Colony"
        },

        antertainmentBreak:
        {
            type: SettingType.CHECK,
            label: "Antertainment Break"
        },
    }
};

PHOTOMONE_BASE_PARAMS._settings = SETTINGS;

const gen = new BoardGenerator(PHOTOMONE_BASE_PARAMS, new RendererPixi());
gen.drawerClass = BoardGeneration;
gen.start();