import getWeighted from "./getWeighted";

export default (arr:any[], desc = false) : number =>
{
    const dict = {};
    for(let i = 0; i < arr.length; i++)
    {
        let prob = i / arr.length;
        if(desc) { prob = 1.0 - prob; }
        dict[i] = { prob: prob }
    }

    const key = getWeighted(dict);
    return parseInt(key);
}