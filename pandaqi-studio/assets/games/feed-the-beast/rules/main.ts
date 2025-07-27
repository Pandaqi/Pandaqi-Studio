import InteractiveExampleGenerator from "js/pq_rulebook/examples/interactiveExampleGenerator";
import InteractiveExampleSimulator from "js/pq_rulebook/examples/interactiveExampleSimulator";
import CardPicker from "../game/cardPicker";
import CONFIG from "../shared/config";
import TilePicker from "../game/tilePicker";
import TokenPicker from "../game/tokenPicker";
import shuffle from "js/pq_games/tools/random/shuffle";
import { FOOD } from "../shared/dict";
import Card from "../game/card";
import fromArray from "js/pq_games/tools/random/fromArray";
import Hand from "./hand";
import Rewarder, { GameState } from "./rewarder";
import Bounds from "js/pq_games/tools/numbers/bounds";

const callbackInitStats = () =>
{
    return {
        numRounds: 0,
        numGoodFoodPaid: 0,
        numWrongFoodPaid: 0,
        numTurnsSkipped: 0,
        numFoodSupplyResets: 0,
        numMenuDeckResets: 0,
        numBeastMenuPaid: 0,
        numBeastResets: 0,
        numBeastStateChanges: 0,

        numTokensUpgraded: 0,
        numTokensDowngraded: 0,

        numMenuCardSwitches: 0,
        numTimesFoodSupplyRanOut: 0,
        numEndlessGames: 0,

        numFoodRewards: 0,
        rewardDistribution: {},
        numRoundsDist: {},
    }
}

const callbackFinishStats = (sim:InteractiveExampleSimulator) =>
{
    const iters = sim.getIterations();
    const rounds = sim.stats.numRounds;
    const turns = rounds;

    sim.stats.numRoundsPerGame  = rounds / iters;
    sim.stats.numBeastResetsPerGame = sim.stats.numBeastResets / iters;
    sim.stats.numFoodSupplyResetsPerGame = sim.stats.numFoodSupplyResets / iters;
    sim.stats.numMenuDeckResetsPerGame = sim.stats.numMenuDeckResets / iters;
    sim.stats.numMenuCardSwitchesPerGame = sim.stats.numMenuCardSwitches / iters;
    sim.stats.numTokensUpgradedPerGame = sim.stats.numTokensUpgraded / iters;
    sim.stats.numBeastStateChangesPerGame = sim.stats.numBeastStateChanges / iters;

    sim.stats.goodFoodProbPerTurn = sim.stats.numGoodFoodPaid / turns;
    sim.stats.wrongFoodProbPerTurn = sim.stats.numWrongFoodPaid / turns;
    sim.stats.beastMenuProbPerTurn = sim.stats.numBeastMenuPaid / turns;
    sim.stats.turnSkipProbPerTurn = sim.stats.numTurnsSkipped / turns;
}

