import range from "./range"

export default (lowData:number|{ min:number, max:number }, high:number = 0) : number =>
{
    let low = lowData
    if(typeof lowData == "object") { low = lowData.min; high = lowData.max; }

    return Math.floor(range(low, high+1));
}
