//The 2D-array to hold the level
var level = [];
//All the different groups of objects
var levelGroup;
var resetGroup;
var cloudGroup;
var stickGroup;
var fireGroup;
var fridgeGroup;
var rocketGroup;
var allBlocks = [];
//Height and width (in terms of amount of blocks)
var HEIGHT = 7;
var WIDTH = 20;
//Width (and height) of one block
var BOXW = 200;
//Dynamic width of the field, used for placing new blocks
var curWidth;
//The player
var furthestPlayer;
var allPlayers = [];
var playerGroup;
//Timer to check when to add a new row
var TIMER = 0;
//Array to hold all SNOW-emitters
var emitter = [];
//Arrays to hold the magical lightning bolts the player shoots
var bolts = [];
var graphics = [];
//How 'cold' your player is
var COLD = [];
//Graphics to display how cold you are
var bmp = [];
var coldNess = [];
//Variables determining when and how often to place a reset-icecream
var lastReset = 0;
var resetBounds = 20;
//Keeping track of creation and hanging onto clouds/sticks
var cloudCreate = 1;
var cloudHanging = [];
var stickCreate = 1;
var stickHanging = [];
//The amount of 'cold' you lose every frame
var coldLoss = (1/30);

var playerHeight = 0;
var multiSpace = 0;
var tempAnim = null;
var rocketTrip = 0;
var rocketHanging = null;

var scoreTxt;

var lastOne = 0;

Scene.Main = function(game) {
};

