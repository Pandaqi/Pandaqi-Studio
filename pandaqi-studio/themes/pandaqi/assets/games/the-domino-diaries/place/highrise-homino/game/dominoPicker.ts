
import { shuffle, Bounds, fromArray } from "lib/pq-games";
import { CONFIG } from "../shared/config";
import { DominoType, FloorType, ItemType, MISSIONS, OBJECTS, TENANTS, TenantProperties, UtilityType, WISHES, WishType } from "../shared/dict";
import Domino from "./domino";
import DominoSide from "./dominoSide";
import TenantWish from "./tenantWish";

export const dominoPicker = () : Domino[] =>
{
    const dominoes = [];

    const allSets = Object.keys(CONFIG._settings.sets);
    for(const set of allSets)
    {
        generateDominoes(dominoes, set);
    }

    return dominoes;
}

const filterBySet = (dict:Record<string,any>, targetSet:string) =>
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

const filterNonWishableObjects = (options:string[]) =>
{
    return options.filter((x) => !OBJECTS[x].nonWishable);
}

const generateDominoes = (dominoes:Domino[], set:string) =>
{
    const setNotIncluded = !CONFIG._settings.sets[set].value;
    if(setNotIncluded) { return; }

    generateRegularDominoes(dominoes, set);
    generateTenants(dominoes, set);
    generateMissions(dominoes, set);
}

const generateRegularDominoes = (dominoes:Domino[], set:string) =>
{
    const numDominoes = CONFIG.generation.numDominoes[set] ?? CONFIG.generation.numDominoes.base;
    if(numDominoes <= 0) { return; }

    const numSquares = numDominoes * 2;

    // pre-determine all the items ( + the empty ones WITHOUT items)
    const availableItems = filterBySet(OBJECTS, set);
    const emptyProb = CONFIG.generation.emptyTileProb;
    let totalProb = emptyProb;
    for(const item of availableItems)
    {
        totalProb += OBJECTS[item].prob ?? 1.0;
    }
    
    const probMultiplier = (1.0 / totalProb);
    const options:DominoSide[] = [];
    for(const item of availableItems)
    {
        const freq = Math.ceil( (OBJECTS[item].prob ?? 1.0) * probMultiplier * numSquares );
        for(let i = 0; i < freq; i++)
        {
            const ds = new DominoSide(ItemType.OBJECT, item);
            options.push(ds);
        }
    }

    const freqEmpty = Math.ceil(emptyProb * probMultiplier * numSquares);
    for(let i = 0; i < freqEmpty; i++)
    {
        const ds = new DominoSide(ItemType.EMPTY, "empty");
        options.push(ds)
    }
    shuffle(options);

    const numSquaresActual = options.length;

    // pre-determine number of walls
    const numWallsOptions = [];
    const wallDist:Record<number,number> = CONFIG.generation.wallDist;
    for(const [num,perc] of Object.entries(wallDist))
    {
        const freq = Math.ceil(perc * numSquaresActual);
        for(let i = 0; i < freq; i++)
        {
            numWallsOptions.push(parseInt(num));
        }
    }
    shuffle(numWallsOptions);

    // pre-determine the doors + windows
    const doorOptions = [];
    const windowOptions = [];
    const numDoors = Math.ceil(CONFIG.generation.doorPercentage * numSquaresActual);
    const addWindows = (set != "base");
    const numWindows = addWindows ? Math.ceil(CONFIG.generation.windowPercentage * numSquaresActual) : 0;
    for(let i = 0; i < numSquaresActual; i++)
    {
        doorOptions.push(i < numDoors);
        windowOptions.push(i < numWindows);
    }
    shuffle(doorOptions);
    shuffle(windowOptions);

    // pre-determine floor types
    const floorOptions = [];
    const floorDist:Record<number,number> = CONFIG.generation.floorDist;
    for(const [floorType,perc] of Object.entries(floorDist))
    {
        const freq = Math.ceil(perc * numSquaresActual);
        for(let i = 0; i < freq; i++)
        {
            floorOptions.push(floorType);
        }
    }
    shuffle(floorOptions)

    // assign metadata (walls, doors, floorOptions)
    for(const option of options)
    {
        option.setWalls(numWallsOptions.pop(), doorOptions.pop(), windowOptions.pop());
        option.setFloor(floorOptions.pop());
    }

    // randomly assign the options to dominoes
    for(let i = 0; i < 2 * numDominoes; i++)
    {
        const d = new Domino(DominoType.REGULAR);
        const sideA = options.pop();
        const sideB = options.pop();
        if(!sideA || !sideB) { break; }

        // must have wall between two floors of different types
        const nonMatchingFloors = (sideA.floor != sideB.floor);
        const middleMustBeClosed = nonMatchingFloors;
        if(middleMustBeClosed)
        {
            if(!sideA.hasWalls() && !sideB.hasWalls())
            {
                sideA.setWalls(1, false, false);
            }

            sideA.rotateWallsUntilClosedAt(1);
            sideB.rotateWallsUntilClosedAt(3);
        }

        // no window allowed at middle
        // (there can only be 1 window at most to any tile, so just rotating away is fine as a solution)
        if(sideA.isWindowAt(1)) { sideA.rotateWalls(1); }
        if(sideB.isWindowAt(3)) { sideB.rotateWalls(1); }

        // no double wall in middle; if door and no door, prefer the door
        const cleanUpMiddle = (sideA.isClosedAt(1) && sideB.isClosedAt(3));
        if(cleanUpMiddle)
        {
            let weakSide = sideA, weakIndex = 1;
            if(sideA.isDoorAt(1)) { weakSide = sideB; weakIndex = 3; }
            weakSide.removeWallAt(weakIndex);
        }

        d.setSides(sideA, sideB);
        d.setSet(set);
        dominoes.push(d);
    }
}

