// A deliberately small YAML-front-matter reader/writer.
//
// The project's pages are hand-edited and diffs matter, so this never re-serialises the whole
// block: it edits lines in place, keeps the file's own line endings, and leaves every field it
// was not asked about exactly as it was. It only understands what the project actually uses:
// scalars, inline lists (`[a, b]`) and block lists (`- a`).

export type Eol = "\n" | "\r\n";

export interface Document
{
    hasFrontmatter: boolean;
    eol: Eol;
    frontmatter: string;
    body: string;
}

export const splitDocument = (text:string) : Document =>
{
    const eol:Eol = text.includes("\r\n") ? "\r\n" : "\n";
    const lines = text.split(/\r?\n/);
    if((lines[0] ?? "").trim() !== "---") { return { hasFrontmatter: false, eol, frontmatter: "", body: text }; }

    let end = -1;
    for(let i = 1; i < lines.length; i++)
    {
        if(lines[i].trim() === "---") { end = i; break; }
    }
    if(end < 0) { return { hasFrontmatter: false, eol, frontmatter: "", body: text }; }

    return {
        hasFrontmatter: true,
        eol,
        frontmatter: lines.slice(1, end).join(eol),
        body: lines.slice(end + 1).join(eol),
    };
};

export const joinDocument = (doc:Document, frontmatter:string, body:string) =>
{
    if(!doc.hasFrontmatter) { return body; }
    return `---${doc.eol}${frontmatter}${doc.eol}---${doc.eol}${body}`;
};

const escapeKey = (key:string) => key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const KEY_RE = (key:string) => new RegExp(`^${escapeKey(key)}\\s*:`);

const unquote = (value:string) =>
{
    const trimmed = value.trim();
    if(trimmed.length >= 2 && ((trimmed.startsWith("\"") && trimmed.endsWith("\"")) || (trimmed.startsWith("'") && trimmed.endsWith("'"))))
    {
        return trimmed.slice(1, -1);
    }
    return trimmed;
};

export const fieldIndex = (lines:string[], key:string) => lines.findIndex(line => KEY_RE(key).test(line));

// The value of a scalar field, or null when it is absent (or a block list, which has no scalar).
export const readField = (lines:string[], key:string) : string | null =>
{
    const index = fieldIndex(lines, key);
    if(index < 0) { return null; }
    const value = lines[index].replace(KEY_RE(key), "").trim();
    return value.length > 0 ? unquote(value) : null;
};

// A list field, accepting both `[a, b]` and the `- a` block form.
export const readListField = (lines:string[], key:string) : string[] =>
{
    const index = fieldIndex(lines, key);
    if(index < 0) { return []; }

    const inline = lines[index].replace(KEY_RE(key), "").trim();
    if(inline.startsWith("["))
    {
        const inner = inline.replace(/^\[/, "").replace(/\]$/, "");
        return inner.split(",").map(unquote).filter(Boolean);
    }
    if(inline.length > 0) { return [unquote(inline)]; }

    const out:string[] = [];
    for(let i = index + 1; i < lines.length; i++)
    {
        const line = lines[i];
        if(!/^\s*-/.test(line)) { break; }
        const value = unquote(line.replace(/^\s*-\s*/, ""));
        if(value) { out.push(value); }
    }
    return out;
};

const continuationEnd = (lines:string[], index:number) =>
{
    let end = index + 1;
    while(end < lines.length && (/^\s*-/.test(lines[end]) || (/^\s+/.test(lines[end]) && lines[end].trim().length > 0)))
    {
        end++;
    }
    return end;
};

export const setField = (lines:string[], key:string, value:string) : string[] =>
{
    const next = [...lines];
    const index = fieldIndex(next, key);
    if(index >= 0)
    {
        const end = continuationEnd(next, index);
        next.splice(index, end - index, `${key}: ${value}`);
        return next;
    }
    next.push(`${key}: ${value}`);
    return next;
};

export const setListField = (lines:string[], key:string, values:string[]) : string[] =>
{
    const next = [...lines];
    const index = fieldIndex(next, key);
    const blockStyle = index >= 0
        && next[index].replace(KEY_RE(key), "").trim().length === 0
        && (index + 1 < next.length && /^\s*-/.test(next[index + 1]));

    const body = blockStyle
        ? values.map(value => `  - ${value}`)
        : [`${key}: [${values.join(", ")}]`];

    if(index >= 0)
    {
        const end = continuationEnd(next, index);
        if(blockStyle) { next.splice(index, end - index, key + ":", ...body); }
        else { next.splice(index, end - index, ...body); }
        return next;
    }

    next.push(...body);
    return next;
};

export const removeField = (lines:string[], key:string) : string[] =>
{
    const next = [...lines];
    const index = fieldIndex(next, key);
    if(index < 0) { return next; }
    const end = continuationEnd(next, index);
    next.splice(index, end - index);
    return next;
};