const generate = async (sim:InteractiveExampleSimulator) =>
{
    const numPlayers = CONFIG.rulebook.numPlayers.randomInteger();
    const numStartTokens = CONFIG.rulebook.numStartingTokens;

    // prepare food tokens
    const foodTokens : Card[] = sim.getPicker("token").get().slice();
    for(let i = foodTokens.length - 1; i >= 0; i--)
    {
        if(foodTokens[i].key != "beastState") { continue; }
        foodTokens.splice(i, 1);
    }

    const foodTokensDiscard = [];

    const validStartingTokens = [];
    for(const token of foodTokens)
    {
        if(token.getTier() > CONFIG.rulebook.maxStartingTokenTier) { continue; }
        validStartingTokens.push(token);
    }
    shuffle(validStartingTokens);

    // prepare beast + menu cards
    const beastCard = fromArray(sim.getPicker("tile").get());
    const beastHand = new Hand();

    const menuCards = shuffle(sim.getPicker("card").get());
    const menuCardsDiscard = [];

    const rewarder = new Rewarder();

    // create starting hands
    const players : Hand[] = [];
    for(let i = 0; i < numPlayers; i++)
    {
        const p = new Hand();
        const startTokens = validStartingTokens.slice(0, numStartTokens);
        p.addTokens(startTokens);
        players.push(p);

        for(const token of startTokens)
        {
            foodTokens.splice(foodTokens.indexOf(token), 1);
        }
    }
    shuffle(foodTokens);

    let continueGame = true;
    let counter = 0;
    let numRounds = 0;
    let gameState:GameState = {
        curPlayer: null, players, tokenValues: null,
        beastCard, beastHand, 
        menuCards, foodTokens,
        foodTokensDiscard, menuCardsDiscard,
        sim
    }

    const MAX_ROUNDS = 60; // no reasonable game goes beyond this

    // for the interactive example, we just transfer a random number of our tokens to the beast
    // otherwise the example is always in the "clean/start/zero" state and that's not useful
    if(!sim.isHeadless())
    {
        const player0Tokens = players[0].getTokens();
        const numTransfer = new Bounds(1, player0Tokens.length-2).randomInteger();
        const tokensToTransfer = player0Tokens.splice(0, numTransfer);
        players[0].removeTokens(tokensToTransfer);
        beastHand.addTokens(tokensToTransfer);
    }

    // @TODO: Actually use the beast's special rule + state during all this

    while(continueGame)
    {
        const curPlayer = players[counter];
        gameState.curPlayer = curPlayer;
        counter = (counter + beastHand.playDirection + numPlayers) % numPlayers;

        const tempBeastCardHand : Hand = new Hand().addToken(beastCard);
        sim.print("This is the current Beast card, and the tokens currently played onto it.");
        await sim.listImages(tempBeastCardHand, "draw");
        await sim.listImages(beastHand, "draw");

        sim.print("These are your current food tokens.");
        await sim.listImages(curPlayer, "draw");
    
        const curMenuCard = menuCards[menuCards.length - 1];
        const menuHand : Hand = new Hand().addToken(curMenuCard);
        sim.print("And finally, this is the current menu card.");
        await sim.listImages(menuHand, "draw");

        // check special flow/turn properties on players
        if(curPlayer.skipTurn)
        {
            curPlayer.resetTurnProperties();
            sim.stats.numTurnsSkipped++;
            continue;
        }

        if(curPlayer.switchMenu)
        {
            rewarder.recipe_switch(gameState);
        }

        if(beastHand.menuLock && beastHand.menuLockInstigator == curPlayer)
        {
            beastHand.menuLock = false;
        }

        if(beastHand.stateLock && beastHand.stateLockInstigator == curPlayer)
        {
            beastHand.lockState(false);
        }

        curPlayer.resetTurnProperties();
        numRounds++;

        // make sure our supplies are fine
        foodTokens.push(...foodTokensDiscard);
        foodTokensDiscard.length = 0;
        shuffle(foodTokens);

        if(foodTokens.length <= 0)
        {
            sim.stats.numTimesFoodSupplyRanOut++;
        }

        if(menuCards.length <= 3)
        {
            menuCards.push(...menuCardsDiscard);
            menuCardsDiscard.length = 0;
            shuffle(menuCards);
            sim.stats.numMenuDeckResets++;
        }

        // pick which token we want to play
        const tokenValues = curPlayer.decideValueOfTokens(curMenuCard, beastCard, beastHand);
        let tokenPicked = tokenValues[0]; // in case loop below fails, have a random default value
        gameState.tokenValues = tokenValues;
        const pickGood = Math.random() <= CONFIG.rulebook.pickGoodFoodProb;
        for(const tokenData of tokenValues)
        {
            if(pickGood == tokenData.good)
            {
                tokenPicked = tokenData;
                break;
            }
        }

        // this is just a temporary hand to easily draw your choice
        const playedTokens = new Hand();
        playedTokens.addTokens(tokenPicked.tokens);
        sim.print("You decide to pay the beast the following token(s).");
        await sim.listImages(playedTokens, "draw");

        // actually play it
        tokenValues.splice(tokenValues.indexOf(tokenPicked), 1);
        curPlayer.removeTokens(tokenPicked.tokens);
        beastHand.addTokens(tokenPicked.tokens);
        if(tokenPicked.good) {
            sim.stats.numGoodFoodPaid++;
            if(tokenPicked.beastMenu) { sim.stats.numBeastMenuPaid++; }

            const pickReward = Math.random() <= CONFIG.rulebook.pickRewardOverUpgradeProb;
            let str = "";
            if(pickReward) {
                rewarder.reward(tokenPicked.reward, gameState);
                str = "You choose to receive the reward attached to it.";
            } else {
                rewarder.changeTokenTier(sim, curPlayer, foodTokens, +1);
                str = "You choose to forego its reward and instead <b>upgrade</b> one of your food to a higher Tier.";
            }

            sim.print("This food is <strong>correct</strong> (it matches one of the recipes). " + str);
            
        } else {
            sim.stats.numWrongFoodPaid++;

            sim.print("This food is <strong>wrong</strong> (it does not match any recipe). You must downgrade a food and draw an extra Tier 1 food.");

            const success = rewarder.changeTokenTier(sim, curPlayer, foodTokens, -1);
            curPlayer.addToken(rewarder.getWithData(foodTokens, "tier", 0));
        }

        // check if monster resets
        const beastMax = CONFIG.rulebook.defaultBeastMaxStorage;
        const beastReset = beastHand.count() >= beastMax;
        if(beastReset) {
            sim.print("The beast now has <b>" + beastMax + " tokens (or more)</b>, so it <b>resets</b>. Move all its food back to the supply and switch the menu card (for another one from the market).");
            rewarder.recipe_switch_and_empty(gameState);
        } else {
            sim.print("The beast now has <b>" + beastHand.count() + " tokens</b>, which is fewer than the maximum, so it doesn't reset.");
        }

        // check if game should end (and who'd win then)
        let winningPlayer = null;
        for(const player of players)
        {
            if(player.count() > 0) { continue; }
            winningPlayer = player;
            break;
        }

        if(winningPlayer == curPlayer) {
            sim.print("You are now out of tokens! Congratulations, you win the game!");
        } else {
            sim.print("Next turn!");
        }

        continueGame = true;
        if(winningPlayer) { continueGame = false; }
        if(sim.displaySingleTurn()) { continueGame = false; }
        if(numRounds >= MAX_ROUNDS)
        {
            continueGame = false;
            sim.stats.numEndlessGames++;
        }
    }

    sim.stats.numRounds += numRounds;
    if(!sim.stats.numRoundsDist[numRounds]) { sim.stats.numRoundsDist[numRounds] = 0; }
    sim.stats.numRoundsDist[numRounds]++;
    
}

const SIMULATION_ENABLED = false;
const SIMULATION_ITERATIONS = 500;
const SHOW_FULL_GAME = false;

const gen = new InteractiveExampleGenerator({
    id: "turn",
    buttonText: "Give me an example turn!",
    callback: generate,
    config: CONFIG,
    itemSize: CONFIG.rulebook.itemSize,
    pickers: { card: CardPicker, tile: TilePicker, token: TokenPicker },
    simulateConfig: {
        enabled: SIMULATION_ENABLED,
        iterations: SIMULATION_ITERATIONS,
        showFullGame: SHOW_FULL_GAME,
        runParallel: false,
        callbackInitStats,
        callbackFinishStats,
    }
})