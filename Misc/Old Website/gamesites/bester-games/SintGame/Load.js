Scene.Load = function(game) {
	this.game = game;
};

Scene.Load.prototype = {

	preload: function() {
		this.load.image('rooftop','RoofTop.png');
		this.load.image('dakpan','DakPan.png');
		this.load.image('chimney','Chimney.png');
		this.load.spritesheet('pete','PeteAnim.png',113.5,143,5);
		this.load.spritesheet('amerigo','AmerigoAnim.png',198.6,142,5);
		this.load.image('sint','JustSint.png');
		this.load.spritesheet('miniMapCircle','MiniMapCircle.png',142,142,3);
		this.load.image('selectionCursor','SelectionCursor.png');
		this.load.image('miniMapSint','MiniMapSint.png');

		this.load.spritesheet('present0','SquarePresent.png',142,142,3);
		this.load.spritesheet('present1','RoundPresent.png',142,142,3);
		this.load.spritesheet('present2','TrianglePresent.png',142,142,3);
		this.load.spritesheet('presentColours','PresentColours.png',(86/3),29,3);

		this.load.image('aPepernoot','APepernoot.png');

		//Role index: regular, master dropper, ninja, master catcher, guard, bridge, pepernoter
		this.load.image('type1','type1.png');
		this.load.image('type2','type2.png');
		this.load.image('type3','type3.png');
		this.load.image('type4','type4.png');
		this.load.image('type5','type5.png');
		this.load.image('type6','type6.png');
		this.load.image('type7','type7.png');

		this.load.image('buildingsImage','SintGame-23.png');
		this.load.image('pietingsImage','SintGamePieten-23.png');
		this.load.spritesheet('startButton','SintGame-24.png',142,142,2);
		this.load.image('twinkler','SintGame-25.png');

		this.load.image('inGameMenu','SintGame-32.png');
		this.load.image('menuSintState','SintGame-33.png');
	},

	create:function() {
		game.scale.scaleMode = Phaser.ScaleManager.RESIZE;
		/*game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
		game.scale.setShowAll();*/
		game.scale.refresh();
		game.state.start('MainMenu');
	},	

};