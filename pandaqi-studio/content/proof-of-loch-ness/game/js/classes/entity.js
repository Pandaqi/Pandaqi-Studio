class Entity {
	constructor(type) {
		this.type = type;
		this.pos = { x: -1, y: -1 };
		this.sprite;

		this.game = null;

		this.completePath = [];
		this.lastMoveDir = null;

		// whether we drank water or ate something THIS TURN
		// (useful when communicating with other monster functions)
		this.justDrank = false;
		this.justAte = false;

		// whether we drank water or ate something AT SOME POINT
		// (which we haven't released yet by peeing or pooping)
		this.hasEaten = false;
		this.hasDrunk = false;

		// Create quick link to the scenario
		this.scn = SCENARIOS[cfg.scenario];
	}

	isType(t) {
		return (this.type === t);
	}

	registerGame() {
		this.game = GAME.scene.keys.mainGame;
	}

	attachSprite(s) {
		this.sprite = s;
	}

	/* PATHFINDING */
	checkPathFinder(speed = 1) {
		if(this.path == null) { return false; }

		for(var i = 0; i < speed; i++) {
			this.setPos(this.path.splice(0, 1)[0]);

			if(this.path.length <= 0) { this.path = null; break; }
		}
		
		return true;
	}

	findPath(target) {
		this.path = calculateRoute({}, MAP.map, this.pos, target.pos);
	}

	/* ALTERNATIVE WIN CONDITIONS */
	getMostVisitedPos() {
		var freqs = {};
		for(var i = 0; i < this.completePath.length; i++) {
			var p = this.completePath[i];
			var id = p.x + "-" + p.y;

			if(!freqs.hasOwnProperty(id)) { freqs[id] = 0; }
			freqs[id]++;
		}

		const getMax = object => {
	        return Object.keys(object).filter(x => {
	             return object[x] == Math.max.apply(null, 
	             Object.values(object));
	       });
	    };

	    return getMax(freqs);

	    // Only picks one value; but there could be multiple best ones
		// var highestFreqKey = Object.keys(freqs).reduce(function(a, b){ return obj[a] > obj[b] ? a : b });
		
	}

	/* THE BIG MOVING FUNCTION! */
	setPos(pos, params = {}) {
		// remove from old cell (if it exists)
		var oldPos = this.pos;
		if(oldPos.x > -1 && oldPos.y > -1) {
			var oldCell = MAP.getCell(oldPos);

			if(this.entityType == "monster") {
				oldCell.removeMonster();
			} else if(this.entityType == "animal") {
				oldCell.removeAnimal(this);
			}

			this.lastMoveDir = { x: pos.x - oldPos.x, y: pos.y - oldPos.y };
		}

		// add to new cell
		this.pos = pos;
		var newCell = MAP.getCell(pos);

		if(this.entityType == "monster") {
			newCell.addMonster(this);
		} else if(this.entityType == "animal") {
			newCell.addAnimal(this);
		}
		
		// if this is not a MOVEMENT, but just a HARD POSITION (RE)SET, ignore any stuff below
		if(params.hardResetPos) { return; }

		// keep track of full path
		this.completePath.push(pos);

		// move actual in-game sprite
		if(this.game && this.sprite) {
			this.game.moveSprite(this.sprite, pos);
		}

		//
		// TRACKS
		//

		// add movement track, if needed
		// EXCEPTION: when it snows, the monster can try all it wants, it WILL create movement tracks
		if(!params.hideMovementTrack || (params.hideMovementTrack && STATE.getCurrentWeather() == "snow")) {
			this.addMovementTrack(this);
		}

		// add environment track, if needed
		if(!params.hideEnvironmentTrack) {
			this.addEnvironmentTrack();
		}

		// add edge track
		if(!params.hideEdgeTrack) {
			this.addEdgeTrack();
		}

		//
		// WATER
		//
		this.justDrank = false;
		if(!params.ignoreWater) {
			if(newCell.hasDrinkableWater()) {
				newCell.drinkWater(this);
				this.drink();
			}
			
		}

		//
		// FOOD
		//

		// @TODO: figure out how to set "eat->poop cycle"; per monster? a probability, or a min-max set of turns, or a "how much can our belly hold"?
		this.justEaten = false;
		var poopProbability = 0.5
		if(this.hasEaten && Math.random() <= poopProbability) {
			this.poop();
		}

		// eat, if we're on a food source
		if(!params.ignoreFood) {
			if(newCell.hasFoodSource()) {
				newCell.eatFood(this);
				this.eat();
			}
		}

		// eat, if we're a carnivore, and sharing the space with animals
		if(this.isCarnivore && newCell.hasAnimals()) {
			var randAnimal = newCell.getRandomAnimal();
			randAnimal.receiveAttack(this, true);
		}
	}

	eat() {
		this.justEaten = true;
		this.hasEaten = true;
	}

	poop() {
		if(!this.scn.tracksIncluded.droppings) { return; }

		this.hasEaten = false;
		MAP.getCell(this.pos).addTrack('poop', this);
	}

	drink() {
		this.justDrank = true;
		this.hasDrunk = true;
	}

	// UNUSED at the moment
	pee() {
		if(!this.scn.tracksIncluded.droppings) { return; }

		this.hasDrunk = false;
		MAP.getCell(this.pos).addTrack('pee', this);
	}

	addEnvironmentTrack() {
		if(!this.scn.tracksIncluded.environment) { return; }
		if(Math.random() > this.scn.probabilities.environmentTracks) { return; }

		console.log("Entity of type " + this.entityType + " creates an environment track");

		MAP.getCell(this.pos).addEnvironmentTrack(this);
	}

	addMovementTrack() {
		if(!this.scn.tracksIncluded.movement) { return; }
		if(!this.moving.createMovementTracks) { return; }

		MAP.getCell(this.pos).addMovementTrack(this);
	}

	addEdgeTrack() {
		if(!this.scn.tracksIncluded.edges) { return; }
		if(this.lastMoveDir == null) { return; }

		var dir = Math.floor(Math.atan2(this.lastMoveDir.y, this.lastMoveDir.x) / (2*Math.PI) * 4)
		var oppositeDir = (dir + 2) % 4
		
		var edge = MAP.getEdgeAtDir(this.pos, oppositeDir);
		edge.createTrack();

	}
}