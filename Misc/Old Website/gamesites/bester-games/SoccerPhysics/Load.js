Scene.Load = function(game) {
	this.game = game;
};

Scene.Load.prototype = {

	preload: function() {
		// to do
		game.load.image('body0', 'Player0.png');
		game.load.image('leg0', 'Player0.png');
		game.load.image('arm0', 'Player0.png');
		game.load.image('head0', 'Player0.png');

		game.load.image('body1', 'Player1.png');
		game.load.image('leg1', 'Player1.png');
		game.load.image('arm1', 'Player1.png');
		game.load.image('head1', 'Player1.png');

		game.load.image('grass', 'Grass.png');
		game.load.image('ball', 'Ball.png');

		game.load.image('goal', 'Goal.png');
	},

	create:function() {
		game.scale.scaleMode = Phaser.ScaleManager.RESIZE;
		/*game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
		game.scale.setShowAll();*/
		game.scale.refresh();
		game.state.start('MainMenu');
	},	

};