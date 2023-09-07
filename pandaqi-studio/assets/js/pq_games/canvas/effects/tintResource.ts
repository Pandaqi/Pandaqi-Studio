import ResourceImage from "../../layout/resources/resourceImage"
import createContext from "../createContext"

// @TODO: or directly assign the result back into res.img??
export default (res:ResourceImage, params:Record<string,any> = {}) : HTMLCanvasElement =>
{
    const id = params.id || "";
    const color = params.color || "#FF0000";
    const size = res.size;
    
    // first, we get a mask just with the tint color
    const contextParams = { width: size.x, height: size.y, alpha: true }
    let ctx = createContext(contextParams);
    ctx.drawImage(res.img, 0, 0);
    ctx.globalCompositeOperation = "source-in";
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, contextParams.width, contextParams.height);

    // then we multiply that mask with the original image to do an actual, proper tinting
    let ctx2 = createContext(contextParams);
    ctx2.drawImage(res.img, 0, 0);
    ctx2.globalCompositeOperation = "multiply";
    ctx2.drawImage(ctx.canvas, 0, 0);
    return ctx2.canvas;
}