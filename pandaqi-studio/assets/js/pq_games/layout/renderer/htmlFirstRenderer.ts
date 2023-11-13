
import LayoutNode from "../layoutNode.js";
import { CanvasLike } from "../resources/resourceImage.js";
import { domToForeignObjectSvg, domToCanvas } from "./modern-screenshot/index.js";

// @ts-ignore
//import modernScreenshot from "./modern-screenshot.min.js"

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
            height: node.boxInput.size.y.get(),
            dpi: 300
        }

        // @NOTE (CRUCIAL): modern-screenshot heavily leans on getComputedStyle and ownerWindow and such
        // for all that to work the dom tree MUST be part of the actual document!!!
        // thus we add it, do the thing, then remove it again
        document.body.appendChild(domTree);
        const canv = await domToCanvas(domTree, options);
        document.body.removeChild(domTree);

        const ctx = (targetCanvas instanceof HTMLCanvasElement) ? targetCanvas.getContext("2d") : targetCanvas;
        ctx.drawImage(canv, 0, 0);

        return targetCanvas;
    }
}