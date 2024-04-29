export default class Sequence
{
    type: string;
    length: number;
    distToSeat: number;

    constructor(type = "lionsyre", length = 0, distToSeat = 0)
    {
        this.type = type;
        this.length = length;
        this.distToSeat = distToSeat;
    }

    getDistToSeat() { return this.distToSeat; }

    getType() { return this.type; }
    setType(t:string) { this.type = t; }

    getLength() { return this.length; }
    addLength(dl:number)
    {
        this.length += dl;
    }

    
}