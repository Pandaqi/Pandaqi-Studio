import { ResourceImage } from "../../layout/resources/resourceImage";
import type { ResourceLoadParams } from "../../layout/resources/resourceLoader";
import { Renderer, RendererDrawFinishParams } from "../renderer";
import { ResourceGroup } from "../../layout/resources/resourceGroup";
import { LayoutOperation } from "../../layout/layoutOperation";
import { EffectsOperation } from "../../layout/effects/effectsOperation";
import { ResourceText } from "../../layout/resources/resourceText";
import { ResourceShape } from "../../layout/resources/resourceShape";
import { Color } from "../../layout/color/color";
import { StrokeAlign, StrokeType } from "../../layout/values";
import { Vector2 } from "../../geometry/vector2";
import { getLayoutOperationBoxPoints, getLayoutOperationDebugColorNumber, getLayoutOperationPivotPoint } from "../../layout/operation/operationDebug";

interface RendererPixiParams
{
    bgColor?: string,
    bgAlpha?: number,
    forceWebGPU?: boolean,
    // Where the Pixi modules are served from. They are NOT part of the page bundle: Pixi is ~790 KB of
    // a page that only 12 of the generators use, so it is fetched the first time a Pixi renderer actually
    // draws. The site publishes them at these paths (see func/vendor-bundles.html).
    pixiUrl?: string,
    filtersUrl?: string,
}

const NO_EFFECTS:any[] = [];

const DEFAULT_PIXI_URL = "/lib/pq-games/renderers/pixi/pixi.mjs";
const DEFAULT_FILTERS_URL = "/lib/pq-games/renderers/pixi/pixi-filters.mjs";

// A native dynamic import, kept out of the bundler's reach on purpose: the bundle is an IIFE and must not
// try to inline or rewrite a module it is not allowed to see at build time.
const importModule = new Function("url", "return import(url)") as (url:string) => Promise<any>;

const moduleCache = new Map<string, Promise<any>>();
const loadModule = (url:string) : Promise<any> =>
{
    let promise = moduleCache.get(url);
    if(!promise)
    {
        promise = importModule(url).catch((error) => {
            moduleCache.delete(url); // a failed fetch may be a fluke (offline, a CDN hiccup): allow a retry
            throw error;
        });
        moduleCache.set(url, promise);
    }
    return promise;
}

// Pixi has no line-dash support. Dashed shapes are approximated by walking every polygon edge and
// emitting the "on" parts as separate line segments. Only used when a shape actually asks for it.
const addDashedPolygonStroke = (obj:any, points:Vector2[], width:number) =>
{
    if(points.length < 2) { return; }
    const dash = Math.max(width, 1) * 2;

    // discard the shape's own outline: only the dash segments may be stroked
    obj.beginPath();

    for(let i = 0; i < points.length; i++)
    {
        const from = points[i];
        const to = points[(i + 1) % points.length];
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const length = Math.sqrt(dx*dx + dy*dy);
        if(length <= 0.0001) { continue; }

        const ux = dx / length;
        const uy = dy / length;
        let walked = 0;
        let drawing = true;

        while(walked < length)
        {
            const step = Math.min(dash, length - walked);
            if(drawing)
            {
                obj.moveTo(from.x + ux*walked, from.y + uy*walked);
                obj.lineTo(from.x + ux*(walked + step), from.y + uy*(walked + step));
            }
            walked += step;
            drawing = !drawing;
        }
    }

    obj.stroke();
}

export class RendererPixi extends Renderer
{
    bgColor: Color;
    bgAlpha:number;
    customBatchSize = 1; // more than that, an average computer might lose the graphics context
    rendererInstance: any;
    forceWebGPU = false

    pixiUrl = DEFAULT_PIXI_URL;
    filtersUrl = DEFAULT_FILTERS_URL;

    // the two module namespaces, filled by ensureModules()
    pixi: any = null;
    filters: any = null;

    // For hosts that already have the modules (a test harness, or a page that bundles Pixi itself):
    // they are used until ensureModules() loads its own copies.
    static injectedPixi: any = null;
    static injectedFilters: any = null;
    static setModules(pixi:any, filters:any = null)
    {
        RendererPixi.injectedPixi = pixi;
        RendererPixi.injectedFilters = filters;
    }

    get pixiInstance() : any { return this.pixi ?? RendererPixi.injectedPixi; }
    get filtersInstance() : any { return this.filters ?? RendererPixi.injectedFilters; }

    constructor(params:RendererPixiParams = {})
    {
        super();
        this.bgColor = new Color(params.bgColor ?? "#FFFFFF");
        this.bgAlpha = params.bgAlpha ?? 1;
        this.forceWebGPU = params.forceWebGPU ?? false;
        this.pixiUrl = params.pixiUrl ?? DEFAULT_PIXI_URL;
        this.filtersUrl = params.filtersUrl ?? DEFAULT_FILTERS_URL;
    }

