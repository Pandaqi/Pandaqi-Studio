import fromArray from "js/pq_games/tools/random/fromArray";
import CONFIG from "../js_shared/config";
import { CardType, ICONS, VoteDetails, VoteType } from "../js_shared/dict";
import Card from "./card";
import shuffle from "js/pq_games/tools/random/shuffle";
import BalancedFrequencyPickerWithMargin from "js/pq_games/tools/generation/balancedFrequencyPickerWithMargin";

export default class VotePicker
{
    cards: Card[]

    get() { return this.cards.slice(); }
    generate()
    {
        this.cards = [];
        this.generateVotesBase();
        this.generateVotesChange();
        console.log(this.cards);
    }

    drawBalancedCombo(iconPicker:BalancedFrequencyPickerWithMargin, subType:VoteType) : VoteDetails
    {
        let num = CONFIG.generation.comboNumBounds[subType].randomInteger();
        return { icon: iconPicker.pickNext(), num: num };
    }

    // @TODO: this is a shared function between cardPicker and votePicker => actually put it in shared.ts to prevent double code?
    getIconOptions(setTarget:string = "base")
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

    generateVotesBase()
    {
        if(!CONFIG.sets.base) { return; }

        const iconOptions = this.getIconOptions("base");

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
            const combo = this.drawBalancedCombo(comboPicker, subType);
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
            this.cards.push(card);
        }

        console.log("== (DEBUGGING) VOTE STATS ==");
        console.log(comboPicker.getStats());
    }

    generateVotesChange()
    {
        if(!CONFIG.sets.breakingChanges) { return; }
        
        // create change cards with unique, ascending numbers
        const numChange = CONFIG.generation.numChangeCards;
        for(let i = 1; i <= numChange; i++)
        {
            const card = new Card(CardType.VOTE, VoteType.CHANGE);
            card.setVoteDetails({ icon: null, num: i });
            this.cards.push(card);
        }
    }
}