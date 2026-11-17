// Markdown helpers used by the text review: split a rulebook/page into sections with stable ids,
// and turn formatted prose into the plain sentences the checks look at.

export interface Section
{
    id: string;
    heading: string;
    level: number;
    // body-relative line numbers (0-based, inclusive start / exclusive end)
    startLine: number;
    endLine: number;
    text: string;
}

export const slugify = (text:string) =>
    text.toLowerCase()
        .replace(/`|\*|_|\[|\]|\(|\)|#|>|"/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 60) || "section";

const headingRe = /^(#{1,6})\s+(.*?)\s*#*\s*$/;

export const sectionsOf = (body:string) : Section[] =>
{
    const lines = body.split(/\r?\n/);
    const marks:{ index:number, level:number, heading:string }[] = [];

    let inFence = false;
    for(let i = 0; i < lines.length; i++)
    {
        if(/^\s*```/.test(lines[i])) { inFence = !inFence; continue; }
        if(inFence) { continue; }
        const match = lines[i].match(headingRe);
        if(match) { marks.push({ index: i, level: match[1].length, heading: match[2] }); }
    }

    if(marks.length === 0)
    {
        return [{ id: "intro", heading: "", level: 0, startLine: 0, endLine: lines.length, text: body }];
    }

    const out:Section[] = [];
    const used = new Map<string, number>();

    const push = (heading:string, level:number, start:number, end:number) =>
    {
        const base = heading.length > 0 ? slugify(heading) : "intro";
        const count = used.get(base) ?? 0;
        used.set(base, count + 1);
        out.push({
            id: count === 0 ? base : `${base}-${count + 1}`,
            heading,
            level,
            startLine: start,
            endLine: end,
            text: lines.slice(start, end).join("\n"),
        });
    };

    if(marks[0].index > 0) { push("", 0, 0, marks[0].index); }
    for(let i = 0; i < marks.length; i++)
    {
        const start = marks[i].index;
        const end = i + 1 < marks.length ? marks[i + 1].index : lines.length;
        push(marks[i].heading, marks[i].level, start, end);
    }
    return out;
};

// Replace one section (heading line included) and return the new body.
export const replaceSection = (body:string, section:Section, replacement:string) =>
{
    const eol = body.includes("\r\n") ? "\r\n" : "\n";
    const lines = body.split(/\r?\n/);
    const before = lines.slice(0, section.startLine);
    const after = lines.slice(section.endLine);
    const middle = replacement.split(/\r?\n/);
    return [...before, ...middle, ...after].join(eol);
};

// Formatting that carries no meaning for the text checks: shortcodes, HTML, emphasis, link targets.
export const stripToProse = (text:string) =>
{
    return text
        .replace(/\{\{[<%][\s\S]*?[>%]\}\}/g, " ")
        .replace(/<[^>]+>/g, " ")
        .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
        .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
        .replace(/[`*_~]+/g, "")
        .replace(/^\s*>\s?/gm, "")
        .replace(/\s+/g, " ")
        .trim();
};

export const paragraphsOf = (text:string) : string[] =>
{
    return text
        .split(/\n\s*\n/)
        .map(block => block.trim())
        .filter(block => block.length > 0);
};

// Prose paragraphs only: a block that is just an image, a shortcode or a div is not prose to review.
export const proseParagraphsOf = (text:string) : string[] =>
{
    return paragraphsOf(text).filter(block =>
    {
        const plain = stripToProse(block);
        return plain.split(/\s+/).filter(Boolean).length >= 4;
    });
};

export const sentencesOf = (text:string) : string[] =>
{
    const plain = stripToProse(text);
    return plain
        .split(/(?<=[.!?])\s+(?=[A-Z"'(_])/)
        .map(sentence => sentence.trim())
        .filter(sentence => sentence.length > 0);
};

export const wordsOf = (text:string) : string[] =>
    stripToProse(text).toLowerCase().match(/[a-z0-9']+/g) ?? [];

export const wordCount = (text:string) => wordsOf(text).length;

export const normalizeSentence = (text:string) =>
    stripToProse(text).toLowerCase().replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();

// Levenshtein distance, capped: only used for "is this word one keystroke away from a word we
// already use", so anything above 2 can stop immediately.
export const editDistance = (a:string, b:string, cap = 2) : number =>
{
    if(a === b) { return 0; }
    if(Math.abs(a.length - b.length) > cap) { return cap + 1; }
    let previous = Array.from({ length: b.length + 1 }, (_, i) => i);
    for(let i = 1; i <= a.length; i++)
    {
        const current = [i];
        let best = i;
        for(let j = 1; j <= b.length; j++)
        {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            const value = Math.min(previous[j] + 1, current[j - 1] + 1, previous[j - 1] + cost);
            current.push(value);
            best = Math.min(best, value);
        }
        if(best > cap) { return cap + 1; }
        previous = current;
    }
    return previous[b.length];
};
