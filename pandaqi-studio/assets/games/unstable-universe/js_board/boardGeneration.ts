// @ts-ignore
import { Scene } from "js/pq_games/phaser/phaser.esm"
import ResourceLoader from "js/pq_games/layout/resources/resourceLoader"
import CONFIG from "./config"
import setDefaultPhaserSettings from "js/pq_games/phaser/setDefaultPhaserSettings"
import resourceLoaderToPhaser from "js/pq_games/phaser/resourceLoaderToPhaser"
import getWeighted from "js/pq_games/tools/random/getWeighted"
import shuffle from "js/pq_games/tools/random/shuffle"
import Point from "js/pq_games/tools/geometry/point"
import GraphNode from "./graphNode"
import Obstacle from "./obstacle"
import GraphElement from "./graphElement"
import Line from "js/pq_games/tools/geometry/line"
import Circle from "js/pq_games/tools/geometry/circle"
import LayoutOperation from "js/pq_games/layout/layoutOperation"
import Color from "js/pq_games/layout/color/color"
import Path from "js/pq_games/tools/geometry/paths/path"
import { circleToPhaser, lineToPhaser, pathToPhaser, rectToPhaser } from "js/pq_games/phaser/shapeToPhaser"
import Rectangle from "js/pq_games/tools/geometry/rectangle"
import imageToPhaser from "js/pq_games/phaser/imageToPhaser"
import ResourceText from "js/pq_games/layout/resources/resourceText"
import textToPhaser from "js/pq_games/phaser/textToPhaser"
import TextConfig from "js/pq_games/layout/text/textConfig"
import seedRandom from "js/pq_games/tools/random/seedrandom";
import {
	NODE_ACTION_TYPES,
	NODE_CATEGORIES,
	NODES_DICT,
	MISSION_NODES_DICT,
	EXPEDITION_NODES_DICT,
	TINY_NODES,
	LANDMARKS,
	NATURAL_RESOURCES
} from "./dictionary"



const DEBUG_FILL_AREAS = false;
const ENERGETIC_NODES = ['Oil', 'Fire', 'Wood', 'Sun', 'Moon', 'Wind', 'Biomass', 'Electricity', 'Battery'];

type PowerDot = { x:number, y:number, angle:number }
type NaturalResource = { x:number, y:number, type:string }
type Landmark = { center:Point, type:string }
type IntermediaryPoint = { x: number, y: number, type:string, angle: number }
type Area = GraphNode[]
type AreaObject = { tiles: Area, center: Point, dist: number }
type ExpeditionNode = { area: Area, center: Point, type: string, slots: number }
type NodeData = { actionTypes: string[], categories: string[], sum: number }

interface GenLists
{
	nodes: Record<string,any>
	missionNodes: Record<string,any>
	expeditionNodes: Record<string,any>
}

interface EdgePointData
{
	left: GraphNode[],
	right: GraphNode[],
	top: GraphNode[],
	bottom: GraphNode[]
}

export type { PowerDot }
export default class BoardGeneration extends Scene
{
	canvas: HTMLCanvasElement
	cfg: Record<string,any>
	map: GraphElement[][][]
	centerNode: GraphNode
	points: GraphNode[]
	curSequence: number
	lists:GenLists
	edgePoints: EdgePointData
	naturalResources: NaturalResource[]
	missionNodeList: string[]
	obstacles: Obstacle[]
	intermediaryPoints: IntermediaryPoint[]
	landmarks: Landmark[]
	areas: Area[]
	suitableAreas: AreaObject[]
	expeditionNodes: ExpeditionNode[]
	createdSecretBoard: boolean
	currentIteration: number
	finalVisualization: boolean
	connectionsToDraw: Line[]

	mainGraphics: any
	visibilityGraphics: any
	backgroundGroup: any
	foregroundGroup: any
	iteratingTimer: any

	constructor()
	{
		super({ key: "boardGeneration" });
	}

	preload() 
	{
		setDefaultPhaserSettings(this); 
	}

	// user-input settings should be passed through config
	async create(config:Record<string,any>) 
	{
        await resourceLoaderToPhaser(config.visualizer.resLoader, this);

		this.cfg = {}		
		Object.assign(this.cfg, config);

		const canvasWidth = this.canvas.width;
		const scaleFactorDPI = (canvasWidth/1160.0); // this was a one-time crutch needed to rescale all values when I switched to modern system; should be removed one day and replaced with the actual correct values for all config stuff
		const baseRes = new Point(10,7);
		
		this.cfg.numPlayers = parseInt(this.cfg.playerCount);
		this.cfg.scaleFactorDPI = scaleFactorDPI;
		this.cfg.resolutionX = 10; // number of points across the width of the paper

		// TEST: more nodes + edges on higher player counts (~0.5 resolution extra per player)
		// Works fine, although now we might have TOO MUCH space (and some icons get quite tiny)
		const extraResolution = { 2: 0, 3: 0, 4: 0, 5: 1, 6: 1, 7: 2, 8: 2, 9: 3 }
		this.cfg.resolutionX += extraResolution[this.cfg.numPlayers];
		
		this.cfg.resolutionY = Math.floor((210/297.0) * this.cfg.resolutionX); // number of points across the height of the paper
		this.cfg.cellSizeX = this.canvas.width / this.cfg.resolutionX;
		this.cfg.cellSizeY = this.canvas.height / this.cfg.resolutionY;

		// on higher player counts, there are more nodes, so the min/max settings on nodes need to be scaled UPWARDS to stay correct
		// calculate number of extra nodes we received, divide by how many nodes are in the set on average
		const needExtraNodes = this.cfg.resolutionX > baseRes.x;
		if(needExtraNodes) {
			const extraNodes = (this.cfg.resolutionX - baseRes.x) * this.cfg.resolutionY + (this.cfg.resolutionY - baseRes.y) * this.cfg.resolutionX - (this.cfg.resolutionX - baseRes.x)*(this.cfg.resolutionY - baseRes.y);

			this.cfg.nodeSettingScaleFactor = Math.max( extraNodes / 15, 1.0);
			this.cfg.distanceScaleFactor = Math.max( Math.min( (this.cfg.resolutionX - baseRes.x), (this.cfg.resolutionY - baseRes.y) ), 1.0);
		} else {
			this.cfg.nodeSettingScaleFactor = 1.0;
			this.cfg.distanceScaleFactor = 1.0;
		}

		this.cfg.nodeRadius = 0.3;
		this.cfg.naturalResourceRadius = 0.3 * this.cfg.nodeRadius;
		this.cfg.powerDotRadius = 12 * scaleFactorDPI;
		this.cfg.lineWidth = 2 * scaleFactorDPI;
		this.cfg.seedTextOffset = 16*2 * scaleFactorDPI;
		this.cfg.maxIterations = 60;

		this.cfg.naturalResourceAlpha = 0.66;

		this.cfg.minPowerDots = 1 + Math.floor(this.cfg.numPlayers / 4.0);
		this.cfg.maxPowerDots = 2 + Math.floor(this.cfg.numPlayers / 4.0);

		this.mainGraphics = null;
		this.connectionsToDraw = [];

		this.centerNode = null;
		this.curSequence = 0;

		this.createdSecretBoard = false;
		this.lists = 
		{ 
			nodes: {},
			missionNodes: {},
			expeditionNodes: {}
		}

		console.log(this.cfg);

		this.generateBoard();
	}

	generateBoard() 
	{
		this.placePoints();
		this.placeObstacles();

		// for debugging, it helps if I see what's going on each relaxing iteration
		this.currentIteration = 0;
		this.finalVisualization = false;

		const ths = this;
		const callbackFunction = this.finishGeneration.bind(this);
		const maxIterations = this.cfg.maxIterations;
		let stopRelaxing = false;

		// @TODO/@BUG: it seems like this timer isn't stopped, even though 
		// finishGeneration calls this.iteratingTimer.remove()
		// maybe the API changed?
		// (Fixed it for now with the stopRelaxing boolean)

		// @ts-ignore
		this.iteratingTimer = this.time.addEvent({
			delay: 3,
			callback() {
				if(stopRelaxing) { return; }
				ths.relaxPoints();
				ths.visualizeGame();

				const generationDone = (ths.currentIteration >= maxIterations);
				if(!generationDone) { return; }
				callbackFunction();
				stopRelaxing = true;
			},
			loop: true
		})
	}

