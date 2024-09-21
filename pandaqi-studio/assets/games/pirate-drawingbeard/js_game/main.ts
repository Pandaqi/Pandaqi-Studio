// @ts-nocheck
import Extractor from "./extractor"
import GenerationScene from "./generation"
import { Game, CANVAS, Scale } from "js/pq_games/phaser/phaser.esm"

export default class PirateGame 
{
	start()
	{
		document.getElementById('phaser-container').innerHTML = '';

		// @IMPROV: initialize config BEFORE starting game, so we can just access this directly?
		const gameConfig = JSON.parse(window.localStorage.getItem("pirateDrawingbeardConfig"));
		const pdfSize = Extractor.calculatePDFSize();
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
			parent: 'phaser-game-container'
		}
	
		const game = new Game(config); 
		window.GAME = game; // @NOTE: keep around, it's actually used by other code
		game.scene.add('generation', GenerationScene, false, {});
		game.scene.start('generation', gameConfig);
	}
}

new PirateGame().start();