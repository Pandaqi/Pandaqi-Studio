var ala;
var bubu;
var element;

Scene.GameOver = function(game) {
	this.game = game;
};

Scene.GameOver.prototype = {
	preload: function() {
		game.stage.backgroundColor = '#FFF0F5';
	},

	create:function() {
		element = this;
		$.ajax({
	        url: 'submitHighscore.php',
	        type: 'GET',
	        data: { theUSN: localStorage.usn, theSCORE : localStorage.lastScore} ,
	        contentType: 'application/json; charset=utf-8',
	        success: function (response) {
	            //your success code
	            console.log(response);
	            bubu = response.split("-");
	           	element.loadGameOver();
	        },
	        error: function () {
	            //your error code
	        }
	    }); 
	    
	},

	loadGameOver: function (){
		bg = game.add.sprite(game.width/2,0,'gameoverbg');
	    //bg.width = game.width;
	    bg.anchor.setTo(0.5,0);
	    bg.height = game.height;
		bg.fixedToCamera = true;

		var a = localStorage.result;
		var texts = ['',''];
		if(a === 'WIN') {
			texts[0] = 'You Win. You rock!';
			texts[1] = 'and, you did so with the glorious score of..';

			if(Number(localStorage.curLevel) >= Number(localStorage.maxLevel)) {
				localStorage.maxLevel = String(Number(localStorage.curLevel)+1);
			}
		} else {
			texts[0] = 'You Died. Loser.';
			texts[1] = 'however, you did manage to get a score of..';
		}
		var b = localStorage.lastScore;

		var textStyle = {align: 'center', font:"52px 'Lobster'",fill:'Coral'};

		awardTxt = game.add.text(game.width/2, 40, texts[0],textStyle);
		awardTxt.lineSpacing = 60;
		awardTxt.anchor.setTo(0.5,0.5);
	    awardTxt.setShadow(0, 0, 'rgba(0, 0, 0, 0.5)', 5);

	    textStyle = {align: 'center', font:"32px 'Open Sans',sans-serif",fill:'IndianRed'};

		awardTxt = game.add.text(game.width/2, 120, texts[1],textStyle);
		awardTxt.lineSpacing = 60;
		awardTxt.anchor.setTo(0.5,0.5);
	    awardTxt.setShadow(0, 0, 'rgba(0, 0, 0, 0.5)', 5);

	    textStyle = {align: 'center', font:"128px 'Inconsolata'",fill:'LightSalmon'};

		awardTxt = game.add.text(game.width/2, 220, b,textStyle);
		awardTxt.lineSpacing = 60;
		awardTxt.anchor.setTo(0.5,0.5);
	    awardTxt.setShadow(0, 0, 'rgba(0, 0, 0, 0.5)', 5);

	    if(localStorage.newHigh === '1') {
		    textStyle = {align: 'center', font:"32px 'Open Sans', sans-serif",fill:'LimeGreen',style:'bold'};

		    awardTxt = game.add.text(game.width/2, 340, bubu[1],textStyle);
			awardTxt.anchor.setTo(0.5,0.5);
		    awardTxt.setShadow(0, 0, 'rgba(0, 255, 0, 0.5)', 5);
	    } else {
	    	textStyle = {align: 'center', font:"32px 'Open Sans', sans-serif",fill:'DarkRed',style:'bold'};

		    awardTxt = game.add.text(game.width/2, 340, '(your highscore: ' + localStorage.highScore + ' | global highscore: ' + bubu[0] + ')',textStyle);
			awardTxt.anchor.setTo(0.5,0.5);
		    awardTxt.setShadow(0, 0, 'rgba(255, 0, 0, 0.5)', 5);
	    }
	    /***Play again button*/
	    ala = game.add.button(game.width/2,385,'smallbar',this.actionOnClick,this);
	    ala.anchor.setTo(0.5,0);
	    ala.scale.setTo(PW*3,PW*3);
	    ala.alpha = 0.8;
	    ala.fixedToCamera = true;
	    ala.inputEnabled = true;

	    textStyle = {align: 'center', font:"48px 'Just Me Again Down Here',cursive",fill:'Brown'};

		awardTxt = game.add.text(game.width/2, 390, 'Play Again',textStyle);
		awardTxt.anchor.setTo(0.5,0);
	    awardTxt.setShadow(0, 0, 'rgba(255, 0, 0, 0.5)', 2);
	    /**Back to main menu button***/
	    var ara = game.add.button(game.width/2,495,'smallbar',this.backToMain,this);
	    ara.anchor.setTo(0.5,0);
	    ara.scale.setTo(PW*3,PW*3);
	    ara.alpha = 0.8;
	    ara.fixedToCamera = true;
	    ara.inputEnabled = true;

	    textStyle = {align: 'center', font:"48px 'Just Me Again Down Here',cursive",fill:'Brown'};

		awardTxt = game.add.text(game.width/2, 500, 'Back to Menu',textStyle);
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