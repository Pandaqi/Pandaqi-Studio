function Quest(id, title, content, reward, questType = '') {
	this.id = id
	this.title = title
	this.content = content
	this.reward = reward
	this.questType = questType
}

var questList = [
	// the quest that starts it all!
	new Quest(-1, "Collect all the pandas!", "I have hidden pandas all over this website (10 in total). When you find one, click on it to collect it. Let's see if you can find all of them!", 500, 'panda'),

	// random "improve your life" or "do something crazy" stuff
	new Quest(0, "Go outside", "Stretch your legs, smell the fresh air, go for a run, talk to your neighbor", 100),
	new Quest(1, "Good luck hug", "Find somebody you like and give them a hug!", 100), 
	new Quest(2, "Write something", "That novel you always wanted to write? The blog you want to start? Or that letter to an old friend? Write it now&mdash;stop waiting!", 250),
	new Quest(3, "Sing", "Sing your heart out. Don't be afraid what others think of you, just sing your favourite song as loud as you can. Dancing is even better.", 100),
	new Quest(4, "Learn a new skill", "Pick any skill and learn how it works! (Might I suggest my own tutorial website? <a href='http://pandaqi.com/tutorials.com'>Pandaqi Tutorials</a>)", 300),
	new Quest(5, "Learn something new", "Pick any topic and learn some interesting facts about it! (Might I suggest my own tutorial website? <a href='http://pandaqi.com/tutorials.com'>Pandaqi Tutorials</a>)", 200),
	new Quest(6, "Write a love song", "For a secret lover, your girlfriend, your parents, anyone! Or for your dog, who am I to judge?", 150),
	new Quest(7, "Play a game together", "Pick any local multiplayer (\"couch co-op\") game you like, find one or more friends, and have some good times together!", 100),
	new Quest(8, "Exercise!", "Do some stretches, or push-ups, or yoga, just get that body moving!", 100),
	new Quest(9, "Give a performance", "Pick something you really like to do. Then gather your friends and family and give the best performance mankind has ever seen!", 200),
	new Quest(10, "Donate to a good cause", "Pick a cause you can stand behind and donate whatever you can spare. Unsurprisingly, I recommend donating to WWF (to save the pandas, and, you know, nature in general).", 350),
	new Quest(11, "Give an artist feedback", "Think about the latest movie you watched, or game you've played, or website you've visited, anything. Now find out who created it and give them constructive feedback&mdash;it will mean the world to them.", 500),
	new Quest(12, "Turn off your phone for a day", "Turn off your phone for a day and find out what happens. You can also just turn off the Wi-Fi or ... not look at it for a day.", 150),
	new Quest(13, "Give someone a compliment", "Find someone close to you, or a complete stranger if you want, and tell them something positive and nice!", 100),
	new Quest(14, "Take care of your teeth", "Seriously. Don't let your dental health go to waste, you'll be thanking yourself in twenty years time.", 200),

	// site-specific stuff
	new Quest(-2, "Try Package Party", "<a href='package-party'>Package Party</a> is a chaotic cooperative game about delivering packages in the weirdest way possible. The official page has more information and a free demo!", 500),
	new Quest(-3, "Try Into My Arms", "<a href='into-my-arms'>Into My Arms</a> is a cute 1-2 player puzzle game, playable on both desktop and mobile. Play as two lovers with a terrible curse: they may never see each other. The only way to win ... is by making a leap of faith.", 500),
	new Quest(-4, "Try Tower of Freedom", "<a href='tower-of-freedom'>Tower of Freedom</a> is all about collecting resources, building a tower, and fighting the monsters trying to destroy your tower. Together.", 500),
	new Quest(-5, "Visit all games on this website", "Simply check out all the games on this website. Bonus points if you manage to find ALL pages on the website, including the about page, the contact page, and many ... more obscure pages.", 500),
	new Quest(-6, "Give me feedback", "Try out any of my games and give me some feedback, good or bad. Any feedback is infinitely valuable to game developers, even if you're absolutely destroying my game :p", 500)
];

