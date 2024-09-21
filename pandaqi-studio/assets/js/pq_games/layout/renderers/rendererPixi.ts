import { autoDetectRenderer, Assets, Container, Graphics, Sprite, Spritesheet, Texture, WebGPURenderer } from "js/pq_games/pixi/pixi.mjs";
import * as PIXIFilters from "js/pq_games/pixi/pixi-filters.mjs";
import ResourceImage from "../resources/resourceImage";
import { ResourceLoadParams } from "../resources/resourceLoader";
import Renderer, { RendererDrawFinishParams } from "./renderer";
import ResourceGroup from "../resources/resourceGroup";
import LayoutOperation from "../layoutOperation";
import EffectsOperation from "../effects/effectsOperation";
import StrokeAlign from "../values/strokeAlign";
import ResourceText from "../resources/resourceText";
import ResourceShape from "../resources/resourceShape";
import Color from "../color/color";

interface RendererPixiParams
{
    bgColor?: string,
    forceWebGPU?: boolean,
}

export default class RendererPixi extends Renderer
{
    bgColor: Color;
    customBatchSize = 1; // more than that, an average computer might lose the graphics context
    rendererInstance: any;
    forceWebGPU = false

    constructor(params:RendererPixiParams = {})
    {
        super();
        this.bgColor = new Color(params.bgColor ?? "#FFFFFF");
        this.forceWebGPU = params.forceWebGPU ?? false;
    }

    async cacheLoadedImage(img:HTMLImageElement, params:ResourceLoadParams) : Promise<ResourceImage>
    {
        await img.decode(); // we need this anyway because of text drawing still using non-pixified images ...
        const res = new ResourceImage(img, params);
        await res.createPixiObject({ assets: Assets, sprite: Sprite, spritesheet: Spritesheet });
        return res;
    }

    prepareDraw(cfg:Record<string,any> = {})
    {
        return new ResourceGroup();
    }
    
    async finishDraw(params:RendererDrawFinishParams)
    {
        const initConfig = { 
            width: params.size.x, height: params.size.y, 
            backgroundColor: this.bgColor.toHEXNumber(),
            //antialias: true,
            useBackBuffer: true,
        };

        let renderer;
        if(this.forceWebGPU) {
            const renderer = new WebGPURenderer(); 
            await renderer.init(initConfig);
        } else {
            renderer = await autoDetectRenderer(initConfig);
        }
        this.rendererInstance = renderer;

        const appRoot = new Container();
        const op = new LayoutOperation({ renderer: this });
        params.group.toPixi(renderer, appRoot, op);
        renderer.render(appRoot);
        const canv = renderer.canvas;
        //renderer.destroy(true);
        return canv;
    }

    async applyOperationToPixi(op:LayoutOperation, app:any, parent:Container)
    {
        // GROUP
        // just call all children to do what they want (they add themselves to us)
        let obj:any;
        let shouldAddObject = true;
        if(op.resource instanceof ResourceGroup)
        {
            obj = new Container();
            parent.addChild(obj);
            shouldAddObject = false;

            const combos = (op.resource as ResourceGroup).combos;
            for(const combo of combos)
            {
                combo.toPixi(app, obj, op);
            }
        }

        // IMAGES
        if(op.resource instanceof ResourceImage)
        {
            obj = op.resource.getPixiObject(op.frame, Sprite);
        }

        // SHAPES / GEOMETRY
        if(op.resource instanceof ResourceShape)
        {
            obj = op.resource.getPixiObject(Graphics);

            if(op.hasFill()) 
            { 
                obj.setFillStyle({ color: op.fill.toNumber() });
                obj.fill(); 
            }

            if(op.hasStroke())
            {
                const alignNum = op.strokeAlign == StrokeAlign.INSIDE ? 1.0 : (op.strokeAlign == StrokeAlign.OUTSIDE ? 0.0 : 0.5);
                obj.setStrokeStyle({ color: op.stroke.toNumber(), width: op.strokeWidth, alignment: alignNum });
                obj.stroke();
            }
        }

        // TEXT (draws on-the-fly to an offscreen canvas, then just returns that as a Sprite)
        if(op.resource instanceof ResourceText)
        {
            obj = op.resource.getPixiObject({ sprite: Sprite, texture: Texture, layoutOperation: op });
        }

        if(shouldAddObject)
        {
            parent.addChild(obj);
        }

        this.applyToPixiObjectProperties(op, obj);

        return obj;
    }

    applyToPixiObjectProperties(op:LayoutOperation, obj)
    {
        //
        // set all the GENERAL PROPERTIES (which should exist on all/most DisplayObjects)
        //
        obj.position.set(op.translateResult.x, op.translateResult.y);
        obj.rotation = op.rotation;
        obj.zIndex = op.depth; // ??
        
        obj.roundPixels = true;
        obj.tint = 0xFFFFFF; // @TODO: add tint as default option of layoutOperation?
        obj.blendMode = op.composite;
        obj.alpha = op.alpha;

        // PIXI resizes stuff by changing _scale_ (not by setting an absolute size)
        // So we calculate the scaling factor by dividing full size by dims
        // But don't forget to multiple by original operation's scale (which is mostly needed for flipX, flipY stuff)
        const scaleResult = op.scaleResult.clone();
        if(op.resource instanceof ResourceImage)
        {
            const scale = op.dimsResult.clone().div(op.resource.frameSize);
            scaleResult.scale(scale);
        }

        obj.scale.set(scaleResult.x, scaleResult.y);
        
        // @NOTE: obj.pivot is automatically correct now, as it's in local space, and (0,0) = anchor point
        // in the future, I might want to support rotating around a different point; I'll need to rename stuff and add an extra property then
        if(obj.anchor)
        {
            obj.anchor.set(op.pivot.x, op.pivot.y);
        }

        // obj.skew => wants the skew factor in radians, while I have a POINT?

        //
        // MASKING (either through graphics object or sprite)
        //
        if(op.clip) {
            obj.mask = new Graphics({}).poly(op.clip.toPath(), false);
        } else if(op.mask) {
            obj.mask = op.mask.getPixiObject(0, Sprite);
        }

        //
        // apply all EFFECTS
        //
        const effOp = new EffectsOperation();
        for(const effect of op.effects)
        {
            effect.applyToPixi(PIXIFilters, effOp, obj); // some effects do something directly on object
        }
        obj.filters = effOp.filtersPixi;
    }
}