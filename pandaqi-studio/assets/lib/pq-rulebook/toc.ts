import type { RulebookParams } from "./rulebook";
import { DEFAULT_SECTION_HEADER_CLASS, RulebookSection, unfoldAllSectionsAbove } from "./sections";

// Matches the CSS breakpoint: above it the table of contents is a sticky sidebar, below it a foldable
// block at the top of the rulebook.
const TOC_WIDE_QUERY = "(min-width: 64em)";

export class RulebookTOC
{
    node: HTMLElement;
    nav: HTMLElement;
    list: HTMLElement;
    links: Map<string, HTMLAnchorElement>;
    private mediaQuery: MediaQueryList;
    private activeID = "";
    private open = false;
    private onMediaChange = () => { this.syncOpenState(); };

    constructor(root:RulebookSection)
    {
        this.links = new Map();

        const toc = document.createElement("div");
        toc.className = "rulebook-toc";
        toc.dataset.rulebookToc = "true";

        const toggle = document.createElement("button");
        toggle.type = "button";
        toggle.className = "rulebook-toc-toggle";
        toggle.innerHTML = `<span>Contents</span>`;
        toggle.setAttribute("aria-label", "Table of contents");
        toggle.addEventListener("click", () => { this.setOpen(!this.open); });
        toc.appendChild(toggle);

        const nav = document.createElement("nav");
        nav.id = "rulebook-toc-nav-" + Math.random().toString(36).slice(2, 8);
        nav.className = "rulebook-toc-nav";
        nav.setAttribute("aria-label", "Rulebook contents");
        toggle.setAttribute("aria-controls", nav.id);
        toc.appendChild(nav);

        const list = document.createElement("ol");
        list.className = "rulebook-toc-list";
        nav.appendChild(list);
        this.buildList(root, list);

        this.node = toc;
        this.nav = nav;
        this.list = list;

        this.mediaQuery = window.matchMedia(TOC_WIDE_QUERY);
        // Safari before 14 only has the older listener API. Without either, the sidebar keeps its
        // initial state instead of the rulebook failing to load at all.
        if(this.mediaQuery.addEventListener) { this.mediaQuery.addEventListener("change", this.onMediaChange); }
        else if(this.mediaQuery.addListener) { this.mediaQuery.addListener(this.onMediaChange); }
        this.syncOpenState();
    }

    setOpen(open:boolean)
    {
        this.open = open;
        this.node.classList.toggle("is-open", open);
        const toggle = this.node.querySelector(".rulebook-toc-toggle");
        toggle?.setAttribute("aria-expanded", String(open));
    }

    private buildList(section:RulebookSection, parentList:HTMLElement)
    {
        for(const child of section.content)
        {
            if(!(child instanceof RulebookSection)) { continue; }
            if(child.hideHeader) { continue; }

            const id = child.headingNode.id;
            const label = (child.headingNode.textContent ?? "").trim();
            if(!id || !label) { continue; }

            const item = document.createElement("li");
            item.className = "rulebook-toc-item";
            item.dataset.level = String(child.getLevel());

            const link = document.createElement("a");
            link.className = "rulebook-toc-link";
            link.href = "#" + id;
            link.dataset.sectionId = id;
            link.textContent = label;
            link.addEventListener("click", (ev) => { this.onLinkClick(ev, id); });

            item.appendChild(link);
            parentList.appendChild(item);
            this.links.set(id, link);

            const nested = document.createElement("ol");
            nested.className = "rulebook-toc-list rulebook-toc-sublist";
            item.appendChild(nested);
            this.buildList(child, nested);
            if(nested.children.length <= 0) { nested.remove(); }
        }
    }

    private onLinkClick(ev:Event, id:string)
    {
        ev.preventDefault();

        const target = document.getElementById(id);
        if(!target) { return; }

        unfoldAllSectionsAbove(target);
        this.setActive(id);
        target.scrollIntoView({ behavior: "smooth", block: "start" });

        if(!this.mediaQuery.matches) { this.setOpen(false); }
    }

    private syncOpenState()
    {
        // On wide screens the list is a permanent sidebar, so it must be open. On narrow screens the
        // reader decides; collapsing on resize keeps it from covering the page as a huge drawer.
        this.setOpen(this.mediaQuery.matches);
    }

