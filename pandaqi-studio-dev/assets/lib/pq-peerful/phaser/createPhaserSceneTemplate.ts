
import { sendEvent } from "./../events";
import { Scene } from "./phaser.esm"

const PHASER_SCENE_KEY = "phaserScene";
const getExtension = (str:string) =>
{
    const pieces = str.split(".");
    return pieces[pieces.length - 1];
}

const createPhaserSceneTemplate = (node:HTMLElement, config:any) =>
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

export { getExtension, PHASER_SCENE_KEY };
export default createPhaserSceneTemplate;