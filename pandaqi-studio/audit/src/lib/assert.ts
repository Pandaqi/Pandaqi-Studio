import type { Contract, Failure } from "./types";

export class Checker
{
    failures: Failure[] = [];
    warnings: string[] = [];
    contract: Contract;

    constructor(contract: Contract)
    {
        this.contract = contract;
    }

    ok(cond:any, code:string, message:string, where?:string) : boolean
    {
        const passed = !!cond;
        if(!passed) { this.failures.push({ code, contract: this.contract, message, where }); }
        return passed;
    }

    fail(code:string, message:string, where?:string)
    {
        this.failures.push({ code, contract: this.contract, message, where });
    }

    warn(message:string)
    {
        this.warnings.push(message);
    }
}

const NAMED_ENTITIES:Record<string,string> = {
    amp: "&", lt: "<", gt: ">", quot: "\"", apos: "'", nbsp: " ",
    rsquo: "\u2019", lsquo: "\u2018", rdquo: "\u201d", ldquo: "\u201c",
    ndash: "\u2013", mdash: "\u2014", hellip: "\u2026",
    aacute: "\u00e1", eacute: "\u00e9", iacute: "\u00ed", oacute: "\u00f3", uacute: "\u00fa",
    agrave: "\u00e0", egrave: "\u00e8", igrave: "\u00ec", ograve: "\u00f2", ugrave: "\u00f9",
    auml: "\u00e4", euml: "\u00eb", iuml: "\u00ef", ouml: "\u00f6", uuml: "\u00fc",
    szlig: "\u00df", ccedil: "\u00e7", ntilde: "\u00f1",
};

// decode the entities Hugo emits so server HTML can be compared with DOM textContent
const decodeEntities = (s:string) =>
{
    return s.replace(/&(#x[0-9a-fA-F]+|#[0-9]+|[a-zA-Z]+);/g, (match, body:string) =>
    {
        if(body.startsWith("#x") || body.startsWith("#X"))
        {
            const code = parseInt(body.slice(2), 16);
            return Number.isFinite(code) ? String.fromCodePoint(code) : match;
        }
        if(body.startsWith("#"))
        {
            const code = parseInt(body.slice(1), 10);
            return Number.isFinite(code) ? String.fromCodePoint(code) : match;
        }
        return NAMED_ENTITIES[body.toLowerCase()] ?? match;
    });
}

// strip tags, decode entities, collapse whitespace, lowercase: for comparing server HTML against rendered DOM
export const norm = (s:string) =>
{
    return decodeEntities(String(s ?? ""))
        .replace(/<[^>]*>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();
}
