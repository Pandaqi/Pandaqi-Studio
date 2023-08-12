var groundGroup, ballGroup, goalGroup;
var ground, ball;
var allBodies, players;

var bodyHeight;
var bodyWidth;

var legHeight;

var armWidth;
var armHeight;

var headWidth;
var headHeight;

var ballRadius;

var goalWidth;
var goalHeight;

var controls = [Phaser.Keyboard.W, Phaser.Keyboard.U, Phaser.Keyboard.UP, Phaser.Keyboard.V];
var better_controls = [];
better_controls[0] = [Phaser.Keyboard.W, Phaser.Keyboard.A, Phaser.Keyboard.S, Phaser.Keyboard.D];
better_controls[1] = [Phaser.Keyboard.UP, Phaser.Keyboard.LEFT, Phaser.Keyboard.DOWN, Phaser.Keyboard.RIGHT];
var pointsCounter = [0,0];

var bodyMaterial, bodyContactMaterial;
var VEL_LIMIT = 1700;
var pointsText = [null, null];

var lastJumpType = 0;

Scene.Main = function(game) {
};

Scene.Main.prototype = {
	create: function() {
		if(GAME_TYPE == 0) {
			VEL_LIMIT = 1700;
		} else if(GAME_TYPE == 1) {
			VEL_LIMIT = 3200;
		}

		game.stage.backgroundColor = '#7EC0EE';

		// RESET VARIABLES
		groundGroup = ballGroup = goalGroup = null;
		ground = ball = null;
		allBodies = [];
		players = [];

		// INITIALIZE PHYSICS AND OTHER GLOBAL STUFF
		game.physics.startSystem(Phaser.Physics.P2JS); 
	    game.physics.p2.gravity.y = 1000;
	    game.physics.p2.friction = 4;
		game.world.setBounds(0, 0, game.width,game.height);
		//game.input.keyboard.addCallbacks(this, null, this.userInput, null);

		groundGroup = game.physics.p2.createCollisionGroup();
		ballGroup = game.physics.p2.createCollisionGroup();
		goalGroup = game.physics.p2.createCollisionGroup();

		// INITIALIZE VARIABLES
		bodyHeight = game.height*0.11;
		bodyWidth = (4/7)*bodyHeight;

		legHeight = bodyHeight*0.75;

		armWidth = bodyWidth*0.35;
		armHeight = bodyHeight*0.75;

		headWidth = bodyWidth*0.75;
		headHeight = bodyHeight*0.5;

		console.log(game.height)
		goalHeight = bodyHeight * 4.5;
		goalWidth = goalHeight * (200 / 380);
		goalOffset = game.width * 0.025;

		// ADD ALL THE PLAYERS
		for(let i = 0; i < amountPlayers; i++) {
			players[i] = [];
			for(let j = 0; j < playersPerTeam; j++) {
				this.createPlayer(i,j);
			}
		}

		ballRadius =  legHeight * 0.4 * 2;

		// ADD THE BALL
		let ballOffset = 0;
		// when playing in "serious mode", the kick-off goes to the team that conceded a goal
		// in drunk mode, the ball is simply dropped in the middle
		if(GAME_TYPE == 1 && lastWinner != null) {
			ballOffset = (-lastWinner)*2 + 1;
		}
		ball = game.add.sprite(game.width*0.5 + ballOffset*game.width*0.2, 0, 'ball');
		ball.width = ball.height = ballRadius;
		game.physics.p2.enable(ball);
		ball.body.setCircle(ball.width * 0.5);
		ball.body.setCollisionGroup(ballGroup);

		// ADD THE FLOOR
		ground = game.add.sprite(game.width*0.5, game.height*0.83, 'grass');
		ground.width = game.width;
		ground.height = game.height*0.34;
		game.physics.p2.enable(ground);
		ground.body.static = true;
		ground.body.setCollisionGroup(groundGroup);

		var ballMaterial = game.physics.p2.createMaterial('spriteMaterial', ball.body);
		var groundMaterial = game.physics.p2.createMaterial('worldMaterial', ground.body);
		bodyMaterial = game.physics.p2.createMaterial('bodyMaterial');

		var contactMaterial = game.physics.p2.createContactMaterial(ballMaterial, groundMaterial);
		contactMaterial.restitution = 0.7;
		contactMaterial.friction = 0.3;

		bodyContactMaterial = game.physics.p2.createContactMaterial(ballMaterial, bodyMaterial);
		bodyContactMaterial.restitution = 0.6;

		// CREATE THE GOALS
		// GOAL 1
		var goalOne = game.add.sprite(goalOffset + 0.5*goalWidth, game.height*0.66 - goalHeight*0.5, 'transparent');
		let goalSprite = game.add.sprite(goalOffset, game.height*0.66 - goalHeight, 'goal');
		goalOne.width = goalSprite.width = goalWidth;
		goalOne.height = goalSprite.height = goalHeight;
		game.physics.p2.enable(goalOne);
		var path = [[-goalWidth*0.5, goalHeight*0.5], [-goalWidth*0.5, -goalHeight*0.25], [goalWidth*0.5, -goalHeight*0.5], [goalWidth*0.5, -goalHeight*0.5 + 15], [-goalWidth*0.5 + 15, -goalHeight*0.25 + 15], [-goalWidth*0.5 + 15, goalHeight*0.5]];

		goalOne.body.clearShapes();
	   	goalOne.body.addPolygon({},path);
	   	goalOne.anchor.setTo(0,0.5);
	   	goalOne.body.static = true;
	   	goalOne.alpha = 0;
		//goalOne.body.debug = true;
		goalOne.body.setCollisionGroup(goalGroup);

		// GOAL 2
		var goalTwo = game.add.sprite(game.width - goalOffset - 0.5*goalWidth, game.height*0.66 - 0.5*goalHeight, 'transparent');
		goalSprite = game.add.sprite(game.width - goalOffset, game.height*0.66 - goalHeight, 'goal');
		goalTwo.width = goalSprite.width = goalWidth;
		goalTwo.height = goalSprite.height = goalHeight;
		goalSprite.width *= -1;
		game.physics.p2.enable(goalTwo);
		var path = [[goalWidth*0.5, goalHeight*0.5], [goalWidth*0.5, -goalHeight*0.25], [-goalWidth*0.5, -goalHeight*0.5], [-goalWidth*0.5, -goalHeight*0.5 + 15], [goalWidth*0.5 - 15, -goalHeight*0.25 + 15], [goalWidth*0.5 - 15, goalHeight * 0.5]];

		goalTwo.body.clearShapes();
	   	goalTwo.body.addPolygon({},path);
	   	goalTwo.anchor.setTo(0,0.5);
	   	goalTwo.body.static = true;
	   	goalTwo.alpha = 0;
		//goalTwo.body.debug = true;
		goalTwo.body.setCollisionGroup(goalGroup);

		// SETUP ALL POSSIBLE COLLISIONS
		ball.body.collides(groundGroup);
		ground.body.collides(ballGroup);

		ball.body.collides(goalGroup);
		goalOne.body.collides(ballGroup);
		goalTwo.body.collides(ballGroup);

		for(let i = 0; i < allBodies.length; i++) {
			// collide every body with the ground
			ground.body.collides(allBodies[i].myGroup);
			allBodies[i].collides(groundGroup);

			// collide every body with the ball
			ball.body.collides(allBodies[i].myGroup);
			allBodies[i].collides(ballGroup);

			// collide every body with the goals
			goalOne.body.collides(allBodies[i].myGroup);
			goalTwo.body.collides(allBodies[i].myGroup);
			allBodies[i].collides(goalGroup);

			// collide every player with all the other players (and their individual parts)
			for(let j = 0; j < allBodies.length; j++) {
				if(allBodies[j].myID != allBodies[i].myID) {
					allBodies[i].collides(allBodies[j].myGroup);
				}
			}
		}

		pointsText[0] = game.add.text(game.width*0.5 - 30, 10, pointsCounter[0].toString());
		pointsText[1] = game.add.text(game.width*0.5 + 30, 10, pointsCounter[1].toString());
	},

	// d is in the form of [x1, y1, x2, y2, limit (in radians)]
	addBodyPart: function(x, y, width, height, type, id, connection, d) {
		let temp = game.add.sprite(x, y, type);
		temp.width = width;
		temp.height = height;
		game.physics.p2.enable(temp);

		temp.body.myGroup = game.physics.p2.createCollisionGroup();
		temp.body.setCollisionGroup(temp.body.myGroup);
		temp.body.myID = id;
		temp.body.setMaterial(bodyMaterial);

		allBodies.push(temp.body);

		if(connection != null) {
			let constraint = game.physics.p2.createRevoluteConstraint(connection, [ d[0], d[1]  ], temp, [ d[2], d[3] ]);
			if(d[4] != null) {
				constraint.setLimits(-d[4] * Math.PI, d[5] * Math.PI);
			}
			connection.myChildren.push(temp);
		} else {
			temp.body.angularDamping = 0.999;
			temp.myChildren = [];
			temp.flipBack = 0;
			temp.actualRotation = 0;
		}

		return temp;
	},

	createPlayer: function(a, b) {
		let ID = a * playersPerTeam + b;

		let bodyX = (ID+0.5) * (game.width-60) / (playersPerTeam*amountPlayers) + 60;
		let bodyY = game.height*0.5;

		// THE BODY
		let mainBody = this.addBodyPart(bodyX, bodyY, bodyWidth, bodyHeight, 'body'+a, ID, null, null);
		mainBody.mainLeg = (a+1)%2;

		// THE LEGS
		let legLimits = [];
		if(a == 1) {
			legLimits = [0, (7/16), 0, 0];
		} else if(a == 0) {
			legLimits = [0, 0, (7/16), 0];
		}

		this.addBodyPart(bodyX - bodyWidth*0.25, bodyY + 0.5*(bodyHeight+legHeight), bodyWidth*0.5, legHeight, 'leg'+a, ID, mainBody, [-bodyWidth*0.25, bodyHeight*0.5, 0, -legHeight*0.5, legLimits[0], legLimits[1] ]);

		this.addBodyPart(bodyX + bodyWidth*0.25, bodyY + 0.5*(bodyHeight+legHeight), bodyWidth*0.5, legHeight, 'leg'+a, ID, mainBody, [bodyWidth*0.25, bodyHeight*0.5, 0, -legHeight*0.5, legLimits[2], legLimits[3]]);

		// THE ARMS
		this.addBodyPart(bodyX - bodyWidth*0.25, bodyY - 0.5*bodyHeight + 0.5*armHeight, armWidth, armHeight, 'arm'+a, ID, mainBody, [-bodyWidth*0.5, -bodyHeight*0.5, 0, -armHeight*0.5, (1/12), (1/12)]);

		this.addBodyPart(bodyX + bodyWidth*0.25, bodyY - 0.5*bodyHeight + 0.5*armHeight, armWidth, armHeight, 'arm'+a, ID, mainBody, [bodyWidth*0.5, -bodyHeight*0.5, 0, -armHeight*0.5, (1/12), (1/12)]);

		// THE HEAD
		this.addBodyPart(bodyX, bodyY - 0.5*(bodyHeight+headHeight), headWidth, headHeight, 'head'+a, ID, mainBody, [0, -bodyHeight*0.5, 0, headHeight*0.5, (1/16), (1/16)]);

		players[a][b] = mainBody;
	},

	// idea: don't always flip upwards, but flip into a headstand in certain situations
	update:function() {
		// player 2 wins, or player 1 wins, reset game
		if(ball.x < goalOffset + goalWidth - ball.width*0.5) {
			if(ball.y > game.height*0.66 - goalHeight) {
				this.roundEnds(1);
			} else {
				this.roundEnds(null);
			}
		} else if(ball.x > game.width - goalOffset - goalWidth + ball.width*0.5) {
			if(ball.y > game.height*0.66 - goalHeight) {
				this.roundEnds(0);
			} else {
				this.roundEnds(null);
			}
		}

		if(GAME_TYPE == 0) {
			if(Math.random()*Math.random() > 0.9) {
				ball.body.gravityScale = Math.random()*2.35 + 0.15;
				bodyContactMaterial.restitution = Math.random()*2+0.1;
			}

			for(let i = 0; i < amountPlayers; i++) {
				for(let j = 0; j < playersPerTeam; j++) {
					let curP = players[i][j];

					let actualRotation = curP.body.rotation % (2*Math.PI);
					curP.actualRotation = actualRotation;
					let multiplier = bodyHeight * -0.123 + 27.06; //bodyHeight/5

					if(this.touchesGround(curP)) {
						curP.body.angularVelocity = -Math.min(Math.max(actualRotation * multiplier, -multiplier*1.5), multiplier*1.5);
						if(game.input.keyboard.isDown(controls[i*playersPerTeam+j])) {
							var force = 1200;
							var angle;
							// jump in the direction we're leaning now
							angle = (-0.5 + curP.actualRotation)*Math.PI

							// once in a while, move towards the ball
							if(Math.random() > 0.2) {
								angle = (ball.position.x < curP.position.x) ? -0.65*Math.PI : -0.35*Math.PI;
							}

							// actually apply the force (manually, because applyImpulse somehow wasn't recognized)
							force += Math.random()*950;
							curP.body.velocity.x += Math.cos(angle) * force;
							curP.body.velocity.y += Math.sin(angle) * force;

							this.constrainVelocity(curP);
						}
					}

					let mainLeg = curP.myChildren[curP.mainLeg];
					let localRotation = mainLeg.body.rotation - curP.body.rotation;
					mainLeg.localRotation = localRotation;
					if(game.input.keyboard.isDown(controls[i*playersPerTeam+j])) {
						if((i == 1 && localRotation > -1.3) || (i == 0 && localRotation < 1.3)) {
							mainLeg.body.rotateRight(1200 * (i * 2 - 1));
							let rand = 400 + Math.random()*200; // 375
							curP.body.rotateLeft(rand * (i * 2 -1));
						}
					} else {
						if((i == 1 && localRotation > 0.2) || (i == 0 && localRotation < -0.2)) {
							mainLeg.body.rotateLeft(700 * (i * 2 - 1));
							let rand = 200 + Math.random()*200; // 250
							curP.body.rotateRight(rand * (i * 2 -1));
						}
					}

					// COULD applyForce BE A SOLUTION?

					//let mainLeg = curP.myChildren[curP.mainLeg];
					//mainLeg.body.rotateLeft(1 * (i * 2 - 1));
				}
			}
		} else if(GAME_TYPE == 1) {
			ball.body.gravityScale = 0.3;
			bodyContactMaterial.restitution = 2.0;

			for(let i = 0; i < amountPlayers; i++) {
				for(let j = 0; j < playersPerTeam; j++) {
					let curP = players[i][j];
					let leftLeg = curP.myChildren[0];
					let rightLeg = curP.myChildren[1];
					curP.body.angularVelocity = -curP.body.rotation*20;
					let touchGround = this.touchesGroundBetter(curP);

					if(game.input.keyboard.isDown(better_controls[i][1])) {
						curP.body.velocity.x = -350;
					} else if(game.input.keyboard.isDown(better_controls[i][3])) {
						curP.body.velocity.x = 350;
					}

					if(touchGround) {
						if(game.input.keyboard.isDown(better_controls[i][3]) || game.input.keyboard.isDown(better_controls[i][1])) {
							lastJumpType = 0;
							curP.body.velocity.y = -1000;
						}
					}

					if((lastJumpType == 0 || touchGround) && game.input.keyboard.isDown(better_controls[i][0])) {
						lastJumpType = 1;
						curP.body.velocity.y = -5000;
					}

					let mainLeg = curP.myChildren[curP.mainLeg];
					let localRotation = mainLeg.body.rotation - curP.body.rotation;
					mainLeg.localRotation = localRotation;
					if(game.input.keyboard.isDown(better_controls[i][2])) {
						if((i == 1 && localRotation > -1.3) || (i == 0 && localRotation < 1.3)) {
							mainLeg.body.rotateRight(1200 * (i * 2 - 1));
							curP.body.rotateLeft(600 * (i * 2 -1));
						}
						curP.body.velocity.y = 0;
					} else {
						if((i == 1 && localRotation > 0.2) || (i == 0 && localRotation < -0.2)) {
							mainLeg.body.rotateLeft(600 * (i * 2 - 1));
							curP.body.rotateRight(350 * (i * 2 -1));
						}
					}

					if(game.input.keyboard.isDown(Phaser.Keyboard.E)) {
						mainLeg.body.x -= 50;
					}

					this.constrainVelocity(curP);
				}
			}
		}
	},


	// needs to be improved someday
	touchesGround: function(a, offset = 0) {
		if(a.position.y > (game.height * 0.66 - legHeight - bodyHeight*0.5 - offset)) {
			return true;
		}
		return false;
	},

	roundEnds: function(whoWon) {
		if(whoWon != null) {
			lastWinner = whoWon;
			pointsCounter[whoWon]++;
		}
		game.state.start("Main");
	},

	touchesGroundBetter: function(a) {
		if(this.legHits(a.myChildren[0]) || this.legHits(a.myChildren[1])) {
			return true;
		}
		return false;
	},

	legHits: function(a) {
		if(a.position.y >= (game.height * 0.66 - 0.5 * legHeight / Math.cos(a.body.rotation))) {
			return true;
		}
		return false;
	},

	constrainVelocity: function(curP) {
		curP.body.velocity.x = Math.min(Math.max(curP.body.velocity.x, -VEL_LIMIT), VEL_LIMIT);
		curP.body.velocity.y = Math.min(Math.max(curP.body.velocity.y, -VEL_LIMIT), VEL_LIMIT);
	},

	/* render: function() {
		game.debug.text(players[1][0].body.velocity.x, 60, 60 );
	}*/

};

/*
Math.rsign = function() {
	return (Math.random() > 0.5) ? 1 : -1;
}

player.anchor.setTo(0.5,0.5);
player.body.setCircle(playerWidth*0.5-2,0,0);
player.body.collideWorldBounds = true;
player.width = player.height = playerWidth;
player.body.angularDamping = 0.994;
//legOne.body.setRectangle(bodyWidth*0.5, legHeight);
//legTwo.body.setRectangle(bodyWidth*0.5, legHeight);
	    */
