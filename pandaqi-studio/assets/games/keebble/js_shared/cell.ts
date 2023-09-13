export default class Cell 
{
	x: number;
	y: number;
	letter: string;
	type: string;
	hand: string[];
	playerNum: number;

	constructor(x: number,y: number)
	{
		this.x = x;
		this.y = y;
		this.letter = "";
		this.type = "";
		this.hand = [];
		this.playerNum = -1;
	}

	setLetter(val: string)
	{
		this.letter = val;
	}

	setType(t: string)
	{
		this.type = t;
	}

	getLetter()
	{
		return this.letter;
	}

	getType()
	{
		return this.type;
	}

	setHand(num: number, h: string[])
	{
		this.playerNum = num;
		this.hand = h;
	}

	getPlayerNum()
	{
		return this.playerNum;
	}

	hasHand()
	{
		return this.hand.length > 0;
	}

	getHand()
	{
		return this.hand;
	}

	getHandAsText()
	{
		return this.hand.join(" ");
	}
	
	isEmpty()
	{
		return !this.letter && !this.type && !this.hasHand();
	}

	isNeighborWith(cell: { x: number; y: number; })
	{
		return Math.abs(cell.x - this.x) <= 1 && Math.abs(cell.y - this.y) <= 1
	}
}