Scene.MainMenu = function(game) {
	this.game = game;
};

Scene.MainMenu.prototype = {

	create:function() {
		document.getElementById('mainMenu').style.display = 'block';
	},	

};