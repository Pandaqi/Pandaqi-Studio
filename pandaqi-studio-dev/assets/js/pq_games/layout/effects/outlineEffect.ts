import { CanvasLike } from "../resources/resourceImage"
import createContext from "../canvas/createContext"
import LayoutEffect from "./layoutEffect";
import Color from "../color/color";
import Point from "js/pq_games/tools/geometry/point";
import EffectsOperation from "./effectsOperation";
import { OutlineFilter } from "js/pq_games/pixi/pixi-filters.mjs";

interface OutlineEffectParams
{
    color?: Color,
    thickness?: number,
}

const OFFSETS = [
    new Point(-1,-1),
    new Point(0,-1),
    new Point(1,-1),
    new Point(-1,0),
    new Point(1,0),
    new Point(-1,1),
    new Point(0,1),
    new Point(1,1)
]

export default class OutlineEffect extends LayoutEffect
{
    color: Color
    thickness: number

    constructor(params:OutlineEffectParams = {})
    {
        super(params);
        this.color = new Color(params.color ?? "#FFFFFF");
        this.thickness = params.thickness ?? 5;
    }

    clone(deep = false)
    {
        return new OutlineEffect({ color: this.color.clone(), thickness: this.thickness });
    }

    // @SOURCE: https://stackoverflow.com/questions/28207232/draw-border-around-nontransparent-part-of-image-on-canvas
    // @TODO: this is too rough, especially on larger canvases, implement marching squares instead
    applyToCanvasPost(source:CanvasLike)
    {
        if(source instanceof CanvasRenderingContext2D) { source = source.canvas; }

        const size = new Point(source.width, source.height);
        const contextParams = { size: size, alpha: true }
        const ctx = createContext(contextParams);

        // just draw the image many times, but offset in all directions
        for(let i = 0; i < OFFSETS.length; i++)
        {
            for(let t = 1; t <= Math.round(this.thickness); t++)
            {
                const pos = OFFSETS[i].clone().scale(t).round();
                ctx.drawImage(source, pos.x, pos.y);
            }
        }

        // use composite mode to make all these redraws the same color
        ctx.globalCompositeOperation = "source-in";
        ctx.fillStyle = this.color.toString();
        ctx.fillRect(0, 0, size.x, size.y);

        // draw original on top
        ctx.globalCompositeOperation = "source-over";
        ctx.drawImage(source, 0, 0);
        return ctx;
    }

    // @SOURCE: https://stackoverflow.com/questions/12690444/css-border-on-png-image-with-transparent-parts (further down the page)
    applyToHTML(div:HTMLElement, effOp = new EffectsOperation())
    {
        const t = this.thickness;
        const c = this.color.toString();
        const filters = [];
        for(let i = 0; i < OFFSETS.length; i++)
        {
            const pos = OFFSETS[i].clone().scale(this.thickness);
            filters.push("drop-shadow(" + pos.x + "px " + pos.y + "px 0 " + c + ")");
        }

        effOp.addFilters(filters);
    }

    getExtraSizeAdded()
    {
        return new Point(this.thickness);
    }

    applyToPixi(effOp = new EffectsOperation(), obj)
    {
        effOp.addFilterPixi(new OutlineFilter({
            alpha: this.color.a,
            color: this.color.toHEXNumber(),
            knockout: false,
            quality: 0.3,
            thickness: this.thickness
        }));
    }
}