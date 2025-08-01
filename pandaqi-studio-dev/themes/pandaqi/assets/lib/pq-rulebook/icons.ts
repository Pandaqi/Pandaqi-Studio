import type { RulebookParams } from "./rulebook";

export interface IconData
{
    frame?: number,
    sheetURL?: string,
    sheetWidth?: number,
}

export interface IconSheetData
{
    sheetURL?: string
    sheetWidth?: number
    base?: string,
}

export interface IconSheetParams
{
    config?: IconSheetData,
    class?: string,
    icons?: Record<string,IconData>
}

const DEFAULT_ICON_CLASS = "rulebook-icon";

export const getAllRulebookIconKeys = (params:RulebookParams = {}) =>
{
    if(!params.icons) { return []; }
    return Object.keys(params.icons).map((x) => Object.keys(params.icons[x].icons)).flat();
}

export const findSheetForRulebookIcon = (key:string, params:RulebookParams) =>
{
    if(!params.icons) { return {}; }
    const sheetKey = Object.keys(params.icons).find((x) => Object.keys(params.icons[x].icons).includes(key));
    return params.icons[sheetKey] ?? {};
}

export const getRulebookIconNode = (key:string|IconData, sheetData:IconSheetParams) : HTMLElement =>
{
    const iconData = (typeof key == "string") ? sheetData.icons[key] : key;
    const icon = document.createElement("div");
    icon.classList.add(sheetData.class ?? DEFAULT_ICON_CLASS);

    const base = sheetData.config.base ?? "";
    const sheetURL = iconData.sheetURL ?? sheetData.config.sheetURL;
    const sheetWidth = iconData.sheetWidth ?? (sheetData.config.sheetWidth ?? 8);

    if(sheetURL) { icon.style.backgroundImage = `url(${base}${sheetURL})`; }
    icon.style.backgroundSize = (sheetWidth*100) + "%";

    const xPos = iconData.frame % sheetWidth;
    const yPos = Math.floor(iconData.frame / sheetWidth); 
    icon.style.backgroundPositionX = -(xPos * 100) + "%";
    icon.style.backgroundPositionY = -(yPos * 100) + "%";
    icon.style.width = "1.1em"; // slightly larger than font size usually looks best
    icon.style.height = "1.1em";
    return icon;
}

export const createRulebookIcons = (params:RulebookParams, node:HTMLElement) =>
{
    const iconsData = params.icons ?? {};
    const icons = [];
    for(const [keySheet,sheetData] of Object.entries(iconsData))
    {
        for(const [keyIcon,iconData] of Object.entries(sheetData.icons))
        {
            const nodesMatching = Array.from(node.querySelectorAll(`[data-rulebook-icon="${keyIcon}"]`)) as HTMLElement[];
            if(nodesMatching.length <= 0) { continue; }

            // for any matching icon, create the node and make it replace the original
            const icon = getRulebookIconNode(keyIcon, sheetData);
            icons.push(icon);
            for(const nodeMatch of nodesMatching)
            {
                nodeMatch.insertAdjacentElement("beforebegin", icon);
                nodeMatch.remove();
            }
        }
    }
    return icons;
}