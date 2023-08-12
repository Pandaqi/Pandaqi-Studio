var sensorLevel = [];
var sensorGroup;
var levelGroup;
var pigGroup;
var pizzaGroup;
var player;
var cursors;
var canThrow = 0;
var sizes = [0,0];
var boxGroup;
var menuGroup;
var fireGroup;
var dragonBalls;

var piggies=0;

var lives = 3;
var score = 0;
var pizzas = 30;
var pigs = 1;
var keys = 0;
var theTexts = [];
var scoreTxt;
var livesTxt;
var pizzaTxt;
var pigsTxt;
var awardTxt;

var detectSprite;
var removePig;
var keyDispatched = false;
var latestPizza = [];
var teleporters = [];

var pauseScreen;
var pauseBg;

var GRAVITY = 1500;
var PIZZASPEED = 550;
var PIGSPEED = 120;
var PLAYERSPEED = 350;

var awardTexts;

var awardinessStyle = {align:'center',font:"24px 'Lobster'",fill:'Coral'};

var touchingIce = false;
var dragon = null;
var dragonLives = [];

Scene.Main = function(game) {
};

Scene.Main.prototype = {
	preload: function() {
	},

	create:function() {
		//Load Level
		if(localStorage.curLevel === undefined || localStorage.curLevel === ''){
			localStorage.curLevel = '0';
		}

		if(!randomLev) {
			level = levelSet[Number(localStorage.curLevel)];
			pigLayout = pigSet[Number(localStorage.curLevel)];
		}

		game.time.advancedTiming = true;
		//Backgrounds
		bg = game.add.tileSprite(0,0,game.width,game.height,'bg');
		bg.fixedToCamera = true;
		//Groups and physics initiation
		menuGroup = game.add.group();
		levelGroup = game.add.group();
		pigGroup = game.add.group();
		sensorGroup = game.add.group();
		boxGroup = game.add.group();
		awardTexts = game.add.group();
		game.physics.startSystem(Phaser.Physics.ARCADE);
		//Pizza Particle Emitter!
		pizzaGroup = game.add.emitter(0,0,30);
		pizzaGroup.makeParticles('pizza');
		pizzaGroup.minParticleScale = PW/3;
	    pizzaGroup.maxParticleScale = PW/3;
	    pizzaGroup.gravity = 0;
	    //Firebolt Emitter
	    fireGroup = game.add.emitter(0,0,30);
	    fireGroup.makeParticles('firebolt');
	    fireGroup.gravity = 0;
	    fireGroup.setRotation(0,0);

	    //Enable physics on groups
	    boxGroup.enableBody = true;
		pigGroup.enableBody = true;
		levelGroup.enableBody = true;
		menuGroup.enableBody = true;
		sensorGroup.enableBody = true;

		//Populate the pig group
		for(var z=0;z<20;z++) {
			var la = game.add.sprite(0,0,'pig');
			pigGroup.add(la);
			la.kill();
		}

		pigGroup.autoCull  = true;
		levelGroup.autoCull = true;

		//Get tile size
		var z = game.cache.getImage('ground');
		sizes[0] = z.width*(PW);
		sizes[1] = z.height*(PW);
		//Create Level!
		var A,B,x,y;
		for(var i=0;i<level.length;i++) {
			sensorLevel[i] = [];
			for(var j=0;j<level[i].length;j++) {
				//For SensorLevelie
				if(i < level.length-1 && j > 0 && j < level[i].length-1) {
					var a = level[(i+1)][(j+1)];
					var b = level[(i+1)][(j-1)];
					var c = level[(i+1)][j];
					if((a !== 0 || b !== 0) && !(a !== 0 && b !== 0) && !(c !== 0)) {
						//create sensor
						if(b !== 0 && sensorLevel[i][j-2] === 1) {
							//The room is too small: abort mission!
							sensorLevel[i][j] = 0;
						} else {
							sensorLevel[i][j] = 1;
							var la = game.add.sprite(sizes[0]*j, sizes[1]*i, 'transp');
							//la.visible = false;
							la.width = sizes[0];
							la.height = sizes[1];
							sensorGroup.add(la);
							la.body.immovable = true;
						}
					} else {
						sensorLevel[i][j] = 0;
					}
				}
				A = level[i][j];
				B = pigLayout[i][j];
				x = j*sizes[0];
				y = i*sizes[1];
				switch(A) {
					case 1:
						this.newTile(x,y,'ground','NORMAL');					
						break;
					case 3:
						this.createPlayer(i,j);
						break;
					case 4:
						this.newTile(x,y,'broken','BROKEN');
						break;
					case 5:
						this.newTile(x,y,'lego','LEGO');
						break;
					case 6:
						this.newTile(x,y,'door','DOOR');
						break;
					case 7: 
						this.newTile(x,y,'teleport','TELE');
						break;
					case 8:
						this.newTile(x,y,'trampoline','TRAMPO');
						break;
					case 9:
						this.newTile(x,y,'ice','ICE');
						break;
					case 10:
						this.newTile(x,y,'underground','UNDERGROUND');
						break;
				}
				if(B === 2) {
					this.newPig(x,y,'',3);
				}
			}
		}
		//Create Sensors
		//Update world with new loaded level.
		game.world.setBounds(0,0,(sizes[0]*level[0].length),(sizes[1]*level.length));
		//Kill Tiles if they fly out of WORLD bounds
		levelGroup.killOutOfBounds = true;
		//pigGroup.killOutOfBounds = true;

		//Player Controls
		cursors = game.input.keyboard.createCursorKeys();

		/***MENU STUFF****/
		//Awards/Remarks
		var awardTxtStyle = {align:'center',font:"52px 'Lobster'",fill:'Coral'};

		awardTxt = game.add.text(game.width/2, 40, '',awardTxtStyle);
		awardTxt.anchor.setTo(0.5,0.5);
	    awardTxt.setShadow(0, 0, 'rgba(0, 0, 0, 0.5)', 5);
	    awardTxt.fixedToCamera  =true;

	    var textStyling = { font:"40px 'Inconsolata'", fill:'Brown'};

	    var menuCors = [20,80,140,200,260];
	    var menuTypes = ['thumb','heart','pizza','singlekey','pig'];

	    for(var a=0;a<5;a++) {
	    	//Background bar
	    	var ala = game.add.sprite(5,-30+a*60,'bar');
	    	menuGroup.add(ala);
		    ala.anchor.setTo(0,0);
		    ala.scale.setTo(PW*2.5,PW*1.5);
		    ala.alpha = 0.8;
		    ala.fixedToCamera = true;
		    ala.cacheAsBitmap  =true;

		    //Small logo/sign
		    var alla = game.add.sprite(20,menuCors[a]+5,menuTypes[a]);
		    alla.scale.setTo(PW/3,PW/3);
		    alla.alpha = 0.8;
		    alla.fixedToCamera = true;
		    menuGroup.add(alla);
		    if(menuTypes[a] === 'pig') {
		    	alla.frame = 3;
		    }
		    alla.cacheAsBitmap = true;

		    //The actual text
		    var abba = game.add.text(80, menuCors[a], '',textStyling);
			menuGroup.add(abba);
			theTexts[a] = abba;	
		    abba.setShadow(0, 0, 'rgba(0, 0, 0, 0.5)',4);
		    abba.fixedToCamera = true;
	    }
	    //Pause screen - black fading world overlay
	    pauseBg = this.game.add.graphics(0, 0);
        pauseBg.beginFill('#000000', 1);
        pauseBg.drawRect(0, 0, this.game.width, this.game.height);
        pauseBg.alpha = 0.8;
        pauseBg.endFill();
        //Image to display instructions
        pauseScreen = game.add.sprite(game.width/2, game.height/2,'pausescreen');
	    pauseScreen.anchor.setTo(0.5,0.5);

	    pauseBg.fixedToCamera = true;
	    pauseScreen.fixedToCamera = true;
	    pauseScreen.cacheAsBitmap = true;
	    pauseBg.cacheAsBitmap = true;
	    //Pause game and add unpause by pressing P
	    game.input.keyboard.addCallbacks(this,null,this.pauseIt,null);
	    game.paused = true;

	    //Add dragon at 4th and 5th level
	    if(localStorage.curLevel === '4') {
	    	dragon = game.add.sprite(3400,253,'dragon');
	    	game.physics.arcade.enable(dragon);
	    	dragon.immovable = true;
	    	dragon.scale.setTo(0.4,0.4);
	    	dragon.animations.add('throw',[0,0,0,0,0,0,1,1,2,2],9,true);
	    	dragon.animations.play('throw');
			dragon.events.onAnimationLoop.add(this.dragonThrow);
			dragon.lives = 50;

			//Dragonballs
		    dragonBalls = game.add.emitter(dragon.x, dragon.y);
		    dragonBalls.makeParticles('pinkball');
		    dragonBalls.gravity = 1800;
		    dragonBalls.setRotation(0,0);

		    var bb = -1;
		    for(var a=0;a<dragon.lives;a++) {
		    	if(a%15 === 0) {
		    		bb++;
		    	}
				var h = game.add.sprite(dragon.x+(a%15)*15, dragon.y+bb*15, 'heart');
				h.scale.setTo(0.025,0.025);
				dragonLives[a] = h;
			}
	    } else if(localStorage.curLevel === '5') {
	    	dragon = game.add.sprite(1100,1050,'dragon');
	    	game.physics.arcade.enable(dragon);
	    	dragon.immovable = true;
	    	dragon.body.setSize(dragon.width,dragon.height,-dragon.width,0);
	    	dragon.scale.setTo(-1,1);
	    	dragon.animations.add('throw',[0,0,0,0,0,0,1,1,2,2],9,true);
	    	dragon.animations.play('throw');
			dragon.events.onAnimationLoop.add(this.dragonThrow);
			dragon.lives = 99;

			//Dragonballs
		    dragonBalls = game.add.emitter(dragon.x, dragon.y);
		    dragonBalls.makeParticles('pinkball');
		    dragonBalls.gravity = 1800;
		    dragonBalls.setRotation(0,0);

		    var bb = -1;
		    for(var a=0;a<dragon.lives;a++) {
		    	if(a%20 === 0) {
		    		bb++;
		    	}
				var h = game.add.sprite(dragon.x-500+(a%20)*15, dragon.y+bb*15, 'heart');
				h.scale.setTo(0.025,0.025);
				dragonLives[a] = h;
			}
	    }
	},

	render: function() {
		/*game.debug.body(dragon);
		game.debug.body(player);*/
	},

	update: function() {
		//Control display of awardtxt
		if(awardTxt.alpha > 0) {
			awardTxt.alpha -= (0.5/60);
			if(awardTxt.alpha < 0) {
				awardTxt.alpha = 0;
			}
		}
		//Control amount of pizzas thrown per second (6)
		if(canThrow > 0) {
			canThrow -= 10/60;
			latestPizza = [];
		}
		//Control dropping of boxes
		var time = game.time.totalElapsedSeconds();
		if(time%8 < 0.025 && lives < 3){
			this.newBox('lifebox')
		}
		if(time%8 < 0.025 && pizzas < 20) {
		    this.newBox('box');
		}
		if(!keyDispatched && pigs < 1) {
			this.awardiness(500,'Killed all pigs!');
			keyDispatched = true;
		    this.newBox('key');
		}

		/**** Collide and overlap stuff ****/
		//Player with level
		game.physics.arcade.collide(player, levelGroup, this.hitLevelTile,null,this);
		//Pigs with level
		game.physics.arcade.collide(levelGroup, pigGroup, this.colliding);
		//Overlap player and pigs, destroy pigs and decrease lives
		game.physics.arcade.overlap(player, pigGroup, this.pigHit,null,this);
		//Overlap pizzas with pigs, destroy both + increment score!
		game.physics.arcade.overlap(pizzaGroup, pigGroup, this.pigPizzaHit,null,this);
		//Shoot loose tiles with pizzas
		game.physics.arcade.collide(pizzaGroup,levelGroup,this.pizzaHit,this.isBroken,this);
		//Pigs colliding with sensors
		game.physics.arcade.overlap(pigGroup, sensorGroup,null,this.doWeIgnore,this);
		//Special Boxes and Level
		game.physics.arcade.collide(levelGroup,boxGroup,this.specialBox);
		//Special Boxes and Pigs
		game.physics.arcade.overlap(boxGroup,pigGroup);
		//Special Boxes and Player
		game.physics.arcade.overlap(boxGroup,player,this.specialBoxTake,null,this);
		//Firebolts and player
		game.physics.arcade.overlap(fireGroup,player,this.boltHit,null,this);
		//Dragonballs and level
		if(localStorage.curLevel == '4' || localStorage.curLevel == '5') {
			game.physics.arcade.overlap(dragonBalls, player, this.turnIntoPig,null,this);
			game.physics.arcade.overlap(pizzaGroup, dragon, this.hitDragon, null, this);
			game.physics.arcade.collide(dragon, player, this.playerHitDragon, null, this);
		}
		//FOllow player around the world
		game.camera.follow(player, Phaser.Camera.FOLLOW_PLATFORMER);

		//Overlap player with menu (to make it disappear for visibility)
		if(game.physics.arcade.overlap(player,menuGroup)) {
			menuGroup.alpha = 0.2;
		} else {
			menuGroup.alpha = 1;
		}

		//Loop through pig group
		pigs = 0;
		pigGroup.forEach(function(item) {
			var number = item.body.velocity.x;
			var sign = number<0?-1:1;
			if(item.alive) {
				if(!item.BLOWNAWAY) {
					item.scale.x = PW*item.typo*sign;
					if(item.x+item.width > game.world.width || item.body.touching.right) {
						item.x -= 500 / item.width;
						item.body.velocity.x = -PIGSPEED*item.SNELHEID;
					} else if(item.x+(item.width) < 0 || item.body.touching.left) {
						item.x += 500 / item.width;
						item.body.velocity.x = PIGSPEED*item.SNELHEID;
					}
					if(item.body.velocity.y > 200) {
						item.animations.stop();
						item.frame = 3;
					} else {
						item.animations.play('walk');
					}
				}
				
				if(item.lives < item.maxLives && item.lives > 0) {
					item.MYLIVES.x = item.x;
					item.MYLIVES.y = item.y;
				} else {
					item.MYLIVES.alpha = 0;
				}

				if(item.lives === 2 && item.maxLives > 2) {
					item.animations.stop();
					item.frame = 4;
					game.world.bringToTop(pigGroup);
					item.fireShooting -= (1/60);
					if(item.fireShooting <= 0) {
						fireGroup.x = item.x+(item.width/2);
					    fireGroup.y = item.y + item.height/2.7;/*item.y + 10 + Math.random()*(item.height-20);*/
					    fireGroup.minParticleSpeed.setTo(sign*PIGSPEED*9,-5);
					    fireGroup.maxParticleSpeed.setTo(sign*PIGSPEED*12,5);
					    fireGroup.minParticleScale = PW/4 * sign;
					    fireGroup.particleDrag.setTo(PIGSPEED*6,0);
					    fireGroup.maxParticleScale = PW/2 * sign;
					    fireGroup.start(true, 1000, null, 1);
					    item.fireShooting = 1;
					}
				}
			}
			if(item.y > game.world.height || item.y+(item.height) < 0) {
				item.MYLIVES.destroy();
				item.kill();
			}
		});
		pigs = pigGroup.countLiving();
		if(Math.abs(player.myScale) < (PW*0.99)) {
			player.myScale *= 1.01;
			player.myScale = Math.abs(player.myScale);
			player.scale.x *= 1.01;
			player.scale.y *= 1.01;
		}
		/***ALL PLAYER/WORLD MOVEMENT***/
		if(!touchingIce) {
			player.body.velocity.x = 0;
		} else {
			player.body.velocity.x*=1.01;
		}
	    if (cursors.left.isDown)
	    {
	    	player.scale.x = player.myScale;
	        player.body.velocity.x = -PLAYERSPEED;
	        player.animations.play('left');
	    }
	    else if (cursors.right.isDown)
	    {
	        player.body.velocity.x = PLAYERSPEED;
	        player.scale.x = -player.myScale;
	        player.animations.play('left');
	    }
	    else if(cursors.down.isDown) {
	    	player.scale.y = -player.myScale;
	    } else
	    {
	        player.animations.stop();
	        player.frame = 0;
	    }
	    //JUMPING
	    if (cursors.up.isDown) {
	    	player.scale.y = player.myScale;
	    	if(player.body.touching.down)
		    {
		    	player.body.velocity.y = -GRAVITY/1.8;
		    }
	    }
	    //Control gravity both ways
	    if(player.scale.y < 0) {
	    	player.body.gravity.y = -GRAVITY;
	    	if(player.body.touching.up && canThrow > 0) {
	    		//Award #2
		    	this.awardiness(10, 'UPSIDE DOWN DELIVERY!');
	    	}
	    	//Award #3
		    if(player.body.velocity.y < -900) {
		    	this.awardiness(100, 'BORN TO FLYYYYY');
		    }
	    } else {
	    	player.body.gravity.y = GRAVITY;
	    }

	    touchingIce = false;

	    //Move background
	    bg.tilePosition.y = -game.camera.y/2;
	    bg.tilePosition.x = -game.camera.x/2;

	    //Stat updating!
	    theTexts[0].text = score;
	    theTexts[1].text = lives;
	    theTexts[2].text = pizzas;
	    theTexts[3].text = keys;
	    theTexts[4].text = pigs;

	    //Award #1
	    if(latestPizza != []) {
	    	if(player.body.velocity.x < 0 && latestPizza[0] > 0) {
		    	this.awardiness(50,'PIZZA MOONWALKIN\'');
		    } else if(player.body.velocity.x > 0 && latestPizza[0] < 0) {
		    	this.awardiness(50,'PIZZA MOONWALKIN\'');
		    }
	    }
	    //End Game when Lives reach 0
	    if(lives < 1) {
	    	this.endGame('LOSE');
	    }

	    //Let Player Fall down if no ground, otherwise stop him at the edges
	    if(player.y > game.world.height-player.height) {
	    	player.body.collideWorldBounds = false;
	    	if(player.y > game.world.height) {
	    		lives = 0;
	    	}
	    } else {
	    	player.body.collideWorldBounds = true;
	    }

	    game.world.bringToTop(menuGroup);

	    
	},
	playerHitDragon: function(a,b) {
		this.endGame('LOSE');
	},
	hitDragon: function(a,b) {
		if(a.lives > 0) {
			a.lives--;
			dragonLives[a.lives].visible = false;
		} else if(a.lives === 0) {
			if(localStorage.curLevel == '4') {
				this.awardiness(100000000,'MOTHER OF DRAGONSS');
			} else if(localStorage.curLevel == '5') {
				this.awardiness(300000000,'MOTHER OF DRAGONSS');
			}
			a.lives--;
			var bla = game.add.tween(a).to({ y:-1000 }, Math.random() * 2000+500, Phaser.Easing.Quadratic.InOut, true);
			bla.onComplete.add(function() {
			  a.destroy();
			}, this);
		}
		b.exists = false;
		b.visible = false;
	},

	turnIntoPig: function(a,b) {
		if(b.visible) {
			b.visible = false;
			var tempPig = this.newPig(player.x+150, player.y-150, '', 3);
			tempPig.body.velocity.x = 300;
			//tempPig.dontwork = true;
		}

	},
	dragonThrow: function() {
		if(localStorage.curLevel == '4') {
			dragonBalls.x = dragon.x+150;
		    dragonBalls.y = dragon.y;
		    dragonBalls.minParticleSpeed.setTo(-1500,-100);
		    dragonBalls.maxParticleSpeed.setTo(-1500,-1100);
		    dragonBalls.minParticleScale = 0.1;
		    dragonBalls.maxParticleScale = 0.1;
		    var rand = Math.round(Math.random()*3)+1;
		    dragonBalls.start(true, 1500, null, rand);
		} else if(localStorage.curLevel == '5') {
			dragonBalls.x = dragon.x-150;
		    dragonBalls.y = dragon.y+150;
		    dragonBalls.minParticleSpeed.setTo(1500,-300);
		    dragonBalls.maxParticleSpeed.setTo(2000,-1000);
		    dragonBalls.minParticleScale = 0.3;
		    dragonBalls.maxParticleScale = 0.3;
		    var rand = Math.round(Math.random()*3)+1;
		    dragonBalls.start(true, 1500, null, rand);
		}
	},
	//Function for key input
	pauseIt: function(e) {
	    //Pizza shooting and Pausing!
	    switch(e.keyCode) {
	    	case Phaser.Keyboard.D:
		    	this.newPizza([PIZZASPEED,0]);
	    		break;
	    	case Phaser.Keyboard.A:
		    	this.newPizza([-PIZZASPEED,0]);
	    		break;
	    	case Phaser.Keyboard.W:
		    	this.newPizza([0,-PIZZASPEED]);
	    		break;
	    	case Phaser.Keyboard.S:
		    	this.newPizza([0,PIZZASPEED]);
	    		break;
	    	case Phaser.Keyboard.P:
	    		if(!game.paused) {
		    		pauseBg.visible = true;
		    		pauseScreen.visible = true;
		    		game.paused = true;
		    	} else {
		    		pauseBg.visible = false;
		    		pauseScreen.visible = false;
		    		game.paused = false;
		    	}
	    		break;
	    }
	},
	boltHit: function(a,b) {
		a.scale.x = a.scale.y *= 0.8;
		a.myScale = a.scale.x;
		a.body.velocity.y = -500;
		var signus = b.body.velocity.x<0?-1:1;
		a.body.velocity.x = 4000*signus;
		b.visible = false;
		b.exists = false;
	},
	//Condition to meet if we want to collide pigs with sensors
	doWeIgnore: function(a,b) {
		if(a.ignoreSensors) {
			return false;
		} else {
			return true;
		}
	},
	//Function for properly ending the game
	endGame: function(a) {
		//Save current score, check if highscore needs to be set, and pass the result to the gameover screen.
		localStorage.newHigh = '0';
		if(localStorage.highScore === undefined) {
			localStorage.highScore = '0';
		}
		if(score > Number(localStorage.highScore)) {
			localStorage.highScore = String(score);
			localStorage.newHigh = '1';
		}
		localStorage.lastScore = String(score);
		localStorage.result = a;
		game.state.start('GameOver');
	},
	//Player hitting a level tile
	hitLevelTile:function(a,b) {
		switch(b.soort) {
			case 'LEGO':
				if(a.scale.y > 0 && b.body.touching.up) {
					//Perhaps I should be a bit more mild?
					lives = 0;
				}
				break;
			case 'DOOR':
				if(keys > 0) {
					this.endGame('WIN'); 
					keys--;
				}
				break;
			case 'TELE':
				if(a.body.touching.down) {
					//teleporteerbeer
					var chooseOne = b;
					while(chooseOne.x === b.x) {
						chooseOne = teleporters[Math.round(Math.random()*(teleporters.length-1))]
					}
					var ala = (Math.random() > 0.5)? -1 : 1;
					player.body.velocity.setTo(0,0);
					player.x = chooseOne.x+chooseOne.width/2+player.width*2*ala;
					player.y = chooseOne.y-player.height;
				}
				break;
			case 'BROKEN':
				b.body.immovable = false;
				break;
			case 'TRAMPO':
				if(a.body.touching.down) {
					a.body.velocity.y -= 2000;
				}
				break;
			case 'ICE':
				touchingIce = true;
				break;
		}
	},
	//Pizzas hitting loose tiles (shooting them away) (condition to be met)
	isBroken:function(a,b) {
		if(b.soort === 'BROKEN' || b.soort === 'LEGO') {
			b.body.immovable = false;
			return true; 
		}
	},
	//Dropping a special box - when it hits the level..
	specialBox: function(a,b) {
		if(b.body.touching.down) {
			b.animations.stop();
			b.frame = 0;
		}
	},
	//When player hits special box
	specialBoxTake: function(a,b) {
		if(b.soort === 'box') {
			pizzas += 25;
			this.awardiness(15,'EXTRA PIZZAS!');
		} else if(b.soort === 'key') {
			keys += 1;
			this.awardiness(45,'FOUND A KEY!');
		} else if(b.soort === 'lifebox') {
			lives += 3;
			this.awardiness(80, 'YOU GOT A LIFE!');
		}
		boxGroup.remove(b,true);
		b.destroy();
	},

	//We hit a pig...bad!
	pigHit: function(a,b) {
		if(!b.BLOWNAWAY && !b.dontwork) {
			//pigGroup.remove(b,true);
			b.MYLIVES.destroy();
			//b.destroy();
			b.kill();
			lives--;
			this.awardiness(-100,'A Tad Pig Disappointing :(')
		}
	},

	//Remove some useless pizzas
	pizzaHit: function(a,b) {
		a.exists = false;
		a.visible = false;
	},

	//Our pizza hits a pig...goood!
	pigPizzaHit: function(a,b) {
		//Reduce pig's lives
		b.lives--;
		//If a pig has 1 life, do something special
		if(b.lives === 1) {
			b.body.bounce.y = 1;
			b.body.velocity.y = 300;
			b.body.gravity.y = 1000;
			b.ignoreSensors = true;
		}
		//Change the life-display of the pig
		b.MYLIVES.alpha = 1;
		var aaargh = '';
		for(var i=0;i<b.lives;i++) {
			aaargh += '*';
		}
		b.MYLIVES.text = aaargh;
		//If the pig just died..
		if(b.lives === 0) {
			//Remove the pig, and do so with a nice tweening animation
			var number = a.body.velocity.x;
			var sign = number<0?-1:1;
			var bla = game.add.tween(b).to({ x:sign*(game.world.width+100)*2 }, Math.random() * 2000+500, Phaser.Easing.Quadratic.InOut, true);
			b.BLOWNAWAY = true;
			b.scale.x = PW*b.typo*sign;
			b.animations.stop();
			b.frame = 3;
			bla.onComplete.add(function() {
			  b.MYLIVES.destroy();
			  b.kill();
			}, this);
			this.awardiness(600, 'YOU DESTROYED THAT PIG!');
			//Perhaps...create babies!
			if(Math.random() > 0.5 && (b.maxLives-1) > 0) {
				this.awardiness(1000,'BABY PIGS!');
				var someRand = Math.round(Math.random()*3 + 2);
				for(var z=0;z<someRand;z++) {
					this.newPig(b.x,b.y,'BABIES',(b.maxLives-1));
				}
			}
		}
		a.exists = false;
		a.visible = false;
	},

	//Pigs hitting the level (stop and/or reset tiles)...
	colliding: function(a,b) {
		if(a.soort === 'BROKEN' && !b.body.touching.up) {
			a.body.immovable = true;

			a.body.velocity.setTo(0,0);
			if(b.body.touching.down) {
				a.x = a.corX;
				a.y = a.corY;
			}
		}
	},

	//Special Player Stuff
	createPlayer:function (a,b) {
		player = game.add.sprite(b*sizes[0],a*sizes[1],'player');
		player.animations.add('left',[1,2,1,3],10,true);
		player.anchor.setTo(0.5,0.5);
		player.x += player.width/4;
		game.physics.arcade.enable(player);
		player.scale.setTo(PW,PW);
		player.body.setSize(player.body.width*0.5,player.body.height,null,0);
		player.body.gravity.y = GRAVITY;
		player.body.collideWorldBounds = true;
		player.myScale = PW;
	},

	//Function for special awards, score changes, lives changes, etc.
	awardiness: function(a,b) {
		//Change Big Award Text
		awardTxt.text = b;
		awardTxt.alpha = 1.0;
		//Add A Small One Jumping Out
		var rand = Math.random()*80-40;
		if(awardTexts.getFirstDead() !== null) {
			var tempTxt = awardTexts.getFirstDead();
			tempTxt.exists = tempTxt.visible = tempTxt.alive = true;
			tempTxt.x = player.x+rand;
			tempTxt.y = player.y-player.height/2;
		} else {
			var tempTxt = game.add.text(player.x+rand, player.y-player.height/2, '+'+a,awardinessStyle);
			awardTexts.add(tempTxt);
			tempTxt.anchor.setTo(0.5,0.5);
		    tempTxt.setShadow(0, 0, 'rgba(0, 0, 0, 0.5)', 5);
		}
	    var bla = game.add.tween(tempTxt).to({ y:-200 }, Math.random() * 2500+1000, Phaser.Easing.Quadratic.InOut, true);
		bla.onComplete.add(function() {
			tempTxt.exists = false;
			tempTxt.visible = false;
			tempTxt.alive =  false;
		}, this);
		score = score + a;
	},

	//Function for static tile creation
	newTile: function(a,b,c,d) {
		var a = game.add.sprite(a,b,c);
		a.scale.setTo(PW,PW);
		levelGroup.add(a);
		a.body.immovable = true;
		a.body.allowGravity = false;
		a.soort = d;
		if(c === 'broken') {
			a.corX = a.x;
			a.corY = a.y;
		} else if(c === 'teleport') {
			teleporters.push(a);
		}
	},
	//For New Pizzas..
	newPizza: function(c) {
		if(canThrow <= 0 && pizzas > 0) {
		    pizzaGroup.x = player.x;
		    pizzaGroup.y = player.y;
		    c[0] *= Math.random()+0.8;
		    c[1] *= Math.random()+0.8;
		    var ach = player.body.velocity.x;
		    if(c[0] != 0) {
		    	if((ach > 0 && c[0] > 0) || (ach < 0 && c[0] < 0)) {
				    c[0] += ach;	    	
				}
		    }
		    if(c[1] > 0 && !player.body.touching.up) {
				player.body.velocity.y -= 400;
				this.awardiness(50, 'ROCKET JUMP!');
			}
		    pizzaGroup.minParticleSpeed.setTo(c[0],c[1]);
		    pizzaGroup.maxParticleSpeed.setTo(c[0],c[1]);
		    pizzaGroup.angularVelocity = 800 + Math.random()*800;
		    pizzaGroup.start(true, 1000, null, 1);
			canThrow = 0.5;
			pizzas--;
			latestPizza = [c[0],c[1]];
		}
	},
	//For New Pigs...
	//a,b = (x,y)
	//c = to determine if it's a baby
	//d = amount of lives
	newPig: function(a,b,c,d) {
		if(pigGroup.getFirstDead() !== null) {
			var newP = pigGroup.getFirstDead();
			//newP.body.reset(a,b);
			newP.x = a;
			newP.y = b;
			newP.revive();
		} else {
			var newP = game.add.sprite(a,b,'pig');
			pigGroup.add(newP);
		}
		if(c === 'BABIES') {
			newP.soort = 'BABY';
			newP.scale.setTo(PW/4,PW/4);
			newP.typo = (1/4);
			newP.body.setSize(newP.width,newP.height*30,null,-20);
		} else {
			newP.scale.setTo(PW,PW);
			newP.typo = 1;
			newP.body.height *= 0.8;
		}
		newP.maxLives = d;
		newP.lives = d;
		newP.anchor.setTo(0.5,0);
		var randomSpeed = Math.round(Math.random()*10 + 5);
		newP.animations.add('walk',[0,1,2],randomSpeed,true);
		newP.animations.play('walk');
		newP.body.gravity.y = 700;
		newP.SNELHEID = Math.random()*2+0.5;
		newP.body.velocity.x = PIGSPEED*newP.SNELHEID;
		newP.BLOWNAWAY = false;
		newP.fireShooting = 0;

		var textStyling = {font: "36px 'Lobster'", align:'center',fill:'Brown'};
		var aaa = game.add.text(newP.x, newP.y, '3', textStyling);
		aaa.anchor.setTo(0.5,0.5);
	    aaa.setShadow(0, 0, 'rgba(0, 0, 0, 0.5)', 5);
	    newP.MYLIVES = aaa;
	    return newP;
	},
	//Dropping a new box (a bit out of player's range)
	newBox: function(c) {
		var a = player.x;
		var b = player.y;
		var dist = 5;
		while(dist < 250) {
			a = Math.random()*(game.world.width-sizes[0]*2)+sizes[0];
			b = Math.random()*(game.world.height/4);
			dist = Math.sqrt((a-player.x)*(a-player.x) + (b-player.y)*(b-player.y));
		}
		box = game.add.sprite(a,b,c);
		box.soort = c;
	    boxGroup.add(box);
	    box.scale.setTo(PW,PW);
	    box.animations.add('fly',[0,1,0,2],10,true);
	    box.animations.play('fly');
	    box.body.velocity.y = 100;
	},
	//Function for removing left-overs when switching state
	shutdown: function() {
		sensorLevel = [];
		sensorGroup, levelGroup, pigGroup, pizzaGroup,boxGroup,player,cursors = null;
		canThrow = 0;
		sizes = [0,0];

		lives = 3;
		score = 0;
		pizzas = 30;
		pigs = 1;
		keys = 0;
		scoreTxt, livesTxt, pizzaTxt, pigsTxt, awardTxt = null;

		detectSprite, removePig = null;
		keyDispatched = false;
		latestPizza, teleporters = [];
	}
};