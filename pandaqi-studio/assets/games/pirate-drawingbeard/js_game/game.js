import Extractor from "./extractor"
import GenerationScene from "./generation"

export default class Game {
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
			parent: 'phaser-game-container'
		}
	
		window.GAME = new Phaser.Game(config); 
	
		GAME.scene.add('generation', GenerationScene, false, {});
		GAME.scene.start('generation', gameConfig);
	}
}