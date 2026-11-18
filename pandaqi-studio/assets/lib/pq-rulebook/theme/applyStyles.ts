import type { RulebookParams } from "../rulebook";

export const ICONS = ["setup", "objective", "gameplay", "action", "scoring", "upgrades", "options", "beware"];

const DEFAULT_STYLE_ATTRIBUTE = "data-rulebook-default-styles";
const CUSTOM_STYLE_ATTRIBUTE = "data-rulebook-custom";

// The generated copy of the built-in stylesheet is registered by the library's self-contained entry
// (index.ts). It is kept out of this module on purpose: a page that links the stylesheet itself—the
// site does, so the first paint is already styled—needs no copy in its bundle, and carrying it here
// would make every rulebook page download the same ~37 KB twice.
let embeddedStyles = "";
export const setEmbeddedRulebookStyles = (css:string) => { embeddedStyles = css; };

export const addDefaultRulebookStyles = (node:HTMLElement) =>
{
    // One copy per page, no matter how many times a rulebook is loaded or reset. A page that already
    // ships this stylesheet as a real <link> (so the first paint is styled) counts as that copy: the
    // library then leaves its own copy out instead of applying everything twice.
    if(node.querySelector(`[${DEFAULT_STYLE_ATTRIBUTE}]`)) { return; }

    if(!embeddedStyles)
    {
        console.warn("[Rulebook] No stylesheet: this page neither links the rulebook CSS nor registers the embedded copy.");
        return;
    }

    const style = document.createElement("style");
    style.setAttribute(DEFAULT_STYLE_ATTRIBUTE, "true");
    style.innerHTML = embeddedStyles;
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
