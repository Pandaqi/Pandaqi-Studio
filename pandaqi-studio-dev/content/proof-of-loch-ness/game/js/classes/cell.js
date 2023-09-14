class Cell {

	constructor(pos) {
		this.pos = pos;

		this.terrain = 'grass';
		this.overlayTerrain = null;

		this.forest = false;

		this.monster = null;
		this.monsterVisited = false;

		this.hideout = null;

		this.food = null;
		this.water = null;

		this.tracks = {};

		this.players = [];
		this.animals = [];

		this.inquiries = {
			photograph: 0,
			collectibles: 0,
		}
	}

	/* BASE TERRAIN */
	setTerrain(t) {
		this.terrain = t;
	}

	setOverlayTerrain(t) {
		this.overlayTerrain = { type: t, sprite: null };
	}

	hasOverlayTerrain() {
		return (this.overlayTerrain != null);
	}

	/* EDGES */
	hasEdges() {
		for(var i = 0; i < 4; i++) {
			if(MAP.getEdgeAtDir(this.pos, i).hasContent()) {
				return true;
			}
		}
		return false;
	}

	/* FOR TRACKING HOW OFTEN THE CELL WAS SEARCHED */
	countInquiry(type) {
		this.inquiries[type]++;
	}

	getExtraProbFromInquiries(type) {
		return Math.max(Math.min( (this.inquiries[type]-1.0)/10.0, 1.0), 0.0);
	}

	/* PLAYERS */
	addPlayer(ind) {
		this.players.push(ind);
	}

	removePlayer(ind) {
		this.players.splice(this.players.indexOf(ind), 1);
	}

	countPlayers() {
		return this.players.length;
	}

	hasPlayers() {
		return (this.players.length > 0);
	}

	getPlayersByIndex() {
		return this.players;
	}

	/* WATER STUFF */
	isWater() {
		return (this.terrain == 'water');
	}

	/* ANIMALS */
	addAnimal(anim) {
		this.animals.push(anim);
	}

	removeAnimal(anim) {
		for(var i = 0; i < this.animals.length; i++) {
			if(this.animals[i].id == anim.id) {
				this.animals.splice(i, 1);
				break;
			}
		}
	}

	hasAnimals() {
		return (this.animals.length > 0);
	}

	getAnimals() {
		return this.animals;
	}

	getAnimalByIndex(i) {
		if(i < 0 || i >= this.animals.length) { return null; }
		return this.animals[i];
	}

	getRandomAnimal() {
		return this.animals[Math.floor(Math.random() * this.animals.length)];
	}

	countAnimals() {
		return this.animals.length;
	}

	getFirstAnimalWithStatus(stat) {
		for(var i = 0; i < this.animals.length; i++) {
			if(this.animals[i].dead == stat) { 
				return this.animals[i];
			}
		}
		return null;
	}

	removeFirstAnimalWithStatus(stat) {
		for(var i = 0; i < this.animals.length; i++) {
			if(this.animals[i].dead == stat) { 
				this.animals.splice(i, 1);
				break;
			}
		}
	}

	/* MONSTER */
	addMonster(mon) {
		this.monster = mon;
		this.monsterVisited = true;
	}

	removeMonster() {
		this.monster = null;
	}

	hasMonster() {
		return (this.monster != null);
	}

	getMonster() {
		return this.monster;
	}

	hasPartOfMultiSquareMonster() {
		var length = MONSTER.squaresNeeded;
		if(length <= 1) { return false; }

		// Say monster has "length" or "size" X (squares)
		// Then it's currently in this cell, if our position is somwhere in the last X cells of its path
		var path = MONSTER.completePath;
		for(var i = 0; i < length; i++) {
			var pos = path[path.length-1-i];
			if(pos.x == this.pos.x && pos.y == this.pos.y) {
				return true;
			}
		}

		return false;
	}

	/* WATER */
	addWaterSource() {
		this.water = { 'sprite': null, 'drunk': false, 'drunkTime': -1, 'special': false, 'creator': null }
	}

	hasUndrunkWaterSource() {
		return hasWaterSource(true);
	}

	hasWaterSource(undrunk = false) {
		if(STATE.getCurrentWeather() == "freezing") { return false; }

		return (this.water != null && (!undrunk || !this.water.drunk));
	}

	hasDrinkableWater() {
		return (this.hasWaterSource(true) || this.terrain == 'water');
	}

	drinkWater(creator) {
		// can't empty/drink a cell that's actually fully water
		// @TODO: this might need a more detailed check later
		if(this.terrain == 'water') { return; }

		this.water.drunk = true;
		this.water.sprite.setFrame(parseInt(this.water.sprite.frame.name)+1);
		this.water.drunkTime = STATE.moveCounter;
		this.water.creator = creator;
	}

	refillWater() {
		// @TODO: Check if it's special, because then the frames/settings might not be correct
		this.water.drunk = false;
		this.water.sprite.setFrame(parseInt(this.water.sprite.frame.name)-1);
		this.water.drunkTime = -1;
		this.water.creator = null;
	}

	updateWater() {
		if(weather == "rain") { this.refillWater(); }
	}

	/* FOOD */
	addFoodSource() {
		this.food = { 'sprite': null, 'eaten': false, 'eatTime': -1, 'spoiled': false, 'creator': null }
	}

	hasFoodSource(uneaten = false) {
		return (this.food != null && (!uneaten || !this.food.eaten));
	}

	eatFood(creator) {
		if(this.food.eaten) { return; }

		this.food.eaten = true;
		this.food.sprite.setFrame(parseInt(this.food.sprite.frame.name)+1);
		this.food.eatTime = STATE.moveCounter;
		this.food.creator = creator;
	}

	spoilFood() {
		if(this.food == null) { return; }
		if(!this.food.eaten) { return; }
		if(STATE.moveCounter - this.food.eatTime < 10) { return; }

		this.food.sprite.setFrame(parseInt(this.food.sprite.frame.name)+1);
		this.food.spoiled = true;
	}

	updateFood(weather) {
		this.spoilFood();
	}

	/* HIDEOUT */
	makeHideout(val) {
		this.hideout = { sprite: null };
	}

	isHideout() {
		return (this.hideout != null);
	}

	/* ENVIRONMENT TRACKS */
	addEnvironmentTrack(creator) {
		// WATER IS THE EXCEPTION: it creates ripples, doesn't go via overlay terrain
		// these go in four directions, so are a special case
		// EXCEPTION: if it freezes, water is frozen, so no ripples are created, just default footsteps
		if(this.terrain == 'water' && STATE.getCurrentWeather() != "freezing") {
			
			// pick a random direction (which is promising)
			// @TODO: Might pick TWO directions? Just put this in a for-loop, should work fine
			var nbs = [{x:1,y:0}, {x:0,y:1}, {x:-1,y:0}, {x:0, y:-1}];
			var randDir
			var goodDir = false;
			while(!goodDir && nbs.length > 0) {
				var index = Math.floor(Math.random() * nbs.length);
				randDir = nbs[index];

				var nbPos = { x: this.pos.x + randDir.x, y: this.pos.y + randDir.y }
				if(!MAP.possibleRipple(nbPos)) { 
					goodDir = false; 
					nbs.splice(index,1); 
					continue; 
				}

				nbs.splice(index,1);
				goodDir = true;
			}

			this.addTrack('ripple', creator, { 'dir': randDir });
		}

		if(!this.hasOverlayTerrain()) { return; }
		this.overlayTerrain.sprite.setFrame(parseInt(this.overlayTerrain.sprite.frame.name) + 1);
	}

	/* TRACKS */
	hasTracks() {
		return (Object.keys(this.tracks).length > 0);
	}

	addMovementTrack(creator) {
		// by default, grass land creates footprints
		var trackType = 'footprint';

		// sand terrain doesn't contain movement tracks
		// nor does water terrain (that isn't frozen)
		if(this.terrain == 'sand' || (this.terrain == 'water' && STATE.getCurrentWeather() != "freezing")) { return; }

		// bird monsters drop feathers
		if(creator.animalType == 'bird') { trackType = 'feather'; }

		// some tracks are only created RANDOMLY/SOME OF THE TIME, check that here
		if(Math.random() > TRACKS[trackType].prob) { return; }

		this.addTrack(trackType, creator);
	}

	updateWindTracks(weather) {
		if(weather != "windy") { return; }
		if(Math.random() > cfg.windTracksProbability) { return; }

		// wind creates random environment or edge tracks
		if(Math.random() <= 0.5) {
			this.addEnvironmentTrack(null);
		} else {
			for(var i = 0; i < 4; i++) {
				if(Math.random() > cfg.windTracksProbability) { continue; }

				var e = MAP.getEdgeAtDir(this.pos, i);
				e.createTrack();
			}
			
		}
	}

	addTrack(type, creator, params = {}) {
		var curMove = STATE.moveCounter;
		var obj = { 
			lastUpdate: curMove,
			timeCreated: curMove, 
			sprite: null,
			dir: null,
			creator: creator
		};

		// are we given a specific counter? set that!
		if(params.timeCreated) { obj.timeCreated = params.timeCreated; }

		// are we given a specific direction? copy that!
		if(params.dir) { obj.dir = params.dir; }

		// track already exists? remove it first
		if(this.tracks.hasOwnProperty(type)) {
			this.removeTrack(type);

			// if the track STRENGTHENS when combined
			// reset the counter
			if(TRACKS[type].combineTracks) {
				obj.timeCreated = curMove;
			}
		}

		// now create a new one
		obj.sprite = GAME.scene.keys.mainGame.addTrack(this.pos, creator, type);
		if(TRACKS[type].useRotation) {
			obj.sprite.rotation = Math.atan2(obj.dir.y, obj.dir.x); // .rotation = radians, .angle = degrees
		}

		this.tracks[type] = obj;
	}

	updateTracks(weather) {
		var curMove = STATE.moveCounter;

		for(key in this.tracks) {
			var tr = this.tracks[key];

			// lifesign tracks always fade away instantly
			if(key == "lifesign") { 
				this.removeTrack(key); 
				continue;
			}

			// it's snowing or raining? the track will disappear faster 
			if(weather == "snow" || weather == "rain") {
				tr.timeCreated -= 1;
			}

			// is it a footprint on water, but it's not freezing anymore? remove it immediately!
			// @TODO: Is this a good rule? And shouldn't I inform players this actually happens, in the rules?
			if(weather != "freezing") {
				if(this.terrain == "water" && key == "footprint") {
					this.removeTrack(key);
					continue;
				}
			}

			// permanent tracks do not fade away, so bail out
			// EXCEPTION: SNOW also fades out tracks that would otherwise be permanent
			if(!TRACKS[key].fadesAway && weather != "snow") { continue; }

			// track already updated? continue
			if(tr.lastUpdate == curMove) { continue; }
			tr.lastUpdate = curMove;

			// track should disappear? do so
			if((curMove - tr.timeCreated) >= TRACKS[key].counterReset) {
				this.removeTrack(key); 
				continue; 
			}

			// @TODO/DEBUGGING
			// Track fading is disabled for now; too many issues, not sure if even a good idea
			//GAME.scene.keys.mainGame.fadeTrack(tr.sprite, tr.counter);

			// ripple tracks move OUTWARD from their source
			if(key == 'ripple') {
				var newPos = { x: this.pos.x + tr.dir.x, y: this.pos.y + tr.dir.y }

				this.removeTrack('ripple');

				if(!MAP.possibleRipple(newPos)) { continue; }

				MAP.getCell(newPos).addTrack('ripple', tr.creator, { timeCreated: tr.timeCreated, dir: tr.dir });
			}
		}
	}

	removeTrack(type) {
		// remove sprite
		GAME.scene.keys.mainGame.removeTrack(this.tracks[type].sprite);

		// delete entry from dictionary
		delete this.tracks[type];
	}

	/* COLLECTIBLES */
	hasCollectible() {
		// every monster has its own type of track that can be considered "unique to them" (and must thus be collected)
		// we simply check if this cell has any of those particular tracks
		var whatCanBeCollected = MONSTER.collectibles;
		for(var i = 0; i < whatCanBeCollected.length; i++) {
			var obj = whatCanBeCollected[i];

			var coll = this.getMatchingCollectible(obj);
			if(coll) { return true; }
			
		}

		return false;
	}


	// (monster track = 0, non-monster track = 1, ..., ...)
	// NOTE: Monster always has id -1, other animals simply use 0 and upwards
	determineCollectibleType(obj) {
		var type = -1;
		if(obj.creator.id == -1) {
			type = 0;
		} else { 
			type = 1;
		}
		return type;
	}

	removeCollectible(obj) {
		var type = obj.type, key = obj.key

		if(type == "track") {
			this.removeTrack(key);
		} else if(type == "water") {
			this.removeWaterSource();
		} else if(type == "food") {
			this.removeFoodSource();
		} else if(type == "animal") {
			this.removeFirstAnimalWithStatus(key);
		}
	}

	getMatchingCollectible(obj) {
		var type = obj.type, key = obj.key

		if(type == "track") {
			if(this.tracks.hasOwnProperty(key)) {
				return this.tracks[key];
			}
		} else if(type == "water") {
			if(this.hasWaterSource(key)) {
				return this.water;
			}
		} else if(type == "food") {
			if(this.hasFoodSource(key)) {
				return this.food;
			}
		} else if(type == "animal") {
			return this.getFirstAnimalWithStatus(key);
		}
		return null;
	}

	fetchCollectible() {
		// for each collectible ...
		var whatCanBeCollected = MONSTER.collectibles;
		var numCollected = 0;
		var numCorrect = 0;
		for(var i = 0; i < whatCanBeCollected.length; i++) {
			var obj = whatCanBeCollected[i];

			// find a matching collectible
			var matchingCollectible = this.getMatchingCollectible(obj);
			if(matchingCollectible == null) { continue; }

			// determine its type
			var collType = this.determineCollectibleType(matchingCollectible);

			// add it to our inventory
			STATE.addToStat(collType, 1);
			numCollected += 1;
			if(collType == 0) { numCorrect += 1; }

			// remove it from the cell
			this.removeCollectible(obj);
		}

		return {
			numItemsCollected: numCollected,
			numItemsCorrect: numCorrect
		}
	}

	/* GENERAL */
	// Changing all sprites visibility at once 
	resetAllSprites(visible) {
		var prob = 1.0
		if(!visible) { prob = 0.0; }
		
		this.hideElementsForPicture(prob);
	}

	hasInterestingContent() {
		return (this.hasFoodSource() || this.hasWaterSource() || this.hasOverlayTerrain());
	}

	toggleInterestingContent(visible) {
		var prob = 1.0
		if(!visible) { prob = 0.0 }

		this.hideElementsForPicture(prob, false);
	}

	/* PICTURE / VISUAL REARRANGING STUFF */
	hideElementsForPicture(prob, affectMonster = true) {
		var gm = GAME.scene.keys.mainGame;
		var scn = SCENARIOS[cfg.scenario];

		// to make everything look nice, we arrange all content of this cell in a neat grid
		// however, we only do this here, because this is the only time users actually get to SEE the board
		var spritesToRearrange = [];

		// DON'T show the hideout if the whole objective is to find it
        // otherwise, just randomly show it following usual rules
        if(this.isHideout()) {
            var showHideout = false;
            if(scn.winCondition.type != 'hideout') { showHideout = true; }

            if(showHideout) {
                spritesToRearrange.push(this.hideout.sprite);
            } else {
                this.hideout.sprite.setVisible(false);                        
            }
        }

		if(this.hasFoodSource()) {
			spritesToRearrange.push(this.food.sprite);
		}

		if(this.hasWaterSource()) {
			spritesToRearrange.push(this.water.sprite);
		}

        if(this.hasOverlayTerrain()) {
            spritesToRearrange.push(this.overlayTerrain.sprite);
        }

		// NOTE: for now, we show ALL tracks
		if(this.hasTracks()) {
			for(key in this.tracks) {
				spritesToRearrange.push(this.tracks[key].sprite);
			}
		}

		if(this.hasMonster() && affectMonster) {
			var mon = MONSTER;

			var monsterWasVisible = mon.isVisibleInPicture(a);
			mon.sprite.setVisible(monsterWasVisible);

			var shouldShowMonsterRandomly = mon.specialPictureVisibility.randomlyShowInPictures;

			var winCond = SCENARIOS[cfg.scenario].winCondition.type;
			if(winCond != 'photograph' && winCond != 'video') { shouldShowMonsterRandomly = true; }

			// some monsters will randomly show up, just like all other elements
			// NOTE: this happens for all monsters, if our objective has nothing to do with photographs
			if(!monsterWasVisible && shouldShowMonsterRandomly) {
				spritesToRearrange.push(mon.sprite);
			}

			// if the monster was visible (through photograph rules!)
			// we matched a photograph, which will make us win (if that's our objective)
			if(monsterWasVisible && !cfg.debugging) {
				MONSTER.matchedPhotograph = true;
			}
		}

		// we add a quick "life sign" track here, that is immediately removed after the picture
		// (seems the most efficient and painless way to handle this)
        if(this.hasPartOfMultiSquareMonster()) {
        	this.addTrack('lifesign');
        	spritesToRearrange.push(this.tracks.lifesign.sprite);
        }

        if(this.hasAnimals()) {
        	for(var i = 0; i < this.animals.length; i++) {
        		spritesToRearrange.push(this.animals[i].sprite);
        	}
        }

        this.rearrangeSprites(spritesToRearrange, prob);
    }

    rearrangeSprites(arr, prob) {
    	var num = arr.length;
    	var cs = Math.min(cfg.cellSizeX, cfg.cellSizeY);

    	// first, determine which sprites we actually want to show => remove those we don't
    	// (Because we check _per element_ if we want to show it or not)
    	for(var i = (num-1); i >= 0; i--) {
			var tempProb = prob;
			var show = (Math.random() <= tempProb);

			if(show) { continue; }

			arr[i].setVisible(false);
			arr.splice(i, 1);
    	}

    	num = arr.length;

    	// Now show, reposition and resize all elements that are at this location
		for(var i = 0; i < num; i++) {
			var sp = arr[i];

			var col = i % 2;
			var row = Math.floor(i / 2);
			var newScale = 0.5*cs;

			// Exception: just one element? center it, scale fully
			if(num == 1) { col = 0.5; row = 0.5; newScale = cs; }

			var newX = (this.pos.x + 0.25 + 0.5*col)*cfg.cellSizeX; 
			var newY = (this.pos.y + 0.25 + 0.5*row)*cfg.cellSizeY;

			sp.setVisible(true);
			sp.setPosition(newX, newY);
			sp.displayWidth = sp.displayHeight = newScale;
		}
    }


}