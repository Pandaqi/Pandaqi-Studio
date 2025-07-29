import BoardGeneration from "games/keebble-games/shared/boardGeneration";
import CONFIG from "games/keebble-games/shared/config";
import RendererPixi from "js/pq_games/layout/renderers/rendererPixi";
import BoardGenerator from "js/pq_games/tools/generation/boardGenerator";


CONFIG.configKey = "keebbleKnickKnackConfig";
const SETTINGS = 
{
    forPrinting:
    {
        type: SettingType.CHECK,
        remark: "If you want to print this PDF and directly play on that."
    },

    addWalls:
    {
        type: SettingType.CHECK,
        default: true
        remark: "Walls are useful on small boards to allow more words."
    },

    specialCells:
    {
        type: SettingType.CHECK,
        remark: "When playing with the special cells expansion."
    },
};
CONFIG._settings = SETTINGS;

const gen = new BoardGenerator(CONFIG, new RendererPixi());
gen.drawerClass = BoardGeneration;
gen.start();