var whichSize = 1;
var whichDiff = 1;
var whichMode = 1;
var whichSizeButs = [];
var whichDiffButs = [];
var whichModeButs = [];

Scene.MainMenu = function (game) {
};

Scene.MainMenu.prototype = {
	preload: function () {
		game.stage.backgroundColor = '#FFFAF0';
	},

	create: function () {
	    var textStyle = {align: 'center', font:"54px 'Oswald',sans-serif",fill:'Brown'};

		var aTxt = game.add.text(game.width/2, game.height/10, 'BOMBERMAN',textStyle);
		aTxt.lineSpacing = 60;
		aTxt.anchor.setTo(0.5,0);

	    //Welcome Text!
    	var style2 = {align: 'center', font:"24px 'Oswald', sans-serif",fill:'DarkRed'};
    	var style3 = {align: 'center', font:"700 24px 'Oswald', sans-serif",fill:'DarkRed'};
    	var b = game.add.text(game.width/2, game.height/4, 'PLAYING FIELD SIZE',style3);
    	b.anchor.setTo(0.5,0);

	    var numLevels = 5;
	    var startX = game.width/2-(numLevels/2)*65;
	    var startY = game.height/4+50;
	    //Level Buttons
	    for(var i=0;i<numLevels;i++) {
	    	var aga = game.add.button(startX + i*70,startY+5,'levelnumber',this.changeSetting,this);
	    	aga.whichSetting = i;
	    	aga.whichType = 'SIZE';
	    	if(i != whichSize) { aga.alpha = 0; }
		    aga.scale.setTo(0.1,0.1);
		    aga.anchor.setTo(0,0.5);
		    whichSizeButs[i] = aga;

		    var text;
		    if(i==0) {
		    	text = 'XS';
		    } else if(i==1) {
		    	text = 'S';
		    } else if(i==2) {
		    	text = 'M';
		    } else if(i==3) {
		    	text = 'L';
		    } else {
		    	text = 'XL';
		    }

		    var arr= game.add.text(startX + 17.5 + i*70,startY,text,style2);
		    arr.anchor.setTo(0.25,0.5);
	    }

	    var b = game.add.text(game.width/2, game.height/4+100, 'DIFFICULTY',style3);
    	b.anchor.setTo(0.5,0);

	    var numLevels = 4;
	    var startX = game.width/2-(numLevels/2)*65;
	    var startY = game.height/4+150;
	    //Level Buttons
	    for(var i=0;i<numLevels;i++) {
	    	var aga = game.add.button(startX + i*70,startY+5,'levelnumber',this.changeSetting,this);
	    	aga.whichSetting = i;
	    	aga.whichType = 'DIFF';
	    	if(i != whichDiff) { aga.alpha = 0; }
		    aga.scale.setTo(0.1,0.1);
		    aga.anchor.setTo(0,0.5);
		    whichDiffButs[i] = aga;

		    var arr= game.add.text(startX + 17.5 + i*70,startY,''+i,style2);
		    arr.anchor.setTo(0,0.5);
	    }

	    var b = game.add.text(game.width/2, game.height/4+200, 'NUMBER OF PLAYERS',style3);
    	b.anchor.setTo(0.5,0);

	    var numLevels = 4;
	    var startX = game.width/2-(numLevels/2)*65;
	    var startY = game.height/4+250;
	    //Level Buttons
	    for(var i=0;i<numLevels;i++) {
	    	var aga = game.add.button(startX + i*70,startY+5,'levelnumber',this.changeSetting,this);
	    	aga.whichSetting = i;
	    	aga.whichType = 'MULTI';
	    	if(i != whichMode) { aga.alpha = 0; }
		    aga.scale.setTo(0.1,0.1);
		    aga.anchor.setTo(0,0.5);
		    whichModeButs[i] = aga;

		    var arr= game.add.text(startX + 17.5 + i*70,startY,''+(i+1),style2);
		    arr.anchor.setTo(0,0.5);
	    }

	    var playY = game.height/4+400;
	    var aga = game.add.button(game.width/2,playY,'levelnumber',this.startLevel,this);
	    aga.scale.setTo(0.2,0.2);
	    aga.anchor.setTo(0.5,0.5);

	    var arr= game.add.text(game.width/2,playY,'PLAY!',style3);
	    arr.anchor.setTo(0.5,0.5);
	},

	update: function() {
	},

	changeSetting: function(a) {
		if(a.whichType == 'SIZE') {
			whichSize = a.whichSetting;
			for(var i=0;i<whichSizeButs.length;i++) {
				whichSizeButs[i].alpha = 0;
				if(whichSize == i) {
					whichSizeButs[i].alpha = 1;
				}
			}
		} else if(a.whichType == 'DIFF') {
			whichDiff = a.whichSetting;
			for(var i=0;i<whichDiffButs.length;i++) {
				whichDiffButs[i].alpha = 0;
				if(whichDiff == i) {
					whichDiffButs[i].alpha = 1;
				}
			}
		} else if(a.whichType == 'MULTI') {
			whichMode = a.whichSetting;
			for(var i=0;i<whichModeButs.length;i++) {
				whichModeButs[i].alpha = 0;
				if(whichMode == i) {
					whichModeButs[i].alpha = 1;
				}
			}
		}
	},

	startLevel: function(a) {
		FIELDSIZE = whichSize;
		DIFFICULTY = whichDiff;
		MULTIPLAYER = whichMode;
		game.state.start('Main');
	},
	
}