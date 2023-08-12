//var Scene = {};

Scene.Load = function(game) {
	this.game = game;
};

Scene.Load.prototype = {
	preloadBar: Phaser.Sprite,
    loaderEmpty: Phaser.Sprite,

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
		this.load.image('ground','GroundTile-01.png');
		this.load.image('broken','BrokenTile-06.png');
		this.load.image('lego','LegoTile-07.png');
		this.load.image('door','DoorTile-08.png');
		this.load.image('teleport','TeleportTile-14.png');
		this.load.image('trampoline','TrampoTile-15.png');
		this.load.image('ice','IceTile-18.png');
		this.load.image('underground','UnderGround-22.png');
		//Player, pizza and pig (The 3 Ps)
		this.load.spritesheet('player','PlayerSpritesheet-01.png',320,500,4);
		this.load.image('pizza','Pizza.png');
		this.load.image('firebolt','FireBolt-21.png');
		this.load.spritesheet('pig','PigSpritesheet-02.png',500,500,5);
		//BackGrounds
		this.load.image('bg','ParallaxBackground-01.png');
		this.load.image('gameoverbg','GameOverBackground-02.png');
		this.load.image('mainmenubg','MainMenuBG-03.png');
		//Special Boxes
		this.load.spritesheet('box','PizzaboxSpritesheet-03.png',500,500,3);
		this.load.spritesheet('key','KeyboxSpritesheet-04.png',500,500,3);
		this.load.spritesheet('lifebox','LifeBoxSpritesheet-05.png',500,500,3);
		//MENU SMALL ICONS
		this.load.image('bar','MenuBar-10.png');
		this.load.image('smallbar','MenuBar-01.png');
		this.load.image('singlekey','AKey-11.png');
		this.load.image('heart','Heart-12.png');
		this.load.image('thumb','Thumb-13.png');
		this.load.image('levelnumber','LevelNumber-01.png');
		//Transparent tile for sensors
		this.load.image('transp','Transp-05.png');
		//Pause Screen
		this.load.image('pausescreen','PauseScreen-17.png');
		//DRAGON
		this.load.spritesheet('dragon','DragonSprite.png',1025,368,3);
		this.load.image('pinkball','PinkBall.png');
	},

	create:function() {
		game.scale.scaleMode = Phaser.ScaleManager.RESIZE;
		/*game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
		game.scale.setShowAll();*/
		game.scale.refresh();
		//game.state.start('Main');
		game.state.start('MainMenu');
	}	

};