import shuffle from "js/pq_games/tools/random/shuffle";
import { CONFIG } from "../shared/config";
import { DominoType, EVENTS, GeneralData, ICONS, MISSION_PENALTIES, MISSION_REWARDS, MISSION_SCALARS, MISSION_TEXTS, ROLES, TERRAINS } from "../shared/dict";
import Domino from "./domino";
import DominoSide from "./dominoSide";
import MissionRequirement from "./missionRequirement";
import fromArray from "js/pq_games/tools/random/fromArray";

export default class DominoPicker
{
    dominoes: Domino[]

    constructor() {}
    get() { return this.dominoes.slice(); }
    async generate()
    {
        this.dominoes = [];

        this.generateRoleTiles();
        this.generateEventTiles();

        const allSets = Object.keys(CONFIG.sets);
        for(const set of allSets)
        {
            this.generateDominoes(set);
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

    generateRoleTiles()
    {
        if(!CONFIG.sets.roles) { return; }

        const numStartingDominoes = CONFIG.generation.numStartingDominoesPerPlayer ?? 1;
        for(const [key,data] of Object.entries(ROLES))
        {
            // the actual role tile
            const d = new Domino(DominoType.ROLE);
            d.setKey(key);
            this.dominoes.push(d);

            // the unique starting domino
            for(let i = 0; i < numStartingDominoes; i++)
            {
                const d2 = new Domino(DominoType.REGULAR);
                const dsTop = new DominoSide();
                dsTop.setTerrain(data.terrain);
                dsTop.setPath("all", false);
                dsTop.setIcon(key);

                const dsBottom = new DominoSide();
                dsBottom.setTerrain(data.terrain);
                dsBottom.setPath("all", false);
                dsBottom.setIcon("empty");

                d2.setSides(dsTop, dsBottom);
                d2.setSet("startingDomino");
                this.dominoes.push(d2);
            }
        }
    }

    generateEventTiles()
    {
        if(!CONFIG.sets.proximity) { return; }

        for(const [key,data] of Object.entries(EVENTS))
        {
            const d = new Domino(DominoType.EVENT);
            d.setKey(key);
            this.dominoes.push(d);
        }
    }

    generateDominoes(set:string)
    {
        if(!CONFIG.sets[set]) { return; }

        this.generateRegularDominoes(set);
        this.generateMissionDominoes(set);
    }

    generateMissionDominoes(set:string)
    {
        const numDominoes = CONFIG.generation.numMissions[set] ?? 0;
        if(numDominoes <= 0) { return; }

        const availableMissionIcons = [];
        for(const [key,data] of Object.entries(ICONS))
        {
            if(!data.missionIcon) { continue; }
            availableMissionIcons.push(key);
        }
        console.log(availableMissionIcons);

        const availableScalars = this.filterBySet(MISSION_SCALARS, set);
        const availableRewards = this.filterBySet(MISSION_REWARDS, set);
        const availablePenalties = this.filterBySet(MISSION_PENALTIES, set);

        const numReqsDist:Record<number, number> = CONFIG.generation.numMissionReqsDist;
        let totalReqsNeeded = 0;
        for(const [num,perc] of Object.entries(numReqsDist))
        {
            totalReqsNeeded += parseInt(num) * Math.ceil(perc*numDominoes);
        }

        // predetermine properties and scalars => combined into requirements
        const allScalars = this.assignDynamicallyWeighted(availableScalars, MISSION_SCALARS, totalReqsNeeded);
        const allMissionIcons = this.assignDynamicallyWeighted(availableMissionIcons, ICONS, totalReqsNeeded);
        const numReqs = Math.min(allScalars.length, allMissionIcons.length);
        const requirementOptions = [];
        for(let i = 0; i < numReqs; i++)
        {
            requirementOptions.push( new MissionRequirement(allMissionIcons.pop(), allScalars.pop()) );
        }
        shuffle(requirementOptions);

        const allShush = [];
        const numShush = Math.round(CONFIG.generation.percMissionShush * numDominoes);
        for(let i = 0; i < numDominoes; i++)
        {
            allShush.push(i < numShush);
        }
        shuffle(allShush);

        // predetermine rewards and penalties
        // (these are not dynamically generated)
        const numRewards = Math.round(CONFIG.generation.percMissionRewards * numDominoes);
        const allRewards = this.assignDynamicallyWeighted(availableRewards, MISSION_REWARDS, numRewards);

        const numPenalties = Math.round(CONFIG.generation.percMissionPenalties * numDominoes);
        const allPenalties = this.assignDynamicallyWeighted(availablePenalties, MISSION_PENALTIES, numPenalties);

        const allRewardsOrPenalties = [];
        for(let i = 0; i < numDominoes; i++)
        {
            let obj = "";
            if(i < numRewards) { obj = allRewards.pop(); }
            else if(i < numRewards + numPenalties) { obj = allPenalties.pop(); }
            allRewardsOrPenalties.push(obj);
        }
        shuffle(allRewardsOrPenalties);

        // now fill in the exact requirements for each
        const allRequirements = [];
        for(const [num,perc] of Object.entries(numReqsDist))
        {
            const freq = Math.ceil(perc*numDominoes);
            const numInt = parseInt(num);
            for(let i = 0; i < freq; i++)
            {
                allRequirements.push(requirementOptions.splice(0, numInt));
            }
        }
        shuffle(allRequirements);

        for(let i = 0; i < numDominoes; i++)
        {
            const d = new Domino(DominoType.MISSION);
            d.setMissionRequirements(allRequirements.pop());
            d.setMissionConsequence(allRewardsOrPenalties.pop());
            d.cleanUpMission();
            d.setMissionText(this.getBestFlavorTextFor(d));
            d.setMissionShush(allShush.pop());
            d.setSet(set);
            this.dominoes.push(d);
        }
    }

    getBestFlavorTextFor(d:Domino)
    {
        // get a clean list of types used for domino mission
        const iconsUsed = [];
        for(const req of d.missionRequirements)
        {
            const type = req.icon;
            if(iconsUsed.includes(type)) { continue; }
            iconsUsed.push(type);
        }

        // get matches sorted by relevance
        let highestNumMatches = 0;
        const textsWithMatchNum = [];
        for(const [key,data] of Object.entries(MISSION_TEXTS))
        {
            // can't possibly match if we don't have enough to match everything
            if(data.matches.length > iconsUsed.length) { continue; }

            let numMatches = 0;
            let matchesCopy = data.matches.slice();
            for(const iconUsed of iconsUsed)
            {
                if(!matchesCopy.includes(iconUsed)) { continue; }
                numMatches++;
                matchesCopy.splice(matchesCopy.indexOf(iconUsed), 1);
            }
            highestNumMatches = Math.max(highestNumMatches, numMatches);
            textsWithMatchNum.push({ key: key, numMatches: numMatches });
        }

        // filter out only the first set ( = highest matching)
        textsWithMatchNum.sort((a,b) => b.numMatches - a.numMatches);
        const options = [];
        for(const textObj of textsWithMatchNum)
        {
            if(textObj.numMatches < highestNumMatches) { break; }
            options.push(textObj.key);
        }

        // return a random one from those options
        return fromArray(options);
    }

    generateRegularDominoes(set:string)
    {
        const numDominoes = CONFIG.generation.numDominoes[set] ?? 0;
        if(numDominoes <= 0) { return; }

        const numSquares = numDominoes * 2;

        // determine path distributions (type = number of openings, and directed or not)
        const allPaths = [];
        const pathDist:Record<string, number> = CONFIG.generation.pathDist;
        const possiblePathKeys = Object.keys(CONFIG.generation.pathDist);
        for(const [key,perc] of Object.entries(pathDist))
        {
            const freq = Math.ceil(perc * numSquares);
            for(let i = 0; i < freq; i++)
            {
                allPaths.push(key);
            }
        }
        shuffle(allPaths);

        const allPathDirections = [];
        const numDirectedPaths = CONFIG.sets.direction ? Math.round(CONFIG.generation.pathPercentageDirected * allPaths.length) : 0;
        for(let i = 0; i < allPaths.length; i++)
        {
            allPathDirections.push(i < numDirectedPaths);
        }
        shuffle(allPathDirections);

        // determine terrain distributions (already shuffled)
        const possibleTerrainKeys = Object.keys(TERRAINS);
        const allTerrains = this.assignDynamicallyWeighted(possibleTerrainKeys, TERRAINS, numSquares);

        const availableIcons = this.filterBySet(ICONS, set);
        const allIcons = this.assignDynamicallyWeighted(availableIcons, ICONS, numSquares);

        const options : DominoSide[] = [];
        for(const icon of allIcons)
        {
            const ds = new DominoSide();
            ds.setTerrain(allTerrains.pop() ?? fromArray(possibleTerrainKeys));
            ds.setPath(allPaths.pop() ?? fromArray(possiblePathKeys), allPathDirections.pop() ?? false);
            ds.setIcon(icon);
            options.push(ds);
        }
        shuffle(options);

        // randomly assign the options to dominoes
        for(let i = 0; i < 1.5*numDominoes; i++)
        {
            const d = new Domino(DominoType.REGULAR);
            const sideA = options.pop();
            let sideB = options.pop();
            if(!sideA || !sideB) { break; }

            // we can't have two different "role icons" on the same tile
            // if that happens, turn the other icon empty, but add the original back to the list to make sure distributions still work out
            // @NOTE: this is a fuzzy algorithm, but it should be exceedingly rare that this creates anything close to trouble
            const twoCapitalsSameDomino = sideA.isCapital() && sideB.isCapital();
            if(twoCapitalsSameDomino)
            {
                const randIndex = Math.floor(Math.random() * options.length);
                options.splice(randIndex, 0, sideB);
                sideB = sideB.clone();
                sideB.setIcon("empty");
            }

            // the usual fixes to make sure dominoes follow the placement rules on their own
            const mustMatch = (sideA.hasPathAt(1) != sideB.hasPathAt(3));
            if(mustMatch)
            {
                sideA.rotateUntilPathAt(1);
                sideB.rotateUntilPathAt(3);
            }
        
            // but also keep some where the paths do not link up on the domino itself
            const mustNotMatch = Math.random() <= CONFIG.generation.pathNonMatchProb && !(sideA.isCompletelyOpen() || sideB.isCompletelyOpen());
            if(mustNotMatch)
            {
                sideA.rotateUntilNoPathAt(1);
                sideB.rotateUntilNoPathAt(3);
            }

            d.setSides(sideA, sideB);
            d.setSet(set);
            this.dominoes.push(d);
        }

    }

    assignDynamicallyWeighted(list:string[], dict:Record<string,GeneralData>, num:number)
    {
        let total = 0.0;
        for(const key of list)
        {
            total += (dict[key].prob ?? 1.0);
        }
        const percMult = 1.0 / total;

        const arr = [];
        for(const key of list)
        {
            const freq = Math.ceil((dict[key].prob ?? 1.0) * percMult * num);
            for(let i = 0; i < freq; i++)
            {
                arr.push(key);
            }
        }
        shuffle(arr);
        return arr;
    }
}