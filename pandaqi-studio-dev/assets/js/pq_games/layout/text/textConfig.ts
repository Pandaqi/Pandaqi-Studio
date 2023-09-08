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

export { TextConfig, TextAlign, TextStyle, TextWeight, TextVariant }
export default class TextConfig
{
    size: number
    font: string|ResourceFont
    alignHorizontal: TextAlign
    alignVertical: TextAlign
    lineHeight: number // @NOTE: this is RELATIVE to font size (as that's usually practical)
    style: TextStyle
    weight: TextWeight
    variant: TextVariant

    constructor(params:Record<string,any> = {})
    {
        this.size = (params.size ?? params.fontSize) ?? 16;
        this.font = params.font ?? "Arial";
        this.alignHorizontal = (params.align ?? params.alignHorizontal) ?? TextAlign.START;
        this.alignVertical = (params.alignVertical) ?? TextAlign.START;
        this.lineHeight = params.lineHeight ?? 1.2;
        this.style = params.style ?? TextStyle.NORMAL;
        this.weight = params.weight ?? TextWeight.REGULAR;
        this.variant = params.variant ?? TextVariant.NORMAL;
    }

    getStyleString() : String
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

    getCanvasFontString() : string
    {
        return [
            this.getStyleString(),this.getVariantString(),
            this.getWeightString(),this.getSizeString(),
            "'" + this.getNameString() + "'"
        ].join(" ");
    }
}