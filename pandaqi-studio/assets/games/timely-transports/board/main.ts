import RendererPixi from "js/pq_games/layout/renderers/rendererPixi";
import BoardGenerator from "js/pq_games/tools/generation/boardGenerator";
import CONFIG from "../shared/config";
import BoardGeneration from "./boardGeneration";

const SETTINGS = 
{
    playerCount:
    {
        type: SettingType.NUMBER,
        min: 1,
        max: 8,
        default: 4
    },

    difficulty:
    {
        type: SettingType.ENUM,
        values: ["trainingWheels", "goodLuck", "fancyVehicles", "anotherUpgrade", "extraordinaryEvents", "crazyCargo"],
        default: "trainingWheels",
        label: "Scenario"
    },

    cityBonus:
    {
        type: SettingType.CHECK,
        label: "Bad City Bonus",
        remark: "If the computer thinks a capital is worse than the others, it will give it a few bonus points. The owner of this capital gets these for free at the start of the game."
    },

    rulesReminder:
    {
        type: SettingType.CHECK,
        default: true,
        label: "Add Rules Reminder"
    }
};
CONFIG._settings = SETTINGS;

const gen = new BoardGenerator(CONFIG, new RendererPixi());
gen.drawerClass = BoardGeneration;
gen.start();