var CURRENT_QUEST = null;

function getRandomQuest() {
	return questList[ Math.floor( Math.random() * questList.length )]
}

function startNewQuest() {
	// first, display that we got new points
	document.getElementById('questPoints').style.opacity = 1;
	document.getElementById('questPoints').style.top = "0px";

	// update our points total
	// get the old total (set to 0 if undefined) ...
	var curPoints = window.localStorage.getItem("questPoints")
	if(curPoints == null) {
		curPoints = 0
	} else {
		curPoints = JSON.parse(curPoints)
	}

	// ... add the reward and update local storage
	var questReward = CURRENT_QUEST.reward
	var newPoints = curPoints + questReward
	window.localStorage.setItem("questPoints", JSON.stringify(newPoints))

	// start animation to hide
	// (CSS does the actual transitioning)
	document.getElementById('questContainer').style.opacity = 0.0;

	// after 2000 milliseconds, load the next quest
	setTimeout(getNewQuest, 2000);
}

function getNewQuest(firstQuest = false) {
	var currentTitle = null
	if(CURRENT_QUEST != null) {
		currentTitle = CURRENT_QUEST.title
	}

	var newQuest = null;
	// if this is our first quest, initialize the save file in local storage!
	if(firstQuest) {
		var saveObj = { 
			"questsAlreadyCompleted": [],

			"panda": {
				"foundIDs": [], 
				"totalIDs": 10
			},

			"egg": {
				"foundIDs": [], 
				"totalIDs": 1
			}
			
		}

		window.localStorage.setItem('gameSave', JSON.stringify(saveObj));

		// additionally, always start with the quest to search all the pandas!
		newQuest = questList[0]
	} else {
		var curSave = JSON.parse( window.localStorage.getItem('gameSave') );

		// we don't want two identical quests after each other
		// we also don't want someone to receive a "required" quest he/she has already done

		// (Previously, we also made sure the first quest was not a site-related one.)
		// (Why not? Because then it will probably look like spam or self-promotion or advertisments.)
		// (But now that we changed to the collecting-pandas-quest, I didn't need that anymore)
		do {
			newQuest = getRandomQuest();
		} while(newQuest.title == currentTitle || curSave.questsAlreadyCompleted.includes(newQuest.title));
	}

	// save the new quest
	window.localStorage.setItem("currentQuest", JSON.stringify(newQuest));

	// load it (which also sets the right variables and performs some extra checks)
	// (sometimes, this means loadCurrentQuest() is called twice, but hey, can't have everything)
	loadCurrentQuest()

	return newQuest;
}

function loadCurrentQuest() {
	// check if quests are enabled for this user
	var questsEnabled = JSON.parse(window.localStorage.getItem("questsEnabled"))

	// no data yet? start with quests OFF!
	if(questsEnabled == null) {
		window.localStorage.setItem("questsEnabled", JSON.stringify(false))
	} else if(!questsEnabled) {
		displayQuest(null)
		return
	}

	// get the current quest
	var savedQuest = window.localStorage.getItem('currentQuest');
	
	// if it doesn't exist, grab a random one
	var curQuest = {}
	if(savedQuest == null) {
		curQuest = getNewQuest(true)
	} else {
		// local storage saves things as a STRING
		// so we need to parse it to a JSON object
		curQuest = JSON.parse(savedQuest);
	}

	CURRENT_QUEST = curQuest;

	displayQuest(curQuest);
}

