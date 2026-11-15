import { type RulebookParams } from "./rulebook";
import { DEFAULT_SECTION_CONTENT_CLASS, DEFAULT_SECTION_HEADER_CLASS, getAllSections, getSectionAsFlatHTML, RulebookSection, unfoldAllSectionsAbove } from "./sections";
import { toggleTablesExpanded } from "./tables";
import { cloneRulebookTOCForPrint, setTOCInPrint } from "./toc";

export const isLocalFile = () =>
{
    return window.location.protocol == "file:";
}

const DEFAULT_PAGED_SCRIPT_URL = "/lib/paged.polyfill.js";
const PAGED_TIMEOUT_MS = 60000;

// paged.js is a big polyfill that only the advanced print path uses, so it is not part of the page at all
// until somebody actually presses that button. `PagedConfig.auto = false` must be in place *before* the
// script runs, otherwise paged.js starts paginating the rulebook the moment it loads.
let pagedLoader:Promise<any>|null = null;
export const loadPagedJS = (scriptURL?:string) : Promise<any> =>
{
    const alreadyThere = (window as any).Paged;
    if(alreadyThere?.Previewer) { return Promise.resolve(alreadyThere); }
    if(pagedLoader) { return pagedLoader; }

    const url = scriptURL || DEFAULT_PAGED_SCRIPT_URL;

    // keep whatever the page already configured (a logging hook, settings, ...) but never let it auto-run
    const existing = (window as any).PagedConfig ?? {};
    (window as any).PagedConfig = Object.assign({}, existing, { auto: false });

    pagedLoader = new Promise((resolve, reject) =>
    {
        const script = document.createElement("script");
        script.src = url;
        script.onload = () =>
        {
            const paged = (window as any).Paged;
            if(paged?.Previewer) { resolve(paged); return; }
            pagedLoader = null;
            reject(new Error(`script loaded but ${url} exposes no Paged.Previewer`));
        };
        script.onerror = () => { pagedLoader = null; reject(new Error(`could not load ${url}`)); };
        document.head.appendChild(script);
    });

    return pagedLoader;
}

// A backgrounded tab stops firing animation frames. Printing from one used to hang forever at this
// point, so fall back to a timer instead of waiting for a frame that will never arrive.
const nextFrame = () => new Promise<void>((resolve) =>
{
    let done = false;
    const finish = () => { if(done) { return; } done = true; resolve(); };
    window.requestAnimationFrame(finish);
    window.setTimeout(finish, 100);
});

const withTimeout = <T>(promise:Promise<T>, ms:number, message:string) : Promise<T> =>
{
    return new Promise<T>((resolve, reject) =>
    {
        const timer = window.setTimeout(() => reject(new Error(message)), ms);
        promise.then((value) => { window.clearTimeout(timer); resolve(value); },
            (error) => { window.clearTimeout(timer); reject(error); });
    });
}

// Browsers stop firing requestAnimationFrame in hidden tabs, and paged.js paginates through it. A
// background print then waits forever (or until the timeout). Message-channel tasks keep running while
// hidden, so use them as frames until the preview is torn down.
const installHiddenTabFrameFallback = () : (() => void) =>
{
    const nativeRequest = window.requestAnimationFrame;
    const nativeCancel = window.cancelAnimationFrame;
    const queue = new Map<number, FrameRequestCallback>();
    const nativeIDs = new Map<number, number>();
    const channel = new MessageChannel();
    let nextID = 1;
    let scheduled = false;

    const flush = () =>
    {
        scheduled = false;
        const callbacks = Array.from(queue.values());
        queue.clear();
        const time = performance.now();
        for(const callback of callbacks) { callback(time); }
    };
    channel.port1.onmessage = flush;

    window.requestAnimationFrame = (callback) =>
    {
        const id = nextID++;
        if(document.visibilityState === "visible")
        {
            nativeIDs.set(id, nativeRequest.call(window, (time) => { nativeIDs.delete(id); callback(time); }));
            return id;
        }

        queue.set(id, callback);
        if(!scheduled) { scheduled = true; channel.port2.postMessage(0); }
        return id;
    };

    window.cancelAnimationFrame = (id) =>
    {
        const nativeID = nativeIDs.get(id);
        if(nativeID !== undefined) { nativeCancel.call(window, nativeID); nativeIDs.delete(id); }
        queue.delete(id);
    };

    return () =>
    {
        window.requestAnimationFrame = nativeRequest;
        window.cancelAnimationFrame = nativeCancel;
        channel.port1.close();
        channel.port2.close();
    };
}

