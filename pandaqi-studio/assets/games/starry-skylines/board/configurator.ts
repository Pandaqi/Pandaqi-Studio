import { PLANET_MAP, PLANET_SETS, NUMBERS, EVENTS, RESOURCES, EFFECTS, BUILDINGS, PEOPLE, COMPONENTS } from "../shared/dict"

export const initializeDictionaries = (cfg) =>
{
    cfg.planetNames = Object.keys(PLANET_MAP);
    cfg.planetSets = PLANET_SETS;

    const hasManualCombo = cfg.manualCombo;
    if(hasManualCombo)
    {
        createComboComponentSet(cfg);
    }

    const noPlanets = !cfg.planetSet || cfg.planetSet.length <= 0;
    if(noPlanets)
    {
        determineRandomComponentSet(cfg);
    }

    initList(cfg, 'numbers', NUMBERS);
    initList(cfg, 'events', EVENTS);
    initList(cfg, 'effects', EFFECTS);
    initList(cfg, 'buildings', BUILDINGS);
    initList(cfg, 'resources', RESOURCES);
    initList(cfg, 'people', PEOPLE);
    initList(cfg, 'components', COMPONENTS);
}

const determineRandomComponentSet = (cfg) => 
{
    // remove all planets with a difficulty that is too high
    const planetSet = new Set();
    const planets = cfg.planetNames.splice(0, cfg.difficulty + 1);

    // always add the learnth planet
    // (@IMPROV: perhaps mark a few buildings as "basic/core", and only add those, instead of fixing one planet of the set)
    planetSet.add( planets.splice(0, 1)[0] );

    // always add the planet we're currently playing
    const curPlanetIndex = planets.indexOf(cfg.planet);
    if(curPlanetIndex >= 0)
    {
        planetSet.add( planets.splice(curPlanetIndex, 1)[0] );
    }

    // add random planets until set is full (or no more valid planets to add)
    const numPlanetsAlreadyPicked = Array.from(planetSet).length;
    for(let i = numPlanetsAlreadyPicked; i < cfg.maxPlanetSetSize; i++) {
        if(planets.length <= 0) { break; }
        const randIdx = Math.floor(Math.random() * planets.length);
        planetSet.add( planets.splice(randIdx, 1)[0] );
    }

    cfg.planetSetEnabled = true;
    cfg.planetSet = Array.from(planetSet);
}

const createComboComponentSet = (cfg:Record<string,any>) =>
{
    const planetSet = cfg.planetSets[cfg.manualCombo].slice();
    if(!planetSet || planetSet.length <= 0) { return; }

    cfg.playingManualCombo = true;
    cfg.planetSetEnabled = true;

    planetSet.push("learnth");
    cfg.planetSet = planetSet;
}

const initList = (cfg:Record<string,any>, type:string, list:Record<string,any>) =>
{
    list = structuredClone(list);

    let totalProb = 0;
    const gameDifficulty = cfg.difficulty;
    const planetSetEnabled = cfg.planetSetEnabled;

    for(const [name,obj] of Object.entries(list)) {
        const planet = obj.planet || "learnth";
        const difficulty = PLANET_MAP[planet];

        if(!planetSetEnabled)
        {
            const difficultyTooHigh = (difficulty > gameDifficulty);
            if(difficultyTooHigh) { delete list[name]; continue; }
        }

        if(planetSetEnabled)
        {
            const planetNotInSet = !cfg.planetSet.includes(planet);
            if(planetNotInSet) { delete list[name]; continue; }

            const hasRequiredPlanets = obj.requiredPlanets;
            if(hasRequiredPlanets)
            {
                let allMatch = true;
                for(const reqPlanet of obj.requiredPlanets) {
                    if(cfg.planetSet.includes(reqPlanet)) { continue; }
                    allMatch = false;
                    break;
                }

                if(!allMatch) { delete list[name]; continue; }
            }
        }

        const handpickedPlanetEmphasized = !cfg.playingManualCombo && difficulty == gameDifficulty
        if(handpickedPlanetEmphasized) { obj.prob *= 2; }

        const learnthPlanetDeemphasized = cfg.playingManualCombo && difficulty == 0;
        if(learnthPlanetDeemphasized) { obj.prob *= 0.5; }

        totalProb += obj.prob || 0;
    }

    cfg.totalProbabilities[type] = totalProb;
    cfg.lists[type] = list;
}