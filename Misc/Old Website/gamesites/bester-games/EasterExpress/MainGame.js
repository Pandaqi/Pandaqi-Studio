//Variable that contains the pacehaze player
var player = null;
//Speed of player, base value and actual variable that's beings used and modified
var const_playerspeed = 30;
var PLAYERSPEED = const_playerspeed;
var COND_SPEED = 3;
//Keep track of and move all trains, and especially the current train we're on
var curTrain;
var trainGroup;
//Available space to create new trains in
var freeSlots = [0,1,2];
var slots;
//Timer for checking if a new train has to be created
var customTimer = 0;
//Variables for controlling actual speed of train and bg
var tempSpeed = 0;
var relativeMovement = 0;
//Space between trains/slots for the player to stand in.
var SPACING = 60;
var jumpRelease = 0;
//Distance between top of train and railing
var railHeight = 10;
//Check if we're actually touching any train - if not, we've left our curTrain
var touchingTrain = null;
//Scaling factor for player (use it for the rest as well?)
var scalePlayer = 0.2;
//Groups containing stuff
var eggGroup;
var powerUpGroup;
var transpGroup;
var cameraGroup;
var enemyGroup;
var secureGroup;
var doorGroup;
var barTenders;
//Variables keeping track of the main quantities
var EGGS = 0;
var POWERUPS = 0;
var POINTS = 0;
var LIVES = 3;
//Ranges from 0-100 -> 0 means no need, 100 means desperate (aka you will die)
var TOILETNEED = 20;
var THIRST = 20;
var HUNGER = 20;
//Variable to make sure we don't have two perrons at the same time
var perronPlaced = false;
//Positions to place passengers in
var passengerSlots = [15,150,135,265,246,370,353,487];
//Positions and types of powerups
var powerUpSlots = [105,255,405];
var powerUpTypes = ['INV','SUP','CHOC','BOMB','SNAIL'];
//Timer to make sure a powerup stays with us about 15 seconds
var powerUpTimer = 0;
var maxPowerupTimer = 15;
//Variable that can be used to increase or decrease the value of eggs
var eggWorth = 1;
//The text at the top that shows powerups, actions, rewards, etc.
var awardTxt;
//Variable to keep track if we're using our Kung Fu fighting moves
var legKicker;

//Variables that show the type of train we're currently in/on
//If both are false, we're on a normal passenger train
var antiOverlap = false;
var cargoOverlap = false;
//Variables that show if we're hitting any side of the train
//If both false, we're not hitting any boundary. 
//Otherwise hittingLeft means one step more to the left will make us fall out of the train, hittingRight one more step to the right...
var hittingLeft = false;
var hittingRight = false;

var bmp,bmp2,bmp3,bmp4;
var texts = [];
var st;
var capla,tN,tHirst,tHunger;

Scene.Main = function(game) {
};

