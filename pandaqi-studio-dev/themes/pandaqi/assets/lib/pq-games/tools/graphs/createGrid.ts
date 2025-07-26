import Point from "../geometry/point";

export default (dims:Point, callback:Function) =>
{
    const grid = [];
    for(let x = 0; x < dims.x; x++)
    {
        grid[x] = [];
        for(let y = 0; y < dims.y; y++)
        {
            grid[x][y] = callback(new Point(x,y));
        }
    }
    return grid;
}