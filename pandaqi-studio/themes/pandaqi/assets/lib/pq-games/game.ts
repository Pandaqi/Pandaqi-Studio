import { generateMaterial } from "./generateMaterial";
import { loadSettings } from "./settings/nodes";
import { onWindowLoad } from "./tools/dom/tools";

export const defaultGameCallback = async (config) =>
{
    const btn = config._settings.meta.button;
    btn.innerHTML = "... generating ...";
    await generateMaterial(config);
    btn.innerHTML = "Generate!";
}

export const loadGame = (config:Record<string,any>) =>
{
    onWindowLoad(() => 
    {
        loadSettings(config, defaultGameCallback);
    });
}