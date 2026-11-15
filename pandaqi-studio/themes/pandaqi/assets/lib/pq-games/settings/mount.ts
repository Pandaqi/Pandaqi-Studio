import { FeedbackNode } from "../tools/dom/feedbackNode";
import { GameConfig, ensureConfigProperties } from "./configuration";
import { convertSettingsToHTML, foldGroup, unfoldGroup } from "./html";
import { applySettingsValues, resetSettings } from "./read";
import { STYLES } from "./styles";

const changeFoldedStateAll = (node:HTMLElement, folded = false) =>
{
    const nodes = Array.from(node.getElementsByClassName("settings-group")) as HTMLElement[];
    for(const node of nodes)
    {
        if(folded) { foldGroup(node); }
        else { unfoldGroup(node); }
    }
}

export const loadSettings = (config:GameConfig, callback: Function, parent = document.body) =>
{
    // this is just a way to allow the raw object to be put in too, for easier out-of-framework usage
    // @ts-ignore
    if(!config._settings) { config = { _settings: config }; } 
    ensureConfigProperties(config);

    const container = document.createElement("div");
    container.classList.add("settings");
    parent.appendChild(container);

    const header = document.createElement("h1");
    header.innerHTML = config._game.name ?? config._game.fileName ?? "Game Settings";
    container.appendChild(header);

    // tools (reset, collapse/uncollapse all, etc)
    const tools = document.createElement("div");
    tools.classList.add("settings-tools");
    container.appendChild(tools);

    const resetButton = document.createElement("button");
    resetButton.innerHTML = "Reset to Defaults";
    tools.appendChild(resetButton);
    resetButton.addEventListener("click", () => {
        resetSettings(container);
    });

    const collapseButton = document.createElement("button");
    collapseButton.innerHTML = "Fold All Groups";
    tools.appendChild(collapseButton);
    collapseButton.addEventListener("click", () => {
        changeFoldedStateAll(container, true);
    });

    const uncollapseButton = document.createElement("button");
    uncollapseButton.innerHTML = "Unfold All Groups";
    tools.appendChild(uncollapseButton);
    uncollapseButton.addEventListener("click", () => {
        changeFoldedStateAll(container, false);
    });

    // convert settings into input elements
    const settingsList = convertSettingsToHTML(config, !config._game.noDefaultSettings);
    container.appendChild(settingsList);

    // and add a button that fires up the generation process when clicked
    const btn = document.createElement("button");
    btn.innerHTML = "Generate!";

    const progressInfo = document.createElement("div");
    progressInfo.classList.add("feedback-node-sub");
    
    const feedbackNode = new FeedbackNode(btn, progressInfo);
    btn.addEventListener("click", async () => 
    {
        config._settings.meta.button = btn;
        config._settings.meta.settingsContainer = container;
        config._settings.meta.feedbackNode = feedbackNode.signalReceiver;

        btn.disabled = true;

        try {
            applySettingsValues(container, config._settings);
            await callback(config);
        } finally {
            // the button is also the progress display, so its label must be restored even if the callback threw
            btn.innerHTML = "Generate!";
            btn.disabled = false;
        }
        if(config._settings.meta.selfDestroy) { container.remove(); }
    });

    // most people never change a setting: keep the action at the top so they can generate without scrolling
    settingsList.prepend(btn, progressInfo);

    const style = document.createElement("style");
    style.innerHTML = STYLES;
    container.appendChild(style);
}
