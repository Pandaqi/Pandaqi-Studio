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

export const TABLE_ENTRY_CLASS = "rulebook-table-entry";
export const TABLE_WRAPPER_CLASS = "rulebook-table-wrapper";
export const TABLE_DETAIL_CLASS = "rulebook-table-detail";
export const TABLE_EXPANDED_CLASS = "rulebook-table-expanded";

const entriesOf = (node:HTMLElement) => Array.from(node.getElementsByClassName(TABLE_ENTRY_CLASS)) as HTMLElement[];
const wrapperOf = (entry:HTMLElement) => entry.closest(`.${TABLE_WRAPPER_CLASS}`) as HTMLElement | null;
const detailOf = (wrapper:HTMLElement | null) => (wrapper?.getElementsByClassName(TABLE_DETAIL_CLASS)[0] ?? null) as HTMLElement | null;

export const setTableEntryFolded = (entry:HTMLElement, folded:boolean) =>
{
    entry.dataset.folded = folded ? "true" : "false";
    entry.classList.toggle(`${TABLE_ENTRY_CLASS}-folded`, folded);
    entry.classList.toggle(`${TABLE_ENTRY_CLASS}-unfolded`, !folded);
    entry.setAttribute("aria-expanded", String(!folded));
}

// Clicking an entry opens it in a single detail panel under the table. The table itself never changes
// size, so opening one entry cannot shove the rest of the page around.
export const updateTableDetail = (wrapper:HTMLElement | null, entry:HTMLElement | null) =>
{
    const detail = detailOf(wrapper);
    if(!detail) { return; }

    const desc = entry?.querySelector(".desc-container");
    const hasDesc = !!desc && (desc.textContent ?? "").trim().length > 0;
    if(!entry || !hasDesc)
    {
        detail.hidden = true;
        detail.innerHTML = "";
        return;
    }

    const icon = entry.querySelector(".icon-container")?.cloneNode(true) as HTMLElement | null;
    const name = entry.querySelector(".heading-container")?.textContent?.trim() ?? "";

    detail.innerHTML = "";
    if(icon) { detail.appendChild(icon); }

    const main = document.createElement("div");
    main.classList.add("rulebook-table-detail-main");
    detail.appendChild(main);

    const heading = document.createElement("div");
    heading.classList.add("rulebook-table-detail-name");
    heading.textContent = name;
    main.appendChild(heading);

    const body = document.createElement("div");
    body.classList.add("rulebook-table-detail-body");
    body.appendChild(desc.cloneNode(true));
    main.appendChild(body);

    detail.hidden = false;
}

export const toggleTableEntry = (entry:HTMLElement) =>
{
    const wrapper = wrapperOf(entry);
    if(wrapper?.classList.contains(TABLE_EXPANDED_CLASS)) { return; } // the list view has nothing to fold

    const table = entry.closest(".rulebook-table") as HTMLElement | null;
    const willOpen = entry.dataset.folded === "true";

    if(willOpen && table)
    {
        for(const other of entriesOf(table))
        {
            if(other !== entry) { setTableEntryFolded(other, true); }
        }
    }

    setTableEntryFolded(entry, !willOpen);
    updateTableDetail(wrapper, willOpen ? entry : null);
}

// `foldAllTables` / `unfoldAllTables` switch the whole table between compact cards and a plain list in
// which every description is visible. Nothing left to click.
export const toggleTablesExpanded = (node:HTMLElement, expanded:boolean) =>
{
    const wrappers = Array.from(node.getElementsByClassName(TABLE_WRAPPER_CLASS)) as HTMLElement[];
    for(const wrapper of wrappers)
    {
        wrapper.classList.toggle(TABLE_EXPANDED_CLASS, expanded);
        for(const entry of entriesOf(wrapper)) { setTableEntryFolded(entry, true); }
        const detail = detailOf(wrapper);
        if(detail) { detail.hidden = true; detail.innerHTML = ""; }
    }
    return expanded;
}

export const foldAllTables = (node:HTMLElement) => { toggleTablesExpanded(node, false); }
export const unfoldAllTables = (node:HTMLElement) => { toggleTablesExpanded(node, true); }

export const makeTablesInteractive = (node:HTMLElement) =>
{
    const wrappers = Array.from(node.getElementsByClassName(TABLE_WRAPPER_CLASS)) as HTMLElement[];
    for(const wrapper of wrappers)
    {
        if(wrapper.dataset.interactive == "true") { continue; }
        wrapper.dataset.interactive = "true";

        for(const entry of entriesOf(wrapper))
        {
            setTableEntryFolded(entry, true);
            entry.setAttribute("role", "button");
            entry.setAttribute("tabindex", "0");
            entry.addEventListener("click", () => toggleTableEntry(entry));
            entry.addEventListener("keydown", (ev) =>
            {
                if(ev.key !== "Enter" && ev.key !== " ") { return; }
                ev.preventDefault();
                toggleTableEntry(entry);
            });
        }
    }
}

export const convertRulesTableDictToHTML = (params:RulebookTableParams = {}) =>
{
    params.config = params.config ?? {};
    const cont = document.createElement("div"); 
    cont.classList.add(TABLE_WRAPPER_CLASS);

    const table = document.createElement("section");
    table.classList.add("rulebook-table");
    cont.appendChild(table);
    if(params.config.class) { table.classList.add(params.config.class); }

    const uiHint = document.createElement("div");
    uiHint.classList.add("rulebook-table-ui-hint");
    uiHint.innerHTML = `Select an item for its description.`;
    cont.appendChild(uiHint);

    const dict = params.data ?? {};
    for(const [key,data] of Object.entries(dict))
    {
        const entry = document.createElement("div");
        entry.classList.add(TABLE_ENTRY_CLASS);
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
        descCont.innerHTML = desc ?? "";
        entry.appendChild(descCont);
    }

    const detail = document.createElement("div");
    detail.classList.add(TABLE_DETAIL_CLASS);
    detail.hidden = true;
    cont.appendChild(detail);

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
            const table = convertRulesTableDictToHTML(tableData);
            table.dataset.tableId = id;
            nodeMatch.appendChild(table);
            tables.push(nodeMatch);
        }
    }
    return tables;
}
