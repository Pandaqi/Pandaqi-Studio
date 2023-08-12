var gameConfig = {};

const BoardGeneration = new Phaser.Class({
    Extends: Phaser.Scene,

    initialize:
    function BoardGeneration()
    {
        Phaser.Scene.call(this, { key: 'boardGeneration' });
    },

    preload: function() {
		this.load.crossOrigin = 'Anonymous';
		this.canvas = this.sys.game.canvas;

		var base = 'gamesites/unstable-universe/';

		var spritesheetSlice = { frameWidth: 100, frameHeight: 100 };

        this.load.image('fault_line', base + 'fault_line.png')

		this.load.spritesheet('node_outlines', base + 'node_outlines.png?c=1', spritesheetSlice);
		this.load.spritesheet('mission_nodes', base + 'mission_nodes.png?c=1', spritesheetSlice);
		this.load.spritesheet('regular_nodes', base + 'regular_nodes.png?c=3', spritesheetSlice);

		this.load.spritesheet('expedition_nodes', base + 'expedition_nodes.png?c=1', spritesheetSlice)

		this.load.spritesheet('tiny_nodes', base + 'tiny_nodes.png', spritesheetSlice)
		this.load.spritesheet('natural_resources', base + 'natural_resources.png', spritesheetSlice);
		this.load.spritesheet('landmarks', base + 'landmarks.png', spritesheetSlice)

		this.load.spritesheet('daynight_icons', base + 'daynight_icons.png', spritesheetSlice)
    },

    create: function(config) {
    	// user-input settings should be passed through config
    	this.cfg = {}
    	
    	this.cfg.resolutionX = 10; // number of points across the width of the paper

        // TEST: more nodes + edges on higher player counts (~0.5 resolution extra per player)
        // Works fine, although now we might have TOO MUCH space (and some icons get quite tiny)
        if(gameConfig.numPlayers > 4) {
            this.cfg.resolutionX += Math.max( Math.floor((gameConfig.numPlayers - 4)*0.5), 1.0);
        }

    	this.cfg.resolutionY = Math.floor((210/297) * this.cfg.resolutionX); // number of points across the height of the paper
    	this.cfg.cellSizeX = this.canvas.width / this.cfg.resolutionX;
    	this.cfg.cellSizeY = this.canvas.height / this.cfg.resolutionY;

        // on higher player counts, there are more nodes, so the min/max settings on nodes need to be scaled UPWARDS to stay correct
        // calculate number of extra nodes we received, divide by how many nodes are in the set on average
        if(this.cfg.resolutionX > 10) {
            var extraNodes = (this.cfg.resolutionX - 10) * this.cfg.resolutionY + (this.cfg.resolutionY - 7) * this.cfg.resolutionX - (this.cfg.resolutionX - 10)*(this.cfg.resolutionY - 7);

            this.cfg.nodeSettingScaleFactor = Math.max( extraNodes / 15, 1.0);
            this.cfg.distanceScaleFactor = Math.max( Math.min( (this.cfg.resolutionX - 10), (this.cfg.resolutionY - 7) ), 1.0);
        } else {
            this.cfg.nodeSettingScaleFactor = 1.0;
            this.cfg.distanceScaleFactor = 1.0;
        }

        console.log(this.cfg);

    	this.cfg.nodeRadius = 0.3;
    	this.cfg.naturalResourceRadius = 0.3 * this.cfg.nodeRadius;

    	this.cfg.naturalResourceAlpha = 0.66;

    	this.cfg.minPowerDots = 1 + Math.floor(gameConfig.numPlayers / 4.0);
    	this.cfg.maxPowerDots = 2 + Math.floor(gameConfig.numPlayers / 4.0);

    	this.mainGraphics = null;
    	this.connectionsToDraw = [];

    	this.centerNode = null;
    	this.curSequence = 0;

    	this.createdSecretBoard = false;

    	this.generateBoard();
    	// this.convertCanvasToImage();
    },

    generateBoard: function() {
    	this.placePoints();
    	this.placeObstacles();

    	// for debugging, it helps if I see what's going on each relaxing iteration
    	this.currentIteration = 0;
    	this.finalVisualization = false;

    	const ths = this;
    	this.iteratingTimer = this.time.addEvent({
		    delay: 3,
		    callback: function() {
		        ths.relaxPoints();
		        ths.visualizeGame();

		        if(ths.currentIteration >= 60) {
		    		ths.finishGeneration();
		    	}
		    },
		    loop: true
		})

    	//this.relaxPoints();
    	//this.visualizeGame();
    },

    finalizePointTypes: function() {
    	const RNG = new Math.seedrandom(seed + "-finalizeTypes");
    	const RNG2 = new Math.seedrandom(seed + "-startingNodes")

    	// turn X random points on the edge into starting positions;
    	// distribute equally across all 4 edges
    	// ALSO fill all the other edge points with something (otherwise I need to clean up the edges later, because some nodes are not allowed there)
    	var edges = ['left', 'right', 'top', 'bottom'];
    	var numPlayersPerEdge = 3;	

    	// pre-generate list of mission nodes
    	// if "First Game" enabled, everyone receives the explorer mission
    	// Otherwise, it picks randomly, but ensures all types appear at least once
    	this.missionNodeList = [];

    	if(gameConfig.firstGame) {
    		const FIRSTGAME_RNG = new Math.seedrandom(seed + "-firstGame")

    		// NOTE: there are only a few Mission Nodes that function when ALL players have it
    		// (others don't; for example, there's not enough plants for everyone to be a biologist)
    		var firstGameTypes = ['Traveler', 'Collector'];
    		var randType = firstGameTypes[Math.floor(FIRSTGAME_RNG() * firstGameTypes.length)]

    		for(var i = 0; i < numPlayersPerEdge*4; i++) {
    			this.missionNodeList.push(randType);
    		}
    	} else {
    		var MISSION_NODE_RNG = new Math.seedrandom(seed + "-missionNodes")

    		// remove any missions that are impossible (because there's no relevant node on the board)
    		for(var name in MISSION_NODES) {
    			var relevantNodes = MISSION_NODES[name].relevantNodes || [];

    			if(relevantNodes.length <= 0) { continue; }

    			var hasRelevantNode = false;
    			for(var i = 0; i < relevantNodes.length; i++) {
    				if(NODES[relevantNodes[i]]) {
    					hasRelevantNode = true;
    					break;
    				}
    			}

    			if(!hasRelevantNode) { delete MISSION_NODES[name]; }
    		}

    		// now that missions are removed, update total probability
    		this.totalMissionNodeProbability = this.getTotal(MISSION_NODES);

    		// add all types at least once
    		for(var name in MISSION_NODES) {
	    		this.missionNodeList.push(name);
	    	}

	    	// then keep adding random missions until list is filled
	    	while(this.missionNodeList.length < numPlayersPerEdge*4) {
	    		this.missionNodeList.push( this.getRandom(MISSION_NODES, this.totalMissionNodeProbability, MISSION_NODE_RNG) );
	    	}

	    	// shuffle, we'll apply them in order later
	    	this.shuffle(this.missionNodeList, MISSION_NODE_RNG);
    	}


    	for(var e = 0; e < 4; e++) {
    		var edgeName = edges[e];
    		var edge = this.edgePoints[edgeName]

			// first, sort all edge nodes based on distance to center
			for(var i = 0; i < edge.length; i++) {
				edge[i].distanceToCenter = Math.pow(edge[i].x - this.centerNode.x, 2) + Math.pow(edge[i].y - this.centerNode.y, 2) 
			}

			edge = edge.sort(function(a,b) { if(a.distanceToCenter < b.distanceToCenter) { return 1; } else { return -1; } })

			// then place mission nodes, with two restrictions:
			// 1) as far away from center as possible (so pick first in sorted list)
			// 2) they must have at least one connection that is NOT also used by another mission node

			// TO DO: Add fail-safe in case there are too many invalid mission nodes?
			var counter = 0;
			for(var i = 0; i < numPlayersPerEdge; i++) {
				var p;
	    		do {
	    			p = edge[counter];
	    			counter++;
	    		} while (this.invalidMissionNode(p));

	    		this.convertToMissionNode(p);
	    	}
	    }

    	// for each node, add it to the list its minimum number of times
    	const nodeTypes = [];
    	for(name in NODES) {
    		var howMany = NODES[name].min || 0;
            howMany = Math.round(howMany*this.cfg.nodeSettingScaleFactor);

    		NODES[name].currentlyOnBoard = howMany;

    		for(var i = 0; i < howMany; i++) {
    			nodeTypes.push(name);
    		}
    	}

    	// now fill the list randomly until we have something for every point
    	var numPointsNeeded = this.points.length - 9 - 1; // all points, minus starting positions and center point
    	while(nodeTypes.length < numPointsNeeded) {
    		var type = this.getRandom(NODES, this.totalNodeProbability, RNG2);
    		nodeTypes.push( type );

    		// keep track of maximum => remove node from list of possibilities when reached/exceeded
    		NODES[type].currentlyOnBoard++;
            var max = NODES[type].max || Infinity;
            max = Math.round(max * this.cfg.nodeSettingScaleFactor);

			if(NODES[type].currentlyOnBoard >= max) {
				this.totalNodeProbability -= NODES[type].prob;

				var copy = {};
				for(var param in NODES[type]) {
					copy[param] = NODES[type][param]
				}

				copy.prob = 0

				NODES[type] = copy;
			}
    	}

    	this.shuffle(nodeTypes, RNG2);
    	this.shuffle(this.points, RNG); // also shuffle points, otherwise we always make decisions/use fail-safes in the same order

    	// now go through all points 
    	var nodeCounter = 0;
    	for(var i = 0; i < this.points.length; i++) {
    		var p = this.points[i];

    		// (only update those that haven't yet been updated, otherwise we override center node and mission nodes)
    		if(p.type != 'Regular') { continue; }

			// as long as we encounter nodes that are not allowed, try the next point type on the list
			// (if we've exhausted the whole list, reset to 0 and just pick that anyway)
			var nodeAllowed = false, counter = -1, tempType = null;
			do {
				counter++;

				if(counter >= nodeTypes.length) {
    				tempType = nodeTypes[0]
					break;
				}

				tempType = nodeTypes[counter]
				nodeAllowed = this.checkIfNodeAllowed(p, tempType);
			} while(!nodeAllowed);

			p.type = tempType;
			nodeTypes.splice(counter, 1);
    	}
    },

    checkSequenceRecursive: function(p, type) {
    	var sequenceSums = 1; // also take into account the node itself
		p.sequenceCounter = this.curSequence + 1;

    	for(var c = 0; c < p.connections.length; c++) {
			var conn = p.connections[c];

			if(conn.type != type || conn.sequenceCounter > this.curSequence) { continue; }

			// by increasing the sequence counter, we know we'd already considered this node (so we don't loop endlessly when checking)
			sequenceSums += this.checkSequenceRecursive(conn, type)
		}

		return sequenceSums;
    },

    checkIfNodeAllowed: function(p, type) {
    	var nodeData = NODES[type]

    	//
    	// some nodes are not allowed at the edge
    	//
		if(p.edgePoint && nodeData.forbiddenOnEdge) {
			return false;
		}

		//
		// some nodes have a fixed minimum distance from the edge
		//
		var minDistance = nodeData.minDistanceFromEdge || -1;
        minDistance *= this.cfg.distanceScaleFactor;
		if(this.distanceToEdge(p) <= minDistance) {
			return false;
		}

		//
		// and some even have a fixed MAXIMUM distance from the edge
		// (such as water, because I don't want people teleporting to the center of the board)
		//
		var maxDistanceFromEdge = nodeData.maxDistanceFromEdge || Infinity;
        maxDistanceFromEdge *= this.cfg.distanceScaleFactor;
		if(this.distanceToEdge(p) > maxDistanceFromEdge) {
			return false;
		}


		//
		// many nodes have a maximum on the number of them that may be "in sequence" ( = grouped together)
		//
		var maxSequence = nodeData.maxSequence || 2;
        maxSequence *= this.cfg.distanceScaleFactor;

    	this.curSequence++;
		var sequenceLength = this.checkSequenceRecursive(p, type);

		if(sequenceLength > maxSequence) {
			return false;
		}

		//
		// a node with a number is NOT allowed right after a starting node
		//
		if(nodeData.needsNumber) {
			if(this.connectedToStartingSquare(p)) {
				return false;
			}
		}

		return true;
    },

    distanceToEdge: function(p) {
    	var minX = Math.min(p.x, this.cfg.resolutionX - p.x);
    	var minY = Math.min(p.y, this.cfg.resolutionY - p.y);
    	return Math.min(minX, minY);
    },

    connectedToStartingSquare: function(p) {
    	for(var c = 0; c < p.connections.length; c++) {
			var conn = p.connections[c];

			if(conn.nodeType == 'Mission') {
				return true;
			}
		}

		return false;
    },

    placePoints: function() {
    	this.points = [];
    	this.map = [];

    	const RNG = new Math.seedrandom(seed + "-pointTypes");
    	const RNG2 = new Math.seedrandom(seed + "-x");
    	const RNG3 = new Math.seedrandom(seed + "-y");
    	const RNG4 = new Math.seedrandom(seed + "-centerLocation")

    	const rX = this.cfg.resolutionX, rY = this.cfg.resolutionY;

    	this.edgePoints = { left: [], right: [], top: [], bottom: [] };

    	var centerNodePosition = {
    		'x': (RNG4() < 0.5) ? Math.floor(0.5*rX) : Math.floor(0.5*rX+1.0),
    		'y': (RNG4() < 0.5) ? Math.floor(0.5*rY) : Math.floor(0.5*rY + 1.0)
    	} 

    	// first, place all points on exact grid intervals, and determine a random type (planet, moon, ...)
    	for(var x = 0; x <= rX; x++) {
    		this.map[x] = [];

    		for(var y = 0; y <= rY; y++) {
    			this.map[x][y] = [];

    			var val = RNG();
    			var pointType = 'Regular';

    			// mark the center 4 points 
    			if(x == centerNodePosition.x && y == centerNodePosition.y) {
					pointType = 'Center';
    			}

    			var p = { 
    				'x': x - 0.5 + RNG3(), 
    				'y': y - 0.5 + RNG3(),

    				'type': pointType,
    				'nodeType': 'Regular',

    				'sequenceCounter': 0,

    				'edgePoint': false,
    				'whichEdges': [],

    				'staticX': false,
    				'staticY': false,

    				'connections': [],

    				'powerDots': [],
    				'edgeAngles': [],
    				'tempAngle': 0,

    				'areasMade': 0,

    				'iPointsCreated': 0,
    				'intermediaryPointsExhausted': false,
    			}

    			if(pointType == 'Center') {
    				this.centerNode = p;
    			}

    			this.keepPointOnScreen(p);

    			this.points.push(p);
    			this.map[Math.floor(p.x)][Math.floor(p.y)].push(p);
    		}

    		// already mark some points as edgePoints
    		this.pushPointsToEdge();
    	}
    },

    placeObstacles: function() {
    	const numObstacles = 5;
    	const RNG = new Math.seedrandom(seed+"-obstacles");

    	this.obstacles = [];

    	for(var i = 0; i < numObstacles; i++) {
    		var x = RNG()*this.cfg.resolutionX, y = RNG()*this.cfg.resolutionY;
    		var obst = {'x': x, 'y': y, 'type': 'obstacle', 'radius': RNG()*0.4 + 0.2 };
    		this.map[Math.floor(x)][Math.floor(y)].push(obst);
    		this.obstacles.push(obst)
    	}
    },

    relaxPoints: function() {
    	const numIterations = 1;
    	const numPoints = this.points.length;

    	this.currentIteration++;
    	
    	// Reduce velocity strength with each iteration (they move less and less wildly over time, so that algorithm ends smoothly)
    	var stepSize = 2.0 / this.currentIteration;
    	var equilibrium = 1.0;

    	for(var i = 0; i < numIterations; i++) {
    		// first, determine velocity based on connections
    		for(var a = 0; a < numPoints; a++) {
    			var p = this.points[a];
    			var vel = [0,0];
    			var cX = Math.floor(p.x), cY = Math.floor(p.y)

    			// find which points we'll be influenced by
    			// (just copy whatever is in each cell within a certain range)
    			var connections = [];
    			var range = 3;
    			for(var xx = -range; xx <= range; xx++) {
    				for(var yy = -range; yy <= range; yy++) {
    					if(this.outOfBounds(cX + xx, cY + yy)) {
    						continue;
    					}

    					var cells = this.map[cX + xx][cY + yy]

    					for(var cc = 0; cc < cells.length; cc++) {
    						connections.push(cells[cc]);
    					}
    				}
    			}

    			for(var c = 0; c < connections.length; c++) {
    				var p2 = connections[c];
    				var vec = [p.x - p2.x, p.y - p2.y]
    				var dist = Math.sqrt(vec[0]*vec[0] + vec[1]*vec[1]);

    				var force = 0, dir = 1.0;
    				var equilibrium = 1.0;
    				if(p2.type == 'obstacle') {
    					equilibrium = p2.radius;
    				}

    				if(dist > equilibrium) {
    					continue;
    				}

    				// mid points should just space out themselves evenly
					force = Math.abs(dist - equilibrium);
					dir = (dist < equilibrium) ? 1.0 : -1.0;

    				if(force != 0) {
    					vel = [vel[0] + dir*vec[0]*force, vel[1] + dir*vec[1]*force]
    				}
    			}

    			p.relaxVelocity = vel
    		}

    		// then move all points based on that velocity
    		for(var a = 0; a < numPoints; a++) {
    			var p = this.points[a]

    			// remove from old cell
    			var old_cX = Math.floor(p.x), old_cY = Math.floor(p.y)

    			// some cells are static in one direction; listen to that
    			if(p.staticX) {
    				p.relaxVelocity[0] = 0;
    			} 

    			if(p.staticY) {
    				p.relaxVelocity[1] = 0;
    			}

    			// actually move
    			p.x += p.relaxVelocity[0] * stepSize;
    			p.y += p.relaxVelocity[1] * stepSize;

    			this.keepPointOnScreen(p);
    			this.updateCell(old_cX, old_cY, p);
    		}
    	}
    },

    createMinimumSpanningTree: function() {
    	this.connectionsToDraw = [];

    	var pointsVisited = 0;
    	var pointsToVisit = this.points.length
    	var curPoint = this.points[0];
    	curPoint.visited = true;
    	var list = [curPoint];

    	// use Prim's algorithm to build a minimum spanning tree from ALL points
    	while(pointsVisited < (pointsToVisit - 1)) {
    		var query = this.getClosestConnection(list);
    		var p = query.p, p2 = query.p2;

    		p.connections.push(p2);
    		p2.connections.push(p);

    		p2.visited = true;
    		this.connectionsToDraw.push([p.x, p.y, p2.x, p2.y]);

    		list.push(p2);

    		pointsVisited++;
    	}
    },

    randomFillTree: function() {
    	const numExtraConnections = 40;
    	const connectionMaximum = 3;

    	var numFails = 0;

    	const RNG = new Math.seedrandom(seed + "-treeFill");

    	// give the center node as many connections as we can manage
    	var query
    	do {
    		var p = this.centerNode
    		query = this.getClosestConnection([p], 'unconnected')

    		var p2 = query.p2
    		if(p2 == null || query.dist >= 2.0) { break; }

    		p.connections.push(p2);
    		p2.connections.push(p);

    		this.connectionsToDraw.push([p.x, p.y, p2.x, p2.y]);
    	} while(query.p2 != null);

    	// then go through all the other points
    	for(var i = 0; i < this.points.length; i++) {
    		var p = this.points[i];

    		// Don't add connections if something already has too many of them
    		// Also don't add extra connections to edgePoints => might want to change this, as a single connection is a bit restricting
    		if(p.edgePoint || p.connections.length >= connectionMaximum) {
    			continue;
    		}

    		var query = this.getClosestConnection([p], 'unconnected');

    		// there IS no closest connection, so continue without doing anything
    		if(query.p2 == null) {
    			continue;
    		}

    		// otherwise, make the connection we found (and we should always draw it)
    		var p2 = query.p2;

    		p.connections.push(p2);
    		p2.connections.push(p);

    		this.connectionsToDraw.push([p.x, p.y, p2.x, p2.y]);
    	}
    },

    getClosestConnection: function(list, searchType = 'unvisited') {
    	var range = 1;
    	var foundValidNode = false;

	    while(!foundValidNode) {
	    	var closestDist = Infinity, closestNode = null, originNode = null;

	    	for(var i = 0; i < list.length; i++) {
	    		var p = list[i];
		    	var cX = Math.floor(p.x), cY = Math.floor(p.y)

    			for(var xx = -range; xx <= range; xx++) {
    				for(var yy = -range; yy <= range; yy++) {
    					if(this.outOfBounds(cX + xx, cY + yy)) {
    						continue;
    					}

    					var cells = this.map[cX + xx][cY + yy]

    					for(var cc = 0; cc < cells.length; cc++) {
    						var p2 = cells[cc]

    						// skip certain nodes based on search type
    						if(searchType == 'unvisited') {
    							if(p2.visited == true) {
    								continue;
    							}
    						} else if(searchType == 'unconnected') {
    							if(p.connections.includes(p2)) {
    								continue;
    							}
    						}

    						// do not all these things:
    						// ourselves, obstacles, two edge points
    						if(p == p2 || p2.type == 'obstacle' || (p.edgePoint && p2.edgePoint)) {
    							continue;
    						}

    						var tempDistance = (p.x - p2.x)*(p.x - p2.x) + (p.y - p2.y)*(p.y - p2.y)
    						if(tempDistance < closestDist) {
    							closestDist = tempDistance;
    							originNode = p;
    							closestNode = p2;
    						}
    					}
    				}
    			}
    		}

			if(closestNode != null) {
				foundValidNode = true;
				return { p: originNode, p2: closestNode, dist: closestDist };
			} else {
				range++;
			}

			// fail-safe: when searching for unconnected points, we might need to look REALLY FAR to get any result, so quit after some time
			if(searchType == 'unconnected' && range >= 3) {
				return { p: null, p2: null }
			}
		}
    },

    createConnections: function() {
    	this.connectionsToDraw = [];

    	for(var a = 0; a < this.points.length; a++) {
			var p = this.points[a];
			
			var possibleConnections = [];

			var cX = Math.floor(p.x), cY = Math.floor(p.y)

	    	// find everything within a certain range
	    	var range = 1;
			for(var xx = -range; xx <= range; xx++) {
				for(var yy = -range; yy <= range; yy++) {
					if(this.outOfBounds(cX + xx, cY + yy)) {
						continue;
					}

					var cells = this.map[cX + xx][cY + yy]

					for(var cc = 0; cc < cells.length; cc++) {
						var p2 = cells[cc]

						// do not include ourselves!
						if(p == p2) {
							continue;
						}

						// obstacles can't be connected with!
						// TO DO/IDEA: Maybe they can! But it's a spot where MULTIPLE people can stand or do something special?
						if(p2.type == 'obstacle') {
							continue;
						}

						// do not include edgePoints if we're an edgePoint ourselves!
						if(p.edgePoint && p2.edgePoint) {
							continue;
						}

						// do not draw connection if this would exceed point maximum (for edge points only, for now)
						if(p2.edgePoint && p2.connections.length >= 2) {
							continue;
						}

						p2.tempDistance = (p.x - p2.x)*(p.x - p2.x) + (p.y - p2.y)*(p.y - p2.y)
						possibleConnections.push(p2);
					}
				}
			}

			// sort connections based on distance, keep only the lowest 3
			possibleConnections.sort(function(a,b) { if(a.tempDistance < b.tempDistance) { return -1 } else { return 1 } });

			var maxConnections = p.edgePoint ? 1 : 3;
			var numConnections = Math.max(Math.min(maxConnections, possibleConnections.length) - p.connections.length, 0);
			possibleConnections = possibleConnections.slice(0, numConnections);

			// add the chosen connections ON TOP OF the existing ones
			for(var i = 0; i < possibleConnections.length; i++) {
				p.connections.push(possibleConnections[i]);
			}

			// mark it as a connection to draw
			// but ONLY if connection does not already exist from the other side
			for(var i = 0; i < p.connections.length; i++) {
				var p2 = p.connections[i];

				if(!p2.connections.includes(p)) {
					this.connectionsToDraw.push([p.x, p.y, p2.x, p2.y]);
				}
			}

		}
    },

    convertToMissionNode: function(p) {
    	p.nodeType = 'Mission';
    	p.type = this.missionNodeList.splice(0, 1)[0];

    	for(var i = 0; i < p.connections.length; i++) {
    		p.connections[i].takenByMissionNode = true;
    	}
    },

    invalidMissionNode: function(p) {
    	if(p.type != 'Regular') { return true; }

    	var connectionsUsed = 0;
    	for(var i = 0; i < p.connections.length; i++) {
    		if(p.connections[i].takenByMissionNode) {
    			connectionsUsed++;
    		}
    	}

    	return (connectionsUsed >= p.connections.length);
    },

    pushPointsToEdge: function() {
    	const edgeMargin = 0.15;
    	const rightEdge = this.cfg.resolutionX - edgeMargin;
    	const bottomEdge = this.cfg.resolutionY - edgeMargin

    	for(var i = 0; i < this.points.length; i++) {
    		var p = this.points[i];

			var old_cX = Math.floor(p.x), old_cY = Math.floor(p.y)

			if(!p.staticX) {
	    		if(p.x < edgeMargin) {
	    			p.x = 0;
	    			p.edgePoint = true;
	    			p.staticX = true;
	    			p.whichEdges.push(0);
    				this.edgePoints.left.push(p);
	    		} else if(p.x > rightEdge) {
	    			p.x = rightEdge + edgeMargin;
	    			p.edgePoint = true;
	    			p.staticX = true;
	    			p.whichEdges.push(2);
    				this.edgePoints.right.push(p);
	    		} 
	    	}

	    	if(!p.staticY) {
	    		if(p.y < edgeMargin) {
	    			p.y = 0;
	    			p.edgePoint = true;
	    			p.staticY = true;
	    			p.whichEdges.push(1);
	    			this.edgePoints.top.push(p);
	    		} else if(p.y > bottomEdge) {
	    			p.y = bottomEdge + edgeMargin;
	    			p.edgePoint = true;
	    			p.staticY = true;
	    			p.whichEdges.push(3);
	    			this.edgePoints.bottom.push(p);
	    		}
	    	}

    		this.updateCell(old_cX, old_cY, p);
    	}
    },

    updateCell: function(x, y, p) {
		// add to new cell
		var cX = Math.floor(p.x), cY = Math.floor(p.y)

		// ONLY switch cells if that's actually needed (performance optimization)
		if(x != cX || y != cY) {
			var cell = this.map[x][y]
			cell.splice(cell.indexOf(p), 1);

			cell = this.map[cX][cY]
			cell.push(p);
		}
	},

    removeUselessPoints: function() {
    	for(var i = (this.points.length-1); i >= 0; i--) {
    		var p = this.points[i];

    		if(p.connections.length <= 0) {
    			continue;

    			this.points.splice(i, 1);

    			var cell = this.map[Math.floor(p.x)][Math.floor(p.y)]
    			cell.splice(cell.indexOf(p), 1);
    		}
    	}
    },

    finishGeneration: function() {
    	this.iteratingTimer.remove();
    	this.finalVisualization = true;

    	// create connections between all points
    	this.pushPointsToEdge();
    	this.createMinimumSpanningTree();
    	this.randomFillTree();

    	// assign types to all the different nodes
    	//this.createConnections();
    	this.prepareLists();
    	this.removeUselessPoints();
    	this.createBetterNodeCollection();
    	this.finalizePointTypes();

    	// algorithm for determining power dots
    	this.orderEdgesByAngle();
    	this.placePowerDots();

    	// algorithm for finding enclosed areas (needed for Extreme Expeditions & Sharp Scissors)
    	// (yeah, it's a really complicated one, needs many steps that work just right)
    	if(gameConfig.expansions["Sharp Scissors"] || gameConfig.expansions["Extreme Expeditions"]) {
    		this.addTemporaryEdges();
    		this.orderEdgesByAngle();
	    	this.findEnclosedAreas();
	    	this.destroyTemporaryEdges();

	    	this.findSuitableAreas();			    		
    	}

    	// picks a few areas to place expeditions + determines their type
    	if(gameConfig.expansions["Extreme Expeditions"]) {
    		this.pickExpeditionNodes();
    	} else if(gameConfig.expansions["Sharp Scissors"]) {
    		this.addLandmarks();
    	}

    	// add intermediary points (only if Sharp Scissors is enabled)
    	// and resources to dig for
    	if(gameConfig.expansions["Sharp Scissors"]) {
	    	this.addIntermediaryPoints();
	    	this.addNaturalResources();
    	}

    	// finally, visualize the whole thing we created
    	// and convert to a static image
    	this.visualizeGame();
    	this.convertCanvasToImage();
    },

    orderEdgesByAngle: function() {
    	for(var i = 0; i < this.points.length; i++) {
    		var p = this.points[i];

    		// generate list of all angles (between this node and connections)
    		// NOTE: This list is NOT in sync with the connections list! We only need the values, not which node they belong to
    		p.edgeAngles = [];

    		for(var c = 0; c < p.connections.length; c++) {
    			var conn = p.connections[c];

    			var angle = Math.atan2(conn.y - p.y, conn.x - p.x)

    			if(angle < 0) { angle += 2*Math.PI; }

    			conn.tempAngle = angle;
    			p.edgeAngles.push(angle);
    		}

    		// now sort connections based on the angle 
    		// (we'll need this for the algorithm to find all enclosed areas on the board)
    		// NOTE: From now on, we may NEVER shuffle or re-arrange the connections lists again!
    		p.connections.sort(function(a,b) { if(a.tempAngle < b.tempAngle) { return -1; } else { return 1; } })
    	}
    },

    placePowerDots: function() {
    	const RNG = new Math.seedrandom(seed + "-powerDots");

    	const powerDotRadius = 0.225 * Math.PI;

    	var tempNumPowerDots = 0;
    	var minPD = this.cfg.minPowerDots, maxPD = this.cfg.maxPowerDots;

    	for(var i = 0; i < this.points.length; i++) {
    		var p = this.points[i];
    		p.powerDots = [];

    		// Special Nodes: center node only gets one dot, ruins get four locations
    		tempNumPowerDots = Math.floor(RNG()*(maxPD - minPD + 1)) + minPD;
    		if(p.type == 'Center') { tempNumPowerDots = 1; }
    		if(p.type == 'Village Ruins') { tempNumPowerDots = 4; }
    		if(p.type == 'Chameleon') { tempNumPowerDots += 2; }

    		var allAngles = p.edgeAngles.slice();

    		// first, determine the range in which angles might fall
    		var angleRange = { min: 0, max: 2*Math.PI }
    		var averageAngle = 0, numSides = p.whichEdges.length;

    		if(numSides > 0) {
	    		for(var we = 0; we < numSides; we++) {
	    			averageAngle += p.whichEdges[we]*0.5*Math.PI / numSides;
	    		}

	    		angleRange = { min: averageAngle - Math.PI / (numSides + 1), max: averageAngle + Math.PI / (numSides + 1) }

	    		// if we have a limited range, add fake "edges" at the ends of that range
	    		// (this way, the space around it is automatically divided into sections WITHIN range and OFF range
	    		allAngles.push((angleRange.min + 2*Math.PI) % (2*Math.PI))
    			allAngles.push((angleRange.max + 2*Math.PI) % (2*Math.PI))
	    	}

    		// How does it work?
    		// We pick a random edge and calculate distance to next edge. If that is big enough, we can place the dot somewhere in between
    		// The dot also counts as an edge, so we add it to allAngles
    		for(var pd = 0; pd < tempNumPowerDots; pd++) {

	    		var curAngleIndex = Math.floor(RNG() * allAngles.length);
	    		var foundFreeSpace = false;
	    		var numTries = 0;

	    		allAngles.sort();

	    		do {
	    			var ang = allAngles[curAngleIndex];
	    			var nextAng = allAngles[(curAngleIndex + 1) % allAngles.length]

	    			var spaceBetween = (nextAng - ang + 2*Math.PI) % (2*Math.PI); 
	    			if(ang == nextAng) { spaceBetween = 2*Math.PI; }

	    			var res = false;
	    			if(spaceBetween > 2*powerDotRadius) {
	    				var randAngle = ang + RNG() * (spaceBetween-2*powerDotRadius) + powerDotRadius;

	    				var res = this.createPowerDot(randAngle, p, allAngles)

	    				if(res) {
	    					foundFreeSpace = true;
	    					break;
	    				}
	    			}

	    			if(!res) {
	    				curAngleIndex = (curAngleIndex + 1) % allAngles.length;
    					numTries++;
	    			}

	    		// we're certain there is no free space if we've tried all angles we have
	    		} while(!foundFreeSpace && numTries <= allAngles.length);
    		}

    		// fail-safe: if no power dots were placed, place a random one within the range, for certain
    		if(p.powerDots.length <= 0) {
    			var randAngle = RNG() * (angleRange.max - angleRange.min) + angleRange.min;
    			var res = this.createPowerDot(randAngle, p, allAngles, false);
    		}
    	}
    },

    createPowerDot(angle, p, allAngles, checkBoundaries = true) {
		angle = angle % (2*Math.PI)
		if(angle < 0) { angle += 2*Math.PI; }

		var dx = Math.cos(angle), dy = Math.sin(angle) 

		// What's this?
		// For rectangular nodes, we choose ONE side (the one furthest out) and push it to the edge of the rectangle (1 or -1)
		// The other side remains free
		if(p.nodeType == 'Mission') {
			if(Math.abs(dx) > Math.abs(dy)) {
				dx /= Math.abs(dx)
			} else {
				dy /= Math.abs(dy)
			}
		}

		var PD = { 'x': dx, 'y': dy, 'angle': angle }

		// hacky way: check if it's out of bounds; if so, disallow it
		var radius = this.cfg.nodeRadius * Math.min(this.cfg.cellSizeX, this.cfg.cellSizeY)
		var realPos = { 'x': p.x + dx, 'y': p.y + dy }

		if(this.outOfBounds(realPos.x, realPos.y) && checkBoundaries) {
			return false;
		} else {
			p.powerDots.push(PD)
			allAngles.push(angle);

			return true;
		}	
    },

    addTemporaryEdges: function() {
    	var edges = ['left', 'top', 'right', 'bottom'];

    	// sort edges (ascending)
    	for(var i = 0; i < 4; i++) {
    		var edgeList = this.edgePoints[edges[i]];

    		if(i == 1 || i == 3) {
    			edgeList.sort(function(a,b) { if(a.x > b.x) { return 1; } else { return -1; } })
    		} else {
    			edgeList.sort(function(a,b) { if(a.y > b.y) { return 1; } else { return -1; } })				    			
    		}
    	}

    	// pick counter clockwise neighbour + add edge
    	for(var i = 0; i < 4; i++) {
    		var edgeList = this.edgePoints[edges[i]];
    		var prevEdgeList = this.edgePoints[ edges[ (i - 1 + 4) % 4 ] ];

    		for(var e = 0; e < edgeList.length; e++) {
    			var nb = null, node = edgeList[e];

    			// regular connections
    			if(i == 2 || i == 1) {

    				// connections across corners, if needed
    				if(e == 0) { 
    					if(!node.staticX || !node.staticY) {
	    					nb = prevEdgeList[prevEdgeList.length - 1]
	    					if(i == 1) { nb = prevEdgeList[0]; }
	    				}

    				} else {
    					nb = edgeList[e-1];
    				}
    			} else {
    				if(e == edgeList.length - 1) {
    					if(!node.staticX || !node.staticY) {
	    					nb = prevEdgeList[prevEdgeList.length - 1];
	    					if(i == 0) { nb = prevEdgeList[0]; }
	    				}

    				} else {
    					nb = edgeList[e+1];
    				}
    			}

    			if(nb == null) { continue; }

    			node.connections.push(nb);
    			nb.connections.push(node);
    		}
    	}
    },

    destroyTemporaryEdges: function() {
    	var edges = ['left', 'top', 'right', 'bottom'];
    	for(var i = 0; i < this.points.length; i++) {
    		var p = this.points[i];

    		if(!p.edgePoint) { continue; }

    		for(var c = p.connections.length - 1; c >= 0; c--) {
    			var conn = p.connections[c]

    			if(conn.edgePoint) {
    				p.connections.splice(c, 1);

    				var ind = conn.connections.indexOf(p);
    				conn.connections.splice(ind, 1)
    			}
    		}
    	}
    },

    findEnclosedAreas: function() {
    	this.areas = [];

    	for(var i = 0; i < this.points.length; i++) {
    		var p = this.points[i];

    		p.connectionUsed = [];

    		for(var c = 0; c < p.connections.length; c++) {
    			p.connectionUsed[c] = false;
    		}
    	}

    	for(var i = 0; i < this.points.length; i++) {
    		var p = this.points[i];

    		if(p.edgePoint) { continue; } // edgepoints run the risk of creating a polygon across the board, because they can never turn counter clockwise

    		// for each connection ... 
    		for(var c = 0; c < p.connections.length; c++) {
    			var conn = p.connections[c];

    			if(p.connectionUsed[c]) { continue; }

    			// start a new area
	    		var area = [p], areaDone = false, failedArea = false;
	    		var curNode = conn, prevNode = p;

    			p.connectionUsed[c] = true;

	    		while(!areaDone) {
	    			// add current node to area
		    		area.push(curNode);

		    		// find location of previous point in list of connections
		    		// (so we know the ANGLE at which we entered the node, so we can pick the one immediately clockwise to it)
		    		var indexByAngle = -1;
		    		for(var cc = 0; cc < curNode.connections.length; cc++) {
		    			if(curNode.connections[cc] == prevNode) {
		    				indexByAngle = cc;
		    			}
		    		}

		    		// now pick the NEXT connection after it
		    		var newIndex = (indexByAngle + 1) % curNode.connections.length;
		    		var newNode = curNode.connections[newIndex];

		    		// remember that the connection we will follow next, has already been used from this node
		    		// NOTE: Don't use the connection we used to GET here, as that should be saved on the node we CAME FRMO
		    		curNode.connectionUsed[newIndex] = true;

		    		// set new current and previous node
		    		prevNode = curNode
		    		curNode = newNode

		    		// if we're back at our starting node, we're done
	    			if(curNode == p) { 
	    				areaDone = true; 
	    			}

	    			// if we only have a single connection, the algorithm would cycle infinitely if we continued, so just break here
	    			if(curNode.connections.length <= 1) {
	    				areaDone = true;
	    				failedArea = true;
	    			}
    			}

    			if(!failedArea) {
    				this.areas.push(area);
    			}
    		}
    		
    	}
    },

    findSuitableAreas: function() {
    	const radius = this.cfg.nodeRadius;
    	const expeditionRadius = this.cfg.nodeRadius; // TO DO: change this?

    	this.suitableAreas = [];

    	for(var i = this.areas.length - 1; i >= 0; i--) {
    		var a = this.areas[i].slice(), numNodes = a.length, nodeRemoveCounter = 0;
    		var center = null
    		var areaIsSuitable = false;

    		do {

	    		// first, find the center point
	    		center = [0,0];
	    		var tempNumNodes = (numNodes - nodeRemoveCounter);
	    		for(var p = 0; p < tempNumNodes; p++) {
	    			center[0] += a[p].x / tempNumNodes;
	    			center[1] += a[p].y / tempNumNodes;
	    		}

	    		// then find the distance to the closest node
	    		// (aka "what's the biggest circle we can draw around the center that still fits within the polygon?")
	    		var closestDist = Infinity;
	    		for(var p = 0; p < numNodes; p++) {
	    			var dist = Math.sqrt( (a[p].x - center[0]) * (a[p].x - center[0]) + (a[p].y - center[1]) * (a[p].y - center[1]))
	    			closestDist = Math.min(closestDist, dist);
	    		}

	    		// if the center is too close to an edge node (of this enclosed area), try again, but change the center
	    		// (basically, we remove the last node of the area, and keep trying that until it works or we've nothing left to remove)
	    		if(closestDist <= radius + expeditionRadius) {
	    			nodeRemoveCounter++;

	    			if(numNodes - nodeRemoveCounter < 3) {
	    				areaIsSuitable = false;
	    				break;
	    			}
	    		} else {
	    			areaIsSuitable = true;
	    		}

	    	} while(!areaIsSuitable);

	    	if(areaIsSuitable) {
		    	// modify the area to remove any nodes we left out
		    	// NOT USEFUL if we're gonna point-relax anyway
	    		// a.splice(numNodes - nodeRemoveCounter, nodeRemoveCounter);

	    		// create an area object, including some useful metrics
	    		var dx = (this.centerNode.x - center[0]), dy = (this.centerNode.y - center[1])
	    		var distanceToCenterNode = Math.sqrt( dx*dx + dy*dy )

	    		var newArea = {
	    			'tiles': a,
	    			'center': center,
	    			'dist': distanceToCenterNode
	    		}

	    		// then add it to the suitable areas list
	    		this.suitableAreas.push(newArea);

	    		// and remove it from the original areas list (so it isn't used by any other game mechanics)
	    		// (however, if the area doesn't end up being used for an expedition, it's given back to the array anyway)
	    		this.areas.splice(i, 1);
	    	}

    	}
    },

    pickExpeditionNodes: function() {
    	this.expeditionNodes = [];

    	const EXP_RNG = new Math.seedrandom(seed + "-expeditions")

    	const slotRange = { min: 1, max: 4 }

    	const desiredNumExpeditionNodes = 10;
    	const numExpeditionNodes = Math.min(desiredNumExpeditionNodes, this.suitableAreas.length)

    	this.suitableAreas.sort(function(a,b) { if(a.dist < b.dist) { return -1; } else { return 1; }} )

    	for(var i = numExpeditionNodes - 1; i >= 0; i--) {
    		var a = this.suitableAreas.splice(i, 1)[0]

    		var n = 
    		{
    			'area': a.tiles,
    			'center': this.relaxExpeditionNode(a.center, a.tiles),
    			'type': this.getRandom(EXPEDITION_NODES, this.totalExpeditionNodeProbability, EXP_RNG),
    			'slots': Math.floor(EXP_RNG() * (slotRange.max - slotRange.min)) + slotRange.min
    		}

    		this.expeditionNodes.push(n);
    	}

    	// give back any nodes we didn't choose to the areas array
    	// (so we can use them again for distributing natural resources, if needed)
    	for(var i = 0; i < this.suitableAreas.length; i++) {
    		this.areas.push(this.suitableAreas[i].tiles);
    	}
    },

    relaxExpeditionNode: function(c, area) {
    	const numSteps = 100;
    	const center = c.slice()
    	const equilibrium = 1.0
    	const edgePushoff = 0.4

    	// we can't really relax triangles or squares, as the node will just be pushed through the side (as there is no node there)
    	if(area.length <= 4) {
    		return center;
    	}

    	for(var i = 0; i < numSteps; i++) {
    		var moveVec = [0, 0];

    		for(var t = 0; t < area.length; t++) {
    			var surroundingNode = area[t];

    			var dx = surroundingNode.x - center[0], dy = surroundingNode.y - center[1]
    			var dist = Math.sqrt( dx*dx + dy*dy );
    			var force = Math.abs(dist - equilibrium)

    			// TO DO: THe algorithm forgets that edge nodes are pushed X pixels inward

    			if(dist < equilibrium) {
    				moveVec[0] += -dx * force;
    				moveVec[1] += -dy * force * (this.cfg.cellSizeY / this.cfg.cellSizeX);
    			}
    		}

    		// also push us off boundaries
    		if(center[0] < edgePushoff) { moveVec[0] += Math.abs(edgePushoff - center[0]) }
    		if(center[0] > this.cfg.resolutionX - edgePushoff) { moveVec[0] -= this.cfg.resolutionX - center[0] + edgePushoff }

    		if(center[1] < edgePushoff) { moveVec[1] += Math.abs(edgePushoff - center[1]) }
    		if(center[1] > this.cfg.resolutionY - edgePushoff) { moveVec[1] -= this.cfg.resolutionY - center[1] + edgePushoff }

    		center[0] += moveVec[0] * 1.0 / (0.1*numSteps + 1);
    		center[1] += moveVec[1] * 1.0 / (0.1*numSteps + 1);
    	}

    	return center;
    },

    initList: function(list) {
		for(name in list) {
			var exp = list[name].expansion

			if(exp == undefined || exp == null) {
				continue;
			}

			// if this element needs an expansion which is NOT enabled in our configuration
			// well, remove it from the list, we can't use it now
			if(!gameConfig.expansions[ exp ]) {
				delete list[name];
				continue;
			}
		}
    },

    prepareLists: function() {
    	NODES = {}
    	NODES = Object.assign(NODES, NODES_DICT);
    	this.initList(NODES);

    	MISSION_NODES = {}
    	MISSION_NODES = Object.assign(MISSION_NODES, MISSION_NODES_DICT);
    	this.initList(MISSION_NODES);

    	EXPEDITION_NODES = {};
    	EXPEDITION_NODES = Object.assign(EXPEDITION_NODES, EXPEDITION_NODES_DICT);
    	this.initList(EXPEDITION_NODES);

    	this.totalNodeProbability = this.getTotal(NODES);
    	this.totalMissionNodeProbability = this.getTotal(MISSION_NODES);
    	this.totalExpeditionNodeProbability = this.getTotal(EXPEDITION_NODES)

    	this.totalTinyNodeProbability = this.getTotal(TINY_NODES);
    	this.totalNaturalResourceProbability = this.getTotal(NATURAL_RESOURCES);
    	this.totalLandmarkProbability = this.getTotal(LANDMARKS);
    },

    createBetterNodeCollection: function() {
    	var NODE_RNG = new Math.seedrandom(seed + "-nodesCollection")

    	// if no expansions are enabled, there's no need to meddle with the nodes
    	if(!gameConfig.expansions["Nasty Nodes"] && !gameConfig.expansions["Nodes of Knowledge"] && !gameConfig.expansions["The Electric Expansion"]) { return; }

    	var tempNodes = {}, name = '', curNodeData = { sum: 0, categories: [], actionTypes: [] };

    	// Step 1) For each category and action type, add ONE random node to the selection
    	curNodeData.categories = Object.keys(NODE_CATEGORIES)
    	curNodeData.actionTypes = NODE_ACTION_TYPES.slice();

    	// EXCEPTION: With the electric expansion, always start with the electricity node (as it has MANY dependencies that would bloat the list)
    	if(gameConfig.expansions["The Electric Expansion"]) {
    		this.addNodeToCollection(tempNodes, 'Electricity', curNodeData);
    	}

    	while(curNodeData.categories.length > 0) {
    		name = this.getRandomNodeOfType('category', curNodeData.categories[0], tempNodes, NODE_RNG);
    		if(name == null) {
    			curNodeData.categories.splice(0, 1);
    			continue;
    		}
    		
    		this.addNodeToCollection(tempNodes, name, curNodeData)
    	}

    	while(curNodeData.actionTypes.length > 0) {
    		name = this.getRandomNodeOfType('actionType', curNodeData.actionTypes[0], tempNodes, NODE_RNG);
    		if(name == null) {
    			curNodeData.actionTypes.splice(0, 1);
    			continue;
    		}
    		
    		this.addNodeToCollection(tempNodes, name, curNodeData)
    	}

    	// Step 2) Count how many "cutting nodes" we have => we want at least 3
    	var cuttingNodesInSet = 0, minCuttingNodes = 3;
    	for(var name in tempNodes) {
    		if(tempNodes[name].actionTypes.includes("Cutting")) {
    			cuttingNodesInSet++;
    		}
    	}

    	while(cuttingNodesInSet < minCuttingNodes) {
    		name = this.getRandomNodeOfType('actionType', 'Cutting', tempNodes, NODE_RNG);
    		if(name == null) {
    			break;
    		}

    		cuttingNodesInSet++;
    		this.addNodeToCollection(tempNodes, name, curNodeData);
    	}

    	// Step 3) As long as we still have space left, keep adding more nodes (that we don't have yet)
    	const errorMargin = 5, maxTries = 200;
    	const maxPointsToFill = this.points.length - 12 - errorMargin;
    	var numTries = 0;
    	while(curNodeData.sum < maxPointsToFill && Object.keys(tempNodes).length < Object.keys(NODES).length) {
    		do {
    			numTries++
    			name = this.getRandom(NODES, this.totalNodeProbability, NODE_RNG);
    		} while(tempNodes[name] != undefined && numTries <= maxTries);

    		if(name == null) {
    			break;
    		}

    		this.addNodeToCollection(tempNodes, name, curNodeData);
    	}

    	// finally, swap the old (full) NODES list with the new one
    	NODES = tempNodes;

    	// and update the total probability (which will be different, because now we have a subset of the original nodes list)
    	this.totalNodeProbability = this.getTotal(NODES);
    },

    addNodeToCollection: function(list, name, curNodeData) {
    	if(list[name] != undefined) { return; }

    	var node = NODES[name];
    	list[name] = node;

    	// update total sum (we stop filling the list when we have enough for the whole board)
    	var nodeMin = node.min || 0;
        nodeMin = Math.round(nodeMin * this.cfg.nodeSettingScaleFactor);
        var nodeMax = node.max*this.cfg.nodeSettingScaleFactor || nodeMin;
        nodeMax = Math.round(nodeMax);

    	var diff = Math.ceil((nodeMin + nodeMax) * 0.5) + 1;
    	curNodeData.sum += diff;

    	// check if category needs to be removed from list
    	var catInd = curNodeData.categories.indexOf(node.category)
    	if(catInd > -1) {
    		curNodeData.categories.splice(catInd, 1);
    	}

    	// check if action type(s) need to be removed from list
    	for(var i = 0; i < node.actionTypes.length; i++) {
    		var atp = node.actionTypes[i];
    		var atpInd = curNodeData.actionTypes.indexOf(atp);

    		if(atpInd > -1) {
    			curNodeData.actionTypes.splice(atpInd, 1);
    		}
    	}

    	// check if this node requires any other nodes; if so, add those as well
    	var requirements = node.requirements || [];
    	for(var i = 0; i < requirements.length; i++) {
    		var req = requirements[i]
    		this.addNodeToCollection(list, req, curNodeData)
    	}
    },

    getRandomNodeOfType: function(what = 'category', tp, nodesList, RNG) {
    	// center node is an exception (has probability 0, so normal algorithm doesn't work)
    	if(tp == 'Center'){ return 'Center'; }

    	var list = {}, totalProb = 0;
    	for(var name in NODES) {
    		if(nodesList[name] != undefined) { continue; }

    		var n = NODES[name]

			if(what == 'category' && n.category == tp) {
				list[name] = n;
				totalProb += n.prob;
			} else if(what == 'actionType' && n.actionTypes.includes(tp)) {
				list[name] = n;
				totalProb += n.prob;
			}
    	}

    	return this.getRandom(list, totalProb, RNG);
    },

    addIntermediaryPoints: function() {
    	this.intermediaryPoints = [];

    	const minPointDistance = 0.5;
    	const maxPointsPerNode = 2;

    	var NODE_RNG = new Math.seedrandom(seed + "-tinyNodes")

    	for(var i = 0; i < this.points.length; i++) {
    		var p = this.points[i];

    		if(p.edgePoint) { continue; }

    		for(var c = 0; c < p.connections.length; c++) {
    			var conn = p.connections[c];

    			// enforce a strict maximum of 2 intermediary points surrounding each node
    			if(p.iPointsCreated >= maxPointsPerNode || conn.iPointsCreated >= maxPointsPerNode) {
    				break;
    			}

    			// don't consider connections twice!
    			if(conn.intermediaryPointsExhausted) { continue; }

    			// don't allow connecting with an edge node!
    			if(conn.edgePoint) { continue; }

    			// don't create an intermediary point if the edge is really short (and there's just no space for it)
    			//var dist = Math.sqrt((p.x - conn.x)*(p.x - conn.x) + (p.y - conn.y)*(p.y - conn.y))
    			//if(dist <= minPointDistance) { continue; }

    			var iPoint = {
    				x: (p.x + conn.x)*0.5,
    				y: (p.y + conn.y)*0.5,
    				type: this.getRandom(TINY_NODES, this.totalTinyNodeProbability, NODE_RNG),
    				angle: Math.atan2(conn.y - p.y, conn.x - p.x)
    			}

    			this.intermediaryPoints.push(iPoint)

	    		p.iPointsCreated++;
	    		conn.iPointsCreated++;
    		}

    		p.intermediaryPointsExhausted = true;
    	}
    },

    addLandmarks: function() {
    	var RNG = new Math.seedrandom(seed + "-landmarks")

    	this.landmarks = [];

    	const desiredNumLandmarks = 5;
    	const numLandmarks = Math.min(desiredNumLandmarks, this.suitableAreas.length)

    	this.suitableAreas.sort(function(a,b) { if(a.dist < b.dist) { return -1; } else { return 1; }} )

    	for(var i = numLandmarks - 1; i >= 0; i--) {
    		var a = this.suitableAreas.splice(i, 1)[0]

    		var n = 
    		{
    			'center': this.relaxExpeditionNode(a.center, a.tiles),
    			'type': this.getRandom(LANDMARKS, this.totalLandmarkProbability, RNG)
    		}

    		this.landmarks.push(n);
    	}

    	// give back any nodes we didn't choose to the areas array
    	// (so we can use them again for distributing natural resources, if needed)
    	for(var i = 0; i < this.suitableAreas.length; i++) {
    		this.areas.push(this.suitableAreas[i].tiles);
    	}
    },

    addNaturalResources: function() {
    	var RNG = new Math.seedrandom(seed + "-naturalResources")

    	this.naturalResources = [];

    	for(var i = 0; i < this.areas.length; i++) {
    		var a = this.areas[i];

    		// found "bounding box" around polygon (and center)
    		var minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    		var center = [0,0];
    		var numEdgeNodes = 0;
    		for(var t = 0; t < a.length; t++) {
    			center[0] += a[t].x / a.length;
    			center[1] += a[t].y / a.length;

    			if(a[t].edgePoint) {
    				numEdgeNodes++;
    			}
    		}

    		var numResources = Math.floor(RNG()*4) + 1;

    		// natural resources look ugly (and unbalanced) in areas connected to edge, so
    		// 1) ignore any areas where more than HALF the points are edge points
    		if(numEdgeNodes >= Math.round(a.length*0.5)) {
    			continue;
    		}

    		// 2) and only allow 1-2 natural resources in areas with few nodes
    		if(a.length <= 4) {
    			numResources = Math.floor(RNG()*2) + 1;
    		}


    		// shrink polygon towards center
    		var scaleFactor = 0.7;
    		var poly = [];
    		for(var t = 0; t < a.length; t++) {
    			var dx = (a[t].x - center[0]) * scaleFactor + center[0];
    			var dy = (a[t].y - center[1]) * scaleFactor + center[1];

    			minX = Math.min(dx, minX);
    			maxX = Math.max(dx, maxX);

    			minY = Math.min(dy, minY);
    			maxY = Math.max(dy, maxY);

    			poly.push({ 'x': dx, 'y': dy })
    		}

    		// randomly place points within bounding box
    		// if they are also inside the polygon, yay! Save it!
    		var nodeRadius = this.cfg.nodeRadius, naturalResourceRadius = this.cfg.naturalResourceRadius, margin = 0.075;
    		var tempResourceList = [];
    		const maxTries = 200;

    		for(var r = 0; r < numResources; r++) {
    			var point = { 'x': 0, 'y': 0 };
    			var outsidePolygon = false, tooCloseToNode = false, tooCloseToResource = false;
    			var locationNotSuitable = false;

    			var tries = 0
    			do {
    				point.x = RNG() * (maxX-minX) + minX;
    				point.y = RNG() * (maxY-minY) + minY;

    				outsidePolygon = !this.pointInsidePolygon(point, poly);

    				if(!outsidePolygon) {
	    				tooCloseToNode = (this.closestDistToPolygonNode(point, a) <= (nodeRadius + naturalResourceRadius + margin));

	    				if(!tooCloseToNode) {
	    					tooCloseToResource = (this.closestDistToResource(point, tempResourceList) <= 2.0*(naturalResourceRadius + margin));
	    				}					
    				}

    				locationNotSuitable = (outsidePolygon || tooCloseToNode || tooCloseToResource);

    				tries++;
    				if(tries >= maxTries) { break; }

    			} while(locationNotSuitable)

    			// if we failed to find anything (probably not enough space), just ignore this one and continue
    			if(locationNotSuitable) { continue; }

    			var nr = {
    				'x': point.x,
    				'y': point.y,
    				'type': this.getRandom(NATURAL_RESOURCES, this.totalNaturalResourceProbability, RNG)
    			}

    			tempResourceList.push(nr);
    			this.naturalResources.push(nr);
    		}

    	}
    },

    closestDistToResource(point, list) {
    	var minDist = Infinity;

    	for(var i = 0; i < list.length; i++) {
    		var dx = (point.x - list[i].x)*this.cfg.cellSizeX, dy = (point.y - list[i].y)*this.cfg.cellSizeY
    		minDist = Math.min(dist, Math.sqrt( dx*dx + dy*dy ));
    	}

    	return minDist / Math.min(this.cfg.cellSizeX, this.cfg.cellSizeY);
    },

    closestDistToPolygonNode(point, poly) {
    	var minDist = Infinity;

    	for(var i = 0; i < poly.length; i++) {
    		var dx = (poly[i].x - point.x)*this.cfg.cellSizeX, dy = (poly[i].y - point.y)*this.cfg.cellSizeY
    		dist = Math.sqrt( dx*dx + dy*dy )

    		minDist = Math.min(dist, minDist);
    	}

    	return minDist / Math.min(this.cfg.cellSizeX, this.cfg.cellSizeY);
    },

    pointInsidePolygon(point, vs) {
	    // ray-casting algorithm based on
	    // https://wrf.ecse.rpi.edu/Research/Short_Notes/pnpoly.html/pnpoly.html
	    
	    var csX = this.cfg.cellSizeX, csY = this.cfg.cellSizeY;
	    var x = point.x * csX, y = point.y * csY;
	    
	    var inside = false;
	    for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
	        var xi = vs[i].x * csX, yi = vs[i].y * csY;
	        var xj = vs[j].x * csX, yj = vs[j].y * csY;
	        
	        var intersect = ((yi > y) != (yj > y))
	            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
	        if (intersect) inside = !inside;
	    }
	    
	    return inside;
	},

    visualizeGame: function() {
    	if(this.mainGraphics != null) {
    		this.visibilityGraphics.destroy();
    		this.mainGraphics.destroy();
    	}

    	const RNG = new Math.seedrandom(seed + '-visualization')

		// visualize all points (correct place + radius + color/type)
		const backgroundGroup = this.add.group();
		backgroundGroup.depth = 0;

		const visibilityGraphics = this.add.graphics();
		visibilityGraphics.depth = 1

		const graphics = this.add.graphics()
		graphics.depth = 2;

		const foregroundGroup = this.add.group();
		foregroundGroup.depth = 3;

		const w = this.canvas.width, h = this.canvas.height
		const rX = this.cfg.resolutionX, rY = this.cfg.resolutionY
		const csX = this.cfg.cellSizeX, csY = this.cfg.cellSizeY, cs = Math.min(csX, csY)

		const radius = this.cfg.nodeRadius

		//
		// draw the quadrant lines across the board
		//
		if(this.finalVisualization) {
            var quadLineHoriz = this.add.sprite(0, this.centerNode.y * csY, 'fault_line');
            quadLineHoriz.setOrigin(0, 0.5);
            quadLineHoriz.displayWidth = w;
            quadLineHoriz.alpha = 0.5;

            var quadLineVert = this.add.sprite(this.centerNode.x * csX, 0, 'fault_line');
            quadLineVert.rotation = 0.5*Math.PI;
            quadLineVert.setOrigin(0, 0.5);
            quadLineVert.displayWidth = h;
            quadLineVert.alpha = 0.5;

			/*
            var quadLineHoriz = new Phaser.Geom.Line(0, this.centerNode.y * csY, w, this.centerNode.y * csY);
			var quadLineVert = new Phaser.Geom.Line(this.centerNode.x * csX, 0, this.centerNode.x * csX, h);

			graphics.lineStyle(2.0, 0xAAAAAA, 0.5);
			graphics.strokeLineShape(quadLineHoriz);
			graphics.strokeLineShape(quadLineVert);
            */
		}

		//
		// draw all connections (that need to be drawn)
		//
		for(var i = 0; i < this.connectionsToDraw.length; i++) {
			var p = this.connectionsToDraw[i];
			var line = new Phaser.Geom.Line(p[0] * csX, p[1] * csY, p[2] * csX, p[3] * csY);

			graphics.lineStyle(3, 0x888888, 0.5);
			graphics.strokeLineShape(line);
		}

		// draw natural resources
		// (these go BEFORE power dots and nodes, because it's more important that those are visible, than that natural resources are)
		if(this.naturalResources != undefined) {

			for(var i = 0; i < this.naturalResources.length; i++) {
				var nr = this.naturalResources[i];

				/*var circ = new Phaser.Geom.Circle(nr.x * csX, nr.y * csY, 0.05 * cs);

				visibilityGraphics.fillStyle(0x000000, 1.0);
				visibilityGraphics.fillCircleShape(circ);*/

				// create natural resources sprite
				var sprite = this.add.sprite(nr.x * csX, nr.y * csY, 'natural_resources');
				sprite.displayWidth = sprite.displayHeight = 2 * this.cfg.naturalResourceRadius * cs;
				sprite.setOrigin(0.5, 0.5);
				sprite.setFrame(NATURAL_RESOURCES[nr.type].iconFrame)
				sprite.rotation = Math.random() * 2 * Math.PI;
				sprite.alpha = this.cfg.naturalResourceAlpha;

				backgroundGroup.add(sprite, true);
			}
		}

		var textCfg = {
			fontFamily: 'SciFly',
			fontSize: '24px',
		    color: '#fff',
		    stroke: '#010101',
		    strokeThickness: 3,
		}

		var metadataTextConfig = {
			fontFamily: 'SciFly',
			fontSize: '16px',
			color: '#555555'
		}

		// draw actual points you can move to
		for(var i = 0; i < this.points.length; i++) {
			var p = this.points[i];

			var color, lightColor;
			if(p.nodeType == 'Mission') {
				color = MISSION_NODES[p.type].color || 0xFF0000;
				lightColor = MISSION_NODES[p.type].lightColor || 0xFFAAAA;
			} else if(p.nodeType == 'Regular') {
				nodeCategory = 'Center'
				if(this.finalVisualization) {
					nodeCategory = NODES[p.type].category;
				}

				//color = NODES[p.type].color || 0x0000FF;
				color = NODE_CATEGORIES[nodeCategory].color  || 0xFF0000;
				lightColor = NODE_CATEGORIES[nodeCategory].lightColor || 0xFFAAAA;
			}

			// if the inkFriendly setting is enabled,
			// we just remove all color and turn all backgrounds/accents into white
			if(gameConfig.inkFriendly) {
				color = 0xFFFFFF;
				lightColor = 0xFFFFFF;
			}

			var colorObject = Phaser.Display.Color.IntegerToColor(color);

			// Start nodes are rectangular, all other nodes are circular
			var obj = null, sprite = null, spriteOutline = null, powerDotRadius = 12, lineWidth = 2;

			/*
			var lighterColor = colorObject.clone(), darkerColor = colorObject.clone()
			lighterColor.brighten(50)
			darkerColor.darken(80)

			graphics.fillStyle(lighterColor.color, 1.0);
			graphics.lineStyle(lineWidth, darkerColor.color, 1.0)
			*/

			graphics.fillStyle(lightColor, 1.0);

			var outlineMarginFactor = 1.2
			var objectCenter = { 'x': p.x * csX, 'y': p.y * csY }

			if(p.nodeType == 'Mission') {
				var halfSize = radius * cs

				obj = new Phaser.Geom.Rectangle( p.x * csX - halfSize, p.y * csY - halfSize, halfSize * 2, halfSize * 2);

				if(this.finalVisualization) {
					sprite = this.add.sprite(p.x * csX, p.y*csY, 'mission_nodes')
					sprite.displayWidth = sprite.displayHeight = halfSize;
					sprite.setOrigin(0.5, 0.5);
					sprite.setFrame(MISSION_NODES[p.type].iconFrame)

					foregroundGroup.add(sprite, true);
					sprite.depth = 3;

					spriteOutline = this.add.sprite(sprite.x, sprite.y, 'node_outlines')
					spriteOutline.displayWidth = spriteOutline.displayHeight = halfSize*2*outlineMarginFactor;
					spriteOutline.setOrigin(0.5, 0.5);
					spriteOutline.setFrame(4 + Math.floor(Math.random() * 4));

					foregroundGroup.add(spriteOutline, true);
					spriteOutline.depth = 3;

					// edge points need their sprites pushed to the side, otherwise they are not completely visible
					// when staticX and staticY are true, it's a corner node => use a hack: calculate the angle towards the center node and use that.
					if(p.edgePoint) {
						var averageAngle = 0;

						for(var ee = 0; ee < p.whichEdges.length; ee++) {
							angle = p.whichEdges[ee] * 0.5 * Math.PI;
							averageAngle += angle / p.whichEdges.length;

							sprite.x += 0.5*sprite.displayWidth * Math.cos(angle);
							sprite.y += 0.5*sprite.displayHeight * Math.sin(angle);

							// shove the rectangle slightly off the side, to make it stand out and give the icon some room
							obj.x += 10 * Math.cos(angle);
							obj.y += 10 * Math.sin(angle);

							objectCenter.x += 10 * Math.cos(angle);
							objectCenter.y += 10 * Math.sin(angle);

							spriteOutline.x += 10 * Math.cos(angle);
							spriteOutline.y += 10 * Math.sin(angle);

						}

						sprite.rotation = averageAngle + 0.5 * Math.PI; // the icon drawings have their center at 0.5PI angle, instead of pointing to the right
					}
				}

				graphics.fillRectShape(obj);
				//graphics.strokeRectShape(obj);

			} else if(p.nodeType == 'Regular') {
				obj = new Phaser.Geom.Circle(p.x * csX, p.y * csY, radius * cs);

				// TO DO/DEBUGGING: Just for testing how sprites look when the field is filled with them.
				if(this.finalVisualization) {
					sprite = this.add.sprite(p.x * csX, p.y*csY, 'regular_nodes')
					sprite.displayWidth = sprite.displayHeight = radius*cs;
					sprite.setOrigin(0.5, 0.5);
					sprite.setFrame( NODES[p.type].iconFrame );

					sprite.rotation = Math.random() * 2 * Math.PI

					foregroundGroup.add(sprite, true);
					sprite.depth = 3;

					spriteOutline = this.add.sprite(sprite.x, sprite.y, 'node_outlines')
					spriteOutline.displayWidth = spriteOutline.displayHeight = 2*radius*cs*outlineMarginFactor;
					spriteOutline.setOrigin(0.5, 0.5);
					spriteOutline.setFrame(Math.floor(Math.random() * 4));

					foregroundGroup.add(spriteOutline, true)
					spriteOutline.depth = 3;

					// frame 8 and 9 are two different outlines to mark a node as special
					// the center node gets a SEED + (TO DO) an energy number in the Electric Expansion
					if(p.type == 'Center') {
						spriteOutline.setFrame(8);

						var txt = this.add.text(sprite.x, sprite.y + sprite.displayHeight * 0.5 + 16*2, seed, metadataTextConfig)
						txt.setOrigin(0.5, 0.5)
						foregroundGroup.add(txt, true);
						txt.depth = 4;
					}

					spriteOutline.rotation = Math.random() * 2 * Math.PI

					if(p.edgePoint) {
						var averageAngle = 0;
						for(var ee = 0; ee < p.whichEdges.length; ee++) {
							angle = p.whichEdges[ee] * 0.5 * Math.PI;
							averageAngle += angle / p.whichEdges.length;

							sprite.x += 0.5*sprite.displayWidth * Math.cos(angle)
							sprite.y += 0.5*sprite.displayHeight * Math.sin(angle);

							// there's less room on edge (circular) nodes, so just scale down the icon (for now)
							sprite.displayWidth *= 0.75;
							sprite.displayHeight *= 0.75;

							// shove the circle slightly off the side, to make it stand out and give the icon some room
							obj.x += 10 * Math.cos(angle);
							obj.y += 10 * Math.sin(angle);

							objectCenter.x += 10 * Math.cos(angle);
							objectCenter.y += 10 * Math.sin(angle);

							spriteOutline.x += 10 * Math.cos(angle);
							spriteOutline.y += 10 * Math.sin(angle);
						}

						sprite.rotation = averageAngle + 0.5 * Math.PI;
					}
				}

				graphics.fillCircleShape(obj);
				//graphics.strokeCircleShape(obj);
			}

			var powerDots = p.powerDots;
			visibilityGraphics.fillStyle(0xCCCCCC, 1.0);
			visibilityGraphics.lineStyle(1, 0xAAAAAA, 1.0);

			for(var pd = 0; pd < powerDots.length; pd++) {
				var PD = powerDots[pd];
				var circ = new Phaser.Geom.Circle(objectCenter.x + PD.x * radius * cs, objectCenter.y + PD.y * radius * cs, powerDotRadius)

				visibilityGraphics.fillCircleShape(circ);
				visibilityGraphics.strokeCircleShape(circ);
			}

			// Only on final visualization, determine and draw any texts (otherwise too heavy to redraw each frame)
			if(this.finalVisualization) {
				if(p.nodeType == 'Regular' && NODES[p.type].needsNumber) {
					// Calculate distance from this center to edge, and the maximum distance
					var distToCenter = this.dist(p, this.centerNode);
					var maxDist = this.maxDistanceToEdge(this.centerNode);

					// Determine how many nodes there are that you NEED to pass this node
					var numNodesOfType = this.getNumNodesOfType(NODES[p.type].typeNeeded) * Math.min(2.0 / gameConfig.numPlayers, 0.5);

					// Combine that to get a percentage of the total needed, depending on distance to center node
					var centerMultiplier = (1.0 - (distToCenter / maxDist))*numNodesOfType;

					var randNum = Math.max( Math.round(centerMultiplier + 0.5 - RNG()), 1)
					var txt = this.add.text(obj.x, obj.y, randNum, textCfg);
					txt.setOrigin(0.5, 0.5);
					txt.rotation = sprite.rotation;

					foregroundGroup.add(txt);
					txt.depth = 4;
				}

				
				if(p.type == 'Center') {
					// only in the Nodes of knowledge expansion does the center node get day/night icons around it
					if(gameConfig.expansions['Nodes of Knowledge']) {
						var margin = 0.03

						var sprite = this.add.sprite(obj.x - (radius+margin)*cs, obj.y - (radius+margin)*cs, 'daynight_icons');
						sprite.displayWidth = sprite.displayHeight = 0.6*radius*cs;
						sprite.setFrame(0);
						sprite.setOrigin(0.5, 0.5);

						var sprite2 = this.add.sprite(obj.x + (radius+margin)*cs, obj.y + (radius+margin)*cs, 'daynight_icons');
						sprite2.displayWidth = sprite2.displayHeight = 0.6*radius*cs;
						sprite2.setFrame(1);
						sprite2.setOrigin(0.5, 0.5);
					}


					// only in the Electric Expansion, does the center node get a number
					if(gameConfig.expansions['The Electric Expansion']) {
						var numEnergeticNodes = this.getNumEnergeticNodes();
						var finalNum = Math.floor(0.66 * numEnergeticNodes / gameConfig.numPlayers);

						var txt = this.add.text(obj.x, obj.y, finalNum, textCfg);
						txt.setOrigin(0.5, 0.5);
						txt.rotation = sprite.rotation;

						foregroundGroup.add(txt);
						txt.depth = 4;
					}
				}
			}
		}

		// draw intermediary points ( = TINY NODES)
		if(this.intermediaryPoints != undefined) {
			graphics.fillStyle(0xCCCCCC, 1.0);

			const IP_RNG = new Math.seedrandom(seed + "-intermediaryPoints");

			const iPointSize = radius * cs * 0.25 * 2;
			for(var i = 0; i < this.intermediaryPoints.length; i++) {
				var iP = this.intermediaryPoints[i];
				var x = iP.x * csX, y = iP.y * csY
				var type = iP.type, angle = iP.angle;
				

				var obj = this.add.sprite(x, y, 'tiny_nodes');
				obj.displayWidth = obj.displayHeight = iPointSize;
				obj.setOrigin(0.5, 0.5);
				obj.setFrame(TINY_NODES[type].iconFrame)

				foregroundGroup.add(obj, true);
				obj.depth = 3;

				if(type == 'triangle') {
					if(IP_RNG() <= 0.5) { angle += Math.PI; }
				}

				obj.rotation = angle;
			}
		}

		// add the expedition nodes to the board
		if(this.expeditionNodes != undefined) {
			const expeditionNodeRadius = 0.25 * cs;
			const expeditionSlotRadius = 0.4*expeditionNodeRadius

			for(var i = 0; i < this.expeditionNodes.length; i++) {
				var n = this.expeditionNodes[i];
				var c = n.center, s = n.slots;

				// show default expedition node sprite (the compass/navigator icon)
				var sprite = this.add.sprite(c[0]*csX, c[1]*csY, 'expedition_nodes');
				sprite.setFrame(0);
				sprite.displayWidth = sprite.displayHeight = expeditionNodeRadius * 2.0;
				sprite.setOrigin(0.5, 0.5);
				sprite.rotation = Math.random() * 2 * Math.PI

				backgroundGroup.add(sprite, true);

				/*
				var circ = new Phaser.Geom.Circle(c[0]*csX, c[1]*csY, expeditionNodeRadius);
				graphics.fillStyle(0xFFAAAA, 1.0);
				graphics.fillCircleShape(circ);
				*/

				// add locations onto which players can move (to join the expedition)
				var cols = Math.min(s, 2), rows = Math.ceil(s / cols)

				for(var a = 0; a < s; a++) {
					// first, calculate the "perfect" position for each slot
					var xPos = c[0] * csX + (a % cols - 0.5*(cols - 1))*2*expeditionSlotRadius
					var yPos = c[1] * csY + (Math.floor(a / cols) - 0.5*(rows-1))*2*expeditionSlotRadius

					// then scatter them randomly, as it looks more organic on this board (more "unstable")
					var scatterAngle = Math.random() * 2 * Math.PI
					var scatterRadius = 0.2 * expeditionSlotRadius;
					var scatter = [Math.cos(scatterAngle)*scatterRadius, Math.sin(scatterAngle)*scatterRadius]

					var circ = new Phaser.Geom.Circle(xPos + scatter[0], yPos + scatter[1], expeditionSlotRadius)

					graphics.fillStyle(0xAAAAAA, 0.8);
					graphics.fillCircleShape(circ);

					// and draw a random outline around it
					var slotSprite = this.add.sprite(circ.x, circ.y, 'node_outlines')
					slotSprite.displayWidth = slotSprite.displayHeight = 2*expeditionSlotRadius;
					slotSprite.setFrame(Math.floor(Math.random() * 4));
					slotSprite.setOrigin(0.5, 0.5);
					slotSprite.rotation = Math.random() * 2 * Math.PI

					foregroundGroup.add(slotSprite, true);
					slotSprite.depth = 3;
				}
				
			}
		}

		// add landmarks to the board
		if(this.landmarks != undefined) {
			const landmarkRadius = 0.5 * cs;

			for(var i = 0; i < this.landmarks.length; i++) {
				var lm = this.landmarks[i];
				var c = lm.center;

				var sprite = this.add.sprite(c[0] * csX, c[1] * csY, 'landmarks')
				sprite.setFrame(LANDMARKS[lm.type].iconFrame);
				sprite.displayWidth = sprite.displayHeight = landmarkRadius;
				sprite.setOrigin(0.5, 0.5);

				backgroundGroup.add(sprite, true);
			}
		}

		// draw enclosed areas (TURNED OFF for now)
		if(this.areas != undefined && false) {
			var color = new Phaser.Display.Color(0, 0, 0);

			for(var i = 0; i < this.areas.length; i++) {
				var a = this.areas[i];
				var center = [0, 0]

				color.random();

				var pointsList = [];
				for(var pp = 0; pp < a.length; pp++) {
					pointsList.push(a[pp].x * csX);
					pointsList.push(a[pp].y * csY);

					center[0] += a[pp].x / a.length;
					center[1] += a[pp].y / a.length;
				}

				var poly = new Phaser.Geom.Polygon(pointsList);

				graphics.fillStyle(color.color, 1.0);
				graphics.fillPoints(poly.points, true);

				//graphics.lineStyle(5, color.color, 1.0);   // color: 0xRRGGBB
				//graphics.strokePoints(poly.points, true);

				var txt = this.add.text(center[0] * csX, center[1] * csY, i, textCfg);
				txt.setOrigin(0.5, 0.5);

				foregroundGroup.add(txt, true);
				txt.depth = 4;
			}
		}

		// draw obstacles that nodes must move around
		// TO DO/DEBUGGING: Removed drawing this for now, as it just looks ugly
		/*
		for(var i = 0; i < this.obstacles.length; i++) {
			var p = this.obstacles[i];
			var radius = p.radius;

			var circ = new Phaser.Geom.Circle(p.x * csX, p.y * csY, radius * cs)
			graphics.fillStyle(0x000000, 0.5);
			graphics.fillCircleShape(circ);

		}
		*/

		this.visibilityGraphics = visibilityGraphics;
		this.mainGraphics = graphics;
		this.backgroundGroup = backgroundGroup;
		this.foregroundGroup = foregroundGroup;
    },

    dist: function(a,b) {
    	var dx = (a.x - b.x), dy = (a.y - b.y)
    	return Math.sqrt(dx*dx + dy*dy)
    },

    maxDistanceToEdge: function(p) {
    	var dx1 = p.x, dx2 = (this.cfg.resolutionX - p.x)
    	var dy1 = p.y, dy2 = (this.cfg.resolutionY - p.y)
    	
    	var dist1 = Math.sqrt(dx1*dx1 + dy1*dy1)
    	var dist2 = Math.sqrt(dx1*dx1 + dy2*dy2)
    	var dist3 = Math.sqrt(dx2*dx2 + dy1*dy1)
    	var dist4 = Math.sqrt(dx2*dx2 + dy2*dy2)

    	return Math.max(Math.max(dist1, dist2), Math.max(dist3, dist4));
    },

    getNumNodesOfType: function(tp) {
    	var sum = 0;
    	for(var i = 0; i < this.points.length; i++) {
    		var p = this.points[i];
    		if(p.type == tp) { sum++; }
    	}
    	return sum;
    },

    getNumEnergeticNodes: function() {
    	var energeticNodes = ['Oil', 'Fire', 'Wood', 'Sun', 'Moon', 'Wind', 'Biomass', 'Electricity', 'Battery']

    	var sum = 0;
    	for(var i = 0; i < this.points.length; i++) {
    		var t = this.points[i].type;
    		if(energeticNodes.includes(t)) {
    			if(t == 'Fire' || t == 'Wood') { sum += 0.5; }
    			else { sum++; }
    		}
    	}

    	return Math.floor(sum);
    },

    keepPointOnScreen: function(p) {
    	p.x = Math.max(Math.min(p.x, this.cfg.resolutionX), 0);
    	p.y = Math.max(Math.min(p.y, this.cfg.resolutionY), 0);
    },

    outOfBounds: function(x,y) {
    	return (x < 0 || x > this.cfg.resolutionX || y < 0 || y > this.cfg.resolutionY);
    },

    getRandom: function(list, total, RNG) {
		const rand = RNG();

		var sum = 0;
		for(key in list) {
			sum += (list[key].prob / total);

			if(sum >= rand) {
				return key;
			}
		}

		return null;
	},

	getTotal: function(list) {
		var sum = 0;
		for(key in list) {
			sum += list[key].prob;
		}

		return sum;
	},

	shuffle: function(a, RNG) {
	    var j, x, i;
	    for (i = a.length - 1; i > 0; i--) {
	        j = Math.floor(RNG() * (i + 1));
	        x = a[i];
	        a[i] = a[j];
	        a[j] = x;
	    }

	    return a;
	},

	createSecretBoard: function() {
		// clear the whole board
		this.mainGraphics.destroy();
		this.visibilityGraphics.destroy();

		// custom code to quickly remove ALL children in the whole GAME
		var ch = GAME.scene.keys.boardGeneration.children.list
		for(var i = ch.length - 1; i >= 0; i--) {
			ch[i].destroy();
		}
		
		this.foregroundGroup.clear();
		this.backgroundGroup.clear();

		/*this.foregroundGroup.getChildren().forEach((child) => { child.destroy(); });
		this.backgroundGroup.getChildren().forEach((child) => { child.destroy(); });

		this.foregroundGroup.destroy();
		this.backgroundGroup.destroy();*/

		// draw expedition node icons at the same locations as original expedition nodes
		var expeditionNodeRadius = 0.25 * Math.min(this.cfg.cellSizeX, this.cfg.cellSizeY);
		if(this.expeditionNodes != undefined) {
			for(var i = 0; i < this.expeditionNodes.length; i++) {
				var n = this.expeditionNodes[i], c = n.center

				// show the expedition sprite (center of area, otherwise randomly rotated and stuff)
				// NOTE: These are MIRRORED on the Y-axis ( = flipped on the long edge)
				var sprite = this.add.sprite(c[0]*this.cfg.cellSizeX, (this.cfg.resolutionY-c[1])*this.cfg.cellSizeY, 'expedition_nodes');
				sprite.setFrame(EXPEDITION_NODES[n.type].iconFrame);
				sprite.displayWidth = sprite.displayHeight = expeditionNodeRadius * 2.0;
				sprite.setOrigin(0.5, 0.5);
				sprite.rotation = Math.random() * 2 * Math.PI
			}
		}
		

		// call convertCanvasToImage() again => it should add this image as well, then destroy the whole game
		this.createdSecretBoard = true;
		convertCanvasToImage(this);
	},

    convertCanvasToImage: function() {
    	var ths = this;
    	this.time.addEvent({
		    delay: 100,
		    callback: function() {
		        var canv = document.getElementById('phaserContainer').firstChild;

				var img = new Image();
				img.src = canv.toDataURL();
				img.style.maxWidth = '100%';
				document.getElementById('phaserContainer').style.overflow = "visible";

				pdfImages.push(img);

				if(gameConfig.secretBoard) {
					if(!ths.createdSecretBoard) {
						document.getElementById('phaserContainer').appendChild(img);
						ths.createSecretBoard();
					} else {
						ths.endGeneration();
					}
				} else {
					document.getElementById('phaserContainer').appendChild(img);
					ths.endGeneration();
				}
		    },
		    loop: false
		})
    },

    endGeneration: function() {
    	document.getElementById('btn-createPDF').style.display = 'inline-block';
    	GAME.destroy(true);
    }
});

