var Scene = {};
Scene.Boot = function (game) {
	this.game = game;
};

Scene.Boot.prototype = {
	preload: function () {
		game.stage.backgroundColor = 'Brown';
		//Load images for a full loader and the empty one
		this.load.image('loaderFull', 'LoaderFull-19.png');
		this.load.image('loaderEmpty', 'LoaderEmpty-19.png');
	},

	create: function () {
		//Start the preloader-state
		game.state.start('Load');
	},
	
}