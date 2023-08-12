var Scene = {};
Scene.Boot = function (game) {
	this.game = game;
};

Scene.Boot.prototype = {
	preload: function () {
		game.stage.backgroundColor = 'Brown';
	},

	create: function () {
		//Start the preloader-state
		game.state.start('Load');
	},
	
}