import WordsPhotomone from "./wordsPhotomone";
import CanvasDrawable from "./canvasDrawable";
import ResourceLoader from "js/pq_games/layout/resources/resourceLoader";
import PHOTOMONE_BASE_PARAMS from "./config"

export default class PhotomoneGame 
{
    constructor(params: any) { this.start(params); }
    
    // Creates a dictionary only with the point types we want to use (given user configuration)
    preparePointTypes(cfg:Record<string,any>)
    {
        const dict : Record<string,any> = cfg.pointTypesDictionary;
        const newDict = {};
        for(const [key, value] of Object.entries(dict))
        {
            if(value.expansion && !cfg.expansions[value.expansion]) { continue; }
            newDict[key] = value;
        }
        return newDict;
    }

    async start(params: { gameTitle: string; loadGame: any; callback: Function; })
    {
        const gameTitle = params.gameTitle || "photomone";

        let configString = window.localStorage.photomoneConfig;
        if(gameTitle == "photomoneDigital") { 
            configString = window.localStorage.photomoneDigitalAntistsConfig; 
        }
    
        let config = Object.assign({}, PHOTOMONE_BASE_PARAMS);
        let userConfig = JSON.parse(configString || "{}");
        Object.assign(config, userConfig);
    
        config.pointTypesDictionary = config.pointTypesDictionaries[gameTitle];
        config.pointTypes = this.preparePointTypes(config);
        config.pointSpritePath = config.pointSpritePaths[gameTitle];
        config.pointSpriteFrames = config.pointSpriteFrameSets[gameTitle];
        
        config.WORDS = new WordsPhotomone();
        await config.WORDS.prepare(config);
    
        config.RESOURCE_LOADER = new ResourceLoader();
        config.RESOURCE_LOADER.planLoad("point_types", { path: config.pointSpritePath, frames: config.pointSpriteFrames });
        await config.RESOURCE_LOADER.loadPlannedResources();
        
        const canvasNodes = Array.from(document.getElementsByClassName("photomone-canvas"));
        for(const canv of canvasNodes)
        {
            new CanvasDrawable(canv as HTMLCanvasElement, config);
        }
    
        if(params.loadGame) { params.callback(config); }
    }
}

// @ts-ignore
window.PHOTOMONE = {
    Game: PhotomoneGame
}