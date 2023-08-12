import DominoPart from "./dominoPart"

export default class Domino {
    constructor()
    {
        this.sides = [null,null];
    }

    getSide(idx)
    {
        return this.sides[idx];
    }

    sideEmpty(idx)
    {
        return !this.sides[idx];
    }

    setSideTo(idx, type, value)
    {
        this.sides[idx] = new DominoPart(type, value);
    }

    isFull()
    {
        return !this.sideEmpty(0) && !this.sideEmpty(1);
    }

    setEmptySideTo(type, value)
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
