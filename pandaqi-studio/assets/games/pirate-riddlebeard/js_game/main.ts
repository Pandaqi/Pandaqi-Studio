// @ts-nocheck
import { CANVAS, Game, Scale } from "js/pq_games/phaser/phaser.esm";
import { pdfSize } from "./dictionary";
import GenerationScene from "./generation";

export default class PirateGame 
{
    start() 
    {
        document.getElementById('phaser-container').innerHTML = '';
    
        const gameConfig = JSON.parse(window.localStorage.getItem("pirateRiddlebeardData"));
        const width = pdfSize.width;
        const height = pdfSize.height;
    
        const config = 
        {
            type: CANVAS,
            scale: 
            {
                mode: Scale.FIT,
                parent: 'phaser-container',
                autoCenter: Scale.CENTER_BOTH,
                width: width,
                height: height
            },
            
            render: 
            {
                transparent: true
            },
    
            backgroundColor: '#FFFFFF',
            parent: 'phaserGameContainer'
        }
    
        const game = new Game(config); 
        window.GAME = game; // @NOTE: keep around, it's actually used by other code
        game.scene.add('generation', GenerationScene, false, {});
        game.scene.start('generation', gameConfig);
    }
}

new PirateGame().start();