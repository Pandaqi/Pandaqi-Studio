const messages = 
{
	welcome: `<p>Welcome to a new treasure hunt!</p>
	<p><strong>Step 1:</strong> grab some papers and pens.</p>
	<p><strong>Step 2:</strong> discover your hints.</p>
	<ul>
		<li>Click "Show Hint Player 1"</li>
		<li>Write them down &mdash; keep them secret!</li>
		<li>Repeat until all players know their hints.</li>
	</ul>
	<p><strong>Step 3:</strong> open the map and copy it to the paper.</p>
	<p><strong>Step 4:</strong> put the phone aside and play!</p>`,

	hint: `<p>Give the phone to the next player.</p>
	<p>Click the button below to reveal your hints.</p>`,
	
	map: `<p>Press the button below to show the map.</p>
	<p>Fold the paper in half until you have the same number of squares.</p>
	<p>Now copy the map to your paper.</p>`,
	
	startGame: `<p>You're ready to play!</p>
	<p>Put the phone away and have fun.</p>
	<p>When done, click the button below to reveal the treasure location (just to be sure)</p>`,
	
	lostRiddle: `<p>You're ready to play!</p>
	<p>Click the button below any time you want a "lost riddle"</p>`,
	
	bot: `<p>Botbeard welcomes you! What do you want?</p>`
}

export default class Interface 
{
	config: Record<string,any>;
	interface: HTMLElement;
	interfaceContainer: HTMLElement;
	gameImagesContainer: HTMLElement;
	outOfLostRiddles: boolean;
	alphabet: string;
	actionData: { dig: { numSquares: number; }; propose: { numSquares: number; randomFact: boolean; allowDuplicates: boolean; }; scan: { numSquares: number; connected: boolean; aggregate: boolean; }; };
	
	constructor(config: Record<string, any>)
	{	
		this.config = config;
		this.interface = document.getElementById('interface');
		this.interfaceContainer = document.getElementById("interfaceContainer");
		this.gameImagesContainer = document.getElementById('game-canvases-container');

		this.outOfLostRiddles = false;

		this.alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
		this.actionData = 
		{
			dig: { numSquares: 1 },
			propose: { numSquares: 2, randomFact: true, allowDuplicates: true },
			scan: { numSquares: 4, connected: true, aggregate: true }
		}
	}

	/*
	* BASE GAME, CORE INTERFACE
	*/
	start()
	{
		var useInterface = this.config.useInterface;
		if(this.config.premadeGame) 
		{
			this.interface.innerHTML = '<p>Done! Print, cut out the cards, enjoy!</p>';
			return;
		}

		if(!useInterface) 
			{
			this.interfaceContainer.innerHTML = '';
			this.gameImagesContainer.style.display = 'block';
			return;
		}

		this.interface.innerHTML = messages.welcome;

		this.createPlayerHintButton(0);
	}

	createCloseMapButton()
	{
		this.interface.innerHTML = '';

		var btn = document.createElement('button');
		btn.innerHTML = 'Close Map';
		btn.addEventListener('click', (ev) => 
		{
			this.gameImagesContainer.style.display = 'none';
			this.interfaceContainer.classList.remove("interfaceContainer-lowvis");
			this.interface.classList.remove("interface-lowvis");

			if(this.config.expansions.theLostRiddles) 
			{
				this.showLostRiddleInterface();
				return;
			} 

			if(this.config.addBot) 
			{
				this.showBotInterface();
				return;
			}

			this.closeInterface();
		});	
		this.interface.appendChild(btn);
	}

	createSolutionButton()
	{
		var btn = document.createElement("button");
		btn.innerHTML = 'Warning! Reveal solution.';
		btn.addEventListener("click", (ev) => 
		{
			if(!confirm("Are you sure you want to see the solution?")) { return; }
			this.gameImagesContainer.style.display = 'block';
			this.interface.style.opacity = "0.66";
			this.interface.innerHTML = '<p>The treasure was at <strong>' + this.config.treasureCoords + '</strong></p>';

			const solutionMapNode = document.getElementById('solutionMap');
			solutionMapNode.style.display = "flex";
		})
		this.interface.appendChild(btn);
	}

