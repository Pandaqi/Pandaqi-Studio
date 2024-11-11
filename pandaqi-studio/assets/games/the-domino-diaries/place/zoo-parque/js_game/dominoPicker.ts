import getWeighted from "js/pq_games/tools/random/getWeighted";
import CONFIG from "../js_shared/config";
import { ANIMALS, CAMPAIGN_MISSIONS, CAMPAIGN_RULES, CampDiff, CampType, DominoType, ITEMS, ItemType, OBJECTS, RuleVibe, STALLS, TERRAINS, TerrainType } from "../js_shared/dict";
import Domino from "./domino";
import DominoSide from "./dominoSide";
import shuffle from "js/pq_games/tools/random/shuffle";
import fromArray from "js/pq_games/tools/random/fromArray";

const DOMINO_EXPANSIONS = ["base", "strong", "wildlife", "utilities"]
const DEBUG_STATS = false;
const DIFF_TO_INDEX = {
    [CampDiff.EASY]: 0,
    [CampDiff.MEDIUM]: 1,
    [CampDiff.HARD]: 2
}

export default class DominoPicker
{
    dominoes: Domino[]

    constructor() {}
    get() { return this.dominoes.slice(); }
    async generate()
    {
        this.dominoes = [];

        this.generatePawns();
        for(const exp of DOMINO_EXPANSIONS)
        {
            this.generateDominoes(exp);
        }
        this.generateZooperative();
        this.calculateDebugStatistics();

        console.log(this.dominoes);
    }

    calculateDebugStatistics()
    {
        if(!DEBUG_STATS) { return; }
        
        console.log("[Debug] Statistics for general configuration");
        const animalsPerSet = {};
        const terrainsPerSet = {};
        for(const exp of DOMINO_EXPANSIONS)
        {
            animalsPerSet[exp] = [];
            terrainsPerSet[exp] = [];
            for(const [key,data] of Object.entries(ANIMALS))
            {
                if(!data.sets.includes(exp)) { continue; }
                animalsPerSet[exp].push(key);
            }

            for(const [key,data] of Object.entries(TERRAINS))
            {
                if(!data.sets.includes(exp)) { continue; }
                terrainsPerSet[exp].push(key);
            }
        }
        console.log(animalsPerSet);
        console.log(terrainsPerSet);


        console.log("[Debug] Statistics for this specific generation");
        const sidesPerType = {};
        const sidesPerKey = {};
        const terrainStats = {};
        const fenceStats = {};
        for(const domino of this.dominoes)
        {
            if(domino.type != DominoType.REGULAR) { continue; }
            
            for(const side of domino.getSidesAsArray())
            {
                sidesPerType[side.type] = (sidesPerType[side.type] ?? 0) + 1;
                sidesPerKey[side.key] = (sidesPerKey[side.key] ?? 0) + 1;
                terrainStats[side.terrain] = (terrainStats[side.terrain] ?? 0) + 1;
                
                for(let i = 0; i < 4; i++)
                {
                    fenceStats[side.fences[i]] = (fenceStats[side.fences[i]] ?? 0) + 1;
                }
            }
        }
        console.log(sidesPerType);
        console.log(sidesPerKey);
        console.log(terrainStats);
        console.log(fenceStats);
    }

    filterBySet(dict:Record<string,any>, targetSet:string)
    {
        const arr = [];
        for(const [key,data] of Object.entries(dict))
        {
            const sets = data.sets ?? ["base"];
            if(!sets.includes(targetSet)) { continue; }
            arr.push(key);
        }
        return arr;
    }

    selectMissionForDifficulty(diffTarget:CampDiff)
    {
        const keys = shuffle(Object.keys(CAMPAIGN_MISSIONS));
        for(const key of keys)
        {
            const data = CAMPAIGN_MISSIONS[key];
            let randType:CampType = fromArray(data.types);
            if(diffTarget == CampDiff.EASY)
            {
                if(!data.types.includes(CampType.WIN)) { continue; }
                randType = CampType.WIN;
            }

            if(data.diff && data.diff == diffTarget)
            {
                return { missionKey: key, numIndex: -1, type: randType };
            }

            if(data.numScale)
            {
                return { missionKey: key, numIndex: DIFF_TO_INDEX[diffTarget], type: randType };
            }
        }
    }

