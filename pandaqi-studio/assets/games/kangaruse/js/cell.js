export default class Cell
{
    constructor(x = 0, y = 0)
    {
        this.x = x;
        this.y = y;
        this.type = null;
    }

    setType(t) { this.type = t; }
    getType() { return this.type; }
    hasType() { return this.type !== null; }
}