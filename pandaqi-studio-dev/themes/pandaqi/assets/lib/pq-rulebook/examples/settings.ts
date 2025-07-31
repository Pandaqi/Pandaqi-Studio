export enum SettingType
{
    GROUP = "group",
    ENUM = "enum",
    CHECK = "checkbox",
    NUMBER = "number",
    TEXT = "text",
    INPUT = "input",
    RADIO = "radio",
}

export interface SettingConfig
{
    id?: string,

    type?: SettingType,
    label?: string,
    default?: any,
    remark?: string,
    placeholder?: string,

    value?: any,
    values?: any[],
    keys?: any[],

    min?: number,
    max?: number,
    step?: number,
}

export class RulebookSettings
{
    nodes:Record<string,HTMLElement>
    node:HTMLElement

    constructor()
    {
        this.nodes = {};
        this.node = document.createElement("div");
        this.node.classList.add("rulebook-settings");
    }

    getContainer() { return this.node; }
    addMultiple(params:Record<string,SettingConfig>)
    {
        for(const [key,data] of Object.entries(params))
        {
            data.id = key;
            this.add(data);
        }
        return this;
    }

    add(params:SettingConfig)
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
        if(!nodeContainer) { console.error(`Can't read non-existing setting ${id}`); return null; }

        const inputs = nodeContainer.getElementsByClassName("rules-settings-input");
        if(inputs.length <= 0) { console.error(`Setting with id ${id} has no readable inputs!`); return null; }

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

    createHTML(params:SettingConfig)
    {
        const div = document.createElement("div");
        const id = params.id;
        div.id = "rulebook-setting-" + id;
        div.classList.add("rulebook-setting-entry");

        const label = document.createElement("label");
        label.innerHTML = params.label ?? id;
        label.setAttribute("for", id);
        div.appendChild(label);

        const values = params.values ?? [];
        const keys = params.keys ?? values;

        const def = params.default ?? values[0];

        let input;
        const type = params.type ?? SettingType.TEXT;
        if(type == SettingType.TEXT) {
            input = document.createElement("input");
            input.type = "text";
            input.value = def;
        } else if(type == SettingType.NUMBER) {
            input = document.createElement("input");
            input.type = "number";
            input.value = def;
        } else if(type == SettingType.CHECK) {
            input = document.createElement("input");
            input.type = "checkbox";
            if(def) { input.checked = true; } 
        } else if(type == SettingType.RADIO) {

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

        } else if(type == SettingType.ENUM) {

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

        input.classList.add("rulebook-settings-input");
        div.appendChild(input);
        return div;
    }
}