import maximumValue from "./maximumValue";

export default <T>(list:T[], filter:Function = (a:T) => a) =>
{
    const maxVal:T = maximumValue(list, filter);
    const arr:T[] = [];
    for(const elem of list)
    {
        if(!filter(elem) == maxVal) { continue; }
        arr.push(elem);
    }
    return arr;
}