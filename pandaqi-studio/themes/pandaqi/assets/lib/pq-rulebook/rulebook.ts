import { RulebookAPI, registerRulebookAPI, RULEBOOK_API_VERSION, unregisterRulebookAPI } from "./api";
import { createRulebookExampleHTML, InteractiveExampleParams, makeExamplesInteractive } from "./examples/interactiveExample";
import { createRulebookIconHTML, IconSheetParams } from "./icons";
import { DEFAULT_RULEBOOK_TITLE, pickAccent, resolveRulebookTitle } from "./meta";
import { parseInput } from "./parser/parser";
import { createRootSection, ensureUniqueHeadingIDs, findSectionByID, findSections, flattenSections, getSectionAsFlatHTML, getSectionNodes, makeSectionInteractiveRecursively, RulebookSection } from "./sections";
import { createRulebookTableHTML, foldAllTables, makeTablesInteractive, RulebookTableParams, toggleTablesExpanded } from "./tables";
import { addCustomRulebookStyles, addDefaultRulebookStyles } from "./theme/applyStyles";
import { createRulebookScrollTracker, createRulebookTOC, RulebookScrollTracker, RulebookTOC, setTOCInPrint } from "./toc";
import { createProgressBar, createToolbar, foldAll, makeImagesClickable, makeInternalAnchorsWork, printAdvancedRulebook, printBrowserRulebook, unfoldAll } from "./toolbar";

export interface RulebookParams
{
    // actual content/text input
    text?: string
    container?: string|HTMLElement,
    _rulebook?: HTMLElement // has the final, parsed, converted rulebook; should only be used by system, not user

    // name/identity
    title?: string, // game name; auto-detected from data attributes, meta tags, page title or URL when omitted
    subtitle?: string,
    showTitle?: boolean, // false hides the title block above the content

    // custom styling (all optional)
    styles?: string, // inline CSS, appended after the default stylesheet
    stylesheet?: string|string[], // one or more URLs of a custom stylesheet
    cssVars?: Record<string,string>, // custom properties, e.g. { "--rb-accent": "#123456", "--main-width": "40em" }; print intentionally uses its own colour/type baseline, override that with @media print in `styles`
    accent?: string, // CSS colour; replaces the automatically picked per-game accent
    fontSize?: string, // screen size, e.g. "12px"; print keeps its own 9.5pt baseline (override it with @media print in `styles`)
    fontBody?: string,
    fontHeader?: string,
    className?: string, // extra class(es) on the wrapper
    headerIcons?: string[],
    hideHeaderIcons?: boolean,

    // table of contents
    toc?: boolean, // default true
    tocPosition?: "left"|"right", // default "left"
    tocInPrint?: boolean, // default false

    // chrome
    toolbar?: boolean, // default true
    pagedScriptURL?: string, // default /lib/paged.polyfill.js

    // special elements (examples, rules tables, etc)
    exampleClass?: string,
    examples?: Record<string,InteractiveExampleParams>,
    tableClass?: string,
    tables?: Record<string,RulebookTableParams>,
    iconClass?: string,
    icons?: Record<string,IconSheetParams>,
    hideHeaderIconsCustom?: boolean, // doesn't add icons to headers if they match the custom `icons`

    onReady?: (api:RulebookAPI) => void,

    // dynamic stuff used by system (hence underscore before)
    _sectionRoot?: RulebookSection
    _built?: boolean // the shortcodes were expanded and the sections were created once already
    _source?: string // the original markdown, kept so a reset can rebuild instead of re-parsing rendered HTML
    _shell?: HTMLElement
    _toolbar?: HTMLElement
    _titleNode?: HTMLElement
    _toc?: RulebookTOC
    _progressBar?: HTMLElement
    _tracker?: RulebookScrollTracker
    _api?: RulebookAPI
    _printing?: boolean
}

// A bundle can be evaluated after the window already fired `load` (a late/dynamic script); waiting for
// `load` alone then never calls back and the rulebook silently stays unrendered.
const onWindowLoad = (callback:() => void) =>
{
    if(document.readyState === "complete") { callback(); return; }
    window.addEventListener("load", callback, { once: true });
}

const DEFAULT_RULEBOOK_ID = "rulebook-content";
let rulebookCount = 0;

const containerNodeOf = (params:RulebookParams) : HTMLElement|null =>
{
    if(!params.container) { return null; }
    return (typeof params.container == "string") ? document.getElementById(params.container) : params.container;
}

