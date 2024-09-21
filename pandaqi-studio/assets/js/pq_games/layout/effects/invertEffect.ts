import EffectsOperation from "./effectsOperation";
import LayoutEffect from "./layoutEffect";

export default class InvertEffect extends LayoutEffect
{
    constructor()
    {
        super();
    }

    clone(deep = false)
    {
        return new InvertEffect();
    }

    applyToCanvas(ctx:CanvasRenderingContext2D, effOp = new EffectsOperation())
    {
        effOp.addFilter(this.createFilterString());
    }

    applyToHTML(div:HTMLDivElement, effOp = new EffectsOperation())
    {
        effOp.addFilter(this.createFilterString());
    }

    createFilterString()
    {
        return "invert()";
    }

    applyToPixi(filtersConstructor, effOp = new EffectsOperation(), obj)
    {
        const eff = new filtersConstructor.ColorMatrixFilter();
        eff.negative(false);
        effOp.addFilterPixi(eff);
    }
    
}