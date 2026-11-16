/* Woodland shell behaviour.

   Everything here is an enhancement: the pages work without it (plain links,
   server-rendered catalogue, real pager, light palette). The storage key is the
   one the site already used, so a visitor's choice carries over from the
   previous theme and stays set when they switch back. */

const STORAGE_KEY = "pandaqi-games-display-mode";

type DisplayMode = "light" | "dark";

/* ---------------------------------------------------------------- colour mode */

const getSystemMode = (): DisplayMode =>
{
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    return prefersDark ? "dark" : "light";
}

const getStoredMode = (): DisplayMode | null =>
{
    try
    {
        const value = localStorage.getItem(STORAGE_KEY);
        return (value === "dark" || value === "light") ? value : null;
    }
    catch (err)
    {
        return null;
    }
}

const storeMode = (mode:DisplayMode) =>
{
    try { localStorage.setItem(STORAGE_KEY, mode); }
    catch (err) { /* private mode or blocked storage: the session still works */ }
}

const currentMode = ():DisplayMode =>
{
    const fromDocument = document.documentElement.dataset.displayMode;
    if(fromDocument === "dark" || fromDocument === "light") { return fromDocument; }
    return getStoredMode() ?? getSystemMode();
}

const applyMode = (mode:DisplayMode) =>
{
    const root = document.documentElement;
    root.dataset.displayMode = mode;
    root.style.colorScheme = mode;

    document.body.classList.remove("display-mode-light", "display-mode-dark");
    document.body.classList.add(`display-mode-${mode}`);

    const dark = mode === "dark";
    const toggles = document.querySelectorAll<HTMLElement>("[data-pq-theme-toggle]");
    toggles.forEach((toggle) => {
        toggle.setAttribute("aria-pressed", dark ? "true" : "false");
        const label = toggle.querySelector<HTMLElement>(".pq-theme-toggle__label");
        if(label) { label.textContent = dark ? "Light mode" : "Dark mode"; }
        toggle.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
    });
}

const loadColourMode = () =>
{
    applyMode(currentMode());

    const toggles = Array.from(document.querySelectorAll<HTMLElement>("[data-pq-theme-toggle]"));
    toggles.forEach((toggle) => {
        toggle.addEventListener("click", (ev) => {
            ev.preventDefault();
            const next:DisplayMode = currentMode() === "dark" ? "light" : "dark";
            applyMode(next);
            storeMode(next);
        });
    });

    if(window.matchMedia && !getStoredMode())
    {
        const query = window.matchMedia("(prefers-color-scheme: dark)");
        const onChange = () => { if(!getStoredMode()) { applyMode(getSystemMode()); } };
        if(query.addEventListener) { query.addEventListener("change", onChange); }
        else if(query.addListener) { query.addListener(onChange); }
    }
}

/* ---------------------------------------------------------------- mobile menu */

const loadMenu = () =>
{
    const header = document.querySelector<HTMLElement>(".pq-header");
    const toggle = document.querySelector<HTMLElement>("[data-pq-menu-toggle]");
    const nav = document.getElementById("pq-site-nav");
    if(!header || !toggle || !nav) { return; }

    const isOpen = () => header.dataset.open === "true";

    const setOpen = (open:boolean, focusToggle = false) => {
        header.dataset.open = open ? "true" : "false";
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
        if(!open && focusToggle) { toggle.focus(); }
    }

    toggle.addEventListener("click", (ev) => {
        ev.preventDefault();
        setOpen(!isOpen());
    });

    document.addEventListener("keydown", (ev) => {
        if(ev.key !== "Escape" || !isOpen()) { return; }
        setOpen(false, true);
    });

    document.addEventListener("click", (ev) => {
        if(!isOpen()) { return; }
        const target = ev.target as Node;
        if(header.contains(target)) { return; }
        setOpen(false);
    });

    const wide = window.matchMedia("(min-width: 52.0625rem)");
    const onChange = () => { if(wide.matches && isOpen()) { setOpen(false); } };
    if(wide.addEventListener) { wide.addEventListener("change", onChange); }
    else if(wide.addListener) { wide.addListener(onChange); }
}

/* ------------------------------------------------------------ random project */

const loadRandomShortcut = () =>
{
    const buttons = Array.from(document.querySelectorAll<HTMLElement>("[data-pq-random]"));
    if(buttons.length === 0) { return; }

    buttons.forEach((button) => {
        button.addEventListener("click", (ev) => {
            ev.preventDefault();

            const node = document.getElementById("hidden-hugo-metadata");
            const list = node?.dataset.pages;
            if(!list) { return; }

            const pages = list.split(",").filter((url) => url.length > 0);
            if(pages.length === 0) { return; }
            window.location.href = pages[Math.floor(Math.random() * pages.length)];
        });
    });
}

