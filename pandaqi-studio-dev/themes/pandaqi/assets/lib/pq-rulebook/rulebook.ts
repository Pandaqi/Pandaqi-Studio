import { createInteractiveExamples, InteractiveExampleParams } from "./examples/interactiveExample";
import { parseInput } from "./parser/parser";
import { createRootSection, findSections, makeSectionInteractiveRecursively, RulebookSection } from "./sections";
import { createRulebookTables, RulebookTableParams } from "./tables";
import { addCustomRulebookStyles, addDefaultRulebookStyles } from "./theme/style";
import { createToolbar, makeImagesClickable, makeInternalAnchorsWork } from "./toolbar";

export interface RulebookParams
{
    // actual content/text input
    text?: string
    container?: string|HTMLElement,

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
    tables?: Record<string,RulebookTableParams>

    // dynamic stuff used by system (hence underscore before)
    _sectionRoot?: RulebookSection
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
        // get rulebook content
        const node = parseInput(params);
        const toolbar = createToolbar(params, node);
        node.parentElement.insertBefore(toolbar, node);

        // divide into sections hierarchy
        const sectionRoot = createRootSection(params);
        findSections(node, sectionRoot);
        node.appendChild(makeSectionInteractiveRecursively(sectionRoot, undefined, params));
        console.log("[Rulebook] Sections", sectionRoot);

        // add basic qol interactivity
        makeImagesClickable(node);
        makeInternalAnchorsWork(node);

        // register and activate special tools
        const interactiveExamples = createInteractiveExamples(params, node);
        const rulesTables = createRulebookTables(params, node);
        console.log("[Rulebook] Examples & Tables", interactiveExamples, rulesTables);

        // insert stylesheet
        addDefaultRulebookStyles(document.head);
        addCustomRulebookStyles(params, document.head);
    })
}