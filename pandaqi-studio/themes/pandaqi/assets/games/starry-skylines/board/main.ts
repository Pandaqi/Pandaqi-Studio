import { loadGame, SettingType } from "lib/pq-games";
import { CONFIG } from "../shared/config";

const SETTINGS =
{
    playerCount:
    {
        type: SettingType.NUMBER,
        min: 1,
        max: 3,
        value: 3
    },

    planet:
    {
        type: SettingType.ENUM,
        values: ["learnth", "uronus", "marsh", "yumpiter", "meercury", "intervenus", "pluto", "naptune"],
        value: "learnth"
    },

    manualCombo:
    {
        values: ["", "nature", "leadership", "resources", "entertainment", "chaotic"],
        label: "Play Handpicked Combination?",
        value: ""
    }
}
CONFIG._settings = SETTINGS;

loadGame(CONFIG);