var counter = 0;
var updateCounter = 0;
var allPlayers = [];
var dim = [];
var curMember = null;
var infoText;
var curPlayerSelected = null;
var allGroups = [];
var sortPlayers;
var glowCyclist;
var debugPoints;
var curGameTime = 0;
var inControl = false;
var player;
var clingList = [];
var finishLines = [];
var zoomVal = 1;
var speedVal = 1;
var road;
var positions = [];
var firstOneFinished = false;
var averageVel = 0;
var specialEvents = [];
var windSpeed = 0;

Scene.MainGame = function(game) {
};

Scene.MainGame.prototype = {

	render: function() {
		/*for(var i=0;i<debugPoints.length;i++) {
			game.debug.geom(new Phaser.Point(debugPoints[i][0],debugPoints[i][1]), 'white' ) ;
		}*/
		game.debug.text("FPS: " + game.time.fps,20,20);
	},

	loadMembers: function() {
		var temp = '';
		for(var i=0;i<6;i++) {
			temp += '<div class="inGameMember" id="' + i + '"><div style="width:180px;border-right:1px dashed gray;float:left;"><span style="font-size:20px;" id="nameSpaceMember' + i +'">' + TEAM[i].name + '</span><br/><span class="energyMember" id="energyMember' + i + '">000</span><span style="position:relative;"><img  class="waterBottle" src="WaterBottleEmpty-01.png" /><img src="WaterBottleFull-01.png" class="waterBottle" id="waterBottle' + i + '"/></span><span style="position:relative;margin:40px;"><img class="waterBottle" src="HamBurgerEmpty-01.png" /><img src="HamBurgerFull-01.png" class="waterBottle" id="hamBurger' + i + '"/></span><br/><span style="padding-left:5px;font-size:12px;color:#333;" id="lineMember' + i  + '">Just trucking along</span></div><div style="text-align:right;padding-right:5px;"><span style="font-size:20px;" id="speedMember' + i + '">42 mph</span><br/><img src="FitBar.png" style="width:' + 0.3*TEAM[i].fitness + '%;height:10px;"/><br/><img src="MoraleBar.png" style="height:10px;width:' + 0.3*TEAM[i].morale + '%;position:relative;top:-6px;"/><br/><span style="text-align:right;padding-right:5px;" id="distanceMember' + i + '">0 km</span></div></div>';
		}
		return temp;
	},

	loadActions: function() {
		var temp = '';
		for(var i=0;i<6;i++) {
			temp += '<div class="inGameAction" title="' + i + '"><span style="font-size:20px;"><img src="Logo' + i + '-04.png" width="60" height="60"/></span></div>';
		}
		return temp;
	},

	loadSubActions: function() {
		var temp = '';
		for(var i=0;i<6;i++) {
			temp += '<div class="inGameSubAction" title="' + i + '"><span style="font-size:20px;" id="inGameSub' + i + '"></span></div>';
		}
		return temp;
	},

	showText: function(sprite,pointer) {
		if(curPlayerSelected != sprite) {
			this.updateCurrentSelection(sprite);
		} else {
			infoText.text = '';
			infoText.x = infoText.y = -50;
			glowCyclist.x = glowCyclist.y = -50;
			curPlayerSelected = null;
			if(!firstOneFinished) {
				document.getElementById('extraInfoOverlay').innerHTML = '';				
			}
		}
	},

	updateCurrentSelection: function(sprite) {
		curPlayerSelected = player = sprite;
		player.x = game.width/2;
		player.y = game.height/2;
		infoText.text = sprite.myName;
		if(!firstOneFinished) {
			var OBJ = ALLPART[curPlayerSelected.myIndex];
			document.getElementById('extraInfoOverlay').innerHTML = playerInfoSmall(OBJ);
		}
	},

	getWeather: function() {
		var weatherString = WEATHER[0] + " &nbsp;";
		if(WEATHER[1] > 28) {
			weatherString += '<span style="color:orange;">' + WEATHER[1] + '</span>';
		} else {
			weatherString += WEATHER[1];
		}
		weatherString += " °C &nbsp;";
		if(WEATHER[2] > 18) {
			weatherString += '<span style="color:orange;">' + WEATHER[2] + '</span>';
		} else {
			weatherString += WEATHER[2];
		}
		weatherString += ' m/s';
		return weatherString;
	},

	create:function() {
		road = boundPoints;
		glowCyclist = game.add.sprite(-100,-100,'glow');
		glowCyclist.anchor.setTo(0.5,0.5);
		var that = this;
		$("#noUpdating").html(" | " + Math.round(endOfStage/partLength) + " km | " + this.getWeather());
		$(".standardZoom").attr('id','zoomSelected');
		$(".standardSpeed").attr('id','speedSelected');
		$("#controlButtonOverlay").css('display','block');
		$(".controlButton").click(function() {
			var ID = $(this).attr('id');
			if(inControl) {
				inControl = false;
				$(this).animate({scrollTop:0}, 500);							
			} else {
				inControl = true;
				$(this).animate({scrollTop:$(this)[0].scrollHeight}, 500);							
			}
		});
		$(".zoomButton").click(function() {
			$(".zoomButton").attr('id','');
			document.getElementById("theSVG").classList.remove("zoomedOut"+zoomVal*32);
			zoomVal = parseFloat($(this).html())*(1/32);
			document.getElementById("theSVG").classList.add("zoomedOut"+zoomVal*32);
			game.world.scale.setTo(zoomVal);
			game.camera.y = -dim[1]*(1-zoomVal);
			game.camera.x = -dim[0]*(1-zoomVal);
			$(this).attr('id','zoomSelected');
		});
		$(".speedButton").click(function() {
			$(".speedButton").attr('id','');
			speedVal = parseFloat($(this).html());
			$(this).attr('id','speedSelected');
		});
		//WIDTH 350 => 500 => 630
		$("body").css("background","#99dd99");
		$("#menuOverlay").addClass('inGameTransformMenuOverlay');
		$('#menuOverlay').html('<div style="position:absolute;display:block;width:350px;">' + this.loadMembers() + '</div><div style="position:absolute;left:350px;display:block;width:90px;">' + this.loadActions() + '</div><div style="position:absolute;left:510px;display:block;width:90px;">' + this.loadSubActions() + '</div>');
		$(".inGameMember").click(function(event) {
			var ID = $(this).attr('id');
			that.switchToPlayer(ID);
			if($(this).hasClass('inGameMemberSelected')) {
				$(".inGameMember").removeClass("inGameMemberSelected");
				$(".inGameAction").css('opacity',0);
				$(".inGameAction").css('transform','');
				$(".inGameSubAction").css('opacity',0);
				$(".inGameSubAction").css('transform','translateX(-40px)');
				curMember = null;
			} else {
				curMember = parseInt(ID);
				//Activate correct member
				$(".inGameMember").removeClass("inGameMemberSelected");
				$(this).addClass("inGameMemberSelected");
				//Make actions appear
				$(".inGameAction").css('opacity',1);
				$(".inGameAction").css('transform','translateX(40px)');
				//Reset action buttons to current conditions
				$(".inGameAction").each(function() {
					if(allPlayers[curMember].actionsOn.indexOf($(this).attr('title')) > -1) {
						$(this).addClass('inGameActionSelected');
					} else {
						$(this).removeClass('inGameActionSelected');
					}
				});
			}
		});
		//If an action is clicked - if it was already on, stop it - if it isn't on, turn it on!
		$(".inGameAction").click(function(event) {
			var which = $(this).attr('title');
			//Deselect
			if($(this).hasClass('inGameActionSelected')) {
				allPlayers[curMember].actionsOn.splice(allPlayers[curMember].actionsOn.indexOf(which),1);
				switch(which) {
					case '0':
						allPlayers[curMember].isSprinting = false;
					break;
					case '1':
						allPlayers[curMember].isDaredevil = false;
					break;
					case '2':
						allPlayers[curMember].isClinging = false;
					break;
					case '3':
						allPlayers[curMember].isButler = false;
					break;
					case '4':
						allPlayers[curMember].isLeading = false;	
					break;
					case '5':
						allPlayers[curMember].isGuiding = false;
					break;
				}
				$(this).removeClass('inGameActionSelected');
				$("#menuOverlay").css('width','500px');
				$(".inGameSubAction").css('opacity',0);
				$(".inGameSubAction").css('transform','translateX(-40px)');
			} else {
			//Select
				if(which == '0' || which == '4' || which == '5') {
					$("#menuOverlay").css('width','630px');
					$(".inGameSubAction").css('opacity',1);
					$(".inGameSubAction").css('transform','translateX(0px)');
					//Display available options for current action
					if(which == '5') {
						for(var a=0;a<6;a++) {
							if(a == curMember) {
								$("#inGameSub"+a).html(" X ");
							} else {
								$("#inGameSub"+a).html(allPlayers[a].myName);
							}

						}
						$(".inGameSubAction").click(function() {
							var ID = parseInt($(this).attr('title'));
							allPlayers[curMember].butlerTarget = allPlayers[ID];
						});
					} else if(which == '4') {
						var grades = ["Very slow","Slow","Keep tempo","Fast","Very fast","Top Speed"];
						for(var a=0;a<6;a++) {
							$("#inGameSub"+a).html(grades[a]);
						}
					} else if(which == '0') {
						var grades = ["Very slow","Slow","Normal","Fast","Very fast","Top Speed"];
						for(var a=0;a<6;a++) {
							$("#inGameSub"+a).html(grades[a]);
						}
					}
				} else {
					$("#menuOverlay").css('width','500px');
					$(".inGameSubAction").css('opacity',0);
					$(".inGameSubAction").css('transform','translateX(-40px)');
				}
				$(this).addClass('inGameActionSelected');
				allPlayers[curMember].actionsOn.push(which);
				switch(which) {
					case '0':
						allPlayers[curMember].isSprinting = true;
						for(var j=0;j<clingList.length;j++) {
							clingList[j].isSprinting = true;
							clingList[j].delayedTarget = allPlayers[curMember];
						}
						allPlayers[curMember].tryDir = 1;
					break;
					case '1':
						allPlayers[curMember].isDaredevil = true;
					break;
					case '2':
						allPlayers[curMember].isClinging = true;
					break;
					case '3':
						allPlayers[curMember].isButler = true;
						allPlayers[curMember].butlerTarget = allPlayers[curMember];
					break;
					case '4':
						allPlayers[curMember].isLeading = true;		
					break;
					case '5':
						allPlayers[curMember].isGuiding = true;
					break;
				}
			}
		});
		dim[0] = game.width*0.5;
		dim[1] = game.height*0.5;
		for(var i=0;i<predefinedSpecialSpots.length;i++) {
			var theType = predefinedSpecialSpots[i][3];
			var spriteType = '';
			if(theType == 'sprint') {
				spriteType = 'sprintLine';
			} else if(theType == 'hill') {
				spriteType = 'hillLine';
			} else if(theType == 'finish') {
				spriteType = 'finishLine';
			}
			var newS = game.add.sprite(0,0,spriteType);
			newS.artPos = [predefinedSpecialSpots[i][0],predefinedSpecialSpots[i][1]];
			newS.anchor.setTo(0.5,0.5);
			if(spriteType != 'finishLine') {
				newS.width = 500;
				newS.height = 30;				
			} else {
				newS.width = newS.height = 500;
			}
			newS.rotation = predefinedSpecialSpots[i][2]+Math.PI;
			newS.myType = theType;
			newS.myCnt = predefinedSpecialSpots[i][4];
			newS.myPoints = 20;
			finishLines[i] = newS;
		}

		var newP, dev;
		var startPos = 0;
		var teamCounter = -1;
		for(var i=0;i<48;i++) {
			dev = (i%5)*(400/5)-250;
			if(i%5 == 0 && i != 0) {
				startPos += 100;	
			}
			if(i%6 == 0) {
				teamCounter++;
			}
			var whichSprite = 'team'+teamCounter;
			//Assign special shirts
			if(ALLPART[i].yRank == 1) {
				whichSprite = 'yellow';
			} else if(ALLPART[i].gRank == 1){
				whichSprite = 'green';
			} else if(ALLPART[i].rRank == 1) {
				whichSprite = 'polka';
			} else if(ALLPART[i].wRank == 1) {
				whichSprite = 'white';
			}
			newP = game.add.sprite(dim[0]-dev,dim[1]-startPos,whichSprite);
			newP.myName = ALLPART[i].name;
			newP.artPos = [dim[0]-dev,10-startPos];
			newP.myIndex = i;
			newP.cnt = 0;
			newP.specialCnt = 0;
			newP.SPEED = 4;
			newP.dev = dev;
			//newP.autoCull = true;
			newP.food = 100;
			newP.water = 100;
			newP.energy = Math.random()*100;
			newP.anchor.setTo(0.5,0.5);
			newP.actionsOn = [];
			newP.rotation = (1/2)*Math.PI;
			newP.inputEnabled = true;
			newP.input.useHandCursor = true;
			newP.events.onInputDown.add(this.showText, this);
			newP.animations.add("sprint",[3,3,3,4,4,4],10);
			newP.myTarget = null;
			newP.inFront = newP.letGo = false;
			newP.tryDir = 1;
			newP.frontTime = 0;
			newP.myGroup = 0;
			newP.isSprinting = newP.isButler = newP.isClinging = newP.isLeading = newP.isGuiding = false;
			newP.supply = 10;
			newP.actionLine = ' - ';
			newP.finishedRace = false;
			newP.bodyInfo = [-Math.cos(Math.PI*0.5)*50+Math.sin(Math.PI*0.5)*35,-Math.sin(Math.PI*0.5)*50-Math.cos(Math.PI*0.5)*35,-Math.cos(Math.PI*0.5)*50-Math.sin(Math.PI*0.5)*35,-Math.sin(Math.PI*0.5)*50+Math.cos(Math.PI*0.5)*35,Math.cos(Math.PI*0.5)*50-Math.sin(Math.PI*0.5)*35,Math.sin(Math.PI*0.5)*50+Math.cos(Math.PI*0.5)*35,Math.cos(Math.PI*0.5)*50+Math.sin(Math.PI*0.5)*35,Math.sin(Math.PI*0.5)*50-Math.cos(Math.PI*0.5)*35];
			allPlayers.push(newP);
		}
		player = allPlayers[0];
		player.x = dim[0];
		player.y = dim[1];

		infoText = game.add.text(-10,-10,'', {align: 'center', font:"700 22px 'Oswald', sans-serif",fill:'#fff'});
		infoText.anchor.setTo(0.5,0.5);

		sortPlayers = allPlayers.slice(0);

		game.time.advancedTiming = true;

		that.setAllStats();

	},

	update: function() {
		//Go through all players and move them/set properties
		for(var i=0;i<allPlayers.length;i++) {
			var curP = allPlayers[i];
			if(curP.finishedRace) {
				continue;
			}
			curP.possDir = [0,0,0,0];
			//Collision checking against other cyclists. Performance improvements:
			//	=> Only calculate a player's body and hitBodies when they change
			//	=> Less lines of code (decreases readability, but should give a slight increase)
			//	=> Use lookup-table for sines & cosines (great performance increase, but rotation angles are limited to predefined ones)
			//	=> Continue the loop if the distance between the players is more than, say, 500
			for(var j=0;j<allPlayers.length;j++) {
				var a = allPlayers[j];
				if(i == j || this.dist3(curP,a) > 500) {
					continue;
				} else if(i != j && this.dist3(curP,a) < 30) {
					console.log("CRASH!");
				}
				var otherBody = [[a.x+a.bodyInfo[0],a.y+a.bodyInfo[1]],[a.x+a.bodyInfo[2],a.y+a.bodyInfo[3]],[a.x+a.bodyInfo[4],a.y+a.bodyInfo[5]],[a.x+a.bodyInfo[6],a.y+a.bodyInfo[7]]];
				var saveVal = [Math.sin(curP.rotation),Math.cos(curP.rotation)];
				var basePos = [curP.x-saveVal[1]*50,curP.y-saveVal[0]*50,curP.x+saveVal[1]*50,curP.y+saveVal[0]*50,curP.x+saveVal[1]*80,curP.y+saveVal[0]*80,curP.x-saveVal[1]*140,curP.y-saveVal[0]*140];
				var rectangles = [];
				rectangles[0] = [[basePos[0]+saveVal[0]*35,basePos[1]-saveVal[1]*35],[basePos[0]+saveVal[0]*25,basePos[1]-saveVal[1]*25],[basePos[2]+saveVal[0]*25,basePos[3]-saveVal[1]*25],[basePos[2]+saveVal[0]*35,basePos[3]-saveVal[1]*35]];
				rectangles[1] = [[basePos[2]+saveVal[0]*25,basePos[3]-saveVal[1]*25],[basePos[2]-saveVal[0]*25,basePos[3]+saveVal[1]*25],[basePos[4]-saveVal[0]*25,basePos[5]+saveVal[1]*25],[basePos[4]+saveVal[0]*25,basePos[5]-saveVal[1]*25]];
				rectangles[2] = [[basePos[0]-saveVal[0]*35,basePos[1]+saveVal[1]*35],[basePos[0]-saveVal[0]*25,basePos[1]+saveVal[1]*25],[basePos[2]-saveVal[0]*25,basePos[3]+saveVal[1]*25],[basePos[2]-saveVal[0]*35,basePos[3]+saveVal[1]*35]];
				rectangles[3] = [[basePos[6]-saveVal[0]*25,basePos[7]+saveVal[1]*25],[basePos[6]+saveVal[0]*25,basePos[7]-saveVal[1]*25],[basePos[0]+saveVal[0]*25,basePos[1]-saveVal[1]*25],[basePos[0]-saveVal[0]*25,basePos[1]+saveVal[1]*25]];
				if(curP.possDir[0] == 0 && this.rotOverlap(rectangles[0],otherBody)) {
					curP.possDir[0] = a;
				}
				if(curP.possDir[1] == 0 && this.rotOverlap(rectangles[1],otherBody)) {
					curP.possDir[1] = a;
				}
				if(curP.possDir[2] == 0 && this.rotOverlap(rectangles[2],otherBody)) {
					curP.possDir[2] = a;
				}
				if(curP.possDir[3] == 0 && this.rotOverlap(rectangles[3],otherBody)) {
					curP.possDir[3] = a;
				}
				if(curP.possDir[0] != 0 && curP.possDir[1] != 0 && curP.possDir[2] != 0 && curP.possDir[2] != 0) {
					break;
				}
			}

			/****** MAIN CODE - Regular movement or checking for all statusses and making their decisions *****/
			var devChange = 0;
			if(!(curP == player && inControl)) {
				if(curP.actionsOn.length < 1 && !curP.inFront && !curP.letGo) {
					devChange += Math.random()*0.4-0.2;
					curP.actionLine = 'Just trucking along';
				}


				if(curP.isGuiding && curP.butlerTarget != null) {
					//If we're not in front of our man...
					if(curP.butlerTarget.possDir[1] != curP && curP.butlerTarget.possDir[0] != curP && curP.butlerTarget.possDir[2] != curP) {
						curP.butlerTarget.letGo = false;
						curP.actionLine = 'Going to guide ' + curP.butlerTarget.myName;
						if(curP.stageRank > curP.butlerTarget.stageRank) {
							curP.isSprinting = true;
							curP.letGo = false;
						} else {
							curP.isSprinting = false;
							curP.letGo = true;
						}
						if(Math.abs(curP.stageRank - curP.butlerTarget.stageRank) < 5) {
							var sign = (curP.butlerTarget.dev - curP.dev) > 0 ? 1 : -1;
							devChange += sign*1.5;
						}
					} else {
					//If we are already close enough...
						curP.letGo = false;
						curP.myTarget = null;
						curP.actionLine = 'Guiding ' + curP.butlerTarget.myName;
						curP.butlerTarget.myTarget = curP;
						curP.butlerTarget.inFront = curP.butlerTarget.letGo = false;
					}
				}

				if(curP.inFront) {
					if(curP.frontTime >= 0 && (curGameTime - curP.frontTime) > 10) {
						curP.letGo = true;
						curP.inFront = false;
						curP.tryDir = 1;
					}
					curP.myTarget = sortPlayers[curP.stageRank-2];
					if(allGroups[curP.myGroup-1][1] == curP || curP.myTarget.letGo || curP.myTarget.isSprinting) {
						//ride own tempo, we're leading
						curP.SPEED = 4;
						curP.myTarget = null;
					}
					curP.actionLine = 'Cycling at the front';
				} else if(curP.letGo) {
					curP.myTarget = null;
					if(curP.possDir[3] != 0 && !curP.isGuiding) {
						curP.SPEED = curP.possDir[3].SPEED + 0.2;
						devChange += curP.tryDir*1.3;
					} else if(curP.stageRank == 48 || sortPlayers[curP.stageRank].myGroup != curP.myGroup || (Math.random() < 0.1 && curP.stageRank > 1 && sortPlayers[curP.stageRank-2].possDir[3] == 0)) {
						curP.letGo = false;
						curP.myTarget = sortPlayers[curP.stageRank-2];
					} else {
						//reduced speed
						curP.SPEED = 2;
					}
					curP.actionLine = 'Letting himself fall back';
				}

				if(curP.myTarget != null && curP.possDir[0] != curP.myTarget && curP.possDir[1] != curP.myTarget && curP.possDir[2] != curP.myTarget) {
					if(curP.stageRank > curP.myTarget.stageRank) {
						curP.SPEED = curP.myTarget.SPEED+0.4;								
					}
					sign = (curP.myTarget.dev - curP.dev) > 0 ? 1 : -1;
					devChange += sign;
				}

				if(curP.isSprinting) {
					curP.SPEED = 7;
					curP.inFront = curP.letGo = false;
					curP.myTarget = null;						
					devChange += curP.tryDir;
					curP.actionLine = 'Sprinting';
				}

				if(curP.isClinging && curP.delayedTarget != null) {
					curP.SPEED = 7.4;
					if(!curP.delayedTarget.isSprinting) {
						curP.isSprinting = false;
						curP.delayedTarget = null;
					}
					curP.actionLine = 'Clinging to a new attack!';
				}

				if(curP.isButler) {
					if(curP.possDir[0] == curP.butlerTarget || curP.possDir[1] == curP.butlerTarget || curP.possDir[2] == curP.butlerTarget || curP.butlerTarget == curP) {
						curP.actionLine = 'Giving supplies to ' + curP.butlerTarget;
						curP.supply--;
						curP.butlerTarget.food = 100;
						curP.butlerTarget.water = 100;
						if(curP.supply > 0) {
							//find next target
							for(var j=0;j<6;j++) {
								if(j != curP.myIndex && allPlayers[j].food < 100) {
									curP.butlerTarget = allPlayers[j];
								}
							}
						} else {
							//get some new supplies
						}
					} else {
						curP.actionLine = 'Bringing supplies to ' + curP.butlerTarget.myName;
						if(curP.stageRank > curP.butlerTarget.stageRank) {
							curP.isSprinting = true;
							curP.letGo = false;
						} else {
							curP.isSprinting = false;
							curP.letGo = true;
						}
						if(Math.abs(curP.stageRank - curP.butlerTarget.stageRank) < 5) {
							var sign = (curP.butlerTarget.dev - curP.dev) > 0 ? 1 : -1;
							devChange += sign*1.5;
						}
					}
				}

				if(curP.isLeading) {
					if(allGroups[curP.myGroup-1][1] == curP) {
						curP.frontTime = curGameTime;
						curP.SPEED = 4.3;
						curP.isSprinting = false;
						curP.actionLine = 'Leading ' + allGroups[curP.myGroup-1][0];
					} else {
						curP.SPEED = 5.5;
						curP.isSprinting = true;
						curP.actionLine = 'Getting to the front of ' + allGroups[curP.myGroup-1][0];
					}
				}
			} else {
				curP.actionLine = 'Being controlled by you';
				curP.letGo = true;
				if(game.input.keyboard.isDown(Phaser.Keyboard.LEFT)) {
					devChange = 3;
				} else if(game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
					devChange = -3;
				}
				if(game.input.keyboard.isDown(Phaser.Keyboard.UP)) {
					curP.SPEED += 0.1;
				} else if(game.input.keyboard.isDown(Phaser.Keyboard.DOWN)) {
					curP.SPEED -= 0.1;
				}
			}

			//If something is in front of us, automatically slow down to their speed
			if(curP.possDir[1] != 0) {
				if(curP.tryDir == 0) {
					curP.tryDir = 1;
				}
				if(curP.SPEED > curP.possDir[1].SPEED) {
					if(curP.possDir[1].letGo) {
						devChange += curP.tryDir;
					}
					curP.SPEED = curP.possDir[1].SPEED;										
				}
				curP.inFront = curP.letGo = false;
			} else  {
				if(!curP.letGo) {
					curP.tryDir = 0;					
				}
				if(!curP.letGo && !curP.inFront && !curP.isSprinting && !curP.isButler) {
					curP.inFront = true;
					curP.frontTime = curGameTime;
				}
			}
			//If there's something (or boundPoints bound) to our left => can't move there, try another direction
			if(curP.possDir[0] != 0 || (curP.dev+devChange) <= -250) {
				devChange = this.clamp(devChange,0,250);
				if(curP.tryDir == -1) {
					curP.tryDir = 1;
				}
			}
			//If there's something (or boundPoints bound) to our right => can't move there, try another direction
			if(curP.possDir[2] != 0 || (curP.dev+devChange) >= 250) {
				devChange = this.clamp(devChange,-250,0);
				if(curP.tryDir == 1) {
					curP.tryDir = -1;
				}
			}

			//Cap off deviation, calculate new artPos and set {x,y} values according to selected player
			if(devChange != 0) {
				curP.dev = this.clamp(curP.dev+devChange,-250,250);
				curP.artPos[0] -= Math.sin(boundPoints[curP.cnt][3])*devChange;
				curP.artPos[1] += Math.cos(boundPoints[curP.cnt][3])*devChange;
			}
			curP.SPEED = this.clamp(curP.SPEED,0,10);
			var abs = this.dist(curP);
			curP.artPos[0] -= (curP.artPos[0]-boundPoints[curP.cnt][0]+Math.sin(boundPoints[curP.cnt][3])*curP.dev)/abs*curP.SPEED*speedVal;
			curP.artPos[1] -= (curP.artPos[1]-boundPoints[curP.cnt][1]-Math.cos(boundPoints[curP.cnt][3])*curP.dev)/abs*curP.SPEED*speedVal;
			if(curP != player) {
				curP.x = dim[0]+(curP.artPos[0]-player.artPos[0]);
				curP.y = dim[1]+(curP.artPos[1]-player.artPos[1]);
			}

			//Showing the proper animations, updating rotation
			if(curP.cnt > 0) {
				if(curP.isSprinting) {
					curP.animations.play("sprint");		
				} else {
					curP.frame = 0;
					curP.animations.stop();
				}	
				if(Math.abs(boundPoints[curP.cnt-1][3] - curP.rotation) > 0.0125) {
					if(curP.isDaredevil) {
						curP.bodyInfo = [-Math.cos(boundPoints[curP.cnt-1][3])*20+Math.sin(boundPoints[curP.cnt-1][3])*35,-Math.sin(boundPoints[curP.cnt-1][3])*20-Math.cos(boundPoints[curP.cnt-1][3])*35,-Math.cos(boundPoints[curP.cnt-1][3])*20-Math.sin(boundPoints[curP.cnt-1][3])*35,-Math.sin(boundPoints[curP.cnt-1][3])*20+Math.cos(boundPoints[curP.cnt-1][3])*35,Math.cos(boundPoints[curP.cnt-1][3])*20-Math.sin(boundPoints[curP.cnt-1][3])*35,Math.sin(boundPoints[curP.cnt-1][3])*20+Math.cos(boundPoints[curP.cnt-1][3])*35,Math.cos(boundPoints[curP.cnt-1][3])*20+Math.sin(boundPoints[curP.cnt-1][3])*35,Math.sin(boundPoints[curP.cnt-1][3])*20-Math.cos(boundPoints[curP.cnt-1][3])*35];
					} else {
						curP.bodyInfo = [-Math.cos(boundPoints[curP.cnt-1][3])*50+Math.sin(boundPoints[curP.cnt-1][3])*35,-Math.sin(boundPoints[curP.cnt-1][3])*50-Math.cos(boundPoints[curP.cnt-1][3])*35,-Math.cos(boundPoints[curP.cnt-1][3])*50-Math.sin(boundPoints[curP.cnt-1][3])*35,-Math.sin(boundPoints[curP.cnt-1][3])*50+Math.cos(boundPoints[curP.cnt-1][3])*35,Math.cos(boundPoints[curP.cnt-1][3])*50-Math.sin(boundPoints[curP.cnt-1][3])*35,Math.sin(boundPoints[curP.cnt-1][3])*50+Math.cos(boundPoints[curP.cnt-1][3])*35,Math.cos(boundPoints[curP.cnt-1][3])*50+Math.sin(boundPoints[curP.cnt-1][3])*35,Math.sin(boundPoints[curP.cnt-1][3])*50-Math.cos(boundPoints[curP.cnt-1][3])*35];
					}
					if(boundPoints[curP.cnt-1][3] > curP.rotation) {
						curP.rotation += 0.015625*Math.PI*speedVal;
						curP.frame = 1;		
					} else if(boundPoints[curP.cnt-1][3] < curP.rotation) {
						curP.rotation -= 0.015625*Math.PI*speedVal;
						curP.frame = 2;
					}
				}
			}
			//Increasing the count if you hit another boundPoint
			if(abs < curP.SPEED*speedVal) {
				curP.cnt++;
				if(curP.cnt == finishLines[curP.specialCnt].myCnt && (finishLines.length-1) > curP.specialCnt) {
					var a = finishLines[curP.specialCnt];
					var b = a.myPoints;
					if(b > 0) {
						if(b >= 16) {
							specialEvents.push([curP.myIndex,b,a.myType]);
						}
						if(a.myType == 'sprint') {
							ALLPART[curP.myIndex].gPoints += b;
						} else if(a.myType == 'hill') {
							ALLPART[curP.myIndex].rPoints += b;
						}
						a.myPoints -= 2;
					}
					curP.specialCnt++;
				}
				//If we've reached the end of the stage
				if(curP.cnt == endOfStage+2) {
					//We're the first one finishing
					if(positions.length < 1) {
						firstOneFinished = true;
						document.getElementById('extraInfoOverlay').innerHTML = '';
					}
					//Style stuff and display stage rankings
					var extraStyling = '';
					if(positions.length%2 == 0) {
						extraStyling = 'class="alternateBG"';
					}
					positions.push([curP.myIndex,curGameTime]);
					$("#extraInfoOverlay").append("<div " + extraStyling + " style='width:80%;padding:10px;'>" + positions.length + ". " + ALLPART[curP.myIndex].shortName + " <span style='float:right;'>" + reFormat(curGameTime) + "</span></div>");
					if(positions.length == 48) {
						game.state.start("EndMain");
					}
				//If we've reached the end of this level, remove and stop updating ourselves
				} else if(curP.cnt == endOfStage+5) {
					curP.kill();
					curP.finishedRace = true;
				}
				curP.food -= Math.random();
				curP.water -= Math.random();
			}
		}
		for(var i=0;i<finishLines.length;i++) {
			var a = finishLines[i];
			a.x = dim[0]+(a.artPos[0]-player.artPos[0]);
			a.y = dim[1]+(a.artPos[1]-player.artPos[1]);
		}
		//Counter to redraw only at something like 20FPS
		counter += 0.017;
		curGameTime += 0.017*speedVal;
		updateCounter += 0.017*speedVal;
		if(updateCounter > 1.85) {
			updateCounter = 0;
			this.setAllStats();
		}
		if(counter > 0.05) {
			this.drawInView();
			counter=0;			
		}
	},

	//a & b in format [[x,y],[x,y],[x,y],[x,y]]
	//				     UR    UL    LL    LR
	rotOverlap: function(a,b) {
		var axes = [[a[0][0] - a[1][0],a[0][1] - a[1][1]],[a[0][0] - a[3][0],a[0][1] - a[3][1]],[b[1][0] - b[2][0],b[1][1] - b[2][1]],[b[1][0] - b[0][0],b[1][1] - b[0][1]]];
		var maxA,maxB,minA,minB;
		for(var i=0;i<4;i++) {
			var projections = [];
			for(var j=0;j<4;j++) {
				projections[j] = [this.project(a[j],axes[i])*axes[i][0],this.project(a[j],axes[i])*axes[i][1]];
				projections[j] = projections[j][0]*axes[i][0]+projections[j][1]*axes[i][1];
				if(j==0) {
					maxA = minA = projections[j];
				} else {
					maxA = Math.max(projections[j],maxA);
					minA = Math.min(projections[j],minA);
				}
			}
			for(var j=0;j<4;j++) {
				projections[j+4] = [this.project(b[j],axes[i])*axes[i][0],this.project(b[j],axes[i])*axes[i][1]];	
				projections[j+4] = projections[j+4][0]*axes[i][0]+projections[j+4][1]*axes[i][1];
				if(j==0) {
					maxB = minB = projections[j+4];
				} else {
					maxB = Math.max(projections[j+4],maxB);
					minB = Math.min(projections[j+4],minB);	
				}				
			}
			if(!(minB <= maxA && maxB >= minA)) {
				return false;
			}
		}
		return true;
	},

	project: function(a,b) {
		return (a[0]*b[0]+a[1]*b[1])/(b[0]*b[0]+b[1]*b[1]);
	},

	clamp: function(a,b,c) {
		if(a <= b) {
			return b;
		} else if(a >= c) {
			return c;
		} else {
			return a;
		}
	},

	setAllStats: function() {
		var that = this;
		//Sort players so we can check where everybody is in a stage
		sortPlayers.sort(function(a,b) {
			if(a.cnt < b.cnt) {
				return 1;
			} else if(a.cnt > b.cnt) {
				return -1;
			} else {
				if(that.dist(a) < that.dist(b)) {
					return -1;
				} else {
					return 1;
				}
			}
		});
		allGroups = [];
		var currentGroup = 1;
		allGroups.push(['GROUP #1',sortPlayers[0],1]);
		sortPlayers[0].myGroup = 1;
		sortPlayers[0].stageRank = 1;
		var tempVel = 0;
		tempVel += sortPlayers[0].SPEED;
		clingList = [];
		for(var i=1;i<sortPlayers.length;i++) {
			tempVel += sortPlayers[i].SPEED;
			if(sortPlayers[i].isClinging) {
				clingList.push(sortPlayers[i]);
			}
			var curP = sortPlayers[i];
			curP.stageRank = i+1;
			if(Math.abs(curP.cnt-sortPlayers[i-1].cnt) > 3) {
				currentGroup++;
				allGroups.push(['GROUP #'+currentGroup,curP,0]);
			}
			allGroups[currentGroup-1][2]++;
			curP.myGroup = currentGroup;
		}
		averageVel = Math.round( (averageVel+tempVel)*0.02083*100 )/10;
		var temp = '';
		var timeDif;
		for(var i=allGroups.length-1;i>=0;i--) {
			if(allGroups.length > 1 && i != 0) {
				timeDif = (allGroups[i][1].cnt-allGroups[i-1][1].cnt)*5 + ' s';
			} else {
				timeDif = 'Tête';
			}
			var extraStyling = '';
			if(curPlayerSelected != null && i == (curPlayerSelected.myGroup-1)) {
				extraStyling = 'curGroupBox';
			}
			temp += '<div class="groupBox ' + extraStyling + '" title="' + i + '">' + allGroups[i][0] + '<br/>' + timeDif + '<br/>' + allGroups[i][2] + '</div>';
		}
		if(temp != $("#groupDisplay").html()) {
			document.getElementById('groupDisplay').innerHTML = temp;
		}

		$(".groupBox").click(function() {
			var ID = parseInt($(this).attr('title'));
			that.updateCurrentSelection(allGroups[ID][1]);
		});

		document.getElementById("curPosLinePath").setAttribute('y1',player.artPos[1]*scaleF);
		document.getElementById("curPosLinePath").setAttribute('y2',player.artPos[1]*scaleF);

		document.getElementById("needsUpdating").innerHTML = reFormat(curGameTime) + " | " + averageVel + " km/u";

		//Set stats for every member, and update their dot on the minimap
		for(var i=0;i<6;i++) {
			document.getElementById('nameSpaceMember'+i).innerHTML = TEAM[i].shortName + ' (#' + allPlayers[i].stageRank + ')';
			$('#waterBottle'+i).css('clip','rect(' + (40-allPlayers[i].water*0.01*40) + 'px,40px,40px,0px)');
			$('#hamBurger'+i).css('clip','rect(' + (40-allPlayers[i].food*0.01*40) + 'px,40px,40px,0px)');
			document.getElementById('energyMember'+i).innerHTML = Math.round(allPlayers[i].energy);
			document.getElementById('speedMember'+i).innerHTML = Math.round(allPlayers[i].SPEED*10) + ' mph';
			document.getElementById('lineMember'+i).innerHTML = allPlayers[i].actionLine;
			document.getElementById('distanceMember'+i).innerHTML = Math.round(allPlayers[i].cnt/partLength*10)/10 + " km";

			document.getElementById('memberDot'+i+'').setAttribute('cx',allPlayers[i].artPos[0]*scaleF+minimapOffset);
			document.getElementById('memberDot'+i+'').setAttribute('cy',allPlayers[i].artPos[1]*scaleF);
		}
	},

	dist: function(curP) {
		return Math.sqrt(Math.pow(curP.artPos[0]-boundPoints[curP.cnt][0]+Math.sin(boundPoints[curP.cnt][3])*curP.dev,2)+Math.pow(curP.artPos[1]-boundPoints[curP.cnt][1]-Math.cos(boundPoints[curP.cnt][3])*curP.dev,2));
	},

	dist3: function(curP,prevP) {
		return Math.sqrt(Math.pow(curP.x-prevP.x,2)+Math.pow(curP.y-prevP.y,2));
	},

	switchToPlayer: function(a) {
		player = allPlayers[a];
		this.showText(player,null);
		player.x = dim[0];
		player.y = dim[1];
	},

	drawInView: function() {
		var d = '';
		var lowerMax = player.cnt-5*(1/zoomVal);
		if(lowerMax < 0) {
			lowerMax = 0;
		}
		var upperMax = player.cnt+5*(1/zoomVal);
		if(upperMax > boundPoints.length-1) {
			upperMax = boundPoints.length-1;
		}
		d = "M" + (road[lowerMax][0]-player.artPos[0]+dim[0]*(1/zoomVal)) + " " + (road[lowerMax][1]-player.artPos[1]+dim[1]*(1/zoomVal));
		for(var i=lowerMax+1;i<upperMax;i++) {
			d += "L" + (road[i][0]-player.artPos[0]+dim[0]*(1/zoomVal)) + " " + (road[i][1]-player.artPos[1]+dim[1]*(1/zoomVal));
		}

		document.getElementById("thePath").setAttribute('d',d);
		document.getElementById("theStrokes").setAttribute('d',d);

		if(curPlayerSelected != null) {
			infoText.x = curPlayerSelected.x;
			infoText.y = curPlayerSelected.y-40;
			infoText.text = curPlayerSelected.myName;
			glowCyclist.x = curPlayerSelected.x;
			glowCyclist.y = curPlayerSelected.y;
			glowCyclist.rotation = curPlayerSelected.rotation;
		}
	},

	shutdown: function() {
		counter = updateCounter = curGameTime = 0;
		allPlayers = [];
		dim = [];
		allGroups = [];
		clingList = [];
		finishLines = [];
		zoomVal = speedVal = 1;
		curPlayerSelected = curMember = player = glowCyclist = infoText = null;
		inControl = firstOneFinished = false;
		$("#controlButtonOverlay").css('display','none');
		$("#extraInfoOverlay").html('');
		$("#extraInfoOverlay").css('display','none');
		$("#groupDisplay").html('');
		$("#groupDisplay").css('display','none');
		$("#miniMapContainer").css('display','none');
		$("#menuOverlay").html('');
		$("#menuOverlay").css('width','100%');
		$("#topInfoOverlay").css('display','none');
		document.getElementById("menuOverlay").classList.remove("inGameTransformMenuOverlay");
		document.getElementById("thePath").setAttribute("d","");
		document.getElementById("theStrokes").setAttribute("d","");
		$("body").css("background-color","#333");
		lastStageSelected = 0;
		curTabOpen = "";
		curMemberSelected = null;
		boundPoints = [];
		predefinedSpecialSpots = [];
		scaleF = minimapOffset = endOfStage = 0;
	}
};
