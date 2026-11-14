import type { Vector2 } from "../geometry/vector2";
import type { MapperPreset, ItemSize } from "../layout/gridMapper";
import { ResourceLoadParams, ResourceLoader } from "../layout/resources/resourceLoader";
import { MaterialVisualizer } from "../renderers";
import type { Renderer } from "../renderers/renderer";
import { mergeObjects } from "../tools/collections/converters";
import type { PageOrientation, PageSides, PageSize } from "../tools/pdf/tools";
import { getRandomSeedString } from "../tools/random/values";
import { setStrictWarnings } from "../tools/debug/warnings";
import { debugEnabled } from "../tools/debug/flags";

export const PROTECTED_CONFIGURATION_PROPERTIES = ["_game", "_settings", "_generation", "_drawing", "_material", "_resources", "_debug", "_translation"];

// Every path a `_drawing` tree offers, written the way `vis.get()` addresses it. A nested object also
// contributes its own key, so both `tokens` and `tokens.numPerCard` type-check. `GameConfig`'s `_drawing`
// is `Record<string, any>`, which collapses this to `string`: a visualizer built from a literal config
// rejects a typo, a visualizer typed as the plain `GameConfig` accepts any string.
export type DrawingPaths<T> = T extends object
    ? { [K in keyof T & string]: K | `${K}.${DrawingPaths<T[K]>}` }[keyof T & string]
    : never;

export interface GameConfigMaterialSubset
{
    _debug?: GameConfig["_debug"],
    _resources?: GameConfigResources,
    _game?: GameConfigGame,
    _material?: Record<string,MaterialConfig>,
}

export const getMaterialDataForRulebook = (config:GameConfigMaterialSubset) =>
{
    // prepare resource loader with correct resources
    config._resources = config._resources ?? {};
    const resLoader = new ResourceLoader({ base: config._resources.base });

    // a rulebook example draws through the same visualizer as a generator; without this, `_debug.strict`
    // was only ever honoured by `generateMaterial`, so the default-pivot/alignment warnings never fired here
    setStrictWarnings(debugEnabled(config, "strict"));
    resLoader.planLoadMultiple(config._resources.files, config);
   
    config._game = config._game ?? {};
    config._game.resLoader = resLoader; // this is required for the MaterialVisualizer to find it later

    // prepare visualizer (right size/class/config) if still needed
    const newMaterial = {}
    for(const [key,data] of Object.entries(config._material))
    {
        newMaterial[key] = Object.assign({}, data);
        const visualizerClass = data.visualizer ?? MaterialVisualizer;
        newMaterial[key].visualizer = new visualizerClass(config, (config._material[key] ?? {}).itemSize ?? config._game.itemSize);
    }

    // then just send this to the rulebook in the format it expects
    return {
        resourceLoader: resLoader,
        material: newMaterial
    }
}

export const getSettingDefault = (key:string, config:GameConfig) =>
{
    return ((config._settings.defaults ?? {})[key] ?? {}).value;
}

// `getDefaultSettings()` only emits a setting whose option list has more than one entry, and
// `noDefaultSettings: true` skips them all: a setting's default genuinely can be missing. One accessor with
// an explicit fallback keeps the "Cannot read properties of undefined" crashes out of every caller.
export const getDefaultSetting = <T>(key:string, config:GameConfig, fallback:T) : T =>
{
    return (getSettingDefault(key, config) as T) ?? fallback;
}

// Returns `undefined` for a missing setting, never `false`: a setting whose value is legitimately `false`
// must be distinguishable from one that does not exist.
export const getSetting = <T = any>(path:string, config:GameConfig) : T | undefined =>
{
    if(!config._settings) { return undefined; }
    const pathParts = path.split(".");
    let obj:Record<string,any> = config._settings;
    while(pathParts.length > 0 && obj)
    {
        obj = obj[pathParts.shift()];
    }
    return obj?.value;
}

export const getPicker = (key:string, config:GameConfig) =>
{ 
    if(!config._material) { config._material = {}; }
    return config._material[key]?.picker;
}

export const getVisualizer = (key:string, config:GameConfig) =>
{
    if(!config._material) { config._material = {}; }
    const visualizerClass = (config._material[key] ?? {}).visualizer ?? MaterialVisualizer;
    return new visualizerClass(config, (config._material[key] ?? {}).itemSize);
}

export const addConfigFromLocalStorage = (config:GameConfig) =>
{
    const key = config._game.localStorageKey;
    if(!key) { return; }

    // a corrupt or hand-edited entry used to throw here and kill the whole generation before it started
    let userConfig = {};
    try {
        userConfig = JSON.parse(window.localStorage[key] ?? "{}");
    } catch(e) {
        console.warn(`[Config] Ignoring unreadable settings in localStorage["${key}"]; using the declared defaults.`);
        window.localStorage.removeItem(key);
    }
    mergeObjects(config, userConfig);
}

export const ensureConfigProperties = (config:GameConfig) =>
{
    for(const prop of PROTECTED_CONFIGURATION_PROPERTIES)
    {
        config[prop] = config[prop] ?? {};
    }

    // default settings are one of the rare subfields the system basically requires
    config._settings.defaults = config._settings.defaults ?? {};
    config._settings.meta = config._settings.meta ?? {};

    // random seeding (if no fixed one set)
    config._settings.defaults.seed = config._settings.defaults.seed ?? { value: undefined };
    if(!config._settings.defaults.seed.value) { config._settings.defaults.seed.value = getRandomSeedString(); }
}