Scene.Main.prototype = {
	preload: function() {
	},

	create:function() {
		//Initialize physics system
		game.physics.startSystem(Phaser.Physics.ARCADE);
		//Set appropriate world bounds
		game.world.setBounds(-game.width*2,0,game.width*4,game.height);
		//Enable advancedTiming to get timers to work consistently
		game.time.advancedTiming = true;
		//Moving background
		bg = game.add.tileSprite(0,0,game.width,game.height,'bg');
		bg.fixedToCamera = true;
		bg.tilePosition.y = -(bg.height/3);
		//Define the 3 slots that trains will appear in throughout the game
		slots = [SPACING, (game.height/3)+SPACING, (2*game.height/3)+SPACING];
		//Initialize player
		this.createPlayer();
		//Create all groups+enable physics for all items in them
		enemyGroup = game.add.group();
		trainGroup = game.add.group();
		eggGroup = game.add.group();
		powerUpGroup = game.add.group();
		transpGroup = game.add.group();
		cameraGroup = game.add.group();
		secureGroup = game.add.group();
		doorGroup = game.add.group();
		barTenders = game.add.group();
		trainGroup.enableBody = true;
		eggGroup.enableBody = true;
		powerUpGroup.enableBody = true;
		transpGroup.enableBody = true;
		cameraGroup.enableBody = true;
		enemyGroup.enableBody = true;
		secureGroup.enableBody = true;
		doorGroup.enableBody = true;
		barTenders.enableBody = true;
		this.createPerron('startPos');
		//Create method for responding to user input
		game.input.keyboard.addCallbacks(this,null,this.userInput,null);
		//Create text at the top that displays all user's actions/current powerups
		var awardTxtStyle = {align:'center',font:"52px 'Lobster'",fill:'Coral'};
		awardTxt = game.add.text(game.width/2, 40, '',awardTxtStyle);
		awardTxt.anchor.setTo(0.5,0.5);
	    awardTxt.setShadow(0, 0, 'rgba(0, 0, 0, 0.5)', 5);
	    awardTxt.fixedToCamera = true;

		st = game.add.sprite(0,0,'stats');
		st.fixedToCamera = true;

		 //Stats texts
	    var awardTxtStyle = {font:"36px 'laCartoonerie'",fill:'Coral'};
		texts[0] = game.add.text(250,10,'0',awardTxtStyle);
	    texts[0].setShadow(0, 0, 'rgba(0, 0, 0, 0.5)', 2);
	    texts[0].fixedToCamera = true;
	    texts[1] = game.add.text(420,10,'0',awardTxtStyle);
	    texts[1].setShadow(0, 0, 'rgba(0, 0, 0, 0.5)', 2);
	    texts[1].fixedToCamera = true;
	    texts[2] = game.add.text(80,210,'0',awardTxtStyle);
	    texts[2].setShadow(0, 0, 'rgba(0, 0, 0, 0.5)', 2);
	    texts[2].fixedToCamera = true;
	    texts[3] = game.add.text(80,280,'0',awardTxtStyle);
	    texts[3].setShadow(0, 0, 'rgba(0, 0, 0, 0.5)', 2);
	    texts[3].fixedToCamera = true;

		//Bitmapdata, made element of a sprite, that displays a circlish timer for powerup-duration
		bmp = game.add.bitmapData(140,140);
		capla = game.add.sprite(25,25,bmp);
		capla.fixedToCamera = true;

		//Same thing, now with thirst, hunger, and toiletneed
		bmp2 = game.add.bitmapData(83,25);
		bmp2.context.fillStyle = '#FF7F50';
		tN = game.add.sprite(41,362,bmp2);
		tN.fixedToCamera = true;
	
		bmp3 = game.add.bitmapData(83,25);
		bmp3.context.fillStyle = '#FF7F50';
		tHirst = game.add.sprite(41,404,bmp3);
		tHirst.fixedToCamera = true;

		bmp4 = game.add.bitmapData(83,25);
		bmp4.context.fillStyle = '#FF7F50';
		tHunger = game.add.sprite(41,448,bmp4);
		tHunger.fixedToCamera = true;
	},

	createPlayer: function() {
		player = game.add.sprite(0,game.height/3,'test');
		player.scale.setTo(scalePlayer, scalePlayer);
		player.hanging = false;
		player.inside = false;
		player.ceilHanging = false;
		game.physics.arcade.enable(player);
		player.anchor.setTo(0.5,0);
		player.body.collideWorldBounds = true;
		player.body.gravity.y = 3000;
		player.body.velocity.x = 0;
		player.body.x = 0;

		player.animations.add('left',[0,1,0,1],10,true);
		player.animations.add('hanging',[3,6],10,false);
		player.animations.add('ceilCrawl',[4,7],10,false);
		player.animations.add('legKick',[2,8],17,false);
		player.animations.add('armPunch',[0,9,10,10,9],17,false);
	},

	render: function() {
		/*transpGroup.forEach(function(item) {
			game.debug.body(item);
		});*/
	},

	update: function(){
		//Draw the powerUpTimer
		bmp.clear();
		bmp.ctx = bmp.context;
	    bmp.ctx.fillStyle = '#fff';
	    bmp.ctx.beginPath();
	    bmp.ctx.arc(70, 70, 70, - Math.PI/2, (Math.PI * 2)*(powerUpTimer/maxPowerupTimer) - Math.PI/2, true);
	    bmp.ctx.lineTo(70,70);
	    bmp.ctx.closePath();
	    bmp.ctx.fill();
	    //Draw the other toiletneed, thirst and hunger bars
	    bmp2.clear();
		bmp2.context.fillRect(tN.width,0,-83*((TOILETNEED+1)/100),23);
		bmp3.clear();
		bmp3.context.fillRect(tHirst.width,0,-83*((THIRST+1)/100),23);
		bmp4.clear();
		bmp4.context.fillRect(tHunger.width,0,-83*((HUNGER+1)/100),23);

	    //Set every flag to false, later on in the update it will be decided if one of them is actually true.
		antiOverlap = false;
		cargoOverlap = false;
		hittingRight = false;
		hittingLeft = false;
	   	touchingTrain = null;

	   	THIRST = Phaser.Math.clamp(THIRST,0,100);
	   	TOILETNEED = Phaser.Math.clamp(TOILETNEED,0,100);
	   	HUNGER = Phaser.Math.clamp(HUNGER,0,100);

		//Timer for placing new trains, check twice every second
		customTimer += (1/60);
		if(customTimer > 0.5) {
			TOILETNEED += 0.5;
			THIRST += 0.2;
			HUNGER += 1;
			this.newTrain();
			customTimer = 0;
		}
		//Timer to prevent player from jumping around the place too fast
		if(jumpRelease > 0.01) {
			jumpRelease -= (1/30);
		} else {
			jumpRelease = 0;
		}
		//Timer for making powerups active for a certain period of time
		//If time is up, reset everything all at once
		if(powerUpTimer > 0.01) {
			powerUpTimer -= (1/60);
			if(powerUpTimer <= 0.01) {
				//STOP POWERUP!
				powerUpTimer = 0;
				maxPowerupTimer = 15;
				eggWorth = 1;
				player.alpha = 1;
				PLAYERSPEED = const_playerspeed;
				awardTxt.text = '';
			}
		}
		//Let physics collide and overlap with all the appropriate parts/groups
		game.physics.arcade.collide(trainGroup, player, this.playerHitTrain);
		game.physics.arcade.overlap(trainGroup, player, this.holdRailing);
		game.physics.arcade.overlap(eggGroup,player,this.hitAnEgg);
		game.physics.arcade.overlap(powerUpGroup, player, this.hitAPowerUp,null,this);
		game.physics.arcade.overlap(transpGroup,player, this.hitCoupe);
		game.physics.arcade.overlap(cameraGroup, player, this.hitCam,null,this);
		game.physics.arcade.overlap(enemyGroup,player,this.hitEnemy,null,this);
		game.physics.arcade.overlap(doorGroup,player,this.hitDoor,null,this);
		game.physics.arcade.overlap(barTenders,player,this.hitBartender,null,this);
		//Make camera follow player around, put player on top of everything in the game
		game.camera.follow(player, Phaser.Camera.FOLLOW_PLATFORMER);
		game.world.bringToTop(player);

		if(legKicker != null && legKicker.isPlaying) {
			game.physics.arcade.overlap(secureGroup,player,this.hitSecure,null,this);	
		}
		//If the player just started moving, slowly make him slow down
		//If the speed has become too low, completely stop him and let the rabbit stay on the correct frame
		if(Math.abs(relativeMovement) > 5) {
			relativeMovement *= 0.93;
		} else {
			relativeMovement = 0;
			if(legKicker != null && legKicker.isPlaying) {
				//NOTHING TO DO
			} else {
				player.animations.stop();
				if(player.hanging) {
					player.frame = 3;
				} else {
					player.frame = 2;
				}
			}
		}
		//Iterate through every train in the game
		trainGroup.forEach(function(item) {
			//If the item is our cucrent train, set movement to 0
			//Move all other trains relative to this one
	   		if(curTrain == item) {
	   			item.body.velocity.x = 0;
	   		} else {
	   			item.body.velocity.x = item.SPEED;
	   		}
	   		//Move everything in the world relative to player movement
   			item.x += relativeMovement;
   			//Place all children (eggs, powerups,cameras, passengers) at the correct positions
   			if(item.SOORT == 'TRAIN') {
   				for(var i=0;i<item.eggs.length;i++) {
		   			item.eggs[i].x = item.eggs[i].pos[0]+item.x;
		   			//item.eggs[i].body.velocity.x = item.body.velocity.x;
		   			item.eggs[i].y = item.eggs[i].pos[1]+item.y;
		   			//For conducteurs, move in the train from left to right
		   			if(item.eggs[i].isACond) {
		   				item.eggs[i].pos[0] += item.eggs[i].mySign*COND_SPEED;
		   				if(item.eggs[i].pos[0] > item.width-50 || item.eggs[i].pos[0] < 0) {
		   					item.eggs[i].mySign *= -1;
		   					item.eggs[i].scale.x *= -1;
		   					item.eggs[i].pos[0] += item.eggs[i].mySign*COND_SPEED;
		   				}
		   				item.eggs[i].corrLine.x = item.eggs[i].x;
		   				item.eggs[i].corrLine.y = item.eggs[i].y;
		   				item.eggs[i].corrLine.scale.x = item.eggs[i].scale.x;
		   			}	
		   		}
		   		for(var i=0;i<item.looseEggs.length;i++) {
		   			item.looseEggs[i].x = item.looseEggs[i].pos[0]+item.x;
		   			item.looseEggs[i].y = item.looseEggs[i].pos[1]+item.y;
		   		}
   			} else if(item.SOORT == 'PERRON') {
   				//WE DONT DO SHIT!
   			}
	   	});
	   	var removeList = [];
	    //Cycle through everything in the transparent body-overlay group
	   	transpGroup.forEach(function(item) {
	   		//If this overlay still has a corresponding train, set it to its position
	   		if(item.alive && item.TRAIN != undefined && item.TRAIN.alive) {
		   		item.x = item.TRAIN.x+item.COUPE;
   			} else {
   				removeList.push(item);
   			}
	   	});
	   	for(var a=0;a<removeList.length;a++) {
   			removeList[a].kill();
   			transpGroup.remove(removeList[a]);
	   	}
	   	//If we're currently on or in something...
	    if(curTrain != undefined) {
	    	//If it's a perron - disable hanging
	    	if(curTrain.SOORT == 'PERRON' && player.hanging) {
				player.hanging = false;
			}
			//Set the speed of the background
	    	tempSpeed = curTrain.SPEED;
	    	//If our player is moving vertically, and we're not in a position that allows us too, assume we've left the train
	    	if(player.body.velocity.y != 0 && !player.hanging && !player.inside) {
	    		curTrain = undefined;
	    	}
	    	//If our player is inside, limit it's movement to the edges of the train
	    	if(player.inside) {
	    		if(player.x+PLAYERSPEED-70 < curTrain.x) {
	    			hittingLeft = true;
	    			relativeMovement = 0;
	    		} else if(player.x+PLAYERSPEED > curTrain.x+curTrain.width) {
	    			hittingRight = true;
	    			relativeMovement = 0;
	    		}
	    	}
	    	//If we're not touching any train, we of course can't be hanging from something either
	    	if(touchingTrain == null) {
	    		player.hanging = false;
	    		if(player.inside) {
		    		this.inOutTrain('OUT');
	    		}
	    		//curTrain = undefined;
	    	}
	    }
	    //If block for simply setting the player to the correct frame if flying around up/down in mid-air
	    if(!player.hanging && !player.inside) {
	    	if(player.body.velocity.y < 0) {
	    		player.animations.stop();
	    		player.frame = 3;
	    	} else if(player.body.velocity.y > 0){
	    		player.animations.stop();
	    		player.frame = 5;
	    	}
	    }
	    //If our player is hanging on a rail, and it is allowed to, keep it in the correct position
	    if(player.hanging && jumpRelease == 0 && !antiOverlap) {
	    	player.body.velocity.y = 0;
			player.y = curTrain.y+railHeight;
	    }
	    if(player.inside) {
	    	player.body.velocity.y = 0;
	    	if(player.ceilHanging) {
	    		if(relativeMovement == 0) {
	    			player.frame = 4;
	    		}
	    		player.y = curTrain.y+(player.height/4);
	    	} else {
		    	player.y = curTrain.y+(curTrain.height/2);
	    	}
	    }
	    //Move background according to player movement, limit it to its edges
	    bg.tilePosition.x -= tempSpeed/50;
	    if((bg.tilePosition.y-player.body.velocity.y/50) < 0 && (bg.tilePosition.y-player.body.velocity.y/50) > (-bg.height+player.height*2)) {
	    	bg.tilePosition.y -= player.body.velocity.y/50;
	    }
	    //Bring menus+texts+etc. to top
	    game.world.bringToTop(st);
	    game.world.bringToTop(capla);
	    game.world.bringToTop(tN);
	    game.world.bringToTop(tHirst);
	    game.world.bringToTop(tHunger);


	    for(var a=0;a<4;a++) {
	    	game.world.bringToTop(texts[a]);
	    }
	    //Set the texts of the stats to their variables
	    texts[0].text = ''+EGGS;
		texts[1].text = ''+POWERUPS;
		texts[2].text = ''+this.returnSmallValue(POINTS);
		texts[3].text = ''+LIVES;

		if(player.body.velocity.y == 0 && player.y >= game.world.height-player.height) {
			//PLAYER FALLS OUT OF THE GAME -> take a life, put player at top again to fall (hopefully) onto another train
			LIVES--;
			player.y = 0;
		}

		if(LIVES <= 0) {
			//GAME OOOOOVER
			awardTxt.text = "WE'RE DONE HERE";
		}
	},
	hitBartender: function(a,b) {
		if(game.input.keyboard.isDown(Phaser.Keyboard.X) && b.alpha > 0 && !b.givenOut) {
			b.givenOut = true;
			THIRST -= 25;
		}
	},
	returnSmallValue: function(a) {
		var temp = a;
		var iter = '';
		if(Math.round(a) >= 1000000) {
			temp = Math.round(a/1000000);
			iter = 'G';
		} else if(Math.round(a) >= 1000) {
			temp = Math.round(a/1000);
			iter = 'K';
		}
		return temp + iter;
	},
	hitDoor: function(a,b) {
		if(b.alpha > 0 && game.input.keyboard.isDown(Phaser.Keyboard.X)) {
			//Oh No it was occupied!
			if(b.frame == 0) {
				b.corrPerson.animations.play('getGun');
			} else if(b.frame == 1) {
				//Oh yes, it is free!
				TOILETNEED = 0;
			}
			b.frame = 2;
		}
	},
	//If we kick a secure vitrage?
	hitSecure: function(a,b) {
		if(b.frame == 0) {
			//Golden Egg
			EGGS += Math.round(Math.random()*30)+5;
			POWERUPS += Math.round(Math.random()*5)+1;
		} else if(b.frame == 1) {
			POINTS += Math.round(Math.random()*70)+30;
		} else if(b.frame == 2) {
			LIVES += 3;
		}
		b.frame = 3;
		//GET REWARDDD
	},
	//When we touch a roof enemy
	hitEnemy: function(a,b) {
		if(b.animations.currentAnim.frame == 2 && b.myTrain == curTrain && !player.ceilHanging && !player.hanging) {
			console.log('KILL THE RABBIT');
			if(relativeMovement != 0) {
				relativeMovement *= -7;
			} else {
				player.body.velocity.y = -2000;
			}
		}
	},
	//Touch a security camera -- OR a conducteur
	hitCam: function(a,b) {
		if(player.inside && player.alpha == 1 && b.alpha > 0) {
			LIVES--;
			this.inOutTrain('OUT');
		}
	},
	//Touching a coupe - check which one it is
	hitCoupe: function(a,b) {
		if(b.TYPE == 2) {
			antiOverlap = true;
		} else if(b.TYPE == 1) {
			cargoOverlap = true;
		} else if(b.TYPE == 3) {
			cargoOverlap = true;
		}
	},
	//Function to quickly move in/out a train
	inOutTrain: function(a) {
		if(a == 'OUT') {
			var lap = curTrain.children;
	    	for(var i=0;i<lap.length;i++) {
	    		if(lap[i].pos == 'EXT') {
	    			lap[i].alpha = 1;
	    		}
	    	}
	    	player.inside = false;
			player.ceilHanging = false;
			for(var i=0;i<curTrain.eggs.length;i++) {
	    		curTrain.eggs[i].alpha = 0;
	    	}
		} else if(a == 'IN') {
			var lap = curTrain.children;
	    	for(var i=0;i<lap.length;i++) {
	    		if(lap[i].pos == 'EXT') {
	    			lap[i].alpha = 0;
	    		}
	    	}
	    	player.inside = true;
	    	for(var i=0;i<curTrain.eggs.length;i++) {
	    		curTrain.eggs[i].alpha = 1;
	    	}
		}
	},
	//Function that checks, if the player is touching a train, if it's at the correct position to start hanging from the railing.
	holdRailing: function(a,b) {
		if(b.SOORT == 'TRAIN') {
			if(a.y < b.y+(railHeight*1.5) && !player.hanging && jumpRelease == 0 && !player.inside) {
				player.hanging = true;
				curTrain = b;
			}
			touchingTrain = b;
		} else if(b.SOORT == 'PERRON' /*&& player.body.velocity.y == 0 && player.y < b.y-70*/) {
			
		}
		
	},
	//Function for creating a new train!
	newTrain: function() {
		if(freeSlots.length > 0) {
			var temp = Math.round(Math.random()*(freeSlots.length-1));
			var chooseSlot = freeSlots[temp];
			var newT = trainGroup.create(0,slots[chooseSlot],'transp');
			var amountOfTrains = Math.round(Math.random()*4)+2;
			newT.height = game.height/3-SPACING;
			newT.eggs = [];
			newT.looseEggs = [];
			var diffTrains = [['coupe','train'],['cargo-coupe','cargo'],['anti-coupe','anti'],['secure-coupe','secure'],['toilet-coupe','toilet'],['cafe-coupe','cafe']];
			newT.SOORT = 'TRAIN';
			var trainOrder = [0];
			for(var a=1;a<amountOfTrains;a++) {
				trainOrder.push(Math.round(Math.random()*5.49));
			}
			for(var i=0;i<amountOfTrains;i++) {
				/***INTERIOR****/
				var randPos = Math.round(Math.random()*(trainOrder.length-1));
				rand = trainOrder[randPos];
				trainOrder.splice(randPos,1);
				var tempNewI = game.add.sprite(i*(500/amountOfTrains),0,diffTrains[rand][0]);
				tempNewI.width = 500/amountOfTrains;
				tempNewI.pos = 'INT';
				newT.addChild(tempNewI);

				/*****PASSENGERS****/
				if(rand == 0 || rand == 2) {
					for(var j=0;j<8;j++) {
						if(Math.random() > 0.5) {
							var pass = game.add.sprite(0, 0,'passengers');
							//pass.pos = [15+i*500,0];
							pass.pos = [passengerSlots[j]+i*500,0];
							pass.frame = Math.round(Math.random()*(3-1));
							pass.alpha = 0;
							pass.height = newT.height;
							pass.width = newT.width/6;
							if(j%2 == 1) {
								pass.scale.x *= -1;
							}
							newT.eggs.push(pass);
						}
					}
				} else if(rand == 1) {
					/******* POWERUPS *******/
					var tempRand = Math.round(Math.random()*2);
					var powerUp = game.add.sprite(0,0,'levelNum');
					powerUp.anchor.setTo(0.5,0.5);
					powerUp.pos = [i*500+powerUpSlots[tempRand],105];
					powerUp.alpha = 0;
					powerUp.scale.setTo(0.65,0.65);
					powerUpGroup.add(powerUp);
					newT.eggs.push(powerUp);
				} else if(rand == 3) {
					var cam = game.add.sprite(-game.width*20,0,'securitycam');
					cam.alpha = 0;
					cam.width *= newT.height/cam.height;
					cam.height = newT.height;
					cam.pos = [i*500+30+Math.round(Math.random())*(500-cam.width-60),0];
					cameraGroup.add(cam);
					newT.eggs.push(cam);

					var juwel = game.add.sprite(0,0,'juwels');
					juwel.alpha = 0;
					juwel.width *= newT.height/juwel.height/1.6;
					juwel.height = newT.height/1.6;
					juwel.anchor.setTo(0.5,0.5);
					juwel.pos = [i*500+250+4,juwel.height/1.6+12];
					juwel.frame = Math.round(Math.random()*2);
					secureGroup.add(juwel);
					newT.eggs.push(juwel);
				} else if(rand == 4) {
					var tempRand = Math.round(Math.random());
					if(tempRand == 0) {
						var toiletPerson = game.add.sprite(0,0,'toiletEnemy');
						toiletPerson.width *= newT.height/toiletPerson.height;
						toiletPerson.height = newT.height;
						toiletPerson.alpha = 0;
						toiletPerson.pos = [i*500+327.5,0];
						toiletPerson.animations.add('getGun',[0,0,0,1,1,1],7,false);
						secureGroup.add(toiletPerson);
						newT.eggs.push(toiletPerson);
					}
					var toiletDoor = game.add.sprite(0,0,'toilet-door');
					toiletDoor.width *= newT.height/toiletDoor.height;
					toiletDoor.height = newT.height;
					toiletDoor.alpha = 0;
					toiletDoor.pos = [i*500+327.5,0];
					toiletDoor.frame = tempRand;
					doorGroup.add(toiletDoor);
					newT.eggs.push(toiletDoor);
					if(tempRand == 0) {
						toiletDoor.corrPerson = toiletPerson;
					}
				} else if(rand == 5) {
					var barTendress = game.add.sprite(0,0,'barTendress');
					barTendress.width *= newT.height/barTendress.height;
					barTendress.height = newT.height;
					barTendress.alpha = 0;
					barTendress.pos = [i*500+50,0];
					barTenders.add(barTendress);
					barTendress.givenOut = false;
					newT.eggs.push(barTendress);
				}

				/****EXTERIOR****/
				var tempNewT = game.add.sprite(i*(500/amountOfTrains),0,diffTrains[rand][1]);
				tempNewT.width = 500/amountOfTrains;
				tempNewT.pos = 'EXT';
				newT.addChild(tempNewT);
				newT.myTranspBodies = [];
				///Add transparent bodies for coupe-checking
				var t = game.add.sprite(-game.width*40, newT.y, 'transp');
				t.height = tempNewT.height;
				t.width = 500;
				t.anchor.setTo(0,0);
				transpGroup.add(t);
				t.body.setSize(t.width,(game.height/3)-SPACING,0,0);
				t.TYPE = rand;
				t.COUPE = i*500;
				t.TRAIN = newT;
				newT.myTranspBodies.push(t);
			}
			//Add EGGS
			newT.width = 500*(amountOfTrains);
			for(var i=0;i<10;i++) {
				var egg = game.add.sprite(Math.random()*(newT.width-40)+20, Math.random()*(newT.height-80) + 40,'eggs');
				egg.rotation = Math.random()*360;
				egg.anchor.setTo(0.5,0.5);
				egg.scale.setTo(0.3,0.3);
				egg.pos = [Math.random()*(newT.width-40)+20, Math.random()*(newT.height-80) + 40];
				egg.frame = Math.round(Math.random());
				egg.alpha = 0;
				eggGroup.add(egg);
				newT.eggs.push(egg);
			}
			//Add man coming to the roof
			var r = game.add.sprite(0,0,'roofEnemy');
			r.animations.add('moveUp',[0,0,0,0,0,0,0,1,2,2,2],6,true);
			r.width *= 0.5;
			r.height *= 0.5;
			r.pos = [Math.random()*(newT.width-40)+20, -r.height+30];
			r.myAnim = r.animations.play('moveUp');
			r.myTrain = newT;
			enemyGroup.add(r);		
			newT.looseEggs.push(r);
			//Add conductor
			var cond = game.add.sprite(0,0,'conductor');
			cond.animations.add('walk',[0,1,0,2],6,true);
			cond.animations.play('walk');
			cond.width *= newT.height/cond.height;
			cond.height = newT.height;
			cond.pos = [0,0];
			cond.isACond = true;
			cond.mySign = 1;
			newT.eggs.push(cond);
			cameraGroup.add(cond);
			cond.alpha = 0;
			//And add an OUTLINE
			var cond2 = game.add.sprite(0,0,'lineConductor');
			cond2.animations.add('walk',[0,1,0,2],6,true);
			cond2.animations.play('walk');
			cond2.width *= newT.height/cond2.height;
			cond2.height = newT.height;
			cond2.alpha = 1;
			cond.corrLine = cond2;

			//Add carrots at random spots
			if(Math.random() > 0.5) {
				for(var i=0;i<2;i++) {
					var xPos = Math.random() * newT.width;
					for(var a=0;a<5;a++) {
						var carrot = game.add.sprite(0,0,'carrots');
						carrot.anchor.setTo(0.5,0.5);
						carrot.scale.setTo(0.3,0.3);
						carrot.rotation = Math.random()*360;
						carrot.pos = [xPos,-a*carrot.height];
						eggGroup.add(carrot);
						newT.looseEggs.push(carrot);
						carrot.isCarrot = true;
					}
				}
			} else {
				var whichSide = Math.random() > 0.5 ? 1 : -1;
				for(var i=0;i<10;i++) {
					var carrot = game.add.sprite(0,0,'carrots');
					carrot.anchor.setTo(0.5,0.5);
					carrot.scale.setTo(0.3,0.3);
					carrot.rotation = Math.random()*360;
					if(whichSide > 0) {
						carrot.pos = [newT.width+Math.cos(i*Math.PI/2/10 + Math.PI*1.5)*300,Math.sin(i*Math.PI/2/10 + Math.PI*1.5)*newT.height+newT.height-20];
					} else {
						carrot.pos = [-Math.cos(i*Math.PI/2/10 + Math.PI*1.5)*300,Math.sin(i*Math.PI/2/10 + Math.PI*1.5)*newT.height+newT.height-20];
					}
					carrot.isCarrot = true;
					eggGroup.add(carrot);
					newT.looseEggs.push(carrot);
				}
			}

			var sign = Math.random() > 0.5 ? -1 : 1;
			freeSlots.splice(temp,1);
			newT.body.immovable = true;
			newT.anchor.setTo(0,0);
			newT.SPEED = (Math.random()*1000+200)*sign;
			if(sign > 0) {
				newT.x = -1*(game.width*2 + newT.width);
			} else {
				newT.x = player.x+game.width;
			}
			newT.SLOT = chooseSlot;
			newT.checkWorldBounds = true;
			//newT.outOfBoundsKill = true;
			newT.body.checkCollision.top = true;
			newT.body.checkCollision.left = newT.body.checkCollision.right = newT.body.checkCollision.down = false;
			newT.events.onOutOfBounds.add(this.killTrain);
		} else {
			if(!perronPlaced) {
				this.createPerron();
			}
		}
	},
	createPerron: function(a) {
		//place perron
		var tempPerPos = Math.round(Math.random())+1;
		if(a == 'startPos') {
			tempPerPos = 2;
		}
		var perr = trainGroup.create(0,(game.height/3) * tempPerPos,'perron');
		perronPlaced = true;
		perr.body.immovable = true;
		//perr.body.setSize(perr.body.width,perr.body.height-20,0,20);
		perr.SOORT = 'PERRON';
		var sign = Math.random() > 0.5 ? -1 : 1;
		perr.anchor.setTo(0,0);
		perr.SPEED = (Math.random()*1000+200)*sign;
		if(a != 'startPos') {
			if(sign > 0) {
				perr.x = -1*(game.width*2 + perr.width);
			} else {
				perr.x = player.x+game.width;
			}	
		} else {
			perr.anchor.setTo(0.5,0);
			perr.x = 0
		}
		perr.checkWorldBounds = true;
		perr.outOfBoundsKill = true;
		perr.body.checkCollision.top = true;
		perr.body.checkCollision.left = perr.body.checkCollision.right = perr.body.checkCollision.down = false;
		perr.events.onOutOfBounds.add(this.killTrain);
	},
	//If a player collides with a train, the current train he's on will be set to this train.
	//If it's a perron, he will exchange eggs for points
	playerHitTrain: function(a,b) {
		curTrain = b;
		if(b.SOORT == 'PERRON') {
			POINTS += EGGS;
			POINTS += POWERUPS*20;
			EGGS = 0;
			POWERUPS = 0;
		}
		
	},
	//If a train is killed, free that slot and remove all the train's children as well
	//If a perron is killed, make it possible for a new one to appear
	killTrain: function(a) {
		if(a.SOORT == 'TRAIN') {
			freeSlots.push(a.SLOT);
			for(var i=0;i<a.eggs.length;i++) {
				if(a.eggs[i].corrLine != null) {
					a.eggs[i].corrLine.kill();
				}
				a.eggs[i].kill();
			}
			for(var k=0;k<a.looseEggs.length;k++) {
				a.looseEggs[k].kill();
			}
			for(var j=0;j<a.myTranspBodies.length;j++) {
				a.myTranspBodies[j].TRAIN = null;
				a.myTranspBodies[j].COUPE = -10*game.width;
				a.myTranspBodies[j].kill();
			}
		} else if(a.SOORT == 'PERRON') {
			perronPlaced = false;
		}
		a.kill();
	},
	//If the player hits an egg, he will recieve it
	hitAnEgg: function(a,b) {
		if(b.alpha > 0) {
			b.destroy();
			//GET POINTS OR SOMETHING?
			if(b.isCarrot) {
				HUNGER -= 4;
			} else {
				EGGS += eggWorth;
			}
		}
	},
	//If the player hits a powerup, it will disappear, and depending on the type will call for some action
	hitAPowerUp: function(a,b) {
		if(b.alpha > 0 && game.input.keyboard.isDown(Phaser.Keyboard.X)) {
			b.destroy();
			var chooseOne = powerUpTypes[Math.round(Math.random()*(powerUpTypes.length-1))];
			awardTxt.text = chooseOne;
			if(chooseOne == 'CHOC') {
				POWERUPS++;
			} else if(chooseOne == 'BOMB') {
				this.killTrain(curTrain);
			} else {
				if(powerUpTimer == 0) {
					powerUpTimer = 15;
				} else {
					powerUpTimer += 5;
					maxPowerupTimer += 5;
				}
				this.activatePowerup(chooseOne);
			}
		}
	},
	//A function that holds all possible actions to be invoked by a powerup
	activatePowerup: function(a) {
		if(a == 'INV') {
			player.alpha = 0.35;
		} else if(a == 'SUP') {
			//Make eggs count double
			eggWorth = 5;
		} else if(a == 'BOMB') {
			//Explode carriage, lose live
		} else if(a == 'SNAIL') {
			//Temporarily reduce PLAYERSPEED?
			PLAYERSPEED *= 0.5;
		}
	},
	//Function for handling all sorts of user input
	userInput: function(e) {
	    switch(e.keyCode) {
	    	//Kung fu kick!
	    	case Phaser.Keyboard.C:
	    		player.animations.stop();
	    		legKicker = player.animations.play('legKick');
	    		break;
	    	case Phaser.Keyboard.V:
	    		player.animations.stop();
	    		legKicker = player.animations.play('armPunch');
	    		break;
	    	//Move in/out a train!
	    	case Phaser.Keyboard.Z:
	    		if(cargoOverlap) {
	    			return;
	    		}
	    		if(curTrain != undefined && player.hanging &&!player.inside) {
			    	this.inOutTrain('IN');
			    	player.hanging = false;
					/*game.world.setBounds(-game.width*2,0,game.width*4,game.height*2);
					game.world.scale.setTo(2,2);*/
	    		} else if(player.inside) {
	    			this.inOutTrain('OUT');
			    	/*game.world.scale.setTo(1,1);
			    	game.world.setBounds(-game.width*2,0,game.width*4,game.height);*/
			    	player.hanging = true;
	    		}
	    		break;
	    	//Move to the left!
	    	case Phaser.Keyboard.LEFT:
	    		if(!hittingLeft) {
		    		player.scale.x = scalePlayer*-1;
		    		if(curTrain != undefined) {
				    	if(player.hanging) {
	    					player.animations.play('hanging');
	    					relativeMovement = PLAYERSPEED/2;
				    	} else if(player.ceilHanging) {
				    		relativeMovement = PLAYERSPEED/2;
	    					player.animations.play('ceilCrawl');
				    	} else {
					    	player.animations.play('left');
					    	relativeMovement = PLAYERSPEED;
				    	}
				    }
				}
	    		break;
	    	//Move to the right!
	    	case Phaser.Keyboard.RIGHT:
	    		if(!hittingRight) {
	    			player.scale.x = scalePlayer;
			    	if(curTrain != undefined) {
			    		if(player.hanging) {
				    		relativeMovement = -PLAYERSPEED/2;
	    					player.animations.play('hanging');
				    	} else if(player.ceilHanging) {
				    		relativeMovement = -PLAYERSPEED/2;
	    					player.animations.play('ceilCrawl');
				    	} else {
				    		relativeMovement = -PLAYERSPEED;
					    	player.animations.play('left');
				    	}
			    	}
	    		}
	    		break;
	    	//Jump upwards OR start hanging
	    	case Phaser.Keyboard.UP:
	    		if(player.hanging) {
	    			//Get on top of the vehicle
	    			player.body.velocity.y = 0;
			    	player.y = curTrain.y-player.height;
			    	player.hanging = false;
			    	jumpRelease = 0.25;
			    } else if(player.inside) {
			    	//Start hanging at the ceiling.
			    	player.ceilHanging = true;
			    } else {
			    	//Otherwise, jump
			    	player.body.velocity.y = -1700;
			    }
	    		break;
	    	//Let yourself fall downwards/off the train
	    	case Phaser.Keyboard.DOWN:
	    		if(player.hanging) {
		    		player.hanging = false;
		    		player.y += railHeight*2;
		    	} else if(player.inside) {
		    		if(player.ceilHanging) {
		    			player.ceilHanging = false;
		    		}
		    	} else if(curTrain != undefined) {
		    		player.hanging = true;
		    		player.y = curTrain.y+railHeight;
		    		player.body.velocity.y = 0;
		    	}
	    		break;
	    }
	},
};