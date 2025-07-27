import getWeighted from "js/pq_games/tools/random/getWeighted";
import CONFIG from "../shared/config";
import Tile from "./tile";
import { ACTIONS, ActionType, ActionTypeData, COLORS, TYPES } from "../shared/dict";
import shuffle from "js/pq_games/tools/random/shuffle";

interface TileActionData
{
    type: ActionType,
    key: string
}

export default class TilePicker
{
    tiles: Tile[]

    constructor() {}
    get() { return this.tiles.slice(); }
    async generate()
    {
        this.tiles = [];

        // sort the list of actions into their types
        const dicts:Record<ActionType, Record<string, ActionTypeData>> = {
            [ActionType.HEART]: {},
            [ActionType.SKULL]: {},
            [ActionType.STAR]: {}
        }

        for(const [key,data] of Object.entries(ACTIONS))
        {
            for(const type of data.types)
            {
                dicts[type][key] = data;
            }
        }

        // draw as many actions as we need per type
        const numTiles = CONFIG.tiles.generation.numDeckTotal;
        const numDouble = CONFIG.tiles.generation.percentageDoubleTiles * numTiles;
        const numSingle = CONFIG.tiles.generation.percentageSingleTiles * numTiles;
        const numActionsPerType = Math.ceil(numDouble * (2/3) + numSingle * (1/3));
        const actionsPerType:Record<ActionType, string[]> = {
            [ActionType.HEART]: [],
            [ActionType.SKULL]: [],
            [ActionType.STAR]: []
        };

        for(const keyType of Object.keys(actionsPerType))
        {
            const actionFreqs = {};

            // first add each action its minimum number of times
            const dict = dicts[keyType] as Record<string, ActionTypeData>;
            const typesToDelete = [];
            for(const [key,data] of Object.entries(dict))
            {
                const min = data.min ?? 1;
                actionFreqs[key] = min;
                for(let i = 0; i < min; i++)
                {
                    actionsPerType[keyType].push(key);
                }

                // some types' max and min are the same; but I'm hesitant to delete while looping through same list, hence the two-step process of deletion
                const max = dict[key].max ?? Infinity;
                if(actionFreqs[key] >= max) { typesToDelete.push(key); }
            }

            for(const type of typesToDelete)
            {
                delete dict[type];
            }

            // then just fill up randomly
            while(actionsPerType[keyType].length < numActionsPerType)
            {
                const newAction = getWeighted(dict, "prob");
                actionsPerType[keyType].push(newAction);

                // but maintain a maximum where needed
                actionFreqs[newAction]++;
                const max = dict[newAction].max ?? Infinity;
                if(actionFreqs[newAction] >= max) { delete dict[newAction]; }
            }
        }

        // now collect all those actions into one shuffled list
        const actions : TileActionData[] = [];
        for(const [key,data] of Object.entries(actionsPerType))
        {
            for(const action of data)
            {
                actions.push({ type: key as ActionType, key: action });
            }
        }
        shuffle(actions);

        // randomly determine the types (fixed number based on points; lower points means appears more often)
        // the +1 is to make the points value of 0 possible (not sure if that will be in the game, though)
        let totalTypesProb = 0.0;
        for(const [key,data] of Object.entries(TYPES))
        {
            totalTypesProb += Math.abs(data.points) + 1;
        }

        const types = [];
        for(const [key,data] of Object.entries(TYPES))
        {
            const fraction = (Math.abs(data.points) + 1) / totalTypesProb;
            const numForThisType = Math.ceil(fraction * numTiles);
            for(let i = 0; i < numForThisType; i++)
            {
                types.push(key);
            }
        }
        shuffle(types);

        // randomly determine the colors (all equally possible)
        const numPerColor = numTiles / Object.keys(COLORS).length;
        const colors = [];
        for(let i = 0; i < numPerColor; i++)
        {
            for(const color of Object.keys(COLORS))
            {
                colors.push(color);
            }
        }
        shuffle(colors);

        // randomly draw as many as needed, forcing the two action types to be different
        for(let i = 0; i < numTiles; i++)
        {
            const tileActions = [];
            const type = types.pop();
            const color = colors.pop();
            if(i < numDouble) {
                const firstAction = actions.pop();
                tileActions.push(firstAction);
                const secondAction = this.findUniqueAction(firstAction, actions);
                if(secondAction) { tileActions.push(secondAction); }
            } else if(i < numDouble + numSingle) {
                tileActions.push(actions.pop());
            }

            const t = new Tile(type, color, tileActions);
            this.tiles.push(t);
        }

        console.log(this.tiles);
    }

    findUniqueAction(givenAction:TileActionData, actions:TileActionData[])
    {
        const forbiddenType = givenAction.type;
        for(let i = 0; i < actions.length; i++)
        {
            if(actions[i].type == forbiddenType) { continue; }
            const action = actions.splice(i, 1);
            return action[0];
        }
        return null;
    }
}