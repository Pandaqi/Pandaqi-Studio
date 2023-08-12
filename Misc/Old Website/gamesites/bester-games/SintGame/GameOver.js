Scene.GameOver = function(game) {
};

Scene.GameOver.prototype = {

	create:function() {
		LIVES = 3;
		POINTS = 0;
		PEPERNOTEN = 0;

		document.getElementById("bigContainerThingy").style.display = 'block';
		document.getElementById('popupBox').style.display = 'block';
		$("#teamSetup").css('opacity','0.3');
		//POPUP WITH RESULT OF GAME - EITHER YOU LOSE AND GET EASY BUTTON TO REPLAY, OR ARE CONGRATULATED AND RECEIVE MONEY
		//In all cases though, experience is added, with a nice tweening animation/transition?
		$("#popupMoney").html('');
		if(FAILURE) {
			$("#popupDesc").html('<h1>SORRY</h1>Maar je hebt het level gewoon niet gehaald. Maar blijf vooral proberen.')
			$(".greenBuyBtn").html('REPLAY');			
		} else {
			var curLevel = (LEVELSETTINGS[(LEVELSETTINGS.length-1)]-30)/4;
			myData.money += curLevel*10;
			var desc = '<h1>GEFELICITEERD!</h1>Je hebt ' + curLevel*10 + ' euro gekregen!<br/><br/>Je pieten zijn ook verbeterd:';
			for(var i=0;i<myData.team.length;i++) {
				var someNum = Math.round(Math.random()*0.5*curLevel*100 + 0.5*curLevel*100);
				var oldLvl = myData.pieten[myData.team[i]][1];
				desc += '<br/>Piet ' + (i+1) + ': +' + someNum + 'xp!';
				myData.pieten[myData.team[i]][2] += someNum;
				var newLvl = Math.floor(Math.sqrt(myData.pieten[myData.team[i]][2]/1000));
				if(newLvl > 10) { newLvl = 10; }
				myData.pieten[myData.team[i]][1] = newLvl;
				if(newLvl != oldLvl) {
					desc += ' Grew to level ' + newLvl + '!';
				}
			}
			$("#popupDesc").html(desc);
			$(".greenBuyBtn").html('GREAT!');			
			$(".greenBuyBtn").addClass('disabledBuy');
		}
		localStorage.setItem("SINTGameSavings",JSON.stringify(myData));
		buildTeamBar();
		game.paused = true;
	},	

};