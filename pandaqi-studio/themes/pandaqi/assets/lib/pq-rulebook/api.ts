import type { RulebookParams } from "./rulebook";
import type { RulebookSection } from "./sections";

// A small, documented surface for everything a page might want to do to its rulebook after it has been
// parsed: inspect the section tree, find a table, fold everything, read the generated HTML, and so on.
//
// Every loaded rulebook is registered on `window.PQRulebook`:
//
//     PQRulebook.active          -> the most recently loaded rulebook
//     PQRulebook.all()           -> every rulebook on the page
//     PQRulebook.instances[0]    -> the first one
//     PQRulebook.get("rulebook-1")-> look up by API id, article id, or element
//
// It is also attached to the rulebook article as `node.pqRulebook`, so a console can start from
// `document.querySelector("#rulebook-content").pqRulebook`.
export const RULEBOOK_API_VERSION = "2.0.0";

export interface RulebookAPI
{
    version: string,
    id: string,
    params: RulebookParams,
    node: HTMLElement,              // the <article> that holds the rulebook
    shell: HTMLElement,             // wrapper with toolbar, title, table of contents and the article
    toolbar: HTMLElement | null,
    toc: HTMLElement | null,
    root: RulebookSection,
    title: string,

    getSections(): RulebookSection[],
    getSection(id:string): RulebookSection | null,
    getSectionNodes(): HTMLElement[],
    getTables(): HTMLElement[],
    getExamples(): HTMLElement[],

    foldSections(folded?:boolean): void,
    foldTables(folded?:boolean): void, // true -> compact cards, false -> fully expanded list

    setTitle(title:string): void,
    setTOCInPrint(enabled:boolean): void,

    getHTML(flat?:boolean): string,
    print(advanced?:boolean): Promise<boolean> | void,
    refresh(): void,
    destroy(): void,
}

export interface RulebookGlobalAPI
{
    version: string,
    instances: RulebookAPI[],
    readonly active: RulebookAPI | null,
    all(): RulebookAPI[],
    get(idOrNode:string | HTMLElement): RulebookAPI | null,
}

const createRegistry = () : RulebookGlobalAPI =>
{
    return {
        version: RULEBOOK_API_VERSION,
        instances: [],
        get active() { return this.instances.length > 0 ? this.instances[this.instances.length - 1] : null; },
        all() { return this.instances.slice(); },
        get(idOrNode) {
            if(typeof idOrNode === "string") {
                const byAPIID = this.instances.find((api) => api.id === idOrNode);
                if(byAPIID) { return byAPIID; }
                const element = document.getElementById(idOrNode);
                if(!element) { return null; }
                return this.instances.find((api) => api.node === element || api.shell.contains(element)) ?? null;
            }

            return this.instances.find((api) => api.node === idOrNode || api.shell.contains(idOrNode)) ?? null;
        },
    };
}

export const getRulebookRegistry = () : RulebookGlobalAPI =>
{
    const globalObject = globalThis as any;
    if(!globalObject.PQRulebook) { globalObject.PQRulebook = createRegistry(); }
    return globalObject.PQRulebook as RulebookGlobalAPI;
}

export const registerRulebookAPI = (api:RulebookAPI) : RulebookAPI =>
{
    const registry = getRulebookRegistry();
    if(!registry.instances.includes(api)) { registry.instances.push(api); }
    return api;
}

export const unregisterRulebookAPI = (api:RulebookAPI) =>
{
    const registry = getRulebookRegistry();
    const index = registry.instances.indexOf(api);
    if(index >= 0) { registry.instances.splice(index, 1); }
}

declare global
{
    interface Window
    {
        PQRulebook?: RulebookGlobalAPI,
    }
}
