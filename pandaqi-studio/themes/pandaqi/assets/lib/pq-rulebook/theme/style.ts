import type { RulebookParams } from "../rulebook";

const INLINE_STYLES = `
/* CORE */
* 
{
    box-sizing: border-box;
}

html, body 
{
    margin: 0;
    height: 100%;
}

body
{
    padding: 0;
    margin: 0;
    
    font-family: var(--body-font);
    font-size: calc(var(--font-size-base) + 0.390625vw);

    background-color: var(--bg-color);
    color: var(--text-color);

    --font-size-base: 12px;
    --body-font: Raleway, Trebuchet MS, Helvetica;
    --header-font: Dosis, Trebuchet MS, Helvetica;
    --border-radius: 0.25em;

    --padding-m: 1em;
    --padding-xs: 0.25em;
    --margin-m: 1em;
    --border-radius-m: 0.25em;
    --max-content-width: 60em;
    --main-width: 30em;
    --sidebar-width: 20em;
}

.display-mode-light
{
    --bg-color: #FCF6F0;
    --text-color: #222222;
    --color-light: rgb(252, 228, 203);
    --color-dark: rgb(63, 38, 33);
}

.display-mode-dark
{
    --text-color: #FCF6E0;
    --bg-color: #222222;
    --color-dark: rgb(252, 228, 203);
    --color-light: rgb(63, 38, 33);
}

h1,h2,h3,h4,h5,h6
{
    text-align: center;
    font-weight: 900;
}

h2
{
    string-set: title content(text);
}

blockquote, .rulebook-shared-rule
{
    background-color: var(--color-light);
    border-left: 0.4em solid black;
    padding: var(--padding-m);
    display: block;
    border-radius: var(--border-radius);
    break-inside: avoid;
    width: 100%;
}

p, ul, blockquote, .rulebook-shared-rule, custom
{
    max-width: var(--main-width);
    margin-left: 0;
}

img
{
    width: 100%;
    max-width: 100%;
    height: auto;
    break-inside: avoid;
}

.remark
{
    font-style: italic;
    font-size: 0.67em;
    border-top: 0.1em solid #AAA;
    padding: var(--padding-m);
    border-radius: var(--border-radius);
    background-color: var(--color-light);
}

.sidebar
{
    float: right;
    max-width: var(--sidebar-width);
    margin-left: var(--margin-m);
}


/* TOOLS (Toolbar/Buttons/Interactivity) */
.rulebook-toolbar
{
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #221100;
    color: #FFEEDD;
    padding: var(--padding-m);
    gap: var(--margin-m);
}

button
{
    font-family: var(--header-font);
    font-size: 1em;
    border: none;
    border-radius: var(--border-radius);
    text-transform: uppercase;
    font-size: 0.67em;
    cursor: pointer;
    background-color: var(--color-light);
    color: var(--color-dark);
}

button:hover
{
    background-color: var(--color-dark);
    color: var(--color-light);
}

.rulebook-image-overlay 
{
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    display: none;
    background-color: rgba(255,255,255,0.9);
    z-index: 10000;
    padding: var(--padding-m);
    cursor: pointer;

    justify-content: center;
    align-items: center;
}

/* SECTIONS */
.rulebook-section
{
    margin: auto;
    max-width: var(--max-content-width);
}

.rulebook-content
{
    padding-left: var(--padding-m);
    padding-right: var(--padding-m);
}

.rulebook-section-header
{
    margin-top: var(--margin-m);
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    cursor: pointer;
    background-color: var(--color-dark);
    color: var(--color-light);
    border-radius: var(--border-radius);
    break-inside: avoid;
    break-after: avoid;
}

.rulebook-section-content
{
    padding: var(--padding-m);
    break-before: avoid;
}

.rulebook-section-arrow
{
    margin: var(--margin-m);
}

.rulebook-section-hierarchy
{
    margin: var(--margin-m);
}

/* ICONS */
.rulebook-section-header-container 
{
    display: flex;
    justify-content: center;
    align-items: center;
    gap: var(--margin-m);
}

.rules-icon {
    width: 36px;
    height: 36px;
    background-image: url(/theme/webp/rules-icons.webp);
    background-size: 800%;
}

.rules-icon-setup 
{
    background-position-x: 0;
}

.rules-icon-objective
{
    background-position-x: -100%;
}

.rules-icon-gameplay
{
    background-position-x: -200%;
}

.rules-icon-action
{
    background-position-x: -300%;
}

.rules-icon-scoring
{
    background-position-x: -400%;
}

.rules-icon-upgrades
{
    background-position-x: -500%;
}

.rules-icon-options
{
    background-position-x: -600%;
}

.rules-icon-beware
{
    background-position-x: -700%;
}


/* RESPONSIVENESS */
/* The width here is the point at which main and sidebar will start encroaching on each other */
@media all and (max-width:45em)
{
    p, ul, blockquote, .rulebook-shared-rule, custom
    {
        max-width: 20em;
    }
}

/* This width is simply the point where text and images CAN'T be side by side anymore */
@media all and (max-width:35em)
{
    p, ul, blockquote, .rulebook-shared-rule, custom
    {
        max-width: 100%;
    }

    .remark
    {
        border: none;
    }

    .sidebar
    {
        float: none;
        max-width: 100%;
        margin: auto;
    }
}

/* PRINTING */
@page 
{
    @bottom-right 
    {
        content: counter(page) " / " counter(pages);
    }

    @top-right
    { 
        content: string(title);
        font-style: italic;
        opacity: 0.5;
    }
}

@media print
{
    body 
    { 
        font-size: 11pt;

        --max-content-width: 60em;
        --main-width: 30em;
        --sidebar-width: 20em;
    }

    /* it's necessary to target the display modes specifically, otherwise it won't override the light/dark mode! */
    .display-mode-light, .display-mode-dark
    {
        --bg-color: #FFFFFF;
        --text-color: #111111;
        --color-light: #EEE;
        --color-dark: #333;
    }

    p, ul, blockquote, .rulebook-shared-rule, custom
    {
        max-width: 28em;
    }

    .sidebar
    {
        max-width: 14em;
    }

    .rulebook-section
    {
        max-width: 100%;
    }

    .rulebook-section-content
    {
        padding-left: 0;
        padding-right: 0;
    }

    .rulebook-toolbar
    {
        display: none;
    }
}


/* RULES TABLES */
.rulebook-table
{
    display: flex;
    flex-wrap: wrap;
    /*display: grid;
    grid-template-columns: repeat(auto-fill, minmax(5em, 1fr));*/
    justify-content: center;
    align-content: center;
    gap: var(--margin-m);
    padding: var(--padding-m);
    cursor: pointer;
}

.rulebook-table-ui-hint
{
    font-size: 0.5em;
    text-align: center;
    font-style: italic;
}

.rulebook-table-icon
{
    width: 4em !important;
    height: 4em !important;
    margin: auto;
    break-inside: avoid;
}

.rulebook-table .icon-container
{
    width: 100%;
}

.rulebook-table .icon-container .rulebook-icon
{
    display: block !important;
}

.rulebook-table .heading-container
{
    background-color: var(--color-dark);
    color: var(--color-light);
    border-radius: var(--border-radius-m);
    text-align: center;
    width: 100%;
    text-transform: uppercase;
    padding: var(--padding-xs)
}

.rulebook-table-entry
{
    display: flex;
    flex-wrap: wrap;
    padding: var(--padding-m);
    max-width: 8em;
}

.rulebook-table-entry-folded .desc-container
{
    display: none;
}

.rulebook-table-entry-unfolded
{
    width: 100%;
    min-width: 100%;
    max-width: 100%;
    flex-wrap: nowrap;
    gap: var(--margin-m);
    justify-content: center;
    align-items: center;
}

.rulebook-table-entry-unfolded .heading-container
{
    width: auto;
}

.rulebook-table-entry-unfolded .icon-container
{
    width: auto;
}

.rulebook-table-entry-unfolded .desc-container
{
    display: block;
    width: 100%;
}

@media print
{
    /* just unfold all entries regardless of current state/classes */
    .rulebook-table-entry
    {
        min-width: 4em !important;
        width: auto !important;
        max-width: 15em !important;
        display: flex;
        flex-wrap: nowrap;
        gap: var(--margin-m);
        justify-content: center;
        align-items: center;
    }

    .rulebook-table-entry .desc-container
    {
        display: block;
        width: 100%;
    }

    .rulebook-table-entry .heading-container
    {
        width: auto;
    }

    .rulebook-table-entry .icon-container
    {
        width: auto;
    }
}

/* INTERACTIVE EXAMPLES */
.rulebook-example-ui
{
    display: flex;
    width: 100%;
    gap: var(--margin-m);
}

.rulebook-example-ui button
{
    width: 100%;
    font-size: 1em;
    padding: var(--padding-m);
    border-radius: var(--border-radius-m);
}

.rulebook-example-button-active
{
    background-color: var(--color-dark);
    color: var(--color-light);
}

.rulebook-example-ui .rulebook-example-button-close
{
    width: auto;
}

.rulebook-settings, .rulebook-example-content
{
    background: var(--color-light);
    border-radius: var(--border-radius-m);
    padding: var(--padding-m);
}

.rulebook-example img 
{
    filter: drop-shadow(0 0 0.15em black);
    max-width: 100%;
    max-height: min(16vw, 8em);
    width: auto;
    height: auto;
}

@media print 
{
    .rulebook-example
    {
        display: none;
    }
}





`

export const addDefaultRulebookStyles = (node:HTMLElement) =>
{
    const style = document.createElement("style");
    style.innerHTML = INLINE_STYLES;
    node.appendChild(style);
}

export const addCustomRulebookStyles = (params:RulebookParams, node:HTMLElement) =>
{
    if(params.styles)
    {
        const style = document.createElement("style");
        style.innerHTML = params.styles;
        node.appendChild(style);
    }

    if(params.fontBody)
    {
        node.style.setProperty("--body-font", params.fontBody);
    }

    if(params.fontHeader)
    {
        node.style.setProperty("--header-font", params.fontHeader);
    }
}

export const ICONS = ["setup", "objective", "gameplay", "action", "scoring", "upgrades", "options", "beware"];