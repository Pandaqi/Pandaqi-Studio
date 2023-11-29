import ColorLike from "../color/colorLike"
import LayoutOperation from "../layoutOperation"
import ResourceFont from "../resources/resourceFont"
import ResourceLoader from "../resources/resourceLoader"

enum TextAlign {
    START,
    MIDDLE,
    END,
    JUSTIFY
}

enum TextStyle {
    NORMAL,
    ITALIC
}

enum TextWeight {
    THIN,
    LIGHT,
    REGULAR,
    BOLD,
    BLACK
}

enum TextVariant {
    NORMAL,
    SMALLCAPS
}

interface TextConfigParams
{
    size?: number
    fontSize?: number
    font?: string|ResourceFont
    fontFamily?: string|ResourceFont
    align?: TextAlign
    alignHorizontal?: TextAlign
    alignVertical?: TextAlign
    lineHeight?: number // @NOTE: this is RELATIVE to font size (as that's usually practical)
    style?: TextStyle
    weight?: TextWeight
    variant?: TextVariant

    resLoader?:ResourceLoader // for text that draws icons/images inline
    defaultImageOperation?:LayoutOperation
    useDynamicLineHeight?:boolean
    heightToSizeRatio?: number
}

// By default, the HEIGHT of a font is roughly 50%-60% of the font SIZE ( = letter width)
// (this is a CONSERVATIVE estimate, for most fonts!)
const DEF_HEIGHT_TO_SIZE_RATIO = 1.5; 

export { TextConfig, TextAlign, TextStyle, TextWeight, TextVariant }
export default class TextConfig
{
    color: ColorLike
    size: number
    font: string|ResourceFont
    alignHorizontal: TextAlign
    alignVertical: TextAlign
    lineHeight: number
    style: TextStyle
    weight: TextWeight
    variant: TextVariant

    defaultImageOperation: LayoutOperation;
    resLoader: ResourceLoader;
    useDynamicLineHeight: boolean;
    heightToSizeRatio: number;
    history: Record<string,any>

    constructor(params:TextConfigParams = {})
    {
        this.size = (params.size ?? params.fontSize) ?? 16;
        this.font = (params.font ?? params.fontFamily) ?? "Arial";
        this.alignHorizontal = (params.align ?? params.alignHorizontal) ?? TextAlign.START;
        this.alignVertical = (params.alignVertical) ?? TextAlign.START;
        this.lineHeight = params.lineHeight ?? 1.2;
        this.useDynamicLineHeight = params.useDynamicLineHeight ?? false;
        this.style = params.style ?? TextStyle.NORMAL;
        this.weight = params.weight ?? TextWeight.REGULAR;
        this.variant = params.variant ?? TextVariant.NORMAL;
        this.resLoader = params.resLoader ?? null;
        this.defaultImageOperation = params.defaultImageOperation ?? null;
        this.heightToSizeRatio = params.heightToSizeRatio ?? DEF_HEIGHT_TO_SIZE_RATIO;
        this.history = {};
    }

    clone(deep = true) : TextConfig
    {
        const tf = new TextConfig();
        for(const prop in this)
        {
            // @ts-ignore
            tf[prop] = this[prop]
        }

        if(deep)
        {
            this.history = structuredClone(this.history);
        }

        return tf;
    }

    getStyleString() : string
    {
        if(this.style == TextStyle.NORMAL) { return "normal"; }
        return "italic";
    }

    getVariantString() : string
    {
        if(this.variant == TextVariant.NORMAL) { return "normal"; }
        return "small-caps"
    }
    
    getWeightString() : string
    {
        if(this.weight == TextWeight.THIN) { return "100"; }
        else if(this.weight == TextWeight.LIGHT) { return "300"; }
        else if(this.weight == TextWeight.REGULAR) { return "500"; }
        else if(this.weight == TextWeight.BOLD) { return "700"; }
        return "900";
    }

    getSizeString() : string
    {
        return this.size + "px";
    }

    getNameString() : string
    {
        if(this.font instanceof ResourceFont) { return this.font.name; }
        return this.font;
    }

    getAlignString() : string
    {
        const h = this.alignHorizontal;
        if(h == TextAlign.START) { return "left"; }
        else if(h == TextAlign.MIDDLE) { return "center"; }
        else if(h == TextAlign.END) { return "right"; }
        else if(h == TextAlign.JUSTIFY) { return "justify"; }
    }

    getAlignVerticalString() : string
    {
        const v = this.alignVertical;
        if(v == TextAlign.START) { return "top"; }
        else if(v == TextAlign.MIDDLE) { return "middle"; }
        else if(v == TextAlign.END) { return "bottom"; }
        else if(v == TextAlign.JUSTIFY) { return "baseline"; }
    }

    getCanvasFontString() : string
    {
        return [
            this.getStyleString(),this.getVariantString(),
            this.getWeightString(),this.getSizeString(),
            "'" + this.getNameString() + "'"
        ].join(" ");
    }

    getFontFaceDescriptors() : FontFaceDescriptors
    {
        return {
            style: this.getStyleString(),
            weight: this.getWeightString(),
            display: "swap"
        }
    }

    applyToHTML(elem:HTMLElement)
    {
        elem.style.fontFamily = '"' + this.getNameString() + '"';
        elem.style.fontWeight = this.getWeightString();
        elem.style.fontVariant = this.getVariantString();
        elem.style.fontStyle = this.getStyleString();
        elem.style.fontSize = this.getSizeString();
        elem.style.lineHeight = (this.lineHeight * 100) + "%";
        elem.style.textAlign = this.getAlignString();
        elem.style.verticalAlign = this.getAlignVerticalString();
    }

    applyToCanvas(ctx:CanvasRenderingContext2D)
    {
        ctx.font = this.getCanvasFontString();
        if(this.color) { ctx.fillStyle = this.color.toCanvasStyle(ctx); }
    }

    rollbackProperty(prop:string)
    {
        const hist = this.history[prop];
        if(!hist || hist.length <= 0) { return; }
        this[prop] = hist.pop();
    }

    updateProperty(prop:string, val:any, keepHistory = true)
    {
        if(keepHistory) 
        {
            if(!(prop in this.history)) { this.history[prop] = []; }
            this.history[prop].push(this[prop]);
        }

        // @TODO: find some cleaner conversion function, or remove the need for this completely?
        if(prop == "color") { val = new ColorLike(val); }

        this[prop] = val;
    }
}