Scene.MainMenu = function (game) {
	this.twinklers = [];
};

Scene.MainMenu.prototype = {
	create: function () {
		for(var a=0;a<10;a++) {
			var temp = game.add.sprite(0,0,'twinkler');
			temp.alpha = 0;
			temp.rotation = Math.random()*2*Math.PI;
			var timing = Math.random()*300+400;
			var scaleFactor = Math.random()*0.3+0.2;
			temp.scale.setTo(scaleFactor,scaleFactor);
			this.twinklers.push(temp);
			var tweenD = game.add.tween(temp).to({alpha: 1},timing,Phaser.Easing.Linear.InOut).to({alpha: 0},timing,Phaser.Easing.Linear.InOut).loop(true);
			tweenD.start();
		}

		this.buildings = game.add.image(game.width/2,game.height,'buildingsImage');
		this.buildings.anchor.setTo(0.5,0.5);
		this.pietings = game.add.image(game.width/2,0,'pietingsImage');
		this.pietings.anchor.setTo(0.5,0.5);
		this.theLine = game.add.graphics(0,game.height/2);
		this.theLine.lineStyle(10, 0x0e222f, 1);
		this.theLine.moveTo(0,28);
		this.theLine.lineTo(game.width,28);
		this.button = game.add.button(game.width*0.5,game.height-200, 'startButton',this.actionClick, this, 1, 0, 1);
		this.button.anchor.setTo(0.5,0.5);
		this.button.alpha = 0;
		var tweenA = game.add.tween(this.buildings).to({y: game.height*0.5},500,Phaser.Easing.Elastic.Out);
		var tweenB = game.add.tween(this.pietings).to({y: game.height*0.5},500,Phaser.Easing.Quadratic.Out);
		var tweenC = game.add.tween(this.button).to({alpha:1},500,Phaser.Easing.Linear.InOut);
		tweenA.chain(tweenB);
		tweenB.chain(tweenC);
		tweenA.start();
		//this.startLevel();
	},

	update: function() {
		for(var a=0;a<10;a++) {
			if(this.twinklers[a].alpha < 0.01) {
				this.twinklers[a].x = Math.random()*game.width;
				this.twinklers[a].y = Math.random()*game.height*0.5;
			}
		}
	},

	actionClick: function() {
		document.getElementById("bigContainerThingy").style.display = 'block';
		this.buildings.destroy();
		this.pietings.destroy();
		this.button.destroy();
		this.theLine.destroy();
		for(var a=0;a<10;a++) {
			this.twinklers[a].destroy();
		}
		this.twinklers = [];
		game.paused = true;
	},
}