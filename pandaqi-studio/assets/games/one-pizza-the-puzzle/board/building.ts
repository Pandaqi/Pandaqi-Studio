export default class Building
{
    tiles = []
    borders = []
    index = -1
    streetConnection = false
    streetDirs = [0,0,0,0]
    empty = true
    type = ""
    numEntrances = 0

    ingredient = null
    order = null
    special = null
    centerCellData = null

    sideDishes = []

    setType(t:string)
    {
        this.type = t;
    }

    setIndex(i:number)
    {
        this.index = i;
    }

    reset() 
    { 
        this.tiles = []; 
    }
}