import GrayScaleEffect from "js/pq_games/layout/effects/grayScaleEffect";
import Renderer from "js/pq_games/layout/renderers/renderer";
import RendererPandaqi from "js/pq_games/layout/renderers/rendererPandaqi";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import ResourceLoader from "js/pq_games/layout/resources/resourceLoader";
import Point from "../geometry/point";
import Configurator from "./configurator";

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

    renderer: Renderer;
    rendererInstance:any;
    groupFinal: ResourceGroup

    constructor(config, customItemSize:Point = null)
    {
        this.renderer = config.renderer ?? new RendererPandaqi();

        this.resLoader = config.resLoader;
        if(!this.resLoader)
        {
            this.resLoader = new ResourceLoader({ base: config.assetsBase, renderer: this.renderer });
            this.resLoader.planLoadMultiple(config.assets ?? {});
        }

        this.inkFriendly = config.inkFriendly;
        this.inkFriendlyEffect = this.inkFriendly ? [new GrayScaleEffect()] : [];
        this.size = customItemSize ?? (config.itemSize ? config.itemSize.clone() : new Point(512, 512));
        
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

    async finishDraw(group:ResourceGroup) : Promise<HTMLCanvasElement>
    {
        return this.renderer.finishDraw({ size: this.size, group: group });
    }
}