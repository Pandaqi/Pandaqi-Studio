import minimumValue from "./minimumValue";

export default (list:any[], filter:Function = (a) => a) =>
{
    const maxVal = minimumValue(list, filter);
    const arr = [];
    for(const elem of list)
    {
        if(!filter(elem) == maxVal) { continue; }
        arr.push(elem);
    }
    return arr;
}