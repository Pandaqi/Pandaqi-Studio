import maximumValue from "./maximumValue";

export default (list:any[], filter:Function = (a) => a) =>
{
    const maxVal = maximumValue(list, filter);
    const arr = [];
    for(const elem of list)
    {
        if(!filter(elem) == maxVal) { continue; }
        arr.push(elem);
    }
    return arr;
}