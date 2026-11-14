import { type RulebookParams } from "./rulebook";
import { DEFAULT_SECTION_CONTENT_CLASS, DEFAULT_SECTION_HEADER_CLASS, getAllSections, getSectionAsFlatHTML, RulebookSection, unfoldAllSectionsAbove } from "./sections";

export const isLocalFile = () =>
{
    return window.location.protocol == "file:";
}

// paged.js is a big polyfill that only the advanced print path uses, so it is not part of the page at all
// until somebody actually presses that button. `PagedConfig.auto = false` must be in place *before* the
// script runs, otherwise paged.js starts paginating the rulebook the moment it loads.
const PAGED_SCRIPT_URL = "/lib/paged.polyfill.js";
let pagedLoader:Promise<any>|null = null;
export const loadPagedJS = () : Promise<any> =>
{
    const alreadyThere = (window as any).PagedPolyfill;
    if(alreadyThere) { return Promise.resolve(alreadyThere); }
    if(pagedLoader) { return pagedLoader; }

    // @ts-ignore
    window.PagedConfig = 
    {
        auto: false,
        after: (flow) => { console.log("[Rulebook] Paged.js preview done", flow) },
    };

    pagedLoader = new Promise((resolve, reject) =>
    {
        const script = document.createElement("script");
        script.src = PAGED_SCRIPT_URL;
        script.onload = () =>
        {
            const polyfill = (window as any).PagedPolyfill;
            if(polyfill) { resolve(polyfill); return; }
            pagedLoader = null;
            reject(new Error("script loaded but PagedPolyfill is missing"));
        };
        script.onerror = () => { pagedLoader = null; reject(new Error(`could not load ${PAGED_SCRIPT_URL}`)); };
        document.head.appendChild(script);
    });

    return pagedLoader;
}

export const toggleSectionFold = (node:HTMLElement, folded = true) =>
{
    if(node.dataset.nofold) { return; }

    const header = node.getElementsByClassName(DEFAULT_SECTION_HEADER_CLASS)[0] as HTMLElement;
    const content = node.getElementsByClassName(DEFAULT_SECTION_CONTENT_CLASS)[0] as HTMLElement;
    content.style.display = folded ? "none" : "block";
    header.dataset.folded = folded ? "true" : "false";

    const arrow = header.getElementsByClassName("rulebook-section-arrow")[0] as HTMLElement;
    arrow.innerHTML = folded ? "&darr;" : "&uarr;";
}

export const foldAll = (node:HTMLElement) =>
{
    const sections = getAllSections(node);
    for(const section of sections)
    {
        toggleSectionFold(section, true);
    }
}

export const unfoldAll = (node:HTMLElement) =>
{
    const sections = getAllSections(node);
    for(const section of sections)
    {
        toggleSectionFold(section, false);
    }
}

export const makeImagesClickable = (node:HTMLElement) =>
{
    const overlay = document.createElement("aside");
    document.body.appendChild(overlay);
    overlay.classList.add("rulebook-image-overlay");
    const overlayNode = document.createElement("img");
    overlay.appendChild(overlayNode);

    // for making it disappear again
    overlay.addEventListener("click", () => { overlay.style.display = "none"; });

    const images = Array.from(node.getElementsByTagName("img")) as HTMLImageElement[];
    for(const image of images)
    {
        image.addEventListener("click", () => {
            overlay.style.display = 'flex';
            overlayNode.style.width = "auto";
            overlayNode.style.height = "auto";
            overlayNode.style.maxWidth = "100%";
            overlayNode.style.maxHeight = "100%";
            overlayNode.src = image.src;
        });
    }
}

