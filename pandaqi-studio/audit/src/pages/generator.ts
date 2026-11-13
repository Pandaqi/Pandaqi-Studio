import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { ManifestEntry, PageResult, RenderInfo } from "../lib/types";
import type { Session } from "../lib/browser";
import { Checker } from "../lib/assert";
import { waitUntil, sleep } from "../lib/wait";
import { applyProfile, readControls, settingsSnapshot } from "../lib/settings";
import { slugOf } from "../manifest";

export interface GeneratorOptions
{
    baseUrl: string;
    artifactsRoot: string;
    timeoutMs: number;
    genTimeoutMs: number;
    seed: string;
    runs: number;
    inert: boolean;
    allowlist: string[];
}

const INK_MIN_GENERATOR = 0.001;
const MIN_PDF_BYTES = 5000;

const GENERATE_BUTTON = "div.settings-container > button";

const hashRenders = (renders:RenderInfo[]) =>
{
    const hasher = new Bun.CryptoHasher("sha1");
    for(const render of renders) { hasher.update(String(render.thumb ?? "")); }
    return hasher.digest("hex");
}

export const runGenerator = async (session:Session, entry:ManifestEntry, opts:GeneratorOptions) : Promise<PageResult> =>
{
    const started = Date.now();
    const checker = new Checker("generator");
    const slug = slugOf(entry.url);
    const artifacts:string[] = [];
    const profiles:string[] = ["default"];
    if(opts.runs >= 2) { profiles.push("invert"); }
    for(let i = 2; i < opts.runs; i++) { profiles.push(`seeded-${i}`); }

    const audited = await session.open(`${opts.baseUrl}${entry.url}?auditSeed=${encodeURIComponent(opts.seed)}`, {
        timeoutMs: opts.timeoutMs,
        artifactsDir: join(opts.artifactsRoot, slug, "default"),
        allowlist: opts.allowlist,
    });
    const page = audited.page;

    try
    {
        // MG-1
        const hasSettings = await waitUntil(async () => await page.locator("div.settings").count() > 0,
            Math.min(opts.timeoutMs, 20000));
        if(!hasSettings)
        {
            checker.fail("GEN_NO_SETTINGS", "div.settings never appeared: the bundle did not mount loadSettings",
                audited.errorMessages().slice(0, 3).join(" || "));
            return {
                url: entry.url, kind: entry.kind, contract: "generator", status: "fail",
                durationMs: Date.now() - started, failures: checker.failures, warnings: checker.warnings, artifacts,
            };
        }

        const title = (await page.locator("div.settings h1").first().textContent() ?? "").trim();
        checker.ok(title.length > 0, "GEN_NO_TITLE", "div.settings has an empty h1");

        const toolButtons = await page.locator("div.settings-tools button").count();
        checker.ok(toolButtons === 3, "GEN_NO_TOOLS", `div.settings-tools has ${toolButtons} buttons (want 3)`);

        const containerCount = await page.locator("div.settings-container").count();
        checker.ok(containerCount === 1, "GEN_NO_CONTAINER", `.settings-container count is ${containerCount} (want 1)`);

        const buttonCount = await page.locator(GENERATE_BUTTON).count();
        if(!checker.ok(buttonCount >= 1, "GEN_NO_BUTTON", `no generate button matches "${GENERATE_BUTTON}"`))
        {
            return {
                url: entry.url, kind: entry.kind, contract: "generator", status: "fail",
                durationMs: Date.now() - started, failures: checker.failures, warnings: checker.warnings, artifacts,
            };
        }

        // MG-2
        const controls = await readControls(page);
        const seen = new Set<string>();
        for(const control of controls)
        {
            if(!control.id || seen.has(control.id))
            {
                checker.fail("GEN_NO_ID",
                    `a ${control.tag}${control.type ? `[type=${control.type}]` : ""} control has ` +
                    (control.id ? `a duplicate id "${control.id}"` : "no id at all"),
                    control.name || "(unnamed)");
            }
            if(control.id) { seen.add(control.id); }
        }
        checker.ok(controls.length > 0, "GEN_NO_CONTROLS", "the settings container has no controls");

        const button = page.locator(GENERATE_BUTTON).first();
        const feedback = page.locator("div.feedback-node-sub").first();
        const buttonEnabled = async () => await button.evaluate((el:any) => !el.disabled).catch(() => false);

        let previousHash: string | null = null;
        let previousSettings: Record<string,string> | null = null;

        for(let index = 0; index < profiles.length; index++)
        {
            const profile = profiles[index];
            const profileDir = join(opts.artifactsRoot, slug, profile);
            mkdirSync(profileDir, { recursive: true });

            await applyProfile(page, profile === "invert" ? "invert" : profile === "default" ? "default" : "seeded", index + 1);
            await sleep(50);

            // MG-3: first run only, on a freshly loaded page
            if(index === 0)
            {
                const enabled = await buttonEnabled();
                const label = (await button.evaluate((el) => (el.textContent ?? "").trim()).catch(() => "")) || "";
                checker.ok(enabled, "GEN_BUTTON_DISABLED", "the Generate button is disabled before the first run");
                checker.ok(label === "Generate!", "GEN_BUTTON_LABEL",
                    `the Generate button is labelled "${label}" before the first run (want "Generate!")`);
            }

            const settingsBefore = await settingsSnapshot(page);

            // clear the stale feedback text from the previous run (MG-4)
            await feedback.evaluate((el:any) => { el.textContent = ""; }).catch(() => {});
            const errorsBefore = audited.countErrors();
            await audited.clearAudit();

            const downloadPromise = page.waitForEvent("download", { timeout: opts.genTimeoutMs }).catch(() => null);
            await button.click({ timeout: opts.timeoutMs }).catch((e) =>
            {
                checker.fail("GEN_CLICK", `clicking Generate threw: ${e.message}`);
            });

            const finished = await waitUntil(async () =>
            {
                const state = await page.evaluate((sel) =>
                {
                    const btn = document.querySelector(sel) as HTMLButtonElement | null;
                    const fb = document.querySelector("div.feedback-node-sub") as HTMLElement | null;
                    if(!btn) { return { gone: true, done: false }; }
                    return {
                        gone: false,
                        done: !btn.disabled && /PDF Downloaded!/.test(fb?.textContent ?? ""),
                    };
                }, GENERATE_BUTTON);
                return state.done;
            }, opts.genTimeoutMs);

            const download:any = await downloadPromise;

            // MG-4
            checker.ok(finished, "GEN_STALLED",
                `generation did not reach "PDF Downloaded!" with an enabled button within ${opts.genTimeoutMs} ms`,
                profile);
            checker.ok(await buttonEnabled(), "GEN_STALLED", "the Generate button stayed disabled", profile);

            // MG-5
            if(!download)
            {
                checker.fail("GEN_NO_DOWNLOAD", "no download event fired", profile);
            }
            else
            {
                const name = download.suggestedFilename();
                let size = -1;
                try { const p = await download.path(); if(p) { size = (await Bun.file(p).size); } } catch(e) { size = -1; }
                checker.ok(name.toLowerCase().endsWith(".pdf"), "GEN_NO_DOWNLOAD",
                    `downloaded "${name}", which is not a .pdf`, profile);
                checker.ok(size >= MIN_PDF_BYTES, "GEN_NO_DOWNLOAD",
                    `downloaded PDF is ${size} bytes (want >= ${MIN_PDF_BYTES})`, profile);
                try { await download.saveAs(join(profileDir, name)); } catch(e) {}
                artifacts.push(join(profileDir, name));
            }

            // MG-6
            const newErrors = audited.countErrors() - errorsBefore;
            checker.ok(newErrors === 0, "PAGE_ERROR",
                `generation logged ${newErrors} error(s): ${audited.errorMessages().slice(-3).join(" || ")}`, profile);

            // MG-7
            const collected = await audited.collect();
            const renders:RenderInfo[] = collected?.renders ?? [];
            if(checker.ok(renders.length > 0, "GEN_BLANK_PAGE", "no canvas was captured through toDataURL", profile))
            {
                let blank = 0;
                for(let i = 0; i < renders.length; i++)
                {
                    const render = renders[i];
                    if(render.thumb)
                    {
                        const file = join(profileDir, `render-${i}.png`);
                        writeFileSync(file, Buffer.from(render.thumb.split(",")[1] ?? "", "base64"));
                        artifacts.push(file);
                    }
                    const ok = !!render.error || render.inkRatio >= INK_MIN_GENERATOR;
                    if(!ok) { blank++; }
                    checker.ok(!render.error, "CANVAS_TAINTED", `render ${i} is tainted (cross-origin asset)`, profile);
                }
                checker.ok(blank === 0, "GEN_BLANK_PAGE", `${blank} of ${renders.length} page canvases are blank`, profile);

                // MG-9 (warning): identical output for a changed profile
                const hash = hashRenders(renders);
                if(previousHash && hash === previousHash && opts.inert && previousSettings)
                {
                    const changed = Object.keys(settingsBefore)
                        .filter(key => previousSettings && previousSettings[key] !== settingsBefore[key]);
                    checker.warn(`SETTINGS_INERT: profile "${profile}" rendered identically to the previous profile; ` +
                        `possibly ignored controls: ${changed.join(", ") || "(none changed)"}`);
                }
                previousHash = hash;
            }
            previousSettings = settingsBefore;

            // a generator may remove its own settings after generating
            if(await page.locator("div.settings").count() === 0)
            {
                checker.warn("GEN_SELF_DESTROYED: div.settings removed itself; stopping after this profile");
                break;
            }
        }

        artifacts.push((await audited.screenshot("page.png")) as string);
    }
    catch(e:any)
    {
        checker.fail("INTERNAL", `harness threw: ${e?.message ?? e}`);
    }
    finally
    {
        await page.close().catch(() => {});
    }

    return {
        url: entry.url,
        kind: entry.kind,
        contract: "generator",
        status: checker.failures.length > 0 ? "fail" : "pass",
        durationMs: Date.now() - started,
        failures: checker.failures,
        warnings: checker.warnings,
        artifacts: artifacts.filter(Boolean),
        profiles,
    };
}
