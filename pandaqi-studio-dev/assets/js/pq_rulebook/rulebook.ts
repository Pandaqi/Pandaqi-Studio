import RulesTable from "./table";
import RulesSection from "./section";
import elem from "js/pq_games/tools/dom/elem";

export default class Rulebook
{
    rootSection: RulesSection
    rulesTables: RulesTable[]
    simpleView: boolean
    bodyBackgroundColor: string;
    imgOverlay: HTMLElement;
    imgOverlayNode: HTMLImageElement;

    constructor() 
    {
        this.rulesTables = [];
    }

    // @NOTE: All of these are inside their own refresh function,
    // because in some situations other scripts might add/remove rulebook parts on the fly
    // and I want to support that in all cases, regardless of how/when things are loaded
    refreshRulesTables() 
    { 
        const oldRulesTables = this.rulesTables.slice();
        this.rulesTables = [];
        const rulesTableNodes : HTMLElement[] = Array.from(document.getElementsByClassName("rules-table")) as HTMLElement[];
        for(const tableNode of rulesTableNodes)
        {
            this.registerRulesTable(tableNode, oldRulesTables);
        }
    }

    refreshImages()
    {
        this.ensureOverlayContainerExists();

        const imgs = Array.from(document.getElementsByTagName("img"));
        for(const img of imgs)
        {
            this.registerImage(img);
        }    
    }

    refreshAnchors()
    {
        const innerAnchors : HTMLAnchorElement[] = Array.from(document.querySelectorAll('a[href^="#"]'));
        for(const anchor of innerAnchors)
        {
            this.registerAnchor(anchor);
        }
    }

    load()
    {
        // main sections = hierarchy
        const rootSectionNode = document.getElementsByTagName("main")[0];
        const rootSection = new RulesSection(rootSectionNode, []);
        this.rootSection = rootSection;

        this.bodyBackgroundColor = window.getComputedStyle(document.body).backgroundColor;

        // listen to the two special buttons
        const simpleViewButton = document.getElementById("simpleViewButton");
        const printButton = document.getElementById("printButton");
        this.simpleView = false;

        simpleViewButton.addEventListener("click", (ev) => { this.toggleSimpleView(); })
        printButton.addEventListener("click", (ev) =>
        {
            if(!this.simpleView) { this.toggleSimpleView(); }
            window.print();
        })

        // rules tables (clickable icons which load their description)
        this.refreshRulesTables();

        // make images clickable
        this.refreshImages();

        // customize all anchor nodes (within document) 
        this.refreshAnchors();


    }

    nodeAlreadyRegistered(node:HTMLElement)
    {
        if(node.dataset.pqRulebookChecked == "true") { return true; }
        return false;
    }

    registerAnchor(anchor:HTMLAnchorElement)
    {
        if(this.nodeAlreadyRegistered(anchor)) { return; }

        anchor.dataset.pqRulebookChecked = "true";
        anchor.addEventListener("click", (ev) => {
            ev.preventDefault();

            const href = anchor.getAttribute('href')
            const node = document.querySelector(href) as HTMLElement;
            this.rootSection.unfoldEverythingAbove(node);
            setTimeout(() => { node.scrollIntoView({ behavior: 'smooth', block: "start" }); }, 300);
            return false;
        })
    }

    ensureOverlayContainerExists()
    {
        const imgOverlays = Array.from(document.getElementsByClassName("image-overlay")) as HTMLElement[];
        const exists = imgOverlays.length > 0;
        let imgOverlay, imgOverlayNode;
        if(exists) {
            imgOverlay = imgOverlays[0] as HTMLElement;
            imgOverlayNode = imgOverlay.getElementsByTagName("img")[0];
        } else {
            imgOverlay = elem("div");
            imgOverlayNode = elem("img");
            imgOverlay.appendChild(imgOverlayNode);
        }

        if(!this.nodeAlreadyRegistered(imgOverlay))
        {
            imgOverlay.addEventListener("click", () => { imgOverlay.style.display = "none"; });
        }

        imgOverlay.dataset.pqRulebookChecked = "true";
        this.imgOverlay = imgOverlay;
        this.imgOverlayNode = imgOverlayNode;
    }

    registerImage(img:HTMLImageElement)
    {
        if(this.nodeAlreadyRegistered(img)) { return; }
        if(img == this.imgOverlayNode) { return; }

        const io = this.imgOverlay;
        const ion = this.imgOverlayNode;
        const fullScreenImageMargin = 15;

        img.dataset.pqRulebookChecked = "true";
        img.addEventListener("click", () => {
            io.style.display = 'flex';
            ion.style.maxWidth = (window.innerWidth-2*fullScreenImageMargin) + "px";
            ion.style.maxHeight = (window.innerHeight-2*fullScreenImageMargin) + "px";
            ion.src = img.src;
        })
    }

    registerRulesTable(node:HTMLElement, existingTables:RulesTable[])
    {
        let table;
        if(this.nodeAlreadyRegistered(node)) {
            for(const existingTable of existingTables)
            {
                if(existingTable.node == node) { table = existingTable; break; }
            }
        } else {
            table = new RulesTable().fromNode(node);
        }
        this.rulesTables.push(table);
    }

    toggleSimpleView()
    {
        this.simpleView = !this.simpleView;

        if(this.simpleView) { this.rootSection.node.classList.add("rulebook-simple-view"); }
        else { this.rootSection.node.classList.remove("rulebook-simple-view"); }

        let bgCol = this.bodyBackgroundColor;
        if(this.simpleView) { bgCol = "#FFFFFF"; }
        document.body.style.backgroundColor = bgCol;
        
        this.rootSection.toggleSimpleView(this.simpleView);
        
        for(const rulesTable of this.rulesTables)
        {
            rulesTable.toggleSimpleView(this.simpleView);
        }
    }
}