---
draft: true 

title: "Clouds & Babies"
blurb: "Clouds & Babies - Companion websites "

date: 2021-04-29

categories: ["board-game"]
tags: ["cooperative", "hybrid"]
---

<!-- @TODO: Update to match new structure, instead of keeping it all HTML -->

<p id="mainTimer"></p>
<button id="refreshClickOff">Stop Alarm</button>
<button id="startGameBtn">Start Game</button>

<audio muted="true" loop="true" id="alarmSound" src="gamesites/clouds-and-babies/alarm_sound.mp3" preload="auto"></audio>

<script>
	var startTime = 5*60;
	var alarmSound = document.getElementById('alarmSound');
	var clickoffBtn = document.getElementById('refreshClickOff');
	var refreshEvent = false;

	var animDur = 500
	var animInterval = null;
	var screenColors = ['#ade1f1', '#ff84b8'];
	var curScreenFlashState = 0;

	function flashScreen() {
		curScreenFlashState = (curScreenFlashState + 1) % 2;
		document.body.style.backgroundColor = screenColors[curScreenFlashState];
    } 

	function convertTimeToString(time) {
		time = Math.floor(time)

		var seconds = time % 60
		if(seconds < 10) { seconds = "0" + seconds; }

		var minutes = Math.floor(time / 60)
		if(minutes < 10) { minutes = "0" + minutes; }

		return minutes + ":" + seconds;
	}

	document.getElementById('refreshClickOff').addEventListener("click", function(ev) {
		if(!refreshEvent) { return; }

		// register current game state
		refreshEvent = false;

		// button should not be clickable (when refresh event is not happening)
		clickoffBtn.disabled = true;
		clickoffBtn.style.display = 'none';

		// stop alarm sound
		alarmSound.muted = true;
		alarmSound.pause();
		alarmSound.currentTime = 0;

		// stop flashing the screen + reset to default state
		clearInterval(animInterval);
		curScreenFlashState = 0;
		document.body.style.backgroundColor = screenColors[0];
	})

	function performRefreshEvent() {
		// we are already in refresh event? Don't do anything (although it's bad news for the players ...)
		if(refreshEvent) { return; }

		// button should be clickable from now on
		clickoffBtn.disabled = false;
		clickoffBtn.style.display = 'block';

		// start alarm sound
		alarmSound.muted = false;
		alarmSound.play();

		// register current game state
		refreshEvent = true;

		// start flashing the screen PINK-BLUE
		flashScreen();
	    animInterval = setInterval(function() { flashScreen(); }, animDur);
	}

	function countDown() {
		startTime -= 1;
		mainTimer.innerHTML = convertTimeToString(startTime);
		if(startTime % 30 == 0) {
			performRefreshEvent();
		}
	}

	function init() {
		clickoffBtn.style.display = 'none';
		clickoffBtn.disabled = true;

		document.body.style.backgroundColor = screenColors[0];
		mainTimer.innerHTML = convertTimeToString(startTime);
	}

	init();

	document.getElementById('startGameBtn').addEventListener("click", function(ev) {
		document.getElementById('startGameBtn').style.display = 'none';
		setInterval(function() { countDown(); }, 1000);
	});
</script>