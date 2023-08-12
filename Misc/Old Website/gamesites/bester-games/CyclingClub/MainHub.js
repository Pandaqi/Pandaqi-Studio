var lastStageSelected = 0;
var curTabOpen = "";
var curMemberSelected;

Scene.MainHub = function (game) {
};

Scene.MainHub.prototype = {
	create: function () {
		//CURSTAGE[0] = 1;
		var s = CURSTAGE[0]+CURSTAGE[1];
		var curStagePoints = "Day #" + (CURSTAGE[0]+1) + "<br/>";
		var totalStagePoints = TOUR[0][0][2] + ' - ' + TOUR[TOUR.length-1][TOUR[TOUR.length-1].length-1][2];
		var curTeamName = TEAM[0].team[0] + ', ' + TEAM[0].team[1];
		var totalLength = 0;
		for(var i=0;i<TOUR.length;i++) {
			totalLength += TOUR[i].length;
		}
		var displayText = 'Next Day';
		if(CURSTAGE[1] == 0) {
			displayText = 'Start Stage';
		}
		//Insert huge menu table
		document.getElementById('menuOverlay').innerHTML = '<table style="width:100%;height:100%;" id="bigTable" cellspacing="30"><tr height="60%"><td width="50%" class="MediumButton" id="myStage">' + displayText + '<br/><div style="font-size:20px;">' + curStagePoints + this.getStageInfo(s) + '</div></td><td id="block1" >' + this.generatedNames() + '<td/></tr><tr><td><table width="100%" height="100%" cellspacing="15"><tr><td class="SmallButton" id="newsBlock">News <span style="float:right;font-size:16px;">(' + curTeamName + ')</span>' + this.getNews() + '</td><td id="financeBlock"class="SmallButton">Finances / Equipment' + this.getFinance() + '</td></tr></table></td><td><table width="100%" height="100%" cellspacing="15"><td class="SmallButton" id="rankBlock" rowspan="2">Classification <div style="overflow:hidden;height:50px;margin:0px;padding:0px;font-size:20px;" id="rankDiv">' + this.getRank(0,1) + '</div><span style="font-size:14px;white-space:no-wrap;"><span class="Y">' + this.getFirstPlace(0) + '</span> | <span class="G">' + this.getFirstPlace(1) + '</span> | <span class="R">' + this.getFirstPlace(2) + '</span> | <span class="W">' + this.getFirstPlace(3) + '</span></span></td><td class="SmallButton" id="allStageBlock">All Stages<br/><span style="float:right;text-align:right;font-size:20px;">' + (s+1) + ' / ' + TOUR.length + '<br/>' +  totalStagePoints + '<br/>' + totalLength + ' km</span></td></tr><tr><td class="SaveButton" id="save">Save Game</td></tr></table></td></tr></table>';

		//Load stage into Next Day button
		var getCanvWidth = $('#myStage').width()+2*20;
		var getCanvHeight = $('#myStage').height()+2*20;
		this.stageGenerator(getCanvWidth,getCanvHeight,s,'stage');

		var that = this;

		$(".SaveButton").click(function(event) {
			that.saveGame();
			$(this).css('color','green')
		});
		//Click-control of menu buttons
		$(".SmallButton").click(function(event) {
			$(".SaveButton").css('color','#BBB');
			var ID = $(this).attr('id');
			if($("#bigTable").css('opacity') == 1) {
				$("#bigTable").css('opacity',0.15);
				$("#popupWindowContainer").show("fast", function() {
					//Classifications
					if(ID == 'rankBlock') {
						$("#popupWindow").html('<table width="100%" id="classTable" cellspacing="15"><tr><td rowspan="2"><span class="Y">General</span><div class="bigRankTable">' + that.getRank(0,0) + '</div></td><td><span class="G">Points</span><div class="smallRankTable">' + that.getRank(1,0) + '</div></td><td><span class="R">Mountains</span><div class="smallRankTable">' + that.getRank(2,0) + '</div></td></tr><tr><td><span class="W">Young Rider</span><div class="smallRankTable">' + that.getRank(3,0) + '</div></td><td><span class="P">Team</span><div class="smallRankTable">' + that.getRank(4,0) + '</div></td></tr></table>');
						//Set fixed height of divs inside to enable scrolling
						var availableHeight = $("#popupWindow").height();
						$(".bigRankTable").css('height',availableHeight-100);
						$(".smallRankTable").css('height',availableHeight/2-100);
						//Make player names clickable
						$(".SmallName").click(function(event) {
							var whichPerson = $(this).attr('title');
							var findRank;
							for(var j = 0;j < ALLPART.length; j++) {
							    if (whichPerson == ALLPART[j].name) {
							        findRank = ALLPART[j];
							        break;
							    }
							}
							that.setMemberInfo(-2,findRank);
						});
					} else if(ID == 'allStageBlock') {
						$("#popupWindow").html('<table width="100%" height="100%" cellspacing="15"><tr height="80%"><td colspan="' + TOUR.length + '" id="allStage"><span id="numberTitle">Stage 1</span></td></tr><tr>' + that.allStageNumbers() + '<tr/></table>');
						var getWidth = $('#allStage').width();
						var getHeight = $('#allStage').height();
						that.stageGenerator(getWidth,getHeight,s,'allStage');
						$("#number" + s).css('border','1px solid gray');
						$("#numberTitle").html("<span style='font-size:48px;'>Stage " + (s+1) + "</span><br/>" + that.getStageInfo(s));

						//Slider/menu containing all stages of this tour
						$(".NumberButton").click(function(event) {
							$("#number"+lastStageSelected).css('border','none');
							$(this).css('border','1px solid gray');
							var ID = $(this).attr('id').substr(6);
							lastStageSelected = ID;
							var getWidth = $('#allStage').width();
							var getHeight = $('#allStage').height();
							$("#numberTitle").html("<span style='font-size:48px;'>Stage " + (parseInt(ID)+1) + "</span><br/>" + that.getStageInfo(parseInt(ID)));
							that.stageGenerator(getWidth,getHeight,ID,'allStage');
						});
					//Popup about one certain person
					} else if(ID.charAt(0) == 'M') {
						var OBJ = TEAM[ID.charAt(1)];
						that.setMemberInfo(ID,OBJ);
						//Extra tab interface for diets, sleep, etc.
						$(".MemberActionButton").click(function(event) {
							$("#"+curTabOpen).css('background','rgba(80,80,80,0.5)');
							var ID_AGAIN = $(this).attr('id');
							if($("#expandDiv").is(":visible") && ID_AGAIN == curTabOpen) {
								$("#expandDiv").hide("fast");
								$(".underExpandDiv").show("normal");
							} else {
								$(this).css('background','rgba(150,150,150,0.5)');
								$("#expandDiv").show("normal");
								//Set to corresponding content
								var options = [];
								var whichTab;
								if(ID_AGAIN == 'foodB') {
									options = [["Coca Cola","Temporarily increases energy",'$ ' + 300],["Vegetarian","Reduces energy, but increases your speed",'$ ' + 400],["Eggs","Increases strength, but people will complain about your smell",'$ ' + 500],["Fristi","Increases morale",'$ ' + 600],["Fastfood","Does nothing good. Not ever.",'$ ' + 50]];
									whichTab = 'diet';
									$("#expandDiv").html(that.convertToTabTable(options,OBJ[whichTab]));
								} else if(ID_AGAIN == 'trainB') {
									options = [["Rigorous","Increases all stats","F -40"],["Stamina","Improves stamina and two other random stats","F -15"],["Strength","Improves sprint, speed and one other random stat","F -25"],["Technique","Increases everything except stamina and tank","F -32"]];
									whichTab = 'training';
									$("#expandDiv").html(that.convertToTabTable(options,OBJ[whichTab]));
								} else if(ID_AGAIN == 'equipB') {
									options = [["Yellow","Good for everything",'$ ' + 100],["Red","Good for tackling hills",'$ ' + 70],["Orange","Increases stamina and fitness",'$ ' + 70],["Purple","Makes user more daring and adventurous",'$ '+70],["Blue","Increases overall speed and morale",'$ ' + 100],["Green","Increases sprint speed and acceleration",'$ ' + 70],["White","Amazing for time trials",'$ '+150],["Black","Amazing for everything",'$ ' + 300]];
									whichTab = 'equipment';
									$("#expandDiv").html(that.convertToTabTable(options,OBJ[whichTab]));
								} else {
									options = [OBJ.salary];
									whichTab = 'salary';
									$("#expandDiv").html(that.convertToTabTable(options,'salary'));
								}								
								$(".underExpandDiv").hide("fast");

								//Make clicking/selecting and deselecting possible
								$(".TabButton").click(function(event) {
									var tabID = $(this).attr('title');
									var prevState = $(this).css('color');
									$(".TabButton").css('color','#BBB');
									if(prevState == 'rgb(255, 0, 0)'){
										OBJ[whichTab] = '';
									} else {
										OBJ[whichTab] = tabID;
										$(this).css('color','red');
									}
								});
								$(".changeSalary").click(function(event) {
									var tabID = parseInt($(this).attr('title'));
									OBJ.salary += tabID;
									$("#displaySalary").html('$ ' + OBJ.salary);
									if(tabID > 0) {
										$("#displaySalary").css('color','green');
									} else {
										$("#displaySalary").css('color','red');										
									}
								});
							}
							curTabOpen = ID_AGAIN;
						});
					} else if(ID == 'newsBlock') {
						$("#popupWindow").html('<table width="100%" height="100%" cellspacing="15"><tr><td style="vertical-align:top;">' + that.getNewsBig() + '</td><td width="60%" id="newsShowPanel" style="vertical-align:top;">No message selected...</td></tr></table>');
						$("#listOfNews").css('height',$("#popupWindow").height()-60);

						$("#0message").addClass("isCurSelected");
						$("#newsShowPanel").html('<h1 class="newsTitle">' + NEWS[0][0] + '</h1>' + NEWS[0][1]);

						$(".NewsButton").click(function(event) {
							$(".NewsButton").removeClass("isCurSelected");
							$(this).addClass("isCurSelected");
							var getID = $(this).attr('id').charAt(0);
							$("#newsShowPanel").html('<h1 class="newsTitle">' + NEWS[getID][0] + '</h1>' + NEWS[getID][1]);
						});
					} else if(ID == 'financeBlock') {
						$("#popupWindow").html('<table width="100%" height="100%" cellspacing="5" cellpadding="5" id="financeTable">' + that.getFinanceBig() + '</table>');
					}
				});
			}
		});
		//Set pictures for every member
		this.setMemberPicture('.aMember');

		$(window).resize(function () { 
			var getCanvWidth = $('#myStage').width()+2*20;
			var getCanvHeight = $('#myStage').height()+2*20;
			that.stageGenerator(getCanvWidth,getCanvHeight,s,'stage'); 
		});

		//Click outside popup to close it again
		$(document).mouseup(function (e) {
		    var container = $("#popupWindow");
		    if (!container.is(e.target) && container.has(e.target).length === 0) {
		        $("#bigTable").css('opacity',1);
				$("#popupWindowContainer").hide("fast");
				$("#popupWindow").html("");
		    }
		});
		$(".MediumButton").click(function(event) {
			//Go to next day
			if(CURSTAGE[1] == 0) {
				//Starts stage
				game.paused = false;
				CURSTAGE[1] = 1;
				if(SPECIALTIES[CURSTAGE[0]] == 'Time Trial') {
					partLength = 30;					
				} else {
					partLength = 10;
				}
				game.state.start('LoadMain');
			} else if(CURSTAGE[1] == 1) {
				//Goes to next day
				CURSTAGE[0]++;
				CURSTAGE[1] = 0;
				game.paused = false;
				//Applies changes, then resets everything
				for(var i=0;i<ALLPART.length;i++) {
					ALLPART[i].fitness = that.clamp(ALLPART[i].fitness+50*(1-ALLPART[i].recovery/200)+Math.random()*20-10,0,100);
					ALLPART[i].morale = that.clamp(ALLPART[i].morale+Math.random()*20-10,0,100);
				}
				for(var i=0;i<6;i++) {
					MONEY -= TEAM[i].salary;
				}
				game.state.start('MainHub');
			}
		});

		//INsert ranking table
		$('#rankDiv').css('height',$("#rankBlock").height()-60);
		game.paused = true;
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

	setMemberInfo: function(ID,OBJ) {
		var playerControls = '';
		if(ID != -2) {
			playerControls = '<tr><td colspan="3"><table cellspacing="15" width="100%"><tr><td class="MemberActionButton" id="foodB"> + FOOD </td><td id="trainB" class="MemberActionButton"> + TRAINING </td><td class="MemberActionButton" id="equipB"> + EQUIPMENT </td><td class="MemberActionButton" id="salaryB"> + SALARY </td></tr></table><div style="display:none;" id="expandDiv"></div></td></tr>';
		}
		$("#popupWindow").html('<div class="aMemberBig" id="' + ID + '" style="width:100%;height:100%;"><table width="100%" height="100%" cellspacing="15"><tr><td width="40%"><table width="100%" height="100%" id="memberStatsTable"><tr><td style="vertical-align:top;"><h1 style="font-size:60px;margin:0px;padding:0px;">' + OBJ.name + '</h1></td></tr><tr><td>Sprint</td><td>' + OBJ.sprint + '</td></tr><tr class="alternateBG"><td>Speed</td><td>' + OBJ.speed + '</td></tr><tr><td>Stamina</td><td>' + OBJ.stamina + '</td></tr><tr class="alternateBG"><td>Climb</td><td>' + OBJ.climb + '</td></tr><tr><td>Time trial</td><td>' + OBJ.timeTrial + '</td></tr><tr class="alternateBG"><td>Descend</td><td>' + OBJ.descend + '</td></tr><tr><td>Adventurous</td><td>' + OBJ.adventure + '</td></tr><tr class="alternateBG"><td>Resistance</td><td>' + OBJ.resistance + '</td></tr><tr><td>Recovery</td><td>' + OBJ.recovery + '</td></tr></table></td><td width="60%" style="vertical-align:top;"><table width="100%" height="100%"><tr><td height="33%" style="padding-right:33%;font-size:18px;" colspan="3">' + OBJ.bio + '</td></tr>' + playerControls + '<tr class="underExpandDiv"><td>Time</td><td>' + reFormat(OBJ.yPoints) + '</td><td>#' + OBJ.yRank + '</td></tr><tr class="underExpandDiv"><td>Sprint points</td><td>' + OBJ.gPoints + '</td><td>#' + OBJ.gRank + '</td></tr><tr  class="underExpandDiv"><td>Mountain points</td><td>' + OBJ.rPoints + '</td><td>#' + OBJ.rRank + '</td></tr><tr class="underExpandDiv"><td>Young rider points</td><td>' + OBJ.wPoints + '</td><td>#' + OBJ.wRank + '</td></tr></table></td></tr></table></div>');
			curMemberSelected = OBJ;
			//Set big member picture for current member
			this.setMemberPicture('.aMemberBig');
	},

	convertToTabTable: function(a,b) {
		var temp = '';
		if(b == 'salary') {
			temp = '<table width="100%" cellspacing="10"><tr><td  rowspan="2" id="displaySalary" width="60%">$ ' + a[0] + '</td><td class="changeSalary G" title="500"> + 500 </td><td class="changeSalary G" title="1000"> + 1000 </td></tr><tr><td title="-500" class="changeSalary R"> - 500 </td><td title="-1000" class="changeSalary R"> - 1000 </td></tr></table>';
		} else {
			temp = '<table width="100%" height="100%" cellspacing="5">';
			for(var i=0;i<a.length;i++) {
				var extraStyle = '';
				if(a[i][0] == b) {
					extraStyle = 'style="color:red;"';
				}
				temp += '<tr class="TabButton"' + extraStyle + ' title="' + a[i][0] + '"><td>' + a[i][0] + '</td><td>' + a[i][1] + '</td><td> ' + a[i][2] + '</td></tr>';
			}
			temp += '</table>';
		}
		return temp;
	},

	saveGame: function() {
		//Save the game
		var data = {allpart: ALLPART, money:MONEY, team:TEAM, tour:TOUR, teamnames:TEAMNAMES, specialties:SPECIALTIES, curstage:CURSTAGE, news:NEWS, payhistory:PAYHISTORY, weather:WEATHER, firstplaces:FIRSTPLACES, rankings:RANKINGS};
		var toSave = JSON.stringify(data);
		localStorage.setItem("slot1",toSave);
	},

	setMemberPicture: function(WHAT) {
		//Set nice images next to names
		$(WHAT).each(function(i, obj) { 
			var string = "";
			var theID = $(this).attr('id');
			var theImage;
			if(WHAT == ".aMemberBig") {
				theImage = curMemberSelected.image;
			} else {
				theImage = TEAM[theID.charAt(1)].image;
			}
			string += "url('Hair-0" + theImage[0] + ".png')";
			string += ", url('Eye-0" + theImage[1] + ".png')";
			string += ", url('Mouth-0" + theImage[2] + ".png')";
			string += ", url('Beard-0" + theImage[3] + ".png')";
			string += ", url('BaseFace-01.png')";
			this.style.backgroundImage = string;
		});
	},

	randomThoughtGenerator: function(THINKER) {
		var newS = sentences[Math.round(Math.random()*(sentences.length-1))];
		newS = newS.replace('#', words[Math.round(Math.random()*(words.length-1))]);
		newS = newS.replace('$', words[Math.round(Math.random()*(words.length-1))]);
		var randMember = TEAM[Math.round(Math.random()*(TEAM.length-1))].name;
		if(randMember == THINKER) {
			randMember = 'himself';
		} else {
			randMember = randMember.split(" ")[0];
		}
		newS = newS.replace('%',randMember);
		return newS;
	},

	getNews: function() {
		var temp = '<table width="100%" height="90%"><tr height="70%"><td style="vertical-align:top;font-size:22px;"><div style="height:130px;overflow:hidden;"><table width="100%">';
		var length = NEWS.length;
		if(NEWS.length > 8) {
			length = 8;
		}
		for(var i=0;i<length;i++) {
			var extraStyling = '';
			if(i%2 == 0) {
				extraStyling = 'class="alternateBG"';
			}
			var text = NEWS[i][0].substring(0, 30);
			if(NEWS[i][0].length > 30) {
				text += '... ';
			}
			temp += '<tr><td ' + extraStyling + 'style="font-size:18px;padding-left:10px;">' + text + '</td></tr>';
		}
		var weatherString = WEATHER[0] + " | ";
		if(WEATHER[1] > 28) {
			weatherString += '<span style="color:orange;">' + WEATHER[1] + '</span>';
		} else {
			weatherString += WEATHER[1];
		}
		weatherString += " °C | ";
		if(WEATHER[2] > 18) {
			weatherString += '<span style="color:orange;">' + WEATHER[2] + '</span>';
		} else {
			weatherString += WEATHER[2];
		}
		weatherString += ' m/s';
		temp += '</table></div></td></tr><tr><td style="font-size:20px;border-top:1px solid gray;">Weather Forecast: ' + weatherString + '</td></tr>';
		temp += '</table>';
		return temp;
	},

	getNewsBig: function() {
		var temp = '<div style="height:500px;overflow:scroll;" id="listOfNews"><table>';
		for(var i=0;i<NEWS.length;i++) {
			var extraStyling = '';
			if(i%2 == 0) {
				extraStyling = 'alternateBG';
			}
			var text = NEWS[i][0].substring(0, 30);
			if(NEWS[i][0].length > 30) {
				text += '... ';
			}
			temp += '<tr><td class="NewsButton ' + extraStyling + '" id="' + i + 'message" style="font-size:26px;padding:20px;">' + text + '</td></tr>';
		}
		temp += '</table></div>';
		return temp;
	},

	getFinance: function() {
		var temp = '<div style="padding-top:15px;">';
		var extraStyling = '';
		if(MONEY < 0) {
			extraStyling = 'background-color:rgba(255,0,0,0.5);';
		} else {
			extraStyling = 'background-color:rgba(0,255,0,0.5);';
		}
		temp += '<div style="' + extraStyling + 'padding:7px;box-shadow:inset 0px 0px 5px 0px rgba(0,0,0,0.75);"> $ <span style="float:right;">' + MONEY + '</span></div>';
		var CASHFLOW = 0;
		for(var i=0;i<TEAM.length;i++) {
			CASHFLOW -= TEAM[i].salary;
		}
		if(CASHFLOW < 0) {
			extraStyling = 'background-color:rgba(255,0,0,0.5);';
		} else {
			extraStyling = 'background-color:rgba(0,255,0,0.5);';
		}
		temp += '<div style="' + extraStyling + 'margin-top:5px;padding:7px;box-shadow:inset 0px 0px 5px 0px rgba(0,0,0,0.75);"> $ <span style="float:right;">' + CASHFLOW + '</span></div>';
		temp += '</div>';
		return temp;
	},

	getFinanceBig: function() {
		var temp = '<tr style="font-size:40px;"><td style="width:400px;">What/Who?</td><td>Income</td><td colspan="2">Expenses</td></tr>';
		temp += '<tr class="inBetweenFinance"><td><i> => Players (constant)</i></td><td><i>Sponsors</i></td><td><i>Salary</i></td><td><i>Equipment</i></td></tr>';
		for(var i=0;i<6;i++) {
			temp += '<tr><td>' + TEAM[i].name + '</td><td>0</td><td>' + TEAM[i].salary + '</td><td>0</td>';		
		}
		temp += '<tr class="inBetweenFinance"><td><i> => History (one-time)</i></td><td colspan="3"></td></tr>';
		temp += '<tr style="padding:0px;"><td colspan="4" style="padding:0px;"><div style="height:200px;overflow:scroll;margin:0;padding:0;"><table width="100%" cellspacing="5" cellpadding="5" height="100%">';
		for(var i=0;i<PAYHISTORY.length;i++) {
			var extraStyling = '';
			if(i%2 == 1) {
				extraStyling = 'alternateBG';
			}
			temp += '<tr ' + extraStyling+ '><td style="width:396px;">' + TEAM[PAYHISTORY[i][0]].name + '</td><td style="text-align:left;">' + PAYHISTORY[i][1] + '</td><td>' + PAYHISTORY[i][2] + '</td></tr>';
		}
		temp += '</div></td></tr>';
		return temp;
	},

	getStageInfo: function(a) {
		if(SPECIALTIES[a] == 'Rest Day') {
			return 'Rest Day';
		} else {
			return TOUR[a][0][2] + " - " + TOUR[a][TOUR[a].length-1][2] + '<br/>' + TOUR[a].length + ' km<br/>' + SPECIALTIES[a];
		}
	},

	allStageNumbers: function() {
		var temp = '<td>Select stage: </td>';
		for(var i=0;i<TOUR.length;i++) {
			var string = (i+1);
			if(i<9) {
				string = "0"+(i+1);
			}
			temp += '<td class="NumberButton" id="number' + i + '">' + string + '</td>';
		}
		return temp;
	},

	getFirstPlace: function(VAR) {
		return ALLPART[FIRSTPLACES[VAR]].name;
	},

	getRank: function(VAR,SMALL) {
		var temp = '<table style="width:100%;">';
		var loopArr;
		if(VAR == 4) {
			loopArr = TEAMNAMES.slice(0);
			loopArr.sort(function(a,b) {
				if(a[2] < b[2]) {
					return -1;
				} 
				if(a[2] > b[2]) {
					return 1;
				}
				return 0;
			});
		} else {
			loopArr = RANKINGS[VAR];
		}
		for(var i=0;i<loopArr.length;i++) {
			var result = 0;
			var curP = ALLPART[loopArr[i]];
			if(VAR == 4) {
				var string = loopArr[i][0] + " (" + loopArr[i][1] + ") ";
				if(loopArr[i][0] == TEAM[0].team[0]) {
					string = "<b style='color:rgba(255,158,180,1);'>" + string + "</b>";
				}
				result = reFormat(loopArr[i][2]);
			} else {
				var string = curP.name;
				var findRank = -1;
				for(var j = 0;j < TEAM.length; j++) {
				    if (string == TEAM[j].name) {
				        findRank = j;
				        break;
				    }
				}
				if(findRank > -1) {
					string = "<b style='color:rgba(255,158,180,1);'>" + string + "</b>";
				}
				string += '<span style="font-size:12px;float:right;">( ' + curP.team[1] + ' )</span>';
				if(VAR == 0) {
					result = reFormat(curP.yPoints);
				} else {
					if(VAR == 1) {
						result = curP.gPoints;					
					} else if(VAR == 2) {
						result = curP.rPoints;
					} else if(VAR == 3) {
						result = curP.wPoints;
					}
				}
			}
			var extraStyling = '';
			if(i%2 == 1) {
				extraStyling = "class='alternateBG'";
			}
			var addClickEvent = '';
			if(SMALL == 0 && VAR != 4) {
				addClickEvent = 'class="SmallName" title="' + curP.name + '"';
			}
			temp += '<tr ' + extraStyling + '><td style="text-align:right;">' + (i+1) + '. </td><td ' + addClickEvent + '>' + string + '</td><td style="text-align:right;">' + result + '</td></tr>';
		}
		temp += '</table></div>';
		return temp;
	},

	generatedNames: function() {
		var temp = '<table style="width:100%;height:100%;" cellspacing="15"><tr>';
		for(var i=0;i<6;i++) {
			if(i%2 == 0 && i != 0) {
				temp += '</tr><tr>';
			}
			temp += '<td class="SmallButton aMember" id="M' + i + '"><span style="white-space:no-wrap;">' + TEAM[i].name + '</span><span style="font-size:16px;float:right;position:relative;top:-20px;">(#' + TEAM[i].yRank + ')</span><div style="width:100%;font-size:12px !important;"><img src="FitBar.png" style="width:' + Math.round(0.6*TEAM[i].fitness) + '%;height:10px;margin:0;padding:0;"/><br/><img src="MoraleBar.png" style="margin:0;padding:0;height:10px;width:' + Math.round(0.6*TEAM[i].morale) + '%;position:relative;"/><br/><span style="font-size:14px;white-space:no-wrap;">' + this.randomThoughtGenerator(TEAM[i].name) + '</span></div></td>';
		}
		temp += '</tr></table>';
		return temp;
	},

	stageGenerator: function(WIDTH,HEIGHT,STAGE,OUTPUT) {
		//Array with start point at begin, end point (finish) at the end, and lots of arrays in between corresponding with special events
		var curS = TOUR[STAGE];
		var g = document.getCSSCanvasContext('2d',OUTPUT, WIDTH, HEIGHT);
		g.clearRect(0,0,WIDTH,HEIGHT);
		g.lineWidth = 4;
		g.strokeStyle = '#666';
		g.beginPath();
		for(var i=0;i<curS.length;i++) {
			var posX = i/(curS.length-1)*(WIDTH-100)+50;
			var height = curS[i][1] * (HEIGHT/100);
			g.lineTo(posX,HEIGHT-height);
		}
		g.stroke();
		for(var i=0;i<curS.length;i++) {
			if(curS[i][2] != '') {
				var posX = i/(curS.length-1)*(WIDTH-100)+50;
				g.lineWidth = 1;
				g.strokeStyle = '#ff5522';
				g.fillStyle = "#FFFFFF";
				g.font="12px Verdana";
				var originalPos = HEIGHT - curS[i][1] * (HEIGHT/100);
				g.fillText(curS[i][2],posX+10,originalPos);
				g.beginPath();
				g.moveTo(posX,0);
				g.lineTo(posX,HEIGHT);
				g.stroke();
				g.closePath();
				g.beginPath();
		        g.arc(posX, HEIGHT - curS[i][1] * (HEIGHT/100), 6, 0, 2 * Math.PI, false);
		        if(curS[i][3] == 'hill') {
		        	g.fillStyle = 'red';
		        } else if(curS[i][3] == 'sprint') {
		        	g.fillStyle = 'green';
		        } else if(curS[i][3] == 'flat') {
		        	g.fillStyle = 'purple';
		        }
		        g.fill();
		        g.closePath();
		    }
		}
	}
}