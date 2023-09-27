export default (list:any[], filter:Function = (a) => a) : any =>
{
    let maxVal = -Infinity;
    for(const elem of list)
    {
        const val = filter(elem);
        maxVal = Math.max(maxVal, val);
    }
    return maxVal
}