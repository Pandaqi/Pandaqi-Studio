import Config from "./config"
import Hints from "./hints"
import Map from "./map"

export default {

	texts: {
		'welcomeMessage': `<p>Welcome to a new treasure hunt!</p>
							<p>{0}</p>
							<p><strong>Step 2:</strong> discover your hints.</p>
							<ul>
								<li>Click "Show Hint Player 1"</li>
								<li>Write them down &mdash; keep them secret!</li>
								<li>Repeat until all players know their hints.</li>
							</ul>
							<p><strong>Step 3:</strong> open the map and copy it to the paper.</p>
							<p><strong>Step 4:</strong> put the phone aside and play!</p>`,

		'hintPresentMessage': '<p>Here are your hints ... </p>',
		'nextHintMessage': `<p>Give the phone to the next player.</p>
							<p>Click the button below to reveal your hints.</p>`,
		'revealMapMessage': `<p>Press the button below to show the map.</p>
							<p>Fold the paper in half until you have the same number of squares.</p>
							<p>Now copy the map to your paper, then cut it into separate tiles.</p>`,
		'solutionRevealText': '<p>The treasure was at <strong>{0}</strong></p>',
		'premadeGameFinished': '<p>Done! Print, cut out the cards, enjoy!</p>',
		'startGameMessage': `<p>You're ready to play!</p>
							<p>Put the phone away and have fun.</p>
							<p>When done, click the button below to reveal the treasure location (just to be sure)</p>`,
		'botMessage': `<p>Botbeard welcomes you! What do you want?</p>`,
		'swapActionIntroduction': '<p>Which two tiles would you like to swap?</p>',
	},

	interfaceContainer: null,
	interface: null,
	gameImagesContainer: null,

	initialize()
	{
		this.interfaceContainer = document.getElementById('interface-container');
		this.interface = document.getElementById('interface');
		this.gameImagesContainer = document.getElementById('game-canvases-container');

		var useInterface = Config.useInterface;
		if(!useInterface) {
			this.clearInterface();
			this.interfaceContainer.style.display = 'none';
			return;
		}

		if(Config.createPremadeGame) {
			this.setInterfaceTo(this.texts.premadeGameFinished);
			return;
		}


		var welcomeMessage = this.texts.welcomeMessage;
		if(Config.useRealMaterial) {
			welcomeMessage = welcomeMessage.replace("{0}", '<strong>Step 1:</strong> grab the material you already have.');
		} else {
			welcomeMessage = welcomeMessage.replace("{0}", '<strong>Step 1:</strong> grab some papers and pens.');
		}

		this.setInterfaceTo(welcomeMessage);
		this.createPlayerHintButton(0);
	},

	setInterfaceTo(txt)
	{
		this.interface.innerHTML= txt;
	},

	clearInterface()
	{
		this.setInterfaceTo('');
	},

	addButtonToInterface(txt)
	{
		var btn = document.createElement("button");
		btn.innerHTML = txt;
		this.interface.appendChild(btn);
		return btn;
	},

	addParagraphToInterface(txt)
	{
		var p = document.createElement("p");
		p.innerHTML = txt;
		this.interface.appendChild(p);
		return p;
	},

	createPlayerHintButton(playerNum)
	{
		var btn = this.addButtonToInterface('Show Hint Player ' + (playerNum + 1));
		btn.addEventListener("click", function(ev) {
			this.setInterfaceTo(this.texts.hintPresentMessage);
			this.showPlayerHint(playerNum);
		}.bind(this));
	},

	showPlayerHint(playerNum, bot = false)
	{
		var hints = Hints.perPlayer[playerNum];

		var list = document.createElement("div");
		list.id = 'hint-images-container';
		for(let i = 0; i < hints.length; i++)
		{
			var elem = document.createElement('div');
			elem.id = 'hint-image';

			elem.appendChild(hints[i].image);
			list.appendChild(elem);
		}
		this.interface.appendChild(list);

		if(bot)
		{
			this.createBotBackButton();
			return;
		}

		this.createContinueButton(playerNum + 1);
	},

	createContinueButton(playerNum)
	{
		var playerCount = Config.playerCount;
		if(Config.addBot) { playerCount -= 1; }

		var allHintsDisplayed = playerNum >= playerCount;

		var btn = this.addButtonToInterface('Continue');
		btn.addEventListener("click", function(ev) {
			if(allHintsDisplayed) { this.continueToMapInterface(); return; }
			
			this.setInterfaceTo(this.texts.nextHintMessage);
			this.createPlayerHintButton(playerNum);
		}.bind(this));
	},

	continueToMapInterface()
	{
		this.setInterfaceTo(this.texts.revealMapMessage);
		this.createShowMapButton();
	},

	displayCachedImage(key)
	{
		this.gameImagesContainer.style.display = 'flex';
		this.gameImagesContainer.innerHTML = '';
		this.gameImagesContainer.appendChild(Map.cachedImages[key]);
	},

	hideCachedImage()
	{
		this.gameImagesContainer.style.display = 'none';
	},

	createShowMapButton()
	{
		var btn = this.addButtonToInterface('Show Map');
		btn.addEventListener("click", function(ev) {
			this.displayCachedImage('fullMap');

			this.interface.classList.add("interface-lowvis");
			this.interfaceContainer.classList.add("interface-container-lowvis");

			this.createCloseMapButton();
		}.bind(this));
	},

	createCloseMapButton()
	{
		this.clearInterface();
		var btn = this.addButtonToInterface('Close Map');
		btn.addEventListener('click', function(ev) {
			this.hideCachedImage();

			this.interfaceContainer.classList.remove("interfaceContainer-lowvis");
			this.interface.classList.remove("interface-lowvis");

			if(Config.addBot) {
				this.showBotInterface();
				return;
			}

			this.closeInterface();
		}.bind(this));	
	},

	closeInterface()
	{
		this.setInterfaceTo(this.texts.startGameMessage);
		this.createShowMapButton();
		this.createSolutionButton();
	},

	createSolutionButton()
	{
		var btn = this.addButtonToInterface('Warning! Reveal solution.');
		btn.addEventListener("click", function(ev) {
			if(!confirm("Are you sure you want to see the solution?")) { return; }
			
			this.displayCachedImage('solutionMap');
			this.interface.style.opacity = 0.66;

			var revealText = this.texts.solutionRevealText;
			revealText = revealText.replace("{0}", Map.convertToStringPos(Map.treasureLocation));
			this.setInterfaceTo(revealText);
		}.bind(this));
	},

	/* BOTBEARD STUFF */
	showBotInterface()
	{
		this.setInterfaceTo(this.texts.botMessage);

		this.createSwapButton();
		this.createShowMapButton();
		
		this.addParagraphToInterface('Danger zone ... ');
		this.displayBotHintList();
		this.createSolutionButton();
	},

	createBotBackButton()
	{
		var btn = this.addButtonToInterface('Continue');
		btn.addEventListener("click", function(ev) {
			this.showBotInterface();
		}.bind(this));
	},

	createSwapButton()
	{
		var btn = this.addButtonToInterface('Swap');
		btn.addEventListener("click", function(ev) {
			this.showSwapActionInterface();
		}.bind(this))
	},

	displayBotHintList()
	{
		var btn = this.addButtonToInterface('Show Botbeard Hints');
		btn.addEventListener("click", function(ev) {
			this.clearInterface();
			this.showPlayerHint(Config.playerCount - 1, true);
		}.bind(this))
	},

	showSwapActionInterface()
	{
		this.setInterfaceTo(this.texts.swapActionIntroduction);

		// first create the actual dropdowns
		var allLocations = Map.getAllLocationsAsStrings();

		var container = document.createElement("div");
		container.classList.add("dropdown-container");
		this.interface.appendChild(container);

		var numDropdowns = 2;
		for(let i = 0; i < numDropdowns; i++) {
			var select = document.createElement("select");
			select.id = "dropdown-" + i;

			for(let a = 0; a < allLocations.length; a++)
			{
				var option = document.createElement("option") as HTMLOptionElement;
				option.innerHTML = allLocations[a];
				option.value = allLocations[a];
				select.appendChild(option);
			}

			container.appendChild(select);
		}

		// then the button to submit that information
		var btn = this.addButtonToInterface('Submit');
		btn.addEventListener("click", function(ev) {
			var squares = [];
			for(let i = 0; i < numDropdowns; i++) {
				const elem = document.getElementById("dropdown-" + i) as HTMLSelectElement;
				squares.push(elem.value);
			}
			this.showSwapActionResults(squares);
		}.bind(this))
	},

	showSwapActionResults(squares)
	{
		var realSquares = [];
		var duplicatePositions = false;
		for(let i = 0; i < squares.length; i++) {
			var realPos = Map.convertToRealPos(squares[i]);
			var realSquare = Map.map[realPos.x][realPos.y];
			if(realSquares.includes(realSquare)) { duplicatePositions = true; }
			realSquares.push(realSquare);
		}

		if(duplicatePositions) {
			this.addParagraphToInterface("Try again! Can't swap with itself.");
			return;
		}

		var answerChanged = Map.testTileSwap(realSquares[0], realSquares[1])

		// display that
		var txt = ''
		for(let i = 0; i < squares.length; i++)
		{
			if(answerChanged[i]) {
				txt += '<p>Yes, the answer for ' + squares[i] + ' changed.</p>';
			} else {
				txt += '<p>No, the answer for ' + squares[i] + ' did NOT change</p>';
			}
		}

		// go to a new interface where we display our results (txt) + a back button
		this.clearInterface();
		this.setInterfaceTo(txt);
		this.createBotBackButton();
	}

}