Scene.MainMenu = function (game) {
};

Scene.MainMenu.prototype = {
	create: function () {
		var onclickEvent = "onClick='continueGame();'";
		if(localStorage.getItem("slot1") == null || localStorage.getItem("slot1") == undefined) {
			onclickEvent = 'style="opacity:0.1;"';
		}
		document.getElementById('menuOverlay').innerHTML = '<table class="fullSizeTable" cellspacing="15"><tr><td onClick="newGame();" class="BigButton">New Game</td></tr><tr><td class="BigButton" ' + onclickEvent + '>Continue Game</td></tr></table>';
	},	
}