/* --------------------------------------------------------------- catalogue sort */

const loadCatalogueSort = () =>
{
    const select = document.querySelector<HTMLSelectElement>("[data-pq-sort]");
    const list = document.querySelector<HTMLElement>("[data-pq-sortable]");
    if(!select || !list) { return; }

    const items = () => Array.from(list.children) as HTMLElement[];

    select.addEventListener("change", () => {
        const mode = select.value;
        const sorted = items().slice().sort((a, b) => {
            if(mode === "alpha") { return (a.dataset.title || "").localeCompare(b.dataset.title || ""); }
            const da = Number(a.dataset.date || 0);
            const db = Number(b.dataset.date || 0);
            return mode === "oldest" ? da - db : db - da;
        });
        sorted.forEach((item) => list.appendChild(item));
    });
}

/* ------------------------------------------------------------- media rail */

const loadMediaRail = () =>
{
    const rails = Array.from(document.querySelectorAll<HTMLElement>("[data-pq-rail]"));
    rails.forEach((rail) => {
        const track = rail.querySelector<HTMLElement>(".pq-rail__track");
        const prev = rail.querySelector<HTMLButtonElement>(".pq-rail__nav--prev");
        const next = rail.querySelector<HTMLButtonElement>(".pq-rail__nav--next");
        if(!track || !prev || !next) { return; }

        const step = () => {
            const item = track.firstElementChild as HTMLElement | null;
            return (item?.getBoundingClientRect().width ?? track.clientWidth * 0.8) + 12;
        };

        prev.addEventListener("click", () => { track.scrollBy({ left: -step(), behavior: "smooth" }); });
        next.addEventListener("click", () => { track.scrollBy({ left: step(), behavior: "smooth" }); });

        const sync = () => {
            const max = track.scrollWidth - track.clientWidth - 2;
            prev.disabled = track.scrollLeft <= 2;
            next.disabled = track.scrollLeft >= max;
        };
        track.addEventListener("scroll", sync, { passive: true });
        window.addEventListener("resize", sync);
        sync();
    });
}

/* ------------------------------------------------------------- search page */

type Entry = {
    title: string;
    url: string;
    blurb: string;
    cats: string[];
    genres: string[];
    platform: string[];
    players: string[];
    time: number;
    difficulty: string;
    thumb: string;
    date: number;
};

type FacetKey = "cats" | "genres" | "platform" | "players" | "difficulty";

/* Front matter is not uniform: a page may write `categories: board-game` or a
   list, and playercount may be one number or many. Normalise once, on load. */
const toArray = (value:unknown): string[] =>
{
    if (Array.isArray(value)) { return value.map((item) => String(item)); }
    if (value === null || value === undefined || value === "") { return []; }
    return [String(value)];
};

const normalise = (raw:Record<string, unknown>):Entry => ({
    title: String(raw.title ?? ""),
    url: String(raw.url ?? ""),
    blurb: String(raw.blurb ?? ""),
    cats: toArray(raw.cats),
    genres: toArray(raw.genres),
    platform: toArray(raw.platform),
    players: toArray(raw.players),
    time: Number(raw.time ?? 0),
    difficulty: String(raw.difficulty ?? ""),
    thumb: String(raw.thumb ?? ""),
    date: Number(raw.date ?? 0)
});

const FACET_LABELS: Record<FacetKey, string> = {
    cats: "Category",
    genres: "Genre",
    platform: "Platform",
    players: "Players",
    difficulty: "Difficulty"
};

const FACET_ORDER: FacetKey[] = ["cats", "genres", "players", "platform", "difficulty"];

const prettify = (value:string) =>
{
    return value
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
};

const playerRange = (players:string[]) =>
{
    if(!players || players.length === 0) { return ""; }
    const nums = players.map((p) => Number(p)).filter((n) => !Number.isNaN(n)).sort((a, b) => a - b);
    if(nums.length === 0) { return players.join(", "); }
    if(nums.length === 1) { return nums[0] === 1 ? "1 player" : `${nums[0]} players`; }
    return `${nums[0]}–${nums[nums.length - 1]} players`;
};

