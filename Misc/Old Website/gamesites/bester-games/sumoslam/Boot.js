var Scene = {};
Scene.Boot = function (game) {
	this.game = game;
};

Scene.Boot.prototype = {
	preload: function () {
		game.stage.backgroundColor = '#9AD8E2';
		this.load.image('loaderFull', 'SumoSlamCircle-10.png');
		this.load.image('loaderEmpty', 'SumoSlamCircle-11.png');
	},

	create: function () {
		//Start the preloader-state
		game.state.start('Load');
	},
	
}