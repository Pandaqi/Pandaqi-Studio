var whichSize = 1;
var whichSizeButs = [];
var whichModeButs = [];

Scene.MainMenu = function (game) {
};

Scene.MainMenu.prototype = {
	preload: function () {
		game.stage.backgroundColor = '#FFFAF0';
	},

	create: function () {
		var bg = game.add.sprite(0,0,'bg');
		bg.width = game.width;

		var aTxt = game.add.sprite(game.width/2, game.height/10,'title');
		aTxt.scale.setTo(0.6,0.6);
		aTxt.anchor.setTo(0.5,0);

	    //Welcome Text!
    	var style2 = {align: 'center', font:"300 24px 'Oswald', sans-serif",fill:'#46993D'};
    	var style3 = {align: 'center', font:"700 24px 'Oswald', sans-serif",fill:'#46993D'};
    	var tempY = aTxt.y+aTxt.height+25;
    	var b = game.add.text(game.width/2,tempY, 'With how many players would you like to wrestle?',style3);
    	b.anchor.setTo(0.5,0);

	    var numLevels = 4;
	    var startX = game.width/2-(numLevels/2)*65;
	    var startY = tempY+75;
	    //Level Buttons
	    for(var i=0;i<numLevels;i++) {
	    	var aga = game.add.button(startX + i*70,startY+5,'levelnumber',this.changeSetting,this);
	    	aga.whichSetting = i;
	    	if(i != whichSize) { aga.alpha = 0; }
		    aga.scale.setTo(0.1,0.1);
		    aga.anchor.setTo(0,0.5);
		    whichSizeButs[i] = aga;

		    var arr= game.add.text(startX + 17.5 + i*70,startY,(i+1),style2);
		    arr.anchor.setTo(0.25,0.5);
	    }

	    var b = game.add.text(game.width/2,tempY+150, 'What extras would you like in your game?',style3);
    	b.anchor.setTo(0.5,0);
	    var numLevels = 4;
	    var startX = game.width/2-(numLevels/2)*115;
	    var startY = tempY+225;
	    //Level Buttons
	    for(var i=0;i<numLevels;i++) {
	    	var aga = game.add.button(startX + i*120,startY+5,'levelnumber',this.turnOn,this);
	    	aga.whichSetting = i;
	    	aga.alpha = 0;
		    aga.scale.setTo(0.15,0.1);
		    aga.anchor.setTo(0,0.5);
		    whichModeButs[i] = aga;

		    var text;
		    if(i==0) {
		    	text = 'Huge';
		    } else if(i==1) {
		    	text = 'Obstacles';
		    } else if(i==2) {
		    	text = 'Speedy';
		    } else if(i==3) {
		    	text = 'Soccer';
		    }

		    var arr= game.add.text(startX + 17.5 + i*120,startY,text,style2);
		    arr.anchor.setTo(0.25,0.5);
	    }

	    var playY = tempY+350;
	    var aga = game.add.button(game.width/2,playY,'levelnumber',this.startLevel,this);
	    aga.scale.setTo(0.2,0.2);
	    aga.anchor.setTo(0.5,0.5);

	    var arr= game.add.text(game.width/2,playY,'PLAY!',style3);
	    arr.anchor.setTo(0.5,0.5);
	},

	update: function() {
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

	turnOn: function(a) {
		if(whichModeButs[a.whichSetting].alpha == 0) {
			whichModeButs[a.whichSetting].alpha = 1;
			whichModes[a.whichSetting] = 1;
		} else {
			whichModeButs[a.whichSetting].alpha = 0;
			whichModes[a.whichSetting] = 0;
		}
	},

	startLevel: function(a) {
		MULTIPLAYER = whichSize;
		MODES = whichModes;
		game.state.start('Main');
	},
	
}