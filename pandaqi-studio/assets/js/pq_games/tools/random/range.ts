import Bounds, { BoundsLike } from "../numbers/bounds";

export default (low:number|BoundsLike, high:number = 0, RNG = Math.random) : number =>
{
    if(typeof low == "object") 
    {
        const boundsObj = new Bounds(low); 
        low = boundsObj.min;
        high = boundsObj.max;
    }
    return RNG()*(high-low) + low;
}