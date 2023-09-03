const RulesSection = class {
    constructor(node, hierarchy, isPDF)
    {
        this.node = node;
        this.hierarchy = hierarchy.slice();
        this.setZIndexFromHierarchy(hierarchy);

        this.searchChildren(isPDF);

        const isRootSection = this.hierarchy.length <= 0;
        if(isRootSection) { return; }

        this.setupContent();
        this.setupHeader();

        // @NOTE: needed for easy CSS styling selection on content only!
        this.contentContainer.dataset.folded = "false";
        
        if(isPDF) { this.setupForPDF(); }
        else { this.toggle(); }
    }

    setZIndexFromHierarchy(h)
    {
        let sum = 0;
        for(let i = 0; i < h.length; i++) { sum += h[i]; }
        this.node.style.zIndex = (1000 - sum);
    }

    toCounterString(h)
    {
        let arr = [];
        for(let i = 0; i < h.length; i++) { arr.push(h[i]+1); }
        return arr.join(".");
    }

    getIndentFromHierarchy(h)
    {
        return h.length + 1; // first heading is h1, not h0, hence +1
    }

    setupForPDF()
    {
        this.contentContainer.style.transition = "initial";
        this.contentContainer.style.height = "auto";
        this.arrow.style.display = "none";
    }

    searchChildren(isPDF)
    {
        let rootContainer = this.node.getElementsByClassName("rules-foldable")[0];
        if(!rootContainer) { return; }

        const children = Array.from(rootContainer.parentElement.childNodes);
        const hierarchy = this.hierarchy.slice();

        this.subsections = [];        
        let counter = 0;
        for(const child of children)
        {
            if(!child.classList) { continue; }
            if(!child.classList.contains("rules-foldable")) { continue; }
            
            hierarchy.push(counter);
            counter++;

            const newSec = new RulesSection(child, hierarchy, isPDF);
            this.subsections.push(newSec);

            hierarchy.pop();
        }
    }

    setupContent()
    {
        this.contentContainer = this.node.getElementsByClassName("content-container")[0];
        this.contentHeight = this.contentContainer.offsetHeight;
        this.contentContainer.style.height = "0px";
    }

    setupHeader()
    {
        // attach the right classes
        const isMidLevel = (this.hierarchy.length == 2);
        let classStart = "top-level";
        if(isMidLevel) { classStart = "mid-level"; }
        
        this.header = this.node.getElementsByClassName("heading-container")[0];
        if(!this.header) { return; } // name clashes with rules-table might cause this => should probably fix?

        this.node.classList.add(classStart); 
        this.header.classList.add(classStart + "-heading");
        this.contentContainer.classList.add(classStart + "-container");

        // fill in the counter
        this.counter = this.header.getElementsByClassName("counter")[0];
        this.counter.innerHTML = this.toCounterString(this.hierarchy);

        // fill in the title
        const title = this.header.getElementsByTagName("h1")[0];
        const indent = this.getIndentFromHierarchy(this.hierarchy);

        var h = document.createElement('h' + indent);
        h.innerHTML = this.header.dataset.value;
        title.replaceWith(h);

        // add the interactive click listener
        this.arrow = this.header.getElementsByClassName("arrow")[0];
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

    toggle()
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
        if(shouldFold) {
            setTimeout(() => { that.contentContainer.style.height = "0px" }, 3);
        } else {
            this.header.scrollIntoView({behavior: "smooth", block: "start"});
            setTimeout(() => { that.contentContainer.style.height = "auto" }, 300);
        }
    }

    travelHierarchy(curNode)
    {
        const sections = this.findAllParentSectionNodes(curNode);
        const numHeadings = sections.length + 1; // the H1 is always above us
        return numHeadings;
    }

    findAllParentSectionNodes(curNode)
    {
        const arr = [];
        while(curNode)
        {
            if(curNode.classList.contains("rules-foldable")) { arr.push(curNode); }
            curNode = curNode.parentElement;
        }
        return arr;
    }

    findParentSection(curNode)
    {
        const arr = this.findAllParentSectionNodes(curNode);
        const sectionNode = arr[0];
    }

    findSectionContainingNode(node, recurse = false)
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

    unfoldEverythingAbove(node)
    {
        const arr = this.findSectionContainingNode(node, true);
        for(const section of arr)
        {
            section.unfold();
        }
    }
}
export default RulesSection;