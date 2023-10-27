import LineGraph from "../geometry/lineGraph";
import PointGraph from "../geometry/pointGraph";
import PriorityQueue from "./priorityQueue"
import Random from "js/pq_games/tools/random/main"

// @TODO: Improve parameters/types/input for heuristicFunction


interface PointValid 
{
	id?: number|string,
	x?: number,
	y?: number,
	gridPos?: { x:number, y:number }
}

interface PathFinderParams
{
	cost?:number,
	costFunction?:(l:LineGraph, score:number) => number,
	costMap?:Map<LineGraph|string,number>,

	forbiddenPoints?:PointGraph[]|string[],
	forbiddenLines?:LineGraph[]|string[],

	heuristic?:number,
	heuristicFunction?:(params) => number,
	heuristicDistance?:boolean,

	connectionFunction?: (point:PointGraph) => LineGraph[] | PointGraph[]
}

interface PathFindParams
{
	start?: PointGraph,
	end?: PointGraph
}

interface PathFindRandomizeParams
{
	points: any[],
	min?: number,
	max?: number
}

// By default, PathFinder expects PointGraph elements and uses their automatically created LineGraph connections
// But if it receives a PointGraph for the connection list instead, it falls back on assigning unique string IDs to store data
// (And the function for cost, A* heuristic, and where to get connections from can be set any way you like)
export default class PathFinder 
{
	cost:number
	costFunction: (l:LineGraph, score:number) => number
	costMap:Map<LineGraph|string, number>

	forbiddenPoints:(PointGraph|string)[]
	forbiddenLines:(LineGraph|string)[]

	heuristic:number
	heuristicFunction: (params) => number
	heuristicDistance:boolean
	connectionFunction: (point: PointGraph) => LineGraph[] | PointGraph[];

	constructor(params:PathFinderParams = {}) 
	{ 
		this.setConfig(params);
	}

	setConfig(params:PathFinderParams)
	{
		this.cost = params.cost ?? 1;
		this.costMap = params.costMap ?? new Map();

		const defaultCostFunction = (l:LineGraph, score:number) => { return score; }
		this.costFunction = params.costFunction ?? defaultCostFunction;

		this.forbiddenPoints = params.forbiddenPoints ?? [];
		this.forbiddenLines = params.forbiddenLines ?? [];

		this.heuristic = params.heuristic ?? 0;
		const defaultHeuristicFunction = (params:Record<string,any>) => { return params.heuristic; };
		this.heuristicFunction = params.heuristicFunction ?? defaultHeuristicFunction;
		this.heuristicDistance = params.heuristicDistance ?? true;

		const defaultConnectionFunction = (point:PointGraph) => { return point.getConnectionsByLine(); }
		this.connectionFunction = params.connectionFunction ?? defaultConnectionFunction;
	}

	getRandomWeight(params:any)
	{
		const min = params.min ?? 0;
		const max = params.max ?? 1;
		return Random.range(min, max);
	}

	assignRandomWeights(params:PathFindRandomizeParams)
	{
		const points = params.points;
		const costMap = new Map();
		if(points.length <= 0) { return costMap; }

		for(const point of points)
		{
			const nbLines = this.getConnectionsForPoint(point);
			for(const nbLine of nbLines)
			{
				costMap.set(this.getConnectionKey(point, nbLine), this.getRandomWeight(params));
			}
		}

		return costMap;
	}

	getID(point:PointValid) : string
	{
		if("id" in point) { return point.id.toString(); }
		if("gridPos" in point) { return point.gridPos.x + "-" + point.gridPos.y; }
		return Math.round(point.x*10)/10 + "-" + Math.round(point.y*10)/10;
	}

	getConnectionKey(from:PointGraph, to:LineGraph|PointGraph) : LineGraph|string
	{
		if(to instanceof PointGraph) { return this.getConnectionID(from, to); }
		return to;
	}

	getConnectionID(a:PointValid, b:PointValid)
	{
		return this.getID(a) + "/" + this.getID(b);
	}

	getTravelCost(l:LineGraph|string, from?:PointGraph, to?:PointGraph)
	{
		let score = (this.costMap.get(l) ?? this.cost) ?? 1;
		if(!(l instanceof LineGraph)) 
		{ 
			l = new LineGraph(from, to);
			l.hashID = this.getConnectionID(from, to); 
		}
		score = this.costFunction(l, score);
		return score;
	}

	getHeuristic(from:PointValid, to:PointValid, start:PointValid, end:PointValid)
	{
		let heuristic = this.heuristic;

		// the A* heuristic that makes it fast
		if(this.heuristicDistance)
		{
			const dX = Math.abs(to.x - end.x);
			const dY = Math.abs(to.y - end.y);
			heuristic = (dX + dY);
		}

		const params = { from: from, to: to, start: start, end: end, heuristic: heuristic };
		heuristic = this.heuristicFunction(params)
		return heuristic;
	}

	getConnectionsForPoint(point:PointGraph)
	{
		return this.connectionFunction(point);
	}

	getPath(params:PathFindParams = {})
	{
		const start = params.start;
		const end = params.end;
	
		if(!start || !end) 
		{ 
			console.error("PathFinder: Can't pathfind without start and end points"); 
			return []; 
		}
	
		const Q = new PriorityQueue();
	
		const cameFrom = new Map();
		const costSoFar = new Map();
		const tilesChecked = new Map();
	
		Q.put(start, 0);
		cameFrom.set(start, null);
		costSoFar.set(start, 0);
	
		let reachable = false;
		while(!Q.isEmpty()) 
		{
			const currentPoint = Q.get();
			tilesChecked.set(currentPoint, true);
		
			// stop when we've found the first "shortest route" to our destination
			const isEndPoint = (currentPoint == end);
			if(isEndPoint) { reachable = true; break; }

			const nbLines = this.getConnectionsForPoint(currentPoint);
			for(const nbLine of nbLines)
			{
				const nb = nbLine instanceof PointGraph ? nbLine : (nbLine.getOther(currentPoint) as PointGraph);
				const isForbidden = this.forbiddenPoints.includes(nb);
				if(isForbidden) { continue; }

				const connKey = this.getConnectionKey(currentPoint, nbLine);
				const connectionIsForbidden = this.forbiddenLines.includes(connKey);
				if(connectionIsForbidden) { continue; }

				const newCost = costSoFar.get(currentPoint) + this.getTravelCost(connKey, currentPoint, nb);
				if(!isFinite(newCost)) { continue; }

				const notVisitedYet = !costSoFar.has(nb) && !tilesChecked.has(nb);
				const newCostIsLower = newCost < costSoFar.get(nb);
				const updateScore = notVisitedYet || newCostIsLower;
				if(!updateScore) { continue; }

				const heuristic = this.getHeuristic(currentPoint, nb, start, end);
				const tieBreaker = (1.0 + 0.01);
				const priority = newCost + heuristic + tieBreaker;
				Q.put(nb, priority);

				costSoFar.set(nb, newCost);
				cameFrom.set(nb, currentPoint);
			}
		}
	
		if(!reachable) 
		{ 
			console.error("PathFinder finds no path between ", start, " and ", end); 
			return []; 
		}
	
		// reconstruct the path
		const path = []
		let currentPoint = end
		let isStartPoint = false;
		while(!isStartPoint) {
			path.push(currentPoint)
			currentPoint = cameFrom.get(currentPoint);
			isStartPoint = (currentPoint == start);
		}
	
		path.push(start);
		path.reverse();
		return path
	}
}