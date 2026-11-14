import { isNumber } from "../tools/numbers/checks";
import { MULTI_VALUES, SettingType } from "./html";

export const readSettingsFromHTML = (node:HTMLElement) =>
{
    // MULTI settings are a div (which holds the path id) with id-less checkboxes inside; everything else is a real input/select
    const settingsElements = Array.from(node.querySelectorAll("input[id],select[id],div.settings-input-multi[id]"));
    const obj = {};
    for(const elem of settingsElements)
    {
        // index into the object
        const path = elem.id.split(".");
        const key = path.pop();
        let curPosition = obj;
        for(const part of path)
        {
            if(!curPosition[part]) { curPosition[part] = {}; }
            curPosition = curPosition[part];
        }
        curPosition[key] = {};

        // then place the value at the right place
        let value;
        if(elem instanceof HTMLInputElement) {
            if(elem.type == "checkbox") { value = elem.checked; }
            else if(elem.type == "file") { value = elem.files; }
            else { value = elem.value }
        } else if(elem instanceof HTMLSelectElement) {
            value = elem.options[elem.selectedIndex].value;
        } else if(elem.classList.contains("settings-input-multi")) {
            const subInputs = Array.from(elem.querySelectorAll("input")) as HTMLInputElement[];
            const list = [];
            for(const input of subInputs)
            {
                if(!input.checked) { continue; }
                list.push(MULTI_VALUES.has(input) ? MULTI_VALUES.get(input) : input.dataset.value);
            }
            value = list;
        }

        // all values are strings now; turn numbers back into numbers
        // (integers don't exist in JS; so parseFloat for all is fine)
        if(isNumber(value)) { value = parseFloat(value); }

        curPosition[key].value = value;
    }

    return obj;
}

// Write the values the DOM holds into the settings tree the config declared, changing ONLY `.value`.
// A shallow `Object.assign(config._settings, values)` replaced every group with `{key:{value}}`, which threw
// away `type`, `label`, `values`, `min`/`max`, `folded` and `default`: the panel could then never be rebuilt,
// `Reset to Defaults` had nothing but the DOM to go on, and any code reading `_settings.<path>.type` after a
// run saw `undefined`.
const mergeValuesInto = (target:Record<string,any>, source:Record<string,any>) =>
{
    for(const [key,data] of Object.entries(source))
    {
        if(data === null || typeof data !== "object") { continue; }

        const isLeaf = Object.prototype.hasOwnProperty.call(data, "value");
        if(isLeaf)
        {
            const existing = target[key];
            if(existing !== null && typeof existing == "object" && existing.type !== SettingType.GROUP)
            {
                existing.value = data.value;
            }
            else
            {
                target[key] = { value: data.value };
            }
            continue;
        }

        target[key] = target[key] ?? {};
        mergeValuesInto(target[key], data);
    }
}

export const applySettingsValues = (node:HTMLElement, settings:Record<string,any>) =>
{
    const values = readSettingsFromHTML(node);
    mergeValuesInto(settings, values);
    return settings;
}

export const resetSettings = (node:HTMLElement) =>
{
    const settingsElements = Array.from(node.querySelectorAll("input,select"));
    for(const elem of settingsElements)
    {
        if(elem instanceof HTMLSelectElement)
        {
            elem.value = elem.dataset.default;
        }

        if(elem instanceof HTMLInputElement)
        {
            if(elem.type == "checkbox") { elem.checked = (elem.dataset.default == "true"); }
            else if(elem.type == "number" || elem.type == "text") { elem.value = elem.dataset.default; }
            else if(elem.type == "file") { elem.value = null; }
        }
    }
}
