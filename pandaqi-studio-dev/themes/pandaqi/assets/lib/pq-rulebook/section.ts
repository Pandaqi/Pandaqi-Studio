export class RulesSection
{
    node: HTMLElement;
    root: boolean;
    hierarchy: number[];
    contentContainer: HTMLElement;
    arrow: HTMLElement;
    subsections: RulesSection[];
    contentHeight: number;
    header: HTMLElement;
    counter: HTMLElement;

    constructor(node: HTMLElement, hierarchy: number[])
    {
        this.node = node;
        this.subsections = [];
        this.hierarchy = hierarchy.slice();
        this.setZIndexFromHierarchy(hierarchy);

        this.searchChildren();

        const isRootSection = this.hierarchy.length <= 0;
        this.root = isRootSection;
        if(isRootSection) { return; }

        this.setupContent();
        this.setupHeader();
        this.saveStyleForSimpleView();

        // @NOTE: needed for easy CSS styling selection on content only!
        this.contentContainer.dataset.folded = "false";
        this.toggle();
    }

    isRoot() { return this.root; }

    setZIndexFromHierarchy(h:number[])
    {
        let sum = 0;
        for(let i = 0; i < h.length; i++) { sum += h[i]; }
        this.node.style.zIndex = (1000 - sum).toString();
    }

    toCounterString(h:number[])
    {
        let arr = [];
        for(let i = 0; i < h.length; i++) { arr.push(h[i]+1); }
        return arr.join(".");
    }

    getIndentFromHierarchy(h:number[])
    {
        return h.length + 1; // first heading is h1, not h0, hence +1
    }

    saveStyleForSimpleView()
    {
        const compStyleNode = window.getComputedStyle(this.node);
        const headerStyleNode = window.getComputedStyle(this.header);
        const contentStyleNode = window.getComputedStyle(this.contentContainer);

        const DEF_BG = "#DEDEDE";
        const DEF_COL = "#121212";
        const isTransparent = (col) => {
            return col == "rgba(0, 0, 0, 0)";
        }

        this.node.dataset.advancedViewBackground = compStyleNode.backgroundColor;
        this.node.dataset.simpleViewBackground = "transparent";

        this.header.dataset.advancedViewBackground = headerStyleNode.backgroundColor;
        this.header.dataset.advancedViewColor =  headerStyleNode.color;
        this.header.dataset.simpleViewBackground = isTransparent(compStyleNode.backgroundColor) ? DEF_BG : compStyleNode.backgroundColor;
        this.header.dataset.simpleViewColor = isTransparent(headerStyleNode.color) ? DEF_COL : headerStyleNode.color;

        this.contentContainer.dataset.advancedViewBackground = contentStyleNode.backgroundColor;
        this.contentContainer.dataset.advancedViewColor = contentStyleNode.color;
        this.contentContainer.dataset.simpleViewBackground = "transparent";
        this.contentContainer.dataset.simpleViewColor = DEF_COL;
    }

    getViewColor(node, simple = true, string = "background")
    {
        let prefix = simple ? "simple" : "advanced";
        let suffix = string.charAt(0).toUpperCase() + string.slice(1);
        return node.dataset[prefix + "View" + suffix];
    }

    toggleSimpleView(simple = true)
    {
        if(!this.isRoot()) 
        {
            if(this.isFolded() == simple) { this.toggle(true); }

            if(simple) { this.arrow.style.display = "none"; }
            else { this.arrow.style.display = "block"; }

            this.node.style.backgroundColor = this.getViewColor(this.node, simple, "background");

            this.header.style.backgroundColor = this.getViewColor(this.header, simple, "background");
            this.header.style.color = this.getViewColor(this.header, simple, "color");

            this.contentContainer.style.backgroundColor = this.getViewColor(this.contentContainer, simple, "background");
            this.contentContainer.style.color = this.getViewColor(this.contentContainer, simple, "color");
        }

        for(const section of this.subsections)
        {
            section.toggleSimpleView(simple);
        }
    }

    // Only does something when called on the rootContainer; finds ALL children then
    // @TODO: this isn't great design, change that?
    searchChildren()
    {

        let childSectionContainer = this.node.getElementsByClassName("rules-foldable")[0];
        if(!childSectionContainer) { return; }

        const children : HTMLElement[] = Array.from(childSectionContainer.parentElement.childNodes) as HTMLElement[];
        const hierarchy = this.hierarchy.slice();

        this.subsections = [];        
        let counter = 0;
        for(const child of children)
        {
            if(!child.classList) { continue; }
            if(!child.classList.contains("rules-foldable")) { continue; }
            
            hierarchy.push(counter);
            counter++;

            const newSec = new RulesSection(child, hierarchy);
            this.subsections.push(newSec);

            hierarchy.pop();
        }
    }

    setupContent()
    {
        this.contentContainer = this.node.getElementsByClassName("content-container")[0] as HTMLElement;
        this.contentHeight = this.contentContainer.offsetHeight;
        this.contentContainer.style.height = "0px";
    }

    setupHeader()
    {
        // attach the right classes
        const isMidLevel = (this.hierarchy.length == 2);
        let classStart = "top-level";
        if(isMidLevel) { classStart = "mid-level"; }
        
        this.header = this.node.getElementsByClassName("heading-container")[0] as HTMLElement;
        if(!this.header) { return; } // name clashes with rules-table might cause this => should probably fix?

        this.node.classList.add(classStart); 
        this.header.classList.add(classStart + "-heading");
        this.contentContainer.classList.add(classStart + "-container");

        // fill in the counter
        this.counter = this.header.getElementsByClassName("counter")[0] as HTMLElement;
        this.counter.innerHTML = this.toCounterString(this.hierarchy);

        // fill in the title
        const title = this.header.getElementsByTagName("h1")[0];
        const indent = this.getIndentFromHierarchy(this.hierarchy);

        var h = document.createElement('h' + indent);
        h.innerHTML = this.header.dataset.value;
        title.replaceWith(h);

        // add the interactive click listener
        this.arrow = this.header.getElementsByClassName("arrow")[0] as HTMLElement;
        this.header.addEventListener("click", this.toggle.bind(this));
    }

    isFolded()
    {
        return (this.node.dataset.folded == "true");
    }

    unfold()
    {
        if(!this.isFolded()) { return; }
        this.toggle();
    }

    fold()
    {
        if(this.isFolded()) { return; }
        this.toggle();
    }

    toggle(instant = false)
    {
        const that = this;

        const folded = this.isFolded();
        const newValue = folded ? "false" : "true";
        const newArrow = folded ? "&lt;" : "&gt;";

        this.node.dataset.folded = newValue;
        this.contentContainer.dataset.folded = newValue;
        this.contentContainer.style.height = this.contentHeight + "px";
        this.arrow.innerHTML = newArrow;

        const shouldFold = newValue == "true";

        let newHeight = shouldFold ? "0px" : "auto";
        let duration = shouldFold ? 3 : 300;

        if(instant)
        {
            this.contentContainer.style.height = newHeight;
            return;
        }

        if(!shouldFold) { this.header.scrollIntoView({behavior: "smooth", block: "start"}); }
        setTimeout(() => { that.contentContainer.style.height = newHeight }, duration);
    }

    travelHierarchy(curNode:HTMLElement)
    {
        const sections = this.findAllParentSectionNodes(curNode);
        const numHeadings = sections.length + 1; // the H1 is always above us
        return numHeadings;
    }

    findAllParentSectionNodes(curNode:HTMLElement)
    {
        const arr = [];
        while(curNode)
        {
            if(curNode.classList.contains("rules-foldable")) { arr.push(curNode); }
            curNode = curNode.parentElement;
        }
        return arr;
    }

    findSectionContainingNode(node: HTMLElement, recurse = false)
    {
        const sections = [];
        if(!this.subsections) { return sections; }
        for(const section of this.subsections)
        {
            if(!section.node.contains(node)) { continue; }
            sections.push(section);
            if(recurse) { sections.push(section.findSectionContainingNode(node, recurse)); }
            break;
        }
        return sections.flat();
    }

    unfoldEverythingAbove(node: HTMLElement)
    {
        const arr = this.findSectionContainingNode(node, true);
        for(const section of arr)
        {
            section.unfold();
        }
    }
}

export default RulesSection;