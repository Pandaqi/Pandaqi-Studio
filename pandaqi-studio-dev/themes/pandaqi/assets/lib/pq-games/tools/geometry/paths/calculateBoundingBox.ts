import Dims from "../dims";
import Shape, { PathLike } from "../shape";

// @TODO: this is untested, might be wrong?
export default (path:PathLike) : Dims =>
{
    if(path instanceof Shape) { path = path.toPath(); }

    const dims = new Dims();
    for(const point of path)
    {
        dims.takePointIntoAccount(point);
    }
    return dims;
}