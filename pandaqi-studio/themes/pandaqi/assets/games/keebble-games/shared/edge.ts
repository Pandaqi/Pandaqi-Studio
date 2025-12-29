import { Vector2 } from "lib/pq-games";

export default class Edge 
{
	start: Vector2;
	end: Vector2;
	rot: number;
	
	constructor(start: Vector2, end: Vector2, rot: number)
	{
		this.start = start;
		this.end = end;
		this.rot = rot;
	}

	getCenterPos()
	{
		return new Vector2(
			0.5 * (this.start.x + this.end.x),
			0.5 * (this.start.y + this.end.y)
		);
	}

	getRotation()
	{
		return this.rot;
	}
}