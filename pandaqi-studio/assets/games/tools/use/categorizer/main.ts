import { shuffle } from "lib/pq-games";
import { GameType, LISTS } from "./dict";

const urlize = (str:string) =>
{
    return str.toLowerCase().replace(" ", "-").replace("_", "-");
}

const humanize = (str:string) =>
{
    const arrInput = str.split("_");
    const arrOutput = [];
    for(const elem of arrInput)
    {
        arrOutput.push( capitalize(elem) );
    }
    return arrOutput.join(" ");
}

const capitalize = (str:string) =>
{
    return str.slice(0,1).toUpperCase() + str.slice(1);
}

// Use the element that's already on the page if it exists; otherwise create it.
// The page ships a section + heading per list, so its anchor links work without waiting for (or having) JS.
const getOrCreateChild = <T extends HTMLElement>(parent:HTMLElement, selector:string, tagName:string) =>
{
    const existing = parent.querySelector(selector) as T;
    if(existing) { return existing; }

    const created = document.createElement(tagName) as T;
    parent.appendChild(created);
    return created;
}

const loadListDisplay = (node:HTMLElement) =>
{
    for(const [keyMain,dataMain] of Object.entries(LISTS))
    {
        const keys = Object.keys(dataMain.list);
        const numElements = keys.length;
        if(dataMain.sort) { keys.sort(); } // javascript automatically sorts alphabetically this way

        // the section + heading come straight from the page, so only their contents are filled in here
        const section = getOrCreateChild<HTMLElement>(node, "section#" + urlize(keyMain), "section");
        section.id = urlize(keyMain);

        const header = getOrCreateChild<HTMLElement>(section, "h2", "h2");
        header.innerHTML = capitalize(keyMain) + " (" + numElements + ")";

        const desc = getOrCreateChild<HTMLElement>(section, "p", "p");
        desc.innerHTML = dataMain.desc;

        const content = getOrCreateChild<HTMLElement>(section, "table", "table");

        for(const key of keys)
        {
            const data = dataMain.list[key];

            const row = document.createElement("tr");
            row.id = urlize(key);

            const cellName = document.createElement("td");
            let nameHTML = "<span>" + humanize(key) + "</span>";
            if(data.type)
            {
                let str = "Video Games"
                if(data.type == GameType.BOARD) { str = "Board Games"; }
                nameHTML += "<span class='entry-type'>(" + str + ")</span>";
            }

            cellName.innerHTML = nameHTML;
            row.appendChild(cellName);

            const cellDesc = document.createElement("td");
            cellDesc.innerHTML = data.desc;
            row.appendChild(cellDesc);

            content.appendChild(row);
        }

    }
}

// fill every list container on the page (there's only one, but this keeps it flexible)
const loadListDisplays = () =>
{
    const nodes = Array.from(document.getElementsByClassName("list-display")) as HTMLElement[];
    for(const node of nodes) { loadListDisplay(node); }
}

const loadDrawRandoms = () =>
{
    const nodes = Array.from(document.getElementsByClassName("draw-random")) as HTMLElement[];
    const inputKeys = Object.keys(LISTS);
    for(const node of nodes)
    {
        const nodeOutput = node.getElementsByClassName("result-draw-random")[0];
        const btn = node.getElementsByClassName("button-draw-random")[0];
        btn.addEventListener("click", (ev) => 
        {
            // collect all input
            const dataInput:Record<string,number> = {};
            for(const key of inputKeys)
            {
                const inp = node.getElementsByClassName("input-" + key)[0] as HTMLInputElement;
                let val;
                if(inp.type == "number") { val = parseInt(inp.value) ?? 1 }
                else if(inp.type == "checkbox") { val = inp.checked ? 1 : 0; }
                if(isNaN(val)) { val = 0; }
                dataInput[key] = val;
            }

            // generate all output
            const dataOutput:Record<string, string[]> = {};
            for(const [key,freq] of Object.entries(dataInput))
            {
                if(freq <= 0) { dataOutput[key] = []; continue; }
                const options = shuffle( Object.keys(LISTS[key].list) );
                const freqSanitized = Math.min(freq, options.length);
                const optionsPicked = options.slice(0, freqSanitized);

                // convert to clickable links that move you to the explanation
                const finalOutput:string[] = [];
                for(const option of optionsPicked)
                {
                    finalOutput.push( '<a href="#' + urlize(option) + '">' + option + '</a>' );
                }

                dataOutput[key] = finalOutput;
            }

            // display nicely
            const htmlOutput:string[] = [];
            for(const [key,list] of Object.entries(dataOutput))
            {
                if(list.length <= 0) { continue; }
                htmlOutput.push("<div><strong>" + key.toUpperCase() + ":</strong> " + list.join(", ") + "</div>");
            }
            nodeOutput.innerHTML = htmlOutput.join("");
        });
    }
}

loadListDisplays();
loadDrawRandoms();