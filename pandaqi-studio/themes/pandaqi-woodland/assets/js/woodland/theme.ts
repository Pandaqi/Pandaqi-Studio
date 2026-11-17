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

    // Kept on <body> as well: the shared styling code and the rulebook toolbar target the body
    // class, and both selectors resolve to the same tokens. No navigation, no reload.
    if(document.body)
    {
        document.body.classList.remove("display-mode-light", "display-mode-dark");
        document.body.classList.add(`display-mode-${mode}`);
    }

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

    // A second tab (or the footer toggle in another window) writes the same key. Applying the new
    // value keeps every open page in step without asking anybody to refresh.
    window.addEventListener("storage", (event) => {
        if(event.key !== STORAGE_KEY) { return; }
        if(event.newValue === "dark" || event.newValue === "light") { applyMode(event.newValue); }
        else { applyMode(getSystemMode()); }
    });
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

/* ------------------------------------------------------------- image lightbox */

const loadMediaLightbox = () =>
{
    const images = Array.from(document.querySelectorAll<HTMLImageElement>("[data-pq-rail] .pq-rail__item img"));
    if(images.length <= 0) { return; }

    const dialog = document.createElement("dialog");
    dialog.className = "pq-lightbox";
    dialog.setAttribute("aria-label", "Image preview");
    dialog.innerHTML = `
        <div class="pq-lightbox__frame">
            <img class="pq-lightbox__image" alt="" decoding="async">
        </div>
        <button type="button" class="pq-lightbox__close" aria-label="Close image preview">
            <span aria-hidden="true">&times;</span>
        </button>`;
    document.body.appendChild(dialog);

    const frame = dialog.querySelector<HTMLElement>(".pq-lightbox__frame")!;
    const large = dialog.querySelector<HTMLImageElement>(".pq-lightbox__image")!;
    const close = dialog.querySelector<HTMLButtonElement>(".pq-lightbox__close")!;
    let trigger:HTMLImageElement | null = null;

    const open = (image:HTMLImageElement) =>
    {
        large.src = image.currentSrc || image.src;
        large.alt = image.alt;
        trigger = image;

        if(!dialog.open) { dialog.showModal(); }
        frame.scrollTo(0, 0);
        document.documentElement.classList.add("pq-lightbox-open");
        close.focus();
    };

    close.addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", (event) => {
        const target = event.target as HTMLElement;
        if(target === dialog || target === frame) { dialog.close(); }
    });
    dialog.addEventListener("close", () => {
        document.documentElement.classList.remove("pq-lightbox-open");
        trigger?.focus();
        trigger = null;
    });
    // The close button is the only focusable control, so keep Tab inside the modal
    // instead of letting it fall through to the page behind it.
    dialog.addEventListener("keydown", (event) => {
        if(event.key !== "Tab") { return; }
        event.preventDefault();
        close.focus();
    });

    images.forEach((image) =>
    {
        image.classList.add("pq-zoomable");
        image.tabIndex = 0;
        image.setAttribute("role", "button");
        image.setAttribute("aria-haspopup", "dialog");
        image.setAttribute("aria-label", `Enlarge ${image.alt || "image"}`);

        const hint = document.createElement("span");
        hint.className = "pq-rail__hint";
        hint.setAttribute("aria-hidden", "true");
        hint.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" focusable="false"><path d="M9 4H4v5M15 4h5v5M20 15v5h-5M9 20H4v-5"/></svg>`;
        image.closest(".pq-rail__item")?.appendChild(hint);

        const activate = () => open(image);
        image.addEventListener("click", activate);
        image.addEventListener("keydown", (event) => {
            if(event.key !== "Enter" && event.key !== " ") { return; }
            event.preventDefault();
            activate();
        });
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

/* ------------------------------------------------- game of the week / popular */

/* The homepage spotlights are not real statistics, and they do not try to be:
   they are a stable, time-seeded pick out of the catalogue, so the front page
   feels alive without a server, a database or a build per visitor.

   - Game of the Week: the catalogue is shuffled once per week-year and week N
     takes position N-1. Every week of that year therefore gets a different
     game (as long as there are ~52 candidates), and the shuffle starts over
     next year.
   - Most Played: a pick from a different shuffle, seeded by a six-hour bucket,
     so it changes a few times a day and everybody sees the same one in that
     window.

   Both prefer the newer half of the catalogue, and the pool that Hugo hands
   over already excludes deprecated projects. */

type SpotlightFact = { icon: string; text: string };

type SpotlightEntry = {
    u: string;
    t: string;
    b: string;
    i: string;
    w: number;
    h: number;
    g: string;
    f: SpotlightFact[];
    r?: boolean; // has a rulebook
    m?: boolean; // has a material generator
};

/* Saturated paper colours from the theme's token set, each with the ink that
   stays readable on it. Picked per game, so consecutive weeks do not all look
   the same, while every combination still fits the woodland palette. */
const SPOTLIGHT_ACCENTS: [string, string][] = [
    ["#7E56AA", "#FFFDF7"],
    ["#B05C86", "#FFF6FA"],
    ["#4F8A6B", "#F7FFF8"],
    ["#3F7FA6", "#F3FAFF"],
    ["#C9736A", "#FFF7F2"],
    ["#B7862B", "#FFF9EC"]
];

const hashString = (value: string): number =>
{
    let hash = 2166136261;
    for (let i = 0; i < value.length; i++)
    {
        hash ^= value.charCodeAt(i);
        hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
};

// mulberry32: small, fast, and deterministic, which is all this needs
const seededRandom = (seed: string): (() => number) =>
{
    let state = hashString(seed);
    return () =>
    {
        state = (state + 0x6D2B79F5) | 0;
        let t = Math.imul(state ^ (state >>> 15), 1 | state);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
};

const shuffledWith = <T,>(list: T[], seed: string): T[] =>
{
    const random = seededRandom(seed);
    const copy = list.slice();
    for (let i = copy.length - 1; i > 0; i--)
    {
        const j = Math.floor(random() * (i + 1));
        const swap = copy[i];
        copy[i] = copy[j];
        copy[j] = swap;
    }
    return copy;
};

/* Shuffle in small blocks but keep the blocks in order. The pool arrives
   newest-first, so this keeps the newest games near the start of the year
   while still varying which one lands where. */
const shuffleInBlocks = <T,>(list: T[], seed: string, blockSize = 6): T[] =>
{
    const out: T[] = [];
    for (let i = 0; i < list.length; i += blockSize)
    {
        out.push(...shuffledWith(list.slice(i, i + blockSize), `${seed}:${i}`));
    }
    return out;
};

// ISO week + its week-year: week 1 is the week holding the first Thursday
const isoWeek = (date: Date): { week: number; year: number } =>
{
    const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const day = target.getUTCDay() || 7;
    target.setUTCDate(target.getUTCDate() + 4 - day);
    const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
    const week = Math.ceil((((target.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return { week, year: target.getUTCFullYear() };
};

/* Rulebook + generator games first (the ones most likely to be worth the
   visit), then everything else, each group shuffled newest-first. */
const weeklyOrder = (pool: SpotlightEntry[], weekYear: number): SpotlightEntry[] =>
{
    const complete = pool.filter((entry) => entry.r && entry.m);
    const rest = pool.filter((entry) => !(entry.r && entry.m));
    return shuffleInBlocks(complete, `week-${weekYear}-complete`)
        .concat(shuffleInBlocks(rest, `week-${weekYear}-rest`));
};

const popularPick = (pool: SpotlightEntry[], now: Date): SpotlightEntry =>
{
    const bucket = Math.floor(now.getTime() / (6 * 60 * 60 * 1000));
    const random = seededRandom(`popular-${bucket}`);
    // ^1.8 skews the pick towards the newer end without ever excluding the rest
    const index = Math.floor(Math.pow(random(), 1.8) * pool.length);
    return pool[Math.min(pool.length - 1, index)];
};

const spotlightIcon = (name: string): SVGSVGElement =>
{
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "pq-ico");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
    use.setAttribute("href", `/theme/woodland/sprite.svg#${name}`);
    svg.appendChild(use);
    return svg;
};

const fillSpotlight = (section: HTMLElement, entry: SpotlightEntry) =>
{
    const link = section.querySelector<HTMLAnchorElement>('[data-pq-hl="link"]');
    if (!link) { return; }
    link.href = entry.u;

    const media = section.querySelector<HTMLElement>('[data-pq-hl="media"]');
    const image = section.querySelector<HTMLImageElement>('[data-pq-hl="image"]');
    if (media && image)
    {
        if (entry.i)
        {
            media.hidden = false;
            image.hidden = false;
            image.src = entry.i;
            image.width = entry.w;
            image.height = entry.h;
        }
        else
        {
            media.hidden = true;
            image.hidden = true;
        }
    }

    const title = section.querySelector<HTMLElement>('[data-pq-hl="title"]');
    if (title) { title.textContent = entry.t; }

    const blurb = section.querySelector<HTMLElement>('[data-pq-hl="blurb"]');
    if (blurb)
    {
        blurb.textContent = entry.b || "";
        blurb.hidden = !entry.b;
    }

    const badge = section.querySelector<SVGUseElement>('[data-pq-hl="badge"] use');
    if (badge && entry.g) { badge.setAttribute("href", `/theme/woodland/sprite.svg#${entry.g}`); }

    const facts = section.querySelector<HTMLElement>('[data-pq-hl="facts"]');
    if (facts)
    {
        const list = (entry.f ?? []).slice(0, 3);
        facts.replaceChildren(...list.map((fact) => {
            const item = document.createElement("li");
            const text = document.createElement("span");
            text.textContent = fact.text;
            item.append(spotlightIcon(fact.icon), text);
            return item;
        }));
        facts.hidden = list.length === 0;
    }

    const accent = SPOTLIGHT_ACCENTS[hashString(entry.u) % SPOTLIGHT_ACCENTS.length];
    section.style.setProperty("--spot-accent", accent[0]);
    section.style.setProperty("--spot-ink", accent[1]);
};

const loadSpotlights = () =>
{
    const weekly = document.querySelector<HTMLElement>('[data-pq-spotlight="weekly"]');
    const popular = document.querySelector<HTMLElement>('[data-pq-spotlight="popular"]');
    const data = document.querySelector<HTMLScriptElement>("[data-pq-spotlight-data]");
    if (!weekly && !popular) { return; };

    let pool: SpotlightEntry[] = [];
    try
    {
        const parsed = JSON.parse(data?.textContent || "[]");
        pool = Array.isArray(parsed) ? parsed : [];
    }
    catch (err) { return; }
    if (pool.length === 0) { return; }

    const now = new Date();
    const { week, year } = isoWeek(now);

    let weeklyPick: SpotlightEntry | null = null;
    if (weekly)
    {
        const order = weeklyOrder(pool, year);
        weeklyPick = order[(week - 1) % order.length];
        fillSpotlight(weekly, weeklyPick);

        const kicker = weekly.querySelector<HTMLElement>('[data-pq-hl="kicker"] span');
        if (kicker) { kicker.textContent = `Week ${week} · ${year}`; }
    }

    if (popular)
    {
        const candidates = pool.filter((entry) => !weeklyPick || entry.u !== weeklyPick.u);
        if (candidates.length > 0)
        {
            fillSpotlight(popular, popularPick(candidates, now));
        }
    }
};

loadColourMode();
loadMenu();
loadRandomShortcut();
loadCatalogueSort();
loadMediaRail();
loadMediaLightbox();
loadSearch();
loadSpotlights();
