var presArr = [];
var presGroup;
var pietGroup;
var chimArr = [];
var chimneyGroup;
var bridgeArr = [];
var peperNootArr = [];
var theSint;
var pietArr = [];
var theSintImage;

var LIVES = 3;
var POINTS = 0;
var PEPERNOTEN = 0;

Scene.Main = function(game) {
	//Counter to give every present its own ID
	this.runningCounter = 0;
	//Counter to check when to dispatch the next pepernoot
	this.nextPepernoot = 0;
	//Counter to check when to change the Sint's direction
	this.nextSintDecision = 0;

	//Variables concerning the minimap sprites and positions
	this.miniMap = [];
	this.miniMapPos = [];
	this.miniMapDim = [];
	this.miniMapGroup = null;
	this.miniMapNumbers = [];
	this.miniMapSint = null;

	//All four major collision groups
	this.pietCollisionGroup = null;
	this.levelCollisionGroup = null;
	this.chimneyCollisionGroup = null;
	this.bridgeCollisionGroup = null;

	//The bouncing cursor that shows the currently selected Piet
	this.selectionCursor = null;
	//The variablet that holds the index (in pietArr) of the currently selected Piet
	this.currentSelected = 1;

	//Saving the world size so we don't have to calculate it every time (PERF)
	this.worldW = 0;
	this.worldH = 0;

	//Variable that determines amount of Piets in the game
	this.pietAmount = 1;

	//All menu texts
	this.menuTimeText = null;
	this.menuPointText = null;
	this.menuLivesText = null;
	this.menuPeperText = null;

	this.menuSintState = null;

	//Calling certain functions only once per second (approximately)
	this.timeIncrements = 0;

	//Checking colour duplicatse
	this.availableColours = [];
	this.usedColours = [];
	this.colourCodeGroup;

	this.theTime = 0;

	this.bigMapNumbers = [];
	this.roleGraphics = [];

	this.sintState = 0;
	this.sintDir = 0;
};

