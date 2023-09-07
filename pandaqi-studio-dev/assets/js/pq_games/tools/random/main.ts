import seedrandom from "./seedrandom";
import shuffle from "./shuffle"
import range from "./range"
import rangeInteger from "./rangeInteger"
import getTotalForKey from "./getTotalForKey"
import getWeighted from "./getWeighted"
import fromArray from "./fromArray"

export default {
    seedRandom(seedString:string) { return seedrandom(seedString); },
    shuffle: shuffle,
    fromArray: fromArray,
    range: range,
    rangeInteger: rangeInteger,
    getTotalForKey: getTotalForKey,
    getWeighted: getWeighted,
}