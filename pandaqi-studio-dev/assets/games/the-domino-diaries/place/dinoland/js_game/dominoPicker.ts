import shuffle from "js/pq_games/tools/random/shuffle";
import CONFIG from "../js_shared/config";
import { DINOS, DominoType, TERRAINS } from "../js_shared/dict";
import Domino from "./domino";

export default class DominoPicker
{
    dominoes: Domino[]

    constructor() {}
    get() { return this.dominoes.slice(); }
    async generate()
    {
        this.dominoes = [];

        this.generatePawns();
        this.generateBaseDominoes();
        this.generateExpansionDominoes();

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

    generateBaseDominoes()
    {
        if(!CONFIG.sets.base) { return; }
        this.generateDominoes("base");
    }

    generateExpansionDominoes()
    {
        if(!CONFIG.sets.expansion) { return; }
        this.generateDominoes("expansion");
    }

    generateDominoes(set:string)
    {
        const numDominoes = CONFIG.generation.numDominoes[set];
        const numSquares = numDominoes * 2;

        // prepare all terrains, controlled distribution
        const possibleTerrainTypes = this.filterBySet(TERRAINS, set);
        const terrains = [];
        const defPercTerrain = (1.0 / possibleTerrainTypes.length);
        for(const type of possibleTerrainTypes)
        {
            const perc = CONFIG.generation.frequencies[set].terrain[type] ?? defPercTerrain;
            const freq = Math.ceil(perc * numSquares);
            for(let i = 0; i < freq; i++)
            {
                terrains.push(type);                
            }
        }
        shuffle(terrains);

        // prepare all dinosaurs, controlled distribution
        const possibleDinoTypes = this.filterBySet(DINOS, set);
        const totalNumDinosaurs = (CONFIG.generation.frequencies[set].fractionThatHasDinosaur * numSquares);
        const defPercDino = (1.0 / possibleDinoTypes.length);
        const dinosaurs = [];
        for(const type of possibleDinoTypes)
        {
            const perc = CONFIG.generation.frequencies[set].dinosaur[type] ?? defPercDino;
            const freq = Math.ceil(perc * totalNumDinosaurs);
            for(let i = 0; i < freq; i++)
            {
                dinosaurs.push(type);                
            }
        }

        while(dinosaurs.length < numSquares)
        {
            dinosaurs.push(null);
        }
        shuffle(dinosaurs);

        // now randomly place all that on the dominoes
        for(let i = 0; i < numDominoes; i++)
        {
            const d = new Domino(DominoType.REGULAR);
            d.setTerrains(terrains.pop(), terrains.pop());
            d.setDinosaurs(dinosaurs.pop(), dinosaurs.pop());
            d.setSet(set);
            this.dominoes.push(d);
        }
    }
}