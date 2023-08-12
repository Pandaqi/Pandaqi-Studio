import Cell from "./cell"
import { Geom } from "js/pq_games/phaser.esm"

export default class Section {
	constructor(cfg, x,y,width,height)
	{
		this.cfg = cfg;
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.createGrid();
	}

	asRect()
	{
		const size = this.getCellSize();
		return new Geom.Rectangle(
			this.x * size.width, 
			this.y * size.height, 
			this.width * size.width, 
			this.height * size.height
		);
	}

	outOfBounds(x,y)
	{
		return x < this.x || x >= (this.x + this.width) || y < this.y || y >= (this.y + this.height);
	}

	getCellSize() { return { width: this.cfg.rectWidth, height: this.cfg.rectHeight }; }
	getCellGlobal(x,y) { return this.getCellLocal(x - this.x, y - this.y); }
	getCellLocal(x,y) { return this.grid[x][y]; }

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

	getTilesFlat(onlyEmpty = false)
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
}