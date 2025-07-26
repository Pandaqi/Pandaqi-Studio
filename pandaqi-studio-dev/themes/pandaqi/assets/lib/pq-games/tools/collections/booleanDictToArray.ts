export default (dict:Record<string,boolean>) =>
{   
    const arr = [];
    for(const [key,val] of Object.entries(dict))
    {
        if(!val) { continue; }
        arr.push(key);
    }
    return arr;
}