    generateZooperative()
    {
        if(!CONFIG.sets.zooperative) { return; }

        const dist:Record<number, number> = CONFIG.generation.zooperative.cardsPerLevel;
        const ruleProb:number = CONFIG.generation.zooperative.ruleProbability;
        for(const [key,freq] of Object.entries(dist))
        {
            const cardScore = parseInt(key);
            for(let i = 0; i < freq; i++)
            {
                const d = new Domino(DominoType.CAMPAIGN);

                // draw rule if wanted
                // (this already changes how hard out mission needs to be to match target)
                let targetDifficulty = cardScore;
                const needsRule = Math.random() <= ruleProb;
                if(needsRule)
                {
                    const chosenRule = getWeighted(CAMPAIGN_RULES);
                    d.setCampaignRule(chosenRule);
                    targetDifficulty += CAMPAIGN_RULES[chosenRule].vibe == RuleVibe.GOOD ? -2 : 2;
                }

                targetDifficulty = Math.max(Math.min(targetDifficulty, 8), 1);

                // draw suitable campaign mission
                let wantedDifficulty = CampDiff.EASY;
                if(targetDifficulty <= 3) { wantedDifficulty = CampDiff.EASY; }
                else if(targetDifficulty <= 6) { wantedDifficulty = CampDiff.MEDIUM; }
                else if(targetDifficulty <= 8) { wantedDifficulty = CampDiff.HARD; }

                const chosenMission = this.selectMissionForDifficulty(wantedDifficulty);
                d.setCampaignMission(chosenMission, cardScore);
                this.dominoes.push(d);
            }
        }
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
        if(!CONFIG.sets[set]) { return; }

        const numDominoes = CONFIG.generation.numDominoes[set];
        const numSquares = numDominoes * 2;

        // add the required entrance tile with just open paths everywhere
        if(set == "base")
        {
            const entranceDomino = new Domino(DominoType.REGULAR);
            entranceDomino.entrance = true;
             
            const side = new DominoSide(ItemType.PATH);
            entranceDomino.setSides(side, side);
            this.dominoes.push(entranceDomino);
        }

        // determine what's available
        const availableAnimals = this.filterBySet(ANIMALS, set);
        const availableStalls = this.filterBySet(STALLS, set);
        const availableObjects = this.filterBySet(OBJECTS, set);
        const availableTerrains = this.filterBySet(TERRAINS, set);
        const availableFences = ["fence_weak", "fence_strong"]; // it's far easier for code + game balance if both types of fences are simply present in all material

        // pre-determine fences list
        const fenceOptions = []; // this is the number of fences (rotated/arranged randomly upon drawing)
        const fenceNumDist: Record<number, number> = CONFIG.generation.fenceNumDistribution;
        for(const [key,perc] of Object.entries(fenceNumDist))
        {
            const freq = Math.ceil(perc * numSquares);
            for(let i = 0; i < freq; i++)
            {
                fenceOptions.push(parseInt(key));
            }
        }

        const fenceTypes = []; // whether it's a weak or strong fence
        const fenceTypeDist: Record<number, number> = CONFIG.generation.fenceTypeDistribution;
        for(const fenceType of availableFences)
        {
            const freq = Math.ceil(fenceTypeDist[fenceType] * numSquares);
            for(let i = 0; i < freq; i++)
            {
                fenceTypes.push(fenceType);
            }
        }
        shuffle(fenceOptions);
        shuffle(fenceTypes);

        // pre-determine lists with everything in the right quantity
        // the most important thing here is that there's a correct balance between BOTTOM / TOP tiles, so that's the thing we fix on specific values first
        const numAllWithoutTerrain = Math.ceil(CONFIG.generation.percAllWithoutTerrain * numDominoes);
        const numHalfWithoutTerrain = Math.ceil(CONFIG.generation.percHalfWithoutTerrain * numDominoes);
        const numAllWithTerrain = Math.ceil(CONFIG.generation.percAllWithTerrain * numDominoes);

        // draw exactly as many things needed (that should NOT have a terrain behind them)
        const numSquaresWithoutTerrain = 2*numAllWithoutTerrain + numHalfWithoutTerrain;
        const availableOptionsWithoutTerrain = [availableAnimals, availableObjects, "empty"].flat();
        const customProbabilities1 = { "empty": 0.735 };
        const sidesWithoutTerrain = this.assignSidesFollowingDistribution(numSquaresWithoutTerrain, availableOptionsWithoutTerrain, customProbabilities1);

        // draw exactly as many things needed (that SHOULD have a terrain behind them)
        const numSquaresWithTerrain = 2*numAllWithTerrain + numHalfWithoutTerrain;
        const availableOptionsWithTerrain = [availableAnimals, availableStalls, availableObjects, "empty", "path"].flat();
        const customProbabilities2 = { [ItemType.ANIMAL]: 0.275, [ItemType.OBJECT]: 0.75 } // make animals far less likely in this situation, we want MOST of them without background
        const sidesWithTerrain = this.assignSidesFollowingDistribution(numSquaresWithTerrain, availableOptionsWithTerrain, customProbabilities2);

        // assign the fences
        for(const side of sidesWithoutTerrain)
        {
            side.setFences(fenceOptions.pop(), fenceTypes.pop());
        }

        for(const side of sidesWithTerrain)
        {
            side.setFences(fenceOptions.pop(), fenceTypes.pop());
        }

        // assigning the terrains is a bit of a difficult one
        // because some have fixed terrains (such as animals who can only be on their preferred terrain) and some don't
        // hence the many steps below
        const terrainFreqs = {};

        let numCustomTerrainsNeeded = 0;
        for(const side of sidesWithTerrain)
        {
            if(side.needsPathBackground()) { continue; }
            numCustomTerrainsNeeded++;
        }

        let totalTerrainValue = 0;
        for(const terrainType of availableTerrains)
        {
            totalTerrainValue += 1.0 / (TERRAINS[terrainType].value ?? 1.0);
        }
        const terrainPercentageMultiplier = (1.0 / totalTerrainValue);

        for(const terrainType of availableTerrains)
        {
            terrainFreqs[terrainType] = Math.ceil(1.0 / (TERRAINS[terrainType].value ?? 1.0) * terrainPercentageMultiplier * numCustomTerrainsNeeded);
        }

        for(const side of sidesWithTerrain)
        {
            if(side.needsPathBackground()) { continue; }

            // give animals their preferred terrain, even if already used "too often" (because we have no choice, the animal needs it!)
            if(side.type == ItemType.ANIMAL)
            {
                const prefTerrains : TerrainType[] = shuffle(side.getTypeData().terrains.slice());
                for(const prefTerrain of prefTerrains)
                {
                    if(prefTerrain in terrainFreqs)
                    {
                        side.setTerrain(prefTerrain);
                        terrainFreqs[prefTerrain]--;
                        break;
                    }
                }
            }

            // give anything else a random terrain that is not "exhausted" yet
            if(side.type == ItemType.EMPTY || side.type == ItemType.OBJECT)
            {
                const options : string[] = shuffle(Object.keys(terrainFreqs));
                for(const option of options)
                {
                    if(terrainFreqs[option] <= 0) { continue; }
                    side.setTerrain(option as TerrainType);
                    terrainFreqs[option]--;
                    break;
                }
            }
        }

        // randomly assign the options to dominoes
        // (but stick to our predefined numbers of all-empty, half-terrain, all-terrain)
        // @NOTE: We OVERDRAW, because we generate slightly too many things (due to rounding and not being able to add "half an animal" and stuff), but the balance/difference is too important to just throw away the remainder
        for(let i = 0; i < 2*numDominoes; i++)
        {
            const d = new Domino(DominoType.REGULAR);
            let sideA:DominoSide, sideB:DominoSide;

            if(i < numAllWithoutTerrain) {
                sideA = sidesWithoutTerrain.pop();
                sideB = sidesWithoutTerrain.pop();
            } else if(i < (numAllWithoutTerrain + numHalfWithoutTerrain)) {
                sideA = sidesWithTerrain.pop();
                sideB = sidesWithoutTerrain.pop();
            } else if(i < numDominoes) {
                sideA = sidesWithTerrain.pop();
                sideB = sidesWithTerrain.pop();
            } else {
                sideA = sidesWithoutTerrain.pop() ?? sidesWithTerrain.pop();
                sideB = sidesWithoutTerrain.pop() ?? sidesWithTerrain.pop();
                if(!sideA || !sideB) { break; }
            }

            // tiny modifications to look better
            // if one side is a path and the other is not a stall, add a fence (looks better + more useful in practice)
            const oneSidePathOtherNotStall = (sideA.type == ItemType.PATH && sideB.type != ItemType.STALL) || (sideA.type != ItemType.STALL && sideB.type == ItemType.PATH);
            const oneSideNonPathOtherStall = (sideA.type == ItemType.STALL && sideB.type != ItemType.PATH) || (sideA.type != ItemType.PATH && sideB.type == ItemType.STALL);
            const carnivoreAndHerbivore = sideA.isAnimal() && sideB.isAnimal() && (sideA.getAnimalDiet() != sideB.getAnimalDiet());
            const solitaryAndHerd = sideA.isAnimal() && sideB.isAnimal() && (sideA.getAnimalSocial() != sideB.getAnimalSocial());

            const forceClosed = oneSidePathOtherNotStall || oneSideNonPathOtherStall || carnivoreAndHerbivore || solitaryAndHerd;
            if(forceClosed)
            {
                if(!sideA.hasFences() && !sideB.hasFences())
                {
                    sideA.setFences(1, "fence_weak");
                }

                sideA.rotateFencesUntilClosedAt(1);
                sideB.rotateFencesUntilClosedAt(3);
            }

            // if both sides have a fence in the middle, remove one of them (the weakest, if possible)
            const bothHaveMiddleFence = !sideA.isOpenAt(1) && !sideB.isOpenAt(3);
            if(bothHaveMiddleFence)
            {
                let weakSide = sideA;
                let removeIndex = 1;
                if(sideA.fenceType == "fence_strong" && sideB.fenceType == "fence_weak") { weakSide = sideB; removeIndex = 3; }
                weakSide.removeFenceAt(removeIndex);
            }

            d.setSides(sideA, sideB);
            d.setSet(set);
            this.dominoes.push(d);
        }

    }

