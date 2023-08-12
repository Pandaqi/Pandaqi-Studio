export default class Edge {
	constructor(start, end, rot)
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