import { TextConfig, TextAlign } from "./textConfig"
import Dims from "js/pq_games/tools/geometry/dims"
import Point from "js/pq_games/tools/geometry/point"

interface TextBlock
{
    x: number,
    y: number,
    width: number,
    height: number
}

export default class TextDrawer
{
    HAIR_SPACE = '\u200a'

    text:string
    dims:Dims
    cfg:TextConfig
    textBlockDims:TextBlock
    debug: boolean

    constructor(text:string, dims:Dims, cfg:TextConfig)
    {
        this.text = text ?? "";
        this.dims = dims ?? new Dims();
        this.cfg = cfg;
    }

    drawTo(canv:HTMLCanvasElement)
    {
        const ctx = canv.getContext("2d");
        const style = this.cfg.getCanvasFontString();
        ctx.font = style;

        // @ts-ignore
        const x = parseInt(this.dims.position.x);
        // @ts-ignore
        const y = parseInt(this.dims.position.y);
        // @ts-ignore
        const width = parseInt(this.dims.size.x);
        // @ts-ignore
        const height = parseInt(this.dims.size.y);

        if(width <= 0 || height <= 0 || this.cfg.size <= 0) { return; }

        // End points
        const xEnd = x + width
        const yEnd = y + height

        // @ts-ignore
        let txtY = y + height * 0.5 + parseInt(this.cfg.size) * 0.5

        let textanchor

        const alignH = this.cfg.alignHorizontal;
        const justified = (alignH == TextAlign.JUSTIFY)
        if(alignH === TextAlign.END) {
            textanchor = xEnd
            ctx.textAlign = 'right'
        } else if (alignH == TextAlign.START) {
            textanchor = x
            ctx.textAlign = 'left'
        } else {
            textanchor = x + width * 0.5
            ctx.textAlign = 'center'
        }

        const text = this.text;
        let textarray = []
        let temptextarray = text.split('\n')

        const spaceWidth = justified ? ctx.measureText(this.HAIR_SPACE).width : 0

        temptextarray.forEach((txtt) => 
        {
            let textwidth = ctx.measureText(txtt).width
            const fitsOnLine = (textwidth <= width);
            if (fitsOnLine) 
            {
                textarray.push(txtt);
                return;
            } 
            
            let temptext = txtt
            let linelen = width
            let textlen
            let textpixlen
            let texttoprint
            
            // as long as the line is too long, keep breaking it until that isn't the case anymore
            textwidth = ctx.measureText(temptext).width
            while (textwidth > linelen) {
                textlen = 0
                textpixlen = 0
                texttoprint = ''
                while (textpixlen < linelen) {
                    textlen++
                    texttoprint = temptext.slice(0, textlen)
                    textpixlen = ctx.measureText(temptext.slice(0, textlen)).width
                }

                // Remove last character that was out of the box
                textlen--
                texttoprint = texttoprint.slice(0, textlen)

                //if statement ensures a new line only happens at a space, and not amidst a word
                const backup = textlen
                if (temptext.slice(textlen, 1) != ' ') {
                    while (temptext.slice(textlen, 1) != ' ' && textlen != 0) {
                        textlen--
                    }
                    
                    if (textlen == 0) { textlen = backup }
                    texttoprint = temptext.slice(0, textlen)
                }

                if(justified) { texttoprint = this.justifyLine(ctx, texttoprint, spaceWidth, width) }

                temptext = temptext.slice(textlen)
                textwidth = ctx.measureText(temptext).width
                textarray.push(texttoprint)
            }
            
            if (textwidth > 0) {
                textarray.push(temptext)
            }
            // end foreach temptextarray
        })

        //close approximation of height with width
        const charHeight = (this.cfg.lineHeight * this.cfg.size) ?? this.getTextHeight(ctx, text, style) 
        const vheight = charHeight * (textarray.length - 1)
        const negoffset = 0.5 * vheight

        const alignV = this.cfg.alignVertical;
        if (alignV === TextAlign.START) {
            txtY = y + this.cfg.size
        } else if (alignV === TextAlign.END) {
            txtY = yEnd - vheight
        } else {
            txtY -= negoffset
        }

        // print all lines of text + track the actual bounding box
        let topLeftTotal = new Point(Infinity, Infinity);
        let bottomRightTotal = new Point(-Infinity, -Infinity);

        textarray.forEach(txtline => {
            txtline = txtline.trim()
            ctx.fillText(txtline, textanchor, txtY)
            const oldY = txtY
            txtY += charHeight

            const measure = ctx.measureText(txtline);
            let xLeft = textanchor, xRight = textanchor + measure.width
            if(alignH == TextAlign.MIDDLE) { xLeft -= 0.5*measure.width; xRight -= 0.5*measure.width; }
            if(alignH == TextAlign.END) { xLeft -= measure.width; xRight -= measure.width; }

            const topLeft = new Point(xLeft, oldY - measure.actualBoundingBoxAscent);
            const bottomRight = new Point(xRight, oldY + measure.actualBoundingBoxDescent);

            topLeftTotal.x = Math.min(topLeftTotal.x, topLeft.x);
            topLeftTotal.y = Math.min(topLeftTotal.y, topLeft.y);
            bottomRightTotal.x = Math.max(bottomRightTotal.x, bottomRight.x);
            bottomRightTotal.y = Math.max(bottomRightTotal.y, bottomRight.y);
        })

        // save the resulting dimensions
        this.textBlockDims = {
            x: topLeftTotal.x,
            y: topLeftTotal.y,
            width: (bottomRightTotal.x - topLeftTotal.x),
            height: (bottomRightTotal.y - topLeftTotal.y)
        }

        this.debugDraw(ctx);
    }

