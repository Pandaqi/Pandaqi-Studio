import shuffle from "./shuffle"
import getTotalForKey from "./getTotalForKey"

export default (obj:Record<string,any>, key = "prob", RNG = Math.random) : string =>
{
    const isArray = Array.isArray(obj);
    const typesObject = obj;
    const totalProb = getTotalForKey(typesObject, key);
    const probFraction = 1.0 / totalProb;
    const targetRand = RNG();
    let runningSum = 0.0;
    let counter = 0;
    let lastElem = "";

    let typesList = Object.keys(typesObject);
    if(isArray) { typesList = obj; }

    shuffle(typesList); // to prevent order accidentally playing ANY role
    while(runningSum < targetRand)
    {
        const newElem = typesList[counter];
        counter++;

        let prob = 1.0;
        if(isArray) { 
            prob = newElem[key] ?? 1;
        } else { 
            prob = typesObject[newElem][key] ?? 1; 
        }
        if(prob <= 0) { continue; }

        runningSum += prob * probFraction;
        lastElem = newElem;
    }

    return lastElem;
}