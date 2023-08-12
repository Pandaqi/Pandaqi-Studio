Scene.GameOver = function(game) {
	this.game = game;
};

Scene.GameOver.prototype = {
	preload: function() {
		game.stage.backgroundColor = '#FFF0F5';
	},

	create: function (){

		var textStyle = {align: 'center', font:"52px 'Lobster'",fill:'Coral'};
		var textStyle2 = {align: 'center', font:"52px 'Lobster'",fill:'Green'};

		for(var i=0;i<RESULTS.length;i++) {
			if(RESULTS[i] == TOPSCORE) {
				var scoreTxt = game.add.text(game.width/2, 100, 'Player ' + (i+1) + ': ' + RESULTS[i],textStyle2);
			} else {
				var scoreTxt = game.add.text(game.width/2, 160+i*60, 'Player ' + (i+1) + ': ' + RESULTS[i],textStyle);
				scoreTxt.alpha = 0.5;
			}
			scoreTxt.anchor.setTo(0.5,0);
		}

	    /***Play again button*/
	    ala = game.add.button(game.width/4,game.height/3,'levelnumber',this.actionOnClick,this);
	    ala.anchor.setTo(0.5,0);
	    ala.scale.setTo(0.5,0.5);
	    ala.alpha = 0.8;
	    ala.fixedToCamera = true;
	    ala.inputEnabled = true;

	    textStyle = {align: 'center', font:"54px 'Oswald',sans-serif",fill:'Brown'};


		awardTxt = game.add.text(game.width/4, game.height/3+100, 'Play Again',textStyle);
		awardTxt.anchor.setTo(0.5,0);
	    awardTxt.setShadow(0, 0, 'rgba(255, 0, 0, 0.5)', 2);

	    /**Back to main menu button***/
	    var ara = game.add.button(game.width/4*3,game.height/3,'levelnumber',this.backToMain,this);
	    ara.anchor.setTo(0.5,0);
	    ara.scale.setTo(0.5,0.5);
	    ara.alpha = 0.8;
	    ara.fixedToCamera = true;
	    ara.inputEnabled = true;

		awardTxt = game.add.text(game.width/4*3,game.height/3+100, 'Back to Menu',textStyle);
		awardTxt.anchor.setTo(0.5,0);
	    awardTxt.setShadow(0, 0, 'rgba(255, 0, 0, 0.5)', 2);
	},

	actionOnClick: function() {
		game.state.start('Main');
	},

	backToMain: function() {
		game.state.start('MainMenu');
	}

};