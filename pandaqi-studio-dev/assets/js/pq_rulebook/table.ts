class RulesTable
{
    node: any;
    entries: RulesEntry[];
    
    constructor(node: HTMLElement)
    {
        this.node = node;
        this.entries = [];

        const entryNodes = this.node.getElementsByClassName("rules-table-entry");
        for(const entryNode of entryNodes)
        {
            const entryObj = new RulesEntry(entryNode);
            this.entries.push(entryObj);
        }   
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

export { RulesTable, RulesEntry }
export default RulesTable;

