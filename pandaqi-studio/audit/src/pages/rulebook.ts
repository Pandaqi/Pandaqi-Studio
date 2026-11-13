import { existsSync, readFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import type { ManifestEntry, PageResult, RenderInfo } from "../lib/types";
import type { Session } from "../lib/browser";
import { Checker, norm } from "../lib/assert";
import { waitUntil, sleep } from "../lib/wait";
import { slugOf } from "../manifest";

export interface RunOptions
{
    baseUrl: string;
    studioDir: string;
    artifactsRoot: string;
    baselinesRoot?: string;
    updateBaselines?: boolean;
    timeoutMs: number;
    exampleTimeoutMs: number;
    seed: string;
    allowlist: string[];
}

const headingsOf = (html:string) : string[] =>
{
    const article = html.match(/<article id="rulebook-content">([\s\S]*?)<\/article>/);
    const scope = article ? article[1] : html;
    const out:string[] = [];
    const re = /<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/g;
    let m;
    while((m = re.exec(scope)) !== null) { out.push(norm(m[2])); }
    return out.filter(x => x.length > 0);
}

const INK_MIN_RULEBOOK = 0.005;

// the page's own entry file, e.g. assets/games/foo/rules/main.ts or assets/games/foo/rules.ts
const entrySourcePath = (studioDir:string, url:string) : string|null =>
{
    const rel = url.replace(/^\//, "").replace(/\/$/, "");
    const base = join(studioDir, "themes", "pandaqi", "assets", "games", rel);
    for(const file of [`${base}/main.ts`, `${base}.ts`])
    {
        if(existsSync(file)) { return file; }
    }
    return null;
}

const readEntrySource = (studioDir:string, url:string) : string|null =>
{
    const file = entrySourcePath(studioDir, url);
    return file ? readFileSync(file, "utf8") : null;
}

interface SimulatorInfo { declared:boolean; enabled:boolean; detail:string; }

// Simulators are a development aid; a published rulebook must not have one enabled. They are also
// slow enough (1000 iterations) that clicking one is a minute of audit time for no coverage.
const readSimulators = (source:string|null) : SimulatorInfo =>
{
    if(!source) { return { declared: false, enabled: false, detail: "no entry source found" }; }

    const constants:Record<string,string> = {};
    for(const match of source.matchAll(/(?:const|let|var)\s+([A-Za-z0-9_$]+)\s*=\s*(true|false)\s*;/g))
    {
        constants[match[1]] = match[2];
    }

    const details:string[] = [];
    let declared = false;
    let enabled = false;
    for(const match of source.matchAll(/simulator\s*:\s*\{([\s\S]{0,600}?)\}/g))
    {
        declared = true;
        const found = match[1].match(/enabled\s*:\s*([A-Za-z0-9_$.]+)/);
        // a simulator block without an explicit `enabled: false` is treated as enabled: the safe assumption
        const expr = found ? found[1] : "(implicit)";
        const resolved = found ? (constants[expr] ?? expr) : "true";
        if(resolved !== "false") { enabled = true; }
        details.push(`${expr} = ${resolved}`);
    }
    return { declared, enabled, detail: details.join(", ") || "- " };
}

const countSettingsDeclarations = (source:string|null) =>
{
    if(!source) { return 0; }
    return (source.match(/(^|[^_A-Za-z0-9])settings\s*:/g) ?? []).length;
}

// measures the canvases that are actually visible inside a node; returns ink ratios
const measureCanvasesIn = async (locator:any) =>
{
    return await locator.evaluate((el:HTMLElement) =>
    {
        const out:any[] = [];
        const canvases = Array.from(el.querySelectorAll("canvas")) as HTMLCanvasElement[];
        for(const source of canvases)
        {
            const w = source.width, h = source.height;
            if(w <= 0 || h <= 0) { continue; }
            const tw = Math.max(1, Math.min(480, Math.round(w * Math.min(1, 480 / w))));
            const th = Math.max(1, Math.round(h * (tw / w)));
            const scratch = document.createElement("canvas");
            scratch.width = tw; scratch.height = th;
            const ctx = scratch.getContext("2d") as CanvasRenderingContext2D;
            ctx.drawImage(source, 0, 0, tw, th);
            try
            {
                const data = ctx.getImageData(0, 0, tw, th).data;
                const counts = new Map<number, number>();
                let n = 0;
                for(let p = 0; p < tw * th; p += 7)
                {
                    const i = p * 4;
                    const key = data[i] * 16777216 + data[i+1] * 65536 + data[i+2] * 256 + data[i+3];
                    counts.set(key, (counts.get(key) ?? 0) + 1);
                    n++;
                }
                let max = 0;
                for(const v of counts.values()) { if(v > max) { max = v; } }
                out.push({ w, h, inkRatio: n ? 1 - max / n : 0 });
            }
            catch(e) { out.push({ w, h, inkRatio: 0, error: "tainted" }); }
        }
        return out;
    }).catch(() => [] as any[]);
}

export const runRulebook = async (session:Session, entry:ManifestEntry, opts:RunOptions) : Promise<PageResult> =>
{
    const started = Date.now();
    const checker = new Checker("rulebook");
    const slug = slugOf(entry.url);
    const artifactsDir = join(opts.artifactsRoot, slug, "default");
    mkdirSync(artifactsDir, { recursive: true });
    const artifacts:string[] = [];

    const audited = await session.open(`${opts.baseUrl}${entry.url}?auditSeed=${encodeURIComponent(opts.seed)}`, {
        timeoutMs: opts.timeoutMs,
        artifactsDir,
        allowlist: opts.allowlist,
    });
    const page = audited.page;
    const source = readEntrySource(opts.studioDir, entry.url);
    const simulators = readSimulators(source);

    try
    {
        const hasToolbar = await waitUntil(async () => await page.locator(".rulebook-toolbar").count() > 0,
            Math.min(opts.timeoutMs, 15000));

        // RB-1
        const articleCount = await page.locator("article#rulebook-content").count();
        checker.ok(articleCount > 0, "RB_NO_ARTICLE", "article#rulebook-content is missing");
        if(articleCount > 0)
        {
            const headingCount = await page.locator("article#rulebook-content h1, article#rulebook-content h2, article#rulebook-content h3, article#rulebook-content h4, article#rulebook-content h5, article#rulebook-content h6").count();
            checker.ok(headingCount > 0, "RB_NO_HEADINGS", "the rulebook article has no headings");
        }

        if(!hasToolbar)
        {
            const loadErrors = audited.errorMessages();
            checker.fail("RB_NO_TOOLBAR", "the bundle never ran: .rulebook-toolbar never appeared" +
                (loadErrors.length > 0 ? ` (${loadErrors.slice(0, 2).join(" || ")})` : ""), entry.url);
            artifacts.push((await audited.screenshot("page.png")) as string);
            return {
                url: entry.url, kind: entry.kind, contract: "rulebook", status: "fail",
                durationMs: Date.now() - started, failures: checker.failures, warnings: checker.warnings, artifacts,
            };
        }

        // RB-2
        const toolbarButtons = await page.$$eval(".rulebook-toolbar button", (els) =>
            els.map(el => (el.textContent ?? "").trim())
        );
        for(const expected of ["Print (Browser)", "Print (Advanced)", "Fold All", "Unfold All", "Dark Mode"])
        {
            checker.ok(toolbarButtons.includes(expected), "RB_TOOLBAR_BUTTON",
                `toolbar is missing the "${expected}" button`, `found: ${toolbarButtons.join(" | ")}`);
        }

        // RB-3
        const sourceHeadings = headingsOf(readFileSync(entry.htmlPath, "utf8"));
        const rendered = (await page.$$eval(".rulebook-section-header", (els) =>
            els.map(el => (el.textContent ?? ""))
        )).map(norm);

        for(const heading of sourceHeadings)
        {
            checker.ok(rendered.some(text => text.includes(heading)), "RB_SECTION_MISSING",
                `heading "${heading}" is not present in any .rulebook-section-header`);
        }

        const sectionCount = await page.locator(".rulebook-section").count();
        checker.ok(sectionCount > 0, "RB_NO_SECTIONS", "no .rulebook-section was created");

        const rootNoFold = await page.locator(".rulebook-section").first().evaluate((el) =>
            (el as HTMLElement).dataset.nofold === "true"
        ).catch(() => false);
        checker.ok(rootNoFold, "RB_ROOT_FOLDABLE", "the root .rulebook-section is missing data-nofold=\"true\"");

        // RB-4
        if(sectionCount > 0)
        {
            await page.locator(".rulebook-toolbar button", { hasText: "Fold All" }).first().click();
            await sleep(150);
            const allFolded = await page.$$eval(
                ".rulebook-section:not([data-nofold]) .rulebook-section-content",
                (els) => els.length > 0 && els.every(el => getComputedStyle(el).display === "none")
            );
            checker.ok(allFolded, "RB_FOLD_ALL", "Fold All did not hide every foldable section's content");

            await page.locator(".rulebook-toolbar button", { hasText: "Unfold All" }).first().click();
            await sleep(150);
            const allUnfolded = await page.$$eval(
                ".rulebook-section:not([data-nofold]) .rulebook-section-content",
                (els) => els.length > 0 && els.every(el => getComputedStyle(el).display !== "none")
            );
            checker.ok(allUnfolded, "RB_UNFOLD_ALL", "Unfold All did not clear the folded state");
        }

        // RB-5 / RB-10
        for(const id of entry.examples)
        {
            const node = page.locator(`[data-rulebook-example="${id}"]`).first();
            if(await node.count() <= 0)
            {
                checker.fail("RB_ORPHAN_EXAMPLE", `markdown declares example "${id}" but the node is gone`, id);
                continue;
            }
            const shape = await node.evaluate((el) => ({
                hasClass: el.classList.contains("rulebook-example"),
                ui: el.querySelectorAll(".rulebook-example-ui").length,
                button: el.querySelectorAll("button.rulebook-example-button").length,
                close: el.querySelectorAll("button.rulebook-example-button-close").length,
                content: el.querySelectorAll(".rulebook-example-content").length,
                settingsBlocks: el.querySelectorAll(".rulebook-settings").length,
                settingsInputs: el.querySelectorAll(".rulebook-settings-input").length,
            }));
            checker.ok(shape.hasClass, "RB_EXAMPLE_UI", `example "${id}" is missing the rulebook-example class`, id);
            checker.ok(shape.ui === 1, "RB_EXAMPLE_UI", `example "${id}" has ${shape.ui} .rulebook-example-ui (want 1)`, id);
            checker.ok(shape.button === 1, "RB_EXAMPLE_UI", `example "${id}" has ${shape.button} generate buttons (want 1)`, id);
            checker.ok(shape.close === 1, "RB_EXAMPLE_UI", `example "${id}" has ${shape.close} close buttons (want 1)`, id);
            checker.ok(shape.content === 1, "RB_EXAMPLE_UI", `example "${id}" has ${shape.content} content nodes (want 1)`, id);
            if(shape.settingsBlocks > 0)
            {
                checker.ok(shape.settingsInputs > 0, "RB_EXAMPLE_SETTINGS",
                    `example "${id}" renders .rulebook-settings without a .rulebook-settings-input`, id);
            }
        }

        // RB-10 (page level): an example that declares settings must actually render them.
        // Without this the per-example check is vacuous: it only ran on blocks that already existed.
        const declaredSettings = countSettingsDeclarations(source);
        if(declaredSettings > 0)
        {
            const renderedSettings = await page.locator(".rulebook-settings").count();
            checker.ok(renderedSettings > 0, "RB_EXAMPLE_SETTINGS",
                `the entry declares ${declaredSettings} example settings block(s) but the page renders none`);
            if(renderedSettings > 0 && renderedSettings < declaredSettings)
            {
                checker.warn(`entry declares ${declaredSettings} settings block(s), page renders ${renderedSettings}`);
            }
        }

        // Simulators are development-only. Never drive them; assert they are switched off instead.
        if(simulators.declared)
        {
            checker.ok(!simulators.enabled, "SIMULATION_ENABLED",
                `an interactive example declares an enabled simulator (${simulators.detail}); ` +
                `simulators are debug-only and must be disabled before publishing`);
            checker.warn(`simulator declared (${simulators.detail}); examples were not clicked`);
        }

        // RB-6 / RB-7
        for(const id of entry.examples)
        {
            // a simulator-backed example costs a minute to run and is not part of the published experience
            if(simulators.declared) { continue; }

            const node = page.locator(`[data-rulebook-example="${id}"]`).first();
            if(await node.count() <= 0) { continue; }

            const button = node.locator("button.rulebook-example-button").first();
            if(await button.count() <= 0) { continue; }

            const original = ((await button.textContent()) ?? "").trim();
            await audited.clearAudit();
            const errorsBefore = audited.countErrors();

            await button.scrollIntoViewIfNeeded().catch(() => {});
            const clicked = await button.click({ timeout: opts.timeoutMs }).then(() => true).catch((e) =>
            {
                checker.fail("RB_EXAMPLE_EMPTY", `clicking example "${id}" threw: ${e.message}`, id);
                return false;
            });

            let finished = false;
            if(clicked)
            {
                finished = await waitUntil(async () =>
                {
                    const state = await button.evaluate((el:any) => ({
                        disabled: !!el.disabled,
                        label: (el.textContent ?? "").trim(),
                    }));
                    return !state.disabled && state.label === original;
                }, opts.exampleTimeoutMs);
            }

            const finalLabel = ((await button.textContent()) ?? "").trim();

            const collected = await audited.collect();
            const newRejects = collected?.rejects ?? [];
            const newErrors = audited.countErrors() - errorsBefore;

            checker.ok(finished, "RB_EXAMPLE_TIMEOUT",
                `example "${id}" did not finish within ${opts.exampleTimeoutMs} ms (button labelled "${finalLabel}")`, id);
            checker.ok(finalLabel === original, "RB_EXAMPLE_LABEL",
                `example "${id}" left its button labelled "${finalLabel}" instead of "${original}"`, id);

            const children = await node.evaluate((el) => {
                const content = el.querySelector(".rulebook-example-content");
                return content ? content.children.length : 0;
            });
            checker.ok(children > 0, "RB_EXAMPLE_EMPTY", `example "${id}" produced no content`, id);
            checker.ok(newErrors === 0, "PAGE_ERROR",
                `example "${id}" logged ${newErrors} error(s): ${audited.errorMessages().slice(-3).join(" || ")}`, id);
            checker.ok(newRejects.length === 0, "RB_EXAMPLE_EMPTY",
                `example "${id}" rejected: ${newRejects.slice(0, 2).join(" || ")}`, id);

            const renders:RenderInfo[] = (await measureCanvasesIn(node)) as RenderInfo[];
            const all = renders.length > 0 ? renders : ((collected?.renders ?? []) as RenderInfo[]);
            // RB-7 must measure something: "produced no canvas" is not a pass
            checker.ok(all.length > 0, "RB_NO_CANVAS",
                `example "${id}" rendered no canvas, so its output could not be checked`, id);
            for(const render of all)
            {
                checker.ok(!!render.error || (render.inkRatio >= INK_MIN_RULEBOOK || render.w <= 16),
                    "RB_BLANK_CANVAS",
                    `example "${id}" produced a blank canvas (${render.w}x${render.h}, ink ${(render.inkRatio * 100).toFixed(2)}%)`, id);
                checker.ok(!render.error, "CANVAS_TAINTED", `example "${id}" produced a tainted canvas`, id);
            }

            artifacts.push((await audited.elementScreenshot(`[data-rulebook-example="${id}"]`, `example-${id}.png`)) as string);
        }

        // RB-8
        for(const id of entry.tables)
        {
            const tableNode = page.locator(`[data-rulebook-table="${id}"]`).first();
            if(await tableNode.count() <= 0)
            {
                checker.fail("RB_ORPHAN_TABLE", `markdown declares table "${id}" but the node is gone`, id);
                continue;
            }
            const entryNodes = tableNode.locator(".rulebook-table-entry");
            const entryCount = await entryNodes.count();
            if(!checker.ok(entryCount > 0, "RB_TABLE_EMPTY", `table "${id}" has no .rulebook-table-entry`, id)) { continue; }

            const first = entryNodes.first();
            const shape = await first.evaluate((el) => ({
                heading: (el.querySelector(".heading-container")?.textContent ?? "").trim(),
                icons: el.querySelectorAll(".icon-container").length,
            }));
            checker.ok(shape.heading.length > 0, "RB_TABLE_ENTRY", `first entry of table "${id}" has an empty heading`, id);
            checker.ok(shape.icons === 1, "RB_TABLE_ENTRY",
                `first entry of table "${id}" has ${shape.icons} .icon-container (want 1)`, id);

            const before = await first.getAttribute("class");
            await first.click();
            await sleep(100);
            const after = await first.getAttribute("class");
            const toggled = !!before && !!after && before !== after
                && (after.includes("-folded") || after.includes("-unfolded"));
            checker.ok(toggled, "RB_TABLE_TOGGLE", `clicking table "${id}" did not toggle its folded class`, id);
        }

        // RB-9
        const brokenImages = await page.evaluate(() =>
        {
            const scope = Array.from(document.querySelectorAll(".rulebook-section img, #rulebook-content img")) as HTMLImageElement[];
            return scope.filter(img => img.naturalWidth === 0).map(img => img.getAttribute("src") ?? "(no src)");
        });
        checker.ok(brokenImages.length === 0, "RB_BROKEN_IMAGE",
            `${brokenImages.length} image(s) failed to load: ${brokenImages.slice(0, 3).join(", ")}`);

        // RB-11 (warning only)
        const deadAnchors = await page.evaluate(() =>
        {
            const anchors = Array.from(document.querySelectorAll('.rulebook-section a[href^="#"]')) as HTMLAnchorElement[];
            return anchors
                .map(a => a.getAttribute("href") ?? "")
                .filter(href => href.length > 1 && !document.getElementById(href.slice(1)));
        });
        for(const href of deadAnchors) { checker.warn(`anchor ${href} does not resolve to an element`); }
    }
    catch(e:any)
    {
        checker.fail("INTERNAL", `harness threw: ${e?.message ?? e}`);
    }
    finally
    {
        artifacts.push((await audited.screenshot("page.png")) as string);
        await page.close().catch(() => {});
    }

    return {
        url: entry.url,
        kind: entry.kind,
        contract: "rulebook",
        status: checker.failures.length > 0 ? "fail" : "pass",
        durationMs: Date.now() - started,
        failures: checker.failures,
        warnings: checker.warnings,
        artifacts: artifacts.filter(Boolean),
        profiles: ["default"],
    };
}
