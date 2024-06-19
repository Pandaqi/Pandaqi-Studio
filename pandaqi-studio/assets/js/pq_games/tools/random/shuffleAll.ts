import shuffle from "./shuffle";

const shuffleAll = <T>(val:T, RNG = Math.random) : T =>
{
    if(!Object.keys(val)) { console.error("Can't shuffle (all) this value", val); return val; }

    for(const [key,data] of Object.entries(val))
    {
        if(Array.isArray(data)) { shuffle(data, RNG); }
        else { shuffleAll(data, RNG); }
    }
    return val;
}
export default shuffleAll;