import { GrayScaleEffect } from "../layout/effects/grayScaleEffect";
import type { Renderer } from "./renderer";
import { RendererPandaqi } from "./pandaqi/rendererPandaqi";
import { ResourceGroup } from "../layout/resources/resourceGroup";
import { ResourceLoader } from "../layout/resources/resourceLoader";
import { Vector2 } from "../geometry/vector2";
import { Configurator } from "../settings/configurator";
import { CVal } from "../settings/cval";
import { ensureConfigProperties, GameConfig, getSettingDefault, DrawingPaths } from "../settings/configuration";
import { translate } from "../layout/text/translation";

// one warning per config, not one per material
const WARNED_CONFIGS = new WeakSet<object>();

export class MaterialVisualizer<TConfig extends GameConfig = GameConfig>
{
    debug?: boolean

    config: TConfig
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

    constructor(config:TConfig, customItemSize:Vector2 = null)
    {
        ensureConfigProperties(config);
        this.warnedDrawingPaths = new Set();
        
        this.config = config;
        this.renderer = config._game.renderer ?? new RendererPandaqi();
        this.resLoader = config._game.resLoader;

        // A config that never went through loadResources/getMaterialDataForRulebook has no loader, and the
        // failure only surfaced much later, while drawing a random card, as "Cannot read properties of
        // undefined (reading 'getResource')". Say it once, here, without throwing: "config only, no
        // rendering" is a legitimate path (rulebook-default, debug tooling).
        if(!this.resLoader && !WARNED_CONFIGS.has(config))
        {
            WARNED_CONFIGS.add(config);
            console.warn("[Visualizer] This config has no resource loader (_game.resLoader); resources will not resolve. Call loadResources() or getMaterialDataForRulebook() first.");
        }

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
            // single-axis versions, so a config can say `new CVal(0.925, "sizeY")` and get a plain number
            // back instead of a vector whose `.y` the drawing code has to remember to read
            sizeX: this.size.x,
            sizeY: this.size.y,
            center: this.center,
            inkFriendly: this.inkFriendly
        })
        this.configurator.calculate(config._drawing);

        if(this.debug) { console.log(`[Debug] MaterialVisualizer`, this); console.log(`[Debug] MaterialVisualizer's configurator object`, this.configurator); }
    }

    // `_drawing` paths are only as typed as the config that was handed in: a literal config (via
    // `defineConfig`) rejects a typo here, a plain GameConfig falls back to `string`.
    get(s:DrawingPaths<NonNullable<TConfig["_drawing"]>> | string[])
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