// Captured before the first parse: `parseInput` turns the node's innerHTML into HTML, so reading it later
// would re-parse rendered HTML as markdown.
const rememberSource = (params:RulebookParams) =>
{
    if(params._source !== undefined || params._built) { return; }

    const container = containerNodeOf(params);
    const defaultNode = (params.text === undefined) ? document.getElementById(DEFAULT_RULEBOOK_ID) : null;
    const node = container ?? defaultNode;
    params._source = node ? node.innerHTML : (params.text ?? "");
}

// Expand shortcodes into full HTML and divide the article into the section hierarchy. Runs once.
const buildOnce = (params:RulebookParams, node:HTMLElement) =>
{
    createRulebookTableHTML(params, node);
    createRulebookIconHTML(params, node);
    createRulebookExampleHTML(params, node);

    const sectionRoot = createRootSection(params);
    findSections(node, sectionRoot);
    ensureUniqueHeadingIDs(sectionRoot);

    node.innerHTML = "";
    node.appendChild(makeSectionInteractiveRecursively(sectionRoot, undefined, params));
}

// Everything that only has to be attached once, because the nodes it attaches to are never re-created.
const wireInteractivity = (params:RulebookParams, node:HTMLElement) =>
{
    makeExamplesInteractive(params, node);
    makeTablesInteractive(node);
    makeImagesClickable(node);
    makeInternalAnchorsWork(node);
}

// The article is wrapped so the title, toolbar, table of contents and progress bar have a home that does
// not depend on the page's own layout.
const createRulebookShell = (params:RulebookParams, node:HTMLElement) : HTMLElement =>
{
    const shell = document.createElement("div");
    shell.className = "rulebook-shell";
    shell.dataset.toc = params.toc === false ? "none" : (params.tocPosition === "right" ? "right" : "left");
    shell.dataset.tocPrint = params.tocInPrint ? "true" : "false";

    for(const name of (params.className ?? "").split(/\s+/).filter(Boolean)) { shell.classList.add(name); }

    const layout = document.createElement("div");
    layout.className = "rulebook-layout";

    const main = document.createElement("div");
    main.className = "rulebook-main";

    node.parentElement.insertBefore(shell, node);
    layout.appendChild(main);
    main.appendChild(node);
    shell.appendChild(layout);

    return shell;
}

const createTitleBlock = (params:RulebookParams) : HTMLElement =>
{
    const block = document.createElement("header");
    block.className = "rulebook-title";

    if(params.showTitle === false) { block.hidden = true; }

    const name = (params.title ?? "").trim() || DEFAULT_RULEBOOK_TITLE;
    if(name !== DEFAULT_RULEBOOK_TITLE)
    {
        const label = document.createElement("div");
        label.className = "rulebook-title-label";
        label.textContent = "Rulebook";
        block.appendChild(label);
    }

    const heading = document.createElement("h1");
    heading.className = "rulebook-title-name";
    heading.textContent = name;
    block.appendChild(heading);

    if(params.subtitle)
    {
        const subtitle = document.createElement("p");
        subtitle.className = "rulebook-title-sub";
        subtitle.textContent = params.subtitle;
        block.appendChild(subtitle);
    }

    return block;
}

const updateTitleBlock = (params:RulebookParams) =>
{
    const oldBlock = params._titleNode;
    if(!oldBlock) { return; }

    const block = createTitleBlock(params);
    oldBlock.replaceWith(block);
    params._titleNode = block;
}

const applyTheme = (params:RulebookParams) =>
{
    // On <body>, so the paged print copy (which is not inside the shell) inherits it too. The default
    // value is declared on body as well, so the per-rulebook value has to be set on the same element.
    const root = document.body;
    const explicitAccent = params.accent?.trim();
    if(explicitAccent)
    {
        root.style.setProperty("--rb-accent", explicitAccent);
        // let the built-in color-mix / fallback provide a matching tint
        root.style.removeProperty("--rb-accent-soft");
    }
    else
    {
        const accent = pickAccent(params.title ?? DEFAULT_RULEBOOK_TITLE);
        root.style.setProperty("--rb-accent", accent.strong);
        root.style.setProperty("--rb-accent-soft", accent.soft);
    }
}

