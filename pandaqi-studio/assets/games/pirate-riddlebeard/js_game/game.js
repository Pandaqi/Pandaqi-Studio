import GenerationScene from "./generation"
import { scaleFactor, pdfSize } from "./dictionary"

export default class Game {
    constructor() {}

    start() {
        document.getElementById('phaser-container').innerHTML = '';
    
        let clientWidth = document.documentElement.clientWidth
        let clientHeight = document.documentElement.clientHeight
        let dpi = window.devicePixelRatio;

        const gameConfig = JSON.parse(window.localStorage.pirateRiddlebeardData);
        var width = clientWidth * dpi;
        var height = clientHeight * dpi;
        //if(gameConfig.premadeGame) {
            width = pdfSize.width;
            height = pdfSize.height;
        //}
    
        var config = {
            type: Phaser.CANVAS,
            scale: {
                mode: Phaser.Scale.FIT,
                parent: 'phaser-container',
                autoCenter: Phaser.Scale.CENTER_BOTH,
                width: width,
                height: height
            },
            render: {
                transparent: true
            },
    
            backgroundColor: '#FFFFFF',
            parent: 'phaserGameContainer'
        }
    
        window.GAME = new Phaser.Game(config); 
    
        GAME.scene.add('generation', GenerationScene, false, {});
        GAME.scene.start('generation', gameConfig);
    }
}