    async ensureModules()
    {
        if(!this.pixi)
        {
            const [pixi, filters] = await Promise.all([loadModule(this.pixiUrl), loadModule(this.filtersUrl)]);
            this.pixi = pixi;
            this.filters = filters;
        }
        return this.pixi;
    }

    async cacheLoadedImage(img:HTMLImageElement, params:ResourceLoadParams) : Promise<ResourceImage>
    {
        const pixi = await this.ensureModules();
        await img.decode(); // we need this anyway because of text drawing still using non-pixified images ...
        const res = new ResourceImage(img, params);
        await res.createPixiObject({ assets: pixi.Assets, sprite: pixi.Sprite, spritesheet: pixi.Spritesheet });
        return res;
    }

    prepareDraw(cfg:Record<string,any> = {})
    {
        return new ResourceGroup();
    }
    
    async finishDraw(params:RendererDrawFinishParams)
    {
        const pixi = await this.ensureModules();

        const initConfig = { 
            width: params.size.x, height: params.size.y, 
            backgroundColor: this.bgColor.toHEXNumber(),
            //antialias: true,
            preference: 'webgpu',
            backgroundAlpha: this.bgAlpha ?? 1,
            useBackBuffer: true,
        };

        let renderer;
        if(this.forceWebGPU) {
            // NOTE: `const renderer` here used to shadow the outer variable, so forceWebGPU left
            // `this.rendererInstance` undefined and crashed on the first render.
            renderer = new pixi.WebGPURenderer();
            await renderer.init(initConfig);
        } else {
            renderer = await pixi.autoDetectRenderer(initConfig);
        }
        this.rendererInstance = renderer;

        const appRoot = new pixi.Container();
        const op = new LayoutOperation({ renderer: this });
        params.group.toPixi(renderer, appRoot, op);
        renderer.render(appRoot);
        const canv = renderer.canvas;
        //renderer.destroy(true);
        return canv;
    }

    async applyOperationToPixi(op:LayoutOperation, app:any, parent:any)
    {
        const pixi = this.pixiInstance;
        if(!pixi) { throw new Error("[RendererPixi] Pixi is not loaded yet; call ensureModules() (or finishDraw) first."); }

        // GROUP
        // just call all children to do what they want (they add themselves to us)
        let obj:any = null;
        if(op.resource instanceof ResourceGroup)
        {
            obj = new pixi.Container();

            const combos = (op.resource as ResourceGroup).combos;
            for(const combo of combos)
            {
                combo.toPixi(app, obj, op);
            }
        }

        // IMAGES
        if(op.resource instanceof ResourceImage)
        {
            obj = op.resource.getPixiObject(op.frame, pixi.Sprite);
        }

        // SHAPES / GEOMETRY
        if(op.resource instanceof ResourceShape)
        {
            // A cached Graphics owns the shape's path. Dashed strokes replace that path with their
            // dash segments, so using the cached object would leave the next draw with no geometry.
            const dashed = op.hasStroke() && op.strokeType === StrokeType.DASHED;
            obj = dashed ? (op.resource as ResourceShape).shape.createPixiObject(pixi.Graphics) : op.resource.getPixiObject(pixi.Graphics);

            // the colour and the alpha are separate in a Pixi style: passing only toNumber() threw the
            // colour's own alpha away, so a 26%-grey grid line was painted solid black
            if(op.hasFill()) 
            { 
                obj.setFillStyle({ color: op.fill.toNumber(), alpha: op.fill.getAlpha() });
                obj.fill(); 
            }

            if(op.hasStroke())
            {
                const alignNum = op.strokeAlign == StrokeAlign.INSIDE ? 1.0 : (op.strokeAlign == StrokeAlign.OUTSIDE ? 0.0 : 0.5);
                obj.setStrokeStyle({ color: op.stroke.toNumber(), width: op.strokeWidth, alignment: alignNum, alpha: op.stroke.getAlpha() });

                if(dashed)
                {
                    addDashedPolygonStroke(obj, (op.resource as ResourceShape).shape.toPathArray(), op.strokeWidth);
                }
                else
                {
                    obj.stroke();
                }
            }
        }

        // TEXT (draws on-the-fly to an offscreen canvas, then just returns that as a Sprite)
        if(op.resource instanceof ResourceText)
        {
            obj = op.resource.getPixiObject({ sprite: pixi.Sprite, texture: pixi.Texture, layoutOperation: op, debugText: this.debugText });
        }

        if(!obj)
        {
            console.warn(`[RendererPixi] Resource "${op.resource?.constructor?.name ?? "null"}" has no Pixi implementation; operation skipped.`);
            return null;
        }

        this.applyToPixiObjectProperties(op, obj);

        // MASKS
        // A Pixi mask must live in the display tree: creating the Sprite/Graphics and only assigning
        // it to `.mask` (the old behaviour) left it unrendered, so the mask was ignored entirely.
        // Wrapping also lets clip and mask be active at the same time, instead of clip silently
        // winning, which is what the canvas renderer does.
        const clipMask = op.hasClip() ? this.createClipMask(op) : null;
        const resourceMask = op.hasMask() ? this.createResourceMask(op) : null;

        let root = obj;
        if(resourceMask)
        {
            const inner = new pixi.Container();
            inner.addChild(obj);
            inner.addChild(resourceMask);
            inner.mask = resourceMask;
            root = inner;
        }

        if(clipMask)
        {
            const outer = new pixi.Container();
            outer.addChild(root);
            outer.addChild(clipMask);
            outer.mask = clipMask;
            root = outer;
        }

        // the mask wrappers are the parent's children now, so depth must sort on the wrapper
        if(root !== obj) { root.zIndex = op.depth; }
        parent.addChild(root);

        if(op.isDebugEnabled()) { this.addDebugOverlay(op, parent); }

        return root;
    }

