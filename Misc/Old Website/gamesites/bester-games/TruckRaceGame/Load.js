Scene.Load = function(game) {
	this.game = game;
};

Scene.Load.prototype = {
	preload: function() {
		this.load.image("wheel","Wheel-01.png");
		this.load.image("truck","Truck-02.png");
		this.load.image("cow","Cows-03.png");
	},

	create:function() {
		game.scale.scaleMode = Phaser.ScaleManager.RESIZE;
		game.scale.pageAlignHorizontally = true;
	    game.scale.pageAlignVertically = true;
	    game.scale.setScreenSize(true);

		game.scale.refresh();
		game.state.start('MainMenu');
	},	

};