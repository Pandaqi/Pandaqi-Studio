import { PdfBuilder, PdfBuilderConfig } from "js/pq_games/pdf/pdfBuilder"
import createCanvas from "js/pq_games/layout/canvas/createCanvas"
import Point from "js/pq_games/tools/geometry/point"

enum GridMapperLayout
{
    TRIANGLE,
    RECTANGLE,
    HEXAGON,
    CIRCLE
}

interface GridMapperParams
{
    debug?: boolean,
    layoutShape?: GridMapperLayout
    dims?: Point
    outerMargin?: Point
    innerMargin?: Point,
    pdfBuilder?: PdfBuilder,
    dimsElement?: Point,
    absoluteElementSize?: Point,
    pdfParams?: PdfBuilderConfig
}

export { GridMapperLayout, GridMapperParams }
export default class GridMapper 
{
    debug = false
    canvases : HTMLCanvasElement[]
    layoutShape : GridMapperLayout
    dims : Point
    outerMargin : Point
    innerMargin : Point
    padding : Point
    currentElement : number

    pdfBuilder : PdfBuilder
    pageSize : Point
    innerPageSize : Point
    maxPixels : Point

    fakeDims : Point
    offsetPerElement : Point
    elementsPerPage : number
    elementPositions : Point[]

    constructor(params:GridMapperParams = {})
    {
        this.debug = params.debug ?? false;

        this.canvases = [];
        this.layoutShape = params.layoutShape ?? GridMapperLayout.RECTANGLE; // rectangle, hexagon, triangle, circle
        this.dims = params.dims || new Point({ x: 3, y: 3 });
        this.outerMargin = params.outerMargin || new Point({ x: 35, y: 35 });
        this.innerMargin = params.innerMargin || new Point({ x: 20, y: 20 });
        this.padding = new Point();
        this.currentElement = 0;

        this.pdfBuilder = params.pdfBuilder || new PdfBuilder(params.pdfParams);
        this.pageSize = this.pdfBuilder.getSinglePageSize();
        this.innerPageSize = new Point({
            x: (this.pageSize.x-2*this.outerMargin.x),
            y: (this.pageSize.y-2*this.outerMargin.y)
        });

        this.maxPixels = new Point({ 
            x: Math.floor( this.innerPageSize.x / this.dims.x ), 
            y: Math.floor( this.innerPageSize.y / this.dims.y )
        });

        this.fakeDims = this.dims.clone();
        this.offsetPerElement = new Point({ x: 1.0, y: 1.0 });

        const shp = this.layoutShape;
        const useAlternativeGrid = shp != GridMapperLayout.RECTANGLE;
        if(useAlternativeGrid)
        {
            if(shp == GridMapperLayout.TRIANGLE) {
                this.offsetPerElement.x = 0.5;
                this.offsetPerElement.y = 1.0;
            } else if(shp == GridMapperLayout.HEXAGON) {
                this.offsetPerElement.x = 0.75;
                this.offsetPerElement.y = Math.sqrt(3)/2;
            } else if(shp == GridMapperLayout.CIRCLE) {
                this.offsetPerElement.x = Math.sqrt(2)/2;
                this.offsetPerElement.y = Math.sqrt(2);
            }

            const numElemsPerRealElem = {
                x: 1.0 / this.offsetPerElement.x,
                y: 1.0 / this.offsetPerElement.y
            }

            this.fakeDims.x /= numElemsPerRealElem.x;
            this.fakeDims.y /= numElemsPerRealElem.y;

            this.fakeDims.x += (1.0 - this.offsetPerElement.x);
            this.fakeDims.y += (1.0 - this.offsetPerElement.y);

            if(this.layoutRequiresOffset())
            {
                this.fakeDims.y += 0.5 * this.offsetPerElement.y;
            }

            this.maxPixels = new Point({
                x: this.innerPageSize.x / this.fakeDims.x,
                y: this.innerPageSize.y / this.fakeDims.y
            })
        }

        if(params.dimsElement)
        {
            const ratio = (params.dimsElement.y / params.dimsElement.x);
            let newX = this.maxPixels.x;
            let newY = this.maxPixels.y;
            let scaleDown = 1.0;

            if(ratio <= 1) {
                newY = this.maxPixels.x * ratio;
                scaleDown = Math.min( (this.maxPixels.y / newY), 1.0);
            } else {
                newX = this.maxPixels.y * (1.0 / ratio);
                scaleDown = Math.min( (this.maxPixels.x / newX), 1.0);
            }

            this.maxPixels.y = newY * scaleDown;
            this.maxPixels.x = newX * scaleDown;
        }

        // this just overrides and recalculates using a fixed, absolute size (if given)
        if(params.absoluteElementSize) { 
            this.maxPixels = params.absoluteElementSize;
            this.dims = new Point({
                x: Math.floor( this.innerPageSize.x / this.maxPixels.x),
                y: Math.floor( this.innerPageSize.y / this.maxPixels.y),
            });
        }

        if(isNaN(this.maxPixels.x) || isNaN(this.maxPixels.y)) 
        { 
            console.error("GridMapper has NaN size for elements"); 
            return;
        }

        const spaceUsed = new Point({ x: this.maxPixels.x * this.fakeDims.x, y: this.maxPixels.y * this.fakeDims.y });
            
        // padding left/right/top/bottom around each element to center it
        this.padding = new Point({
            x: (this.innerPageSize.x - spaceUsed.x) / this.dims.x,
            y: (this.innerPageSize.y - spaceUsed.y) / this.dims.y
        });

        this.elementsPerPage = this.dims.x * this.dims.y;
        this.calculateElementPositions();
    }

