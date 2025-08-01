import fromArray from "js/pq_games/tools/random/fromArray";
import Card from "../game/card";
import { BEASTS, RecipeReward, RecipeRewardType } from "../shared/dict";
import Hand, { TokenData } from "./hand";
import InteractiveExampleSimulator from "js/pq_rulebook/examples/interactiveExampleSimulator";
import { CONFIG } from "../shared/config";
import shuffle from "js/pq_games/tools/random/shuffle";

interface GameState
{
    curPlayer: Hand,
    players: Hand[],
    beastCard: Card,
    beastHand: Hand,
    menuCards: Card[],
    foodTokens: Card[],
    tokenValues: TokenData[],
    foodTokensDiscard: Card[],
    menuCardsDiscard: Card[],
    sim: InteractiveExampleSimulator
}

export { GameState }
export default class Rewarder
{
    reward(reward:RecipeReward, gameState:GameState)
    {
        const stats = gameState.sim.stats;
        if(reward.type == RecipeRewardType.FOOD)
        {
            const option = fromArray(reward.food);
            for(const element of option)
            {
                const token = this.getWithProp(gameState.foodTokens, "key", element);
                if(!token) { continue; }
                gameState.foodTokens.splice(gameState.foodTokens.indexOf(token), 1);
                gameState.curPlayer.addToken(token);

                if(token.getTier() > 0) { stats.numTokensUpgraded++; }
            }

            stats.numFoodRewards++;
            return;
        }

        let functionName = reward.desc;
        const beastName = gameState.beastCard.key;
        const isBeastReward = (BEASTS[beastName].menu.reward.desc == reward.desc);
        if(isBeastReward) { functionName = beastName + "_menu"; }

        if(!stats.rewardDistribution[functionName]) { stats.rewardDistribution[functionName] = 0; }
        stats.rewardDistribution[functionName]++;

        if(typeof this[functionName] != "function") { return; }
        this[functionName](gameState);
    }

    getWithProp(arr:Card[], prop:string, val:any)
    {
        for(const elem of arr)
        {
            if(elem[prop] == val) { return elem; }
        }
        return null;
    }

    getWithData(arr:Card[], prop:string, val:any)
    {
        for(const elem of arr)
        {
            if(elem.getData()[prop] == val) { return elem; }
        }
        return null;
    }

    playToBeast(g:GameState, t:Card)
    {
        if(!t) { return; }
        g.beastHand.addToken(t);
        g.curPlayer.removeToken(t);
    }

    getOtherPlayer(g:GameState)
    {
        const arr : Hand[] = g.players.slice();
        arr.splice(arr.indexOf(g.curPlayer), 1);
        return fromArray(arr);
    }

    changeTokenTier(sim:InteractiveExampleSimulator, player:Hand, foodTokens:Card[], delta:number = 1)
    {
        let validToken = null;
        for(const token of player.getTokens())
        {
            const targetTier = token.getTier() + delta;
            if(targetTier < 0 || targetTier > 2) { continue; }
            validToken = token;
            break;
        }

        if(!validToken) { return false; }

        player.removeToken(validToken);
        const targetTier = validToken.getTier() + delta;
        let returnToken = this.getWithData(foodTokens, "tier", targetTier);
        player.addToken(returnToken);
        if(delta > 0) { sim.stats.numTokensUpgraded++; }
        else if(delta < 0) { sim.stats.numTokensDowngraded++; }
    }

    discardRestricted(g:GameState, shouldMatchBeast = false)
    {
        const myTokens = g.curPlayer.getTokens();
        const beastTokens = g.beastHand.getTokens();
        let tokenChosen = null;
        for(const token of myTokens)
        {
            const beastMatch = this.getWithProp(beastTokens, "key", token.key);
            const hasMatch = (beastMatch != null);
            if(hasMatch != shouldMatchBeast) { continue; }
            tokenChosen = token;
            break;
        }

        if(!tokenChosen) { return; }
        g.curPlayer.removeToken(tokenChosen);
        g.beastHand.addToken(tokenChosen);
    }

    //
    // RECIPE actions
    //
    empty_beast(g:GameState)
    {
        g.foodTokensDiscard.push(...g.beastHand.getTokens());
        g.beastHand.empty();
    }