export const makeInternalAnchorsWork = (node:HTMLElement) =>
{
    const innerAnchors : HTMLAnchorElement[] = Array.from(node.querySelectorAll('a[href^="#"]'));
    for(const anchor of innerAnchors)
    {
        anchor.addEventListener("click", (ev) => 
        {
            ev.preventDefault();

            const href = anchor.getAttribute('href')
            const node = document.querySelector(href) as HTMLElement;
            unfoldAllSectionsAbove(node);
            setTimeout(() => { node.scrollIntoView({ behavior: 'smooth', block: "start" }); }, 300);
            return false;
        })
    }
}

export const createToolbar = (params:RulebookParams, node:HTMLElement) : HTMLElement =>
{
    const div = document.createElement("header");
    div.classList.add("rulebook-toolbar");

    const buttonPrintBrowser = document.createElement("button");
    div.appendChild(buttonPrintBrowser);
    buttonPrintBrowser.innerHTML = "Print (Browser)";
    buttonPrintBrowser.title = "Less advanced features (e.g. no page numbers), also less likely to make mistakes/crash."
    buttonPrintBrowser.addEventListener("click", () => 
    {
        unfoldAll(node);
        print();
    });

    const buttonPrintPaged = document.createElement("button");
    div.appendChild(buttonPrintPaged);
    buttonPrintPaged.innerHTML = "Print (Advanced)";
    buttonPrintPaged.title = "More correct and pretty, but can completely crash on specific devices/browsers/sizes.";
    buttonPrintPaged.addEventListener("click", async () => 
    {
        buttonPrintPaged.disabled = true;

        let pagedJS;
        try { pagedJS = await loadPagedJS(); }
        catch(err)
        {
            buttonPrintPaged.disabled = false;
            return console.error("[Rulebook] Paged.js could not be loaded! Can't print advanced.", err);
        }

        const div = getSectionAsFlatHTML(params._sectionRoot, params);
        node.remove();
        document.body.appendChild(div);

        // paged.js does not merely read the page, it rebuilds the entire body, so undoing that by hand is
        // fiddly and easy to get wrong. A reload rebuilds the rulebook exactly as it was, from the source.
        window.addEventListener("afterprint", () => { window.location.reload(); }, { once: true });

        await pagedJS.preview();
        print();
    });

    const buttonFold = document.createElement("button");
    div.appendChild(buttonFold);
    buttonFold.innerHTML = "Fold All"
    buttonFold.addEventListener("click", () => {
        foldAll(node);
    });

    const buttonUnfold = document.createElement("button");
    div.appendChild(buttonUnfold);
    buttonUnfold.innerHTML = "Unfold All"
    buttonUnfold.addEventListener("click", () => {
        unfoldAll(node);
    });

    const buttonDisplayMode = document.createElement("button");
    div.appendChild(buttonDisplayMode);
    buttonDisplayMode.innerHTML = "Dark Mode"
    let curMode = "light";
    buttonDisplayMode.addEventListener("click", () => {
        document.body.classList.remove(`display-mode-${ curMode }`);
        curMode = curMode == "light" ? "dark" : "light";
        buttonDisplayMode.innerHTML = curMode == "light" ? "Dark Mode" : "Light Mode";
        document.body.classList.add(`display-mode-${ curMode }`);
    });
    document.body.classList.add(`display-mode-${ curMode }`);

    const hasInteractiveExamples = Object.keys(params.examples ?? {}).length > 0;
    if(isLocalFile() && hasInteractiveExamples)
    {
        const cont = document.createElement("div");
        div.appendChild(cont);

        const inputAssets = document.createElement("input");
        cont.appendChild(inputAssets)
        inputAssets.type = "file";
        inputAssets.multiple = true;

        const buttonAssets = document.createElement("button");
        cont.appendChild(buttonAssets);
        buttonAssets.innerHTML = "Upload";
        buttonAssets.title = "Select all files in the assets folder and upload them to make interactive examples work";
        buttonAssets.addEventListener("click", (ev) => {
            // @TOD: it's ugly, but it's the only way until I rewrite the interactive example code
            // @ts-ignore
            window.pqRulebookCustomResources = inputAssets.files;
        });
    }

    return div; 
}