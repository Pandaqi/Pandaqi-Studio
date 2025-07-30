import RendererPixi from "js/pq_games/layout/renderers/rendererPixi";
import BoardGenerator from "js/pq_games/tools/generation/boardGenerator";
import CONFIG from "../shared/config";
import BoardGeneration from "./boardGeneration";

const SETTINGS =
{
    numPlayers: 
    {
        type: SettingType.NUMBER,
        min: 1,
        max: 4,
        default: 4,
        label: "Player Count"
    },

    supercells:
    {
        type: SettingType.CHECK,
        label: "Supercells",
        remark: "Turns some cells into a special one!"
    },

    pageBack:
    {
        type: SettingType.CHECK,
        label: "Double-Sided",
        remark: "With expansions enabled, you'll need both sides of the paper (64 cells) to stand a chance!"
    }
};
CONFIG._settings = SETTINGS;

const gen = new BoardGenerator(CONFIG, new RendererPixi());
gen.drawerClass = BoardGeneration;
gen.start();