import { wordsOf } from "./markdown";

// The meaning lock.
//
// Text that comes back from a review pass (the agent loop or a person) is compared against the text
// it replaces. Anything that could change what a rule *means* is rejected instead of written:
//
//   * a number changed (how many cards, how many points, how many players)
//   * a link, image, shortcode argument or rulebook id changed (the rulebook is wired into code)
//   * a heading changed (the section structure is part of the rule)
//   * a rewrite so large that the two texts no longer share most of their vocabulary
//
// Rejected edits are reported with the reason, never applied. A design improvement that a reviewer
// thinks of belongs in suggestions, not in the rulebook.

export type EditScope = "rulebook" | "page";

export interface GuardVerdict
{
    ok: boolean;
    reasons: string[];
    warnings: string[];
}

const digitsOf = (text:string) : string[] => (text.match(/\d+(?:[.,]\d+)?/g) ?? []).sort();

const structuralTokensOf = (text:string) : string[] =>
{
    const tokens:string[] = [];
    for(const match of text.matchAll(/\{\{[<%][\s\S]*?[>%]\}\}/g)) { tokens.push(`shortcode:${match[0].replace(/\s+/g, " ").trim()}`); }
    for(const match of text.matchAll(/\]\(([^)]*)\)/g)) { tokens.push(`link:${match[1].trim()}`); }
    for(const match of text.matchAll(/\bsrc\s*=\s*"([^"]*)"/g)) { tokens.push(`src:${match[1]}`); }
    for(const match of text.matchAll(/\bid\s*=\s*"([^"]*)"/g)) { tokens.push(`id:${match[1]}`); }
    for(const match of text.matchAll(/!\[[^\]]*\]\(([^)]*)\)/g)) { tokens.push(`image:${match[1].trim()}`); }
    return Array.from(new Set(tokens)).sort();
};

const headingsOf = (text:string) =>
    (text.split(/\r?\n/).filter(line => /^#{1,6}\s+/.test(line)).map(line => line.trim())).sort();

const jaccard = (a:string[], b:string[]) =>
{
    const setA = new Set(a);
    const setB = new Set(b);
    if(setA.size === 0 && setB.size === 0) { return 1; }
    let shared = 0;
    for(const word of setA) { if(setB.has(word)) { shared++; } }
    return shared / (setA.size + setB.size - shared);
};

const listItems = (text:string) => (text.match(/^\s*(?:[-*+]|\d+\.)\s+/gm) ?? []).length;

export const guardEdit = (before:string, after:string, scope:EditScope) : GuardVerdict =>
{
    const reasons:string[] = [];
    const warnings:string[] = [];

    if(after.trim().length === 0)
    {
        return { ok: false, reasons: ["the replacement is empty"], warnings };
    }

    const digitsBefore = digitsOf(before);
    const digitsAfter = digitsOf(after);
    if(digitsBefore.join(",") !== digitsAfter.join(","))
    {
        const added = digitsAfter.filter(value => !digitsBefore.includes(value));
        const removed = digitsBefore.filter(value => !digitsAfter.includes(value));
        reasons.push(`a number changed (removed ${removed.join(", ") || "none"}; added ${added.join(", ") || "none"})`);
    }

    const structuralBefore = structuralTokensOf(before);
    const structuralAfter = structuralTokensOf(after);
    if(structuralBefore.join("|") !== structuralAfter.join("|"))
    {
        const added = structuralAfter.filter(token => !structuralBefore.includes(token));
        const removed = structuralBefore.filter(token => !structuralAfter.includes(token));
        reasons.push(`a link/shortcode/asset changed (removed ${removed.join(", ") || "none"}; added ${added.join(", ") || "none"})`);
    }

    if(scope === "rulebook")
    {
        const headingsBefore = headingsOf(before);
        const headingsAfter = headingsOf(after);
        if(headingsBefore.join("|") !== headingsAfter.join("|"))
        {
            reasons.push("a heading changed; section structure is part of the rules");
        }
    }

    // A rulebook edit may rephrase, but it must stay recognisably the same text. Marketing copy is
    // meant to be rewritten; there the facts (numbers, links) are the guard, not the wording.
    const similarity = jaccard(wordsOf(before), wordsOf(after));
    const minimum = scope === "rulebook" ? 0.45 : 0.12;
    if(similarity < minimum)
    {
        reasons.push(`the rewrite keeps only ${(similarity * 100).toFixed(0)}% of the original wording ` +
            `(a ${scope} rewrite must keep at least ${(minimum * 100).toFixed(0)}%)`);
    }

    const ratio = after.trim().length / Math.max(1, before.trim().length);
    const [low, high] = scope === "rulebook" ? [0.55, 1.5] : [0.35, 2.0];
    if(ratio < low || ratio > high)
    {
        reasons.push(`the replacement is ${(ratio * 100).toFixed(0)}% of the original length ` +
            `(allowed ${(low * 100).toFixed(0)}–${(high * 100).toFixed(0)}%)`);
    }

    if(scope === "rulebook")
    {
        const itemsBefore = listItems(before);
        const itemsAfter = listItems(after);
        if(itemsAfter < itemsBefore)
        {
            warnings.push(`the number of list items dropped from ${itemsBefore} to ${itemsAfter}; make sure no rule or exception was folded away`);
        }
    }

    return { ok: reasons.length === 0, reasons, warnings };
};

export interface ReviewEdit
{
    id: string;
    text: string;
    reason?: string;
}

export interface ReviewFile
{
    edits?: ReviewEdit[];
    designSuggestions?: string[];
    marketingSuggestions?: string[];
}
