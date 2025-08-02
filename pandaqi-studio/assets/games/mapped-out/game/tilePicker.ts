import shuffle from "js/pq_games/tools/random/shuffle";
import { CONFIG } from "../shared/config";
import { CardType, FishType, TILE_ACTIONS, TileAction } from "../shared/dict";
import Card from "./card";

export const tilePicker = () : Card[] =>
{
    const cards = [];
    
    generatePawns(cards);
    generateBaseTiles(cards);
    generateLandsUnknown(cards);

    return cards;
}

const generatePawns = (cards) =>
{
    if(!CONFIG.sets.base) { return; }

    // @NOTE: two pawns per card, hence 3
    for(let i = 0; i < 3; i++)
    {
        const newCard = new Card(CardType.PAWN);
        newCard.pawnIndex = i;
        cards.push(newCard);
    }
}

const generateBaseTiles = (cards) =>
{
    if(!CONFIG.sets.base) { return; }
    generateMapTiles(cards, CONFIG.generation.mapTilesNumBase, CONFIG.generation.mapTilesDistBase);
}

const generateLandsUnknown = (cards) =>
{
    if(!CONFIG.sets.landsUnknown) { return; }
    generateMapTiles(cards, CONFIG.generation.mapTilesNumLands, CONFIG.generation.mapTilesDistLands);
}

const generateMapTiles = (cards:Card[], numTiles:number, dist:Record<string,number>) =>
{
    // prepare the full list of fishes to randomly pepper over the tiles
    let totalNumFishes = 0;
    const fishDist:Record<number, number> = CONFIG.generation.numFishDist;
    const nums = [];
    for(const [num,freqRaw] of Object.entries(fishDist))
    {
        const freq = Math.ceil(freqRaw * numTiles) * parseInt(num);
        totalNumFishes += freq;
        for(let i = 0; i < freq; i++)
        {
            nums.push(parseInt(num));
        }
    }
    shuffle(nums);

    const fishes = [];
    const fishesAvailable : FishType[] = Object.values(FishType);
    while(fishes.length < totalNumFishes)
    {
        fishes.push(...fishesAvailable);
    }
    shuffle(fishes);

    // prepare the random tile actions to add fairly as well
    const tileActions = [];
    const tileActionNumbers = [];
    let prevTileActionNumber = 0;
    const actionDist:Record<TileAction, number> = CONFIG.generation.mapTileActionDist;
    for(const [action,freqRaw] of Object.entries(actionDist))
    {
        const freq = Math.ceil(freqRaw * numTiles);
        for(let i = 0; i < freq; i++)
        {
            tileActions.push(action);

            prevTileActionNumber++;
            tileActionNumbers.push(prevTileActionNumber);
        }
    }
    shuffle(tileActions);
    shuffle(tileActionNumbers);

    // prepare the special actions too
    const specialActions = [];
    for(const [action,freqRaw] of Object.entries(dist))
    {
        const freq = Math.ceil(freqRaw * numTiles);
        for(let i = 0; i < freq; i++)
        {
            specialActions.push(action);
        }
    }
    shuffle(specialActions);

    // plug it all in
    for(let i = 0; i < numTiles; i++)
    {
        const numFishes = nums.pop();
        const tileAction = tileActions.pop();
        const newTile = new Card(CardType.MAP);
        newTile.fishes = fishes.splice(0, numFishes);
        newTile.tileAction = tileAction;
        newTile.tileActionNum = tileActionNumbers.pop() % TILE_ACTIONS[tileAction].maxNum
        newTile.specialAction = specialActions.pop();
        cards.push(newTile);
    }
}