    getElementsPerPage() : number
    {
        return this.elementsPerPage;
    }

    getMaxElementSize() : Point
    {
        return this.maxPixels.clone();
    }

    getMaxElementSizeAsSquare() : Point
    {			
        const maxSize = this.getMaxElementSize();
        const smallestSize = Math.min(maxSize.x, maxSize.y);
        return new Point().setXY(smallestSize, smallestSize);
    }

    layoutRequiresOffset() : boolean
    {
        return this.layoutShape == GridMapperLayout.HEXAGON || this.layoutShape == GridMapperLayout.CIRCLE;
    }

    calculateElementPositions()
    {
        const arr = [];
        const totalSizePerElement = new Point({
            x: this.offsetPerElement.x * this.maxPixels.x + this.padding.x,
            y: this.offsetPerElement.y * this.maxPixels.y + this.padding.y
        });

        for(let i = 0; i < this.getElementsPerPage(); i++)
        {
            const col = i % this.dims.x;
            const row = Math.floor(i / this.dims.x);
    
            let offsetX = 0, offsetY = 0;
            let offsetColumn = false;
            if(this.layoutRequiresOffset()) { offsetColumn = (col % 2 == 1); }
            if(offsetColumn) { offsetY = 0.5 * this.offsetPerElement.y * this.maxPixels.y; }

            const anchor = {
                x: this.outerMargin.x + offsetX,
                y: this.outerMargin.y + offsetY
            }

            const x = Math.floor(anchor.x + col * totalSizePerElement.x);
            const y = Math.floor(anchor.y + row * totalSizePerElement.y);
            arr.push(new Point().setXY(x,y));
        }
        
        this.elementPositions = arr;
    }

    addElements(elems:HTMLCanvasElement[])
    {
        for(const elem of elems)
        {
            this.addElement(elem);
        }
    }

    addElement(elem:HTMLCanvasElement)
    {
        this.addNewCanvasIfNeeded();

        const canv = this.canvases[this.canvases.length - 1];
        const pos = this.elementPositions[this.currentElement];
        
        const scaleX = (this.maxPixels.x - this.innerMargin.x) / elem.width;
        const scaleY = (this.maxPixels.y - this.innerMargin.y) / elem.height;
        const finalScale = Math.min(scaleX, scaleY);

        const finalWidth = Math.floor(elem.width * finalScale);
        const finalHeight = Math.floor(elem.height * finalScale);

        const marginX = this.maxPixels.x - finalWidth;
        const marginY = this.maxPixels.y - finalHeight;

        const innerPaddingX = 0.5*marginX + 0.5*this.padding.x;
        const innerPaddingY = 0.5*marginY + 0.5*this.padding.y;

        const finalX = pos.x + innerPaddingX;
        const finalY = pos.y + innerPaddingY;

        const ctx = canv.getContext("2d");
        ctx.resetTransform();
        ctx.drawImage(elem, finalX, finalY, finalWidth, finalHeight);

        this.currentElement += 1;

        if(this.debug)
        {
            ctx.strokeStyle = "#FF0000";
            ctx.lineWidth = 2;
            ctx.strokeRect(pos.x, pos.y, this.maxPixels.x, this.maxPixels.y);

            ctx.strokeStyle = "#0000FF";
            ctx.lineWidth = 5;
            ctx.strokeRect(finalX, finalY, finalWidth, finalHeight);
        }
    }

    addNewCanvasIfNeeded()
    {
        if(this.currentElement < this.elementsPerPage && this.canvases.length > 0) { return; }
        this.addNewCanvas();
    }

    addNewCanvas()
    {
        const canv = createCanvas({ width: this.pageSize.x, height: this.pageSize.y });
        this.canvases.push(canv);
        this.currentElement = 0;

        // debug draws inner page size
        if(this.debug)
        {
            const ctx = canv.getContext("2d");
            ctx.strokeStyle = "#000000";
            ctx.lineWidth = 10;
            ctx.strokeRect(this.outerMargin.x, this.outerMargin.y, this.innerPageSize.x, this.innerPageSize.y);
        }
    }

    getCanvases() : HTMLCanvasElement[]
    {
        return this.canvases;
    }
}