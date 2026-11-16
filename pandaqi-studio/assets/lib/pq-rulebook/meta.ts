import type { RulebookParams } from "./rulebook";

// The name of the game a rulebook belongs to. The library is used on game pages where the game name is
// usually only present in the page title and the URL, so it is collected from every place that might
// have it, in order of trust.
export const DEFAULT_RULEBOOK_TITLE = "Rulebook";

const TITLE_STOPWORDS = [/^rulebook$/i, /^rules$/i, /^untitled$/i, /^home$/i, /^index$/i];

export interface RulebookAccent
{
    strong: string,
    soft: string,
}

// Muted, printable accents. Picking one from the game name keeps rulebooks from all looking identical
// without making them loud; the palette is desaturated on purpose.
export const ACCENTS: RulebookAccent[] = [
    { strong: "#6d4433", soft: "#f3e8e0" }, // clay
    { strong: "#3f5d52", soft: "#e7efe9" }, // pine
    { strong: "#4a5a78", soft: "#e8ebf3" }, // slate
    { strong: "#6b4a6a", soft: "#f2eaf2" }, // plum
    { strong: "#765f2c", soft: "#f5efe1" }, // ochre
    { strong: "#39586b", soft: "#e6eff3" }, // teal
    { strong: "#5c5140", soft: "#efebe2" }, // umber
    { strong: "#4f5a44", soft: "#edf0e7" }, // moss
];

export const humanizeSlug = (raw:string) : string =>
{
    const words = (raw ?? "")
        .replace(/\.[a-z0-9]{1,5}$/i, "")
        .replace(/[-_+]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    if(!words) { return ""; }
    return words.split(" ").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
}

export const getTitleFromURL = (location:Location = window.location) : string =>
{
    const parts = location.pathname.split("/").filter(Boolean);
    const rulesIndex = parts.lastIndexOf("rules");
    if(rulesIndex > 0) { return humanizeSlug(parts[rulesIndex - 1]); }

    const last = [...parts].reverse().find((part) => !TITLE_STOPWORDS.some((re) => re.test(part)));
    return last ? humanizeSlug(last) : "";
}

// The game's main page is the parent of its rules page: /<game>/rules/ -> /<game>/.
// Returns an empty string when the current URL is not a rules page.
export const getRulebookMainURL = (location:Location = window.location) : string =>
{
    const parts = location.pathname.split("/").filter(Boolean);
    const rulesIndex = parts.lastIndexOf("rules");
    if(rulesIndex <= 0) { return ""; }

    const url = new URL(location.href);
    url.pathname = "/" + parts.slice(0, rulesIndex).join("/") + "/";
    url.search = "";
    url.hash = "";
    return url.href;
}

// The website titles its rules pages "<Game> | Rulebook | <Site>". Other sites may only put the game
// name in the title, which is also fine.
export const getTitleFromDocument = () : string =>
{
    const raw = document.title?.trim();
    if(!raw) { return ""; }

    const parts = raw.split(/\s*(?:\||•|·|—|–)\s*|\s+-\s+/).map((part) => part.trim()).filter(Boolean);
    const rulebookIndex = parts.findIndex((part) => /^rulebook$/i.test(part) || /^rules$/i.test(part));
    if(rulebookIndex > 0) { return parts[rulebookIndex - 1]; }

    const first = parts[0] ?? "";
    return TITLE_STOPWORDS.some((re) => re.test(first)) ? "" : first;
}

export const getTitleFromMeta = () : string =>
{
    const meta = document.querySelector(
        'meta[name="rulebook:title"], meta[property="rulebook:title"], meta[name="rulebook-title"]'
    );
    return meta?.getAttribute("content")?.trim() ?? "";
}

export const resolveRulebookTitle = (params:RulebookParams, node?:HTMLElement) : string =>
{
    const explicit = params.title?.trim();
    if(explicit) { return explicit; }

    const dataNode = (node?.closest("[data-rulebook-title]") ?? null) as HTMLElement | null;
    const fromNode = (node?.dataset.rulebookTitle ?? dataNode?.dataset.rulebookTitle ?? "").trim();
    if(fromNode) { return fromNode; }

    return getTitleFromMeta()
        || getTitleFromDocument()
        || getTitleFromURL()
        || DEFAULT_RULEBOOK_TITLE;
}

// Deterministic so a rulebook keeps its accent on every reload, and two games practically never share one.
export const pickAccent = (seed:string) : RulebookAccent =>
{
    let hash = 0;
    for(let i = 0; i < seed.length; i++) { hash = (hash * 31 + seed.charCodeAt(i)) >>> 0; }
    return ACCENTS[hash % ACCENTS.length];
}
