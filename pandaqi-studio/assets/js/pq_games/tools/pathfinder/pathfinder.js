import PriorityQueue from "./priorityQueue"
import Random from "js/pq_games/tools/random/main"

const baseCfg = {
	cost: 1,
	costFunction: (params) => { return params.score; },
	costMap: new Map(),
	forbiddenPoints: [], // goes via ID
	forbiddenLines: [], // goes via ID
	heuristic: 0,
	heuristicFunction: (params) => { return params.heuristic; },
	heuristicDistance: true
}

export default class Pathfinder {
	constructor() { this.baseCfg = baseCfg; this.setConfig(); }

	getRandomWeight(params)
	{
		const min = params.min || 0;
		const max = params.max || 1;
		return Random.range(min, max);
	}

	assignRandomWeights(params)
	{
		const map = params.map || [];
		const costMap = new Map();
		if(map.length <= 0) { return costMap; }

		for(const point of map)
		{
			const nbs = point.getNeighbours();
			for(const nb of nbs)
			{
				const id = this.getConnectionID(point, nb);
				costMap.set(id, this.getRandomWeight(params));
			}
		}

		return costMap;
	}

	setConfig(params = {}) 
	{ 
		const configCopy = Object.assign({}, this.baseCfg);
		this.cfg = Object.assign(configCopy, params);
		return this;
	}

	getID(point)
	{
		if("id" in point) { return point.id; }
		if("gridPos" in point) { return point.gridPos.x + "-" + point.gridPos.y; }
		return Math.round(point.x*10)/10 + "-" + Math.round(point.y*10)/10;
	}

	getConnectionID(a,b)
	{
		return this.getID(a) + "/" + this.getID(b);
	}

	getTravelCost(from, to)
	{
		const id = this.getConnectionID(from, to);
		let score = (this.cfg.costMap.get(id) || this.cfg.cost) || 1;
		const params = { from: from, to: to, score: score };
		score = this.cfg.costFunction(params);
		return score;
	}

	getHeuristic(from, to, start, end)
	{
		let heuristic = this.cfg.heuristic;

		// the A* heuristic that makes it fast
		if(this.cfg.heuristicDistance)
		{
			const dX = Math.abs(to.x - end.x);
			const dY = Math.abs(to.y - end.y);
			let heuristic = (dX + dY);
		}

		const params = { from: from, to: to, start: start, end: end, heuristic: heuristic };
		heuristic = this.cfg.heuristicFunction(params)
		return heuristic;
	}

	getPath(params)
	{
		const start = params.start || null;
		const end = params.end || null;
	
		if(!start || !end) { return console.error("Can't pathfind without start and end points"); }
	
		const Q = new PriorityQueue();
	
		const cameFrom = new Map();
		const costSoFar = new Map();
		const tilesChecked = new Map();
	
		Q.put(start, 0);
		const startLabel = this.getID(start);
		cameFrom.set(startLabel, null);
		costSoFar.set(startLabel, 0);
	
		let reachable = false;
		while(!Q.isEmpty()) {
			const currentPoint = Q.get();
			const currentLabel = this.getID(currentPoint);
			tilesChecked.set(currentLabel, true);
		
			// stop when we've found the first "shortest route" to our destination
			const isEndPoint = (currentPoint == end);
			if(isEndPoint) { reachable = true; break; }

			const nbs = currentPoint.getNeighbours();
			for(const nb of nbs)
			{
				const id = this.getID(nb);
				const isForbidden = this.cfg.forbiddenPoints.includes(id);
				if(isForbidden) { continue; }

				const connID = this.getConnectionID(currentPoint, nb);
				const connectionIsForbidden = this.cfg.forbiddenLines.includes(connID);
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