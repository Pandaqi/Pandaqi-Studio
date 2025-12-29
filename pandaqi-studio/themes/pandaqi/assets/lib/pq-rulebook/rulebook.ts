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
}

export const resetRulebook = (params:RulebookParams, node:HTMLElement) =>
{
    document.body.innerHTML = "";
    document.body.appendChild(node);
    params._rulebook = node;
    loadRulebookCallback(params);
    foldAllTables(node);
}

export const loadRulebookCallback = (params:RulebookParams) =>
{
    // get rulebook content
    const node = parseInput(params);
    const toolbar = createToolbar(params, node);
    node.parentElement.insertBefore(toolbar, node);

    // if this is the first run (no rulebook saved/created/available yet)
    // do the "expand shortcode into full HTML" bit below
    if(!params._rulebook)
    {
        // register and activate special tools => things to do only ONCE
        const rulesTables = createRulebookTableHTML(params, node);
        const rulesIcons = createRulebookIconHTML(params, node);
        const rulesExamples = createRulebookExampleHTML(params, node);
        console.log("[Rulebook] Tables, Icons & Examples", rulesTables, rulesIcons, rulesExamples);

        // divide into sections hierarchy
        const sectionRoot = createRootSection(params);
        findSections(node, sectionRoot);
        node.innerHTML = "";
        node.appendChild(makeSectionInteractiveRecursively(sectionRoot, undefined, params));
        console.log("[Rulebook] Sections", sectionRoot);

        // add basic qol interactivity
        // @NOTE: we _clone_ nodes in the previous section, but then we never clone them again, so we only need to do this ONCe here and the interactivity remains
        const interactiveExamples = makeExamplesInteractive(params, node);
        console.log("[Rulebook] Interactive Examples", interactiveExamples);

        makeTablesInteractive(node);
        makeImagesClickable(node);
        makeInternalAnchorsWork(node);
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

    window.addEventListener("load", () => 
    {
        loadRulebookCallback(params);
    })
}