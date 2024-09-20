import Point from "js/pq_games/tools/geometry/point";
import LayoutEffect from "./layoutEffect";
import EffectsOperation from "./effectsOperation";
import { ColorLikeValue } from "../color/colorLike";

import { DropShadowFilter } from "../../pixi/pixi-filters.mjs";
import Color from "../color/color";

interface DropShadowParams
{
    blur?:number,
    size?:number, // legacy support
    blurRadius?:number // legacy support
    color?:Color|string,
    offset?:Point
}

export default class DropShadowEffect extends LayoutEffect
{
    blurRadius: number;
    color: Color;
    offset: Point;
    
    constructor(params:DropShadowParams = {})
    {
        super(params);

        this.blurRadius = ((params.size ?? params.blur) ?? params.blurRadius) ?? 0;
        this.color = new Color(params.color ?? "#000000");
        this.offset = params.offset ?? new Point();
    }

    clone(deep = false)
    {
        const off = deep ? this.offset.clone() : this.offset;
        const eff = new DropShadowEffect({
            blur: this.blurRadius,
            color: this.color,
            offset: off,
        });
        return eff;
    }

    applyToCanvas(ctx:CanvasRenderingContext2D, effOp = new EffectsOperation())
    {
        effOp.addFilter(this.createFilterString());
    }

    applyToHTML(div:HTMLDivElement, effOp = new EffectsOperation())
    {
        effOp.addFilter(this.createFilterString());
    }

    applyToPixi(effOp = new EffectsOperation(), obj)
    {
        const filter = new DropShadowFilter({
            alpha: this.color.a,
            color: this.color.toHEXNumber(),
            blur: this.blurRadius,
            offset: this.offset,
            quality: 8
        });
        effOp.addFilterPixi(filter);
    }

    createFilterString()
    {
        return "drop-shadow(" + this.offset.x + "px " + this.offset.y + "px " + this.blurRadius + "px " + this.color + ")"
    }

    getExtraSizeAdded()
    {
        const offsetDir = this.offset.clone().normalize();
        return this.offset.clone().move(offsetDir.scale(0.5 * this.blurRadius));
    }
    
}