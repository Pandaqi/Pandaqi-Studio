//var Scene = {};

Scene.Load = function(game) {
	this.game = game;
};

Scene.Load.prototype = {
	preload: function() {
		//Display an empty loader
        this.loaderEmpty = this.add.sprite(game.width/2-250, game.height/2, 'loaderEmpty');
        this.loaderEmpty.anchor.setTo(0,0.5);

        //Create the full loader
        this.preloadBar = this.add.sprite(game.width/2-250,game.height/2, 'loaderFull');
        this.preloadBar.anchor.setTo(0,0.5);
        //And let Phaser adjust it's size according to the loading progress
		this.load.setPreloadSprite(this.preloadBar);

		//All Different Tiles
		this.load.image('box','BombermanProps-05.png');
		this.load.spritesheet('pizza','BombermanProps-07.png',500,500,4);
		this.load.spritesheet('explode','BombermanProps-02.png',500,500,4);
		this.load.spritesheet('centerExplode','BombermanProps-03.png',500,500,4);
		this.load.image('transp','Transp-05.png');
		this.load.image('bounds','BombermanProps-06.png');
		this.load.spritesheet('bomb','BombermanProps-01.png',500,500,4);
		this.load.spritesheet('powerUps','BombermanProps-04.png',500,500,3);
		this.load.image('levelnumber','LevelNumber-01.png');
		this.load.image('GUI','BombermanProps-09.png');
	},

	create:function() {
		game.scale.scaleMode = Phaser.ScaleManager.RESIZE;
		/*game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
		game.scale.setShowAll();*/
		game.scale.refresh();
		game.state.start('MainMenu');
	}	

};