export interface GameConfigResources
{
    filter?: Function,
    base?: string,
    files?: Record<string,ResourceLoadParams>
}

export interface GameConfigGame
{
    name?: string,
    fileName?: string,

    renderer?: Renderer, // global renderer used for everything
    resLoader?: ResourceLoader, // global resource loader used for everything
    localStorageKey?: string,
    itemSize?: Vector2, // a fixed item size override/default in case no itemSize is set in some other way

    noUploadingCustomResources?: boolean, // if true, you can't execute this framework locally as it creates no input form for uploading trusted assets
    noDefaultSettings?: boolean, // if true, none of the default settings are appended to yours
    noInkFriendly?: boolean, // if true, the option to generate inkfriendly version is not shown
    noSeed?: boolean, // if true, the text input for a seed is not shown
    pageSides?: PageSides, // custom default double-sided or single-sided printing
}

export interface GameConfig
{
    _debug?:
    {
        onlyGenerate?: boolean, // only generate objects; don't draw/create images of them
        singleDrawPerType?: boolean, // only draw each unique type of material once   
        omitFile?: boolean, // don't put images into final PDF
        filterResources?: string[], // don't load+display these resources (for troubleshooting troublesome ones/saving loading time when debugging)

        profile?: boolean, // if enabled, profiles how long things take

        text?: boolean, // if true, outlines of text boxes are visible and debug info about their calculated properties/chunks is logged
        picker?: boolean, // if true, logs the output from material pickers
        mapper?: boolean, // if true, outlines from GridMapper show how it's placing stuff
        visualizer?: boolean, // if true, toggles debugging in the MaterialVisualizer (mostly logging the exact values it calculated)
        layoutOperation?: boolean, // @TODO: implemented, but what should we actually debug/report? Does it assign a unique ID to each operation-resource combo + do a more expensive check on its validity?
        strict?: boolean, // if true, logs every operation/text that relies on a default that V1->V2 changed (pivot, text alignment)
    },

    _resources?: GameConfigResources,
    _game?: GameConfigGame,

    _settings?:
    {
        // settings ABOUT the settings as a whole
        meta?:
        {
            selfDestroy?: boolean,
            button?: HTMLButtonElement,
            settingsContainer?: HTMLElement,
            feedbackNode?: HTMLElement
        },

        defaults?:
        {
            resources?: { value: FileList },
            pageSize?: { value: PageSize },
            pageSides?: { value: PageSides },
            itemSize?: { value: ItemSize },
            inkFriendly?: { value: boolean },
            seed?: { value: string },
            splitDims?: { value: string }, // this would be a GLOBAL splitDims for all elements
            language?: { value: string },
        },

        // all our custom settings
        [name: string]: any
    }

    _translation?: 
    {
        language?: string, // custom default language to use for translations (otherwise just picks first key)
        delimitersReplace?: { pre?: string, post?: string },
        delimitersTranslate?: { pre?: string, post?: string },
        dictionary: Record<string,Record<string,any>>,
    }

    _generation?:
    {
        visualizer?:any,
        pageOrientation?: PageOrientation,
        losslessPdf?: boolean,
        batchSize?: number,
        noBatching?: boolean,

        possibleSplitDims?: string[],
        possiblePageSizes?: PageSize[],
        possiblePageSides?: PageSides[],
        possibleItemSizes?: ItemSize[],
    },

    _drawing?: Record<string,any>, // the material visualizer ONLY configures (pre-multiplies/pre-configures) all values found inside here
    _material?: Record<string,MaterialConfig>,

}

export interface MapperConfig
{
    preset?: MapperPreset,
    autoStroke?: boolean,
    sizeElement?: Vector2,
    size?: Record<string,Vector2>,
    sizeGridForced?: Vector2,
    margin?: Vector2, // how much margin to have at the edge of the page
    pageSize?: PageSize, // unique size override
    pageOrientation?: PageOrientation, // unique orientation override
}

// A picker produces the material's items, and the framework accepts all three shapes projects actually use:
//   `() => Card[]`          the items itself
//   `() => BoardDisplay`    one item, for material that is a single canvas
//   `() => () => Card[]`    a generator, which `generateItems` calls with the config next
// It is required, so a material without one is a type error rather than a runtime `value.picker is not a
// function`; the shape itself stays open, because narrowing it to the three above would reject configs that
// build their material through a helper typed as `Function`.
export type MaterialPicker = (config?: GameConfig) => any;

export interface MaterialConfig
{
    picker: MaterialPicker, 
    mapper?:MapperConfig|MapperPreset,
    visualizer?:any,
    itemSize?: Vector2, // if no item size was given by other settings (e.g. PageMapper) it always uses this size
    splitDims?: Vector2, // these splitDims are only applied to this specific bit of material
    fileName?: string, // unique filename for this material
    frontDefault?: any, // if all cards have same front/back, you can just create that canvas once and reuse it this way
    backDefault?: any,
}
