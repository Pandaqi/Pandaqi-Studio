import shuffle from "js/pq_games/tools/random/shuffle";
import CONFIG from "../js_shared/config";
import { ATTRACTIONS, DECORATIONS, DominoType, ITEMS, ItemType, PATHS, PathType, STALLS } from "../js_shared/dict";
import Domino from "./domino";
import DominoSide from "./dominoSide";

export default class DominoPicker
{
    dominoes: Domino[]

    constructor() {}
    get() { return this.dominoes.slice(); }
    async generate()
    {
        this.dominoes = [];

        this.generatePawns();

        const dominoExpansions = ["base", "wishneyland", "unibearsal"]
        for(const exp of dominoExpansions)
        {
            if(!CONFIG.sets[exp]) { continue; }
            this.generateDominoes(exp);
        }

        console.log(this.dominoes);
    }

    filterBySet(dict:Record<string,any>, targetSet:string)
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

    generatePawns()
    {
        if(!CONFIG.sets.pawns) { return; }

        for(let i = 0; i < CONFIG.generation.numUniquePawns; i++)
        {
            for(let j = 0; j < CONFIG.generation.numPawnsPerPlayer; j++)
            {
                const d = new Domino(DominoType.PAWN);
                d.setPawnIndex(i);
                this.dominoes.push(d);
            }
        }
    }

    generateDominoes(set:string)
    {
        const numDominoes = CONFIG.generation.numDominoes[set];
        const numSquares = numDominoes * 2;

        const fullDict = {};
        Object.assign(fullDict, ATTRACTIONS);
        Object.assign(fullDict, DECORATIONS);
        Object.assign(fullDict, STALLS);

        const availableAttractions = this.filterBySet(ATTRACTIONS, "base");
        const availableDecorations = this.filterBySet(DECORATIONS, "base");
        const availableStalls = this.filterBySet(STALLS, "base");
        const fullAvailable = [availableAttractions, availableDecorations, availableStalls].flat();

        const emptyPathValue = 0.1; // the number of empty path tiles we want

        // calculate total numbers, so we can get accurate percentages for all
        let totalValue = emptyPathValue;
        for(const elem of fullAvailable)
        {
            totalValue += fullDict[elem].value ?? 1;
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
                options.push(ds);
            }
        }

        // all the empty paths
        const percEmptyPath = 1.0 / emptyPathValue * percentageMultiplier;
        const freqEmptyPath = Math.ceil(percEmptyPath * numSquares);
        let totalEmptyPathValue = 0;
        for(const [key,data] of Object.entries(PATHS))
        {
            totalEmptyPathValue += data.value ?? 1;
        }
        const emptyPathPercentageMultiplier = (1.0 / totalEmptyPathValue);

        const freqDist:Record<PathType,number> = CONFIG.generation.frequencies.pathType;
        for(const [keyPath,data] of Object.entries(PATHS))
        {
            const perc = 1.0 / (data.value ?? 1) * emptyPathPercentageMultiplier;
            const freqTotal = Math.ceil(perc * freqEmptyPath);

            for(const [keyType,percType] of Object.entries(freqDist))
            {
                const freqType = Math.ceil(percType * freqTotal);
                for(let i = 0; i < freqType; i++)
                {
                    const ds = new DominoSide(ItemType.PATH);
                    ds.setPathType(keyType as PathType);
                    ds.setPathKey(keyPath);
                    options.push(ds);
                }
            }
        }
        shuffle(options);

        // randomly place them on the dominoes, making sure first and second element match
        for(let i = 0; i < numDominoes; i++)
        {
            const d = new Domino(DominoType.REGULAR);
            const sideA = options.pop();
            const sideB = options.pop();

            // trying rotation both ways should resolve any issues with closed/open, because EVERY path is open at some side (even deadends)
            const hasOpenSideAtBottom = sideA.isOpenAt(1);
            const mustMatch = sideA.hasPathLike() && sideB.hasPathLike();
            if(hasOpenSideAtBottom && mustMatch)
            {
                sideB.rotateUntilOpenAt(3);
            }

            const hasOpenSideAtTop = sideA.isOpenAt(3);
            if(hasOpenSideAtTop && mustMatch)
            {
                sideA.rotateUntilOpenAt(1);
            }

            // we can't connect an attraction and a regular path
            const attractionAndNonQueuePath = (sideA.type == ItemType.ATTRACTION || sideB.type == ItemType.ATTRACTION) && (sideA.typePath == PathType.REGULAR || sideB.typePath == PathType.REGULAR);
            const wrongQueueTypes = (sideA.isQueue() && sideB.isQueue()) && (sideA.typePath != sideB.typePath);
            const mustNotMatch = attractionAndNonQueuePath || wrongQueueTypes;
            if(mustNotMatch)
            {
                sideA.rotateUntilClosedAt(1);
                sideB.rotateUntilClosedAt(3);
            }

            d.setSides(sideA, sideB);
        }


    }
}