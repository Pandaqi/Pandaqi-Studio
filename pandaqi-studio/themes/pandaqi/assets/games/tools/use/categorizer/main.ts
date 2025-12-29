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

const loadListDisplays = () =>
{
    // first just create the entire display once
    const listDisplay = document.createElement("div");
    listDisplay.classList.add("list-display-container");

    for(const [keyMain,dataMain] of Object.entries(LISTS))
    {
        const section = document.createElement("section");

        const keys = Object.keys(dataMain.list);
        const numElements = keys.length;
        if(dataMain.sort) { keys.sort(); } // javascript automatically sorts alphabetically this way

        const header = document.createElement("h2");
        header.innerHTML = capitalize(keyMain) + " (" + numElements + ")";
        header.id = urlize(keyMain);
        section.appendChild(header);

        const desc = document.createElement("p");
        desc.innerHTML = dataMain.desc;
        section.appendChild(desc);

        const content = document.createElement("table");
        section.appendChild(content);

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

        listDisplay.appendChild(section);
    }

    // then assign it (duplicated) to all nodes who want it
    const nodes = Array.from(document.getElementsByClassName("list-display")) as HTMLElement[];
    for(const node of nodes)
    {
        node.appendChild(listDisplay.cloneNode(true));
    }
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