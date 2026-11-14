import type { Page } from "playwright-core";

export interface ControlInfo
{
    id: string;
    name: string;
    tag: string;
    type: string;
    options: string[];
    min: number | null;
    max: number | null;
    checked: boolean | null;
}

export const CONTROL_SELECTOR = ".settings-container input, .settings-container select, .settings-container .settings-input-multi";

// A MULTI setting is ONE control (the div that carries the dotted path id); its checkboxes are its values, not controls.
const isMultiGroup = (el:any) => !!el.classList?.contains("settings-input-multi");
const belongsToMultiGroup = (el:any) => !isMultiGroup(el) && !!el.closest(".settings-input-multi");

export const readControls = async (page:Page) : Promise<ControlInfo[]> =>
{
    return await page.$$eval(CONTROL_SELECTOR, (els) =>
    {
        return els
        .filter((el:any) => !!el.classList?.contains("settings-input-multi") || !el.closest(".settings-input-multi"))
        .map((el:any) =>
        {
            const tag = el.tagName.toLowerCase();
            return {
                id: el.id ?? "",
                name: el.name ?? "",
                tag,
                type: tag === "select" ? "select" : (el.type ?? ""),
                options: tag === "select" ? Array.from(el.options).map((o:any) => o.value) : [],
                min: el.min !== "" && el.min != null ? parseFloat(el.min) : null,
                max: el.max !== "" && el.max != null ? parseFloat(el.max) : null,
                checked: el.type === "checkbox" ? !!el.checked : null,
            };
        });
    });
}

export const applyProfile = async (page:Page, mode:"default"|"invert"|"seeded", seed = 1) : Promise<void> =>
{
    if(mode === "default") { return; }

    await page.evaluate(({ mode, seed }) =>
    {
        const container = document.querySelector(".settings-container");
        if(!container) { return; }

        const all = Array.from(container.querySelectorAll("input,select")) as any[];
        const controls = all.filter(el => el.type !== "file");
        const checks = controls.filter(el => el.type === "checkbox");

        // deterministic local rng for the "seeded" profile
        let a = (seed * 2654435761) >>> 0;
        const rand = () =>
        {
            a = (a + 0x6D2B79F5) | 0;
            let t = Math.imul(a ^ (a >>> 15), 1 | a);
            t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };

        if(mode === "invert")
        {
            // fixed rule: >=50% of checkboxes checked => uncheck everything, otherwise check everything
            const checked = checks.filter(el => el.checked).length;
            const mirror = checks.length > 0 && checked >= checks.length / 2;
            for(const el of checks) { el.checked = !mirror; }

            for(const el of controls)
            {
                if(el.tagName === "SELECT") { el.selectedIndex = el.options.length - 1; }
                else if(el.type === "number") { el.value = el.max ?? el.value; }
                else if(el.type === "text") { el.value = "audit"; }
            }
        }

        if(mode === "seeded")
        {
            for(const el of checks) { el.checked = rand() < 0.5; }
            for(const el of controls)
            {
                if(el.tagName === "SELECT") { el.selectedIndex = Math.floor(rand() * el.options.length); }
                else if(el.type === "number")
                {
                    const min = el.min !== "" ? parseFloat(el.min) : 0;
                    const max = el.max !== "" ? parseFloat(el.max) : 100;
                    const step = el.step !== "" ? parseFloat(el.step) : 1;
                    const span = Math.max(0, max - min);
                    const steps = Math.max(1, Math.floor(span / (step || 1)));
                    el.value = String(min + Math.floor(rand() * (steps + 1)) * (step || 1));
                }
            }
        }

        // keep-one rule: a group made only of checkboxes must keep at least one checked
        const groups = Array.from(container.querySelectorAll(".settings-group-content")) as HTMLElement[];
        for(const group of groups)
        {
            const inputs = Array.from(group.querySelectorAll("input")) as any[];
            if(inputs.length <= 0) { continue; }
            if(inputs.some(el => el.type !== "checkbox")) { continue; }
            if(inputs.some(el => el.checked)) { continue; }
            inputs[0].checked = true;
        }
    }, { mode, seed });
}

// stable fingerprint of the current settings state, to report ignored controls (--inert)
export const settingsSnapshot = async (page:Page) : Promise<Record<string,string>> =>
{
    return await page.$$eval(CONTROL_SELECTOR, (els) =>
    {
        const out:Record<string,string> = {};
        for(const el of els as any[])
        {
            const isMultiGroup = !!el.classList?.contains("settings-input-multi");

            // one stable key per MULTI control, listing the ticked values
            if(isMultiGroup)
            {
                out[el.id || "unnamed"] = Array.from(el.querySelectorAll("input"))
                    .map((input:any) => input.checked ? input.dataset.value : "")
                    .join(",");
                continue;
            }

            if(el.closest(".settings-input-multi")) { continue; }
            if(el.type === "file") { continue; }
            const key = el.id || el.name || "unnamed";
            out[key] = el.type === "checkbox" ? String(el.checked) : String(el.value);
        }
        return out;
    });
}
