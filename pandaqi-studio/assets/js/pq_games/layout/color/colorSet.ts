import Color, { ColorRaw } from "./color";

export default class ColorSet
{
    base: Color;
    inkfriendly: Color;

    constructor(base:ColorRaw, inkfriendly:ColorRaw)
    {
        this.base = new Color(base);
        this.inkfriendly = new Color(inkfriendly ?? this.base);
    }

    setInkBlack() { this.inkfriendly = Color.BLACK.clone(); }
    setInkWhite() { this.inkfriendly = Color.WHITE.clone(); }
    setInkTransparent() { this.inkfriendly = Color.TRANSPARENT.clone(); }

    select(inkfriendly = false)
    {
        if(inkfriendly) { return this.inkfriendly; }
        return this.base;
    }
}