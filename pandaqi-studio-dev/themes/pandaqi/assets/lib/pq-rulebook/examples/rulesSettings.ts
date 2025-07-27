
// TO DO: Some day, all of this needs to generalized and put into PQ_GAMES
// (most of this would be in tools > dom, perhaps the main settings under website folder)
export enum SettingsType
{
    TEXT,
    NUMBER,
    RADIO,
    CHECKBOX,
    ENUM,
}

export interface SettingsParams
{
    id?: string,
    type?: SettingsType,
    label?: string,
    default?: string,
    values?: string|string[],
    keys?: string|string[]
}

export class RulesSettings
{
    nodes:Record<string,HTMLElement>
    node:HTMLElement

    constructor()
    {
        this.nodes = {};
        this.node = document.createElement("div");
        this.node.classList.add("rules-settings");
    }

    getContainer() { return this.node; }
    add(params:SettingsParams)
    {
        const id = params.id ?? "default";
        const newNode = this.createHTML(params);
        this.node.appendChild(newNode);
        this.nodes[id] = newNode;
        return newNode;
    }

    get(id:string)
    {
        const nodeContainer = this.nodes[id];
        if(!nodeContainer) { console.error("Can't read non-existing setting " + id); return null; }

        const inputs = nodeContainer.getElementsByClassName("rules-settings-input");
        if(inputs.length <= 0) { console.error("Setting with id " + id + " has no readable inputs!"); return null; }

        const nodeInput : HTMLElement = inputs[0] as HTMLElement;

        if(nodeInput instanceof HTMLInputElement) {
            if(nodeInput.type == "text") { return nodeInput.value; }
            else if(nodeInput.type == "number") { return parseFloat(nodeInput.value); }
            else if(nodeInput.type == "checkbox") { return nodeInput.checked; }
        
        } else if(nodeInput instanceof HTMLSelectElement) {
            return nodeInput.options[nodeInput.selectedIndex].value;
            
        }
        
        if(nodeInput.dataset.type == "radio") {
            const elems : HTMLInputElement[] = Array.from(nodeInput.querySelectorAll('input[name="' + id + '"]'));
            for(const elem of elems)
            {
                if(!elem.checked) { continue; }
                return elem.value;
            }
        }

        return null;
    }

    createHTML(params:SettingsParams)
    {
        const div = document.createElement("div");
        const id = params.id;
        div.id = "rules-setting-" + id;
        div.classList.add("rules-setting-entry");

        const label = document.createElement("label");
        label.innerHTML = params.label ?? id;
        label.setAttribute("for", id);
        div.appendChild(label);

        const values = params.values ?? [];
        const keys = params.keys ?? values;

        const def = params.default ?? values[0];

        let input;
        const type = params.type ?? SettingsType.TEXT;
        if(type == SettingsType.TEXT) {
            input = document.createElement("input");
            input.type = "text";
            input.value = def;
        } else if(type == SettingsType.NUMBER) {
            input = document.createElement("input");
            input.type = "number";
            input.value = def;
        } else if(type == SettingsType.CHECKBOX) {
            input = document.createElement("input");
            input.type = "checkbox";
            if(def) { input.checked = true; } 
        } else if(type == SettingsType.RADIO) {

            input = document.createElement("div");
            input.dataset.type = "radio";
            for(let i = 0; i < values.length; i++)
            {
                const key = keys[i];
                const value = values[i];
                const isSelected = (value == def);

                const span = document.createElement("span");
                const label = document.createElement("label");
                label.innerHTML = value;
                label.setAttribute("for", key);
                span.appendChild(label);

                const radio = document.createElement("input");
                radio.type = "radio";
                radio.name = id;
                radio.id = key;
                radio.value = key;
                if(isSelected) { radio.checked = true; }
                span.appendChild(radio);

                input.appendChild(span);
            }

        } else if(type == SettingsType.ENUM) {

            input = document.createElement("select");
            input.id = id;
            input.name = id;
            for(let i = 0; i < values.length; i++)
            {
                const value = values[i];
                const isSelected = (value == def);

                const option = document.createElement("option");
                option.innerHTML = value;
                option.value = keys[i];
                if(isSelected) { option.selected = true; }
                input.appendChild(option);
            }
        }

        input.classList.add("rules-settings-input");
        div.appendChild(input);
        return div;
    }
}