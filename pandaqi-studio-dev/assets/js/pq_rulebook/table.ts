interface RulesEntryData
{
    heading: string,
    desc: string,
    class?: string,
    icon?: string,
    frame?: number,
    // iconPrefix?: string => dropped support for this, as it's just a nasty useless exception that shouldn't be used anyway
}

interface RulesTableParams
{
    sheetURL?: string
    sheetWidth?: number
    base?: string
}

const convertDictToRulesTableHTML = (dict:Record<string,any>, props:Record<string,string>, params:RulesTableParams = {}) =>
{
    return convertRulesTableDictToHTML( convertDictToRulesTableDict(dict, props), params);
}

// This is just a helper function to easily map any set of data to the right format for a RulesTable to display
const convertDictToRulesTableDict = (dict:Record<string,any>, props:Record<string,string>) : Record<string,RulesEntryData> =>
{
    const newDict = {};
    const defProps = ["heading", "desc", "class", "icon", "frame"]; // @NOTE: should be the same as the interface keys of RulesEntryData
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

const convertRulesTableDictToHTML = (dict:Record<string,RulesEntryData>, params:RulesTableParams = {}) =>
{
    const cont = document.createElement("div"); 

    const table = document.createElement("section");
    table.classList.add("rules-table");
    cont.appendChild(table);

    const uiHint = document.createElement("div");
    uiHint.classList.add("ui-hint");
    uiHint.innerHTML = "Click a symbol to see its name / meaning.";
    cont.appendChild(uiHint);

    params.sheetWidth = params.sheetWidth ?? 8;

    const base = params.base ?? "";

    for(const [key,data] of Object.entries(dict))
    {
        const entry = document.createElement("div");
        entry.classList.add("rules-table-entry", "rules-table-entry-clicked");
        table.appendChild(entry);

        const iconCont = document.createElement("div");
        iconCont.classList.add("icon-container");
        entry.appendChild(iconCont);

        const icon = document.createElement("div");
        icon.classList.add("rules-table-icon", "icon-" + data.icon);

        if(params.sheetURL) { icon.style.backgroundImage = "url(" + base + params.sheetURL + ")"; }
        icon.style.backgroundSize = (params.sheetWidth*100) + "%";

        const xPos = data.frame % params.sheetWidth;
        const yPos = Math.floor(data.frame / params.sheetWidth); 
        icon.style.backgroundPositionX = -(xPos * 100) + "%";
        icon.style.backgroundPositionY = -(yPos * 100) + "%";

        iconCont.appendChild(icon);

        const headingCont = document.createElement("div");
        headingCont.classList.add("heading-container");
        headingCont.innerHTML = "<div>" + data.heading + "</div>";
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

class RulesTable
{
    node: HTMLElement;
    entries: RulesEntry[];

    fromNode(node: HTMLElement)
    {
        this.node = node;
        this.node.dataset.pqRulebookChecked = "true";
        this.entries = [];

        const entryNodes = Array.from(node.getElementsByClassName("rules-table-entry"));
        for(const entryNode of entryNodes)
        {
            const entryObj = new RulesEntry(entryNode);
            this.entries.push(entryObj);
        }
        
        return this;
    }

    fromDictionaryToHTML(dict:Record<string,RulesEntryData>)
    {
        
    }

    toggleSimpleView(simple = true)
    {
        for(const entry of this.entries)
        {
            entry.toggleSimpleView(simple);
        }
    }
}

class RulesEntry 
{
    node: HTMLElement;
    turnFullWidthOnClick: boolean;
    heading: HTMLElement;
    desc: HTMLElement;
    icon: HTMLElement;
    
    constructor(node: any)
    {   
        this.node = node;

        this.turnFullWidthOnClick = this.node.classList.contains("click-full-width");

        this.heading = this.node.getElementsByClassName("heading-container")[0] as HTMLElement;
        this.desc = this.node.getElementsByClassName("desc-container")[0] as HTMLElement;
        this.icon = this.node.getElementsByClassName("icon-container")[0] as HTMLElement;
        this.icon.addEventListener("click", this.toggle.bind(this));

        this.toggle(); // to fold it at start
    }

    isFolded()
    {
        return this.node.dataset.folded == "true"
    }

    toggle()
    {
        if(this.isFolded()) {
            this.node.dataset.folded = "false";
            this.node.classList.add("rules-table-entry-clicked");
            if(this.turnFullWidthOnClick) { this.node.classList.add("rules-table-entry-clicked-full"); }
        } else {
            this.node.dataset.folded = "true";
            this.node.classList.remove("rules-table-entry-clicked");
            if(this.turnFullWidthOnClick) { this.node.classList.remove("rules-table-entry-clicked-full"); }
        }
    } 
    
    toggleSimpleView(simple = true)
    {
        if(this.isFolded() != simple) { return; }
        this.toggle();
    }
}

export { RulesTable, RulesEntry, convertDictToRulesTableDict, convertRulesTableDictToHTML, convertDictToRulesTableHTML }
export default RulesTable;