Scene.Main.prototype = {
	render: function() {
		/*fridgeGroup.forEach(function(item) {
			game.debug.body(item);
		});*/
		//game.debug.text(game.time.fps,20,20);
	},

	create:function() {
		//Initiate system and all groups
		game.physics.startSystem(Phaser.Physics.ARCADE);
		levelGroup = game.add.group();
		cloudGroup = game.add.group();
		stickGroup = game.add.group();
		fridgeGroup = game.add.group();
		resetGroup = game.add.group();
		fireGroup = game.add.group();
		rocketGroup = game.add.group();
		playerGroup = game.add.group();
		levelGroup.enableBody = true;
		resetGroup.enableBody = true;
		cloudGroup.enableBody = true;
		stickGroup.enableBody = true;
		fireGroup.enableBody = true;
		fridgeGroup.enableBody = true;
		playerGroup.enableBody = true;
		rocketGroup.enableBody = true;
		//Adapt width,BOXW and curWidth to current window dimensions
		BOXW = window.innerHeight/HEIGHT;
		if(MULTIPLAYER >= 2) {
			resetBounds = 10;
			lastOne = Math.round(Math.random());
		}
		playerHeight = BOXW*0.5;
		WIDTH = Math.ceil(window.innerWidth/BOXW)+3;
		curWidth = WIDTH;
		//Create first, single, straight row of blocks with player in the middle on top of them
		for(var a=0;a<HEIGHT;a++) {
			level[a] = [];
			for(var b=0;b<WIDTH;b++) {
				level[a][b] = 0;
				if(a == 4) {
					this.addBlock(b*BOXW,a*BOXW,"box");
					level[a][b] = 1;
				} else if(a == 3 && b==5) {
					this.createPlayer(0);
					if(MULTIPLAYER >= 2) {
						this.createPlayer(1);
					}
				}
				
			}
		}
		//Setting camera width/height, just in case
		game.camera.width = game.width;
		game.camera.height = game.height;
		//Adding callbacks for keyboard input ONRELEASE
	    game.input.keyboard.addCallbacks(this,null,this.userInput,null);
	    //Creating 3 emitters - back, middle, front
		this.createEmitter(0,0.25,1);
		this.createEmitter(1,0.15,0.5);
		this.createEmitter(2,0.35,0.5);

		//Highscore line
		var g = game.add.bitmapData(10,game.height*2);
		g.context.lineWidth = 5;
		g.context.strokeStyle = '#ff0000';
		g.context.shadowBlur = 5;
		g.context.shadowColor = "white";
		g.context.beginPath();
		g.context.moveTo(0,0);
		g.context.lineTo(0,game.height*2);
		g.context.stroke();
		var gege = game.add.sprite(localStorage.getItem("score")*BOXW,-game.height/2,g);
		//Advanced timing for checking FPS
		game.time.advancedTiming = true;

		furthestPlayer = allPlayers[0];

		scoreTxt = game.add.text(game.width/2,0,'');
		scoreTxt.anchor.setTo(0.5,0);
		scoreTxt.fixedToCamera = true;
		if(localStorage.getItem("score") != null) {
			scoreTxt.text = "Highscore: " + Math.round(localStorage.getItem('score'));
		} else {
			scoreTxt.text = "No Highscore Yet.";
		}
	},

	createPlayer: function(a) {
		var player = game.add.sprite(game.width/2,a*BOXW,'player');
		player.width = player.height = playerHeight;
		var zeze = game.add.sprite(player.x,player.y+player.height/2,'transp');
		zeze.width = zeze.height = BOXW;
		player.tentacle = zeze;
		player.tentacle.myNum = a;
		player.myNum = a;
		game.physics.arcade.enableBody(player.tentacle);
		playerGroup.add(player);
		allPlayers[a] = player;
		TIMER = game.width/2;
		COLD[a] = 100;
		cloudHanging[a] = null;
		stickHanging[a] = null;

		player.animations.add('walk',[1,2,1,3],7,true);
		player.animations.add('shootBolt',[4,4,4],7,false);
		player.animations.add('climbing',[1,2],7,true);

		if(a == 0) {
			var filly = 'blue';
		} else if(a==1) {
			var filly = 'red';
		}
		var style3 = {align: 'center', font:"700 18px 'Oswald', sans-serif",fill:filly};
		var createText = game.add.text(0,0,'PLAYER ' + (a+1),style3);
		player.myText = createText;
		//Bar to display coldness
		bmp[a] = game.add.bitmapData(200,40);
		coldNess[a] = game.add.sprite(20,50+a*50,bmp[a]);
		coldNess[a].fixedToCamera = true;
	},

	userInput: function(e) {
	    switch(e.keyCode) {
	    	case Phaser.Keyboard.P:
	    		if(!game.paused) {
		    		game.paused = true;
	    		} else {
	    			game.paused = false;
	    		}
	    		break;
	    	//If user presses right, shoot bolt to the right
	    	case Phaser.Keyboard.RIGHT:
		    	this.shootBolt('RIGHT',0);
	    		break;
	    	case Phaser.Keyboard.D:
	    		this.shootBolt('RIGHT',1);
	    		break;
	    	//If user presses down..
	    	case Phaser.Keyboard.DOWN:
	    		//If we're not standing on the ground and not hanging from something, shoot down
	    		if(cloudHanging[0] == null) {
	    			if(!allPlayers[0].body.touching.down) {
			    		this.shootBolt('DOWN',0);	    			
	    			}
	    		//Else if we're hanging from a cloud, release ourselves
	    		} else {
	    			cloudHanging[0].counter = 0;
	    			cloudHanging[0] = null;
	    		}
	    		break;
	    	case Phaser.Keyboard.S:
		    	if(cloudHanging[1] == null) {
	    			if(!allPlayers[1].body.touching.down) {
			    		this.shootBolt('DOWN',1);	    			
	    			}
	    		//Else if we're hanging from a cloud, release ourselves
	    		} else {
	    			cloudHanging[1].counter = 0;
	    			cloudHanging[1] = null;
	    		}
	    		break;
	    }
	},

	shouldWeRemoveIt: function(a,b) {
		//If our bolt hits a box (and we're stuck/not moving), move it underneath the player
		if(b.MYTYPE == "BOX" || b.MYTYPE == "TRAMPO") {
			if(allPlayers[a.myNum].body.velocity.y == 0) {
				b.y = Math.ceil(allPlayers[a.myNum].y/BOXW)*BOXW;		
			}
		//If our bolt hits a fire, extinguish the fire
		} else if(b.MYTYPE == "FIRE") {
			//fireGroup.remove(b,true,true);
			b.animations.stop();
			b.frame = 3;
			b.body.enable = false;
		} else if(b.MYTYPE == "ROCKET" && rocketHanging != b) {
			b.body.enable = false;
			b.width *= 0.3;
			b.height *= 0.3;
			b.y += BOXW*0.7;
			b.x += BOXW/2;
			//rocketGroup.remove(b,true,true);
		}
		
	},

	shootBolt: function(direction,num) {
		if(direction == "RIGHT") {
			tempAnim = allPlayers[num].animations.play('shootBolt');
			var saveTheI = 30;
			for(var a=0;a<10;a++) {
				graphics[a] = game.add.bitmapData(1000,40);
				graphics[a].context.lineWidth = 2;
				graphics[a].context.strokeStyle = '#fff';
				graphics[a].context.shadowBlur = 5;
				graphics[a].context.shadowColor = "white";
				graphics[a].context.beginPath();
				graphics[a].context.moveTo(0,20);
				for(var i=0;i<20;i++) {
					if(i >= saveTheI) {
						break;
					}
					if(a==0) {
						allPlayers[num].tentacle.body.x = allPlayers[num].x+i*50;
						allPlayers[num].tentacle.body.y = allPlayers[num].y-playerHeight;
						var lala = game.physics.arcade.overlap(allPlayers[num].tentacle,levelGroup,this.shouldWeRemoveIt);
						var baba = game.physics.arcade.overlap(allPlayers[num].tentacle,fireGroup,this.shouldWeRemoveIt);
						var caca = game.physics.arcade.overlap(allPlayers[num].tentacle,rocketGroup,this.shouldWeRemoveIt);
						if(lala || baba || caca) {
							saveTheI = i;
							break;
						}
					}
					graphics[a].context.lineTo(i*50+Math.random()*50,Math.random()*40);
				}
				graphics[a].context.stroke();
				var temp = game.add.sprite(allPlayers[num].x+playerHeight,allPlayers[num].y+playerHeight/2-20,graphics[a]);
				temp.alpha = Math.random()*0.7+0.1;
				bolts.push(temp);
			}
			COLD[num] -= 3;
		} else if(direction == "DOWN") {
			for(var a=0;a<4;a++) {
				graphics[a] = game.add.bitmapData(40,50);
				graphics[a].context.lineWidth = 2;
				graphics[a].context.strokeStyle = '#ff0000';
				graphics[a].context.shadowBlur = 5;
				graphics[a].context.shadowColor = "white";
				graphics[a].context.beginPath();
				graphics[a].context.moveTo(20,0);
				for(var i=0;i<3;i++) {
					graphics[a].context.lineTo(Math.random()*40,i*50+Math.random()*50);
				}
				graphics[a].context.stroke();
				var temp = game.add.sprite(allPlayers[num].x+playerHeight/2-20,allPlayers[num].y+playerHeight,graphics[a]);
				temp.alpha = Math.random()*0.7+0.1;
				bolts.push(temp);
			}
			var nearestSpot = [Math.ceil(allPlayers[num].x/BOXW)*BOXW,Math.ceil((allPlayers[num].y+playerHeight)/BOXW),Math.floor(allPlayers[num].x/BOXW)*BOXW];
			this.addBlock(nearestSpot[0],nearestSpot[1]*BOXW,"box");
			this.addBlock(nearestSpot[2],nearestSpot[1]*BOXW,"box");
			COLD[num] -= 5;
		}
	},

	update: function() {
		//Quickly fade away bolts (if existing)
		for(var i=0;i<bolts.length;i++) {
			bolts[i].alpha -= (1/60);
			if(bolts[i].alpha <= 0) {
				bolts[i].destroy();
				bolts.splice(i,1);
			}
		}

		if(rocketHanging == null) {
			game.physics.arcade.overlap(playerGroup,rocketGroup,this.rocketCollide);
		} else {
			rocketTrip -= (1/60);
			rocketHanging.body.velocity.y -= 1;
			rocketHanging.angle -= (1/5);
			rocketHanging.alpha = rocketTrip*0.2;
			for(var a=0;a<allPlayers.length;a++) {
				allPlayers[a].body.velocity.setTo(0,0);
				allPlayers[a].position.setTo(rocketHanging.x,rocketHanging.y);
				allPlayers[a].body.enable = false;
			}
			if(rocketTrip < 0.01) {
				rocketTrip = 0;
				rocketGroup.remove(rocketHanging,true,true);
				rocketHanging = null;
			}
		}

		//Collide and overlap everything with everything
		game.physics.arcade.collide(playerGroup,levelGroup,this.levelCollide);
		game.physics.arcade.overlap(emitter[0],levelGroup,this.destroySnow);
		game.physics.arcade.overlap(playerGroup,resetGroup,this.resetCollide);
		game.physics.arcade.overlap(playerGroup,cloudGroup,this.cloudCollide);
		game.physics.arcade.collide(playerGroup,stickGroup,this.stickCollide);
		game.physics.arcade.overlap(playerGroup,fireGroup,this.fireCollide);
		game.physics.arcade.collide(playerGroup,fridgeGroup,this.fridgeCollide,null,this);
		game.physics.arcade.overlap(fridgeGroup,levelGroup,this.outOfTheWay);

		//Decreasing COLDNESS and displaying appropriate bar for it
		for(var i=0;i<allPlayers.length;i++) {
			if(allPlayers[i].x > furthestPlayer.x) {
				furthestPlayer = allPlayers[i];
			}
			allPlayers[i].myText.x = allPlayers[i].x;
			allPlayers[i].myText.y = allPlayers[i].y-20;
			upControl = false;
			if(i==0) {
				upControl = game.input.keyboard.isDown(Phaser.Keyboard.UP);				
			} else if(i==1) {
				upControl = game.input.keyboard.isDown(Phaser.Keyboard.W);
			}

			if(tempAnim == null || !tempAnim.isPlaying) {
				if(allPlayers[i].body.velocity.y == 0) {
					if(cloudHanging[i] == null && stickHanging[i] == null) {
						allPlayers[i].animations.play('walk');
					} else {
						allPlayers[i].animations.stop();
						allPlayers[i].frame = 0;
					}
				} else {
					if(!upControl) {
						allPlayers[i].animations.stop();
						allPlayers[i].frame = 0;
					} else {
						allPlayers[i].animations.stop();
						allPlayers[i].frame = 1;
					}
				}
			}

			//If we're hanging from a cloud...
			if(cloudHanging[i] != null) {
				allPlayers[i].body.velocity.x = BOXW*4;
				allPlayers[i].body.velocity.y = 0;
				allPlayers[i].body.gravity.y = 0;
			//Else if we're standing on a stick...
			} else if(stickHanging[i] != null && !upControl) {
				allPlayers[i].body.velocity.x = BOXW*4;
				allPlayers[i].body.velocity.y = 0;
				allPlayers[i].body.gravity.y = 0;
			//Else if we're doing none of that and we're not standing still, move with gravity!
			} else if(!allPlayers[i].body.touching.right){
				allPlayers[i].body.velocity.x = (BOXW+25)+(BOXW+25)/100*COLD[i];
				allPlayers[i].body.gravity.y = BOXW*16;
			}

				//If user presses up
			if(upControl) {
				//If we're touching something below us
				if(allPlayers[i].body.touching.down) {
					//If we're on a cloud, remove us from it
					if(stickHanging[i] != null) {
						stickHanging[i].counter = 0;
						stickHanging[i] = null;
						allPlayers[i].body.velocity.y = -BOXW*13;
					} else {
						//Otherwise just jump
						allPlayers[i].body.velocity.y = -BOXW*6.5;
					}
				} else if(allPlayers[i].body.touching.right) {
					//If we're climbing upwards, make it go a bit slower
					allPlayers[i].body.velocity.x = 0;
					allPlayers[i].body.velocity.y = -BOXW*3.5;
				}
			}

			COLD[i] -= coldLoss;
			bmp[i].clear();
			if(COLD[i] <= 0) {
				this.stopGame();
			} else if(COLD[i] <= 30) {
				bmp[i].context.fillStyle = '#FF7F50';
				bmp[i].context.shadowBlur = 10;
				bmp[i].context.shadowColor = "IndianRed";
			} else {
				bmp[i].context.fillStyle = '#FFFFFF';
				bmp[i].context.shadowBlur = 10;
				bmp[i].context.shadowColor = "white";
			}
			bmp[i].context.fillRect(0,0,200*(COLD[i]/100),40);

			//Kill the player when he has fallen too far down
			if(allPlayers[i].y > game.height*1.5) {
				this.stopGame();
			}
			allPlayers[i].body.enable = true;
		}
		//Move emitter with the player
		for(var i=0;i<emitter.length;i++) {
			emitter[i].x = furthestPlayer.x+100;
		}

		//Create clouds and sticks at semi-regular intervaks
		if(MULTIPLAYER == 1) {
			cloudCreate -= (1/60);
			stickCreate -= (1/60);
			if(cloudCreate < 0.01) {
				cloudCreate = Math.random()*4+3;
				this.addCloud();
			}
			if(stickCreate < 0.01) {
				stickCreate = Math.random()*4+3;
				this.addStick();
			}
		}
		if(MULTIPLAYER == 1) {
			//Widen world bounds as level progresses
			game.world.setBounds(0,-game.height/2,game.width+curWidth*BOXW,game.height*2);
		} else {
			//Widen world bounds as level progresses
			game.world.setBounds(0,0,game.width+curWidth*BOXW,game.height);
		}
		//Focus camera on player
		game.camera.focusOn(furthestPlayer);
		//Check if we need to create a new row at the front
		if(furthestPlayer.x-TIMER>=BOXW*0.7) {
			TIMER = furthestPlayer.x;
			this.newRow();
		}
		/*if(player.body.touching.down && game.input.keyboard.isDown(Phaser.Keyboard.DOWN)) {
	    	//Set to a 'hiding' or 'ducking' frame
	    }*/

	    //Remove everything dead, not needed anymore, out of the field, etc.
		var toBeRemoved = [];
		for(var i=0;i<allBlocks.length;i++) {
			if((furthestPlayer.x-allBlocks[i].x) > (game.width/2+BOXW)) {
				toBeRemoved.push(allBlocks[i]);
			}
		}
		var toBeRemoved2 = [];
		cloudGroup.forEachAlive(function(item) {
			item.counter -= (1/960);
			item.alpha = item.counter;
			if(item.counter < 0.01) {
				toBeRemoved2.push(item);
			}
		});
		var toBeRemoved3 = [];
		stickGroup.forEachAlive(function(item) {
			item.counter -= (1/960);
			item.alpha = item.counter;
			if(item.counter < 0.01) {
				toBeRemoved3.push(item);
			}
		});
		for(var a=0;a<toBeRemoved.length;a++) {
			toBeRemoved[a].destroy();
		}
		for(var a=0;a<toBeRemoved2.length;a++) {
			cloudGroup.remove(toBeRemoved2[a],true,true);
			var temp = cloudHanging.indexOf(toBeRemoved2[a]);
			if(temp > -1) {
				cloudHanging[temp] = null;
			}
		}
		for(var a=0;a<toBeRemoved3.length;a++) {
			stickGroup.remove(toBeRemoved3[a],true,true);
			var temp = stickHanging.indexOf(toBeRemoved3[a]);
			if(temp > -1) {
				stickHanging[temp] = null;
			}
		}
	},

	levelCollide: function(a,b) {
		if(b.MYTYPE == 'TRAMPO' && b.body.touching.up) {
			a.body.velocity.y -= BOXW*13;
			b.frame = 1;
		}
	},

	cloudCollide: function(a,b) {
		a.x = b.x+b.width/2-playerHeight/2;
		a.y = b.y+b.height/2+playerHeight;
		cloudHanging[a.myNum] = b;
		cloudCreate += (1/60);
	},

	stickCollide: function(a,b) {
		stickHanging[a.myNum] = b;
		stickCreate += (1/60);
	},

	fireCollide: function(a,b) {
		COLD[a.myNum] -= coldLoss*9;
	},

	fridgeCollide: function(a,b) {
		if(b.body.touching.left && b.MYPHASE != 2) {
			b.anchor.setTo(0,1);
			b.y += BOXW;
			b.body.enable = false;
			var bla = game.add.tween(b).to({angle:90}, 200, Phaser.Easing.Linear.InOut, true);
			bla.onComplete.add(function() {
				var LENGTH = Math.round(Math.random()*16)+4;		
				for(var c=0;c<LENGTH;c++) {
					this.addBlock(b.x+c*BOXW,b.y,"fridge2",2);
				}
				fridgeGroup.remove(b,true,true);
			},this);
		} else if(b.MYPHASE == 2) {
			COLD[a.myNum] += coldLoss;
		}
	},

	rocketCollide: function(a,b) {
		b.anchor.setTo(0.5,0.5);
		b.angle = 90;
		b.body.velocity.x = 1000;
		rocketTrip = 5;
		rocketHanging = b;
	},

	resetCollide: function(a,b) {
		if(b.belongTo == a.myNum) {
			b.myText.alpha = 0;
			b.kill();
			COLD[a.myNum] = 100;
		}
	},

	destroySnow: function(a,b) {
		a.kill();
	},

	outOfTheWay: function(a,b) {
		if(a.MYPHASE == 2) {
			levelGroup.remove(b,true,true);	
		}
	},

	newRow: function() {
		var openSpots = [];
		for(var b=0;b<HEIGHT;b++) {
			if(b==0) {
				continue;
			}
			//If left top/bottom already is placed, we are NEVER allowed to place one here
			if(b < HEIGHT-1 && level[b-1][curWidth-1] == 1 && level[b+1][curWidth-1] == 1){
				continue;
			}
			//Don't make flat surfaces longer than 2 boxes
			if(level[b][curWidth-1] == 1 && level[b][curWidth-2] == 1) {
				continue;
			}
			//Prevent creating a one-box-hole
			if(b<HEIGHT-1 && level[b][curWidth-2] == 1 && level[b+1][curWidth-1] == 1) {
				continue;
			}
			//If we're in range (maximum of two blocks from the previously created block), add us to the open spots list!
			if((b > 1 && level[b-2][curWidth-1] == 1) || (b<HEIGHT-2 && level[b+2][curWidth-1] == 1)) {
				openSpots.push(b);
			} else if((b>0 && level[b-1][curWidth-1] == 1) || (b<HEIGHT-1 && level[b+1][curWidth-1] == 1)) {
				openSpots.push(b);
			} else if(level[b][curWidth-1] == 1) {
				openSpots.push(b);
			}
		}
		/*if(openSpots.length > 3) {
			var rand1 = Math.round(Math.random()*3-0.49);
			var rand2 = Math.round(Math.random()*(openSpots.length-4))+3;
			//openSpots.splice(rand1,1);
			//openSpots.splice(rand2+1,1);
			openSpots = [openSpots[rand1],openSpots[rand2]];
		}*/
		var rand1 = Math.round(Math.random()*(openSpots.length-1));
		openSpots = [openSpots[rand1]];
		lastReset++;

		for(var a=0;a<openSpots.length;a++) {
			if(level[openSpots[a]-1][curWidth]) {
				continue;
			}
			var rnd = Math.random();
			if(rnd < 0.12) {
				this.addBlock(curWidth*BOXW,openSpots[a]*BOXW,"trampo");
			} else {	
				this.addBlock(curWidth*BOXW,openSpots[a]*BOXW,"box");
			}
			if(lastReset >= resetBounds) {
				lastReset = 0;
				this.addBlock(curWidth*BOXW,(openSpots[a]-1)*BOXW,"reset");
			} else {
				if(rnd > 0.85) {
					this.addBlock(curWidth*BOXW,(openSpots[a]-1)*BOXW,"fire");
				} else if(rnd > 0.81) {
					this.addBlock(curWidth*BOXW,(openSpots[a]-1)*BOXW,"fridge1");
				} else if(rnd > 0.775) {
					this.addBlock(curWidth*BOXW,(openSpots[a]-1)*BOXW,"rocket");
				}
			}
			level[openSpots[a]][curWidth] = 1;
		}
		curWidth++;
	},

	addCloud: function() {
		var z = game.add.sprite(furthestPlayer.x-game.width/2-BOXW*3,-game.height/2+multiSpace,'cloud');
		z.width = z.height = BOXW*3;
		cloudGroup.add(z);
		z.body.setSize(BOXW,BOXW*2,BOXW,BOXW*1.5);
		z.body.velocity.x = BOXW*4;
		z.counter = 1;
	},

	addStick: function() {
		var z = game.add.sprite(furthestPlayer.x-game.width/2-BOXW*3,game.height+BOXW-multiSpace,'stick');
		var oldWidth = z.width;
		z.width = BOXW*3;
		z.height *= z.width/oldWidth;
		stickGroup.add(z);
		z.body.setSize(BOXW*3*1.35,z.height/2,0,z.height/2);
		z.body.velocity.x = BOXW*4;
		z.body.immovable = true;
		z.body.checkCollision.left = z.body.checkCollision.right = z.body.checkCollision.down = false;
		z.counter = 1;
	},

	addBlock: function(x,y,type,phase) {
		var z = game.add.sprite(x,y,type);
		z.width = z.height = BOXW;
		if(type == "box") {
			levelGroup.add(z);
			z.MYTYPE = "BOX";			
		} else if(type == "reset") {
			if(MULTIPLAYER >= 2) {
				lastOne = (lastOne+1)%MULTIPLAYER;
			}
			if(lastOne == 0) {
				var filly = 'blue';
			} else if(lastOne==1) {
				var filly = 'red';
			}
			var style3 = {align: 'center', font:"700 18px 'Oswald', sans-serif",fill:filly};
			var createText = game.add.text(x+BOXW/2,y-10,'PLAYER ' + (lastOne+1),style3);
			createText.anchor.setTo(0.5,0);
			z.myText = createText;
			z.belongTo = lastOne;
			resetGroup.add(z);
		} else if(type == "trampo") {
			//create trampo
			levelGroup.add(z);
			z.MYTYPE = 'TRAMPO';
		} else if(type == "fire") {
			z.animations.add("burn",[0,1,2],10,true);
			z.animations.play('burn');
			fireGroup.add(z);
			z.MYTYPE = "FIRE";
		} else if(type == "fridge1" || type == "fridge2") {
			fridgeGroup.add(z);
			z.MYTYPE = 'FRIDGE';
			z.MYPHASE = 1;
			if(phase == 2) {
				z.body.setSize(BOXW*5,BOXW*0.5,0,BOXW*0.9);
				z.MYPHASE = 2;
			}
		} else if(type == "rocket") {
			//lalala
			rocketGroup.add(z);
			z.MYTYPE = "ROCKET";
		}
		z.body.immovable = true;
		allBlocks.push(z);
	},

	stopGame: function() {
		var newScore = Math.round(furthestPlayer.x/BOXW);
		if(parseInt(localStorage.getItem("score")) < newScore || localStorage.getItem("score") == null) {
			localStorage.setItem("score",newScore);
		}
		game.state.start('Main');
	},

	shutdown: function() {
		level = [];
		allPlayers = [];
		TIMER = 0;
		emitter = [];
		COLD = [];
		cloudHanging = [];
		stickHanging = [];
		cloudCreate = 1;
		stickCreate = 1;
		rocketTrip = 0;
		rocketHanging = null;
	},	


	createEmitter: function(a,b,c) {
		emitter[a] = game.add.emitter(0,-game.height/2, 400);
		emitter[a].width = game.width;
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

};