const createRulebookAPI = (params:RulebookParams, node:HTMLElement, shell:HTMLElement, toolbar:HTMLElement | null, toc:RulebookTOC | null) : RulebookAPI =>
{
    const api:RulebookAPI = {
        version: RULEBOOK_API_VERSION,
        id: "rulebook-" + (++rulebookCount),
        params,
        node,
        shell,
        toolbar,
        toc: toc?.node ?? null,
        root: params._sectionRoot,
        get title() { return (params.title ?? "").trim() || DEFAULT_RULEBOOK_TITLE; },

        getSections: () => flattenSections(params._sectionRoot),
        getSection: (id:string) => findSectionByID(params._sectionRoot, id),
        getSectionNodes: () => getSectionNodes(params._sectionRoot),
        getTables: () => Array.from(node.getElementsByClassName("rulebook-table-wrapper")) as HTMLElement[],
        getExamples: () => Array.from(node.getElementsByClassName("rulebook-example")) as HTMLElement[],

        foldSections: (folded = true) => { if(folded) { foldAll(node); } else { unfoldAll(node); } },
        foldTables: (folded = true) => { toggleTablesExpanded(node, !folded); },

        setTitle: (title:string) =>
        {
            params.title = title;
            updateTitleBlock(params);
            applyTheme(params);
        },
        setTOCInPrint: (enabled:boolean) => { setTOCInPrint(params, enabled); },

        getHTML: (flat = false) => flat
            ? getSectionAsFlatHTML(params._sectionRoot, params).innerHTML
            : node.innerHTML,

        print: (advanced = false) => advanced
            ? printAdvancedRulebook(params, node)
            : printBrowserRulebook(params, node),

        refresh: () => { params._tracker?.update(); },
        destroy: () =>
        {
            params._tracker?.destroy();
            toc?.destroy();
            unregisterRulebookAPI(api);
            shell.remove();
            params._built = false;
            params._rulebook = null;
            params._shell = null;
            params._toolbar = null;
            params._titleNode = null;
            params._toc = null;
            params._progressBar = null;
            params._tracker = null;
            params._api = null;
            (node as any).pqRulebook = null;
        },
    };

    (node as any).pqRulebook = api;
    return api;
}

export const resetRulebook = (params:RulebookParams, node:HTMLElement) =>
{
    const shell = params._shell;

    params._tracker?.destroy();
    params._toc?.destroy();
    if(params._api) { unregisterRulebookAPI(params._api); }

    // Replace only the rulebook node (and the wrapper built around it). The old code wiped
    // `document.body`, which destroyed every other element on the page.
    const fresh = document.createElement(node.tagName.toLowerCase() || "article");
    for(const attr of Array.from(node.attributes)) { fresh.setAttribute(attr.name, attr.value); }
    fresh.innerHTML = params._source ?? "";

    if(shell && shell.parentElement) { shell.replaceWith(fresh); }
    else { node.replaceWith(fresh); }

    params._rulebook = null;
    params._built = false;
    params._shell = null;
    params._toolbar = null;
    params._titleNode = null;
    params._toc = null;
    params._progressBar = null;
    params._tracker = null;
    params._api = null;
    params.container = fresh;
    params.text = undefined;

    const built = loadRulebookCallback(params);
    foldAllTables(built);
    return built;
}

export const loadRulebookCallback = (params:RulebookParams) =>
{
    rememberSource(params);

    // get rulebook content
    const node = parseInput(params);

    // register and activate special tools => things to do only ONCE
    if(!params._built)
    {
        params.title = resolveRulebookTitle(params, node);

        const shell = createRulebookShell(params, node);
        params._shell = shell;

        // The title spans the full width above both the table of contents and the content.
        const layout = shell.querySelector(".rulebook-layout");
        const titleBlock = createTitleBlock(params);
        params._titleNode = titleBlock;
        layout.insertBefore(titleBlock, layout.firstChild);

        const toolbar = params.toolbar === false ? null : createToolbar(params, node);
        params._toolbar = toolbar;
        if(toolbar) { shell.insertBefore(toolbar, shell.firstChild); }
        else { shell.insertBefore(createProgressBar(params, true), shell.firstChild); }

        buildOnce(params, node);
        params._toc = createRulebookTOC(params, shell);
        wireInteractivity(params, node);

        applyTheme(params);
        params._tracker = createRulebookScrollTracker(params, shell, node);

        params._built = true;
        params._rulebook = node;
        params._api = registerRulebookAPI(createRulebookAPI(params, node, shell, toolbar, params._toc));
    }

    // insert stylesheet
    addDefaultRulebookStyles(document.head);
    addCustomRulebookStyles(params, document.head);

    if(params._api) { params.onReady?.(params._api); }
    return node;
}

export const loadRulebook = (params:RulebookParams = {}) =>
{
    // paged.js is not loaded here at all: only the "Print (Advanced)" button needs it, and it pulls the
    // script in on click (see `loadPagedJS` in toolbar.ts)
    onWindowLoad(() => 
    {
        loadRulebookCallback(params);
    })
}
