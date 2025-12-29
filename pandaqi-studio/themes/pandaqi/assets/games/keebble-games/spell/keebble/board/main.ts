import { CONFIG } from "games/keebble-games/shared/config";
import { SettingType, loadGame } from "lib/pq-games";

const SETTINGS = 
{
    playerCount:
    {
        type: SettingType.NUMBER,
        min: 2,
        max: 6,
        value: 4
    },

    forPrinting:
    {
        type: SettingType.CHECK,
        remark: "If you want to print this PDF and directly play on that.",
        value: false
    },

    boardSize:
    {
        type: SettingType.ENUM,
        values: ["small", "medium", "large"],
        default: "medium",
        value: false
    },

    addWalls:
    {
        type: SettingType.CHECK,
        default: true,
        remark: "Walls are useful on small boards to allow more words.",
        value: false
    },

    expansions:
    {
        type: SettingType.GROUP,

        specialCells:
        {
            type: SettingType.CHECK,
            label: "Supercells",
            value: false
        },

        cellDance:
        {
            type: SettingType.CHECK,
            label: "Celldance",
            value: false
        },

        scrabbleScoring:
        {
            type: SettingType.CHECK,
            label: "Scrabble Scoring",
            value: false
        },

        tinyBackpacks:
        {
            type: SettingType.CHECK,
            label: "Tiny Backpacks",
            value: false
        },
    }
};

CONFIG._settings = SETTINGS;

loadGame(CONFIG);