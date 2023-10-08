import RulesTable from "./table";
import RulesSection from "./section";

export default class Rulebook
{
    rootSection: RulesSection
    rulesTables: RulesTable[]
    simpleView: boolean
    bodyBackgroundColor: string;

    constructor() {}
    load()
    {
        // main sections = hierarchy
        const rootSectionNode = document.getElementsByTagName("main")[0];
        const rootSection = new RulesSection(rootSectionNode, []);
        this.rootSection = rootSection;

        this.bodyBackgroundColor = window.getComputedStyle(document.body).backgroundColor;

        // rules tables (clickable icons which load their description)
        const rulesTableNodes : HTMLElement[] = Array.from(document.getElementsByClassName("rules-table")) as HTMLElement[];
        const rulesTables = [];
        this.rulesTables = rulesTables;
        
        for(const tableNode of rulesTableNodes)
        {
            const newTable = new RulesTable(tableNode);
            rulesTables.push(newTable);
        }

        // make images clickable
        const imgOverlays = Array.from(document.getElementsByClassName("image-overlay")) as HTMLElement[];
        if(imgOverlays.length > 0)
        {
            const imgOverlay = imgOverlays[0] as HTMLElement;
            const imgOverlayNode = imgOverlay.getElementsByTagName("img")[0];
            const imgs = Array.from(document.getElementsByTagName("img"));
            const fullScreenImageMargin = 15;
    
            imgOverlay.addEventListener("click", () => { imgOverlay.style.display = "none"; })
    
            for(const img of imgs)
            {
                img.addEventListener("click", () => {
                    imgOverlay.style.display = 'flex';
                    imgOverlayNode.style.maxWidth = (window.innerWidth-2*fullScreenImageMargin) + "px";
                    imgOverlayNode.style.maxHeight = (window.innerHeight-2*fullScreenImageMargin) + "px";
                    imgOverlayNode.src = img.src;
                })
            }    
        }

        // customize all anchor nodes (within document) 
        const innerAnchors = Array.from(document.querySelectorAll('a[href^="#"]'));
        for(const anchor of innerAnchors)
        {
            anchor.addEventListener("click", (ev) => {
                ev.preventDefault();

                const href = anchor.getAttribute('href')
                const node = document.querySelector(href);
                rootSection.unfoldEverythingAbove(node);
                setTimeout(() => { node.scrollIntoView({ behavior: 'smooth', block: "start" }); }, 300);
                return false;
            })
        }

        // listen to the two special buttons
        const simpleViewButton = document.getElementById("simpleViewButton");
        const printButton = document.getElementById("printButton");
        this.simpleView = false;

        simpleViewButton.addEventListener("click", (ev) => 
        {
            this.toggleSimpleView();
        })

        printButton.addEventListener("click", (ev) =>
        {
            if(!this.simpleView) { this.toggleSimpleView(); }
            window.print();
        })
    }

    toggleSimpleView()
    {
        this.simpleView = !this.simpleView;

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