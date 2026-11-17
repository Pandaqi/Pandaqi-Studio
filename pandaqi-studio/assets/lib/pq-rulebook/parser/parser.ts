import { RulebookParams } from "../rulebook";
import { marked } from "./marked.esm";

const DEFAULT_RULEBOOK_CONTENT_CLASS = "rulebook-content";

export const parseMarkdown = (s?:string) : string =>
{
    return marked.parse(s ?? "");
}

const containerNodeOf = (container:string|HTMLElement|undefined) : HTMLElement|null =>
{
    if(!container) { return null; }
    return (typeof container == "string") ? document.getElementById(container) : container;
}

// Where the rulebook content lives, and in which form.
//
// Every step has a fallback, so a page that changes its markup (a different id, no wrapper at all,
// nothing but `text`) still renders instead of throwing on a missing node. The old version called
// `node.classList` on the result of `getElementById`, so one renamed id turned the whole rulebook —
// and the script that loaded it — into a crash.
export const parseInput = (params:RulebookParams) : HTMLElement =>
{
    if(params._rulebook) { return params._rulebook; }

    const hasText = (params.text ?? "").length > 0;
    const explicit = containerNodeOf(params.container);

    // Only the default container is taken to hold rendered HTML. Anything handed over explicitly may
    // still be Markdown, which is what the library has always converted.
    const node = explicit ?? (hasText ? null : document.getElementById(DEFAULT_RULEBOOK_CONTENT_CLASS));

    if(!node)
    {
        const created = document.createElement("article");
        created.innerHTML = parseMarkdown(params.text);
        created.classList.add(DEFAULT_RULEBOOK_CONTENT_CLASS);
        document.body.appendChild(created);
        return created;
    }

    if(hasText) { node.innerHTML = parseMarkdown(params.text); }
    else if(explicit) { node.innerHTML = parseMarkdown(node.innerHTML); }

    node.classList.add(DEFAULT_RULEBOOK_CONTENT_CLASS);
    return node;
}
