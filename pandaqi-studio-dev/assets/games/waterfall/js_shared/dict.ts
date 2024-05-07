
enum MaterialType
{
    VICTIM,
    RECIPE,
    FOOD,
    BEAST
}

interface Recipe
{
    cost: string[],
    reward: string
}

interface GeneralData
{
    frame?: number,
    col?: string,
    tier?: number, // default = 0
    freq?: number,
    value?: number,
    set?: string,
    desc?: string
}

const FOOD:Record<string, GeneralData> = 
{
    bread: { frame: 0, col: "", tier: 0, value: 1 },
    fish: { frame: 1, col: "", tier: 0, value: 1 },
    mushroom: { frame: 2, col: "", tier: 0, value: 1 },
    berries: { frame: 3, col: "", tier: 0, value: 1 },
    apple: { frame: 4, col: "", tier: 0, value: 1 },

    lamb: { frame: 5, col: "", tier: 1, value: 2 },
    pie: { frame: 6, col: "", tier: 1, value: 2 },
    candy: { frame: 7, col: "", tier: 1, value: 2 },

    nectar: { frame: 8, col: "", tier: 2, value: 3 },
    human: { frame: 9, col: "", tier: 2, value: 3 },
}

// Set = baseBeasts or advancedBeasts
// Tier = a general indication of how difficult it is to understand/play
const BEASTS:Record<string, GeneralData> =
{

}

/*
Possible Victim implementations:

* Unique recipes only for you. (Which includes allowing certain combos or wildcards.)
* Turning any part of the core rules (for beast/game) on or off
* Giving a completely unique curse/ability.

*/
const VICTIMS:Record<string, GeneralData> =
{

}

const ACTIONS:Record<string, GeneralData> =
{
    // related to recipes
    empty_beast: { desc: "<b>Empty</b> the beast.", value: 1.0 },
    recipe_study: { desc: "<b>Study</b> the top 5 cards of the recipe deck; return them in any order.", value: 1.5 },
    recipe_switch: { desc: "<b>Switch</b> the Recipe.", value: 2.0 },
    recipe_switch_and_empty: { desc: "<b>Empty</b> the beast and <b>switch</b> the Recipe.", value: 2.5 },
    recipe_market: { desc: "<b>Discard</b> the entire recipe market and <b>refill</b> from deck.", value: 1.5 },
    recipe_pick: { desc: "<b>Switch</b> the Recipe to <b>any</b> card inside the deck.", value: 3.0 },

    // related to tokens
    swap_token_storage: { desc: "<b>Swap</b> 1 food token with storage.", value: 0.75 },
    swap_token_player: { desc: "<b>Swap</b> 2 food tokens with another player.", value: 2.0 },
    swap_token_beast: { desc: "<b>Swap</b> 2 food tokens with the beast.", value: 1.5 },
    upgrade_token: { desc: "<b>Upgrade</b> 1 food token to one from the next tier.", value: 1.0 },
    steal_token: { desc: "<b>Steal</b> 2 food tokens from other players.", value: 1.0 },
    discard_token_restricted: { desc: "<b>Discard</b> 1 food token that's not been played yet.", value: 2.0 },
    discard_token: { desc: "<b>Discard</b> 2 food tokens.", value: 3.0 },
    upgrade_token_super: { desc: "<b>Upgrade</b> 2 food tokens to one from the highest tier.", value: 3.0 },
    token_hide: { desc: "<b>Hide</b> your tokens (flip them facedown).", value: 2.0 },

    // @TODO: add a second type of action that gives you a SPECIFIC token in return? (It would just display that image, perhaps multiple icon images, of a different/higher-tier food.) => YES, better to do this in code, because the reward should never be _lower_ than what you put in, right?

    // related to playing / taking your turn
    play_wrong: { desc: "Play another wrong food <b>without</b> triggering FURY.", value: 1.5 },
    play_another_restricted: { desc: "Play another token, but <b>don't</b> take its action.", value: 1.5 },
    play_another_menu: { desc: "Play another token which <b>matches the beast's MENU</b>.", value: 2.0 },
    play_another: { desc: "Play another token.", value: 2.5 },
    change_direction: { desc: "Flip the direction of play (clockwise or not).", value: 1.75 },

    // related to influencing / forcing other players
    force_token: { desc: "<b>Force</b> a player to <b>play a specific food</b> next turn.", value: 1.25 },
    forbid_token: { desc: "<b>Forbid</b> a player from <b>playing a specific food</b> next turn.", value: 0.75 },
    force_skip: { desc: "<b>Force</b> a player to <b>skip</b> their next turn.", value: 2.0 },
    force_switch_recipe: { desc: "<b>Pick another player</b>. They must <b>switch</b> the Recipe on their next turn.", value: 1.25 },
    force_wrong: { desc: "<b>Force</b> a player to play a <b>wrong food</b> next turn.", value: 1.5 },
    force_draw: { desc: "All other players must <b>draw 1 extra token</b>.", value: 3.0 },

    // related to beast state or core rules
    state_change: { desc: "<b>Flip</b> the beast's <b>state</b>.", value: 1.5 },
    state_change_any: { desc: "<b>Change</b> the beast's <b>state</b> to whatever you want.", value: 2.0 },
    play_another_stateless: { desc: "Play another token <b>ignoring</b> the beast's state or rule.", value: 2.5 },
    state_lock: { desc: "Until your next turn, the beast's state <b>can't be changed.</b>", value: 1.0 },
    recipe_lock: { desc: "Until your next turn, the beast's recipe <b>can't be switched.</b>", value: 1.75 },

}

const CARD_TEMPLATES = 
{
    [MaterialType.RECIPE]: { frame: 0 },
    [MaterialType.VICTIM]: { frame: 1 }
}

export {
    MaterialType,
    FOOD,
    BEASTS,
    VICTIMS,
    ACTIONS,
    CARD_TEMPLATES,
    Recipe
};