function displayQuest(curQuest) {
	if(curQuest == null) {
		document.getElementById('questShower').style.display = 'none';
		document.getElementById("questContainer").style.opacity = 0.0;
		return
	} else {
		document.getElementById('questShower').style.display = 'block';
		document.getElementById("questContainer").style.opacity = 1.0;
	}

	var htmlString = ""

	// load the quest title
	htmlString += "<h2>" + curQuest.title + "</h2>";

	// load the quest description/content
	htmlString += "<p>" + curQuest.content + "</p>";

	// load the buttons for accepting/removing

	// if our current quest is a required one (with game objects/collectibles)
	// we don't allow users to confirm it, but keep a counter and confirm it ourselves
	if( curQuest.questType != '') {
		var curSave = JSON.parse( window.localStorage.getItem('gameSave') );
		var curSaveObj = curSave[curQuest.questType]

		htmlString += '<div class="questProgress" id="questProgress">' + curSaveObj["foundIDs"].length + '/' + curSaveObj['totalIDs'] + ' collected</div>'
	} else {
		htmlString += '<div class="buttonLink green" onclick="startNewQuest()">I did it!</div>'
	}

	htmlString += '<div class="buttonLink red" onclick="disableQuests()" style="opacity:0.5;">Disappear!</div>'
	htmlString += '<a class="buttonLink blue" href="about/quests" style="opacity:0.5;">What\'s this?</a>'

	// load label that shows new users this is a quest
	htmlString += '<span class="questMarker">NEW QUEST</span>'

	// load the label that shows your points!
	htmlString += '<span class="questPoints" id="questPoints">+' + curQuest.reward + ' POINTS!</span>';

	// finally, display all that HTML we've been building
	document.getElementById("questContainer").innerHTML = htmlString
}

function disableQuests() {
	window.localStorage.setItem("questsEnabled", JSON.stringify(false))

	loadCurrentQuest();
}

function enableQuests() {
	window.localStorage.setItem("questsEnabled", JSON.stringify(true))

	loadCurrentQuest();
}

function getHighscore() {
	var curPoints = window.localStorage.getItem("questPoints")
	if(curPoints == null) {
		curPoints = 0
	} else {
		curPoints = JSON.parse(curPoints)
	}

	document.getElementById('highscoreContainer').innerHTML = curPoints;
}

function toggleQuestShower() {
	var currentlyVisible = document.getElementById('questContainer').getAttribute('data-visible')
	var curWidth = window.innerWidth;

	var qc = document.getElementById('questContainer');
	var qs = document.getElementById('questShower');

	// on wide screens (desktop, tablet), quests appear at the bottom right and slide in from the right
	if(curWidth > 600) {
		if(currentlyVisible == 1) {
			qc.style.right = '-500px';
			qc.style.bottom = '0px';

			qs.style.right = '0px';
			qs.style.bottom = '0px';
			qs.innerHTML = 'Show Quest';

			var qc = document.getElementById('questContainer');
			qc.setAttribute('data-visible', 0)
		} else {
			qc.style.right = '0px';
			qc.style.bottom = '0px';

			qs.style.right = '320px';
			qs.style.bottom = '0px';
			qs.innerHTML = 'Hide Quest';

			qc.setAttribute('data-visible', 1)
		}

	// on narrow screens (mobile), quests appear centered at the bottom and slide in from the bottom
	} else {
		if(currentlyVisible == 1) {
			qc.style.right = '0px';
			qc.style.bottom = '-500px';

			qs.style.right = '0px';
			qs.style.bottom = '0px';
			qs.innerHTML = 'Show Quest';

			qc.setAttribute('data-visible', 0)
		} else {
			qc.style.right = '0px';
			qc.style.bottom = '0px';

			qs.style.right = '0px';
			qs.style.bottom = qc.offsetHeight + 'px';
			qs.innerHTML = 'Hide Quest';

			qc.setAttribute('data-visible', 1)
		}
	}
}

// the only thing that needs to be responsive with javascript is the QUEST system
window.onresize = function(){
	// a nice hack here: call the quest shower TWICE, so it automatically repositions itself, but stays in its current state (visible/hidden)
	toggleQuestShower();
	toggleQuestShower();
};

