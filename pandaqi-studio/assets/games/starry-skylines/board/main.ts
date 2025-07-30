import CONFIG from "../shared/config";
import BoardGeneration from "./boardGeneration";
import RendererPixi from "js/pq_games/layout/renderers/rendererPixi";
import BoardGenerator from "js/pq_games/tools/generation/boardGenerator";

const SETTINGS =
{
    playerCount:
    {
        type: SettingType.NUMBER,
        min: 1,
        max: 3,
        default: 3
    },

    planet:
    {
        type: SettingType.ENUM,
        values: ["learnth", "uronus", "marsh", "yumpiter", "meercury", "intervenus", "pluto", "naptune"]
    },

    manualCombo:
    {
        values: ["", "nature", "leadership", "resources", "entertainment", "chaotic"],
        label: "Play Handpicked Combination?"
    }
}
CONFIG._settings = SETTINGS;

const gen = new BoardGenerator(CONFIG, new RendererPixi());
gen.drawerClass = BoardGeneration;
gen.start();