import getWeighted from "js/pq_games/tools/random/getWeighted";
import CONFIG from "../js_shared/config";
import Tile from "./tile";
import { ACTIONS, ActionType, COLORS, TYPES } from "../js_shared/dict";
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
        const dicts = {
            [ActionType.HEART]: [],
            [ActionType.SKULL]: [],
            [ActionType.STAR]: []
        }

        for(const [key,data] of Object.entries(ACTIONS))
        {
            for(const type of data.types)
            {
                dicts[type].push(key);
            }
        }

        // draw as many actions as we need per type
        const numTiles = CONFIG.tiles.generation.numDeckTotal;
        const numDouble = CONFIG.tiles.generation.percentageDoubleTiles * numTiles;
        const numSingle = CONFIG.tiles.generation.percentageSingleTiles * numTiles;
        const actions : TileActionData[] = [];

        const numActionsPerType = Math.ceil(numDouble * (2/3) + numSingle * (1/3));
        for(let i = 0; i < numActionsPerType; i++)
        {
            actions.push({ type: ActionType.HEART, key: getWeighted(dicts[ActionType.HEART], "prob") });
            actions.push({ type: ActionType.SKULL, key: getWeighted(dicts[ActionType.SKULL], "prob") });
            actions.push({ type: ActionType.STAR, key: getWeighted(dicts[ActionType.STAR], "prob") });
        }
        shuffle(actions);

        // randomly determine the types (in controlled distributions)
        for(const [key,data] of Object.entries(TYPES))
        {
            data.prob = 1.0 / Math.max(Math.abs(data.points), 1.0);
        }

        const types = [];
        for(let i = 0; i < numTiles; i++)
        {
            types.push(getWeighted(TYPES));
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
            } else if(i < numSingle) {
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