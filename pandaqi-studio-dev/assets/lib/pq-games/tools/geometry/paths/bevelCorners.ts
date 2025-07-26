import Point from "../point";
import Shape, { PathLike } from "../shape";

export default (path:PathLike, bevelSize:number) =>
{
    if(path instanceof Shape) { path = path.toPath(); }

    const pathBeveled = [];
    for(let i = 0; i < path.length; i++)
    {
        const curPos = path[i];
        const nextPos = path[(i + 1) % path.length];
        const prevPos = path[(i - 1 + path.length) % path.length];
        const vecNext = curPos.vecTo(nextPos).normalize();
        const vecPrev = curPos.vecTo(prevPos).normalize();
        
        // first the one coming TO us (from previous point), then the one LEAVING us
        // otherwise order is messed up
        const pos1 = curPos.clone().move(vecPrev.scaleFactor(bevelSize));
        const pos2 = curPos.clone().move(vecNext.scaleFactor(bevelSize));

        pathBeveled.push(pos1);
        pathBeveled.push(pos2);
    }
    return pathBeveled;
}