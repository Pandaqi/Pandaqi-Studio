//var Scene = {};

Scene.Load = function(game) {
	this.game = game;
};

Scene.Load.prototype = {

	preload: function() {
		var loadSprite = game.add.sprite(game.width/2,game.height/2,"fire");
		loadSprite.anchor.setTo(0.5,0.5)
		loadSprite.animations.add("burn",[0,1,2],10,true);
		loadSprite.animations.play('burn');

		this.load.spritesheet('player','IceGameProps-11.png',500,500,5);
		this.load.image('logo','IceLogo-01.png');
		this.load.image('fridge1','IceGameProps-09.png');
		this.load.image('fridge2','IceGameProps-08.png');
		this.load.image('box','IceGameProps-02.png');
		this.load.spritesheet('trampo','IceGameProps-05.png',500,500,2);
		this.load.image('snow','IceGameProps-01.png');
		this.load.image('transp','Transp-05.png');
		this.load.image('reset','IceGameProps-03.png');
		this.load.image('cloud','IceGameProps-04.png');
		this.load.image('stick','IceGameProps-06.png');
		//this.load.spritesheet('fire','IceGameProps-07.png',500,500,4);
		this.load.image('rocket','IceGameProps-10.png');
		this.load.image('levelnumber','LevelNumber-01.png');
	},

	create:function() {
		game.scale.scaleMode = Phaser.ScaleManager.RESIZE;
		/*game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
		game.scale.setShowAll();*/
		game.scale.refresh();
		//game.state.start('Main');
		game.state.start('MainMenu');
	},	

};