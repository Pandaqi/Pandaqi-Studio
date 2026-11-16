import { chromium, type Browser, type BrowserContext, type Download, type Page } from "playwright-core";
import { mkdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { INSTRUMENT } from "./instrument";
import type { PdfPageInfo, RenderInfo } from "./types";

export interface NetError { url:string; what:string; }
export interface PageErrorLog
{
    pageErrors: string[];
    consoleErrors: string[];
    requestFailures: NetError[];
    httpErrors: NetError[];
}

export interface OpenOptions
{
    timeoutMs?: number;
    headed?: boolean;
    artifactsDir?: string;
    allowlist?: string[];
    marker?: string; // a harmless Chrome flag, so a leftover browser can be recognised and killed
    auditPdf?: { maxPages?: number, compression?: string, capture?: boolean, rendersPerPdf?: number, rendersTotal?: number }; // see `window.__auditPdf` below
}

const DEFAULT_ALLOWLIST: string[] = [];

const isAllowlisted = (url:string, allowlist:string[]) =>
{
    for(const entry of allowlist)
    {
        try { if(new RegExp(entry).test(url)) { return true; } }
        catch(e) { if(url.includes(entry)) { return true; } }
    }
    return false;
}

export class AuditedPage
{
    page: Page;
    errors: PageErrorLog;
    downloads: Download[] = [];
    artifactsDir: string;
    public url: string;

    constructor(page:Page, url:string, artifactsDir:string)
    {
        this.page = page;
        this.url = url;
        this.artifactsDir = artifactsDir;
        this.errors = { pageErrors: [], consoleErrors: [], requestFailures: [], httpErrors: [] };
    }

    countErrors() : number
    {
        return this.errorMessages().length;
    }

    errorMessages() : string[]
    {
        // one failed resource produces several events (a console error, an aborted request, a 4xx response);
        // report it once, keyed by URL
        const httpUrls = new Set(this.errors.httpErrors.map(x => x.url));
        const abortedButAlreadyReported = (failure:NetError) =>
            failure.what === "net::ERR_ABORTED" && httpUrls.has(failure.url);
        const consoleOnly = this.errors.consoleErrors.filter(text => !/^Failed to load resource/i.test(text));

        return [
            ...this.errors.pageErrors.map(x => `pageerror: ${x}`),
            ...consoleOnly.map(x => `console.error: ${x}`),
            ...this.errors.requestFailures.filter(x => !abortedButAlreadyReported(x))
                .map(x => `requestfailed: ${x.what} ${x.url}`),
            ...this.errors.httpErrors.map(x => `http: ${x.what} ${x.url}`),
        ];
    }

    async collect()
    {
        // canvases are never held by the harness: the instrument measures at most two of them while
        // they still exist and returns metadata only
        return await this.page.evaluate(() => (window as any).__auditCollect()) as
            { rejects:string[], errors:string[], renders:RenderInfo[], pdfPages:PdfPageInfo[] };
    }

    async measureCanvasIn(selector:string, index:number) : Promise<RenderInfo|null>
    {
        return await this.page.evaluate(
            ({ sel, idx }) => (window as any).__auditMeasureIn(sel, idx),
            { sel: selector, idx: index },
        ) as RenderInfo|null;
    }

    async clearAudit()
    {
        await this.page.evaluate(() =>
        {
            const A = (window as any).__audit;
            if(!A) { return; }
            A.rejects.length = 0;
            A.errors.length = 0;
            A.renders.length = 0;
        });
    }

    async rejectionsSince(mark:number) : Promise<string[]>
    {
        const audit = await this.collect();
        return (audit?.rejects ?? []).slice(mark);
    }

    async screenshot(name:string) : Promise<string|null>
    {
        const path = join(this.artifactsDir, name);
        mkdirSync(dirname(path), { recursive: true });
        await this.page.screenshot({ path });
        return path;
    }

    async elementScreenshot(selector:string, name:string) : Promise<string|null>
    {
        const node = this.page.locator(selector).first();
        if(await node.count() <= 0) { return null; }
        const path = join(this.artifactsDir, name);
        mkdirSync(dirname(path), { recursive: true });
        try { await node.screenshot({ path }); return path; }
        catch(e) { return null; }
    }

    async downloadSizes() : Promise<{ name:string, size:number }[]>
    {
        const out = [];
        for(const download of this.downloads)
        {
            let size = -1;
            try
            {
                const path = await download.path();
                if(path) { size = statSync(path).size; }
            } catch(e) { size = -1; }
            out.push({ name: download.suggestedFilename(), size });
        }
        return out;
    }

    async saveDownloads(dir:string)
    {
        mkdirSync(dir, { recursive: true });
        for(const download of this.downloads)
        {
            try { await download.saveAs(join(dir, download.suggestedFilename())); }
            catch(e) { /* keep going; size check reports missing files */ }
        }
    }
}

export class Session
{
    browser: Browser;
    context: BrowserContext;
    allowlist: string[];
    headed: boolean;

    static async launch(opts:OpenOptions = {}) : Promise<Session>
    {
        const self = new Session();
        self.allowlist = opts.allowlist ?? DEFAULT_ALLOWLIST;
        self.headed = !!opts.headed;

        // keep Chrome small and predictable: one renderer, no GPU, a capped JS heap, a small disk cache
        const launchOpts:any = {
            headless: !opts.headed,
            args: [
                "--disable-dev-shm-usage",
                "--disable-gpu",
                "--disable-extensions",
                "--disable-background-networking",
                "--renderer-process-limit=1",
                "--js-flags=--max-old-space-size=512",
                "--disk-cache-size=67108864",
            ],
        };
        // Chrome ignores unknown flags, so this one only exists to make a leftover browser identifiable (govern.ts)
        if(opts.marker) { launchOpts.args.push(`--audit-harness=${opts.marker}`); }

        if(process.env.CHROME_PATH) { launchOpts.executablePath = process.env.CHROME_PATH; }
        else { launchOpts.channel = "chrome"; }

        self.browser = await chromium.launch(launchOpts);
        self.context = await self.browser.newContext({
            acceptDownloads: true,
            viewport: { width: 1280, height: 900 },
        });
        return self;
    }

    async open(url:string, opts:OpenOptions = {}) : Promise<AuditedPage>
    {
        const timeoutMs = opts.timeoutMs ?? 30000;
        const page = await this.context.newPage();
        const audited = new AuditedPage(page, url, opts.artifactsDir ?? ".");
        const allowlist = opts.allowlist ?? this.allowlist;

        // attach everything BEFORE goto
        page.on("pageerror", (err) =>
        {
            audited.errors.pageErrors.push(String((err as any)?.stack || err));
        });

        page.on("console", (msg) =>
        {
            if(msg.type() !== "error") { return; }
            // Chromium logs one of these per failed load; the response/request listeners already record it
            if(/^Failed to load resource/i.test(msg.text())) { return; }
            audited.errors.consoleErrors.push(msg.text());
        });

        page.on("requestfailed", (req) =>
        {
            if(isAllowlisted(req.url(), allowlist)) { return; }
            audited.errors.requestFailures.push({ url: req.url(), what: req.failure()?.errorText ?? "failed" });
        });

        page.on("response", (res) =>
        {
            if(res.status() < 400) { return; }
            if(isAllowlisted(res.url(), allowlist)) { return; }
            audited.errors.httpErrors.push({ url: res.url(), what: String(res.status()) });
        });

        page.on("download", (download) =>
        {
            audited.downloads.push(download);
        });

        // `window.__auditPdf` is the one hook the harness has into the PDF pipeline: it caps the pages and drops
        // the compression, so a sweep tests that generation works without paying for a full print document.
        // Nothing sets it outside the audit, so a real user's PDF is unaffected.
        const auditPdfScript = opts.auditPdf
            ? `\n;(window.__auditPdf = ${JSON.stringify(opts.auditPdf)});\n`
            : "";
        await page.addInitScript({ content: INSTRUMENT + auditPdfScript });

        page.setDefaultTimeout(timeoutMs);
        await page.goto(url, { waitUntil: "load", timeout: timeoutMs });

        try
        {
            await page.evaluate(() => document.fonts.ready.then(() => true));
        } catch(e) { /* fonts.ready can be slow; not fatal */ }

        return audited;
    }

    async close()
    {
        try { await this.context.close(); } catch(e) {}
        try { await this.browser.close(); } catch(e) {}
    }
}
