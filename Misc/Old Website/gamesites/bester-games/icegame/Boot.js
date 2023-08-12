var Scene = {};
Scene.Boot = function (game) {
	this.game = game;
};

Scene.Boot.prototype = {
	preload: function () {
		game.stage.backgroundColor = '#9AD8E2';
		this.load.spritesheet('fire','IceGameProps-07.png',500,500,4);
	},

	create: function () {
		//Start the preloader-state
		game.state.start('Load');
	},
	
}