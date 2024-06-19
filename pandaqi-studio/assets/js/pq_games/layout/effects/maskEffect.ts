import createContext from "../canvas/createContext";
import LayoutOperation from "../layoutOperation";
import ResourceImage from "../resources/resourceImage";
import EffectsOperation from "./effectsOperation";
import LayoutEffect from "./layoutEffect";

interface MaskEffectParams
{
    resource?: ResourceImage,
    operation?: LayoutOperation
}

export default class MaskEffect extends LayoutEffect
{
    resource: ResourceImage
    operation: LayoutOperation

    constructor(params:MaskEffectParams = {})
    {
        super(params);
        this.resource = params.resource;
        this.operation = params.operation ?? new LayoutOperation();
    }

    clone(deep = false)
    {
        return new MaskEffect({ resource: this.resource, operation: this.operation });
    }

    applyToImage(drawable:ResourceImage)
    {
        if(!this.resource) { return drawable; }

        // place the mask as desired
        const ctx = createContext({ size: drawable.getSize() });
        this.resource.toCanvas(ctx, this.operation);

        // then stamp the original image on top, keeping only places where the MASK also exists
        ctx.globalCompositeOperation = 'source-in';
        ctx.drawImage(drawable.getImage(), 0, 0);

        return new ResourceImage(ctx.canvas);
    }

    applyToHTML(div:HTMLElement, effOp = new EffectsOperation())
    {
        div.style.maskImage = this.resource.getCSSUrl();
    }
}