const generateTenants = (dominoes:Domino[], set:string) =>
{
    const numTenants = CONFIG.generation.numTenants[set] ?? CONFIG.generation.numTenants.base;
    if(numTenants <= 0) { return; }

    const availableTenants = filterBySet(TENANTS, set);

    // determine exactly how many wishes we need
    let numWishesNeeded = 0;
    const wishDist:Record<number, number> = CONFIG.generation.wishNumDist;
    for(const [numWishes,perc] of Object.entries(wishDist))
    {
        numWishesNeeded += Math.ceil(parseInt(numWishes)*perc*numTenants);
    }

    // also determine how many of them should be INVERTED (to be "we do NOT want this")
    const wishesInverted = [];
    const numInvWishes = Math.ceil(CONFIG.generation.wishPercentageInverted * numWishesNeeded);
    for(let i = 0; i < numWishesNeeded; i++)
    {
        wishesInverted.push(i < numInvWishes);
    }
    shuffle(wishesInverted);

    // with weighted probabilities, create an entire list of wish objects
    const fullDict = {};
    Object.assign(fullDict, OBJECTS);
    Object.assign(fullDict, WISHES);

    const availableItems = filterNonWishableObjects( filterBySet(OBJECTS, set) );
    const availableSpecialWishes = filterBySet(WISHES, set);
    const availableOptions = [availableItems, availableSpecialWishes].flat();
    let totalProb = 0;

    for(const option of availableOptions)
    {
        totalProb += fullDict[option].prob ?? 1.0;
    }

    const probMultiplier = (1.0 / totalProb);
    const wishOptions = [];
    for(const option of availableOptions)
    {
        const data = fullDict[option];
        const wishType = WISHES[option] ? WishType.SPECIAL : WishType.OBJECT;
        const freq = Math.ceil((data.prob ?? 1.0) * probMultiplier * numWishesNeeded);
        const numberRange = data.range ?? new Bounds(1,1);
        for(let i = 0; i < freq; i++)
        {
            const num = numberRange.randomInteger();
            const invert = wishesInverted.pop();
            const w = new TenantWish(wishType, option, num, invert);
            wishOptions.push(w);

            if(w.needsSubKey())
            {
                let subKeyOptions = [];
                if(w.key == "floor_type") { subKeyOptions = Object.values(FloorType); }
                else if(w.key == "utilities") { subKeyOptions = Object.values(UtilityType); }
                else if(w.key == "tenants") { subKeyOptions = availableTenants; }
                w.setSubKey(fromArray(subKeyOptions));
            }
        }
    }
    shuffle(wishOptions);

    const wishOptionsBackup = wishOptions.slice();
    shuffle(wishOptionsBackup);

    // create list of the tenant illustrations (the actual persons from the dict) to use
    let totalProbTenants = 0;
    for(const option of availableTenants)
    {
        totalProbTenants += TENANTS[option].prob ?? 1.0;
    }
    const probMultiplierTenant = (1.0 / totalProbTenants);

    const tenantKeys = [];
    for(const option of availableTenants)
    {
        const freq = Math.ceil((TENANTS[option].prob ?? 1.0) * probMultiplierTenant * numTenants);
        for(let i = 0; i < freq; i++)
        {
            tenantKeys.push(option);
        }
    }
    shuffle(tenantKeys);

    // now actually assign these wishes to tenants
    // (@NOTE: properties are fixed per tenant; always the same for that type => should add some consistency in an otherwise very dynamic/random set of material)
    // then assign their final score based on those details
    // and put it all on a single domino
    for(const [numWishes,perc] of Object.entries(wishDist))
    {
        const numWishesInt = parseInt(numWishes);
        const numTenantsToCreate = Math.ceil(perc*numTenants);
        for(let i = 0; i < numTenantsToCreate; i++)
        {
            const tenantKey = tenantKeys.pop() ?? fromArray(availableTenants);
            const tenantData = TENANTS[tenantKey];
            let wishes = wishOptions.splice(0, numWishesInt);

            // because exact numbers are not certain, we might exceed the wishes list and need to draw from backup
            if(wishes.length <= 0)
            {
                wishes = wishOptionsBackup.splice(Math.floor(Math.random() * (wishOptionsBackup.length - numWishesInt)), numWishesInt);
            }

            const d = new Domino(DominoType.TENANT);
            const dsWish = new DominoSide(ItemType.TENANTWISH, tenantKey);
            dsWish.setWishes(wishes);
            dsWish.cleanUpWishes();

            const dsProp = new DominoSide(ItemType.TENANTPROP, tenantKey);

            const score = calculateTenantScore(wishes, tenantData.props ?? {});
            dsProp.setScore(score);

            d.setSides(dsProp, dsWish);
            d.setSet(set);
            dominoes.push(d);
        }
    }
}

const calculateTenantScore = (wishes:TenantWish[], props:TenantProperties) =>
{
    let val = 0;
    for(const w of wishes)
    {
        val += w.getScore();
    }

    for(const [key,enabled] of Object.entries(props))
    {
        if(!enabled) { continue; }
        val += CONFIG.generation.score.propertyValue[key] ?? 0.0;
    }

    return Math.round(val);
}

const generateMissions = (dominoes:Domino[], set:string) =>
{
    if(set != "livingTogether") { return; }

    for(const [key,data] of Object.entries(MISSIONS))
    {
        const d = new Domino(DominoType.MISSION);
        d.setMission(data.type, key);
        dominoes.push(d);
    }
}