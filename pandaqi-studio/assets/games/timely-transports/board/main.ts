import RendererPixi from "js/pq_games/layout/renderers/rendererPixi";
import { CONFIG } from "../shared/config";

const SETTINGS = 
{
    playerCount:
    {
        type: SettingType.NUMBER,
        min: 1,
        max: 8,
        value: 4
    },

    difficulty:
    {
        type: SettingType.ENUM,
        values: ["trainingWheels", "goodLuck", "fancyVehicles", "anotherUpgrade", "extraordinaryEvents", "crazyCargo"],
        value: "trainingWheels",
        label: "Scenario"
    },

    cityBonus:
    {
        type: SettingType.CHECK,
        label: "Bad City Bonus",
        value: false,
        remark: "If the computer thinks a capital is worse than the others, it will give it a few bonus points. The owner of this capital gets these for free at the start of the game."
    },

    rulesReminder:
    {
        type: SettingType.CHECK,
        value: true,
        label: "Add Rules Reminder"
    }
};

CONFIG._settings = SETTINGS;
CONFIG._game.renderer = new RendererPixi();

loadGame(CONFIG);