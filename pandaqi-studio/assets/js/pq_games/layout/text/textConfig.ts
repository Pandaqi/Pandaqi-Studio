import ResourceFont from "../resources/resourceFont"

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
}

export { TextConfig, TextAlign, TextStyle, TextWeight, TextVariant }
export default class TextConfig
{
    size: number
    font: string|ResourceFont
    alignHorizontal: TextAlign
    alignVertical: TextAlign
    lineHeight: number
    style: TextStyle
    weight: TextWeight
    variant: TextVariant

    constructor(params:TextConfigParams = {})
    {
        this.size = (params.size ?? params.fontSize) ?? 16;
        this.font = (params.font ?? params.fontFamily) ?? "Arial";
        this.alignHorizontal = (params.align ?? params.alignHorizontal) ?? TextAlign.START;
        this.alignVertical = (params.alignVertical) ?? TextAlign.START;
        this.lineHeight = params.lineHeight ?? 1.2;
        this.style = params.style ?? TextStyle.NORMAL;
        this.weight = params.weight ?? TextWeight.REGULAR;
        this.variant = params.variant ?? TextVariant.NORMAL;
    }

    clone() : TextConfig
    {
        const tf = new TextConfig();
        for(const prop in this)
        {
            // @ts-ignore
            tf[prop] = this[prop]
        }
        return tf;
    }

    getStyleString() : string
    {
        if(this.style == TextStyle.NORMAL) { return ""; }
        return "italic";
    }

    getVariantString() : string
    {
        if(this.variant == TextVariant.NORMAL) { return ""; }
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
}