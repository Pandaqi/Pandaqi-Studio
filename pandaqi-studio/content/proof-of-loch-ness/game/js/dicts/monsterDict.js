var DEFAULT_MONSTER = {
	setup: function() {
		console.log("Default Monster Setup");
	},
	moving: {
		prob: 1.0,
		steps: 1,
		createMovementTracks: true
	},
	pictureVisibility: { w: 0, h: 0},
	specialPictureVisibility: { w: 0, h: 0, terrain: null, randomlyShowInPictures: false },
	startLocationProps: {},
	frame: -1,
	squaresNeeded: 1,
	collectibles: [{ type: 'track', key: 'footprint' }], // tracks (key = key), food (key = undrunk), water (key = undrunk), animal (key = dead)
	animalType: 'walker', // "walkers" create footprints, "birds" drop feathers in flight
	isCarnivore: false,
	hideout: {
		enabled: false,
		requirements: {},
		type: 'startPos'
	},
	terrain: {
		type: 'grassland'
	}
}

var MONSTERS = {
	"Unicorn": {
		name: "Unicorn",
		frame: 2,
		setup: function() {
			this.favouritePlayer = Math.floor(Math.random()*cfg.playerCount);
			this.pickingDir = (Math.random() <= 0.5) ? 1 : -1;

			console.log("Unicorn setup");
		},
		startLocationProps: { minPlayerDist: 3},
		pictureVisibility: { w: 1, h: 1 },
		specialPictureVisibility: { w: 2, h: 2 },
		pickableProperties: [{key:'favouritePlayer', type: 'player'}, {key:'pickingDir', type: 'dir'}],
		customProps: {
			favouritePlayer: 0,
			pickingDir: 1,

			pickNewFavourite: function() {
				this.favouritePlayer = (this.favouritePlayer + this.pickingDir + cfg.playerCount) % cfg.playerCount;
			}
		},

		move: function() {
			var pos = this.pos;

			// hide ourselves (if currently visible)
			if(this.showMyself) {
				this.hide();
			}

			// check where our favourite player is and how to get there
			var favo = PLAYERS[this.favouritePlayer];
			var p = favo.getPos();
			var vec = { x: p.x - pos.x, y: p.y - pos.y };
			if(vec.x != 0) { vec.x /= Math.abs(vec.x); }
			if(vec.y != 0) { vec.y /= Math.abs(vec.y); }

			// move towards it, but one step at a time 
			var newPos = { x: pos.x + vec.x, y: pos.y + vec.y };
			MONSTER.setPos(newPos);

			// is there another player on our location? 
			// Hug it! (Disables it for one turn.)
			var playersHere = MAP.getCell(newPos).getPlayersByIndex();
			var hasHugged = false;
			for(var i = 0; i < playersHere.length; i++) {
				PLAYERS[playersHere[i]].setDisabled(true);
				hasHugged = true;
			}

			// are we at our favourite player?
			// => Pick a new favourite in the chosen direction!
			if(favo.isAtPos(newPos)) {
				this.pickNewFavourite();
			}

			// we've hugged? we're more visible (only this turn)!
			if(hasHugged) {
				this.show();
			}
		}
	},

	"Pegasus": {
		name: "Pegasus",
		frame: 2,
		setup: function() {
			console.log("Pegasus Setup");
		},
		customProps: {
			fly: function() {
				this.isFlying = true;
				this.showMyself = true;

				this.flyTimer = STATE.moveCounter + this.flyInterval;

				var dirs = [{x:1,y:0},{x:0,y:1},{x:-1,y:0},{x:0,y:-1}]
				this.flyDir = dirs[Math.floor(Math.random()*4)];
			},

			stopFlying: function() {
				this.isFlying = false;
				this.showMyself = false;

				this.flyTimer = STATE.moveCounter + this.flyInterval;
			},
			isFlying: false,
			flyInterval: 4,
			flyTimer: 0
		},

		move: function() {
			// check if we want to START FLYING
			// (timer resets or we're sharing our square with players)
			var pos = this.pos;
			var curMove = STATE.moveCounter;

			var curCell = MAP.getCell(pos);
			var newCell = curCell;
			if(!this.isFlying) {
				if(curMove >= this.flyTimer || curCell.hasPlayers()) {
					this.fly();
				}
			}

			// if we're FLYING, take another step forward
			// NOTE: if not, we literally just stand still
			if(this.isFlying) {
				var newPos = { x: pos.x + this.flyDir.x, y: pos.y + this.flyDir.y }

				// can't go further? stop flying
				if(MAP.outOfBounds(newPos)) {
					this.isFlying = false;

				// otherwise, move and check if we need to inform players
				} else {
					this.setPos(newPos);

					newCell = MAP.getCell(newPos);
					if(newCell.hasPlayers()) {
						STATE.addToMoveFeedback("<p>You hear wings over your head!</p>");
					} else if(MAP.checkIfPlayersWithinRange(newPos, 1)) {
						STATE.addToMoveFeedback('<p>You hear wings in the distance!</p>');
					}
				}
			}

			// check if we want to STOP FLYING
			if(curMove >= this.flyTimer && !newCell.hasPlayers()) {
				this.stopFlying();
			}
		}
	},

	"Nessie": { 
		name: "Nessie",
		frame: 0,
		setup: function() {
			this.needAirInterval = Math.floor(Math.random()*4) + 2;
			this.needAirTimer = Math.floor(Math.random() * this.needAirInterval);

			this.loudnessRadius = Math.floor(Math.random()*3) + 1;
			console.log("Nessie Setup");
		},
		pictureVisibility: { w: 1, h: 1 },
		specialPictureVisibility: { w: 2, h: 2},  
		startLocationProps: { water: true, minPlayerDist: 4 }, 
		terrain: {
			type: 'lake'
		},
		customProps: {
			needAirInterval: 4,
			needAirTimer: 2,
			loudnessRadius: 2,
			moveDir: null,
		},

		move: function() {
			var pos = this.pos;
			var curMove = STATE.moveCounter;

			// go underwater again (if necessary)
			if(this.showMyself) { this.hide(); }

			// check if we should come up for air
			// (we keep to our intervals, meaning the next one is always planned randomly within the NEXT interval)
			var airInt = this.needAirInterval;
			if(curMove >= this.needAirTimer) {
				this.show();
				this.needAirTimer = Math.ceil(curMove / airInt) * airInt + Math.floor(Math.random() * airInt);

				// also, inform players (if near) that we're coming up
				var makeSound = MAP.checkIfPlayersWithinRange(pos, this.loudnessRadius);
				if(makeSound) { STATE.addToMoveFeedback('<p>You hear a loud sound!</p>'); }
			}

			// get neighbours with uneaten food sources, avoid your own tracks, or _all neighbours_ otherwise
			var preferredDir = null
			if(!this.showMyself) { preferredDir = this.lastMoveDir; }

			var moveParams = { 
				'foodSource': true, 
				'forbidCrossOwnPath': true, 
				'alwaysReturn': true, 
				'preferredDir': preferredDir,
			}
			var moveWeights = {
				'foodSource': 1,
				'forbidCrossOwnPath': 3,
				'preferredDir': 2
			}

			var nbs = MAP.getValidNeighbours(pos, moveParams, moveWeights);

			// grab a random one
			var newPos = nbs[Math.floor(Math.random()*nbs.length)];

			// and move
			this.setPos(newPos);
		},
	},

	"CactusCat": {
		name: "Cactus Cat",
		frame: 1,
		setup: function() {
			this.drunkResetInterval = Math.floor(Math.random()*3) + 2;
			this.drunkSpeed = Math.floor(Math.random()*3) + 1;
			this.loudnessRadius = Math.floor(Math.random()) + 2;

			console.log("Cactus Cat Setup");
		},
		pictureVisibility: { w: 0, h: 0 },
		specialPictureVisibility: { w: 3, h: 3 },
		startLocationProps: { minPlayerDist: 3 },
		terrain: {
			type: 'desert'
		},
		pickableProperties: [{key:'drunkResetInterval', type:'num'}, {key:'drunkSpeed', type:'num'}, {key:'loudnessRadius', type:'num'}],
		customProps: {
			isDrunk: false,
			drunkCounter: 0,
			drunkResetInterval: 3,
			drunkSpeed: 2,
			loudnessRadius: 1,
			attackedPlayers: false,
			drunkWailingProbability: 0.66, // unused atm
		},

		move: function() {
			var pos = this.pos;
			var curMove = STATE.moveCounter;

			var oldCell = MAP.getCell(pos);

			// hide ourselves if necessary
			// (we've stopped being drunk)
			if(this.isDrunk && this.drunkCounter >= curMove) {
				this.isDrunk = false;
				this.hide();
			}

			var numSteps = this.drunkSpeed;
			if(!this.isDrunk) { numSteps = 1; }

			for(var i = 0; i < numSteps; i++) {
				var params = { 'waterSource': true, 'alwaysReturn': true };

				// if we're drunk, move randomly
				// EXCEPTION: last turn we TRY to end on a cactus
				if(this.isDrunk) {
					var lastMove = (i == (numSteps - 1));
					if(!lastMove) { params.waterSource = null; }
				}

				var nbs = MAP.getValidNeighbours(pos, params);

				// move to valid neighbour
				var newPos = nbs[Math.floor(Math.random()*nbs.length)];
				this.setPos(newPos);
			}

			// if we're at a water source, and not drunk, become drunk
			// NOTE: drinking automatically happens on the setPos function
			var newCell = MAP.getCell(newPos);
			if(this.justDrank && !this.isDrunk) {
				// show ourselves if we're drunk
				this.show();
				this.drunkCounter = curMove + this.drunkResetInterval;
				this.isDrunk = true;
			}

			// randomly make wailing sounds
			if(this.isDrunk) {
				var makeSound = MAP.checkIfPlayersWithinRange(newPos, this.loudnessRadius);
				if(makeSound) { 
					STATE.addToMoveFeedback("<p>You hear a loud wailing sound!</p>");
				}
			}

			// attack players at night or dusk
			var nightOrDusk = STATE.isNight() || STATE.isDusk();
			if(nightOrDusk) {
				if(newCell.hasPlayers() || oldCell.hasPlayers()) {
					this.attackedPlayers = true;
				}
			}

			// inform players of attacks at dawn
			var dawn = STATE.isDawn();
			if(dawn) {
				if(this.attackedPlayers) {
					STATE.addToMoveFeedback('<p>Players were attacked tonight!</p>');
					this.attackedPlayers = false;
				}
				
			}
		},
	},

	"Bigfoot": {
		name: "Bigfoot",
		frame: 3,
		setup: function() {
			this.speed = Math.floor(Math.random()*2)+2;
			this.weight = Math.floor(Math.random()*3)+3;
			this.viewRadius = Math.floor(Math.random()*3)+1;
			this.confidant = Math.floor(Math.random() * cfg.playerCount);

			console.log("Bigfoot Setup");
		},
		moving: {
			steps: 2,
			skip: true
		},
		pictureVisibility: { w: 0, h: 0 },
		specialPictureVisibility: { w: 3, h: 3},
		startLocationProps: { minPlayerDist: 2 },
		pickableProperties: [{ key: 'speed', type: 'num'}, {key: 'viewRadius', type: 'num'}, {key:'confidant', type: 'player'}],
		terrain: {
			type: 'forest'
		},
		customProps: {
			speed: 2,
			weight: 3,
			viewRadius: 2,
			confidant: 0
		},

		move: function() {
			var pos = this.pos;

			// Bigfoot hides itself when players are near
			// So we show ourselves at the start of our move, but check (at the end) if people are within our view
			if(!this.showMyself) {
				this.show();
			}

			var numSteps = this.speed;
			if(this.justDrank) { numSteps = Math.max(numSteps - 1, 1); }

			// check if we need to flee
			// (are players within our range, excluding our confidant?)
			var fleeFromPlayers = MAP.getPlayersWithinRange(pos, this.viewRadius, [this.confidant]);
			if(fleeFromPlayers.length <= 0) { fleeFromPlayers = null; }

			// prefer to end on a tree
			// not interested in water if we just drank
			var finalMove = (i == (numSteps-1))

			var moveParams = {
				'distance': numSteps,
				'waterSource': !this.justDrank,
				'alwaysReturn': true,
				'overlayTerrain': true,
				'fleeFromPlayers': fleeFromPlayers
			}

			var moveWeights = {
				'waterSource': 1,
				'overlayTerrain': 2,
				'fleeFromPlayers': 3,
			}

			var nbs = MAP.getValidNeighbours(pos, moveParams, moveWeights);
			pos = nbs[Math.floor(Math.random() * nbs.length)];

			this.setPos(pos);
			var newCell = MAP.getCell(pos);

			// now check if we want to show/hide ourselves based on people in our view
			var playersWithinView = MAP.checkIfPlayersWithinRange(pos, this.viewRadius, [this.confidant]);
			if(playersWithinView) { 
				this.hide();
			}
		},
	},

	"Platypus": {
		name: "Platypus",
		frame: 4,
		setup: function() {
			this.maxRadius = Math.floor(Math.random() * 5) + 2;
			this.maxWaterTime = Math.floor(Math.random() * 2) + 2;
			this.minUniqueSquareRequirement = Math.floor(Math.random() * 3) + 2;

			console.log("Platypus Setup")
		},
		pictureVisibility: { w: 1, h: 1 },
		specialPictureVisibility: { w: 2, h: 2 },
		startLocationProps: { atHideout: true },
		pickableProperties: [
			{key: 'maxRadius', type: 'num'}, 
			{key: 'maxWaterTime', type: 'num'}, 
			{key: 'minUniqueSquareRequirement', type: 'num'}
		],
		hideout: {
			enabled: true,
			requirements: { empty: true/*, water: true*/ }
		},
		terrain: {
			type: 'swamp'
		},
		customProps: {
			maxRadius: 4,
			
			uniqueSquaresVisited: 0,
			minUniqueSquareRequirement: 2,

			waterCounter: 0,
			maxWaterTime: 2,
		},

		move: function() {
			var pos = this.pos;

			// can only stay in the water ONE turn
			// after that, it must be forced out
			var forcedNonWater = false;
			if(MAP.getCell(pos).isWater()) {
				this.waterCounter++;

				if(this.waterCounter >= this.maxWaterTime) {
					forcedNonWater = true;					
				}
			} else {
				this.waterCounter = 0;
			}

			// if we've both eaten and drunk, returning home is a possibility
			var goHome = false;
			var hasDrunk = this.hasDrunk || !SCENARIOS[cfg.scenario].tracksIncluded.water;
			var hasEaten = this.hasEaten || !SCENARIOS[cfg.scenario].tracksIncluded.food;
			var visitedEnoughUniqueSquares = (this.uniqueSquaresVisited >= this.minUniqueSquareRequirement);
			if(hasDrunk && hasEaten && visitedEnoughUniqueSquares) {
				goHome = true;
			}

			var moveParams = {
				uniqueSquare: true,
				forcedNonWater: forcedNonWater,
				maxDistFromHideout: this.maxRadius,
				foodSource: true,
				goHome: goHome,
			}

			var moveWeights = {
				forcedNonWater: 5,
				maxDistFromHideout: 4,
				goHome: 3,
				foodSource: 1,
				uniqueSquare: 0,
			}

			var nbs = MAP.getValidNeighbours(pos, moveParams, moveWeights);
			pos = nbs[Math.floor(Math.random() * nbs.length)];

			// NOTE: check BEFORE moving, because that will set monsterVisited to true (obviously)
			if(!MAP.getCell(pos).monsterVisited) {
				this.uniqueSquaresVisited++;
			}

			this.setPos(pos);

			if(MAP.getCell(pos).isHideout()) {
				this.uniqueSquaresVisited = 0;
			}
		}
	},

	"Dragon": {
		name: "Dragon",
		frame: 5,
		setup: function() {
			this.maxRadius = Math.floor(Math.random() * 3) + 3;
			this.huntRadius = Math.floor(Math.random() * 3) + 2;

			console.log("Dragon Setup");
		},
		pictureVisibility: { w: 2, h: 2 },
		specialPictureVisibility: { w: 2, h: 2 },
		startLocationProps: {},
		pickableProperties: [{key: 'huntRadius', type: 'num' }, {key: 'maxRadius', type: 'num'}],
		animalType: 'bird',
		collectibles: ['feather'],
		hideout: {
			enabled: true,
			requirements: { empty: true }
		},
		terrain: {
			type: 'rainforest'
		},
		customProps: {
			path: null,

			maxRadius: 3,
			huntRadius: 2,
		},

		move: function() {
			var pos = this.pos;

			// check if a player is CLOSER to the treasure ( = hideout) than us
			// if so, teleport back to treasure, but activate each cell we pass
			// NOTE: overrides everything else, hence the "return" statement below
			var distToTreasure = MAP.distToHideout(pos);
			var teleportHome = false;
			for(var i = 0; i < PLAYERS.length; i++) {
				var tempDist = MAP.distToHideout(PLAYERS[i].pos);
				if(tempDist < distToTreasure) {
					teleportHome = true;
					break;
				}
			}

			if(teleportHome) {
				var path = calculateRoute({}, MAP.map, this.pos, MAP.hideout.pos);

				var params = { 'ignoreFood': true, 'ignoreWater': true }

				for(var i = 0; i < path.length; i++) {
					var newPos = path[i];
					this.setPos(newPos, params);

					// disable any players we encounter
					// NOTE: this only happens during the flight back, not with other movements
					var playersHere = MAP.getCell(newPos).getPlayersByIndex();
					for(var i = 0; i < playersHere.length; i++) {
						PLAYERS[playersHere[i]].setDisabled(true);
					}
				}

				this.path = null;
				return;
			}

			// if we don't have a path, 
			// try to find a path to the closest food source within our radius
			if(this.path == null) {
				var requirements = { 'food': true } 
				var radius = this.huntRadius;
				var cell = MAP.findClosestCellWithinRange(this.pos, radius, requirements);
				if(cell != null) { this.findPath(cell); }

				// if we can't find a path, move randomly
				if(this.path == null) {
					var params = { maxDistFromHideout: this.maxRadius, alwaysReturn: true }
					var weights = { maxDistFromHideout: 1 }
					var nbs = MAP.getValidNeighbours(this.pos, params, weights);
					pos = nbs[Math.floor(Math.random() * nbs.length)];

					this.setPos(pos);
				}
			}

			// if we have a path, follow it
			this.checkPathFinder();


		}
	},

	"Tatzelwurm": {
		name: "Tatzelwurm",
		frame: 6,
		setup: function() {
			this.squaresNeeded = Math.floor(Math.random()*3) + 3;

			console.log("Tatzelwurm setup");
		},
		pictureVisibility: { w: 0, h: 0 },
		specialPictureVisibility: { w: 1, h: 1 },
		startLocationProps: {},
		pickableProperties: [{key:'squaresNeeded', type: 'num'}],

		squaresNeeded: 4,
		terrain: {
			type: 'mountain'
		},
		customProps: {
			// @TODO
		},

		move: function() {
			var pos = this.pos;

			if(this.showMyself) { this.hide(); }

			var params = { forbidCrossingItself: true, alwaysReturn: true }
			var weights = { forbidCrossingItself: 4, waterSource: 3, foodSource: 2 }
			var nbs = MAP.getValidNeighbours(pos, params, weights)
			pos = nbs[Math.floor(Math.random() * nbs.length)];

			this.setPos(pos);

			if(this.justEaten || this.justDrank) { this.show(); }
		},
	},

	"Yeti": {
		name: "Yeti",
		frame: 7,
		setup: function() {
			this.loudness = Math.floor(Math.random() * 3) + 4;

			console.log("Yeti setup");
		},
		pictureVisibility: { w: 1, h: 1 },
		specialPictureVisibility: { w: 3, h: 3, terrain: "mountain" },
		startLocationProps: {},
		pickableProperties: [],
		collectibles: [{type:"animal", key: true }], // animals eaten (dead = true) by us
		isCarnivore: true,
		terrain: {
			type: 'mountain'
		},
		customProps: {
			path: null,
			loudness: 4
		},

		move: function() {
			var pos = this.pos;

			if(this.showMyself) { this.hide(); }

			if(this.path == null) {
				var closestIbex = MAP.findClosestAnimal(pos, ['Ibex']);

				// NOTE: For now, when there are no food sources to be found, it just stands still indefinitively
				if(closestIbex == null) { return; }
				this.findPath(closestIbex);
			}

			// starting on a MOUNTAIN, we move two squares
			var speed = 1;
			if(MAP.getCell(this.pos).terrain == "mountain") {
				speed = 2;
			}

			this.checkPathFinder(speed);

			// growl to people within range after eating
			if(this.justEaten) {
				var playersInRange = this.checkIfPlayersWithinRange(this.pos, this.loudness);
				if(playersInRange) {
					STATE.addToMoveFeedback('<p>You hear a loud growling sound!</p>');
				}
			}

			// only show ourselves when standing on a mountain
			// (or the player taking the photograph is on a mountain; implemented through specialPictureVisibility property on monsters)
			if(MAP.getCell(this.pos).terrain == "mountain") { this.show(); }
		},
	}


}