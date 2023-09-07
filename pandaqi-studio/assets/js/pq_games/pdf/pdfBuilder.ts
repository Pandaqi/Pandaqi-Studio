import PDF from "js/pq_games/pdf/main"
// @ts-ignore
import { jsPDF } from "./jspdf";

enum PageOrientation {
    PORTRAIT,
    LANDSCAPE
}

interface PageSize {
    width: number,
    height: number
}

interface PdfConfig {
    orientation: PageOrientation,
    unit: string,
    format: number[],
    fileName: string
}

export { PageOrientation, PdfBuilder, PageSize, PdfConfig }
export default class PdfBuilder 
{
    jsPDF : jsPDF
    button : HTMLButtonElement
    buttonConfig : Record<string,any>
    orientation : PageOrientation
    buttonClickHandler : (this: HTMLButtonElement, ev: MouseEvent) => any
    size : PageSize

    images : HTMLImageElement[]

    constructor(cfg:Record<string,any> = {})
    {
        this.jsPDF = cfg.jsPDF || jsPDF;
        if(!this.jsPDF) 
        { 
            console.error("Can't create PDF builder without jsPDF library working."); 
            return;
        }
        
        this.button = null;
        this.buttonConfig = {};
        this.orientation = cfg.orientation ?? PageOrientation.LANDSCAPE;
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

    calculatePageSize(cfg:Record<string,any> = {}) : PageSize
    {
        var scaleFactor = PDF.getDPIScalar();
        if(cfg.splitBoard) { scaleFactor *= (cfg.splitBoardFactor ?? 2.0); }

        const longSide = 297*scaleFactor;
        const shortSide = 210*scaleFactor;

        if(this.orientation == PageOrientation.LANDSCAPE) { 
            return { width: longSide, height: shortSide };
        } else {
            return { width: shortSide, height: longSide };
        }
    }

    getPageSize() : PageSize
    {
        return this.size;
    }

    getPDFConfig(cfg:Record<string,any> = {}) : PdfConfig
    {
        let fileName = cfg.gameTitle + ' (' + cfg.seed + ').pdf';
        if(cfg.customFileName) { fileName = cfg.customFileName + ".pdf"; }

        return {
            orientation: this.orientation,
            unit: 'px',
            format: [this.size.width, this.size.height],
            fileName: fileName
        }
    }

    downloadPDF(cfg = {})
    {
        const pdfConfig = this.getPDFConfig(cfg);
        const doc = new this.jsPDF(pdfConfig);
        const width = doc.internal.pageSize.getWidth();
        const height = doc.internal.pageSize.getHeight();

        // This simply places images, one per page, and creates a _new_ page each time after the first one
        // DOC: addImage(imageData, format, x, y, width, height, alias, compression, rotation)
        for(var i = 0; i < this.images.length; i++) {
            if(i > 0) { doc.addPage(); }
            doc.addImage(this.images[i], 'png', 0, 0, width, height, undefined, 'FAST');
        }

        doc.save(pdfConfig.fileName);
        return false;
    }
}