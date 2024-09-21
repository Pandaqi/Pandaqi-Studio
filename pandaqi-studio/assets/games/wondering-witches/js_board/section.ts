import Point from "js/pq_games/tools/geometry/point";
import Cell from "./cell"
import Rectangle from "js/pq_games/tools/geometry/rectangle";

export default class Section 
{
	cfg: Record<string,any>;
	x: number;
	y: number;
	width: number;
	height: number;
	grid: Cell[][];

	constructor(cfg: Record<string, any>, x: number,y: number,width: number,height: number)
	{
		this.cfg = cfg;
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.createGrid();
	}

	asRect() : Rectangle
	{
		const size = this.getCellSize();
		return new Rectangle().fromTopLeft(
			new Point(this.x * size.x, this.y * size.y),
			new Point(this.width * size.x, this.height * size.y)
		);
	}

	outOfBounds(x: number,y: number)
	{
		return x < this.x || x >= (this.x + this.width) || y < this.y || y >= (this.y + this.height);
	}

	getCellSize() { return new Point(this.cfg.rectWidth, this.cfg.rectHeight); }
	getCellGlobal(x:number, y:number) { return this.getCellLocal(x - this.x, y - this.y); }
	getCellLocal(x:number, y:number) { return this.grid[x][y]; }

	createGrid()
	{
		this.grid = [];
		for(var x = 0; x < this.width; x++) {
			this.grid[x] = [];

			for(var y = 0; y < this.height; y++) {
				const c = new Cell(this, this.x + x, this.y + y);
				this.grid[x][y] = c;
			}
		}
	}

	getTilesGrid()
	{
		return this.grid;
	}

	getTilesFlat(onlyEmpty = false) : Cell[]
	{
		const arr = this.grid.flat();
		for(let i = arr.length-1; i >= 0; i--)
		{
			if(onlyEmpty && !arr[i].isEmpty()) {
				arr.splice(i, 1);
			}
		}
		return arr;
	}

	clear()
	{
		const arr = this.getTilesFlat();
		for(const cell of arr)
		{
			cell.clear();
		}
	}
}