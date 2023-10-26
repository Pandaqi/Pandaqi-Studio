import { getDPIScalar } from "js/pq_games/pdf/main"
// @ts-ignore
import { jsPDF } from "./jspdf";
import Point from "../tools/geometry/point";
import { readSplitDims } from "../layout/canvas/splitImage";

enum PageOrientation 
{
    PORTRAIT,
    LANDSCAPE
}

enum PageFormat
{
    A4 = "A4",
    A5 = "A5",
    LETTER = "LETTER"
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
    format?: PageFormat
    jsPDF?:any,
    debugWithoutFile?: boolean
}

const PAGE_FORMATS = {
    [PageFormat.A4]: new Point(297, 210),
    [PageFormat.A5]: new Point(210, 148),
    [PageFormat.LETTER]: new Point(297, 216) 
}

export { PageOrientation, PdfBuilder, PdfConfig, PdfBuilderConfig, PageFormat }
export default class PdfBuilder 
{
    jsPDF : jsPDF
    button : HTMLButtonElement
    buttonConfig : Record<string,any>
    orientation : PageOrientation
    buttonClickHandler : (this: HTMLButtonElement, ev: MouseEvent) => any
    size : Point
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
        this.format = (cfg.format as PageFormat) ?? PageFormat.A4;
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
        const scaleFactor = getDPIScalar();
        const splitDims = readSplitDims(cfg.splitDims, cfg.splitBoard) ?? new Point(1,1);
        this.splitDims = splitDims;
        const pageFormatSize = PAGE_FORMATS[this.format];

        const longSide = Math.ceil(scaleFactor*pageFormatSize.x*splitDims.x);
        const shortSide = Math.ceil(scaleFactor*pageFormatSize.y*splitDims.y);

        if(this.orientation == PageOrientation.LANDSCAPE) { 
            return new Point(longSide, shortSide);
        } else {
            return new Point(shortSide, longSide);
        }
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

        return {
            orientation: this.orientation, // @TODO: not doing anything right now, because FORMAT determines the actual format!
            unit: 'px',
            format: [pageSize.x, pageSize.y],
            fileName: fileName,
            userUnit: 1.0, // 300 DPI => didn't work like I thought it would, remove?
            hotfixes: ["px_scaling"]
        }
    }

    downloadPDF(cfg = {})
    {
        if(this.debugWithoutFile)
        {
            for(const img of this.images) { 
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

        // This simply places images, one per page, and creates a _new_ page each time after the first one
        // DOC: addImage(imageData, format, x, y, width, height, alias, compression, rotation)
        // compression values = NONE, FAST, MEDIUM, SLOW
        // NONE creates 100+ mb files, so don't use that
        for(var i = 0; i < this.images.length; i++) {
            if(i > 0) { doc.addPage(); }
            doc.addImage(this.images[i], 'png', 0, 0, pageSize.x, pageSize.y, undefined, 'MEDIUM');
        }

        doc.save(pdfConfig.fileName);
        return false;
    }
}