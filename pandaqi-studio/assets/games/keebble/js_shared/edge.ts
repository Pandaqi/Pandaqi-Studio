import Point from "js/pq_games/tools/geometry/point";

export default class Edge 
{
	start: Point;
	end: Point;
	rotation: number;
	
	constructor(start: Point, end: Point, rot: number)
	{
		this.start = start;
		this.end = end;
		this.rotation = rot;
	}

	getCenterPos()
	{
		return {
			x: 0.5 * (this.start.x + this.end.x),
			y: 0.5 * (this.start.y + this.end.y)
		}
	}

	getRotation()
	{
		return this.rotation;
	}
}