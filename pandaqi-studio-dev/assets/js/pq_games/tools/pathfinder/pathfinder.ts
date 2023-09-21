import PointGraph from "../geometry/pointGraph";
import PriorityQueue from "./priorityQueue"
import Random from "js/pq_games/tools/random/main"

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
	costFunction?:(params) => number,
	costMap?:Map<string,number>,

	forbiddenPoints?:string[],
	forbiddenLines?:string[],

	heuristic?:number,
	heuristicFunction?:(params) => number,
	heuristicDistance?:boolean
}

interface PathFindParams
{
	start?: PointGraph,
	end?: PointGraph
}

export default class PathFinder 
{
	cost:number
	costFunction: (params) => number
	costMap:Map<string, number>

	// these go via ID
	forbiddenPoints:string[]
	forbiddenLines:string[]

	heuristic:number
	heuristicFunction: (params) => number
	heuristicDistance:boolean
	neighborFunction: (point: PointGraph) => PointGraph[];

	constructor(params) 
	{ 
		this.setConfig(params);
	}

	setConfig(params:PathFinderParams)
	{
		this.cost = params.cost ?? 1;
		this.costMap = params.costMap ?? new Map();

		const defaultCostFunction = (params:Record<string,any>) => { return params.score; }
		this.costFunction = params.costFunction ?? defaultCostFunction;

		this.forbiddenPoints = params.forbiddenPoints ?? [];
		this.forbiddenLines = params.forbiddenLines ?? [];

		this.heuristic = params.heuristic ?? 0;
		const defaultHeuristicFunction = (params:Record<string,any>) => { return params.heuristic; };
		this.heuristicFunction = params.heuristicFunction ?? defaultHeuristicFunction;
		this.heuristicDistance = params.heuristicDistance ?? true;

		const defaultNeighborFunction = (point:PointGraph) => { return point.getNeighbors(); }
		this.neighborFunction = defaultNeighborFunction;
	}

	getRandomWeight(params:any)
	{
		const min = params.min ?? 0;
		const max = params.max ?? 1;
		return Random.range(min, max);
	}

	assignRandomWeights(params:any)
	{
		const map = params.map || [];
		const costMap = new Map();
		if(map.length <= 0) { return costMap; }

		for(const point of map)
		{
			const nbs = point.getNeighbors();
			for(const nb of nbs)
			{
				const id = this.getConnectionID(point, nb);
				costMap.set(id, this.getRandomWeight(params));
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

	getConnectionID(a:PointValid, b:PointValid)
	{
		return this.getID(a) + "/" + this.getID(b);
	}

	getTravelCost(from:PointValid, to:PointValid)
	{
		const id = this.getConnectionID(from, to);
		let score = (this.costMap.get(id) ?? this.cost) ?? 1;
		const params = { from: from, to: to, score: score };
		score = this.costFunction(params);
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

	getNeighbors(point:PointGraph)
	{
		return this.neighborFunction(point);
	}

	getPath(params:PathFindParams = {})
	{
		const start = params.start;
		const end = params.end;
	
		if(!start || !end) { console.error("Can't pathfind without start and end points"); return[]; }
	
		const Q = new PriorityQueue();
	
		const cameFrom = new Map();
		const costSoFar = new Map();
		const tilesChecked = new Map();
	
		Q.put(start, 0);
		const startLabel = this.getID(start);
		cameFrom.set(startLabel, null);
		costSoFar.set(startLabel, 0);
	
		let reachable = false;
		while(!Q.isEmpty()) 
		{
			const currentPoint = Q.get();
			const currentLabel = this.getID(currentPoint);
			tilesChecked.set(currentLabel, true);
		
			// stop when we've found the first "shortest route" to our destination
			const isEndPoint = (currentPoint == end);
			if(isEndPoint) { reachable = true; break; }

			const nbs = this.getNeighbors(currentPoint);
			for(const nb of nbs)
			{
				const id = this.getID(nb);
				const isForbidden = this.forbiddenPoints.includes(id);
				if(isForbidden) { continue; }

				const connID = this.getConnectionID(currentPoint, nb);
				const connectionIsForbidden = this.forbiddenLines.includes(connID);
				if(connectionIsForbidden) { continue; }

				const newCost = costSoFar.get(currentLabel) + this.getTravelCost(currentPoint, nb);

				const notVisitedYet = !costSoFar.has(id) && !tilesChecked.has(id);
				const newCostIsLower = newCost < costSoFar.get(id);
				const updateScore = notVisitedYet || newCostIsLower;
				if(!updateScore) { continue; }

				const heuristic = this.getHeuristic(currentPoint, nb, start, end);
				const tieBreaker = (1.0 + 0.01);
				const priority = newCost + heuristic + tieBreaker;
				Q.put(nb, priority);

				costSoFar.set(id, newCost);
				cameFrom.set(id, currentPoint);
			}
		}
	
		if(!reachable) { return null; }
	
		// reconstruct the path
		const path = []
		let currentPoint = end
		let isStartPoint = false;
		while(!isStartPoint) {
			path.push(currentPoint)
			currentPoint = cameFrom.get(this.getID(currentPoint));
			isStartPoint = (currentPoint == start);
		}
	
		path.push(start);
		path.reverse();
		return path
	}
}