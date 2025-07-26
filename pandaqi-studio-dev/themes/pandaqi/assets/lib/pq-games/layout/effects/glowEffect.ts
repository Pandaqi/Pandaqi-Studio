import Point from "js/pq_games/tools/geometry/point";
import Color from "../color/color";
import EffectsOperation from "./effectsOperation";
import LayoutEffect from "./layoutEffect";

interface GlowParams
{
    blur?:number,
    size?:number, // legacy support
    blurRadius?:number // legacy support
    color?:Color|string,
    offset?:Point
}

export default class GlowEffect extends LayoutEffect
{
    blurRadius: number;
    color: Color;
    offset: Point;
    
    constructor(params:GlowParams = {})
    {
        super(params);

        this.blurRadius = ((params.size ?? params.blur) ?? params.blurRadius) ?? 0;
        this.color = new Color(params.color ?? "#FFFFFF");
        this.offset = params.offset ?? new Point();
    }

    clone(deep = false)
    {
        const off = deep ? this.offset.clone() : this.offset;
        const eff = new GlowEffect({
            blur: this.blurRadius,
            color: this.color,
            offset: off
        });
        return eff;
    }

    applyShadow(ctx:CanvasRenderingContext2D, effOp = new EffectsOperation())
    {
        ctx.shadowColor = this.color.toString();
        ctx.shadowBlur = this.blurRadius;
        ctx.shadowOffsetX = this.offset.x;
        ctx.shadowOffsetY = this.offset.y;
    }

    applyToHTML(div:HTMLDivElement, effOp = new EffectsOperation())
    {
        effOp.addFilter(this.createFilterString());
    }

    applyToPixi(filtersConstructor, effOp = new EffectsOperation(), obj)
    {
        effOp.addFilterPixi(new filtersConstructor.GlowFilter({
            alpha: this.color.a,
            color: this.color.toHEXNumber(),
            distance: this.blurRadius,
            innerStrength: 0,
            knockout: false,
            //outerStrength: this.offset.length()
            quality: 0.3
        }));
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