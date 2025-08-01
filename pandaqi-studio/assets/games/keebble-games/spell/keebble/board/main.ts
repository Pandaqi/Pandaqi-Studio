import BoardGeneration from "games/keebble-games/shared/boardGeneration";
import { CONFIG } from "games/keebble-games/shared/config";
import RendererPixi from "js/pq_games/layout/renderers/rendererPixi";
import BoardGenerator from "js/pq_games/tools/generation/boardGenerator";

const SETTINGS = 
{
    playerCount:
    {
        type: SettingType.NUMBER,
        min: 2,
        max: 6,
        default: 4
    },

    forPrinting:
    {
        type: SettingType.CHECK,
        remark: "If you want to print this PDF and directly play on that."
    },

    boardSize:
    {
        type: SettingType.ENUM,
        values: ["small", "medium", "large"],
        default: "medium"
    },

    addWalls:
    {
        type: SettingType.CHECK,
        default: true,
        remark: "Walls are useful on small boards to allow more words."
    },

    expansions:
    {
        type: SettingType.GROUP,

        specialCells:
        {
            type: SettingType.CHECK,
            label: "Supercells",
        },

        cellDance:
        {
            type: SettingType.CHECK,
            label: "Celldance",
        },

        scrabbleScoring:
        {
            type: SettingType.CHECK,
            label: "Scrabble Scoring",
        },

        tinyBackpacks:
        {
            type: SettingType.CHECK,
            label: "Tiny Backpacks",
        },
    }
};

CONFIG._settings = SETTINGS;

const gen = new BoardGenerator(CONFIG, new RendererPixi());
gen.drawerClass = BoardGeneration;
gen.start();