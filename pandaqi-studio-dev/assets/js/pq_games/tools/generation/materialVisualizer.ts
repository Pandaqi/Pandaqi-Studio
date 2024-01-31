import ResourceLoader from "js/pq_games/layout/resources/resourceLoader";
import Configurator from "./configurator";
import Point from "../geometry/point";

export default class MaterialVisualizer
{
    configurator: Configurator
    resLoader: ResourceLoader
    inkFriendly: boolean
    size: Point
    custom: any;

    constructor(config)
    {
        this.resLoader = config.resLoader;
        if(!this.resLoader)
        {
            this.resLoader = new ResourceLoader({ base: config.assetsBase });
            this.resLoader.planLoadMultiple(config.assets ?? {});
        }

        this.inkFriendly = config.inkFriendly;
        this.size = config.itemSize ? config.itemSize.clone() : new Point(512, 512);
        
        this.configurator = new Configurator();
        this.configurator.addExceptions(["resLoader", "drawerConfig", "gameTitle", "fileName", "localstorage", "debug"]);

        // this is just for very easy access through the configurator later; must come first though to ensure we have it for everything else
        this.configurator.calculate({
            size: this.size,
            sizeUnit: Math.min(this.size.x, this.size.y),
            center: this.size.clone().scale(0.5),
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
}