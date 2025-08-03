import { CONFIG } from "../game/config";
import { InterfacePhotomone } from "./interface";

CONFIG._settings.sneakySpots =
{
    type: SettingType.CHECK,
    label: "Sneaky Spots",
    value: false,
    remark: "The interface needs to know if you're using this expansion."
}

const callback = () =>
{
    const contentNode = document.getElementById("content");
    new InterfacePhotomone(contentNode, CONFIG);
};

loadSettings(CONFIG, callback);