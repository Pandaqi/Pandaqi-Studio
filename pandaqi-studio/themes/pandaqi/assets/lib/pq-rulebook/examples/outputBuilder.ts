export class OutputBuilder
{
    node: HTMLElement;

    constructor(node: HTMLElement)
    {
        this.node = node;
    }

    reset()
    {
        this.node.innerHTML = '';
    }

    createParagraph(txt: string)
    {
        const p = document.createElement("p");
        p.innerHTML = txt;
        return p;
    }

    createSpan(txt: string)
    {
        const s = document.createElement("span");
        s.innerHTML = txt;
        return s;
    }

    addParagraph(txt:string)
    {
        return this.addNode(this.createParagraph(txt));
    }

    addNode(node: HTMLElement)
    {
        this.node.appendChild(node);
        return this.node;
    }

    addParagraphList(txts: string[], numbered = false)
    {
        const nodes = []
        for(const txt of txts)
        {
            nodes.push(this.createSpan(txt));
        }
        return this.addNodeList(nodes, numbered);
    }

    addParagraphListNumbered(txts: string[])
    {
        return this.addParagraphList(txts, true);
    }

    addFlexList(nodes: HTMLElement[])
    {
        const cont = document.createElement("div");
        this.node.appendChild(cont);

        cont.style.display = "flex";
        cont.style.justifyContent = "center";
        cont.style.alignContent = "center";
        cont.style.gap = "1em";
        cont.style.flexWrap = "wrap";

        for(const node of nodes)
        {
            cont.appendChild(node);
        }
        return cont;
    }

    addNodeList(nodes: HTMLElement[], numbered = false)
    {
        let listNode: HTMLUListElement
        if(numbered) { listNode = document.createElement("ol"); }
        else { listNode = document.createElement("ul"); }
        
        this.node.appendChild(listNode);
        for(const node of nodes)
        {
            const li = document.createElement("li");
            li.appendChild(node);
            listNode.appendChild(li);
        }
        return listNode;
    }
}