/// <reference lib="dom" />
// The encoder runs inside a Chromium page, so the DOM types belong to this file and nowhere else.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, extname } from "node:path";

// JPEG -> WebP without adding an image dependency: the audit harness already depends on Chromium
// through playwright-core, and a canvas encodes WebP natively. One browser is reused for every
// image in a run, so converting six screenshots costs a couple of seconds.
//
// playwright-core is resolved from audit/node_modules (this folder lives inside audit), so the
// pipeline itself declares no dependencies.

export interface ConversionJob
{
    src: string;
    dest: string;
}

export interface ConversionResult
{
    dest: string;
    bytes: number;
    width: number;
    height: number;
}

export interface WebpOptions
{
    maxWidth?: number;
    quality?: number;
}

// The sources are not all JPEGs: PDF page previews are, the rulebook screenshot is a PNG. The data URL
// has to say which, or the browser has to guess.
const MIME_TYPES:Record<string,string> = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
};
const mimeFor = (file:string) => MIME_TYPES[extname(file).toLowerCase()] ?? "image/jpeg";

export const convertToWebp = async (jobs:ConversionJob[], opts:WebpOptions = {}) : Promise<ConversionResult[]> =>
{
    if(jobs.length === 0) { return []; }
    const maxWidth = opts.maxWidth ?? 1100;
    const quality = opts.quality ?? 0.72;

    const { chromium } = await import("playwright-core");
    const launch:any = { headless: true, args: ["--disable-gpu", "--disable-dev-shm-usage"] };
    if(process.env.CHROME_PATH) { launch.executablePath = process.env.CHROME_PATH; }
    else { launch.channel = "chrome"; }

    const browser = await chromium.launch(launch);
    const page = await browser.newPage();
    const results:ConversionResult[] = [];

    try
    {
        for(const job of jobs)
        {
            const source = readFileSync(job.src);
            const dataUrl = `data:${mimeFor(job.src)};base64,${source.toString("base64")}`;
            const encoded = await page.evaluate(async (input:{ dataUrl:string, maxWidth:number, quality:number }) =>
            {
                const image = new Image();
                await new Promise<void>((resolve, reject) =>
                {
                    image.onload = () => resolve();
                    image.onerror = () => reject(new Error("could not decode the page preview"));
                    image.src = input.dataUrl;
                });

                const scale = Math.min(1, input.maxWidth / image.width);
                const canvas = document.createElement("canvas");
                canvas.width = Math.max(1, Math.round(image.width * scale));
                canvas.height = Math.max(1, Math.round(image.height * scale));
                const context = canvas.getContext("2d") as CanvasRenderingContext2D;
                context.fillStyle = "#FFFFFF";
                context.fillRect(0, 0, canvas.width, canvas.height);
                context.drawImage(image, 0, 0, canvas.width, canvas.height);
                return { dataUrl: canvas.toDataURL("image/webp", input.quality), width: canvas.width, height: canvas.height };
            }, { dataUrl, maxWidth, quality });

            const base64 = encoded.dataUrl.split(",")[1] ?? "";
            const buffer = Buffer.from(base64, "base64");
            mkdirSync(dirname(job.dest), { recursive: true });
            writeFileSync(job.dest, buffer);
            results.push({ dest: job.dest, bytes: buffer.length, width: encoded.width, height: encoded.height });
        }
    }
    finally
    {
        await page.close().catch(() => {});
        await browser.close().catch(() => {});
    }

    return results;
};
