import Point from "js/pq_games/tools/geometry/point"
import CanvasEffect from "./effects/canvasEffect"
import ResourceImage from "js/pq_games/layout/resources/resourceImage"

export default class CanvasOperation
{

    pos : Point
    rotation : number
    size : Point
    scale : Point
    alpha : number

    pivot : Point
    flipX : boolean
    flipY : boolean

    images : ResourceImage[]
    effects : CanvasEffect[]
    
    frame: number // frame of image (spritesheets)

    constructor(params:any = {})
    {
        this.pos = params.pos ?? new Point();
        this.rotation = params.rotation ?? 0;
        this.size = params.size ?? new Point().setXY(100, 100);
        this.scale = params.scale ?? new Point().setXY(1,1);
        this.alpha = params.alpha ?? 1.0;

        this.pivot = params.pivot ?? new Point();
        this.flipX = params.flipX ?? false;
        this.flipY = params.flipY ?? false;
        this.frame = params.frame ?? 0;

        this.images = [];
        this.effects = [];
    }

    addImage(img:ResourceImage)
    {
        this.images.push(img);
    }

    removeImage(img:ResourceImage)
    {
        this.images.splice(this.images.indexOf(img), 1);
    }

    addEffect(fx:CanvasEffect)
    {
        this.effects.push(fx);
    }

    removeEffect(fx:CanvasEffect)
    {
        this.effects.splice(this.effects.indexOf(fx), 1);
    }

    apply(canv:HTMLCanvasElement)
    {
        const ctx = canv.getContext("2d");
        ctx.save();

        ctx.translate(this.pos.x, this.pos.y);
        ctx.globalAlpha = this.alpha;
        ctx.rotate(this.rotation);

        const finalScale = this.scale.clone();
        if(this.flipX) { finalScale.x *= -1; }
        if(this.flipY) { finalScale.y *= -1; }
        ctx.scale(this.scale.x, this.scale.y);

        const offset = this.pivot.clone();
        offset.scaleFactor(-1).scale(this.size);
        for(const img of this.images)
        {
            const frameData = img.getFrameData(this.frame);
            ctx.drawImage(
                img.getImage(), 
                frameData.x, frameData.y, frameData.width, frameData.height,
                offset.x, offset.y, this.size.x, this.size.y
            );
        }

        /*
        @TODO: these effects often apply to the images, not the canvas after they've been placed, right?
        @TODO: I at least need the TINT and DROP SHADOW to work again
        for(const effect of this.effects)
        {
            effect.applyToContext(ctx);
        }*/

        ctx.restore();
    }
}