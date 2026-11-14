import { createRulebookExampleHTML, InteractiveExampleParams, makeExamplesInteractive } from "./examples/interactiveExample";
import { createRulebookIconHTML, IconSheetParams } from "./icons";
import { parseInput } from "./parser/parser";
import { createRootSection, findSections, makeSectionInteractiveRecursively, RulebookSection } from "./sections";
import { createRulebookTableHTML, foldAllTables, makeTablesInteractive, RulebookTableParams } from "./tables";
import { addCustomRulebookStyles, addDefaultRulebookStyles } from "./theme/style";
import { createToolbar, makeImagesClickable, makeInternalAnchorsWork } from "./toolbar";

export interface RulebookParams
{
    // actual content/text input
    text?: string
    container?: string|HTMLElement,
    _rulebook?: HTMLElement // has the final, parsed, converted rulebook; should only be used by system, not user

    // custom styling
    styles?: string,
    fontBody?: string,
    fontHeader?: string,
    headerIcons?: string[],
    hideHeaderIcons?: boolean,
    usePagedForPrint?: boolean,

    // special elements (examples, rules tables, etc)
    exampleClass?: string,
    examples?: Record<string,InteractiveExampleParams>,
    tableClass?: string,
    tables?: Record<string,RulebookTableParams>,
    iconClass?: string,
    icons?: Record<string,IconSheetParams>,
    hideHeaderIconsCustom?: boolean, // doesn't add icons to headers if they match the custom `icons`

    // dynamic stuff used by system (hence underscore before)
    _sectionRoot?: RulebookSection
    _built?: boolean // the shortcodes were expanded and the sections were created once already
    _source?: string // the original markdown, kept so a reset can rebuild instead of re-parsing rendered HTML
}

// A bundle can be evaluated after the window already fired `load` (a late/dynamic script); waiting for
// `load` alone then never calls back and the rulebook silently stays unrendered.
const onWindowLoad = (callback:() => void) =>
{
    if(document.readyState === "complete") { callback(); return; }
    window.addEventListener("load", callback, { once: true });
}

const DEFAULT_RULEBOOK_ID = "rulebook-content";

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

export const resetRulebook = (params:RulebookParams, node:HTMLElement) =>
{
    // Replace only the rulebook node. This used to wipe `document.body`, which destroyed every other element
    // on the page and every listener the framework had attached outside `node`, then re-rendered from the
    // already-rendered node.
    const fresh = document.createElement(node.tagName.toLowerCase() || "article");
    for(const attr of Array.from(node.attributes)) { fresh.setAttribute(attr.name, attr.value); }
    fresh.innerHTML = params._source ?? "";
    node.replaceWith(fresh);

    // the rebuild creates a fresh toolbar; drop the old one instead of stacking a second set of buttons
    const previousToolbar = fresh.previousElementSibling;
    if(previousToolbar && previousToolbar.classList.contains("rulebook-toolbar")) { previousToolbar.remove(); }

    params._rulebook = null;
    params._built = false;
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
        const toolbar = createToolbar(params, node);
        node.parentElement.insertBefore(toolbar, node);

        buildOnce(params, node);
        wireInteractivity(params, node);

        params._built = true;
        params._rulebook = node;
    }

    // insert stylesheet
    addDefaultRulebookStyles(document.head);
    addCustomRulebookStyles(params, document.head);

    return node;
}

export const loadRulebook = (params:RulebookParams = {}) =>
{
    if(params.usePagedForPrint)
    {
        // this prevents paged from running automatically upon load; we only want to use it when we print
        // we want to do this absolutely as early as possible to make sure we're on time
        // @ts-ignore
        window.PagedConfig = 
        {
            auto: false,
            after: (flow) => { console.log("[Rulebook] Paged.js preview done", flow) },
        };
    }

    onWindowLoad(() => 
    {
        loadRulebookCallback(params);
    })
}