    setActive(id:string)
    {
        if(this.activeID === id) { return; }
        this.activeID = id;

        for(const [key, link] of this.links)
        {
            const isActive = key === id;
            link.classList.toggle("active", isActive);
            if(isActive) { link.setAttribute("aria-current", "location"); }
            else { link.removeAttribute("aria-current"); }
        }

        const active = this.links.get(id);
        if(!active || !this.mediaQuery.matches) { return; }

        // keep the active link inside the (scrollable) sidebar without moving the page itself
        const nav = this.nav;
        const top = active.offsetTop;
        const bottom = top + active.offsetHeight;
        if(top < nav.scrollTop) { nav.scrollTop = Math.max(0, top - 8); }
        else if(bottom > nav.scrollTop + nav.clientHeight) { nav.scrollTop = bottom - nav.clientHeight + 8; }
    }

    destroy()
    {
        if(this.mediaQuery.removeEventListener) { this.mediaQuery.removeEventListener("change", this.onMediaChange); }
        else if(this.mediaQuery.removeListener) { this.mediaQuery.removeListener(this.onMediaChange); }
    }
}

export const createRulebookTOC = (params:RulebookParams, shell:HTMLElement) : RulebookTOC | null =>
{
    if(!params._sectionRoot) { return null; }

    const toc = new RulebookTOC(params._sectionRoot);
    if(toc.links.size <= 0) { toc.destroy(); return null; }

    // Before the content column (and after the title) so the grid places the two columns in the right
    // order, and so print output reads: title, contents, rulebook.
    const layout = shell.querySelector(".rulebook-layout");
    const main = shell.querySelector(".rulebook-main");
    if(layout && main) { layout.insertBefore(toc.node, main); }
    else { (layout ?? shell).appendChild(toc.node); }
    toc.node.hidden = params.toc === false;
    return toc;
}

export const setTOCEnabled = (params:RulebookParams, enabled:boolean) =>
{
    params.toc = enabled;
    if(params._shell)
    {
        params._shell.dataset.toc = enabled
            ? (params.tocPosition === "right" ? "right" : "left")
            : "none";
    }
    if(params._toc)
    {
        params._toc.node.hidden = !enabled;
        if(enabled) { params._toc.setOpen(true); }
    }
}

// Adds the same table of contents to the print/paged copy. Keep this a plain element: Chromium's
// paginated print drops the contents of a closed/native <details> even when it is open on screen.
export const cloneRulebookTOCForPrint = (toc:RulebookTOC | null) : HTMLElement | null =>
{
    if(!toc) { return null; }
    const flat = document.createElement("div");
    flat.className = "rulebook-toc rulebook-toc-printable";
    flat.appendChild(toc.nav.cloneNode(true));
    return flat;
}

export const setTOCInPrint = (params:RulebookParams, enabled:boolean) =>
{
    params.tocInPrint = enabled;
    params._shell?.setAttribute("data-toc-print", enabled ? "true" : "false");
    if(params._toc && enabled) { params._toc.setOpen(true); }
}

export interface RulebookScrollTracker
{
    update(): void,
    destroy(): void,
}

// One scroll listener drives both the reading progress bar and the highlighted table-of-contents entry.
export const createRulebookScrollTracker = (params:RulebookParams, shell:HTMLElement, node:HTMLElement) : RulebookScrollTracker =>
{
    let frame = 0;
    let disposed = false;

    const headersOf = () => Array.from(node.getElementsByClassName(DEFAULT_SECTION_HEADER_CLASS)) as HTMLElement[];

    const update = () =>
    {
        if(disposed) { return; }

        const toolbarHeight = params._toolbar?.getBoundingClientRect().height ?? 0;
        const offset = toolbarHeight + 24;
        let activeID = "";
        for(const header of headersOf())
        {
            if(header.getBoundingClientRect().top > offset) { break; }
            activeID = header.dataset.sectionId ?? "";
        }
        params._toc?.setActive(activeID);

        const bar = params._progressBar;
        if(bar)
        {
            const rect = shell.getBoundingClientRect();
            const total = Math.max(1, rect.height - window.innerHeight);
            const ratio = Math.min(1, Math.max(0, -rect.top / total));
            bar.style.width = (ratio * 100).toFixed(2) + "%";
        }
    }

    const schedule = () =>
    {
        if(frame) { return; }
        frame = window.requestAnimationFrame(() => { frame = 0; update(); });
    }

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    // after layout settles (fonts, images), the first state must be correct
    window.requestAnimationFrame(update);
    setTimeout(update, 250);

    return {
        update,
        destroy()
        {
            disposed = true;
            window.removeEventListener("scroll", schedule);
            window.removeEventListener("resize", schedule);
            if(frame) { window.cancelAnimationFrame(frame); }
        },
    };
}
