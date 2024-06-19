import Resource from "./resource"
import ResourceImage from "./resourceImage"
import ResourceFont from "./resourceFont"
import TextConfig from "../text/textConfig"
import Point from "js/pq_games/tools/geometry/point"
import { ResourceLike } from "../layoutOperation"
import ResourceText from "./resourceText"

interface ResourceLoaderParams
{
    base?:string
}

interface ResourceLoadParams
{
    path?: string
    id?: string
    key?: string
    textConfig?: TextConfig,
    useAbsolutePath?: boolean // default is false = relative path, potentially from base
    inkfriendly?: boolean, // default = false
    loadIf?: string[], // only if these specific paths in config evaluate to TRUE, load this asset
    disableCaching?: boolean

    numThumbnails?: number,
    frames?: Point,
    uniqueKey?: string,
}

export { ResourceLoaderParams, ResourceLoadParams }
export default class ResourceLoader 
{

    IMAGE_EXTENSIONS = ["jpg", "jpeg", "webp", "png", "jfif", "avif", "svg"]
    AUDIO_EXTENSIONS = ["mp3", "ogg", "wav"]
    VIDEO_EXTENSIONS = ["mp4", "webm"]
    FONT_EXTENSIONS = ["otf", "ttf", "woff", "woff2"]

    resourcesQueued : Record<string, ResourceLoadParams>
    resourcesLoaded : Record<string, Resource>
    base: string

    constructor(params:ResourceLoaderParams = {})
    {
        this.resourcesQueued = {};
        this.resourcesLoaded = {};

        this.base = params.base ?? "";
        if(this.base.slice(-1) != "/") { this.base += "/"; }
    }

    planLoad(id:string, params:ResourceLoadParams = {})
    {
        if(!params.path) { return console.error("Can't load resource without path."); }
        const resourceAlreadyLoaded = this.resourcesQueued[id] || this.resourcesLoaded[id];
        if(resourceAlreadyLoaded) { return; }

        this.resourcesQueued[id] = Object.assign({}, params);
        
        if(params.inkfriendly)
        {
            const newParams = structuredClone(params);
            const pathSplit = params.path.split(".");
            newParams.path = pathSplit[0] + "_inkfriendly" + "." + pathSplit[1];
            this.resourcesQueued[id + "_inkfriendly"] = newParams;
        }
    }

    getStringPathIntoDict(paths:string[], config:Record<string,any>)
    {
        for(const pathString of paths)
        {
            const path = pathString.split(".");
            let val = config;
            for(const elem of path)
            {
                val = val[elem];
                if(val == undefined) { break; }
            }
            if(val) { return true; }
        }
        return false;
    }

    planLoadMultiple(dict:Record<string,ResourceLoadParams>, config:Record<string,any> = {})
    {
        for(const [id,data] of Object.entries(dict))
        {
            if(data.loadIf)
            {
                const val = this.getStringPathIntoDict(data.loadIf, config);
                if(!val) { continue; }
            }
            this.planLoad(id, data);
        }
    }

    async loadPlannedResources()
    {
        if(Object.keys(this.resourcesQueued).length <= 0) { return; }

        const promises = [];
        for(const [id, params] of Object.entries(this.resourcesQueued))
        {
            promises.push(this.loadResource(id, params));
        }

        this.resourcesQueued = {};
        await Promise.all(promises);
    }

    getExtension(path:string) : string
    {
        const splitPath = path.split(".");
        if(splitPath.length <= 1) { return ""; }
        return splitPath[splitPath.length - 1];
    }

    isImage(path:string) : boolean
    {
        return this.IMAGE_EXTENSIONS.includes(this.getExtension(path))
    }

    isAudio(path:string) : boolean
    {
        return this.AUDIO_EXTENSIONS.includes(this.getExtension(path))
    }

    isVideo(path:string) : boolean
    {
        return this.VIDEO_EXTENSIONS.includes(this.getExtension(path))
    }

    isFont(path:string) : boolean
    {
        return this.FONT_EXTENSIONS.includes(this.getExtension(path));
    }

    addResource(id:string, res:Resource)
    {
        this.resourcesLoaded[id] = res;
    }

    async loadResource(id:string, params:ResourceLoadParams)
    {
        let originalPath = params.path ?? "";
        let path;
        if(params.useAbsolutePath) { path = params.path; } 
        else {
            // @NOTE: base always ends on a slash, so originalPath should never start with one
            if(originalPath.slice(0,1) == "/") { originalPath = originalPath.slice(1); }
            path = this.base + originalPath;
        }

        params.path = path;

        const key = (params.id ?? params.key) ?? id;

        if(this.isImage(path))
        {
            const img = new Image();
            img.src = params.path;
            await img.decode();
            await this.cacheLoadedImage(key, params, img);
        }

        if(this.isFont(path))
        {
            const textConfig = params.textConfig ? params.textConfig.getFontFaceDescriptors() : {};
            const fontFile = new FontFace(key, "url('" + params.path + "')", textConfig);
            const f = await fontFile.load()
            this.cacheLoadedFont(key, params, f)
        }
    }

    cacheLoadedFont(id:string, params:ResourceLoadParams, f:FontFace)
    {
        // @ts-ignore
        document.fonts.add(f);
        const res = new ResourceFont(f, params);
        this.resourcesLoaded[id] = res;
    }

    async cacheLoadedImage(id:string, params:ResourceLoadParams, img:HTMLImageElement)
    {
        const res = new ResourceImage(img, params);
        if(!params.disableCaching) { await res.cacheFrames(); }
        this.resourcesLoaded[id] = res;
    }

    getResource(id:string, copy:boolean = false) : any
    {
        let res = this.resourcesLoaded[id];
        if(!res) { return null; }
        if(copy) { res = res.clone(true); }
        return res;
    }
}