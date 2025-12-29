import { getRulebookIconNode, IconSheetParams } from "./icons"
import type { RulebookParams } from "./rulebook"

export interface RulebookEntryData
{
    heading?: string,
    label?: string, // alias for heading => kept around for legacy purposes, because older games use heading/label interchangeably :/
    desc?: string,
    class?: string,
    frame?: number,
    sheetURL?: string,
    sheetWidth?: number,
}

// @TODO: looks silly now, but will receive more config/attributes stuff later, so good to already put into its own object
export interface RulebookTableData
{
    class?: string,
}

export interface RulebookTableParams
{
    id?: string,
    node?: HTMLElement,
    useExistingHTML?: boolean, // if true, it doesn't build the table but accepts whatever HTML is already inside the node
    config?: RulebookTableData,
    icons?: IconSheetParams,
    data?: Record<string,RulebookEntryData>
}

export const foldAllTables = (node:HTMLElement) =>
{
    const elems = Array.from(node.getElementsByClassName("rulebook-table-entry")) as HTMLElement[];
    for(const elem of elems)
    {
        if(elem.dataset.folded == "true") { continue; }
        toggleTableEntry(elem);
    }
}

export const unfoldAllTables = (node:HTMLElement) =>
{
    const elems = Array.from(node.getElementsByClassName("rulebook-table-entry")) as HTMLElement[];
    for(const elem of elems)
    {
        if(elem.dataset.folded == "false") { continue; }
        toggleTableEntry(elem);
    }
}

export const toggleTableEntry = (entry:HTMLElement) =>
{
    const isFolded = entry.dataset.folded == "true";
    if(isFolded) {
        entry.dataset.folded = "false";
        entry.classList.remove("rulebook-table-entry-folded");
        entry.classList.add("rulebook-table-entry-unfolded");
    } else {
        entry.dataset.folded = "true";
        entry.classList.add("rulebook-table-entry-folded");
        entry.classList.remove("rulebook-table-entry-unfolded");
    }
}

export const makeTablesInteractive = (node:HTMLElement) =>
{
    const elems = Array.from(node.getElementsByClassName("rulebook-table-entry")) as HTMLElement[];
    for(const elem of elems)
    {
        const needsInit = !elem.dataset.folded;
        if(needsInit) { elem.dataset.folded = "true"; elem.classList.add("rulebook-table-entry-folded"); }
        elem.addEventListener("click", () => toggleTableEntry(elem));
    }
}

export const convertRulesTableDictToHTML = (params:RulebookTableParams = {}) =>
{
    params.config = params.config ?? {};
    const cont = document.createElement("div"); 

    const table = document.createElement("section");
    table.classList.add("rulebook-table");
    cont.appendChild(table);
    if(params.config.class) { table.classList.add(params.config.class); }

    const uiHint = document.createElement("div");
    uiHint.classList.add("rulebook-table-ui-hint");
    uiHint.innerHTML = `Click an item to inspect.`;
    cont.appendChild(uiHint);

    const dict = params.data;
    for(const [key,data] of Object.entries(dict))
    {
        const entry = document.createElement("div");
        entry.classList.add("rulebook-table-entry");
        if(data.class) { entry.classList.add(data.class); }
        table.appendChild(entry);

        const iconCont = document.createElement("div");
        iconCont.classList.add("icon-container");
        entry.appendChild(iconCont);

        const iconNode = getRulebookIconNode(data, params.icons);
        iconNode.classList.add("rulebook-table-icon");
        iconCont.appendChild(iconNode);

        const heading = data.heading ?? data.label ?? key;
        const headingCont = document.createElement("div");
        headingCont.classList.add("heading-container");
        headingCont.innerHTML = `<div>${heading}</div>`;
        entry.appendChild(headingCont);

        let desc = data.desc;
        if(Array.isArray(desc)) { desc = desc[0]; }

        const descCont = document.createElement("div");
        descCont.classList.add("desc-container");
        descCont.innerHTML = desc;
        entry.appendChild(descCont);
    }

    return cont;
}

const DEFAULT_TABLE_CLASS = "rulebook-table";

export const createRulebookTableHTML = (params:RulebookParams, node:HTMLElement) : HTMLElement[] =>
{
    const tables = [];
    const tablesData = params.tables ?? {};
    params.tableClass = params.tableClass ?? DEFAULT_TABLE_CLASS;

    // then look for custom IDs that need to build the table from JS
    for(const [id,tableData] of Object.entries(tablesData))
    {
        const nodesMatching = Array.from(node.querySelectorAll(`[data-rulebook-table="${id}"]`)) as HTMLElement[];
        for(const nodeMatch of nodesMatching)
        {
            nodeMatch.appendChild(convertRulesTableDictToHTML(tableData));
            tables.push(nodeMatch);
        }
    }
    return tables;
}