import { GrayScaleEffect } from "../layout/effects/grayScaleEffect";
import type { Renderer } from "./renderer";
import { RendererPandaqi } from "./pandaqi/rendererPandaqi";
import { ResourceGroup } from "../layout/resources/resourceGroup";
import { ResourceLoader } from "../layout/resources/resourceLoader";
import { Vector2 } from "../geometry/vector2";
import { Configurator } from "../settings/configurator";
import { CVal } from "../settings/cval";
import { ensureConfigProperties, GameConfig, getSettingDefault } from "../settings/configuration";
import { translate } from "../layout/text/translation";

export class MaterialVisualizer
{
    debug?: boolean

    config: GameConfig
    configurator: Configurator
    resLoader: ResourceLoader
    renderer: Renderer;
    
    inkFriendly: boolean
    size: Vector2;
    sizeUnit: number;
    center: Vector2;
    custom: any;
    inkFriendlyEffect: GrayScaleEffect[]

    filterResources: string[]

    translation: Record<string,any>
    language: string
    warnedDrawingPaths: Set<string>

    constructor(config:GameConfig, customItemSize:Vector2 = null)
    {
        ensureConfigProperties(config);
        this.warnedDrawingPaths = new Set();
        
        this.config = config;
        this.renderer = config._game.renderer ?? new RendererPandaqi();
        this.resLoader = config._game.resLoader;

        this.language = (config._settings.defaults.language ?? {}).value ?? config._translation.language;
        this.translation = config._translation ?? { dictionary: {} };

        this.inkFriendly = getSettingDefault("inkFriendly", config) ?? false;
        this.inkFriendlyEffect = this.inkFriendly ? [new GrayScaleEffect()] : [];
        this.size = customItemSize ? customItemSize.clone() : new Vector2(512, 512)
        
        this.sizeUnit = Math.min(this.size.x, this.size.y);
        this.center = this.size.clone().scale(0.5);
        this.filterResources = config._debug.filterResources ?? [];

        // this is just for very easy access through the configurator later; must come first though to ensure we have it for everything else
        this.configurator = new Configurator();
        this.configurator.calculate({
            size: this.size,
            sizeUnit: this.sizeUnit,
            center: this.center,
            inkFriendly: this.inkFriendly
        })
        this.configurator.calculate(config._drawing);

        if(this.debug) { console.log(`[Debug] MaterialVisualizer`, this); console.log(`[Debug] MaterialVisualizer's configurator object`, this.configurator); }
    }

    get(s:string|string[])
    {
        const val = this.configurator.get(s);

        // a typo in a _drawing path is otherwise invisible: it simply returns undefined and draws nothing
        if(val === undefined || val instanceof CVal)
        {
            const key = this.configurator.keyToPath(s);
            if(!this.warnedDrawingPaths.has(key))
            {
                this.warnedDrawingPaths.add(key);
                const reason = val === undefined ? "does not exist in _drawing" : "could not be resolved (one of its inputs is missing)";
                console.warn(`[MaterialVisualizer] _drawing path "${key}" ${reason}.`);
            }
        }

        return val;
    }

    getTranslated(s:string, params:Record<string,any>)
    {
        return translate({
            dict: this.translation.dictionary, 
            key: s, 
            params: params, 
            language: this.language, 
            delimitersReplace: this.translation.delimitersReplace,
            delimitersTranslate: this.translation.delimitersTranslate
        });
    }

    getResource(s:string)
    {
        const useFallback = this.filterResources.length > 0 && !this.filterResources.includes(s);
        if(useFallback) { return this.resLoader.getResourceImageRandom(); }
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