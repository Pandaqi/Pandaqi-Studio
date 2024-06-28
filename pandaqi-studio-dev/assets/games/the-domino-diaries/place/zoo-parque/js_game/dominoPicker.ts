import fromArray from "js/pq_games/tools/random/fromArray";
import CONFIG from "../js_shared/config";
import { ANIMALS, DominoType, ITEMS, ItemType, OBJECTS, STALLS, TERRAINS, TerrainType } from "../js_shared/dict";
import Domino from "./domino";
import DominoSide from "./dominoSide";
import shuffle from "js/pq_games/tools/random/shuffle";

export default class DominoPicker
{
    dominoes: Domino[]

    constructor() {}
    get() { return this.dominoes.slice(); }
    async generate()
    {
        this.dominoes = [];

        this.generatePawns();

        const dominoExpansions = ["base", "strong", "wildlife", "utilities"]
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
            const sets = data.sets ?? ["base"];
            if(!sets.includes(targetSet)) { continue; }
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
        if(!CONFIG.sets[set]) { return; }

        const numDominoes = CONFIG.generation.numDominoes[set];
        const numSquares = numDominoes * 2;

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
        const availableOptionsWithoutTerrain = [availableAnimals, availableObjects].flat();
        const sidesWithoutTerrain = this.assignSidesFollowingDistribution(numSquaresWithoutTerrain, availableOptionsWithoutTerrain);

        // draw exactly as many things needed (that SHOULD have a terrain behind them)
        const numSquaresWithTerrain = 2*numAllWithTerrain + numHalfWithoutTerrain;
        const availableOptionsWithTerrain = [availableAnimals, availableStalls, availableObjects, "empty", "path"].flat();
        const sidesWithTerrain = this.assignSidesFollowingDistribution(numSquaresWithTerrain, availableOptionsWithTerrain);

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
                const prefTerrains = side.getTypeData().terrains;
                const randTerrain : TerrainType = fromArray(prefTerrains);
                side.setTerrain(randTerrain);
                terrainFreqs[randTerrain]--;
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
        for(let i = 0; i < numDominoes; i++)
        {
            const d = new Domino(DominoType.REGULAR);
            let sideA:DominoSide, sideB:DominoSide;

            if(i < numAllWithoutTerrain) {
                sideA = sidesWithoutTerrain.pop();
                sideB = sidesWithoutTerrain.pop();
            } else if(i < (numAllWithoutTerrain + numHalfWithoutTerrain)) {
                sideA = sidesWithTerrain.pop();
                sideB = sidesWithoutTerrain.pop();
            } else {
                sideA = sidesWithTerrain.pop();
                sideB = sidesWithTerrain.pop();
            }

            d.setSides(sideA, sideB);
            d.setSet(set);
            this.dominoes.push(d);
        }

    }

    assignSidesFollowingDistribution(numSquares:number, options:string[]) : DominoSide[]
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
            totalValue += 1.0 / (ITEMS[getTypeOf(option)][option].value ?? 1);
        }
        const percentageMultiplier = 1.0 / totalValue;

        const arr : DominoSide[] = [];
        for(const option of options)
        {
            const optionType = getTypeOf(option);
            const perc = 1.0 / (ITEMS[getTypeOf(option)][option].value ?? 1.0) * percentageMultiplier;
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