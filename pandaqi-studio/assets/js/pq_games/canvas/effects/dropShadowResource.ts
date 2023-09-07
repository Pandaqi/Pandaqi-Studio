import ResourceImage from "../../layout/resources/resourceImage"
import createContext from "../createContext"

export default (res:ResourceImage, params:Record<string,any> = {}) : HTMLCanvasElement =>
{
    const size = res.size;
    const color = params.color || "#000000";
    const offset = params.offset || { x: 0, y: 0 };
    const blurRadius = params.blur || 12;

    const contextParams = { width: size.x, height: size.y, alpha: true }
    let ctx = createContext(contextParams);
    ctx.filter = "drop-shadow(" + offset.x + "px " + offset.y + "px " + blurRadius + "px " + color + ")"
    ctx.drawImage(res.img, 0, 0);
    return ctx.canvas;
}