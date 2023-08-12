//var Scene = {};

Scene.Load = function(game) {
	this.game = game;
};

Scene.Load.prototype = {

	preload: function() {
		this.load.spritesheet('team0',"Cyclist-02.png",100,50);
		this.load.spritesheet('yellow',"Cyclist-05.png",100,50);
		this.load.spritesheet('green',"Cyclist-06.png",100,50);
		this.load.spritesheet('polka',"Cyclist-07.png",100,50);
		this.load.spritesheet('white',"Cyclist-08.png",100,50);
		this.load.spritesheet('team1',"Cyclist-09.png",100,50);
		this.load.spritesheet('team2',"Cyclist-10.png",100,50);
		this.load.spritesheet('team3',"Cyclist-11.png",100,50);
		this.load.spritesheet('team4',"Cyclist-12.png",100,50);
		this.load.spritesheet('team5',"Cyclist-13.png",100,50);
		this.load.spritesheet('team6',"Cyclist-14.png",100,50);
		this.load.spritesheet('team7',"Cyclist-15.png",100,50);
		this.load.image('glow',"CyclingGlow-03.png");
		//this.load.image('block2',"MoraleBar.png");
		this.load.image('hillLine','HillLine.png');
		this.load.image('sprintLine','SprintLine.png');
		this.load.image('finishLine','FinishLine.png');
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