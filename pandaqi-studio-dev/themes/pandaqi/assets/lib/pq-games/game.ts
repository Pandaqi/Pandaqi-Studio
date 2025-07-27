import { loadSettings } from "./settings/nodes";

export const loadGame = (config:Record<string,any>) =>
{
    window.addEventListener("load", () => 
    {
        loadSettings(config);
    });
}