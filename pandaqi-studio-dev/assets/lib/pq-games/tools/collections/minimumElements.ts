import minimumValue from "./minimumValue";

export default <T>(list:T[], filter:Function = (a:T) => a) =>
{
    const maxVal:T = minimumValue(list, filter);
    const arr:T[] = [];
    for(const elem of list)
    {
        if(!filter(elem) == maxVal) { continue; }
        arr.push(elem);
    }
    return arr;
}