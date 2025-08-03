import shuffle from "js/pq_games/tools/random/shuffle";
import { CONFIG } from "../shared/config";
import { ATTRACTIONS, CHALLENGES, COASTER_PARTS, DECORATIONS, DominoType, EVENTS, ITEMS, ItemType, PATHS, PathType, STALLS } from "../shared/dict";
import Domino from "./domino";
import DominoSide from "./dominoSide";
import getWeighted from "js/pq_games/tools/random/getWeighted";

export const dominoPicker = () : Domino[] =>
{
    const dominoes = [];

    generatePawns(dominoes);

    const dominoExpansions = ["base", "wishneyland", "unibearsal", "rollercoasters"]
    for(const exp of dominoExpansions)
    {
        if(!CONFIG.sets[exp]) { continue; }
        generateDominoes(dominoes, exp);
    }

    generateRollercooper(dominoes);

    return dominoes;
}

const filterBySet = (dict:Record<string,any>, targetSet:string) =>
{
    const arr = [];
    for(const [key,data] of Object.entries(dict))
    {
        const set = data.set ?? "base";
        if(set != targetSet) { continue; }
        arr.push(key);
    }
    return arr;
}

const generateRollercooper = (dominoes:Domino[]) =>
{
    if(!CONFIG.sets.rollercooper) { return; }

    const num = CONFIG.generation.rollercooper.numCards;
    for(let i = 0; i < num; i++)
    {
        const event = getWeighted(EVENTS);
        const challenge = getWeighted(CHALLENGES);

        const d = new Domino(DominoType.EVENT);
        d.setEvent(event, challenge);
        dominoes.push(d);
    }

}

const generatePawns = (dominoes:Domino[]) =>
{
    if(!CONFIG.sets.pawns) { return; }

    for(let i = 0; i < CONFIG.generation.numUniquePawns; i++)
    {
        for(let j = 0; j < CONFIG.generation.numPawnsPerPlayer; j++)
        {
            const d = new Domino(DominoType.PAWN);
            d.setPawnIndex(i);
            dominoes.push(d);
        }
    }
}

