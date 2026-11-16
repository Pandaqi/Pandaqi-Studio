import { mkdirSync } from "node:fs";
import { join } from "node:path";
import type { ManifestEntry, PageResult } from "../lib/types";
import type { Session } from "../lib/browser";
import { Checker } from "../lib/assert";
import { slugOf } from "../manifest";

export interface DigitalOptions
{
    baseUrl: string;
    artifactsRoot: string;
    timeoutMs: number;
    seed: string;
    allowlist: string[];
    // hand-written widgets (customWidget: true) are not framework pages: they can legitimately start
    // with little text and only render after their own button is used
    customWidget: boolean;
    // full-page screenshots are for a human to look at; off unless asked for
    screenshots: boolean;
}

export const runDigital = async (session:Session, entry:ManifestEntry, opts:DigitalOptions) : Promise<PageResult> =>
{
    const started = Date.now();
    const checker = new Checker("digital");
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

    try
    {
        // DG-1
        checker.ok(audited.countErrors() === 0, "PAGE_ERROR",
            `${audited.countErrors()} error(s) during load: ${audited.errorMessages().slice(0, 3).join(" || ")}`);

        const audit = await audited.collect();
        checker.ok((audit?.rejects ?? []).length === 0, "PAGE_ERROR",
            `${(audit?.rejects ?? []).length} unhandled rejection(s): ${(audit?.rejects ?? []).slice(0, 2).join(" || ")}`);

        // DG-2
        const text = await page.evaluate(() => document.body.innerText ?? "");
        const minText = opts.customWidget ? 1 : 200;
        checker.ok(text.length >= minText, "DG_EMPTY_BODY",
            `document.body.innerText is only ${text.length} characters (want >= ${minText})`);

        // DG-3: the settings panel lives in the framework vendor, so the page bundle can only show that the
        // page asked for it (= it calls loadSettings)
        if(/\bloadSettings\b/.test(entry.bundleText))
        {
            const hasSettings = await page.locator("div.settings").count() > 0;
            if(checker.ok(hasSettings, "DG_NO_SETTINGS",
                "the bundle calls loadSettings but div.settings never appeared"))
            {
                const title = (await page.locator("div.settings h1").first().textContent() ?? "").trim();
                checker.ok(title.length > 0, "DG_NO_TITLE", "div.settings has an empty h1");

                const controlCount = await page.locator(".settings-container input, .settings-container select").count();
                checker.ok(controlCount > 0, "DG_NO_CONTROLS", "the digital game has no settings controls");

                const button = page.locator("div.settings-container > button").first();
                if(await button.count() > 0)
                {
                    const enabled = await button.evaluate((el:any) => !el.disabled).catch(() => false);
                    checker.ok(enabled, "DG_BUTTON_DISABLED", "the primary button is disabled on load");
                }
                else
                {
                    checker.fail("DG_NO_BUTTON", "no primary button inside .settings-container");
                }
            }
        }

        if(opts.screenshots) { artifacts.push((await audited.screenshot("page.png")) as string); }
    }
    catch(e:any)
    {
        checker.fail("INTERNAL", `harness threw: ${e?.message ?? e}`);
    }
    finally
    {
        await page.close().catch(() => {});
    }

    // DG-4: gameplay is never tested automatically
    return {
        url: entry.url,
        kind: entry.kind,
        contract: "digital",
        status: checker.failures.length > 0 ? "fail" : "pass",
        durationMs: Date.now() - started,
        failures: checker.failures,
        warnings: checker.warnings,
        artifacts: artifacts.filter(Boolean),
        needsManual: true,
    };
}
