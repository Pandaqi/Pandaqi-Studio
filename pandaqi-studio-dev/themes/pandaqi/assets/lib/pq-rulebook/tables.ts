import { getRulebookIconNode, type IconSheetData } from "./icons"
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

export interface RulebookTableData
{
    class?: string,
    icons?: IconSheetData    
}

export interface RulebookTableParams
{
    id?: string,
    node?: HTMLElement,
    useExistingHTML?: boolean, // if true, it doesn't build the table but accepts whatever HTML is already inside the node
    config?: RulebookTableData
    data?: Record<string,RulebookEntryData>
}

export const convertDictToRulesTableHTML = (dict:Record<string,any>, props:Record<string,string>, params:RulebookTableData = {}) =>
{
    return convertRulesTableDictToHTML( convertDictToRulesTableDict(dict, props), params);
}

// This is just a helper function to easily map any set of data to the right format for a RulesTable to display
export const convertDictToRulesTableDict = (dict:Record<string,any>, props:Record<string,string>) : Record<string,RulebookEntryData> =>
{
    const newDict = {};
    const defProps = ["heading", "label", "desc", "class", "icon", "frame", "sheetURL", "sheetWidth"]; // @NOTE: should be the same as the interface keys of RulesEntryData => is there a way to AUTOMATE getting them then?
    for(const [key,data] of Object.entries(dict))
    {
        const obj = {};
        for(const defProp of defProps)
        {
            obj[defProp] = data[props[defProp] ?? defProp];
            if(defProp == "heading" && !obj[defProp]) { obj[defProp] = key; }
            if(defProp == "icon" && !obj[defProp]) { obj[defProp] = key; }
        }
        newDict[key] = obj;
    }
    return newDict;
}

export const convertRulesTableDictToHTML = (dict:Record<string,RulebookEntryData>, params:RulebookTableData = {}) =>
{
    const cont = document.createElement("div"); 

    const table = document.createElement("section");
    table.classList.add("rulebook-table");
    cont.appendChild(table);
    if(params.class) { table.classList.add(params.class); }

    const uiHint = document.createElement("div");
    uiHint.classList.add("ui-hint");
    uiHint.innerHTML = `Click an item to inspect.`;
    cont.appendChild(uiHint);

    for(const [key,data] of Object.entries(dict))
    {
        const entry = document.createElement("div");
        entry.classList.add("rulebook-table-entry");
        if(params.class) { entry.classList.add(params.class); }
        table.appendChild(entry);

        const iconCont = document.createElement("div");
        iconCont.classList.add("icon-container");
        entry.appendChild(iconCont);

        iconCont.appendChild( getRulebookIconNode(data, params.icons) );

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

export class RulebookTable
{
    id: string
    node: HTMLElement;
    entries: RulebookEntry[];

    constructor(params:RulebookTableParams)
    {
        this.id = params.id;
        this.node = params.node;

        if(!params.useExistingHTML) 
        {
            const cont = convertRulesTableDictToHTML(params.data, params.config);
            this.node.parentElement.replaceChild(cont, this.node);
            this.node = cont;
        }

        const entryNodes = Array.from(this.node.getElementsByClassName("rulebook-table-entry"));
        for(const entryNode of entryNodes)
        {
            this.entries.push(new RulebookEntry(entryNode));
        }
        
        return this;
    }
}

export class RulebookEntry 
{
    node: HTMLElement;
    heading: HTMLElement;
    desc: HTMLElement;
    icon: HTMLElement;
    
    constructor(node: any)
    {   
        this.node = node;

        this.heading = this.node.getElementsByClassName("heading-container")[0] as HTMLElement;
        this.desc = this.node.getElementsByClassName("desc-container")[0] as HTMLElement;
        this.icon = this.node.getElementsByClassName("icon-container")[0] as HTMLElement;
        this.icon.addEventListener("click", this.toggle.bind(this));

        this.toggle(); // to fold it at start
    }

    isFolded() { return this.node.dataset.folded == "true" }
    toggle()
    {
        if(this.isFolded()) {
            this.node.dataset.folded = "false";
            this.node.classList.add("rulebook-table-entry-clicked");
        } else {
            this.node.dataset.folded = "true";
            this.node.classList.remove("rulebook-table-entry-clicked");
        }
    } 
}

const DEFAULT_TABLE_CLASS = "rulebook-table";

export const createRulebookTables = (params:RulebookParams, node:HTMLElement) =>
{
    const tables = [];
    const tablesData = params.tables ?? {};
    
    // first check for existing nodes with existing HTML to register
    const className = params.tableClass ?? DEFAULT_TABLE_CLASS;
    const existingNodes = Array.from(node.getElementsByClassName(className)) as HTMLElement[];
    for(const node of existingNodes)
    {
        if(node.innerHTML.trim().length <= 0) { continue; }
        tables.push(new RulebookTable({ node: node, useExistingHTML: true }));
    }

    // then look for custom IDs that need to build the table from JS
    for(const [id,tableData] of Object.entries(tablesData))
    {
        const nodesMatching = Array.from(node.querySelectorAll(`[data-rulebook-table="${id}"]`)) as HTMLElement[];
        for(const nodeMatch of nodesMatching)
        {
            tableData.node = nodeMatch;
            tableData.id = id;
            tables.push(new RulebookTable(tableData));
        }
    }

    return tables;
}