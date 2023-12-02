import Shape, { PathLike } from "../shape";

export default (path:PathLike) =>
{
    if(path instanceof Shape) { path = path.toPath(); }

    let sum = 0;
    for(let i = 0; i < (path.length-1); i++)
    {
        sum += path[i].distTo(path[i+1]);
    }
    return sum;
}