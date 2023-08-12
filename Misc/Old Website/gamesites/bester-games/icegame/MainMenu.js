var whichSize = 0;
var whichSizeButs = [];

Scene.MainMenu = function (game) {
};

Scene.MainMenu.prototype = {
	create: function () {
		this.createEmitter(0,0.25,1);
		this.createEmitter(1,0.15,0.5);
		this.createEmitter(2,0.35,0.5);
		var logo = game.add.sprite(game.width/2,50,'logo');
		logo.anchor.setTo(0.5,0);
	    //Welcome Text!
    	var style2 = {align: 'center', font:"300 36px 'Oswald', sans-serif",fill:'Cornflowerblue'};
    	var style3 = {align: 'center', font:"700 36px 'Oswald', sans-serif",fill:'Cornflowerblue'};
    	var tempY = 300;
    	var b = game.add.text(game.width/2,tempY, 'With how many players would you like to play?',style3);
    	b.anchor.setTo(0.5,0);

	    var numLevels = 2;
	    var startX = game.width/2-(numLevels/2)*65;
	    var startY = tempY+100;
	    //Level Buttons
	    for(var i=0;i<numLevels;i++) {
	    	var aga = game.add.button(startX + i*70,startY+5,'levelnumber',this.changeSetting,this);
	    	aga.whichSetting = i;
	    	if(i != whichSize) { aga.alpha = 0; }
		    aga.scale.setTo(0.1,0.1);
		    aga.anchor.setTo(0,0.5);
		    whichSizeButs[i] = aga;

		    var arr = game.add.text(startX + 17.5 + i*70,startY,(i+1),style2);
		    arr.anchor.setTo(0.25,0.5);
	    }

	    var playY = tempY+350;
	    var aga = game.add.button(game.width/2,playY,'levelnumber',this.startLevel,this);
	    aga.scale.setTo(0.2,0.2);
	    aga.anchor.setTo(0.5,0.5);

	    var arr= game.add.text(game.width/2,playY,'PLAY!',style3);
	    arr.anchor.setTo(0.5,0.5);
	},

	changeSetting: function(a) {
		whichSize = a.whichSetting;
		for(var i=0;i<whichSizeButs.length;i++) {
			whichSizeButs[i].alpha = 0;
			if(whichSize == i) {
				whichSizeButs[i].alpha = 1;
			}
		}
	},

	startLevel: function(a) {
		MULTIPLAYER = whichSize+1;
		game.state.start('Main');
	},

	createEmitter: function(a,b,c) {
		emitter[a] = game.add.emitter(0,0,400);
		emitter[a].width = game.width*2;
		//emitter.angle = 10; // uncomment to set an angle for the rain.
		emitter[a].makeParticles('snow');

		emitter[a].minParticleScale = b;
		emitter[a].maxParticleScale = b+0.1;
		emitter[a].alpha = c;

		emitter[a].setYSpeed(500, 800);
		emitter[a].setXSpeed(-30,30);
		emitter[a].minRotation = 0;
		emitter[a].maxRotation = 0;

		emitter[a].start(false, 2500, 1, 0);
	},
	
}