	createShowMapButton()
	{
		var btn = document.createElement("button");
		btn.innerHTML = 'Show Map';
		btn.addEventListener("click", (ev) => 
		{
			this.gameImagesContainer.style.display = 'block';

			this.interface.classList.add("interface-lowvis");
			this.interfaceContainer.classList.add("interfaceContainer-lowvis");

			this.createCloseMapButton();
		});
		this.interface.appendChild(btn);
	}

	closeInterface()
	{
		this.interface.innerHTML = messages.startGame;	
		this.createShowMapButton();
		this.createSolutionButton();
	}

	continueToMap()
	{
		this.interface.innerHTML = messages.map;
		this.createShowMapButton();
	}

	createPlayerHintButton(playerNum: number)
	{
		var btn = document.createElement("button");
		btn.innerHTML = 'Show Hint Player ' + (playerNum + 1);
		btn.addEventListener("click", (ev) => {
			this.interface.innerHTML = '<p>Here are your hints ... </p>';
			this.showPlayerHint(playerNum);
		});
		this.interface.appendChild(btn);
	}

	createContinueButton(playerNum: number)
	{
		var playerCount = this.config.playerCount;
		if(this.config.addBot) { playerCount -= 1; }

		var allHintsDisplayed = playerNum >= playerCount;

		var btn = document.createElement("button");
		btn.innerHTML = 'Continue';
		btn.addEventListener("click", (ev) => {
			if(allHintsDisplayed) { 
				this.continueToMap();
				return;
			}
			
			this.interface.innerHTML = messages.hint;
			this.createPlayerHintButton(playerNum);
		});
		this.interface.appendChild(btn);
	}

	showPlayerHint(playerNum: number)
	{
		var allHints = this.config.hintsPerPlayer;
		var hints = allHints[playerNum];

		var list = document.createElement("ul");
		for(let i = 0; i < hints.length; i++)
		{
			var elem = document.createElement('li');
			elem.innerHTML = hints[i].html_text;
			list.appendChild(elem);
		}
		this.interface.appendChild(list);

		this.createContinueButton(playerNum + 1);
	}

	/*
	* UTILITY FUNCTIONS
	*/

	capitalize(string: string)
	{
		return string.charAt(0).toUpperCase() + string.slice(1);
	}

	convertToStringPos(cell: { x: string | number; y: number; })
	{
		return this.alphabet[cell.x] + (cell.y + 1);
	}

	convertToRealPos(string: string)
	{
		return {
			"x": this.alphabet.indexOf(string.charAt(0)),
			"y": parseInt(string.slice(1)) - 1
		}
	}

	isPosInList(pos: { x: any; y: any; }, list: string | any[])
	{
		for(let i = 0; i < list.length; i++) {
			if(pos.x == list[i].x && pos.y == list[i].y) { return true; }
		}
		return false;
	}

	// Start from square 1, keep adding neighbors to the list to check, never check a tile twice
	// All squares are connected if the final list contains ALL squares from the original
	squaresAreConnected(list: string | any[])
	{
		var squaresToCheck = [list[0]]
		var squaresSeen = []
		while(squaresToCheck.length > 0)
		{
			var cell = squaresToCheck.pop();
			squaresSeen.push(cell);

			var nbs = this.config.map[cell.x][cell.y].nbs
			for(let i = 0; i < nbs.length; i++)
			{
				var nbCell = nbs[i];
				if(!this.isPosInList(nbCell, list)) { continue; }
				if(this.isPosInList(nbCell, squaresSeen)) { continue; }
				squaresToCheck.push(nbCell);
			}
		}

		return (squaresSeen.length == list.length);
	}

	/*
	* BOT BEHAVIOR (1-2 players)
	*/
	createBotBackButton()
	{
		var btn = document.createElement("button");
		btn.innerHTML = 'Continue';
		btn.addEventListener("click", (ev) => {
			this.showBotInterface();
		})
		this.interface.appendChild(btn);
	}

	showBotHint(hintNum: string | number)
	{
		var botHints = this.config.hintsPerPlayer[this.config.hintsPerPlayer.length - 1];
		this.interface.innerHTML = '';

		var p = document.createElement("p");
		p.innerHTML = botHints[hintNum].html_text;
		this.interface.appendChild(p);

		this.createBotBackButton();
	}