const waitForFonts = async () =>
{
    const fonts = (document as any).fonts;
    if(!fonts?.ready) { return; }
    // a font that never resolves must not block printing
    await Promise.race([fonts.ready, new Promise((resolve) => setTimeout(resolve, 2000))]);
}

const waitForImages = async (root:ParentNode) =>
{
    const images = Array.from(root.querySelectorAll("img")) as HTMLImageElement[];
    await Promise.all(images.map((image) =>
    {
        if(image.complete) { return Promise.resolve(); }
        return new Promise<void>((resolve) =>
        {
            image.addEventListener("load", () => resolve(), { once: true });
            image.addEventListener("error", () => resolve(), { once: true });
        });
    }));
}

export const toggleSectionFold = (node:HTMLElement, folded = true) =>
{
    if(node.dataset.nofold) { return; }

    const header = node.getElementsByClassName(DEFAULT_SECTION_HEADER_CLASS)[0] as HTMLElement;
    const content = node.getElementsByClassName(DEFAULT_SECTION_CONTENT_CLASS)[0] as HTMLElement;
    if(!header || !content) { return; }

    content.style.display = folded ? "none" : "block";
    header.dataset.folded = folded ? "true" : "false";
    header.setAttribute("aria-expanded", String(!folded));

    const arrow = header.getElementsByClassName("rulebook-section-arrow")[0] as HTMLElement;
    if(arrow) { arrow.innerHTML = folded ? "&darr;" : "&uarr;"; }
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

const showToast = (params:RulebookParams, message:string, isError = false) =>
{
    const shell = params._shell;
    if(!shell) { return; }

    let toast = shell.querySelector(".rulebook-toast") as HTMLElement | null;
    if(!toast)
    {
        toast = document.createElement("div");
        toast.className = "rulebook-toast";
        toast.setAttribute("role", "status");
        shell.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.toggle("rulebook-toast-error", isError);
    toast.classList.add("rulebook-toast-visible");

    const timer = (toast as any)._rulebookToastTimer;
    if(timer) { window.clearTimeout(timer); }
    (toast as any)._rulebookToastTimer = window.setTimeout(() =>
    {
        toast?.classList.remove("rulebook-toast-visible");
    }, isError ? 8000 : 4000);
}

export const makeImagesClickable = (node:HTMLElement) =>
{
    let overlay = document.querySelector(".rulebook-image-overlay") as HTMLElement | null;
    if(!overlay)
    {
        overlay = document.createElement("aside");
        document.body.appendChild(overlay);
        overlay.classList.add("rulebook-image-overlay");
        const overlayNode = document.createElement("img");
        overlay.appendChild(overlayNode);

        // for making it disappear again
        overlay.addEventListener("click", () => { overlay.style.display = "none"; });
    }

    const overlayNode = overlay.getElementsByTagName("img")[0] as HTMLImageElement;
    const images = Array.from(node.getElementsByTagName("img")) as HTMLImageElement[];
    for(const image of images)
    {
        image.addEventListener("click", () =>
        {
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
            const href = anchor.getAttribute('href');
            if(!href || href.length <= 1) { return; }

            let target: HTMLElement | null = null;
            try { target = document.querySelector(href) as HTMLElement; }
            catch(error) { target = document.getElementById(href.slice(1)); }
            if(!target) { return; }

            ev.preventDefault();
            unfoldAllSectionsAbove(target);
            setTimeout(() => { target?.scrollIntoView({ behavior: 'smooth', block: "start" }); }, 300);
        })
    }
}

export const createProgressBar = (params:RulebookParams, standalone = false) : HTMLElement =>
{
    const progress = document.createElement("div");
    progress.className = "rulebook-progress";
    if(standalone) { progress.classList.add("rulebook-progress-standalone"); }
    progress.setAttribute("aria-hidden", "true");

    const bar = document.createElement("div");
    bar.className = "rulebook-progress-bar";
    progress.appendChild(bar);

    params._progressBar = bar;
    return progress;
}

export const printBrowserRulebook = (params:RulebookParams, node:HTMLElement) =>
{
    // Everything a print needs to show is present in the live document; folding is the only thing that
    // could hide it.
    unfoldAll(node);
    setTOCInPrint(params, params.tocInPrint === true);
    window.print();
}

const collectInlineCSS = () : string =>
{
    const parts:string[] = [];
    for(const style of Array.from(document.querySelectorAll("style")))
    {
        if(style.hasAttribute("data-pagedjs-inserted-styles")) { continue; }
        if(!style.textContent) { continue; }
        parts.push(style.textContent);
    }

    // A linked custom stylesheet is still in <head>, but paged.js inserts the default print rules after
    // it, so equal-specificity print rules would otherwise lose. Copy the custom sheet's rules into the
    // same CSS stream, in the same order. Cross-origin sheets without CORS cannot be read; those still
    // apply to the live page, but may lose to the default print rules.
    for(const link of Array.from(document.querySelectorAll("link[rel=\"stylesheet\"][data-rulebook-custom]")) as HTMLLinkElement[])
    {
        if(!link.sheet) { continue; }
        try
        {
            for(const rule of Array.from(link.sheet.cssRules)) { parts.push(rule.cssText); }
        }
        catch
        {
            // the browser will not expose rules for a cross-origin sheet without CORS
        }
    }

    return parts.join("\n\n");
}

const buildPrintSource = (params:RulebookParams) : HTMLElement =>
{
    const source = document.createElement("div");
    source.className = "rulebook-print-source";

    const title = params._titleNode?.cloneNode(true) as HTMLElement | null;
    if(title && params.showTitle !== false) { source.appendChild(title); }

    if(params.tocInPrint)
    {
        const toc = cloneRulebookTOCForPrint(params._toc ?? null);
        if(toc) { source.appendChild(toc); }
    }

    source.appendChild(getSectionAsFlatHTML(params._sectionRoot, params));
    return source;
}

const PRINT_PREVIEW_CSS = `
/* paged.js copies the ancestors of everything it splits across a page, including <html>/<body> clones.
   A page stylesheet that makes those 100% tall then fits only one block per page. */
.rulebook-paged-output html, .rulebook-paged-output body { height: auto !important; min-height: 0 !important; }

/* while the paged preview is up, the live rulebook is not what will be printed */
body.rulebook-paged-print .rulebook-shell { display: none !important; }

@media print {
    body.rulebook-paged-print .rulebook-image-overlay { display: none !important; }
}
`;

const describeError = (error:any) => String(error?.message ?? error ?? "unknown error");

// Reading the section per generated page is more dependable than paged.js' named strings: on page one of
// a section it shows that section, and pages that continue a section keep the previous title.
const applyRunningHeaders = (root:HTMLElement, title:string) =>
{
    let currentSection = "";
    const pages = Array.from(root.querySelectorAll(".pagedjs_page")) as HTMLElement[];
    for(const page of pages)
    {
        // a comma list instead of :is(), which old Safari cannot parse in querySelector (it throws)
        const heading = page.querySelector([
            ".rulebook-section-header h1, .rulebook-section-header h2, .rulebook-section-header h3,",
            ".rulebook-section-header h4, .rulebook-section-header h5, .rulebook-section-header h6"
        ].join(" "));
        const headingText = heading?.textContent?.replace(/\s+/g, " ").trim();
        if(headingText) { currentSection = headingText; }

        const box = page.querySelector(".pagedjs_margin-top-left .pagedjs_margin-content") as HTMLElement | null;
        if(!box) { continue; }

        const parts = [title, currentSection].filter((part) => (part ?? "").length > 0);
        box.textContent = parts.join("  ›  ");
    }
}

export const printAdvancedRulebook = async (params:RulebookParams, node:HTMLElement) : Promise<boolean> =>
{
    if(params._printing) { return false; }
    if(!params._sectionRoot) { return false; }
    params._printing = true;

    const headStylesBefore = new Set(Array.from(document.head.querySelectorAll("style")));
    let renderRoot:HTMLElement | null = null;
    let printStyle:HTMLStyleElement | null = null;
    let pagedPreviewer:any = null;
    let pagedPages:any[] = [];
    let restoreFrames = () => {};
    let restored = false;

    const restore = () =>
    {
        if(restored) { return; }
        restored = true;
        params._printing = false;
        window.removeEventListener("afterprint", restore);

        // paged.js puts a ResizeObserver on every page it made and never disconnects them when the
        // preview is thrown away. Resizing the window afterwards then throws inside paged.js, so tear
        // the pages down first and only then remove their container.
        for(const page of pagedPages)
        {
            try { page.destroy?.(); } catch(error) { /* teardown only */ }
        }
        pagedPages = [];
        try { pagedPreviewer?.polisher?.destroy?.(); } catch(error) { /* teardown only */ }
        pagedPreviewer = null;
        restoreFrames();
        restoreFrames = () => {};

        document.body.classList.remove("rulebook-paged-print");
        printStyle?.remove();
        renderRoot?.remove();

        // paged.js adds its scaffolding and generated rules to <head> without marking all of them,
        // so hand back exactly the set of styles that existed before the preview
        for(const style of Array.from(document.head.querySelectorAll("style")))
        {
            if(!headStylesBefore.has(style)) { style.remove(); }
        }
    }

    try
    {
        showToast(params, "Preparing the advanced print preview…");

        // gather the styles before paged.js adds its own, so the paginator sees the real page rules
        const css = collectInlineCSS();
        const paged = await loadPagedJS(params.pagedScriptURL);
        if(!paged?.Previewer) { throw new Error("Paged.js exposes no Previewer."); }

        await waitForFonts();

        const source = buildPrintSource(params);
        renderRoot = document.createElement("div");
        renderRoot.className = "rulebook-paged-output";
        renderRoot.appendChild(source); // paged.js needs the content it paginates inside the document
        document.body.appendChild(renderRoot);

        printStyle = document.createElement("style");
        printStyle.textContent = PRINT_PREVIEW_CSS;
        document.head.appendChild(printStyle);
        document.body.classList.add("rulebook-paged-print");

        await waitForImages(source);

        // Passing `[]` here used to hand paged.js no stylesheets at all, so it never saw the @page rules
        // (page size, margins, running headers, page numbers) and paginated with its own letter default.
        // A CSS string object keeps the live page's styles in place while paged.js parses them.
        const stylesheets = [{ [window.location.href]: css + "\n\n" + PRINT_PREVIEW_CSS }];

        restoreFrames = installHiddenTabFrameFallback();
        const previewer = new paged.Previewer();
        pagedPreviewer = previewer;
        const flow = await withTimeout(previewer.preview(source, stylesheets, renderRoot), PAGED_TIMEOUT_MS,
            "Paged.js did not finish paginating in time.");
        pagedPages = (flow as any)?.pages ?? [];

        // one paint before measuring, another before printing: paged.js resolves before the browser has
        // laid the generated pages out, which is why printing straight away produced empty paper
        await nextFrame();
        await nextFrame();

        const pageCount = renderRoot.querySelectorAll(".pagedjs_page").length;
        if(pageCount <= 0) { throw new Error("Paged.js generated zero pages."); }

        applyRunningHeaders(renderRoot, (params.title ?? "").trim());

        source.remove();
        window.addEventListener("afterprint", restore, { once: true });

        window.print();
        return true;
    }
    catch(error)
    {
        restore();
        console.error("[Rulebook] Advanced print failed", error);
        showToast(params, "Advanced print failed: " + describeError(error), true);
        return false;
    }
}

export const createToolbar = (params:RulebookParams, node:HTMLElement) : HTMLElement =>
{
    const toolbar = document.createElement("header");
    toolbar.classList.add("rulebook-toolbar");
    toolbar.dataset.menu = "closed";

    const inner = document.createElement("div");
    inner.classList.add("rulebook-toolbar-inner");
    toolbar.appendChild(inner);

    const menuID = "rulebook-menu-" + Math.random().toString(36).slice(2, 8);

    const menuButton = document.createElement("button");
    menuButton.type = "button";
    menuButton.classList.add("rulebook-menu-toggle");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-controls", menuID);
    menuButton.innerHTML = `<span class="rulebook-menu-bars" aria-hidden="true"></span><span>Menu</span>`;
    inner.appendChild(menuButton);

    const actions = document.createElement("div");
    actions.classList.add("rulebook-toolbar-actions");
    actions.id = menuID;
    inner.appendChild(actions);

    const closeMenu = () =>
    {
        toolbar.dataset.menu = "closed";
        menuButton.setAttribute("aria-expanded", "false");
    }

    menuButton.addEventListener("click", () =>
    {
        const open = toolbar.dataset.menu !== "open";
        toolbar.dataset.menu = open ? "open" : "closed";
        menuButton.setAttribute("aria-expanded", String(open));
    });

    const addButton = (label:string, title:string, onClick:() => void) : HTMLButtonElement =>
    {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = label;
        button.title = title;
        button.addEventListener("click", onClick);
        actions.appendChild(button);
        return button;
    }

    // A click on any action closes the menu on small screens; without this the panel stays over the book.
    actions.addEventListener("click", (ev) =>
    {
        if((ev.target as HTMLElement).closest("button")) { closeMenu(); }
    });

    addButton("Print (Browser)", "Less advanced features (e.g. no page numbers), also less likely to make mistakes/crash.", () =>
    {
        printBrowserRulebook(params, node);
    });

    const buttonPrintPaged = addButton("Print (Advanced)", "More correct and pretty (running headers, page numbers), but can completely crash on specific devices/browsers/sizes.", async () =>
    {
        buttonPrintPaged.disabled = true;
        try { await printAdvancedRulebook(params, node); }
        finally { buttonPrintPaged.disabled = false; }
    });

    addButton("Fold All", "Fold every rulebook section.", () => { foldAll(node); });
    addButton("Unfold All", "Open every rulebook section.", () => { unfoldAll(node); });

    let tablesExpanded = false;
    const buttonTables = addButton("Expand Tables", "Show every table entry with its description, instead of compact cards.", () =>
    {
        tablesExpanded = toggleTablesExpanded(node, !tablesExpanded);
        buttonTables.textContent = tablesExpanded ? "Compact Tables" : "Expand Tables";
        buttonTables.setAttribute("aria-pressed", String(tablesExpanded));
    });
    buttonTables.setAttribute("aria-pressed", "false");

    const buttonDisplayMode = addButton("Dark Mode", "Switch between the light and dark rulebook theme.", () => {});

    let curMode = "light";
    buttonDisplayMode.textContent = "Dark Mode";
    buttonDisplayMode.addEventListener("click", () =>
    {
        document.body.classList.remove("display-mode-light", "display-mode-dark");
        curMode = curMode == "light" ? "dark" : "light";
        buttonDisplayMode.textContent = curMode == "light" ? "Dark Mode" : "Light Mode";
        document.body.classList.add(`display-mode-${ curMode }`);
    });
    // a reset builds a fresh toolbar; do not leave the previous mode class behind
    document.body.classList.remove("display-mode-light", "display-mode-dark");
    document.body.classList.add(`display-mode-${ curMode }`);

    if(params.toc !== false)
    {
        const checkLabel = document.createElement("label");
        checkLabel.className = "rulebook-toolbar-check";
        checkLabel.title = "Print the table of contents at the start of the rulebook.";

        const check = document.createElement("input");
        check.type = "checkbox";
        check.checked = params.tocInPrint ?? false;
        check.addEventListener("change", () => { setTOCInPrint(params, check.checked); });

        checkLabel.appendChild(check);
        checkLabel.appendChild(document.createTextNode("Contents in print"));
        actions.appendChild(checkLabel);
    }

    const hasInteractiveExamples = Object.keys(params.examples ?? {}).length > 0;
    if(isLocalFile() && hasInteractiveExamples)
    {
        const cont = document.createElement("div");
        cont.classList.add("rulebook-toolbar-upload");
        actions.appendChild(cont);

        const inputAssets = document.createElement("input");
        cont.appendChild(inputAssets)
        inputAssets.type = "file";
        inputAssets.multiple = true;

        const buttonAssets = document.createElement("button");
        buttonAssets.type = "button";
        cont.appendChild(buttonAssets);
        buttonAssets.innerHTML = "Upload";
        buttonAssets.title = "Select all files in the assets folder and upload them to make interactive examples work";
        buttonAssets.addEventListener("click", (ev) => {
            // @TOD: it's ugly, but it's the only way until I rewrite the interactive example code
            // @ts-ignore
            window.pqRulebookCustomResources = inputAssets.files;
        });
    }

    toolbar.appendChild(createProgressBar(params));
    return toolbar;
}
