import Dims from "js/pq_games/tools/geometry/dims";
import Path from "js/pq_games/tools/geometry/paths/path";
import Point from "js/pq_games/tools/geometry/point";
import createCanvas from "../canvas/createCanvas";
import createContext from "../canvas/createContext";
import EffectsOperation from "../effects/effectsOperation";
import LayoutOperation from "../layoutOperation";
import Resource, { ElementLike } from "../resources/resource";
import ResourceGroup from "../resources/resourceGroup";
import ResourceImage, { CanvasLike } from "../resources/resourceImage";
import { ResourceLoadParams } from "../resources/resourceLoader";
import ResourceShape from "../resources/resourceShape";
import ResourceText from "../resources/resourceText";
import TransformationMatrix from "../tools/transformationMatrix";
import Renderer, { RendererDrawFinishParams } from "./renderer";

export default class RendererPandaqi extends Renderer
{
    async cacheLoadedImage(img:HTMLImageElement, params:ResourceLoadParams) : Promise<ResourceImage>
    {
        await img.decode();
        const res = new ResourceImage(img, params);
        if(params.enableCaching) { await res.cacheFrames(); }
        return res;
    }

    prepareDraw(cfg:Record<string,any> = {})
    {
        return new ResourceGroup();
    }
    
    async finishDraw(params:RendererDrawFinishParams)
    {
        const canv = createCanvas({ size: params.size });
        const op = new LayoutOperation({ renderer: this });
        params.group.toCanvas(canv, op);
        return canv;
    }

    applyOperationToCanvas(op:LayoutOperation, canv:CanvasLike)
    {
        let ctx = (canv instanceof HTMLCanvasElement) ? canv.getContext("2d") : canv;
        if(!ctx) { ctx = createContext({ size: op.size }); }

        const effOp = new EffectsOperation(op.effects);
        
        // HUGE OPTIMIZATION => don't create the temporary canvas if we don't need it
        // (Though that is rare; would only apply to stuff with only a transform + fill/stroke and nothing else)
        const isMultiStepText = op.isText() && op.hasStroke();
        const needsTemporaryCanvas = effOp.needsTemporaryCanvas() || op.isGroup() || op.hasMask() || isMultiStepText;

        // SAVE/RESTORE is extremely expensive and error prone (if you forget one even once); so limit it to only when really needed
        const needsStateManagement = op.hasClip();
        if(needsStateManagement) { ctx.save(); }

        // we create a temporary canvas to do everything we want
        // once done, at the end, we stamp that onto the real one (with the right effects, alpha, etcetera set)
        const ctxTemp = needsTemporaryCanvas ? createContext({ size: new Point(ctx.canvas.width, ctx.canvas.height) }) : ctx;
        const size = op.sizeResult;

        // @NOTE: this is necessary if we're subgroups in a tree, as then the context given to us will have some transform from the parent
        // The keepTransform flag is for special exceptions such as TextDrawer that blend _inline_ images + text
        if(!op.keepTransform) 
        {
            ctx.resetTransform();
        }

        // @NOTE: this must come before any changes to ctxTemp (such as applying transform below), 
        // otherwise the mask is positioned wrong!
        // @TODO: we might make this optional though, like op.clip, by adding a `maskRelative` property to choose between relative/absolute positioning
        if(op.hasMask())
        {
            const maskOp = op.mask.operation ?? new LayoutOperation();
            op.mask.resource.toCanvas(ctxTemp, maskOp);
            ctxTemp.globalCompositeOperation = "source-in";
        }

        if(op.hasClip())
        {
            // this necessitates converting any shape to a slightly more expensive path, but it can't be helped
            const points = op.clip.toPath();
            const path = new Path(points).toPath2D();

            // relative clipping is a legacy support thing; just do ugly SET->DO->UNSET
            // @TODO: should this be on ctxTemp instead??
            if(op.clipRelative) {
                op.transformResult.applyToContext(ctx);
                ctx.clip(path);
                ctx.resetTransform();
            } else {
                ctx.clip(path); 
            }
        }

        // we make sure we're drawing at the right position right away
        const trans = op.transformResult;
        trans.applyToContext(ctxTemp);

        // some effects merely require setting something on the canvas
        effOp.applyToCanvasPre(ctx);

        // the bulk of canvas properties to set
        op.setFillAndStrokeOnContext(ctxTemp);

        ctx.filter = effOp.getFilterString();
        ctx.globalCompositeOperation = op.composite;
        ctx.globalAlpha = op.alpha;
        effOp.setShadowProperties(ctx);

        // now prepare/draw the actual resource onto it
        if(op.isGroup())
        {
            const combos = (op.resource as ResourceGroup).combos;
            for(const combo of combos)
            {
                combo.toCanvas(ctxTemp, op);
            }
        }

        else if(op.isShape())
        {
            const path = (op.resource as ResourceShape).shape.toPath2D();
            op.applyFillAndStrokeToPath(ctxTemp, path);
        }

        else if(op.isText())
        {
            op.tempTextDrawer.toCanvas(ctxTemp, op);
        }

        else if(op.isImage())
        { 
            // apply the effects that require an actual image to manipulate
            let frameResource:ResourceImage = (op.resource as ResourceImage).getImageFrameAsResource(op.frame, size.clone());
            frameResource = effOp.applyToDrawable(frameResource);

            const box = new Dims(new Point(), size.clone());
            const boxPath = box.toPath2D();

            const drawImageCallback = () =>
            {
                ctxTemp.drawImage(
                    frameResource.getImage(), 
                    box.position.x, box.position.y, box.size.x, box.size.y
                );
            }

            op.applyFillAndStrokeToPath(ctxTemp, boxPath, drawImageCallback);
        }

        const ctxFinal = effOp.applyToCanvasPost(ctxTemp);

        // only draw something extra if we actually have a temporary canvas to draw
        if(needsTemporaryCanvas)
        {
            ctx.drawImage(ctxFinal.canvas, 0, 0);
        }

        if(needsStateManagement) { ctx.restore(); }
        return ctx.canvas;
    }