	finalizePointTypes() 
	{
		const RNG = seedRandom(this.cfg.seed + "-finalizeTypes");
		const RNG2 = seedRandom(this.cfg.seed + "-startingNodes")

		// turn X random points on the edge into starting positions;
		// distribute equally across all 4 edges
		// ALSO fill all the other edge points with something (otherwise I need to clean up the edges later, because some nodes are not allowed there)
		const edges = ['left', 'right', 'top', 'bottom'];
		const numPlayersPerEdge = 3;	

		// pre-generate list of mission nodes
		// if "First Game" enabled, everyone receives the explorer mission
		// Otherwise, it picks randomly, but ensures all types appear at least once
		this.missionNodeList = [];

		const totalMissionNodeList = this.lists.missionNodes;
		if(this.cfg.firstGame) {
			const FIRSTGAME_RNG = seedRandom(this.cfg.seed + "-firstGame")

			// NOTE: there are only a few Mission Nodes that function when ALL players have it
			// (others don't; for example, there's not enough plants for everyone to be a biologist)
			const firstGameTypes = ['Traveler', 'Collector'];
			const randType = firstGameTypes[Math.floor(FIRSTGAME_RNG() * firstGameTypes.length)]

			for(let i = 0; i < numPlayersPerEdge*4; i++) 
			{
				this.missionNodeList.push(randType);
			}
		} else {
			const MISSION_NODE_RNG = seedRandom(this.cfg.seed + "-missionNodes")

			// remove any missions that are impossible (because there's no relevant node on the board)
			for(let name in totalMissionNodeList) 
			{
				const relevantNodes = totalMissionNodeList[name].relevantNodes ?? [];
				if(relevantNodes.length <= 0) { continue; }

				let hasRelevantNode = false;
				for(let i = 0; i < relevantNodes.length; i++) 
				{
					if(!this.lists.nodes[relevantNodes[i]]) { continue; }
					hasRelevantNode = true;
					break;
				}

				if(!hasRelevantNode) { delete totalMissionNodeList[name]; }
			}

			// add all types at least once
			for(const name in totalMissionNodeList) 
			{
				this.missionNodeList.push(name);
			}

			// then keep adding random missions until list is filled
			while(this.missionNodeList.length < numPlayersPerEdge*4) 
			{
				this.missionNodeList.push( getWeighted(totalMissionNodeList, "prob", MISSION_NODE_RNG) );
			}

			// shuffle, we'll apply them in order later
			shuffle(this.missionNodeList, MISSION_NODE_RNG);
		}


		for(let e = 0; e < 4; e++) 
		{
			let edgeName = edges[e];
			let edge = this.edgePoints[edgeName]

			// first, sort all edge nodes based on distance to center
			for(let i = 0; i < edge.length; i++) 
			{
				edge[i].distanceToCenter = Math.pow(edge[i].x - this.centerNode.x, 2) + Math.pow(edge[i].y - this.centerNode.y, 2) 
			}

			edge = edge.sort((a,b) => { if(a.distanceToCenter < b.distanceToCenter) { return 1; } else { return -1; } })

			// then place mission nodes, with two restrictions:
			// 1) as far away from center as possible (so pick first in sorted list)
			// 2) they must have at least one connection that is NOT also used by another mission node
			let counter = 0;
			for(let i = 0; i < numPlayersPerEdge; i++) {
				let p;
				let noValidOptions = false;
				do {
					p = edge[counter];
					counter++;
					if(counter >= edge.length) { noValidOptions = true; break; }
				} while (this.invalidMissionNode(p));

				if(noValidOptions)
				{
					p = edge[Math.floor(Math.random() * edge.length)];
				}

				this.convertToMissionNode(p);
			}
		}

		// for each node, add it to the list its minimum number of times
		const nodeTypes = [];
		const totalNodeList = this.lists.nodes;
		for(const name in totalNodeList) 
		{
			let howMany = totalNodeList[name].min ?? 0;
			howMany = Math.round(howMany*this.cfg.nodeSettingScaleFactor);

			totalNodeList[name].currentlyOnBoard = howMany;

			for(let i = 0; i < howMany; i++) 
			{
				nodeTypes.push(name);
			}
		}

		// now fill the list randomly until we have something for every point
		let numPointsNeeded = this.points.length - 9 - 1; // all points, minus starting positions and center point
		while(nodeTypes.length < numPointsNeeded) 
		{
			let type = getWeighted(totalNodeList, "prob", RNG2);
			nodeTypes.push( type );

			// keep track of maximum => remove node from list of possibilities when reached/exceeded
			totalNodeList[type].currentlyOnBoard++;
			let max = totalNodeList[type].max || Infinity;
			max = Math.round(max * this.cfg.nodeSettingScaleFactor);

			if(totalNodeList[type].currentlyOnBoard >= max) 
			{
				let copy = { prob: 0 };

				for(let param in totalNodeList[type]) 
				{
					copy[param] = totalNodeList[type][param]
				}

				copy.prob = 0

				totalNodeList[type] = copy;
			}
		}

		shuffle(nodeTypes, RNG2);
		shuffle(this.points, RNG); // also shuffle points, otherwise we always make decisions/use fail-safes in the same order

		// now go through all points 
		let nodeCounter = 0;
		for(const p of this.points) 
		{
			// (only update those that haven't yet been updated, otherwise we override center node and mission nodes)
			if(p.type != 'Regular') { continue; }

			// as long as we encounter nodes that are not allowed, try the next point type on the list
			// (if we've exhausted the whole list, reset to 0 and just pick that anyway)
			let nodeAllowed = false, counter = -1, tempType = null;
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
	}

	checkSequenceRecursive(p:GraphNode, type:string) 
	{
		let sequenceSums = 1; // also take into account the node itself
		p.sequenceCounter = this.curSequence + 1;

		for(let c = 0; c < p.connections.length; c++) {
			let conn = p.connections[c];

			if(conn.type != type || conn.sequenceCounter > this.curSequence) { continue; }

			// by increasing the sequence counter, we know we'd already considered this node (so we don't loop endlessly when checking)
			sequenceSums += this.checkSequenceRecursive(conn, type)
		}

		return sequenceSums;
	}

	checkIfNodeAllowed(p:GraphNode, type:string) 
	{
		let nodeData = this.lists.nodes[type]

		//
		// some nodes are not allowed at the edge
		//
		if(p.edgePoint && nodeData.forbiddenOnEdge) {
			return false;
		}

		//
		// some nodes have a fixed minimum distance from the edge
		//
		let minDistance = nodeData.minDistanceFromEdge || -1;
		minDistance *= this.cfg.distanceScaleFactor;
		if(this.distanceToEdge(p) <= minDistance) {
			return false;
		}

		//
		// and some even have a fixed MAXIMUM distance from the edge
		// (such as water, because I don't want people teleporting to the center of the board)
		//
		let maxDistanceFromEdge = nodeData.maxDistanceFromEdge || Infinity;
		maxDistanceFromEdge *= this.cfg.distanceScaleFactor;
		if(this.distanceToEdge(p) > maxDistanceFromEdge) {
			return false;
		}


		//
		// many nodes have a maximum on the number of them that may be "in sequence" ( = grouped together)
		//
		let maxSequence = nodeData.maxSequence || 2;
		maxSequence *= this.cfg.distanceScaleFactor;

		this.curSequence++;
		let sequenceLength = this.checkSequenceRecursive(p, type);

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
	}

	distanceToEdge(p:GraphNode) 
	{
		const minX = Math.min(p.x, this.cfg.resolutionX - p.x);
		const minY = Math.min(p.y, this.cfg.resolutionY - p.y);
		return Math.min(minX, minY);
	}

	connectedToStartingSquare(p) {
		for(let c = 0; c < p.connections.length; c++) {
			let conn = p.connections[c];

			if(conn.nodeType == 'Mission') {
				return true;
			}
		}

		return false;
	}

	placePoints() 
	{
		this.points = [];
		this.map = [];

		const RNG = seedRandom(this.cfg.seed + "-pointTypes");
		const RNG3 = seedRandom(this.cfg.seed + "-y");

		const rX = this.cfg.resolutionX, rY = this.cfg.resolutionY;
		const centerNodePosition = new Point(Math.floor(0.5*rX), Math.floor(0.5*rY));

		this.edgePoints = { left: [], right: [], top: [], bottom: [] };

		// first, place all points on exact grid intervals, and determine a random type (planet, moon, ...)
		for(let x = 0; x <= rX; x++) 
		{
			this.map[x] = [];

			for(let y = 0; y <= rY; y++) 
			{
				this.map[x][y] = [];

				let val = RNG();
				let pointType = 'Regular';

				// mark the center 4 points 
				const pos = new Point(x,y);
				if(pos.matches(centerNodePosition)) { pointType = 'Center'; }

				const node = new GraphNode();
				node.setPosition( new Point(x - 0.5 + RNG3(), y - 0.5 + RNG3()) );
				node.setType(pointType);

				if(pointType == 'Center') { this.centerNode = node; }

				this.keepPointOnScreen(node);

				this.points.push(node);
				this.setCell(node);
			}

			// already mark some points as edgePoints
			this.pushPointsToEdge();
		}
	}

	getCell(pos:Point) : GraphElement[]
	{
		if(this.outOfBounds(pos)) { return null; }
		return this.map[pos.x][pos.y];
	}

	setCell(node:GraphElement)
	{
		const safePos = new Point(Math.floor(node.x), Math.floor(node.y));
		if(this.outOfBounds(safePos)) { return null; }
		this.map[safePos.x][safePos.y].push(node);
	}

	placeObstacles() 
	{
		const numObstacles = 5;
		const RNG = seedRandom(this.cfg.seed + "-obstacles");

		this.obstacles = [];

		for(let i = 0; i < numObstacles; i++) 
		{
			const x = RNG()*this.cfg.resolutionX, y = RNG()*this.cfg.resolutionY;
			
			const o = new Obstacle();
			o.setPosition(new Point(x,y));
			o.setRadius( RNG()*0.4 + 0.2 );
			this.setCell(o);
			this.obstacles.push(o)
		}
	}

	relaxPoints() 
	{
		const numIterations = 1;
		this.currentIteration++;
		
		// Reduce velocity strength with each iteration (they move less and less wildly over time, so that algorithm ends smoothly)
		let stepSize = 2.0 / this.currentIteration;

		for(let i = 0; i < numIterations; i++) 
		{
			// first, determine velocity based on connections
			for(const p of this.points) 
			{
				let vel = new Point();
				const cX = Math.floor(p.x), cY = Math.floor(p.y)

				// find which points we'll be influenced by
				// (just copy whatever is in each cell within a certain range)
				const connections = [];
				const range = 3;
				for(let xx = -range; xx <= range; xx++) 
				{
					for(let yy = -range; yy <= range; yy++) 
					{
						const pos = new Point(cX + xx, cY + yy);
						if(this.outOfBounds(pos)) { continue; }

						const cells = this.getCell(pos);
						for(const cell of cells) 
						{
							connections.push(cell);
						}
					}
				}

				for(let c = 0; c < connections.length; c++) 
				{
					const p2 = connections[c];
					const vec = new Point(p.x - p2.x, p.y - p2.y);
					const dist = Math.sqrt(vec.x*vec.x + vec.y*vec.y);

					let force = 0, dir = 1.0;
					const equilibrium = (p2.type == "obstacle") ? p2.radius : 1.0;
					if(dist > equilibrium) { continue; }

					// mid points should just space out themselves evenly
					force = Math.abs(dist - equilibrium);
					dir = (dist < equilibrium) ? 1.0 : -1.0;

					if(force != 0) {
						vel = new Point(vel.x + dir*vec.x*force, vel.y + dir*vec.y*force);
					}
				}

				p.relaxVelocity = vel
			}

			// then move all points based on that velocity
			for(const p of this.points) 
			{
				// remove from old cell
				let oldCellX = Math.floor(p.x), oldCellY = Math.floor(p.y)

				// some cells are static in one direction; listen to that
				if(p.staticX) { p.relaxVelocity.x = 0; } 
				if(p.staticY) { p.relaxVelocity.y = 0; }

				// actually move
				p.move(p.relaxVelocity.clone().scale(stepSize));

				this.keepPointOnScreen(p);
				this.updateCell(new Point(oldCellX, oldCellY), p);
			}
		}
	}

	createMinimumSpanningTree() 
	{
		this.connectionsToDraw = [];
		const pointsToVisit = this.points.length

		let pointsVisited = 0;
		let curPoint = this.points[0];
		curPoint.visited = true;
		
		// use Prim's algorithm to build a minimum spanning tree from ALL points
		const list = [curPoint];
		while(pointsVisited < (pointsToVisit - 1)) 
		{
			let query = this.getClosestConnection(list);
			let p = query.p, p2 = query.p2;

			p.connections.push(p2);
			p2.connections.push(p);

			p2.visited = true;
			this.addConnectionBetween(p, p2);
			
			list.push(p2);
			pointsVisited++;
		}
	}

	addConnectionBetween(p:GraphNode, p2:GraphNode)
	{
		const conn = new Line(p.getPosition(), p2.getPosition());
		this.connectionsToDraw.push(conn);
	}

	randomFillTree() 
	{
		const connectionMaximum = 3;
		const RNG = seedRandom(this.cfg.seed + "-treeFill");

		// give the center node as many connections as we can manage
		let query
		do {
			const p = this.centerNode
			query = this.getClosestConnection([p], 'unconnected')

			const p2 = query.p2
			if(p2 == null || query.dist >= 2.0) { break; }

			p.connections.push(p2);
			p2.connections.push(p);

			this.addConnectionBetween(p, p2);
		} while(query.p2 != null);

		// then go through all the other points
		for(const p of this.points) 
		{
			// Don't add connections if something already has too many of them
			// Also don't add extra connections to edgePoints => might want to change this, as a single connection is a bit restricting
			if(p.edgePoint || p.connections.length >= connectionMaximum) { continue; }

			// there IS no closest connection, so continue without doing anything
			const query = this.getClosestConnection([p], 'unconnected');
			if(query.p2 == null) { continue; }

			// otherwise, make the connection we found (and we should always draw it)
			const p2 = query.p2;

			p.connections.push(p2);
			p2.connections.push(p);

			this.addConnectionBetween(p, p2);
		}
	}

	getClosestConnection(list:GraphNode[], searchType = 'unvisited') 
	{
		let range = 1;
		let foundValidNode = false;

		while(!foundValidNode) 
		{
			let closestDist = Infinity, closestNode = null, originNode = null;

			for(const p of list) 
			{
				let cX = Math.floor(p.x), cY = Math.floor(p.y)

				for(let xx = -range; xx <= range; xx++) 
				{
					for(let yy = -range; yy <= range; yy++) 
					{
						const pos = new Point(cX + xx, cY + yy);
						if(this.outOfBounds(pos)) { continue; }

						const cells = this.getCell(pos);
						for(const p2 of cells) 
						{
							// skip certain nodes based on search type
							if(!(p2 instanceof GraphNode)) { continue; }
							if(searchType == 'unvisited' && p2.visited) { continue; }
							if(searchType == "unconnected" && p.connections.includes(p2)) { continue; }

							const itsUs = (p == p2);
							const bothEdgePoints = (p.edgePoint && p2.edgePoint);
							if(itsUs || bothEdgePoints) { continue; }

							const tempDistance = (p.x - p2.x)*(p.x - p2.x) + (p.y - p2.y)*(p.y - p2.y)
							if(tempDistance < closestDist) 
							{
								closestDist = tempDistance;
								originNode = p;
								closestNode = p2;
							}
						}
					}
				}
			}

			if(closestNode != null) 
			{
				foundValidNode = true;
				return { p: originNode, p2: closestNode, dist: closestDist };
			} 
			
			range++;

			// fail-safe: when searching for unconnected points, we might need to look REALLY FAR to get any result, so quit after some time
			if(searchType == 'unconnected' && range >= 3) { return { p: null, p2: null }; }
		}
	}

	convertToMissionNode(p:GraphNode) 
	{
		p.nodeType = 'Mission';
		p.type = this.missionNodeList.splice(0, 1)[0];

		for(const conn of p.connections) 
		{
			conn.takenByMissionNode = true;
		}
	}

	invalidMissionNode(p:GraphNode) 
	{
		if(p.type != 'Regular') { return true; }

		let connectionsUsed = 0;
		for(const conn of p.connections) 
		{
			if(!conn.takenByMissionNode) { continue; }
			connectionsUsed++;
		}

		return (connectionsUsed >= p.connections.length);
	}

	pushPointsToEdge() 
	{
		const edgeMargin = 0.15;
		const rightEdge = this.cfg.resolutionX - edgeMargin;
		const bottomEdge = this.cfg.resolutionY - edgeMargin

		for(const p of this.points) 
		{
			const oldCenterX = Math.floor(p.x), oldCenterY = Math.floor(p.y)

			if(!p.staticX) 
			{
				const offLeftHandSide = p.x < edgeMargin;
				const offRightHandSide = p.x > rightEdge;
				if(offLeftHandSide) {
					p.setX(0);
					p.edgePoint = true;
					p.staticX = true;
					p.whichEdges.push(0);
					this.edgePoints.left.push(p);
				} else if(offRightHandSide) {
					p.setX(rightEdge + edgeMargin);
					p.edgePoint = true;
					p.staticX = true;
					p.whichEdges.push(2);
					this.edgePoints.right.push(p);
				} 
			}

			if(!p.staticY) 
			{
				const offTopSide = (p.y < edgeMargin);
				const offBottomSide = (p.y > bottomEdge);

				if(offTopSide) {
					p.setY(0);
					p.edgePoint = true;
					p.staticY = true;
					p.whichEdges.push(1);
					this.edgePoints.top.push(p);
				} else if(offBottomSide) {
					p.setY(bottomEdge + edgeMargin);
					p.edgePoint = true;
					p.staticY = true;
					p.whichEdges.push(3);
					this.edgePoints.bottom.push(p);
				}
			}

			this.updateCell(new Point(oldCenterX, oldCenterY), p);
		}
	}

	updateCell(pos:Point, p:GraphNode) 
	{
		// add to new cell
		let cX = Math.floor(p.x), cY = Math.floor(p.y)

		// ONLY switch cells if that's actually needed (performance optimization)
		if(pos.x != cX || pos.y != cY) 
		{
			let cell = this.getCell(pos);
			cell.splice(cell.indexOf(p), 1);

			cell = this.getCell(new Point(cX, cY));
			cell.push(p);
		}
	}

	finishGeneration() 
	{
		console.log("FINISHING GENERATION");

		this.iteratingTimer.remove();
		this.finalVisualization = true;

		// create connections between all points
		this.pushPointsToEdge();
		this.createMinimumSpanningTree();
		this.randomFillTree();

		// assign types to all the different nodes
		this.prepareLists();
		this.createBetterNodeCollection();
		this.finalizePointTypes();

		// algorithm for determining power dots
		this.orderEdgesByAngle();
		this.placePowerDots();

		// algorithm for finding enclosed areas (needed for Extreme Expeditions & Sharp Scissors)
		// (yeah, it's a really complicated one, needs many steps that work just right)
		if(this.cfg.expansions.sharpScissors || this.cfg.expansions.extremeExpeditions) 
		{
			this.addTemporaryEdges();
			this.orderEdgesByAngle();
			this.findEnclosedAreas();
			this.destroyTemporaryEdges();
			this.findSuitableAreas();			    		
		}

		// picks a few areas to place expeditions + determines their type
		if(this.cfg.expansions.extremeExpeditions) {
			this.pickExpeditionNodes();
		} else if(this.cfg.expansions.sharpScissors) {
			this.addLandmarks();
		}

		// add intermediary points (only if Sharp Scissors is enabled)
		// and resources to dig for
		if(this.cfg.expansions.sharpScissors) 
		{
			this.addIntermediaryPoints();
			this.addNaturalResources();
		}

		// finally, visualize the whole thing we created
		// and convert to a static image
		this.visualizeGame();
		this.cfg.visualizer.convertCanvasToImage(this);
	}

	orderEdgesByAngle() 
	{
		for(const p of this.points) 
		{
			// generate list of all angles (between this node and connections)
			// NOTE: This list is NOT in sync with the connections list! We only need the values, not which node they belong to
			p.edgeAngles = [];

			for(const conn of p.connections) 
			{
				let angle = Math.atan2(conn.y - p.y, conn.x - p.x)
				if(angle < 0) { angle += 2*Math.PI; }

				conn.tempAngle = angle;
				p.edgeAngles.push(angle);
			}

			// now sort connections based on the angle 
			// (we'll need this for the algorithm to find all enclosed areas on the board)
			// NOTE: From now on, we may NEVER shuffle or re-arrange the connections lists again!
			p.connections.sort((a,b) => { 
				if(a.tempAngle < b.tempAngle) { return -1; }
				return 1;
			})
		}
	}

	placePowerDots() 
	{
		const RNG = seedRandom(this.cfg.seed + "-powerDots");

		const powerDotRadius = 0.225 * Math.PI;

		let tempNumPowerDots = 0;
		let minPD = this.cfg.minPowerDots, maxPD = this.cfg.maxPowerDots;

		for(const p of this.points) 
		{
			p.powerDots = [];

			// Special Nodes: center node only gets one dot, ruins get four locations
			tempNumPowerDots = Math.floor(RNG()*(maxPD - minPD + 1)) + minPD;
			if(p.type == 'Center') { tempNumPowerDots = 1; }
			if(p.type == 'Village Ruins') { tempNumPowerDots = 4; }
			if(p.type == 'Chameleon') { tempNumPowerDots += 2; }

			let allAngles = p.edgeAngles.slice();

			// first, determine the range in which angles might fall
			let angleRange = { min: 0, max: 2*Math.PI }
			let averageAngle = 0, numSides = p.whichEdges.length;

			if(numSides > 0) 
			{
				for(let we = 0; we < numSides; we++) 
				{
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
			for(let pd = 0; pd < tempNumPowerDots; pd++) 
			{
				let curAngleIndex = Math.floor(RNG() * allAngles.length);
				let foundFreeSpace = false;
				let numTries = 0;

				allAngles.sort();

				do {
					let ang = allAngles[curAngleIndex];
					let nextAng = allAngles[(curAngleIndex + 1) % allAngles.length]

					let spaceBetween = (nextAng - ang + 2*Math.PI) % (2*Math.PI); 
					if(ang == nextAng) { spaceBetween = 2*Math.PI; }

					let res = false;
					if(spaceBetween > 2*powerDotRadius) 
					{
						let randAngle = ang + RNG() * (spaceBetween-2*powerDotRadius) + powerDotRadius;
						let res = this.createPowerDot(randAngle, p, allAngles)

						if(res) {
							foundFreeSpace = true;
							break;
						}
					}

					if(!res) 
					{
						curAngleIndex = (curAngleIndex + 1) % allAngles.length;
						numTries++;
					}

				// we're certain there is no free space if we've tried all angles we have
				} while(!foundFreeSpace && numTries <= allAngles.length);
			}

			// fail-safe: if no power dots were placed, place a random one within the range, for certain
			const noPowerDotsPlaced = p.powerDots.length <= 0
			if(noPowerDotsPlaced) 
			{
				// without this 0, the compiler somehow removes this variable ...
				const randAngle = RNG() * (angleRange.max - angleRange.min) + angleRange.min + 0.0;
				this.createPowerDot(randAngle, p, allAngles, false);
			}
		}
	}

	createPowerDot(angle:number, p:GraphNode, allAngles:number[], checkBoundaries = true) 
	{
		angle = angle % (2*Math.PI)
		if(angle < 0) { angle += 2*Math.PI; }

		let dx = Math.cos(angle), dy = Math.sin(angle) 

		// What's this?
		// For rectangular nodes, we choose ONE side (the one furthest out) and push it to the edge of the rectangle (1 or -1)
		// The other side remains free
		if(p.nodeType == 'Mission') 
		{
			if(Math.abs(dx) > Math.abs(dy)) {
				dx /= Math.abs(dx)
			} else {
				dy /= Math.abs(dy)
			}
		}

		let PD:PowerDot = { x: dx, y: dy, angle: angle }

		// hacky way: check if it's out of bounds; if so, disallow it
		let radius = this.cfg.nodeRadius * Math.min(this.cfg.cellSizeX, this.cfg.cellSizeY)
		let realPos = new Point(p.x + dx, p.y + dy);

		if(this.outOfBounds(realPos) && checkBoundaries) { return false; }
		
		p.powerDots.push(PD)
		allAngles.push(angle);
		return true;
	}

	addTemporaryEdges() 
	{
		let edges = ['left', 'top', 'right', 'bottom'];

		// sort edges (ascending)
		for(let i = 0; i < 4; i++) 
		{
			const edgeList = this.edgePoints[edges[i]];

			if(i == 1 || i == 3) {
				edgeList.sort((a,b) => { if(a.x > b.x) { return 1; } else { return -1; } })
			} else {
				edgeList.sort((a,b) => { if(a.y > b.y) { return 1; } else { return -1; } })				    			
			}
		}

		// pick counter clockwise neighbour + add edge
		for(let i = 0; i < 4; i++) 
		{
			const edgeList = this.edgePoints[ edges[i] ];
			const prevEdgeList = this.edgePoints[ edges[ (i - 1 + 4) % 4 ] ];

			for(let e = 0; e < edgeList.length; e++) 
			{
				let nb = null;
				let node = edgeList[e];

				// regular connections
				if(i == 2 || i == 1) {

					// connections across corners, if needed
					if(e == 0) { 

						if(!node.staticX || !node.staticY) 
						{
							nb = prevEdgeList[prevEdgeList.length - 1]
							if(i == 1) { nb = prevEdgeList[0]; }
						}

					} else {
						nb = edgeList[e-1];
					}
				} else {
					if(e == edgeList.length - 1) {
						if(!node.staticX || !node.staticY) 
						{
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
	}

	destroyTemporaryEdges() {
		let edges = ['left', 'top', 'right', 'bottom'];
		for(let i = 0; i < this.points.length; i++) {
			let p = this.points[i];

			if(!p.edgePoint) { continue; }

			for(let c = p.connections.length - 1; c >= 0; c--) {
				let conn = p.connections[c]

				if(conn.edgePoint) {
					p.connections.splice(c, 1);

					let ind = conn.connections.indexOf(p);
					conn.connections.splice(ind, 1)
				}
			}
		}
	}

	findEnclosedAreas() {
		this.areas = [];

		// prepare the array with the right length and values
		for(const p of this.points) 
		{
			p.connectionUsed = [];
			for(let c = 0; c < p.connections.length; c++) {
				p.connectionUsed[c] = false;
			}
		}

		for(const p of this.points) 
		{
			// edgepoints run the risk of creating a polygon across the board, because they can never turn counter clockwise
			if(p.edgePoint) { continue; } 

			// for each connection ... 
			for(let c = 0; c < p.connections.length; c++) 
			{
				let conn = p.connections[c];
				if(p.connectionUsed[c]) { continue; }

				// start a new area
				let area:GraphNode[] = [p], areaDone = false, failedArea = false;
				let curNode = conn
				let prevNode = p;

				p.connectionUsed[c] = true;

				while(!areaDone) 
				{
					// add current node to area
					area.push(curNode);

					// find location of previous point in list of connections
					// (so we know the ANGLE at which we entered the node, so we can pick the one immediately clockwise to it)
					let indexByAngle = -1;
					for(let cc = 0; cc < curNode.connections.length; cc++) 
					{
						if(curNode.connections[cc] == prevNode) 
						{
							indexByAngle = cc;
						}
					}

					// now pick the NEXT connection after it
					let newIndex = (indexByAngle + 1) % curNode.connections.length;
					let newNode = curNode.connections[newIndex];

					// remember that the connection we will follow next, has already been used from this node
					// NOTE: Don't use the connection we used to GET here, as that should be saved on the node we CAME FRMO
					curNode.connectionUsed[newIndex] = true;

					// set new current and previous node
					prevNode = curNode
					curNode = newNode

					// if we're back at our starting node, we're done
					const completedCircle = curNode == p;
					if(completedCircle) { areaDone = true; }

					// if we only have a single connection, the algorithm would cycle infinitely if we continued, so just break here
					const singleConnection = curNode.connections.length <= 1;
					if(singleConnection) 
					{
						areaDone = true;
						failedArea = true;
					}
				}

				if(!failedArea) 
				{
					this.areas.push(area);
				}
			}
			
		}
	}

	findSuitableAreas() 
	{
		const radius = this.cfg.nodeRadius;
		const expeditionRadius = this.cfg.nodeRadius;

		this.suitableAreas = [];

		for(let i = this.areas.length - 1; i >= 0; i--) 
		{
			let a = this.areas[i].slice(), numNodes = a.length, nodeRemoveCounter = 0;
			let center = null
			let areaIsSuitable = false;

			do {

				// first, find the center point
				center = new Point();
				let tempNumNodes = (numNodes - nodeRemoveCounter);
				for(let p = 0; p < tempNumNodes; p++) {
					center.x += a[p].x / tempNumNodes;
					center.y += a[p].y / tempNumNodes;
				}

				// then find the distance to the closest node
				// (aka "what's the biggest circle we can draw around the center that still fits within the polygon?")
				let closestDist = Infinity;
				for(let p = 0; p < numNodes; p++) {
					let dist = Math.sqrt( (a[p].x - center.x) * (a[p].x - center.x) + (a[p].y - center.y) * (a[p].y - center.y))
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

			if(!areaIsSuitable) { continue; }

			// modify the area to remove any nodes we left out
			// NOT USEFUL if we're gonna point-relax anyway
			// a.splice(numNodes - nodeRemoveCounter, nodeRemoveCounter);

			// create an area object, including some useful metrics
			const dx = (this.centerNode.x - center.x), dy = (this.centerNode.y - center.y)
			const distanceToCenterNode = Math.sqrt( dx*dx + dy*dy )
			const newArea:AreaObject = {
				tiles: a,
				center: center,
				dist: distanceToCenterNode
			}

			// then add it to the suitable areas list
			this.suitableAreas.push(newArea);

			// and remove it from the original areas list (so it isn't used by any other game mechanics)
			// (however, if the area doesn't end up being used for an expedition, it's given back to the array anyway)
			this.areas.splice(i, 1);
		}
	}

	pickExpeditionNodes() 
	{
		this.expeditionNodes = [];

		const noNodesAvailable = Object.keys(this.lists.expeditionNodes).length <= 0;
		if(noNodesAvailable) { return; }

		const EXP_RNG = seedRandom(this.cfg.seed + "-expeditions")

		const slotRange = { min: 1, max: 4 }

		const desiredNumExpeditionNodes = 10;
		const numExpeditionNodes = Math.min(desiredNumExpeditionNodes, this.suitableAreas.length)

		this.suitableAreas.sort((a,b) => { if(a.dist < b.dist) { return -1; } else { return 1; }} )

		for(let i = numExpeditionNodes - 1; i >= 0; i--) 
		{
			const a = this.suitableAreas.splice(i, 1)[0]
			const n:ExpeditionNode = 
			{
				area: a.tiles,
				center: this.relaxExpeditionNode(a.center, a.tiles),
				type: getWeighted(this.lists.expeditionNodes, "prob", EXP_RNG),
				slots: Math.floor(EXP_RNG() * (slotRange.max - slotRange.min)) + slotRange.min
			}
			this.expeditionNodes.push(n);
		}

		// give back any nodes we didn't choose to the areas array
		// (so we can use them again for distributing natural resources, if needed)
		for(const a of this.suitableAreas) 
		{
			this.areas.push(a.tiles);
		}
	}

	relaxExpeditionNode(c:Point, area:Area) 
	{
		const numSteps = 100;
		const center = c.clone()
		const equilibrium = 1.0
		const edgePushoff = 0.4

		// we can't really relax triangles or squares, as the node will just be pushed through the side (as there is no node there)
		if(area.length <= 4) { return center; }

		for(let i = 0; i < numSteps; i++) 
		{
			let moveVec = new Point();

			for(const surroundingNode of area) 
			{
				const dx = surroundingNode.x - center.x, dy = surroundingNode.y - center.y
				const dist = Math.sqrt( dx*dx + dy*dy );
				const force = Math.abs(dist - equilibrium)

				// @IMPROV: THe algorithm forgets that edge nodes are pushed X pixels inward

				if(dist < equilibrium) 
				{
					moveVec.x += -dx * force;
					moveVec.y += -dy * force * (this.cfg.cellSizeY / this.cfg.cellSizeX);
				}
			}

			// also push us off boundaries
			if(center.x < edgePushoff) { moveVec.x += Math.abs(edgePushoff - center.x) }
			if(center.x > this.cfg.resolutionX - edgePushoff) { moveVec.x -= this.cfg.resolutionX - center.x + edgePushoff }

			if(center.y < edgePushoff) { moveVec.y += Math.abs(edgePushoff - center.y) }
			if(center.y > this.cfg.resolutionY - edgePushoff) { moveVec.y -= this.cfg.resolutionY - center.y + edgePushoff }

			center.x += moveVec.x * 1.0 / (0.1*numSteps + 1);
			center.y += moveVec.y * 1.0 / (0.1*numSteps + 1);
		}

		return center;
	}

	initList(list:Record<string,any>) 
	{
		for(const [key,data] of Object.entries(list)) 
		{
			const exp = data.expansion
			if(!exp) { continue; }
			
			const isIncluded = this.cfg.expansions[exp];
			if(isIncluded) { continue; }

			delete list[key];
		}
	}

	prepareLists() 
	{
		const nodes = {}
		Object.assign(nodes, NODES_DICT);
		this.initList(nodes);

		const missionNodes = {}
		Object.assign(missionNodes, MISSION_NODES_DICT);
		this.initList(missionNodes);

		const expeditionNodes = {}
		Object.assign(expeditionNodes, EXPEDITION_NODES_DICT);
		this.initList(expeditionNodes);

		this.lists = 
		{
			nodes: nodes,
			missionNodes: missionNodes,
			expeditionNodes: expeditionNodes
		};
	}

	createBetterNodeCollection() 
	{
		let NODE_RNG = seedRandom(this.cfg.seed + "-nodesCollection")

		// if no expansions are enabled, there's no need to meddle with the nodes
		if(!this.cfg.expansions.nastyNodes && !this.cfg.expansions.nodesOfKnowledge && !this.cfg.expansions.theElectricExpansion) { return; }

		let tempNodes = {}; 
		let name = '';

		// Step 1) For each category and action type, add ONE random node to the selection
		const curNodeData:NodeData = 
		{ 
			sum: 0, 
			categories: Object.keys(NODE_CATEGORIES), 
			actionTypes: NODE_ACTION_TYPES.slice()
		};

		// EXCEPTION: With the electric expansion, always start with the electricity node (as it has MANY dependencies that would bloat the list)
		if(this.cfg.expansions.theElectricExpansion) 
		{
			this.addNodeToCollection(tempNodes, 'Electricity', curNodeData);
		}

		while(curNodeData.categories.length > 0) 
		{
			name = this.getRandomNodeOfType('category', curNodeData.categories[0], tempNodes, NODE_RNG);
			if(name == null) {
				curNodeData.categories.splice(0, 1);
				continue;
			}
			
			this.addNodeToCollection(tempNodes, name, curNodeData)
		}

		while(curNodeData.actionTypes.length > 0) 
		{
			name = this.getRandomNodeOfType('actionType', curNodeData.actionTypes[0], tempNodes, NODE_RNG);
			if(name == null) {
				curNodeData.actionTypes.splice(0, 1);
				continue;
			}
			
			this.addNodeToCollection(tempNodes, name, curNodeData)
		}

		// Step 2) Count how many "cutting nodes" we have => we want at least 3
		let cuttingNodesInSet = 0, minCuttingNodes = 3;
		for(const name in tempNodes) 
		{
			if(tempNodes[name].actionTypes.includes("Cutting")) {
				cuttingNodesInSet++;
			}
		}

		while(cuttingNodesInSet < minCuttingNodes) 
		{
			name = this.getRandomNodeOfType('actionType', 'Cutting', tempNodes, NODE_RNG);
			if(name == null) { break; }

			cuttingNodesInSet++;
			this.addNodeToCollection(tempNodes, name, curNodeData);
		}

		// Step 3) As long as we still have space left, keep adding more nodes (that we don't have yet)
		const errorMargin = 5, maxTries = 200;
		const maxPointsToFill = this.points.length - 12 - errorMargin;
		let numTries = 0;
		while(curNodeData.sum < maxPointsToFill && Object.keys(tempNodes).length < Object.keys(this.lists.nodes).length) 
		{
			do {
				numTries++
				name = getWeighted(this.lists.nodes, "prob", NODE_RNG);
			} while(tempNodes[name] != undefined && numTries <= maxTries);
			if(name == null) { break; }
			this.addNodeToCollection(tempNodes, name, curNodeData);
		}

		// finally, swap the old (full) NODES list with the new one
		this.lists.nodes = tempNodes;
	}

	addNodeToCollection(list:Record<string,any>, name:string, curNodeData:NodeData) 
	{
		if(list[name] != undefined) { return; }

		let node = this.lists.nodes[name];
		list[name] = node;

		// update total sum (we stop filling the list when we have enough for the whole board)
		let nodeMin = node.min ?? 0;
		nodeMin = Math.round(nodeMin * this.cfg.nodeSettingScaleFactor);
		let nodeMax = node.max*this.cfg.nodeSettingScaleFactor ?? nodeMin;
		nodeMax = Math.round(nodeMax);

		let diff = Math.ceil((nodeMin + nodeMax) * 0.5) + 1;
		curNodeData.sum += diff;

		// check if category needs to be removed from list
		let catInd = curNodeData.categories.indexOf(node.category)
		if(catInd > -1) {
			curNodeData.categories.splice(catInd, 1);
		}

		// check if action type(s) need to be removed from list
		for(let i = 0; i < node.actionTypes.length; i++) {
			let atp = node.actionTypes[i];
			let atpInd = curNodeData.actionTypes.indexOf(atp);

			if(atpInd > -1) {
				curNodeData.actionTypes.splice(atpInd, 1);
			}
		}

		// check if this node requires any other nodes; if so, add those as well
		let requirements = node.requirements ?? [];
		for(let i = 0; i < requirements.length; i++) 
		{
			let req = requirements[i]
			this.addNodeToCollection(list, req, curNodeData)
		}
	}

	getRandomNodeOfType(what = 'category', tp, nodesList, RNG) {
		// center node is an exception (has probability 0, so normal algorithm doesn't work)
		if(tp == 'Center'){ return 'Center'; }

		let list = {}, totalProb = 0;
		for(let name in this.lists.nodes) {
			if(nodesList[name] != undefined) { continue; }

			let n = this.lists.nodes[name]

			if(what == 'category' && n.category == tp) {
				list[name] = n;
				totalProb += n.prob;
			} else if(what == 'actionType' && n.actionTypes.includes(tp)) {
				list[name] = n;
				totalProb += n.prob;
			}
		}

		return getWeighted(list, "prob", RNG);
	}

	addIntermediaryPoints() 
	{
		this.intermediaryPoints = [];

		const minPointDistance = 0.5;
		const maxPointsPerNode = 2;

		let NODE_RNG = seedRandom(this.cfg.seed + "-tinyNodes")

		for(const p of this.points) 
		{
			if(p.edgePoint) { continue; }

			for(const conn of p.connections) 
			{
				// enforce a strict maximum of 2 intermediary points surrounding each node
				if(p.intermediaryPointsCreated >= maxPointsPerNode || conn.intermediaryPointsCreated >= maxPointsPerNode) {
					break;
				}

				// don't consider connections twice!
				if(conn.intermediaryPointsExhausted) { continue; }

				// don't allow connecting with an edge node!
				if(conn.edgePoint) { continue; }

				// don't create an intermediary point if the edge is really short (and there's just no space for it)
				//let dist = Math.sqrt((p.x - conn.x)*(p.x - conn.x) + (p.y - conn.y)*(p.y - conn.y))
				//if(dist <= minPointDistance) { continue; }

				let intermediaryPoint:IntermediaryPoint = {
					x: (p.x + conn.x)*0.5,
					y: (p.y + conn.y)*0.5,
					type: getWeighted(TINY_NODES, "prob", NODE_RNG),
					angle: Math.atan2(conn.y - p.y, conn.x - p.x)
				}

				this.intermediaryPoints.push(intermediaryPoint)

				p.intermediaryPointsCreated++;
				conn.intermediaryPointsCreated++;
			}

			p.intermediaryPointsExhausted = true;
		}
	}

	addLandmarks() 
	{
		let RNG = seedRandom(this.cfg.seed + "-landmarks")

		this.landmarks = [];

		const desiredNumLandmarks = 5;
		const numLandmarks = Math.min(desiredNumLandmarks, this.suitableAreas.length)

		this.suitableAreas.sort((a,b) => { if(a.dist < b.dist) { return -1; } else { return 1; }} )

		for(let i = numLandmarks - 1; i >= 0; i--) 
		{
			let a = this.suitableAreas.splice(i, 1)[0]

			let n:Landmark = 
			{
				center: this.relaxExpeditionNode(a.center, a.tiles),
				type: getWeighted(LANDMARKS, "prob", RNG)
			}

			this.landmarks.push(n);
		}

		// give back any nodes we didn't choose to the areas array
		// (so we can use them again for distributing natural resources, if needed)
		for(const area of this.suitableAreas) 
		{
			this.areas.push(area.tiles);
		}
	}

	addNaturalResources() 
	{
		let RNG = seedRandom(this.cfg.seed + "-naturalResources")

		this.naturalResources = [];

		for(const a of this.areas) 
		{
			// find "bounding box" around polygon (and center)
			let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
			let center = new Point(0,0);
			let numEdgeNodes = 0;
			for(const pos of a) 
			{
				center.x += pos.x / a.length;
				center.y += pos.y / a.length;
				if(pos.edgePoint) { numEdgeNodes++; }
			}

			let numResources = Math.floor(RNG()*4) + 1;

			// natural resources look ugly (and unbalanced) in areas connected to edge, so
			// 1) ignore any areas where more than HALF the points are edge points
			if(numEdgeNodes >= Math.round(a.length*0.5)) { continue; }

			// 2) and only allow 1-2 natural resources in areas with few nodes
			if(a.length <= 4) { numResources = Math.floor(RNG()*2) + 1; }


			// shrink polygon towards center
			const scaleFactor = 0.7;
			let poly = [];
			for(const pos of a) 
			{
				let dx = (pos.x - center.x) * scaleFactor + center.x;
				let dy = (pos.y - center.y) * scaleFactor + center.y;

				minX = Math.min(dx, minX);
				maxX = Math.max(dx, maxX);

				minY = Math.min(dy, minY);
				maxY = Math.max(dy, maxY);

				poly.push(new Point(dx, dy));
			}

			// randomly place points within bounding box
			// if they are also inside the polygon, yay! Save it!
			let nodeRadius = this.cfg.nodeRadius, naturalResourceRadius = this.cfg.naturalResourceRadius, margin = 0.075;
			let tempResourceList = [];
			const maxTries = 200;

			for(let r = 0; r < numResources; r++) 
			{
				const point = new Point();
				let outsidePolygon = false, tooCloseToNode = false, tooCloseToResource = false;
				let locationNotSuitable = false;

				let tries = 0

				do {
					point.x = RNG() * (maxX-minX) + minX;
					point.y = RNG() * (maxY-minY) + minY;

					outsidePolygon = !this.pointInsidePolygon(point, poly);

					if(!outsidePolygon) 
					{
						const minDistToNode = (nodeRadius + naturalResourceRadius + margin);
						tooCloseToNode = (this.closestDistToPolygonNode(point, a) <= minDistToNode);

						if(!tooCloseToNode) 
						{
							const minDistToResource = 2.0*(naturalResourceRadius + margin);
							tooCloseToResource = (this.closestDistToResource(point, tempResourceList) <= minDistToResource);
						}					
					}

					locationNotSuitable = (outsidePolygon || tooCloseToNode || tooCloseToResource);

					tries++;
					if(tries >= maxTries) { break; }

				} while(locationNotSuitable)

				// if we failed to find anything (probably not enough space), just ignore this one and continue
				if(locationNotSuitable) { continue; }

				const nr:NaturalResource = 
				{
					x: point.x,
					y: point.y,
					type: getWeighted(NATURAL_RESOURCES, "prob", RNG)
				}

				tempResourceList.push(nr);
				this.naturalResources.push(nr);
			}

		}
	}

	closestDistToResource(point:Point, list:Point[]) 
	{
		let minDist = Infinity;

		for(const pos of list) 
		{
			let dx = (point.x - pos.x)*this.cfg.cellSizeX;
			let dy = (point.y - pos.y)*this.cfg.cellSizeY
			minDist = Math.min(minDist, Math.sqrt( dx*dx + dy*dy ));
		}

		return minDist / Math.min(this.cfg.cellSizeX, this.cfg.cellSizeY);
	}

	closestDistToPolygonNode(point:Point, poly:Point[]|GraphNode[]) 
	{
		let minDist = Infinity;

		for(const pos of poly) 
		{
			let dx = (pos.x - point.x)*this.cfg.cellSizeX;
			let dy = (pos.y - point.y)*this.cfg.cellSizeY;
			let dist = Math.sqrt( dx*dx + dy*dy )
			minDist = Math.min(dist, minDist);
		}

		return minDist / Math.min(this.cfg.cellSizeX, this.cfg.cellSizeY);
	}

	pointInsidePolygon(point:Point, vs:Point[]) 
	{
		// ray-casting algorithm based on
		// https://wrf.ecse.rpi.edu/Research/Short_Notes/pnpoly.html/pnpoly.html
		
		let csX = this.cfg.cellSizeX, csY = this.cfg.cellSizeY;
		let x = point.x * csX, y = point.y * csY;
		
		let inside = false;
		for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
			let xi = vs[i].x * csX, yi = vs[i].y * csY;
			let xj = vs[j].x * csX, yj = vs[j].y * csY;
			
			let intersect = ((yi > y) != (yj > y))
				&& (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
			if (intersect) inside = !inside;
		}
		
		return inside;
	}

	visualizeGame() 
	{
		if(this.mainGraphics != null) {
			this.visibilityGraphics.destroy();
			this.mainGraphics.destroy();
		}

		const RNG = seedRandom(this.cfg.seed + '-visualization')

		// visualize all points (correct place + radius + color/type)
		// @ts-ignore
		const backgroundGroup = this.add.group();
		backgroundGroup.depth = 0;

		// @ts-ignore
		const visibilityGraphics = this.add.graphics();
		visibilityGraphics.depth = 1

		// @ts-ignore
		const graphics = this.add.graphics()
		graphics.depth = 2;

		// @ts-ignore
		const foregroundGroup = this.add.group();
		foregroundGroup.depth = 3;

		const w = this.canvas.width, h = this.canvas.height
		const csX = this.cfg.cellSizeX, csY = this.cfg.cellSizeY, cs = Math.min(csX, csY)
		const radius = this.cfg.nodeRadius

		//
		// draw the quadrant lines across the board
		//
		const resFaultLine = this.cfg.visualizer.resLoader.getResource("fault_line");

		if(this.finalVisualization) 
		{
			const opHoriz = new LayoutOperation({
				translate: new Point(0, this.centerNode.y * csY),
				dims: new Point(w, 50*3),
				alpha: 0.5,
				pivot: new Point(0, 0.5)
			})
			imageToPhaser(resFaultLine, opHoriz, this);

			const opVert = new LayoutOperation({
				translate: new Point(this.centerNode.x * csX, 0),
				dims: new Point(h, 50*3), // @TODO: very uncertain about these fault line dims settings
				alpha: 0.5,
				pivot: new Point(0, 0.5),
				rotation: 0.5*Math.PI
			})
			imageToPhaser(resFaultLine, opVert, this);
		}

		//
		// draw all connections (that need to be drawn)
		//
		const connCol = new Color("#888888");
		connCol.a = 0.5;
		const opConnLine = new LayoutOperation({
			stroke: connCol,
			strokeWidth: 6
		})

		for(const conn of this.connectionsToDraw) 
		{
			const line = new Line(conn.start.clone().scale(new Point(csX,csY)), conn.end.clone().scale(new Point(csX,csY)));
			lineToPhaser(line, opConnLine, graphics);
		}

		// draw natural resources
		// (these go BEFORE power dots and nodes, because it's more important that those are visible, than that natural resources are)
		if(this.naturalResources) 
		{
			const resNatRes = this.cfg.visualizer.resLoader.getResource("natural_resources");

			for(const nr of this.naturalResources) 
			{
				const op = new LayoutOperation({
					translate: this.getRealPos(nr),
					dims: new Point(2*this.cfg.naturalResourceRadius*cs),
					pivot: Point.CENTER,
					frame: NATURAL_RESOURCES[nr.type].iconFrame,
					rotation: this.getRandomRotation(),
					alpha: this.cfg.naturalResourceAlpha
				})
				const sprite = imageToPhaser(resNatRes, op, this);
				backgroundGroup.add(sprite, true);
			}
		}

		const fontSize = 24 * this.cfg.scaleFactorDPI;
		const smallerFontSize = 0.66 * fontSize;
		const strokeWidth = 0.125 * fontSize;

		const textConfig = new TextConfig({
			font: "scifly",
			size: fontSize
		}).alignCenter();

		const textConfigMetadata = new TextConfig({
			font: "scifly",
			size: smallerFontSize,
		}).alignCenter();

		// draw actual points you can move to
		const missionNodeList = this.lists.missionNodes;
		for(const p of this.points) 
		{
			let color:string, lightColor:string, nodeCategory:string;

			if(p.nodeType == 'Mission') {
				color = missionNodeList[p.type].color ?? "#FF0000";
				lightColor = missionNodeList[p.type].lightColor ?? "#FFAAAA";
			} else if(p.nodeType == 'Regular') {
				nodeCategory = 'Center'
				if(this.finalVisualization) {
					nodeCategory = this.lists.nodes[p.type].category;
				}

				//color = NODES[p.type].color ?? "#0000FF";
				color = NODE_CATEGORIES[nodeCategory].color ?? "#FF0000";
				lightColor = NODE_CATEGORIES[nodeCategory].lightColor ?? "#FFAAAA";
			}

			// if the inkFriendly setting is enabled,
			// we just remove all color and turn all backgrounds/accents into white
			if(this.cfg.inkFriendly) 
			{
				color = "#FFFFFF";
				lightColor = "#FFFFFF";
			}

			// Start nodes are rectangular, all other nodes are circular
			let obj:Rectangle|Circle = null, sprite = null, spriteOutline = null;
			const powerDotRadius = this.cfg.powerDotRadius;

			const outlineMarginFactor = 1.2
			const objectCenter = this.getRealPos(p);
			const opObj = new LayoutOperation({ fill: lightColor });

			const resMissionNodes = this.cfg.visualizer.resLoader.getResource("mission_nodes");
			const resRegularNodes = this.cfg.visualizer.resLoader.getResource("regular_nodes");
			const resOutlines = this.cfg.visualizer.resLoader.getResource("node_outlines");

			if(p.nodeType == 'Mission') 
			{
				let halfSize = radius * cs

				const rectPos = new Point(p.x * csX - halfSize, p.y * csY - halfSize);
				obj = new Rectangle().fromTopLeft(rectPos, new Point(halfSize * 2));

				if(this.finalVisualization) 
				{
					const opMissionNode = new LayoutOperation({
						translate: this.getRealPos(p),
						dims: new Point(halfSize),
						pivot: Point.CENTER,
						frame: missionNodeList[p.type].iconFrame,
						depth: 3
					})
					sprite = imageToPhaser(resMissionNodes, opMissionNode, this);
					foregroundGroup.add(sprite, true);

					const opOutline = new LayoutOperation({
						translate: opMissionNode.translate.clone(),
						dims: new Point(2*halfSize*outlineMarginFactor),
						pivot: Point.CENTER,
						frame: 4 + Math.floor(Math.random() * 4),
						depth: 3
					})

					spriteOutline = imageToPhaser(resOutlines, opOutline, this);
					foregroundGroup.add(spriteOutline, true);

					// edge points need their sprites pushed to the side, otherwise they are not completely visible
					// when staticX and staticY are true, it's a corner node => use a hack: calculate the angle towards the center node and use that.
					// @TODO: if I ever turn this game to my own non-Phaser system entirely, these parts of the code need to be turned around => decided BEFORE drawing the thing
					if(p.edgePoint) 
					{
						let averageAngle = 0;

						for(const rawAngle of p.whichEdges)
						{
							let angle = rawAngle * 0.5 * Math.PI;
							averageAngle += angle / p.whichEdges.length;

							sprite.x += 0.5*sprite.displayWidth * Math.cos(angle);
							sprite.y += 0.5*sprite.displayHeight * Math.sin(angle);

							// shove the rectangle slightly off the side, to make it stand out and give the icon some room
							obj.center.x += 10 * Math.cos(angle);
							obj.center.y += 10 * Math.sin(angle);

							objectCenter.x += 10 * Math.cos(angle);
							objectCenter.y += 10 * Math.sin(angle);

							spriteOutline.x += 10 * Math.cos(angle);
							spriteOutline.y += 10 * Math.sin(angle);

						}

						sprite.rotation = averageAngle + 0.5 * Math.PI; // the icon drawings have their center at 0.5PI angle, instead of pointing to the right
					}
				}

				rectToPhaser(obj, opObj, graphics);

			} else if(p.nodeType == 'Regular') {

				obj = new Circle({ center: this.getRealPos(p), radius: radius * cs });

				if(this.finalVisualization) 
				{
					const opRegular = new LayoutOperation({
						translate: this.getRealPos(p),
						dims: new Point(radius*cs),
						pivot: Point.CENTER,
						frame: this.lists.nodes[p.type].iconFrame,
						depth: 3,
						rotation: this.getRandomRotation()
					})

					sprite = imageToPhaser(resRegularNodes, opRegular, this);
					foregroundGroup.add(sprite, true);

					const opOutline = new LayoutOperation({
						translate: opRegular.translate.clone(),
						dims: new Point(2*radius*cs*outlineMarginFactor),
						pivot: Point.CENTER,
						depth: 3,
						rotation: this.getRandomRotation(),
					})

					// frame 8 and 9 are two different outlines to mark a node as special
					// the center node gets the seed
					// (@NOTE (21-02-2023): the energy expansion adds an energy number, but that's correctly handled elsewhere in the code)
					let frameOutline = Math.floor(Math.random() * 4);
					if(p.type == 'Center') 
					{
						frameOutline = 8;

						const offset = this.cfg.seedTextOffset;

						const opTextMetadata = new LayoutOperation({
							translate: new Point(sprite.x, sprite.y + sprite.displayHeight * 0.5 + offset),
							pivot: Point.CENTER,
							fill: "#555555",
							dims: new Point(15,2).scale(textConfigMetadata.size),
							depth: 4
						})
						const resTextMetadata = new ResourceText({ text: this.cfg.seed, textConfig: textConfigMetadata });
						const txt = textToPhaser(resTextMetadata, opTextMetadata, this);
						foregroundGroup.add(txt, true);
					}

					opOutline.frame = frameOutline;
					spriteOutline = imageToPhaser(resOutlines, opOutline, this);
					foregroundGroup.add(spriteOutline, true)

					if(p.edgePoint) 
					{
						let averageAngle = 0;
						for(const angleRaw of p.whichEdges) 
						{
							const angle = angleRaw * 0.5 * Math.PI;
							averageAngle += angle / p.whichEdges.length;

							sprite.x += 0.5*sprite.displayWidth * Math.cos(angle)
							sprite.y += 0.5*sprite.displayHeight * Math.sin(angle);

							// there's less room on edge (circular) nodes, so just scale down the icon (for now)
							sprite.displayWidth *= 0.75;
							sprite.displayHeight *= 0.75;

							// shove the circle slightly off the side, to make it stand out and give the icon some room
							obj.center.x += 10 * Math.cos(angle);
							obj.center.y += 10 * Math.sin(angle);

							objectCenter.x += 10 * Math.cos(angle);
							objectCenter.y += 10 * Math.sin(angle);

							spriteOutline.x += 10 * Math.cos(angle);
							spriteOutline.y += 10 * Math.sin(angle);
						}

						sprite.rotation = averageAngle + 0.5 * Math.PI;
					}
				}

				circleToPhaser(obj, opObj, graphics);
			}

			const opCirc = new LayoutOperation({
				fill: "#CCCCCC",
				stroke: "#AAAAAA",
				strokeWidth: 1
			});

			for(const pd of p.powerDots) 
			{
				const center = new Point(objectCenter.x + pd.x * radius * cs, objectCenter.y + pd.y * radius * cs);
				const circ = new Circle({ center: center, radius: powerDotRadius });
				circleToPhaser(circ, opCirc, visibilityGraphics);
			}

			// Only on final visualization, determine and draw any texts (otherwise too heavy to redraw each frame)
			if(this.finalVisualization) 
			{
				const resDayNight = this.cfg.visualizer.resLoader.getResource("daynight_icons");

				if(p.nodeType == 'Regular' && this.lists.nodes[p.type].needsNumber) 
				{
					// Calculate distance from this center to edge, and the maximum distance
					const distToCenter = this.dist(p, this.centerNode);
					const maxDist = this.maxDistanceToEdge(this.centerNode);

					// Determine how many nodes there are that you NEED to pass this node
					const numNodesOfType = this.getNumNodesOfType(this.lists.nodes[p.type].typeNeeded) * Math.min(2.0 / this.cfg.numPlayers, 0.5);

					// Combine that to get a percentage of the total needed, depending on distance to center node
					const centerMultiplier = (1.0 - (distToCenter / maxDist))*numNodesOfType;

					const randNum = Math.max( Math.round(centerMultiplier + 0.5 - RNG()), 1);
					const str = randNum.toString();
					const opText = new LayoutOperation({
						translate: obj.center,
						pivot: Point.CENTER,
						rotation: sprite.rotation,
						depth: 4,
						fill: '#FFFFFF',
						stroke: "#010101",
						strokeWidth: strokeWidth,
						dims: new Point(2*textConfig.size)
					})

					const resText = new ResourceText({ text: str, textConfig: textConfig });
					const txt = textToPhaser(resText, opText, this);
					foregroundGroup.add(txt, true);
				}

				
				if(p.type == 'Center') 
				{
					// only in the Nodes of knowledge expansion does the center node get day/night icons around it
					if(this.cfg.expansions.nodesOfKnowledge) 
					{
						const margin = 0.03

						const pos1 = new Point(obj.center.x - (radius+margin)*cs, obj.center.y - (radius+margin)*cs);
						const pos2 = new Point(obj.center.x + (radius+margin)*cs, obj.center.y + (radius+margin)*cs);
						const dims = new Point(0.6*radius*cs);

						const op1 = new LayoutOperation({
							translate: pos1,
							dims: dims,
							frame: 0,
							pivot: Point.CENTER
						})
						imageToPhaser(resDayNight, op1, this);

						const op2 = new LayoutOperation({
							translate: pos2,
							dims: dims,
							frame: 1,
							pivot: Point.CENTER
						})
						imageToPhaser(resDayNight, op2, this);
					}


					// only in the Electric Expansion, does the center node get a number
					if(this.cfg.expansions.theElectricExpansion) 
					{
						let numEnergeticNodes = this.getNumEnergeticNodes();
						let finalNum = Math.floor(0.66 * numEnergeticNodes / this.cfg.numPlayers);

						const opTextElec = new LayoutOperation({
							translate: obj.center,
							pivot: Point.CENTER,
							rotation: sprite.rotation,
							depth: 4,
							dims: new Point(2*textConfig.size),
							fill: "#FFFFFF",
							stroke: "#010101",
							strokeWidth: strokeWidth,
						});
						const resTextElec = new ResourceText({ text: finalNum.toString(), textConfig: textConfig });
						const txt = textToPhaser(resTextElec, opTextElec, this);
						foregroundGroup.add(txt, true);
					}
				}
			}
		}

		// draw intermediary points ( = TINY NODES)
		if(this.intermediaryPoints) 
		{
			const IP_RNG = seedRandom(this.cfg.seed + "-intermediaryPoints");

			const resTinyNodes = this.cfg.visualizer.resLoader.getResource("tiny_nodes");
			const iPointSize = new Point(radius * cs * 0.25 * 2);
			for(const iPoint of this.intermediaryPoints) 
			{
				const pos = this.getRealPos(iPoint);
				const type = iPoint.type;

				let angle = iPoint.angle;
				if(type == 'triangle' && IP_RNG() <= 0.5) { angle += Math.PI; }

				const op = new LayoutOperation({
					translate: pos,
					dims: iPointSize,
					pivot: Point.CENTER,
					frame: TINY_NODES[type].iconFrame,
					rotation: angle,
					depth: 3
				});

				const obj = imageToPhaser(resTinyNodes, op, this);
				foregroundGroup.add(obj, true);
			}
		}

		// add the expedition nodes to the board
		if(this.expeditionNodes) 
		{
			const expeditionNodeRadius = 0.25 * cs;
			const expeditionSlotRadius = 0.4*expeditionNodeRadius
			const resExpeditionNodes = this.cfg.visualizer.resLoader.getResource("expedition_nodes");
			const resOutlines = this.cfg.visualizer.resLoader.getResource("node_outlines");

			for(const n of this.expeditionNodes) 
			{
				let center = n.center, s = n.slots;

				const op = new LayoutOperation({
					translate: this.getRealPos(center),
					frame: 0,
					dims: new Point(expeditionNodeRadius * 2.0),
					pivot: Point.CENTER,
					rotation: this.getRandomRotation()
				});

				// show default expedition node sprite (the compass/navigator icon)
				const sprite = imageToPhaser(resExpeditionNodes, op, this);
				backgroundGroup.add(sprite, true);

				// add locations onto which players can move (to join the expedition)
				let cols = Math.min(s, 2), rows = Math.ceil(s / cols)

				const colCircle = new Color("#AAAAAA");
				colCircle.a = 0.8;
				const opCirc = new LayoutOperation({ fill: colCircle });

				for(let a = 0; a < s; a++) 
				{
					// first, calculate the "perfect" position for each slot
					const xPos = center.x * csX + (a % cols - 0.5*(cols - 1))*2*expeditionSlotRadius
					const yPos = center.y * csY + (Math.floor(a / cols) - 0.5*(rows-1))*2*expeditionSlotRadius

					// then scatter them randomly, as it looks more organic on this board (more "unstable")
					const scatterAngle = this.getRandomRotation()
					const scatterRadius = 0.2 * expeditionSlotRadius;
					const scatter = new Point(
						Math.cos(scatterAngle)*scatterRadius, 
						Math.sin(scatterAngle)*scatterRadius
					);

					const circ = new Circle({ center: new Point(xPos + scatter.x, yPos + scatter.y), radius: expeditionSlotRadius });
					circleToPhaser(circ, opCirc, graphics);

					const op = new LayoutOperation({
						translate: circ.center,
						dims: new Point(2*expeditionSlotRadius),
						frame: Math.floor(Math.random() * 4),
						pivot: Point.CENTER,
						rotation: this.getRandomRotation(),
						depth: 3
					});

					const slotSprite = imageToPhaser(resOutlines, op, this);
					foregroundGroup.add(slotSprite, true);
				}
				
			}
		}

		// add landmarks to the board
		if(this.landmarks) 
		{
			const landmarkRadius = new Point(0.5 * cs);
			const resLandmarks = this.cfg.visualizer.resLoader.getResource("landmarks");

			for(const lm of this.landmarks) 
			{
				let center = lm.center;

				const op = new LayoutOperation({
					translate: this.getRealPos(center),
					frame: LANDMARKS[lm.type].iconFrame,
					dims: landmarkRadius,
					pivot: Point.CENTER
				})
				const sprite = imageToPhaser(resLandmarks, op, this);
				backgroundGroup.add(sprite, true);
			}
		}

		// draw enclosed areas (TURNED OFF for now)
		if(this.areas && DEBUG_FILL_AREAS) 
		{
			const color = Color.BLACK.clone();
			const opPath = new LayoutOperation({ fill: color });

			for(let i = 0; i < this.areas.length; i++) 
			{
				let a = this.areas[i];
				let center = new Point();

				color.randomizeAll();

				let pointsList = [];
				for(const node of a) 
				{
					pointsList.push(node.x * csX);
					pointsList.push(node.y * csY);

					center.x += node.x / a.length;
					center.y += node.y / a.length;
				}

				const path = new Path(pointsList);
				pathToPhaser(path, opPath, graphics);

				const opTextAreaNum = new LayoutOperation({
					translate: this.getRealPos(center),
					pivot: Point.CENTER,
					depth: 4,
					dims: new Point(2*textConfig.size),
					fill: "#FFFFFF",
					stroke: "#010101",
					strokeWidth: strokeWidth,
				})

				const resTextAreaNum = new ResourceText({ text: i.toString(), textConfig: textConfig });
				const txt = textToPhaser(resTextAreaNum, opTextAreaNum, this);
				foregroundGroup.add(txt, true);
			}
		}

		this.visibilityGraphics = visibilityGraphics;
		this.mainGraphics = graphics;
		this.backgroundGroup = backgroundGroup;
		this.foregroundGroup = foregroundGroup;
	}

	dist(a:GraphNode, b:GraphNode) 
	{
		let dx = (a.x - b.x), dy = (a.y - b.y)
		return Math.sqrt(dx*dx + dy*dy)
	}

	maxDistanceToEdge(p:GraphNode) 
	{
		let dx1 = p.x, dx2 = (this.cfg.resolutionX - p.x)
		let dy1 = p.y, dy2 = (this.cfg.resolutionY - p.y)
		
		let dist1 = Math.sqrt(dx1*dx1 + dy1*dy1)
		let dist2 = Math.sqrt(dx1*dx1 + dy2*dy2)
		let dist3 = Math.sqrt(dx2*dx2 + dy1*dy1)
		let dist4 = Math.sqrt(dx2*dx2 + dy2*dy2)

		return Math.max(Math.max(dist1, dist2), Math.max(dist3, dist4));
	}

	getNumNodesOfType(tp:string) 
	{
		let sum = 0;
		for(let i = 0; i < this.points.length; i++) {
			let p = this.points[i];
			if(p.type == tp) { sum++; }
		}
		return sum;
	}

	getNumEnergeticNodes() 
	{
		let sum = 0;
		for(const p of this.points) 
		{
			let type = p.type;
			if(ENERGETIC_NODES.includes(type)) 
			{
				if(type == 'Fire' || type == 'Wood') { sum += 0.5; }
				else { sum++; }
			}
		}

		return Math.floor(sum);
	}

	keepPointOnScreen(p:GraphNode) 
	{
		p.clampPositionTo(new Point(this.cfg.resolutionX, this.cfg.resolutionY));
	}

	outOfBounds(pos:Point) 
	{
		return (pos.x < 0 || pos.x > this.cfg.resolutionX || pos.y < 0 || pos.y > this.cfg.resolutionY);
	}

	async createSecretBoard() 
	{
		// clear the whole board
		this.mainGraphics.destroy();
		this.visibilityGraphics.destroy();

		// custom code to quickly remove ALL children in the whole GAME
		// @ts-ignore
		let ch = this.children.list
		for(let i = ch.length - 1; i >= 0; i--) {
			ch[i].destroy();
		}
		
		this.foregroundGroup.clear();
		this.backgroundGroup.clear();

		// draw expedition node icons at the same locations as original expedition nodes
		let expeditionNodeRadius = 0.25 * Math.min(this.cfg.cellSizeX, this.cfg.cellSizeY);

		const resExpedition = this.cfg.visualizer.resLoader.getResource("expedition_nodes");

		if(this.expeditionNodes) 
		{
			for(const n of this.expeditionNodes) 
			{
				const center = n.center
				const type = n.type;

				// show the expedition sprite (center of area, otherwise randomly rotated and stuff)
				// NOTE: These are MIRRORED on the Y-axis ( = flipped on the long edge)
				const pos = new Point(center.x*this.cfg.cellSizeX, (this.cfg.resolutionY-center.y)*this.cfg.cellSizeY);
				const op = new LayoutOperation({
					translate: pos,
					dims: new Point(2.0 * expeditionNodeRadius),
					pivot: Point.CENTER,
					rotation: this.getRandomRotation(),
					frame: this.lists.expeditionNodes[type].iconFrame
				});
				const img = imageToPhaser(resExpedition, op, this);
				this.foregroundGroup.add(img, true);
			}
		}

		// call convertCanvasToImage() again => it should add this image as well, then destroy the whole game
		this.createdSecretBoard = true;
		await this.cfg.visualizer.convertCanvasToImage(this);
	}

	getRealPos(pos:{ x: number, y: number }) : Point
	{
		const csX = this.cfg.cellSizeX, csY = this.cfg.cellSizeY
		return new Point(pos.x * csX, pos.y * csY);
	}

	getRandomRotation() : number
	{
		return Math.random() * 2 * Math.PI;
	}
}