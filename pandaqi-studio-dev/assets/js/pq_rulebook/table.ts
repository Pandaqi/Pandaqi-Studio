class RulesTable
{
    node: any;
    entries: RulesEntry[];
    
    constructor(node: HTMLElement, isPDF: boolean)
    {
        this.node = node;
        this.entries = [];

        const entryNodes = this.node.getElementsByClassName("rules-table-entry");
        for(const entryNode of entryNodes)
        {
            const entryObj = new RulesEntry(entryNode, isPDF);
            this.entries.push(entryObj);
        }   
    }
}

class RulesEntry 
{
    node: any;
    turnFullWidthOnClick: boolean;
    heading: HTMLElement;
    desc: HTMLElement;
    icon: HTMLElement;
    
    constructor(node: any, isPDF: any)
    {   
        this.node = node;

        this.turnFullWidthOnClick = this.node.classList.contains("click-full-width");

        this.heading = this.node.getElementsByClassName("heading-container")[0];
        this.desc = this.node.getElementsByClassName("desc-container")[0];
        this.icon = this.node.getElementsByClassName("icon-container")[0];
        this.icon.addEventListener("click", this.toggle.bind(this));

        if(!isPDF) { this.toggle(); } // to fold it at start
    }

    toggle()
    {
        if(this.node.dataset.folded == "true") {
            this.node.dataset.folded = false;
            this.node.classList.add("rules-table-entry-clicked");
            if(this.turnFullWidthOnClick) { this.node.classList.add("rules-table-entry-clicked-full"); }
        } else if(this.node.dataset.folded == "false") {
            this.node.dataset.folded = true;
            this.node.classList.remove("rules-table-entry-clicked");
            if(this.turnFullWidthOnClick) { this.node.classList.remove("rules-table-entry-clicked-full"); }
        }
    }    
}

export { RulesTable, RulesEntry }
export default RulesTable;

