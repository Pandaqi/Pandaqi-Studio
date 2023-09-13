import DominoPart from "./dominoPart"

export default class Domino 
{
    sides: DominoPart[];

    constructor()
    {
        this.sides = [null,null];
    }

    getSide(idx: number)
    {
        return this.sides[idx];
    }

    sideEmpty(idx: number)
    {
        return !this.sides[idx];
    }

    setSideTo(idx: number, type: string, value: string)
    {
        this.sides[idx] = new DominoPart(type, value);
    }

    isFull()
    {
        return !this.sideEmpty(0) && !this.sideEmpty(1);
    }

    setEmptySideTo(type: any, value: any)
    {
        let idx = Math.floor(Math.random() * 2);
        if(this.sideEmpty(idx))
        {
            this.setSideTo(idx, type, value);
            return true;
        }

        idx = (idx + 1) % 2;
        if(this.sideEmpty(idx))
        {
            this.setSideTo(idx, type, value);
            return true;
        }

        return false;
    }
}
