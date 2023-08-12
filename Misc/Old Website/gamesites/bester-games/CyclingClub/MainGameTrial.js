Scene.MainGameTrial = function(game) {
	this.results = [];
	this.weArePlaying = false;
	this.ourTurn = false;
	this.overallCounter = 0;
	this.abs = 0;
	this.moraleRewards = [20,17,14,12,10,8,6,4,2,1];
};

Scene.MainGameTrial.prototype = {

	render: function() {
		var curP = player;
		game.debug.text("FPS: " + game.time.fps,20,20);
		/*if(player != null && player != undefined) {
			//console.log((dim[0]+boundPoints[curP.cnt][0]+Math.sin(boundPoints[curP.cnt][3])*curP.dev-curP.artPos[0]) + " -- "+ (dim[1]+boundPoints[curP.cnt][1]-Math.cos(boundPoints[curP.cnt][3])*curP.dev-curP.artPos[1]));
			game.debug.geom(new Phaser.Point(dim[0]+boundPoints[curP.cnt][0]+Math.sin(boundPoints[curP.cnt][3])*curP.dev-curP.artPos[0],dim[1]+boundPoints[curP.cnt][1]-Math.cos(boundPoints[curP.cnt][3])*curP.dev-curP.artPos[1]), 'red' ) ;
			game.debug.text("DEV: " + Math.round(player.dev) + " - " + player.cnt + " - " + this.dist(player),game.width-250,40);
		}*/
	},

	getWeather: function() {
		var weatherString = WEATHER[0] + " &nbsp;";
		if(WEATHER[1] > 28) {
			weatherString += '<span style="color:orange;">' + WEATHER[1] + '</span>';
		} else {
			weatherString += WEATHER[1];
		}
		weatherString += " °C &nbsp;";
		windSpeed = WEATHER[2]*3.6;
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
		$('#controlButtonOverlay').append('<br><br><div id="playerInfo"></div>');
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

		game.time.advancedTiming = true;

		sortPlayers = ALLPART.slice(0);
		sortPlayers.sort(function(a,b) {
			if(a.yPoints < b.yPoints) {
				return -1;
			} else {
				return 1;
			}
			return 0;
		});

		counter = 1.2;

	},

	update: function() {
		if(!this.weArePlaying) {
			if(!this.ourTurn) {
				counter += 0.017;
			}
			if(counter > 1) {
				var temp = '';
				//Make up some player results
				if(TEAM.indexOf(sortPlayers[this.overallCounter]) < 0) {
					this.ourTurn = false;
					//Result is slowest possible result - his time trial ability * some randomness
					var result = ((estimates[0]*500) + (estimates[1]*62.5))/(2.5 + parseInt(sortPlayers[this.overallCounter].timeTrial)*(3/200))/180;
					this.results.push([sortPlayers[this.overallCounter],result]);
					//Set player stats based on result, as this will not change anyway
					sortPlayers[this.overallCounter].fitness = this.clamp(sortPlayers[this.overallCounter].fitness-Math.random()*25+25,0,100);
					var ind = sortPlayers[this.overallCounter].myIndex;
					TEAMNAMES[Math.floor(ind/6)][2] = parseInt(TEAMNAMES[Math.floor(ind/8)][2])+parseInt(result);
					sortPlayers[this.overallCounter].yPoints = parseInt(sortPlayers[this.overallCounter].yPoints) + result;
					this.results.sort(function(a,b) {
						if(a[1] < b[1]) {
							return -1;
						} else {
							return 1;
						}
						return 0;
					});
					this.overallCounter++;
				} else {
					var that = this;
					temp += "<div id='endContinueButton'>Start Race &nbsp;>></div>";
					this.ourTurn = true;
				}
				temp += "<div style='margin:auto;width:1000px;' class='stageResults'><h1 style='text-align:center;'>Temporary Results</h1><table width='100%' cellpadding='10'>";
				for(var i=0;i<this.results.length;i++) {
					var extraStyling = '';
					var curP = this.results[i][0];
					var theName;
					if(curP.myIndex < 6) {
						theName = '<b style="color:rgba(255,158,180,1);">' + curP.name + '</b>';
					} else {
						theName = curP.name;
					}
					if(i%2 == 0) {
						extraStyling = 'class="alternateBG"';
					}
					if(i == 0) {
						temp += "<tr " + extraStyling + " style='transform:scale(1.3);'><td>" + (i+1) + ". </td><td>" + theName + "</td><td style='text-align:right;'>" + reFormat(this.results[i][1]) + "</td></tr>";
					} else {
						temp += "<tr " + extraStyling + "><td>" + (i+1) + ". </td><td>" + theName + "</td><td style='text-align:right;'><span style='float:left;font-size:28px;color:#AAA;'>(+" + reFormat(this.results[i][1]-this.results[0][1]) + ")</span>" + reFormat(this.results[i][1]) + "</td></tr>";
					}
				}
				if(this.overallCounter >= 48) {
					temp += '<div id="endContinueButton">Continue Tour &nbsp;>></div>';
					counter = 0;
					this.ourTurn = true;
				} else {
					var curP = sortPlayers[this.overallCounter];
					if(curP.myIndex < 6) {
						theName = '<b style="color:rgba(255,158,180,1);">' + curP.name + '</b>';
					} else {
						theName = curP.name;
					}
					temp += "<tr><td>" + (this.results.length+1) + ". </td><td><i> - It's " + theName + "'s turn now - </i></td><td style='text-align:center;'> ? </td></tr>";
				}
				temp += "</table></div>";
				$("#menuOverlay").html(temp);
				var that = this;
				$("#endContinueButton").click(function() { 
					if(that.overallCounter >= 48) {
						//Finish stage
						game.state.start('MainHub');
					} else {
						that.initializePlayer();						
					}
				});
				counter = 0;
			}
		} else {
			var curP = player;
			curP.frame = 0;
			if(game.input.keyboard.isDown(Phaser.Keyboard.LEFT)) {
				curP.rotation += 0.015625*Math.PI*speedVal*(curP.SPEED*0.05)*3;
				curP.frame = 1;	
			} else if(game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
				curP.rotation -= 0.015625*Math.PI*speedVal*(curP.SPEED*0.05)*3;
				curP.frame = 2;
			}
			if(game.input.keyboard.isDown(Phaser.Keyboard.UP)) {
				curP.SPEED += 0.1;
			} else if(game.input.keyboard.isDown(Phaser.Keyboard.DOWN)) {
				curP.SPEED -= 0.1;
			}
			if(curP.energy <= 1) {
				curP.SPEED = this.clamp(curP.SPEED,0,curP.maxSpeed*0.2);				
			} else {
				curP.SPEED = this.clamp(curP.SPEED,0,curP.maxSpeed);
			}
			/*if(this.abs != 0) {
				curP.artPos[0] -= (curP.artPos[0]-boundPoints[curP.cnt][0]+Math.sin(boundPoints[curP.cnt][3])*curP.dev)/this.abs*curP.SPEED*speedVal;
				curP.artPos[1] -= (curP.artPos[1]-boundPoints[curP.cnt][1]-Math.cos(boundPoints[curP.cnt][3])*curP.dev)/this.abs*curP.SPEED*speedVal;
			}*/
			if(curP.dev > 250) {
				console.log("GAME OVERRR");
			}
			curP.artPos[0] += Math.cos(curP.rotation)*curP.SPEED*3;
			curP.artPos[1] += Math.sin(curP.rotation)*curP.SPEED*3;

			if(curP.cnt>0) {
				curP.dev = this.getDev();				
			}
			this.abs = this.getDist();

			//Showing the proper animations, updating rotation
			/*if(curP.cnt > 0) {
				if(curP.isSprinting) {
					curP.animations.play("sprint");		
				} else {
					curP.frame = 0;
					curP.animations.stop();
				}	
				if(Math.abs(boundPoints[curP.cnt-1][3] - curP.rotation) > 0.0125) {
					if(boundPoints[curP.cnt-1][3] > curP.rotation) {
						curP.rotation += 0.015625*Math.PI*speedVal;
						curP.frame = 1;		
					} else if(boundPoints[curP.cnt-1][3] < curP.rotation) {
						curP.rotation -= 0.015625*Math.PI*speedVal;
						curP.frame = 2;
					}
				}
			}*/
							//Energy deduction/recovery
				curP.energy -= 0.000008*Math.pow(1.1,curP.SPEED*10)*(0.75+(0.5-ALLPART[curP.myIndex].timeTrial/400));
				curP.energy -= 0.000008*Math.pow(1.1,curP.SPEED*10)*(windSpeed)*(0.75+(0.5-ALLPART[curP.myIndex].resistance/400));
				if(curP.SPEED <= 3) {
					curP.energy += 0.0034*(ALLPART[curP.myIndex].recovery/200*10+2);
				}
				curP.energy = this.clamp(curP.energy,0,200);
			//Increasing the count if you hit another boundPoint
			if(this.abs < (curP.SPEED*speedVal)*10) {
				//Increase cnt
				curP.cnt++;
				//If we've finished, save our results
				if(curP.cnt == endOfStage+2) {
					this.results.push([sortPlayers[this.overallCounter],curGameTime]);
					sortPlayers[this.overallCounter].fitness = this.clamp(sortPlayers[this.overallCounter].fitness-(1-curP.energy/200)*50,0,100);
					var ind = curP.myIndex;
					TEAMNAMES[Math.floor(ind/6)][2] = parseInt(TEAMNAMES[Math.floor(ind/8)][2])+parseInt(curGameTime);
					sortPlayers[this.overallCounter].yPoints = parseInt(sortPlayers[this.overallCounter].yPoints) + curGameTime;
				//If we've reached the end of this level, remove and stop updating ourselves => switch back to overview of time trial
				} else if(curP.cnt == endOfStage+3) {
					curP.destroy();
					$("#menuOverlay").css('display','block');

					this.overallCounter++;
					this.weArePlaying = false;
					counter = 0;
					this.ourTurn = false;
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
			updateCounter += 0.017;
			if(updateCounter >= 1.85) {
				this.setAllStats();
			}
			if(counter > 0.03) {
				this.drawInView();
				counter=0;			
			}
		}
	},

	setPlayerStats: function() {
		$("#playerInfo").html('<div style="width:235px;border-right:1px dashed gray;float:left;"><span style="font-size:36px;">' + player.myName + '</span><br/><span style="font-size:70px;" id="ENERGY">000</span></div><div style="text-align:right;padding-right:5px;"><span id="SPEED">42 mph</span><br/><img src="FitBar.png" style="width:' + 0.3*player.fitness + '%;height:10px;"/><img src="MoraleBar.png" style="height:10px;width:' + 0.3*player.morale + '%;position:relative;top:-20px;"/><br/><span style="text-align:right;padding-right:5px;" id="DISTANCE">0 km</span></div>');
	},

	getDist: function() {
		var pPos = [player.artPos[0],player.artPos[1]];
		var aPos = [boundPoints[player.cnt][0],boundPoints[player.cnt][1]];
		var bPos = [boundPoints[player.cnt][0]+Math.sin(boundPoints[player.cnt][3])*10,boundPoints[player.cnt][1]-Math.cos(boundPoints[player.cnt][3])*10];
		var lambda = ((bPos[0]-aPos[0])*(pPos[0]-aPos[0]) + (bPos[1]-aPos[1])*(pPos[1]-aPos[1]))/(Math.pow((bPos[0]-aPos[0]),2)+Math.pow((bPos[1]-aPos[1]),2));
		return Math.sqrt(Math.pow((pPos[0]-aPos[0]-lambda*(bPos[0]-aPos[0])),2)+Math.pow((pPos[1]-aPos[1]-lambda*(bPos[1]-aPos[1])),2));
	},

	getDev: function() {
		var pPos = [player.artPos[0],player.artPos[1]];
		var aPos = [boundPoints[player.cnt-1][0],boundPoints[player.cnt-1][1]];
		var bPos = [boundPoints[player.cnt][0],boundPoints[player.cnt][1]];
		var lambda = ((bPos[0]-aPos[0])*(pPos[0]-aPos[0]) + (bPos[1]-aPos[1])*(pPos[1]-aPos[1]))/(Math.pow((bPos[0]-aPos[0]),2)+Math.pow((bPos[1]-aPos[1]),2));
		return Math.sqrt(Math.pow((pPos[0]-aPos[0]-lambda*(bPos[0]-aPos[0])),2)+Math.pow((pPos[1]-aPos[1]-lambda*(bPos[1]-aPos[1])),2));
	},

	initializePlayer: function() {
		curGameTime = 0;

		var newP = game.add.sprite(dim[0],dim[1],'team0');
		newP.myName = sortPlayers[this.overallCounter].name;
		newP.fitness = sortPlayers[this.overallCounter].fitness;
		newP.morale = sortPlayers[this.overallCounter].morale;
		newP.artPos = [dim[0],10];
		newP.myIndex = this.overallCounter;
		newP.cnt = 0;
		newP.specialCnt = 0;
		newP.SPEED = 1;
		newP.dev = 0;
		newP.energy = 200;
		newP.maxSpeed = (sortPlayers[this.overallCounter].speed/200)*2.5+5;
		newP.anchor.setTo(0.5,0.5);
		newP.rotation = (1/2)*Math.PI;
		newP.animations.add("sprint",[3,3,3,4,4,4],10);
		newP.finishedRace = false;

		player = newP;

		$("#menuOverlay").css('display','none');
		this.weArePlaying = true;

		this.setPlayerStats();

		var OBJ = sortPlayers[this.overallCounter];
		document.getElementById('extraInfoOverlay').innerHTML = playerInfoSmall(OBJ);
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
		document.getElementById("curPosLinePath").setAttribute('y1',player.artPos[1]*scaleF);
		document.getElementById("curPosLinePath").setAttribute('y2',player.artPos[1]*scaleF);

		document.getElementById("needsUpdating").innerHTML = reFormat(curGameTime);

		document.getElementById('ENERGY').innerHTML = Math.round(player.energy);
		document.getElementById('SPEED').innerHTML = Math.round(player.SPEED*10) + ' mph';
		document.getElementById('DISTANCE').innerHTML = Math.round(player.cnt/partLength*10)/10 + " km";

		document.getElementById('memberDot0').setAttribute('cx',player.artPos[0]*scaleF+minimapOffset);
		document.getElementById('memberDot0').setAttribute('cy',player.artPos[1]*scaleF);
	},

	dist: function(curP) {
		return Math.sqrt(Math.pow(dim[0]+boundPoints[curP.cnt][0]+Math.sin(boundPoints[curP.cnt][3])*curP.dev-curP.artPos[0]-player.x,2)+Math.pow(dim[1]+boundPoints[curP.cnt][1]-Math.cos(boundPoints[curP.cnt][3])*curP.dev-curP.artPos[1]-player.y,2));
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
	},

	shutdown: function() {
		var winningPrizes = [8000,6000,4000,3000,2000,1000,900,800,700,600,500,400,300,250,250,200,200,200,100,100];
		sortPlayers.sort(function(a,b) {
			if(a.yPoints < b.yPoints) {
				return -1;
			} else {
				return 1;
			}
			return 0;
		});
		var newsItem = ["Stage " + CURSTAGE[0]+1 + " Results!",''];
		newsItem[1] += "This stage was won by " + sortPlayers[0].name + ". ";
		if(sortPlayers[0].myIndex < 6) {
			PAYHISTORY.unshift([sortPlayers[0].myIndex,"Held the yellow jersey after stage " + CURSTAGE[0]+1,"$ 350"]);
			MONEY += 350;
		}
		for(var i=0;i<sortPlayers.length;i++) {
			if(i <= 20) {
				if(sortPlayers[i].myIndex < 6) {
					PAYHISTORY.unshift([sortPlayers[i].myIndex,"Came in " + this.createString(i+1) + ' at stage ' + (CURSTAGE[0]+1),"$ " + winningPrizes[i]]);
					MONEY += winningPrizes[i];
				}
			}
			RANKINGS[0][i] = sortPlayers[i].myIndex;
			if(i <= 10) {
				sortPlayers[i].morale = this.clamp(sortPlayers[i].morale+this.moraleRewards[i],0,100);				
			} else if(i >= 40) {
				sortPlayers[i].morale = this.clamp(sortPlayers[i].morale-20,0,100);
			}
			sortPlayers[i].yRank = (i+1);
		}
		NEWS.unshift(newsItem);

		counter = curGameTime = updateCounter = 0;
		finishLines = [];
		zoomVal = speedVal = 1;
		player = null;
		$("#controlButtonOverlay").css('display','none');
		$("#extraInfoOverlay").html('');
		$("#extraInfoOverlay").css('display','none');
		$("#miniMapContainer").css('display','none');
		$("#menuOverlay").html('');
		$("#menuOverlay").css('width','100%');
		$("#menuOverlay").css('display','block');
		$("#menuOverlay").css('background-color','transparent');
		$("#topInfoOverlay").css('display','none');
		document.getElementById("thePath").setAttribute("d","");
		document.getElementById("theStrokes").setAttribute("d","");
		$("body").css("background-color","#333");
		lastStageSelected = 0;
		curTabOpen = "";
		curMemberSelected = null;
		boundPoints = [];
		predefinedSpecialSpots = [];
		scaleF = minimapOffset = endOfStage = 0;
	},

	createString: function(a) {
		if(a > 3) {
			return a+'th';
		} else if(a == 1) {
			return a+'st';
		} else if(a==2) {
			return a+'nd';
		} else if(a==3) {
			return a+'rd';
		}
	},
};
