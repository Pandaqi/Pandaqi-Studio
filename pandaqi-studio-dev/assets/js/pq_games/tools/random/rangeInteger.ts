import Bounds, { BoundsLike } from "../numbers/bounds";
import range from "./range"

export default (low:number|BoundsLike, high:number = 0) : number =>
{
    if(typeof low == "object") 
    {
        const boundsObj = new Bounds(low); 
        low = boundsObj.min;
        high = boundsObj.max;
    }
    return Math.floor(range(low, high+1));
}