    async applyOperationToHTML(op:LayoutOperation, node:ElementLike, res:Resource = null)
    {
        const textMode = res instanceof ResourceText;
        const svgMode = node instanceof SVGSVGElement;
        if(svgMode) { return node; } // svg is just a wrapper for the specific shape inside; operation is already applied to THAT

        // misc basic properties
        node.style.opacity = op.alpha.toString();
        if(textMode) { node.style.color = op.fill.toCSS(); }
        else { node.style.backgroundColor = op.fill.toCSS(); }

        if(textMode) {
            node.style.stroke = op.stroke.toString();
            node.style.strokeWidth = op.strokeWidth + "px";
        } else {
            if(op.strokeWidth > 0) { node.style.borderStyle = op.strokeType; }
            node.style.borderWidth = op.strokeWidth + "px";
            node.style.borderColor = op.stroke.toCSS();
        }

        // clip and mask
        if(op.clip)
        {
            node.style.clipPath = op.clip.toCSSPath();
        }

        // @TODO: how to handle the other mask properties? A Mask sub-class?
        if(op.hasMask())
        {
            node.style.maskImage = op.mask.resource.getCSSUrl();
        }

        // all the transform stuff
        const transforms = []
        if(op.rot != 0) 
        { 
            transforms.push("rotate(" + op.rot + "rad)"); 
        }

        if(op.posResult.length() > 0) 
        { 
            transforms.push("translate(" + op.posResult.x + ", " + op.posResult.y + ")");
        }

        const scale = op.scaleResult;
        if(scale.x != 1 || scale.y != 1)
        {
            transforms.push("scale(" + scale.x + ", " + scale.y + ")");
        }

        if(transforms.length > 0)
        {
            node.style.transform += " " + transforms.join(" ");
        }

        // all the filter stuff to make special things happen
        const effOp = new EffectsOperation(op.effects);
        effOp.applyToHTML(node);

        node.style.filter = effOp.getFilterString();

        return node;
    }
}