import { createInteractiveExamples, InteractiveExampleParams } from "./examples/interactiveExample";
import { parseInput } from "./parser/parser";
import { findSections, getSectionAsFlatHTML, makeSectionInteractiveRecursively, RulebookSection } from "./sections";
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

    // special elements (examples, rules tables, etc)
    exampleClass?: string,
    examples?: Record<string,InteractiveExampleParams>,
    tableClass?: string,
    tables?: Record<string,RulebookTableParams>

    // dynamic stuff used by system
    _sectionRoot?: RulebookSection
}

export const loadRulebook = (params:RulebookParams = {}) =>
{
    window.addEventListener("load", () => 
    {
        // get rulebook content
        const node = parseInput(params);
        const toolbar = createToolbar(params, node);
        node.parentElement.insertBefore(toolbar, node);

        // divide into sections hierarchy
        const mainHeading = document.createElement("h1");
        mainHeading.innerHTML = "Rulebook";
        const sectionRoot = new RulebookSection(mainHeading);
        sectionRoot.hideHeader = true;
        sectionRoot.forbidFolding = true;
        params._sectionRoot = sectionRoot;

        findSections(node, sectionRoot);
        node.appendChild(makeSectionInteractiveRecursively(sectionRoot, undefined, params));

        // add basic qol interactivity
        makeImagesClickable(node);
        makeInternalAnchorsWork(node);

        // register and activate special tools
        const interactiveExamples = createInteractiveExamples(params, node);
        const rulesTables = createRulebookTables(params, node);

        // insert stylesheet
        addDefaultRulebookStyles(document.head);
        addCustomRulebookStyles(params, document.head);
    })
}