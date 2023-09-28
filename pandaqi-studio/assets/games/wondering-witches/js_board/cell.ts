import { INGREDIENTS, SPECIAL_CELLS } from "../js_shared/dict"
import Random from "js/pq_games/tools/random/main"
// @ts-ignore
import { Geom } from "js/pq_games/phaser/phaser.esm"
import Section from "./section"

export default class Cell 
{
	section: Section;
	x: number;
	y: number;
	garden: Cell[];
	ingredient: string;
	type: string;
	ingredientName: string;
	
	constructor(section: Section, x: number,y: number)
	{
		this.section = section;
		this.x = x;
		this.y = y;
		this.garden = null;
		this.ingredient = null;
		this.type = null;
	}

	isEmpty()
	{
		return this.ingredient == null && this.type == null
	}

	getCenterPos()
	{
		const size = this.section.getCellSize();
		return {
			x: (this.x + 0.5) * size.x,
			y: (this.y + 0.5) * size.y
		}
	}

	asRect()
	{
		const size = this.section.getCellSize();
		return new Geom.Rectangle(
			this.x * size.x, 
			this.y * size.y, 
			size.x, 
			size.y
		);
	}

	setGarden(g: Cell[]) { this.garden = g; }
	hasGarden() { return this.garden != null; }

	setType(tp: string) { this.type = tp; }
	getType() { return this.type; }
	getTypeAsFrame() { 
		return SPECIAL_CELLS[this.getType()].frame;
	}

	setIngredient(i: string) { this.ingredient = i; this.ingredientName = Object.keys(INGREDIENTS)[i]; }
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
		const dirs = Random.shuffle( [[1,0], [0,1], [-1,0], [0,-1]] );
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