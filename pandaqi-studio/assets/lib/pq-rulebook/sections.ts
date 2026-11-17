import { findSheetForRulebookIcon, getAllRulebookIconKeys, getRulebookIconNode } from "./icons";
import type { RulebookParams } from "./rulebook";
import { ICONS } from "./theme/applyStyles";
import { toggleSectionFold } from "./toolbar";

export const DEFAULT_SECTION_CLASS = "rulebook-section";
export const DEFAULT_SECTION_CONTENT_CLASS = "rulebook-section-content";
export const DEFAULT_SECTION_HEADER_CLASS = "rulebook-section-header"

export class RulebookSection
{
    node: HTMLElement
    headingNode: HTMLHeadingElement
    content: (HTMLElement|RulebookSection)[]
    level: number;

    hideHeader: boolean;
    hideContent: boolean;
    forbidFolding: boolean;

    constructor(headingNode:HTMLHeadingElement)
    {
        this.headingNode = headingNode;
        this.headingNode.id = getHeadingID(this.headingNode.textContent ?? "");
        this.level = this.headingNode ? parseInt(this.headingNode.tagName.slice(-1)) : 1;
        this.content = [];
    }

    addContent(n:HTMLElement|RulebookSection)
    {
        this.content.push(n);
    }

    setRootNode(node:HTMLElement) { this.node = node; }
    getLevel() { return this.level; }
}

export const createRootSection = (params:RulebookParams) =>
{
    const mainHeading = document.createElement("h1");
    mainHeading.innerHTML = "Rulebook";
    const sectionRoot = new RulebookSection(mainHeading);
    sectionRoot.hideHeader = true;
    sectionRoot.forbidFolding = true;
    params._sectionRoot = sectionRoot;
    return sectionRoot;
}

