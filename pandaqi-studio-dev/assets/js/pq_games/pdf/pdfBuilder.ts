import { PAGE_FORMATS, convertMillimetersToPixels, convertPixelsToInches } from "js/pq_games/pdf/main";
import { readSplitDims } from "../layout/canvas/splitImage";
import Point from "../tools/geometry/point";
// @ts-ignore
import { jsPDF } from "./jspdf";

enum PageOrientation 
{
    PORTRAIT,
    LANDSCAPE
}

// It's crucial these strings are lowercase like this
// Because they are hardcoded in the dropdowns for game settings (setting-pageSize)
enum PageFormat
{
    A4 = "a4",
    A5 = "a5",
    LETTER = "Letter"
}

interface PdfConfig 
{
    orientation: PageOrientation,
    unit: string,
    format: number[],
    fileName: string,
    userUnit?: number,
    hotfixes?: string[]
}

interface PdfBuilderConfig 
{
    orientation?: PageOrientation,
    splitBoard?: boolean
    splitDims?: Point,

    // @TODO: this is duplicate because older projects constantly confused the names and used both interchangeably :/
    // Need to update to just pageSize everywhere at some point
    format?: PageFormat,
    pageSize?: PageFormat,
    jsPDF?:any,
    debugWithoutFile?: boolean
}

export { PageFormat, PageOrientation, PdfBuilder, PdfBuilderConfig, PdfConfig };
export default class PdfBuilder 
{
    jsPDF : jsPDF
    button : HTMLButtonElement
    buttonConfig : Record<string,any>
    orientation : PageOrientation
    buttonClickHandler : (this: HTMLButtonElement, ev: MouseEvent) => any
    size : Point // defined in PIXELS
    format: PageFormat
    splitDims: Point

    images : HTMLImageElement[]
    debugWithoutFile : boolean

    constructor(cfg:PdfBuilderConfig = {})
    {
        this.jsPDF = cfg.jsPDF || jsPDF;
        if(!this.jsPDF) 
        { 
            console.error("Can't create PDF builder without jsPDF library working."); 
            return;
        }
        
        this.button = null;
        this.buttonConfig = {};
        this.debugWithoutFile = cfg.debugWithoutFile ?? false;
        this.orientation = cfg.orientation ?? PageOrientation.LANDSCAPE;
        this.format = cfg.format ?? cfg.pageSize ?? PageFormat.A4;
        this.splitDims = new Point(1,1);
        this.size = this.calculatePageSize(cfg);
        this.buttonClickHandler = this.onPDFButtonClicked.bind(this);
        this.reset();
    }

    reset()
    {
        this.images = []
    }

    addImage(img:HTMLImageElement)
    {
        this.images.push(img);
    }

    addImages(imgs:HTMLImageElement[])
    {
        for(const img of imgs)
        {
            this.images.push(img);
        }
    }

    destroy()
    {
        this.reset();
        this.removeButton();
    }

    removeButton()
    {
        if(!this.button) { return; }
        this.button.removeEventListener("click", this.buttonClickHandler);
    }

    connectConfig(cfg:Record<string,any>)
    {
        this.buttonConfig = cfg;
    }

    connectButton(btn:HTMLButtonElement, _cfg:Record<string,any> = {})
    {
        this.removeButton();

        this.button = btn;
        this.button.addEventListener('click', this.buttonClickHandler);
    }

    onPDFButtonClicked(ev:any)
    {
        const btn = ev.currentTarget;
        btn.innerHTML = '...';
        btn.disabled = true;
        ev.preventDefault();
        ev.stopPropagation();

        // timeout prevents blocking/freezing the page
        const that = this;
        setTimeout(() => {
            that.downloadPDF(that.buttonConfig);
            btn.innerHTML = 'Download PDF';
            btn.disabled = false;
        }, 50);
        return false;
    }

    onGenerationStart()
    {
        this.reset();
        if(!this.button) { return; }
        this.button.style.display = 'none';
    }

    onConversionDone()
    {
        if(!this.button) { return; }
        this.button.style.display = 'inline-block';
    }

    calculatePageSize(cfg:Record<string,any> = {}) : Point
    {
        const splitDims = readSplitDims(cfg.splitDims, cfg.splitBoard) ?? new Point(1,1);
        this.splitDims = splitDims;
        
        const pageFormatSize = PAGE_FORMATS[this.format];
        const dims = convertMillimetersToPixels(pageFormatSize.clone().scale(splitDims));

        if(this.orientation == PageOrientation.LANDSCAPE) { return dims.clone(); }
        return new Point(dims.y, dims.x);
    }

    getFullSize() : Point
    {
        return this.size;
    }

    getSinglePageSize() : Point
    {
        return new Point(
            this.size.x / this.splitDims.x,
            this.size.y / this.splitDims.y
        )
    }

    getPDFConfig(cfg:Record<string,any> = {}) : PdfConfig
    {
        let fileName = cfg.gameTitle + ' (' + cfg.seed + ').pdf';
        if(cfg.customFileName) { fileName = cfg.customFileName + ".pdf"; }

        const pageSize = this.getSinglePageSize();
        const pageSizeInches = convertPixelsToInches(pageSize);

        // @NOTE: If you use unit: "px" (and the hotfix), the PDF is FUNCTIONALLY the same
        // However, many programs will interpret it wrong and scale it wrong when using the pixel dimensions
        // Defining it with inches makes sure PDF readers all understand it's a high-resolution (300 DPI) image, while size is identical
        return {
            unit: 'in',
            format: [pageSizeInches.x, pageSizeInches.y],
            fileName: fileName,
            orientation: this.orientation, // @TODO: not doing anything right now, because FORMAT determines the actual format!
            //hotfixes: ["px_scaling"]
        }
    }

    downloadPDF(cfg = {})
    {
        if(this.debugWithoutFile)
        {
            for(const img of this.images) 
            { 
                img.style.maxWidth = "100%";
                document.body.appendChild(img);
            }
            return false;
        }

        const pdfConfig = this.getPDFConfig(cfg);
        const doc = new this.jsPDF(pdfConfig);
        //const width = doc.internal.pageSize.getWidth();
        //const height = doc.internal.pageSize.getHeight();

        const pageSize = this.getSinglePageSize();
        const pageSizeInches = convertPixelsToInches(pageSize);

        // This simply places images, one per page, and creates a _new_ page each time after the first one
        // DOC: addImage(imageData, format, x, y, width, height, alias, compression, rotation)
        // compression values = NONE, FAST, MEDIUM, SLOW
        // NONE creates 100+ mb files, so don't use that
        for(var i = 0; i < this.images.length; i++) 
        {
            if(i > 0) { doc.addPage(); }
            doc.addImage(this.images[i], 'png', 0, 0, pageSizeInches.x, pageSizeInches.y, undefined, 'MEDIUM');
        }

        doc.save(pdfConfig.fileName);
        return false;
    }
}