// @ts-ignore
import { CANVAS, Game, Scale } from "js/pq_games/phaser/phaser.esm";
import Renderer, { RendererDrawFinishParams } from "./renderer";
import ResourceImage from "../resources/resourceImage";
import { ResourceLoadParams } from "../resources/resourceLoader";

export default class RendererPhaser extends Renderer
{
    phaserGame:Game

    // we just need to have the ResourceImage, so it can be converted to Phaser
    async cacheLoadedImage(img:HTMLImageElement, params:ResourceLoadParams) : Promise<ResourceImage>
    {
        await img.decode();
        return new ResourceImage(img, params);
    }

    prepareDraw(cfg:Record<string,any>)
    {
        // @ts-ignore
        const phaserConfig = {
            type: CANVAS,
            width: cfg.size.x,
            height: cfg.size.y,
            scale: {
                mode: Scale.FIT,
            },

            backgroundColor: cfg.bgColor ?? '#FFFFFF',
            parent: 'phaser-container',
            scene: [cfg.renderClass],
        }

        this.phaserGame = new Game(phaserConfig);
        // @ts-ignore
        window.PHASER_GAME = this.phaserGame; 
        this.phaserGame.scene.start("boardGeneration", cfg);

        return this.phaserGame;
    }

    async finishDraw(params:RendererDrawFinishParams)
    {
        await new Promise((r) => setTimeout(r, 100)); // must wait a bit to ensure Phaser canvas is actually redrawn
        return this.phaserGame.canvas;
    }

    /* WEBGL rendering
    img = await new Promise((resolve) => {
            scene.renderer.snapshot(image =>
            {
                resolve(image);
            });
        })
    */
}