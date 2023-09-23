import Point from "../point";

export default (path:Point[]) =>
{
    let sum = 0;
    for(let i = 0; i < (path.length-1); i++)
    {
        sum += path[i].distTo(path[i+1]);
    }
    return sum;
}