    recipe_switch(g:GameState)
    {
        if(g.beastHand.menuLock) { return; }

        // switch menu card
        g.menuCardsDiscard.push(g.menuCards.pop());
        g.sim.stats.numMenuCardSwitches++;
    }

    recipe_switch_and_empty(g:GameState)
    {
        g.sim.stats.numBeastResets++;
        this.empty_beast(g);
        this.recipe_switch(g);
    }

    recipe_market(g:GameState)
    {
        for(let i = 0; i < CONFIG.rulebook.menuMarketSize; i++)
        {
            g.menuCardsDiscard.push(g.menuCards.pop());
        }
        this.recipe_switch(g);
    }

    recipe_study(g:GameState)
    {
        const topSix = g.menuCards.splice(g.menuCards.length-6, 6);
        shuffle(topSix);
        g.menuCards.push(...topSix);
    }

    //
    // TOKEN/FOOD actions
    //
    swap_token(g:GameState)
    {
        const myToken = g.curPlayer.getRandomTokens(1);
        if(!myToken) { return; }

        const target = fromArray(["supply", "player", "beast"]);
        let theirToken = null;
        if(target == "supply")
        {
            theirToken = [this.getWithData(g.foodTokens, "tier", myToken[0].getTier())];
            if(!theirToken) { return; }
            g.foodTokens.splice(g.foodTokens.indexOf(theirToken[0]), 1);
            g.foodTokensDiscard.push(myToken[0]);
        }

        if(target == "player")
        {
            const otherPlayer : Hand = this.getOtherPlayer(g);
            theirToken = otherPlayer.getRandomTokens(1);
            if(!theirToken) { return; }
            otherPlayer.removeTokens(theirToken);
            otherPlayer.addTokens(myToken);
        }
        
        if(target == "beast")
        {
            theirToken = g.beastHand.getRandomTokens(1);
            if(!theirToken) { return; }
            g.beastHand.removeTokens(theirToken);
            g.beastHand.addTokens(myToken)
        }

        g.curPlayer.removeTokens(myToken);
        g.curPlayer.addTokens(theirToken);
    }

    upgrade_token(g:GameState)
    {
        const myTokens = g.curPlayer.getRandomTokens(2);
        if(!myTokens) { return; }

        for(const token of myTokens)
        {
            const newToken = this.getWithData(g.foodTokens, "tier", token.getTier() + 1);
            if(!newToken) { return; }

            g.curPlayer.removeToken(token);
            g.curPlayer.addToken(newToken);

            g.foodTokens.splice(g.foodTokens.indexOf(newToken), 1);
            g.sim.stats.numTokensUpgraded++;
        }
    }

    upgrade_token_super(g:GameState)
    {
        const myTokens = g.curPlayer.getRandomTokens(3);
        if(!myTokens) { return; }

        for(const token of myTokens)
        {
            const newToken = this.getWithData(g.foodTokens, "tier", 2);
            if(!newToken) { break; }

            g.curPlayer.removeToken(token);
            g.curPlayer.addToken(newToken);
            g.foodTokens.splice(g.foodTokens.indexOf(newToken), 1);
            g.sim.stats.numTokensUpgraded++;
        }
    }

    discard_token(g:GameState)
    {
        const myTokens = g.curPlayer.getRandomTokens(3);
        if(!myTokens) { return; }
        g.curPlayer.removeTokens(myTokens);
        g.beastHand.addTokens(myTokens);
    }

    discard_token_restricted_1(g:GameState)
    {
        this.discardRestricted(g, true);
    }

    discard_token_restricted_2(g:GameState)
    {
        this.discardRestricted(g, false);
    }

    steal_token(g:GameState)
    {
        for(let i = 0; i < 2; i++)
        {
            const otherPlayer = this.getOtherPlayer(g);
            const token = otherPlayer.getRandomTokens(1);
            if(!token) { continue; }
            otherPlayer.removeTokens(token);
            g.curPlayer.addTokens(token);
        }
    }

    // @LEFT OUT: token_hide

    //
    // PLAY/TURN Actions
    //

