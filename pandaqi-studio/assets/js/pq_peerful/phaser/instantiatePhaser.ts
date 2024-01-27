// @ts-ignore
import { Game, CANVAS, WEBGL, Scale } from "./phaser.esm"

interface PhaserConfig
{
    enabled?: boolean
    size?: { x: number, y: number }
    renderer?: string // canvas or webgl
    backgroundColor?: string // hex color
    scenes?: any // the scenes to automatically add in phaser (not necessarily load)
}

const instantiatePhaser = (node:HTMLElement, scene: any, config:PhaserConfig) =>
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

export default instantiatePhaser;