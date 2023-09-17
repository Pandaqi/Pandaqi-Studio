
import LayoutNode from "../layoutNode.js";
import { CanvasLike } from "../resources/resourceImage.js";
// @ts-ignore
import modernScreenshot from "./renderer/modern-screenshot.min.js"

export default class HTMLFirstRenderer
{
    calculateDimensions(node:LayoutNode) { } 

    async toCanvas(node:LayoutNode, canv:CanvasLike)
    {
        await this.toCanvasFromHTML(node, canv); 
    }

    async toCanvasFromHTML(node:LayoutNode, targetCanvas:CanvasLike)
    {
        const domTree = await node.toHTML();
        const options = {
            width: node.boxInput.size.x.get(),
            height: node.boxInput.size.y.get()
        }

        const canv = await modernScreenshot.domToCanvas(domTree, options);

        document.body.appendChild(domTree);
        document.body.appendChild(canv);

        const ctx = (targetCanvas instanceof HTMLCanvasElement) ? targetCanvas.getContext("2d") : targetCanvas;
        ctx.drawImage(canv, 0, 0);

        return targetCanvas;
    }
}