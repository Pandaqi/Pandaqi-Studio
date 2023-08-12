export default class Cell {
	constructor(x,y)
	{
		this.x = x;
		this.y = y;
		this.letter = "";
		this.type = "";
		this.hand = [];
		this.playerNum = -1;
	}

	setLetter(val)
	{
		this.letter = val;
	}

	setType(t)
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

	setHand(num, h)
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

	isNeighborWith(cell)
	{
		return Math.abs(cell.x - this.x) <= 1 && Math.abs(cell.y - this.y) <= 1
	}
}