//var Scene = {};

Scene.Load = function(game) {
	this.game = game;
};

Scene.Load.prototype = {

	preload: function() {
		//Display an empty loader
        this.loaderEmpty = this.add.sprite(game.width/2, game.height/2, 'loaderEmpty');
        this.loaderEmpty.x -= this.loaderEmpty.width/2;
        this.loaderEmpty.anchor.setTo(0,0.5);

        //Create the full loader
        this.preloadBar = this.add.sprite(game.width/2,game.height/2, 'loaderFull');
        this.preloadBar.x -= this.preloadBar.width/2;
        this.preloadBar.anchor.setTo(0,0.5);
        //And let Phaser adjust it's size according to the loading progress
		this.load.setPreloadSprite(this.preloadBar);

		this.load.image('box','SumoSlamCircle-08.png');
		this.load.image('circle','SumoSlamCircle-01.png');
		this.load.image('transp','Transp-05.png');
		this.load.image('bg','SumoSlamCircle-02.png');
		this.load.image('levelnumber','LevelNumber-01.png');
		this.load.spritesheet('player1','SumoSlamCircle-03.png',500,500,3);
		this.load.spritesheet('player2','SumoSlamCircle-04.png',500,500,3);
		this.load.spritesheet('player3','SumoSlamCircle-05.png',500,500,3);
		this.load.spritesheet('player4','SumoSlamCircle-06.png',500,500,3);
		this.load.image('title','SumoSlamCircle-07.png');
		this.load.image('theBall','SumoSlamCircle-09.png');
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