// A readable, selector-safe anchor. The old version took the last character of anything that did not
// start with a letter (an emoji heading became the id ">"), which produced anchors that no link could
// ever target.
export const getHeadingID = (s:string) : string =>
{
    const base = (s ?? "")
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/['’`]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

    if(!base) { return "section"; }
    return /^[a-z]/.test(base) ? base : `section-${base}`;
}

// Two headings may share a title ("Example" appears more than once). Anchors must stay unique or the
// table of contents would always jump to the first one.
export const ensureUniqueHeadingIDs = (root:RulebookSection) =>
{
    const seen = new Set<string>();
    const walk = (section:RulebookSection) =>
    {
        let id = section.headingNode.id || "section";
        if(seen.has(id))
        {
            let counter = 2;
            while(seen.has(`${id}-${counter}`)) { counter++; }
            id = `${id}-${counter}`;
            section.headingNode.id = id;
        }
        seen.add(id);

        for(const child of section.content)
        {
            if(child instanceof RulebookSection) { walk(child); }
        }
    }
    walk(root);
}

export const getAllSections = (node:HTMLElement) => { return Array.from(node.getElementsByClassName(DEFAULT_SECTION_CLASS)) as HTMLElement[]; }

export const getSectionNodes = (root:RulebookSection) : HTMLElement[] =>
{
    const nodes:HTMLElement[] = [];
    const walk = (section:RulebookSection) =>
    {
        if(section.node) { nodes.push(section.node); }
        for(const child of section.content)
        {
            if(child instanceof RulebookSection) { walk(child); }
        }
    }
    walk(root);
    return nodes;
}

// Every section below the root, in reading order. Used by the public API (`PQRulebook`).
export const flattenSections = (root:RulebookSection) : RulebookSection[] =>
{
    const sections:RulebookSection[] = [];
    const walk = (section:RulebookSection) =>
    {
        for(const child of section.content)
        {
            if(!(child instanceof RulebookSection)) { continue; }
            sections.push(child);
            walk(child);
        }
    }
    walk(root);
    return sections;
}

export const findSectionByID = (root:RulebookSection, id:string) : RulebookSection | null =>
{
    if(root.headingNode.id === id) { return root; }
    for(const child of root.content)
    {
        if(!(child instanceof RulebookSection)) { continue; }
        const match = findSectionByID(child, id);
        if(match) { return match; }
    }
    return null;
}

const HEADING_TAG = /^H([1-6])$/;

const headingLevelOf = (node:Element) : number =>
{
    const match = HEADING_TAG.exec(node.tagName);
    return match ? parseInt(match[1]) : 0;
}

// The level the actual rulebook sections sit on. Content is written with whatever heading level the
// author felt like (`##` in one rulebook, `#` or `###` in another), and a page may put its own title
// above the rulebook. The old walker assumed "the first heading is one level below the root" and could
// not cope with anything else: a lone <h1> above `##` content made it pop the root off an empty stack,
// which threw and left every rulebook on the site unrendered. Reading the level from the content makes
// all of those shapes work.
const findBaseLevel = (levels:number[]) : number =>
{
    if(levels.length <= 0) { return 1; }

    const first = levels[0];
    const following = levels.slice(1);
    // A lone heading above everything else is a document title, not the level of the sections.
    if(following.length > 0 && first < Math.min(...following)) { return Math.min(...following); }
    return Math.min(...levels);
}

export const findSections = (node:HTMLElement, parentSection:RulebookSection) =>
{
    const children = Array.from(node.children) as HTMLElement[];
    if(children.length <= 0) { return; }

    const baseLevel = findBaseLevel(children.map(headingLevelOf).filter((level) => level > 0));

    // `hierarchy[0]` is what everything hangs from; each following entry is one section deeper. A
    // heading at `baseLevel` is a top-level section, `baseLevel + 1` nests inside it, and so on.
    const hierarchy = [parentSection];
    for(const child of children)
    {
        const level = headingLevelOf(child);
        const curSection = hierarchy[hierarchy.length - 1];

        // Not a heading, or a heading above the sections (a page title): plain content of the section
        // we are in. Nothing is dropped, so the text always stays readable.
        if(level <= 0 || level < baseLevel)
        {
            curSection.addContent(child);
            continue;
        }

        // Clamped to one deeper than the current section, so a skipped level (`##` straight to `####`)
        // nests instead of silently disappearing.
        const depth = Math.min(level - baseLevel + 1, hierarchy.length);
        while(hierarchy.length > depth) { hierarchy.pop(); }

        const newSection = new RulebookSection(child as HTMLHeadingElement);
        hierarchy[hierarchy.length - 1].addContent(newSection);
        hierarchy.push(newSection);
    }
}

const getHierarchyDisplay = (indices:number[]) : string =>
{
    return indices.filter((x) => x != 0).join(".");
}

export const makeSectionHeader = (section:RulebookSection, indices = [], params:RulebookParams, div:HTMLElement, flat = false) =>
{
    if(section.hideHeader) { return; }

    const header = document.createElement("header");
    div.appendChild(header);
    header.classList.add(DEFAULT_SECTION_HEADER_CLASS);
    header.dataset.level = String(section.getLevel());
    header.dataset.sectionId = section.headingNode.id;

    if(!flat)
    {
        // headers are clickable: give keyboard users the same affordance
        header.setAttribute("role", "button");
        header.setAttribute("tabindex", "0");
        header.setAttribute("aria-expanded", "true");

        const activate = () =>
        {
            const folded = header.dataset.folded == "true";
            toggleSectionFold(div, !folded);
        }

        header.addEventListener("click", activate);
        header.addEventListener("keydown", (ev) =>
        {
            if(ev.key !== "Enter" && ev.key !== " ") { return; }
            ev.preventDefault();
            activate();
        });
    }

    const hierarchyDisplay = document.createElement("div");
    header.appendChild(hierarchyDisplay);
    hierarchyDisplay.classList.add("rulebook-section-hierarchy");
    hierarchyDisplay.innerHTML = getHierarchyDisplay(indices);

    const possibleIcons = params.headerIcons ?? ICONS;
    const iconID = section.headingNode.id;
    const addDefaultIcon = !params.hideHeaderIcons && possibleIcons.includes(iconID);
    const allCustomIconKeys = getAllRulebookIconKeys(params);
    const addCustomIcon = !params.hideHeaderIconsCustom && allCustomIconKeys.includes(iconID);
    const addIcon = addDefaultIcon || addCustomIcon;
    if(addIcon) 
    {
        const cont = document.createElement("span");
        cont.classList.add("rulebook-section-header-container");

        let icon;
        if(addDefaultIcon) {
            icon = document.createElement("span");
        } else {
            icon = getRulebookIconNode(iconID, findSheetForRulebookIcon(iconID, params));
        }

        icon.classList.add(`rules-icon`,`rules-icon-${iconID}`);
        icon.setAttribute("aria-hidden", "true");
        cont.appendChild(icon);
        cont.appendChild(section.headingNode.cloneNode(true));

        header.appendChild(cont);
    }
    
    if(!addDefaultIcon && !addCustomIcon)
    {
        header.appendChild(section.headingNode.cloneNode(true));
    }

    const arrow = document.createElement("div");
    arrow.classList.add("rulebook-section-arrow");
    arrow.setAttribute("aria-hidden", "true");
    header.appendChild(arrow);
    arrow.innerHTML = "&uarr;";
    if(flat) { arrow.innerHTML = "&darr;" }
}

export const makeSectionContent = (section:RulebookSection, indices = [], params:RulebookParams, node:HTMLElement, flat = false) =>
{
    if(!flat)
    {
        const newNode = document.createElement("section");
        newNode.classList.add(DEFAULT_SECTION_CONTENT_CLASS);
        node.appendChild(newNode);
        node = newNode;
    }

    const curLevel = section.getLevel();
    for(const child of section.content)
    {
        if(child instanceof HTMLElement) { node.appendChild(child.cloneNode(true)); }
        if(child instanceof RulebookSection) 
        { 
            indices[curLevel-1] += 1;
            const newNode = makeSectionInteractiveRecursively(child, indices.slice(), params, node, flat);
            if(!flat) { node.appendChild(newNode); } 
        }
    }
}

export const makeSectionInteractiveRecursively = (section:RulebookSection, indices = [0,0,0,0,0,0], params:RulebookParams, node:HTMLElement = null, flat = false) =>
{
    // if no node is given, we're building a tree (with each section child of previous)
    // otherwise, we're creating a flat list, attaching to the same node
    if(!flat) 
    {
        node = document.createElement("div");
        node.classList.add(DEFAULT_SECTION_CLASS);
        node.dataset.level = String(section.getLevel());
        node.dataset.sectionId = section.headingNode.id;
        section.setRootNode(node);
 
        if(section.forbidFolding)
        {
            node.dataset.nofold = "true";
        }
    }

    makeSectionHeader(section, indices, params, node, flat);
    makeSectionContent(section, indices, params, node, flat);

    return node;
}

export const getSectionAsFlatHTML = (section:RulebookSection, params:RulebookParams) =>
{
    const div = document.createElement("div");
    makeSectionInteractiveRecursively(section, undefined, params, div, true);
    return div;
}

export const unfoldAllSectionsAbove = (node: HTMLElement) =>
{
    let parentElement: HTMLElement | null = node;
    while(parentElement)
    {
        if(parentElement.classList.contains(DEFAULT_SECTION_CLASS)) { toggleSectionFold(parentElement, false); }
        parentElement = parentElement.parentElement;
    }
}