const loadSearch = () =>
{
    const root = document.querySelector<HTMLElement>("[data-pq-search]");
    const dataNode = document.getElementById("pq-search-data");
    if(!root || !dataNode) { return; }

    let entries: Entry[] = [];
    try {
        const raw = JSON.parse(dataNode.textContent || "[]") as Record<string, unknown>[];
        entries = raw.map(normalise);
    }
    catch (err) { return; }

    const form = root.querySelector<HTMLFormElement>("[data-pq-search-form]");
    const input = root.querySelector<HTMLInputElement>("[data-pq-search-input]");
    const results = root.querySelector<HTMLElement>("[data-pq-results]");
    const count = root.querySelector<HTMLElement>("[data-pq-count]");
    const facets = root.querySelector<HTMLElement>("[data-pq-facets]");
    const clear = root.querySelector<HTMLButtonElement>("[data-pq-clear]");
    if(!form || !input || !results || !count || !facets) { return; }

    const active: Record<FacetKey, Set<string>> = {
        cats: new Set(), genres: new Set(), platform: new Set(), players: new Set(), difficulty: new Set()
    };

    const emptyTpl = root.querySelector<HTMLTemplateElement>("[data-pq-empty-art]");
    let foundCount = 0;
    let touched = false;
    let resultsVisible = false;

    /* The facet list is long, so a filter change can leave the results far below
       the fold. This pill follows the reader until the results are on screen. */
    const jump = document.createElement("a");
    jump.className = "pq-search__jump";
    jump.href = "#pq-results";
    jump.hidden = true;
    root.appendChild(jump);

    const syncJump = () => {
        jump.textContent = foundCount === 1 ? "Show 1 result" : `Show ${foundCount} results`;
        jump.hidden = !touched || resultsVisible || foundCount === 0;
    };

    if("IntersectionObserver" in window) {
        new IntersectionObserver((records) => {
            resultsVisible = records[0]?.isIntersecting ?? false;
            syncJump();
        }, { rootMargin: "0px 0px -8% 0px" }).observe(results);
    }

    /* Facet options come from the real data, so no value is ever invented. */
    const options = (key:FacetKey) => {
        const found = new Set<string>();
        entries.forEach((entry) => {
            const value = (entry as unknown as Record<string, unknown>)[key];
            if(Array.isArray(value)) { value.forEach((v) => found.add(String(v))); }
            else if(typeof value === "string" && value.length > 0) { found.add(value); }
        });
        const list = Array.from(found);
        if(key === "players") { list.sort((a, b) => Number(a) - Number(b)); }
        else { list.sort((a, b) => a.localeCompare(b)); }
        return list;
    };

    const buildFacets = () => {
        if(facets.dataset.built === "true") { return; }
        FACET_ORDER.forEach((key) => {
            const values = options(key);
            if(values.length === 0) { return; }

            const details = document.createElement("details");
            details.open = true;
            details.className = "pq-facet";

            const summary = document.createElement("summary");
            summary.className = "pq-facet__summary";
            summary.innerHTML = `<span class="pq-facet__name">${FACET_LABELS[key]}</span>`;
            const icon = document.createElement("svg");
            icon.setAttribute("class", "pq-ico");
            icon.setAttribute("aria-hidden", "true");
            icon.innerHTML = `<use href="/theme/woodland/sprite.svg#i-chevron-down"></use>`;
            summary.appendChild(icon);
            details.appendChild(summary);

            const box = document.createElement("div");
            box.className = "pq-facet__options";

            /* How many games each option would keep, so a filter never dead-ends. */
            const totals = new Map<string, number>();
            entries.forEach((entry) => {
                const raw = (entry as unknown as Record<string, unknown>)[key];
                toArray(raw).forEach((value) => { totals.set(value, (totals.get(value) ?? 0) + 1); });
            });

            values.forEach((value) => {
                const label = document.createElement("label");
                label.className = "pq-facet__option";
                const box2 = document.createElement("input");
                box2.type = "checkbox";
                box2.value = value;
                box2.dataset.facet = key;
                box2.checked = active[key].has(value);
                label.appendChild(box2);
                const text = key === "players" ? (value === "1" ? "1 player" : `${value} players`) : prettify(value);
                label.appendChild(document.createTextNode(`${text} (${totals.get(value) ?? 0})`));
                box.appendChild(label);
            });

            details.appendChild(box);
            facets.appendChild(details);
        });
        facets.dataset.built = "true";
    };

    const matches = (entry:Entry, query:string) => {
        if(query.length > 0) {
            const haystack = `${entry.title} ${entry.blurb} ${entry.cats.join(" ")} ${entry.genres.join(" ")} ${entry.platform.join(" ")} ${entry.difficulty}`.toLowerCase();
            if(!haystack.includes(query)) { return false; }
        }
        for(const key of FACET_ORDER) {
            if(active[key].size === 0) { continue; }
            const value = (entry as unknown as Record<string, unknown>)[key];
            const values = Array.isArray(value) ? value.map(String) : [String(value ?? "")];
            let hit = false;
            active[key].forEach((want) => { if(values.includes(want)) { hit = true; } });
            if(!hit) { return false; }
        }
        return true;
    };

    const card = (entry:Entry) => {
        const li = document.createElement("li");
        li.className = "pq-result";
        const a = document.createElement("a");
        a.className = "pq-result__link";
        a.href = entry.url;

        const img = document.createElement("img");
        img.className = "pq-result__thumb";
        img.src = entry.thumb;
        img.alt = "";
        img.loading = "lazy";
        img.width = 42;
        img.height = 42;
        a.appendChild(img);

        const body = document.createElement("span");
        const title = document.createElement("span");
        title.className = "pq-result__title";
        title.textContent = entry.title;
        body.appendChild(title);

        const meta = document.createElement("span");
        meta.className = "pq-result__meta";
        const bits = [
            playerRange(entry.players),
            entry.time ? `${entry.time} min` : "",
            entry.difficulty ? prettify(entry.difficulty) : "",
            entry.cats.map(prettify).join(", ")
        ].filter((bit) => bit.length > 0);
        bits.forEach((bit) => {
            const s = document.createElement("span");
            s.textContent = bit;
            meta.appendChild(s);
        });
        body.appendChild(meta);
        a.appendChild(body);
        li.appendChild(a);
        return li;
    };

    const render = () => {
        const query = input.value.trim().toLowerCase();
        const found = entries.filter((entry) => matches(entry, query));
        results.replaceChildren();
        found.slice(0, 240).forEach((entry) => results.appendChild(card(entry)));

        if(found.length === 0) {
            if(emptyTpl) { results.appendChild(emptyTpl.content.cloneNode(true)); }
            else {
                const empty = document.createElement("p");
                empty.className = "pq-results__empty";
                empty.textContent = "No games match those filters. Try removing one.";
                results.appendChild(empty);
            }
        }

        count.textContent = found.length === entries.length
            ? `All ${entries.length} games`
            : `${found.length} of ${entries.length} games`;

        foundCount = found.length;
        syncJump();

        if(clear) { clear.hidden = found.length === entries.length && query.length === 0; }
        writeUrl(query);
    };

    const writeUrl = (query:string) => {
        const params = new URLSearchParams();
        if(query.length > 0) { params.set("q", query); }
        FACET_ORDER.forEach((key) => {
            if(active[key].size > 0) { params.set(key, Array.from(active[key]).join(",")); }
        });
        const next = params.toString();
        const url = next.length > 0 ? `${window.location.pathname}?${next}` : window.location.pathname;
        history.replaceState(null, "", url);
    };

    const readUrl = () => {
        const params = new URLSearchParams(window.location.search);
        if(params.toString().length > 0) { touched = true; }
        const q = params.get("q");
        if(q) { input.value = q; }
        FACET_ORDER.forEach((key) => {
            const raw = params.get(key);
            if(!raw) { return; }
            raw.split(",").forEach((value) => { active[key].add(value); });
        });
    };

    const clearAll = () => {
        FACET_ORDER.forEach((key) => active[key].clear());
        input.value = "";
        facets.querySelectorAll<HTMLInputElement>("input[type=checkbox]").forEach((box) => { box.checked = false; });
        touched = false;
        render();
        input.focus();
    };

    buildFacets();
    readUrl();
    render();

    input.addEventListener("input", () => { touched = true; render(); });

    form.addEventListener("submit", (ev) => { ev.preventDefault(); touched = true; render(); });

    facets.addEventListener("change", (ev) => {
        const target = ev.target as HTMLInputElement;
        const key = target.dataset.facet as FacetKey | undefined;
        if(!key) { return; }
        if(target.checked) { active[key].add(target.value); }
        else { active[key].delete(target.value); }
        touched = true;
        render();
    });

    if(clear) { clear.addEventListener("click", clearAll); }

    results.addEventListener("click", (ev) => {
        const target = ev.target as HTMLElement;
        if(target.closest("[data-pq-clear-empty]")) { ev.preventDefault(); clearAll(); }
    });
}

loadColourMode();
loadMenu();
loadRandomShortcut();
loadCatalogueSort();
loadMediaRail();
loadSearch();