    assignSidesFollowingDistribution(numSquares:number, options:string[], customProbs:Record<string,number> = {}) : DominoSide[]
    {
        const getTypeOf = (key:string) =>
        {
            if(key == "empty") { return ItemType.EMPTY; }
            else if(key == "path") { return ItemType.PATH; }
            else if(ANIMALS[key]) { return ItemType.ANIMAL; }
            else if(STALLS[key]) { return ItemType.STALL; }
            else if(OBJECTS[key]) { return ItemType.OBJECT; }
            return ItemType.EMPTY;
        }

        let totalValue = 0;
        for(const option of options)
        {
            const optionType = getTypeOf(option);
            totalValue += 1.0 / (ITEMS[getTypeOf(option)][option].value ?? 1) * (customProbs[optionType] ?? 1.0);
        }
        const percentageMultiplier = 1.0 / totalValue;

        const arr : DominoSide[] = [];
        for(const option of options)
        {
            const optionType = getTypeOf(option);
            const perc = 1.0 / (ITEMS[getTypeOf(option)][option].value ?? 1.0) * (customProbs[optionType] ?? 1.0) * percentageMultiplier;
            const freq = Math.ceil(perc * numSquares);
            for(let i = 0; i < freq; i++)
            {
                const ds = new DominoSide(optionType, option);
                arr.push(ds);
            }
        }
        shuffle(arr);
        return arr;
    }
}