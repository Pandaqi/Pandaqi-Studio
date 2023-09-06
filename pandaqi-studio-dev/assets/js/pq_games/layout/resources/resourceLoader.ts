import Resource from "./resource"
import ResourceImage from "./resourceImage"
import ResourceFont from "./resourceFont"

export default class ResourceLoader 
{

    IMAGE_EXTENSIONS = ["jpg", "jpeg", "webp", "png", "jfif", "avif"]
    AUDIO_EXTENSIONS = ["mp3", "ogg", "wav"]
    VIDEO_EXTENSIONS = ["mp4", "webm"]
    FONT_EXTENSIONS = ["otf", "ttf", "woff", "woff2"]

    resourcesQueued : Record<string, Resource>
    resourcesLoaded : Record<string, Resource>

    constructor()
    {
        this.resourcesQueued = {};
        this.resourcesLoaded = {};
    }

    planLoad(id:string, params:any = {})
    {
        if(!params.path) { return console.error("Can't load resource without path."); }
        
        this.resourcesQueued[id] = params;
        
        if(params.inkfriendly)
        {
            const newParams = structuredClone(params);
            const pathSplit = params.path.split(".");
            newParams.path = pathSplit[0] + "_inkfriendly" + "." + pathSplit[1];
            this.resourcesQueued[id + "_inkfriendly"] = newParams;
        }
    }

    async loadPlannedResources()
    {
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

    loadResource(id:string, params:any)
    {
        const path = params.path ?? "";
        const that = this;

        if(this.isImage(path))
        {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.src = params.path;
                img.onload = () => {
                    that.cacheLoadedImage(id, params, img);
                    resolve(true);
                };
            });
        }

        if(this.isFont(path))
        {
            const fontFile = new FontFace(params.key, "url('" + params.path + "')");
            return fontFile.load().then((f) => { this.cacheLoadedFont(id, params, f) });
        }
    }

    cacheLoadedFont(id:string, params:any, f:FontFace)
    {
        // @ts-ignore
        document.fonts.add(f);
        const res = new ResourceFont(f, params);
        this.resourcesLoaded[id] = res;
    }

    cacheLoadedImage(id:string, params:any, img:HTMLImageElement)
    {
        const res = new ResourceImage(img, params);
        this.resourcesLoaded[id] = res;
    }

    getResource(id:string, copy:boolean = true) : Resource
    {
        let res = this.resourcesLoaded[id];
        if(copy) { res = res.clone(); }
        return res;
    }
}