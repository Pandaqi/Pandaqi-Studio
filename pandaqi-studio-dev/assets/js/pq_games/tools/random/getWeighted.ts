import shuffle from "./shuffle"
import getTotalForKey from "./getTotalForKey"

export default (obj:Record<string,any>, key = "prob", RNG = Math.random) : string =>
{
    // sanitize the input (remove probabilites 0 or lower)
    // @NOTE: unfortunately, for now I have to do this, because many old games of mine used that trick to ignore things temporarily when random drawing :/
    const copy = Object.assign({}, obj);
    for(const [objectKey,value] of Object.entries(copy))
    {
        if(value[key] && value[key] <= 0)
        {
            delete copy[objectKey];
        }
    }

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
        lastElem = typesList[counter];
        if(isArray) { runningSum += lastElem[key] * probFraction; }
        else { runningSum += (typesObject[lastElem][key] ?? 1) * probFraction; }
        counter += 1;
    }

    return lastElem;
}