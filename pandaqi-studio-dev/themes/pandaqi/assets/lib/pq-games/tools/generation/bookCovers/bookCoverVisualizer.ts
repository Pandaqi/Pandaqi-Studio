import Renderer from "js/pq_games/layout/renderers/renderer";
import BookCoverData from "./bookCoverData";
import BookCoverDebugData from "./bookCoverDebugData";
import BookCoverTargetData from "./bookCoverTargetData";
import convertCanvasToImage from "js/pq_games/layout/canvas/convertCanvasToImage";
import Point from "../../geometry/point";
import { BookCoverComponent, DrawerCallback } from "./bookCoverGenerator";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import ResourceLoader from "js/pq_games/layout/resources/resourceLoader";
// @ts-ignore
import { jsPDF } from "js/pq_games/pdf/jspdf";

export default class BookCoverVisualizer
{
    renderer: Renderer
    resLoader: ResourceLoader
    pageSize: Point
    debug: BookCoverDebugData
    bookData: BookCoverData
    targetData: BookCoverTargetData
    frontOnly = false

    backCallback: DrawerCallback
    spineCallback: DrawerCallback
    frontCallback: DrawerCallback

    constructor(ps:Point, bd:BookCoverData, td:BookCoverTargetData, db:BookCoverDebugData)
    {
        this.pageSize = ps;
        this.bookData = bd;
        this.targetData = td;
        this.debug = db;

        console.log(this);
    }

    makePrintWraparound()
    {
        this.frontOnly = false;
    }

    makeCover()
    {
        this.frontOnly = true;
    }

    setCallbacks(b:DrawerCallback, s:DrawerCallback, f:DrawerCallback)
    {
        this.backCallback = b;
        this.spineCallback = s;
        this.frontCallback = f;
    }

    setRenderer(r:Renderer)
    {
        this.renderer = r;
    }

    setResourceLoader(r:ResourceLoader)
    {
        this.resLoader = r;
    }

    convertInchesToPixels(inp:Point) : Point
    {
        return inp.clone().scale(300).ceil();
    }

    convertPixelsToInches(inp:Point) : Point
    {
        return inp.clone().div(300);
    }

    getSpineSizePixels() : Point
    {
        return this.convertInchesToPixels(this.getSpineSize());
    }

    // The "regular" function is for the full, raw size
    // The "content" function is for the size without bleed/margins, so where the actual content should be placed and resized
    getSpineSize() : Point
    {
        let spineX = (this.targetData.pageThicknessConstant ?? 0) + this.targetData.pageThickness * (this.bookData.numPages ?? 0);
        if(this.bookData.forcedSpineSize) { spineX = this.bookData.forcedSpineSize; } // this must be inches too
        return new Point(spineX, this.getPageSize().y);
    }

    getSpineSizeContentPixels() : Point
    {
        return this.convertInchesToPixels(this.getSpineSizeContent());
    }

    getSpineSizeContent() : Point
    {
        return new Point(this.getSpineSize().x, this.getPageSizeContent().y);
    }

    getSpineCenter() : Point
    {
        return this.getSpineSizePixels().scale(0.5);
    }

    getSpineAnchorContent() : Point
    {
        const diff = this.getSpineSizePixels().sub( this.getSpineSizeContentPixels());
        return new Point(0, 0.5*diff.y);
    }

    getSpineCenterContent() : Point
    {
        return this.getSpineAnchorContent().add( this.getSpineSizeContentPixels().scale(0.5));
    }

    getPageSizePixels() : Point
    {
        return this.convertInchesToPixels(this.getPageSize());
    }

    getPageSize() : Point
    {
        let bleed = this.targetData.bleed ?? new Point();
        if(this.frontOnly) { bleed = new Point(); }

        return new Point(
            1 * bleed.x + this.pageSize.x,
            2 * bleed.y + this.pageSize.y
        )
    }

    getPageSizeContentPixels() : Point
    {
        return this.convertInchesToPixels(this.getPageSizeContent())
    }

    getPageSizeContent() : Point
    {
        return this.pageSize.clone();
    }

    getCoverSize() : Point
    {
        if(this.frontOnly) { return this.getPageSizeContentPixels(); }

        const pageSize = this.getPageSize();
        const sizeInches = new Point(
            2 * pageSize.x + this.getSpineSize().x,
            pageSize.y
        )

        return this.convertInchesToPixels(sizeInches);
    }

    getPageCenter() : Point
    {
        return this.getPageSizePixels().scale(0.5);
    }

    getPageCenterContent(comp:BookCoverComponent) : Point
    {
        return this.getPageAnchorContent(comp).add( this.getPageSizeContentPixels().scale(0.5) );
    }

    getPageAnchorContent(comp:BookCoverComponent) : Point
    {
        const diff = this.getPageSizePixels().sub ( this.getPageSizeContentPixels() );
        if(comp == BookCoverComponent.BACK) 
        {
            return new Point(diff.x, 0.5*diff.y);
        }

        if(comp == BookCoverComponent.FRONT)
        {
            return new Point(0, 0.5*diff.y);
        }
    }

    getFileName() : string
    {
        const str = this.frontOnly ? "Book Cover" : "Print Wraparound";
        return "[" + this.bookData.name + "] " + str + "; Target " + this.targetData.key;
    }

    getResource(key:string)
    {
        return this.resLoader.getResource(key);
    }

    async draw()
    {
        // setup required stuff
        const group = this.renderer.prepareDraw();

        // do the individual drawing (back, spine, front)
        if(this.frontOnly) {
            group.add(this.frontCallback(this));
        } else {
            group.add(this.backCallback(this));

            const opSpine = new LayoutOperation({ pos: new Point(this.getPageSizePixels().x, 0) });
            group.add(this.spineCallback(this), opSpine);

            const opFront = new LayoutOperation({ pos: new Point(this.getPageSizePixels().x + this.getSpineSizePixels().x, 0) });
            group.add(this.frontCallback(this), opFront);
        }

        // combine and finalize
        const canv = await this.renderer.finishDraw({ group: group, size: this.getCoverSize() })
        const img = await this.addImage(canv);
        await this.createPDF(img);
    }

    async addImage(canv:HTMLCanvasElement) : Promise<HTMLImageElement>
    {
        const img = await convertCanvasToImage(canv);
        if(this.debug.noImage || this.targetData.noImage) { return img; }

        img.style.maxWidth = "100%";
        img.title = this.getFileName();
        document.body.appendChild(img);   
        return img;
    }

    async createPDF(img:HTMLImageElement)
    {
        if(this.debug.noPDF || this.targetData.noPDF) { return; }

        const size = this.convertPixelsToInches( new Point(img.naturalWidth, img.naturalHeight) );
        const pdfConfig = {
            unit: 'in',
            orientation: "landscape",
            format: [size.x, size.y],
        }

        const doc = new jsPDF(pdfConfig);
        // DOC: addImage(imageData, format, x, y, width, height, alias, compression, rotation)
        // compression values = NONE, FAST, MEDIUM, SLOW
        doc.addImage(img, 'png', 0, 0, size.x, size.y, undefined, 'MEDIUM');
        doc.save(this.getFileName());
    }
}