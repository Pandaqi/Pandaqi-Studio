import Config from "./config"
import HintBuilder from "./hintBuilder"
import Map from "./map"
import { DISCRETE_LISTS, HINT_CATEGORIES, HINT_DICT } from "./dictionary"

export default {

	solution: false,

	hintGenFail: false,
	numHintGens: 0,
	maxGenTries: 2, // 20

	availableHints: [],
	fullList: {}, // keys are hint categories; allows easy balancing/fair distribution
	finalList: {},
	cachedStrippedLists: [], // caches the result of stripping the list for a hint, so we can reuse it later easily; based on unique id assigned to hints

	perPlayer: [],
	categories: [],

	buildForDownload: false,

	initialize()
	{
		if(!Config.generateHints) { this.solution = true; return; }

		this.hintGenFail = true;
		this.solution = false;
		this.buildForDownload = false;
		this.numHintGens = -1;

		this.fullList = {}; // to reset whenever we do a new generation; do NOT put this in the build() function

		this.prepare();
		Map.treasure();

		let failed = false;
		while(this.hintGenFail)
		{
			this.hintGenFail = false;
			this.numHintGens += 1;

			if(this.numHintGens >= this.maxGenTries) 
			{ 
				failed = true;
				break; 
			}

			this.build();
			this.reduce();
			if(this.hintGenFail) { continue; }

			this.distribute();
			if(this.hintGenFail) { continue; }

			this.checkFairness();
			if(this.hintGenFail) { continue; }

			this.saveBotbeardInformation();
		}

		this.solution = !failed;
	},

	prepare()
	{
		if(this.availableHints.length > 0) { return; }

		this.availableHints = structuredClone(HINT_DICT);
		this.categories = HINT_CATEGORIES.slice();

		if(!Config.expansions.rot) { 
			this.categories.splice(this.categories.indexOf("rotation"), 1);
		}

		if(!Config.expansions.networks) { 
			this.categories.splice(this.categories.indexOf("network"), 1);
		}

		if(!Config.expansions.symbols) { 
			this.categories.splice(this.categories.indexOf("symbols"), 1);
		}

		if(!Config.expansions.special) { 
			this.categories.splice(this.categories.indexOf("special"), 1);
		}
	},

	build()
	{
		let alreadyHaveHints = (Object.keys(this.fullList).length > 0);
		if(alreadyHaveHints) { return; }

		const treasureLocation = Map.treasureLocation;
		
		if(this.buildForDownload) { this.categories = HINT_CATEGORIES.slice(); }
		for(let i = 0; i < this.categories.length; i++)
		{
			this.fullList[this.categories[i]] = [];
		}

		// Build ALL possible hints
		this.cachedStrippedLists = [];
		for(let i = 0; i < this.availableHints.length; i++) 
		{
			let originalHint = this.availableHints[i];

			let categoryIsForbidden = !this.categories.includes(originalHint.category);
			if(categoryIsForbidden) { continue; }

			let expansionMissing = ("expansion" in originalHint) && !Config.expansions[originalHint.expansion] && !this.buildForDownload;
			if(expansionMissing) { continue; }

			let forbiddenBecauseAdvanced = ("advanced" in originalHint) && !Config.advancedHints && !this.buildForDownload;
			if(forbiddenBecauseAdvanced) { continue; }

			// This is an array of arrays
			// It starts with ONE entry (with exactly enough space to hold all params)
			// Over time, this entry gets duplicated to create ALL possible combinations of options
			let values = [Array(originalHint.params.length)];	

			// Now generate all these combinations of input parameters
			for(let p = 0; p < originalHint.params.length; p++) 
			{
				const param = originalHint.params[p];

				if("variable" in param) { continue; }

				// generate list of all values THIS parameter can take on
				const prop = param.property;
				let list = [];
				let realValue = 'unknown';
				if(param.type == "discrete") 
				{
					list = DISCRETE_LISTS[prop].slice();
					realValue = treasureLocation[prop];
				}

				// Now add this value to all the existing fixedValues to create all possible combinations
				const newValues = [];
				for(let a = 0; a < list.length; a++)
				{
					for(let b = 0; b < values.length; b++) 
					{
						let newVal = values[b].slice();
						newVal[p] = list[a];
						newValues.push(newVal);
					}
				}

				values = newValues;

				// for download we only need ONE of each type
				if(this.buildForDownload) 
				{ 
					const randValue = values[Math.floor(Config.rng.hints() * values.length)];
					values = [randValue]; 
				}
			}

			// And finally actually BUILD the hints according to these combinations
			let mustBeDifferent = ("different" in originalHint);
			for(let a = 0; a < values.length; a++)
			{
				let hint = structuredClone(originalHint);
				hint.values = values[a];
				
				let params = {
					cell: treasureLocation,
					hint: hint,
					target: 'calculate'
				}
				HintBuilder.build(params);

				if(mustBeDifferent && this.arrayHasDuplicates(hint.values)) { continue; }

				// when building for download, we just want all hints (don't care about usefulness in this specific game)
				if(this.buildForDownload) { this.fullList[hint.category].push(hint); continue; }

				let strippedList = Map.mapList.slice();
				this.stripList(strippedList, params.hint);

				let hintIsTooPowerful = (strippedList.length <= Config.minTilesLeftPerHint);
				let hintIsTooWeak = (strippedList.length >= (Map.mapList.length - Config.minTilesRemovedPerHint));
				if(hintIsTooPowerful || hintIsTooWeak) { continue; }

				if(hint.category == "network")
				{
					let onlyNetworkTiles = strippedList.slice();
					this.stripNonNetworkTiles(onlyNetworkTiles);
					let badNetworkHint = (Math.abs(onlyNetworkTiles.length - Map.networkTiles.length) <= 2);
					if(badNetworkHint) { continue; }
				}

				let numericID = this.cachedStrippedLists.length;
				hint.numericID = numericID;
				this.cachedStrippedLists.push(strippedList);
				this.fullList[hint.category].push(hint);
			}
		}

		// Shuffle per category
		for(const category in this.fullList) 
		{
			this.shuffle(this.fullList[category]);
		}

		if(Config.debugging) { console.log("FULL HINT LIST"); console.log(this.fullList); }
	},

	reduce()
	{
		this.finalList = {};
		this.fullListCopy = {};
		for(let i = 0; i < this.categories.length; i++)
		{
			let cat = this.categories[i];
			this.finalList[cat] = [];
			this.fullListCopy[cat] = this.fullList[cat].slice();
		}

		let multipleSolutions = true;
		let validLocations = Map.mapList.slice();

		let totalNumHints = 0;
		let categoryCounter = 0;

		let forbidGeneralHints = false;
		let forbidSwapResistantHints = false;

		// Keep adding more and more hints until we've pinpointed the treasure location and nothing else
		let strippedLists = [];
		while(multipleSolutions)
		{
			if(this.countElementsInDictionary(this.fullListCopy) <= 0) { break; }

			let category = this.categories[categoryCounter];
			let availableHints = this.fullListCopy[category];
			categoryCounter = (categoryCounter + 1) % this.categories.length;

			if(category == "general" && forbidGeneralHints) { continue; }

			let noHintsInCategory = (availableHints == undefined || availableHints.length <= 0);
			if(noHintsInCategory) { continue; }

			// let fewHintsInCategory = (availableHints.length <= 3);
			// if(fewHintsInCategory && Math.random() <= 0.5) { continue; }

			let prevNumSolutions = validLocations.length;
			let oldValidLocations = validLocations.slice();

			let newHint = availableHints.pop();
			let isSwapResistant = ("swapResistant" in newHint);
			if(isSwapResistant && forbidSwapResistantHints) { continue; }

			this.stripList(validLocations, newHint);
			
			// @TODO: There should be some CLEANER way to reset the locations list to what it was before we stripped the list
			// Because now I keep accidentally creating nasty bugs by forgetting to reset it, or using the wrong thing, etcetera

			let strippedList = [];
			if(validLocations.length > 1) 
			{
				// hints only need to be impactful when we have lots of tiles left
				// when we're already near the end, a hint often only removes 1 or 2 tiles, logically
				let hintDidNothing = (prevNumSolutions == validLocations.length);
				let hintDidAlmostNothing = (Math.abs(prevNumSolutions - validLocations.length) < Config.minImpactPerHint);
				
				if(hintDidNothing || (hintDidAlmostNothing && prevNumSolutions >= 4)) 
				{ 
					validLocations = oldValidLocations; 
					continue; 
				}

				let checkRedundancy = !Config.fastGeneration;
				if(checkRedundancy)
				{
					// we only check against the hints we've already decided on
					strippedList = this.cachedStrippedLists[newHint.numericID];
					let isRedundant = this.checkIfSublist(strippedList, strippedLists);
					if(isRedundant) { validLocations = oldValidLocations; continue; }
				}
			}

			this.finalList[category].push(newHint);
			strippedLists.push(strippedList);

			totalNumHints += 1;
			multipleSolutions = (validLocations.length > 1);

			// in fast generation, we don't check sublists
			// general hints are most likely to produce sublist redundancy, so only allow one of those hints at most
			if(Config.fastGeneration && category == "general") { forbidGeneralHints = true; }
			if(isSwapResistant) { forbidSwapResistantHints = true; }

			let tooManyHintsNeeded = totalNumHints > Config.playerCount*Config.maxHintsPerPlayer;
			if(tooManyHintsNeeded)
			{
				this.hintGenFail = true;
				if(Config.debugging) { console.log("FAIL: Too many hints"); }
				return;
			}
		}

		if(validLocations.length != 1)
		{
			this.hintGenFail = true;
			if(Config.debugging) { console.log("FAIL: No single tile solution (probably ran out of hints to try)"); }
			return;
		}

		if(totalNumHints < Config.playerCount*Config.minHintsPerPlayer) 
		{
			this.hintGenFail = true;
			if(Config.debugging) { console.log("FAIL: Too few hints"); }
			return;
		}


	},

	distribute()
	{
		this.shuffle(this.categories);

		this.perPlayer = [];
		for(let i = 0; i < Config.playerCount; i++)
		{
			this.perPlayer[i] = [];
		}

		let curPlayer = Math.floor(Config.rng.hints() * Config.playerCount);
		for(let i = 0; i < this.categories.length; i++)
		{
			let list = this.finalList[this.categories[i]];
			this.shuffle(list);

			for(let a = 0; a < list.length; a++)
			{
				this.perPlayer[curPlayer].push(list[a]);
				curPlayer = (curPlayer + 1) % Config.playerCount;
			}
		}

		if(Config.debugging) { console.log("Hints PER PLAYER"); console.log(this.perPlayer); }
	},

	checkFairness()
	{
		let offset = 0;
		if(Config.fastGeneration) { offset = Math.floor(0.15*Config.totalTileCount); }

		let minOptionsLeft = Math.round(0.4*Config.totalTileCount) - offset; // min options is the more important number
		let maxOptionsLeft = Math.round(0.8*Config.totalTileCount) + offset;

		// first we calculate how many tiles each player has left
		// and do an absolute check: must be between some min and max
		let failed = false;
		let tilesLeftPerPlayer = [];
		for(let i = 0; i < Config.playerCount; i++)
		{
			let hints = this.perPlayer[i];
			let list  = Map.mapList.slice();
			let prevNumSolutions;
			
			for(let h = 0; h < hints.length; h++)
			{
				prevNumSolutions = list.length;
				this.stripList(list, hints[h]);
				if(Math.abs(prevNumSolutions - list.length) >= Config.minImpactPerHint) { continue; }
				
				failed = true;
				break;
			}

			tilesLeftPerPlayer.push(list);

			if(list.length < minOptionsLeft) { if(Config.debugging) { console.log("FAIL: Too few tiles at start for player"); } failed = true; }
			if(list.length > maxOptionsLeft) { if(Config.debugging) { console.log("FAIL: Too many tiles at start for player"); } failed = true; }
			if(failed) { break; }
		}

		Map.tilesLeftPerPlayer = tilesLeftPerPlayer;

		if(Config.debugging) {
			console.log("TILES LEFT PER PLAYER");
			console.log(tilesLeftPerPlayer);
		}

		if(failed) 
		{ 
			this.hintGenFail = true; 
			return; 
		}

		// then we do a relative check: the difference between the values of different players
		let maxDifference = Math.round(0.4*Config.totalTileCount) + offset;
		for(let a = 0; a < Config.playerCount; a++)
		{
			for(let b = 0; b < Config.playerCount; b++)
			{
				if(a == b) { continue; }
				if(Math.abs(tilesLeftPerPlayer[a].length - tilesLeftPerPlayer[b].length) <= maxDifference) { continue; }
				failed = true;
				break;
			}

			if(failed) { break; }
		}

		if(failed) 
		{ 
			console.log("FAIL: Hints unbalanced");
			this.hintGenFail = true; 
			return;
		}
	},

	// NOTE: This is optimized based on the assumption that all these lists are SORTED the same
	// So make sure Map.mapList is NOT shuffled during all these checks
	checkIfSublist(newList, existingLists)
	{
		if(existingLists.length <= 0) { return false; }

		for(let i = 0; i < existingLists.length; i++)
		{
			let smallerList = newList;
			let biggerList = existingLists[i];

			if(biggerList == smallerList) { continue; }
			if(biggerList.length < smallerList.length)
			{
				smallerList = existingLists[i];
				biggerList = newList;
			}

			// find index of first match (if none at all, immediately skip forward)
			let curIndex = biggerList.indexOf(smallerList[0]);
			if(curIndex < 0) { continue; }

			let allMatch = false;
			for(let a = 1; a < smallerList.length; a++)
			{
				// # elements in bigger list is SMALLER than # elements we still need to check => subset impossible!
				let notEnoughSpaceToMakeSubset = (biggerList.length - curIndex) < (smallerList.length - a);
				if(notEnoughSpaceToMakeSubset) { break; }

				// otherwise just look ahead until we find a match => record if it was the last match we needed
				for(let b = (curIndex+1); b < biggerList.length; b++)
				{
					if(biggerList[b] != smallerList[a]) { continue; }

					curIndex = b;
					if(a == smallerList.length - 1) { allMatch = true; }
					break;
				}
			}

			if(allMatch) { return true; }
		}

		return false;
	},

	stripNonNetworkTiles(arr)
	{
		for(let i = arr.length-1; i >= 0; i--)
		{
			if(Map.isNetworkTile(arr[i])) { continue; }
			arr.splice(i, 1);
		}
	},

	stripList(arr, hint)
	{
		for(let i = arr.length-1; i >= 0; i--)
		{
			let img = hint.image;
			delete hint.image;

			let newHint = structuredClone(hint);

			let params = {
				"cell": arr[i],
				"hint": newHint,
				"target": "check"
			}
			HintBuilder.build(params);

			hint.image = img;

			if(this.match(newHint, hint)) { continue; }
			arr.splice(i, 1);
		}
	},

	match(a,b)
	{
		return this.arraysAreEqual(a.values, b.values);
	},

	saveBotbeardInformation()
	{
		if(!Config.addBot) { return; }

		let list = this.getBotbeardPositiveList();
		for(let i = 0; i < list.length; i++)
		{
			list[i].botPositive = true;
		}

		// count the number of changes due to swaps, to see how likely it even is
		if(Config.debugging)
		{
			let numSwaps = 100;
			let numChanges = 0;
			for(let i = 0; i < numSwaps; i++)
			{
				let tileA = Map.getRandomTile();
				let tileB = Map.getRandomTile();
				let answerChanged = Map.testTileSwap(tileA, tileB);

				if(answerChanged[0]) { numChanges++; }
				if(answerChanged[1]) { numChanges++; }
			}

			console.log("TESTING SWAPS (through Botbeard)");
			console.log(numSwaps);
			console.log(numChanges);
		}
	},

	getBotbeardPositiveList()
	{
		let list = Map.mapList.slice();
		let botHints = this.perPlayer[this.perPlayer.length-1];
		for(let i = 0; i < botHints.length; i++)
		{
			this.stripList(list, botHints[i]);
		}
		return list;
	},

	/* UTILITIES */
	getAsFullList()
	{
		return this.getAsList(this.fullList);
	},

	getAsList(list = this.finalList)
	{
		let arr = [];
		for(const category in list)
		{
			for(let i = 0; i < list[category].length; i++)
			{
				arr.push(list[category][i]);
			}
		}
		return arr;
	},

	arraysAreEqual: function(a,b)
	{
		if(a.length != b.length) { return false; }

		for(let i = 0; i < a.length; i++) {
			if(a[i] != b[i]) { return false; }
		}
		return true;
	},

	arraysAreNonEqual: function(a,b)
	{
		if(a.length != b.length) { return false; }

		for(let i = 0; i < a.length; i++) {
			if(a[i] == b[i]) { return false; }
		}
		return true;
	},

	arraysOneMatch: function(a,b)
	{
		for(let i = 0; i < a.length; i++) {
			if(i >= b.length) { break; }
			if(a[i] == b[i]) { return true; }
		}
		return false;
	},

	arrayHasDuplicates(a)
	{
		return (new Set(a)).size !== a.length;
	},

	handleExclusions(arr, exclude) 
	{
		for(let i = 0; i < exclude.length; i++) 
		{
			let ind = arr.indexOf(exclude[i]);
			if(ind < 0) { continue; }
			arr.splice(ind, 1);
		}
	},

	shuffle(a) {
	    let j, x, i;
	    for (i = a.length - 1; i > 0; i--) {
	        j = Math.floor(Config.rng.general() * (i + 1));
	        x = a[i];
	        a[i] = a[j];
	        a[j] = x;
	    }

	    return a;
	},

	countElementsInDictionary(dict)
	{
		let sum = 0;
		for(const key in dict) {
			sum += dict[key].length;
		}
		return sum;
	},

	createFullListForDownload()
	{
		this.fullList = {};
		this.buildForDownload = true;
		this.build();
		return this.getAsFullList();
	}

};