Scene.Main.prototype = {
	create: function() {
		game.physics.startSystem(Phaser.Physics.P2JS); 
		game.physics.p2.setImpactEvents(true);
	    game.physics.p2.gravity.y = 1500;

	    this.selectionCursor = game.add.sprite(0,0,'selectionCursor');
	    this.selectionCursor.anchor.setTo(0.5,0.5);
	    this.selectionCursor.width = this.selectionCursor.height = 40;
	    this.selectionCursor.anim = 0;
	    this.selectionCursor.dir = -1;

	    //Set colour availability
	    if(LEVELSETTINGS[4] == 3) {
	    	this.availableColours = [0,1,2];
	    } else if(LEVELSETTINGS[4] == 2) {
	    	var r = Math.random();
	    	if(r > 0.33) {
		    	this.availableColours = [0,1];	    		
	    	} else if(r > 0.66) {
		    	this.availableColours = [0,2];
	    	} else {
		    	this.availableColours = [1,2];
	    	}
	    } else {
	    	this.availableColours = [Math.round(Math.random()*2.98-0.48)];
	    }

	    //Add menu at the top
	    var inGameMenu = game.add.image(game.width*0.5,0,'inGameMenu');
	    inGameMenu.anchor.setTo(0.5,0);
	    inGameMenu.fixedToCamera = true;
	    var scale = (game.width*0.75)/inGameMenu.width;
	    inGameMenu.width = game.width*0.75;
	    inGameMenu.height *= scale;

	    this.menuSintState = game.add.image(game.width*0.382,game.width*0.016,'menuSintState');
	    this.menuSintState.width = 100;
	    this.menuSintState.height = game.width*0.03;
	    this.menuSintState.fixedToCamera = true;

	    this.menuTimeText = game.add.text(game.width*0.22,28,this.theTime,{fill:'#372313',font:'40px Cartwheel'});
	    this.menuTimeText.fixedToCamera = true;
		this.menuPointText = game.add.text(game.width*0.34,28,POINTS,{fill:'#372313',font:'40px Cartwheel'});
	    this.menuPointText.fixedToCamera = true;
	    this.menuLivesText = game.add.text(game.width*0.68,28,LIVES,{fill:'#372313',font:'40px Cartwheel'});
	    this.menuLivesText.fixedToCamera = true;
	    if(LEVELSETTINGS[5] > 0) {
		    this.menuPeperText = game.add.text(game.width*0.78,28,PEPERNOTEN,{fill:'#372313',font:'40px Cartwheel'});
		    this.menuPeperText.fixedToCamera = true;
	    }

		this.miniMapDim = [400,150];
		this.miniMapPos = [game.width*0.5-200,100];

		this.miniMapGroup = game.add.group();
		this.miniMapGroup.fixedToCamera = true;

		chimneyGroup = game.add.group();

		presGroup = game.add.group();

		this.colourCodeGroup = game.add.group();

		this.pietCollisionGroup = game.physics.p2.createCollisionGroup();
	    this.levelCollisionGroup = game.physics.p2.createCollisionGroup();
	    this.chimneyCollisionGroup = game.physics.p2.createCollisionGroup();
	    this.bridgeCollisionGroup = game.physics.p2.createCollisionGroup();
	    game.physics.p2.updateBoundsCollisionGroup();

		theSint = game.add.sprite(400,100,'amerigo');
		theSint.animations.add('walk',[1,2,3,4],10,true,true);
		game.physics.p2.enable(theSint);
		theSint.body.setRectangle(theSint.width,theSint.height);
		theSint.body.setCollisionGroup(this.pietCollisionGroup);
		theSint.body.collides(this.levelCollisionGroup);
		theSint.body.collides(this.bridgeCollisionGroup);
		theSint.blockedDir = [0,0];
		theSint.name = 'sint';
		theSint.anchor.setTo(0.5,0.5);

		theSintImage = game.add.image(0,0,'sint');
		theSintImage.anchor.setTo(0.5,0.5);
		theSintImage.fluctuation = 0;

		pietGroup = game.add.group();

		/***GENERATE LEVEL**/
		var startX = Math.random()*100;
		var startY = Math.random()*(game.height-600-50)+600;
		var setMiniRoof = [];
		for(var i=0;i<LEVELSETTINGS[3];i++) {
			//Determining width
			var theWidth = 500 + LEVELSETTINGS[6]*100 + Math.random()*(500 + LEVELSETTINGS[6]*100);
			//THE FUCK DID I DO THIS FOR?
			theWidth = Math.round(theWidth/100)*100;

			var temp = this.createRoof(startX,startY,theWidth);

			setMiniRoof[2*i+1] = temp[0];
			setMiniRoof[2*i] = temp[1];
			var oldY = startY;
			var oldX = startX+theWidth;
			//Determining gap
			startX += theWidth + 225 + LEVELSETTINGS[7]*25 + Math.random()*(50+LEVELSETTINGS[7]*25);	
			startY += Math.random()*200-100;
			if(startY > game.height-50) {
				startY = game.height - 50;
			}
			if(i < (LEVELSETTINGS[3]-1)) {
				var bridge = game.add.sprite(oldX+10,oldY,'miniMapSint');
				bridge.width = 20; bridge.height = startX-oldX+5;
				game.physics.p2.enable(bridge);
				bridge.anchor.setTo(0,1);
				bridge.body.setRectangle(20,startX-oldX+5,10,-(startX-oldX+10)*0.5);
				bridge.body.rotation = Math.atan2((startY-oldY),(startX-oldX))+0.5*Math.PI;
				bridge.body.static = true;
				bridge.name = 'bridge';
				bridge.alpha = 0;
				bridge.body.setCollisionGroup(this.bridgeCollisionGroup);
				bridge.body.collides(this.pietCollisionGroup);
				bridgeArr.push(bridge);

			}
		}

		game.world.setBounds(0,0,startX,game.height);
		this.worldW = (1/game.world.width);
		this.worldH = (1/game.world.height);
		game.physics.p2.setBoundsToWorld(true, true, true, true, false);

		this.miniMapSint = game.add.image(0,0,'miniMapSint');
		this.miniMapSint.height = 180;
		this.miniMapSint.width = 5;
		this.miniMapGroup.add(this.miniMapSint);

		for(var i=0;i<setMiniRoof.length;i++) {
			var X = setMiniRoof[i].x, Y = setMiniRoof[i].y, WIDTH = setMiniRoof[i].width
			var miniVisual = game.add.image(this.miniMapPos[0] + X*this.worldW*this.miniMapDim[0],this.miniMapPos[1] + Y*this.worldH*this.miniMapDim[1]-15,'rooftop');
			miniVisual.width = WIDTH*(this.miniMapDim[0]*this.worldW);
			miniVisual.height = this.miniMapDim[1] + this.miniMapPos[1] - miniVisual.y;
			this.miniMapGroup.add(miniVisual);
		}

		this.pietAmount = Math.min(myData.team.length,LEVELSETTINGS[0]);
		for(var i=0;i<this.pietAmount;i++) {
			var theP = myData.pieten[myData.team[i]];
			var blackPiet = game.add.sprite(100+i*100,100,'pete');
			blackPiet.animations.add('walk',[1,2,4,2,3,2,4,2],16,true,true);
			blackPiet.anchor.setTo(0.5,0.5);
			pietGroup.add(blackPiet);

			game.physics.p2.enable(blackPiet);
		    blackPiet.body.setRectangle(blackPiet.width*0.5,blackPiet.height);
		    blackPiet.body.fixedRotation = true;
		    blackPiet.body.setCollisionGroup(this.pietCollisionGroup);
		    blackPiet.body.collides([this.levelCollisionGroup,this.chimneyCollisionGroup]);
		    blackPiet.name = 'piet';

			pietArr[i] = blackPiet;
			blackPiet.holdingPresent = null;

			this.miniMap[i] = game.add.image(100,100,'miniMapCircle');
			this.miniMap[i].anchor.setTo(0.5,0.5);
			this.miniMap[i].width = this.miniMap[i].height = 10;
			this.miniMapGroup.add(this.miniMap[i]);

			this.miniMapNumbers[i] = game.add.text(0,0,''+(i+1),{fill:'#16a085',font:'14px Calibri'});
			this.miniMapNumbers[i].anchor.setTo(0.5,0.5);
			this.miniMapNumbers[i].y = this.miniMapPos[1] + this.miniMapDim[1] + 15;
			this.miniMapGroup.add(this.miniMapNumbers[i]);

			this.bigMapNumbers[i] = game.add.text(0,0,''+(i+1),{fill:'#16a085',font:'40px Calibri'});
			this.bigMapNumbers[i].anchor.setTo(0.5,0.5);

			blackPiet.role = theP[0]-1;
			blackPiet.startDelivering = 0;
			blackPiet.lastPresent = -1;
			this.roleGraphics[i] = game.add.image(0,0,'type'+(blackPiet.role+1));
			this.roleGraphics[i].width = this.roleGraphics[i].height = 40;
			this.roleGraphics[i].anchor.setTo(0.5,0.5);

			var level = theP[1]-1;

			//Regular: 500
			blackPiet.mySpeed = 300+(level/9)*400;
			//Regular: -900
			blackPiet.myJumpSpeed = -700-(level/9)*400;
			//Regular: 1 (circle with radius Piet's height)
			blackPiet.myRange = 0.5+(level/9)*2;
			//Depends for every person.
			blackPiet.mySpecialRange = 1;

			if(blackPiet.role == 3) {
				blackPiet.myRange = 2.5+(level/9)*4;
			}
		}

		game.input.keyboard.addCallbacks(this,null,this.userInput,null);
		game.physics.p2.setPostBroadphaseCallback(this.enableBridges, this);
	},

	userInput: function(e) {
		var scaleFac = game.width*this.worldW;
		switch(e.keyCode) {
			case Phaser.Keyboard.ONE:
				this.currentSelected = 1;
				break;
			case Phaser.Keyboard.TWO:
				this.currentSelected = 2;
				break;
			case Phaser.Keyboard.THREE:
				this.currentSelected = 3;
				break;
			case Phaser.Keyboard.FOUR:
				this.currentSelected = 4;
				break;
			case Phaser.Keyboard.FIVE:
				this.currentSelected = 5;
				break;
			case Phaser.Keyboard.SIX:
				this.currentSelected = 6;
				break;
			case Phaser.Keyboard.SEVEN:
				this.currentSelected = 7;
				break;
			case Phaser.Keyboard.Q:
				game.world.scale.x *= 0.9;
				game.world.scale.y *= 0.9;
				break;
			case Phaser.Keyboard.W:
				game.world.scale.x *= 1.1;
				game.world.scale.y *= 1.1;
				break;
			case Phaser.Keyboard.DOWN:
				this.pressedDown();
				break;
		}
		if(this.currentSelected > this.pietAmount) {
			this.currentSelected = this.pietAmount;
		}
	},

	enableBridges: function(body1,body2) {
		 if ((body1.sprite.name === 'sint' && body2.sprite.name === 'bridge') || (body2.sprite.name === 'sint' && body1.sprite.name === 'bridge')){
		 	if(body1.sprite.alpha == 1 && body2.sprite.alpha == 1) {
		 		return true;
		 	} else {
		        return false;		 		
		 	}
	    } else if ((body1.sprite.name == 'piet' && body2.sprite.name == 'present') || (body2.sprite.name == 'piet' && body1.sprite.name == 'present')) {
	    	if(body1.sprite.role == 5 || body2.sprite.role == 5) {
	    		return true;
	    	} else {
	    		return false;
	    	}
	    } else if((body1.sprite.name == 'present' || body1.sprite.name == 'chimney') && (body2.sprite.name == 'present' || body2.sprite.name == 'chimney')) {
	    	if(body1.sprite.col == body2.sprite.col) {
	    		return true;
	    	} else {
	    		return false;
	    	}
	    }
	    return true;
	},

	pressedDown: function() {
		blackPiet = pietArr[(this.currentSelected-1)];
		if(blackPiet.role == 5) {
			if(blackPiet.startDelivering == 0) {
				blackPiet.body.fixedRotation = false;
				blackPiet.body.rotation = 0.5*Math.PI;
				blackPiet.startDelivering = 1;
			} else if(blackPiet.startDelivering == 1) {
				blackPiet.rotation -= 0.5*Math.PI;
				blackPiet.body.rotation = 0;
				blackPiet.body.fixedRotation = true;
				blackPiet.startDelivering = 0;
			}
		} else if(blackPiet.role !=6 && blackPiet.holdingPresent != null) {
			if(blackPiet.role != 2) {
				blackPiet.holdingPresent.sprite.isPossessed = false;
				blackPiet.holdingPresent.data.gravityScale = 1;
			}
			if(blackPiet.role == 1) {
				//MASTER THROWER
				var closeChim = chimArr[0];
				var prevDist = this.dist(chimArr[0],blackPiet);
				for(var a=1;a<chimArr.length;a++) {
					if(this.dist(chimArr[a],blackPiet) < prevDist) {
						closeChim = chimArr[a];
						prevDist = this.dist(chimArr[a],blackPiet);
					}
				}
				var dir = closeChim.x > blackPiet.holdingPresent.x ? 1 : -1;
				var timeReq = Math.abs(closeChim.x-blackPiet.holdingPresent.x)/300;
				var yDist = closeChim.y-blackPiet.holdingPresent.y;
				if(timeReq*300 < 500) {
					yDist -= 200;
				}
				blackPiet.holdingPresent.static = false;
				blackPiet.holdingPresent.velocity.x = 300*dir;
				blackPiet.holdingPresent.velocity.y = yDist/timeReq - 0.5*(1500-timeReq*300)*timeReq*timeReq;
				blackPiet.holdingPresent = null;
			} else if(blackPiet.role == 2) {
				//NINJA!
				blackPiet.startDelivering = 1;
			} else if(blackPiet.role == 3) {
				//MASTER CATCHER
				var suc = -1;
				for(var a=0;a<this.pietAmount;a++) {
					if(pietArr[a].holdingPresent == null && pietArr[a].role != 5) {
						suc = a;
					}
				}
				if(suc >= 0) {
					var dir = pietArr[suc].x > blackPiet.holdingPresent.x ? 1 : -1;
					var timeReq = Math.abs(pietArr[suc].x-blackPiet.holdingPresent.x);
					var yDist = pietArr[suc].y-blackPiet.holdingPresent.y;
					var speed = 300;
					if(timeReq < 800) {
						yDist -= 300;
					} else if(timeReq*300 > 1500) {
						speed = 800;
					}
					timeReq = timeReq/speed;
					blackPiet.holdingPresent.static = false;
					blackPiet.holdingPresent.velocity.x = speed*dir;
					blackPiet.holdingPresent.velocity.y = yDist/timeReq - 0.5*(1500-timeReq*300)*timeReq*timeReq;
					blackPiet.holdingPresent.sprite.newOne = true;
					blackPiet.lastPresent = blackPiet.holdingPresent.sprite.myID;
					blackPiet.holdingPresent = null;
				}
			} else {
				//REGULAR
				blackPiet.holdingPresent.static = false;
				blackPiet.holdingPresent.velocity.y = 900;
				blackPiet.holdingPresent.velocity.x = blackPiet.body.velocity.x;
				blackPiet.holdingPresent = null;
			}
		}
	},

	createRoof: function(X,Y,WIDTH) {
		for(var z=0;z<LEVELSETTINGS[2];z++) {
			/**CHIMNEY***/
			var chimneySize = 60;
			var tempWidth = WIDTH/LEVELSETTINGS[2];
			var randomPos = Math.random()*(tempWidth-chimneySize*2)+X+z*tempWidth+chimneySize;
			var height = chimneySize*Math.random()*0.5+chimneySize*0.5;
			var chimney = game.add.sprite(randomPos,Y-height,'chimney');
			chimney.name = 'chimney';
			//chimney.width = chimney.height = chimneySize;
			chimneyGroup.add(chimney);
			chimArr.push(chimney);
			var colour = this.availableColours[Math.round(Math.random()*(this.availableColours.length-1))];
			if(chimArr.length < (LEVELSETTINGS[4]+1)) {
				while(this.usedColours.indexOf(colour) > -1) {
					colour = this.availableColours[Math.round(Math.random()*(this.availableColours.length-1))];
				}
				this.usedColours.push(colour);
			}
			chimney.col = colour;
			game.physics.p2.enable(chimney);
			var maxChimneyHeight = game.height-Y;
			var endHeight = Math.abs(Math.random()*(maxChimneyHeight-100))+100;
			var endWidth = Math.random()*70+50;
			chimney.height = endHeight;
			chimney.width = endWidth*2;
			chimney.body.clearShapes();
			var path = [[-endWidth,0],[-endWidth,endHeight],[endWidth,endHeight],[endWidth,0],[endWidth-10,0],[endWidth-10,endHeight-10],[-endWidth+10,endHeight-10],[-endWidth+10,0]];
			chimney.body.addPolygon({},path);
			chimney.body.static = true;
			chimney.body.setCollisionGroup(this.chimneyCollisionGroup);
			chimney.body.collides(this.chimneyCollisionGroup);

		    /**** CHIMNEY COLOUR BAR ***/
		    var chimCol = game.add.sprite(chimney.x-chimney.width*0.5,Y,'presentColours');
		    chimCol.width = chimney.width;
		    chimCol.height = 50;
		    chimCol.frame = colour;
		    this.colourCodeGroup.add(chimCol);
		}
		/***DAKPANNEN**/
		var panWidth = 100;
		for(var i=0;i<(WIDTH/panWidth);i++) {
			for(var j=0;j<7;j++) {
				var dakpan = game.add.image(X+i*panWidth+10,Y+j*(panWidth-20),'dakpan');
				dakpan.width = panWidth;
				dakpan.height = panWidth;
			}
		}
		/***ROOF SURROUNDINGS***/
		var roof = game.add.sprite(X,Y,'rooftop');
		roof.width = WIDTH+20;
		roof.height = 50;
		game.physics.p2.enable(roof);
		var path = [[0,0],[0,50],[roof.width,50],[roof.width,0]];
	    roof.body.clearShapes();
	   	roof.body.addPolygon({},path);
	    roof.body.static = true;
	    roof.body.setCollisionGroup(this.levelCollisionGroup);
	    roof.body.collides(this.pietCollisionGroup);

	    /*** SIDES OF THE ROOF ***/
		var side1 = game.add.image(X,Y,'rooftop');
		side1.width = 20;
		side1.height = 6*panWidth;
		var side2 = game.add.image(X+WIDTH,Y,'rooftop');
		side2.width = 20;
		side2.height = 6*panWidth;

		game.world.bringToTop(this.colourCodeGroup);

		return [roof,chimney];
	},

	throwPresent: function() {
		var rand = Math.round(Math.random()*2.98-0.49);
		var pres = game.add.sprite(theSint.x,theSint.y,'present'+rand);
		pres.width = pres.height = 40;
		pres.name = 'present';
		var colour = this.availableColours[Math.round(Math.random()*(this.availableColours.length-1))];
		pres.frame = colour;
		pres.col = colour;
		pres.isAlive = true;
		pres.isPossessed = false;
		pres.newOne = true;
		pres.hasLanded = false;
		pres.myID = this.runningCounter;
		this.runningCounter++;
		pres.anchor.setTo(0.5,0.5);
		game.physics.p2.enable(pres);
		pres.body.clearShapes();
		if(rand == 0) {
			pres.body.setRectangle(40,40);			
		} else if(rand == 1) {
			pres.body.setCircle(20);
		} else if(rand == 2) {
			var path = [[20,5],[0,40],[40,40]];
			pres.body.addPolygon({},path);
		}
		pres.body.velocity.y = -(Math.random()*800+1000);
		var sign = Math.random() > 0.5 ? 1 : -1;
		if(theSint.x < 700) {
			sign = 1;
		} else if(theSint.x > game.world.width-700) {
			sign = -1;
		}
		pres.body.velocity.x = 300*sign;
		pres.body.collideWorldBounds = false;
		pres.body.setCollisionGroup(this.chimneyCollisionGroup);
		pres.body.collides([this.chimneyCollisionGroup,this.pietCollisionGroup]);
		presArr.push(pres);
		presGroup.add(pres);
	},

	update:function() {
		if(this.nextSintDecision <= this.theTime) {
			this.sintState = Math.round(Math.random()*1);
			if(this.sintState == 0) {
				theSint.body.velocity.x = 0;
				theSint.frame = 0;
				theSint.animations.stop();
			} else {
				theSint.animations.play('walk');
			}
			this.menuSintState.width = this.sintState*game.width*0.058;
			this.sintDir = Math.random() > 0.5 ? 1 : -1;
			theSint.scale.x = this.sintDir;
			this.nextSintDecision += Math.random()*3+1;
		}
		if(Math.random() > (1-LEVELSETTINGS[1]*0.003)) {
			this.throwPresent();
		}
		this.sintDir = 1;
		var checkDir = (this.sintDir == -1) ? 0 : 1;
		theSintImage.x = theSint.x;
		theSintImage.y = theSint.y-50-Math.sin(theSintImage.fluctuation)*5;
		theSintImage.scale.x = theSint.scale.x;
		if(theSint.blockedDir[checkDir] == 0) {
			switch(this.sintState) {
				case 1:
					theSint.body.velocity.x = this.sintDir*(LEVELSETTINGS[1]-1)*50;
					theSintImage.fluctuation += 0.05*Math.PI;
					break;
				case 2:
					theSint.body.velocity.x = this.sintDir*(LEVELSETTINGS[1]-1)*75;
					theSintImage.fluctuation += 0.1*Math.PI;
					break;
				case 3:
					theSint.body.velocity.x = this.sintDir*(LEVELSETTINGS[1]-1)*100;
					theSintImage.fluctuation += 0.15*Math.PI;
					break;
				case 4:
					theSint.body.velocity.x = this.sintDir*(LEVELSETTINGS[1]-1)*150;
					theSintImage.fluctuation += 0.5*Math.PI;
					break;
			}
		}
		if(LEVELSETTINGS[5] > 0 && this.nextPepernoot <= this.theTime) {
			var xPos = Math.random()/this.worldW;
			var yPos = theSint.y-500+Math.random()*(500+theSint.height);
			var peperNoot = game.add.sprite(xPos,yPos,'aPepernoot');
			peperNoot.scale.setTo(0.2,0.2);
			peperNootArr.push(peperNoot);
			this.nextPepernoot += (Math.random()*10+6)/LEVELSETTINGS[5];
		}
		this.theTime += 0.015;
		this.timeIncrements += 1;

		var blackPiet = pietArr[(this.currentSelected-1)];
		/** Put selectionCursor at right spot and make it bounce!*/
		this.selectionCursor.x = blackPiet.x;
		this.selectionCursor.y = blackPiet.y-blackPiet.height+this.selectionCursor.anim;
		if(this.selectionCursor.anim < -15) {
			this.selectionCursor.dir = 1;
		} else if(this.selectionCursor.anim > 0) {
			this.selectionCursor.dir = -1;
		}
		this.selectionCursor.anim += this.selectionCursor.dir*0.5;

		this.miniMap[this.currentSelected-1].frame = 1;

		game.camera.follow(blackPiet);
		var d = this.checkIfCanJump(blackPiet);
		if(game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
			if(d) {
				blackPiet.animations.play('walk');				
			}
			blackPiet.scale.x = 1;
			blackPiet.body.velocity.x = blackPiet.mySpeed;
		} else if(game.input.keyboard.isDown(Phaser.Keyboard.LEFT)) {
			if(d) {
				blackPiet.animations.play('walk');				
			}
			blackPiet.scale.x = -1;
			blackPiet.body.velocity.x = -blackPiet.mySpeed;
		} else {
			blackPiet.body.velocity.x = 0;
			if(d) {
				blackPiet.frame = 0;
			}
			blackPiet.animations.stop();
		}
		if(d) {
			if(game.input.keyboard.isDown(Phaser.Keyboard.UP)) {
				blackPiet.animations.stop();
				blackPiet.frame = 4;
				blackPiet.body.velocity.y = blackPiet.myJumpSpeed;
			}
		}

		for(var i=0;i<presArr.length;i++) {
			var a = presArr[i];
			if(!a.isAlive) {
				continue;
			}
			if(presArr[i].newOne) {
				for(var j=0;j<this.pietAmount;j++) {
					var b = pietArr[j];
					if(b.holdingPresent == null && b.role != 5 && b.role != 6 && b.lastPresent != a.myID) {
						if(this.dist(a,b) < Math.abs(b.height)*b.myRange) {
							//OVERLAP, CATCH PRESENT
							b.holdingPresent = a.body;
							a.isPossessed = true;
							a.newOne = false;
							a.body.static = true;
							a.body.setZeroVelocity();
							a.body.data.gravityScale = 0;
						}
					}
				}
			}
			if(!a.hasLanded) {
				for(var j=0;j<chimArr.length;j++) {
					var b = chimArr[j];
					if(a.col == b.col && (Math.abs(a.x - b.x) * 2 < (a.width + b.width)) && (Math.abs(a.y - b.y) * 2 < (a.height + b.height))) {
						//PRESENT HITS CHIMNEY!
						a.hasLanded = true;
						a.isAlive = false;
						POINTS++;
						this.menuPointText.text = POINTS;
					}
				}
				if(a.y > game.height) {
					LIVES--;
					this.menuLivesText.text = LIVES;
					a.body.static = true;
					a.isAlive = false;
					a.kill();
					if(LIVES <= 0) {
						//END LEVEL; we're dead
						FAILURE = true;
						this.endLevel();
					}
				}
			}
		}

		if(this.timeIncrements > 65) {
			this.miniMapSint.x = this.miniMapPos[0]+theSint.x*this.worldW*400;
			this.miniMapSint.y = this.miniMapPos[1];
			this.timeIncrements = 0;
			this.menuTimeText.text = Math.round(this.theTime);
			if(this.theTime > LEVELSETTINGS[8]) {
				//END LEVEL; time's up!
				FAILURE = false;
				this.endLevel();
			}
		}

		theSint.blockedDir = [0,0];

		for(var i=0;i<this.pietAmount;i++) {
			var curP = pietArr[i];
			if(this.timeIncrements > 64) {
				this.miniMap[i].x = this.miniMapPos[0] + curP.x*this.worldW*this.miniMapDim[0];
				this.miniMap[i].y = this.miniMapPos[1] + curP.y*this.worldH*this.miniMapDim[1];
				this.miniMapNumbers[i].x = this.miniMapPos[0] + curP.x*this.worldW*this.miniMapDim[0];
			}
			this.bigMapNumbers[i].x = curP.x;
			this.bigMapNumbers[i].y = curP.y - 100;
			this.roleGraphics[i].x = curP.x+5;
			this.roleGraphics[i].y = curP.y+curP.height*0.5+24;

			switch(curP.role) {
				case 2:
					if(curP.startDelivering == 1) {
						curP.alpha -= 0.01;
						curP.holdingPresent.sprite.alpha -= 0.01;
						if(curP.alpha < 0.006) {
							curP.startDelivering = 2;
						}
					} else if(curP.startDelivering == 2) {
						curP.alpha += 0.0001;
						if(curP.alpha > 0.01) {
							curP.startDelivering = 3;
							curP.holdingPresent.sprite.isPossessed = false;
							curP.holdingPresent.data.gravityScale = 1;
							curP.holdingPresent.static = false;
							curP.holdingPresent = null;
						}
					} else if(curP.startDelivering == 3) {
						curP.alpha += 0.01;
						if(curP.alpha > 0.994) {
							curP.startDelivering = 0;
						}
					}
					break;
				case 4:
					if(this.dist(theSint,curP) < curP.mySpecialRange*100) {
						var which = curP.x > theSint.x ? 1 : 0;
						theSint.blockedDir[which] = 1;
					}
					break;
				case 5:
					for(var a=0;a<bridgeArr.length;a++) {
						if(this.dist2(curP,bridgeArr[a]) < curP.mySpecialRange*300) {
							bridgeArr[a].alpha = 1;
						} else {
							bridgeArr[a].alpha = 0;
						}
					}
					break;
				case 6:
					for(var a=0;a<peperNootArr.length;a++) {
						if(this.dist(curP,peperNootArr[a]) < curP.mySpecialRange*75) {
							PEPERNOTEN++;
							if(PEPERNOTEN == 10) {
								PEPERNOTEN = 0;
								LIVES++;
							}
							peperNootArr[a].destroy();
							peperNootArr.splice(a,1);
							break;
						}
					}
					break;
			}

			if(i != (this.currentSelected-1)) {
				curP.animations.stop();
				curP.frame = 0;
				curP.body.velocity.x = 0;
				this.miniMap[i].frame = 0;
			}

			if(curP.holdingPresent != null) {
				this.miniMap[i].frame = 2;

				curP.holdingPresent.x = curP.x+curP.scale.x*50-5;
				curP.holdingPresent.y = curP.y;
			}
		}
	},

	dist: function(a,b) {
		return Math.sqrt((a.x-b.x)*(a.x-b.x)+(a.y-b.y)*(a.y-b.y));
	},

	dist2: function(a,b) {
		return Math.sqrt((a.x-(b.x+b.width*0.5))*(a.x-(b.x+b.width*0.5))+(a.y-b.y)*(a.y-b.y));
	},

	checkIfCanJump: function(player) {
	    var yAxis = p2.vec2.fromValues(0, 1);
	    var result = false;
	    for (var i = 0; i < game.physics.p2.world.narrowphase.contactEquations.length; i++)
	    {
	        var c = game.physics.p2.world.narrowphase.contactEquations[i];

	        if (c.bodyA === player.body.data || c.bodyB === player.body.data)
	        {
	            var d = p2.vec2.dot(c.normalA, yAxis); // Normal dot Y-axis
	            if (c.bodyA === player.body.data) d *= -1;
	            if (d > 0.5) result = true;
	        }
	    }
	    return result;
	},

	endLevel: function() {
		game.state.start('GameOver');
	},

	shutdown: function() {
	    this.theTime = 0;
	}

};
