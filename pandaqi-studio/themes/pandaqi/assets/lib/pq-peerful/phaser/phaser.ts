// @ts-nocheck
import { Game, CANVAS, WEBGL, Scale } from "./phaser.esm"
import { sendEvent } from "../events";

export interface PhaserConfig
{
    enabled?: boolean
    size?: { x: number, y: number }
    renderer?: string // canvas or webgl
    backgroundColor?: string // hex color
    scenes?: any // the scenes to automatically add in phaser (not necessarily load)
}

export const instantiatePhaser = (node:HTMLElement, scene: any, config:PhaserConfig) =>
{
    if(!config.enabled) { return null; } // @TODO: might not be a good system for quick toggle on/off

    const renderer = config.renderer == "webgl" ? WEBGL : CANVAS;
    const bgColor = config.backgroundColor ?? "#FFFFFF";

    const width = config.size.x ?? 1920;
    const height = config.size.y ?? 1280;

    const cont = document.createElement("div");
    cont.id = "phaser-container";
    node.appendChild(cont);

    const phaserConfig = {
        type: renderer,
        width: width,
        height: height,
        scale: {
            mode: Scale.FIT,
        },
    
        backgroundColor: bgColor,
        parent: 'phaser-container',
        scene: scene,
    }
    
    const phaserGame = new Game(phaserConfig);
    return phaserGame;
}

export const PHASER_SCENE_KEY = "phaserScene";
export const getExtension = (str:string) =>
{
    const pieces = str.split(".");
    return pieces[pieces.length - 1];
}

export const createPhaserSceneTemplate = (node:HTMLElement, config:any) =>
{
    class PhaserScene extends Scene 
    {
        constructor() 
        {
            super({ key: PHASER_SCENE_KEY, active: true });
        }

        preload() 
        {
            for(const [key,res] of Object.entries(config.assets))
            {
                const path = res.src;
                const ext = getExtension(path);
                const isImage = (ext == "webp" || ext == "png" || ext == "jpg" || ext == "jpeg");
                const isAudio = (ext == "mp3" || ext == "ogg" || ext == "wav");
                
                if(isImage)
                {
                    const frameSize = res.frames ?? { x: 1, y: 1 };
                    const sheetData = {
                        frameWidth: frameSize.x,
                        frameHeight: frameSize.y
                    }
                    const isSingleFrame = sheetData.frameWidth * sheetData.frameHeight <= 1;
    
                    if(isSingleFrame) {
                        this.load.image(key, path);
                    } else {
                        this.load.spritesheet(key, path, sheetData);
                    }
                }

                if(isAudio)
                {
                    this.load.audio(key, path);
                }
            }
        }
        
        create(data)
        {
            sendEvent("phaser-create", this, node);
        }

        update(time, delta)
        {
            sendEvent("phaser-update", this, node)
        }
    }

    return PhaserScene;
}