    // @NOTE: the action related to token isn't actually taken, felt too complicated to code for a simple simulation
    play_another(g:GameState)
    {
        const myTokens = g.curPlayer.getTokens();
        if(myTokens.length <= 0) { return; }
        this.playToBeast(g, fromArray(myTokens));
    }

    play_another_restricted(g:GameState)
    {
        this.play_another(g);
    }

    play_another_majority(g:GameState)
    {
        // determine what are actually the majorities
        const allPlayerStats:Record<string, number[]> = {};
        const playerIndex = g.players.indexOf(g.curPlayer);
        for(const player of g.players)
        {
            const stats = player.getTokenStats();
            for(const [stat,freq] of Object.entries(stats))
            {
                if(!allPlayerStats[stat]) { allPlayerStats[stat] = []; }
                allPlayerStats[stat].push(freq);
            }
        }

        // sort each 
        for(const [stat,list] of Object.entries(allPlayerStats))
        {
            list.sort();
        }

        // check 
        const myStats = g.curPlayer.getTokenStats();
        let tokenToPlay = null;
        for(const token of g.curPlayer.tokens)
        {
            const freq = myStats[token.key];
            const allFreqs = allPlayerStats[token.key];
            if(freq == allFreqs[0] || freq == allFreqs[allFreqs.length-1])
            {
                tokenToPlay = token;
                break;
            }
        }

        if(!tokenToPlay) { return; }
        g.curPlayer.removeToken(tokenToPlay);
        g.beastHand.addToken(tokenToPlay);
    }

    play_another_menu(g:GameState)
    {
        let tokenChosen = null;
        for(const token of g.tokenValues)
        {
            if(!token.beastMenu) { continue; }
            tokenChosen = token.tokens[0];
            break;
        }
        this.playToBeast(g, tokenChosen);
    }

    play_wrong(g:GameState)
    {
        let tokenChosen = null;
        for(const token of g.tokenValues)
        {
            if(token.good) { continue; }
            tokenChosen = token.tokens[0];
            break;
        }
        this.playToBeast(g, tokenChosen);
    }

    play_another_beast(g:GameState)
    {
        let tokenChosen = null;
        for(const token of g.curPlayer.getTokens())
        {
            const beastMatch = this.getWithProp(g.beastHand.getTokens(), "key", token.key);
            if(!beastMatch) { continue; }
            tokenChosen = token;
            break;
        }
        this.playToBeast(g, tokenChosen);
    }

    //
    // FORCING/OTHERS actions
    // 
    force_token(g:GameState)
    {
        const p = this.getOtherPlayer(g);
        p.forceToken = p.getRandomTokens(1)[0];
    }

    forbid_token(g:GameState)
    {
        for(const player of g.players)
        {
            if(player == g.curPlayer) { continue; }
            player.forbidToken = player.getRandomTokens(1)[0];
        }
    }

    force_skip(g:GameState)
    {
        for(let i = 0; i < 2; i++)
        {
            this.getOtherPlayer(g).skipTurn = true;
        }
    }

    force_switch_recipe(g:GameState)
    {
        this.getOtherPlayer(g).switchMenu = true;
    }

    force_wrong(g:GameState)
    {
        this.getOtherPlayer(g).forceWrong = true;
    }

    force_draw(g:GameState)
    {
        for(const player of g.players)
        {
            const token = this.getWithData(g.foodTokens, "tier", 0);
            if(!token) { break; }
            player.addToken(token);
            g.foodTokens.splice(g.foodTokens.indexOf(token), 1);
        }
    }

    //
    // STATE/CORE actions
    // 
    state_change(g:GameState)
    {
        g.sim.stats.numBeastStateChanges++;
        g.beastHand.flipState();
    }

    state_lock(g:GameState)
    {
        g.beastHand.lockState(true, g.curPlayer);
    }

    recipe_lock(g:GameState)
    {
        g.beastHand.lockMenu(true, g.curPlayer);
    }

    change_direction(g:GameState)
    {
        g.beastHand.flipPlayDirection();
    }

    // @LEFT OUT: play_another_stateless (just impossible to code, maybe goes away entirely)


    //
    // BEAST-specific (MENU) actions
    //
}