//
// Seed saving + generation start
//

// http://www.endmemo.com/sconvert/millimeterpixel.php
// 1 mm = 3.779528 px; 1 px = 0.264583 mm
const scaleFactor = 3.8;
var seed = "";
var pdfImages = [];
const { jsPDF } = window.jspdf;

function startPhaser(gameConfig) {
	document.getElementById('phaserContainer').innerHTML = '';
	document.getElementById('btn-createPDF').style.display = 'none';

	pdfImages = [];

	var config = {
	    type: Phaser.CANVAS,
	    scale: {
	        mode: Phaser.Scale.FIT,
	        parent: 'phaserContainer',
	        autoCenter: Phaser.Scale.CENTER_BOTH,
	        width: 297*scaleFactor,
	        height: 210*scaleFactor
	    },

	    backgroundColor: '#FFFFFF',
	    parent: 'phaserContainer',
	    scene: [BoardGeneration],
	}

	window.GAME = new Phaser.Game(config); 
	GAME.scene.start('boardGeneration', gameConfig);
}

document.getElementById('gameButton').addEventListener('click', function() {
	seed = document.getElementById('setting-inputSeed').value;

	gameConfig = 
	{
		'seed': seed, // for completeness' sake
		'numPlayers': document.getElementById('setting-playerCount').value || 4,
		'inkFriendly': document.getElementById('setting-inkFriendly').checked || false,
		'firstGame': document.getElementById('setting-firstGame').checked || false,
		'secretBoard': document.getElementById('setting-secretBoard').checked || false,
		'expansions': 
		{
			'Sharp Scissors': document.getElementById('setting-sharpScissors').checked || false,
			'Nasty Nodes': document.getElementById('setting-nastyNodes').checked || false,
			'Nodes of Knowledge': document.getElementById('setting-nodesOfKnowledge').checked || false,
			'The Electric Expansion': document.getElementById('setting-theElectricExpansion').checked || false,
			'Extreme Expeditions': document.getElementById('setting-extremeExpeditions').checked || false,
		}
	}

	startPhaser();
});

//
// PDF creation
// (simply place all images full-size on a landscape A4 PDF, then save it to downloads)
//
function createPDF() {
	var pdfConfig = {
	  orientation: 'landscape',
	  unit: 'mm',
	  format: [297*scaleFactor, 210*scaleFactor]
	}

	var doc = new jsPDF(pdfConfig);

	var width = doc.internal.pageSize.getWidth(), height = doc.internal.pageSize.getHeight();

    // DOC: addImage(imageData, format, x, y, width, height, alias, compression, rotation)
    for(var i = 0; i < pdfImages.length; i++) {
    	if(i > 0) {
	    	doc.addPage();
    	}
    	
    	doc.addImage(pdfImages[i], 'png', 0, 0, width, height);
    }

    doc.save('Unstable Universe (Seed: ' + seed + ').pdf');
    //doc.output('datauri');
}

document.getElementById('btn-createPDF').addEventListener('click', function() {
	createPDF();
})
