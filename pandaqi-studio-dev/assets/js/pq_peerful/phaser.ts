// @ts-ignore
import { Game, CANVAS, WEBGL, Scale } from "./phaser.esm"
import { PeerfulConfig } from "./main";

const instantiatePhaser = (config:PeerfulConfig) =>
{
    const renderer = config.phaserRenderer == "webgl" ? WEBGL : CANVAS;
    const bgColor = config.phaserBackgroundColor ?? "#FFFFFF";

    const cont = document.createElement("div");
    cont.id = "phaser-container";
    config.node.appendChild(cont);

    // @NOTE: if you want these to autostart, you must set that inside the scene definition
    let scenes = config.phaserScenes ?? [];
    if(!Array.isArray(scenes)) { scenes = [scenes]; }

    const phaserConfig = {
        type: renderer,
        width: 1920,
        height: 1280,
        scale: {
            mode: Scale.FIT,
        },
    
        backgroundColor: bgColor,
        parent: 'phaser-container',
        scene: scenes,
    }
    
    const phaserGame = new Game(phaserConfig);
    return phaserGame;
}

export default instantiatePhaser;