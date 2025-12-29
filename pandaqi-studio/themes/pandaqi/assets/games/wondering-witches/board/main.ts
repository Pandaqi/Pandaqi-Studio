
import { RendererPixi } from "lib/pq-games/renderers/pixi/rendererPixi";
import { CONFIG } from "../shared/config";
import { SettingType, loadGame } from "lib/pq-games";

const SETTINGS =
{
    numPlayers: 
    {
        type: SettingType.NUMBER,
        min: 1,
        max: 4,
        value: 4,
        label: "Player Count"
    },

    supercells:
    {
        type: SettingType.CHECK,
        label: "Supercells",
        value: false,
        remark: "Turns some cells into a special one!"
    },

    pageBack:
    {
        type: SettingType.CHECK,
        label: "Double-Sided",
        value: false,
        remark: "With expansions enabled, you'll need both sides of the paper (64 cells) to stand a chance!"
    }
};

CONFIG._settings = SETTINGS;
CONFIG._game.renderer = new RendererPixi();

loadGame(CONFIG);