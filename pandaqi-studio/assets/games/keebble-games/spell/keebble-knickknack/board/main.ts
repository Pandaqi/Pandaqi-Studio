import { CONFIG } from "games/keebble-games/shared/config";

const SETTINGS = 
{
    forPrinting:
    {
        type: SettingType.CHECK,
        value: false,
        remark: "If you want to print this PDF and directly play on that."
    },

    addWalls:
    {
        type: SettingType.CHECK,
        value: true,
        remark: "Walls are useful on small boards to allow more words."
    },

    specialCells:
    {
        type: SettingType.CHECK,
        remark: "When playing with the special cells expansion.",
        value: false
    },
};
CONFIG._settings = SETTINGS;

loadGame(CONFIG);