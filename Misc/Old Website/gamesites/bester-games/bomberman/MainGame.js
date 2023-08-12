var BOXW = 100;
var player;
var SPEED = 1000;
var levelGroup;
var bombGroup;
var BOMBS = [1,1,1,1];
var explodeGroup;
var powerUpGroup;
var playerGroup;
var levelBounds;
var diagonalTentacles;
var canWeWalk = [true,true,true,true];
var playerTentacles;
var allPlayers = [];
var SIZES = [1,1,1,1];
var telePorters = [];
var amountEnemies = 0;
var boxesBound = 30;
var lowerEnemyBound = 2;
var TIME = 120;
var decayTime = 1;
var decayPos = [1,1];
var timeTxt;
var livesTxt = [];
var tempCountDown = 0;
var RESULTS = [];
var TOPSCORE = 0;

var level = [];

Scene.Main = function(game) {
};

Scene.Main.prototype = {
	create:function() {
		var HEIGHT;
		var WIDTH;
		//Generate random level
		if(FIELDSIZE == 0) {
			HEIGHT = 7;
			WIDTH = 10;
			TIME = 60;
		} else if(FIELDSIZE == 1) {
			HEIGHT = 10;
			WIDTH = 18;
			TIME = 90;
		} else if(FIELDSIZE == 2) {
			HEIGHT = 13;
			WIDTH = 26;
			TIME = 120;
		} else if(FIELDSIZE == 3) {
			HEIGHT = 15;
			WIDTH = 30;
			TIME = 180;
		} else {
			HEIGHT = 18;
			WIDTH = 36;
			TIME = 240;
		}
		
		for(var i=0;i<HEIGHT;i++) {
			level[i] = [];
			for(var j=0;j<WIDTH;j++) {
				//Create edge
				if(i == 0 || j == 0 || j == (WIDTH-1) || i == (HEIGHT-1)) {
					level[i][j] = 1;					
				} else if(j%3 == 0 && i%3 == 0) {
					level[i][j] = 1;
				} else {
					if(Math.random() < DIFFICULTY*0.01) {
						level[i][j] = 8;
					} else {
						level[i][j] = 0;
					}
				}
			}
		}
		//Player one + safety open space
		level[1][1] = 3;
		level[2][1] = 7;
		level[2][2] = 7;
		level[1][2] = 7;
		//Player two + safety open space
		level[HEIGHT-2][WIDTH-2] = 4;
		level[HEIGHT-2][WIDTH-3] = 7;
		level[HEIGHT-3][WIDTH-3] = 7;
		level[HEIGHT-3][WIDTH-2] = 7;
		//Computer one + safety open space
		level[HEIGHT-2][1] = 5;
		level[HEIGHT-3][1] = 7;
		level[HEIGHT-3][2] = 7;
		level[HEIGHT-2][2] = 7;
		//Computer two + safety open space
		level[1][WIDTH-2] = 6;
		level[1][WIDTH-3] = 7;
		level[2][WIDTH-3] = 7;
		level[2][WIDTH-2] = 7;

		//CONTINUE WITH YOUR LIVES
		BOXW = Math.min(window.innerWidth/level[1].length,window.innerHeight/level.length);
		boxesBound = Math.round((level.length*level[0].length)*0.15);
		/*if(window.innerHeight <= window.innerWidth) { BOXW = window.innerHeight/level.length } else { BOXW = window.innerWidth/level[0].length;}*/
		game.stage.backgroundColor = '#332D29';
		game.physics.startSystem(Phaser.Physics.ARCADE);
		levelGroup = game.add.group();
		bombGroup = game.add.group();
		powerUpGroup = game.add.group();
		explodeGroup = game.add.group();
		playerTentacles = game.add.group();
		levelBounds = game.add.group();
		teleportGroup = game.add.group();
		playerGroup = game.add.group();
		diagonalTentacles = game.add.group();
		levelGroup.enableBody =true;
		bombGroup.enableBody = true;
		explodeGroup.enableBody =true;
		playerTentacles.enableBody = true;
		powerUpGroup.enableBody =true;
		levelBounds.enableBody = true;
		playerGroup.enableBody = true;
		diagonalTentacles.enableBody = true;
		teleportGroup.enableBody = true;
		lowerEnemyBound = MULTIPLAYER+1;
		console.log(BOXW);
		var counter = 4;
		for(var i=0;i<level.length;i++) {
			for(var j=0;j<level[i].length;j++) {
				if(level[i][j] == 2  || level[i][j] == 0) {
					var tempRandNum = Math.random();
					if(tempRandNum > 0.5) {
						var newB = game.add.sprite(j*BOXW,i*BOXW,'box');
						newB.width = newB.height = BOXW;
						newB.TYPE = 'BOX';
						levelGroup.add(newB);
						//newB.body.setSize(BOXW*10/2,BOXW*10/2,BOXW/6,BOXW/6);
						newB.body.immovable = true;
					} else if(tempRandNum < 0.02) {
						//Place teleporter
						var newB = game.add.sprite(j*BOXW,i*BOXW,'box');
						newB.width = newB.height = BOXW;
						newB.alpha = 0.5;
						newB.TYPE = 'TELEPORT';
						newB.myPosition = [j,i];
						telePorters.push([j,i]);
						teleportGroup.add(newB);
					}
				} else if(level[i][j] == 1) {
					var newB = game.add.sprite(j*BOXW,i*BOXW,'bounds');
					//newB.alpha = 0;
					newB.width = newB.height = BOXW;
					newB.TYPE = 'BOUNDS';
					levelBounds.add(newB);
					//newB.body.setSize(BOXW*10/2,BOXW*10/2,BOXW/6,BOXW/6);
					newB.body.immovable = true;
				} 
				if(level[i][j] == 3) {
					this.createPlayer(0,[j,i]);
				} else if(level[i][j] == 4) {
					this.createPlayer(1,[j,i]);
				} else if(level[i][j] == 5) {
					this.createPlayer(2,[j,i]);
				} else if(level[i][j] == 6) {
					this.createPlayer(3,[j,i]);
				} else if(level[i][j] == 8) {
					this.createPlayer(counter,[j,i]);
					BOMBS[counter] = 1;
					SIZES[counter] = 1;
					canWeWalk[counter] = true;
					amountEnemies++;
					counter++;
				}
			}
		}
		game.input.keyboard.addCallbacks(this,this.userInput,null,null);
		cursors = game.input.keyboard.createCursorKeys();
		game.world.setBounds(0,0,level[0].length*BOXW,level.length*BOXW);
		var GUI = game.add.sprite(game.world.width/2,0,'GUI');
		GUI.anchor.setTo(0.5,0);
		GUI.width *= (BOXW/GUI.height);
		GUI.height = BOXW;

    	var style2 = {align: 'center', font:(BOXW/4)+"px 'Open Sans', sans-serif",fill:'DarkRed',style:'bold'};
    	timeTxt = game.add.text(GUI.x-GUI.width*0.32,GUI.height/2,'',style2);
    	timeTxt.anchor.setTo(0,0.5);
    	livesTxt[0] = game.add.text(GUI.x-GUI.width*0.05,GUI.height/4,'',style2);
    	livesTxt[0].anchor.setTo(0,0.5);
    	livesTxt[1] = game.add.text(GUI.x-GUI.width*0.05,GUI.height/1.5,'',style2);    	
    	livesTxt[1].anchor.setTo(0,0.5);
    	livesTxt[2] = game.add.text(GUI.x+GUI.width*0.22,GUI.height/4,'',style2);
    	livesTxt[2].anchor.setTo(0,0.5);
    	livesTxt[3] = game.add.text(GUI.x+GUI.width*0.22,GUI.height/1.5,'',style2);
    	livesTxt[3].anchor.setTo(0,0.5);
	},

	createPlayer: function(theNum,posArr) {
		player = game.add.sprite(0,0,'pizza');
		playerGroup.add(player);
		player.width = player.height = BOXW;
		player.body.collideWorldBounds = true;
		player.position.setTo(posArr[0]*BOXW+player.width/2,posArr[1]*BOXW+player.height/2);
		player.curTarget = [player.x,player.y];
		player.oldTarget = [player.x,player.y];
		player.LIVES = Math.round(4/(0.5*DIFFICULTY+1));
		player.anchor.setTo(0.5,0.5);
		player.tentacles = [];
		player.poss = [0,0,0,0];
		player.myNum = theNum;
		player.SPEED = 300;
		player.POINTS = 0;
		player.body.setSize(BOXW/2,BOXW/2,0,0);
		for(var i=0;i<4;i++) {
			var newBlock = game.add.sprite(0,0,'transp');
			newBlock.TYPE = i;
			newBlock.width = newBlock.height = BOXW/10;
			newBlock.POSX = Math.cos(i*Math.PI*0.5)*player.width;
			newBlock.POSY = Math.sin(i*Math.PI*0.5)*player.height;
			newBlock.OWNER = theNum;
			player.tentacles[i] = newBlock;
			playerTentacles.add(newBlock);
		}
		if(theNum <= 3) {
			player.frame = theNum;			
		} else {
			player.frame = 2;
		}
		player.INDANGER = 'NONE';
		player.possPaths = 0;
		player.teleportTime = 0;
		if(theNum >= lowerEnemyBound) {
			//It's an enemy
			for(var j=2;j<=2*DIFFICULTY;j++) {
				for(var i=0;i<4;i++) {
					var newBlock = game.add.sprite(0,0,'transp');
					newBlock.TYPE = i;
					newBlock.width = newBlock.height = BOXW/10;
					newBlock.POSX = Math.cos(i*Math.PI*0.5)*player.width*j;
					newBlock.POSY = Math.sin(i*Math.PI*0.5)*player.height*j;
					newBlock.OWNER = theNum;
					player.tentacles.push(newBlock);
					newBlock.ISDIAG = false;
					diagonalTentacles.add(newBlock);
				}
			}
			for(var j=1;j<=4*DIFFICULTY;j++) {
				for(var i=4;i<8;i++) {
					var newBlock = game.add.sprite(0,0,'transp');
					newBlock.TYPE = i;
					newBlock.width = newBlock.height = BOXW/10;
					if(j%2 == 0) {
						if(i==4||i==5) {
						newBlock.POSX = player.width*Math.round(j/2);
						} else {
							newBlock.POSX = -player.width*Math.round(j/2);
						}
						if(i==4||i==7) {
							newBlock.POSY = -player.height;
						} else {
							newBlock.POSY = player.height;
						}
					} else if(j%2 == 1) {
						if(i==4||i==5) {
							newBlock.POSX = player.width;
						} else {
							newBlock.POSX = -player.width;
						}
						if(i==4||i==7) {
							newBlock.POSY = -player.height*Math.round(j/2);
						} else {
							newBlock.POSY = player.height*Math.round(j/2);
						}
					}
					newBlock.OWNER = theNum;
					newBlock.ISDIAG = true;
					player.tentacles.push(newBlock);
					diagonalTentacles.add(newBlock);
				}
			}
		}
		allPlayers[theNum] = player;
	},

	walk: function(a,theNum) {
		var theP = allPlayers[theNum];
		var target = [];
		if(a==0) {
			target = [theP.x-BOXW,theP.y];
		} else if(a==1) {
			target = [theP.x+BOXW,theP.y];
		} else if(a == 2) {
			target = [theP.x,theP.y+BOXW];
		} else {
			target = [theP.x,theP.y-BOXW];
		}
		theP.curTarget = target;
		theP.oldTarget = [theP.x,theP.y];
		var bla = game.add.tween(theP).to({ x:target[0], y:target[1]}, theP.SPEED, Phaser.Easing.Linear.InOut, true);
		canWeWalk[theNum] = false;
		bla.onComplete.add(function() {
		  canWeWalk[theNum] = true;
		}, this);
	},

	render: function() {
		/*diagonalTentacles.forEach(function(item) {
			game.debug.body(item);
		});
		playerTentacles.forEach(function(item) {
			game.debug.body(item);
		});*/
		//explodeGroup.forEach(function(item) {game.debug.body(item)});
	},

	colliding:function(a,b) {
		allPlayers[b.OWNER].poss[b.TYPE] = 1;
		if(a.TYPE != 'BOX' && a.TYPE != 'BOUNDS' && allPlayers[b.OWNER].INDANGER == 'NONE') {
			allPlayers[b.OWNER].INDANGER = 'NOW';
		}
		if(levelGroup.countLiving() > boxesBound && canWeWalk[b.OWNER] && b.OWNER >= lowerEnemyBound && a.TYPE == 'BOX' && BOMBS[b.OWNER] > 0 && allPlayers[b.OWNER].possPaths > 0)
		{
			//It's an enemy, bomb laying time!
			this.dropBomb(b.OWNER);
		}
	},
	collidingPC:function(a,b) {
		if(b.ISDIAG && allPlayers[b.OWNER].INDANGER != 'PREV') {
			if(b.TYPE==4) {
				allPlayers[b.OWNER].poss[b.TYPE-4] = 1;
				allPlayers[b.OWNER].poss[b.TYPE-1] = 1;
			} else {
				allPlayers[b.OWNER].poss[b.TYPE-5] = 1;
				allPlayers[b.OWNER].poss[b.TYPE-4] = 1;
			}
		} else if(!b.ISDIAG && allPlayers[b.OWNER].INDANGER != 'PREV') {
			allPlayers[b.OWNER].poss[b.TYPE] = 1;
			if(allPlayers[b.OWNER].INDANGER == 'NONE') { allPlayers[b.OWNER].INDANGER = 'NOW' };
		}
	},
	collidingExplosion:function(a,b) {
		if(b.OWNER >= lowerEnemyBound) {
			allPlayers[b.OWNER].poss[b.TYPE] = 1;
		}
	},

	dieFromDecay: function(a,b) {
		if(TIME <= 0) {
			a.LIVES = 0;
		}
	},

	update: function() {
		timeTxt.text = Math.round(TIME);
		for(var i=0;i<4;i++) {
			livesTxt[i].text = allPlayers[i].LIVES + ' : ' + allPlayers[i].POINTS;
		}
		if(TIME > 0) {
			TIME -= (1/60);
		} else {
			TIME = 0;
			if(decayTime > 0) {
				decayTime -= (1/60);
			} else if(decayTime <= 0 && decayTime != -4) {
				//SET NEW BLOCK!
				var newB = game.add.sprite(BOXW*decayPos[0],BOXW*decayPos[1],'bounds');
				newB.width = newB.height = BOXW;
				newB.TYPE = 'BOUNDS';
				levelBounds.add(newB);
				newB.body.immovable = true;
				decayPos[0]++;
				if(decayPos[0] == level[0].length-1) {
					decayPos[1]++;
					decayPos[0] = 1;
				}
				decayTime = 0.3;
				if(decayPos[1] == (level.length-1)) {
					//END THE GAME
					decayTime = -4;
				}
			}
		}
		game.physics.arcade.overlap(playerGroup,teleportGroup,this.teleportMe);
		game.physics.arcade.overlap(playerGroup,levelBounds,this.dieFromDecay);
		//game.camera.follow(player, Phaser.Camera.FOLLOW_PLATFORMER);
		if(tempCountDown > 0) {
			tempCountDown -= (1/60);
			if(tempCountDown <= 0) {
				this.shutItDown();
			}
		}
		if(playerGroup.countLiving() <= 1 && tempCountDown == 0) {
			//END GAME
			tempCountDown = 2;
		}
		for(var i=0;i<allPlayers.length;i++) {
			if(!allPlayers[i].alive) {
				continue;
			}
			if(allPlayers[i].LIVES < 1) {
				allPlayers[i].kill();
				for(var j=0;j<allPlayers.length;j++) {
					if(allPlayers[i].LIVES > 0) {
						allPlayers[i].POINTS += 20;
					}
				}
			}
			allPlayers[i].body.velocity.setTo(0,0);
			allPlayers[i].poss = [0,0,0,0];
			if(allPlayers[i].regenerate > 0.01) {
				allPlayers[i].regenerate -= (1/60);
			} else {
				allPlayers[i].regenerate = 0;
			}
			if(allPlayers[i].teleportTime > 0.01) {
				allPlayers[i].teleportTime -= (1/60);
			} else {
				allPlayers[i].teleportTime = 0;
			}
			for(var a=0;a<allPlayers[i].tentacles.length;a++) {
				allPlayers[i].tentacles[a].x = allPlayers[i].x+allPlayers[i].tentacles[a].POSX;
				allPlayers[i].tentacles[a].y = allPlayers[i].y+allPlayers[i].tentacles[a].POSY;
			}
			if(allPlayers[i].INDANGER == 'NOW') {
				allPlayers[i].INDANGER = 'NONE';				
			}
		}
		game.physics.arcade.overlap(levelGroup,playerTentacles,this.colliding,null,this);
		game.physics.arcade.overlap(levelBounds,playerTentacles,this.colliding);
		game.physics.arcade.overlap(bombGroup,playerTentacles,this.colliding);
		game.physics.arcade.overlap(bombGroup,diagonalTentacles,this.collidingPC);
		game.physics.arcade.overlap(playerGroup,powerUpGroup,this.getPowerup);
		if(canWeWalk[0]) {
			if (allPlayers[0].poss[2] == 0 && game.input.keyboard.isDown(Phaser.Keyboard.LEFT)) {
		    	this.walk(0,0);
		    } else if (allPlayers[0].poss[0] == 0 && game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
		    	this.walk(1,0);
		    } else if (allPlayers[0].poss[1] == 0 && game.input.keyboard.isDown(Phaser.Keyboard.DOWN)) {
		    	this.walk(2,0);
		    } else if (allPlayers[0].poss[3] == 0 && game.input.keyboard.isDown(Phaser.Keyboard.UP)) {
		    	this.walk(3,0);
		    }
		}
		if(lowerEnemyBound >= 2 && canWeWalk[1]) {
			if (allPlayers[1].poss[2] == 0 && game.input.keyboard.isDown(Phaser.Keyboard.A)) {
		    	this.walk(0,1);
		    } else if (allPlayers[1].poss[0] == 0 && game.input.keyboard.isDown(Phaser.Keyboard.D)) {
		    	this.walk(1,1);
		    } else if (allPlayers[1].poss[1] == 0 && game.input.keyboard.isDown(Phaser.Keyboard.S)) {
		    	this.walk(2,1);
		    } else if (allPlayers[1].poss[3] == 0 && game.input.keyboard.isDown(Phaser.Keyboard.W)) {
		    	this.walk(3,1);
		    }
		}
		if(lowerEnemyBound >= 3 && canWeWalk[2]) {
			if (allPlayers[2].poss[2] == 0 && game.input.keyboard.isDown(Phaser.Keyboard.H)) {
		    	this.walk(0,2);
		    } else if (allPlayers[2].poss[0] == 0 && game.input.keyboard.isDown(Phaser.Keyboard.K)) {
		    	this.walk(1,2);
		    } else if (allPlayers[2].poss[1] == 0 && game.input.keyboard.isDown(Phaser.Keyboard.J)) {
		    	this.walk(2,2);
		    } else if (allPlayers[2].poss[3] == 0 && game.input.keyboard.isDown(Phaser.Keyboard.U)) {
		    	this.walk(3,2);
		    }
		}
		if(lowerEnemyBound >= 4 && canWeWalk[3]) {
			if (allPlayers[3].poss[2] == 0 && game.input.keyboard.isDown(Phaser.Keyboard.C)) {
		    	this.walk(0,3);
		    } else if (allPlayers[3].poss[0] == 0 && game.input.keyboard.isDown(Phaser.Keyboard.B)) {
		    	this.walk(1,3);
		    } else if (allPlayers[3].poss[1] == 0 && game.input.keyboard.isDown(Phaser.Keyboard.V)) {
		    	this.walk(2,3);
		    } else if (allPlayers[3].poss[3] == 0 && game.input.keyboard.isDown(Phaser.Keyboard.F)) {
		    	this.walk(3,3);
		    }
		}
		game.physics.arcade.overlap(explodeGroup,levelGroup,this.destroyIt);
		game.physics.arcade.overlap(playerGroup,explodeGroup,this.hitPlayer);
		bombGroup.forEachAlive(function(item) {
			if(item.timer >= 0.01) {
				item.timer -= (1/60);
			} else {
				//CREATE FORCEFIELD
				var size = SIZES[item.owner];
				var newE = game.add.sprite(item.x, item.y, 'centerExplode');
				newE.width = newE.height = BOXW;
				newE.timer = 1;
				newE.frame = item.owner;
				newE.prevOwner = item.owner;
				explodeGroup.add(newE);
				//newE.body.setSize(BOXW*0.2,BOXW*0.2,5,5);
				var bp = [item.x, item.y]; //Basic position
				for(var d=0;d<4;d++) {
					for(var b=0;b<size;b++) {
						if(d==0) {
							var newE = game.add.sprite(bp[0],bp[1]-(b+1)*BOXW,'explode');
						} else if(d==1) {
							var newE = game.add.sprite(bp[0],bp[1]+(b+1)*BOXW,'explode');
						} else if(d==2) {
							var newE = game.add.sprite(bp[0]-(b+1)*BOXW,bp[1],'explode');
						} else if(d==3) {
							var newE = game.add.sprite(bp[0]+(b+1)*BOXW,bp[1],'explode');
						}
						newE.width = newE.height = BOXW;
						newE.timer = 1;
						explodeGroup.add(newE);
						newE.prevOwner = item.owner;
						newE.frame = item.owner;
						newE.body.setSize(BOXW*4,BOXW*4,0,0);
						if(game.physics.arcade.overlap(newE,levelGroup) || game.physics.arcade.overlap(newE,levelBounds)) {
							//We're done here
							newE.x += BOXW/2;
							newE.y += BOXW/2;
							newE.anchor.setTo(0.5,0.5);
							if(d <=1) {
								newE.angle = 90;
							}
							break;
						}
						newE.x += BOXW/2;
						newE.y += BOXW/2;
						newE.anchor.setTo(0.5,0.5);
						if(d <=1) {
							newE.angle = 90;
						}
					}
				}
				BOMBS[item.owner]++;
				item.exists = false;
				item.kill();
			}
		});
		game.physics.arcade.overlap(explodeGroup,playerTentacles,this.collidingExplosion);
		game.physics.arcade.overlap(explodeGroup,diagonalTentacles,this.collidingPC);
		//Go through enemies
		for(var i=lowerEnemyBound;i<=amountEnemies+3;i++) {
			/*if(allPlayers[i].INDANGER == 'PREV') {
				allPlayers[i].INDANGER = 'NONE';
			}*/
			var a = allPlayers[i];
			if(!a.alive) {
				continue;
			}
			if(canWeWalk[i]) {
				var possPaths = [];
				if(a.poss[2] == 0) {
					possPaths.push(0);
				}
				if(a.poss[0] == 0) {
					possPaths.push(1);
				}
				if(a.poss[1] == 0) {
					possPaths.push(2);
				}
				if(a.poss[3] == 0) {
					possPaths.push(3);
				}
				a.possPaths = possPaths.length;
				if(possPaths.length > 0 && a.teleportTime <= 0.5) {
					if(levelGroup.countLiving() <= boxesBound && BOMBS[i] > 0 && possPaths.length >= 2 && Math.random() > 0.8) {
						this.dropBomb(i);
					}
					var randNum = Math.round((possPaths.length-0.49)*Math.random()-0.49);
					this.walk(possPaths[randNum],i);
					if(a.INDANGER == 'PREV') {
						a.INDANGER = 'NONE';
					}
				} else {
					if(a.INDANGER == 'NOW') {
						//DOSOMETHING
						a.INDANGER = 'PREV';
					}
				}
			}
		}
		explodeGroup.forEachAlive(function(item) {
			if(item.timer >= 0.01) {
				item.timer -= (1/60);
			} else {
				item.kill();
			}
		});
		game.world.bringToTop(explodeGroup);
	},

	hitPlayer: function(a,b) {
		if(a.regenerate == 0) {
			a.LIVES -= 1;
			if(b.prevOwner != a.myNum) {
				allPlayers[b.prevOwner].POINTS += 10;
			}
			a.regenerate = 5;
		}
	},

	destroyIt: function(a,b) {
		//If we're in luck, give the player a powerup!
		if(Math.random() > 0.5) {
			var powerUp = game.add.sprite(b.x,b.y,'powerUps');
			powerUp.width = powerUp.height = b.width;
			var whatType = Math.round(Math.random()*2.49);
			powerUp.frame = whatType;
			powerUp.alpha = 1;
			//0 = EXTRA BOMB, 1 = EXTRA SPEED, 2 = EXTRA POWER
			powerUp.TYPE = whatType;
			powerUpGroup.add(powerUp);
		}
		allPlayers[a.prevOwner].POINTS += 5;
		b.body.x -= 20000;
		b.kill();
		b.exists = false;
	},

	userInput:function(e) {
		switch(e.keyCode) {
	    	case Phaser.Keyboard.SHIFT:
	    		if(BOMBS[0] > 0) {
		    		this.dropBomb(0);
	    		}
	    		break;
	    	case Phaser.Keyboard.G:
	    		if(BOMBS[1] > 0 && lowerEnemyBound >= 2) {
	    			this.dropBomb(1);
	    		}
	    		break;
	    	case Phaser.Keyboard.L:
	    		if(BOMBS[2] > 0 && lowerEnemyBound >= 3) {
	    			this.dropBomb(2);
	    		}
	    		break;
	    	case Phaser.Keyboard.N:
	    		if(BOMBS[3] > 0 && lowerEnemyBound >= 4) {
	    			this.dropBomb(3);
	    		}
	    		break;
	    	case Phaser.Keyboard.Q:
	    		if(lowerEnemyBound <= 3) {
		    		lowerEnemyBound++;
	    		}
	    		break;
	    	case Phaser.Keyboard.P:
	    		if(lowerEnemyBound > 1) {
	    			lowerEnemyBound--;
	    		}
	    		break;
	    	case Phaser.Keyboard.ALT:
	    		if(lowerEnemyBound == 1) {
		    		this.shutItDown();
	    		}
	    		break;
	    }
	},

	shutItDown:function() {
		var temp = 0;
		RESULTS = [];
		for(var i=0;i<lowerEnemyBound;i++) {
			RESULTS[i] = allPlayers[i].POINTS;
			temp = Math.max(RESULTS[i],temp);
		}
		TOPSCORE = temp;
		game.state.start('GameOver');
	},

	getPowerup: function(a,b) {
		//if(a.myNum <= 1) {
			if(b.TYPE == 0) {
				if(BOMBS[a.myNum] <= 8) {
					BOMBS[a.myNum]++;					
				}
			} else if(b.TYPE == 1) {
				//SPEED?
				if(a.SPEED >= 100) {
					a.SPEED -= 25;
				}
			} else if(b.TYPE == 2) {
				if(SIZES[a.myNum] <= 5) {
					SIZES[a.myNum]++;	
				} 
			}
			a.POINTS += 7;
			b.exists = false;
			b.kill();
		//}
		//Receive reward!
	},

	teleportMe: function(a,b) {
		if(canWeWalk[a.myNum] && a.teleportTime == 0) {
			var tempTele = telePorters.filter(function(i) {
					return i != b.myPosition;
				});
			var chooseFrom = Math.round((tempTele.length-1)*Math.random());
			a.x = tempTele[chooseFrom][0]*BOXW+(BOXW/2);
			a.y = tempTele[chooseFrom][1]*BOXW+(BOXW/2);
			a.teleportTime = 1.5;
			a.POINTS += 3;
		}

	},

	dropBomb: function(theNum) {
		var theP = allPlayers[theNum];
		var distToTarget = Math.sqrt(Math.pow(theP.curTarget[0]-theP.x,2)+Math.pow(theP.curTarget[1]-theP.y,2));
		if(distToTarget <= BOXW/2) {
			var newBombPos = [theP.curTarget[0]-theP.width/2, theP.curTarget[1]-theP.height/2];
		} else {
			var newBombPos = [theP.oldTarget[0]-theP.width/2, theP.oldTarget[1]-theP.height/2];
		}
		var newBomb = game.add.sprite(newBombPos[0], newBombPos[1],'bomb');
		newBomb.frame = theNum;
		newBomb.width = newBomb.height = BOXW;
		newBomb.timer = 3;
		newBomb.owner = theNum;
		allPlayers[theNum].POINTS += 3;
		//newBomb.alpha = 0.5;
		BOMBS[theNum]--;
		bombGroup.add(newBomb);
	},

	shutdown: function() {
		levelGroup.removeAll(true,false);
		levelBounds.removeAll(true,false);
		explodeGroup.removeAll(true,false);
		bombGroup.removeAll(true,false);
		playerGroup.removeAll(true,false);
		BOMBS = [1,1,1,1];
		diagonalTentacles.removeAll(true,false);
		canWeWalk = [true,true,true,true];
		playerTentacles.removeAll(true,false);
		allPlayers = [];
		SIZES = [1,1,1,1];
		telePorters = [];
		amountEnemies = 0;
		decayTime = 1;
		decayPos = [1,1];
		tempCountDown = 0;
		level = [];

	},
}