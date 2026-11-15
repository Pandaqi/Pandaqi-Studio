import { Vector2 } from "../../geometry/vector2";
import { convertPixelsToInches, getPageSizeSingle, makeSizeSplittable, PageOrientation, PageSize } from "./tools";
// @ts-ignore
import { jsPDF } from "./jspdf";

export interface PdfConfig 
{
    orientation?: PageOrientation,
    unit: string,
    format: number[],
    userUnit?: number,
    hotfixes?: string[],
    compress?: boolean, // flate-compress the PDF's own streams (not the page images)
}

export type PdfCompression = "NONE" | "FAST" | "MEDIUM" | "SLOW";

export interface PdfPageConfig 
{
    orientation?: PageOrientation,
    pageSize?: PageSize,
    size?: Vector2, // just a raw size to set
    fileName?: string,
    jsPDF?:any,
    debugWithoutFile?: boolean,
    lossless?: boolean, // default = false, means we compress the PDF
    compression?: PdfCompression, // overrides the lossless default (the audit harness sets NONE)
    maxPages?: number, // 0/undefined = every page; the audit harness caps it, the pipeline is what is tested
    splitEnabled?: boolean,
    splitDims?: Vector2,
}

// jsPDF turns canvas pages into opaque JPEGs (no alpha), so transparent margins would become black. A
// destination-over white fill keeps the page canvas itself as the single copy: the caller discards it
// right after this, and repeating the fill is harmless.
const flattenOnWhite = (img:HTMLImageElement|HTMLCanvasElement) : HTMLCanvasElement =>
{
    if(img instanceof HTMLCanvasElement)
    {
        const ctx = img.getContext("2d");
        if(ctx)
        {
            ctx.save();
            ctx.globalCompositeOperation = "destination-over";
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(0, 0, img.width, img.height);
            ctx.restore();
        }
        return img;
    }

    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
    return canvas;
}

// One PDF per material. Pages are added to the jsPDF document as they arrive instead of being collected
// first: a full A4 page at 300 DPI is a ~35 MB decoded bitmap, so keeping every page alive until "save"
// meant a 40-page document held well over a gigabyte (and made whole audit sweeps crawl). jsPDF keeps the
// compressed bytes, which are what actually ends up in the file.
export class PdfBuilder 
{
    jsPDF : jsPDF
    fileName: string

    sizeSplittablePage : Vector2 // defined in PIXELS
    sizeSinglePage : Vector2

    images : (HTMLImageElement|HTMLCanvasElement)[] // only filled in debugWithoutFile mode
    debugWithoutFile : boolean
    lossless : boolean
    compression : PdfCompression
    maxPages : number

    doc : any
    pageCount : number
    aliases : WeakMap<object, string>
    aliasCount : number

    constructor(config:PdfPageConfig = {})
    {
        this.jsPDF = config.jsPDF ?? jsPDF;
        if(!this.jsPDF) 
        { 
            console.error("Can't create PDF builder without jsPDF library working."); 
            return;
        }
        
        this.debugWithoutFile = config.debugWithoutFile ?? false;
        this.lossless = config.lossless ?? false;
        this.compression = config.compression ?? (this.lossless ? "NONE" : "MEDIUM");
        this.maxPages = Math.max(0, config.maxPages ?? 0);
        this.sizeSinglePage = config.size ?? getPageSizeSingle(config);
        this.sizeSplittablePage = makeSizeSplittable(this.sizeSinglePage, config.splitDims);
        this.fileName = config.fileName ?? "Generated Game";
        this.reset();
    }

    reset()
    {
        this.images = [];
        this.doc = null;
        this.pageCount = 0;
        this.aliases = new WeakMap();
        this.aliasCount = 0;
    }

    destroy() { this.reset(); }

    get isFull() : boolean { return this.maxPages > 0 && this.pageCount >= this.maxPages; }

    // The same canvas (frontDefault/backDefault) drawn onto many pages is one image in the PDF: jsPDF
    // caches by alias, so without one every repeated page is encoded again.
    aliasOf(img:object) : string | undefined
    {
        const known = this.aliases.get(img);
        if(known) { return known; }
        // a WeakMap has no size, so the alias number comes from a plain counter
        const alias = `img${this.aliasCount++}`;
        this.aliases.set(img, alias);
        return alias;
    }

    addImage(img:HTMLImageElement|HTMLCanvasElement)
    {
        if(this.isFull) { return; }

        if(this.debugWithoutFile)
        {
            this.images.push(img);
            this.pageCount++;
            return;
        }

        if(!this.doc) { this.doc = new this.jsPDF(this.getPDFConfig()); }
        if(this.pageCount > 0) { this.doc.addPage(); }

        const pageSizeInches = convertPixelsToInches(this.sizeSinglePage);
        const pageImage = flattenOnWhite(img);

        // DOC: addImage(imageData, format, x, y, width, height, alias, compression, rotation)
        // compression values = NONE, FAST, MEDIUM, SLOW; NONE creates 100+ mb files, so it is opt-in
        this.doc.addImage(pageImage, 'png', 0, 0, pageSizeInches.x, pageSizeInches.y, this.aliasOf(img), this.compression);
        this.pageCount++;
    }

    addImages(imgs:(HTMLImageElement|HTMLCanvasElement)[])
    {
        for(const img of imgs)
        {
            if(this.isFull) { return; }
            this.addImage(img);
        }
    }

    getFullSize() : Vector2 { return this.sizeSplittablePage; }
    getSinglePageSize() : Vector2 { return this.sizeSinglePage; }

    getPDFConfig() : PdfConfig
    {
        const pageSizeInches = convertPixelsToInches(this.sizeSinglePage);
        const orientation = pageSizeInches.x > pageSizeInches.y ? PageOrientation.LANDSCAPE : PageOrientation.PORTRAIT;

        // If you use unit: "px" (and the hotfix), the PDF is FUNCTIONALLY the same
        // However, many programs will interpret it wrong and scale it wrong when using the pixel dimensions
        // Defining it with inches makes sure PDF readers all understand it's a high-resolution (300 DPI) image, while size is identical
        return {
            unit: 'in',
            format: [pageSizeInches.x, pageSizeInches.y],
            orientation: orientation,
            // Flate-compress the PDF streams for the release build. The audit harness asks for "NONE" image
            // compression (it tests the pipeline, not a print document), and that also skips this pass.
            compress: this.compression !== "NONE",
            //hotfixes: ["px_scaling"]
        };
    }

    downloadPDF(customFileName = null)
    {
        if(this.debugWithoutFile)
        {
            return this.images.forEach((img) => { 
                if(img instanceof HTMLCanvasElement) { img.style.maxWidth = "100%"; document.body.appendChild(img); return; }
                img.style.maxWidth = "100%";
                document.body.appendChild(img);
            });
        }

        if(!this.doc) { return; } // every page was skipped (maxPages = 0 pages requested)

        const fileName = `${customFileName ?? this.fileName}.pdf`;
        this.doc.save(fileName);
    }
}
