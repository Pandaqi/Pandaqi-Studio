import RulesTable from "./table.js";
import RulesSection from "./section.js";

const PQ_RULEBOOK = 
{
    activate(isPDF:boolean)
    {
        // main sections = hierarchy
        const rootSectionNode = document.getElementsByTagName("main")[0];
        const rootSection = new RulesSection(rootSectionNode, [], isPDF);

        // rules tables (clickable icons which load their description)
        const rulesTables : HTMLElement[] = Array.from(document.getElementsByClassName("rules-table")) as HTMLElement[];
        const RULES_TABLES = [];
        
        for(const tableNode of rulesTables)
        {
            const newTable = new RulesTable(tableNode, isPDF);
            RULES_TABLES.push(newTable);
        }

        // make images clickable
        const imgOverlay : HTMLElement = document.getElementsByClassName("image-overlay")[0] as HTMLElement;
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
    }   
}

// @ts-ignore
window.PQ_RULEBOOK = PQ_RULEBOOK;

let isPDF = false;
const hiddenMetadata = document.getElementById("hidden-metadata");
if(hiddenMetadata)
{
    isPDF = hiddenMetadata.dataset.createpdf == "true"
}

PQ_RULEBOOK.activate(isPDF);