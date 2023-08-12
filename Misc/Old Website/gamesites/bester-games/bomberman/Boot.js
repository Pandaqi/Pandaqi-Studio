var Scene = {};
Scene.Boot = function (game) {
	this.game = game;
};

Scene.Boot.prototype = {
	preload: function () {
		game.stage.backgroundColor = 'Brown';
		this.load.image('loaderFull', 'BombermanProps-11.png');
		this.load.image('loaderEmpty', 'BombermanProps-10.png');
	},

	create: function () {
		//Start the preloader-state
		game.state.start('Load');
	},
	
}