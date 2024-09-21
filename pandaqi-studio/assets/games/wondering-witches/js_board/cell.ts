import { INGREDIENTS, SPECIAL_CELLS } from "../js_shared/dict"
import Section from "./section"
import shuffle from "js/pq_games/tools/random/shuffle";
import Rectangle from "js/pq_games/tools/geometry/rectangle";
import Point from "js/pq_games/tools/geometry/point";

export default class Cell 
{
	section: Section;
	x: number;
	y: number;
	garden: Cell[];
	ingredient: number = -1;
	ingredientName: string = "";
	type: string = "";
	
	constructor(section: Section, x: number, y: number)
	{
		this.section = section;
		this.x = x;
		this.y = y;
		this.garden = null;
	}

	clear()
	{
		this.garden = null;
		this.ingredient = -1;
		this.ingredientName = "";
		this.type = "";
	}

	isEmpty()
	{
		return this.ingredientName == "" && this.type == ""
	}

	getCenterPos() : Point
	{
		const size = this.section.getCellSize();
		return new Point(
			(this.x + 0.5) * size.x,
			(this.y + 0.5) * size.y
		)
	}

	asRect() : Rectangle
	{
		const size = this.section.getCellSize();
		return new Rectangle().fromTopLeft(
			new Point(this.x * size.x, this.y * size.y),
			size,
		);
	}

	setGarden(g: Cell[]) { this.garden = g; }
	hasGarden() { return this.garden != null; }

	setType(tp: string) { this.type = tp; }
	getType() { return this.type; }
	getTypeAsFrame() { 
		return SPECIAL_CELLS[this.getType()].frame;
	}

	setIngredient(i: number) { this.ingredient = i; this.ingredientName = Object.keys(INGREDIENTS)[i]; }
	getIngredient() { return this.ingredient; }
	getIngredientAsFrame() {
		return INGREDIENTS[this.ingredientName];
	}

	// if there was NO cell from the same garden on this side, draw a border
	getBorderNeighbours()
	{
		const dirs = [[1,0], [0,1], [-1,0], [0,-1]];
		const arr = [];
		for(const dir of dirs)
		{
			const nbX = this.x + dir[0];
			const nbY = this.y + dir[1];

			let foundCell = null;
			for(const otherCell of this.garden)
			{
				if(otherCell == this) { continue; }
				if(!(otherCell.x == nbX && otherCell.y == nbY)) { continue; }
				foundCell = otherCell;
			}

			if(!foundCell) { arr.push(null); }
			else { arr.push(foundCell); }
		}

		return arr;
	}

	getValidNeighbors()
	{
		const dirs = shuffle( [[1,0], [0,1], [-1,0], [0,-1]] );
		const arr = [];
		for(const dir of dirs) {
			const x = this.x + dir[0];
			const y = this.y + dir[1];

			if(this.section.outOfBounds(x,y)) { continue; }

			const cell = this.section.getCellGlobal(x, y);
			if(cell.hasGarden()) { continue; }

			arr.push(cell);
		}
		return arr;
	}
}