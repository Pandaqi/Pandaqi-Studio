import { ElementLike } from "../resources/resource";
import { CanvasDrawableLike } from "../resources/resourceImage";
import LayoutEffect from "./layoutEffect";

export default class EffectsOperation
{
    effects:LayoutEffect[];
    filters: string[];

    constructor(eff = [])
    {
        this.effects = eff;
        this.resetData();
    }

    isEmpty() { return this.effects.length <= 0; }
    resetData()
    {
        this.filters = [];
    }

    applyToCanvasPre(ctx:CanvasRenderingContext2D)
    {
        if(this.isEmpty()) { return; }        
        for(const effect of this.effects)
        {
            effect.applyToCanvas(ctx, this);
        }
        return ctx;
    }

    applyToCanvasPost(ctx:CanvasRenderingContext2D)
    {
        if(this.isEmpty()) { return ctx; }
        for(const effect of this.effects)
        {
            ctx = effect.applyToCanvasPost(ctx) ?? ctx;
        }
        return ctx;
    }

    applyToDrawable(drawable:CanvasDrawableLike)
    {
        if(this.isEmpty()) { return drawable; } 
        for(const effect of this.effects)
        {
            drawable = effect.applyToImage(drawable, this) ?? drawable;
        }
        return drawable;
    }

    applyToHTML(node:ElementLike)
    {
        if(this.isEmpty()) { return node; }
        for(const effect of this.effects)
        {
            effect.applyToHTML(node, this);
        }
        return node;
    }

    addFilters(fs:string[])
    {
        for(const elem of fs) { this.addFilter(elem); }
    }

    addFilter(f:string)
    {
        this.filters.push(f);
    }

    removeFilter(f:string)
    {
        const idx = this.filters.indexOf(f);
        if(idx < 0) { return; }
        this.filters.splice(idx, 1);
    }

    getFilterString()
    {
        return this.filters.length <= 0 ? "none" : this.filters.join(" ");
    }
}