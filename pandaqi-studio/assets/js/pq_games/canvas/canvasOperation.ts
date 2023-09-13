import Point from "js/pq_games/tools/geometry/point"
import CanvasEffect from "./effects/canvasEffect"
import ResourceImage from "js/pq_games/layout/resources/resourceImage"

export default class CanvasOperation
{

    translate : Point
    rotation : number
    scale : Point

    alpha : number

    dims : Point
    pivot : Point
    flipX : boolean
    flipY : boolean

    image : ResourceImage
    effects : CanvasEffect[]
    
    frame: number // frame of image (spritesheets)

    constructor(params:Record<string,any> = {})
    {
        this.translate = params.translate ?? new Point();
        this.rotation = params.rotation ?? 0;
        this.dims = (params.dims ?? params.size) ?? new Point().setXY(100, 100);
        this.scale = params.scale ?? new Point().setXY(1,1);
        this.alpha = params.alpha ?? 1.0;

        this.pivot = params.pivot ?? new Point();
        this.flipX = params.flipX ?? false;
        this.flipY = params.flipY ?? false;
        this.frame = params.frame ?? 0;

        this.image = params.image ?? null;
        this.effects = params.effects ?? [];
    }

    addImage(img:ResourceImage)
    {
        this.image = img;
    }

    removeImage(img:ResourceImage)
    {
        this.image = null;
    }

    addEffect(fx:CanvasEffect)
    {
        this.effects.push(fx);
    }

    removeEffect(fx:CanvasEffect)
    {
        this.effects.splice(this.effects.indexOf(fx), 1);
    }

    getFinalScale() : Point
    {
        const scale = this.scale.clone();
        if(this.flipX) { scale.x *= -1; }
        if(this.flipY) { scale.y *= -1; }
        return scale;
    }

    async apply(canv:HTMLCanvasElement)
    {
        const ctx = canv.getContext("2d");
        ctx.save();

        ctx.translate(this.translate.x, this.translate.y);
        ctx.globalAlpha = this.alpha;
        ctx.rotate(this.rotation);

        const finalScale = this.getFinalScale();
        ctx.scale(finalScale.x, finalScale.y);

        let image = this.image.clone();
        for(const effect of this.effects)
        {
            await effect.applyToContext(ctx, image);
        }

        const offset = this.pivot.clone();
        offset.scaleFactor(-1).scale(this.dims);

        const frameData = image.getFrameData(this.frame);
        ctx.drawImage(
            image.getImage(), 
            frameData.x, frameData.y, frameData.width, frameData.height,
            offset.x, offset.y, this.dims.x, this.dims.y
        );

        ctx.restore();
    }

    applyToHTML(div:HTMLElement)
    {
        // all the transform stuff
        const transforms = []
        if(this.rotation != 0) 
        { 
            transforms.push("rotate(" + this.rotation + "deg)"); 
        }

        if(this.translate.length() > 0) 
        { 
            transforms.push("translate(" + this.translate.x + ", " + this.translate.y + ")");
        }

        const scale = this.getFinalScale();
        if(scale.x != 1 || scale.y != 1)
        {
            transforms.push("scale(" + scale.x + ", " + scale.y + ")");
        }

        if(transforms.length > 0)
        {
            div.style.transform += " " + transforms.join(" ");
        }

        // all the filter stuff to make special things happen
        for(const effect of this.effects)
        {
            effect.applyToHTML(div);
        }
    }
}