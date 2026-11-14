import { isNumber } from "../tools/numbers/checks";
import { GameConfig } from "./configuration";
import { getDefaultSettings } from "./defaults";

export enum SettingType
{
    GROUP = "group",
    ENUM = "enum",
    CHECK = "checkbox",
    MULTI = "multi",
    NUMBER = "number",
    TEXT = "text",
    INPUT = "input",
    RADIO = "radio", // @TODO: not implemented yet because practically same as enum
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

// Multi-select controls are a div of checkboxes, so their individual checkboxes carry no id (the div carries the path).
// Remember the declared value for each checkbox, because `dataset.value` would turn numbers/booleans into strings.
// (`readSettingsFromHTML` in ./read.ts needs this map too.)
export const MULTI_VALUES = new WeakMap<HTMLInputElement, any>();

const convertRecursive = (config:Record<string,any>, path:string, container:HTMLElement) =>
{
    for(const [key,data] of Object.entries(config))
    {
        if(typeof data !== "object") { continue; }
        const isProtectedProperty = ["meta"].includes(key);
        if(isProtectedProperty) { continue; }

        const newPath = path.length <= 0 ? key : `${path}.${key}`;
        if(data.type == SettingType.GROUP) {
            const newNode = document.createElement("div");
            newNode.classList.add("settings-group");
            newNode.dataset.folded = data.folded ? "true" : "false";

            const header = document.createElement("div");
            header.innerHTML = `Group: ${key}`;
            header.classList.add("settings-group-header")
            newNode.appendChild(header);

            const content = document.createElement("div");
            content.classList.add("settings-group-content");
            newNode.appendChild(content);

            container.appendChild(newNode);
            convertRecursive(data, newPath, content);
        } else {
            const newNode = convertSettingToHTML(newPath, data);
            container.appendChild(newNode);
        }
        
    }
}

export const foldGroup = (node:HTMLElement) =>
{
    const content = node.getElementsByClassName("settings-group-content")[0] as HTMLElement;

    node.dataset.folded = "true";
    content.style.display = "none";
}

export const unfoldGroup = (node:HTMLElement) =>
{
    const content = node.getElementsByClassName("settings-group-content")[0] as HTMLElement;

    node.dataset.folded = "false";
    content.style.display = "flex";
}

export const makeGroupsFoldable = (container:HTMLElement) =>
{
    const nodes = Array.from(container.getElementsByClassName("settings-group")) as HTMLElement[];

    for(const node of nodes)
    {
        const header = node.getElementsByClassName("settings-group-header")[0] as HTMLElement;

        // simple fold/unfold system through clicks on the header
        header.addEventListener("click", (ev) => 
        {
            if(node.dataset.folded == "true") { return unfoldGroup(node); }
            return foldGroup(node);
        });

        // do a fake click to start folded (if needed)
        if(node.dataset.folded == "true")
        {
            foldGroup(node);
        }
    }
}

export const convertSettingsToHTML = (config:GameConfig, addDefaults = false) =>
{
    const container = document.createElement("div");
    container.classList.add("settings-container");
    if(addDefaults) { Object.assign(config._settings.defaults, getDefaultSettings(config)); }
    convertRecursive(config._settings, "", container);
    makeGroupsFoldable(container);
    return container;
}

export const convertSettingToHTML = (path:string, data:SettingConfig) =>
{
    const container = document.createElement("div");
    container.classList.add("settings-element");

    const key = path.split(".").pop();
    const label = document.createElement("label");
    container.appendChild(label);
    label.innerHTML = data.label ?? key; 
    label.setAttribute("for", path);

    if(data.remark)
    {
        label.innerHTML += ` <span class="settings-remark" title="${data.remark}">(?)</span>`;
    }

    const type = data.type ?? SettingType.CHECK;
    const defaultValue = data.default ?? data.value ?? 0;
    
    let elem;

    if(type == SettingType.ENUM)
    {
        elem = document.createElement("select");
        for(const value of (data.values ?? []))
        {
            const option = document.createElement("option");
            option.value = value;
            option.innerHTML = value;
            elem.appendChild(option);

            const isDefault = value == defaultValue;
            if(isDefault) { option.selected = true; }
        }
    }

    if(type == SettingType.CHECK)
    {
        elem = document.createElement("input");
        elem.type = "checkbox";
        elem.checked = defaultValue ?? false;
    }

    if(type == SettingType.MULTI)
    {
        elem = document.createElement("div");
        elem.classList.add("settings-input-multi");

        // MULTI settings usually declare `value`, not `default`; without this fallback every
        // checkbox starts unchecked and the setting reads back as an empty list
        const declaredDefaults = data.default ?? data.value ?? [];
        const defaultValues = Array.isArray(declaredDefaults) ? declaredDefaults : [declaredDefaults];
        const values = data.values ?? [];
        for(const value of values)
        {
            const cont = document.createElement("div");
            elem.appendChild(cont);

            const label = document.createElement("label");
            cont.appendChild(label);
            label.innerHTML = value;

            const inp = document.createElement("input");
            cont.appendChild(inp);
            inp.type = "checkbox";
            inp.checked = defaultValues.includes(value);
            inp.dataset.value = String(value);
            // `dataset.default` is what `Reset to Defaults` restores; without it every checkbox of a MULTI
            // group was reset to unchecked instead of to the value the setting declared
            inp.dataset.default = inp.checked ? "true" : "false";
            MULTI_VALUES.set(inp, value);
        }
    }

    if(type == SettingType.NUMBER)
    {
        elem = document.createElement("input");
        elem.type = "number";
        elem.min = data.min ?? 0;
        elem.max = data.max ?? 100;
        elem.step = data.step ?? 1;
        elem.value = defaultValue ?? 0;
    }

    if(type == SettingType.TEXT)
    {
        elem = document.createElement("input");
        elem.type = "text";
        elem.placeholder = data.placeholder ?? "... text here ...";
        elem.value = defaultValue ?? "";
    }

    if(type == SettingType.INPUT)
    {
        elem = document.createElement("input");
        elem.type = "file";
        elem.multiple = true;
        elem.accept = "audio/*,video/*,image/*,.woff2,.woff,.otf,.ttf";
    }

    if(!elem)
    {
        console.error(`[Settings] Unknown setting type "${type}" for "${path}"; this control cannot be rendered.`);
        return container;
    }

    elem.dataset.default = defaultValue;
    elem.name = path;
    elem.id = path;
    container.appendChild(elem);

    return container;
}
