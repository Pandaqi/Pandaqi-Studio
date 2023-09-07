
export default (lowData:number|{ min: number, max: number} , high:number = 0) : number =>
{
    let low = lowData
    if(typeof lowData == "object") { low = lowData.min; high = lowData.max; }
    low = low as number
    return Math.random()*(high-low) + low;
}