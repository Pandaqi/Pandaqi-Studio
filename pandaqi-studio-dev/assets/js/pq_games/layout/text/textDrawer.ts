import { TextConfig, TextAlign } from "./textConfig"
import Dims from "js/pq_games/tools/geometry/dims"
import Point from "js/pq_games/tools/geometry/point"
import { CanvasLike } from "../resources/resourceImage"
import LayoutOperation from "../layoutOperation"
import StrokeAlignValue from "../values/strokeAlignValue"

export default class TextDrawer
{
    HAIR_SPACE = '\u200a'

    text:string
    dims:Dims
    cfg:TextConfig
    textBlockDims:Dims
    debug: boolean

    constructor(text:string, dims:Dims, cfg:TextConfig)
    {
        this.text = text ?? "";
        this.dims = dims ?? new Dims();
        this.cfg = cfg;
    }

    measureText() : Dims
    {
        const canv = document.createElement("canvas");
        canv.width = 2048;
        canv.height = 2048;
        this.toCanvas(canv);
        return this.textBlockDims;
    }

    toCanvas(canv:CanvasLike, op:LayoutOperation = new LayoutOperation())
    {

        const ctx = (canv instanceof HTMLCanvasElement) ? canv.getContext("2d") : canv;
        ctx.save();

        const style = this.cfg.getCanvasFontString();
        ctx.font = style;
        //ctx.fillStyle = this.cfg.color;

        // @ts-ignore
        const x = parseInt(this.dims.position.x);
        // @ts-ignore
        const y = parseInt(this.dims.position.y);
        // @ts-ignore
        let width = parseInt(this.dims.size.x);
        // @ts-ignore
        let height = parseInt(this.dims.size.y);

        if(width <= 0) { width = 100000 }
        if(height <= 0) { height = 100000 }

        if(this.cfg.size <= 0) { return; }

        // End points
        const xEnd = x + width
        const yEnd = y + height

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
                if (temptext.charAt(textlen) != ' ') 
                {
                    while (temptext.charAt(textlen) != ' ' && textlen != 0) {
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

        // figure out total size of the block
        const charHeight = (this.cfg.lineHeight * this.cfg.size) ?? this.getTextHeight(ctx, text, style) 

        const topLeftTotal = new Point(Infinity, Infinity);
        const bottomRightTotal = new Point(-Infinity, -Infinity);
        let tempTextY = 0;
        let ascents = [];
        let descents = [];
        textarray.forEach(txtline => {
            txtline = txtline.trim()

            const measure = ctx.measureText(txtline);
            let xLeft = textanchor, xRight = textanchor + measure.width
            if(alignH == TextAlign.MIDDLE) { xLeft -= 0.5*measure.width; xRight -= 0.5*measure.width; }
            if(alignH == TextAlign.END) { xLeft -= measure.width; xRight -= measure.width; }

            const ascent = measure.actualBoundingBoxAscent;
            ascents.push(ascent);

            const descent = measure.actualBoundingBoxDescent;
            descents.push(descent);

            const topLeft = new Point(xLeft, tempTextY - ascent);
            const bottomRight = new Point(xRight, tempTextY + descent);

            topLeftTotal.x = Math.min(topLeftTotal.x, topLeft.x);
            topLeftTotal.y = Math.min(topLeftTotal.y, topLeft.y);
            bottomRightTotal.x = Math.max(bottomRightTotal.x, bottomRight.x);
            bottomRightTotal.y = Math.max(bottomRightTotal.y, bottomRight.y);

            tempTextY += charHeight;
        })

        const rawDims = new Dims(
            topLeftTotal.x,
            topLeftTotal.y,
            (bottomRightTotal.x - topLeftTotal.x),
            (bottomRightTotal.y - topLeftTotal.y)
        );

        const realHeight = rawDims.size.y;

        let txtY;
        const alignV = this.cfg.alignVertical;
        // @TODO: vertical justify not yet implemented
        if (alignV === TextAlign.START) {
            txtY = y + ascents[0]
        } else if (alignV === TextAlign.END) {
            txtY = yEnd - realHeight // @TODO: is this still correct now that I use the TRUE dimensions?
        } else if(alignV == TextAlign.MIDDLE) {
            // center within dims, then remove half the height to find top anchor point
            txtY = y + 0.5 * height + ascents[0] - 0.5*realHeight;
        }

        // save the resulting dimensions
        // we should already be absolutely certain about them here, so this is also a correctness test
        this.textBlockDims = rawDims.clone().move(new Point(0, txtY));

        // print all lines of text + track the actual bounding box
        textarray.forEach(txtline => {
            txtline = txtline.trim()

            const pos = new Point(textanchor, txtY);
            const text = txtline;

            // this is the one line that actually draws text!
            this.fillAndStrokeText(ctx, text, pos, op);

            // and moves to next line
            txtY += charHeight
        })

        this.debugDraw(ctx);
        ctx.restore();
    }

    fillAndStrokeText(ctx:CanvasRenderingContext2D, txt:string, pos:Point, op:LayoutOperation)
    {
        const strokeBeforeFill = op.strokeAlign == StrokeAlignValue.OUTSIDE;
        const clipStroke = op.strokeAlign == StrokeAlignValue.INSIDE;

        // @TODO: Clipping (for the inside stroke) NOT IMPLEMENTED YET
        // Clipping only works for paths, and text is not a path
        // Use secondary image and masking for this!
        // @SOURCE: https://stackoverflow.com/questions/7307430/html-canvas-clipping-and-text

        if(strokeBeforeFill) {
            ctx.strokeText(txt, pos.x, pos.y);
            ctx.fillText(txt, pos.x, pos.y);
        } else {
            ctx.fillText(txt, pos.x, pos.y);
            ctx.strokeText(txt, pos.x, pos.y);
        }
    }

    /*
    applyFillAndStroke(ctx:CanvasRenderingContext2D, path:Path2D, callback:Function = null)
    {
        const strokeBeforeFill = this.strokeAlign == StrokeAlignValue.OUTSIDE;
        const clipStroke = this.strokeAlign == StrokeAlignValue.INSIDE;

        if(clipStroke) { ctx.save(); ctx.clip(path); }

        if(strokeBeforeFill) {
            ctx.stroke(path);
            ctx.fill(path);
            if(callback) { callback(); }
        } else {
            ctx.fill(path);
            if(callback) { callback(); }
            ctx.stroke(path);
        }

        if(clipStroke) { ctx.restore(); }
    }

    */

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
            this.textBlockDims.position.x, this.textBlockDims.position.y, 
            this.textBlockDims.size.x, this.textBlockDims.size.y
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