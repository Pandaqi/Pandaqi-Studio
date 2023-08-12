var Scene = {};
Scene.Boot = function (game) {
	this.game = game;
};

Scene.Boot.prototype = {
	preload: function () {
		//game.stage.backgroundColor = '#2C3E50';
		game.stage.backgroundColor = '#354b60';
	},

	create: function () {
		//Start the preloader-state
		game.state.start('Load');
	},
	
}