	createBotHintButton(hintNum: number)
	{
		var btn = document.createElement("button");
		btn.innerHTML = 'Show Botbeard Hint ' + (hintNum + 1);
		btn.addEventListener("click", (ev) => {
			this.showBotHint(hintNum);
		})
		this.interface.appendChild(btn);
	}

	showBotActionResults(actionName: string, squares: string | any[])
	{
		var realSquares = [];
		var duplicatePositions = false;
		var data = this.actionData[actionName]
		for(let i = 0; i < squares.length; i++) {
			var realPos = this.convertToRealPos(squares[i]);
			if(this.isPosInList(realPos, realSquares)) { duplicatePositions = true; }
			realSquares.push(realPos);
		}

		if(duplicatePositions && !("allowDuplicates" in data)) {
			var p = document.createElement("p");
			p.innerHTML = 'Really want to check squares multiple times?';
			this.interface.appendChild(p);
			return;
		}

		var adjacencyConstraintNotSatisfied = ("connected" in data) && !this.squaresAreConnected(realSquares)
		if(adjacencyConstraintNotSatisfied) {
			var p = document.createElement("p");
			p.innerHTML = 'The squares must be connected!';
			this.interface.appendChild(p);
			return;
		}

		var response = [];
		var numPositives = 0;
		for(let i = 0; i < realSquares.length; i++)
		{
			var pos = realSquares[i];
			var couldTreasureBeHere = this.config.map[pos.x][pos.y].botPositive;
			var string = couldTreasureBeHere ? "yes" : "no";
			response.push(string);
			if(couldTreasureBeHere) { numPositives += 1; }
		}

		var responseString = response.join(", ");
		if("aggregate" in data) { 
			responseString = 'the treasure could be in ' + numPositives + ' of the tiles investigated';
		}

		// "random fact" hint will give a regular response some of the time, but randomly pick something completely different
		// (a hint category, a fixed "propose" result)
		var randProb = 0.75
		if("randomFact" in data && Math.random() <= randProb) {
			
			var responses = ['category', 'count', 'other', 'aggregate'];
			var responseType = responses[Math.floor(Math.random() * responses.length)];

			var tilesLeft = this.config.tilesLeftPerPlayer[this.config.tilesLeftPerPlayer.length - 1];

			if(responseType == 'category') {
				var cats = this.config.botData.categories
				responseString = 'one of my hints has category <strong>' + cats[Math.floor(Math.random() * cats.length)] + '</strong>';
			} else if(responseType == 'count') {
				responseString = 'my hints leave ' + tilesLeft.length + ' possible tiles';
			} else if(responseType == 'other') {
				var tile = tilesLeft[Math.floor(Math.random() * tilesLeft.length)];
				responseString = 'the tile ' + this.convertToStringPos(tile) + ' could possibly contain the treasure';
			} else if(responseType == 'aggregate') {
				
				// just in case I ever decide to allow MORE tiles than two in these "randomFact" actions
				var allEqual = true;
				for(let i = 1; i < response.length; i++) {
					if(response[i] != response[i-1]) {
						allEqual = false;
						break;
					}
				}

				if(allEqual) {
					responseString = 'both tiles have the same answer (either both no or both yes)'
				} else {
					responseString = 'both tiles have a different answer (yes/no or no/yes)'
				}
			}
		}

		// Hardcoding this one, don't see why not
		// In the propose action, if our tiles happen to have been calculated, display their result
		if(actionName == "propose") 
		{
			var tileA = this.config.map[realSquares[0].x][realSquares[0].y];
			var tileB = this.config.map[realSquares[1].x][realSquares[1].y];
			var tileBAsString = this.convertToStringPos(tileB);

			if(tileBAsString in tileA.proposeData) 
			{
				var proposeData = tileA.proposeData[tileBAsString];
				responseString = 'if you change ' + squares[0] + ' to <strong>'

				var proposeDataText = [];
				for(const key in proposeData) 
				{
					if(key == "changed") { continue; }
					var val = proposeData[key]
					if(val == '') { val = 'no' }

					proposeDataText.push(val + " " + key)
				}

				responseString += proposeDataText.join(', ')
				responseString += "</strong>, the answer for " + squares[1];

				if(proposeData.changed) {
					responseString += ' changes';
				} else {
					responseString += ' does not change';
				}
			}
		}

		var finalString = 'Botbeard responds with: ' + responseString;

		this.interface.innerHTML = finalString;
		this.createBotBackButton();
	}