    debugDraw(ctx:CanvasRenderingContext2D)
    {
        if(!this.debug) { return; }

        // Text box
        ctx.lineWidth = 3
        ctx.strokeStyle = '#00AA00'
        ctx.strokeRect(
            this.dims.position.x, this.dims.position.y, 
            this.dims.size.x, this.dims.size.y
        )

        ctx.lineWidth = 2
        ctx.strokeStyle = '#000000'
        ctx.strokeRect(
            this.textBlockDims.x, this.textBlockDims.y, 
            this.textBlockDims.width, this.textBlockDims.height
        )
    }

    getDimensions()
    {
        return this.textBlockDims;
    }

    // Calculate Height of the font
    getTextHeight(ctx:CanvasRenderingContext2D, text:string, style:string) 
    {
        ctx.save();
        ctx.textBaseline = 'bottom'
        ctx.font = style
        const height = ctx.measureText(text).actualBoundingBoxAscent
        ctx.restore();

        return height
    }

    justifyLine(ctx:CanvasRenderingContext2D, line:string, spaceWidth:number, width:number) 
    {
        const text = line.trim()
        const lineWidth = ctx.measureText(text).width

        const nbSpaces = text.split(/\s+/).length - 1
        const nbSpacesToInsert = Math.floor((width - lineWidth) / spaceWidth)

        if (nbSpaces <= 0 || nbSpacesToInsert <= 0) return text

        // We insert at least nbSpacesMinimum and we add extraSpaces to the first words
        const nbSpacesMinimum = Math.floor(nbSpacesToInsert / nbSpaces)
        let extraSpaces = nbSpacesToInsert - nbSpaces * nbSpacesMinimum

        const spaceChar = this.HAIR_SPACE;
        let spaces = [].fill(spaceChar, 0, nbSpacesMinimum);
        let spacesString = spaces.join('')

        const justifiedText = text.replace(/\s+/g, (match:string) => {
            const allSpaces = extraSpaces > 0 ? spacesString + spaceChar : spacesString
            extraSpaces--
            return match + allSpaces
        })

        return justifiedText
    }
}