function convertGameObjects() {
	if(CURRENT_QUEST == null || CURRENT_QUEST == undefined) {
		return;
	}

	var allObjects = document.getElementsByClassName("gameObject");
	var numObjects = allObjects.length;

	var curSave = JSON.parse( window.localStorage.getItem('gameSave') );

	for(var i = 0; i < numObjects; i++) {
		var curObj = allObjects[i];

		// set objects to a random rotation, for now
		var randRotation = Math.floor(Math.random() * 360);
		curObj.style.setProperty('--myrotation', randRotation + 'deg');

		// set any positional information that is supplied
		// (if not supplied, we don't set it, so it should nicely default)
		var positionProperties = ['top', 'left', 'bottom', 'right'];
		for(var j = 0; j < 4; j++) {
			var curAttr = positionProperties[j];
			if(curObj.hasAttribute('data-' + curAttr)) {
				curObj.style.setProperty(curAttr, curObj.getAttribute('data-' + curAttr));
			}
		}

		var objectType = curObj.getAttribute('data-type')
		var objectID = curObj.getAttribute('data-id')

		// set the right image based on the type
		curObj.innerHTML = "<img src='files/gameobjects_" + objectType + ".png' />";

		// if this ID is already present (we already found this collectible)
		// or this object belongs to a DIFFERENT quest than our current one
		// HIDE IT!
		var alreadyCollectedID = curSave[objectType]['foundIDs'].includes(objectID);
		var wrongQuestType = (CURRENT_QUEST.questType != objectType);
		if(alreadyCollectedID || wrongQuestType) {
			curObj.style.display = 'none';
		}

		// add a click event listener to this object
		curObj.addEventListener('click', function(ev) { collectObj(this); }, false);

		/*
		// get all siblings => make sure they do not respond to pointer events
		var result = [], node = curObj.parentNode.firstChild;

		while ( node ) {
		    if ( node !== curObj && node.nodeType === Node.ELEMENT_NODE ) {
		    	result.push( node );
		    }
		    node = node.nextElementSibling || node.nextSibling;
		}

		for(var j = 0; j < result.length; j++) {
			result[j].style.pointerEvents = 'none';
		}

		// THIS DOESN'T WORK
		// Could be an issue with the z-index
		// COuld be an issue with selection (so disable text selection?)
		// Could be something else blocking pointer events

		// => Solved it for now by overlaying game objects (qua z-index) and setting mix-blend-mode to multiply

		*/
	}
}

function collectObj(obj) {
	obj.style.animation = 'collectGameObject 1s';

	setTimeout(function() { finishCollectingObj(obj); }, 1000);
}

function finishCollectingObj(obj) {
	// save the fact that we've found this object
	// save it by object TYPE and then ID
	var curSave = JSON.parse( window.localStorage.getItem('gameSave') );
	var objectType = obj.getAttribute('data-type');
	var objectID = obj.getAttribute('data-id');

	curSave[objectType]['foundIDs'].push( objectID );

	/* 
		Structure of save file is as follows:
		{
			"<objecttype>": {
				"foundIDs": [],
				"totalIDs": <number>,
			}
		}
	*/
	// remove object from the page
	obj.style.display = 'none';

	// check if this was the last one we had to find
	var objectsFound = curSave[objectType]['foundIDs'].length
	var totalNumObjects = curSave[objectType]['totalIDs']

	document.getElementById('questProgress').innerHTML = objectsFound + '/' + totalNumObjects + ' collected';

	if(objectsFound == totalNumObjects) {
		// Save that this quest is completed
		curSave.questsAlreadyCompleted.push( CURRENT_QUEST.title );

		var questIsVisible = document.getElementById('questContainer').getAttribute('data-visible')
		if(questIsVisible == 1) {
			// If quest is visible, immediately progress to a new quest
			startNewQuest();
		} else {
			// Otherwise, first SHOW the quest, THEN progress
			toggleQuestShower();

			setTimeout(function() { startNewQuest(); }, 1000);
		}

	}

	// finally, save the new gameSave information
	window.localStorage.setItem('gameSave', JSON.stringify(curSave));

}