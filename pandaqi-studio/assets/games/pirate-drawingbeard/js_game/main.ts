// @ts-nocheck
import Extractor from "./extractor"
import GenerationScene from "./generation"
import { Game, CANVAS, Scale } from "js/pq_games/phaser.esm"

export default class PirateGame 
{
	constructor() {}
	start()
	{
		document.getElementById('phaser-container').innerHTML = '';

		let clientWidth = document.documentElement.clientWidth
		let clientHeight = document.documentElement.clientHeight
		let dpi = window.devicePixelRatio;
	
		 // @IMPROV: initialize config BEFORE starting game, so we can just access this directly?
		var gameConfig = JSON.parse(window.localStorage.pirateDrawingbeardConfig);
		var width = clientWidth * dpi;
		var height = clientHeight * dpi;
	
		var pdfSize = Extractor.calculatePDFSize();
		//if(gameConfig.createPremadeGame) {
			width = pdfSize.width;
			height = pdfSize.height;
		//}
	
		var config = {
			type: CANVAS,
			scale: {
				mode: Scale.FIT,
				parent: 'phaser-container',
				autoCenter: Scale.CENTER_BOTH,
				width: width,
				height: height
			},
			render: {
				transparent: true
			},
	
			backgroundColor: '#FFFFFF',
			parent: 'phaser-game-container'
		}
	
		const game = new Game(config); 
		// @ts-ignore
		window.GAME = game;
		game.scene.add('generation', GenerationScene, false, {});
		game.scene.start('generation', gameConfig);
	}
}

new PirateGame().start();