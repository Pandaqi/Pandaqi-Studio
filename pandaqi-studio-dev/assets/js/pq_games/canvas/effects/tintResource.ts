import ResourceImage from "../../layout/resources/resourceImage"
import createContext from "../createContext"
import CanvasEffect from "./canvasEffect";

export default class TintEffect extends CanvasEffect
{
    color: string

    constructor(params:Record<string,any> = {})
    {
        super(params);
    }

    async applyToImage(image:ResourceImage)
    {
        await this.applyToContext(null, image);
    }

    async applyToContext(_ctx:CanvasRenderingContext2D, image:ResourceImage)
    {
        // first, we get a mask just with the tint color
        const contextParams = { width: image.size.x, height: image.size.y, alpha: true }
        const ctx = createContext(contextParams);
        ctx.drawImage(image.getImage(), 0, 0);
        ctx.globalCompositeOperation = "source-in";
        ctx.fillStyle = this.color;
        ctx.fillRect(0, 0, contextParams.width, contextParams.height);

        // then we multiply that mask with the original image to do an actual, proper tinting
        const ctx2 = createContext(contextParams);
        ctx2.drawImage(image.getImage(), 0, 0);
        ctx2.globalCompositeOperation = "multiply";
        ctx2.drawImage(ctx.canvas, 0, 0);

        const img = document.createElement("img");
        img.src = ctx2.canvas.toDataURL();
        await img.decode();
        image.swapImage(img);
    }

    // @TODO: not really a robust system for tinting ...
    applyToHTML(div:HTMLElement)
    {
        div.style.mixBlendMode = "multiply";
        div.style.backgroundColor = this.color;
    }
}