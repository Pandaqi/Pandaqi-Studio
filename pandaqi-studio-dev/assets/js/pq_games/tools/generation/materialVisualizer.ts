import ResourceLoader from "js/pq_games/layout/resources/resourceLoader";
import Configurator from "./configurator";
import Point from "../geometry/point";
import GrayScaleEffect from "js/pq_games/layout/effects/grayScaleEffect";
import { VisualizerRenderer } from "js/pq_games/website/boardVisualizer";
import createCanvas from "js/pq_games/layout/canvas/createCanvas";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";

export default class MaterialVisualizer
{
    configurator: Configurator
    resLoader: ResourceLoader
    inkFriendly: boolean
    size: Point;
    sizeUnit: number;
    center: Point;
    custom: any;
    inkFriendlyEffect: GrayScaleEffect[]

    renderer: VisualizerRenderer;
    rendererInstance:any;
    groupFinal: ResourceGroup

    constructor(config)
    {
        this.renderer = config.renderer ?? VisualizerRenderer.PANDAQI;

        this.resLoader = config.resLoader;
        if(!this.resLoader)
        {
            this.resLoader = new ResourceLoader({ base: config.assetsBase, renderer: this.renderer });
            this.resLoader.planLoadMultiple(config.assets ?? {});
        }

        this.inkFriendly = config.inkFriendly;
        this.inkFriendlyEffect = this.inkFriendly ? [new GrayScaleEffect()] : [];
        this.size = config.itemSize ? config.itemSize.clone() : new Point(512, 512);
        
        this.configurator = new Configurator();
        this.configurator.addExceptions(["resLoader", "drawerConfig", "gameTitle", "fileName", "localstorage", "debug"]);

        this.sizeUnit = Math.min(this.size.x, this.size.y);
        this.center = this.size.clone().scale(0.5);

        // this is just for very easy access through the configurator later; must come first though to ensure we have it for everything else
        this.configurator.calculate({
            size: this.size,
            sizeUnit: this.sizeUnit,
            center: this.center,
            inkFriendly: this.inkFriendly
        })
        this.configurator.calculate(config);

        console.log(this.configurator);
    }

    getCustomObject() { return this.custom; }
    setCustomObject(c) { this.custom = c; }

    get(s:string|string[])
    {
        return this.configurator.get(s);
    }

    getResource(s:string)
    {
        return this.resLoader.getResource(s);
    }

    prepareDraw() : ResourceGroup
    {
        return new ResourceGroup();
    }

    // @NOTE: This is actually way slower if we create a new renderer for every card/material item
    // And we CAN'T reuse the same renderer, as it will draw to the same canvas, and so asynchronous cards will mess up each other's drawing
    /*async createRendererIfNeeded()
    {
        if(this.renderer != VisualizerRenderer.PIXI) { return; }
        if(this.rendererInstance) { return; }
        
        this.rendererInstance = new WebGPURenderer();
        await this.rendererInstance.init({ 
            width: this.size.x, height: this.size.y, 
            backgroundColor: 0xFFFFFF,
            //antialias: true,
            useBackBuffer: true,
        });
    }*/

    async finishDraw(group:ResourceGroup) : Promise<HTMLCanvasElement>
    {
        //await this.createRendererIfNeeded();

        let canv:HTMLCanvasElement;
        if(this.renderer == VisualizerRenderer.PANDAQI)
        {
            canv = createCanvas({ size: this.size });
            group.toCanvas(canv);
        }

        /*if(this.renderer == VisualizerRenderer.PIXI)
        {
            const appRoot = new Container();
			group.toPixi(this.rendererInstance, appRoot);
			this.rendererInstance.render(appRoot);
			canv = this.rendererInstance.canvas;
        }*/

        return canv;
    }
}