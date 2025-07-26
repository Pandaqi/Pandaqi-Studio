export default <T>(obj:Record<string,T>, key:string = "prob") : number =>
{
    let sum = 0;
    for(const val of Object.values(obj))
    {
        sum += (val[key] ?? 1.0);
    }
    return sum;
}