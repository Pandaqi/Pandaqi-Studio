import Dims from "../dims"
import Point from "../point"
import Shape, { PathLike } from "../shape";
import movePath from "../transform/movePath";
import scalePath from "../transform/scalePath";
import calculateCenter from "./calculateCenter";

export default (path:PathLike, dimsNew:Dims, keepRatio = true) =>
{
    if(path instanceof Shape) { path = path.toPath(); }

    const dimsOriginal = new Dims().fromPoints(path);
    let scaleFactor = dimsNew.getSize().div(dimsOriginal.getSize());
    if(keepRatio)
    {
        scaleFactor = new Point(Math.min(scaleFactor.x, scaleFactor.y));
    }

    const pathScaled = scalePath(path, scaleFactor);
    const neededOffset = dimsNew.getPosition().sub(calculateCenter(pathScaled));
    const pathMoved = movePath(pathScaled, neededOffset);
    return pathMoved;
}