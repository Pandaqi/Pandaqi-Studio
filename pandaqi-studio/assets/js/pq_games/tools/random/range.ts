import Bounds, { BoundsLike } from "../numbers/bounds";

export default (low:number|BoundsLike, high:number = 0) : number =>
{
    if(typeof low == "object") 
    {
        const boundsObj = new Bounds(low); 
        low = boundsObj.min;
        high = boundsObj.max;
    }
    return Math.random()*(high-low) + low;
}