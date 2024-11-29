import Point from "js/pq_games/tools/geometry/point";
import Bounds from "js/pq_games/tools/numbers/bounds";
import getWeighted from "js/pq_games/tools/random/getWeighted";
import shuffle from "js/pq_games/tools/random/shuffle";
import { CardType } from "./dictShared";
import MaterialNaivigation from "./materialNaivigation";

interface GPSCardData
{
    gridDims?: Point,
    reward: string,
    rewardSquares: number[],
    penalty: string,
    penaltySquares: number[]
}

interface GPSCardParams
{
    num?: number,
    single?: number,
    rewardDict?: Record<string,any>,
    penaltyDict?: Record<string,any>,
    cardClass?: any,
    gridDims?: Point,
    numSquaresBounds?: Bounds
}

const pickNavigationCards = (params:GPSCardParams = {}) : MaterialNaivigation[] =>
{
    // prepare all reward/penalty options in the right quantities
    const numGPSCards = params.num ?? 10; 
    const percentageSingleType = params.single ?? 0.25;   
    const rewardDict = params.rewardDict ?? {};
    const penaltyDict = params.penaltyDict ?? {};  
    const cardClass = params.cardClass;

    if(!cardClass || Object.keys(rewardDict).length <= 0 || Object.keys(penaltyDict).length <= 0)
    {
        return [];
    }

    const numSingleType = Math.floor(numGPSCards * percentageSingleType);
    const numDoubleType = numGPSCards - numSingleType;
    const numNeededPerType = Math.ceil(0.5*numSingleType) + numDoubleType;

    const allRewards : string[] = [];
    const allPenalties : string[] = [];
    for(let i = 0; i < numNeededPerType; i++)
    {
        allRewards.push(getWeighted(rewardDict, "prob"));
        allPenalties.push(getWeighted(penaltyDict, "prob"));
    }

    shuffle(allRewards);
    shuffle(allPenalties);

    // prepare the grid of movement options
    const gridDims = params.gridDims ?? new Point(3,3);
    const numSquaresBounds = params.numSquaresBounds ?? new Bounds(2,4);
    const posCenter = gridDims.clone().scale(0.5).floor();
    const gridSquares : number[] = [];
    for(let x = 0; x < gridDims.x; x++)
    {
        for(let y = 0; y < gridDims.y; y++)
        {
            const id = x + y * gridDims.x;
            const isCenterPos = (x == Math.floor(0.5*gridDims.x) && y == Math.floor(0.5*gridDims.y));
            if(isCenterPos) { continue; }
            gridSquares.push(id);
        }
    }

    // randomly assign them to the customData of cards
    const cardsGPS = [];
    for(let i = 0; i < numGPSCards; i++)
    {
        const isSingleType = i < numSingleType;
        const tempGridSquares = gridSquares.slice();
        const data : GPSCardData = 
        { 
            gridDims: gridDims,
            reward: "", 
            penalty: "", 
            rewardSquares: tempGridSquares.splice(0, numSquaresBounds.randomInteger()), 
            penaltySquares: tempGridSquares.splice(0, numSquaresBounds.randomInteger())
        };

        if(isSingleType) {
            const isReward = (i < 0.5*numSingleType);
            if(isReward) { data.reward = allRewards.pop(); }
            else { data.penalty = allPenalties.pop(); }
        } else {
            data.reward = allRewards.pop();
            data.penalty = allPenalties.pop();
        }

        const c = new cardClass(CardType.GPS, "gps"); // ??
        c.customData = data;
        cardsGPS.push(c);
    }

    return cardsGPS
}

export { GPSCardData, GPSCardParams, pickNavigationCards };
export default pickNavigationCards;