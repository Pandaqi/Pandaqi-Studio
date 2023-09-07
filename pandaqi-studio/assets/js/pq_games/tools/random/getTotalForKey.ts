export default (obj:Record<string,any>, key:string = "prob") : number =>
{
    let sum = 0;
    for(const [elem, val] of Object.entries(obj))
    {
        if(!(key in val)) { val[key] = 1.0; }
        sum += val[key];
    }
    return sum;
}