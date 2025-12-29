
import { BalancedFrequencyPickerWithMargin, shuffle } from "lib/pq-games";
import { CONFIG } from "../shared/config";
import { CardType, ICONS, VoteDetails, VoteType } from "../shared/dict";
import Card from "./card";

export const votePicker = () : Card[] =>
{
    const cards = [];
    generateVotesBase(cards);
    generateVotesChange(cards);
    return cards;
}

const drawBalancedCombo = (iconPicker:BalancedFrequencyPickerWithMargin, subType:VoteType) : VoteDetails =>
{
    let num = CONFIG.generation.comboNumBounds[subType].randomInteger();
    return { icon: iconPicker.pickNext(), num: num };
}

// @IMPROV: this is a shared function between cardPicker and votePicker => actually put it in shared.ts to prevent double code?
const getIconOptions = (setTarget:string = "base") =>
{
    const allOptions = Object.keys(ICONS);
    const arr = [];
    for(const option of allOptions)
    {
        const set = ICONS[option].set;
        if(set != setTarget) { continue; }
        arr.push(option);
    }
    return arr;
}

const generateVotesBase = (cards) =>
{
    if(!CONFIG._settings.sets.base.value) { return; }

    const iconOptions = getIconOptions("base");

    const num = CONFIG.generation.numVoteCards;
    const comboPicker = new BalancedFrequencyPickerWithMargin({
        options: iconOptions,
        maxDist: 1
    })

    // first prepare a balanced set of icon + number combinations
    const combos = { [VoteType.YES]: [], [VoteType.NO]: [] };

    for(let i = 0; i < num; i++)
    {
        const subType = (i % 2 == 0) ? VoteType.YES : VoteType.NO;
        const combo = drawBalancedCombo(comboPicker, subType);
        combos[subType].push(combo);
    }

    shuffle(combos[VoteType.YES]);
    shuffle(combos[VoteType.NO]);

    // then just add those to 50% YES and 50% NO cards
    for(let i = 0; i < num; i++)
    {
        const subType = (i % 2 == 0) ? VoteType.YES : VoteType.NO;
        const card = new Card(CardType.VOTE, subType);
        const combo = combos[subType].pop();
        card.setVoteDetails(combo);
        cards.push(card);
    }

    console.log("== (DEBUGGING) VOTE STATS ==");
    console.log(comboPicker.getStats());
}

const generateVotesChange = (cards) =>
{
    if(!CONFIG._settings.sets.breakingChanges.value) { return; }
    
    // create change cards with unique, ascending numbers
    const numChange = CONFIG.generation.numChangeCards;
    for(let i = 1; i <= numChange; i++)
    {
        const card = new Card(CardType.VOTE, VoteType.CHANGE);
        card.setVoteDetails({ icon: null, num: i });
        cards.push(card);
    }
}