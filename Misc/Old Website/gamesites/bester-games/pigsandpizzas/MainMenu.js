Scene.MainMenu = function (game) {
};

Scene.MainMenu.prototype = {
	menuHolder:Phaser.Group,
	welcomeTxt:Phaser.Text,
	laGroup:Phaser.Group,
	preload: function () {
		game.stage.backgroundColor = '#FFFAF0';
	},

	create: function () {
		if(localStorage.maxLevel === undefined || localStorage.maxLevel === '') {
			localStorage.maxLevel = '0';
		}

		//Display a background
		bg = game.add.sprite(game.width/2,0,'mainmenubg');
	    bg.anchor.setTo(0.5,0);
	    bg.height = game.height;
	    bg.width = bg.height;

		menuHolder = game.add.group();

		//And create buttons
		//Play Button!
		var ala = game.add.button(game.width/2,317,'bar',this.actionOnClick,this);
	    ala.anchor.setTo(0.5,0);
	    ala.scale.setTo(PW*3,PW*3);
	    ala.alpha = 0.8;
	    ala.fixedToCamera = true;
	    ala.inputEnabled = true;
	    menuHolder.add(ala);

	    var textStyle = {align: 'center', font:"48px 'Just Me Again Down Here',cursive",fill:'Brown'};

		var aTxt = game.add.text(game.width/2, 360, 'Play!',textStyle);
		aTxt.lineSpacing = 60;
		aTxt.anchor.setTo(0.5,0);
	    aTxt.setShadow(0, 0, 'rgba(255, 0, 0, 0.5)', 2);
	    menuHolder.add(aTxt);

	    game.input.keyboard.addCallbacks(this,null,this.submitIt,null);

	    //Welcome Text!
    	var style2 = {align: 'center', font:"24px 'Open Sans', sans-serif",fill:'DarkRed',style:'bold'};

	    welcomeTxt = game.add.text(20,20,'',style2);
	    welcomeTxt.anchor.setTo(0,0);
	    welcomeTxt.setShadow(0, 0, 'rgba(255, 0, 0, 0.5)', 2);

	    laGroup = game.add.group();

	    var numLevels = Number(localStorage.maxLevel)+2;
	    var maxMade = 6;
	    if(numLevels > maxMade-1) {
	    	numLevels = maxMade;
	    }
	    var startX = game.width/2-(numLevels/2)*65;
	    //Level Buttons
	    for(var i=0;i<numLevels;i++) {
	    	var aga = game.add.button(startX + i*70,550,'levelnumber',this.levelStart,this);
	    	aga.whichLevel = i;
		    aga.scale.setTo(0.1,0.1);
		    aga.anchor.setTo(0,0.5);
		    laGroup.add(aga);

		    var arr= game.add.text(startX + 17.5 + i*70, 550,''+(i+1),style2);
		    arr.anchor.setTo(0,0.5);
		    arr.setShadow(0, 0, 'rgba(255, 0, 0, 0.5)', 2);		
		    laGroup.add(arr);    
	    }
	    laGroup.visible = false;
	},

	update: function() {
		//localStorage.usn = '';
		if(localStorage.usn === undefined || localStorage.usn === '') {
			menuHolder.visible = false;
			document.getElementById('GUIoverlay').style.visibility = 'visible';
			document.getElementById('theInput').focus();
		} else {
			//Display username (confirmation things have gone the right way!)
			menuHolder.visible = true;
			welcomeTxt.text = 'Welcome back, ' + localStorage.usn + '!';
			document.getElementById('GUIoverlay').style.visibility = 'hidden';
		}
	},

	levelStart: function(a) {
		localStorage.curLevel = String(a.whichLevel);
		game.state.start('Main');
	},

	actionOnClick: function() {
		(laGroup.visible)? (laGroup.visible = false) : (laGroup.visible = true);
	},

	submitIt:function(e) {
		if(e.keyCode === 13) {
			e.preventDefault();
			var ala = document.getElementById('theInput').value;
			ala = ala.replace(/[^\w]/g,'');
			if(ala != '') {
				localStorage.usn = ala;
			}
		}
	},
	
}