const generateDominoes = (dominoes:Domino[], set:string) =>
{
    if(!CONFIG.sets[set]) { return; }

    const numDominoes = CONFIG.generation.numDominoes[set];
    const numSquares = numDominoes * 2;
    const useCoasters = (set == "rollercoasters");

    // add the required entrance tile with just open paths everywhere
    if(set == "base")
    {
        const entranceDomino = new Domino(DominoType.REGULAR);
        entranceDomino.entrance = true;
            
        const side = new DominoSide(ItemType.PATH);
        side.setPathType(PathType.REGULAR);
        side.setPathKey("all");
        entranceDomino.setSides(side, side);
        dominoes.push(entranceDomino);
    }

    const fullDict = {};
    Object.assign(fullDict, ATTRACTIONS);
    Object.assign(fullDict, DECORATIONS);
    Object.assign(fullDict, STALLS);

    const availableAttractions = filterBySet(ATTRACTIONS, set);
    const availableDecorations = filterBySet(DECORATIONS, set);
    const availableStalls = filterBySet(STALLS, set);
    const fullAvailable = [availableAttractions, availableDecorations, availableStalls].flat();

    const emptyPathValue = CONFIG.generation.emptyPathValue; // the number of empty path tiles we want
    const coasterPartValue = useCoasters ? CONFIG.generation.coasterPartValue : -1;

    // calculate total numbers, so we can get accurate percentages for all
    let totalValue = (1.0 / emptyPathValue);
    if(coasterPartValue > 0) { totalValue += (1.0 / coasterPartValue); }

    for(const elem of fullAvailable)
    {
        totalValue += 1.0 / (fullDict[elem].value ?? 1);
    }
    const percentageMultiplier = (1.0 / totalValue);

    const findElementType = (elem) : ItemType =>
    {
        for(const [key,data] of Object.entries(ITEMS))
        {
            if(data[elem]) { return key as ItemType; }
        }
    }

    // get the list of all options
    // all the special types
    const options:DominoSide[] = [];
    for(const elem of fullAvailable)
    {
        const perc = 1.0 / (fullDict[elem].value ?? 1) * percentageMultiplier;
        const freq = Math.ceil(perc * numSquares);
        const type = findElementType(elem);
        for(let i = 0; i < freq; i++)
        {
            const ds = new DominoSide(type);
            ds.setKey(elem);
            options.push(ds);
        }
    }

    // all the empty paths
    const percEmptyPath = 1.0 / emptyPathValue * percentageMultiplier;
    const freqEmptyPath = Math.ceil(percEmptyPath * numSquares);
    addAllPathsFrom(freqEmptyPath, CONFIG.generation.frequencies.pathType, PATHS, options);

    // all rollercoaster parts
    if(useCoasters)
    {
        const percCoasterPart = 1.0 / coasterPartValue * percentageMultiplier;
        const freqCoasterPart = Math.ceil(percCoasterPart * numSquares);
        addAllPathsFrom(freqCoasterPart, CONFIG.generation.frequencies.coasterPart, COASTER_PARTS, options);
    }

    shuffle(options);

    console.log(options.slice());
    console.log(options.length);
    console.log(numSquares);

    // randomly place them on the dominoes, making sure first and second element match
    // @NOTE: Like Zoo Parque, the balance/frequencies of all elements are too different and too important to just ignore any leftovers/remainder,
    // so we overdraw until we've exhausted all our options (which slightly exceeds the number of dominoes set in config)
    for(let i = 0; i < 1.5*numDominoes; i++)
    {
        const sideA = options.pop();
        const sideB = options.pop();
        if(!sideA || !sideB) { break; }

        const d = new Domino(DominoType.REGULAR);
        dominoes.push(d);
        d.setSet(set);

        // trying rotation both ways should resolve any issues with closed/open, because EVERY path is open at some side (even deadends)
        const hasOpenSideAtBottom = sideA.isOpenAt(1);
        const hasOpenSideAtTop = sideB.isOpenAt(3);
        const mustMatch = sideA.hasPath() && sideB.hasPath();
        if((hasOpenSideAtBottom || hasOpenSideAtTop) && mustMatch)
        {
            sideA.rotateUntilOpenAt(1);
            sideB.rotateUntilOpenAt(3);
        }

        // we can't connect an attraction and a regular path
        const oneSideCompletelyClosed = sideA.isCompletelyClosed() || sideB.isCompletelyClosed();

        // we want a few more dominoes to not match, even if they COULD, for more variety
        const oneSideCompletelyOpen = sideA.isCompletelyOpen() || sideB.isCompletelyOpen();
        const twoPaths = (sideA.hasPath() && sideB.hasPath());
        const randomNonMatchPaths = Math.random() <= 0.25 && (twoPaths && !oneSideCompletelyClosed && !oneSideCompletelyOpen);

        const attractionAndNonQueuePath = [sideA.type, sideB.type].includes(ItemType.ATTRACTION) && [sideA.typePath, sideB.typePath].includes(PathType.REGULAR);
        const coasterPartAndSomethingElse = (sideA.isCoaster() || sideB.isCoaster()) && (sideA.typePath != sideB.typePath);
        const wrongQueueTypes = (sideA.isQueue() && sideB.isQueue()) && (sideA.typePath != sideB.typePath);
        const mustNotMatch = attractionAndNonQueuePath || wrongQueueTypes || oneSideCompletelyClosed || randomNonMatchPaths || coasterPartAndSomethingElse;
        if(mustNotMatch)
        {
            sideA.rotateUntilClosedAt(1);
            sideB.rotateUntilClosedAt(3);
        }

        d.setSides(sideA, sideB);
    }

}

const addAllPathsFrom = (numTotal:number, freqDist:Record<PathType,number>, dict:Record<string,any>, list:DominoSide[]) =>
{ 
    let totalEmptyPathValue = 0;
    for(const [key,data] of Object.entries(dict))
    {
        totalEmptyPathValue += 1.0 / (data.value ?? 1);
    }
    const emptyPathPercentageMultiplier = (1.0 / totalEmptyPathValue);

    for(const [keyPath,data] of Object.entries(dict))
    {
        const perc = 1.0 / (data.value ?? 1) * emptyPathPercentageMultiplier;
        const freqTotal = Math.round(perc * numTotal);

        for(const [keyType,percType] of Object.entries(freqDist))
        {
            const freqType = Math.round(percType * freqTotal);
            for(let i = 0; i < freqType; i++)
            {
                const ds = new DominoSide(ItemType.PATH);
                ds.setPathType(keyType as PathType);
                ds.setPathKey(keyPath);
                list.push(ds);
            }
        }
    }
}