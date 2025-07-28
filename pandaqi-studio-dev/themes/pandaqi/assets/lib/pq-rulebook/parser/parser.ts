import { RulebookParams } from "../rulebook";
import { marked } from "./marked.esm";

const DEFAULT_RULEBOOK_CONTENT_CLASS = "rulebook-content";

export const parseMarkdown = (s:string) : string =>
{
    return marked.parse(s);
}

export const parseInput = (params:RulebookParams) : HTMLElement =>
{
    const useExistingDefaultNode = !params.container && !params.text;
    let container = params.container;
    if(useExistingDefaultNode)
    {
        const node = document.getElementById(DEFAULT_RULEBOOK_CONTENT_CLASS);
        node.classList.add(DEFAULT_RULEBOOK_CONTENT_CLASS);
        return node;
    }

    if(container)
    {
        const node = (typeof container == "string") ? document.getElementById(container) : container;
        node.innerHTML = parseMarkdown(node.innerHTML);
        node.classList.add(DEFAULT_RULEBOOK_CONTENT_CLASS);
        return node;
    }

    const div = document.createElement("article");
    div.innerHTML = parseMarkdown(params.text);
    div.classList.add(DEFAULT_RULEBOOK_CONTENT_CLASS);
    document.body.appendChild(div);
    return div;
}