import type { RulebookParams } from "../rulebook";
import { INLINE_STYLES } from "./style.generated";

export const ICONS = ["setup", "objective", "gameplay", "action", "scoring", "upgrades", "options", "beware"];

const DEFAULT_STYLE_ATTRIBUTE = "data-rulebook-default-styles";
const CUSTOM_STYLE_ATTRIBUTE = "data-rulebook-custom";

export const addDefaultRulebookStyles = (node:HTMLElement) =>
{
    // one copy per page, no matter how many times a rulebook is loaded or reset
    if(node.querySelector(`style[${DEFAULT_STYLE_ATTRIBUTE}]`)) { return; }

    const style = document.createElement("style");
    style.setAttribute(DEFAULT_STYLE_ATTRIBUTE, "true");
    style.innerHTML = INLINE_STYLES;
    node.appendChild(style);
}

export const addCustomRulebookStyles = (params:RulebookParams, node:HTMLElement) =>
{
    // a reset rebuilds the rulebook; custom blocks must not stack up
    for(const existing of Array.from(document.querySelectorAll(`[${CUSTOM_STYLE_ATTRIBUTE}]`))) { existing.remove(); }

    if(params.styles)
    {
        const style = document.createElement("style");
        style.setAttribute(CUSTOM_STYLE_ATTRIBUTE, "true");
        style.innerHTML = params.styles;
        node.appendChild(style);
    }

    const stylesheets = Array.isArray(params.stylesheet) ? params.stylesheet : [params.stylesheet];
    for(const url of stylesheets)
    {
        if(!url) { continue; }
        const link = document.createElement("link");
        link.setAttribute(CUSTOM_STYLE_ATTRIBUTE, "true");
        link.rel = "stylesheet";
        link.href = url;
        node.appendChild(link);
    }

    // The old code wrote these on <head>, where they inherit to nothing. Body is where the rulebook's
    // own tokens live, and the paged print copy inherits with the rest of the page.
    const root = document.body;
    if(params.fontBody) { root.style.setProperty("--body-font", params.fontBody); }
    if(params.fontHeader) { root.style.setProperty("--header-font", params.fontHeader); }
    if(params.fontSize) { root.style.setProperty("--rb-font-size", params.fontSize); }

    if(params.cssVars)
    {
        for(const [name, value] of Object.entries(params.cssVars))
        {
            if(value === undefined || value === null) { continue; }
            root.style.setProperty(name, String(value));
        }
    }
}
