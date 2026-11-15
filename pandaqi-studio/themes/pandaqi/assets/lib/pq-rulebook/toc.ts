import type { RulebookParams } from "./rulebook";
import { DEFAULT_SECTION_HEADER_CLASS, RulebookSection, unfoldAllSectionsAbove } from "./sections";

// Matches the CSS breakpoint: above it the table of contents is a sticky sidebar, below it a foldable
// block at the top of the rulebook.
const TOC_WIDE_QUERY = "(min-width: 64em)";

export class RulebookTOC
{
    node: HTMLDetailsElement;
    nav: HTMLElement;
    list: HTMLElement;
    links: Map<string, HTMLAnchorElement>;
    private mediaQuery: MediaQueryList;
    private activeID = "";
    private onMediaChange = () => { this.syncOpenState(); };

    constructor(root:RulebookSection)
    {
        this.links = new Map();

        const details = document.createElement("details");
        details.className = "rulebook-toc";
        details.dataset.rulebookToc = "true";

        const summary = document.createElement("summary");
        summary.className = "rulebook-toc-toggle";
        summary.innerHTML = `<span>Contents</span>`;
        details.appendChild(summary);

        const nav = document.createElement("nav");
        nav.className = "rulebook-toc-nav";
        nav.setAttribute("aria-label", "Rulebook contents");
        details.appendChild(nav);

        const list = document.createElement("ol");
        list.className = "rulebook-toc-list";
        nav.appendChild(list);
        this.buildList(root, list);

        this.node = details;
        this.nav = nav;
        this.list = list;

        this.mediaQuery = window.matchMedia(TOC_WIDE_QUERY);
        this.mediaQuery.addEventListener("change", this.onMediaChange);
        this.syncOpenState();
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

        if(!this.mediaQuery.matches) { this.node.open = false; }
    }

    private syncOpenState()
    {
        // On wide screens the list is a permanent sidebar, so it must be open. On narrow screens the
        // reader decides; collapsing on resize keeps it from covering the page as a huge drawer.
        this.node.open = this.mediaQuery.matches;
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
        this.mediaQuery.removeEventListener("change", this.onMediaChange);
    }
}

export const createRulebookTOC = (params:RulebookParams, shell:HTMLElement) : RulebookTOC | null =>
{
    if(params.toc === false || !params._sectionRoot) { return null; }

    const toc = new RulebookTOC(params._sectionRoot);
    if(toc.links.size <= 0) { toc.destroy(); return null; }

    // Before the content column (and after the title) so the grid places the two columns in the right
    // order, and so print output reads: title, contents, rulebook.
    const layout = shell.querySelector(".rulebook-layout");
    const main = shell.querySelector(".rulebook-main");
    if(layout && main) { layout.insertBefore(toc.node, main); }
    else { (layout ?? shell).appendChild(toc.node); }
    return toc;
}

// Adds the same table of contents to the print/paged copy. It is a plain clone: no listeners, no active
// state, just the entries.
export const cloneRulebookTOCForPrint = (toc:RulebookTOC | null) : HTMLElement | null =>
{
    if(!toc) { return null; }
    const clone = toc.node.cloneNode(true) as HTMLDetailsElement;
    clone.open = true;
    clone.classList.add("rulebook-toc-printable");
    return clone;
}

export const setTOCInPrint = (params:RulebookParams, enabled:boolean) =>
{
    params.tocInPrint = enabled;
    params._shell?.setAttribute("data-toc-print", enabled ? "true" : "false");
    if(params._toc && enabled) { params._toc.node.open = true; }
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
