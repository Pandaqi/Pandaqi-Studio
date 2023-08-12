var GAME_TYPE = 1;
var amountPlayers = 2;
var playersPerTeam = 1;
var lastWinner = null;

Scene.MainMenu = function (game) {
};

Scene.MainMenu.prototype = {
	create: function () {
		game.input.keyboard.addCallbacks(this, null, this.userInput, null);
		game.stage.backgroundColor = "#cccccc";

		game.add.text(game.width*0.15, game.height*0.5, "Press 1 for drunk mode\n\n4 players maximum (everyone has a single key).\nTeam 1: W and U\nTeam 2: UP-Key and V");
		game.add.text(game.width*0.65, game.height*0.5, "Press 2 for normal mode\n\n2 players\nTeam 1: Arrow Keys\nTeam 2: WASD");
	},

	userInput: function(e) {
		if(e.keyCode == Phaser.Keyboard.ONE) {
			GAME_TYPE = 0;
			amountPlayers = 2;
			playersPerTeam = 2;
			game.state.start('Main');
		} else if(e.keyCode == Phaser.Keyboard.TWO) {
			GAME_TYPE = 1;
			amountPlayers = 2;
			playersPerTeam = 1;
			game.state.start('Main');
		}
	}
		
}