const MainGame = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:
    function MainGame()
    {
        Phaser.Scene.call(this, { key: 'mainGame' });
    },

    preload: function() {
    	this.canvas = this.sys.game.canvas;

    	var base = 'assets/';

    	this.load.spritesheet('players', base + 'players.png?v=1', { frameWidth: 128, frameHeight: 128 });
    	this.load.spritesheet('monsters', base + 'monsters.png?v=3', { frameWidth: 128, frameHeight: 128 });
        this.load.spritesheet('animals', base + 'animals.png?v=1', { frameWidth: 128, frameHeight: 128 });

    	this.load.spritesheet('food_sources', base + 'food_sources.png?v=1', { frameWidth: 128, frameHeight: 128 });
    	this.load.spritesheet('water_sources', base + 'water_sources.png?v=1', { frameWidth: 128, frameHeight: 128 });

    	this.load.spritesheet('movement_tracks', base + 'movement_tracks.png?v=1', { frameWidth: 128, frameHeight: 128 });
    	this.load.spritesheet('environment_tracks', base + 'environment_tracks.png?v=1', { frameWidth: 128, frameHeight: 128 });
        this.load.spritesheet('edge_sprites', base + 'edge_sprites.png?v=1', { frameWidth: 32, frameHeight: 128 });
        this.load.spritesheet('misc', base + 'misc.png?v=1', { frameWidth: 128, frameHeight: 128 });
    },

    create: function() {
        this.scn = SCENARIOS[cfg.scenario];
        this.mon = MONSTERS[cfg.monster];

        this.allGroups = ['terrainGraphics', 'overlayTerrainGroup', 'edgeGroup', 'trackGroup', 'foodGroup', 'waterGroup', 'monsterGroup', 'animalGroup'];

        this.createAnimals();
    	this.visualizeMap();
    	this.createSubdivisionMap();
    	this.createSelectionBox();
    	this.createInitialSetup();
        this.displayInitialSetup();
    },

    /*
	 * create the "subdivision map"
	 * (this keeps track of the current subdivsions/resolution of the game,
	 *  needed to allow/disallow certain actions and snap to the correct areas)
	 */
    createSubdivisionMap: function() {
    	this.subdivGroup = this.add.group();

    	// start with the four corners of the main rectangle
    	CORNERS = {}

    	CORNERS[this.hashCoordinate({ x: 0, y: 0})] = { x: 0, y: 0}
    	CORNERS[this.hashCoordinate({ x: cfg.cellSizeX*cfg.width, y: 0 })] = { x: cfg.cellSizeX*cfg.width, y: 0 }
    	CORNERS[this.hashCoordinate({ x: cfg.cellSizeX*cfg.width, y: cfg.cellSizeY*cfg.height })] = { x: cfg.cellSizeX*cfg.width, y: cfg.cellSizeY*cfg.height }
    	CORNERS[this.hashCoordinate({ x: 0, y: cfg.cellSizeY*cfg.height })] = { x: 0, y: cfg.cellSizeY*cfg.height }

    	// create that rectangle, immediately subdivide it once
		var startRect = this.createRect(0, 0, cfg.width*cfg.cellSizeX, cfg.height*cfg.cellSizeY)
		this.performSubdivision(startRect);	
    },

    hashCoordinate: function(pos) {
    	return Math.floor(pos.x / cfg.cellSizeX) + "-" + Math.floor(pos.y / cfg.cellSizeY);
    },

    performSubdivision(rect) {
    	// create new subdivided rectangles
    	var rects = this.subdivideRect(rect);

    	// add points of all new rectangles to dictionary
    	for(var i = 0; i < rects.length; i++) {
    		var r = rects[i];

    		CORNERS[this.hashCoordinate({ x: r.x, y: r.y })] = { x: r.x, y: r.y }
    		CORNERS[this.hashCoordinate({ x: r.x+r.width, y: r.y })] = { x: r.x+r.width, y: r.y }
    		CORNERS[this.hashCoordinate({ x: r.x+r.width, y: r.y+r.height })] = { x: r.x+r.width, y: r.y+r.height }
    		CORNERS[this.hashCoordinate({ x: r.x, y: r.y+r.height})] = { x: r.x, y: r.y+r.height}
    	}

    	// check players standing in this rect; move them to the top-left square
    	for(var i = 0; i < PLAYERS.length; i++) {
    		if(PLAYERS[i].isInRect(this.convertRectToArea(rect))) {
    			PLAYERS[i].setPos(this.getPlayerResetPos(rects[0]));
    		}
    	}

    	// remove old
    	rect.destroy();


    },

    createRect: function(x, y, w, h) {
    	var rect = this.add.rectangle(x, y, w, h, 0x000000, 0.0);

    	rect.setStrokeStyle(cfg.grid.lineWidth, cfg.grid.lineColor, cfg.grid.lineAlpha);
    	rect.isStroked = true;
    	rect.setOrigin(0,0);

    	var ths = this;
    	rect.setInteractive().on('pointerup', function(pointer, localX, localY, event) {
    		if(ths.curInputMode != 'pickarea') { return; }

            var state = STATE.getState();

    		// FAIL: if we are moving a person ... 
    		if(state == 'action-move') {
    			// ... but we selected the area THEY ARE ALREADY IN, disallow
    			if(STATE.getCurPlayer().isAtPos(ths.getPlayerResetPos(rect))) { 
    				STATE.displayActionFeedback("Can't move to where you already are."); 
    				return; 
    			}

    			// ... but the area is NOT ADJACENT, disallowed
    			if(!ths.rectAdjacentToPlayerRect(rect, STATE.getCurPlayer())) { 
    				STATE.displayActionFeedback("Area not adjacent.");
    				return; 
    			}
    		}

    		// FAIL: If we are taking a plane ...
    		if(state == 'action-plane') {
    			// ... but we selected the area THEY ARE ALREADY IN, disallow
    			if(STATE.getCurPlayer().isAtPos(ths.getPlayerResetPos(rect))) { 
    				STATE.displayActionFeedback("Can't move to where you already are."); 
    				return; 
    			}

    			// NOTE: adjacency does not matter! That's what the plane is for: quick movement.
    		}

            // FAIL: If we are picking a hideout area
            if(state == "action-pickhideout") {
                // ... but we selected a non 1x1 area, disallow
                if((rect.width / cfg.cellSizeX) > 1.05 || (rect.height/cfg.cellSizeY) > 1.05) {
                    STATE.displayActionFeedback("Can't pick an area greater than 1x1");
                    return;
                }

                // ... but no player is nearby, disallow
                var pos = { x: Math.floor(rect.x/cfg.cellSizeX), y: Math.floor(rect.y/cfg.cellSizeY) }
                if(!MAP.checkIfPlayersWithinRange(pos, 1)) {
                    STATE.displayActionFeedback("No player nearby!");
                    return;
                }
            }

    		// if we already selected something else, deselect it
    		if(ths.savedAction.rect != null) {
    			ths.savedAction.rect.setStrokeStyle(cfg.grid.lineWidth, cfg.grid.lineColor, cfg.grid.lineAlpha);
    		}

    		// now select the new one
    		rect.setStrokeStyle(5*cfg.grid.lineWidth, 0xFF0000, 1.0);
    		ths.savedAction.rect = rect;
    		STATE.displayActionFeedback("A great (and valid) choice!", true);
    	});

    	this.subdivGroup.add(rect);

    	return rect;
    },

    toggleView: function(view) {
    	this.curView = view;

    	if(view == 'subdiv') {
    		this.subdivGroup.setVisible(true);
    		this.markingGraphics.setVisible(false);
    	} else if(view == 'fullgrid') {
    		this.subdivGroup.setVisible(false);
    		this.markingGraphics.setVisible(true);
    	}
    },

    toggleInputMode: function(mode) {
    	this.curInputMode = mode;
    },

    subdivideRect: function(rect) {
    	var x = rect.x, y = rect.y, hW = 0.5*rect.width, hH = 0.5*rect.height
    	var rects = [];

    	rects.push( this.createRect(x   , y   , hW, hH) );
    	rects.push( this.createRect(x+hW, y   , hW, hH) );
    	rects.push( this.createRect(x+hW, y+hH, hW, hH) );
    	rects.push( this.createRect(x   , y+hH, hW, hH) );

    	return rects;
    },

    canSubdivideRect: function(rect) {
    	return (rect.width > cfg.cellSizeX || rect.height > cfg.cellSizeY);
    },

    inRectInterval(a, val, b) {
    	return (val >= a) && (val <= b);
    },

    cornerMatch(r1, r2, corner) {
    	if(corner == 'topright') {
    		return (r1.x+r1.width) == r2.x && r1.y == (r2.y+r2.height);
    	} else if(corner == 'topleft') {
    		return r1.x == (r2.x+r2.width) && r1.y == (r2.y+r2.height);
    	} else if(corner == 'bottomleft') {
    		return r1.x == (r2.x+r2.width) && (r1.y+r1.height) == r2.y;
    	} else if(corner == 'bottomright') {
    		return (r1.x+r1.width) == r2.x && (r1.y+r1.height) == r2.y;
    	}
    },

    rectAdjacentToPlayerRect: function(rect, p) {
    	// find out the rectangle they are in
    	// @TODO: WAIT A MINUTE, we can SAVE THIS INFORMATION ON THE PLAYER (after moving)
    	var playerRect = null;
    	var ths = this;
    	this.subdivGroup.children.iterate(function (child) {
    		if(playerRect != null) { return; }
    		if(p.isInRect(ths.convertRectToArea(child))) {
    			playerRect = child;
    		}
    	});

    	// now check if the one rect is within X-range and Y-range of the other
    	// however, if only a CORNER matches (and nothing else can be within range), it's diagonal adjacency, and thus forbidden
    	var axisMatches = { x: 0, y: 0 };

    	// X
    	if(this.inRectInterval(rect.x, playerRect.x, rect.x+rect.width) && !this.cornerMatch(rect, playerRect, 'topright') && !this.cornerMatch(rect, playerRect, 'bottomright')) {
    		axisMatches.x++;		    		
    	} else if(this.inRectInterval(playerRect.x, rect.x, playerRect.x+playerRect.width) && !this.cornerMatch(rect, playerRect, 'topleft') && !this.cornerMatch(rect, playerRect, 'bottomleft')) {
    		axisMatches.x++;
    	}

    	// Y
    	if(this.inRectInterval(rect.y, playerRect.y, rect.y+rect.height) && !this.cornerMatch(rect, playerRect, 'bottomright') && !this.cornerMatch(rect, playerRect, 'bottomleft')) {
    		axisMatches.y++;			    		
    	} else if(this.inRectInterval(playerRect.y, rect.y, playerRect.y+playerRect.height) && !this.cornerMatch(rect, playerRect, 'topleft') && !this.cornerMatch(rect, playerRect, 'topright')) {
    		axisMatches.y++;
    	}

    	if(axisMatches.x <= 0 || axisMatches.y <= 0) { return false; }

    	return true;
    },

    /*
     *
     * For opening/closing actions
     * ( = setting up a new one, waiting for user input, then finalizing it)
     *
     */
    openAction: function() {
        var state = STATE.getState();

    	this.toggleView(ACTIONS[state].view);
    	this.toggleInputMode(ACTIONS[state].inputMode);

		this.scene.resume();
		this.setCorrectSize();

		this.savedAction = this.getEmptyAction();
    },

    closeAction: function() {
    	// if we're not passing, but we haven't provided any input? Don't allow action to be confirmed
    	if(this.savedAction.rect == null && STATE.getState() != 'action-pass') { return; }

    	// otherwise, the action is definitely happening
    	// so clear/reset stuff and JUST DO IT

    	// clear all feedback
    	feedbackNode = document.getElementById('move-feedback');
    	imageNode = document.getElementById('move-picture');

    	feedbackNode.innerHTML = '';
    	imageNode.style.display = 'none';

    	// reset player data
    	// (e.g. if we passed last turn, reset that)
    	STATE.getCurPlayer().reset();

        // pay the price!
        STATE.payForCurrentAction();

    	this.performPreAction();
    },

    // some actions are executed BEFORE monster movement (do so here)
    // otherwise immediately continue to monster movement
    performPreAction: function() {
    	// this action should happen AFTER the monster move? 
    	// well, move the monster, then bail out immediately
    	if(ACTIONS[STATE.getState()].isPostAction) { moveMonster(); return; }

    	switch(STATE.getState()) {

			case 'action-pass':
				STATE.getCurPlayer().pass();
				break;

    		case 'action-move':
    			this.performRegularMove();
    			break;

    		case 'action-plane':
    			this.usePlane();
    			break;

            case 'action-weather':
                this.predictWeather();
                break;

            case 'action-pickhideout':
                this.pickHideout();
                break;

    		case 'action-areascan':
    			this.scanArea();
                break;
    	} 

    	moveMonster();
    },

    // some actions are executed AFTER monster movement (do so here)
	// otherwise just immediately continue
	performPostAction: function() {
		if(!ACTIONS[STATE.getState()].isPostAction) { STATE.gotoNextPlayer(); return; }

        var immediatelySwitch = true;
		switch(STATE.getState()) {
			case 'action-picture':
				this.takePicture();
                immediatelySwitch = false;
				break;

            case 'action-collect':
                this.collectFromArea();
                break;
		}

        if(immediatelySwitch) {
            STATE.gotoNextPlayer();
        }
	},

    collectFromArea: function() {
        var feedbackNode = document.getElementById('move-feedback');

        // get the selected area
        var a = this.convertRectToArea(this.selectionBox);

        // get all the cells within this area
        // that contain at least one collectible
        var cells = []
        for(var x = a.x; x < (a.x + a.width); x++) {
            for(var y = a.y; y < (a.y+a.height); y++) {
                var cell = MAP.getCell({x:x, y:y});
                if(!cell.hasCollectible()) { continue; }
                cells.push(cell);
            }
        }

        // shuffle this list into a random order
        shuffleArray(cells);

        // get the probability of _missing_ stuff
        // as opposed to photographs, not every cell contains a collectible, so we can't hide randomly
        // instead, the probability (mainly) decreases with how MANY elements are in the area.
        var areaSize = a.width*a.height;
        var prob = 1.0;
        if(areaSize >= 16) {
            prob -= ( (areaSize)/64.0 )
        }

        if(cells.length > 2) {
            prob -= cells.length*(1/16.0)
        }

        prob = Math.max(Math.min(prob, 1), 0.05)

        // now collect everything inside
        // (the "cells" array should only contain cells with a collectible)
        var numItemsCollected = 0;
        var numItemsCorrect = 0;
        for(var i = 0; i < cells.length; i++) {
            var c = cells[i];

            // take care of frequency bonus: the more we investigate a cell, the more likely it is to give us 100% accurate results
            var tempProb = prob;
            if(this.scn.rulesIncluded.frequencyBonus) {
                tempProb += cell.getExtraProbFromInquiries('collectibles');
                cell.countInquiry('collectibles');
            }

            if(Math.random() > tempProb) { continue; }

            var res = c.fetchCollectible();
            numItemsCollected += res.numItemsCollected;
            numItemsCorrect += res.numItemsCorrect;
        }

        var fb = "<p>Collected " + numItemsCollected + " items, of which " + numItemsCorrect + " were correct.<p>";
        fb += "<p>(Probability of missing something: " + Math.round((1.0 - prob)*100) + "%</p>";
        feedbackNode.innerHTML = fb;

        // pay the price!
        var totalMoneyCost = Math.round(0.25*areaSize)
        STATE.payMoney(totalMoneyCost);
    },

    areSamePos: function(a,b) {
        return (a.x == b.x && a.y == b.y);
    },

    pickHideout: function() {
        var a = this.convertRectToArea(this.savedAction.rect);
        if(a.width > 1 || a.height > 1) { return; }

        var pickedPos = {x:a.x, y:a.y}

        // the monster explicitly has a hideout? Well, we need to find that
        var foundHideout = MAP.getCell(pickedPos).isHideout()

        // the monster does NOT have a hideout? It should have a different positional condition, check that
        if(!this.mon.hideout || !this.mon.hideout.enabled) {
            var type = this.mon.hideout.type;

            // possible conditions: guess the STARTING POSITION, CURRENT POSITION, or POSITION(S) IT VISITED THE MOST
            if(type == 'startPos') {
                foundHideout = this.areSamePos(MONSTER.completePath[0], pickedPos);
            } else if(type == 'curPos') {
                foundHideout = this.areSamePos(MONSTER.pos, pickedPos);
            } else if(type == 'mostVisitedPos') {
                var mostVisitedPositions = MONSTER.getMostVisitedPos();

                for(var i = 0; i < mostVisitedPositions.length; i++) {
                    if(this.areSamePos(mostVisitedPositions[i], pickedPos)) {
                        foundHideout = true;
                        break;
                    }
                }
            }   
        }

        MONSTER.foundHideout = foundHideout;
        STATE.addToStat(2, -1);
    },

	performRegularMove: function() {
		var scn = SCENARIOS[cfg.scenario];

		// move the current player to the new location
		var newPos = this.getPlayerResetPos(this.savedAction.rect);
		STATE.getCurPlayer().setPos(newPos)

		// subdivide the given rectangle
		var r = this.savedAction.rect;
		if(this.canSubdivideRect(r)) {
			this.performSubdivision(r);
		}

		// If enabled, randomly add tracks because of this player movement
        // When it's snowing, you will ALWAYS create tracks
		if(scn.rulesIncluded.playerTracks) {
            var shouldCreateTrack = (Math.random() <= scn.probabilities.playerTracks) || (STATE.getCurrentWeather() == "snow");
			if(shouldCreateTrack) {
				MAP.getCell(newPos).addMovementTrack(STATE.getCurPlayer());
			}
		}
	},

    predictWeather: function() {
        var a = this.convertRectToArea(this.savedAction.rect);
        var areaSize = (a.width * a.height);
        var forecastLength = Math.floor(areaSize * 0.5);
        var misreadProbability = Math.min(Math.max( (areaSize-1) / 32.0, 0.0), 0.95);

        var str = '';
        for(var i = 0; i < forecastLength; i++) {
            var weatherAtTurn = STATE.getWeatherFuture(i);
            if(weatherAtTurn == null) { break; }
            if(Math.random() <= misreadProbability) {
                weatherAtTurn = 'unknown';
            }

            str += "<span class='weather-icon icon-weather-" + weatherAtTurn + "'></span>";
        }

        feedbackNode.innerHTML = str;
    },

	usePlane: function() {
		var scn = SCENARIOS[cfg.scenario];

		// randomly destroy/add tracks at original location
		// @TODO: set radius from config? different per scenario?
		var trackDestroyRadius = 1
		var trackDestroyProbability = scn.probabilities.planeTrackDestroy;
		this.destroyTracksAt(STATE.getCurPlayer().getPos(), trackDestroyRadius, trackDestroyProbability)

		// move current player to new location
		// DON'T subdivide => makes thematic sense: you're ignoring the actual map by quickly flying over it
		var newPos = this.getPlayerResetPos(this.savedAction.rect);
		STATE.getCurPlayer().setPos(newPos);

		// and randomly destroy/add tracks at new location
		this.destroyTracksAt(newPos, trackDestroyRadius, trackDestroyProbability);
	},

	takePicture: function() {
		canvasNode = document.getElementById('phaserGameContainer').firstChild;
	    imageNode = document.getElementById('move-picture');

		// first, save the data in variables (so we don't lose it/change it afterwards)
		var a = this.convertRectToArea(this.selectionBox);
		var x = a.x * cfg.cellSizeX, y = a.y * cfg.cellSizeY;
		var w = a.width * cfg.cellSizeX, h = a.height * cfg.cellSizeY;

		// first, hide the game element (otherwise the players will SEE the full map)
		document.getElementById('game').style.display = 'none';

		// now remove stuff we DON'T want to show up on the image
		this.hideElementsForPicture(a);

		// now TIME the next event, so the canvas has time to update
		var ths = this;

		this.time.addEvent({
		    delay: 50,
		    callback: function() {
		        // create a new image (which will hold the picture)
    			// first, give it the full canvas
    			var image = new Image();
				image.onload = sliceImage;
				image.src = canvasNode.toDataURL();

				// once loaded, slice it to the picture size
				function sliceImage() {
				    var canvas = document.createElement('canvas');
				    
				    canvas.width = w;
				    canvas.height = h;

				    var context = canvas.getContext('2d');
				    context.drawImage(image, x, y, w, h, 0, 0, w, h);

				    // and finally put it into the feedback image element
				    imageNode.style.display = 'inline-block';
				    imageNode.src = canvas.toDataURL();

				    // and reset map back to stuff for next turn
				    // there's a DELAY here, otherwise we pause too quickly, and phaser doesn't update anymore
				    ths.time.addEvent({
				    	delay: 50,
				    	callback: function() {
						    ths.showElementsForPicture(a);
						    STATE.gotoNextPlayer();
				    	},
				    	loop: false
				    });

				}
		    },
		    loop: false
		})
	},

	scanArea: function() {
		var feedbackNode = document.getElementById('move-feedback');

		// get the selected area
		var a = this.convertRectToArea(this.selectionBox);

		// get all the cells within this area
        var areaSize = a.width*a.height;
		var cells = []
		for(var x = a.x; x < (a.x + a.width); x++) {
			for(var y = a.y; y < (a.y+a.height); y++) {
				cells.push(MAP.getCell({x:x, y:y}));
			}
		}

		// now gather some random information, report it
		var stats = {
			'numWater': 0,
            'numWaterSources': 0,

            'numFoodSources': 0,

			'hasMonster': false,
            'numLivingThings': 0,

            'numEdges': 0,
            'numOverlayTerrain': 0
		}
		for(var i = 0; i < cells.length; i++) {
			var c = cells[i];
			if(c.isWater()) { stats.numWater++; }
            if(c.hasWaterSource()) { stats.numWaterSources++; }

            if(c.hasFoodSource()) { stats.numFoodSources++; }

			if(c.hasMonster()) { stats.hasMonster = true; stats.numLivingThings++; }
            if(c.hasAnimals()) { stats.numLivingThings += c.countAnimals(); }
            if(c.hasPartOfMultiSquareMonster()) { stats.numLivingThings += 1; }

            if(c.hasEdges()) { stats.numEdges++; }

            if(c.hasOverlayTerrain()) { stats.numOverlayTerrain++; }
		}

        var curTerrain = TERRAINS[MONSTER.terrain.type];

        var fb = areaSize + ' cells scanned. Results: ';
        fb += stats.numLivingThings + ' life signals &middot;';

        if(curTerrain.hasNaturalWater) { fb += stats.numWater + ' natural water &middot;'; }
        if(this.scn.tracksIncluded.water && !curTerrain.forbidWaterSources) { fb += stats.numWaterSources + ' water sources &middot;'; }
        if(this.scn.tracksIncluded.food) { fb += stats.numFoodSources + ' food sources &middot;'; }
        if(this.scn.tracksIncluded.edges) { fb += stats.numEdges + ' special edges &middot;'; }
        if(curTerrain.useOverlayTerrain) { fb += stats.numOverlayTerrain + ' plants & trees'; }

        // @TODO: Do this override? Or just add it to the rest? Or only do this randomly?
		if(stats.hasMonster) {
			fb = 'This area contains the monster!';
		}

		feedbackNode.innerHTML = fb;
	},

    getAverageRectPos: function(rect, pixelCoordinates = false) {
    	var multiplier = { x: 1, y: 1 }
    	if(pixelCoordinates) { multiplier = { x: cfg.cellSizeX, y: cfg.cellSizeY }; }

    	return { 
    		x: Math.floor((rect.x + 0.5*rect.width) / cfg.cellSizeX) * multiplier.x, 
    		y: Math.floor((rect.y + 0.5*rect.height) / cfg.cellSizeY) * multiplier.y 
    	}
    },

    getPlayerResetPos: function(rect) {
    	return {
    		x: Math.floor(rect.x/cfg.cellSizeX), 
    		y: Math.floor(rect.y/cfg.cellSizeY)
    	}
    },

    destroyTracksAt: function(pos, radius, prob) {
		for(var x = -radius; x <= radius; x++) {
			for(var y = -radius; y <= radius; y++) {
                var newPos = { x: pos.x + x, y: pos.y + y };
				if(MAP.outOfBounds(newPos)) { continue; }

				var cell = MAP.getCell(newPos);

				// randomly ADD a new MOVEMENT track or ENVIRONMENT track
				// (but with much lower probability, otherwise it becomes a HUGE mess)

                // DEBUGGING: cranking up this probability
                var reducedProb = prob; //0.25*prob;
				if(Math.random() <= reducedProb) {
					cell.addMovementTrack(STATE.getCurPlayer());
				}

                if(Math.random() <= reducedProb) {
                    console.log("adding a new environment track");
                    cell.addEnvironmentTrack();
                }

				// randomly REMOVE EXISTING tracks
				for(key in cell.tracks) {
					if(Math.random() <= prob) {
						cell.removeTrack(key);
					}
				}


			}
		}
    },

    convertRectToArea: function(rect) {
    	var startX = rect.x
    	if(rect.width < 0) { startX += rect.width; }

    	var startY = rect.y
    	if(rect.height < 0) { startY += rect.height; }

    	var epsilon = 0.1

    	return { 
    		x: Math.floor((startX + epsilon) / cfg.cellSizeX), 
    		y: Math.floor((startY + epsilon) / cfg.cellSizeY), 
    		width: Math.floor( (Math.abs(rect.width) + epsilon) / cfg.cellSizeX), 
    		height: Math.floor( (Math.abs(rect.height) + epsilon) / cfg.cellSizeY)
    	}
    },

    /*
     *
     * Handling showing/hiding stuff for the picture
     *
     */

    getPictureVisibilityProbability: function(a) {
    	
    	/*
    	// calculate general "probability" of showing information
    	// which gets LOWER the BIGGER the area you're searching
    	// this goes down QUICKLY, that's why we use a logarithm, 
    	// but only becomes 0 if you photograph 0.75 of the map (or more)
    	var probBasedOnTotalSize = 1.0/(cfg.width*cfg.height) * (1.0/0.75);
    	var areaSize = (a.width*a.height);

    	var prob = -0.125*Math.log(probBasedOnTotalSize * (areaSize-0.99));
    	prob = Math.max(Math.min(prob, 1.0), 0.05);
    	*/


    	// A linear falloff, which reaches its minimum when photographing half the map (or more)
    	var areaSize = (a.width * a.height);
    	var probDecreasePerSquare = 1.0 / ((cfg.width*cfg.height*0.5) - 1)
    	var prob = Math.max(Math.min( 1.0 - areaSize*probDecreasePerSquare, 1.0 ), 0.05);
    	
    	return prob;
    },

    hideElementsForPicture: function(a) {
    	// remove UI
    	this.clearSelectionArea();

    	// remove grid markings and stuff
    	this.markingGraphics.setVisible(false);

    	// remove players
    	this.playerGroup.setVisible(false);

    	// show the terrain (we'll hide some stuff later)
        for(var i = 0; i < this.allGroups.length; i++) {
            this[this.allGroups[i]].setVisible(true);
        }

    	var prob = this.getPictureVisibilityProbability(a);

    	feedbackNode.innerHTML = 'Probability of elements being hidden: ' + Math.round((1.0 - prob)*100.0) + '%';

        var shouldHideTerrain = SCENARIOS[cfg.scenario].hideTerrainInPicture;
    	if(shouldHideTerrain) {
	    	// Randomly place white rectangles over the terrain to hide it
            var tempProb = prob;
            var color = 0xFFFFFF

            // If night vision is enabled, we get WORSE picture during the night, and they are BLACK
            if(this.scn.rulesIncluded.nightVision) {
                if(STATE.isNight()) {
                    tempProb *= 0.5;
                    color = 0x000000;
                }
            }

	    	this.pictureGraphics.fillStyle(color, 1.0);

	    	for(var x = 0; x < a.width; x++) {
	    		for(var y = 0; y < a.height; y++) {
	    			var show = (Math.random() <= tempProb);
	    			if(show) { continue; }

	    			var rect = new Phaser.Geom.Rectangle((a.x+x)*cfg.cellSizeX, (a.y+y)*cfg.cellSizeY, cfg.cellSizeX, cfg.cellSizeY);

	    			this.pictureGraphics.fillRectShape(rect);
	    		}
	    	}
	    }

        // Go through all cells
        // and selectively show/hide terrain/food source/clue elements
    	for(var x = 0; x < a.width; x++) {
    		for(var y = 0; y < a.height; y++) {
                var newPos = { x: a.x + x, y: a.y + y };
                var cell = MAP.getCell(newPos);
                var cellProb = prob

                // count how often we've visited it
                // and add that probability to the total probability
                if(this.scn.rulesIncluded.frequencyBonus) {
                    cellProb += cell.getExtraProbFromInquiries('photograph');
                    cell.countInquiry('photograph');
                }

                cell.hideElementsForPicture(cellProb);
    		}
    	}

    },

    showElementsForPicture: function() {
    	// show grid markings again
    	this.markingGraphics.setVisible(true);

    	// show players again
    	this.playerGroup.setVisible(true);

    	// hide all groups again
        for(var i = 0; i < this.allGroups.length; i++) {
            this[this.allGroups[i]].setVisible(cfg.debugging);
        }

    	// clear the overlay graphics ( = white blocks to hide terrain)
    	this.pictureGraphics.clear();

    	// When debugging, go through ALL cells and show ALL sprites again (as they might have been hidden for a picture)
    	if(cfg.debugging) {
	    	for(var x = 0; x < cfg.width; x++) {
	    		for(var y = 0; y < cfg.height; y++) {
	    			MAP.getCell({x:x, y:y}).resetAllSprites(true);
	    		}
	    	}
	    }
    },

    /*
     *
     * Handling the selection box for picking an area (in which you use your action)
     * 
     */
    createSelectionBox: function() {
    	// x, y, width, height, fillColor, fillAlpha
    	this.selectionBox = this.add.rectangle(0, 0, 0, 0, 0x1d7196, 0.5);

    	// lineWidth, strokeColor, strokeAlpha
    	this.selectionBox.setStrokeStyle(5, 0xFF0000, 1.0);
    	this.selectionBox.isStroked = true;

    	this.selectionBox.depth = 1000;

		this.input.on(Phaser.Input.Events.POINTER_DOWN, this.handlePointerDown, this)
		this.input.on(Phaser.Input.Events.POINTER_MOVE, this.handlePointerMove, this)
		this.input.on(Phaser.Input.Events.POINTER_UP, this.handlePointerUp, this)
		this.input.on(Phaser.Input.Events.GAME_OUT, this.handlePointerUp, this)

		var textCfg = {
			fontFamily: 'Ravi Prakash',
			fontSize: '30px',
			color: '#FFFFFF',
			stroke: '#000000',
			strokeThickness: 4,
		}

		this.selectionBoxText = this.add.text(0, 0, "X", textCfg);
		this.selectionBoxText.setOrigin(0.5, 0.5);
		this.selectionBoxText.depth = 1001;

		this.selectionPointerDown = false;

    },

    snapToGrid(pos, forbidInvalid = false) {
    	var useSubdivGrid = (this.curView == 'subdiv');
    	if(useSubdivGrid) {
    		// go through all rectangle corners (duplicates are already removed)
    		// and grab the one closest to the pointer
    		var closestDist = Infinity;
    		var closestPoint = null;

    		for(key in CORNERS) {
    			var tempPos = CORNERS[key];
    			var dist = (tempPos.x-pos.x)*(tempPos.x-pos.x) + (tempPos.y-pos.y)*(tempPos.y-pos.y)

    			// don't allow corners that would result in no-width ( = invalid) selection
    			if(forbidInvalid) {
    				if(Math.abs(tempPos.x-this.selectionBox.x) <= 0.005 || Math.abs(tempPos.y-this.selectionBox.y) <= 0.005) { continue; }
    			}

	    		if(dist < closestDist) {
	    			closestDist = dist;
	    			closestPoint = tempPos;
	    		}
    		}

    		// update pos variable (so we can return + snap to integer it below)
	    	pos = closestPoint
    	}

    	// and this just snaps it to integer values ( = corners of the grid)
		return { 
			x: Math.min(Math.max(Math.round(pos.x/cfg.cellSizeX)*cfg.cellSizeX, 0), cfg.width*cfg.cellSizeX), 
    		y: Math.min(Math.max(Math.round(pos.y/cfg.cellSizeY)*cfg.cellSizeY, 0), cfg.height*cfg.cellSizeY) 
    	}
    	
    },

    getLetterMarking(val) {
    	return "ABCDEFGHIJKLMNOPQRSTUVWXYZ".charAt(val);
    },

	handlePointerDown: function(pointer, currentlyOver) {
		if(this.curInputMode != 'drawarea') { return; }

		this.clearSelectionArea();

		// NOTE: We must ALLOW invalid ones, because, well, when we start our selection its size will always be 0
		var pos = this.snapToGrid(pointer, false);

		this.selectionBox.setVisible(true);
		this.selectionBox.isStroked = true;

		this.selectionBox.x = pos.x
		this.selectionBox.y = pos.y

		this.selectionPointerDown = true;
	},

	handlePointerMove: function(pointer, currentlyOver) {
		if(this.curInputMode != 'drawarea') { return; }
		if (!pointer.isDown || !this.selectionPointerDown) { return; }

		// update box itself
		const pos = this.snapToGrid(pointer, true);
		const width = pos.x - this.selectionBox.x, height = pos.y - this.selectionBox.y

		this.selectionBox.setSize(width, height);
		this.selectionBox.geom.setSize(width, height);

		// update the markings within it (that show EXACTLY which cells you are selecting)
		this.selectionBoxText.x = this.selectionBox.x + 0.5*width;
		this.selectionBoxText.y = this.selectionBox.y + 0.5*height;

		var a = this.convertRectToArea(this.selectionBox);

		var gridX = Math.floor(this.selectionBox.x / cfg.cellSizeX), gridY = Math.floor(this.selectionBox.y / cfg.cellSizeY);
		var gridEndX = Math.floor((this.selectionBox.x + width) / cfg.cellSizeX) - 1, gridEndY = Math.floor((this.selectionBox.y + height) / cfg.cellSizeY) - 1

		if(gridEndX < gridX) { var temp = gridX; gridX = gridEndX + 1; gridEndX = temp - 1; }
		if(gridEndY < gridY) { var temp = gridY; gridY = gridEndY + 1; gridEndY = temp - 1; }

		this.selectionBoxText.text = this.getLetterMarking(a.x) + (a.y+1)
		if(!(a.width == 1 && a.height == 1)) {
			this.selectionBoxText.text += "-" + this.getLetterMarking(a.x+a.width-1) + (a.y+a.height-1+1);
		}
	},

	handlePointerUp(pointer, currentlyOver) {
		this.selectionPointerDown = false;

		if(this.curInputMode != 'drawarea') { return; }

		//
		// check if a valid area
		//

		// does the box have any size?
		if(Math.abs(this.selectionBox.width) <= 0 || Math.abs(this.selectionBox.height) <= 0) {
			STATE.displayActionFeedback("Photograph has no size!");
			this.clearSelectionArea();
			return;
		}

        // photographs and scans have some harsh, specific restrictions
        var curState = STATE.getState()
        if(curState == 'action-picture' || curState == "action-areascan")  {
    		// grab all players inside this square
    		var playersInside = [];
    		for(var i = 0; i < PLAYERS.length; i++) {
    			if(PLAYERS[i].isInRect(this.convertRectToArea(this.selectionBox))) {
    				playersInside.push(PLAYERS[i]);
    			}
    		}

    		// is there exactly ONE player inside?
    		if(playersInside.length != 1) { 
    			if(playersInside.length == 0) {
    				STATE.displayActionFeedback("Nobody inside this area!");
    			} else {
    				STATE.displayActionFeedback("Too many people in the photograph!");
    			}
    			this.clearSelectionArea();
    			return; 
    		}

    		// is that player the CURRENT player or one that has PASSED?
    		if(!playersInside[0].isIndex(STATE.curPlayer) && !playersInside[0].hasPassed()) {
    			STATE.displayActionFeedback("You're not inside this area!");
    			this.clearSelectionArea();
    			return;
    		}
        }

		//
		// otherwise, we're fine!
		//
        var positiveFeedback = "That should become a nice picture!";
        if(curState == "action-areascan") {
            positiveFeedback = "A great area to scan!";
        } else if(curState == "action-collect") {
            positiveFeedback = "An awesome location to investigate!";
        }

		STATE.displayActionFeedback(positiveFeedback, true);
		this.savedAction.rect = this.selectionBox;
	},

	clearSelectionArea() {
		// collapse selection box and hide it
		this.selectionBox.setSize(0, 0);
		//this.selectionBox.geom.setSize(0,0);

		this.selectionBoxText.text = "";

		this.selectionBox.setVisible(false);

		if(this.savedAction == null) { return; }

		// deselect clicked rectangle, if it exists
		if(this.savedAction.rect != null) {
			this.savedAction.rect.setStrokeStyle(cfg.grid.lineWidth, cfg.grid.lineColor, cfg.grid.lineAlpha);
		}

		// finally, remove any saved action
		this.savedAction = this.getEmptyAction();
	},

	getEmptyAction() {
		return {
			'rect': null
		}
	},

	setCorrectSize() {
		var desiredWidth = 0, desiredHeight = 0;

		var maxWidth = Math.min(window.innerWidth, 720);
		var desiredHeightByMaxWidth = maxWidth * (297/210.0);

		var heightPadding = 30;
		var maxHeight = window.innerHeight - document.getElementById('phaserGameContainer').getBoundingClientRect().top - heightPadding;

		// if we CANNOT use as much vertical space as the max width wants, 
		// we must use the height and update the width
		if(maxHeight < desiredHeightByMaxWidth) {
			desiredWidth = maxHeight * (210.0/297.0);
			desiredHeight = maxHeight;

		// otherwise, we can use as much height as the width wants
		} else {
			desiredWidth = maxWidth;
			desiredHeight = maxWidth * (297.0/210.0);
		}

		document.getElementById('phaserGameContainer').style.width = maxWidth + 'px';
		document.getElementById('phaserGameContainer').style.height = maxHeight + 'px';
	},

	/*
	 *
	 * Handle tracks
	 *
	 */
	addTrack: function(pos, creator, type) {
		var texture = TRACKS[type].texture;
		var frame = TRACKS[type].frame;

		var s = this.add.sprite((pos.x+0.5)*cfg.cellSizeX, (pos.y+0.5)*cfg.cellSizeY, texture);
		s.displayWidth = s.displayHeight = Math.min(cfg.cellSizeX, cfg.cellSizeY);
		s.setFrame(frame);
		s.setOrigin(0.5);

		// @TODO: Create a better dictionary/cfg/overview of all the DEPTH values of sprites
		s.depth = 7;

		s.setVisible(false);

		this.trackGroup.add(s);

		return s;
	},

	fadeTrack: function(sprite, ctr) {
		sprite.alpha = Math.max( Math.min(ctr, 1.0), 0.0 );
	},

	removeTrack: function(sprite) {
		sprite.destroy();
	},

	/*
	 *
	 * Display the intial setup (at start of game)
	 *  => Create an image of the map with the STARTING POSITIONS of each player 
	 *  => And always one IMAGE and one TEXT clue
	 *
	 */
    createInitialSetup: function() {
        //
        // place players
        //
        var startPositions = [{ x: 0, y: 0}, { x: 0.5*cfg.width, y: 0 }, { x: 0.5*cfg.width, y: 0.5*cfg.height }, { x: 0, y: 0.5*cfg.height } ];
        for(var i = 0; i < PLAYERS.length; i++) {
            var p = PLAYERS[i];
            p.setPos(startPositions[Math.floor(Math.random() * startPositions.length)]);
        }

        //
        // place monster (according to its rules)
        //
        var startLocProps = MONSTERS[MONSTER.type].startLocationProps;
        var monsterPos = MAP.getRandomPos(startLocProps);

        if(startLocProps.minPlayerDist == -1) {
            monsterPos = MAP.getRandomCellFurthestAwayFromPlayers();
        }

        MONSTER.registerGame();
        MONSTER.setPos(monsterPos);

        // is it a multi-squared monster? pre-move it 
        // @TODO: It does NOT take any parameters into account when finding neighbours, should it?
        // @TODO: It doesn't actually USE this anywhere yet; 
        //    => at some point, actions should also check if the monster's completePath, for interval [<now>-squaresNeeded, <now>], matches the cell being investigated
        //    => additionally, I _might_ draw a line trailing behind it (updated after every move)
        if(MONSTER.squaresNeeded > 1) {
            for(var i = 0; i < MONSTER.squaresNeeded; i++) {
                var nbs = MAP.getValidNeighbours(MONSTER.pos, { forbidCrossingItself: true });
                if(nbs.length <= 0) { break; }
                var newPos = nbs[Math.floor(Math.random() * nbs.length)];
                MONSTER.setPos(newPos)
            }
        }


        //
        // place other animals
        //
        for(var i = 0; i < ANIMALS.length; i++) {
            var a = ANIMALS[i];
            a.setPos(MAP.getRandomPos(a.locationRequirements));
        }
    },

    createAnimals: function() {
         if(!this.scn.rulesIncluded.animals) { return; }

        var numAnimals = this.scn.numAnimals;
        var possibleAnimals = TERRAINS[MAP.generalTerrain].possibleAnimals;

        ANIMALS = [];
        for(var i = 0; i < numAnimals; i++) {
            var randType = possibleAnimals[Math.floor(Math.random() * possibleAnimals.length)];
            var newAnimal = new Animal(i, randType);

            newAnimal.registerGame();

            ANIMALS.push(newAnimal);
        }
    },

	displayInitialSetup: function() {

		// give a random TEXT and IMAGE clue
		this.giveRandomTextClue();
		this.giveRandomImageClue();

        var callbackFunc = function() {
            document.getElementById('move-instruction').innerHTML = 'Below is your starting setup. Copy it, click it away, and the game is afoot!';
            
            STATE.toggleMoveResults(true);
            STATE.gotoNextPlayer();
        }
        this.convertCanvasToImage(callbackFunc);

	},

    convertCanvasToImage: function(callback) {
        // convert all of that to a nice picture
        // when THAT is done, finally start the game
        var canvasNode = document.getElementById('phaserGameContainer').firstChild;
        var imageNode = document.getElementById('move-picture');
        this.time.addEvent({
            delay: 50,
            callback: function() {
                imageNode.style.display = 'inline-block';
                imageNode.src = canvasNode.toDataURL();

                callback();
            },
            loop: false
        });
    },

	findClosestPlayerTo: function(pos, returnType, invert = false) {
		var findFurthest = (returnType == 'dist' && invert);
		var minDist = findFurthest ? - 1 : Infinity;

		var closestPlayer = -1;

		for(var i = 0; i < PLAYERS.length; i++) {
			var p = PLAYERS[i].pos;
			var dist = Math.abs(p.x - pos.x) + Math.abs(p.y - pos.y);

			var betterOption = (dist > minDist && findFurthest) || (dist < minDist && !findFurthest);
			if(betterOption) { 
				closestPlayer = i; 
				minDist = dist; 
			}
		}

		if(returnType == 'dist') { 
			return minDist; 

		} else if(returnType == 'index') { 
			// if inverted, return any OTHER player
			if(invert) {
				var tempPlayers = PLAYERS.slice()
				tempPlayers.splice(closestPlayer, 1);
				return tempPlayers[Math.floor(Math.random()*(tempPlayers.length - 1))].index;
			}

			return closestPlayer; 
		}
	},

	giveRandomTextClue() {
		var clueTypes = ["closest-player-name", "closest-player-distance"];

		var scn = SCENARIOS[cfg.scenario];
		if(scn.tracksIncluded.food) { clueTypes.push("num-food"); }
		if(scn.tracksIncluded.water) { clueTypes.push("num-water"); }

		var randType = clueTypes[Math.floor(Math.random() * clueTypes.length)];

		var clueText = "";

		switch(randType) {
			case 'num-food':
				clueText = 'This map has <strong>' + this.mapStats.numFoodSources + '</strong> food sources';
				break;

			case 'num-water':
				clueText = 'This map has <strong>' + this.mapStats.numWaterSources + '</strong> water sources';
				break;

			case 'closest-player-name':
				var invert = (Math.random() <= 0.5) && (cfg.playerCount > 1);
				var invertString = invert ? "NOT "  : ""

				clueText = 'Player ' + (this.findClosestPlayerTo(MONSTER.pos, 'index', invert)+1) + ' is ' + invertString + 'closest to the monster';
				break;

			case 'closest-player-distance':
				var invert = (Math.random() <= 0.5);
				var result = this.findClosestPlayerTo(MONSTER.pos, 'dist', invert);

				// modify the result a bit to show a RANGE (adds uncertainty, but not too much)
				var modification = Math.random();
				if(modification <= 0.33) {
					result = Math.max(result + Math.floor(Math.random() * 3), cfg.width-1);
					result = result + '-';
				} else if(modification <= 0.66) {
					result = Math.max(result - Math.floor(Math.random() * 3), 0);
					result = result + '+';
				} else {
					var lowering = Math.floor(Math.random() * 3);

					result -= lowering;

                    var minVal = Math.max(result, 0);
                    var maxVal = Math.min(result + (3 - lowering), cfg.width-1);

                    // if we accidentally get identical or wrongly ordered numbers, blow them both way out of proportion
                    if(minVal >= maxVal) {
                        minVal = Math.max(minVal - 3, 0);
                        maxVal = Math.min(maxVal + 3, cfg.width-1);
                    }

					result = 'between ' + minVal + '&ndash;' + maxVal;

				}

				if(invert) {
					clueText = 'The furthest player (to the monster) is <strong>' + result + '</strong> squares away';
				} else {
					clueText = 'The closest player (to the monster) is <strong>' + result + '</strong> squares away';
				}

				
				break;
		}

		document.getElementById('move-feedback').innerHTML = "<strong>Clue!</strong> " + clueText;

	},

	giveRandomImageClue() {
		var pos, cell;
		var numTries = 0, maxTries = 100;

		do {
			pos = MAP.getRandomPos({});
			cell = MAP.getCell(pos);
			numTries++;
		} while(!cell.hasInterestingContent() && numTries < maxTries);

		if(numTries >= maxTries) { return; }

		cell.toggleInterestingContent(true);

		this.givenImageClues = [cell];
	},
	

	/*
	 *
	 * Visualize the map (terrain, forests, hideouts, monster, etc.)
	 *
	 */
    visualizeMap: function() {
    	var csX = cfg.cellSizeX;
    	var csY = cfg.cellSizeY;
    	var cs = Math.min(csX, csY);

    	this.terrainGraphics = this.add.graphics();
    	this.pictureGraphics = this.add.graphics();
    	this.markingGraphics = this.add.graphics();

    	this.players = [];

    	//
    	// display grid LINES and MARKINGS
    	//
    	this.markingGraphics.lineStyle(cfg.grid.lineWidth, cfg.gridlineColor, cfg.grid.lineAlpha);   // color: 0xRRGGBB

    	var markingTextCfg = {
    		fontFamily: 'Ravi Prakash',
    		fontSize: '24px',
    		color: '#333333'
    	}
    	var textOffset = { x: 0.075*cfg.cellSizeX, y: 0.075*cfg.cellSizeY }
    	
    	for(var x = 0; x < cfg.width; x++) {
    		var line = new Phaser.Geom.Line(x*csX, 0, x*csX, cfg.height*csY);
    		this.markingGraphics.strokeLineShape(line);

    		var txt = this.add.text((x+0.5)*csX, textOffset.y, this.getLetterMarking(x), markingTextCfg);
    		txt.setOrigin(0.5, 0.0);
    	}

    	for(var y = 0; y < cfg.height; y++) {
    		var line = new Phaser.Geom.Line(0, y*csY, cfg.width*csX, y*csY);
    		this.markingGraphics.strokeLineShape(line);

    		var txt = this.add.text(textOffset.x, (y+0.5)*csY, "" + y, markingTextCfg);
    		txt.setOrigin(0.0, 0.5);
    	}


    	//
    	// display terrain
    	//

        for(var i = 0; i < this.allGroups.length; i++) {
            if(this.hasOwnProperty(this.allGroups[i])) { continue; } // this one already exists? (e.g. with terrainGraphics) continue
            this[this.allGroups[i]] = this.add.group();
        }

    	this.mapStats = {
    		'numFoodSources': 0,
    		'numWaterSources': 0,
    		'numOverlayTerrain': 0
    	}

    	for(var x = 0; x < cfg.width; x++) {
    		for(var y = 0; y < cfg.height; y++) {
                var gridPos = {x:x, y:y};
    			var cell = MAP.getCell(gridPos);
    			var cX = (x+0.5)*csX, cY = (y+0.5)*csY
    			var pos = { x: cX, y: cY }

    			var rect = new Phaser.Geom.Rectangle(x*csX, y*csY, csX, csY);

    			this.terrainGraphics.fillStyle(this.convertTerrainToColor(cell.terrain), 1.0);
				this.terrainGraphics.fillRectShape(rect);

				if(cell.hasOverlayTerrain()) {
                    var s = this.add.sprite(cX, cY, 'environment_tracks');
                    s.displayWidth = s.displayHeight = cs;
                    s.setOrigin(0.5, 0.5);
                    s.setFrame(this.getTerrainFrame(cell.terrain)*2);

                    s.depth = 1;

                    cell.overlayTerrain.sprite = s;
					this.overlayTerrainGroup.add(s);

					this.mapStats.numOverlayTerrain++;
				}

				if(cell.isHideout()) {
                    var s = this.add.sprite(cX, cY, 'misc');
                    s.displayWidth = s.displayHeight = cs;
                    s.setOrigin(0.5);
                    s.setFrame(3);
                    s.depth = 2;

					cell.hideout.sprite = s;
                    this.overlayTerrainGroup.add(s);
				}

				// @TODO: Looooads of overlap between all these functions, how to generalize well?
				if(cell.hasWaterSource()) {
					this.createWaterSprite(cell, pos)
				}

				if(cell.hasFoodSource()) {
					this.createFoodSprite(cell, pos);
				}

                // Check edges (horizontal and vertical)
                // (Because csX and csY are different numbers, I do some scaling shenanigans to make them look equally sized)
                var hEdge = MAP.getEdge('h', gridPos);
                if(hEdge.hasContent()) {
                    var s = this.add.sprite(x*csX, y*csY, 'edge_sprites');
                    s.displayHeight = csX;
                    s.displayWidth = 0.25*s.displayHeight;

                    s.setOrigin(0.5,0);
                    s.setFrame(EDGES[hEdge.type].frame)
                    s.rotation = -0.5*Math.PI;
                    s.depth = 2;

                    hEdge.sprite = s;
                    this.edgeGroup.add(s);
                }

                var vEdge = MAP.getEdge('v', gridPos);
                if(vEdge.hasContent()) {
                    var s = this.add.sprite(x*csX, y*csY, 'edge_sprites');
                    s.displayHeight = csY;
                    s.displayWidth = (csX/csY)*0.25*s.displayHeight;
                    
                    s.setOrigin(0.5,0);
                    s.setFrame(EDGES[vEdge.type].frame)

                    s.depth = 2;
                    vEdge.sprite = s;
                    this.edgeGroup.add(s);
                }
    		}
    	}

    	//
    	// display monster(s)
        // NOTE: monster, animals and players only get their position AFTER the whole map is generated
        //       so we just create the sprites _wherever_ here
        //
    	var s = this.add.sprite(cX, cY, 'monsters');
		s.displayWidth = s.displayHeight = cs;
		s.setOrigin(0.5, 0.5);
		s.setFrame(MONSTER.frame);
		s.depth = 10;

		MONSTER.attachSprite(s);
		this.monsterGroup.add(s);

        //
        // display animals
        //
        for(var i = 0; i < ANIMALS.length; i++) {
            var a = ANIMALS[i];
            var s = this.add.sprite(cX, cY, 'animals');
            s.displayWidth = s.displayHeight = cs;
            s.setOrigin(0.5);
            s.setFrame(a.frame);
            s.depth = 9;

            a.attachSprite(s);
            this.animalGroup.add(s);
        }

    	//
    	// display players
        // NOTE: this is NOT part of "all groups", because it usually has different behaviour from those
    	//
    	this.playerGroup = this.add.group();

    	for(var i = 0; i < PLAYERS.length; i++) {
    		var p = PLAYERS[i];
    		var s = this.add.sprite((p.x+0.5)*csX, (p.y+0.5)*csY, 'players');

    		// players display in 2 columns (because there can be multiple on the same square), so scale down by that factor
    		s.displayWidth = s.displayHeight = 0.5*cs; 

    		s.setFrame(i);
    		s.depth = 9;

    		this.players.push(s);
    		this.playerGroup.add(s);
    	}

    	//
    	// if not debugging, flip all these groups to false, to hide them by default
    	//
        for(var i = 0; i < this.allGroups.length; i++) {
            this[this.allGroups[i]].setVisible(cfg.debugging);
        }
    },

    prepSprite: function(s, depth) {
    	var size = 0.66*Math.min(cfg.cellSizeX, cfg.cellSizeY);
		s.displayWidth = s.displayHeight = size;

		s.setOrigin(0.5);
		s.depth = depth;
    },

    createFoodSprite: function(cell, pos) {
		var s = this.add.sprite(pos.x, pos.y, 'food_sources');
		this.prepSprite(s, 8);

		var frame = this.getTerrainFrame(cell.terrain)*3;
		s.setFrame(frame);

		cell.food.sprite = s;

		this.foodGroup.add(s);
		this.mapStats.numFoodSources++;
    },

    createWaterSprite: function(cell, pos) {
    	var s = this.add.sprite(pos.x, pos.y, 'water_sources');
    	this.prepSprite(s, 6);

		var frame = this.getTerrainFrame(cell.terrain)*3;
		s.setFrame(frame);

		cell.water.sprite = s;

		this.waterGroup.add(s);
		this.mapStats.numWaterSources++;
    },

    showCompleteMonsterPath: function() {
    	var graphics = this.add.graphics();

    	graphics.lineStyle(5, 0xFF0000, 1.0);
		graphics.beginPath();

		var p = MONSTER.completePath[0]
		graphics.moveTo((p.x+0.5) * cfg.cellSizeX, (p.y+0.5) * cfg.cellSizeY);

		for(var i = 1; i < MONSTER.completePath.length; i++) {
			p = MONSTER.completePath[i];
			graphics.lineTo((p.x+0.5)*cfg.cellSizeX, (p.y+0.5)*cfg.cellSizeY);
		}
		
		//graphics.closePath();
		graphics.strokePath();

    },

    moveSprite: function(sprite, pos) {
    	sprite.x = (pos.x + 0.5) * cfg.cellSizeX;
    	sprite.y = (pos.y + 0.5) * cfg.cellSizeY;
    },

    visualizePlayersInCell: function(pos) {
    	if(pos.x == -1 || pos.y == -1) { return; }

    	var playersAtLocation = MAP.getCell(pos).players;
    	var num = playersAtLocation.length;

    	// Check all players that are at this location
		for(var i = 0; i < num; i++) {
			var index = playersAtLocation[i];

			var col = i % 2;
			var row = Math.floor(i / 2);

			// Exception: just one player? center it
			if(num == 1) {
				col = 0.5
				row = 0.5
			}

			var newX = (pos.x + 0.25 + 0.5*col)*cfg.cellSizeX; 
			var newY = (pos.y + 0.25 + 0.5*row)*cfg.cellSizeY;

			this.players[index].setPosition(newX, newY);
		}
    },


	movePlayerSprite: function(index, oldPos, pos) {
		// update the PREVIOUS location (because we're gone there)
		this.visualizePlayersInCell(oldPos);

		// then update the new location
		this.visualizePlayersInCell(pos);
	},

	getTerrainFrame: function(val) {
		return CELL_TERRAINS.indexOf(val);
	},

    convertTerrainToColor: function(val) {
        var cols = [0xB8CFFF, 0xF9F975, 0x4DFF26, 0x3F892F, 0x2F8975, 0x545454, 0xAAAAAA];
        var index = this.getTerrainFrame(val);
        return cols[index];
    }
});

function startPhaser(gameConfig = {}) {
	document.getElementById('phaserGameContainer').innerHTML = '';

	var config = {
	    type: Phaser.CANVAS,
	    width: cfg.canvasWidth,
	    height: cfg.canvasHeight,
	    scale: {
	    	mode: Phaser.Scale.FIT,
	    	autoCenter: Phaser.Scale.CENTER_BOTH
	    },
	    backgroundColor: '#FFFFFF',
	    parent: 'phaserGameContainer',
	   	// scene: [MainGame, StateLoad],
	}

	window.GAME = new Phaser.Game(config); 

	GAME.scene.add('mainGame', MainGame, false, {});
	GAME.scene.start('mainGame', gameConfig);
}

startPhaser();