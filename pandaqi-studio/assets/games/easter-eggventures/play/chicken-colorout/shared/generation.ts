import { Bounds, Vector2 } from "lib/pq-games";

// Lives outside config.ts so shared/dict.ts can read it: config imports the pickers, the pickers import
// the dict, and the dict used to import config back (a cycle in which CONFIG was still undefined).
export const GENERATION =
{
    maxNumEggs: 6,
    maxNumPlayers: 6,
    victoryEggsDistribution: { 1: 20, 5: 14, 10: 8 },
    numExtraStarterTiles: 3,
    requirementNegationProb: 0.25,
    requirementNegationFrame: 0, // simply the frame of the red X symbol
    numEggSlotDistribution:
    {
        1: { prob: 0.125 },
        2: { prob: 0.325 },
        3: { prob: 0.35 },
        4: { prob: 0.15 },
        5: { prob: 0.05 },
    },
    numDecorationBounds: new Bounds(0,2),
    numMapTiles:
    {
        base: 32,
        terrific: 18
    },
    defaultFrequencies:
    {
        eggToken: 10,
    },
    grid:
    {
        size: new Vector2(4,4),
        squaresNeededForText: new Vector2(2,2)
    }
};
