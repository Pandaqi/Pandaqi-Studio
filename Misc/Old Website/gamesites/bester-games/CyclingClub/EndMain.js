Scene.EndMain = function(game) {
};

Scene.EndMain.prototype = {

	create:function() {
		console.log("Ending Game");
		var winningPrizes = [8000,6000,4000,3000,2000,1000,900,800,700,600,500,400,300,250,250,200,200,200,100,100];
		var pointPrizes = [800,450,300];
		var theStage = CURSTAGE[0]+1;
		var newsItem = ["Stage " + theStage + " Results!",''];
		var temp = "<div id='endContinueButton'>Continue Tour &nbsp;>></div><div style='margin:auto;width:1000px;' class='stageResults'><h1 style='text-align:center;'>Results of Stage " + theStage + "</h1><table width='100%' cellpadding='10'>";
		for(var i=0;i<positions.length;i++) {
			var extraStyling = '';
			var curP = ALLPART[positions[i][0]];
			if(i==0) {
				newsItem[1] += "This stage was won by " + curP.name + " with a time of " + reFormat(positions[i][1]) + ". ";
			}
			//One of our guys will get some money!
			if(i <= 20) {
				if(positions[i][0] < 6) {
					PAYHISTORY.unshift([positions[i][0],"Came in " + this.createString(i+1) + ' at stage ' + theStage,"$ " + winningPrizes[i]]);
				}
			}
			curP.yPoints = parseInt(parseInt(curP.yPoints)+parseInt(positions[i][1]));
			TEAMNAMES[Math.floor(positions[i][0]/6)][2] = parseInt(parseInt(TEAMNAMES[Math.floor(positions[i][0]/8)][2])+parseInt(positions[i][1]));
			if(i%2 == 0) {
				extraStyling = 'class="alternateBG"';
			}
			if(i == 0) {
				temp += "<tr " + extraStyling + " style='transform:scale(1.3);'><td>" + (i+1) + ". </td><td>" + curP.name + "</td><td style='text-align:right;'>" + reFormat(positions[i][1]) + "</td></tr>";
			} else {
				temp += "<tr " + extraStyling + "><td>" + (i+1) + ". </td><td>" + curP.name + "</td><td style='text-align:right;'><span style='float:left;font-size:28px;color:#AAA;'>(+" + reFormat(positions[i][1]-positions[0][1]) + ")</span>" + reFormat(positions[i][1]) + "</td></tr>";
			}
		}
		temp += "</table></div>";
		$("#menuOverlay").html(temp);
		for(var i=0;i<specialEvents.length;i++) {
			//One of our guys won something! Yay!
			var rank = specialEvents[i][1];
			if(rank == 20) { rank = 0; }
			if(rank == 18) { rank = 1; }
			if(rank == 16) { rank = 2; }
			newsItem[1] += ALLPART[specialEvents[i][0]].name + " managed to snatch the full 20 points at a " + specialEvents[i][2] + " point.";
			if(specialEvents[i][0] < 6) {
				PAYHISTORY.unshift([specialEvents[i][0],"Came " + this.createString(rank+1) + " at a " + specialEvents[i][2] + " point","$ " + pointPrizes[rank]]);
			}
		}
		NEWS.unshift(newsItem);
		//SET ALL STATS AND SHIZZLE
		CURSTAGE[1] = 1;
		$("#endContinueButton").click(function() {
			game.state.start("MainHub");
		})
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