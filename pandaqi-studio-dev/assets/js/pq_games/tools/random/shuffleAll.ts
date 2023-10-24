import shuffle from "./shuffle";

export default (val:Record<string,any>, RNG = Math.random) =>
{
    for(const [key,data] of Object.entries(val))
    {
        shuffle(data, RNG);
    }
    return val;
}