	showBotActionInterface(actionName: string | number)
	{
		this.interface.innerHTML = '<p>You decided to <strong>' + this.capitalize(actionName.toString()) + '</strong>. Where?</p>';

		// first create the actual dropdowns
		var allLocations = this.config.allLocationsAsStrings;
		var numDropdowns = this.actionData[actionName].numSquares;

		var container = document.createElement("div");
		container.classList.add("dropdownContainer");

		for(let i = 0; i < numDropdowns; i++) {
			var select = document.createElement("select");
			select.id = "dropdown-" + i;

			for(let a = 0; a < allLocations.length; a++)
			{
				var option = document.createElement("option");
				option.innerHTML = allLocations[a];
				option.value = allLocations[a];
				select.appendChild(option);
			}

			container.appendChild(select);
		}

		this.interface.appendChild(container);

		// then the button to submit that information
		var btn = document.createElement("button");
		btn.innerHTML = 'Submit';
		btn.addEventListener("click", (ev) => {

			var squares = [];
			for(let i = 0; i < numDropdowns; i++) {
				const elem : HTMLSelectElement = document.getElementById("dropdown-" + i) as HTMLSelectElement;
				squares.push(elem.value);
			}

			this.showBotActionResults(actionName.toString(), squares);
		})
		this.interface.appendChild(btn);
	}

	createBotActionButton(actionName: string)
	{
		var btn = document.createElement("button");
		btn.innerHTML = this.capitalize(actionName);
		btn.addEventListener("click", (ev) => {
			this.showBotActionInterface(actionName);
		})
		this.interface.appendChild(btn);
	}

	showBotInterface()
	{
		this.interface.innerHTML = messages.bot;

		// Show buttons to take actions
		this.createBotActionButton("dig");
		this.createBotActionButton("propose");
		//this.createBotActionButton("scan");

		var p = document.createElement('p');
		p.innerHTML = 'Or see my hints ... ';
		this.interface.appendChild(p);

		// Show buttons to reveal its hints
		var botHints = this.config.hintsPerPlayer[this.config.hintsPerPlayer.length - 1];
		for(let i = 0; i < botHints.length; i++) {
			this.createBotHintButton(i);
		}

		p = document.createElement('p');
		p.innerHTML = 'Want to check the map again?';
		this.interface.appendChild(p);
		this.createShowMapButton();

		// Give option to reveal the solution
		p = document.createElement('p');
		p.innerHTML = 'Done playing?';
		this.interface.appendChild(p);

		this.createSolutionButton();
	}

	/*
	* LOST RIDDLES EXPANSION
	*/
	showLostRiddleAnswerInterface()
	{
		var newHint = this.config.leftoverHints.pop();
		this.interface.innerHTML = "<p>" + newHint.html_text + "</p>";
		this.outOfLostRiddles = (this.config.leftoverHints.length == 0);

		var btn = document.createElement("button");
		btn.innerHTML = 'Continue';
		btn.addEventListener("click", (ev) => {
			this.showLostRiddleInterface();
		})
		this.interface.appendChild(btn);
	}

	showLostRiddleInterface()
	{
		if(this.outOfLostRiddles) {
			this.interface.innerHTML = "<p>Sorry, we're out of lost riddles.</p>";
		} else {
			this.interface.innerHTML = messages.lostRiddle;

			var btn = document.createElement("button");
			btn.innerHTML = 'Reveal a Lost Riddle';
			btn.addEventListener("click", (ev) => {
				this.showLostRiddleAnswerInterface();
			})
			this.interface.appendChild(btn);
		}

		this.createShowMapButton();

		var paragraph = document.createElement("p");
		paragraph.innerHTML = 'Done with the game? Check the solution (to be sure).';
		this.interface.appendChild(paragraph);
		this.createSolutionButton();
	}
}