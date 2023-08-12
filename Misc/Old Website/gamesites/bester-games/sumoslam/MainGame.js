var playerGroup;
var allPlayers = [];
var SPEED = 6.5;
var BOUNCE = 1.8;
var xDist = 700;
var yDist = 400;
var DRAG = 200;
var baseSize = 120;
var lowerEnemyBound = 2;
var tentacleGroup;
var obstacleGroup;
var ballGroup;
var orderKilled = [];
var topText = [];
var style = [];

Scene.Main = function(game) {
};

Scene.Main.prototype = {
	preload: function() {
		game.stage.backgroundColor = '#DDD';
	},

	create:function() {
		game.physics.startSystem(Phaser.Physics.ARCADE);
		lowerEnemyBound = MULTIPLAYER+1;
		var bg = game.add.sprite(0,0,'bg');
		bg.width = game.width;
		var circ = game.add.sprite(game.width/2,game.height/2,'circle');
		circ.anchor.setTo(0.5,0.5);
		circ.width = xDist*2;
		circ.height = yDist*2;
		obstacleGroup = game.add.group();
		obstacleGroup.enableBody = true;
		playerGroup = game.add.group();
		tentacleGroup = game.add.group();
		playerGroup.enableBody = true;
		tentacleGroup.enableBody = true;
		ballGroup = game.add.group();
		ballGroup.enableBody = true;
		if(MODES[0] == 1) {
			//BIG FIELD
			baseSize = 50;
		}
		if(MODES[1] == 1) {
			//Obstacles?
			var startX = game.width/2-xDist;
			var startY = game.height/2-yDist;
			for(var a=0;a<10;a++) {
				for(var b=0;b<15;b++) {
					var tempX = startX+b*(xDist*2)/15;
					var tempY = startY+a*(yDist*2)/10;
					if(this.dist(tempX,tempY) <= 1 && Math.random() < 0.04) {
						var obst = game.add.sprite(tempX,tempY,'box');
						obst.anchor.setTo(0.5,0.5);
						obst.scale.setTo(0.15,0.15);
						obstacleGroup.add(obst);
						obst.body.immovable = true;
						obst.body.bounce.setTo(0,0);
					}
					
				}
			}
		}
		if(MODES[2] == 1) {
			//SUPERSPEED
			SPEED = 9;
			DRAG = 250;
		}
		//bg.height = game.height;
		for(var i=0;i<4;i++) {
			var extraX = Math.cos(i*Math.PI/2)*(xDist-100);
			var extraY = Math.sin(i*Math.PI/2)*(yDist-100);
			var newS = game.add.sprite(game.width/2+extraX, game.height/2+extraY,'player'+(i+1)+'');
			if(MODES[3] == 1) {
			//SOCCER SUMO
				for(var k=0;k<4;k++) {
				var theBall = game.add.sprite(game.width/2+extraX*(0.8-k*0.1),game.height/2+extraY*(0.8-k*0.1),'theBall');
				theBall.anchor.setTo(0.5,0.5);
				theBall.scale.setTo(0.05,0.05);
				game.physics.arcade.enable(theBall);
				theBall.body.bounce.setTo(3,3);
				theBall.body.maxVelocity.setTo(500,500);
				//theBall.body.drag.setTo(150,150);
				BOUNCE = 0.9;
				ballGroup.add(theBall);
				}
			}
			newS.anchor.setTo(0.5,0.5);
			newS.width = newS.height = baseSize;
			playerGroup.add(newS);
			newS.body.setSize(newS.width*(500/baseSize),newS.height*(500/baseSize)-(200/baseSize)*newS.height,0,0.2*newS.height);
			newS.body.drag.x = DRAG;
			newS.body.drag.y = DRAG;
			newS.body.bounce.x = BOUNCE;
			newS.body.bounce.y = BOUNCE;
			newS.reconsider = 0;
			newS.decision = 0;
			newS.body.maxVelocity.setTo(700,700);
			/*newS.tentacles = [];
			for(var k=0;k<3;k++) {
				for(var l=0;l<3;l++) {
					var XPOS = -300+l*300;
					var YPOS = -300+k*300;
					var a = game.add.sprite(newS.x,newS.y,'transp');
					a.scale.setTo(0.05,0.05);
					a.anchor.setTo(0.5,0.5);
					tentacleGroup.add(a);
					a.XPOS = XPOS;
					a.YPOS = YPOS;
					a.belongTo = 3*k+l;
					newS.tentacles.push(a);
				}
			}*/
			allPlayers[i] = newS;
		}
		game.physics.arcade.overlap(playerGroup,obstacleGroup,this.removeUnwanted);
		style[0] = {align: 'center', font:"700 42px 'Oswald', sans-serif",fill:'#46993D'};
		style[1] = {align: 'center', font:"700 42px 'Oswald', sans-serif",fill:'#00A09F'};
		style[2] = {align: 'center', font:"700 42px 'Oswald', sans-serif",fill:'#9A311F'};
		style[3] = {align: 'center', font:"700 42px 'Oswald', sans-serif",fill:'#992377'};

		var b = 200;
		for(var i=0;i<4;i++) {
			var XPOS = game.width/2-(3*b/2)+i*b;
			var vla = game.add.sprite(XPOS-b/4,40,'player'+(i+1));
			vla.anchor.setTo(0.5,0.5);
			vla.scale.setTo(0.1,0.1);
			topText[i] = game.add.text(XPOS, 40,'LALA',style[i]);
	    	topText[i].anchor.setTo(0.5,0.5);
		}
	},

	render: function() {
		/*tentacleGroup.forEach(function(item) {
			game.debug.body(item);
		})*/
	},

	update: function() {
		for(var i=0;i<4;i++) {
			topText[i].text = POINTS[i];
		}
		if(MODES[3] != 1) {
			game.physics.arcade.collide(playerGroup,playerGroup,this.resolveIssue,this.colliding);			
		} else {
			game.physics.arcade.collide(playerGroup,ballGroup,null,this.colliding);
			ballGroup.forEach(function(theBall) {
				theBall.rotation += (theBall.body.velocity.x+theBall.body.velocity.y)*0.0001;
				if(theBall.x < game.width/2-xDist) {
					theBall.x = game.width/2-xDist+20;
					theBall.body.velocity.x *= -1;
				} else if(theBall.x > game.width/2+xDist) {
					theBall.x = game.width/2+xDist-20;
					theBall.body.velocity.x *= -1;
				}
				if(theBall.y < game.height/2-yDist) {
					theBall.y = game.height/2-yDist+20;
					theBall.body.velocity.y *= -1;
				} else if(theBall.y > game.height/2+yDist) {
					theBall.y = game.height/2+yDist-20;
					theBall.body.velocity.y *= -1;
				}
			});
		}
		if(MODES[1] == 1) {
			game.physics.arcade.collide(playerGroup,obstacleGroup,null,this.colliding);
			game.physics.arcade.collide(ballGroup,obstacleGroup,null,this.colliding);
		}
		//FIRST PLAYER
		if (game.input.keyboard.isDown(Phaser.Keyboard.LEFT)) {
	    	allPlayers[0].body.velocity.x -= SPEED;
	    }
	    if (game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
	    	allPlayers[0].body.velocity.x += SPEED;
	    } 
	    if (game.input.keyboard.isDown(Phaser.Keyboard.DOWN)) {
	    	allPlayers[0].body.velocity.y += SPEED;
	    } 
	    if (game.input.keyboard.isDown(Phaser.Keyboard.UP)) {
	    	allPlayers[0].body.velocity.y -= SPEED;
	    }

	    //SECOND PLAYER
	    if(lowerEnemyBound > 1) {
	    	if (game.input.keyboard.isDown(Phaser.Keyboard.A)) {
		    	allPlayers[1].body.velocity.x -= SPEED;
		    }
		    if (game.input.keyboard.isDown(Phaser.Keyboard.D)) {
		    	allPlayers[1].body.velocity.x += SPEED;
		    }
		    if (game.input.keyboard.isDown(Phaser.Keyboard.S)) {
		    	allPlayers[1].body.velocity.y += SPEED;
		    }
		    if (game.input.keyboard.isDown(Phaser.Keyboard.W)) {
		    	allPlayers[1].body.velocity.y -= SPEED;
		    }
	    }

	    //THIRD PLAYER
	    if(lowerEnemyBound > 2) {
	    	if (game.input.keyboard.isDown(Phaser.Keyboard.H)) {
		    	allPlayers[2].body.velocity.x -= SPEED;
		    }
		    if (game.input.keyboard.isDown(Phaser.Keyboard.K)) {
		    	allPlayers[2].body.velocity.x += SPEED;
		    }
		    if (game.input.keyboard.isDown(Phaser.Keyboard.J)) {
		    	allPlayers[2].body.velocity.y += SPEED;
		    }
		    if (game.input.keyboard.isDown(Phaser.Keyboard.U)) {
		    	allPlayers[2].body.velocity.y -= SPEED;
		    }
	    }

	    //FOURTH
	    if(lowerEnemyBound > 3) {
	    	if (game.input.keyboard.isDown(Phaser.Keyboard.C)) {
		    	allPlayers[3].body.velocity.x -= SPEED;
		    }
		    if (game.input.keyboard.isDown(Phaser.Keyboard.B)) {
		    	allPlayers[3].body.velocity.x += SPEED;
		    }
		    if (game.input.keyboard.isDown(Phaser.Keyboard.V)) {
		    	allPlayers[3].body.velocity.y += SPEED;
		    }
		    if (game.input.keyboard.isDown(Phaser.Keyboard.F)) {
		    	allPlayers[3].body.velocity.y -= SPEED;
		    }
	    }


	    //All players, but most all directing the computer-AI-opponent
	    var playersAlive = [];
	    var allCurrPlayers = [];
	    for(var i=0;i<4;i++) {
	    	if(!allPlayers[i].alive) {
    			continue;
    		}
    		if(i < lowerEnemyBound && allPlayers[i].alpha == 1) {
	    		playersAlive.push(allPlayers[i]);	
	    		allCurrPlayers.push(i);	
    		}
    		//Make a player fall off the field
	    	if(this.dist(allPlayers[i].x,allPlayers[i].y) > 1.1 && allPlayers[i].alpha == 1) {
	    		orderKilled.push(i);
	    		allPlayers[i].alpha = 0.2;
	    		allPlayers[i].body.gravity.y = 1000;
	    	}
	    	//Killing players when the fall out of the game
	    	if(allPlayers[i].y > game.height) {
	    		allPlayers[i].kill();
	    	}
	    	//For setting the correct frame
	    	if(allPlayers[i].body.velocity.x < 0) {
	    		//Moving left
	    		if(allPlayers[i].body.velocity.y > 100) {
	    			allPlayers[i].frame = 0;
	    		} else if(allPlayers[i].body.velocity.y < -100) {
	    			allPlayers[i].frame = 1;
	    		} else {
	    			allPlayers[i].width = baseSize;
	    			allPlayers[i].frame = 2;
	    		}
	    	} else if(allPlayers[i].body.velocity.x > 0) {
	    		//Moving right
	    		if(allPlayers[i].body.velocity.y > 100) {
	    			allPlayers[i].frame = 0;
	    		} else if(allPlayers[i].body.velocity.y < -100) {
	    			allPlayers[i].frame = 1;
	    		} else {
	    			allPlayers[i].width = -baseSize;
	    			allPlayers[i].frame = 2;
	    		}
	    	} else {
	    		allPlayers[i].width = baseSize;
	    		allPlayers[i].frame = 0;
	    	}
	    	/*allPlayers[i].height = baseSize*allPlayers[i].y/(game.width/2);
	    	allPlayers[i].width = allPlayers[i].height;*/
	    	allPlayers[i].reconsider -= (1/60);
	    	if(i >= lowerEnemyBound) {
	    		allCurrPlayers.push(i);
	    		if(playersAlive.length < 1) {
	    			//END GAME!
			    	console.log('call to end');
	    			this.endGame();
	    			break;
	    		}
	    		if(MODES[3] != 1) {
	    			if(allPlayers[i].decision >= playersAlive.length) {
			    		var rot = game.physics.arcade.angleBetween(allPlayers[i],playersAlive[0]);
		    		} else {
			    		var rot = game.physics.arcade.angleBetween(allPlayers[i],playersAlive[allPlayers[i].decision]);
		    		}
		    		var dest = game.physics.arcade.accelerationFromRotation(rot,SPEED);
		    		allPlayers[i].body.velocity.x += dest.x;
		    		allPlayers[i].body.velocity.y += dest.y;
		    		if(allPlayers[i].reconsider < 0.01) {
			    		/*var poss2 = [];
			    		for(var j=0;j<poss.length;j++) {
			    			if(poss[j] == 0) {
			    				poss2.push(j);
			    			}
			    		}
			    		var rand = Math.round(Math.random()*(poss2.length-1));
			    		var t = poss2[rand];*/
			    		var randP = Math.round(Math.random()*(playersAlive.length-1));
			    		allPlayers[i].decision = randP;
			    		allPlayers[i].reconsider = 4;
		    		}
	    		} else {
	    			rot = game.physics.arcade.angleBetween(allPlayers[i],ballGroup.getChildAt(allPlayers[i].decision));
		    		var dest = game.physics.arcade.accelerationFromRotation(rot,SPEED);
		    		allPlayers[i].body.velocity.x += dest.x;
		    		allPlayers[i].body.velocity.y += dest.y;
		    		if(allPlayers[i].reconsider < 0.01) {
			    		var randP = Math.round(Math.random()*3);
			    		allPlayers[i].decision = randP;
			    		allPlayers[i].reconsider = 4;
		    		}
	    		}
	    	}
	    }
	    if(allCurrPlayers.length <= 1 && playersAlive.length >= 1) {
	    	orderKilled.push(allCurrPlayers[0]);
	    	console.log('call to end');
	    	this.endGame();
	    }
	},

	removeUnwanted: function(a,b) {
		b.kill();
	},

	dist: function(a,b) {
		return Math.pow((a-game.width/2)/xDist,2)+Math.pow((b-game.height/2)/yDist,2);
	},

	shutdown: function() {
		playerGroup.remove(true,false);
		tentacleGroup.remove(true,false);
		allPlayers = [];
	},

	colliding: function(a,b) {
		if(a.alpha == 1 && b.alpha == 1) {
			return true;
		} else {
			return false;
		}
	},

	resolveIssue: function(a,b) {
		a.body.bounce.x = Math.random()*3+0.5;
		a.body.bounce.y = Math.random()*3+0.5;
		b.body.bounce.x = Math.random()*3+0.5;
		b.body.bounce.y = Math.random()*3+0.5;
	},

	endGame: function() {
		console.log(orderKilled);
		if(orderKilled.length != 4) {
			for(var i=lowerEnemyBound;i<4;i++) {
				POINTS[i] += (4-i);
			}
		}
		for(var i=0;i<orderKilled.length;i++) {
			POINTS[orderKilled[i]] += i;
		}
		orderKilled = [];
		game.state.start("Main");
	}
};