    createClipMask(op:LayoutOperation)
    {
        const pixi = this.pixiInstance;
        let points = op.clip.toPathArray();

        // A relative clip follows the operation (like the canvas renderer applies its transform
        // before clipping); an absolute one is already in the parent's coordinate space.
        if(op.clipRelative)
        {
            const matrix = op.calculateLocalTransformationMatrix();
            points = points.map((p) => matrix.applyToPoint(p));
        }

        return new pixi.Graphics({}).poly(points, true).fill(0xFFFFFF);
    }

    createResourceMask(op:LayoutOperation) : any
    {
        const pixi = this.pixiInstance;
        const mask = op.mask;
        const maskOp = mask.operation ?? new LayoutOperation({ renderer: this });

        // Mirror ResourceImage.toCanvas: a mask without an explicit size covers the image at its
        // natural size. The old Pixi path ignored `mask.operation` completely, so every mask sat at
        // (0,0) with the image's native size.
        if(maskOp.size.isZero()) { maskOp.size = mask.resource.getSize(); }
        maskOp.resource = mask.resource;
        maskOp.renderer = this;
        maskOp.calculateResultProperties();

        const maskObj = mask.resource.getPixiObject(maskOp.frame ?? 0, pixi.Sprite);
        if(!maskObj) { return null; }

        this.applyToPixiObjectProperties(maskOp, maskObj);
        return maskObj;
    }

    addDebugOverlay(op:LayoutOperation, parent:any)
    {
        const pixi = this.pixiInstance;
        const localMatrix = op.calculateLocalTransformationMatrix();
        const points = getLayoutOperationBoxPoints(op, localMatrix);
        const color = getLayoutOperationDebugColorNumber(op);

        const graphics = new pixi.Graphics({});
        graphics.poly(points, true).stroke({ color: color, width: 2, alignment: 0.5 });

        const pivot = getLayoutOperationPivotPoint(op, localMatrix);
        graphics.moveTo(pivot.x - 6, pivot.y);
        graphics.lineTo(pivot.x + 6, pivot.y);
        graphics.moveTo(pivot.x, pivot.y - 6);
        graphics.lineTo(pivot.x, pivot.y + 6);
        graphics.stroke({ color: color, width: 2, alignment: 0.5 });

        graphics.zIndex = 1000000;
        parent.addChild(graphics);
    }

    applyToPixiObjectProperties(op:LayoutOperation, obj)
    {
        if(!obj) { return obj; }

        //
        // set all the GENERAL PROPERTIES (which should exist on all/most DisplayObjects)
        //
        if(obj.anchor)
        {
            // Sprites (images and text-as-image) have an anchor, which is exactly the pivot.
            obj.position.set(op.posResult.x, op.posResult.y);
            obj.anchor.set(op.pivot.x, op.pivot.y);
        }
        else
        {
            // Graphics/Containers have no anchor. Position them at their local origin, which already
            // includes the pivot offset. The old code used posResult and simply ignored the pivot.
            const origin = op.getLocalOrigin();
            obj.position.set(origin.x, origin.y);
        }

        obj.rotation = op.rot;
        obj.zIndex = op.depth;
        
        obj.roundPixels = true;
        obj.tint = op.getTint();
        obj.blendMode = op.composite;
        obj.alpha = op.alpha;

        // PIXI resizes stuff by changing _scale_ (not by setting an absolute size)
        // So we calculate the scaling factor by dividing full size by dims
        // But don't forget to multiple by original operation's scale (which is mostly needed for flipX, flipY stuff)
        const scaleResult = op.scaleResult.clone();
        if(op.resource instanceof ResourceImage)
        {
            const scale = op.sizeResult.clone().div(op.resource.frameSize);
            scaleResult.scale(scale);
        }

        obj.scale.set(scaleResult.x, scaleResult.y);
        obj.skew.set(op.skew.x, op.skew.y);

        //
        // apply all EFFECTS
        //
        const effOp = new EffectsOperation();
        // avoid allocating an empty effects array on every object that has none
        const effects = op.hasEffects() ? op.effects : NO_EFFECTS;
        const filters = this.filtersInstance;
        for(const effect of effects)
        {
            effect.applyToPixi(filters, effOp, obj); // some effects do something directly on object
        }
        obj.filters = effOp.filtersPixi;

        return obj;
    }
}
