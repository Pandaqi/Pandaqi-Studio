//var Scene = {};

Scene.Load = function(game) {
	this.game = game;
};

Scene.Load.prototype = {
	preload: function() {

		//All Different Tiles
		this.load.spritesheet('test','The PaceHaze-01.png',500,500,11);
		this.load.image('train','Wagon-01.png');
		this.load.image('bg','ParallaxBackgroundPasen-01.png');
		this.load.image('transp','Transp-05.png');
		this.load.image('coupe','Wagon-02.png');
		this.load.image('cargo','Wagon2-02.png');
		this.load.image('cargo-coupe','Wagon-05.png');
		this.load.image('anti','Wagon-06.png');
		this.load.image('anti-coupe','Wagon-07.png');
		this.load.image('secure','Wagon-08.png');
		this.load.image('secure-coupe','Wagon-09.png');
		this.load.image('perron','Perron-01.png');
		this.load.image('securitycam','Wagon-10.png');
		this.load.image('toilet','Wagon-12.png');
		this.load.image('toilet-coupe','Wagon-13.png');
		this.load.spritesheet('toilet-door','Wagon-14.png',200,500,3);
		this.load.image('cafe','Wagon-15.png');
		this.load.image('cafe-coupe','Wagon-16.png');
		this.load.spritesheet('eggs','Eggsies-01.png',60,100,2);
		this.load.spritesheet('passengers','Passengers-02.png',150,500,3);
		this.load.image('carrots','Eggsies-03.png');
		this.load.image('levelNum','Eggsies-02.png');
		this.load.image('stats','Stats-01.png');
		this.load.spritesheet('juwels','Juwels-11.png',350,300,4);
		this.load.spritesheet('roofEnemy','Enemies-01.png',250,200,3);
		this.load.spritesheet('toiletEnemy','Enemies-02.png',200,500,2);
		this.load.image('barTendress','Wagon-17.png');
		this.load.spritesheet('conductor','Enemies-03.png',150,500,3);
		this.load.spritesheet('lineConductor','Enemies-04.png',150,500,3);
		//this.load.spritesheet('player','PlayerSpritesheet-01.png',320,500,4);
	},

	create:function() {
		game.scale.scaleMode = Phaser.ScaleManager.RESIZE;
		/*game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
		game.scale.setShowAll();*/
		game.scale.refresh();
		game.state.start('Main');
	}	

};