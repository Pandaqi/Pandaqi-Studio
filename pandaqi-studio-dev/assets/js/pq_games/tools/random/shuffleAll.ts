import shuffle from "./shuffle";

const shuffleAll = (val:Record<string,any>, RNG = Math.random) =>
{
    for(const [key,data] of Object.entries(val))
    {
        if(typeof data == "object") { shuffleAll(data); }
        else { shuffle(data, RNG); }
    }
    return val;
}
export default shuffleAll;